// WebBlox transport: every request (HTTP and WebSocket) goes through the SingularityNOW proxy
// (sandstone libcurl over a wisp server). Replaces the old epoxy-based /js/transport.js.
(() => {
  const script = document.currentScript;
  const base = (script && script.src) || new URL((window.WB_ASSETS || "./Assets/") + "js/proxy-transport.js", document.baseURI).href;
  const coreUrl = new URL("proxy-core.mjs", base).href + "?v=" + String(window.WB_SHA || Date.now()).slice(0, 12);
  let core = null;
  let state = null;
  let starting = null;
  const log = (...a) => console.log("[proxy]", ...a);
  const loadCore = () => (core ||= import(coreUrl));
  const findHub = () => {
    for (const w of [window, window.parent, window.top]) {
      try { if (w && w.kNetDirect && typeof w.kNetDirect.sandstone === "function") return w.kNetDirect; } catch {}
    }
    return null;
  };
  const start = (say = () => {}) => (starting ||= (async () => {
    const hub = findHub();
    if (hub) {
      say("Connecting through the net hub…");
      const sg = await hub.sandstone();
      await hub.ready().catch(() => {});
      state = { libcurl: sg.libcurl, network: sg.network, sandstone: sg, wisp: String(hub.wisp() || ""), hub };
      log("using the kstuff net hub", state.wisp);
      return state;
    }
    const mod = await loadCore();
    state = await mod.getProxy({ log, say });
    return state;
  })().catch((e) => { starting = null; throw e; }));

  const headerObject = (pairs) => {
    const out = {};
    for (const [k, v] of pairs) {
      const key = String(k).toLowerCase();
      out[key] = key in out ? out[key] + (key === "cookie" ? "; " : ", ") + v : v;
    }
    return out;
  };

  class LibcurlTransport {
    ready = false;
    async init() { await start(); this.ready = true; }
    async meta() {}
    async request(remote, method, body, headers, signal) {
      if (body instanceof Blob) body = await body.arrayBuffer();
      const init = { method, headers: headerObject(headers), body: body ?? undefined, redirect: "manual", signal };
      const run = async () => {
        const st = await start();
        const res = await st.libcurl.fetch(remote.href, init);
        const raw = res.raw_headers || [...res.headers.entries()];
        return { body: res.body, headers: raw, status: res.status, statusText: res.statusText };
      };
      try { return await run(); }
      catch (e) {
        if (signal && signal.aborted) throw e;
        log("request failed, switching wisp:", (e && e.message) || e);
        if (state && state.hub) { await state.hub.rotate(state.wisp, true).catch(() => {}); state.wisp = String(state.hub.wisp() || ""); }
        else { const mod = await loadCore(); await mod.rotateProxy(log); }
        return run();
      }
    }
    connect(url, protocols, requestHeaders, onopen, onmessage, onclose, onerror) {
      const ws = new state.libcurl.WebSocket(url.href, protocols, { headers: headerObject(requestHeaders) });
      ws.binaryType = "arraybuffer";
      ws.onopen = () => onopen(ws.protocol || "", ws.extensions || "");
      ws.onmessage = (e) => onmessage(e.data);
      ws.onclose = (e) => onclose(e.code, e.reason);
      ws.onerror = () => onerror("WebSocket error");
      return [
        async (data) => { if (data instanceof Blob) data = await data.arrayBuffer(); ws.send(data); },
        async (code, reason) => ws.close(code, reason || ""),
      ];
    }
    async sendSetCookie() {}
  }

  window.proxyTransport = {
    start,
    getWisp: () => (state && state.wisp) || "",
    getTransport: () => "libcurl",
    async createClient() {
      const t = new LibcurlTransport();
      await t.init();
      return t;
    },
  };
})();
