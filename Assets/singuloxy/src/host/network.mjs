import { quiet_warn } from "../util.mjs";
import * as response_cache from "./cache.mjs";
import { iframes } from "./controller.mjs";
import { rpc_handlers } from "../rpc.mjs";
import { libcurl } from "libcurl.js/bundled";
import { load_jar, create_jar_saver } from "./jar_store.mjs";
import { discord_fetch_options, discord_ws_options } from "./discord_profile.mjs";

export const ws_connections = {};
export let session = null;

const WISP_GATE_ENABLED = false;
const HOST_BLOCKING_ENABLED = true;
const ADAPTIVE_CONCURRENCY_ENABLED = true;
const WISP_ROTATION_ENABLED = false;
const MAX_CONCURRENT_REQUESTS = 16;
const MIN_CONCURRENT_REQUESTS = 2;
const GROW_AFTER_SUCCESSES = 10;
const COOLDOWN_MS = 1500;
const MAX_RETRIES = 3;
const MAX_CONNECT_RETRIES = 1;
const MAX_TLS_RETRIES = 3;
const MAX_PER_HOST = 6;
const MAX_RESUMES = 5;
const REQUEST_TIMEOUT_MS = 45 * 1000;
const PAGE_TIMEOUT_MS = 15 * 1000;
const PAGE_ATTEMPTS = 3;
const PAGE_HEDGE_MS = 3500;
const PAGE_COLD_TIMEOUT_MS = 20 * 1000;
let page_warm = false;
const COALESCE_BYTES = 2 * 1024 * 1024;
const COALESCE_WAIT_MS = 8;
const STREAM_IDLE_MS = 2 * 60 * 1000;
const EVICT_IDLE_MS = 30 * 1000;
const MAX_OPEN_STREAMS = 256;
const LARGE_STREAM_BYTES = 8 * 1024 * 1024;
const LARGE_STREAM_IDLE_MS = 15 * 60 * 1000;
const MAX_CLOSED_MEMORY = 4096;
const HOST_FAIL_THRESHOLD = 3;
const HOST_BLOCK_MS = 30 * 1000;
const TLS_HOST_FAIL_THRESHOLD = 6;
const TLS_HOST_BLOCK_MS = 15 * 1000;
const SHRINK_HOST_COUNT = 3;
const SHRINK_WINDOW_MS = 10 * 1000;
const TEST_TIMEOUT_MS = 15 * 1000;
const LOG_THROTTLE_MS = 10 * 1000;
const WISP_FAIL_THRESHOLD = 4;
const WISP_FAIL_WINDOW_MS = 8 * 1000;
const WISP_BACKOFF_MIN_MS = 4 * 1000;
const WISP_BACKOFF_MAX_MS = 30 * 1000;
const WISP_ROTATE_COOLDOWN_MS = 6 * 1000;
const TRANSIENT_ERRORS = /error code (7|28|35|52|55|56)\b/;
const TLS_ERROR = /error code 35\b/;
const CONNECT_ERROR = /error code 7\b/;
const CONNECTION_ERRORS = /error code (7|35)\b/;
const PRE_REQUEST_ERRORS = /error code (7|35)\b/;
const PARTIAL_ERRORS = /error code (18|56)\b/;
const CERT_ERROR = /error code 60\b/;
const TIMEOUT = Symbol("timeout");

const DEFAULT_TEST_URLS = [
  "https://example.com/",
  "https://www.roblox.com/",
  "https://thumbnails.roblox.com/",
  "https://catalog.roblox.com/",
  "https://games.roblox.com/",
  "https://roblox-poc.global.ssl.fastly.net/"
];

const SEGMENT_PROBE_BYTES = 1024 * 1024;
const SEGMENT_MEDIUM_BYTES = 2 * 1024 * 1024;
const SEGMENT_LARGE_BYTES = 4 * 1024 * 1024;
const SEGMENT_MEDIUM_FILE = 128 * 1024 * 1024;
const SEGMENT_LARGE_FILE = 1024 * 1024 * 1024;
const SEGMENT_MIN_PARALLEL = 4;
const SEGMENT_START_PARALLEL = 8;
const SEGMENT_MAX_PARALLEL = 16;
const FALLBACK_MAX_PARALLEL = 6;
const SEGMENT_LOOKAHEAD_BYTES = 48 * 1024 * 1024;
const SEGMENT_RETRIES = 5;
const SEGMENT_MAX_ATTEMPTS = 60;
const SEGMENT_IDLE_MS = 20 * 1000;
const MAX_SEGMENT_REQUESTS = 24;
const TUNE_INTERVAL_MS = 1500;
const AUTO_SEGMENT_MIN_BYTES = 3 * 1024 * 1024;
const SPREAD_TTL_MS = 20 * 1000;
const BULK_MAX_TOTAL = 64;
const BULK_CACHE_SIZE = 48;
const BULK_PER_HOST = 24;
const BALANCE_TOP_N = 4;
const WISP_DOWN_MS = 20 * 1000;
const JAR_CHECK_MS = 3000;
const DEFAULT_WISP_RATE = 512 * 1024;
const BENCH_BYTES = 2 * 1024 * 1024;
const BENCH_TIMEOUT_MS = 9 * 1000;
const BENCH_BATCH = 4;
const BENCH_MIN_BYTES = 64 * 1024;
const BENCH_MAX_CANDIDATES = 16;
const BENCH_TARGETS = [
  {host: "ipv4.download.thinkbroadband.com", path: "/20MB.zip"},
  {host: "cachefly.cachefly.net", path: "/10mb.test"},
  {host: "ash-speed.hetzner.com", path: "/100MB.bin"}
];
const LARGE_FILE_PATTERN = /\.(zip|7z|rar|tar|tgz|gz|xz|bz2|pk3|pak|pck|wasm|data|bin|iso|img|mp4|webm|mkv|unityweb|br|apk|exe|dmg|msi|jar|rom|nes|sfc|smc|gba|gbc|gb|nds|n64|z64|v64|nsp|xci|3ds|cia|chd|cue|vpk)([?#]|$)|\.part\d{2,}([?#]|$)/i;

const streams = {};
const closed_streams = new Map();
const segmented_hosts = new Set();
const host_health = new Map();
const host_active = new Map();
const host_queues = new Map();
const recent_failures = new Map();
const log_times = new Map();

let active_requests = 0;
let concurrency_limit = MAX_CONCURRENT_REQUESTS;
let successes_since_shrink = 0;
let cooldown_until = 0;
let last_shrink_log = 0;
const request_queue = [];

let wisp_pool = [];
let ws_url = null;
let bulk = null;
let jar_checked = 0;
let balanced_installed = false;

const spread_hosts = new Map();
const spread_off = new Set();
const wisp_down = new Map();
const wisp_rates = new Map();
const watched_connections = new WeakSet();

const wisp = {
  recent: new Map(),
  tripped: false,
  down_until: 0,
  backoff: WISP_BACKOFF_MIN_MS,
  probing: false,
  trips: 0,
  rotations: 0,
  last_rotation: 0
};

let session_ready_resolve;
const session_ready = new Promise((resolve) => {
  session_ready_resolve = resolve;
});

class Semaphore {
  constructor(limit) {
    this.limit = limit;
    this.active = 0;
    this.waiters = [];
  }

  acquire() {
    if (this.active < this.limit) {
      this.active++;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.waiters.push(resolve);
    });
  }

  release() {
    let next = this.waiters.shift();
    if (next) next();
    else this.active--;
  }
}

const segment_semaphore = new Semaphore(MAX_SEGMENT_REQUESTS);

let tracker_blocking = true;
export function set_tracker_blocking(enabled) {
  tracker_blocking = !!enabled;
}

const BLOCKED_HOSTS = [
  "googletagmanager.com",
  "google-analytics.com",
  "doubleclick.net",
  "googlesyndication.com",
  "googleadservices.com",
  "cloudflareinsights.com",
  "amazon-adsystem.com",
  "crwdcntrl.net",
  "eyeota.net",
  "optable.co",
  "confiant-integrations.net",
  "html-load.cc",
  "githack.com",
  "ads-twitter.com",
  "analytics.twitter.com",
  "ads-api.twitter.com",
  "px.ads.linkedin.com",
  "snap.licdn.com",
  "bat.bing.com",
  "clarity.ms",
  "hotjar.com",
  "hotjar.io",
  "analytics.tiktok.com",
  "ct.pinterest.com",
  "scorecardresearch.com",
  "quantserve.com",
  "adnxs.com",
  "adsrvr.org",
  "criteo.com",
  "criteo.net",
  "taboola.com",
  "outbrain.com",
  "rubiconproject.com",
  "pubmatic.com",
  "openx.net",
  "casalemedia.com",
  "moatads.com",
  "adsafeprotected.com",
  "3lift.com"
];

const BLOCKED_URL_PATTERNS = [
  /^https:\/\/cdn\.jsdelivr\.net\/gh\/ad-shield\//i,
  /^https:\/\/raw\.githubusercontent\.com\/easylist\//i,
  /^https:\/\/[a-z0-9]+-\d+-\d+-\d+-\d+\.roblox\.com\/_\/_\/1px\.gif/i,
  /^https:\/\/sc0(ak)?\.rbxcdn\.com\/test-50kb\.png/i,
  /^https:\/\/roblox-poc\.global\.ssl\.fastly\.net\/test-50kb\.png/i,
  /^https:\/\/lms-[a-z0-9-]+\.roblox\.com\/1x1\.png/i,
  /^https:\/\/t\.co\/i\/adsct/i,
  /^https:\/\/www\.facebook\.com\/tr[/?]/i,
  /^https:\/\/ecsv2\.roblox\.com\//i,
  /^https:\/\/[a-z0-9.-]+\.ingest(\.[a-z]+)?\.sentry\.io\//i
];

const GIF_1X1 = Uint8Array.from(
  atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),
  (c) => c.charCodeAt(0)
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function host_of(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  }
  catch {
    return String(url);
  }
}

const ROBLOX_CDN_HOST = /(^|\.)rbxcdn\.com$/i;

function is_roblox_cdn(url) {
  return ROBLOX_CDN_HOST.test(host_of(url));
}

function keep_headers(options, names) {
  let headers = {};
  for (let [key, value] of Object.entries(options?.headers || {})) {
    if (names.includes(key.toLowerCase())) headers[key] = value;
  }
  return {...(options || {}), headers: headers};
}

function with_roblox_referer(options) {
  let headers = {...(options?.headers || {})};
  let current = "";
  for (let key of Object.keys(headers)) {
    if (key.toLowerCase() === "referer") {
      current = String(headers[key]);
      delete headers[key];
    }
  }
  let valid = /^https:\/\/([a-z0-9-]+\.)*roblox\.com\//i.test(current);
  headers["Referer"] = valid ? current : "https://play.roblox.com/";
  return {...(options || {}), headers: headers};
}

function with_header(options, name, value) {
  let cleaned = strip_headers(options, [name.toLowerCase()]);
  cleaned.headers[name] = value;
  return cleaned;
}

function strip_headers(options, names) {
  let headers = {...(options?.headers || {})};
  for (let key of Object.keys(headers)) {
    if (names.includes(key.toLowerCase())) delete headers[key];
  }
  return {...(options || {}), headers: headers};
}

async function wait_for_cooldown() {
  let remaining = cooldown_until - Date.now();
  while (remaining > 0) {
    await sleep(remaining + Math.random() * 150);
    remaining = cooldown_until - Date.now();
  }
}

function is_blocked(url) {
  if (BLOCKED_URL_PATTERNS.some((pattern) => pattern.test(url))) return true;
  try {
    let host = new URL(url).hostname.toLowerCase();
    return BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith("." + blocked));
  }
  catch {
    return false;
  }
}

function blocked_payload(url, owner) {
  let path = "";
  try {
    path = new URL(url).pathname.toLowerCase();
  }
  catch {}
  let is_script = path.endsWith(".js");
  let mime = is_script ? "application/javascript" : "image/gif";
  let body = is_script ? null : GIF_1X1.slice();

  return {
    headers: [["content-type", mime]],
    items: {
      ok: true,
      redirected: false,
      status: 200,
      statusText: "OK",
      type: "basic",
      url: url,
      raw_headers: []
    },
    mime_type: mime,
    stream_id: body ? register_buffer_stream(body, url, owner) : null
  };
}

function log_throttled(kind, host, ...args) {
  let key = kind + "|" + host;
  let now = Date.now();
  let entry = log_times.get(key);
  if (entry && now - entry.time < LOG_THROTTLE_MS) {
    entry.skipped++;
    return;
  }
  let skipped = entry ? entry.skipped : 0;
  log_times.set(key, {time: now, skipped: 0});
  if (log_times.size > 500) {
    for (let [old_key, old_entry] of log_times) {
      if (now - old_entry.time > LOG_THROTTLE_MS) log_times.delete(old_key);
    }
  }
  if (skipped > 0) args.push(`(+${skipped} similar suppressed)`);
  quiet_warn(...args);
}

try {
  const original_set_websocket = libcurl.set_websocket.bind(libcurl);
  libcurl.set_websocket = (url) => {
    ws_url = url;
    return original_set_websocket(url);
  };
}
catch (e) {
  quiet_warn("sandstone host: could not wrap set_websocket:", String(e?.message ?? e));
}

export function set_websocket(url) {
  libcurl.set_websocket(url);
}

function normalize_wisp(url) {
  if (typeof url !== "string") return null;
  let trimmed = url.trim();
  if (!/^wss?:\/\//i.test(trimmed)) return null;
  return trimmed.endsWith("/") ? trimmed : trimmed + "/";
}

let onion_wisp = null;

export function set_onion_wisp(url) {
  onion_wisp = normalize_wisp(url);
  return onion_wisp;
}

export function is_onion_host(host) {
  return typeof host === "string" && /(^|\.)onion\.?$/i.test(host);
}

function onion_url(url) {
  if (typeof url !== "string" || !/^https:\/\/[^/?#]*\.onion\.?(?::\d+)?([/?#]|$)/i.test(url)) return url;
  return "http://" + url.slice(8).replace(/:443(?=[/?#]|$)/, "");
}

export function set_wisp_pool(urls) {
  wisp_pool = [];
  for (let url of Array.isArray(urls) ? urls : []) {
    let normalized = normalize_wisp(url);
    if (!normalized) continue;
    wisp_pool.push(normalized);
    break;
  }
}

function wisp_connections() {
  return libcurl.wisp?.wisp_connections || {};
}

function wisp_load(url) {
  let connection = wisp_connections()[url];
  if (!connection) return 0;
  return Object.keys(connection.active_streams || {}).length;
}

function mark_wisp_down(url) {
  wisp_down.set(url, Date.now() + WISP_DOWN_MS);
}

function watch_wisp_connection(url) {
  let connection = wisp_connections()[url];
  if (!connection || watched_connections.has(connection)) return;
  watched_connections.add(connection);
  let opened = false;
  try {
    connection.addEventListener("open", () => {
      opened = true;
      wisp_down.delete(url);
    });
    connection.addEventListener("error", () => mark_wisp_down(url));
    connection.addEventListener("close", () => {
      if (!opened) mark_wisp_down(url);
    });
  }
  catch {}
}

function is_spread_host(host) {
  if (wisp_pool.length < 2 || spread_off.has(host)) return false;
  let until = spread_hosts.get(host);
  if (!until) return false;
  if (until < Date.now()) {
    spread_hosts.delete(host);
    return false;
  }
  return true;
}

function pick_wisp(host, fallback) {
  if (!is_spread_host(host)) return fallback;
  let now = Date.now();
  let healthy = wisp_pool.filter((url) => (wisp_down.get(url) || 0) <= now);
  let candidates = (healthy.length > 0 ? healthy : wisp_pool).slice(0, BALANCE_TOP_N);
  if (!candidates.includes(fallback) && candidates.length < BALANCE_TOP_N && wisp_pool.includes(fallback)) {
    candidates.push(fallback);
  }
  let best = fallback;
  let best_cost = Infinity;
  for (let url of candidates) {
    let rate = wisp_rates.get(url) || DEFAULT_WISP_RATE;
    let cost = (wisp_load(url) + 1) / rate * (0.95 + Math.random() * 0.1);
    if (cost < best_cost) {
      best_cost = cost;
      best = url;
    }
  }
  return best;
}

function install_balanced_transport() {
  let Base = libcurl.wisp?.WispWebSocket;
  if (typeof Base !== "function") return false;

  class BalancedWispSocket extends Base {
    constructor(url, protocols) {
      let cut = url.lastIndexOf("/");
      let target = url.slice(cut + 1);
      let default_wisp = url.slice(0, cut + 1);
      let host = target.slice(0, target.lastIndexOf(":")).toLowerCase();
      let chosen = default_wisp;
      try {
        chosen = is_onion_host(host) && onion_wisp ? onion_wisp : pick_wisp(host, default_wisp);
      }
      catch {}
      super(chosen + target, protocols);
      this.balanced_wisp = chosen;
      try {
        watch_wisp_connection(chosen);
      }
      catch {}
    }
  }

  libcurl.transport = BalancedWispSocket;
  return true;
}

function bench_target(wisp_url, target, timeout_ms) {
  return new Promise((resolve) => {
    let started = performance.now();
    let socket = null;
    let done = false;
    let connect_ms = null;
    let first_ms = null;
    let body_started = null;
    let received = 0;
    let header_bytes = 0;
    let head = "";
    let in_body = false;
    let status = 0;

    let timer = null;
    let finish = (reason) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        socket?.close();
      }
      catch {}
      let now = performance.now();
      let body_ms = body_started === null ? 0 : Math.max(now - body_started, 1);
      let usable = received >= BENCH_MIN_BYTES && (status === 200 || status === 206);
      resolve({
        url: wisp_url,
        target: target.host,
        ok: usable,
        reason: reason,
        status: status,
        connect_ms: connect_ms === null ? null : Math.round(connect_ms),
        ttfb_ms: first_ms === null ? null : Math.round(first_ms),
        bytes: received,
        rate: usable ? received * 1000 / body_ms : 0
      });
    };
    timer = setTimeout(() => finish("timeout"), timeout_ms);

    try {
      socket = new libcurl.wisp.WispWebSocket(wisp_url + target.host + ":80");
    }
    catch {
      finish("error");
      return;
    }
    socket.binaryType = "arraybuffer";
    try {
      socket.connection?.addEventListener("error", () => finish("connect-failed"));
      socket.connection?.addEventListener("close", () => finish("closed"));
    }
    catch {}

    let decoder = new TextDecoder();
    socket.onopen = () => {
      connect_ms = performance.now() - started;
      let request = [
        `GET ${target.path} HTTP/1.1`,
        `Host: ${target.host}`,
        `Range: bytes=0-${BENCH_BYTES - 1}`,
        "Accept: */*",
        "Accept-Encoding: identity",
        "Connection: close",
        "",
        ""
      ].join("\r\n");
      try {
        socket.send(request);
      }
      catch {
        finish("send-failed");
      }
    };
    socket.onclose = () => finish("closed");
    socket.onmessage = (event) => {
      let chunk = new Uint8Array(event.data);
      if (first_ms === null) first_ms = performance.now() - started;
      if (!in_body) {
        head += decoder.decode(chunk, {stream: true});
        let end = head.indexOf("\r\n\r\n");
        if (end === -1) {
          if (head.length > 16384) finish("bad-response");
          return;
        }
        let match = /^HTTP\/1\.[01] (\d{3})/.exec(head);
        status = match ? Number(match[1]) : 0;
        if (status !== 200 && status !== 206) {
          finish("status-" + status);
          return;
        }
        in_body = true;
        body_started = performance.now();
        header_bytes = new TextEncoder().encode(head.slice(0, end + 4)).byteLength;
        received += Math.max(0, new TextEncoder().encode(head).byteLength - header_bytes);
        head = "";
      }
      else {
        received += chunk.byteLength;
      }
      if (received >= BENCH_BYTES) finish("done");
    };
  });
}

async function bench_wisp(wisp_url, targets, timeout_ms) {
  let last = null;
  for (let target of targets) {
    let result = await bench_target(wisp_url, target, timeout_ms);
    if (result.ok) return result;
    last = result;
    if (result.reason === "connect-failed" || result.reason === "error") break;
  }
  return last || {url: wisp_url, ok: false, reason: "no-targets", bytes: 0, rate: 0};
}

export async function benchmark_wisps(urls, options = {}) {
  let candidates = [];
  let seen = new Set();
  for (let url of Array.isArray(urls) ? urls : []) {
    let normalized = normalize_wisp(url);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    candidates.push(normalized);
  }
  let limit = options.limit || BENCH_MAX_CANDIDATES;
  candidates = candidates.slice(0, limit);
  let targets = Array.isArray(options.targets) && options.targets.length > 0 ? options.targets : BENCH_TARGETS;
  let timeout_ms = options.timeout_ms || BENCH_TIMEOUT_MS;
  let batch_size = options.batch || BENCH_BATCH;
  let on_progress = typeof options.on_progress === "function" ? options.on_progress : null;
  let results = [];

  for (let index = 0; index < candidates.length; index += batch_size) {
    let batch = candidates.slice(index, index + batch_size);
    let batch_results = await Promise.all(batch.map(async (url) => {
      let result = await bench_wisp(url, targets, timeout_ms);
      if (on_progress) {
        try {
          on_progress(result);
        }
        catch {}
      }
      return result;
    }));
    results.push(...batch_results);
  }

  for (let result of results) {
    let latency = (result.connect_ms || 0) + (result.ttfb_ms || 0);
    result.score = result.ok ? result.rate / (1 + latency / 3000) : 0;
  }
  return results;
}

export async function pick_best_wisp(urls, options = {}) {
  let results = await benchmark_wisps(urls, options);
  let ranked = results.filter((result) => result.ok).sort((a, b) => b.score - a.score);
  let untested = [];
  let tested = new Set(results.map((result) => result.url));
  for (let url of Array.isArray(urls) ? urls : []) {
    let normalized = normalize_wisp(url);
    if (normalized && !tested.has(normalized) && !untested.includes(normalized)) untested.push(normalized);
  }

  if (options.verbose !== false) {
    console.table(results.map((result) => ({
      wisp: result.url,
      ok: result.ok,
      reason: result.reason,
      connect_ms: result.connect_ms,
      ttfb_ms: result.ttfb_ms,
      kb_per_s: Math.round((result.rate || 0) / 1024)
    })));
  }

  if (ranked.length === 0) return {best: null, ranked: [], results: results};

  wisp_rates.clear();
  for (let result of ranked) wisp_rates.set(result.url, Math.max(result.rate, 1024));
  set_wisp_pool([...ranked.map((result) => result.url), ...untested]);
  if (options.apply !== false) libcurl.set_websocket(ranked[0].url);
  return {best: ranked[0].url, ranked: ranked, results: results};
}

export function get_connection_info() {
  let now = Date.now();
  let paused_hosts = [];
  for (let [host, health] of host_health) {
    if (health.blocked_until > now) paused_hosts.push(host);
  }
  return {
    websocket: ws_url,
    wisp_pool: [...wisp_pool],
    wisp_tripped: wisp.tripped,
    wisp_retry_in_ms: Math.max(0, wisp.down_until - now),
    concurrency_limit: concurrency_limit,
    active_requests: active_requests,
    queued_requests: request_queue.length,
    open_streams: Object.keys(streams).length,
    paused_hosts: paused_hosts,
    balanced_transport: balanced_installed,
    wisp_load: wisp_pool.map((url) => ({
      url: url,
      streams: wisp_load(url),
      kb_per_s: Math.round((wisp_rates.get(url) || 0) / 1024),
      down: (wisp_down.get(url) || 0) > now
    }))
  };
}

export async function test_hosts(urls = DEFAULT_TEST_URLS) {
  if (!session) await session_ready;
  let results = [];

  for (let url of urls) {
    let started = performance.now();
    try {
      let response = await with_timeout(session.fetch(url, {method: "HEAD"}), TEST_TIMEOUT_MS, url);
      results.push({
        url: url,
        result: "ok",
        status: response.status,
        ms: Math.round(performance.now() - started)
      });
      discard_response(response);
    }
    catch (e) {
      results.push({
        url: url,
        result: error_message(e),
        status: "",
        ms: Math.round(performance.now() - started)
      });
    }
  }

  console.table(results);
  return results;
}

let save_jar = () => false;

function make_session() {
  let created = null;
  try {
    let stored = load_jar(localStorage);
    try {
      created = new libcurl.HTTPSession(stored ? {enable_cookies: true, cookie_jar: stored} : {enable_cookies: true});
    }
    catch {
      created = new libcurl.HTTPSession({enable_cookies: true});
    }
    save_jar = create_jar_saver(localStorage, () => created.export_cookies?.() || "");
    setInterval(() => save_jar(), 2000);
    for (let name of ["pagehide", "beforeunload"]) window.addEventListener(name, () => save_jar());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") save_jar();
    });
    return created;
  }
  catch (e) {
    quiet_warn("sandstone host: cookie-enabled session failed, using a plain session:", error_message(e));
    return new libcurl.HTTPSession();
  }
}

function rotate_wisp() {
  if (!WISP_ROTATION_ENABLED) return;
  let now = Date.now();
  if (now - wisp.last_rotation < WISP_ROTATE_COOLDOWN_MS) return;
  let candidates = wisp_pool.filter((url) => url !== ws_url);
  if (candidates.length === 0) return;
  let next = candidates[wisp.rotations % candidates.length];
  wisp.rotations++;
  wisp.last_rotation = now;
  quiet_warn(`sandstone host: wisp server ${ws_url} looks unreachable, switching to ${next}`);
  try {
    libcurl.set_websocket(next);
  }
  catch (e) {
    quiet_warn("sandstone host: could not switch wisp server:", error_message(e));
  }
}

function trip_wisp() {
  let now = Date.now();
  wisp.tripped = true;
  wisp.trips++;
  wisp.down_until = now + wisp.backoff;
  quiet_warn(WISP_GATE_ENABLED
    ? `sandstone host: many connections are failing, pausing new requests for ${Math.round(wisp.backoff / 1000)}s (wisp server: ${ws_url})`
    : `sandstone host: many connections are failing (wisp server: ${ws_url}), requests are not being paused`);
  wisp.backoff = Math.min(wisp.backoff * 2, WISP_BACKOFF_MAX_MS);
  wisp.recent.clear();
  if (wisp.trips >= 2) rotate_wisp();
}

function note_wisp_failure(url) {
  let now = Date.now();
  if (wisp.tripped) {
    if (now >= wisp.down_until) trip_wisp();
    return;
  }
  wisp.recent.set(host_of(url), now);
  for (let [host, time] of wisp.recent) {
    if (now - time > WISP_FAIL_WINDOW_MS) wisp.recent.delete(host);
  }
  if (wisp.recent.size >= WISP_FAIL_THRESHOLD) trip_wisp();
}

function note_wisp_success() {
  if (wisp.tripped) console.log("sandstone host: wisp connection recovered");
  wisp.recent.clear();
  wisp.tripped = false;
  wisp.down_until = 0;
  wisp.backoff = WISP_BACKOFF_MIN_MS;
  wisp.trips = 0;
}

function wisp_gate(url) {
  if (!WISP_GATE_ENABLED || !wisp.tripped) return false;
  if (Date.now() < wisp.down_until || wisp.probing) {
    let error = new Error(`Request "${url}" failed with error code 7: waiting for the wisp server to recover`);
    error.wisp_paused = true;
    throw error;
  }
  wisp.probing = true;
  return true;
}

function drain_requests() {
  while (request_queue.length > 0 && active_requests < concurrency_limit) {
    active_requests++;
    request_queue.shift()();
  }
}

function acquire_slot() {
  if (active_requests < concurrency_limit && request_queue.length === 0) {
    active_requests++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    request_queue.push(resolve);
  });
}

function release_slot() {
  active_requests--;
  drain_requests();
}

function shrink_concurrency() {
  if (!ADAPTIVE_CONCURRENCY_ENABLED) return;
  let previous = concurrency_limit;
  concurrency_limit = Math.max(MIN_CONCURRENT_REQUESTS, Math.floor(concurrency_limit / 2));
  successes_since_shrink = 0;
  cooldown_until = Date.now() + COOLDOWN_MS;
  if (concurrency_limit !== previous && Date.now() - last_shrink_log > 5000) {
    last_shrink_log = Date.now();
    quiet_warn(`sandstone host: connection errors across several hosts, lowering concurrent requests from ${previous} to ${concurrency_limit}`);
  }
}

function grow_concurrency() {
  successes_since_shrink++;
  if (successes_since_shrink < GROW_AFTER_SUCCESSES) return;
  successes_since_shrink = 0;
  if (concurrency_limit >= MAX_CONCURRENT_REQUESTS) return;
  concurrency_limit++;
  drain_requests();
}

function is_host_blocked(url) {
  if (!HOST_BLOCKING_ENABLED) return false;
  let health = host_health.get(host_of(url));
  return !!health && health.blocked_until > Date.now();
}

function note_success(url) {
  host_health.delete(host_of(url));
  recent_failures.delete(host_of(url));
  note_wisp_success();
  grow_concurrency();
}

function note_failure(error, url) {
  if (error?.wisp_paused) return;
  let message = error_message(error);
  if (!CONNECTION_ERRORS.test(message)) return;
  let host = host_of(url);
  let now = Date.now();
  let tls = TLS_ERROR.test(message);

  if (CONNECT_ERROR.test(message)) note_wisp_failure(url);

  let health = host_health.get(host) || {failures: 0, tls_failures: 0, blocked_until: 0};
  let trip;
  let block_ms;
  if (tls) {
    health.tls_failures++;
    trip = health.tls_failures >= TLS_HOST_FAIL_THRESHOLD;
    block_ms = TLS_HOST_BLOCK_MS;
  }
  else {
    health.failures++;
    trip = health.failures >= HOST_FAIL_THRESHOLD;
    block_ms = HOST_BLOCK_MS;
  }
  if (trip && health.blocked_until <= now) {
    health.blocked_until = now + block_ms;
    health.failures = 0;
    health.tls_failures = 0;
    quiet_warn(HOST_BLOCKING_ENABLED
      ? `sandstone host: ${host} keeps failing to connect, pausing requests to it for ${block_ms / 1000}s. This host is probably blocked by, or incompatible with, the current wisp server.`
      : `sandstone host: ${host} keeps failing to connect. This host is probably blocked by, or incompatible with, the current wisp server.`);
  }
  host_health.set(host, health);

  recent_failures.set(host, now);
  for (let [key, time] of recent_failures) {
    if (now - time > SHRINK_WINDOW_MS) recent_failures.delete(key);
  }
  if (recent_failures.size >= SHRINK_HOST_COUNT) shrink_concurrency();
}

function acquire_host_slot(host) {
  let active = host_active.get(host) || 0;
  if (active < MAX_PER_HOST) {
    host_active.set(host, active + 1);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let queue = host_queues.get(host);
    if (!queue) {
      queue = [];
      host_queues.set(host, queue);
    }
    queue.push(resolve);
  });
}

function release_host_slot(host) {
  let queue = host_queues.get(host);
  let next = queue && queue.shift();
  if (queue && queue.length === 0) host_queues.delete(host);
  if (next) {
    next();
    return;
  }
  let active = (host_active.get(host) || 1) - 1;
  if (active <= 0) host_active.delete(host);
  else host_active.set(host, active);
}

function error_message(error) {
  return String(error?.message ?? error);
}

function is_transient(error) {
  return TRANSIENT_ERRORS.test(error_message(error));
}

function with_timeout(promise, ms, url) {
  let timer;
  let timed_out = false;

  promise.then((response) => {
    if (!timed_out) return;
    try {
      response?.body?.cancel?.().catch?.(() => {});
    }
    catch {}
  }, () => {});

  let timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      timed_out = true;
      reject(new Error(`Request "${url}" failed with error code 28: timed out`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const cert_diagnosed = new Set();

// Error 60 only says "peer verification failed". Re-run one verbose request per
// host and print libcurl's own explanation (e.g. BADCERT_NOT_TRUSTED, BADCERT_EXPIRED,
// BADCERT_FUTURE for a wrong device clock, BADCERT_BAD_MD / BAD_PK for weak signatures).
function diagnose_certificate(url) {
  let host;
  try {
    host = new URL(url).host;
  }
  catch {
    return;
  }
  if (cert_diagnosed.has(host) || !session) return;
  cert_diagnosed.add(host);

  (async () => {
    let lines = [];
    let previous = libcurl.stderr;
    libcurl.stderr = (text) => {
      lines.push(String(text));
      try {
        previous?.(text);
      }
      catch {}
    };
    try {
      await with_timeout(session.fetch(`https://${host}/`, {method: "HEAD", _libcurl_verbose: 1}), 15000, url);
    }
    catch {}
    finally {
      libcurl.stderr = previous;
    }
    let details = lines.filter((line) => /cert|verify|BADCERT|expire|trust|issuer|chain|x509|SSL/i.test(line));
    let filtered = details.find((line) => /block\s?page|blocked|nextdns|adguard|pi-?hole|opendns|umbrella|cleanbrowsing|controld|filter/i.test(line));
    if (filtered) {
      quiet_warn(
        `sandstone host: ${host} is being blocked by a DNS filter on the network the wisp server resolves through ` +
        `(its certificate was issued by a block page: ${filtered.trim()}). This is normal for trackers and error reporters; ` +
        "allow-list the domain in the filter, or point the wisp server at an unfiltered resolver, if the site needs it."
      );
      return;
    }
    quiet_warn(
      `sandstone host: certificate check failed for ${host} (device time ${new Date().toISOString()}).\n` +
      (details.length ? details.join("\n") : "libcurl gave no further details.")
    );
  })();
}

// Roblox's quick sign-in ticket is single-use. The page sometimes fires /v2/login twice within a few ms
// (both pollers see status=Validated), and whichever lands second gets "Incorrect username or password".
// Identical concurrent logins (same url, CSRF token and body) are collapsed into one real request.
const login_inflight = new Map();
const LOGIN_COALESCE_LINGER_MS = 1500;

function body_as_text(body) {
  try {
    if (typeof body === "string") return body;
    if (body instanceof ArrayBuffer) return new TextDecoder().decode(body);
    if (ArrayBuffer.isView(body)) return new TextDecoder().decode(body);
  }
  catch {}
  return null;
}

function login_coalesce_key(url, options) {
  if (String(options?.method || "GET").toUpperCase() !== "POST") return null;
  if (!/^auth\.roblox\.com$/i.test(host_of(url)) || !/\/v2\/login(\?|$)/i.test(url)) return null;
  let text = body_as_text(options?.body);
  if (text === null) return null;
  let token = Object.entries(options.headers || {}).find(([name]) => name.toLowerCase() === "x-csrf-token");
  return url + "\n" + (token ? token[1] : "") + "\n" + text;
}

function clone_response(response) {
  let copy = response.clone();
  for (let key of ["raw_headers", "url", "redirected"]) {
    try {
      Object.defineProperty(copy, key, {value: response[key]});
    }
    catch {}
  }
  return copy;
}

function fetch_with_retry(url, options, ...rest) {
  let key = login_coalesce_key(url, options);
  if (!key) return fetch_with_retry_inner(url, options, ...rest);
  let entry = login_inflight.get(key);
  if (entry) {
    quiet_warn(`sandstone host: coalesced duplicate login request ${url}`);
    return entry.promise.then(() => entry.spare ? clone_response(entry.spare) : fetch_with_retry_inner(url, options, ...rest));
  }
  entry = {promise: null, spare: null};
  entry.promise = fetch_with_retry_inner(url, options, ...rest).then((response) => {
    try {
      entry.spare = clone_response(response);
    }
    catch {}
    return response;
  });
  login_inflight.set(key, entry);
  let release = () => setTimeout(() => {
    login_inflight.delete(key);
    try {
      entry.spare?.body?.cancel?.().catch?.(() => {});
    }
    catch {}
  }, LOGIN_COALESCE_LINGER_MS);
  entry.promise.then(release, () => login_inflight.delete(key));
  return entry.promise;
}

async function fetch_with_retry_inner(url, options, ignore_block = false, use_session = null, timeout_ms = REQUEST_TIMEOUT_MS, retry_cap = Infinity) {
  let method = String(options?.method || "GET").toUpperCase();
  let can_retry = method === "GET" || method === "HEAD";
  let attempt = 0;
  url = onion_url(url);
  let roblox_cdn = is_roblox_cdn(url);
  let forbidden_retries = 0;
  let csrf_retries = 0;
  let identity_forced = false;
  if (roblox_cdn) options = with_roblox_referer(options);
  options = discord_fetch_options(url, options);

  while (true) {
    if (!ignore_block && is_host_blocked(url)) {
      throw new Error(`Request "${url}" failed with error code 35: host is paused after repeated connection failures`);
    }
    let probe = ignore_block ? false : wisp_gate(url);
    await wait_for_cooldown();
    try {
      let response = await with_timeout(
        (use_session || session).fetch(url, options ? {...options} : undefined),
        timeout_ms,
        url
      );
      if (probe) {
        wisp.probing = false;
        probe = false;
      }
      if (response.status === 403 && roblox_cdn && forbidden_retries < 3) {
        forbidden_retries++;
        let sent = Object.entries(options?.headers || {})
          .map(([key, value]) => /^(referer|origin)$/i.test(key) ? `${key}=${value}` : key)
          .join(",");
        let got = ["server", "via", "x-cache", "x-amz-request-id", "x-amz-cf-id", "content-type"]
          .map((name) => `${name}=${response.headers.get(name) || ""}`)
          .join(" ");
        let snippet = "";
        try {
          snippet = (await response.text()).slice(0, 200);
        }
        catch {}
        quiet_warn(`sandstone host: roblox cdn 403 (attempt ${forbidden_retries}) ${method} ${url} sent=[${sent}] credentials=${options?.credentials || ""} got=[${got}] body=${snippet}`);
        discard_response(response);
        options = forbidden_retries === 1
          ? strip_headers(options, ["origin"])
          : forbidden_retries === 2
            ? with_header(options, "Origin", "https://play.roblox.com")
            : keep_headers(options, ["user-agent", "range"]);
        continue;
      }
      if (response.status === 403 && csrf_retries < 1 && method !== "GET" && method !== "HEAD" && /(^|\.)roblox\.com$/i.test(host_of(url))) {
        let fresh = response.headers.get("x-csrf-token");
        let sent = Object.entries(options?.headers || {}).find(([name]) => name.toLowerCase() === "x-csrf-token");
        if (fresh && (!sent || String(sent[1]) !== fresh)) {
          csrf_retries++;
          discard_response(response);
          options = with_header(options, "X-CSRF-TOKEN", fresh);
          continue;
        }
      }
      if (/^auth\.roblox\.com$/i.test(host_of(url)) || /analytics-query-gateway|auth-token-service|proof-of-work-service|rotating-client-service|\/v1\/users\/authenticated|\/v2\/captcha|\/challenge\//i.test(url)) {
        let hv = (name) => response.headers.get(name);
        let sent_csrf = Object.keys(options?.headers || {}).some((key) => key.toLowerCase() === "x-csrf-token");
        let detail = "";
        if (response.status >= 400) {
          try {
            detail = (await response.clone().text()).slice(0, 160);
          }
          catch {}
        }
        let shape = "";
        if (/\/v2\/login/i.test(url)) {
          let text = body_as_text(options?.body);
          if (text === null) {
            shape = ` body-type=${Object.prototype.toString.call(options?.body)}`;
          }
          else {
            try {
              let parsed = JSON.parse(text);
              let lens = Object.entries(parsed)
                .map(([key, value]) => `${key}:${typeof value === "string" ? value.length : typeof value}`)
                .join(",");
              shape = ` ctype=${parsed.ctype} fields=[${lens}] body-bytes=${text.length}`;
            }
            catch {
              shape = ` body=non-json bytes=${text.length}`;
            }
          }
        }
        if (response.status === 200 && /login\/status/i.test(url)) {
          try {
            let found = /"status"\s*:\s*"([A-Za-z]+)"/.exec(await response.clone().text());
            if (found) detail = "status=" + found[1];
          }
          catch {}
        }
        let cookie_names = "";
        try {
          cookie_names = (response.raw_headers || [])
            .filter((pair) => Array.isArray(pair) && String(pair[0]).toLowerCase() === "set-cookie")
            .map((pair) => String(pair[1]).split("=")[0].trim() + (/;\s*domain=/i.test(String(pair[1])) ? "@" + /;\s*domain=([^;]+)/i.exec(String(pair[1]))[1] : ""))
            .join(",");
        }
        catch {}
        let sent_cookie = has_header(options?.headers, "cookie") ? "yes" : "no";
        shape += ` set-cookie-names=[${cookie_names}] sent-cookie-hdr=${sent_cookie}`;
        if (response.status >= 400 && /rotating-client-service/i.test(url)) {
          shape += ` www-auth=${hv("www-authenticate") || ""}`;
        }
        quiet_warn(`sandstone host: auth ${response.status} ${method} ${url} sent-csrf=${sent_csrf ? "yes" : "no"} got-csrf=${hv("x-csrf-token") ? "yes" : "no"} challenge=${hv("rblx-challenge-type") || hv("rblx-challenge-id") || "no"} set-cookie=${hv("set-cookie") ? "yes" : "no"} type=${hv("content-type") || ""} body=${detail}${shape}`);
      }
      if (IDP_DIAG_HOSTS.test(host_of(url))) await log_idp_exchange(method, url, options, response);
      if (response.status >= 400 && /(^|\.)(roblox\.com|rbxcdn\.com)$/i.test(host_of(url))) {
        let status_path = "";
        try {
          status_path = new URL(url).pathname;
        }
        catch {}
        log_throttled("http", host_of(url) + status_path, `sandstone host: http ${response.status} ${method} ${url}`);
      }
      note_success(url);
      page_warm = true;
      return response;
    }
    catch (e) {
      if (probe) {
        wisp.probing = false;
        probe = false;
      }
      note_failure(e, url);
      let message = error_message(e);
      if (CERT_ERROR.test(message)) diagnose_certificate(url);
      if (!ignore_block && is_host_blocked(url) && CONNECTION_ERRORS.test(message)) throw e;
      let identity_now = false;
      if (can_retry && !identity_forced && /error code 18\b|partial file/i.test(message)) {
        identity_forced = true;
        identity_now = true;
        options = with_header(options, "Accept-Encoding", "identity");
        options = {...options, _libcurl_verbose: 1, _libcurl_http_version: 1.1};
        if (method === "HEAD") {
          // libcurl waits for a body on a HEAD reply that carries Content-Length, then fails with
          // error 18. Retry as a GET instead; the caller still treats the reply as bodyless
          // because it keys off the original method.
          options.method = "GET";
        }
        quiet_warn(`sandstone host: partial transfer, retrying${method === "HEAD" ? " HEAD as GET" : ""} with identity encoding ${url}`);
      }
      let retryable = can_retry ? is_transient(e) : PRE_REQUEST_ERRORS.test(message);
      if (identity_now) retryable = true;
      let tls = TLS_ERROR.test(message);
      let refused = CONNECT_ERROR.test(message);
      let limit = Math.min(retry_cap, tls ? MAX_TLS_RETRIES : refused ? MAX_CONNECT_RETRIES : MAX_RETRIES);
      if (!retryable || attempt >= limit || WISP_GATE_ENABLED && wisp.tripped && refused) throw e;
      attempt++;
      let base = tls ? 800 : 400;
      let cap = tls ? 6000 : 4000;
      await sleep(Math.min(base * 2 ** (attempt - 1), cap) + Math.random() * 400);
    }
    finally {
      if (probe) wisp.probing = false;
    }
  }
}

function hedged_page(url, options) {
  if (!page_warm) return fetch_with_retry(url, options, true, null, PAGE_COLD_TIMEOUT_MS, 1);
  return new Promise((resolve, reject) => {
    let pending = 0;
    let done = false;
    let timer = null;
    let launch = () => {
      pending++;
      fetch_with_retry(url, options, true, null, PAGE_TIMEOUT_MS, 1).then((response) => {
        if (done) {
          discard_response(response);
          return;
        }
        done = true;
        clearTimeout(timer);
        resolve(response);
      }, (error) => {
        pending--;
        if (done || pending > 0) return;
        done = true;
        clearTimeout(timer);
        reject(error);
      });
    };
    launch();
    timer = setTimeout(() => {
      if (!done) launch();
    }, PAGE_HEDGE_MS);
  });
}

function reset_wisp_connection() {
  if (active_requests > 0) return;
  try {
    let connections = wisp_connections();
    let connection = connections[ws_url];
    if (!connection) return;
    try {
      connection.close?.();
    }
    catch {}
    delete connections[ws_url];
    page_warm = false;
    quiet_warn("sandstone host: reset stalled wisp connection", ws_url);
  }
  catch {}
}

const IDP_DIAG_HOSTS = /(^|\.)(ncedcloud\.org|instructure\.com|identitymgmt\.net)$/i;

function body_shape(body) {
  let text = body_as_text(body);
  if (text === null) return body ? Object.prototype.toString.call(body) : "none";
  try {
    let parsed = JSON.parse(text);
    return "json{" + Object.entries(parsed).map(([key, value]) => `${key}:${typeof value === "string" ? value.length : typeof value}`).join(",") + "}";
  }
  catch {}
  if (/^[^=&]+=/.test(text)) return "form{" + text.split("&").map((part) => { let pair = part.split("="); return `${pair[0]}:${(pair[1] || "").length}`; }).join(",") + "}";
  return `text(${text.length})`;
}

function jar_summary(url) {
  let host = host_of(url);
  let rows = [];
  for (let line of current_jar().split("\n")) {
    let fields = line.replace(/^#HttpOnly_/, "").split("\t");
    if (fields.length < 7) continue;
    let domain = fields[0].replace(/^\./, "");
    if (host === domain || host.endsWith("." + domain)) rows.push(`${fields[5]}@${fields[0]}${fields[2]}${fields[3] === "TRUE" ? ";secure" : ""}`);
  }
  return rows.join(",") || "none";
}

async function log_idp_exchange(method, url, options, response) {
  let type = response.headers.get("content-type") || "";
  let snippet = "";
  if (/json|text\/plain|xml/i.test(type) || (response.status >= 400 && /html/i.test(type))) {
    try {
      snippet = (await response.clone().text()).replace(/\s+/g, " ").slice(0, 320);
    }
    catch {}
  }
  let set_cookies = [];
  try {
    set_cookies = (response.raw_headers || [])
      .filter((pair) => Array.isArray(pair) && String(pair[0]).toLowerCase() === "set-cookie")
      .map((pair) => {
        let parts = String(pair[1]).split(";").map((part) => part.trim());
        return parts[0].split("=")[0] + "[" + parts.slice(1).map((attr) => attr.split("=")[0] === "Path" || attr.split("=")[0] === "Domain" || attr.split("=")[0] === "SameSite" ? attr : attr.split("=")[0]).join(";") + "]";
      });
  }
  catch {}
  let sent = Object.keys(options?.headers || {}).filter((key) => /^(referer|origin|content-type|x-|cookie)/i.test(key)).join(",");
  quiet_warn(`[idp-diag] ${response.status} ${method} ${url} -> ${response.url || ""} location=${response.headers.get("location") || ""} type=${type} req=${body_shape(options?.body)} sent-hdrs=[${sent}] jar=[${jar_summary(url)}] set-cookie=[${set_cookies.join(" | ")}] body=${snippet}`);
}

const SESSION_WAIT_MS = 25 * 1000;

async function ensure_session() {
  if (session) return;
  if (libcurl.ready) {
    try {
      session = make_session();
      session_ready_resolve();
      return;
    }
    catch {}
  }
  let timer;
  let timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("Request failed with error code 28: network engine did not start (libcurl wasm not loaded)"));
    }, SESSION_WAIT_MS);
  });
  try {
    await Promise.race([session_ready, timeout]);
  }
  finally {
    clearTimeout(timer);
  }
}

export async function fetch_page(url, options, on_status = null) {
  await ensure_session();
  let attempt = 0;

  while (true) {
    try {
      let method = String(options?.method || "GET").toUpperCase();
      if (method === "GET") return await hedged_page(url, options);
      return await fetch_with_retry(url, options, true, null, page_warm ? PAGE_TIMEOUT_MS : PAGE_COLD_TIMEOUT_MS, 1);
    }
    catch (e) {
      let message = error_message(e);
      if (attempt >= PAGE_ATTEMPTS - 1 || !/error code (7|28|35)\b/.test(message)) throw e;
      attempt++;
      quiet_warn("sandstone host: page request failed, retrying:", url, message);
      try {
        on_status?.(attempt, message);
      }
      catch {}
      cooldown_until = 0;
      if (attempt >= 1) reset_wisp_connection();
      await sleep(400 * attempt);
    }
  }
}

function has_header(headers, name) {
  if (!headers) return false;
  return Object.keys(headers).some((key) => key.toLowerCase() === name);
}

function merge_chunks(parts, size) {
  if (parts.length === 1) return parts[0];
  let merged = new Uint8Array(size);
  let offset = 0;
  for (let part of parts) {
    merged.set(part, offset);
    offset += part.byteLength;
  }
  return merged;
}

function discard_response(response) {
  try {
    response?.body?.cancel?.().catch?.(() => {});
  }
  catch {}
}

function ranged(options, start, end) {
  return {
    ...(options || {}),
    headers: {...(options?.headers || {}), Range: `bytes=${start}-${end}`}
  };
}

function content_range_total(response) {
  let match = /\/(\d+)\s*$/.exec(response.headers.get("content-range") || "");
  return match ? Number(match[1]) : null;
}

function is_identity(response) {
  let encoding = (response.headers.get("content-encoding") || "").toLowerCase();
  return encoding === "" || encoding === "identity";
}

function usable_segmented(response) {
  return response.status === 206 && content_range_total(response) !== null && is_identity(response);
}

function expected_length(response, method) {
  if (method !== "GET" || response.status !== 200 || !is_identity(response)) return null;
  let length = Number(response.headers.get("content-length"));
  return Number.isFinite(length) && length > 0 ? length : null;
}

function content_range_info(response) {
  let match = /bytes\s+(\d+)-(\d+)\/(\d+|\*)/i.exec(response.headers.get("content-range") || "");
  if (!match) return null;
  return {
    start: Number(match[1]),
    end: Number(match[2]),
    total: match[3] === "*" ? null : Number(match[3])
  };
}

function segment_size_for(total) {
  if (total >= SEGMENT_LARGE_FILE) return SEGMENT_LARGE_BYTES;
  if (total >= SEGMENT_MEDIUM_FILE) return SEGMENT_MEDIUM_BYTES;
  return SEGMENT_PROBE_BYTES;
}

function segment_target(url, options, response) {
  let final = typeof response?.url === "string" ? response.url : "";
  if (!response?.redirected || !/^https?:\/\//i.test(final) || final === url) return {url: url, options: options};
  let cross_origin;
  try {
    cross_origin = new URL(final).origin !== new URL(url).origin;
  }
  catch {
    return {url: url, options: options};
  }
  if (!cross_origin) return {url: final, options: options};
  let headers = {...(options?.headers || {})};
  for (let key of Object.keys(headers)) {
    let lower = key.toLowerCase();
    if (lower === "authorization" || lower === "proxy-authorization" || lower === "cookie") delete headers[key];
  }
  return {url: final, options: {...(options || {}), headers: headers}};
}

function current_jar() {
  try {
    return session.export_cookies?.() || "";
  }
  catch {
    return "";
  }
}

function create_bulk(jar) {
  try {
    let created = new libcurl.HTTPSession(jar ? {enable_cookies: true, cookie_jar: jar} : {enable_cookies: true});
    created.set_connections(BULK_MAX_TOTAL, BULK_CACHE_SIZE, BULK_PER_HOST);
    return {session: created, jar: jar, users: 0, retired: false};
  }
  catch (e) {
    quiet_warn("sandstone host: could not create a download session, using the shared one:", error_message(e));
    return {session: null, jar: jar, users: 0, retired: false};
  }
}

function close_bulk(lease) {
  let target = lease.session;
  lease.session = null;
  if (!target) return;
  try {
    target.close();
  }
  catch {}
}

function retire_bulk(lease) {
  lease.retired = true;
  if (bulk === lease) bulk = null;
  if (lease.users === 0) close_bulk(lease);
}

function acquire_bulk() {
  let now = Date.now();
  if (bulk && bulk.users === 0 && now - jar_checked > JAR_CHECK_MS) {
    jar_checked = now;
    if (bulk.jar !== current_jar()) retire_bulk(bulk);
  }
  if (!bulk) {
    bulk = create_bulk(current_jar());
    jar_checked = now;
  }
  bulk.users++;
  return bulk;
}

function release_bulk(lease) {
  if (!lease) return;
  lease.users = Math.max(0, lease.users - 1);
  if (lease.retired && lease.users === 0) close_bulk(lease);
}

function release_seed(seed) {
  if (!seed) return;
  discard_response(seed.response);
  release_bulk(seed.lease);
  seed.lease = null;
}

async function open_segment(ctx, job, controller, lease) {
  let start = job.start + job.received;
  let end = job.start + job.length - 1;
  let request_options = {...ranged(ctx.options, start, end), signal: controller.signal};
  let response;

  await acquire_host_slot(ctx.host);
  try {
    await acquire_slot();
    try {
      response = await fetch_with_retry(ctx.url, request_options, false, lease.session);
    }
    finally {
      release_slot();
    }
  }
  finally {
    release_host_slot(ctx.host);
  }

  if (response.status !== 206) {
    let status = response.status;
    discard_response(response);
    let error = new Error(`Request failed with error code 22: server did not honor the range request (status ${status})`);
    error.status = status;
    throw error;
  }
  let range = content_range_info(response);
  if (range && (range.start !== start || (range.total !== null && range.total !== ctx.total))) {
    discard_response(response);
    throw new Error("Request failed with error code 22: server returned a different range than requested");
  }
  return response;
}

async function read_body_into(job, response, limit, controller, meter) {
  let reader = response.body && typeof response.body.getReader === "function" ? response.body.getReader() : null;

  if (!reader) {
    let bytes = new Uint8Array(await with_timeout(response.arrayBuffer(), SEGMENT_IDLE_MS * 3, response.url || ""));
    let take = Math.min(bytes.byteLength, limit);
    job.buffer.set(take === bytes.byteLength ? bytes : bytes.subarray(0, take), job.received);
    job.received += take;
    meter.bytes += take;
    return;
  }

  job.cancel_read = () => {
    try {
      reader.cancel().catch(() => {});
    }
    catch {}
  };

  let got = 0;
  let ended = false;
  try {
    while (got < limit) {
      let timer = null;
      let result = await Promise.race([
        reader.read(),
        new Promise((resolve, reject) => {
          timer = setTimeout(() => {
            reject(new Error(`Request failed with error code 28: no data received for ${SEGMENT_IDLE_MS / 1000}s`));
          }, SEGMENT_IDLE_MS);
        })
      ]).finally(() => clearTimeout(timer));

      if (result.done) {
        ended = true;
        break;
      }
      let chunk = result.value;
      let take = Math.min(chunk.byteLength, limit - got);
      job.buffer.set(take === chunk.byteLength ? chunk : chunk.subarray(0, take), job.received);
      job.received += take;
      got += take;
      meter.bytes += take;
    }
  }
  catch (e) {
    try {
      controller.abort();
    }
    catch {}
    job.cancel_read();
    throw e;
  }
  finally {
    if (!ended) job.cancel_read?.();
    job.cancel_read = null;
  }
}

async function run_segment(ctx, job) {
  await segment_semaphore.acquire();
  let failures = 0;
  let attempts = 0;

  try {
    while (true) {
      if (ctx.cancelled) throw new Error("Request failed with error code 18: download was cancelled");

      let before = job.received;
      let controller = new AbortController();
      job.controller = controller;
      let seed = job.seed;
      job.seed = null;
      let lease = null;

      try {
        let response = seed ? seed.response : null;
        if (!response) {
          lease = acquire_bulk();
          if (!lease.session) {
            ctx.max_parallel = FALLBACK_MAX_PARALLEL;
            ctx.target = Math.min(ctx.target, FALLBACK_MAX_PARALLEL);
          }
          response = await open_segment(ctx, job, controller, lease);
        }
        await read_body_into(job, response, job.length - job.received, controller, ctx.meter);
        if (job.received >= job.length) return job.buffer;
        throw new Error(`Request failed with error code 18: segment returned ${job.received} of ${job.length} bytes`);
      }
      catch (e) {
        try {
          controller.abort();
        }
        catch {}
        if (ctx.cancelled) throw e;

        attempts++;
        let progressed = job.received > before;
        failures = progressed ? 0 : failures + 1;
        ctx.meter.errors++;

        let denied = e?.status === 401 || e?.status === 403 || e?.status === 410;
        if (denied && wisp_pool.length > 1 && !spread_off.has(ctx.host)) {
          for (let name of ctx.hosts) spread_off.add(name);
          if (bulk) retire_bulk(bulk);
          failures = Math.max(0, failures - 1);
        }

        if (failures > SEGMENT_RETRIES || attempts > SEGMENT_MAX_ATTEMPTS) throw new Error(error_message(e));
        await sleep(Math.min(250 * 2 ** Math.min(failures, 5), 4000) + Math.random() * 250);
      }
      finally {
        if (seed) release_bulk(seed.lease);
        if (lease) release_bulk(lease);
      }
    }
  }
  finally {
    job.controller = null;
    segment_semaphore.release();
  }
}

function tune_parallelism(ctx, consumer_limited) {
  let meter = ctx.meter;
  let now = performance.now();
  let elapsed = now - meter.since;
  if (elapsed < TUNE_INTERVAL_MS) return;

  let rate = meter.bytes * 1000 / elapsed;
  let errors = meter.errors;
  meter.bytes = 0;
  meter.errors = 0;
  meter.since = now;
  if (consumer_limited) return;

  let improved = meter.last_rate === 0 ? rate > 0 : rate > meter.last_rate * 1.08;
  if (errors > 1 || (meter.last_rate > 0 && rate < meter.last_rate * 0.5)) {
    ctx.target = Math.max(SEGMENT_MIN_PARALLEL, ctx.target - 2);
    meter.action = "down";
    meter.hold = 2;
  }
  else if (meter.action === "up" && !improved) {
    ctx.target = Math.max(SEGMENT_MIN_PARALLEL, ctx.target - 2);
    meter.action = "hold";
    meter.hold = 3;
  }
  else if (meter.hold > 0) {
    meter.hold--;
    meter.action = "hold";
  }
  else if (ctx.target < ctx.max_parallel && rate > 0) {
    ctx.target = Math.min(ctx.max_parallel, ctx.target + 2);
    meter.action = "up";
  }
  else {
    meter.action = "hold";
  }
  ctx.target = Math.min(ctx.target, ctx.max_parallel);
  meter.last_rate = rate;
}

function create_segmented_reader(url, options, total, seeds, original_url = url) {
  let segment_bytes = segment_size_for(total);
  let lookahead = Math.max(Math.floor(SEGMENT_LOOKAHEAD_BYTES / segment_bytes), SEGMENT_MAX_PARALLEL + 2);
  let hosts = [...new Set([host_of(url), host_of(original_url)])];
  let ctx = {
    url: url,
    options: options,
    host: hosts[0],
    hosts: hosts,
    total: total,
    cancelled: false,
    target: SEGMENT_START_PARALLEL,
    max_parallel: SEGMENT_MAX_PARALLEL,
    meter: {bytes: 0, since: performance.now(), last_rate: 0, errors: 0, action: "hold", hold: 0}
  };
  let jobs = new Map();
  let pending_seeds = Array.isArray(seeds) ? [...seeds] : [];
  let next_offset = 0;
  let next_start = 0;
  let next_deliver = 0;
  let in_flight = 0;

  let make_job = () => {
    let seed = pending_seeds.shift() || null;
    let wanted = seed ? seed.length : segment_bytes;
    let length = Math.min(wanted, total - next_offset);
    let job = {
      index: next_start,
      start: next_offset,
      length: length,
      received: 0,
      buffer: new Uint8Array(length),
      seed: seed,
      controller: null,
      cancel_read: null,
      promise: null
    };
    next_offset += length;
    return job;
  };

  let launch = () => {
    if (ctx.cancelled) return;
    let until = Date.now() + SPREAD_TTL_MS;
    while (next_offset < total && in_flight < ctx.target && next_start - next_deliver < lookahead) {
      let job = make_job();
      next_start++;
      in_flight++;
      for (let name of ctx.hosts) spread_hosts.set(name, until);
      job.promise = run_segment(ctx, job).finally(() => {
        in_flight--;
        launch();
      });
      job.promise.catch(() => {});
      jobs.set(job.index, job);
    }
    tune_parallelism(ctx, next_offset < total && next_start - next_deliver >= lookahead);
  };

  let stop = () => {
    ctx.cancelled = true;
    for (let job of jobs.values()) {
      try {
        job.controller?.abort();
      }
      catch {}
      job.cancel_read?.();
      release_seed(job.seed);
      job.seed = null;
    }
    jobs.clear();
    for (let seed of pending_seeds) release_seed(seed);
    pending_seeds = [];
  };

  return {
    read: async () => {
      if (ctx.cancelled || (next_offset >= total && next_deliver >= next_start)) {
        return {done: true, value: undefined};
      }
      launch();
      let job = jobs.get(next_deliver);
      if (!job) throw new Error("segment scheduling stalled");

      let bytes;
      try {
        bytes = await job.promise;
      }
      catch (e) {
        stop();
        throw e;
      }
      jobs.delete(next_deliver);
      next_deliver++;
      launch();
      return {done: false, value: bytes};
    },
    cancel: async () => {
      stop();
    }
  };
}

async function try_segment_upgrade(url, options, response, method) {
  let total = expected_length(response, method);
  if (!total || total < AUTO_SEGMENT_MIN_BYTES) return null;
  if (!(response.headers.get("accept-ranges") || "").toLowerCase().includes("bytes")) return null;

  let segment_bytes = segment_size_for(total);
  let first_length = Math.min(segment_bytes, total);
  if (first_length >= total) return null;
  let second_length = Math.min(segment_bytes, total - first_length);

  let target = segment_target(url, options, response);
  let lease = acquire_bulk();
  let probe = null;
  try {
    probe = await fetch_with_retry(target.url, ranged(target.options, first_length, first_length + second_length - 1), false, lease.session);
  }
  catch {
    probe = null;
  }

  let range = probe ? content_range_info(probe) : null;
  let valid = !!probe && probe.status === 206 && is_identity(probe) && !!range && range.start === first_length && range.total === total;
  if (!valid) {
    if (probe) discard_response(probe);
    release_bulk(lease);
    return null;
  }
  return {
    total: total,
    url: target.url,
    options: target.options,
    seeds: [
      {response: response, length: first_length, lease: null},
      {response: probe, length: second_length, lease: lease}
    ]
  };
}

function end_stream(stream_id, reason = "done") {
  let stream = streams[stream_id];
  if (!stream) return;
  delete streams[stream_id];
  stream.ended = stream.ended || reason;
  closed_streams.set(stream_id, stream.ended);
  if (closed_streams.size > MAX_CLOSED_MEMORY) closed_streams.delete(closed_streams.keys().next().value);
  try {
    stream.reader.cancel().catch(() => {});
  }
  catch {}
}

export function end_streams_for(owners) {
  if (!Array.isArray(owners) || owners.length === 0) return;
  for (let [stream_id, stream] of Object.entries(streams)) {
    if (stream.owner && owners.includes(stream.owner)) end_stream(stream_id, "cancelled");
  }
}

function is_large_stream(stream) {
  return (stream.expected || 0) >= LARGE_STREAM_BYTES || stream.received >= LARGE_STREAM_BYTES;
}

function enforce_stream_cap() {
  let ids = Object.keys(streams);
  if (ids.length <= MAX_OPEN_STREAMS) return;
  let now = Date.now();
  let candidates = ids
    .filter((id) => !streams[id].reading && !is_large_stream(streams[id]) && now - streams[id].touched > EVICT_IDLE_MS)
    .sort((a, b) => streams[a].touched - streams[b].touched);
  for (let id of candidates) {
    if (Object.keys(streams).length <= MAX_OPEN_STREAMS) break;
    end_stream(id, "evicted");
  }
}

function new_stream(fields) {
  return {
    pending: null,
    finished: false,
    error: null,
    received: 0,
    resumes: 0,
    touched: Date.now(),
    can_resume: false,
    expected: null,
    ended: null,
    reading: false,
    ...fields
  };
}

function register_buffer_stream(buffer, url, owner = null) {
  let stream_id = Math.random() + "";
  let delivered = false;
  streams[stream_id] = new_stream({
    reader: {
      read: async () => {
        if (delivered) return {done: true, value: undefined};
        delivered = true;
        return {done: false, value: buffer};
      },
      cancel: async () => {}
    },
    owner: owner,
    url: url,
    options: undefined
  });
  return stream_id;
}

async function read_with_timeout(stream, wait_ms) {
  if (!stream.pending) stream.pending = stream.reader.read();
  let pending = stream.pending;
  let outcome;

  try {
    if (wait_ms === null) {
      outcome = await pending;
    }
    else {
      let timer;
      let timeout = new Promise((resolve) => {
        timer = setTimeout(() => resolve(TIMEOUT), wait_ms);
      });
      try {
        outcome = await Promise.race([pending, timeout]);
      }
      finally {
        clearTimeout(timer);
      }
    }
  }
  catch (e) {
    stream.pending = null;
    throw e;
  }

  if (outcome !== TIMEOUT) stream.pending = null;
  return outcome;
}

async function refetch_stream(stream, error) {
  let method = String(stream.options?.method || "GET").toUpperCase();
  if (stream.refetched || method !== "GET" || stream.options?.body) return false;
  stream.refetched = true;
  quiet_warn("sandstone host: resume unavailable, refetching and skipping byte", stream.received, stream.url, error_message(error));

  try {
    stream.reader.cancel().catch(() => {});
  }
  catch {}
  stream.pending = null;

  try {
    let response = await fetch_with_retry(stream.url, stream.options);
    if (response.status !== 200 || !response.body) return false;
    let source = response.body.getReader();
    let skip = stream.received;
    stream.reader = {
      async read() {
        while (true) {
          let result = await source.read();
          if (result.done || skip <= 0) return result;
          let length = result.value.byteLength;
          if (length <= skip) {
            skip -= length;
            continue;
          }
          let value = result.value.subarray(skip);
          skip = 0;
          return {done: false, value: value};
        }
      },
      cancel() {
        return source.cancel();
      }
    };
    return true;
  }
  catch {
    return false;
  }
}

async function recover_stream(stream_id, stream, error) {
  if (!stream.can_resume || stream.resumes >= MAX_RESUMES) {
    if (await refetch_stream(stream, error)) return;
    end_stream(stream_id);
    throw new Error(error_message(error));
  }
  stream.resumes++;
  quiet_warn("sandstone host: resuming download at byte", stream.received, stream.url, error_message(error));

  try {
    stream.reader.cancel().catch(() => {});
  }
  catch {}
  stream.pending = null;

  try {
    let headers = {...stream.options?.headers, Range: `bytes=${stream.received}-`};
    let response = await fetch_with_retry(stream.url, {...stream.options, headers: headers});
    if (response.status !== 206 || !response.body) {
      throw new Error("server did not honor the range request");
    }
    stream.reader = response.body.getReader();
  }
  catch (e) {
    if (await refetch_stream(stream, e)) return;
    end_stream(stream_id);
    throw new Error(error_message(e));
  }
}

function get_ws(frame_id, ws_id) {
  let frame_websockets = ws_connections[frame_id];
  if (!frame_websockets) return;
  return frame_websockets[ws_id];
}

function push_ws_event(ws_info, event_name, data) {
  ws_info.events.push([event_name, data]);
  ws_info.callback?.();
}

function safe_close(ws_info) {
  try {
    ws_info.ws.close();
  }
  catch (e) {
    quiet_warn("sandstone host: websocket close failed:", error_message(e));
  }
}

rpc_handlers["fetch"] = async function(url, options) {
  let owner = this?.source ?? null;

  if (tracker_blocking && is_blocked(url)) return blocked_payload(url, owner);

  let cached = await response_cache.lookup(url, options);
  if (cached) {
    let cached_id = Math.random() + "";
    streams[cached_id] = new_stream({
      reader: cached.reader,
      owner: owner,
      url: url,
      options: options ? {...options} : undefined,
      expected: cached.length
    });
    enforce_stream_cap();
    cached.payload.stream_id = cached_id;
    return cached.payload;
  }

  if (!session) await session_ready;
  let host = host_of(url);
  await acquire_host_slot(host);
  await acquire_slot();

  try {
    let method = String(options?.method || "GET").toUpperCase();
    let can_segment = (
      method === "GET" &&
      !options?.body &&
      !has_header(options?.headers, "range")
    );
    let response = null;
    let segmented = false;

    if (can_segment && (segmented_hosts.has(host) || LARGE_FILE_PATTERN.test(url))) {
      try {
        let attempt = await fetch_with_retry(url, ranged(options, 0, SEGMENT_PROBE_BYTES - 1));
        if (attempt.status === 206) {
          if (usable_segmented(attempt)) {
            response = attempt;
            segmented = true;
          }
          else {
            discard_response(attempt);
          }
        }
        else if (attempt.status === 416 || attempt.status >= 400) {
          discard_response(attempt);
        }
        else {
          response = attempt;
        }
      }
      catch (e) {
        if (!e?.wisp_paused) {
          log_throttled("ranged", host, "sandstone host: ranged start failed, using a normal request:", url, error_message(e));
        }
      }
    }

    if (!response) {
      try {
        response = await fetch_with_retry(url, options);
      }
      catch (e) {
        let recovered = false;
        if (can_segment && PARTIAL_ERRORS.test(error_message(e))) {
          segmented_hosts.add(host);
          quiet_warn("sandstone host: transfer cut off, switching to segmented download:", url, error_message(e));
          try {
            let attempt = await fetch_with_retry(url, ranged(options, 0, SEGMENT_PROBE_BYTES - 1));
            if (usable_segmented(attempt)) {
              response = attempt;
              segmented = true;
              recovered = true;
            }
            else if (attempt.status === 200) {
              response = attempt;
              recovered = true;
            }
            else {
              discard_response(attempt);
            }
          }
          catch {}
        }
        if (!recovered) {
          if (!e?.wisp_paused) {
            log_throttled("fetch", host, "sandstone host: libcurl fetch failed:", url, error_message(e));
          }
          throw new Error(error_message(e));
        }
      }
    }

    let segment_total = null;
    let segment_seeds = null;
    let segment_url = url;
    let segment_options = options;

    if (segmented) {
      segment_total = content_range_total(response);
      let range = content_range_info(response);
      let first_length = range ? range.end - range.start + 1 : SEGMENT_PROBE_BYTES;
      segment_seeds = [{response: response, length: Math.min(first_length, segment_total), lease: null}];
      let target = segment_target(url, options, response);
      segment_url = target.url;
      segment_options = target.options;
    }
    else if (can_segment && response.status === 200) {
      let upgrade = await try_segment_upgrade(url, options, response, method);
      if (upgrade) {
        segmented = true;
        segment_total = upgrade.total;
        segment_seeds = upgrade.seeds;
        segment_url = upgrade.url;
        segment_options = upgrade.options;
      }
    }

    let keys = ["ok", "redirected", "status", "statusText", "type", "url", "raw_headers"];
    let payload = {
      headers: [],
      items: {},
      mime_type: "",
      stream_id: null
    };
    for (let key of keys) {
      payload.items[key] = response[key];
    }
    for (let pair of response.headers.entries()) {
      payload.headers.push(pair);
    }
    payload.mime_type = (response.headers.get("content-type") || "").split(";")[0].trim();

    if (segmented) {
      payload.items.ok = true;
      payload.items.status = 200;
      payload.items.statusText = "OK";
      payload.headers = payload.headers.filter(([key]) => {
        let name = String(key).toLowerCase();
        return name !== "content-range" && name !== "content-length";
      });
      payload.headers.push(["content-length", String(segment_total)]);

      let stream_id = Math.random() + "";
      streams[stream_id] = new_stream({
        reader: response_cache.wrap_reader(
          create_segmented_reader(
            segment_url,
            segment_options ? {...segment_options} : undefined,
            segment_total,
            segment_seeds,
            url
          ),
          response_cache.plan(url, method, options, payload, segment_total)
        ),
        owner: owner,
        url: url,
        options: options ? {...options} : undefined,
        expected: segment_total,
        can_resume: true
      });
      payload.stream_id = stream_id;
      enforce_stream_cap();
      return payload;
    }

    let encoding = (response.headers.get("content-encoding") || "").toLowerCase();
    let ranges = (response.headers.get("accept-ranges") || "").toLowerCase();

    let bodyless = (
      method === "HEAD" ||
      response.status === 204 ||
      response.status === 205 ||
      response.status === 304 ||
      response.headers.get("content-length") === "0"
    );
    if (bodyless) {
      try {
        response.body?.cancel?.().catch?.(() => {});
      }
      catch {}
      return payload;
    }

    if (typeof response.body?.getReader === "function") {
      let stream_id = Math.random() + "";
      streams[stream_id] = new_stream({
        reader: response_cache.wrap_reader(
          response.body.getReader(),
          response_cache.plan(url, method, options, payload, expected_length(response, method))
        ),
        owner: owner,
        url: url,
        options: options ? {...options} : undefined,
        expected: expected_length(response, method),
        can_resume: (
          method === "GET" &&
          response.status === 200 &&
          ranges.includes("bytes") &&
          (encoding === "" || encoding === "identity") &&
          !has_header(options?.headers, "range")
        )
      });
      payload.stream_id = stream_id;
    }
    else {
      let blob = await response.blob();
      let buffer = new Uint8Array(await blob.arrayBuffer());
      payload.stream_id = register_buffer_stream(buffer, url, owner);
    }

    enforce_stream_cap();
    return payload;
  }
  finally {
    release_slot();
    release_host_slot(host);
  }
}

rpc_handlers["fetch_read"] = async function(stream_id) {
  let stream = streams[stream_id];
  if (!stream) {
    let reason = closed_streams.get(stream_id);
    if (reason === undefined || reason === "done" || reason === "cancelled") return null;
    throw new Error("Request failed with error code 18: download stream was closed early (" + reason + ")");
  }
  stream.touched = Date.now();
  stream.reading = true;

  try {
    if (stream.error) {
      let error = stream.error;
      stream.error = null;
      await recover_stream(stream_id, stream, error);
    }
    if (stream.finished) {
      end_stream(stream_id);
      return null;
    }

    let parts = [];
    let size = 0;

    while (true) {
      let result;
      try {
        result = await read_with_timeout(stream, parts.length > 0 ? COALESCE_WAIT_MS : null);
      }
      catch (e) {
        if (parts.length > 0) {
          stream.error = e;
          break;
        }
        await recover_stream(stream_id, stream, e);
        continue;
      }

      if (result === TIMEOUT) break;

      if (result.done) {
        if (stream.ended === "cancelled") return null;
        if (stream.ended && stream.ended !== "done") {
          throw new Error("Request failed with error code 18: download was interrupted");
        }

        let problem = null;
        if (stream.expected !== null && stream.received < stream.expected) {
          problem = new Error(`Request failed with error code 18: transfer ended early (${stream.received} of ${stream.expected} bytes)`);
        }
        if (!problem) {
          stream.finished = true;
          break;
        }
        if (parts.length > 0) {
          stream.error = problem;
          break;
        }
        await recover_stream(stream_id, stream, problem);
        continue;
      }

      parts.push(result.value);
      size += result.value.byteLength;
      stream.received += result.value.byteLength;
      stream.touched = Date.now();
      if (size >= COALESCE_BYTES) break;
    }

    if (parts.length === 0) {
      end_stream(stream_id);
      return null;
    }

    return merge_chunks(parts, size);
  }
  finally {
    stream.reading = false;
  }
}

rpc_handlers["fetch_cancel"] = function(stream_id) {
  end_stream(stream_id, "cancelled");
}

setInterval(() => {
  let now = Date.now();
  for (let [stream_id, stream] of Object.entries(streams)) {
    if (!stream.reading && now - stream.touched > (is_large_stream(stream) ? LARGE_STREAM_IDLE_MS : STREAM_IDLE_MS)) end_stream(stream_id, "evicted");
  }
}, 15000);

rpc_handlers["ws_new"] = function (frame_id, url, protocols, options) {
  let ws_id = Math.random() + "";
  let ws;

  try {
    ws = new libcurl.CurlWebSocket(url, protocols, discord_ws_options(url, options));
  }
  catch (e) {
    log_throttled("ws_new", host_of(url), "sandstone host: websocket creation failed:", url, error_message(e));
    throw new Error(error_message(e));
  }

  if (!ws_connections[frame_id]) ws_connections[frame_id] = {};
  let ws_info = {
    ws: ws,
    events: [],
    callback: null,
    closing: false,
    closed: false
  };
  ws_connections[frame_id][ws_id] = ws_info;

  ws.onopen = (data) => {
    push_ws_event(ws_info, "open", data);
  };
  ws.onmessage = (data) => {
    if (ws_info.closed) return;
    push_ws_event(ws_info, "message", data);
  };
  ws.onerror = (data) => {
    if (ws_info.closed) return;
    push_ws_event(ws_info, "error", data);
  };
  ws.onclose = (reason) => {
    if (ws_info.closed) return;
    ws_info.closed = true;
    push_ws_event(ws_info, "close", reason);
    if (!ws_info.closing) {
      ws_info.closing = true;
      safe_close(ws_info);
    }
  };

  return ws_id;
}

rpc_handlers["ws_event"] = function (frame_id, ws_id) {
  let ws_info = get_ws(frame_id, ws_id);
  if (!ws_info) return null;

  let take_events = () => {
    let events = ws_info.events;
    ws_info.events = [];
    if (events.some(([name]) => name === "close")) {
      delete ws_connections[frame_id]?.[ws_id];
    }
    return events;
  };

  if (ws_info.events.length > 0) {
    return take_events();
  }

  return new Promise((resolve) => {
    ws_info.callback = () => {
      ws_info.callback = null;
      resolve(take_events());
    };
  });
}

rpc_handlers["ws_send"] = function (frame_id, ws_id, data) {
  let ws_info = get_ws(frame_id, ws_id);
  if (!ws_info || ws_info.closed || ws_info.closing) return;
  try {
    ws_info.ws.send(data);
  }
  catch (e) {
    quiet_warn("sandstone host: websocket send failed:", error_message(e));
  }
}

rpc_handlers["ws_close"] = function (frame_id, ws_id) {
  let ws_info = get_ws(frame_id, ws_id);
  if (!ws_info || ws_info.closing) return;
  ws_info.closing = true;
  safe_close(ws_info);

  setTimeout(() => {
    if (ws_info.closed) return;
    ws_info.closed = true;
    push_ws_event(ws_info, "close", 1000);
  }, 1500);
}

export function clean_ws_connections(id_to_clean) {
  let frame_ids = Object.keys(iframes);

  for (let [frame_id, frame_websockets] of Object.entries(ws_connections)) {
    if (frame_ids.includes(frame_id) && frame_id !== id_to_clean) continue;

    for (let [ws_id, ws_info] of Object.entries(frame_websockets)) {
      delete ws_connections[frame_id][ws_id];
      ws_info.closed = true;
      ws_info.closing = true;
      safe_close(ws_info);
      ws_info.callback?.();
    }

    delete ws_connections[frame_id];
  }
}

libcurl.events.addEventListener("libcurl_load", () => {
  console.log(`libcurl.js v${libcurl.version.lib} loaded`);
  session = make_session();
  session_ready_resolve();
});
