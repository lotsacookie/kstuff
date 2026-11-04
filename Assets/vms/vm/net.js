/** Fetch any URL: direct first, then through the Singuloxy/libcurl proxy (?net=direct|proxy forces a path). */
const FORCE = new URLSearchParams(location.search).get("net");
let mode = FORCE === "proxy" ? "proxy" : "direct";
export const currentMode = () => mode;

async function proxy(opts) {
  const { getProxy } = await import("./proxy/proxy.mjs");
  return getProxy(opts);
}

export async function smartFetch(url, init, opts = {}) {
  if (mode === "direct") {
    try { return await fetch(url, init); }
    catch (e) { if (FORCE === "direct") throw e; console.warn("[net] direct failed, using proxy:", e && e.message); }
  }
  mode = "proxy";
  return (await proxy(opts)).libcurl.fetch(url, init);
}

/** Always via the proxy (used for site pages, which block cross-origin reads). */
export async function proxyFetch(url, init, opts = {}) {
  mode = "proxy";
  return (await proxy(opts)).libcurl.fetch(url, init);
}
