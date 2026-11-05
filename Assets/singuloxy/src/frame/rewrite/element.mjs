import * as rewrite from "./index.mjs";

import { parse_css } from "./css.mjs";
import { strip_urls } from "./placeholder.mjs";
import { run_script, is_ready, document_base } from "../context.mjs";

function is_stylesheet_link(element) {
  if (!(element instanceof HTMLLinkElement)) return false;
  return element.relList.contains("stylesheet") && !element.relList.contains("alternate");
}

function rewrite_element_single(element) {
  let promise;
  if (element.tagName === "NOSCRIPT")
    promise = rewrite.noscript(element);
  else if (element.matches("img, source, video, audio, input[type='image']"))
    promise = rewrite.media(element);
  else if (element instanceof HTMLLinkElement && !is_stylesheet_link(element))
    promise = rewrite.link(element);
  else if (element instanceof HTMLMetaElement)
    promise = rewrite.meta(element);
  else if (is_stylesheet_link(element))
    promise = rewrite.stylesheet(element);
  else if (element instanceof HTMLStyleElement)
    promise = rewrite.style(element);
  else if (element instanceof HTMLScriptElement) {
    let script_type = (element.getAttribute("type") || "").trim().toLowerCase();
    if (element.hasAttribute("nomodule")) {}
    else if (script_type === "importmap")
      promise = rewrite.import_map(element);
    else if (script_type === "module")
      promise = rewrite.module_script(element);
    else
      promise = rewrite.script(element);
  }
  else if (element instanceof HTMLFormElement)
    promise = rewrite.form(element);
  else if (element instanceof HTMLIFrameElement)
    promise = rewrite.iframe(element);
  let promises = [promise, rewrite.resource(element)];

  for (let j = 0; j < element.attributes.length; j++) {
    let attribute = element.attributes[j].name;
    if (!attribute.startsWith("on")) continue;
    let handler_script = element.getAttribute(attribute);
    let event_name = attribute.substring(2);

    element.setAttribute("__" + attribute, handler_script);
    element.removeAttribute(attribute);

    let handler_fn = null;
    element.addEventListener(event_name, (event) => {
      try {
        if (!handler_fn)
          handler_fn = run_script(`(function(event){${handler_script}\n})`);
        if (handler_fn.call(element, event) === false)
          event.preventDefault();
      }
      catch (e) {
        console.error("sandstone: inline handler failed", attribute, e);
      }
    });
  }

  let inline_style = element.getAttribute("style");
  if (inline_style) {
    let new_css = parse_css(inline_style, document_base());
    if (typeof new_css === "string") {
      if (new_css !== inline_style) element.style.cssText = new_css;
    }
    else {
      element.style.cssText = strip_urls(inline_style);
      let placeholder = element.getAttribute("style");
      promises.push((async () => {
        let result = await new_css;
        if (element.getAttribute("style") !== placeholder) return;
        element.style.cssText = result;
        if (/url\(\s*["']?https?:/i.test(result)) {
          let applied = element.getAttribute("style");
          Promise.resolve(parse_css(inline_style, document_base(), 0, true)).then((upgraded) => {
            if (element.getAttribute("style") === applied && upgraded !== result) element.style.cssText = upgraded;
          }, () => {});
        }
      })());
    }
  }

  return promises;
}

export function rewrite_element(element) {
  if (!(element instanceof Element))
    return;
  if (!is_ready())
    return;

  let promises = [];
  if (!element.__rewritten__) {
    element.__rewritten__ = true;
    promises = rewrite_element_single(element);
  }
  
  let children = [...element.children];
  for (let child of children) {
    promises.push(rewrite_element(child));
  }

  promises = promises.filter((promise) => promise).map((promise) => {
    return Promise.resolve(promise).catch((e) => {
      console.error("sandstone: element rewrite failed", e);
    });
  });
  if (promises.length === 0)
    return undefined;
  return Promise.all(promises);
}
