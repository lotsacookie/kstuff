import { quiet_warn } from "../util.mjs";
import { init_jar, jar_ready, cookie_header, absorb_set_cookies } from "./cookie_jar.mjs";

const MAX_HOPS = 20;
const FALLBACK_MS = 60000;
const HEADERS_MS = 8000;
const MAX_ACTIVE = 8;
const FAIL_LIMIT = 3;
const HOP_HEADERS = ["accept-encoding", "connection", "keep-alive", "host", "content-length", "transfer-encoding", "te", "upgrade", "proxy-connection"];
const REDIRECT_STATUS = [301, 302, 303, 307, 308];

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

export function set_transport_fetch(fn) {
  requester = typeof fn === "function" ? fn : null;
  init_jar();
}

export function transport_active() {
  return !!requester && Date.now() >= down_until;
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
  absorb_set_cookies(set_cookie_lines(response), target);
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

function cancel_body(response) {
  try {
    response.body?.cancel?.().catch?.(() => {});
  }
  catch {}
}

async function request(url, options, send, native) {
  options = options || {};
  let mode = options.redirect === "manual" || options.redirect === "error" ? options.redirect : "follow";
  let method = String(options.method || "GET").toUpperCase();
  let headers = plain_headers(options.headers);
  if (!native) drop_headers(headers, HOP_HEADERS);
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
    let init = native ? {...options} : {};
    init.method = method;
    init.headers = sent;
    init.redirect = "manual";
    if (body !== null && method !== "GET" && method !== "HEAD") init.body = body;
    else delete init.body;
    if (options.signal) init.signal = options.signal;
    let response = await send(target, init);
    absorb(response, target);
    let location = null;
    try {
      location = response.headers.get("location");
    }
    catch {}
    if (location && REDIRECT_STATUS.includes(response.status) && mode !== "manual") {
      cancel_body(response);
      if (mode === "error") throw new TypeError("Request failed because redirects were disallowed.");
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
    return native ? response : decorate(response, target, redirected);
  }
  throw new Error(`Request "${url}" failed with error code 47: too many redirects`);
}

function native_request(original, url, options) {
  return request(url, options, (target, init) => original(target, init), true);
}

async function routed_fetch(original, url, options) {
  init_jar();
  await jar_ready();
  let send = requester;
  let outer = options?.signal;
  if (!send || Date.now() < down_until || outer?.aborted) return native_request(original, url, options);
  await take_slot();
  let controller = new AbortController();
  let relay = () => controller.abort();
  if (outer) outer.addEventListener("abort", relay, {once: true});
  let timer = null;
  let pending = request(url, {...options, signal: controller.signal}, (target, init) => send(target, init), false);
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
    pending.then((late) => cancel_body(late), () => {});
    if (outer?.aborted) throw error;
    fails++;
    quiet_warn("sandstone host: epoxy request failed, retrying with libcurl:", String(url), String(error?.message ?? error));
    if (error?.epoxy_unavailable || fails >= FAIL_LIMIT) {
      down_until = Date.now() + FALLBACK_MS;
      fails = 0;
      quiet_warn(`sandstone host: epoxy paused for ${FALLBACK_MS / 1000}s, using libcurl`);
    }
    return native_request(original, url, options);
  }
  finally {
    clearTimeout(timer);
    if (outer) outer.removeEventListener("abort", relay);
    free_slot();
  }
}

export function route_session(target) {
  if (!target || typeof target.fetch !== "function") return target;
  let original = target.fetch.bind(target);
  target.fetch = (url, options) => routed_fetch(original, url, options);
  return target;
}
