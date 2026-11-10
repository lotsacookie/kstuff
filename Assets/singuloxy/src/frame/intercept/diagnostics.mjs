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
        let result = Reflect.apply(original, this, arguments);
        try {
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
        let result = Reflect.apply(streaming, this, arguments);
        try {
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
