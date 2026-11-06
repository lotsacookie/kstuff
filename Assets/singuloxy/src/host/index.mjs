export * as controller from "./controller.mjs";
export * as network from "./network.mjs";
export * as cache from "./cache.mjs";

import * as rpc from "../rpc.mjs";
rpc.set_role("host");

if (typeof window !== "undefined") {
  if (!window.crossOriginIsolated) {
    console.warn(
      "sandstone: this page is not cross-origin isolated (self.crossOriginIsolated is false). " +
      "SharedArrayBuffer is unavailable, so any multithreaded WebAssembly content proxied " +
      "through sandstone (e.g. a Unity build with WebAssembly Threads enabled) will fail to " +
      "start. This requires Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy HTTP " +
      "response headers on this page."
    );
  }
  else {
    console.log("sandstone: page is cross-origin isolated - SharedArrayBuffer is available.");
  }
}

export { libcurl } from "libcurl.js/bundled";
export const version = {
  ver: __VERSION__,
  hash: __GIT_HASH__
}
