import { quiet_warn } from "../util.mjs";

const STORE_KEY = "proxy_epoxy_jar";
const MAX_COOKIES = 3000;
const MAX_HOPS = 20;
const FALLBACK_MS = 60000;
const HEADERS_MS = 8000;
const MAX_ACTIVE = 8;
const FAIL_LIMIT = 3;
const HOP_HEADERS = ["accept-encoding", "connection", "keep-alive", "host", "content-length", "transfer-encoding", "te", "upgrade", "proxy-connection"];

let active = 0;
let fails = 0;
const waiting = [];

function take_slot() {
  if (active < MAX_ACTIVE) {
    active++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiting.push(resolve));
}

function free_slot() {
  let next = waiting.shift();
  if (next) next();
  else active = Math.max(0, active - 1);
}

let requester = null;
let down_until = 0;
let loaded = false;
let dirty = false;
let timer = null;
const jar = new Map();

export function set_transport_fetch(fn) {
  requester = typeof fn === "function" ? fn : null;
  if (requester) load_jar();
}

export function transport_active() {
  return !!requester && Date.now() >= down_until;
}

function cookie_key(cookie) {
  return cookie.domain + "|" + cookie.path + "|" + cookie.name;
}

function save_jar() {
  if (!dirty) return;
  dirty = false;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...jar.values()]));
  }
  catch {}
}

function load_jar() {
  if (loaded) return;
  loaded = true;
  try {
    let stored = JSON.parse(localStorage.getItem(STORE_KEY));
    if (Array.isArray(stored)) {
      for (let cookie of stored) {
        if (cookie && typeof cookie.name === "string" && typeof cookie.domain === "string") jar.set(cookie_key(cookie), cookie);
      }
    }
  }
  catch {}
  if (!timer && typeof window !== "undefined") {
    timer = setInterval(save_jar, 2000);
    window.addEventListener("pagehide", save_jar);
    window.addEventListener("beforeunload", save_jar);
  }
}

function seed_from(session) {
  let seeded = false;
  try {
    seeded = localStorage.getItem(STORE_KEY) !== null;
  }
  catch {}
  if (seeded || jar.size) return;
  let text = "";
  try {
    text = session?.export_cookies?.() || "";
  }
  catch {}
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
    let domain = fields[0].replace(/^\./, "").toLowerCase();
    let expires = Number(fields[4]) * 1000 || 0;
    if (!domain || (expires && expires <= Date.now())) continue;
    let cookie = {
      name: fields[5],
      value: fields[6],
      domain: domain,
      host_only: fields[1] !== "TRUE",
      path: fields[2] || "/",
      secure: fields[3] === "TRUE",
      expires: expires,
      http_only: http_only
    };
    jar.set(cookie_key(cookie), cookie);
  }
  dirty = true;
  save_jar();
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

function store_cookie(cookie) {
  let key = cookie_key(cookie);
  if (cookie.expires && cookie.expires <= Date.now()) jar.delete(key);
  else jar.set(key, cookie);
  dirty = true;
  if (jar.size > MAX_COOKIES) {
    let first = jar.keys().next().value;
    jar.delete(first);
  }
}

function cookie_header(target) {
  let url = new URL(target);
  let host = url.hostname.toLowerCase();
  let path = url.pathname || "/";
  let https = url.protocol === "https:";
  let now = Date.now();
  let matched = [];
  for (let [key, cookie] of jar) {
    if (cookie.expires && cookie.expires <= now) {
      jar.delete(key);
      dirty = true;
      continue;
    }
    let domain_ok = cookie.host_only ? host === cookie.domain : host === cookie.domain || host.endsWith("." + cookie.domain);
    if (!domain_ok) continue;
    let path_ok = path === cookie.path || (path.startsWith(cookie.path) && (cookie.path.endsWith("/") || path[cookie.path.length] === "/"));
    if (!path_ok) continue;
    if (cookie.secure && !https) continue;
    matched.push(cookie);
  }
  matched.sort((a, b) => b.path.length - a.path.length);
  return matched.map((cookie) => cookie.name + "=" + cookie.value).join("; ");
}

function set_cookie_lines(response) {
  let out = [];
  let add = (value) => {
    if (typeof value === "string" && value && !out.includes(value)) out.push(value);
  };
  try {
    let list = response.headers?.getSetCookie?.();
    if (list) list.forEach(add);
  }
  catch {}
  for (let raw of [response.rawHeaders, response.raw_headers]) {
    if (!raw) continue;
    try {
      let pairs = Array.isArray(raw) ? raw : Object.keys(raw).map((key) => [key, raw[key]]);
      for (let pair of pairs) {
        if (!Array.isArray(pair) || String(pair[0]).toLowerCase() !== "set-cookie") continue;
        if (Array.isArray(pair[1])) pair[1].forEach(add);
        else add(pair[1]);
      }
    }
    catch {}
  }
  return out;
}

function absorb(response, target) {
  for (let line of set_cookie_lines(response)) {
    try {
      let cookie = parse_set_cookie(line, target);
      if (cookie) store_cookie(cookie);
    }
    catch {}
  }
}

function raw_pairs(response) {
  let pairs = [];
  let raw = response.rawHeaders;
  if (raw) {
    try {
      let source = Array.isArray(raw) ? raw : Object.keys(raw).map((key) => [key, raw[key]]);
      for (let pair of source) {
        if (!Array.isArray(pair)) continue;
        if (Array.isArray(pair[1])) pair[1].forEach((value) => pairs.push([String(pair[0]), String(value)]));
        else pairs.push([String(pair[0]), String(pair[1])]);
      }
    }
    catch {}
  }
  if (!pairs.length) {
    try {
      response.headers.forEach((value, key) => pairs.push([key, value]));
    }
    catch {}
    for (let line of set_cookie_lines(response)) {
      if (!pairs.some((pair) => pair[0].toLowerCase() === "set-cookie" && pair[1] === line)) pairs.push(["set-cookie", line]);
    }
  }
  return pairs;
}

function decorate(response, target, redirected) {
  let pairs = raw_pairs(response);
  let headers = new Headers();
  for (let [key, value] of pairs) {
    try {
      headers.append(key, value);
    }
    catch {}
  }
  let define = (name, value) => {
    try {
      Object.defineProperty(response, name, {value: value, configurable: true});
    }
    catch {}
  };
  define("headers", headers);
  define("raw_headers", pairs);
  define("url", target);
  define("redirected", redirected);
  return response;
}

function plain_headers(input) {
  let out = {};
  if (!input) return out;
  if (typeof Headers !== "undefined" && input instanceof Headers) {
    input.forEach((value, key) => {
      out[key] = value;
    });
  }
  else if (Array.isArray(input)) {
    for (let pair of input) {
      if (Array.isArray(pair) && pair.length >= 2) out[String(pair[0])] = String(pair[1]);
    }
  }
  else {
    for (let key of Object.keys(input)) {
      if (input[key] !== undefined && input[key] !== null) out[key] = String(input[key]);
    }
  }
  return out;
}

function find_header(headers, name) {
  let lower = name.toLowerCase();
  return Object.keys(headers).find((key) => key.toLowerCase() === lower) || null;
}

function drop_headers(headers, names) {
  for (let name of names) {
    let key = find_header(headers, name);
    while (key) {
      delete headers[key];
      key = find_header(headers, name);
    }
  }
}

async function plain_body(body, headers) {
  if (body === undefined || body === null) return null;
  if (typeof body === "string" || body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return body;
  let wrapper = new Request("https://placeholder.invalid/", {method: "POST", body: body, duplex: "half"});
  let type = wrapper.headers.get("content-type");
  if (type && !find_header(headers, "content-type")) headers["Content-Type"] = type;
  return await wrapper.arrayBuffer();
}

function origin_of(target) {
  try {
    return new URL(target).origin;
  }
  catch {
    return "";
  }
}

async function request(url, options) {
  options = options || {};
  let follow = options.redirect !== "manual" && options.redirect !== "error";
  let method = String(options.method || "GET").toUpperCase();
  let headers = plain_headers(options.headers);
  drop_headers(headers, HOP_HEADERS);
  let explicit_cookie = !!find_header(headers, "cookie");
  let body = await plain_body(options.body, headers);
  let target = String(url);
  let redirected = false;
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    let sent = {...headers};
    if (!explicit_cookie && options.credentials !== "omit") {
      let cookie = cookie_header(target);
      if (cookie) sent["Cookie"] = cookie;
    }
    let init = {method: method, headers: sent, redirect: "manual"};
    if (body !== null && method !== "GET" && method !== "HEAD") init.body = body;
    if (options.signal) init.signal = options.signal;
    let response = await requester(target, init);
    absorb(response, target);
    let location = null;
    try {
      location = response.headers.get("location");
    }
    catch {}
    if (follow && location && [301, 302, 303, 307, 308].includes(response.status)) {
      try {
        response.body?.cancel?.().catch?.(() => {});
      }
      catch {}
      let next = new URL(location, target).href;
      if (response.status === 303 || ((response.status === 301 || response.status === 302) && method === "POST")) {
        if (method !== "HEAD") method = "GET";
        body = null;
        drop_headers(headers, ["content-type", "content-length"]);
      }
      if (origin_of(next) !== origin_of(target)) drop_headers(headers, ["authorization", "proxy-authorization"]);
      if (explicit_cookie) {
        drop_headers(headers, ["cookie"]);
        explicit_cookie = false;
      }
      target = next;
      redirected = true;
      continue;
    }
    return decorate(response, target, redirected);
  }
  throw new Error(`Request "${url}" failed with error code 47: too many redirects`);
}

export function route_session(target) {
  if (!target || typeof target.fetch !== "function") return target;
  let original = target.fetch.bind(target);
  target.fetch = async (url, options) => {
    if (!transport_active()) return original(url, options);
    seed_from(target);
    let outer = options?.signal;
    if (outer?.aborted) return original(url, options);
    await take_slot();
    let controller = new AbortController();
    let relay = () => controller.abort();
    if (outer) outer.addEventListener("abort", relay, {once: true});
    let timer = null;
    let pending = request(url, {...options, signal: controller.signal});
    let timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        let error = new Error(`epoxy returned no response for ${HEADERS_MS / 1000}s`);
        error.epoxy_timeout = true;
        controller.abort();
        reject(error);
      }, HEADERS_MS);
    });
    try {
      let response = await Promise.race([pending, timeout]);
      fails = 0;
      return response;
    }
    catch (error) {
      pending.then((late) => {
        try {
          late.body?.cancel?.().catch?.(() => {});
        }
        catch {}
      }, () => {});
      if (outer?.aborted) throw error;
      fails++;
      quiet_warn("sandstone host: epoxy request failed, retrying with libcurl:", String(url), String(error?.message ?? error));
      if (error?.epoxy_unavailable || fails >= FAIL_LIMIT) {
        down_until = Date.now() + FALLBACK_MS;
        fails = 0;
        quiet_warn(`sandstone host: epoxy paused for ${FALLBACK_MS / 1000}s, using libcurl`);
      }
      return original(url, options);
    }
    finally {
      clearTimeout(timer);
      if (outer) outer.removeEventListener("abort", relay);
      free_slot();
    }
  };
  return target;
}
