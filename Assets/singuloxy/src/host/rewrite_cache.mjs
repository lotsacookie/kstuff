const DB_NAME = "singuloxy-rewrites";
const STORE = "rewrites";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_TOTAL_BYTES = 256 * 1024 * 1024;
const MAX_ENTRY_CHARS = 24 * 1024 * 1024;
const GET_TIMEOUT_MS = 1500;
const TRIM_EVERY = 25;

let db_promise = null;
let puts_since_trim = 0;
let trimming = false;

function open_db() {
  if (db_promise) return db_promise;
  db_promise = new Promise((resolve) => {
    try {
      let request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        let store = request.result.createObjectStore(STORE, {keyPath: "key"});
        store.createIndex("time", "time");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    }
    catch {
      resolve(null);
    }
  });
  return db_promise;
}

function request_promise(request) {
  return new Promise((resolve) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

function valid_key(key) {
  return typeof key === "string" && key.length > 0 && key.length <= 200;
}

export async function get_many(keys) {
  if (!Array.isArray(keys)) return {};
  let wanted = keys.filter(valid_key).slice(0, 64);
  if (!wanted.length) return {};
  let lookup = (async () => {
    let db = await open_db();
    if (!db) return {};
    let store = db.transaction(STORE, "readonly").objectStore(STORE);
    let entries = await Promise.all(wanted.map((key) => request_promise(store.get(key))));
    let found = {};
    let now = Date.now();
    let touched = [];
    for (let entry of entries) {
      if (!entry || typeof entry.value !== "string") continue;
      if (now - entry.time > MAX_AGE_MS) continue;
      found[entry.key] = entry.value;
      touched.push(entry);
    }
    if (touched.length) {
      try {
        let write = db.transaction(STORE, "readwrite").objectStore(STORE);
        for (let entry of touched) {
          if (now - entry.time > 6 * 60 * 60 * 1000) write.put({...entry, time: now});
        }
      }
      catch {}
    }
    return found;
  })().catch(() => ({}));
  let timeout = new Promise((resolve) => setTimeout(() => resolve({}), GET_TIMEOUT_MS));
  return Promise.race([lookup, timeout]);
}

async function trim(db) {
  if (trimming) return;
  trimming = true;
  try {
    let all = await request_promise(db.transaction(STORE, "readonly").objectStore(STORE).getAll());
    if (!all) return;
    let now = Date.now();
    let total = 0;
    for (let entry of all) total += (entry.value?.length || 0) * 2;
    let expired = all.filter((entry) => now - entry.time > MAX_AGE_MS);
    let live = all.filter((entry) => now - entry.time <= MAX_AGE_MS);
    live.sort((a, b) => a.time - b.time);
    let evict = db.transaction(STORE, "readwrite").objectStore(STORE);
    for (let entry of expired) {
      total -= (entry.value?.length || 0) * 2;
      evict.delete(entry.key);
    }
    for (let entry of live) {
      if (total <= MAX_TOTAL_BYTES * 0.8) break;
      total -= (entry.value?.length || 0) * 2;
      evict.delete(entry.key);
    }
  }
  catch {}
  finally {
    trimming = false;
  }
}

export async function put_many(items) {
  try {
    if (!Array.isArray(items) || !items.length) return;
    let db = await open_db();
    if (!db) return;
    let store = db.transaction(STORE, "readwrite").objectStore(STORE);
    let time = Date.now();
    let wrote = 0;
    for (let item of items.slice(0, 32)) {
      if (!item || !valid_key(item.key) || typeof item.value !== "string") continue;
      if (!item.value || item.value.length > MAX_ENTRY_CHARS) continue;
      store.put({key: item.key, value: item.value, time});
      wrote++;
    }
    puts_since_trim += wrote;
    if (puts_since_trim >= TRIM_EVERY) {
      puts_since_trim = 0;
      setTimeout(() => trim(db), 2000);
    }
  }
  catch {}
}
