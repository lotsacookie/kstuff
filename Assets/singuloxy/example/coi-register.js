(() => {
  let reload_key = "sandstone_coi_reloaded";

  if (window.crossOriginIsolated) {
    try {
      sessionStorage.removeItem(reload_key);
    }
    catch {}
    return;
  }

  if (!window.isSecureContext || !("serviceWorker" in navigator)) {
    console.warn("sandstone: cross-origin isolation needs HTTPS and service worker support, shared-memory wasm will not run");
    return;
  }

  let script = document.currentScript;
  let base = script && script.src ? script.src : document.baseURI;
  let worker_url = new URL("coi-sw.js", base).href;

  navigator.serviceWorker.register(worker_url)
    .then(() => navigator.serviceWorker.ready)
    .then(() => {
      if (window.crossOriginIsolated) return;
      try {
        if (sessionStorage.getItem(reload_key) === "1") {
          console.error("sandstone: still not cross-origin isolated after the header worker reload, check that coi-sw.js is served next to this page and that nothing else controls this scope");
          return;
        }
        sessionStorage.setItem(reload_key, "1");
      }
      catch {
        return;
      }
      window.location.reload();
    })
    .catch((e) => {
      console.warn("sandstone: could not start the cross-origin isolation worker", worker_url, e);
    });
})();
