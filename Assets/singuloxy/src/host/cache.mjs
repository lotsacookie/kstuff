const DB_NAME = "singuloxy-cache-v2";
const OLD_DB_NAME = "singuloxy-cache";
const DB_VERSION = 1;
const META = "meta";
const BLOBS = "blobs";
const TOUCH_INTERVAL_MS = 60 * 1000;
const MERGE_PARTS = 64;
const EVICT_TARGET = 0.9;

const MB = 1024 * 1024;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const options = {
  enabled: true,
  max_bytes: 2048 * MB,
  max_entry_bytes: 512 * MB,
  min_entry_bytes: 1024,
  large_bytes: 5 * MB,
  default_ttl_ms: HOUR,
  large_ttl_ms: 7 * DAY,
  max_ttl_ms: 90 * DAY,
  large_files_ignore_ttl: true
};

const STATIC_EXTENSION = /\.(js|mjs|css|wasm|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot|mp4|webm|m4s|m4a|m4v|mp3|ogg|opus|aac|flac|wav|ts|bin|pak|pck|data|unityweb|zip|gz|br|7z|jar|apk|iso|rom|nes|sfc|gba|gbc|nds|chd|glb|gltf|ktx2?|basis)([?#]|$)/i;
const DENIED_MIME = /^(text\/(html|plain|xml|event-stream)|application\/(json|[\w.+-]*\+json|xml|[\w.+-]*\+xml|x-ndjson|vnd\.apple\.mpegurl|x-mpegurl)|multipart\/)/i;
const ALLOWED_MIME = /^(image|font|audio|video)\/|^text\/css|^(application|text)\/(x-)?javascript|^application\/(wasm|font-woff2?|vnd\.ms-fontobject|x-font-[\w-]+)/i;

let db_promise = null;
let db_failed = false;
let stats_promise = null;
let total_bytes = 0;

function open_db() {
  if (db_failed) return Promise.resolve(null);
  if (db_promise) return db_promise;
  db_promise = new Promise((resolve) => {
    let fail = () => {
      db_failed = true;
      resolve(null);
    };
    if (typeof indexedDB === "undefined" || !indexedDB) {
      fail();
      return;
    }
    let request;
    try {
      try {
        indexedDB.deleteDatabase(OLD_DB_NAME);
      }
      catch {}
      request = indexedDB.open(DB_NAME, DB_VERSION);
    }
    catch {
      fail();
      return;
    }
    request.onupgradeneeded = () => {
      let db = request.result;
      let meta = db.createObjectStore(META, {keyPath: "url"});
      meta.createIndex("last_used", "last_used");
      db.createObjectStore(BLOBS, {keyPath: "url"});
    };
    request.onsuccess = () => {
      let db = request.result;
      db.onversionchange = () => db.close();
      stats_promise = scan(db).catch(() => {});
      resolve(db);
    };
    request.onerror = fail;
    request.onblocked = fail;
  });
  return db_promise;
}

function wrap(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function done(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("transaction aborted"));
  });
}

async function scan(db) {
  let tx = db.transaction(META);
  let sum = 0;
  let expired = [];
  await new Promise((resolve, reject) => {
    let request = tx.objectStore(META).openCursor();
    request.onsuccess = () => {
      let cursor = request.result;
      if (!cursor) {
        resolve();
        return;
      }
      let meta = cursor.value;
      if (meta.expires <= Date.now()) expired.push(meta.url);
      else sum += meta.size;
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
  total_bytes = sum;
  for (let key of expired) await remove_entry(db, key);
}

async function remove_entry(db, key) {
  let tx = db.transaction([META, BLOBS], "readwrite");
  let previous = await wrap(tx.objectStore(META).get(key));
  tx.objectStore(META).delete(key);
  tx.objectStore(BLOBS).delete(key);
  await done(tx);
  if (previous) total_bytes = Math.max(0, total_bytes - previous.size);
}

async function evict_until(db, target, skip_key) {
  let tx = db.transaction(META);
  let index = tx.objectStore(META).index("last_used");
  let victims = [];
  let projected = total_bytes;
  await new Promise((resolve, reject) => {
    let request = index.openCursor();
    request.onsuccess = () => {
      let cursor = request.result;
      if (!cursor || projected <= target) {
        resolve();
        return;
      }
      let meta = cursor.value;
      if (meta.url !== skip_key) {
        victims.push(meta.url);
        projected -= meta.size;
      }
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
  for (let key of victims) await remove_entry(db, key);
}

function cache_key(url) {
  let index = url.indexOf("#");
  return index === -1 ? url : url.slice(0, index);
}

function header_value(headers, name) {
  if (!headers) return "";
  for (let key of Object.keys(headers)) {
    if (key.toLowerCase() === name) return String(headers[key]);
  }
  return "";
}

function request_cacheable(request_options) {
  let method = String(request_options?.method || "GET").toUpperCase();
  if (method !== "GET") return false;
  if (request_options?.body) return false;
  if (header_value(request_options?.headers, "authorization")) return false;
  return true;
}

function parse_cache_control(value) {
  let result = {};
  for (let part of String(value || "").toLowerCase().split(",")) {
    let [name, ...rest] = part.trim().split("=");
    if (name) result[name] = rest.length ? rest.join("=").replace(/"/g, "") : true;
  }
  return result;
}

function parse_range(header, size) {
  let match = /^\s*bytes\s*=\s*(\d*)\s*-\s*(\d*)\s*$/i.exec(header);
  if (!match) return {kind: "full"};
  let first = match[1];
  let last = match[2];
  if (first === "" && last === "") return {kind: "full"};
  let start;
  let end;
  if (first === "") {
    let suffix = Number(last);
    if (suffix === 0) return {kind: "miss"};
    start = Math.max(0, size - suffix);
    end = size - 1;
  }
  else {
    start = Number(first);
    end = last === "" ? size - 1 : Math.min(Number(last), size - 1);
  }
  if (start >= size || start > end) return {kind: "miss"};
  return {kind: "partial", start: start, end: end};
}

function blob_reader(blob) {
  let reader = blob.stream().getReader();
  return {
    read: () => reader.read(),
    cancel: () => reader.cancel()
  };
}

function build_hit(meta, blob, range_header) {
  let size = blob.size;
  let range = range_header ? parse_range(range_header, size) : {kind: "full"};
  if (range.kind === "miss") return null;

  let headers = meta.headers.filter(([name]) => {
    let lower = String(name).toLowerCase();
    return lower !== "content-range" && lower !== "content-length";
  });
  let status = 200;
  let status_text = meta.items.statusText || "OK";
  let body = blob;
  if (range.kind === "partial") {
    status = 206;
    status_text = "Partial Content";
    body = blob.slice(range.start, range.end + 1);
    headers.push(["content-range", `bytes ${range.start}-${range.end}/${size}`]);
  }
  headers.push(["content-length", String(body.size)]);
  if (!headers.some(([name]) => String(name).toLowerCase() === "accept-ranges")) {
    headers.push(["accept-ranges", "bytes"]);
  }
  headers.push(["x-singuloxy-cache", "hit"]);

  return {
    payload: {
      headers: headers,
      items: {...meta.items, ok: true, status: status, statusText: status_text},
      mime_type: meta.mime,
      stream_id: null
    },
    reader: blob_reader(body),
    length: body.size
  };
}

function touch(db, meta) {
  let now = Date.now();
  if (now - meta.last_used < TOUCH_INTERVAL_MS) return;
  meta.last_used = now;
  try {
    let tx = db.transaction(META, "readwrite");
    tx.objectStore(META).put(meta);
    done(tx).catch(() => {});
  }
  catch {}
}

export async function lookup(url, request_options) {
  if (!options.enabled || !request_cacheable(request_options)) return null;
  let db = await open_db();
  if (!db) return null;
  try {
    let key = cache_key(url);
    let meta = await wrap(db.transaction(META).objectStore(META).get(key));
    if (!meta) return null;
    if (meta.expires <= Date.now()) {
      await remove_entry(db, key);
      return null;
    }
    let record = await wrap(db.transaction(BLOBS).objectStore(BLOBS).get(key));
    if (!record || !record.blob) {
      await remove_entry(db, key);
      return null;
    }
    touch(db, meta);
    return build_hit(meta, record.blob, header_value(request_options?.headers, "range"));
  }
  catch {
    return null;
  }
}

function storable(url, mime, size) {
  if (DENIED_MIME.test(mime)) return false;
  if (ALLOWED_MIME.test(mime)) return true;
  if (STATIC_EXTENSION.test(url)) return true;
  return size !== null && size >= options.large_bytes;
}

function freshness(headers, cc, size) {
  let now = Date.now();
  let ttl = null;
  if (cc["max-age"] !== undefined && cc["max-age"] !== true) {
    let seconds = Number(cc["max-age"]);
    if (Number.isFinite(seconds)) ttl = seconds * 1000;
  }
  if (ttl === null && headers.expires) {
    let expires = Date.parse(headers.expires);
    let date = Date.parse(headers.date || "");
    if (Number.isFinite(expires)) ttl = expires - (Number.isFinite(date) ? date : now);
  }
  if (ttl === null) {
    let modified = Date.parse(headers["last-modified"] || "");
    if (Number.isFinite(modified) && modified < now) {
      ttl = Math.min(Math.max((now - modified) * 0.1, HOUR), 7 * DAY);
    }
  }
  let large = size !== null && size >= options.large_bytes;
  if (ttl === null) ttl = large ? options.large_ttl_ms : options.default_ttl_ms;
  if (cc.immutable) ttl = Math.max(ttl, options.large_ttl_ms);
  if (large && options.large_files_ignore_ttl) ttl = Math.max(ttl, options.large_ttl_ms);
  return Math.min(ttl, options.max_ttl_ms);
}

function clean_items(items) {
  let copy = {...items};
  if (Array.isArray(copy.raw_headers)) {
    copy.raw_headers = copy.raw_headers.filter((pair) => !Array.isArray(pair) || String(pair[0]).toLowerCase() !== "set-cookie");
  }
  return copy;
}

export function plan(url, method, request_options, payload, expected) {
  if (!options.enabled || db_failed) return null;
  if (String(method).toUpperCase() !== "GET" || !request_cacheable(request_options)) return null;
  if (header_value(request_options?.headers, "range")) return null;
  if (/no-store/i.test(header_value(request_options?.headers, "cache-control"))) return null;
  if (!/^https?:/i.test(url)) return null;
  if (!payload || !payload.items || payload.items.status !== 200) return null;

  let headers = {};
  for (let [name, value] of payload.headers) headers[String(name).toLowerCase()] = String(value);
  let cc = parse_cache_control(headers["cache-control"]);
  if (cc["no-store"] || cc["private"] || cc["no-cache"]) return null;
  if (/cookie|authorization|\*/i.test(headers.vary || "")) return null;

  let mime = String(payload.mime_type || "").toLowerCase();
  let size = Number.isFinite(expected) ? expected : null;
  if (!storable(url, mime, size)) return null;
  if (size !== null && (size < options.min_entry_bytes || size > options.max_entry_bytes)) return null;

  let ttl = freshness(headers, cc, size);
  if (!(ttl > 0)) return null;

  let encoding = (headers["content-encoding"] || "").toLowerCase();
  return {
    url: cache_key(url),
    ttl: ttl,
    mime: mime,
    expected: size,
    exact: encoding === "" || encoding === "identity",
    headers: payload.headers
      .filter(([name]) => String(name).toLowerCase() !== "set-cookie")
      .map(([name, value]) => [name, value]),
    items: clean_items(payload.items)
  };
}

async function commit(store_plan, blob, size) {
  let db = await open_db();
  if (!db || !options.enabled) return;
  await stats_promise;
  if (size > options.max_bytes) return;
  let key = store_plan.url;
  let now = Date.now();
  let meta = {
    url: key,
    size: size,
    stored: now,
    last_used: now,
    expires: now + store_plan.ttl,
    mime: store_plan.mime,
    headers: store_plan.headers,
    items: store_plan.items
  };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (total_bytes + size > options.max_bytes) {
        await evict_until(db, options.max_bytes * EVICT_TARGET - size, key);
      }
      let tx = db.transaction([META, BLOBS], "readwrite");
      let previous = await wrap(tx.objectStore(META).get(key));
      tx.objectStore(META).put(meta);
      tx.objectStore(BLOBS).put({url: key, blob: blob});
      await done(tx);
      total_bytes += size - (previous ? previous.size : 0);
      return;
    }
    catch (e) {
      if (!e || e.name !== "QuotaExceededError") return;
      await evict_until(db, total_bytes * 0.5, key);
    }
  }
}

export function wrap_reader(reader, store_plan) {
  if (!store_plan) return reader;
  let parts = [];
  let received = 0;
  let abandoned = false;
  let finished = false;

  return {
    read: async () => {
      let result;
      try {
        result = await reader.read();
      }
      catch (e) {
        abandoned = true;
        parts = [];
        throw e;
      }
      if (abandoned || finished) return result;
      if (result.done) {
        finished = true;
        let complete = store_plan.expected === null ? received < options.large_bytes : (!store_plan.exact || received === store_plan.expected);
        if (complete && received >= options.min_entry_bytes) {
          commit(store_plan, new Blob(parts), received).catch(() => {});
        }
        parts = [];
        return result;
      }
      let value = result.value;
      if (value && value.byteLength) {
        received += value.byteLength;
        if (received > options.max_entry_bytes) {
          abandoned = true;
          parts = [];
        }
        else {
          parts.push(new Blob([value]));
          if (parts.length > MERGE_PARTS) parts = [new Blob(parts)];
        }
      }
      return result;
    },
    cancel: async () => {
      abandoned = true;
      parts = [];
      return reader.cancel();
    }
  };
}

export async function stats() {
  let db = await open_db();
  if (!db) return {available: false, entries: 0, bytes: 0};
  await stats_promise;
  let entries = await wrap(db.transaction(META).objectStore(META).count());
  return {available: true, entries: entries, bytes: total_bytes};
}

export async function clear() {
  let db = await open_db();
  if (!db) return false;
  let tx = db.transaction([META, BLOBS], "readwrite");
  tx.objectStore(META).clear();
  tx.objectStore(BLOBS).clear();
  await done(tx);
  total_bytes = 0;
  return true;
}

export async function remove(url) {
  let db = await open_db();
  if (!db) return false;
  await remove_entry(db, cache_key(url));
  return true;
}

export function set_options(values) {
  for (let key of Object.keys(options)) {
    if (values && key in values && typeof values[key] === typeof options[key]) options[key] = values[key];
  }
  open_db().then(async (db) => {
    if (!db) return;
    await stats_promise;
    if (total_bytes > options.max_bytes) await evict_until(db, options.max_bytes * EVICT_TARGET, null);
  }).catch(() => {});
}

export async function request_persistence() {
  try {
    return await navigator.storage.persist();
  }
  catch {
    return false;
  }
}
