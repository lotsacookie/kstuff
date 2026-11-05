import * as rewrite from "../rewrite/index.mjs";
import { custom_document, set_write_handler } from "./document.mjs";

function write_html(html) {
  if (typeof document === "undefined" || !document.body) return;

  let anchor = custom_document.currentScript;
  if (anchor && !anchor.isConnected) anchor = null;
  let parent = anchor ? anchor.parentNode : document.body;
  if (!parent) return;

  let range = document.createRange();
  range.selectNodeContents(document.body);
  let fragment = range.createContextualFragment(html);

  for (let child of [...fragment.children]) {
    try {
      rewrite.element(child);
    }
    catch (e) {
      console.error(e);
    }
  }

  parent.insertBefore(fragment, anchor ? anchor.nextSibling : null);
}

set_write_handler(write_html);
