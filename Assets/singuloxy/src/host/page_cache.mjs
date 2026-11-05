const DB_NAME = "singuloxy-pages";
const STORE = "pages";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_BYTES = 3 * 1024 * 1024;
const MAX_ENTRIES = 60;
const GET_TIMEOUT_MS = 400;

let db_promise = null;

function open_db() {
  if (db_promise) return db_promise;
  db_promise = new Promise((resolve) => {
    try {
      let request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, {keyPath: "key"});
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

function make_key(url) {
  try {
    let parsed = new URL(url);
    parsed.hash = "";
    return parsed.href;
  }
  catch {
    return null;
  }
}

function request_promise(request) {
  return new Promise((resolve) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

export async function get(url) {
  let key = make_key(url);
  if (!key) return null;
  let lookup = (async () => {
    let db = await open_db();
    if (!db) return null;
    let entry = await request_promise(db.transaction(STORE, "readonly").objectStore(STORE).get(key));
    if (!entry || typeof entry.html !== "string") return null;
    if (Date.now() - entry.time > MAX_AGE_MS) return null;
    return entry;
  })().catch(() => null);
  let timeout = new Promise((resolve) => setTimeout(() => resolve(null), GET_TIMEOUT_MS));
  return Promise.race([lookup, timeout]);
}

export async function put(urls, html, final_url) {
  try {
    if (typeof html !== "string" || !html || html.length > MAX_BYTES) return;
    let db = await open_db();
    if (!db) return;
    let store = db.transaction(STORE, "readwrite").objectStore(STORE);
    let time = Date.now();
    for (let url of new Set(urls)) {
      let key = make_key(url);
      if (key) store.put({key, html, url: final_url, time});
    }
    let all = await request_promise(db.transaction(STORE, "readonly").objectStore(STORE).getAll());
    if (all && all.length > MAX_ENTRIES) {
      all.sort((a, b) => a.time - b.time);
      let evict = db.transaction(STORE, "readwrite").objectStore(STORE);
      for (let old of all.slice(0, all.length - MAX_ENTRIES)) evict.delete(old.key);
    }
  }
  catch {}
}
