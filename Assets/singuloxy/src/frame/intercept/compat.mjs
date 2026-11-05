function indexeddb_denied() {
  try {
    if (typeof indexedDB === "undefined" || !indexedDB) return true;
    indexedDB.deleteDatabase("__sandstone_probe__");
    return false;
  }
  catch {
    return true;
  }
}

function dom_error(name, message) {
  return new DOMException(message || name, name);
}

function key_type(key) {
  if (typeof key === "number") return Number.isNaN(key) ? -1 : 1;
  if (key instanceof Date) return Number.isNaN(key.getTime()) ? -1 : 2;
  if (typeof key === "string") return 3;
  if (key instanceof ArrayBuffer || ArrayBuffer.isView(key)) return 4;
  if (Array.isArray(key)) return key.every((item) => key_type(item) > 0) ? 5 : -1;
  return -1;
}

function valid_key(key) {
  return key_type(key) > 0;
}

function as_bytes(key) {
  if (key instanceof ArrayBuffer) return new Uint8Array(key);
  return new Uint8Array(key.buffer, key.byteOffset, key.byteLength);
}

function compare_keys(a, b) {
  let type_a = key_type(a);
  let type_b = key_type(b);
  if (type_a !== type_b) return type_a < type_b ? -1 : 1;
  if (type_a === 2) {
    a = a.getTime();
    b = b.getTime();
  }
  if (type_a === 4) {
    let bytes_a = as_bytes(a);
    let bytes_b = as_bytes(b);
    let length = Math.min(bytes_a.length, bytes_b.length);
    for (let i = 0; i < length; i++) {
      if (bytes_a[i] !== bytes_b[i]) return bytes_a[i] < bytes_b[i] ? -1 : 1;
    }
    return bytes_a.length === bytes_b.length ? 0 : bytes_a.length < bytes_b.length ? -1 : 1;
  }
  if (type_a === 5) {
    let length = Math.min(a.length, b.length);
    for (let i = 0; i < length; i++) {
      let result = compare_keys(a[i], b[i]);
      if (result !== 0) return result;
    }
    return a.length === b.length ? 0 : a.length < b.length ? -1 : 1;
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

function clone_key(key) {
  if (Array.isArray(key)) return key.map(clone_key);
  if (key instanceof Date) return new Date(key.getTime());
  return key;
}

function get_path(value, path) {
  if (Array.isArray(path)) return path.map((part) => get_path(value, part));
  if (path === "") return value;
  let current = value;
  for (let part of path.split(".")) {
    if (current === null || current === undefined || typeof current !== "object") return undefined;
    current = current[part];
    if (current === undefined) return undefined;
  }
  return current;
}

function set_path(value, path, key) {
  let parts = path.split(".");
  let current = value;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] === undefined || typeof current[parts[i]] !== "object") current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = key;
}

function is_range(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date) &&
    "lowerOpen" in value && "upperOpen" in value;
}

function to_range(query) {
  if (query === undefined || query === null) return null;
  if (is_range(query)) return query;
  if (!valid_key(query)) throw dom_error("DataError", "The parameter is not a valid key.");
  return {lower: query, upper: query, lowerOpen: false, upperOpen: false};
}

function required_range(query) {
  if (query === undefined || query === null) throw dom_error("DataError", "A key or key range is required.");
  return to_range(query);
}

function in_range(range, key) {
  if (!range) return true;
  if (range.lower !== undefined && range.lower !== null) {
    let result = compare_keys(key, range.lower);
    if (result < 0 || (result === 0 && range.lowerOpen)) return false;
  }
  if (range.upper !== undefined && range.upper !== null) {
    let result = compare_keys(key, range.upper);
    if (result > 0 || (result === 0 && range.upperOpen)) return false;
  }
  return true;
}

function all_args(query, count) {
  if (
    query && typeof query === "object" && !Array.isArray(query) && !(query instanceof Date) && !is_range(query) &&
    ("query" in query || "count" in query || "direction" in query)
  ) {
    return [query.query, query.count];
  }
  return [query, count];
}

function locate(entries, key) {
  let low = 0;
  let high = entries.length;
  while (low < high) {
    let mid = (low + high) >> 1;
    if (compare_keys(entries[mid].key, key) < 0) low = mid + 1;
    else high = mid;
  }
  return {index: low, found: low < entries.length && compare_keys(entries[low].key, key) === 0};
}

function index_keys(definition, value) {
  let key = get_path(value, definition.keyPath);
  if (key === undefined) return [];
  if (definition.multiEntry && Array.isArray(key)) {
    let output = [];
    for (let item of key) {
      if (valid_key(item) && !output.some((other) => compare_keys(item, other) === 0)) output.push(item);
    }
    return output;
  }
  return valid_key(key) ? [key] : [];
}

function string_list(items) {
  let list = [...items].sort();
  Object.defineProperty(list, "contains", {value: (name) => list.includes(name)});
  Object.defineProperty(list, "item", {value: (index) => (index < list.length ? list[index] : null)});
  return list;
}

function fire(target, type, props, init) {
  let event = new Event(type, init || {});
  if (props) {
    for (let key of Object.keys(props)) {
      Object.defineProperty(event, key, {value: props[key], configurable: true});
    }
  }
  target.dispatchEvent(event);
  return event;
}

function snapshot_stores(entry) {
  let copy = new Map();
  for (let [name, store] of entry.stores) {
    copy.set(name, {...store, entries: store.entries.slice(), indexes: new Map(store.indexes)});
  }
  return copy;
}

class Target extends EventTarget {
  constructor(types) {
    super();
    for (let type of types) {
      this["on" + type] = null;
      this.addEventListener(type, (event) => {
        let handler = this["on" + type];
        if (typeof handler === "function") handler.call(this, event);
      });
    }
  }
}

class MemRequest extends Target {
  constructor(source, transaction) {
    super(["success", "error", "upgradeneeded", "blocked"]);
    this.readyState = "pending";
    this.result = undefined;
    this.error = null;
    this.source = source || null;
    this.transaction = transaction || null;
  }
}

const registry = new Map();

class MemTransaction extends Target {
  constructor(entry, db, names, mode) {
    super(["abort", "complete", "error"]);
    this.db = db;
    this.mode = mode;
    this.durability = "default";
    this.error = null;
    this.__entry = entry;
    this.__names = names;
    this.__pending = 0;
    this.__done = false;
    this.__aborted = false;
    this.__scheduled = false;
    this.__handles = new Map();
    this.__on_finish = null;
    this.__old_version = entry.version;
    this.__snapshot = mode === "readonly" ? null : snapshot_stores(entry);
    this.__check();
  }

  get objectStoreNames() {
    return string_list(this.__names || this.__entry.stores.keys());
  }

  objectStore(name) {
    name = String(name);
    if (this.__done) throw dom_error("InvalidStateError", "The transaction has finished.");
    if ((this.__names && !this.__names.includes(name)) || !this.__entry.stores.has(name)) {
      throw dom_error("NotFoundError", "The requested object store was not found.");
    }
    if (!this.__handles.has(name)) this.__handles.set(name, new MemObjectStore(this, name));
    return this.__handles.get(name);
  }

  abort() {
    if (this.__done) throw dom_error("InvalidStateError", "The transaction has finished.");
    this.__abort(null);
  }

  commit() {
    if (this.__done) throw dom_error("InvalidStateError", "The transaction has finished.");
    this.__check();
  }

  __request(source, work) {
    let request = new MemRequest(source, this);
    this.__enqueue(request, work);
    return request;
  }

  __enqueue(request, work) {
    if (this.__done) throw dom_error("TransactionInactiveError", "The transaction is not active.");
    this.__pending++;
    Promise.resolve().then(() => this.__execute(request, work));
  }

  __execute(request, work) {
    let result;
    let error = null;
    if (this.__aborted) {
      error = dom_error("AbortError", "The transaction was aborted.");
    }
    else {
      try {
        result = work();
      }
      catch (e) {
        error = e instanceof DOMException ? e : dom_error("UnknownError", String((e && e.message) || e));
      }
    }
    request.readyState = "done";
    if (error) {
      request.result = undefined;
      request.error = error;
      let event = fire(request, "error", null, {bubbles: true, cancelable: true});
      if (!event.defaultPrevented) this.__abort(error);
    }
    else {
      request.result = result;
      request.error = null;
      fire(request, "success");
    }
    this.__pending--;
    this.__check();
  }

  __check() {
    if (this.__scheduled || this.__done) return;
    this.__scheduled = true;
    setTimeout(() => {
      this.__scheduled = false;
      if (this.__pending > 0 || this.__done) return;
      this.__done = true;
      fire(this, "complete");
      if (this.__on_finish) this.__on_finish(false);
    }, 0);
  }

  __abort(error) {
    if (this.__done) return;
    this.__done = true;
    this.__aborted = true;
    this.error = error || null;
    if (this.__snapshot) {
      this.__entry.stores = this.__snapshot;
      this.__entry.version = this.__old_version;
    }
    fire(this, "abort", null, {bubbles: true});
    if (this.__on_finish) this.__on_finish(true);
  }
}

class Source {
  __list() {
    return [];
  }

  get(query) {
    let range = required_range(query);
    return this.tx.__request(this, () => {
      let list = this.__list(range);
      return list.length ? structuredClone(list[0].value) : undefined;
    });
  }

  getKey(query) {
    let range = required_range(query);
    return this.tx.__request(this, () => {
      let list = this.__list(range);
      return list.length ? clone_key(list[0].primary) : undefined;
    });
  }

  getAll(query, count) {
    [query, count] = all_args(query, count);
    let range = to_range(query);
    return this.tx.__request(this, () => {
      let list = this.__list(range);
      if (count) list = list.slice(0, count);
      return list.map((entry) => structuredClone(entry.value));
    });
  }

  getAllKeys(query, count) {
    [query, count] = all_args(query, count);
    let range = to_range(query);
    return this.tx.__request(this, () => {
      let list = this.__list(range);
      if (count) list = list.slice(0, count);
      return list.map((entry) => clone_key(entry.primary));
    });
  }

  count(query) {
    let range = to_range(query);
    return this.tx.__request(this, () => this.__list(range).length);
  }

  openCursor(query, direction) {
    return this.__open_cursor(query, direction, false);
  }

  openKeyCursor(query, direction) {
    return this.__open_cursor(query, direction, true);
  }

  __open_cursor(query, direction, keys_only) {
    direction = direction || "next";
    if (!["next", "nextunique", "prev", "prevunique"].includes(direction)) throw new TypeError("Invalid cursor direction.");
    let range = to_range(query);
    let request = new MemRequest(this, this.tx);
    let cursor = null;
    this.tx.__enqueue(request, () => {
      let entries = this.__list(range);
      if (direction.endsWith("unique")) {
        entries = entries.filter((entry, i) => i === 0 || compare_keys(entries[i - 1].key, entry.key) !== 0);
      }
      if (direction.startsWith("prev")) entries.reverse();
      cursor = new MemCursor(this, request, direction, keys_only, entries);
      return cursor.__move(1);
    });
    return request;
  }
}

class MemObjectStore extends Source {
  constructor(tx, name) {
    super();
    this.tx = tx;
    this.name = name;
    this.__index_handles = new Map();
  }

  get __s() {
    let store = this.tx.__entry.stores.get(this.name);
    if (!store) throw dom_error("InvalidStateError", "The object store has been deleted.");
    return store;
  }

  get keyPath() {
    return this.__s.keyPath;
  }

  get autoIncrement() {
    return this.__s.autoIncrement;
  }

  get indexNames() {
    return string_list(this.__s.indexes.keys());
  }

  get transaction() {
    return this.tx;
  }

  __list(range) {
    return this.__s.entries
      .filter((entry) => in_range(range, entry.key))
      .map((entry) => ({key: entry.key, primary: entry.key, value: entry.value}));
  }

  __writable() {
    if (this.tx.mode === "readonly") throw dom_error("ReadOnlyError", "The transaction is read-only.");
  }

  add(value, key) {
    this.__writable();
    return this.tx.__request(this, () => this.__do_put(value, key, true));
  }

  put(value, key) {
    this.__writable();
    return this.tx.__request(this, () => this.__do_put(value, key, false));
  }

  delete(query) {
    this.__writable();
    let range = required_range(query);
    return this.tx.__request(this, () => {
      this.__do_delete(range);
      return undefined;
    });
  }

  clear() {
    this.__writable();
    return this.tx.__request(this, () => {
      this.__s.entries = [];
      return undefined;
    });
  }

  createIndex(name, key_path, options) {
    if (this.tx.mode !== "versionchange") throw dom_error("InvalidStateError", "Indexes can only be created during an upgrade.");
    name = String(name);
    let store = this.__s;
    if (store.indexes.has(name)) throw dom_error("ConstraintError", "An index with that name already exists.");
    options = options || {};
    store.indexes.set(name, {
      name: name,
      keyPath: key_path,
      unique: !!options.unique,
      multiEntry: !!options.multiEntry
    });
    return this.index(name);
  }

  deleteIndex(name) {
    if (this.tx.mode !== "versionchange") throw dom_error("InvalidStateError", "Indexes can only be deleted during an upgrade.");
    if (!this.__s.indexes.delete(String(name))) throw dom_error("NotFoundError", "The index was not found.");
    this.__index_handles.delete(String(name));
  }

  index(name) {
    name = String(name);
    if (!this.__s.indexes.has(name)) throw dom_error("NotFoundError", "The index was not found.");
    if (!this.__index_handles.has(name)) this.__index_handles.set(name, new MemIndex(this, name));
    return this.__index_handles.get(name);
  }

  __do_put(value, key, no_overwrite) {
    let store = this.__s;
    let copy = structuredClone(value);
    let primary;
    if (store.keyPath !== null) {
      if (key !== undefined) throw dom_error("DataError", "The object store uses in-line keys.");
      primary = get_path(copy, store.keyPath);
      if (primary === undefined) {
        if (!store.autoIncrement || typeof store.keyPath !== "string") throw dom_error("DataError", "No key could be extracted from the value.");
        primary = store.next;
        set_path(copy, store.keyPath, primary);
      }
    }
    else {
      primary = key;
      if (primary === undefined) {
        if (!store.autoIncrement) throw dom_error("DataError", "A key is required.");
        primary = store.next;
      }
    }
    if (!valid_key(primary)) throw dom_error("DataError", "The key is not valid.");
    primary = clone_key(primary);
    for (let definition of store.indexes.values()) {
      if (!definition.unique) continue;
      for (let index_key of index_keys(definition, copy)) {
        for (let other of store.entries) {
          if (compare_keys(other.key, primary) === 0) continue;
          if (index_keys(definition, other.value).some((existing) => compare_keys(existing, index_key) === 0)) {
            throw dom_error("ConstraintError", "A unique index constraint was violated.");
          }
        }
      }
    }
    let position = locate(store.entries, primary);
    if (position.found && no_overwrite) throw dom_error("ConstraintError", "A record with that key already exists.");
    if (position.found) store.entries[position.index] = {key: primary, value: copy};
    else store.entries.splice(position.index, 0, {key: primary, value: copy});
    if (store.autoIncrement && typeof primary === "number" && primary >= store.next) store.next = Math.floor(primary) + 1;
    return clone_key(primary);
  }

  __do_delete(range) {
    let store = this.__s;
    store.entries = store.entries.filter((entry) => !in_range(range, entry.key));
  }
}

class MemIndex extends Source {
  constructor(store, name) {
    super();
    this.objectStore = store;
    this.tx = store.tx;
    this.name = name;
  }

  get __def() {
    let definition = this.objectStore.__s.indexes.get(this.name);
    if (!definition) throw dom_error("InvalidStateError", "The index has been deleted.");
    return definition;
  }

  get keyPath() {
    return this.__def.keyPath;
  }

  get unique() {
    return this.__def.unique;
  }

  get multiEntry() {
    return this.__def.multiEntry;
  }

  __list(range) {
    let definition = this.__def;
    let output = [];
    for (let entry of this.objectStore.__s.entries) {
      for (let index_key of index_keys(definition, entry.value)) {
        if (in_range(range, index_key)) output.push({key: index_key, primary: entry.key, value: entry.value});
      }
    }
    output.sort((a, b) => compare_keys(a.key, b.key) || compare_keys(a.primary, b.primary));
    return output;
  }
}

class MemCursor {
  constructor(source, request, direction, keys_only, entries) {
    this.source = source;
    this.direction = direction;
    this.key = undefined;
    this.primaryKey = undefined;
    if (!keys_only) this.value = undefined;
    this.request = request;
    this.__entries = entries;
    this.__pos = -1;
    this.__keys_only = keys_only;
  }

  __move(count, key) {
    let reverse = this.direction.startsWith("prev");
    let list = this.__entries;
    let position = this.__pos + count;
    if (key !== undefined) {
      if (!valid_key(key)) throw dom_error("DataError", "The key is not valid.");
      while (position < list.length) {
        let result = compare_keys(list[position].key, key);
        if (reverse ? result <= 0 : result >= 0) break;
        position++;
      }
    }
    if (position >= list.length) {
      this.__pos = list.length;
      this.key = undefined;
      this.primaryKey = undefined;
      if (!this.__keys_only) this.value = undefined;
      return null;
    }
    this.__pos = position;
    let entry = list[position];
    this.key = clone_key(entry.key);
    this.primaryKey = clone_key(entry.primary);
    if (!this.__keys_only) this.value = structuredClone(entry.value);
    return this;
  }

  __ready() {
    if (this.request.readyState !== "done" || this.__pos >= this.__entries.length) {
      throw dom_error("InvalidStateError", "The cursor is not in a valid state.");
    }
  }

  __store() {
    return this.source instanceof MemIndex ? this.source.objectStore : this.source;
  }

  continue(key) {
    this.__ready();
    this.request.readyState = "pending";
    this.source.tx.__enqueue(this.request, () => this.__move(1, key));
  }

  advance(count) {
    this.__ready();
    if (!(count > 0)) throw new TypeError("The advance count must be greater than zero.");
    this.request.readyState = "pending";
    this.source.tx.__enqueue(this.request, () => this.__move(count));
  }

  update(value) {
    this.__ready();
    let store = this.__store();
    store.__writable();
    let primary = this.primaryKey;
    return store.tx.__request(this, () => store.__do_put(value, store.keyPath === null ? primary : undefined, false));
  }

  delete() {
    this.__ready();
    let store = this.__store();
    store.__writable();
    let range = to_range(this.primaryKey);
    return store.tx.__request(this, () => {
      store.__do_delete(range);
      return undefined;
    });
  }
}

class MemDatabase extends Target {
  constructor(entry, name, version) {
    super(["abort", "close", "error", "versionchange"]);
    this.name = name;
    this.version = version;
    this.__entry = entry;
    this.__closed = false;
    this.__upgrade = null;
  }

  get objectStoreNames() {
    return string_list(this.__entry.stores.keys());
  }

  transaction(names, mode) {
    if (this.__closed) throw dom_error("InvalidStateError", "The database connection is closing.");
    if (this.__upgrade && !this.__upgrade.__done) throw dom_error("InvalidStateError", "An upgrade transaction is running.");
    let list = typeof names === "string" ? [names] : Array.from(names);
    if (list.length === 0) throw dom_error("InvalidAccessError", "At least one object store is required.");
    for (let name of list) {
      if (!this.__entry.stores.has(String(name))) throw dom_error("NotFoundError", "The requested object store was not found.");
    }
    mode = mode === undefined ? "readonly" : mode;
    if (mode !== "readonly" && mode !== "readwrite") throw new TypeError("Invalid transaction mode.");
    return new MemTransaction(this.__entry, this, list.map(String), mode);
  }

  createObjectStore(name, options) {
    let upgrade = this.__upgrade;
    if (!upgrade || upgrade.__done) throw dom_error("InvalidStateError", "Object stores can only be created during an upgrade.");
    name = String(name);
    if (this.__entry.stores.has(name)) throw dom_error("ConstraintError", "An object store with that name already exists.");
    options = options || {};
    let key_path = options.keyPath === undefined ? null : options.keyPath;
    this.__entry.stores.set(name, {
      name: name,
      keyPath: key_path,
      autoIncrement: !!options.autoIncrement,
      next: 1,
      entries: [],
      indexes: new Map()
    });
    return upgrade.objectStore(name);
  }

  deleteObjectStore(name) {
    let upgrade = this.__upgrade;
    if (!upgrade || upgrade.__done) throw dom_error("InvalidStateError", "Object stores can only be deleted during an upgrade.");
    name = String(name);
    if (!this.__entry.stores.delete(name)) throw dom_error("NotFoundError", "The object store was not found.");
    upgrade.__handles.delete(name);
  }

  close() {
    this.__closed = true;
    this.__entry.connections.delete(this);
  }
}

function close_connections(entry, old_version, new_version) {
  for (let connection of [...entry.connections]) {
    if (connection.__closed) continue;
    fire(connection, "versionchange", {oldVersion: old_version, newVersion: new_version});
  }
  for (let connection of [...entry.connections]) {
    connection.__closed = true;
    entry.connections.delete(connection);
  }
}

class MemFactory {
  open(name, version) {
    if (arguments.length === 0) throw new TypeError("A database name is required.");
    name = String(name);
    if (version !== undefined) {
      version = Number(version);
      if (!Number.isInteger(version) || version < 1) throw new TypeError("The version must be a positive integer.");
    }
    let request = new MemRequest(null, null);
    Promise.resolve().then(() => {
      let entry = registry.get(name);
      let old_version = entry ? entry.version : 0;
      let target = version === undefined ? old_version || 1 : version;
      let fail = (error) => {
        request.readyState = "done";
        request.result = undefined;
        request.error = error;
        fire(request, "error", null, {bubbles: true, cancelable: true});
      };
      if (entry && target < old_version) {
        fail(dom_error("VersionError", "The requested version is less than the existing version."));
        return;
      }
      if (!entry) {
        entry = {name: name, version: 0, stores: new Map(), connections: new Set()};
        registry.set(name, entry);
      }
      let db = new MemDatabase(entry, name, target);
      if (target <= old_version) {
        entry.connections.add(db);
        request.readyState = "done";
        request.result = db;
        fire(request, "success");
        return;
      }
      if (entry.connections.size > 0) {
        close_connections(entry, old_version, target);
      }
      entry.connections.add(db);
      let upgrade = new MemTransaction(entry, db, null, "versionchange");
      db.__upgrade = upgrade;
      entry.version = target;
      request.readyState = "done";
      request.result = db;
      request.transaction = upgrade;
      upgrade.__on_finish = (aborted) => {
        request.transaction = null;
        if (aborted) {
          db.__closed = true;
          entry.connections.delete(db);
          if (entry.version === 0) registry.delete(name);
          request.result = undefined;
          request.error = dom_error("AbortError", "The upgrade transaction was aborted.");
          fire(request, "error", null, {bubbles: true, cancelable: true});
        }
        else {
          request.result = db;
          request.error = null;
          fire(request, "success");
        }
      };
      fire(request, "upgradeneeded", {oldVersion: old_version, newVersion: target});
      upgrade.__check();
    });
    return request;
  }

  deleteDatabase(name) {
    if (arguments.length === 0) throw new TypeError("A database name is required.");
    name = String(name);
    let request = new MemRequest(null, null);
    Promise.resolve().then(() => {
      let entry = registry.get(name);
      let old_version = entry ? entry.version : 0;
      if (entry) {
        close_connections(entry, old_version, null);
        registry.delete(name);
      }
      request.readyState = "done";
      request.result = undefined;
      fire(request, "success", {oldVersion: old_version, newVersion: null});
    });
    return request;
  }

  databases() {
    let list = [];
    for (let entry of registry.values()) {
      if (entry.version > 0) list.push({name: entry.name, version: entry.version});
    }
    return Promise.resolve(list);
  }

  cmp(a, b) {
    if (!valid_key(a) || !valid_key(b)) throw dom_error("DataError", "The key is not valid.");
    return compare_keys(a, b);
  }
}

function install_key_range_fallback() {
  if (typeof globalThis.IDBKeyRange !== "undefined") return;
  class KeyRange {
    constructor(lower, upper, lower_open, upper_open) {
      this.lower = lower;
      this.upper = upper;
      this.lowerOpen = !!lower_open;
      this.upperOpen = !!upper_open;
    }

    includes(key) {
      return in_range(this, key);
    }

    static only(value) {
      return new KeyRange(value, value, false, false);
    }

    static lowerBound(lower, open) {
      return new KeyRange(lower, undefined, open, true);
    }

    static upperBound(upper, open) {
      return new KeyRange(undefined, upper, true, open);
    }

    static bound(lower, upper, lower_open, upper_open) {
      return new KeyRange(lower, upper, lower_open, upper_open);
    }
  }
  try {
    Object.defineProperty(globalThis, "IDBKeyRange", {configurable: true, writable: true, value: KeyRange});
  }
  catch {}
}

function install_indexed_db_fallback() {
  if (typeof globalThis.document === "undefined") return;
  if (!indexeddb_denied()) return;

  let factory = new MemFactory();
  try {
    Object.defineProperty(globalThis, "indexedDB", {
      configurable: true,
      enumerable: true,
      get: () => factory
    });
  }
  catch {}
  install_key_range_fallback();
}

function install_blank_iframe_access() {
  if (typeof globalThis.document === "undefined" || typeof HTMLIFrameElement === "undefined") return;
  let descriptor = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "contentWindow");
  if (!descriptor || !descriptor.get) return;

  let wrappers = new WeakMap();
  let native_get_attribute = Element.prototype.getAttribute;

  let is_blank = (element) => {
    try {
      let read = (name) => Reflect.apply(native_get_attribute, element, [name]);
      let src = read("src");
      return !read("__src") && read("__srcdoc") === null && (!src || src === "about:blank");
    }
    catch {
      return false;
    }
  };

  Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", {
    configurable: true,
    enumerable: descriptor.enumerable,
    get: function() {
      let real = descriptor.get.call(this);
      if (!real) return real;
      try {
        if (real.document) return real;
      }
      catch {}
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
        }
      });
      wrappers.set(real, wrapper);
      return wrapper;
    }
  });
}

install_indexed_db_fallback();
install_blank_iframe_access();
