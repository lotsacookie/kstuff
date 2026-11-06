import * as loader from "../loader.mjs";

export class FakeStorage {
  #map;
  #mode;
  #pending_sync;

  constructor(mode) {
    this.#map = new Map();
    this.#mode = mode;
    this.#pending_sync = false;

    return new Proxy(this, {
      get: (target, key, receiver) => {
        if (typeof this[key] === "function")
          return this[key].bind(this);
        if (typeof key === "string" && this.#map.has(key)) 
          return this.#map.get(key);
        return this[key];
      },
      set: (target, key, value) => {
        if (typeof key === "symbol")
          return Reflect.set(target, key, value);
        this.setItem(key, value);
        return true;
      },
      deleteProperty: (target, key) => {
        if (typeof key === "symbol")
          return Reflect.deleteProperty(target, key);
        this.removeItem(key);
        return true;
      },
      has: (target, key) => {
        if (typeof key === "string" && this.#map.has(key))
          return true;
        return Reflect.has(target, key);
      },
      ownKeys: () => {
        return [...this.#map.keys()];
      },
      getOwnPropertyDescriptor: (target, key) => {
        if (typeof key === "string" && this.#map.has(key)) {
          return {
            value: this.#map.get(key),
            writable: true,
            enumerable: true,
            configurable: true
          };
        }
        return Reflect.getOwnPropertyDescriptor(target, key);
      }
    })
  }

  #push() {
    let storage_entries = [...this.#map];
    if (this.#mode === "local")
      loader.local_storage(loader.frame_id, storage_entries);
    else
      loader.session_storage(loader.frame_id, storage_entries);
  }

  #sync() {
    if (this.#pending_sync) return;
    this.#pending_sync = true;
    setTimeout(() => {
      if (!this.#pending_sync) return;
      this.#pending_sync = false;
      this.#push();
    }, 100);
  }

  _flush() {
    if (!this.#pending_sync) return;
    this.#pending_sync = false;
    this.#push();
  }

  get length() {
    return this.#map.size;
  }

  key(index) {
    let keys = [...this.#map.keys()];
    let value = keys[Number(index)];
    return value === undefined ? null : value;
  }

  clear() {
    this.#map.clear();
    this.#sync();
  }

  getItem(key) {
    let name = key + "";
    return this.#map.has(name) ? this.#map.get(name) : null;
  }

  setItem(key, value) {
    this.#map.set(key+"", value+"");
    this.#sync();
  }
  
  removeItem(key) {
    this.#map.delete(key+"");
    this.#sync();
  }

  _get_entries() {
    return [...this.#map];
  }

  toString() {
    return "[object Storage]";
  }
}
