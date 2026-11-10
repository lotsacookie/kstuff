import * as rpc from "../../rpc.mjs";
import { quiet_error, quiet_warn, yield_to_main, response_text, strip_gz_suffix } from "../../util.mjs";
import * as network from "../network.mjs";
import * as loader from "../loader.mjs";
import * as parser from "../parser.mjs";

import { ctx, document_base, convert_url, intercept_property, proxy_function } from "../context.mjs";
import { swap_current_script } from "../intercept/document.mjs";

export const pending_scripts = [];

export const script_state = { phase: "parsing" };

const SCRIPT_DOWNLOAD_ATTEMPTS = 3;
const SIZE_TOLERANCE_BYTES = 3;
const GARBLED_SAMPLE_CHARS = 2000;
const GARBLED_RATIO = 0.02;

let script_num = 0;

const javascript_types = new Set([
  "",
  "application/javascript",
  "text/javascript",
  "application/x-javascript",
  "text/x-javascript",
  "application/ecmascript",
  "text/ecmascript",
  "text/jscript",
  "text/livescript"
]);

export function should_load(element) {
  if (!loader.site_settings.allow_js)
    return false;
  let type = (element.getAttribute("type") || "").split(";")[0].trim().toLowerCase();
  return javascript_types.has(type);
}

export function execute_script(script_element, script_text) {
  let previous = swap_current_script(script_element);
  let script = document.createElement("script");
  script.__rewritten__ = true;
  try {
    let label = script_element.getAttribute("__src") || "";
    let rewritten = parser.rewrite_js(script_text, false, label);
    if (/^https?:\/\//i.test(label) && !/[\r\n]/.test(label)) rewritten += "\n//# sourceURL=" + label;
    script.textContent = rewritten;
    (document.body || document.documentElement).append(script);
  }
  catch (e) {
    console.error("sandstone: script execution failed", e);
  }
  script.remove();
  swap_current_script(previous);
}

const rpc_cache_get = rpc.create_rpc_wrapper(rpc.host, "rewrite_cache_get");
const rpc_cache_put = rpc.create_rpc_wrapper(rpc.host, "rewrite_cache_put");

const PUT_FLUSH_MS = 1500;
const PUT_BATCH_ITEMS = 6;
const PUT_BATCH_CHARS = 12 * 1024 * 1024;

const prewarm_tasks = new Set();
let queued_puts = [];
let put_timer = null;

function hex_of(buffer) {
  let bytes = new Uint8Array(buffer);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

async function content_key(text) {
  try {
    if (!globalThis.crypto || !globalThis.crypto.subtle) return null;
    let digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    let build = loader.version ? (loader.version.hash || loader.version.ver || "0") : "0";
    return build + ":" + parser.rewrite_signature() + ":" + hex_of(digest);
  }
  catch {
    return null;
  }
}

async function flush_puts() {
  put_timer = null;
  let items = queued_puts;
  queued_puts = [];
  while (items.length) {
    let batch = [];
    let chars = 0;
    while (items.length && batch.length < PUT_BATCH_ITEMS && (batch.length === 0 || chars + items[0].value.length <= PUT_BATCH_CHARS)) {
      let item = items.shift();
      chars += item.value.length;
      batch.push(item);
    }
    try {
      await rpc_cache_put(batch);
    }
    catch {}
    await yield_to_main();
  }
}

function queue_put(key, value) {
  queued_puts.push({key: key, value: value});
  if (put_timer === null) put_timer = setTimeout(flush_puts, PUT_FLUSH_MS);
}

async function run_prewarm(script_element, text) {
  try {
    if (parser.is_rewrite_cached(text, false)) return;
    let key = await content_key(text);
    if (key) {
      let found = null;
      try {
        found = await rpc_cache_get([key]);
      }
      catch {}
      let value = found ? found[key] : null;
      if (typeof value === "string" && value.length > 0) {
        parser.seed_rewrite(text, false, value);
        return;
      }
    }
    await yield_to_main();
    let result = parser.compute_rewrite(text, false, script_element.getAttribute("__src") || "");
    if (key && result !== text) queue_put(key, result);
  }
  catch {}
}

function prewarm(script_element, text) {
  let task = run_prewarm(script_element, text).then(() => {
    prewarm_tasks.delete(task);
  });
  prewarm_tasks.add(task);
}

export async function wait_for_prewarms() {
  while (prewarm_tasks.size > 0) {
    await Promise.all([...prewarm_tasks]);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function looks_garbled(text) {
  let sample = text.length > GARBLED_SAMPLE_CHARS ? text.slice(0, GARBLED_SAMPLE_CHARS) : text;
  if (sample.length === 0) return false;
  let bad = 0;
  for (let i = 0; i < sample.length; i++) {
    let code = sample.charCodeAt(i);
    if (code === 0xFFFD || (code < 32 && code !== 9 && code !== 10 && code !== 13)) bad++;
  }
  return bad / sample.length > GARBLED_RATIO;
}

function size_problem(response, text) {
  let encoding = (response.headers?.get("content-encoding") || "").toLowerCase();
  if (encoding !== "" && encoding !== "identity") return null;
  let expected = Number(response.headers?.get("content-length"));
  if (!Number.isFinite(expected) || expected <= 0) return null;
  let actual = new TextEncoder().encode(text).length;
  if (Math.abs(actual - expected) <= SIZE_TOLERANCE_BYTES) return null;
  return `size mismatch: server said ${expected} bytes, received ${actual}`;
}

export async function rewrite_script(script_element) {
  if (!should_load(script_element)) {
    return;
  }
  let num = script_num ++;
  let is_dynamic = script_state.phase !== "parsing";

  let script_text = script_element.textContent; 
  let script_url = script_element.getAttribute("src") || "";
  let has_src = script_url !== "";

  intercept_property(script_element, "src", {
    get: () => {
      if (!script_url) return "";
      try {
        return convert_url(script_url, document_base());
      }
      catch {
        return script_url;
      }
    },
    set: async (value) => {
      script_url = value;
      if (await download_src()) {
        execute_script(script_element, script_text);
        script_element.dispatchEvent(new Event("load"));
      }
    }
  });
  script_element.removeAttribute("src");

  if (has_src) {
    proxy_function(script_element, "getAttribute", (target, this_arg, args) => {
      if (script_url && typeof args[0] === "string" && args[0].toLowerCase() === "src")
        return script_url;
      return Reflect.apply(target, this_arg, args);
    });
  }

  async function download_src() {
    script_element.setAttribute("__src", script_url);
    let src_url = convert_url(script_url, document_base());
    let last_error = null;

    for (let attempt = 1; attempt <= SCRIPT_DOWNLOAD_ATTEMPTS; attempt++) {
      let final_attempt = attempt === SCRIPT_DOWNLOAD_ATTEMPTS;
      try {
        let response = await network.fetch(src_url);
        if (response.ok === false) {
          let alternate = strip_gz_suffix(src_url);
          if (alternate) {
            try {
              let alternate_response = await network.fetch(alternate);
              if (alternate_response.ok !== false) response = alternate_response;
            }
            catch {}
          }
          if (response.ok === false) {
            last_error = new Error("status " + response.status);
            break;
          }
        }
        let decoded = await response_text(response);
        let text = decoded.text;
        let garbled = looks_garbled(text);
        let problem = garbled ? "response does not look like JavaScript text" : decoded.decompressed ? null : size_problem(response, text);
        if (problem && !final_attempt) {
          quiet_warn(`sandstone: script download looks wrong (${problem}), retrying (${attempt}/${SCRIPT_DOWNLOAD_ATTEMPTS - 1}):`, src_url);
          last_error = new Error(problem);
          await sleep(300 * attempt);
          continue;
        }
        if (problem && garbled) {
          last_error = new Error(problem);
          break;
        }
        if (problem) {
          quiet_warn(`sandstone: script download still looks wrong (${problem}), using it anyway:`, src_url);
        }
        script_text = text;
        return true;
      }
      catch (e) {
        last_error = e;
        if (!final_attempt) await sleep(300 * attempt);
      }
    }

    quiet_error("sandstone: failed to load script", src_url, last_error);
    script_text = "";
    script_element.dispatchEvent(new Event("error"));
    return false;
  }

  if (!has_src) {
    if (!script_text) return;
    if (!is_dynamic) {
      pending_scripts.push([num, script_element, script_text]);
      prewarm(script_element, script_text);
      return;
    }
    script_element.textContent = parser.rewrite_js(script_text, false, "(dynamic inline script)");
    return;
  }

  if (!(await download_src()))
    return;

  if (is_dynamic) {
    execute_script(script_element, script_text);
    script_element.dispatchEvent(new Event("load"));
  }
  else if (script_text) {
    pending_scripts.push([num, script_element, script_text]);
    prewarm(script_element, script_text);
  }
}
