const wrappers = new WeakMap();
const blank_wrappers = new WeakMap();
const INTRINSICS = new Set(["JSON", "Object", "Array", "Function", "String", "Number", "Boolean", "Symbol", "Math", "Date", "RegExp", "Error", "TypeError", "RangeError", "Promise", "Map", "Set", "WeakMap", "WeakSet", "Reflect", "Proxy", "ArrayBuffer", "Uint8Array", "Int32Array", "Float64Array", "DataView", "parseInt", "parseFloat", "isNaN", "isFinite", "encodeURIComponent", "decodeURIComponent", "encodeURI", "decodeURI", "escape", "unescape", "eval"]);
const wrapper_targets = new WeakMap();
const child_frames = new Map();

const native_content_window = (() => {
  try {
    if (typeof HTMLIFrameElement === "undefined") return null;
    let descriptor = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "contentWindow");
    return descriptor && descriptor.get ? descriptor.get : null;
  }
  catch {
    return null;
  }
})();

let parent_origin = null;
let parent_factory = null;
let doc_reads = 0;
let post_traces = 0;

export const post_counts = {to_parent: 0, to_child: 0, to_other: 0};

function log(text) {
  try {
    console.warn("sandstone: " + text);
  }
  catch {}
}

export function describe_data(data) {
  if (data === null || data === undefined) return String(data);
  if (typeof data === "string") {
    let head = "";
    try {
      head = JSON.stringify(data.slice(0, 8));
    }
    catch {}
    return "string(" + data.length + ")" + head;
  }
  if (typeof data === "object") {
    try {
      return "object{" + Object.keys(data).slice(0, 8).join(",") + "}";
    }
    catch {
      return "object";
    }
  }
  return typeof data;
}

function describe_target(value) {
  try {
    if (value && typeof value === "object" && !Array.isArray(value) && typeof value.targetOrigin === "string") return value.targetOrigin;
    if (Array.isArray(value)) return "[transfer " + value.length + "]";
    return String(value);
  }
  catch {
    return "?";
  }
}

function own_origin() {
  try {
    let origin = globalThis.__sandstone_origin__;
    return typeof origin === "string" ? origin : "null";
  }
  catch {
    return "null";
  }
}

export function security_error() {
  return new DOMException("Blocked a frame with origin \"" + own_origin() + "\" from accessing a cross-origin frame.", "SecurityError");
}

export function parent_document_blocked() {
  let own = own_origin();
  return !!parent_origin && own !== "null" && own !== parent_origin;
}

function classify_window(real) {
  let tags = [];
  try {
    if (real === globalThis) tags.push("self");
  }
  catch {}
  try {
    if (real === globalThis.parent) tags.push("parent");
  }
  catch {}
  try {
    if (real === globalThis.top) tags.push("top");
  }
  catch {}
  try {
    if (real === globalThis.opener) tags.push("opener");
  }
  catch {}
  try {
    let known = origin_of_window(real);
    if (known) tags.push("known-origin=" + known);
  }
  catch {}
  return tags.length ? tags.join(",") : "unknown";
}

function log_doc_read(real) {
  if (doc_reads >= 5) return;
  doc_reads++;
  try {
    let stack = String(new Error().stack).split("\n").slice(2, 6).map((line) => line.trim().replace(/^at /, "").replace(/blob:[^\s)]*:(\d+:\d+)/, "blob:$1")).join(" < ");
    log(".document read on cross-origin window [" + classify_window(real) + "] (blocked, throwing SecurityError) from " + stack);
  }
  catch {}
}

export function set_parent_origin(origin) {
  parent_origin = typeof origin === "string" && /^https?:\/\//i.test(origin) ? origin : null;
}

export function set_parent_factory(factory) {
  parent_factory = typeof factory === "function" ? factory : null;
}

export function register_child_frame(element, origin) {
  if (!element || typeof origin !== "string" || !/^https?:\/\//i.test(origin)) return;
  child_frames.set(element, origin);
}

export function register_proxy_target(proxy, real) {
  if (!proxy || !real) return;
  wrapper_targets.set(proxy, real);
}

export function unwrap_window(value) {
  if (value && (typeof value === "object" || typeof value === "function") && wrapper_targets.has(value)) return wrapper_targets.get(value);
  return value;
}

function is_real_parent(real) {
  try {
    return !!real && globalThis.parent !== globalThis && real === globalThis.parent;
  }
  catch {
    return false;
  }
}

function is_child_window(real) {
  if (!native_content_window) return false;
  for (let element of child_frames.keys()) {
    try {
      if (native_content_window.call(element) === real) return true;
    }
    catch {}
  }
  return false;
}

export function origin_of_window(value) {
  let real = unwrap_window(value);
  if (!real) return null;
  if (parent_origin && is_real_parent(real)) return parent_origin;
  if (!native_content_window) return null;
  for (let [element, origin] of child_frames) {
    let window_ref = null;
    try {
      window_ref = native_content_window.call(element);
    }
    catch {}
    if (!window_ref) {
      child_frames.delete(element);
      continue;
    }
    if (window_ref === real) return origin;
  }
  return null;
}

export function normalize_post_message_args(args) {
  if (args.length < 2) return args;
  let second = args[1];
  if (typeof second === "string") {
    if (second === "*" || second === "/") return args;
    return [args[0], "*", ...args.slice(2)];
  }
  if (second !== null && typeof second === "object" && !Array.isArray(second) && typeof second.targetOrigin === "string" && second.targetOrigin !== "*" && second.targetOrigin !== "/") {
    return [args[0], {...second, targetOrigin: "*"}, ...args.slice(2)];
  }
  return args;
}

export function make_post_message(real, label) {
  return function postMessage(...args) {
    let next = normalize_post_message_args(args);
    let internal = args[0] !== null && typeof args[0] === "object" && typeof args[0].type === "string" && typeof args[0].id === "string";
    if (!internal) {
      if (is_real_parent(real)) post_counts.to_parent++;
      else if (is_child_window(real)) post_counts.to_child++;
      else post_counts.to_other++;
      if (post_traces < 40) {
        post_traces++;
        log("postMessage " + label + " [" + classify_window(real) + "] target=" + describe_target(args[1]) + (next === args ? "" : " (rewritten to *)") + " data=" + describe_data(args[0]));
      }
    }
    return Reflect.apply(real.postMessage, real, next);
  };
}

export function is_cross_origin(real) {
  if (!real) return false;
  try {
    void real.document;
    return false;
  }
  catch {
    return true;
  }
}

export function wrap_window(real, blank) {
  if (!real || (typeof real !== "object" && typeof real !== "function")) return real;
  if (!is_cross_origin(real)) return real;
  let cache = blank ? blank_wrappers : wrappers;
  if (cache.has(real)) return cache.get(real);
  let post_message = make_post_message(real, "to cross-origin window");
  let wrapper = new Proxy({}, {
    get(_, key) {
      let target = real;
      if (key === "document") {
        log_doc_read(real);
        throw security_error();
      }
      if (key === "postMessage") return post_message;
      try {
        let value = Reflect.get(target, key);
        return typeof value === "function" ? value.bind(target) : value;
      }
      catch {
        if (blank && typeof key === "string" && INTRINSICS.has(key)) return globalThis[key];
        return undefined;
      }
    },
    set(_, key, value) {
      try {
        return Reflect.set(real, key, value);
      }
      catch {
        return true;
      }
    },
    has(_, key) {
      if (key === "document") return true;
      try {
        return Reflect.has(real, key);
      }
      catch {
        return false;
      }
    }
  });
  cache.set(real, wrapper);
  wrapper_targets.set(wrapper, real);
  return wrapper;
}

function install_message_source() {
  if (typeof MessageEvent === "undefined") return;
  let descriptor = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "source");
  if (!descriptor || !descriptor.get) return;
  try {
    Object.defineProperty(MessageEvent.prototype, "source", {
      configurable: true,
      enumerable: descriptor.enumerable,
      get: function() {
        let real = descriptor.get.call(this);
        try {
          if (parent_factory && real && is_real_parent(real)) {
            let proxy = parent_factory();
            if (proxy) return proxy;
          }
          return wrap_window(real);
        }
        catch {
          return real;
        }
      }
    });
  }
  catch {}
}

if (typeof window !== "undefined" && typeof importScripts !== "function") {
  install_message_source();
}
