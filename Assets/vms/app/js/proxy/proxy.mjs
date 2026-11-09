// Network access for the VM client. This no longer loads Singuloxy or picks a wisp of its own: everything
// goes through the site's net hub (Assets/js/net-hub.js, exposed as window.kNetDirect), which owns the one
// shared sandstone/libcurl instance and handles wisp selection, health checks and rotation.
const findHub = () => {
  for (const w of [window, window.parent, window.top, window.opener]) {
    try { if (w && w.kNetDirect && typeof w.kNetDirect.fetch === "function") return w.kNetDirect; } catch {}
  }
  return null;
};

let ready = null;
export function getProxy({ log = () => {}, say = () => {} } = {}) {
  return (ready ||= (async () => {
    say("Connecting to net hub…");
    let hub = findHub();
    for (let i = 0; !hub && i < 100; i++) { await new Promise((r) => setTimeout(r, 100)); hub = findHub(); }
    if (!hub) throw new Error("Net hub unavailable: open this from the main site so it can provide the proxy.");
    const wisp = String(await hub.ready());
    if (typeof hub.libcurl !== "function") throw new Error("Net hub has no libcurl() (coi mode needs the updated shim): reload the main site.");
    const lc = await hub.libcurl();
    log("[proxy] net hub", wisp);
    return { libcurl: { fetch: (url, init) => hub.fetch(url, init), WebSocket: lc.WebSocket }, hub, get wisp() { return hub.wisp(); } };
  })().catch((e) => { ready = null; throw e; }));
}
