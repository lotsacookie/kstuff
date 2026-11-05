import { rewrite_stylesheet } from "./stylesheet.mjs";

export function rewrite_link(link_element) {
  let rel = (link_element.getAttribute("rel") || "").trim().toLowerCase();
  if (rel === "icon" || rel === "shortcut icon") return;

  let as_value = (link_element.getAttribute("as") || "").trim().toLowerCase();
  if (rel.split(/\s+/).includes("preload") && as_value === "style") {
    return rewrite_stylesheet(link_element);
  }

  link_element.rel = "__" + link_element.rel;
}
