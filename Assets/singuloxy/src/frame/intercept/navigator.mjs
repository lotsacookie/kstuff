if (typeof Navigator !== "undefined")
  Navigator.prototype.sendBeacon = () => true;

// The Web Locks API is denied inside the proxied frame, which made the Roblox
// WasmPlayer fall back to a localStorage lease that was never released
// ("already in a game" after reload). Provide an in-memory implementation so
// locks always die with the page.
(() => {
  if (typeof Navigator === "undefined") return;

  let held = new Map();
  let queues = new Map();

  function abort_error() {
    try { return new DOMException("The lock request is aborted", "AbortError"); }
    catch { return new Error("The lock request is aborted"); }
  }

  function run(name, mode, callback) {
    held.set(name, { name, mode });
    let release;
    let done = new Promise((resolve) => (release = resolve));
    let result;
    try { result = Promise.resolve(callback({ name, mode })); }
    catch (e) { result = Promise.reject(e); }
    result.then(() => {}, () => {}).then(() => {
      held.delete(name);
      release();
      let next = (queues.get(name) || []).shift();
      if (next) next();
    });
    return result;
  }

  let manager = {
    request(name, a, b) {
      let options = typeof a === "function" ? {} : (a || {});
      let callback = typeof a === "function" ? a : b;
      name = String(name);
      let mode = options.mode || "exclusive";
      return new Promise((resolve, reject) => {
        if (options.signal?.aborted) return reject(abort_error());
        let start = () => run(name, mode, callback).then(resolve, reject);
        if (!held.has(name) || options.steal) return start();
        if (options.ifAvailable) {
          return Promise.resolve(callback(null)).then(resolve, reject);
        }
        let queue = queues.get(name);
        if (!queue) queues.set(name, (queue = []));
        let entry = start;
        queue.push(entry);
        options.signal?.addEventListener?.("abort", () => {
          let i = queue.indexOf(entry);
          if (i >= 0) {
            queue.splice(i, 1);
            reject(abort_error());
          }
        });
      });
    },
    query() {
      return Promise.resolve({ held: [...held.values()], pending: [] });
    }
  };

  try {
    Object.defineProperty(Navigator.prototype, "locks", {
      configurable: true,
      enumerable: true,
      get: () => manager
    });
  }
  catch {}

  // Drop any stale lease left behind by earlier sessions.
  try {
    let stale = /(lease|lock)/i;
    let roblox = /(wasm|rbx|roblox|player|webclient)/i;
    for (let key of Object.keys(localStorage))
      if (stale.test(key) && roblox.test(key)) localStorage.removeItem(key);
  }
  catch {}
})();
