const wrappers = new WeakMap();

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

export function wrap_window(real) {
  if (!real || (typeof real !== "object" && typeof real !== "function")) return real;
  if (!is_cross_origin(real)) return real;
  if (wrappers.has(real)) return wrappers.get(real);
  let wrapper = new Proxy(real, {
    get(target, key) {
      if (key === "document") return null;
      try {
        let value = Reflect.get(target, key);
        return typeof value === "function" ? value.bind(target) : value;
      }
      catch {
        return undefined;
      }
    },
    set(target, key, value) {
      try {
        return Reflect.set(target, key, value);
      }
      catch {
        return true;
      }
    },
    has(target, key) {
      if (key === "document") return true;
      try {
        return Reflect.has(target, key);
      }
      catch {
        return false;
      }
    }
  });
  wrappers.set(real, wrapper);
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
