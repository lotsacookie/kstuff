import { proxy_function, unwrap_this } from "../context.mjs";

const SIGNAL_ERROR = /AbortSignal/;
const GLOBAL_METHODS = [
  "setTimeout", "setInterval", "clearTimeout", "clearInterval",
  "requestAnimationFrame", "cancelAnimationFrame",
  "requestIdleCallback", "cancelIdleCallback",
  "queueMicrotask", "getComputedStyle", "matchMedia",
  "scrollTo", "scrollBy", "structuredClone", "atob", "btoa", "createImageBitmap"
];
let warned = 0;

function looks_like_signal(value) {
  return value !== null
    && typeof value === "object"
    && typeof value.aborted === "boolean"
    && typeof value.addEventListener === "function";
}

function is_signal_error(e) {
  return e !== null
    && typeof e === "object"
    && e.name === "TypeError"
    && SIGNAL_ERROR.test(String(e.message));
}

function warn(method, signal) {
  if (warned >= 5) return;
  warned++;
  console.warn("sandstone: invalid AbortSignal passed to " + method, signal, new Error().stack);
}

function strip_signal(options) {
  let copy = {...options};
  delete copy.signal;
  return copy;
}

function install_unwrap() {
  if (typeof EventTarget !== "undefined") {
    for (let key of ["removeEventListener", "dispatchEvent"]) {
      proxy_function(EventTarget.prototype, key, (func, this_arg, args) => {
        return Reflect.apply(func, unwrap_this(this_arg), args);
      });
    }
  }

  for (let key of GLOBAL_METHODS) {
    if (typeof globalThis[key] !== "function") continue;
    try {
      proxy_function(globalThis, key, (func, this_arg, args) => {
        return Reflect.apply(func, unwrap_this(this_arg), args);
      });
    }
    catch {}
  }
}

function install_add_listener() {
  if (typeof EventTarget === "undefined") return;

  proxy_function(EventTarget.prototype, "addEventListener", (func, this_arg, args) => {
    let receiver = unwrap_this(this_arg);
    try {
      return Reflect.apply(func, receiver, args);
    }
    catch (e) {
      let options = args[2];
      if (!is_signal_error(e) || options === null || typeof options !== "object") throw e;

      let signal = options.signal;
      warn("addEventListener", signal);
      let rest = strip_signal(options);

      if (looks_like_signal(signal)) {
        if (signal.aborted) return;
        Reflect.apply(func, receiver, [args[0], args[1], rest]);
        signal.addEventListener("abort", () => {
          try {
            receiver.removeEventListener(args[0], args[1], rest);
          }
          catch {}
        }, {once: true});
        return;
      }

      return Reflect.apply(func, receiver, [args[0], args[1], rest]);
    }
  });
}

install_unwrap();
install_add_listener();
