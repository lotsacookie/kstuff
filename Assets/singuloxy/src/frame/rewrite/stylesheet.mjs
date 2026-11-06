import * as network from "../network.mjs";
import { ctx, document_base, convert_url } from "../context.mjs";
import { parse_css, with_deadline } from "./css.mjs";
import { response_text, strip_gz_suffix } from "../../util.mjs";

const STYLESHEET_TIMEOUT_MS = 30 * 1000;
const BODY_TIMEOUT_MS = 60 * 1000;

function use_direct_url(link_element, css_url) {
  link_element.removeAttribute("crossorigin");
  link_element.href = css_url;
}

async function load_css(css_url) {
  let response = null;
  try {
    response = await with_deadline(network.fetch(css_url), STYLESHEET_TIMEOUT_MS);
    if (response.ok === false) {
      throw new Error("status " + response.status);
    }
    let type = (response.headers?.get("content-type") || "").toLowerCase();
    if (type.includes("text/html")) {
      throw new Error("unexpected content type " + type);
    }
    let decoded = await with_deadline(response_text(response), BODY_TIMEOUT_MS);
    return {css: decoded.text, final_url: response.url || css_url};
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

  try {
    let loaded = await load_css(css_url);
    css = loaded.css;
    final_url = loaded.final_url;
  }
  catch (e) {
    let alternate = strip_gz_suffix(css_url);
    if (alternate) {
      try {
        let loaded = await load_css(alternate);
        css = loaded.css;
        final_url = loaded.final_url;
      }
      catch {}
    }
    if (css === null) {
      console.error("sandstone: stylesheet failed through the proxy, loading it directly:", css_url, e);
    }
  }

  if (css === null) {
    use_direct_url(link_element, css_url);
    return;
  }

  let new_css = await parse_css(css, final_url);
  let css_blob = new Blob([new_css], {type: "text/css"});
  link_element.href = network.create_blob_url(css_blob, final_url);
}
