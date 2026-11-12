import * as network from "../network.mjs";
import { ctx, document_base, convert_url } from "../context.mjs";
import { parse_css, with_deadline } from "./css.mjs";
import { response_text, strip_gz_suffix } from "../../util.mjs";

const STYLESHEET_TIMEOUT_MS = 30 * 1000;
const BODY_TIMEOUT_MS = 60 * 1000;

function describe_error(e) {
  try {
    if (e && typeof e === "object") {
      let name = e.name || "Error";
      let message = e.message || String(e);
      let stack = e.stack ? "\n" + String(e.stack).split("\n").slice(0, 6).join("\n") : "";
      return name + ": " + message + stack;
    }
    return String(e);
  }
  catch {
    return "unknown error";
  }
}

function fail(stage, url, e, extra) {
  try {
    console.error("sandstone: stylesheet " + stage + " failed:", url, (extra ? extra + " | " : "") + describe_error(e));
  }
  catch {}
}

function use_direct_url(link_element, css_url) {
  link_element.removeAttribute("crossorigin");
  link_element.href = css_url;
}

async function load_css(css_url) {
  let response = null;
  try {
    response = await with_deadline(network.fetch(css_url), STYLESHEET_TIMEOUT_MS);
    let type = "";
    try {
      type = (response.headers?.get("content-type") || "").toLowerCase();
    }
    catch {}
    let meta = "status=" + response.status + " ok=" + response.ok + " type=" + (type || "none") + " final=" + (response.url || css_url);
    if (response.ok === false) {
      let error = new Error("bad status " + response.status);
      error.meta = meta;
      throw error;
    }
    if (type.includes("text/html")) {
      let error = new Error("unexpected content type " + type);
      error.meta = meta;
      throw error;
    }
    let decoded = await with_deadline(response_text(response), BODY_TIMEOUT_MS);
    return {css: decoded.text, final_url: response.url || css_url, meta};
  }
  catch (e) {
    try {
      await response?.body?.cancel();
    }
    catch {}
    throw e;
  }
}

export async function rewrite_stylesheet(link_element) {
  if (link_element.hasAttribute("integrity"))
    link_element.removeAttribute("integrity");

  let link_href = link_element.getAttribute("href") || link_element.getAttribute("data-href");
  if (!link_href) {
    return;
  }

  let css_url = convert_url(link_href, document_base());
  let css = null;
  let final_url = css_url;
  let meta = "";

  try {
    let loaded = await load_css(css_url);
    css = loaded.css;
    final_url = loaded.final_url;
    meta = loaded.meta;
  }
  catch (e) {
    fail("fetch", css_url, e, e && e.meta);
    let alternate = strip_gz_suffix(css_url);
    if (alternate) {
      try {
        let loaded = await load_css(alternate);
        css = loaded.css;
        final_url = loaded.final_url;
        meta = loaded.meta;
      }
      catch (e2) {
        fail("fetch (alternate)", alternate, e2, e2 && e2.meta);
      }
    }
  }

  if (css === null) {
    console.error("sandstone: stylesheet falling back to direct load (will likely fail cross-origin):", css_url);
    use_direct_url(link_element, css_url);
    return;
  }

  let new_css = null;
  try {
    new_css = await parse_css(css, final_url);
  }
  catch (e) {
    fail("parse", final_url, e, meta + " length=" + css.length + " head=" + JSON.stringify(css.slice(0, 120)));
    new_css = css;
  }

  try {
    let css_blob = new Blob([new_css], {type: "text/css"});
    link_element.href = network.create_blob_url(css_blob, final_url);
  }
  catch (e) {
    fail("blob", final_url, e, meta);
    use_direct_url(link_element, css_url);
  }
}
