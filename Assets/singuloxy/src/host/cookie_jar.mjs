import { quiet_warn } from "../util.mjs";

export const JAR_KEY = "proxy_cookie_jar_v2";
const LEGACY_EPOXY_KEY = "proxy_epoxy_jar";
const LEGACY_CURL_KEY = "proxy_libcurl_jar";
const DB_NAME = "proxy_cookie_db";
const DB_STORE = "jars";
const CHANNEL_NAME = "proxy_cookie_jar";
const MAX_COOKIES = 6000;
const MAX_PER_DOMAIN = 200;
const MAX_LOCAL_CHARS = 2500000;
const TOMBSTONE_MS = 14 * 24 * 60 * 60 * 1000;
const SAVE_DELAY_MS = 400;
const SAVE_INTERVAL_MS = 3000;
const READY_WAIT_MS = 1500;
const WARN_INTERVAL_MS = 30000;
const WATCHED = /^\.?ROBLOSECURITY$/i;

const jar = new Map();
let started = false;
let dirty = false;
let save_timer = null;
let last_stamp = 0;
let db_promise = null;
let channel = null;
let ready = null;
let last_warn = 0;

function stamp() {
  let now = Date.now();
  last_stamp = now > last_stamp ? now : last_stamp + 1;
  return last_stamp;
}

function key_of(cookie) {
  return cookie.domain + "|" + cookie.path + "|" + cookie.name;
}

function normalize(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (typeof raw.name !== "string" || !raw.name) return null;
  if (typeof raw.domain !== "string" || !raw.domain) return null;
  let expires = Number(raw.expires);
  let updated = Number(raw.updated);
  let used = Number(raw.used);
  return {
    name: raw.name,
    value: typeof raw.value === "string" ? raw.value : "",
    domain: raw.domain.replace(/^\./, "").toLowerCase(),
    host_only: raw.host_only !== false,
    path: typeof raw.path === "string" && raw.path.startsWith("/") ? raw.path : "/",
    secure: !!raw.secure,
    expires: expires > 0 ? expires : 0,
    http_only: !!raw.http_only,
    updated: updated > 0 ? updated : 1,
    used: used > 0 ? used : 0,
    deleted: !!raw.deleted
  };
}

function merge_list(list) {
  if (!Array.isArray(list)) return false;
  let changed = false;
  for (let raw of list) {
    let cookie = normalize(raw);
    if (!cookie) continue;
    let key = key_of(cookie);
    let existing = jar.get(key);
    if (!existing || cookie.updated > existing.updated) {
      if (existing && existing.used > cookie.used) cookie.used = existing.used;
      jar.set(key, cookie);
      changed = true;
    }
    else if (cookie.used > existing.used) {
      existing.used = cookie.used;
    }
  }
  return changed;
}

function purge() {
  let now = Date.now();
  for (let [key, cookie] of jar) {
    if (cookie.deleted) {
      if (now - cookie.updated > TOMBSTONE_MS) jar.delete(key);
    }
    else if (cookie.expires && cookie.expires <= now) {
      jar.delete(key);
    }
  }
}

function recency(entry) {
  return entry[1].used || entry[1].updated;
}

function eviction_order(a, b) {
  return (Number(a[1].http_only) - Number(b[1].http_only)) || (recency(a) - recency(b)) || (a[1].updated - b[1].updated);
}

function enforce_limits() {
  let by_domain = new Map();
  for (let entry of jar) {
    if (entry[1].deleted) continue;
    let list = by_domain.get(entry[1].domain);
    if (!list) {
      list = [];
      by_domain.set(entry[1].domain, list);
    }
    list.push(entry);
  }
  let live = [];
  for (let list of by_domain.values()) {
    if (list.length > MAX_PER_DOMAIN) {
      list.sort(eviction_order);
      for (let entry of list.splice(0, list.length - MAX_PER_DOMAIN)) jar.delete(entry[0]);
    }
    for (let entry of list) live.push(entry);
  }
  if (live.length > MAX_COOKIES) {
    live.sort(eviction_order);
    for (let entry of live.slice(0, live.length - MAX_COOKIES)) jar.delete(entry[0]);
  }
}

function serialize() {
  return JSON.stringify([...jar.values()]);
}

function read_local() {
  try {
    let text = localStorage.getItem(JAR_KEY);
    if (!text) return null;
    let list = JSON.parse(text);
    return Array.isArray(list) ? list : null;
  }
  catch {
    return null;
  }
}

function write_local(text) {
  if (text.length > MAX_LOCAL_CHARS) return false;
  try {
    localStorage.setItem(JAR_KEY, text);
    return true;
  }
  catch {}
  try {
    localStorage.removeItem(LEGACY_CURL_KEY);
    localStorage.removeItem(LEGACY_EPOXY_KEY);
    localStorage.setItem(JAR_KEY, text);
    return true;
  }
  catch {
    return false;
  }
}

function warn_save_failed() {
  let now = Date.now();
  if (now - last_warn < WARN_INTERVAL_MS) return;
  last_warn = now;
  quiet_warn("sandstone host: could not save cookies to localStorage or IndexedDB");
}

function parse_netscape(text, updated) {
  let out = [];
  for (let raw of String(text).split("\n")) {
    let line = raw.trim();
    if (!line) continue;
    let http_only = false;
    if (line.startsWith("#HttpOnly_")) {
      http_only = true;
      line = line.slice(10);
    }
    else if (line.startsWith("#")) {
      continue;
    }
    let fields = line.split("\t");
    if (fields.length < 7) continue;
    out.push({
      name: fields[5],
      value: fields[6],
      domain: fields[0],
      host_only: fields[1] !== "TRUE",
      path: fields[2] || "/",
      secure: fields[3] === "TRUE",
      expires: Number(fields[4]) * 1000 || 0,
      http_only: http_only,
      updated: updated
    });
  }
  return out;
}

function import_legacy() {
  try {
    let text = localStorage.getItem(LEGACY_CURL_KEY);
    if (text) merge_list(parse_netscape(text, 1));
  }
  catch {}
  try {
    let list = JSON.parse(localStorage.getItem(LEGACY_EPOXY_KEY));
    if (Array.isArray(list)) merge_list(list.map((cookie) => ({...cookie, updated: 2})));
  }
  catch {}
}

function open_db() {
  if (db_promise) return db_promise;
  db_promise = new Promise((resolve) => {
    try {
      let request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        try {
          request.result.createObjectStore(DB_STORE);
        }
        catch {}
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

function sync_db(write) {
  return open_db().then((db) => {
    if (!db) return null;
    return new Promise((resolve) => {
      let changed = false;
      try {
        let tx = db.transaction(DB_STORE, "readwrite");
        let store = tx.objectStore(DB_STORE);
        tx.oncomplete = () => resolve({changed: changed});
        tx.onerror = () => resolve(null);
        tx.onabort = () => resolve(null);
        let get = store.get(JAR_KEY);
        get.onsuccess = () => {
          try {
            if (typeof get.result === "string") changed = merge_list(JSON.parse(get.result));
          }
          catch {}
          purge();
          enforce_limits();
          if (write) store.put(serialize(), JAR_KEY);
        };
      }
      catch {
        resolve(null);
      }
    });
  });
}

function post_change() {
  try {
    channel?.postMessage("changed");
  }
  catch {}
}

function schedule_save() {
  dirty = true;
  if (save_timer || typeof setTimeout === "undefined") return;
  save_timer = setTimeout(() => {
    save_timer = null;
    flush_jar();
  }, SAVE_DELAY_MS);
}

export function flush_jar() {
  if (save_timer) {
    clearTimeout(save_timer);
    save_timer = null;
  }
  let stored = read_local();
  if (stored) merge_list(stored);
  purge();
  enforce_limits();
  dirty = false;
  let saved_local = write_local(serialize());
  sync_db(true).then((result) => {
    if (!result) {
      if (!saved_local) warn_save_failed();
      return;
    }
    if (result.changed) schedule_save();
    post_change();
  });
}

export function init_jar() {
  if (started) return;
  started = true;
  let stored = read_local();
  if (stored) merge_list(stored);
  else import_legacy();
  purge();
  if (!stored) schedule_save();
  let waiting = new Promise((resolve) => {
    let timer = setTimeout(resolve, READY_WAIT_MS);
    timer?.unref?.();
  });
  let loading = sync_db(false).then((result) => {
    if (result && result.changed) schedule_save();
  }).catch(() => {});
  ready = Promise.race([loading, waiting]);
  if (typeof window === "undefined") return;
  window.addEventListener("storage", (event) => {
    if (event.key !== JAR_KEY || !event.newValue) return;
    try {
      merge_list(JSON.parse(event.newValue));
    }
    catch {}
  });
  for (let name of ["pagehide", "beforeunload"]) window.addEventListener(name, () => flush_jar());
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush_jar();
    });
  }
  setInterval(() => {
    if (dirty) flush_jar();
  }, SAVE_INTERVAL_MS);
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = () => {
      sync_db(false).then((result) => {
        if (result && result.changed) schedule_save();
      });
    };
  }
  catch {}
  try {
    navigator.storage?.persist?.();
  }
  catch {}
}

export function jar_ready() {
  return ready || Promise.resolve();
}

function default_path(url) {
  let path = url.pathname || "/";
  if (!path.startsWith("/")) return "/";
  let index = path.lastIndexOf("/");
  return index <= 0 ? "/" : path.slice(0, index);
}

function parse_set_cookie(line, target) {
  let parts = String(line).split(";");
  let first = parts[0];
  let eq = first.indexOf("=");
  if (eq < 1) return null;
  let url = new URL(target);
  let host = url.hostname.toLowerCase();
  let cookie = {
    name: first.slice(0, eq).trim(),
    value: first.slice(eq + 1).trim(),
    domain: host,
    host_only: true,
    path: default_path(url),
    secure: false,
    expires: 0,
    http_only: false
  };
  let max_age = false;
  for (let i = 1; i < parts.length; i++) {
    let part = parts[i].trim();
    let split = part.indexOf("=");
    let key = (split < 0 ? part : part.slice(0, split)).trim().toLowerCase();
    let value = split < 0 ? "" : part.slice(split + 1).trim();
    if (key === "domain") {
      let domain = value.replace(/^\./, "").toLowerCase();
      if (!domain) continue;
      if (host !== domain && !host.endsWith("." + domain)) return null;
      if (domain !== host && !domain.includes(".")) return null;
      cookie.domain = domain;
      cookie.host_only = false;
    }
    else if (key === "path") {
      if (value.startsWith("/")) cookie.path = value;
    }
    else if (key === "secure") {
      cookie.secure = true;
    }
    else if (key === "httponly") {
      cookie.http_only = true;
    }
    else if (key === "max-age") {
      let seconds = parseInt(value, 10);
      if (!Number.isNaN(seconds)) {
        max_age = true;
        cookie.expires = seconds <= 0 ? 1 : Date.now() + seconds * 1000;
      }
    }
    else if (key === "expires" && !max_age) {
      let time = Date.parse(value);
      if (!Number.isNaN(time)) cookie.expires = time <= 0 ? 1 : time;
    }
  }
  return cookie;
}

function same_cookie(a, b) {
  return a.value === b.value && a.expires === b.expires && a.secure === b.secure && a.http_only === b.http_only && a.host_only === b.host_only;
}

function store_cookie(cookie, target) {
  let key = key_of(cookie);
  let existing = jar.get(key);
  let now = Date.now();
  if (cookie.expires && cookie.expires <= now) {
    if (existing && !existing.deleted && WATCHED.test(cookie.name)) {
      quiet_warn(`sandstone host: ${cookie.name} cookie was cleared by a response from ${target}`);
    }
    jar.set(key, {...cookie, value: "", deleted: true, updated: stamp(), used: 0});
    schedule_save();
    return;
  }
  if (existing && !existing.deleted && same_cookie(existing, cookie)) {
    existing.used = now;
    return;
  }
  cookie.updated = stamp();
  cookie.used = now;
  cookie.deleted = false;
  jar.set(key, cookie);
  schedule_save();
}

export function cookie_header(target) {
  let url;
  try {
    url = new URL(target);
  }
  catch {
    return "";
  }
  let host = url.hostname.toLowerCase();
  let path = url.pathname || "/";
  let https = url.protocol === "https:" || url.protocol === "wss:";
  let now = Date.now();
  let matched = [];
  for (let [key, cookie] of jar) {
    if (cookie.deleted) continue;
    if (cookie.expires && cookie.expires <= now) {
      jar.delete(key);
      continue;
    }
    let domain_ok = cookie.host_only ? host === cookie.domain : host === cookie.domain || host.endsWith("." + cookie.domain);
    if (!domain_ok) continue;
    let path_ok = path === cookie.path || (path.startsWith(cookie.path) && (cookie.path.endsWith("/") || path[cookie.path.length] === "/"));
    if (!path_ok) continue;
    if (cookie.secure && !https) continue;
    matched.push(cookie);
  }
  matched.sort((a, b) => b.path.length - a.path.length || a.updated - b.updated);
  for (let cookie of matched) cookie.used = now;
  return matched.map((cookie) => cookie.name + "=" + cookie.value).join("; ");
}

export function absorb_set_cookies(lines, target) {
  for (let line of lines) {
    try {
      let cookie = parse_set_cookie(line, target);
      if (cookie) store_cookie(cookie, target);
    }
    catch {}
  }
}

export function ingest_script_cookie(href, text) {
  try {
    let cookie = parse_set_cookie(String(text), href);
    if (!cookie) return;
    cookie.http_only = false;
    if (cookie.secure && !/^https:/i.test(href)) return;
    let existing = jar.get(key_of(cookie));
    if (existing && existing.http_only && !existing.deleted) return;
    store_cookie(cookie, href);
  }
  catch {}
}

export function live_cookies() {
  let now = Date.now();
  let out = [];
  for (let cookie of jar.values()) {
    if (cookie.deleted || (cookie.expires && cookie.expires <= now)) continue;
    out.push({...cookie});
  }
  return out;
}
