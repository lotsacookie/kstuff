const reported = new Set();

if (typeof document !== "undefined" && typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => {
    let element = event.target;
    if (!element || element === globalThis || !element.tagName) return;

    let source = "";
    try {
      source = element.currentSrc || element.src || element.href || element.getAttribute("__src") || element.getAttribute("src") || element.getAttribute("href") || "";
    }
    catch {}

    let key = element.tagName + "|" + source;
    if (reported.has(key)) return;
    reported.add(key);

    let html = "";
    try {
      html = element.outerHTML.slice(0, 240);
    }
    catch {}

    console.warn("sandstone: resource failed to load:", element.tagName.toLowerCase(), source, html);
  }, true);
}


let wasm_logs = 0;

function wasm_log(text) {
  if (wasm_logs >= 12) return;
  wasm_logs++;
  try {
    console.log("wasm: " + text);
  }
  catch {}
}

const RING_SIZE = 14;
const wasm_ring = [];

function ring_push(name, args) {
  let saved = [];
  for (let i = 0; i < args.length && i < 6; i++) {
    let value = args[i];
    saved.push(typeof value === "number" || typeof value === "bigint" ? Number(value) : typeof value === "string" ? value.slice(0, 160) : value === null ? "null" : typeof value);
  }
  wasm_ring.push([name, saved]);
  if (wasm_ring.length > RING_SIZE) wasm_ring.shift();
}

function decode_text(memory, ptr, length) {
  try {
    if (!memory || !Number.isInteger(ptr) || !Number.isInteger(length)) return null;
    if (ptr < 0 || length < 3 || length > 600 || ptr + length > memory.buffer.byteLength) return null;
    let text = new TextDecoder().decode(new Uint8Array(memory.buffer, ptr, length));
    let printable = 0;
    for (let i = 0; i < text.length; i++) {
      let code = text.charCodeAt(i);
      if ((code >= 32 && code < 127) || code === 10 || code === 9) printable++;
    }
    return printable / text.length >= 0.85 ? text.replace(/\s+/g, " ").slice(0, 220) : null;
  }
  catch {
    return null;
  }
}

function describe_ring() {
  let memory = globalThis.__sandstone_wasm_mem;
  return wasm_ring.map(([name, args]) => {
    let shown = args.map((value, index) => {
      if (typeof value === "string") return JSON.stringify(value);
      let text = decode_text(memory, value, args[index + 1]);
      return text ? JSON.stringify(text) : String(value);
    });
    return name + "(" + shown.join(",") + ")";
  }).join("\n");
}

try {
  Object.defineProperty(globalThis, "__sandstone_wasm_describe", {value: describe_ring, configurable: true, enumerable: false});
}
catch {}

function wrap_imports(imports) {
  try {
    if (!imports || typeof imports !== "object") return imports;
    let copy = {};
    for (let ns of Object.keys(imports)) {
      let table = imports[ns];
      if (!table || typeof table !== "object") {
        copy[ns] = table;
        continue;
      }
      let wrapped = {};
      for (let key of Object.keys(table)) {
        let value = table[key];
        if (typeof value !== "function") {
          wrapped[key] = value;
          continue;
        }
        wrapped[key] = function(...args) {
          ring_push(key.replace(/^__wbg_|^__wbindgen_/, "").replace(/_[0-9a-f]{6,}$/, ""), args);
          return Reflect.apply(value, this, args);
        };
      }
      copy[ns] = wrapped;
    }
    return copy;
  }
  catch {
    return imports;
  }
}

function remember_memory(value) {
  try {
    let instance = value && value.instance ? value.instance : value;
    if (instance && instance.exports && instance.exports.memory) globalThis.__sandstone_wasm_mem = instance.exports.memory;
  }
  catch {}
}

function describe_result(result) {
  try {
    let instance = result && result.instance ? result.instance : result;
    if (instance && instance.exports) return "exports=" + Object.keys(instance.exports).slice(0, 10).join(",");
  }
  catch {}
  return "";
}

function describe_imports(imports) {
  try {
    if (!imports) return "-";
    return Object.keys(imports).map((ns) => ns + "(" + Object.keys(imports[ns] || {}).length + ")").join(",").slice(0, 100);
  }
  catch {
    return "?";
  }
}

function install_wasm_log() {
  if (typeof WebAssembly === "undefined") return;
  for (let name of ["instantiate", "compile"]) {
    let original = WebAssembly[name];
    if (typeof original !== "function") continue;
    try {
      WebAssembly[name] = function(source, imports) {
        let size = "?";
        try {
          size = source && source.byteLength !== undefined ? source.byteLength : (source instanceof WebAssembly.Module ? "module" : typeof source);
        }
        catch {}
        let call_args = Array.from(arguments);
        if (name === "instantiate" && call_args.length > 1) call_args[1] = wrap_imports(call_args[1]);
        let result = Reflect.apply(original, this, call_args);
        try {
          Promise.resolve(result).then((value) => remember_memory(value), () => {});
          Promise.resolve(result).then((value) => wasm_log(name + " ok (" + size + " bytes) imports=" + describe_imports(imports) + " " + describe_result(value)), (e) => wasm_log(name + " failed (" + size + " bytes): " + (e && e.message)));
        }
        catch {}
        return result;
      };
    }
    catch {}
  }
  let streaming = WebAssembly.instantiateStreaming;
  if (typeof streaming === "function") {
    try {
      WebAssembly.instantiateStreaming = function(source, imports) {
        let url = "";
        Promise.resolve(source).then((response) => {
          try {
            url = response && response.url ? String(response.url).replace(/^https?:\/\//, "").slice(0, 120) : "";
          }
          catch {}
        }, () => {});
        let call_args = Array.from(arguments);
        if (call_args.length > 1) call_args[1] = wrap_imports(call_args[1]);
        let result = Reflect.apply(streaming, this, call_args);
        try {
          Promise.resolve(result).then((value) => remember_memory(value), () => {});
          Promise.resolve(result).then((value) => wasm_log("instantiateStreaming ok " + url + " imports=" + describe_imports(imports) + " " + describe_result(value)), (e) => wasm_log("instantiateStreaming failed " + url + ": " + (e && e.message)));
        }
        catch {}
        return result;
      };
    }
    catch {}
  }
}

install_wasm_log();
