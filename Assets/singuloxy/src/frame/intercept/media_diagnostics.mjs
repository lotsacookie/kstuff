import { proxy_function, unwrap_this } from "../context.mjs";

const MAX_REPORTS = 12;
let reports = 0;

function report(...args) {
  if (reports >= MAX_REPORTS) return;
  reports++;
  console.warn("sandstone media:", ...args);
}

function describe(element) {
  let error = element.error;
  return {
    src: element.currentSrc || element.getAttribute("__src") || "",
    code: error ? error.code : null,
    message: error ? error.message : "",
    networkState: element.networkState,
    readyState: element.readyState
  };
}

function install_element_errors() {
  if (typeof document === "undefined" || typeof HTMLMediaElement === "undefined") return;
  document.addEventListener("error", (event) => {
    let target = event.target;
    if (target instanceof HTMLMediaElement) report("element error", describe(target));
  }, true);
}

function install_play_report() {
  if (typeof HTMLMediaElement === "undefined") return;
  proxy_function(HTMLMediaElement.prototype, "play", (func, this_arg, args) => {
    let element = unwrap_this(this_arg);
    let result = Reflect.apply(func, element, args);
    if (result && typeof result.then === "function") {
      result.then(undefined, (e) => report("play() rejected", e && e.name, e && e.message, describe(element)));
    }
    return result;
  });
}

function install_eme_report() {
  if (typeof Navigator === "undefined" || typeof Navigator.prototype.requestMediaKeySystemAccess !== "function") return;
  proxy_function(Navigator.prototype, "requestMediaKeySystemAccess", (func, this_arg, args) => {
    let result = Reflect.apply(func, unwrap_this(this_arg), args);
    if (result && typeof result.then === "function") {
      result.then(undefined, (e) => report("key system rejected", args[0], e && e.name, e && e.message));
    }
    return result;
  });
}

let installed = false;

export function install() {
  if (installed) return;
  installed = true;
  install_element_errors();
  install_play_report();
  install_eme_report();
}
