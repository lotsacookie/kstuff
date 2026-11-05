import { document_base } from "../context.mjs";
import { parse_css } from "./css.mjs";

const REWRITABLE = /@import|url\(|image-set\(/i;

export async function rewrite_style(style_element) {
  let css = style_element.textContent;
  if (!css || !REWRITABLE.test(css)) return;

  let rewritten = await parse_css(css, document_base());
  if (rewritten === css) return;
  if (style_element.textContent !== css) return;
  style_element.textContent = rewritten;
}
