import { ctx, document_base, convert_url } from "../context.mjs";
import * as network from "../network.mjs";

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";
const MAX_ATTEMPTS = 3;

function http_url(value) {
  if (!value) return null;
  let text = String(value).trim();
  if (/^(data|blob|javascript|about):/i.test(text)) return null;
  try {
    let resolved = convert_url(text, document_base());
    if (/^https?:/i.test(resolved)) return resolved;
  }
  catch {}
  return null;
}

async function download_blob_url(url) {
  let last_error;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      let response = await network.fetch(url);
      if (response.ok === false) throw new Error("status " + response.status);
      return URL.createObjectURL(await response.blob());
    }
    catch (e) {
      last_error = e;
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  throw last_error;
}

function swap_attribute(element, name, namespace) {
  let value = namespace ? element.getAttributeNS(namespace, name) : element.getAttribute(name);
  if (!value) value = element.getAttribute("__" + name);
  let resolved = http_url(value);
  if (!resolved) return;

  element.setAttribute("__" + name, value);
  if (namespace) element.removeAttributeNS(namespace, name);
  else element.removeAttribute(name);

  return download_blob_url(resolved).then((blob_url) => {
    if (namespace) element.setAttributeNS(namespace, "xlink:" + name, blob_url);
    else element.setAttribute(name, blob_url);
  }, (e) => {
    console.error("sandstone: failed to load resource", resolved, e);
  });
}

export function rewrite_resource(element) {
  let tag = element.localName;
  if (tag === "video") return swap_attribute(element, "poster", null);
  if (tag === "track") return swap_attribute(element, "src", null);
  if (tag === "image" && element.namespaceURI === SVG_NS) {
    if (element.hasAttribute("href") || element.hasAttribute("__href")) return swap_attribute(element, "href", null);
    if (element.hasAttributeNS(XLINK_NS, "href")) return swap_attribute(element, "href", XLINK_NS);
  }
}
