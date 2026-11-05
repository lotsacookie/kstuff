// GeForce NOW streaming client: CloudMatch session -> nvst signaling -> WebRTC -> input channel.
// Protocol details taken from ref/play.geforcenow.com (vendor bundle). Untested against live servers.

const PROD_HOST = "https://prod.cloudmatchbeta.nvidiagrid.net";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));

// ---------- input packet encoders (pure; see Ll class in ref) ----------
function putTs(dv, off, tsMs) {
  const us = Math.floor(tsMs * 1000);
  dv.setUint32(off, Math.floor(us / 4294967296), false);
  dv.setUint32(off + 4, us >>> 0, false);
}
export function encKey(down, vk, mods, scan, tsMs) {
  const dv = new DataView(new ArrayBuffer(18));
  dv.setUint32(0, down ? 3 : 4, true);
  dv.setUint16(4, vk, false);
  dv.setUint16(6, mods, false);
  dv.setUint16(8, scan, false);
  putTs(dv, 10, tsMs);
  return dv.buffer;
}
export function encMouseMove(dx, dy, tsMs) {
  const dv = new DataView(new ArrayBuffer(22));
  dv.setUint32(0, 7, true);
  dv.setInt16(4, dx, false);
  dv.setInt16(6, dy, false);
  dv.setUint16(8, 0, false);
  dv.setUint32(10, 0);
  putTs(dv, 14, tsMs);
  return dv.buffer;
}
export function encMouseButton(down, btn, tsMs) {
  const dv = new DataView(new ArrayBuffer(18));
  dv.setUint32(0, down ? 8 : 9, true);
  dv.setUint8(4, btn);
  dv.setUint8(5, 0);
  dv.setUint32(6, 0);
  putTs(dv, 10, tsMs);
  return dv.buffer;
}
export function encWheel(delta, tsMs) {
  const dv = new DataView(new ArrayBuffer(22));
  dv.setUint32(0, 10, true);
  dv.setUint16(4, 0, false);
  dv.setInt16(6, Math.max(-32768, Math.min(32767, -delta)), false);
  dv.setUint16(8, 0, false);
  dv.setUint32(10, 0);
  putTs(dv, 14, tsMs);
  return dv.buffer;
}
export function encGamepad(slot, bitmap, buttons, lt, rt, lx, ly, rx, ry, tsMs) {
  const dv = new DataView(new ArrayBuffer(38));
  dv.setUint32(0, 12, true);
  dv.setUint16(4, 26, true);
  dv.setUint16(6, slot, true);
  dv.setUint16(8, bitmap, true);
  dv.setUint16(10, 20, true);
  dv.setUint16(12, buttons, true);
  dv.setUint16(14, ((rt & 255) << 8) | (lt & 255), true);
  dv.setInt16(16, lx, true);
  dv.setInt16(18, ly, true);
  dv.setInt16(20, rx, true);
  dv.setInt16(22, ry, true);
  dv.setUint16(24, 0, true);
  dv.setUint16(26, 85, true);
  dv.setUint16(28, 0, true);
  const us = Math.floor(tsMs * 1000);
  dv.setUint32(30, us >>> 0, true);
  dv.setUint32(34, Math.floor(us / 4294967296), true);
  return dv.buffer;
}
const PAD_BTN = [0x1000, 0x2000, 0x4000, 0x8000, 0x100, 0x200, 0, 0, 0x20, 0x10, 0x40, 0x80, 0x1, 0x2, 0x4, 0x8, 0x400];
export function padState(gp, dead = 0.12) {
  let b = 0;
  for (let i = 0; i < PAD_BTN.length; i++) if (PAD_BTN[i] && gp.buttons[i] && gp.buttons[i].pressed) b |= PAD_BTN[i];
  const trig = (i) => { const x = gp.buttons[i]; const v = x ? (x.value > 0 ? x.value : x.pressed ? 1 : 0) : 0; return Math.max(0, Math.min(255, Math.round(v * 255))); };
  const ax = (i, inv) => {
    let v = gp.axes[i] || 0;
    if (Math.abs(v) < dead) return 0;
    v = Math.sign(v) * (Math.abs(v) - dead) / (1 - dead);
    return Math.max(-32768, Math.min(32767, Math.round((inv ? -v : v) * 32767)));
  };
  return { buttons: b, lt: trig(6), rt: trig(7), lx: ax(0, false), ly: ax(1, true), rx: ax(2, false), ry: ax(3, true) };
}
// protocol version > 2 wraps each event: 0x23, u64 BE timestamp, 0x22, payload
export function wrapV3(payload, tsMs) {
  const p = new Uint8Array(payload), out = new Uint8Array(10 + p.length), dv = new DataView(out.buffer);
  out[0] = 0x23;
  putTs(dv, 1, tsMs);
  out[9] = 0x22;
  out.set(p, 10);
  return out.buffer;
}

// ---------- SDP helpers ----------
export function parseTurn(info, policy) {
  const iceServers = [];
  for (const part of String(info || "").split("|")) {
    const [urls, username, credential] = part.split(",").map((x) => x && x.trim());
    if (urls && username && credential) iceServers.push({ urls, username, credential });
  }
  return { iceServers, iceTransportPolicy: parseInt(policy) === 1 ? "relay" : "all" };
}
const attr = (sdp, k) => { const m = sdp.match(new RegExp("^a=" + k.replace(/\./g, "\\.") + ":(.*)$", "m")); return m ? m[1].trim() : ""; };
export function buildNvstSdp(serverNvst, answerSdp, o) {
  const text = (serverNvst || "").replace(/\r?\n/g, "\r\n");
  const cut = text.indexOf("\r\nm=");
  let head = cut < 0 ? text : text.slice(0, cut + 2);
  let rest = cut < 0 ? "" : text.slice(cut + 2);
  const set = (k, v) => {
    const re = new RegExp("^a=" + k.replace(/\./g, "\\.") + ":.*$", "m");
    if (re.test(rest)) rest = rest.replace(re, "a=" + k + ":" + v);
  };
  set("video.clientViewportWd", o.width);
  set("video.clientViewportHt", o.height);
  set("video.maxFPS", o.fps);
  const setHead = (k, v) => {
    const re = new RegExp("^a=" + k.replace(/\./g, "\\.") + ":.*\\r\\n", "m");
    head = head.replace(re, "");
    head += "a=" + k + ":" + v + "\r\n";
  };
  setHead("general.clientSupportsIntraRefresh", "1");
  setHead("general.clientCapture", "0");
  setHead("general.icePassword", attr(answerSdp, "ice-pwd"));
  setHead("general.iceUserNameFragment", attr(answerSdp, "ice-ufrag"));
  const fp = attr(answerSdp, "fingerprint");
  setHead("general.dtlsFingerprint", fp.includes(" ") ? fp.split(" ")[1] : fp);
  return head + rest;
}

export function planSessions(list, appId) {
  const alive = (list || []).filter((x) => x && x.sessionId && x.status !== 6 && x.status !== 7);
  const idOf = (x) => String(x.appId != null ? x.appId : x.sessionRequestData && x.sessionRequestData.appId);
  const same = alive.find((x) => idOf(x) === String(appId)) || null;
  return { same, others: alive.filter((x) => x !== same) };
}

// ---------- main entry ----------
export async function startStream(o) {
  const { appId, vpcId, headers, http, getLibcurl, log, status, video, deviceId } = o;
  const width = o.width || 1920, height = o.height || 1080, fps = o.fps || 60;
  let stopped = false, ready = false, ws = null, pc = null, sessionId = null, base = null;
  const cleanups = [];

  const hdr = (extra) => ({ ...headers(), "x-device-id": deviceId, "Content-Type": "application/json", ...(extra || {}) });
  const call = async (method, path, body) => {
    let lastErr;
    const zoneHost = `https://${String(vpcId).toLowerCase()}.cloudmatchbeta.nvidiagrid.net`;
    for (const b of base ? [base] : o.strict ? [zoneHost] : [zoneHost, PROD_HOST]) {
      try {
        const r = await http(b + path, { method, headers: hdr(), body: body ? JSON.stringify(body) : undefined, follow: false });
        let j = {};
        try { j = JSON.parse(r.text); } catch {}
        if (r.status === 0 || r.status >= 500 && !j.requestStatus) { lastErr = new Error("HTTP " + r.status); continue; }
        base = b;
        return { status: r.status, json: j, text: r.text };
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error("CloudMatch unreachable");
  };

  async function stop(opts) {
    if (stopped) return;
    const keep = !!(opts && opts.keep && ready);
    stopped = true;
    try { o.stopAd && o.stopAd(); } catch {}
    cleanups.forEach((f) => { try { f(); } catch {} });
    try { ws && ws.close(); } catch {}
    try { pc && pc.close(); } catch {}
    try { if (document.pointerLockElement) document.exitPointerLock(); } catch {}
    video.srcObject = null;
    if (keep) log("[stream] left the session running");
    else if (sessionId && base) {
      try { await http(base + "/v2/session/" + sessionId, { method: "DELETE", headers: hdr(), follow: false }); log("[stream] session deleted"); } catch (e) { log("[stream] delete failed", e.message); }
    }
  }

  try { o.registerStop && o.registerStop(stop); } catch {}
  try {
    // 1. create session
    status("Requesting a gaming rig…");
    const sub = uuid();
    const req = {
      sessionRequestData: {
        appId: /^\d+$/.test(String(appId)) ? Number(appId) : String(appId),
        internalTitle: null, availableSupportedControllers: [], networkTestSessionId: null, parentSessionId: null,
        clientIdentification: "GFN-PC", deviceHashId: deviceId, clientVersion: "30.0", sdkVersion: "1.0", streamerVersion: 1,
        clientPlatformName: "browser", audioMode: 2, remoteControllersBitmap: 0, sdrHdrMode: 0, surroundAudioInfo: 0,
        clientRequestMonitorSettings: [{ widthInPixels: width, heightInPixels: height, framesPerSecond: fps, sdrHdrMode: 0, dpi: 0 }],
        metaData: [{ key: "SubSessionId", value: sub }, { key: "wssignaling", value: "1" }, { key: "GSStreamerType", value: "WebRTC" }, { key: "networkType", value: "Unknown" }, { key: "ClientImeSupport", value: "0" }],
        clientTimezoneOffset: -new Date().getTimezoneOffset() * 60000, appLaunchMode: 1, enhancedStreamMode: 1, useOps: true,
        clientDisplayHdrCapabilities: null, accountLinked: true, partnerCustomData: "", enablePersistingInGameSettings: true,
        secureRTSPSupported: false, userAge: 26,
        requestedStreamingFeatures: { reflex: false, bitDepth: 0, cloudGsync: false, enabledL4S: false, profile: 0, fallbackToLogicalResolution: false, chromaFormat: 0, prefilterMode: 0, prefilterSharpness: 0, prefilterNoiseReduction: 0, hudStreamingMode: 0 },
      },
    };
    let c;
    try {
      const a = await call("GET", "/v2/session");
      const { same, others } = planSessions(a.json.sessions || a.json.activeSessions, appId);
      const endOne = async (x) => {
        const host = (x.sessionControlInfo && x.sessionControlInfo.ip) || new URL(base).host;
        try { const d = await http("https://" + host + "/v2/session/" + x.sessionId, { method: "DELETE", headers: hdr(), follow: false }); log("[stream] ended other session", x.sessionId, d.status); }
        catch (e) { log("[stream] couldn't end other session", x.sessionId, e.message || e); }
      };
      if (others.length) { status("Ending your old session…"); for (const x of others) await endOne(x); await sleep(2500); }
      if (same) {
        status("Reconnecting to your game…");
        const body = { action: 2, data: "RESUME", sessionRequestData: req.sessionRequestData, metaData: [] };
        const r = await call("PUT", "/v2/session/" + same.sessionId + "?keyboardLayout=en-US&languageCode=en_US", body);
        log("[stream] resume", r.status, r.text.slice(0, 500));
        const rq = r.json.requestStatus || {};
        if (r.json.session && (!rq.statusCode || rq.statusCode === 1)) c = r;
      }
    } catch (e) { log("[stream] resume check failed", e.message || e); }
    for (let attempt = 0; attempt < 2 && !c; attempt++) {
      c = await call("POST", "/v2/session?keyboardLayout=en-US&languageCode=en_US", req);
      log("[stream] create", c.status, c.text.slice(0, attempt ? 600 : 1500));
      const r0 = c.json.requestStatus || {};
      if (attempt === 0 && (r0.statusCode === 11 || /SESSION_LIMIT/.test(r0.statusDescription || ""))) {
        status("Ending your old session…");
        let old = (c.json.otherUserSessions || []).map((x) => ({ host: x.sessionControlInfo && x.sessionControlInfo.ip, id: x.sessionId }));
        if (!old.length) {
          const a = await call("GET", "/v2/session");
          old = (a.json.sessions || a.json.activeSessions || []).map((x) => ({ host: x.sessionControlInfo && x.sessionControlInfo.ip, id: x.sessionId }));
        }
        for (const x of old) {
          if (!x.id) continue;
          const url = "https://" + (x.host || new URL(base).host) + "/v2/session/" + x.id;
          try { const d = await http(url, { method: "DELETE", headers: hdr(), follow: false }); log("[stream] ended old session", x.id, d.status); }
          catch (e) { log("[stream] couldn't end old session", x.id, e.message || e); }
        }
        await sleep(3000);
        continue;
      }
      break;
    }
    const rs = c.json.requestStatus || {};
    if (!c.json.session || (rs.statusCode && rs.statusCode !== 1)) throw new Error("GeForce NOW refused the session: " + (rs.statusDescription || c.status) + (rs.unifiedErrorCode ? " (" + rs.unifiedErrorCode + ")" : ""));
    sessionId = c.json.session.sessionId;

    // 2. poll until ready
    let sess = c.json.session, lastSig = "", t0 = Date.now();
    const adDone = new Set(); let adBusy = false;
    // AdAction: 1 start, 2 pause, 3 resume, 4 finish, 5 cancel, 6 state change (from the web client bundle)
    const adReport = async (adId, adAction, extra) => {
      try {
        const r = await call("PUT", "/v2/session/" + sessionId, { action: 6, adUpdates: [{ adId, adAction, clientTimestamp: Math.round(Date.now() / 1000), ...(extra || {}) }] });
        log("[ads] report", adAction, r.status, r.text.slice(0, 160));
      } catch (e) { log("[ads] report failed", e.message || e); }
    };
    const runAd = async (ad) => {
      adDone.add(ad.adId);
      let watched = 0, startedAt = 0;
      await new Promise((resolve) => {
        const ev = (name, d) => {
          if (name === "start") { startedAt = Date.now(); adReport(ad.adId, 1); }
          else if (name === "pause") { watched += Date.now() - startedAt; adReport(ad.adId, 2, { watchedTimeInMs: watched }); }
          else if (name === "resume") { startedAt = Date.now(); adReport(ad.adId, 3, { watchedTimeInMs: watched }); }
          else if (name === "finish") { watched += startedAt ? Date.now() - startedAt : 0; adReport(ad.adId, 4, { watchedTimeInMs: watched }).then(resolve); }
          else if (name === "error") { adReport(ad.adId, 5, { cancelReason: (d && d.reason) || "AD_PLAYBACK_ERROR", watchedTimeInMs: watched }).then(resolve); }
        };
        try { o.playAd(ad, ev); } catch (e) { ev("error", { reason: String(e.message || e) }); }
      });
    };
    for (let i = 0; i < 400 && !stopped; i++) {
      if (sess.sessionAdsRequired && Array.isArray(sess.sessionAds) && o.playAd && !adBusy) {
        const ad = sess.sessionAds.find((a) => a && a.adState !== 5 && a.adState !== 6 && !adDone.has(a.adId));
        if (ad) { adBusy = true; log("[ads] playing", ad.adId, ad.adLengthInSeconds + "s"); runAd(ad).finally(() => { adBusy = false; }); }
      } else if (sess.sessionAdsRequired && !adBusy && i % 10 === 0) log("[ads] required but none listed yet");
      const q = sess.seatSetupInfo && sess.seatSetupInfo.queuePosition;
      if (sess.status === 2 || sess.status === 3) break;
      if (sess.status === 6 || sess.status === 7) throw new Error("Session ended while starting (status " + sess.status + ")");
      const sig = sess.status + "/" + JSON.stringify(sess.seatSetupInfo || {});
      if (sig !== lastSig) { lastSig = sig; log("[stream] poll status", sess.status, "seat", JSON.stringify(sess.seatSetupInfo || {}), "errorCode", sess.errorCode); }
      if (!adBusy) status(q > 0 ? "In queue — position " + q : "Setting up your rig… (" + Math.round((Date.now() - t0) / 1000) + "s)");
      await sleep(sess.sessionAdsRequired ? 3000 : 2000);
      const p = await call("GET", "/v2/session/" + sessionId);
      const rq = p.json.requestStatus || {};
      if (p.json.session) sess = p.json.session;
      else log("[stream] poll", p.status, p.text.slice(0, 400));
      if (rq.statusCode && rq.statusCode !== 1) throw new Error("GeForce NOW: " + (rq.statusDescription || rq.statusCode) + (rq.unifiedErrorCode ? " (" + rq.unifiedErrorCode + ")" : ""));
    }
    if (stopped) return { stop };
    if (sess.status !== 2 && sess.status !== 3) throw new Error("Timed out waiting for a rig");
    ready = true;
    log("[stream] ready", JSON.stringify({ ctl: sess.sessionControlInfo, conn: sess.connectionInfo }).slice(0, 600));

    // 3. signaling endpoint
    const ci = (sess.connectionInfo || []).find((x) => x.usage === 14) || (sess.connectionInfo || []).find((x) => x.usage === 2) || {};
    let address = ci.ip || ci.hostName;
    if (!address || address[0] === ".") address = sess.sessionControlInfo && sess.sessionControlInfo.ip;
    const port = ci.port || 443;
    let rp = ci.resourcePath || "/nvst/";
    if (rp[0] !== "/") rp = "/" + rp;
    const peerName = "peer-" + String(Math.floor(Math.random() * 1e9)).padEnd(10, "0");
    const url = "wss://" + address + ":" + port + rp.replace(/\/$/, "") + "/sign_in?peer_id=" + peerName + "&version=3.0&peer_role=1&pairing_id=" + sessionId;
    status("Connecting to your rig…");
    log("[stream] signaling", url);

    const libcurl = await getLibcurl();
    ws = new libcurl.WebSocket(url, ["x-nv-sessionid." + sessionId]);
    let myId = 2, ack = 0, serverId = 1, answered = false;
    const send = (obj) => { try { ws.send(JSON.stringify(obj)); } catch (e) { log("[stream] ws send", e.message); } };
    const peerSend = (to, msg) => send({ peer_msg: { from: myId, to, msg: JSON.stringify(msg) }, ackid: ++ack });

    // input channel state
    let inputCh = null, inputVer = 0, inputReady = false;
    const pushInput = (buf, ts) => {
      if (!inputReady || !inputCh || inputCh.readyState !== "open") return;
      inputCh.send(inputVer > 2 ? wrapV3(buf, ts) : buf);
    };
    const wireInput = () => {
      const kmods = (e) => (e.shiftKey ? 1 : 0) | (e.ctrlKey ? 2 : 0) | (e.altKey ? 4 : 0) | (e.metaKey ? 8 : 0);
      const on = (t, tgt, f, opt) => { tgt.addEventListener(t, f, opt); cleanups.push(() => tgt.removeEventListener(t, f, opt)); };
      const locked = () => document.pointerLockElement === video;
      // keys go to the game whenever the player owns the screen (menu / settings closed): pointer lock is only needed for the mouse
      const open = () => (o.inputOpen ? o.inputOpen() : true);
      const pressed = new Map();
      const releaseAll = () => { const t = performance.now(); for (const kc of pressed.values()) pushInput(encKey(false, kc, 0, 0, t), t); pressed.clear(); };
      on("click", video, () => { if (open() && !locked()) { try { const r = video.requestPointerLock && video.requestPointerLock(); r && r.catch && r.catch(() => {}); } catch {} } video.muted = false; video.play().catch(() => {}); });
      on("mousemove", document, (e) => { if (locked() && open() && (e.movementX || e.movementY)) pushInput(encMouseMove(e.movementX | 0, e.movementY | 0, e.timeStamp), e.timeStamp); });
      on("mousedown", document, (e) => { if (locked() && open()) { pushInput(encMouseButton(true, e.button + 1, e.timeStamp), e.timeStamp); e.preventDefault(); } });
      on("mouseup", document, (e) => { if (locked() && open()) { pushInput(encMouseButton(false, e.button + 1, e.timeStamp), e.timeStamp); e.preventDefault(); } });
      on("wheel", document, (e) => { if (locked() && open()) { pushInput(encWheel(e.deltaY, e.timeStamp), e.timeStamp); e.preventDefault(); } }, { passive: false });
      on("contextmenu", video, (e) => e.preventDefault());
      const key = (down) => (e) => {
        if (!open()) { if (!down) pressed.delete(e.code); return; }
        if (down) pressed.set(e.code, e.keyCode); else pressed.delete(e.code);
        pushInput(encKey(down, e.keyCode, kmods(e), 0, e.timeStamp), e.timeStamp);
        e.preventDefault();
      };
      on("keydown", window, key(true), true);
      on("keyup", window, key(false), true);
      const slots = new Map(), sent = new Map();
      const zero = { buttons: 0, lt: 0, rt: 0, lx: 0, ly: 0, rx: 0, ry: 0 };
      const mask = () => { let m = 0; for (const sl of slots.values()) m |= (1 << sl) | (1 << (sl + 8)); return m; };
      const sendPad = (sl, st, force) => {
        const k = st.buttons + "," + st.lt + "," + st.rt + "," + st.lx + "," + st.ly + "," + st.rx + "," + st.ry + "," + mask();
        const now = performance.now(), prev = sent.get(sl);
        if (!force && prev && prev.k === k && now - prev.t < 1000) return;
        sent.set(sl, { k, t: now });
        pushInput(encGamepad(sl, mask(), st.buttons, st.lt, st.rt, st.lx, st.ly, st.rx, st.ry, now), now);
      };
      const pollPads = () => {
        let pads = [];
        try { pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch {}
        const seen = new Set();
        for (const gp of pads) {
          if (!gp || !gp.connected) continue;
          seen.add(gp.index);
          if (!slots.has(gp.index)) { let sl = 0; const used = new Set(slots.values()); while (used.has(sl)) sl++; if (sl > 3) continue; slots.set(gp.index, sl); sent.delete(sl); }
          sendPad(slots.get(gp.index), open() ? padState(gp) : zero);
        }
        for (const [gi, sl] of [...slots]) if (!seen.has(gi)) { slots.delete(gi); sendPad(sl, zero, true); sent.delete(sl); }
      };
      const padTimer = setInterval(pollPads, 8);
      cleanups.push(() => clearInterval(padTimer));
      on("gamepadconnected", window, () => { try { video.muted = false; } catch {} });
      on("blur", window, releaseAll);
      on("pointerlockchange", document, () => { if (!locked()) { releaseAll(); } });
    };

    const onOffer = async (from, m) => {
      serverId = from || 1;
      const turn = attr(m.nvstSdp || "", "general.turnInfo");
      const cfg = parseTurn(turn, attr(m.nvstSdp || "", "general.iceTransportPolicy"));
      if (!cfg.iceServers.length) cfg.iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
      log("[stream] offer received; ice servers", cfg.iceServers.length, cfg.iceTransportPolicy);
      pc = new RTCPeerConnection(cfg);
      pc.ontrack = (ev) => {
        try { if (ev.receiver && "playoutDelayHint" in ev.receiver) ev.receiver.playoutDelayHint = 0; } catch {}
        const ms = video.srcObject instanceof MediaStream ? video.srcObject : new MediaStream();
        ms.addTrack(ev.track);
        if (video.srcObject !== ms) video.srcObject = ms;
        video.muted = true;
        video.play().catch(() => {});
        log("[stream] track", ev.track.kind);
      };
      pc.onicecandidate = (ev) => { if (ev.candidate) peerSend(serverId, { candidate: ev.candidate.candidate, sdpMLineIndex: ev.candidate.sdpMLineIndex, sdpMid: ev.candidate.sdpMid }); };
      pc.oniceconnectionstatechange = () => {
        log("[stream] ice", pc.iceConnectionState);
        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") status("");
        if (pc.iceConnectionState === "failed") status("Connection failed (ICE). See the debug log.");
      };
      inputCh = pc.createDataChannel("input_channel_v1", { ordered: true });
      inputCh.binaryType = "arraybuffer";
      inputCh.onopen = () => log("[stream] input channel open");
      inputCh.onmessage = (ev) => {
        const dv = new DataView(ev.data);
        if (!inputVer) {
          const first = dv.getUint16(0, true);
          inputVer = first === 526 ? dv.getUint16(2, true) : first;
          log("[stream] input handshake, version", inputVer);
          try { inputCh.send(ev.data); } catch {}
          inputReady = true;
        }
      };
      wireInput();
      await pc.setRemoteDescription({ type: "offer", sdp: m.sdp });
      const ans = await pc.createAnswer();
      await pc.setLocalDescription(ans);
      const nvst = buildNvstSdp(m.nvstSdp, ans.sdp, { width, height, fps });
      peerSend(serverId, { type: "answer", sdp: ans.sdp, nvstSdp: nvst });
      answered = true;
      log("[stream] answer sent");
    };
    const pendingCands = [];
    const onCandidate = async (m) => {
      const cand = String(m.candidate || "").replace(/^a=/, "");
      if (!cand) return;
      const ic = { candidate: cand, sdpMid: m.sdpMid, sdpMLineIndex: m.sdpMLineIndex };
      if (pc && pc.remoteDescription) { try { await pc.addIceCandidate(ic); } catch (e) { log("[stream] addIceCandidate", e.message); } } else pendingCands.push(ic);
    };

    await new Promise((resolve, reject) => {
      const to = setTimeout(() => reject(new Error("Signaling timed out")), 20000);
      ws.onopen = () => {
        clearTimeout(to);
        log("[stream] signaling open");
        send({ peer_info: { browser: "Chrome", browserVersion: "131", connected: true, id: myId, name: peerName, peerRole: 0, resolution: width + "x" + height, version: "2.0.0" }, ackid: ++ack });
        resolve();
      };
      ws.onerror = (e) => { clearTimeout(to); reject(new Error("Signaling connection failed")); };
    });
    ws.onclose = (e) => { log("[stream] signaling closed", e && e.code); };
    ws.onmessage = async (ev) => {
      let m;
      try { m = JSON.parse(typeof ev.data === "string" ? ev.data : new TextDecoder().decode(ev.data)); } catch { return; }
      if (m.hb) { send({ hb: 1 }); return; }
      if (m.ackid) send({ ack: m.ackid });
      if (m.peer_info) { if (m.peer_info.name === peerName) myId = m.peer_info.id; return; }
      if (m.error) { log("[stream] signaling error", m.error); if (m.error === "peerRemoved") status("The rig disconnected."); return; }
      if (m.peer_msg) {
        let body;
        try { body = JSON.parse(m.peer_msg.msg); } catch { return; }
        if (body.type === "offer" || (body.sdp && body.type !== "answer")) {
          try {
            await onOffer(m.peer_msg.from, body);
            for (const ic of pendingCands.splice(0)) await pc.addIceCandidate(ic).catch(() => {});
          } catch (e) { log("[stream] offer failed", e.message); status("Streaming setup failed: " + e.message); }
        } else if (body.candidate !== undefined) await onCandidate(body);
      }
    };
    status("Waiting for the stream…");
  } catch (e) {
    log("[stream] failed", e.message || e);
    await stop();
    throw e;
  }
  return { stop };
}
