// Launches an OnWorks VM from our own UI by speaking the same endpoints their launch page uses:
//   community/user.php   -> server name ("onworksNN")
//   runos/create-os.php  -> guest account ("guestNN") and boots the VM
//   /osessionxNN/        -> Apache Guacamole: POST api/tokens, GET connection tree, websocket-tunnel
// The remote screen is drawn with guacamole-common-js into an element on OUR page (no iframes, no their pages/CSS).
import { smartFetch, proxyFetch } from "./net.js";

const B = "https://www.onworks.net";
let libP;
const loadGuac = () => (libP ||= new Promise((res, rej) => {
  if (window.Guacamole && window.Guacamole.Client) return res();
  const s = document.createElement("script");
  s.src = new URL("../vendor/guacamole-common.js", import.meta.url).href;
  s.onload = res; s.onerror = () => rej(new Error("Couldn’t load the Guacamole client")); document.head.append(s);
}));

const text = async (r) => (await r.text()).trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (o) => Object.entries(o).map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");

function identity() {
  let u = null;
  try { u = localStorage.getItem("svm.user"); } catch {}
  if (!u) { u = String(Math.floor(Date.now() / 1000)); try { localStorage.setItem("svm.user", u); } catch {} }
  return u;
}

async function retry(label, fn, n = 3, say = () => {}) {
  let err;
  for (let i = 0; i < n; i++) {
    try { return await fn(); } catch (e) { err = e; say(`${label} failed, retrying (${i + 1}/${n})…`); await sleep(2500); }
  }
  throw new Error(`${label}: ${err && err.message || err}`);
}

/** Boot the VM `os` (an OnWorks slug, e.g. ubuntu-22.04.3-desktop-amd64) and attach it to `el`. */
export async function launch(os, { el, say = () => {}, onState = () => {}, app = "null", progress = () => {}, cancelled = () => false } = {}) {
  const chk = () => { if (cancelled()) throw new Error("Cancelled"); };
  await loadGuac(); progress(0.05);
  const G = window.Guacamole, user = identity();

  say("Finding a server…");
  const svc = await retry("Server lookup", async () => {
    const t = await text(await smartFetch(`${B}/community/user.php?${q({ username: user })}`));
    if (!/^onworks\d+$/.test(t)) throw new Error("unexpected reply: " + t.slice(0, 40));
    return t;
  }, 3, say);
  chk(); progress(0.2);

  say("Starting " + os + " (this can take a little while)…");
  const guest = await retry("Starting VM", async () => {
    const t = await text(await smartFetch(`${B}/runos/create-os.php?v=1&service=${svc}&username=${user}&app=${encodeURIComponent(app)}&os=${encodeURIComponent(os)}`));
    if (!/^guest\d+$/.test(t)) throw new Error("unexpected reply: " + t.slice(0, 40));
    return t;
  }, 3, say);
  chk(); progress(0.6);

  const n = svc.replace("onworks", ""), g = guest.replace("guest", "");
  const base = `${B}/osessionx${n}`, wsBase = base.replace(/^http/, "ws");
  const ping = () => {
    for (const u of [`${B}/community/user.php?${q({ username: user, service: svc })}`, `${B}/runos/security.php?${q({ username: user, service: svc })}`])
      fetch(u, { mode: "no-cors" }).catch(() => {});
  };
  ping();

  say("Signing in to the session…");
  const tok = await retry("Session login", async () => {
    const r = await proxyFetch(`${base}/api/tokens`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: q({ username: guest, password: "server01" + g }) }, { say });
    if (r.status !== 200) throw new Error("HTTP " + r.status);
    return r.json();
  }, 4, say);
  chk(); progress(0.75);
  const ds = tok.dataSource || "default";

  const tree = await (await proxyFetch(`${base}/api/session/data/${ds}/connectionGroups/ROOT/tree?${q({ token: tok.authToken })}`, {}, { say })).json();
  const find = (nd) => (nd.childConnections && nd.childConnections[0]) || (nd.childConnectionGroups || []).map(find).find(Boolean);
  const conn = find(tree);
  if (!conn) throw new Error("The server returned no connection for this VM");

  chk(); progress(0.9); say("Connecting…");
  const w = Math.max(320, el.clientWidth), h = Math.max(240, el.clientHeight);
  const data = [q({ token: tok.authToken, GUAC_DATA_SOURCE: ds, GUAC_ID: conn.identifier, GUAC_TYPE: "c", GUAC_WIDTH: w, GUAC_HEIGHT: h, GUAC_DPI: 96 }),
    ...(G.AudioPlayer && G.AudioPlayer.getSupportedTypes ? G.AudioPlayer.getSupportedTypes() : ["audio/L8", "audio/L16"]).map((t) => "GUAC_AUDIO=" + encodeURIComponent(t)),
    "GUAC_IMAGE=image%2Fjpeg&GUAC_IMAGE=image%2Fpng&GUAC_IMAGE=image%2Fwebp"].join("&");

  const tunnel = new G.WebSocketTunnel(`${wsBase}/websocket-tunnel`);
  const client = new G.Client(tunnel);
  const display = client.getDisplay(), disp = display.getElement();
  el.replaceChildren(disp);
  disp.style.cssText = "position:absolute;left:50%;top:50%;transform-origin:0 0";

  const fit = () => {
    const dw = display.getWidth(), dh = display.getHeight(); if (!dw || !dh) return;
    const s = Math.min(el.clientWidth / dw, el.clientHeight / dh);
    display.scale(s); disp.style.marginLeft = -(dw * s) / 2 + "px"; disp.style.marginTop = -(dh * s) / 2 + "px"; disp.style.left = "50%"; disp.style.top = "50%";
  };
  display.onresize = fit; window.addEventListener("resize", fit);

  let live = true;
  const send = (s) => { const k = display.getScale() || 1; client.sendMouseState(new G.Mouse.State(s.x / k, s.y / k, s.left, s.middle, s.right, s.up, s.down)); };
  const mouse = new G.Mouse(disp); mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = send;
  const touch = new G.Mouse.Touchscreen(disp); touch.onmousedown = touch.onmouseup = touch.onmousemove = send;
  const kb = new G.Keyboard(document);
  kb.onkeydown = (k) => { if (live) { client.sendKeyEvent(1, k); return false; } };
  kb.onkeyup = (k) => { if (live) client.sendKeyEvent(0, k); };
  client.onclipboard = (stream, mime) => {
    if (!/^text\//.test(mime)) return; const rd = new G.StringReader(stream); let t = "";
    rd.ontext = (c) => { t += c; }; rd.onend = () => navigator.clipboard && navigator.clipboard.writeText(t).catch(() => {});
  };

  const timer = setInterval(ping, 30000);
  const names = ["Idle", "Connecting…", "Waiting for the VM…", "Connected", "Disconnecting…", "Disconnected"];
  client.onstatechange = (st) => { onState(st, names[st]); if (st === 3) { say(""); fit(); } if (st === 5) cleanup(); };
  client.onerror = (e) => { say("Session error: " + (e && e.message || "connection lost")); onState(5, "Error"); };
  tunnel.onerror = (e) => say("Tunnel error: " + (e && e.message || "connection lost"));

  function cleanup() {
    live = false; clearInterval(timer); window.removeEventListener("resize", fit);
    kb.onkeydown = kb.onkeyup = null;
  }
  client.connect(data);
  const unlock = () => { const f = G.AudioContextFactory, c = f && f.getAudioContext && f.getAudioContext(); if (c && c.state === "suspended") c.resume().catch(() => {}); };
  unlock(); el.addEventListener("pointerdown", unlock);

  const key = (...ks) => { ks.forEach((k) => client.sendKeyEvent(1, k)); ks.reverse().forEach((k) => client.sendKeyEvent(0, k)); };
  return {
    client, guest, server: svc,
    stop() { cleanup(); try { client.disconnect(); } catch {} el.replaceChildren(); },
    ctrlAltDel() { key(0xffe3, 0xffe9, 0xffff); },
    paste(t) { const s = client.createClipboardStream("text/plain"), w = new G.StringWriter(s); w.sendText(t); w.sendEnd(); },
    focus(on) { live = on; },
    // Browsers keep audio suspended until a user gesture; calling this from a click/tap (re)starts it.
    sound(on) {
      const f = G.AudioContextFactory, ctx = f && f.getAudioContext && f.getAudioContext();
      if (!ctx) return null; (on ? ctx.resume() : ctx.suspend()).catch(() => {}); return on;
    },
  };
}
