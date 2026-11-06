/**
 * Astra stream types beyond the plain WebRTC offer:
 *   relay (/live-lesson WebSocket) .... AstraRelay + NegoRpc
 *   primary (default) ................. BnPlayer  (relay-negotiated WebRTC, JSON input over the relay)
 *   secondary ......................... SgPlayer  (relay "sig" messages, binary input over the JYSDK data channel)
 * The quaternary (NG) type lives in astra.js (AstraPlayer). The tertiary SDK type isn't supported.
 * No DOM access at import time (unit-tested in scripts/astra.test.mjs).
 */

/* --------------------------------- relay --------------------------------- */

export class AstraRelay {
  /** @param {new (url: string, protocols?: string[], options?: object) => WebSocket} WS the proxied WebSocket constructor */
  constructor(WS) {
    this.WS = WS; this.ws = null;
    this.launchResolve = null; this.launchReject = null;
    this.onNego = null; this.onSig = null; this.sigBuffer = [];
    this.inputReady = false; this.inputFailed = null; this.waiters = [];
    this.onClose = null;
  }

  connect(url, headers) {
    return new Promise((ok, no) => {
      let ws;
      try { ws = new this.WS(url, [], headers ? { headers } : {}); } catch { ws = new this.WS(url); }
      this.ws = ws;
      try { ws.binaryType = "arraybuffer"; } catch {}
      ws.onopen = () => ok();
      ws.onerror = () => no(new Error("Stream relay socket failed"));
      ws.onclose = () => this.onClose?.();
      ws.onmessage = (m) => this.message(m.data);
    });
  }

  message(data) {
    if (typeof data !== "string") return;
    let m; try { m = JSON.parse(data); } catch { return; }
    switch (m.t) {
      case "launchReady": {
        this.inputReady = false; this.inputFailed = null; this.failWaiters("new launch");
        const r = this.launchResolve; this.launchResolve = this.launchReject = null; r?.(m.session);
        break;
      }
      case "launchErr": { const r = this.launchReject; this.launchResolve = this.launchReject = null; r?.(new Error(String(m.error ?? "Launch failed"))); break; }
      case "inputRelayErr": this.inputFailed = String(m.error ?? "input relay failed"); this.failWaiters(this.inputFailed); break;
      case "inputRelayReady": this.inputReady = true; this.waiters.splice(0).forEach((w) => { clearTimeout(w.tid); w.ok(); }); break;
      case "negoIn": this.onNego?.(String(m.raw)); break;
      case "sig": if (this.onSig) this.onSig(m.msg); else this.sigBuffer.push(m.msg); break;
    }
  }

  failWaiters(msg) { this.waiters.splice(0).forEach((w) => { clearTimeout(w.tid); w.no(new Error(msg)); }); }
  json(o) { this.ws?.send(JSON.stringify(o)); }
  waitLaunchResult() { return new Promise((ok, no) => { this.launchResolve = ok; this.launchReject = no; }); }
  attach(apiSessionId, cfTurn) { this.json({ t: "attach", apiSessionId, ...(typeof cfTurn === "boolean" ? { cfTurn } : {}) }); }
  sendNegoOut(raw) { this.json({ t: "negoOut", raw }); }
  setNegoHandler(fn) { this.onNego = fn; }
  setSigHandler(fn) { this.onSig = fn; const b = this.sigBuffer.splice(0); b.forEach((m) => fn(m)); }
  sendSig(msg) { this.json({ t: "sig", raw: JSON.stringify(msg) }); }
  openServerInputRelay() { this.json({ t: "openInputRelay" }); }
  /** Input text goes to the host as a binary frame: 0x01 + utf8. */
  sendInputOut(text) {
    if (!this.ws || this.ws.readyState !== 1) return;
    const b = new TextEncoder().encode(text), out = new Uint8Array(b.length + 1);
    out[0] = 1; out.set(b, 1);
    this.ws.send(out);
  }
  waitInputRelayReady(ms = 55000) {
    if (this.inputReady) return Promise.resolve();
    if (this.inputFailed) return Promise.reject(new Error(this.inputFailed));
    return new Promise((ok, no) => {
      const w = { ok, no, tid: setTimeout(() => { this.waiters = this.waiters.filter((x) => x !== w); no(new Error("inputRelayReady timeout")); }, ms) };
      this.waiters.push(w);
    });
  }
  close() { try { this.ws?.close(); } catch {} this.ws = null; }
}

/** JSON-RPC over the relay's nego channel (getConfig / getIceServers / call / callAck / addIceCandidate). */
export class NegoRpc {
  constructor(relay) {
    this.relay = relay; this.id = 0; this.q = new Map(); this.onPush = null;
    relay.setNegoHandler((raw) => this.ingest(raw));
  }
  ingest(raw) {
    let t; try { t = JSON.parse(raw); } catch { return; }
    if (t.cmd_id !== undefined && this.q.has(t.cmd_id)) { const cb = this.q.get(t.cmd_id); this.q.delete(t.cmd_id); cb(t.json_data); return; }
    if (t?.method) this.onPush?.(t);
  }
  post(method, data) {
    return new Promise((ok, no) => {
      const id = ++this.id;
      this.q.set(id, (r) => (r && typeof r === "object" && r.error && typeof r.error.message === "string" ? no(new Error(r.error.message)) : ok(r)));
      this.relay.sendNegoOut(JSON.stringify({ cmd_id: id, method, json_data: data }));
    });
  }
  fire(method, data) { const id = ++this.id; this.q.set(id, () => {}); this.relay.sendNegoOut(JSON.stringify({ cmd_id: id, method, json_data: data })); }
  async connect() {
    const cfg = await this.post("getConfig", { "user-agent": typeof navigator !== "undefined" ? navigator.userAgent : "" });
    return { cfg, iceServers: iceList(await this.post("getIceServers", null)) };
  }
}
export function iceList(x) { return Array.isArray(x) ? x : x && Array.isArray(x.iceServers) ? x.iceServers : []; }

/* ------------------------- relay-negotiated stream (primary) ------------------------- */

/** Wire format of the host's JSON input messages. */
export const bnJson = (device, json, payload) => JSON.stringify(payload !== undefined ? { device, json_data: json, payload } : { device, json_data: json });
export const bnMouseMove = (x, y) => bnJson("mouse", `xref:${x}|yref:${y};`);
export const bnMouseRel = (x, y) => bnJson("mouse", `xpos:${x}|ypos:${y};`);
export const bnClick = (button, down) => bnJson("mouse", `M${button}|${down ? 0 : 1};`);
export const bnWheel = (dir) => bnJson("mouse", `MW|${dir};`);
export const bnButton = (domButton) => (domButton === 1 ? 3 : domButton === 2 ? 2 : domButton + 1);
/** e: {key, code}; wire: code->hex map; sdl: code->scancode map. Null when the key has no wire code. */
export function bnKey(e, press, wire, sdl) {
  const single = typeof e.key === "string" && e.key.length === 1;
  const hex = single ? e.key.toLowerCase().charCodeAt(0).toString(16) : wire?.[e.code];
  if (!hex) return null;
  const ev = { sc: sdl?.[e.code] !== undefined ? sdl[e.code] : sdl?.Unidentified ?? 0 };
  if (single) ev.pr = e.key.charCodeAt(0).toString(16).padStart(4, "0");
  return bnJson("keyboard", `${hex.length === 1 ? "0" + hex : hex}|${press ? 0 : 1};`, { event: ev });
}

/** Letterbox-aware picture rect and the scale from client pixels to stream pixels. */
export function pictureRect(rect, vw, vh) {
  const a = vw / vh, b = rect.width / rect.height;
  let { left, top, width, height } = rect;
  if (a > b) { height = (rect.width * vh) / vw; top = rect.top + (rect.height - height) / 2; }
  else if (a < b) { width = (rect.height * vw) / vh; left = rect.left + (rect.width - width) / 2; }
  return { left, top, width, height };
}

const waitPlaying = (v, ms) => new Promise((done) => {
  if (!v.paused && v.readyState >= 3) return done();
  const t = setTimeout(done, ms);
  v.addEventListener("playing", () => { clearTimeout(t); done(); }, { once: true });
});
function preferH264(tr) {
  try {
    const caps = RTCRtpReceiver.getCapabilities?.("video"); if (!caps?.codecs?.length || !tr.setCodecPreferences) return;
    const h = (c) => /h264/i.test(c.mimeType); if (!caps.codecs.some(h)) return;
    tr.setCodecPreferences([...caps.codecs.filter(h), ...caps.codecs.filter((c) => !h(c))]);
  } catch {}
}

export class BnPlayer {
  constructor({ client, relay, video, relativeMouse = false, onStatus = () => {}, onEnded = () => {} }) {
    Object.assign(this, { client, relay, video, relativeMouse, onStatus, onEnded });
    this.pc = null; this.disposed = false; this.undo = []; this.timers = []; this.down = new Set();
  }
  on(t, type, fn, o) { t.addEventListener(type, fn, o); this.undo.push(() => t.removeEventListener(type, fn, o)); }
  send(text) { this.relay.sendInputOut(text); }

  async start() {
    const rpc = new NegoRpc(this.relay);
    let pc = null;
    rpc.onPush = (x) => {
      if (!pc) return;
      if (x.method === "addIceCandidate") {
        const b = x.json_data?.body;
        if (!b) { pc.addIceCandidate(null).catch(() => {}); return; }
        pc.addIceCandidate({ candidate: b.candidate, sdpMLineIndex: b.sdpMLineIndex ?? 0, sdpMid: b.sdpMid ?? null, usernameFragment: b.usernameFragment }).catch(() => {});
      }
      if (x.method === "hangup") { try { pc.close(); } catch {} this.onEnded("hangup"); }
    };
    this.onStatus("Connecting to relay…");
    const { iceServers } = await rpc.connect();
    pc = this.pc = new RTCPeerConnection({ iceServers, iceTransportPolicy: "all", bundlePolicy: "balanced", iceCandidatePoolSize: 2 });
    const peer = Math.floor(Math.random() * 1e5) + 1, media = new MediaStream();
    pc.addTransceiver("audio", { direction: "recvonly" });
    preferH264(pc.addTransceiver("video", { direction: "recvonly" }));
    pc.ontrack = (e) => { if (this.video.srcObject !== media) this.video.srcObject = media; if (!media.getTracks().some((t) => t.id === e.track.id)) media.addTrack(e.track); };
    pc.onicecandidate = (e) => { if (e.candidate) rpc.fire("addIceCandidate", { body: e.candidate.toJSON(), peerid: peer }); };
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await pc.setLocalDescription(offer);
    const answer = await rpc.post("call", { body: offer, peerid: peer });
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
    rpc.fire("callAck", { peerid: peer });

    this.onStatus("Starting playback…");
    this.video.muted = true;
    await this.video.play().catch(() => {});
    await waitPlaying(this.video, 120000);
    this.onStatus("Final touches…");
    this.relay.openServerInputRelay();
    try { await this.relay.waitInputRelayReady(120000); } catch { throw new Error("Input relay unavailable"); }
    this.video.muted = false;
    const [wire, sdl] = await Promise.all([this.client.getJson("/bn/keymap-wire-hex.json"), this.client.getJson("/bn/keymap-code-to-sdl-scancode.json")]);
    this.maps = { wire, sdl };
    this.attachInput();
    this.timers.push(setInterval(() => this.send("ping;"), 30000));
  }

  point(e) {
    const v = this.video, r = v.getBoundingClientRect(), vw = v.videoWidth || r.width, vh = v.videoHeight || r.height;
    const p = pictureRect(r, vw, vh);
    return { x: Math.ceil(((e.clientX - p.left) / p.width) * vw + 0.5), y: Math.ceil(((e.clientY - p.top) / p.height) * vh + 0.5), inside: e.clientX >= p.left && e.clientX <= p.left + p.width && e.clientY >= p.top && e.clientY <= p.top + p.height, vw, vh, p };
  }

  attachInput() {
    const v = this.video; let lastX = -1, lastY = -1;
    const locked = () => document.pointerLockElement === v;
    this.on(v, "contextmenu", (e) => e.preventDefault());
    this.on(v, "mousedown", (e) => { e.preventDefault(); if (this.relativeMouse && !locked() && e.button === 0) { v.requestPointerLock?.(); } this.send(bnClick(bnButton(e.button), true)); });
    this.on(window, "mouseup", (e) => this.send(bnClick(bnButton(e.button), false)));
    this.on(v, "wheel", (e) => { if (!e.deltaY) return; e.preventDefault(); this.send(bnWheel(e.deltaY > 0 ? 1 : 0)); }, { passive: false });
    this.on(document, "mousemove", (e) => {
      if (locked()) {
        const r = v.getBoundingClientRect(), s = (v.videoWidth || r.width) / r.width, sy = (v.videoHeight || r.height) / r.height;
        const dx = Math.sign(e.movementX) * Math.ceil(Math.abs(e.movementX * s)), dy = Math.sign(e.movementY) * Math.ceil(Math.abs(e.movementY * sy));
        if (dx || dy) this.send(bnMouseRel(dx, dy));
        return;
      }
      const c = this.point(e); if (!c.inside || (c.x === lastX && c.y === lastY)) return;
      lastX = c.x; lastY = c.y; this.send(bnMouseMove(c.x, c.y));
    }, true);
    const key = (press) => (e) => {
      e.preventDefault();
      if (press) { if (this.down.has(e.code)) return; this.down.add(e.code); } else this.down.delete(e.code);
      const m = bnKey(e, press, this.maps.wire, this.maps.sdl);
      if (m) this.send(m);
    };
    this.on(window, "keydown", key(true));
    this.on(window, "keyup", key(false));
  }

  dispose() {
    if (this.disposed) return; this.disposed = true;
    try { this.send("exit|0;"); } catch {}
    this.timers.forEach(clearInterval); this.undo.forEach((f) => { try { f(); } catch {} });
    try { this.pc?.close(); } catch {}
    try { this.relay.close(); } catch {}
    this.video.srcObject = null;
  }
}

/* ---------------------- relay "sig" stream (secondary) ---------------------- */

/** 24-byte keyboard frame (matches Astra's JYSDK input). */
export function sgKeyFrame(held, code, down) {
  down ? held.add(code) : held.delete(code);
  const buf = new ArrayBuffer(24), dv = new DataView(buf);
  dv.setUint8(0, 1); dv.setUint8(2, 1); dv.setUint8(3, 1); dv.setUint16(4, code); dv.setUint8(6, down ? 1 : 0);
  let i = 7;
  for (const k of held) if (k !== code && k > 0 && k < 255 && i < 21) { dv.setUint16(i, k); i += 2; dv.setUint8(i, 1); i++; }
  dv.setUint8(i++, 255); dv.setUint8(1, i - 1);
  return buf.slice(0, i);
}
/** 12-byte mouse frame: dx/dy relative, absolute position 0..10000, button mask, wheel. */
export function sgMouseFrame(dx, dy, ax, ay, buttons, wheel) {
  const cl = (n, a, b) => Math.max(a, Math.min(b, n));
  const buf = new ArrayBuffer(12), dv = new DataView(buf);
  dv.setUint8(0, 1); dv.setUint8(1, 11); dv.setUint8(2, 2); dv.setUint8(3, 8);
  dv.setUint16(4, cl(ax, 0, 1e4)); dv.setUint16(6, cl(ay, 0, 1e4));
  dv.setInt8(8, cl(dx, -127, 127)); dv.setInt8(9, cl(dy, -127, 127)); dv.setUint8(10, buttons); dv.setInt8(11, wheel);
  return buf;
}

export class SgPlayer {
  constructor({ relay, video, iceServers = [], iceTransportPolicy = "all", onLive = () => {}, onEnded = () => {} }) {
    Object.assign(this, { relay, video, iceServers, iceTransportPolicy, onLive, onEnded });
    this.pc = null; this.dc = null; this.disposed = false; this.undo = []; this.held = new Set();
    this.active = false; this.locked = false; this.cx = 0; this.cy = 0; this.vx = 0; this.vy = 0; this.buttons = 0; this.escTimer = null;
    this.ready = new Promise((ok, no) => { this.resolve = ok; this.reject = no; setTimeout(() => no(new Error("Stream connection timed out (240s)")), 240000); });
  }
  on(t, type, fn, o) { t.addEventListener(type, fn, o); this.undo.push(() => t.removeEventListener(type, fn, o)); }
  sendDc(d) { if (this.dc && this.dc.readyState === "open") this.dc.send(d); }
  rect() { const v = this.video, r = v.getBoundingClientRect(); return pictureRect(r, v.videoWidth || r.width, v.videoHeight || r.height); }
  mouse(dx = 0, dy = 0, wheel = 0) {
    const r = this.rect();
    this.sendDc(sgMouseFrame(dx, dy, Math.floor(((this.cx - r.left) / r.width) * 1e4), Math.floor(((this.cy - r.top) / r.height) * 1e4), this.buttons, wheel));
  }

  start() {
    this.relay.setSigHandler((m) => this.onSig(m));
    this.bindInput();
    return this.ready;
  }

  onSig(w) {
    if (!w || typeof w !== "object") return;
    switch (w.type) {
      case "config": if (Array.isArray(w.iceServers) && w.iceServers.length) this.iceServers = w.iceServers; if (w.iceTransportPolicy) this.iceTransportPolicy = w.iceTransportPolicy; break;
      case "game_ready": this.connectRtc(); break;
      case "rtc_answer": this.pc?.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: w.sdp.sdp })).catch(() => {}); break;
      case "rtc_candidate": { if (!this.pc || !w.candidate) break; this.pc.addIceCandidate(new RTCIceCandidate(typeof w.candidate === "string" ? { candidate: w.candidate } : w.candidate)).catch(() => {}); break; }
      case "ended": this.onEnded(w.reason || "ended"); this.reject(new Error(`Session ended (${w.reason || "ended"})`)); break;
    }
  }

  connectRtc() {
    if (this.pc) return;
    const pc = (this.pc = new RTCPeerConnection({ iceServers: this.iceServers, iceTransportPolicy: this.iceTransportPolicy, bundlePolicy: "max-bundle", rtcpMuxPolicy: "require", iceCandidatePoolSize: 0 }));
    pc.addTransceiver("audio", { direction: "recvonly" });
    pc.addTransceiver("video", { direction: "recvonly" });
    const dc = pc.createDataChannel("JYSDK", { id: 1, ordered: false, maxRetransmits: 0 });
    dc.binaryType = "arraybuffer";
    const adopt = (ch) => { this.dc = ch; ch.binaryType = "arraybuffer"; ch.onmessage = (m) => m.data instanceof ArrayBuffer && this.cursor(m.data); };
    dc.onopen = () => { this.dc = dc; }; dc.onmessage = (m) => m.data instanceof ArrayBuffer && this.cursor(m.data);
    pc.ondatachannel = (e) => { if (e.channel.label === "JYSDK") adopt(e.channel); };
    pc.ontrack = (e) => {
      if (!this.video.srcObject) this.video.srcObject = new MediaStream();
      this.video.srcObject.addTrack(e.track);
      if (e.track.kind === "video") this.waitVideo();
    };
    pc.onicecandidate = (e) => { if (e.candidate) this.relay.sendSig({ type: "rtc_candidate", candidate: e.candidate.toJSON() }); };
    pc.oniceconnectionstatechange = () => {
      const s = pc.iceConnectionState;
      if (s === "connected" || s === "completed") { this.video.play().catch(() => {}); this.onLive(); this.resolve(); }
      if (s === "failed") { try { this.relay.sendSig({ type: "client_end", reason: "ice_failed" }); } catch {} this.onEnded("ice_failed"); }
    };
    pc.createOffer().then((o) => pc.setLocalDescription(o).then(() => o)).then((o) => this.relay.sendSig({ type: "rtc_offer", sdp: o.sdp })).catch((e) => this.reject(e instanceof Error ? e : new Error(String(e))));
  }

  waitVideo() {
    if (this._wv) return; this._wv = true;
    const v = this.video, go = () => { if (this.disposed || v.videoWidth === 0) return void setTimeout(go, 250); this.onLive(); this.resolve(); };
    v.muted = true; v.play().catch(() => {});
    typeof v.requestVideoFrameCallback === "function" ? v.requestVideoFrameCallback(() => go()) : v.addEventListener("loadeddata", go, { once: true });
  }

  /** Cursor image frames from the host: [0xA3, 0x06, type, hotX, hotY, ...image]. */
  cursor(buf) {
    const d = new DataView(buf);
    if (d.byteLength > 4 && d.getUint8(0) === 163 && d.getUint8(1) === 6) {
      if (d.byteLength <= 32) { this.cursorHidden = true; if (this.img) this.img.style.display = "none"; return; }
      const types = { 0: "image/x-icon", 1: "image/jpeg", 2: "image/png", 3: "image/gif" };
      this.hot = [d.getUint8(3), d.getUint8(4)];
      if (this.url) URL.revokeObjectURL(this.url);
      this.url = URL.createObjectURL(new Blob([buf.slice(5)], { type: types[d.getUint8(2)] || "image/png" }));
      this.cursorHidden = false;
      if (this.locked) this.drawCursor();
    }
  }
  drawCursor() {
    if (this.cursorHidden || !this.url) return;
    if (!this.img) { this.img = document.createElement("img"); this.img.alt = ""; this.img.draggable = false; this.img.style.cssText = "position:fixed;left:0;top:0;pointer-events:none;z-index:2147483647;user-select:none;"; document.body.appendChild(this.img); }
    this.img.src = this.url; this.img.style.display = "block";
    this.img.style.transform = `translate(${Math.round(this.cx - this.hot[0])}px, ${Math.round(this.cy - this.hot[1])}px)`;
  }

  bindInput() {
    const v = this.video;
    this.on(document, "pointerlockchange", () => {
      this.locked = document.pointerLockElement === v;
      if (this.locked) { const r = this.rect(); this.vx = this.cx - r.left; this.vy = this.cy - r.top; this.drawCursor(); }
      else { if (this.img) this.img.style.display = "none"; navigator.keyboard?.unlock?.(); }
    });
    this.on(v, "click", () => { if (!this.dc) return; this.active = true; navigator.keyboard?.lock?.().catch(() => {}); if (!this.locked) v.requestPointerLock?.(); });
    this.on(document, "click", (e) => { if (this.active && !v.contains(e.target)) { this.active = false; navigator.keyboard?.unlock?.(); } });
    this.on(document, "mousemove", (e) => {
      if (this.active && this.dc) {
        const dx = e.movementX || 0, dy = e.movementY || 0;
        if (this.locked) { const r = this.rect(); this.vx = Math.max(0, Math.min(r.width, this.vx + dx)); this.vy = Math.max(0, Math.min(r.height, this.vy + dy)); this.cx = r.left + this.vx; this.cy = r.top + this.vy; this.drawCursor(); }
        else { this.cx = e.clientX; this.cy = e.clientY; }
        this.mouse(dx, dy);
      } else { this.cx = e.clientX; this.cy = e.clientY; }
    });
    const btn = (e) => { if (!this.active || !this.dc) return; this.buttons = e.buttons; this.mouse(); };
    this.on(document, "mousedown", btn); this.on(document, "mouseup", btn);
    this.on(document, "contextmenu", (e) => { if (this.active) e.preventDefault(); });
    this.on(v, "wheel", (e) => { if (!this.active) return; e.preventDefault(); this.mouse(0, 0, e.deltaY > 0 ? -1 : 1); }, { passive: false });
    this.on(document, "keydown", (e) => {
      if (!this.active || !this.dc) return; e.preventDefault(); e.stopPropagation();
      if (e.repeat) return;
      if (e.keyCode === 27 && !this.escTimer) this.escTimer = setTimeout(() => { if (document.pointerLockElement) document.exitPointerLock(); this.active = false; this.escTimer = null; }, 1200);
      this.sendDc(sgKeyFrame(this.held, e.keyCode, true));
    }, { capture: true });
    this.on(document, "keyup", (e) => {
      if (!this.active || !this.dc) return; e.preventDefault(); e.stopPropagation();
      if (e.keyCode === 27 && this.escTimer) { clearTimeout(this.escTimer); this.escTimer = null; }
      this.sendDc(sgKeyFrame(this.held, e.keyCode, false));
    }, { capture: true });
  }

  dispose() {
    if (this.disposed) return; this.disposed = true;
    try { this.relay.sendSig({ type: "client_end", reason: "stream_closed" }); } catch {}
    this.undo.forEach((f) => { try { f(); } catch {} });
    try { this.dc?.close(); } catch {} try { this.pc?.close(); } catch {}
    if (this.img) this.img.remove(); if (this.url) URL.revokeObjectURL(this.url);
    try { this.relay.close(); } catch {}
    this.video.srcObject = null;
  }
}

/** Does this network need Astra's fallback transport? (Port of their probe; true when no direct UDP candidate shows up.) */
export async function probeTransport(ms = 2500) {
  if (typeof RTCPeerConnection === "undefined") return false;
  let pc; try { pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }] }); } catch { return false; }
  return new Promise((done) => {
    let fin = false;
    const end = (v) => { if (fin) return; fin = true; clearTimeout(t); try { pc.close(); } catch {} done(v); };
    const t = setTimeout(() => end(true), ms);
    pc.onicecandidate = (e) => {
      const c = e.candidate?.candidate?.toLowerCase(); if (!c) return;
      if ((c.includes(" udp ") && c.includes("typ host")) || c.includes("typ srflx")) end(false);
    };
    pc.onicegatheringstatechange = () => pc.iceGatheringState === "complete" && end(true);
    try { pc.createDataChannel("probe"); pc.createOffer().then((o) => pc.setLocalDescription(o)).catch(() => end(false)); } catch { end(false); }
  });
}
