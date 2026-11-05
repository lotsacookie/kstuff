import * as rpc from "../rpc.mjs";
import * as loader from "./loader.mjs";
import * as util from "../util.mjs";
import { ctx, document_base, get_cookie_jar } from "./context.mjs";

const NativeResponse = globalThis.Response;
const NativeHeaders = globalThis.Headers;

export const rpc_fetch= rpc.create_rpc_wrapper(rpc.host, "fetch");
export const rpc_fetch_read = rpc.create_rpc_wrapper(rpc.host, "fetch_read");
export const rpc_fetch_cancel = rpc.create_rpc_wrapper(rpc.host, "fetch_cancel");
export const rpc_ws_new = rpc.create_rpc_wrapper(rpc.host, "ws_new");
export const rpc_ws_event = rpc.create_rpc_wrapper(rpc.host, "ws_event");
export const rpc_ws_send = rpc.create_rpc_wrapper(rpc.host, "ws_send");
export const rpc_ws_close = rpc.create_rpc_wrapper(rpc.host, "ws_close");

export const known_urls = {};
export const resource_cache = {};
export let worker_base = null;

export function set_worker_base(url) {
  worker_base = url;
}
export let requests_allowed = false;

export function enable_network(allowed=true) {
  requests_allowed = allowed;
}

export function cache_put(url, data) {
  resource_cache[url] = data;
}

function page_origin() {
  try {
    return ctx.location?.origin || new URL(loader.url).origin;
  }
  catch {
    return null;
  }
}

function is_page_origin(url_obj) {
  let origin = page_origin();
  if (!origin) return false;
  return url_obj.origin === origin;
}

function header_value(value) {
  if (value === undefined || value === null) return null;
  let type = typeof value;
  if (type === "function" || type === "symbol") return null;
  try {
    return String(value);
  }
  catch {
    return null;
  }
}

function clean_headers(entries) {
  let result = {};
  for (let [key, value] of entries) {
    let text = header_value(value);
    if (text === null) continue;
    result[String(key)] = text;
  }
  return result;
}

function normalize_headers(headers) {
  if (!headers) return {};
  if (headers instanceof NativeHeaders) return Object.fromEntries(headers);
  if (Array.isArray(headers)) return clean_headers(headers);
  if (typeof headers.entries === "function" && typeof headers.get === "function") {
    try {
      return clean_headers(Array.from(headers.entries()));
    }
    catch {
      return {};
    }
  }
  return clean_headers(Object.entries(headers));
}

function is_cloneable(value) {
  let type = typeof value;
  if (type === "function" || type === "symbol") return false;
  if (value === undefined || value === null) return true;
  if (type !== "object") return true;
  try {
    structuredClone(value);
    return true;
  }
  catch {
    return false;
  }
}

function sanitize_options(options) {
  let result = {};
  if (!options || typeof options !== "object") return result;
  for (let key of Object.keys(options)) {
    if (key === "headers") continue;
    let value;
    try {
      value = options[key];
    }
    catch {
      continue;
    }
    if (!is_cloneable(value)) continue;
    result[key] = value;
  }
  return result;
}

function has_header(headers, name) {
  return Object.keys(headers).some((key) => key.toLowerCase() === name);
}

function referer_for(url_obj) {
  try {
    let page = new URL(ctx.location?.href || loader.url);
    if (page.protocol !== "http:" && page.protocol !== "https:") return null;
    if (page.protocol === "https:" && url_obj.protocol === "http:") return null;
    if (page.origin === url_obj.origin) {
      page.hash = "";
      page.username = "";
      page.password = "";
      return page.href;
    }
    return page.origin + "/";
  }
  catch {
    return null;
  }
}

function with_browser_headers(url_obj, options) {
  let from_page_code = options !== undefined && options !== null;
  let headers = normalize_headers(options?.headers);
  let method = String(options?.method || "GET").toUpperCase();

  let no_referrer = options?.referrerPolicy === "no-referrer" || options?.referrer === "";
  if (!no_referrer && !has_header(headers, "referer")) {
    let referer = referer_for(url_obj);
    if (referer) headers["Referer"] = referer;
  }

  if (from_page_code && options.mode !== "no-cors" && !has_header(headers, "origin")) {
    let origin = page_origin();
    let cross_origin = origin !== null && url_obj.origin !== origin;
    if (origin && (cross_origin || (method !== "GET" && method !== "HEAD")))
      headers["Origin"] = origin;
  }

  if (!has_header(headers, "user-agent") && typeof navigator !== "undefined" && navigator.userAgent) {
    headers["User-Agent"] = navigator.userAgent;
  }

  return {...sanitize_options(options), headers: headers, from_page: from_page_code};
}

function cookie_domain(set_cookie) {
  for (let part of String(set_cookie).split(";").slice(1)) {
    let eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim().toLowerCase() === "domain") {
      return part.slice(eq + 1).trim().replace(/^\./, "").toLowerCase();
    }
  }
  return null;
}

function host_matches(host, domain) {
  return host === domain || host.endsWith("." + domain);
}

function page_hostname() {
  try {
    return new URL(page_origin()).hostname.toLowerCase();
  }
  catch {
    return null;
  }
}

function store_response_cookies(url_obj, fetch_data) {
  try {
    let page = page_hostname();
    if (!page) return;
    let host = url_obj.hostname.toLowerCase();
    let same_host = host === page;
    let jar = get_cookie_jar();
    if (!jar) return;
    let pairs = fetch_data.items?.raw_headers || fetch_data.headers || [];
    for (let [key, value] of pairs) {
      if (String(key).toLowerCase() !== "set-cookie") continue;
      let text = String(value);
      if (!same_host) {
        let domain = cookie_domain(text);
        if (!domain || !domain.includes(".") || !host_matches(host, domain) || !host_matches(page, domain)) continue;
      }
      jar.set(text, true);
    }
  }
  catch (e) {
    util.quiet_error("sandstone: could not store response cookies", e);
  }
}

function create_body_stream(stream_id, href) {
  let finished = false;
  return new ReadableStream({
    async pull(controller) {
      if (finished) return;
      try {
        let chunk = await rpc_fetch_read(stream_id);
        if (finished) return;
        if (chunk === null || chunk === undefined) {
          finished = true;
          try {
            controller.close();
          }
          catch {}
        }
        else {
          controller.enqueue(chunk);
        }
      }
      catch (e) {
        if (finished) return;
        finished = true;
        let reason = e?.message ?? String(e);
        util.quiet_error("sandstone: download failed mid-transfer:", href, reason);
        try {
          controller.error(new TypeError("Failed to fetch " + href + " (" + reason + ")"));
        }
        catch {}
      }
    },
    cancel() {
      finished = true;
      rpc_fetch_cancel(stream_id).catch(() => {});
    }
  }, new CountQueuingStrategy({highWaterMark: 2}));
}

export async function fetch(url, options) {
  if (!requests_allowed) throw "Network request blocked";

  let base_url = document_base();
  url = new URL(url, base_url);
  if (url.protocol === "data:" || url.protocol === "blob:") {
    return await globalThis.fetch(url.href, options);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw TypeError("Invalid URL");
  }

  let fetch_data;
  try {
    fetch_data = await rpc_fetch(url.href, with_browser_headers(url, options));
  }
  catch (e) {
    let reason = e?.message ?? String(e);
    util.quiet_error("sandstone: proxied fetch failed:", url.href, reason);
    throw new TypeError("Failed to fetch " + url.href + " (" + reason + ")");
  }

  let body = null;
  if (fetch_data.stream_id !== null && fetch_data.stream_id !== undefined) {
    body = create_body_stream(fetch_data.stream_id, url.href);
  }
  let response_init = {};
  if (fetch_data.mime_type) {
    response_init.headers = {"Content-Type": fetch_data.mime_type};
  }
  let response = new NativeResponse(body, response_init);
  for (let key in fetch_data.items) {
    Object.defineProperty(response, key, {
      value: fetch_data.items[key]
    });
  }

  let headers = new NativeHeaders();
  for (let [key, value] of fetch_data.headers) {
    headers.append(key, value);
  }
  Object.defineProperty(response, "headers", {
    value: headers
  });
  store_response_cookies(url, fetch_data);

  return response;
};

export function create_blob_url(blob, target_url = null) {
  let url = URL.createObjectURL(blob);
  if (target_url)
    known_urls[url] = target_url;
  return url;
}

function to_bytes(data) {
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  return new Uint8Array(data);
}

export class WebSocket extends EventTarget {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  #ws_id;
  #close_requested;

  constructor(url, protocols=[]) {
    super();

    let url_obj = new URL(url, document_base());
    url_obj.protocol = url_obj.protocol.replace("http", "ws");
    this.url = url_obj.href;

    let protocol_list = protocols === undefined || protocols === null ? [] : protocols;
    protocol_list = Array.isArray(protocol_list) ? protocol_list : [protocol_list];
    this.protocols = protocol_list.map(String).filter((item) => item.length > 0);

    this.protocol = "";
    this.extensions = "";
    this.binaryType = "blob";
    this.bufferedAmount = 0;

    this.onopen = () => {};
    this.onerror = () => {};
    this.onmessage = () => {};
    this.onclose = () => {};

    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSING = 2;
    this.CLOSED = 3;
    this.readyState = this.CONNECTING;

    this.#ws_id = null;
    this.#close_requested = false;
    this.#connect();
  }

  async #connect() {
    let headers = {
      "Origin": ctx.location.origin,
      "User-Agent": navigator.userAgent,
    };

    let ws_id;
    try {
      ws_id = await rpc_ws_new(loader.frame_id, this.url, this.protocols, {
        headers: headers
      });
    }
    catch (e) {
      util.quiet_error("sandstone: websocket connect failed", this.url, e?.message ?? e);
      this.#forward_event("error", null);
      this.#forward_event("close", 1006);
      return;
    }

    this.#ws_id = ws_id;
    if (this.#close_requested) {
      rpc_ws_close(loader.frame_id, this.#ws_id).catch(() => {});
    }
    this.#event_loop();
  }

  async #event_loop() {
    while (true) {
      let events;
      try {
        events = await rpc_ws_event(loader.frame_id, this.#ws_id);
      }
      catch (e) {
        this.#forward_event("error", null);
        break;
      }
      if (!events) break;

      let closed = false;
      for (let [event_name, data] of events) {
        this.#forward_event(event_name, data);
        if (event_name === "close") closed = true;
      }
      if (closed) break;
    }

    this.#forward_event("close", 1006);
  }

  #forward_event(event_name, data) {
    if (event_name === "open") {
      if (this.readyState !== this.CONNECTING) return;
      this.readyState = this.OPEN;
      this.#dispatch_event(new Event("open"));
    }
    else if (event_name === "close") {
      if (this.readyState === this.CLOSED) return;
      this.readyState = this.CLOSED;
      let code = Number.isInteger(data) && data >= 1000 && data < 5000 ? data : 1006;
      this.#dispatch_event(new CloseEvent("close", {code: code, wasClean: code === 1000}));
    }
    else if (event_name === "message") {
      if (this.readyState === this.CLOSED) return;
      let converted;
      if (typeof data === "string") {
        converted = data;
      }
      else {
        let bytes = to_bytes(data);
        if (this.binaryType === "arraybuffer")
          converted = bytes.slice().buffer;
        else
          converted = new Blob([bytes]);
      }
      this.#dispatch_event(new MessageEvent("message", {data: converted}));
    }
    else if (event_name === "error") {
      if (this.readyState === this.CLOSED) return;
      this.#dispatch_event(new Event("error"));
    }
  }

  #dispatch_event(event) {
    let handler = this["on" + event.type];
    if (typeof handler === "function") {
      try {
        handler.call(this, event);
      }
      catch (e) {
        util.quiet_error(e);
      }
    }
    this.dispatchEvent(event);
  }

  send(data) {
    if (this.readyState === this.CONNECTING) {
      throw new DOMException("Websocket not ready yet.", "InvalidStateError");
    }
    if (this.readyState !== this.OPEN) {
      return;
    }

    if (data instanceof Blob) {
      (async () => {
        let array_buffer = await data.arrayBuffer();
        this.send(new Uint8Array(array_buffer));
      })();
    }
    else if (typeof data === "string") {
      rpc_ws_send(loader.frame_id, this.#ws_id, data).catch(() => {});
    }
    else {
      let converted = util.data_to_array(data);
      rpc_ws_send(loader.frame_id, this.#ws_id, converted).catch(() => {});
    }
  }

  close() {
    if (this.readyState === this.CLOSING || this.readyState === this.CLOSED) return;
    this.readyState = this.CLOSING;
    this.#close_requested = true;
    if (this.#ws_id !== null) {
      rpc_ws_close(loader.frame_id, this.#ws_id).catch(() => {});
    }
  }
}
