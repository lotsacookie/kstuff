import { ctx, proxy_function, unwrap_this } from "../context.mjs";

const SEPARATOR = "\u0001";

function prefix() {
  try {
    let origin = ctx.location && ctx.location.origin;
    return origin ? origin + SEPARATOR : null;
  }
  catch {
    return null;
  }
}

function unscope(name) {
  let current = prefix();
  if (current && typeof name === "string" && name.startsWith(current)) return name.slice(current.length);
  return name;
}

function install_indexed_db() {
  if (typeof IDBFactory === "undefined") return;

  for (let key of ["open", "deleteDatabase"]) {
    proxy_function(IDBFactory.prototype, key, (func, this_arg, args) => {
      let list = [...args];
      let current = prefix();
      if (current && list.length > 0) list[0] = current + String(list[0]);
      return Reflect.apply(func, unwrap_this(this_arg), list);
    });
  }

  if (typeof IDBFactory.prototype.databases === "function") {
    proxy_function(IDBFactory.prototype, "databases", async (func, this_arg, args) => {
      let list = await Reflect.apply(func, unwrap_this(this_arg), args);
      let current = prefix();
      if (!current) return list;
      return list
        .filter((entry) => typeof entry.name === "string" && entry.name.startsWith(current))
        .map((entry) => ({...entry, name: entry.name.slice(current.length)}));
    });
  }

  if (typeof IDBDatabase !== "undefined") {
    let descriptor = Object.getOwnPropertyDescriptor(IDBDatabase.prototype, "name");
    if (descriptor && descriptor.get) {
      Object.defineProperty(IDBDatabase.prototype, "name", {
        configurable: true,
        enumerable: descriptor.enumerable,
        get: function() {
          return unscope(descriptor.get.call(this));
        }
      });
    }
  }
}

function install_broadcast_channel() {
  if (typeof BroadcastChannel === "undefined") return;

  let Native = BroadcastChannel;
  globalThis.BroadcastChannel = new Proxy(Native, {
    construct(target, args) {
      let list = [...args];
      let current = prefix();
      if (current && list.length > 0) list[0] = current + String(list[0]);
      return Reflect.construct(target, list, target);
    }
  });

  let descriptor = Object.getOwnPropertyDescriptor(Native.prototype, "name");
  if (descriptor && descriptor.get) {
    Object.defineProperty(Native.prototype, "name", {
      configurable: true,
      enumerable: descriptor.enumerable,
      get: function() {
        return unscope(descriptor.get.call(this));
      }
    });
  }
}

function install_service_worker_block() {
  if (typeof ServiceWorkerContainer === "undefined") return;

  let proto = ServiceWorkerContainer.prototype;
  proxy_function(proto, "register", () => {
    return Promise.reject(new DOMException("Service workers are not available through the proxy", "SecurityError"));
  });
  proxy_function(proto, "getRegistration", () => Promise.resolve(undefined));
  proxy_function(proto, "getRegistrations", () => Promise.resolve([]));
}

install_indexed_db();
install_broadcast_channel();
install_service_worker_block();
