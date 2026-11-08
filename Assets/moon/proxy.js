const withTimeout = (p, ms, label) => { let t; return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(new Error(label + " timed out")), ms); })]).finally(() => clearTimeout(t)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const findHub = () => {
  for (const w of [window, window.parent, window.top]) {
    try { if (w && w.kNetDirect && typeof w.kNetDirect.fetch === "function") return w.kNetDirect; } catch {}
  }
  return null;
};
let ready = null, state = null, rotating = null;
function getProxy({ log = () => {}, say = () => {} } = {}) {
  return (ready ||= (async () => {
    say("Connecting to net hub…");
    let hub = findHub();
    const t0 = Date.now();
    while (!hub && Date.now() - t0 < 120000) { await sleep(100); hub = findHub(); }
    if (!hub) throw new Error("Net hub not available");
    let wisp = "", lc = null;
    const t1 = Date.now();
    while (!lc && Date.now() - t1 < 300000) {
      try {
        wisp = String(await withTimeout(hub.ready(), 20000, "net hub"));
        lc = await withTimeout(hub.libcurl(), 20000, "net hub libcurl");
      } catch (e) { say("Waiting for the net hub…"); await sleep(2000); }
    }
    if (!lc) throw new Error("Net hub didn't become ready");
    log("[proxy] net hub wisp", wisp);
    state = { hub, wisp, libcurl: { fetch: (url, init) => hub.fetch(url, init), WebSocket: lc.WebSocket } };
    return state;
  })().catch((e) => { ready = null; throw e; }));
}
async function rotateProxy(log = () => {}, say = () => {}) {
  if (!state) return getProxy({ log, say });
  if (rotating) return rotating;
  if (Date.now() - (state.lastRotate || 0) < 60000) return state;
  state.lastRotate = Date.now();
  rotating = (async () => {
    log("[proxy] asking net hub to switch wisp");
    const next = await state.hub.rotate(state.wisp, false);
    if (next) state.wisp = String(next);
    return state;
  })().finally(() => { rotating = null; });
  return rotating;
}
window.__getProxy = getProxy;
window.__rotateProxy = rotateProxy;
