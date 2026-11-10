import { yield_to_main } from "../util.mjs";
import * as rpc from "../rpc.mjs";
import * as rewrite from "./rewrite/index.mjs";
import * as network from "./network.mjs";
import * as parser from "./parser.mjs";

import { update_ctx, run_script, run_script_safe, ctx, convert_url, document_base, set_loading_document, get_cookie_jar } from "./context.mjs";
import { pending_scripts, script_state, execute_script, wait_for_prewarms } from "./rewrite/script.mjs";
import { pending_modules } from "./rewrite/module.mjs";
import { install_form_handler, patch_form_submit } from "./rewrite/form.mjs";
import { set_ready_state } from "./intercept/document.mjs";
import { set_parent_origin, set_parent_factory } from "./intercept/cross_origin.mjs";

const navigate_rpc = rpc.create_rpc_wrapper(rpc.host, "navigate");
export const local_storage = rpc.create_rpc_wrapper(rpc.host, "local_storage");
export const session_storage = rpc.create_rpc_wrapper(rpc.host, "session_storage");
export const cookies = rpc.create_rpc_wrapper(rpc.host, "cookies");
export const js_cookie = rpc.create_rpc_wrapper(rpc.host, "js_cookie");
const page_info_rpc = rpc.create_rpc_wrapper(rpc.host, "page_info");

const console_rpc = rpc.create_rpc_wrapper(rpc.host, "console");
let console_queue = [];
let console_timer = null;
let console_installed = false;
let console_tag = "";

function console_format(value) {
  try {
    if (typeof value === "string") return value;
    if (value instanceof Error) return value.stack || value.message;
    if (typeof value === "function") return String(value);
    if (value && typeof value === "object") {
      try {
        return JSON.stringify(value, (k, v) => typeof v === "bigint" ? String(v) : v, 2);
      }
      catch {
        return Object.prototype.toString.call(value);
      }
    }
    return String(value);
  }
  catch {
    return "[unprintable]";
  }
}

function console_flush() {
  console_timer = null;
  if (!console_queue.length) return;
  let batch = console_queue;
  console_queue = [];
  try {
    console_rpc(parent_frame_id || frame_id, batch);
  }
  catch {}
}

function console_push(level, text) {
  if (console_queue.length >= 200) return;
  console_queue.push([level, (console_tag + String(text)).slice(0, 4000)]);
  if (!console_timer) console_timer = setTimeout(console_flush, 250);
}

function install_console() {
  if (console_installed) return;
  console_installed = true;
  try {
    for (let method of ["log", "info", "warn", "error", "debug"]) {
      let original = console[method];
      console[method] = function(...args) {
        try {
          console_push(method, args.map(console_format).join(" "));
        }
        catch {}
        return original.apply(this, args);
      };
    }
    window.addEventListener("error", (event) => {
      try {
        if (event.target && event.target !== window) {
          let target = event.target.src || event.target.href;
          if (target) console_push("error", "Failed to load " + target);
          return;
        }
        let stack = "";
        try {
          let err = event.error;
          if (err && /^(SecurityError|RuntimeError|CompileError|LinkError)$/.test(err.name) && err.stack) {
            let lines = String(err.stack).split("\n").slice(1).map((line) => line.trim().replace(/blob:[^\s)]*:(\d+:\d+)/, "blob:$1"));
            let wasm = lines.filter((line) => line.includes("wasm://")).slice(0, 2);
            let js = lines.filter((line) => !line.includes("wasm://")).slice(0, 8);
            stack = "\n" + (err.name === "RuntimeError" ? wasm.concat(js) : lines.slice(0, 6)).join("\n");
            if (err.name === "RuntimeError" && typeof globalThis.__sandstone_wasm_describe === "function") {
              let ring = globalThis.__sandstone_wasm_describe();
              if (ring) stack += "\nlast wasm imports called:\n" + ring;
            }
          }
        }
        catch {}
        console_push("error", (event.message || "Error") + (event.filename ? ` (${event.filename}:${event.lineno}:${event.colno})` : "") + stack);
      }
      catch {}
    }, true);
    window.addEventListener("unhandledrejection", (event) => {
      try {
        console_push("error", "Unhandled rejection: " + console_format(event.reason));
      }
      catch {}
    });
  }
  catch {}
}

const progress_rpc = rpc.create_rpc_wrapper(rpc.host, "progress");

function report(value, text) {
  try {
    progress_rpc(frame_id, value, text);
  }
  catch {}
}

let last_sent_title = null;
function send_title() {
  let title = "";
  try {
    title = document.title || "";
  }
  catch {}
  if (title === last_sent_title) return;
  last_sent_title = title;
  try {
    page_info_rpc(frame_id, title);
  }
  catch {}
}

function watch_title() {
  send_title();
  try {
    let head = document.head || document.querySelector("head");
    if (!head) return;
    new MutationObserver(send_title).observe(head, {
      subtree: true,
      childList: true,
      characterData: true
    });
  }
  catch {}
}

export const runtime_src = self.document?.currentScript?.innerHTML;
export let url;
export let worker_url = null;

export function set_worker_url(value) {
  try {
    let parsed = new URL(String(value));
    if (parsed.protocol === "http:" || parsed.protocol === "https:") worker_url = parsed.href;
  }
  catch {}
}
export let frame_id;
export let frame_html;
export let version;
export let is_loaded = false;
export let is_iframe = false;
export let parent_frame_id = null;
export let site_settings = {};
export let default_settings = {};

const MODULE_TIMEOUT_MS = 15000;

export function flush_state() {
  try {
    ctx.localStorage._flush();
  }
  catch {}
  try {
    ctx.sessionStorage._flush();
  }
  catch {}
  try {
    get_cookie_jar()._flush();
  }
  catch {}
}

let nav_count = 0;

function short_stack(skip) {
  try {
    return String(new Error().stack).split("\n").slice(skip, skip + 5).map((line) => {
      return line.trim().replace(/^at /, "").replace(/blob:[^\s)]*:(\d+:\d+)/, "blob:$1");
    }).join(" < ");
  }
  catch {
    return "";
  }
}

export function navigate(...args) {
  flush_state();
  try {
    nav_count++;
    console.warn("nav#" + nav_count + " -> " + args[1] + (args[2] === false ? " (no reload)" : "") + (args[3] ? " (form)" : "") + " t=" + Math.round(performance.now() / 1000) + "s from " + short_stack(2));
  }
  catch {}
  return navigate_rpc(...args);
}

function eval_script(script_element, script_text) {
  execute_script(script_element, script_text);
  script_element.dispatchEvent(new Event("load"));
}

const SLICE_MS = 40;

async function evaluate_scripts() {
  pending_scripts.sort((a, b) => a[0] - b[0]);
  let deferred = [];
  let slice_start = performance.now();
  let maybe_yield = async () => {
    if (performance.now() - slice_start < SLICE_MS) return;
    await yield_to_main();
    slice_start = performance.now();
  };
  let queue = pending_scripts.slice();
  pending_scripts.length = 0;
  for (let [num, script_element, script_text] of queue) {
    if (script_element.defer || script_element.async) {
      deferred.push([script_element, script_text])
    }
    else {
      eval_script(script_element, script_text);
      await maybe_yield();
    }
  }

  for (let [script_element, script_text] of deferred) {
    eval_script(script_element, script_text);
    await maybe_yield();
  }
}

export function eval_module(script_element, blob_url) {
  return new Promise((resolve) => {
    let script = document.createElement("script");
    script.__rewritten__ = true;
    script.type = "module";
    let done = false;
    let finish = (event_name) => {
      if (done) return;
      done = true;
      script.remove();
      script_element.dispatchEvent(new Event(event_name));
      resolve();
    };
    script.addEventListener("load", () => finish("load"));
    script.addEventListener("error", () => finish("error"));
    setTimeout(() => finish("error"), MODULE_TIMEOUT_MS);
    script.src = blob_url;
    document.body.append(script);
  });
}

async function evaluate_modules() {
  pending_modules.sort((a, b) => a[0] - b[0]);
  let modules = [...pending_modules];
  pending_modules.length = 0;
  for (let [order, script_element, blob_url] of modules) {
    await eval_module(script_element, blob_url);
  }
}

export function set_frame_id(id) {
  frame_id = id;
}
export function set_url(_url) {
  url = _url;
}

function get_frame_html() {
  let html = document.documentElement.outerHTML;
  let doctype = new XMLSerializer().serializeToString(document.doctype);
  frame_html = doctype + html;
}

function handle_click(event) {
  if (event.defaultPrevented) return;

  let element = event.target;
  while (element && !(element instanceof HTMLAnchorElement)) {
    element = element.parentElement;
  }
  if (!element || !element.hasAttribute("href")) return;

  let href = element.getAttribute("href").trim();

  if (href.toLowerCase().startsWith("javascript:")) {
    event.preventDefault();
    event.stopImmediatePropagation();
    let original_js = href.substring("javascript:".length);
    try {
      original_js = decodeURIComponent(original_js);
    }
    catch {}
    run_script_safe(original_js);
    return;
  }

  let current_url;
  let target_url;
  try {
    current_url = new URL(ctx.location.href);
    if (href.startsWith("#"))
      target_url = new URL(href, current_url);
    else
      target_url = new URL(href, document_base());
  }
  catch {
    return;
  }

  if (target_url.protocol !== "http:" && target_url.protocol !== "https:") return;

  event.preventDefault();
  event.stopImmediatePropagation();

  let same_document = (
    target_url.origin === current_url.origin &&
    target_url.pathname === current_url.pathname &&
    target_url.search === current_url.search
  );

  if (same_document && href.includes("#")) {
    if (target_url.hash === "" || target_url.hash === "#")
      window.scrollTo(0, 0);
    ctx.location.assign(target_url.href);
    return;
  }

  navigate(frame_id, target_url.href);
}

function install_click_handler() {
  globalThis.addEventListener("click", handle_click);
}

function install_flush_handlers() {
  globalThis.addEventListener("pagehide", flush_state);
  globalThis.addEventListener("beforeunload", flush_state);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush_state();
  });
}

function fire_document_event(type, bubbles = false) {
  try {
    ctx.document.dispatchEvent(new Event(type, {bubbles: bubbles}));
  }
  catch (e) {
    console.error("sandstone: event dispatch failed", type, e);
  }
}

function settle() {
  return new Promise((resolve) => {
    let finish = () => setTimeout(resolve, 0);
    try {
      let channel = new MessageChannel();
      channel.port1.onmessage = () => {
        channel.port1.close();
        finish();
      };
      channel.port2.postMessage(0);
    }
    catch {
      finish();
    }
  });
}

async function load_html(options) {
  version = options.version;
  is_iframe = options.is_iframe || false;
  parent_frame_id = options.parent_frame_id || null;
  default_settings = options.default_settings;
  site_settings = {...default_settings, ...options.settings};
  network.known_urls[location.href] = options.url;
  network.enable_network();

  set_url(options.url);
  set_frame_id(options.frame_id);
  if (is_iframe) {
    try {
      console_tag = "[iframe " + new URL(options.url).host + "] ";
    }
    catch {}
  }
  install_console();
  get_frame_html();
  update_ctx();
  patch_form_submit();

  if (is_iframe) {
    set_parent_origin(options.parent_origin);
    set_parent_factory(() => ctx.parent);
    try {
      console.log("iframe context: url=" + options.url + " origin=" + ctx.location.origin + " parent_origin=" + options.parent_origin + " real_origin=" + String(globalThis.origin) + " same_origin_parent=" + (() => { try { void globalThis.parent.document; return true; } catch { return false; } })());
    }
    catch {}
  }

  globalThis.__dynamic_import__ = rewrite.module_dynamic_import;

  if (options.error) {
    document.getElementById("error_div").style.display = "initial";
    document.getElementById("error_msg").innerText = options.error;
    document.getElementById("version_text").innerText = `Sandstone v${version.ver} (${version.hash})`;
    return;
  }

  if (options.local_storage) {
    for (let [key, value] of options.local_storage) {
      ctx.localStorage.setItem(key, value);
    }
  }

  if (options.session_storage) {
    for (let [key, value] of options.session_storage) {
      ctx.sessionStorage.setItem(key, value);
    }
  }

  let jar = get_cookie_jar();
  if (options.cookies) {
    jar.load(options.cookies);
  }
  if (options.set_cookies) {
    for (let cookie_string of options.set_cookies) {
      jar.set(cookie_string, true);
    }
  }

  set_ready_state("loading");

  let parser = new DOMParser();
  let html = parser.parseFromString(options.html, "text/html");  
  
  set_loading_document(html);
  let creep = 0.45;
  report(creep, "Processing page");
  let creep_timer = setInterval(() => {
    creep += (0.72 - creep) * 0.08;
    report(creep, "Processing page");
  }, 500);
  try {
    await rewrite.element(html.documentElement);
    await wait_for_prewarms();
  }
  finally {
    clearInterval(creep_timer);
    set_loading_document(null);
  }
  report(0.75, "Rendering page");

  script_state.phase = "running";

  let id_elements = html.querySelectorAll("*[id]");
  let ctx_proto = Object.getPrototypeOf(ctx);
  for (let i = 0; i < id_elements.length; i++) {
    let element = id_elements[i];
    if (ctx_proto.hasOwnProperty(element.id)) continue;
    ctx[element.id] = element;
  }

  console.log("done downloading page");
  let t_start = performance.now();
  let stage = "parsed";
  let health = (label) => {
    try {
      let body = document.body;
      let size = body ? body.children.length : -1;
      let text = body ? (body.innerText || "").length : -1;
      console.log("health " + label + ": stage=" + stage + " phase=" + script_state.phase + " pending=" + pending_scripts.length + " loaded=" + is_loaded + " opacity=" + (document.documentElement.style.opacity || "-") + " body=" + size + " text=" + text + " canvas=" + document.getElementsByTagName("canvas").length + " kids=" + (body ? Array.from(body.children).slice(0, 5).map((el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "")).join(",") : "-") + " iframes=" + document.getElementsByTagName("iframe").length + " scripts=" + document.getElementsByTagName("script").length);
    }
    catch (e) {
      console.log("health " + label + " failed: " + e);
    }
  };
  for (let seconds of [4, 12, 30, 60]) setTimeout(() => health(seconds + "s"), seconds * 1000);
  try {
    window.addEventListener("pagehide", () => console.log("pagehide stage=" + stage));
  }
  catch {}
  let elapsed = () => Math.round(performance.now() - t_start) + "ms";
  let root = html.documentElement;
  document.documentElement.replaceWith(root);
  let previous_opacity = root.style.opacity;
  let revealed = false;
  let reveal = () => {
    if (revealed) return;
    revealed = true;
    try {
      root.style.opacity = previous_opacity;
    }
    catch {}
  };
  root.style.opacity = "0";
  setTimeout(reveal, 30000);
  report(0.85, "Running scripts");
  try {
    if (site_settings.allow_js) {
      stage = "scripts";
      await evaluate_scripts();
      console.log("scripts evaluated at " + elapsed());
      stage = "modules";
      await evaluate_modules();
      console.log("modules evaluated at " + elapsed());
      stage = "settling";
      if (is_iframe) console.log("iframe scripts evaluated");
    }
    report(0.93, "Finishing up");

    is_loaded = true;
    watch_title();
    install_click_handler();
    install_form_handler();
    install_flush_handlers();

    set_ready_state("interactive");
    fire_document_event("readystatechange");
    fire_document_event("DOMContentLoaded", true);

    let settled = settle();
    await Promise.race([settled, new Promise((resolve) => setTimeout(resolve, 2500))]);
    report(1, "Ready");
    reveal();
    console.log("revealed at " + elapsed());
    await settled;
    stage = "complete";
    console.log("load complete at " + elapsed());

    set_ready_state("complete");
    fire_document_event("readystatechange");
    ctx.window.dispatchEvent(new Event("load"));
  }
  finally {
    report(1, "Ready");
    reveal();
  }
}

async function get_favicon() {
  var favicon_url = "/favicon.ico";
  var link_elements = document.getElementsByTagName("link");
  for (var i = 0; i < link_elements.length; i++) {
    let link = link_elements[i];
    if (link.getAttribute("rel") === "icon") 
      favicon_url = link.getAttribute("href");
    if (link.getAttribute("rel") === "shortcut icon") 
      favicon_url = link.getAttribute("href");
  }

  let full_url = new URL(favicon_url, document_base());
  return full_url.href;
}

function external_eval(js) {
  return run_script(js);
}

rpc.rpc_handlers["html"] = load_html;
rpc.rpc_handlers["favicon"] = get_favicon;
rpc.rpc_handlers["eval"] = external_eval;
