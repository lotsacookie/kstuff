import { wsBase, currentMode, proxiedWebSocket, mayUseProxy, auth } from "./net.js";

/**
 * WebSocket client for signaling with the server.
 */
export class WebSocketClient {
  constructor() {
    /** @type {WebSocket|null} */
    this.ws = null;
    this.connected = false;

    // Callbacks
    /** @type {((position: number, total: number) => void)|null} */
    this.onQueueStatus = null;
    /** @type {(() => void)|null} */
    this.onQueueReady = null;
    /** @type {((sdp: string) => void)|null} */
    this.onOffer = null;
    /** @type {((candidate: RTCIceCandidateInit) => void)|null} */
    this.onIceCandidate = null;
    /** @type {((message: string) => void)|null} */
    this.onError = null;
    /** @type {((reason: string) => void)|null} */
    this.onSessionEnd = null;
    /** @type {(() => void)|null} */
    this.onClose = null;
    /** @type {((visible: boolean) => void)|null} */
    this.onKeyboardState = null;
    /** @type {(() => void)|null} */
    this.onGameReady = null;
    /** @type {((message: string) => void)|null} */
    this.onSessionProgress = null;
    // mediasoup signaling callbacks
    /** @type {((caps: object) => void)|null} */
    this.onRouterRtpCapabilities = null;
    /** @type {((options: object) => void)|null} */
    this.onRecvTransportCreated = null;
    /** @type {((params: object) => void)|null} */
    this.onConsumeResponse = null;
  }

  async connect() {
    // Pass auth token from URL query string
    const params = new URLSearchParams(location.search);
    const token = auth.token || params.get("token");
    const url = `${wsBase()}/ws${token ? `?token=${encodeURIComponent(token)}` : ""}`;
    console.log("[WS] Connecting to", url.replace(/token=[^&]+/, "token=***"));

    this._connecting = true;
    if (currentMode() === "direct") {
      const opened = await new Promise((resolve) => {
        let ws;
        try { ws = new WebSocket(url); } catch { return resolve(false); }
        this._attach(ws);
        let done = false;
        ws.addEventListener("open", () => { done = true; resolve(true); });
        ws.addEventListener("close", () => { if (!done) resolve(false); });
        setTimeout(() => { if (!done) { done = true; try { ws.close(); } catch {} resolve(false); } }, 8000);
      });
      if (opened) { this._connecting = false; return; }
      this.ws = null;
      if (!mayUseProxy()) { this._connecting = false; this.onClose?.(); return; }
      console.warn("[WS] direct connection failed, switching to proxy");
    }
    const ProxySocket = await proxiedWebSocket();
    this._attach(new ProxySocket(url));
    this._connecting = false;
  }

  _attach(ws) {
    this.ws = ws;
    ws.onopen = () => {
      console.log("[WS] Connected");
      this.connected = true;
    };

    ws.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case "queue-status":
          this.onQueueStatus?.(msg.position, msg.total);
          break;
        case "queue-ready":
          this.onQueueReady?.();
          break;
        case "offer":
          this.onOffer?.(msg.sdp);
          break;
        case "ice-candidate":
          this.onIceCandidate?.(msg.candidate);
          break;
        case "error":
          console.error("[WS] Error:", msg.message);
          this.onError?.(msg.message);
          break;
        case "session-end":
          this.onSessionEnd?.(msg.reason);
          break;
        case "keyboard-state":
          this.onKeyboardState?.(msg.visible);
          break;
        case "game-ready":
          this.onGameReady?.(msg.deviceType || "phone");
          break;
        case "session-progress":
          this.onSessionProgress?.(msg.message);
          break;
        // mediasoup signaling
        case "router-rtp-capabilities":
          this.onRouterRtpCapabilities?.(msg.rtpCapabilities);
          break;
        case "recv-transport-created":
          this.onRecvTransportCreated?.(msg.transportOptions);
          break;
        case "consume-response":
          this.onConsumeResponse?.(msg);
          break;
        case "ping":
          this.send({ type: "pong" });
          break;
      }
    };

    ws.onclose = () => {
      if (ws !== this.ws || this._connecting) return; // superseded, or still choosing direct vs proxy
      console.log("[WS] Disconnected");
      this.connected = false;
      this.onClose?.();
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
    };
  }

  send(msg) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  joinQueue(gameId) {
    this.send({ type: "queue-join", gameId });
  }

  sendClientReady() {
    this.send({ type: "client-ready" });
  }

  sendAnswer(sdp) {
    this.send({ type: "answer", sdp });
  }

  sendIceCandidate(candidate) {
    this.send({ type: "ice-candidate", candidate });
  }

  /**
   * Send input message via WebSocket (reliable transport).
   * Wraps the input data in {type: "input", data: ...} envelope.
   * @param {object} data - Input message (drag, click, key, reset-video, video-size)
   */
  sendInput(data) {
    this.send({ type: "input", data });
  }

  sendUnblock() {
    console.log("[WS] Sending unblock");
    this.send({ type: "unblock" });
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }
}
