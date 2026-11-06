import { WebSocketClient } from "./websocket.js";
import { backendFetch } from "./net.js";
import { MediasoupTransport } from "./mediasoup-transport.js";
import { WebRTCClient } from "./webrtc.js";
import { H264Decoder } from "./decoder.js";
import { InputCapture } from "./input.js";
import { StreamFooter } from "./footer.js";

export class App {
  constructor(opts = {}) {
    this.ensureSession = opts.ensureSession || (async () => {});
    this.loader = opts.loader || null;
    this.stepTotal = opts.stepTotal || 7;
    this.ws = null;
    this.transport = null;
    this.webrtc = null;
    this.decoder = null;
    this.input = null;
    this.videoEl = null;
    this._deviceType = null;
    this._transportMode = null;
    this._statusTimer = null;
    this._loadingGame = false;
    this.onClosed = null;   // (reason) => void, set by the host bridge
    this.deeplink = false;  // launched from a host page: no Cancel button

    this.init();
  }

  init() {
    this.showScreen("screen-select");
    this.refreshStatus();

    this._statusTimer = setInterval(() => {
      if (this.currentScreen() === "screen-select") this.refreshStatus();
    }, 8000);

    document.getElementById("play-roblox").addEventListener("click", () => {
      this.selectGame("roblox");
    });

    window.addEventListener("beforeunload", () => {
      this.ws?.close();
    });

    // FreezeNova has no session limit, stats or audio controls, so those items are greyed out.
    this.footer = new StreamFooter(document.getElementById("screen-game"), {
      title: "Roblox · FreezeNova",
      off: ["timer", "stats", "mute"],
      onExit: () => this.resetToSelect(),
    });
  }

  _unblockBtn() {
    if (!this._fakeUnblock) {
      this._fakeUnblock = document.createElement("button");
      const t = document.createElement("span");
      t.className = "btn-unblock-text";
      this._fakeUnblock.append(t);
    }
    return this._fakeUnblock;
  }

  notify(text) {
    const el = document.getElementById("toast");
    if (!el) return console.warn(text);
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove("show"), 6000);
  }

  async refreshStatus() {
    try {
      const res = await backendFetch("/status");
      const s = await res.json();

      document.getElementById("phones-free").textContent = s.available;
      document.getElementById("phones-total").textContent = s.total;
    } catch {
      // status is only informational
    }
  }

  overlayText(text) {
    if (this._loadingGame) this.loader?.text(text);
  }

  overlayHide() {
    if (!this._loadingGame) return;
    this._loadingGame = false;
    this.loader?.step(this.stepTotal, this.stepTotal, "Ready");
    this.loader?.hide();
  }

  async selectGame(gameId, { deeplink = false } = {}) {
    if (this._starting) return;
    this._starting = true;
    this.deeplink = deeplink;
    const startToken = (this._startToken = (this._startToken || 0) + 1);
    const cancelled = () => this._startToken !== startToken;
    this.loader?.show("Starting a session", {
      cancel: deeplink ? null : () => { this._startToken++; this._starting = false; this.loader?.hide(); this.showScreen("screen-select"); },
    });
    try {
      await this.ensureSession((i, total, text) => { if (!cancelled()) this.loader?.step(i, total, text); });
      if (cancelled()) return;
    } catch (e) {
      if (cancelled()) return;
      console.error("Session failed:", e);
      this.loader?.hide();
      this.notify("Couldn't start a session. Check your connection and try again.");
      this.showScreen("screen-select");
      return;
    } finally {
      if (!cancelled()) this._starting = false;
    }
    this._loadingGame = true;
    this._selectGame(gameId);
  }

  _selectGame(gameId) {
    this._t0 = performance.now();
    this._tlog = (msg) => console.log(`[App][${Math.round(performance.now() - this._t0)}ms] ${msg}`);

    if (!this._origConsoleLog) {
      this._origConsoleLog = console.log.bind(console);
      console.log = (...args) => {
        const ms = Math.round(performance.now() - this._t0);
        this._origConsoleLog(`[+${ms}ms]`, ...args);
      };
    }

    this._tlog("Play clicked");

    this.showScreen(null);
    this.loader?.setCancel(this.deeplink ? null : () => this.resetToSelect());
    this.loader?.step(this.stepTotal - 2, this.stepTotal, "Waiting in queue");

    this._startVideoWatchdog();

    this.ws = new WebSocketClient();

    this.ws.onQueueStatus = (position, total) => {
      if (!this._loadingGame) return;
      this.loader?.step(this.stepTotal - 2, this.stepTotal, total > 1 ? `Place in line: ${position} of ${total}` : "You're next!");
    };

    this.ws.onQueueReady = () => {
      this._tlog("Queue ready — starting game");
      this.startGame();
    };

    this.ws.onRouterRtpCapabilities = async (caps) => {
      this._tlog("Router RTP capabilities received — using mediasoup transport");
      this._transportMode = "mediasoup";
      await this.transport?.loadDevice(caps);
    };

    this.ws.onRecvTransportCreated = async (options) => {
      this._tlog("Recv transport created");
      await this.transport?.createRecvTransport(options);
    };

    this.ws.onConsumeResponse = async (params) => {
      this._tlog("Consume response received");
      await this.transport?.consume(params);
    };

    this.ws.onOffer = async (sdp) => {
      this._tlog("WebRTC offer received — using WebRTC transport");
      this._transportMode = "webrtc";
      if (!this.webrtc) return;
      const answerSdp = await this.webrtc.handleOffer(sdp);
      this.ws.sendAnswer(answerSdp);
    };

    this.ws.onIceCandidate = async (candidate) => {
      await this.webrtc?.addIceCandidate(candidate);
    };

    this.ws.onError = (message) => {
      this.notify(`Error: ${message}`);
      this.resetToSelect("error");
    };

    this.ws.onSessionEnd = (reason) => {
      this.notify(`Session ended: ${reason}`);
      this.resetToSelect("ended");
    };

    this.ws.onKeyboardState = (visible) => {
      this.input?.setTypeMode(visible);
    };

    this.ws.onSessionProgress = (message) => {
      this._tlog(`[Server] ${message}`);
      this.overlayText(message.replace(/^(\[[\w]*\])*\s*(\[\d+ms\]\s*)?/, ""));
    };

    this.ws.onGameReady = (deviceType) => {
      this._deviceType = deviceType;
      this._tlog(`Game ready (device=${deviceType}, transport=${this._transportMode}) — waiting for video`);

      if (this._lastFrameTime > 0) {
        this._tlog("Video already playing — hiding loading screen immediately");
        this.overlayHide();
      } else {
        this._hideOverlayOnFirstFrame = true;
      }

      if (this._transportMode === "mediasoup") {
        const overlayCheck = setInterval(() => {
          if (!this._hideOverlayOnFirstFrame) { clearInterval(overlayCheck); return; }
          if (this.videoEl && !this.videoEl.paused && this.videoEl.currentTime > 0) {
            this._hideOverlayOnFirstFrame = false;
            clearInterval(overlayCheck);
            this._tlog("Video playing — hiding loading screen");
            this.overlayHide();
          }
        }, 500);

        setTimeout(() => {
          clearInterval(overlayCheck);
          if (this._hideOverlayOnFirstFrame) {
            this._hideOverlayOnFirstFrame = false;
            this._tlog("No video after 30s — hiding loading screen anyway");
            this.overlayHide();
          }
        }, 30000);
      } else {
        setTimeout(() => {
          if (this._hideOverlayOnFirstFrame) {
            this._hideOverlayOnFirstFrame = false;
            this._tlog("No video after 30s — hiding loading screen anyway");
            this.overlayHide();
          }
        }, 30000);
      }

      const inputTarget = this._transportMode === "mediasoup" ? this.videoEl : this.canvas;
      if (inputTarget && !this.input) {
        if (deviceType === "pc") {
          this.input = new InputCapture(inputTarget, null, { pcMode: true });
          this._tlog("Input: PC mode (direct mouse + keyboard)");
        } else {
          const keymap = {
            joystick: { x: 0.13, y: 0.75, radius: 0.07 },
            buttons: { Space: { x: 0.898, y: 0.866, label: "Jump" } },
          };
          this.input = new InputCapture(inputTarget, keymap);
          this._tlog("Input: Phone mode (joystick + touch)");
        }

        if (this._transportMode === "webrtc") {
          this.input.onInput = (msg) => this.webrtc?.sendInput(msg);
        } else {
          this.input.onInput = (msg) => this.ws?.sendInput(msg);
        }
      }

      (inputTarget || this.videoEl)?.focus();
      this._showUnblockButton();
      this._isUnblocking = false;

      if (this._transportMode === "webrtc") {
        this.webrtc?.sendInput({ type: "reset-video" });
      } else {
        this.ws?.sendInput({ type: "reset-video" });
      }
      this._tlog("Keyframe requested on game-ready");
      this._gameReadyAt = Date.now();
    };

    this.ws.onClose = () => {
      if (this.currentScreen() === "screen-game") this.resetToSelect("ended");
    };

    this.ws.connect();

    const wait = setInterval(() => {
      if (!this.ws) { clearInterval(wait); return; }
      if (this.ws.connected) {
        clearInterval(wait);
        this._tlog("WebSocket connected — joining queue");
        this.ws.joinQueue(gameId);
      }
    }, 100);
  }

  startGame() {
    this.showScreen("screen-game");
    this.loader?.step(this.stepTotal - 1, this.stepTotal, "Connecting");
    this._gameReadyAt = Date.now();

    this._overlayFailsafe = setTimeout(() => {
      if (this._loadingGame) {
        this._tlog("Loading failsafe — hiding after 60s");
        this.overlayHide();
      }
    }, 60000);

    const viewport = document.querySelector("#screen-game .game-viewport");

    this.videoEl = document.createElement("video");
    this.videoEl.id = "game-video";
    this.videoEl.autoplay = true;
    this.videoEl.playsInline = true;
    this.videoEl.muted = true;
    this.videoEl.disableRemotePlayback = true;
    this.videoEl.style.width = "100%";
    this.videoEl.style.height = "100%";
    this.videoEl.style.objectFit = "contain";
    this.videoEl.style.background = "#000";
    this.videoEl.style.display = "none";

    const oldVideo = document.getElementById("game-video");
    if (oldVideo) oldVideo.remove();
    viewport.appendChild(this.videoEl);

    this.transport = new MediasoupTransport();
    this.transport.sendWs = (msg) => this.ws?.send(msg);

    this.transport.onConnected = () => {
      this._tlog("mediasoup transport connected — waiting for game-ready");
    };

    this.transport.onDisconnected = () => this.resetToSelect("ended");

    this.transport.onVideoTrack = (track) => {
      this._tlog("mediasoup video track received");
      this.videoEl.style.display = "";
      this.canvas = document.getElementById("game-canvas");
      if (this.canvas) this.canvas.style.display = "none";

      const stream = new MediaStream([track]);
      this.videoEl.srcObject = stream;

      this.videoEl.onloadeddata = () => {
        this._tlog("First video frame rendered (mediasoup)");
        this._lastFrameTime = Date.now();
        if (this._hideOverlayOnFirstFrame) {
          this._hideOverlayOnFirstFrame = false;
          this.overlayHide();
        }
      };

      this.videoEl.ontimeupdate = () => {
        this._lastFrameTime = Date.now();
      };

      const rx = this.transport?.consumer?.rtpReceiver;
      try {
        if (rx && "jitterBufferTarget" in rx) rx.jitterBufferTarget = 40;
        if (rx && "playoutDelayHint" in rx) rx.playoutDelayHint = 0.04;
      } catch {}
    };

    this.canvas = document.getElementById("game-canvas");
    if (this.canvas) this.canvas.style.display = "";

    this.webrtc = new WebRTCClient();
    this.webrtc.init();

    this.webrtc.onIceCandidate = (candidate) => {
      this.ws?.sendIceCandidate(candidate);
    };

    this.webrtc.onConnected = () => {
      this._tlog("WebRTC data channels connected");
    };

    this.webrtc.onDisconnected = () => {
      this._tlog("WebRTC disconnected");
      this.resetToSelect("ended");
    };

    const resetVideoFn = () => {
      if (this._transportMode === "webrtc") {
        this.webrtc?.sendInput({ type: "reset-video" });
      } else {
        this.ws?.sendInput({ type: "reset-video" });
      }
    };

    this.decoder = new H264Decoder(this.canvas, resetVideoFn);

    this.decoder.onFirstFrame = () => {
      this._tlog("First video frame rendered (WebRTC/decoder)");
      this._lastFrameTime = Date.now();
      if (this._hideOverlayOnFirstFrame) {
        this._hideOverlayOnFirstFrame = false;
        this.overlayHide();
      }
    };

    this.decoder.onVideoSizeChange = (width, height) => {
      this._tlog(`Video size: ${width}x${height}`);
      if (this._transportMode === "webrtc") {
        this.webrtc?.sendInput({ type: "video-size", width, height });
      } else {
        this.ws?.sendInput({ type: "video-size", width, height });
      }
    };

    this.webrtc.onVideoData = (data) => {
      this.decoder?.appendData(data);
      this._lastFrameTime = Date.now();
    };

    this.input = null;

    this.ws.sendClientReady();
  }

  leaveQueue() {
    this._loadingGame = false;
    this.loader?.hide();
    this.ws?.close();
    this.ws = null;
    this.showScreen("screen-select");
    this.refreshStatus();
  }

  unblock() {
    if (!this.ws || this._unblockCooldown) {
      console.log("[App] Unblock: ignored (no ws or cooldown active)");
      return;
    }
    this._tlog("Unblock clicked — requesting game restart");
    this._isUnblocking = true;

    this._loadingGame = true;
    this.loader?.show("Restarting game...");

    const btn = this._unblockBtn();
    if (btn) btn.classList.remove("visible");

    if (this._transportMode === "webrtc" && this.decoder) {
      this.decoder.softReset();
    }

    if (this._transportMode === "webrtc") {
      this.webrtc?.sendInput({ type: "reset-video" });
    } else {
      this.ws?.sendInput({ type: "reset-video" });
    }

    this.ws.sendUnblock();

    setTimeout(() => {
      if (this._isUnblocking) {
        this._isUnblocking = false;
        this._tlog("Unblock timeout — hiding loading screen after 60s");
        this.overlayHide();
        this._showUnblockButton();
      }
    }, 60000);

    this._unblockCooldown = true;
    this._unblockCooldownEnd = Date.now() + 150000;
    this._unblockCooldownTimer = setTimeout(() => {
      this._unblockCooldown = false;
      console.log("[App] Unblock cooldown expired");
      this._showUnblockButton();
    }, 150000);
  }

  _showUnblockButton() {
    const btn = this._unblockBtn();
    if (!btn) return;

    if (this._unblockCountdownInterval) {
      clearInterval(this._unblockCountdownInterval);
      this._unblockCountdownInterval = null;
    }

    const textEl = btn.querySelector(".btn-unblock-text");

    if (this._unblockCooldown && this._unblockCooldownEnd) {
      btn.classList.add("visible");
      btn.disabled = true;

      const updateCountdown = () => {
        const remaining = Math.max(0, Math.ceil((this._unblockCooldownEnd - Date.now()) / 1000));
        if (textEl) textEl.textContent = `Unblock (${remaining}s)`;
        if (remaining <= 0) {
          clearInterval(this._unblockCountdownInterval);
          this._unblockCountdownInterval = null;
          if (textEl) textEl.textContent = "Unblock";
          btn.disabled = false;
        }
      };
      updateCountdown();
      this._unblockCountdownInterval = setInterval(updateCountdown, 1000);
    } else {
      btn.classList.add("visible");
      btn.disabled = false;
      if (textEl) textEl.textContent = "Unblock";
    }
  }

  _hideUnblockButton() {
    const btn = this._unblockBtn();
    if (btn) {
      btn.classList.remove("visible");
      btn.disabled = false;
    }
    if (this._unblockCountdownInterval) {
      clearInterval(this._unblockCountdownInterval);
      this._unblockCountdownInterval = null;
    }
  }

  resetToSelect(reason = "exit") {
    this._stopVideoWatchdog();
    this._gameReadyAt = null;
    this._isUnblocking = false;
    this._hideOverlayOnFirstFrame = false;
    this._transportMode = null;
    this._deviceType = null;

    this.transport?.close();
    this.transport = null;
    if (this._liveEdgeInterval) {
      clearInterval(this._liveEdgeInterval);
      this._liveEdgeInterval = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
      this.videoEl.remove();
      this.videoEl = null;
    }

    this.webrtc?.close();
    this.webrtc = null;
    if (this.decoder) {
      this.decoder.reset();
      this.decoder = null;
    }

    const canvas = document.getElementById("game-canvas");
    if (canvas) canvas.style.display = "";

    this.ws?.close();
    this.ws = null;
    this.input?.destroy();
    this.input = null;

    if (this._overlayFailsafe) {
      clearTimeout(this._overlayFailsafe);
      this._overlayFailsafe = null;
    }

    this._loadingGame = false;
    this.loader?.hide();

    this._hideUnblockButton();
    if (this._unblockCooldownTimer) {
      clearTimeout(this._unblockCooldownTimer);
      this._unblockCooldownTimer = null;
    }
    this._unblockCooldown = false;

    this.showScreen("screen-select");
    this.refreshStatus();
    this.deeplink = false;
    this.onClosed?.(reason);
  }

  _startVideoWatchdog() {
    this._stopVideoWatchdog();
    this._videoWatchdogResetCount = 0;

    this._lastFrameTime = 0;
    this._videoWatchdog = setInterval(() => {
      if (this.currentScreen() !== "screen-game") return;

      const hasTransport = this._transportMode === "webrtc"
        ? !!this.webrtc
        : !!this.transport;
      if (!hasTransport && !this.webrtc && !this.transport) return;

      const lastFrame = this._transportMode === "webrtc" && this.decoder
        ? this.decoder.lastFrameTime || this._lastFrameTime
        : this._lastFrameTime;

      if (lastFrame === 0) {
        if (!this._gameReadyAt) return;
        const waitingMs = Date.now() - this._gameReadyAt;
        if (waitingMs >= 8000) {
          this._videoWatchdogResetCount++;
          console.warn(`[Watchdog] No video after ${(waitingMs / 1000).toFixed(1)}s — requesting keyframe (attempt #${this._videoWatchdogResetCount})`);
          if (this._transportMode === "webrtc") {
            this.webrtc?.sendInput({ type: "reset-video" });
          } else {
            this.ws?.sendInput({ type: "reset-video" });
          }
          this._gameReadyAt = Date.now();
        }
        return;
      }

      const staleMs = Date.now() - lastFrame;
      if (staleMs >= 5000) {
        const now = Date.now();
        const sinceLastReset = now - (this._lastResetTime || 0);
        if (sinceLastReset >= 15000) {
          this._videoWatchdogResetCount++;
          console.warn(`[Watchdog] No frame for ${(staleMs / 1000).toFixed(1)}s — requesting keyframe (attempt #${this._videoWatchdogResetCount})`);
          if (this._transportMode === "webrtc") {
            this.webrtc?.sendInput({ type: "reset-video" });
          } else {
            this.ws?.sendInput({ type: "reset-video" });
          }
          this._lastResetTime = now;
        }
      }
    }, 3000);
  }

  _stopVideoWatchdog() {
    if (this._videoWatchdog) {
      clearInterval(this._videoWatchdog);
      this._videoWatchdog = null;
    }
  }

  showScreen(id) {
    document.querySelectorAll(".screen:not(#loading-screen)").forEach((s) => s.classList.remove("active"));
    if (id) document.getElementById(id)?.classList.add("active");
  }

  currentScreen() {
    const el = document.querySelector(".screen.active:not(#loading-screen)");
    return el ? el.id : null;
  }
}
