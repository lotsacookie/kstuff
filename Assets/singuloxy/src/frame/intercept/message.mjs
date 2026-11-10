import { ctx, proxy_function, unwrap_this } from "../context.mjs";
import { describe_data, normalize_post_message_args, origin_of_window } from "./cross_origin.mjs";

const IN_WORKER = typeof importScripts === "function";

const ORIGIN_KEY = "__sandstone_origin__";
const HTTP_ORIGIN = /^https?:\/\//i;

const stats = {sent: 0, self: 0, received: 0, overridden: 0, unresolved: 0};
let sent_traces = 0;
let received_traces = 0;
let origin_traces = 0;

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

function trace(text) {
  try {
    console.warn("sandstone: " + text);
  }
  catch {}
}

function is_internal(data) {
  return data !== null && typeof data === "object" && typeof data.type === "string" && typeof data.id === "string";
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
      stats.received++;
      if (received_traces >= 40) return;
      received_traces++;
      trace("message received origin=" + from + " data=" + describe_data(event.data));
    }, true);
  }
  catch {}
}

function install_stats_report() {
  let report = (label) => {
    try {
      if (!stats.sent && !stats.received && !stats.self) return;
      trace("message stats " + label + " sent=" + stats.sent + " self=" + stats.self + " received=" + stats.received + " origin_overrides=" + stats.overridden + " origin_unresolved=" + stats.unresolved);
    }
    catch {}
  };
  setTimeout(() => report("6s"), 6000);
  setTimeout(() => report("25s"), 25000);
}

function install_post_message() {
  if (typeof globalThis.postMessage !== "function") return;
  try {
    proxy_function(globalThis, "postMessage", (func, this_arg, args) => {
      let receiver = unwrap_this(this_arg);
      let is_self = receiver === globalThis || receiver === undefined || receiver === null;
      let same = is_same_origin_window(receiver);
      let next = same ? normalize_post_message_args(args) : args;
      if (!is_internal(args[0])) {
        if (is_self) {
          stats.self++;
        }
        else {
          stats.sent++;
          if (sent_traces < 40) {
            sent_traces++;
            let target = args[1] && args[1].targetOrigin || args[1];
            trace("postMessage target=" + String(target) + (same ? "" : " cross-origin") + (next === args ? "" : " (rewritten to *)") + " data=" + describe_data(args[0]));
          }
        }
      }
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
          let known = origin_of_window(source);
          if (known) {
            stats.overridden++;
            if (origin_traces < 20) {
              origin_traces++;
              trace("message origin " + real + " -> " + known);
            }
            return known;
          }
          let fake = source[ORIGIN_KEY];
          if (typeof fake === "string" && HTTP_ORIGIN.test(fake)) return fake;
          if (real === "null") {
            stats.unresolved++;
            if (origin_traces < 20) {
              origin_traces++;
              trace("message origin stayed null (source not recognised)");
            }
          }
          return real;
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
  install_stats_report();
}
