/**
 * Where the backend (/status and /ws) lives, and how to reach it.
 * The client used to be served from the backend's own origin; here it is served from this repo, so
 * requests go to BACKEND. Order: direct (plain fetch/WebSocket); if that fails, the net hub.
 *   ?backend=https://host   override the backend origin
 *   ?net=direct|proxy       force a path (default: auto)
 */
const params = new URLSearchParams(location.search);
/** Session token, set by the boot sequence in index.html (kept out of the URL). */
export const auth = { token: null };
export const BACKEND = (params.get("backend") || "https://static.cdn-a.org").replace(/\/$/, "");
const FORCE = params.get("net");
let mode = FORCE === "proxy" ? "proxy" : "direct";

export const currentMode = () => mode;
export const wsBase = () => BACKEND.replace(/^http/, "ws");

async function proxy() {
  const { getProxy } = await import("./proxy/proxy.mjs");
  return getProxy({ log: (...a) => console.log(...a) });
}

export async function backendFetch(path, init) {
  if (mode === "direct") {
    try { return await fetch(BACKEND + path, init); }
    catch (e) { if (FORCE === "direct") throw e; console.warn("[net] direct fetch failed, using proxy:", e && e.message); }
  }
  mode = "proxy";
  return (await proxy()).libcurl.fetch(BACKEND + path, init);
}

/** WebSocket-compatible constructor that tunnels through the proxy. */
export async function proxiedWebSocket() {
  mode = "proxy";
  return (await proxy()).libcurl.WebSocket;
}
export const mayUseProxy = () => FORCE !== "direct";

/** Fetch any URL through the proxy (used for the Astra catalog and icons; never tries a direct request). */
export async function astraFetch(url, init) {
  return (await proxy()).libcurl.fetch(url, init); // leaves the FreezeNova backend's direct/proxy mode alone
}

/** Proxied WebSocket constructor for Astra's relay (does not change the backend mode either). */
export async function astraWebSocket() {
  return (await proxy()).libcurl.WebSocket;
}
