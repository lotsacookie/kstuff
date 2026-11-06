const WEBGL_IDS = new Set(["webgl", "webgl2", "experimental-webgl"]);
const reported = new Set();
const watched = new WeakSet();

function report(level, message, detail) {
  let key = message + "|" + (detail === undefined ? "" : detail);
  if (reported.has(key)) return;
  reported.add(key);
  if (detail === undefined) console[level]("sandstone: " + message);
  else console[level]("sandstone: " + message, detail);
}

function relaxed(attributes) {
  let merged = Object.assign({}, attributes || {});
  merged.failIfMajorPerformanceCaveat = false;
  return merged;
}

function minimal(attributes) {
  let merged = relaxed(attributes);
  merged.antialias = false;
  merged.powerPreference = "default";
  merged.desynchronized = false;
  merged.xrCompatible = false;
  return merged;
}

function watch(canvas, id) {
  if (!canvas || watched.has(canvas) || typeof canvas.addEventListener !== "function") return;
  watched.add(canvas);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    report("warn", "webgl context lost, waiting for restore", id);
  }, false);
}

function install(proto, name, patched) {
  patched.__sandstone_emscripten = true;
  Object.defineProperty(proto, name, {
    value: patched,
    writable: true,
    configurable: true,
    enumerable: false
  });
}

function wrap_get_context(proto, label) {
  if (!proto) return;
  let original = proto.getContext;
  if (typeof original !== "function" || original.__sandstone_emscripten) return;

  let patched = {
    getContext(type, attributes) {
      let id = String(type);

      if (WEBGL_IDS.has(id)) {
        let context = null;
        try {
          context = original.call(this, id, relaxed(attributes));
        }
        catch (e) {
          report("warn", label + ".getContext(" + id + ") threw", String(e));
        }
        if (!context) {
          try {
            context = original.call(this, id, minimal(attributes));
          }
          catch {}
        }
        if (context) {
          watch(this, id);
          return context;
        }
        report("error", label + ".getContext(" + id + ") returned null, the browser has no usable WebGL for this canvas");
        return null;
      }

      if (id === "webgpu") {
        try {
          let context = original.apply(this, arguments);
          if (!context) report("warn", label + ".getContext(webgpu) returned null");
          return context;
        }
        catch (e) {
          report("warn", label + ".getContext(webgpu) threw", String(e));
          return null;
        }
      }

      return original.apply(this, arguments);
    }
  }.getContext;

  install(proto, "getContext", patched);
}

function wrap_request_adapter() {
  if (typeof GPU === "undefined" || !GPU.prototype) return;
  let original = GPU.prototype.requestAdapter;
  if (typeof original !== "function" || original.__sandstone_emscripten) return;

  let patched = async function requestAdapter() {
    try {
      let adapter = await original.apply(this, arguments);
      if (!adapter) report("warn", "navigator.gpu.requestAdapter() resolved null");
      return adapter;
    }
    catch (e) {
      report("warn", "navigator.gpu.requestAdapter() rejected", String(e));
      return null;
    }
  };

  install(GPU.prototype, "requestAdapter", patched);
}

function report_environment() {
  if (typeof document === "undefined") return;
  let isolated = globalThis.crossOriginIsolated === true;
  let has_shared = typeof SharedArrayBuffer !== "undefined";
  let state = {
    crossOriginIsolated: isolated,
    SharedArrayBuffer: has_shared,
    hardwareConcurrency: typeof navigator !== "undefined" ? navigator.hardwareConcurrency : undefined,
    webgpu: typeof navigator !== "undefined" && "gpu" in navigator
  };
  if (isolated && has_shared) {
    report("info", "emscripten environment", JSON.stringify(state));
  }
}

if (typeof HTMLCanvasElement !== "undefined") wrap_get_context(HTMLCanvasElement.prototype, "HTMLCanvasElement");
if (typeof OffscreenCanvas !== "undefined") wrap_get_context(OffscreenCanvas.prototype, "OffscreenCanvas");
wrap_request_adapter();
report_environment();
