import { rewrite_js } from "../parser.mjs";
import { unwrap_this } from "../context.mjs";

const NativeFunction = Function;

Function.prototype.__toString = Function.prototype.toString;
Function.prototype.toString = function() {
  let js = this.__toString();
  js = js.replaceAll("__ctx__.", "");
  js = js.replaceAll("__get_this__(this)", "this");
  js = js.replace(/\(__get_var__\(([A-Za-z_$][\w$]*), "([A-Za-z_$][\w$]*)"\)\)/g, (match, name, quoted) => {
    return name === quoted ? name : match;
  });
  return js;
}

function build_function(args) {
  if (args.length === 0) return NativeFunction();
  let params = args.slice(0, -1);
  let body = String(args[args.length - 1]);
  let rewritten = body;
  try {
    rewritten = rewrite_js(body);
  }
  catch {
    rewritten = body;
  }
  return NativeFunction(...params, rewritten);
}

const FunctionProxy = new Proxy(NativeFunction, {
  apply: (target, this_arg, args) => build_function(args),
  construct: (target, args) => build_function(args)
});

globalThis.Function = FunctionProxy;
NativeFunction.prototype.constructor = FunctionProxy;

const native_cache = new WeakMap();
const native_to_string = NativeFunction.prototype.__toString;

function is_native_function(func) {
  let cached = native_cache.get(func);
  if (cached !== undefined) return cached;
  let result = false;
  try {
    result = /\{\s*\[native code\]\s*\}\s*$/.test(native_to_string.call(func));
  }
  catch {}
  native_cache.set(func, result);
  return result;
}

function unwrap_native_this(func, this_arg) {
  if (typeof func !== "function" || this_arg === null || (typeof this_arg !== "object" && typeof this_arg !== "function")) return this_arg;
  let unwrapped = unwrap_this(this_arg);
  if (unwrapped === this_arg) return this_arg;
  return is_native_function(func) ? unwrapped : this_arg;
}

const native_apply = NativeFunction.prototype.apply;

NativeFunction.prototype.call = function(this_arg, ...args) {
  return Reflect.apply(this, unwrap_native_this(this, this_arg), args);
};

NativeFunction.prototype.apply = function(this_arg, args) {
  return Reflect.apply(native_apply, this, [unwrap_native_this(this, this_arg), args]);
};
