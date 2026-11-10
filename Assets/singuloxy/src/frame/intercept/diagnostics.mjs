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
        let result = Reflect.apply(original, this, arguments);
        try {
          Promise.resolve(result).then(() => wasm_log(name + " ok (" + size + " bytes, imports=" + (imports ? Object.keys(imports).join(",").slice(0, 80) : "-") + ")"), (e) => wasm_log(name + " failed (" + size + " bytes): " + (e && e.message)));
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
        let result = Reflect.apply(streaming, this, arguments);
        try {
          Promise.resolve(result).then(() => wasm_log("instantiateStreaming ok"), (e) => wasm_log("instantiateStreaming failed: " + (e && e.message)));
        }
        catch {}
        return result;
      };
    }
    catch {}
  }
}

install_wasm_log();
