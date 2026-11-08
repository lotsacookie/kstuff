// SingularityMoon player: custom client for CloudMoon's streaming protocol.
// Flow (mirrors web.cloudmoonapp.com/run-site):
//   /phone/connect -> sid -> /web/sid (session info) -> socket.io signaling (/client/socket.io)
//   -> server WebRTC offer -> our answer -> video/audio tracks + "config" data channel for input.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const STUN = [{ urls: "stun:stun.ipfire.org:3478" }, { urls: "stun:global.stun.twilio.com:3478" }, { urls: "stun:stun.l.google.com:19302" }];
const ERR = {
  99999: "The server returned an unspecified error (99999) while starting the game.",
  30001: "Connection failed. Please try 'Clear Games Cache' and reopen the game.",
  30002: "Free access is blocked for this account right now (ad blocker / plan needed).",
  30003: "No play time left on this account.",
  30004: "Please wait about 3 minutes before starting again.",
  10005: "This game needs a higher plan.",
};

// Android key codes for typing mode and mapped keys.
const AK = { Enter: 66, NumpadEnter: 66, Backspace: 67, Delete: 112, Space: 62, Tab: 61, Escape: 111, ArrowUp: 19, ArrowDown: 20, ArrowLeft: 21, ArrowRight: 22, Home: 122, End: 123, PageUp: 92, PageDown: 93, Insert: 124, CapsLock: 115, ShiftLeft: 59, ShiftRight: 60, ControlLeft: 113, ControlRight: 114, AltLeft: 57, AltRight: 58, Comma: 55, Period: 56, Slash: 76, Semicolon: 74, Quote: 75, Minus: 69, Equal: 70, BracketLeft: 71, BracketRight: 72, Backslash: 73, Backquote: 68 };
for (let n = 0; n < 26; n++) AK["Key" + String.fromCharCode(65 + n)] = 29 + n;
for (let n = 0; n < 10; n++) { AK["Digit" + n] = 7 + n; AK["Numpad" + n] = 144 + n; }
const _dpr = Math.max(1, window.devicePixelRatio || 1);
let SCREEN_W = Math.round((screen.width || 1920) * _dpr), SCREEN_H = Math.round((screen.height || 1080) * _dpr);
if ((window.innerWidth || 1) >= (window.innerHeight || 1) && SCREEN_W < SCREEN_H) [SCREEN_W, SCREEN_H] = [SCREEN_H, SCREEN_W];
SCREEN_W -= SCREEN_W % 2; SCREEN_H -= SCREEN_H % 2;
for (let i = 0; i < 26; i++) AK["Key" + String.fromCharCode(65 + i)] = 29 + i;
for (let i = 0; i < 10; i++) AK["Digit" + i] = 7 + i;

/* ---- minimal socket.io v2 (EIO3) client over a WebSocket implementation ---- */
function connectSocket(base, WSImpl, timeout = 6000) {
  return new Promise((resolve, reject) => {
    let u;
    try { u = new URL(/^(https?|wss?):\/\//.test(base) ? base : "https://" + base); } catch (e) { return reject(e); }
    const proto = u.protocol === "http:" || u.protocol === "ws:" ? "ws:" : "wss:";
    const url = `${proto}//${u.host}/client/socket.io/?EIO=3&transport=websocket`;
    let ws;
    try { ws = new WSImpl(url); } catch (e) { return reject(e); }
    const handlers = {};
    let ping = null, done = false;
    const sock = {
      url, ws,
      on(ev, fn) { handlers[ev] = fn; return sock; },
      emit(ev, data) { if (ws.readyState === 1) ws.send("42" + JSON.stringify(data === undefined ? [ev] : [ev, data])); },
      close() { clearInterval(ping); handlers.disconnect = null; try { ws.close(); } catch {} },
    };
    const to = setTimeout(() => { if (!done) { done = true; sock.close(); reject(new Error("timeout")); } }, timeout);
    ws.onmessage = (m) => {
      const d = m.data;
      if (typeof d !== "string") return;
      if (d[0] === "0") {
        try { const o = JSON.parse(d.slice(1)); ping = setInterval(() => { if (ws.readyState === 1) ws.send("2"); }, Math.max(5000, (o.pingInterval || 25000) - 2000)); } catch {}
      } else if (d[0] === "2") { ws.send("3"); }
      else if (d[0] === "4") {
        if (d[1] === "0") { if (!done) { done = true; clearTimeout(to); resolve(sock); } }
        else if (d[1] === "1") { handlers.disconnect && handlers.disconnect(); }
        else if (d[1] === "2") {
          const j = d.indexOf("[");
          let arr; try { arr = JSON.parse(d.slice(j)); } catch { return; }
          const h = handlers[arr[0]]; h && h(arr[1]);
        }
      }
    };
    ws.onerror = () => { if (!done) { done = true; clearTimeout(to); reject(new Error("socket error")); } };
    ws.onclose = () => { clearInterval(ping); if (!done) { done = true; clearTimeout(to); reject(new Error("socket closed")); } else handlers.disconnect && handlers.disconnect(); };
  });
}
async function raceSockets(tasks, onTry) {
  // tasks: [{base, impl, label}] started 200ms apart; first to connect wins, the rest are closed.
  return new Promise((resolve) => {
    let won = false, finished = 0;
    const opened = [];
    tasks.forEach((t, i) => setTimeout(async () => {
      if (won) { if (++finished === tasks.length && !won) resolve(null); return; }
      onTry && onTry(t);
      try {
        const s = await connectSocket(t.base, t.impl);
        opened.push(s);
        if (won) { s.close(); } else { won = true; opened.forEach((o) => o !== s && o.close()); resolve(s); }
      } catch {}
      if (++finished === tasks.length && !won) resolve(null);
    }, i * 200));
  });
}

/* ---- SDP helpers copied in spirit from the official player ---- */
function preferCodec(sdp, pt) {
  const lines = sdp.split("\r\n");
  return lines.map((l) => {
    if (!l.startsWith("m=video")) return l;
    const p = l.split(" ");
    if (!p.includes(String(pt))) return l;
    const rest = p.filter((x) => x !== String(pt));
    rest.splice(3, 0, String(pt));
    return rest.join(" ");
  }).join("\r\n");
}
const addRrtr = (sdp) => sdp.replace(/(m=video.*\r\n)/, "$1a=rtcp-xr:rrtr\r\n").replace(/(m=audio.*\r\n)/, "$1a=rtcp-xr:rrtr\r\n");

export class Player {
  constructor({ api, getLibcurl, ads, game, androidId, serverId, mount, onStatus, onEnd, onDebug }) {
    Object.assign(this, { api, getLibcurl, ads, game, androidId, serverId, mount, onStatus, onEnd, onDebug });
    this.stopped = false; this.rot = 0; this.typing = true; this.cfg = null;
    this.keys = new Map(); this.touchN = 20; this.pending = null; this.pcands = [];
    this.stream = new MediaStream();
  }
  say(t, cls = "") { this.onStatus && this.onStatus(t, cls); }

  async start() {
    try {
      await this._connect();
      if (this.stopped) return;
      await this._session();
      if (this.stopped) return;
      await this._rtc();
      await this._signal();
    } catch (e) {
      if (this.stopped) return;
      console.error("[player] start failed:", e.message || String(e));
      this.say(e.message || String(e), "err");
      await this.stop(true, e.message || String(e));
    }
  }

  async _connect() {
    const unblocked = this.ads ? await this.ads.unblocked() : true;
    let queued = false, blank = 0;
    for (;;) {
      if (this.stopped) return;
      if (!queued) this.say("Requesting a cloud phone…");
      let j;
      try {
        console.log("[player] POST /phone/connect game=" + this.game + " server_id=" + this.serverId + " android_id=" + this.androidId);
        j = await this.api("/phone/connect", { method: "POST", body: {
          android_id: this.androidId, game_name: this.game, screen_res: SCREEN_W + "x" + SCREEN_H, server_id: this.serverId,
          params: JSON.stringify({ language: "en", locale: (navigator.language.split("-")[1] || "").toLowerCase() }), ad_unblock: unblocked } });
      } catch (e) {
        if (!queued) throw e;               // like the site: ignore hiccups while waiting in the queue
        console.warn("[player] queue poll failed", e); await sleep(5000); continue;
      }
      console.log("[player] /phone/connect reply", j);
      this.onDebug && this.onDebug("/phone/connect → " + JSON.stringify(j).slice(0, 600));
      const d = (j && j.data) || {};
      if (j.code === 0 && d.android_instance_id) { this.conn = d; return; }
      if (j.code === 0) {
        const waiting = d.position || d.waiting_time || d.in_queue_time || d.priority_queue_length;
        if (waiting) {
          queued = true; blank = 0;
          const m = d.waiting_time ? Math.max(1, Math.ceil(d.waiting_time / 60)) : null;
          this.say("In queue" + (d.position ? " — position " + d.position : "") + (m ? ", about " + m + " min" : "") + (d.priority_queue_length ? " (priority queue: " + d.priority_queue_length + ")" : ""));
        } else {
          if (++blank > 24) throw new Error("The server accepted the request but never assigned a phone. Reply: " + JSON.stringify(j).slice(0, 300));
          this.say(queued ? "Still in queue…" : "Waiting for the server to assign a phone…");
        }
        await sleep(5000); continue;
      }
      const friendly = ERR[j.code] || "Server refused the session";
      throw new Error(friendly + " [code " + j.code + (j.message ? ": " + j.message : "") + "]");
    }
  }

  async _session() {
    this.say("Verifying session…");
    const sid = this.conn.sid;
    if (!sid) throw new Error("Server didn't return a session id");
    const j = await this.api("/web/sid?sid=" + encodeURIComponent(sid));
    if (j.code !== 0 || !j.data) throw new Error(j.message || "Session verification failed");
    this.sess = j.data;
    this.onDebug && this.onDebug("/web/sid → ok (game " + (j.data.game || this.game) + ")");
    try {
      const c = await this.api("/web/game_config?pkg=" + encodeURIComponent(this.game));
      if (c.code === 0 && c.data) this.cfg = c.data;
    } catch {}
  }

  async _rtc() {
    const t = this.sess.turn_info || {};
    const ice = [...STUN];
    if (t.url && t.username && t.credential) ice.push({ urls: t.url, username: t.username, credential: t.credential });
    const pc = this.pc = new RTCPeerConnection({ iceServers: ice, bundlePolicy: "max-bundle", rtcpMuxPolicy: "require", iceTransportPolicy: "all" });
    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });
    pc.onicecandidate = (e) => {
      if (!e.candidate || e.candidate.type === "host") return;
      this.sock && this.sock.emit("msg", { type: "candidate", label: e.candidate.sdpMLineIndex, id: e.candidate.sdpMid, candidate: e.candidate.candidate });
    };
    pc.ontrack = (e) => {
      this.stream.addTrack(e.track);
      this.video.srcObject = this.stream;
      const v = this.video;
      v.muted = false; v.volume = 1;
      v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
      if (!this._unmute) {
        this._unmute = () => {
          if (!v.muted && !v.paused) return;
          v.muted = false; v.volume = 1; v.play().catch(() => {});
        };
        for (const t of ["pointerdown", "keydown", "touchstart", "click"]) addEventListener(t, this._unmute, true);
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") this.stop(true, "Connection lost");
    };
    const dc = this.dc = pc.createDataChannel("config", { ordered: true });
    dc.onopen = () => { this.say("Connected — waiting for the screen…"); this.ads && this.ads.sync(); };
    dc.onmessage = (e) => this._dcMessage(String(e.data));
    dc.onclose = () => { if (!this.stopped) this.stop(true, "Session ended"); };
    this._buildUI();
  }

  _dcMessage(m) {
    if (!/^rotation>/.test(m)) console.log("[player] dc", m.slice(0, 200));
    const i = m.indexOf(">");
    const type = i < 0 ? m : m.slice(0, i), val = i < 0 ? "" : m.slice(i + 1);
    if (type === "rotation") {
      this.rot = parseInt(val) || 0;
      this.ready = true;
      this.mount.classList.add("live");
      setTimeout(() => { this._layoutKeys(); this._buildKeys(); }, 300);
      this._forceRemoteIME();
      this.say("Streaming", "ok");
      this.ads && this.ads.sync();
    } else if (type === "keyboard") {
      this.typing = true;
      if (val.startsWith("show")) this._imeShow(); else if (val.startsWith("hide")) this._imeHide();
    } else if (type === "kickout") {
      this.stop(true, "You were disconnected from the session");
    }
  }

  async _signal() {
    const s = this.sess;
    let coor = "";
    try { coor = JSON.parse(atob(s.android_instance_id)).coorUrl || ""; } catch {}
    const bases = [...new Set([coor, s.coor_tunnel, s.coor_cloudfront].filter(Boolean))];
    if (coor && coor.includes("nenly.cn")) bases.push(coor.replace("nenly.cn", "viewoncloud.com"));
    if (!bases.length) throw new Error("No signaling servers in the session");
    this.say("Finding the fastest server…");
    const lc = await this.getLibcurl().catch(() => null);
    const impls = [window.WebSocket];
    if (lc && typeof lc.WebSocket === "function") impls.push(lc.WebSocket);
    const tasks = [];
    for (const impl of impls) for (const base of bases) tasks.push({ base, impl });
    const sock = await raceSockets(tasks);
    if (!sock || this.stopped) throw new Error("Couldn't reach the streaming server");
    this.sock = sock;
    this.say("Joining the session…");
    let joined = 0, offered = false, registered = false;
    const join = () => {
      if (offered || this.stopped) return;
      if (joined++ >= 3) { this.stop(true, "Unable to join the session"); return; }
      sock.emit("client_register", { screenRes: SCREEN_W + "x" + SCREEN_H, game: s.game || this.game, userId: s.android_id || this.androidId, slotId: `${s.android_id || this.androidId}@${s.game || this.game}`, instanceId: s.android_instance_id });
      sock.emit("metrics", navigator.userAgent);
      setTimeout(join, 3000);
    };
    sock.on("hello_server", () => { if (!registered) { registered = true; setTimeout(join, 500); } });
    sock.on("action_done2", (d) => { sock.emit("register", { roomid: d && d.signalingRoomId, clientid: "1111111" }); });
    sock.on("no_free_android", () => this.say("No free phone yet — waiting…"));
    sock.on("getout", (d) => {
      let o = d; try { if (typeof d === "string") o = JSON.parse(d); } catch {}
      if (o && o.errorCode === 10) { sock.close(); return; }
      this.stop(true, (o && o.msg) || "The server is busy");
    });
    sock.on("msg", async (m) => {
      try {
        if (!m || this.stopped) return;
        if (m.type === "offer") {
          offered = true;
          await this.pc.setRemoteDescription({ type: "offer", sdp: addRrtr(preferCodec(m.sdp, 100)) });
          const ans = await this.pc.createAnswer();
          await this.pc.setLocalDescription(ans);
          sock.emit("msg", { type: this.pc.localDescription.type, sdp: this.pc.localDescription.sdp });
          for (const c of this.pcands.splice(0)) await this._addCand(c);
        } else if (m.type === "answer") {
          await this.pc.setRemoteDescription(m);
        } else if (m.type === "candidate") {
          if (this.pc.remoteDescription) await this._addCand(m); else this.pcands.push(m);
        }
      } catch (e) { console.warn("[player] signaling", e); }
    });
    sock.on("disconnect", () => {});
    // wait for the screen (rotation message) up to 90s
    for (let i = 0; i < 180 && !this.ready && !this.stopped; i++) await sleep(500);
    if (!this.ready && !this.stopped) throw new Error("Timed out waiting for the screen");
  }
  async _addCand(m) { try { await this.pc.addIceCandidate({ sdpMLineIndex: m.label, candidate: m.candidate }); } catch {} }

  /* ---- UI + input ---- */
  _buildUI() {
    const v = this.video = document.createElement("video");
    v.addEventListener("resize", () => { this.onDebug && this.onDebug("video " + v.videoWidth + "x" + v.videoHeight); console.log("[player] video size " + v.videoWidth + "x" + v.videoHeight); });
    v.autoplay = true; v.playsInline = true; v.className = "pv";
    this.mount.querySelector(".stage").append(v);
    const on = (t, fn, o) => { v.addEventListener(t, fn, o); };
    v.addEventListener("contextmenu", (e) => e.preventDefault());
    on("pointerdown", (e) => { e.preventDefault(); try { window.focus(); if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); } catch {} try { v.setPointerCapture(e.pointerId); } catch {} this._ptr(e, "start"); });
    on("pointermove", (e) => { e.preventDefault(); this._ptr(e, "move"); });
    on("pointerup", (e) => { e.preventDefault(); this._ptr(e, "end"); });
    on("pointercancel", (e) => { e.preventDefault(); this._ptr(e, "end"); });
    const box = this.imeBox = document.createElement("div");
    box.style.cssText = "position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:40;display:none;gap:8px;align-items:center;width:min(560px,92%);padding:8px;border-radius:14px;background:rgba(10,12,24,.88);border:1px solid rgba(255,255,255,.2);box-shadow:0 8px 24px rgba(0,0,0,.45)";
    const inp = this.imeInput = document.createElement("input");
    inp.type = "text"; inp.autocomplete = "off"; inp.spellcheck = false; inp.placeholder = "Type here — Enter to send, Esc to close";
    inp.style.cssText = "flex:1;min-width:0;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;font:15px system-ui,sans-serif;outline:none";
    const x = document.createElement("button");
    x.type = "button"; x.textContent = "✕"; x.title = "Close keyboard";
    x.style.cssText = "padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;cursor:pointer";
    box.append(inp, x);
    this.mount.querySelector(".stage").append(box);
    this.imeCnt = 0;
    inp.addEventListener("input", () => this.send(`softinput>text_change:${this.imeCnt++}:0,99999,${inp.value}`));
    inp.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") { e.preventDefault(); this.send("softinput>action:4"); inp.value = ""; }
      else if (e.key === "Escape") { e.preventDefault(); this._imeClose(); }
    });
    inp.addEventListener("keyup", (e) => e.stopPropagation());
    x.addEventListener("click", () => this._imeClose());
    const cur = this.cursorEl = document.createElement("div");
    cur.style.cssText = "position:absolute;left:0;top:0;width:22px;height:22px;z-index:7;pointer-events:none;display:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))";
    cur.innerHTML = '<svg width="22" height="22" viewBox="0 0 22 22"><path d="M2 1l0 17 4.6-4.2 3.2 7 3-1.4-3.2-6.9H17z" fill="#fff" stroke="#000" stroke-width="1.3" stroke-linejoin="round"/></svg>';
    this.mount.querySelector(".stage").append(cur);
    try { this.softCursor = localStorage.getItem("moon_cursor") !== "0"; } catch { this.softCursor = true; }
    v.style.cursor = this.softCursor ? "none" : "";
    v.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || !this.softCursor || document.pointerLockElement === v) { cur.style.display = "none"; return; }
      const sr = this.mount.querySelector(".stage").getBoundingClientRect();
      cur.style.display = "block";
      cur.style.transform = `translate(${e.clientX - sr.left}px,${e.clientY - sr.top}px)`;
    });
    v.addEventListener("pointerleave", () => { cur.style.display = "none"; });
    this._plc = () => {
      if (document.pointerLockElement !== v && this.lockOn) {
        this.lockOn = false;
        if (this.lockTouch) { const c = this._cfgc().pointerLockCenter || { x: 640, y: 360 }; this.send(`touch>Touch end:8,${c.x},${c.y}`); this.lockTouch = false; }
        this.mx = this.my = 0;
      }
    };
    document.addEventListener("pointerlockchange", this._plc);
    const st = document.createElement("style");
    st.textContent = ".mkl{position:absolute;pointer-events:none;z-index:6;display:none}.mkl.on{display:block}.mk{position:absolute;transform:translate(-50%,-50%);min-width:34px;height:34px;padding:0 8px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:9px;background:rgba(20,24,40,.32);border:1px solid rgba(255,255,255,.4);color:rgba(255,255,255,.85);font:600 12px system-ui,sans-serif;white-space:nowrap}.mk.sm{min-width:28px;height:28px;padding:0 4px}.mk.press{background:rgba(255,255,255,.55);color:#000}";
    this.mount.querySelector(".stage").append(st);
    const kl = this.keyLayer = document.createElement("div");
    kl.className = "mkl";
    this.mount.querySelector(".stage").append(kl);
    this.keyEls = new Map(); this.rock = new Set(); this.rockOn = false;
    try { this.showKeys = localStorage.getItem("moon_hotkeys") !== "0"; } catch { this.showKeys = true; }
    const relayout = () => this._layoutKeys();
    v.addEventListener("resize", () => { relayout(); this._buildKeys(); });
    v.addEventListener("loadedmetadata", () => { relayout(); this._buildKeys(); });
    addEventListener("resize", relayout);
    this._rzKeys = relayout;
    this._kd = (e) => this._key(e, true); this._ku = (e) => this._key(e, false);
    addEventListener("keydown", this._kd); addEventListener("keyup", this._ku);
    this._raf = () => { if (this.pending) { this.send(this.pending); this.pending = null; } this._rid = requestAnimationFrame(this._raf); };
    this._rid = requestAnimationFrame(this._raf);
  }
  _cfgc() { const c = this.cfg; return c ? (c.keyBoard ? c : (c.config || {})) : {}; }
  _layoutKeys() {
    const v = this.video, L = this.keyLayer, stage = this.mount && this.mount.querySelector(".stage");
    if (!v || !L || !stage) return;
    const vw = v.videoWidth, vh = v.videoHeight;
    if (!vw || !vh) return;
    const r = v.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    const sc = Math.min(r.width / vw, r.height / vh), cw = vw * sc, ch = vh * sc;
    L.style.left = (r.left - sr.left + (r.width - cw) / 2) + "px";
    L.style.top = (r.top - sr.top + (r.height - ch) / 2) + "px";
    L.style.width = cw + "px"; L.style.height = ch + "px";
  }
  _buildKeys() {
    const L = this.keyLayer, v = this.video;
    if (!L || !v) return;
    L.textContent = ""; this.keyEls = new Map();
    const c = this._cfgc(), kb = c.keyBoard, vw = v.videoWidth, vh = v.videoHeight;
    if (!kb || !vw || !vh) { L.classList.remove("on"); return; }
    if (c.keyBoardDirection != null && Number(c.keyBoardDirection) !== this.rot && Number(c.keyBoardDirection) !== (vw >= vh ? 1 : 0)) { L.classList.remove("on"); return; }
    const put = (x, y, text, small, key) => {
      const d = document.createElement("div");
      d.className = "mk" + (small ? " sm" : "");
      d.textContent = text;
      d.style.left = (x / vw * 100) + "%"; d.style.top = (y / vh * 100) + "%";
      L.append(d);
      if (key) this.keyEls.set(key, d);
    };
    const rock = c.supportLeftRocker && !c.hideLeftRocker && c.center && Number.isFinite(+c.center.x) && Number.isFinite(+c.center.y);
    for (const k of Object.keys(kb)) {
      const m = kb[k], co = m && m.coordinate;
      if (!co || co === "0,0") continue;
      const [x, y] = String(co).split(",").map(Number);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const str = (m.str != null && m.str !== "") ? String(m.str) : (k.length === 1 ? k.toUpperCase() : k);
      put(x, y, str, false, k);
    }
    if (rock) {
      const cx = +c.center.x, cy = +c.center.y, d = 38;
      const skip = (k) => kb[k] && kb[k].coordinate && kb[k].coordinate !== "0,0";
      if (!skip("w")) put(cx, cy - d, "W", true, "w");
      if (!skip("a")) put(cx - d, cy, "A", true, "a");
      if (!skip("s")) put(cx, cy + d, "S", true, "s");
      if (!skip("d")) put(cx + d, cy, "D", true, "d");
    }
    this._layoutKeys();
    L.classList.toggle("on", !!this.showKeys && this.keyEls.size > 0);
  }
  toggleKeys() {
    this.showKeys = !this.showKeys;
    try { localStorage.setItem("moon_hotkeys", this.showKeys ? "1" : "0"); } catch {}
    this._buildKeys();
    return this.showKeys;
  }
  _hi(k, on) { const el = this.keyEls && this.keyEls.get(k); if (el) el.classList.toggle("press", !!on); }
  _rocker(c) {
    const r = this.rock, cx = +c.center.x, cy = +c.center.y, R = 110;
    let dx = (r.has("d") ? 1 : 0) - (r.has("a") ? 1 : 0), dy = (r.has("s") ? 1 : 0) - (r.has("w") ? 1 : 0);
    if (!dx && !dy) { if (this.rockOn) { this.send(`touch>Touch end:9,${cx},${cy}`); this.rockOn = false; } return; }
    const n = Math.hypot(dx, dy); dx = dx / n * R; dy = dy / n * R;
    const x = Math.round(cx + dx), y = Math.round(cy + dy);
    if (!this.rockOn) { this.send(`touch>Touch start:9,${cx},${cy}`); this.rockOn = true; }
    this.send(`touch>Touch move:9,${x},${y}`);
  }
  _upp() {
    const v = this.video, r = v.getBoundingClientRect(), vw = v.videoWidth || SCREEN_W, vh = v.videoHeight || SCREEN_H;
    const sc = Math.min(r.width / vw, r.height / vh) || 1;
    return 1 / sc;
  }
  _rcPtr(e, phase, c) {
    const ctr = c.rightClickCenter || { x: 640, y: 360 }, R = c.rightClickRadius != null ? +c.rightClickRadius : 350;
    const pos = () => `${ctr.x + Math.floor(this.rcPos.x)},${ctr.y + Math.floor(this.rcPos.y)}`;
    if (phase === "start" && e.button === 2 && c.supportRightClick) {
      this.rcDrag = true; this.rcPos = { x: 0, y: 0 };
      this.send(`touch>Touch start:8,${pos()}`);
      return true;
    }
    if (!this.rcDrag) return false;
    if (phase === "move") {
      let x = this.rcPos.x + (e.movementX || 0), y = this.rcPos.y + (e.movementY || 0);
      if (Math.hypot(x, y) > R) { const a = Math.atan2(y, x); x = R * Math.cos(a); y = R * Math.sin(a); }
      this.rcPos = { x, y };
      this.pending = `touch>Touch move:8,${pos()}`;
      return true;
    }
    if (phase === "end") { this.pending = null; this.send(`touch>Touch end:8,${pos()}`); this.rcDrag = false; return true; }
    return true;
  }
  _lockPtr(e, phase, c) {
    const kb = c.keyBoard || {}, pc = c.pointerLockCoordinate || {};
    if (phase === "start" || phase === "end") {
      let co = null;
      if (e.button === 0) { co = pc.lClick || "1060,550"; if (kb.lClick && kb.lClick.coordinate && kb.lClick.coordinate !== "0,0") co = kb.lClick.coordinate; }
      else if (e.button === 2) { co = pc.rClick || "1180,620"; if (kb.rClick && kb.rClick.coordinate && kb.rClick.coordinate !== "0,0") co = kb.rClick.coordinate; if (co === "0,0") return; }
      if (co) this.send(`touch>Touch ${phase}:5,${co}`);
      return;
    }
    const ctr = c.pointerLockCenter || { x: 640, y: 360 }, k = this._upp() * (this.sens || 1);
    this.mx = (this.mx || 0) + (e.movementX || 0) * k; this.my = (this.my || 0) + (e.movementY || 0) * k;
    const vw = this.video.videoWidth || SCREEN_W, vh = this.video.videoHeight || SCREEN_H;
    if (Math.abs(this.mx) > vw * 0.4 || Math.abs(this.my) > vh * 0.4) {
      if (this.lockTouch) this.send(`touch>Touch end:8,${ctr.x + Math.round(this.mx)},${ctr.y + Math.round(this.my)}`);
      this.mx = this.my = 0; this.lockTouch = false; return;
    }
    const x = ctr.x + Math.round(this.mx), y = ctr.y + Math.round(this.my);
    if (!this.lockTouch) { this.send(`touch>Touch start:8,${ctr.x},${ctr.y}`); this.lockTouch = true; }
    this.send(`touch>Touch move:8,${x},${y}`);
    clearTimeout(this._lockT);
    this._lockT = setTimeout(() => { if (this.lockTouch) { this.send(`touch>Touch end:8,${x},${y}`); this.lockTouch = false; } this.mx = this.my = 0; }, 50);
  }
  toggleLock() {
    const v = this.video;
    if (document.pointerLockElement === v) { document.exitPointerLock(); return false; }
    try { v.requestPointerLock(); this.lockOn = true; } catch {}
    return true;
  }
  toggleCursor() {
    this.softCursor = !this.softCursor;
    try { localStorage.setItem("moon_cursor", this.softCursor ? "1" : "0"); } catch {}
    this.video.style.cursor = this.softCursor ? "none" : "";
    if (!this.softCursor) this.cursorEl.style.display = "none";
    return this.softCursor;
  }
  _forceRemoteIME() {
    const go = () => { if (this.stopped) return; this.send("softinput>hide"); this.send("softinput>switch:remote"); };
    go();
    for (const ms of [1500, 5000, 12000]) setTimeout(go, ms);
  }
  _imeShow() {
    if (!this.imeBox) return;
    this.send("softinput>height:1");
    this.imeBox.style.display = "flex";
    this.imeInput.value = "";
    setTimeout(() => { try { this.imeInput.focus(); } catch {} }, 30);
  }
  _imeHide() { if (this.imeBox) { this.imeBox.style.display = "none"; this.imeInput.value = ""; try { this.imeInput.blur(); } catch {} } }
  _imeClose() { this.send("softinput>hide"); this._imeHide(); }
  send(m) { if (this.dc && this.dc.readyState === "open") try { this.dc.send(m); } catch {} }
  _pt(e) {
    const v = this.video, r = v.getBoundingClientRect();
    const vw = v.videoWidth || SCREEN_W, vh = v.videoHeight || SCREEN_H;
    const sc = Math.min(r.width / vw, r.height / vh), cw = vw * sc, ch = vh * sc;
    const ox = r.left + (r.width - cw) / 2, oy = r.top + (r.height - ch) / 2;
    const W = vw, H = vh;
    return { x: Math.round(clamp((e.clientX - ox) / cw, 0, 1) * W), y: Math.round(clamp((e.clientY - oy) / ch, 0, 1) * H) };
  }
  _ptr(e, phase) {
    if (!this.ready) return;
    const c0 = this._cfgc();
    if (e.pointerType === "mouse") {
      if (document.pointerLockElement === this.video) { this._lockPtr(e, phase, c0); return; }
      if (this._rcPtr(e, phase, c0)) return;
    }
    const p = this._pt(e);
    if (e.pointerType === "mouse") {
      const b = e.button < 0 ? 0 : e.button;
      if (phase === "start") { this.down = true; this.send(`touch>Mouse down:${b},${p.x},${p.y}`); }
      else if (phase === "move") { if (this.down) this.pending = `touch>Mouse move:${b},${p.x},${p.y}`; }
      else { if (this.down) { this.down = false; this.pending = null; this.send(`touch>Mouse up:${b},${p.x},${p.y}`); } }
    } else {
      const id = e.pointerId % 10;
      if (phase === "start") this.send(`touch>Touch start:${id},${p.x},${p.y}`);
      else if (phase === "move") this.pending = `touch>Touch move:${id},${p.x},${p.y}`;
      else { this.pending = null; this.send(`touch>Touch end:${id},${p.x},${p.y}`); }
    }
  }
  _key(e, down) {
    if (!this.ready || e.target.closest && e.target.closest("input,textarea")) return;
    if (down && e.ctrlKey && e.code === "KeyM") { e.preventDefault(); this.toggleLock(); return; }
    const kb = this.cfg && (this.cfg.keyBoard || (this.cfg.config && this.cfg.config.keyBoard));
    const k = (e.key || "").toLowerCase();
    const map = kb && kb[k];
    const cc = this._cfgc();
    if (!(map && map.coordinate && map.coordinate !== "0,0") && k.length === 1 && "wasd".includes(k) && cc.supportLeftRocker && !cc.hideLeftRocker && cc.center && !this.imeOpen) {
      e.preventDefault();
      if (down) this.rock.add(k); else this.rock.delete(k);
      this._hi(k, down);
      this._rocker(cc);
      return;
    }
    if (map && map.coordinate && map.coordinate !== "0,0") {
      e.preventDefault();
      if (down && !this.keys.has(k)) { const id = this.touchN++ % 10 + 10; this.keys.set(k, id); this._hi(k, true); this.send(`touch>Touch start:${id},${map.coordinate}`); }
      else if (!down && this.keys.has(k)) { this._hi(k, false); this.send(`touch>Touch end:${this.keys.get(k)},${map.coordinate}`); this.keys.delete(k); }
      return;
    }
    if (this.typing && AK[e.code] != null) {
      e.preventDefault();
      const meta = (e.shiftKey ? 1 : 0) | (e.altKey ? 2 : 0) | (e.ctrlKey ? 4096 : 0);
      this.send(`key>${down ? 0 : 1},${AK[e.code]},${e.repeat ? 1 : 0},${meta}`);
    }
  }
  back() { this.send("keycode>4"); }
  restartGame() { this.send("game>restart"); }

  async stop(notify = false, reason = "") {
    if (this.stopping) return; this.stopping = true; this.stopped = true;
    cancelAnimationFrame(this._rid);
    removeEventListener("keydown", this._kd); if (this._rzKeys) removeEventListener("resize", this._rzKeys); if (this._plc) document.removeEventListener("pointerlockchange", this._plc); try { if (document.pointerLockElement) document.exitPointerLock(); } catch {} if (this._unmute) for (const t of ["pointerdown", "keydown", "touchstart", "click"]) removeEventListener(t, this._unmute, true); removeEventListener("keyup", this._ku);
    try { this.sock && this.sock.close(); } catch {}
    try { this.dc && (this.dc.onclose = null, this.dc.close()); } catch {}
    try { this.pc && this.pc.close(); } catch {}
    try { this.video && (this.video.srcObject = null); } catch {}
    try { await this.api("/phone/disconnect", { method: "POST", body: { android_id: this.androidId, game_name: this.game } }); } catch {}
    this.onEnd && this.onEnd(notify ? reason : "");
  }
}
