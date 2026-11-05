import { ctx, proxy_function, unwrap_this } from "../context.mjs";

const IN_WORKER = typeof importScripts === "function";

const ORIGIN_KEY = "__sandstone_origin__";
const HTTP_ORIGIN = /^https?:\/\//i;

function is_same_origin_window(target) {
  if (target === undefined || target === null) return true;
  try {
    void target.document;
    return true;
  }
  catch {
    return false;
  }
}

function needs_rewrite(origin) {
  return typeof origin === "string" && origin !== "*" && origin !== "/";
}

function normalize_arguments(args) {
  if (args.length < 2) return args;
  let second = args[1];
  if (typeof second === "string") {
    if (!needs_rewrite(second)) return args;
    return [args[0], "*", ...args.slice(2)];
  }
  if (second !== null && typeof second === "object" && needs_rewrite(second.targetOrigin)) {
    return [args[0], {...second, targetOrigin: "*"}, ...args.slice(2)];
  }
  return args;
}

function install_origin_marker() {
  try {
    Object.defineProperty(globalThis, ORIGIN_KEY, {
      configurable: true,
      enumerable: false,
      get: () => {
        try {
          let origin = ctx.location.origin;
          return typeof origin === "string" && HTTP_ORIGIN.test(origin) ? origin : undefined;
        }
        catch {
          return undefined;
        }
      }
    });
  }
  catch {}
}

let trace_count = 0;

function trace(text) {
  if (trace_count >= 60) return;
  trace_count++;
  try {
    console.warn("sandstone: " + text);
  }
  catch {}
}

function is_internal(data) {
  return data !== null && typeof data === "object" && typeof data.type === "string" && typeof data.id === "string";
}

function describe_data(data) {
  if (data === null || data === undefined) return String(data);
  if (typeof data === "string") return "string(" + data.length + ")";
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

function install_trace() {
  try {
    globalThis.addEventListener("message", (event) => {
      let from = "";
      try {
        from = event.origin;
      }
      catch {}
      if (is_internal(event.data)) return;
      trace("message received origin=" + from + " data=" + describe_data(event.data));
    }, true);
  }
  catch {}
}

function install_post_message() {
  if (typeof globalThis.postMessage !== "function") return;
  try {
    proxy_function(globalThis, "postMessage", (func, this_arg, args) => {
      let receiver = unwrap_this(this_arg);
      let same = is_same_origin_window(receiver);
      let next = same ? normalize_arguments(args) : args;
      if (!is_internal(args[0])) trace("postMessage target=" + String(args[1] && args[1].targetOrigin || args[1]) + (same ? "" : " cross-origin") + " data=" + describe_data(args[0]));
      return Reflect.apply(func, receiver, next);
    });
  }
  catch {}
}

function install_event_origin() {
  if (typeof MessageEvent === "undefined") return;
  let origin_descriptor = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "origin");
  let source_descriptor = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "source");
  if (!origin_descriptor || !origin_descriptor.get || !source_descriptor || !source_descriptor.get) return;

  let read_origin = origin_descriptor.get;
  let read_source = source_descriptor.get;

  try {
    Object.defineProperty(MessageEvent.prototype, "origin", {
      configurable: true,
      enumerable: origin_descriptor.enumerable,
      get: function() {
        let real = read_origin.call(this);
        try {
          let source = read_source.call(this);
          if (!source) return real;
          let fake = source[ORIGIN_KEY];
          return typeof fake === "string" && HTTP_ORIGIN.test(fake) ? fake : real;
        }
        catch {
          return real;
        }
      }
    });
  }
  catch {}
}

if (!IN_WORKER && typeof window !== "undefined") {
  install_origin_marker();
  install_post_message();
  install_event_origin();
  install_trace();
}
