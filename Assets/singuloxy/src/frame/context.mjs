import * as network from "./network.mjs";
import * as polyfill from "./polyfill/index.mjs";
import * as intercept from "./intercept/index.mjs";
import * as parser from "./parser.mjs";
import * as loader from "./loader.mjs";

export const is_worker = typeof importScripts === "function";
export const ctx_vars = [];
export const unreadable_vars = ["localStorage", "sessionStorage", "importScripts"];
if (is_worker) 
  unreadable_vars.push("document");

const internal = {
  location: null,
  self: null,
  globalThis: null,
  eval: null,
  history: null,
  localStorage: null,
  sessionStorage: null,
  cookie_jar: null
};

var ready = false;

const GETTER_ONLY_ERROR = /only a getter|read[- ]only|Cannot set property/i;
const OPEN_IN_FRAME = true;

const PROTECTED_KEYS = new Set([
  "Request",
  "XMLHttpRequest",
  "URL",
  "Worker",
  "WebSocket",
  "EventSource"
]);

export function is_ready() {
  return ready === true;
}

export function page_url() {
  try {
    if (ready) return internal.location.href;
  }
  catch {}
  try {
    if (loader.url) return loader.url;
  }
  catch {}
  return globalThis.location.href;
}

// The document base URL: the first <base href> (resolved against the page URL),
// otherwise the page URL itself. While a page is being loaded its parsed
// document is registered here because it is not attached to the frame yet.
let loading_doc = null;

export function set_loading_document(doc) {
  loading_doc = doc || null;
}

export function document_base() {
  let fallback = page_url();
  try {
    let doc = loading_doc || (typeof document !== "undefined" ? document : null);
    let base_element = doc && doc.querySelector ? doc.querySelector("base[href]") : null;
    if (base_element) {
      let resolved = new URL(base_element.getAttribute("href"), fallback);
      if (resolved.protocol === "http:" || resolved.protocol === "https:") return resolved.href;
    }
  }
  catch {}
  return fallback;
}

export function unwrap_this(value) {
  if (value === ctx.__proxy__) return globalThis;
  let doc = intercept.document;
  if (doc && doc.__proxy__ && value === doc.__proxy__) return doc.__target__;
  return value;
}

function create_func_proxy(target, func) {
  let proxy = new Proxy(func, {
    apply: function(func_target, this_arg, args) {
      return Reflect.apply(func_target, target, args);
    }
  });
  proxy.apply = function(this_arg, args) {
    return Reflect.apply(func, unwrap_this(this_arg), args);
  }
  proxy.call = function(this_arg, ...args) {
    return Reflect.apply(func, unwrap_this(this_arg), args);
  }
  return proxy;
}

export function get_handler_keys(obj) {
  let keys = [];
  let own_keys = Reflect.ownKeys(Object.getPrototypeOf(obj));
  for (let key of own_keys) {
    if (key === "constructor") continue;
    if (key.startsWith("__")) continue;
    keys.push(key);
  }
  return keys;
}

function find_descriptor(obj, key) {
  let proto = Object.getPrototypeOf(obj);
  while (proto && proto !== Object.prototype) {
    let descriptor = Object.getOwnPropertyDescriptor(proto, key);
    if (descriptor) return descriptor;
    proto = Object.getPrototypeOf(proto);
  }
  return undefined;
}

function assign_handler_value(obj, target, key, value) {
  if (PROTECTED_KEYS.has(key)) return;
  let descriptor = find_descriptor(obj, key);
  if (!descriptor || "value" in descriptor) {
    obj[key] = value;
    return;
  }
  if (descriptor.set) {
    descriptor.set.call(obj, value);
    return;
  }
  if (descriptor.get && target === globalThis) {
    try {
      Object.defineProperty(target, key, {
        value: value,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
    catch {}
  }
}

const INHERITED_OBJECT_KEYS = new Set([
  "constructor",
  "toString",
  "toLocaleString",
  "valueOf",
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__"
]);

export function create_obj_proxy(obj, ctx_vars, target) {
  let proxies = new Map();

  return new Proxy(target, {
    get: (_, key) => {
      if (!INHERITED_OBJECT_KEYS.has(key) && typeof obj[key] !== "undefined")
        return obj[key];
      if (typeof target[key] === "function" && !target[key].prototype) {
        if (!proxies.has(key)) 
          proxies.set(key, create_func_proxy(target, target[key]))
        return proxies.get(key)
      }
      return target[key];
    },
    set: (_, key, value) => {
      try {
        if (ctx_vars.includes(key))
          assign_handler_value(obj, target, key, value);
        else
          target[key] = value;
      }
      catch (e) {
        if (!(e instanceof TypeError) || !GETTER_ONLY_ERROR.test(String(e.message))) throw e;
      }
      return true;
    }
  });
}

function safe_frame(real, owner) {
  if (!real) return owner.__proxy__;
  try {
    void real.document;
    return real;
  }
  catch {}

  let own_keys = {
    history: () => owner.history,
    location: () => owner.location,
    document: () => owner.document,
    parent: () => proxy,
    top: () => proxy,
    self: () => proxy,
    window: () => proxy,
    frames: () => proxy,
    origin: () => owner.origin,
    length: () => 0,
    closed: () => false,
    opener: () => null
  };
  let proxy = new Proxy({}, {
    get(target, key) {
      if (typeof key === "string" && key in own_keys) return own_keys[key]();
      if (key === "postMessage") {
        return (...args) => real.postMessage(...args);
      }
      try {
        let value = real[key];
        return typeof value === "function" ? value.bind(real) : value;
      }
      catch {
        return undefined;
      }
    },
    set() {
      return true;
    },
    has(target, key) {
      return typeof key === "string" && key in own_keys;
    }
  });
  return proxy;
}

export class CustomCTX {
  constructor() {
    ctx_vars.push(...get_handler_keys(this));
    this.__proxy__ = create_obj_proxy(this, ctx_vars, globalThis);
  }

  set location(value) {internal.location.assign(value)}
  get location() {return internal.location}

  set self(value) {internal.self = value}
  get self() {return internal.self}
  set globalThis(value) {internal.globalThis = value}
  get globalThis() {return internal.globalThis}

  get window() {return is_worker ? undefined : this.__proxy__}
  get origin() {return this.location.origin}
  get document() {return is_worker ? undefined : intercept.document.__proxy__}
  get parent() {
    if (is_worker) return undefined;
    if (loader.is_iframe)
      return safe_frame(globalThis.parent, this);
    return this.__proxy__;
  }
  get opener() {
    if (is_worker) return undefined;
    let real = globalThis.opener;
    if (!real) return null;
    return safe_frame(real, this);
  }
  get top() {
    if (is_worker) return undefined;
    if (loader.is_iframe)
      return safe_frame(globalThis.parent, this);
    return this.__proxy__;
  }

  fetch() {return polyfill.fetch(...arguments)}
  get URL() {return polyfill.FakeURL}
  get Request() {return polyfill.FakeRequest}
  get Worker() {return polyfill.FakeWorker}
  get importScripts() {return is_worker ? polyfill.fakeImportScripts : undefined}
  get XMLHttpRequest() {return polyfill.FakeXMLHttpRequest}
  get history() {return internal.history}

  get localStorage() {return internal.localStorage}
  get sessionStorage() {return internal.sessionStorage}
  get WebSocket() {return network.WebSocket}
  get EventSource() {return polyfill.FakeEventSource}

  open(url, target, features) {
    let text = url === undefined || url === null ? "" : String(url);
    if (OPEN_IN_FRAME && text !== "" && !is_worker) {
      try {
        let resolved = new URL(text, document_base());
        if (resolved.protocol === "http:" || resolved.protocol === "https:") {
          loader.navigate(loader.frame_id, resolved.href);
          return null;
        }
      }
      catch {}
    }
    return intercept.cross_origin.wrap_window(Reflect.apply(globalThis.open, globalThis, [url, target, features]));
  }

  eval(js) {
    return run_script(String(js));
  }

  __get_this__(this_obj) {
    if (this_obj === globalThis)
      return ctx.__proxy__;
    return this_obj;
  }

  __get_var__(var_value, var_name) {
    let global_obj = globalThis[var_name];
    if (var_value === global_obj) 
      return ctx.__proxy__[var_name];
    else 
      return var_value;
  }
}

export const ctx = new CustomCTX();

export function proxy_function(target, key, apply_callback) {
  if (!target) return;
  target[key] = new Proxy(target[key], {apply: apply_callback});
}

export function wrap_function(key, wrapper, target) {
  wrapper[key] = new Proxy(target[key], {
    apply: function(func_target, this_arg, arguments_list) {
      return Reflect.apply(func_target, target, arguments_list);
    }
  });
}

export function wrap_obj(wrapper, target) {
  wrapper.__target__ = target;
  let wrapper_proto = Object.getPrototypeOf(wrapper);
  let target_keys = Reflect.ownKeys(target);
  let target_proto = Object.getPrototypeOf(target);
  while (target_proto != null) {
    target_keys.push(...Reflect.ownKeys(target_proto));
    target_proto = Object.getPrototypeOf(target_proto);
  }

  let exclude = ["eval"];
  for (let key of target_keys) {
    if (wrapper_proto.hasOwnProperty(key)) continue;
    if (key === "__proto__") continue;
    if (exclude.includes(key)) continue;
    try {
      if (typeof target[key] === "function") {
        wrap_function(key, wrapper, target);
        continue;
      }
      try {
        wrapper[key] = target[key];
      }
      catch {
        Object.defineProperty(wrapper, key, {
          configurable: true,
          value: target[key],
          writable: true
        })
      }
    }
    catch (e) {
      if (e instanceof DOMException) continue;
      if (e instanceof TypeError) continue;
    }
  }
}

function install_storage_getters() {
  if (is_worker) return;
  for (let key of ["localStorage", "sessionStorage"]) {
    try {
      Object.defineProperty(globalThis, key, {
        configurable: true,
        enumerable: true,
        get: () => internal[key]
      });
    }
    catch {}
  }
}

function install_cache_stub() {
  let cache = {
    match: async () => undefined,
    matchAll: async () => [],
    add: async () => {},
    addAll: async () => {},
    put: async () => {},
    delete: async () => false,
    keys: async () => []
  };
  let storage = {
    open: async () => cache,
    has: async () => false,
    delete: async () => false,
    keys: async () => [],
    match: async () => undefined
  };
  try {
    Object.defineProperty(globalThis, "caches", {
      configurable: true,
      enumerable: true,
      get: () => storage
    });
  }
  catch {}
}

const NAVIGATION_GLOBALS = [
  "navigation",
  "Navigation",
  "NavigationHistoryEntry",
  "NavigationTransition",
  "NavigationDestination",
  "NavigationCurrentEntryChangeEvent",
  "NavigateEvent",
  "NavigationActivation"
];

// Sites feature-detect the Navigation API with `"navigation" in window` (as well
// as typeof checks) and then expect it to work. Sandstone drives navigation
// itself, so the API has to look absent: the properties are removed from the
// whole prototype chain instead of just being set to undefined, which would
// leave `in` returning true and make pages (e.g. DuckDuckGo) take a code path
// that crashes.
function hide_navigation_api() {
  if (is_worker) return;
  for (let key of NAVIGATION_GLOBALS) {
    let target = globalThis;
    while (target && target !== Object.prototype) {
      try {
        delete target[key];
      }
      catch {}
      target = Object.getPrototypeOf(target);
    }
    if (key in globalThis) {
      try {
        Object.defineProperty(globalThis, key, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: undefined
        });
      }
      catch {}
    }
  }
}

function install_service_worker_stub() {
  if (is_worker || typeof Navigator === "undefined") return;
  let stub = {
    controller: null,
    ready: new Promise(() => {}),
    register: () => Promise.reject(new DOMException("Service workers are not available", "SecurityError")),
    getRegistration: () => Promise.resolve(undefined),
    getRegistrations: () => Promise.resolve([]),
    startMessages: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  };
  try {
    Object.defineProperty(Navigator.prototype, "serviceWorker", {
      configurable: true,
      enumerable: true,
      get: () => stub
    });
  }
  catch {}
}

export function update_ctx() {
  internal.location = new polyfill.FakeLocation();
  internal.self = ctx.__proxy__;
  internal.globalThis = ctx.__proxy__;
  internal.history = new polyfill.FakeHistory();
  internal.localStorage = new polyfill.FakeStorage("local");
  internal.sessionStorage = new polyfill.FakeStorage("session");
  internal.cookie_jar = new polyfill.FakeCookieJar();
  install_cache_stub();
  install_storage_getters();
  hide_navigation_api();
  install_service_worker_stub();
  intercept.media_diagnostics.install();

  globalThis.__ctx__ = ctx.__proxy__;
  globalThis.__get_this__ = ctx.__get_this__;
  globalThis.__get_var__ = ctx.__get_var__;

  ready = true;
}

export function get_cookie_jar() {
  return internal.cookie_jar;
}

export function convert_url(url, base) {
  let url_obj = new URL(url, base);
  return url_obj.href;
}

export function run_script_safe(js) {
  try {
    run_script(js);
  }
  catch (e) {
    console.error(e);
  }
}

export function run_script(js) {
  let rewritten_js = parser.rewrite_js(js);
  return eval?.(rewritten_js);
}

export function intercept_property(target, key, handler) {
  let descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), key);
  if (!descriptor) return;
  Object.defineProperty(target, key, handler);
  return descriptor;
}
