import * as rpc from "../rpc.mjs";
import * as util from "../util.mjs";
import * as network from "./network.mjs";
import * as page_cache from "./page_cache.mjs";
import * as rewrite_cache from "./rewrite_cache.mjs";
import { ingest_script_cookie } from "./cookie_jar.mjs";

import { version } from "./index.mjs";

import { libcurl } from "libcurl.js/bundled";

//frame_js is a string, which is imported using webpack
import frame_js from "../../dist/sandstone_frame.js";

const frame_urls = {};
const cache_served = new Map();
const CACHE_RELOAD_BYPASS_MS = 10 * 1000;
const FRAME_LOAD_TIMEOUT_MS = 8000;
const FRAME_PING_TIMEOUT_MS = 5000;
const FRAME_START_ATTEMPTS = 3;
let last_navigation = 0;
let navigation_count = 0;

function safe_css(value, fallback) {
  if (typeof value !== "string") return fallback;
  value = value.trim();
  if (!value || value.length > 120 || !/^[#a-zA-Z0-9(),.%\/ -]+$/.test(value)) return fallback;
  return value;
}

function build_frame_html(theme) {
  let text = safe_css(theme?.text, "#ffffff");
  return `
  <!DOCTYPE html>
  <head>
    <meta charset="utf-8">
    <script>${frame_js}</script>
    <style>
      html {
        background-color: transparent;
        font-family: sans-serif;
      }
      * {
        color: ${text};
      }
      body {
        margin: 0;
      }
      #error_div {
        display: none;
      }
      #version_text {
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div id="error_div">
      <h2>An unexpected error has occurred</h2>
      <pre id="error_msg">
      </pre>
      <p><i>
        <span id="version_text"></span>
      </p></i>
    </div>
  </body>
`;
}

function get_frame_bundle(theme) {
  let key = safe_css(theme?.bg, "#000000") + "|" + safe_css(theme?.text, "#ffffff");
  if (!frame_urls[key]) {
    let frame_blob = new Blob([build_frame_html(theme)], {type: "text/html"});
    frame_urls[key] = URL.createObjectURL(frame_blob);
  }
  return frame_urls[key];
}

export const iframes = {};
export const persist_storage_key = "proxy_local_storage";
export let local_storage = {};
export const persist_cookie_key = "proxy_cookie_storage";
export let cookie_storage = {};
try {
  cookie_storage = JSON.parse(localStorage.getItem(persist_cookie_key)) || {};
}
catch {}
try {
  local_storage = JSON.parse(localStorage.getItem(persist_storage_key)) || {};
}
catch {}

function navigation_headers(target, referrer, is_post) {
  let headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  };
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    headers["User-Agent"] = navigator.userAgent;
  }
  if (!referrer) return headers;

  let from;
  try {
    from = new URL(referrer);
  }
  catch {
    return headers;
  }
  if (from.protocol !== "http:" && from.protocol !== "https:") return headers;
  if (from.protocol === "https:" && target.protocol === "http:") return headers;

  let from_origin = from.origin;
  if (from_origin === target.origin) {
    from.hash = "";
    from.username = "";
    from.password = "";
    headers["Referer"] = from.href;
  }
  else {
    headers["Referer"] = from_origin + "/";
  }
  if (is_post) headers["Origin"] = from_origin;
  return headers;
}

function extract_set_cookies(response) {
  let cookies = [];
  let raw = response?.raw_headers;
  if (!Array.isArray(raw)) return cookies;
  for (let pair of raw) {
    if (Array.isArray(pair) && String(pair[0]).toLowerCase() === "set-cookie") {
      cookies.push(String(pair[1]));
    }
  }
  return cookies;
}

let libcurl_loading = null;

const BASE_SANDBOX = "allow-scripts allow-forms allow-modals allow-pointer-lock";
const DRM_HOSTS = [/(^|\.)spotify\.com$/i];
const sandbox_fallback_hosts = new Set();

function ensure_libcurl() {
  if (libcurl.ready) return Promise.resolve();
  if (!libcurl_loading) {
    libcurl_loading = Promise.resolve(libcurl.load_wasm()).catch((e) => {
      libcurl_loading = null;
      throw e;
    });
  }
  return libcurl_loading;
}

if (typeof window !== "undefined") ensure_libcurl().catch(() => {});

export class ProxyFrame {
  constructor() {
    this.url = null;
    this.id = Math.random() + "";
    this.iframe = document.createElement("iframe");
    this.iframe.setAttribute("sandbox", BASE_SANDBOX);
    this.iframe.allowFullscreen = true;
    this.iframe.allow = "cross-origin-isolated; fullscreen; pointer-lock; keyboard-map; clipboard-read; screen-wake-lock; encrypted-media; autoplay; picture-in-picture; clipboard-write; web-share; gamepad; accelerometer; gyroscope; magnetometer";    this.iframe.setAttribute("frame-id", this.id);

    iframes[this.id] = this;
    this.rpc_target = new rpc.RPCTarget();
    this.rpc_target.onmessage = rpc.message_listener;
    this.send_page = rpc.create_rpc_wrapper(this.rpc_target, "html");
    this.get_favicon = rpc.create_rpc_wrapper(this.rpc_target, "favicon");
    this.eval_js = rpc.create_rpc_wrapper(this.rpc_target, "eval");

    this.on_navigate = () => {};
    this.on_load = () => {};
    this.on_url_change = () => {};
    this.on_info = () => {};
    this.on_progress = () => {};
    this.on_console = () => {};
    this.on_ready = () => {};
    this.theme = null;
    this.title = "";
    this.icon = null;
    this.icon_source = null;

    this.special_pages = {};
    this.site_settings = [];
    this.default_settings = {
      allow_js: true
    };
    this.session_storage = {};
  }

  async refresh_icon() {
    try {
      let source = await this.get_favicon();
      if (!source) return;
      if (source === this.icon_source && this.icon) return;
      let response = await network.fetch_page(source, {});
      let blob = await response.blob();
      if (!blob || !blob.size || blob.size > 512 * 1024) return;
      let data = await new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      if (typeof data !== "string" || !/^data:image\//i.test(data)) return;
      this.icon_source = source;
      this.icon = data;
      this.emit_info();
    }
    catch {}
  }

  emit_progress(value, text) {
    try {
      this.on_progress(value, text);
    }
    catch {}
  }

  emit_info() {
    try {
      this.on_info({
        url: this.url ? this.url.href : "",
        title: this.title || "",
        icon: this.icon
      });
    }
    catch {}
  }

  async wait_for_libcurl() {
    await ensure_libcurl();
  }

  apply_sandbox(hostname) {
    let drm = DRM_HOSTS.some((pattern) => pattern.test(hostname)) && !sandbox_fallback_hosts.has(hostname);
    this.same_origin_host = drm ? hostname : null;
    let flags = drm ? BASE_SANDBOX + " allow-same-origin" : BASE_SANDBOX;
    if (this.iframe.getAttribute("sandbox") !== flags) this.iframe.setAttribute("sandbox", flags);
  }

  load_frame_document() {
    return new Promise((resolve) => {
      let done = false;
      let finish = () => {
        if (done) return;
        done = true;
        this.iframe.removeEventListener("load", finish);
        resolve();
      };
      this.iframe.addEventListener("load", finish);
      this.iframe.src = get_frame_bundle(this.theme);
      setTimeout(finish, FRAME_LOAD_TIMEOUT_MS);
    });
  }

  async connect_frame() {
    for (let attempt = 0; attempt < FRAME_START_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        if (this.same_origin_host) {
          console.warn("page frame did not answer with allow-same-origin on " + this.same_origin_host + ", falling back to the opaque sandbox (DRM playback will be unavailable)");
          sandbox_fallback_hosts.add(this.same_origin_host);
          this.apply_sandbox(this.same_origin_host);
        }
        this.emit_progress(0.4, "Restarting page frame (" + (attempt + 1) + ")");
        await this.load_frame_document();
      }
      if (await rpc.wait_on_frame(this.iframe, FRAME_PING_TIMEOUT_MS)) return true;
    }
    return false;
  }

  async navigate_to(url, form_data=null, referrer=null) {
    this.emit_progress(0.02, "Starting");
    await this.wait_for_libcurl();
    if (!util.is_valid_url(url)) {
      throw TypeError("Invalid URL");
    }

    let since = last_navigation ? Math.round((Date.now() - last_navigation) / 1000) + "s since last" : "first";
    last_navigation = Date.now();
    navigation_count++;
    console.log("navigating to", url, "(#" + navigation_count + ", " + since + (referrer ? ", referrer " + referrer : "") + ")");
    this.url = new URL(url);
    
    this.iframe.style.backgroundColor = "transparent";
    this.on_navigate();
    this.emit_progress(0.05, "Connecting");

    let old_ports = [this.rpc_target.target, ...this.rpc_target.extra_targets].filter(Boolean);
    network.end_streams_for(old_ports);

    this.apply_sandbox(this.url.hostname);
    let frame_loaded = this.load_frame_document();
    network.clean_ws_connections(this.id);

    let html = null;
    let error = false;
    let set_cookies = [];

    if (typeof this.special_pages[url] === "string") {
      html = this.special_pages[url];
    }
    else {
      try {
        let options = {};
        if (form_data) {
          console.log("placing post request:", form_data);
          let body = form_data.body;

          if (form_data.enctype === "multipart/form-data" && Array.isArray(body)) {
            let rebuilt = new FormData();
            for (let [key, value] of body) rebuilt.append(key, value);
            body = rebuilt;
          }

          options = { method: "POST", body };
          if (!(body instanceof FormData)) {
            options.headers = {"Content-Type": form_data.enctype};
          }
        }
        options.headers = {
          ...navigation_headers(new URL(url), referrer, !!form_data),
          ...(options.headers || {})
        };
        let requested = url;
        let cached = null;
        let recent = cache_served.get(requested);
        if (!form_data && !(recent && Date.now() - recent < CACHE_RELOAD_BYPASS_MS)) {
          cached = await page_cache.get(requested);
        }
        if (cached) {
          cache_served.set(requested, Date.now());
          html = cached.html;
          url = cached.url || requested;
          this.emit_progress(0.35, "Loaded from cache");
          network.fetch_page(requested, options).then(async (fresh) => {
            let type = fresh.headers.get("content-type") || "";
            if (!fresh.ok || !/html/i.test(type)) return;
            let text = await fresh.text();
            page_cache.put([requested, fresh.url], text, fresh.url);
          }).catch(() => {});
        }
        else {
          this.emit_progress(0.12, "Fetching page");
          let response = await network.fetch_page(url, options, (attempt, reason) => {
            let code = /error code (\d+)/.exec(reason || "");
            this.emit_progress(0.12, "Retrying (" + (attempt + 1) + ")" + (code ? " error " + code[1] : ""));
          });
          html = await response.text();
          this.emit_progress(0.35, "Page downloaded");
          set_cookies = extract_set_cookies(response);
          url = response.url;
          if (!form_data && response.ok && /html/i.test(response.headers.get("content-type") || "")) {
            page_cache.put([requested, response.url], html, response.url);
          }
        }
      }
      catch (e) {
        error = util.format_error(e);
      }  
    }
    this.url = new URL(url);
    
    let settings = this.site_settings.find((item) => {
      return item.hostname.test(this.url.hostname);
    }) || {};
    settings = {...this.default_settings, ...settings};
    console.log("site settings:", settings);

    this.emit_progress(0.4, "Preparing page");
    let ready_timer = setTimeout(() => {
      this.emit_progress(1, "Ready");
      try {
        this.on_ready();
      }
      catch {}
    }, 25000);
    await frame_loaded;
    if (!(await this.connect_frame())) {
      clearTimeout(ready_timer);
      this.emit_progress(1, "Could not start page frame");
      try {
        this.on_ready();
      }
      catch {}
      return;
    }
    let msg_channel = new MessageChannel();
    this.rpc_target.set_target(msg_channel.port1);
    msg_channel.port1.start();
    await rpc.set_host(this.iframe, msg_channel.port2);

    try {
      await this.send_page({
        url: this.url.href,
        html: html, 
        frame_id: this.id,
        error: error,
        settings: settings,
        default_settings: this.default_settings,
        local_storage: local_storage[this.url.origin],
        session_storage: this.session_storage[this.url.origin],
        cookies: cookie_storage[this.url.origin],
        set_cookies: set_cookies,
        version: version
      });
    }
    catch (e) {
      let error_msg = util.format_error(e);
      await this.send_page({
        url: this.url.href,
        html: html, 
        frame_id: this.id,
        error: error_msg,
        settings: settings,
        default_settings: this.default_settings,
        local_storage: undefined,
        session_storage: undefined,
        cookies: undefined,
        set_cookies: undefined,
        version: version
      });
    }
    clearTimeout(ready_timer);
    this.iframe.style.backgroundColor = "unset";
    this.on_load();
    this.emit_progress(1, "Ready");
    try {
      this.on_ready();
    }
    catch {}
    this.emit_info();
    setTimeout(() => this.refresh_icon(), 3000);
  }
}

rpc.rpc_handlers["navigate"] = async (frame_id, url, reload=true, form_data=null) => {
  let frame = iframes[frame_id];
  if (!frame) return;

  if (reload) {
    let referrer = frame.url ? frame.url.href : null;
    await frame.navigate_to(url, form_data, referrer);
  }
  else {
    frame.url = new URL(url);
    frame.on_url_change();
    frame.emit_info();
  }
}

rpc.rpc_handlers["console"] = async (frame_id, batch) => {
  let frame = iframes[frame_id];
  let nested = false;
  if (!frame) {
    frame = Object.values(iframes)[0];
    nested = true;
  }
  if (!frame || !Array.isArray(batch)) return;
  let clean = [];
  for (let item of batch.slice(0, 200)) {
    if (Array.isArray(item) && typeof item[1] === "string") {
      clean.push([typeof item[0] === "string" ? item[0] : "log", (nested ? "[nested] " : "") + item[1].slice(0, 4000)]);
    }
  }
  if (!clean.length) return;
  try {
    frame.on_console(clean);
  }
  catch {}
}

rpc.rpc_handlers["rewrite_cache_get"] = async (keys) => {
  return await rewrite_cache.get_many(keys);
}

rpc.rpc_handlers["rewrite_cache_put"] = async (items) => {
  await rewrite_cache.put_many(items);
}

rpc.rpc_handlers["progress"] = async (frame_id, value, text) => {
  let frame = iframes[frame_id];
  if (!frame) return;
  frame.emit_progress(value, typeof text === "string" ? text.slice(0, 80) : "");
  if (value >= 1) {
    try {
      frame.on_ready();
    }
    catch {}
  }
}

rpc.rpc_handlers["page_info"] = async (frame_id, title) => {
  let frame = iframes[frame_id];
  if (!frame) return;
  title = typeof title === "string" ? title.slice(0, 300) : "";
  if (title === frame.title) return;
  frame.title = title;
  frame.emit_info();
}

rpc.rpc_handlers["local_storage"] = async (frame_id, entries) => {
  let frame = iframes[frame_id];
  if (!frame) return;
  local_storage[frame.url.origin] = entries;
  if (window.origin) {
    localStorage.setItem(persist_storage_key, JSON.stringify(local_storage));
  }
}

rpc.rpc_handlers["session_storage"] = async (frame_id, entries) => {
  let frame = iframes[frame_id];
  if (!frame || !frame.url) return;
  frame.session_storage[frame.url.origin] = entries;
}

rpc.rpc_handlers["cookies"] = async (frame_id, entries) => {
  let frame = iframes[frame_id];
  if (!frame || !frame.url) return;
  cookie_storage[frame.url.origin] = entries;
  if (window.origin) {
    try {
      localStorage.setItem(persist_cookie_key, JSON.stringify(cookie_storage));
    }
    catch {}
  }
}

rpc.rpc_handlers["js_cookie"] = async (frame_id, cookie_string) => {
  let frame = iframes[frame_id];
  if (!frame || !frame.url) return;
  ingest_script_cookie(frame.url.href, cookie_string);
}

//this is for getting navigation events from form submission handlers
window.addEventListener("message", rpc.message_listener);
