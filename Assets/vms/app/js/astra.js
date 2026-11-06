import { AstraRelay, BnPlayer, SgPlayer, probeTransport } from "./astra-streams.js";
import { StreamFooter, SESSION_MS, parseDeadline, clockSkew } from "./footer.js";

export const ASTRA_ORIGIN = "https://astra-education.top";

export async function sha256hex(text) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function makeSearcher() {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  const w = new Uint32Array(64);
  const out = new Int32Array(8);

  function digest(m, len) {
    const total = (((len + 8) >> 6) + 1) << 6;
    m[len] = 128;
    m.fill(0, len + 1, total);
    const bits = len * 8;
    m[total - 4] = bits >>> 24;
    m[total - 3] = (bits >>> 16) & 255;
    m[total - 2] = (bits >>> 8) & 255;
    m[total - 1] = bits & 255;
    let a0 = 0x6a09e667, b0 = 0xbb67ae85, c0 = 0x3c6ef372, d0 = 0xa54ff53a, e0 = 0x510e527f, f0 = 0x9b05688c, g0 = 0x1f83d9ab, h0 = 0x5be0cd19;
    for (let o = 0; o < total; o += 64) {
      for (let i = 0; i < 16; i++) {
        const p = o + (i << 2);
        w[i] = (m[p] << 24) | (m[p + 1] << 16) | (m[p + 2] << 8) | m[p + 3];
      }
      for (let i = 16; i < 64; i++) {
        const x = w[i - 15], y = w[i - 2];
        const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      let a = a0, b = b0, c = c0, d = d0, e = e0, f = f0, g = g0, h = h0;
      for (let i = 0; i < 64; i++) {
        const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
        const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        const mj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      a0 = (a0 + a) | 0; b0 = (b0 + b) | 0; c0 = (c0 + c) | 0; d0 = (d0 + d) | 0;
      e0 = (e0 + e) | 0; f0 = (f0 + f) | 0; g0 = (g0 + g) | 0; h0 = (h0 + h) | 0;
    }
    out[0] = a0; out[1] = b0; out[2] = c0; out[3] = d0; out[4] = e0; out[5] = f0; out[6] = g0; out[7] = h0;
  }

  return function searchRange(challenge, salt, start, end) {
    if (!/^[0-9a-f]{64}$/.test(challenge) || !/^[\x20-\x7e]*$/.test(salt)) return null;
    const target = new Int32Array(8);
    for (let i = 0; i < 8; i++) target[i] = parseInt(challenge.slice(i * 8, i * 8 + 8), 16) | 0;
    const len = salt.length;
    const buf = new Uint8Array((((len + 24) >> 6) * 64) + 64);
    for (let i = 0; i < len; i++) buf[i] = salt.charCodeAt(i);
    for (let n = Math.max(0, start); n <= end; n++) {
      const s = String(n);
      for (let i = 0; i < s.length; i++) buf[len + i] = s.charCodeAt(i);
      digest(buf, len + s.length);
      if (out[0] === target[0] && out[1] === target[1] && out[2] === target[2] && out[3] === target[3] && out[4] === target[4] && out[5] === target[5] && out[6] === target[6] && out[7] === target[7]) return n;
    }
    return null;
  };
}

export const searchRange = makeSearcher();

const WORKER_SOURCE = `const search=(${makeSearcher.toString()})();self.onmessage=(e)=>{const d=e.data;let n=null;try{n=search(d.challenge,d.salt,d.start,d.end)}catch(_){}self.postMessage({number:n})};`;

const searchable = (q) => /^[0-9a-f]{64}$/.test(q.challenge) && /^[\x20-\x7e]*$/.test(q.salt);

function workerCount() {
  const n = (typeof navigator !== "undefined" && navigator.hardwareConcurrency) || 4;
  return Math.max(1, Math.min(8, n - 1));
}

function solveWithWorkers(q, timeout = 240000) {
  return new Promise((ok, no) => {
    const count = workerCount();
    const span = Math.ceil((q.maxnumber + 1) / count);
    const workers = [];
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
    let pending = count, done = false;
    const timer = setTimeout(() => finish(no, new Error("quiz worker timed out")), timeout);
    function finish(fn, value) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      workers.forEach((w) => { try { w.terminate(); } catch {} });
      URL.revokeObjectURL(url);
      fn(value);
    }
    try {
      for (let i = 0; i < count; i++) {
        const w = new Worker(url);
        workers.push(w);
        w.onmessage = (e) => {
          if (typeof e.data?.number === "number") finish(ok, e.data.number);
          else if (--pending === 0) finish(ok, null);
        };
        w.onerror = (e) => { e.preventDefault?.(); finish(no, new Error("quiz worker failed")); };
        const start = i * span;
        w.postMessage({ challenge: q.challenge, salt: q.salt, start, end: Math.min(q.maxnumber, start + span - 1) });
      }
    } catch (e) {
      finish(no, e);
    }
  });
}

async function solveInline(q, chunk = 50000) {
  for (let start = 0; start <= q.maxnumber; start += chunk) {
    const n = searchRange(q.challenge, q.salt, start, Math.min(q.maxnumber, start + chunk - 1));
    if (n !== null) return n;
    await new Promise((r) => setTimeout(r, 0));
  }
  return null;
}

export async function solveQuiz(q, digest = sha256hex, chunk = 2000) {
  if (q.algorithm && !/^sha-?256$/i.test(q.algorithm)) throw new Error("unsupported quiz algorithm");
  if (searchable(q)) {
    if (typeof Worker !== "undefined") {
      try { return await solveWithWorkers(q); } catch {}
    }
    return solveInline(q);
  }
  for (let start = 0; start <= q.maxnumber; start += chunk) {
    const end = Math.min(q.maxnumber, start + chunk - 1);
    const jobs = [];
    for (let n = start; n <= end; n++) jobs.push(digest(q.salt + n));
    const i = (await Promise.all(jobs)).indexOf(q.challenge);
    if (i >= 0) return start + i;
    await new Promise((r) => setTimeout(r, 0));
  }
  return null;
}

export function quizPayload(q, number) {
  return btoa(JSON.stringify({ algorithm: q.algorithm, challenge: q.challenge, number, salt: q.salt, signature: q.signature }));
}

export function parseSetCookie(header) {
  const out = {};
  if (!header) return out;
  const parts = Array.isArray(header) ? header : String(header).split(/,(?=\s*[^;,=\s]+=)/);
  for (const p of parts) {
    const m = /^\s*([^=;\s]+)=([^;]*)/.exec(p);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

export function statusText(d) {
  if (d.statusText && String(d.statusText).trim()) return String(d.statusText);
  if (typeof d.queuePosition === "number") return `Queue position: ${d.queuePosition}`;
  if (d.status === "ready") return "Ready. Entering stream…";
  if (d.status === "launching") return "Preparing stream";
  return "Waiting in queue…";
}

export const WIRE = { MOUSE: 41, MOVE: 0, L_DOWN: 1, L_UP: 2, M_DOWN: 3, M_UP: 4, R_DOWN: 5, R_UP: 6, WHEEL: 11, KEY_DOWN: 101, KEY_UP: 102, TEXT: 103, RANGE: 32767 };
export function frame(type, ints) {
  const buf = new ArrayBuffer(4 + 4 * ints.length), v = new Int32Array(buf);
  v[0] = type;
  ints.forEach((n, i) => { v[i + 1] = n; });
  return buf;
}
export function keyFrame(kind, keyCode, mods = 0) {
  const buf = new ArrayBuffer(4), a = new Uint8Array(buf);
  a[0] = kind; a[1] = 1; a[2] = keyCode; a[3] = mods;
  return buf;
}
export function textFrame(ch) {
  const buf = new ArrayBuffer(6), a = new Uint8Array(buf), u = new Uint8Array(new Uint16Array([ch.codePointAt(0) ?? 0]).buffer);
  a[0] = WIRE.TEXT; a[4] = u[0]; a[5] = u[1];
  return buf;
}

export const hasTurn = (servers) => Array.isArray(servers) && servers.some((s) => (Array.isArray(s.urls) ? s.urls : [s.urls]).some((u) => /^turns?:/i.test(String(u))));
const STUN = [{ urls: "stun:stun.l.google.com:19302" }];

export function rtcConfig(l) {
  if (l.relayVia === "edge" && hasTurn(l.edgeServers)) return { iceServers: l.edgeServers, iceTransportPolicy: "relay" };
  if (hasTurn(l.iceServers) && (l.preferRelay ?? true)) return { iceServers: l.iceServers, iceTransportPolicy: "relay" };
  if (l.iceServers && l.iceServers.length) return { iceServers: l.iceServers };
  return { iceServers: hasTurn(l.edgeServers) ? [...STUN, ...l.edgeServers] : STUN };
}

export class AstraClient {
  constructor(fetchAstra) {
    this.fetchAstra = fetchAstra;
    this.cookies = {};
    this.skew = 0; // server clock - our clock (ms); only non-zero when the clocks are clearly apart
  }

  async req(path, init = {}) {
    const headers = { ...(init.headers || {}) };
    const jar = Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join("; ");
    if (jar) headers.Cookie = jar;
    const res = await this.fetchAstra(ASTRA_ORIGIN + path, { cache: "no-store", ...init, headers });
    try { Object.assign(this.cookies, parseSetCookie(res.headers.get("set-cookie"))); } catch {}
    try { this.skew = clockSkew(res.headers.get("date")); } catch {}
    return res;
  }

  async json(path, init) {
    const res = await this.req(path, init);
    const data = await res.json().catch(() => null);
    return { res, data };
  }

  post(path, body) {
    return this.json(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }

  async quiz() {
    const { res, data } = await this.json("/api/cg/quiz");
    if (!res.ok || !data?.ok) throw new Error("Launch check unavailable.");
    if (!data.quiz) return null;
    const n = await solveQuiz(data.quiz);
    if (n === null) throw new Error("Launch check failed.");
    return quizPayload(data.quiz, n);
  }

  async getJson(path) {
    const res = await this.req(path);
    if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
    return res.json();
  }

  async launch(gameId, onQuizDone = () => {}) {
    let tz; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch {}
    const attempt = async () => {
      const q = await this.quiz().catch(() => null);
      onQuizDone();
      return this.post("/api/cg/launch", { gameId, ...(tz ? { tz } : {}), ...(q ? { quiz: q } : {}) });
    };
    let { res, data } = await attempt();
    if (res.status === 403 && data?.code === "QUIZ_FAILED") ({ res, data } = await attempt());
    if (!res.ok || !data?.ok) throw new Error(data?.error || "Launch failed");
    return data;
  }

  async status(sessionId) {
    const res = await this.req(`/api/cg/status?sessionId=${encodeURIComponent(sessionId)}`);
    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const data = isJson ? await res.json().catch(() => null) : null;
    if (!data) return { ok: true, sessionId, status: "pending", ready: false };
    if (!res.ok || !data.ok) {
      const err = new Error(data.error || "Status failed");
      err.reported = true;
      throw err;
    }
    return data;
  }

  async waitReady(sessionId, { onStatus = () => {}, alive = () => {}, timeout = 300000, interval = 2000 } = {}) {
    const deadline = Date.now() + timeout;
    let misses = 0;
    for (;;) {
      await new Promise((r) => setTimeout(r, interval));
      alive();
      let d;
      try {
        d = await this.status(sessionId);
        misses = 0;
      } catch (e) {
        if (e.reported || ++misses > 3) throw e;
        continue;
      }
      alive();
      if (d.error) throw new Error(d.error);
      onStatus(statusText(d));
      if (d.ready) return d;
      if (Date.now() > deadline) throw new Error("Timed out waiting for the game to start.");
    }
  }

  stop(sessionId) {
    return this.post("/api/cg/stop", { sessionId }).catch(() => {});
  }
}

export class AstraPlayer {
  constructor({ client, launch, video, onStatus = () => {}, onEnded = () => {}, onError = () => {} }) {
    Object.assign(this, { client, launch, video, onStatus, onEnded, onError });
    this.sessionId = launch.sessionId;
    this.pc = null; this.control = null; this.typing = false; this.disposed = false;
    this.timers = []; this.undo = [];
  }

  on(target, type, fn, opts) { target.addEventListener(type, fn, opts); this.undo.push(() => target.removeEventListener(type, fn, opts)); }
  get ready() { return this.control?.readyState === "open"; }
  send(data) { if (!this.ready) return false; try { this.control.send(data); return true; } catch { return false; } }

  async start() {
    const l = this.launch;
    if (!l.offerSdp) throw new Error("This game uses a stream type we don't support yet.");
    const pc = (this.pc = new RTCPeerConnection(rtcConfig(l)));
    const media = new MediaStream();
    pc.addEventListener("track", (e) => { if (e.track) media.addTrack(e.track); if (this.video.srcObject !== media) this.video.srcObject = media; });
    pc.addEventListener("datachannel", (e) => {
      const ch = e.channel;
      if (ch.label === "fileUpload" || ch.label === "fileDownload") return;
      this.control = ch;
      ch.onmessage = (m) => typeof m.data === "string" && this.onControl(m.data);
    });
    pc.addEventListener("connectionstatechange", () => {
      if (!this.disposed && pc.connectionState === "failed") this.onError(new Error(this.sawFrames ? "The stream connection dropped." : "That session expired before the stream opened. Launch again."));
    });

    this.onStatus("Negotiating stream…");
    await pc.setRemoteDescription({ type: "offer", sdp: l.offerSdp });
    for (const c of l.iceCandidates || []) { try { await pc.addIceCandidate(c); } catch {} }
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await this.gathered(4000);
    this.onStatus("Starting playback…");
    const { res, data } = await this.client.post("/api/cg/ng/answer", { sessionId: this.sessionId, answerSdp: pc.localDescription?.sdp || answer.sdp });
    if (!res.ok || !data?.ok) throw new Error(data?.error || "Could not complete the handshake.");

    this.watchFirstFrame();
    this.heartbeat();
    this.attachInput();
  }

  gathered(ms) {
    const pc = this.pc;
    if (pc.iceGatheringState === "complete") return Promise.resolve();
    return new Promise((done) => {
      const fin = () => { pc.removeEventListener("icegatheringstatechange", chk); clearTimeout(t); done(); };
      const chk = () => pc.iceGatheringState === "complete" && fin();
      pc.addEventListener("icegatheringstatechange", chk);
      const t = setTimeout(fin, ms);
    });
  }

  watchFirstFrame() {
    const v = this.video;
    const seen = () => {
      this.sawFrames = true;
      this.timers.push(setTimeout(() => !this.disposed && this.client.post("/api/cg/ng/report", { sessionId: this.sessionId, alive: true }).catch(() => {}), 25000));
    };
    if (typeof v.requestVideoFrameCallback === "function") v.requestVideoFrameCallback(seen);
    else this.on(v, "playing", seen, { once: true });
  }

  heartbeat() {
    this.timers.push(setInterval(async () => {
      if (this.disposed) return;
      try {
        const { data } = await this.client.post("/api/cg/school/report", { sessionId: this.sessionId });
        if (!this.disposed && data?.stop) this.onEnded("ended by host");
      } catch {}
    }, 12000));
  }

  onControl(text) {
    const f = {};
    for (const part of text.split(":::")) { const i = part.indexOf("="); if (i > 0) f[part.slice(0, i)] = part.slice(i + 1); }
    if (f.msgType === "keyboardStatus") this.typing = String(f.enabled) === "true";
    else if (f.msgType === "sessionComplete") {
      this.client.post("/api/cg/ng/report", { sessionId: this.sessionId, reason: f.reason || "Unknown" }).catch(() => {});
      this.onEnded(f.reason || "Unknown");
    }
  }

  coords(e) {
    const v = this.video, r = v.getBoundingClientRect();
    const w = v.videoWidth || r.width, h = v.videoHeight || r.height;
    const s = Math.min(r.width / w, r.height / h), ox = (r.width - w * s) / 2, oy = (r.height - h * s) / 2;
    const x = (e.clientX - r.left - ox) / s, y = (e.clientY - r.top - oy) / s;
    const clamp = (n, m) => Math.max(0, Math.min(m, n));
    return { x: Math.round(clamp(x, w) / w * WIRE.RANGE), y: Math.round(clamp(y, h) / h * WIRE.RANGE), inside: x >= 0 && y >= 0 && x <= w && y <= h };
  }

  mouse(kind, c, wheel = 0) { this.send(frame(WIRE.MOUSE, [kind, c.x, c.y, wheel])); }

  attachInput() {
    const el = this.video, DOWN = [WIRE.L_DOWN, WIRE.M_DOWN, WIRE.R_DOWN], UP = [WIRE.L_UP, WIRE.M_UP, WIRE.R_UP];
    const prevTouch = el.style.touchAction; el.style.touchAction = "none";
    this.undo.push(() => { el.style.touchAction = prevTouch; });
    this.on(el, "contextmenu", (e) => e.preventDefault());
    this.on(el, "pointerdown", (e) => {
      if (!this.ready) return;
      const c = this.coords(e); if (!c.inside) return;
      e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch {}
      this.mouse(WIRE.MOVE, c); this.mouse(DOWN[e.button] ?? WIRE.L_DOWN, c);
    });
    this.on(el, "pointerup", (e) => {
      if (!this.ready) return;
      e.preventDefault(); this.mouse(UP[e.button] ?? WIRE.L_UP, this.coords(e));
      try { el.releasePointerCapture(e.pointerId); } catch {}
    });
    let pending = null;
    this.on(el, "pointermove", (e) => {
      if (!this.ready) return;
      const c = this.coords(e); if (!c.inside) return;
      const queued = pending; pending = c;
      if (!queued) requestAnimationFrame(() => { const p = pending; pending = null; if (p && this.ready) this.mouse(WIRE.MOVE, p); });
    });
    let acc = 0;
    this.on(el, "wheel", (e) => {
      if (!this.ready) return;
      const c = this.coords(e); if (!c.inside) return;
      e.preventDefault();
      acc += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 800 : e.deltaY;
      let n = Math.max(-3, Math.min(3, Math.trunc(acc / 100)));
      if (!n) return;
      acc -= n * 100;
      for (let i = 0; i < Math.abs(n); i++) this.mouse(WIRE.WHEEL, c, n > 0 ? -1 : 1);
    }, { passive: false });
    const key = (down) => (e) => {
      if (!this.ready || e.metaKey || (e.ctrlKey && !this.typing)) return;
      if (!e.key || e.key === "Unidentified" || e.isComposing || (e.which ?? e.keyCode) === 229) return;
      e.preventDefault();
      if (e.key.length > 1 || !this.typing) this.send(keyFrame(down ? WIRE.KEY_DOWN : WIRE.KEY_UP, e.which ?? e.keyCode, (e.shiftKey ? 1 : 0) | (e.altKey ? 2 : 0)));
      else if (down) this.send(textFrame(e.key));
    };
    this.on(window, "keydown", key(true));
    this.on(window, "keyup", key(false));
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
    this.undo.forEach((f) => { try { f(); } catch {} });
    try { this.pc?.close(); } catch {}
    this.video.srcObject = null;
  }
}

const WS_URL = ASTRA_ORIGIN.replace(/^http/, "ws") + "/live-lesson";
const STEP_TOTAL = 8;

export class AstraSessions {
  constructor({ fetchAstra, webSocket, show, loader, doc = document, notify = console.warn }) {
    this.client = new AstraClient(fetchAstra);
    Object.assign(this, { webSocket, show, loader, doc, notify });
    this.video = doc.getElementById("astra-video");
    this.token = 0;
    this.onClosed = null; // (reason) => void, set by the host bridge
    this.footer = new StreamFooter(doc.getElementById("screen-astra"), { doc, onExit: () => this.leave() });
    doc.defaultView?.addEventListener("beforeunload", () => this.sessionId && navigator.sendBeacon?.(ASTRA_ORIGIN + "/api/cg/stop", new Blob([JSON.stringify({ sessionId: this.sessionId })], { type: "application/json" })));
  }

  async play(game, { deeplink = false } = {}) {
    if (this.busy && deeplink) {
      // Replacing a running launch: leave() already cancelled it, give it a moment to unwind.
      for (let i = 0; i < 100 && this.busy; i++) await new Promise((r) => setTimeout(r, 50));
    }
    if (this.busy) return;
    this.busy = true;
    const token = ++this.token;
    const alive = () => { if (token !== this.token) throw new Error("cancelled"); };
    const step = (i, text) => this.loader.step(i, STEP_TOTAL, text);
    this.loader.show("Starting " + game.name, { cancel: deeplink ? null : () => this.leave() }); // launched from a host page: no Cancel button
    this.show("screen-astra");
    this.footer.reset({ title: game.name });
    try {
      step(1, "Running launch check");
      const launch = await this.client.launch(game.id, () => step(2, "Launching " + game.name));
      alive();
      const sid = (this.sessionId = launch.sessionId ?? launch.apiSessionId);
      if (!sid) throw new Error("Launch returned no session.");

      step(3, "Preparing your session");
      await this.client.waitReady(sid, { onStatus: (t) => this.loader.text(t), alive });
      alive();

      step(4, "Connecting to relay");
      const relay = (this.relay = new AstraRelay(await this.webSocket()));
      const jar = Object.entries(this.client.cookies).map(([k, v]) => `${k}=${v}`).join("; ");
      await relay.connect(WS_URL, jar ? { Cookie: jar } : undefined);
      alive();
      const result = relay.waitLaunchResult();
      result.catch(() => {});
      let cf;
      if (launch.game?.provider === "secondary") { step(4, "Checking your connection"); cf = await probeTransport(); alive(); }
      relay.attach(sid, cf);

      step(5, "Waiting for a server");
      const K = await result;
      alive();
      if (K.transport === "unavailable") throw new Error("No server available right now. Try again shortly.");

      step(6, "Negotiating stream");
      const common = { onStatus: (t) => this.loader.text(t), onEnded: (why) => { this.notify("Session ended: " + why); this.leave("ended"); } };
      if (K.provider === "tertiary") throw new Error("This game uses a stream type we don't support yet.");
      if (K.provider === "quaternary" && K.ng) {
        relay.close();
        this.startTimer(parseDeadline(K.ng.edgeEndsAt), true);
        this.player = new AstraPlayer({ client: this.client, launch: { ...K.ng, sessionId: sid }, video: this.video, ...common, onError: (e) => { this.notify(e.message); this.leave("error"); } });
        await this.player.start();
      } else if (K.provider === "secondary") {
        this.video.muted = true;
        this.startTimer(Date.now() + SESSION_MS);
        this.player = new SgPlayer({ relay, video: this.video, iceServers: K.iceServers ?? [], iceTransportPolicy: K.iceTransportPolicy, onLive: () => { this.video.muted = false; }, onEnded: common.onEnded });
        await this.player.start();
        step(7, "Starting playback");
        await this.video.play().catch(() => {});
      } else {
        this.startTimer(null);
        this.player = new BnPlayer({ client: this.client, relay, video: this.video, relativeMouse: K.stream?.inputDevice === "relative", ...common });
        await this.player.start();
      }
      alive();
      step(7, "Starting playback");
      await new Promise((ok) => { if (!this.video.paused && this.video.readyState >= 3) return ok(); this.video.addEventListener("playing", () => ok(), { once: true }); setTimeout(ok, 15000); });
      alive();
      step(8, "Ready");
      this.footer.watchVideo(this.video);
      this.video.play?.().catch(() => {});
      this.loader.hide();
    } catch (e) {
      if (e.message !== "cancelled") { console.error("[astra]", e); this.notify(e.message || "Couldn't start that game."); await this.leave("error"); }
    } finally {
      this.busy = false;
    }
  }

  /** Counts down to `deadline` (epoch ms) when the stream has one, otherwise shows elapsed session time. */
  startTimer(deadline, fromServer = false) {
    // A server-supplied end time is corrected for clock offset; our own start + 30 min is already on our clock.
    if (deadline) this.footer.startCountdown(deadline, fromServer ? this.client.skew : 0);
    else this.footer.startElapsed();
  }

  async leave(reason = "exit") {
    this.token++;
    this.footer.reset();
    this.player?.dispose(); this.player = null;
    try { this.relay?.close(); } catch {} this.relay = null;
    const id = this.sessionId; this.sessionId = null;
    this.loader.hide();
    this.show("screen-select");
    this.onClosed?.(reason);
    if (id) await this.client.stop(id);
  }
}
