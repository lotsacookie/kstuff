import { ctx, document_base, proxy_function } from "../context.mjs";
import { parse_css } from "../rewrite/css.mjs";

const NEEDS_REWRITE = /@import\s+(?!url\(\s*["']?(?:data:|blob:)|["'](?:data:|blob:))|url\(\s*(?!["']?(?:data:|blob:|about:|#))|image-set\(\s*["']/i;

const written = new WeakMap();
let style_observer = null;

function needs_rewrite(text) {
  return typeof text === "string" && NEEDS_REWRITE.test(text);
}

function base_url() {
  try {
    return document_base();
  }
  catch {
    return location.href;
  }
}

function report(e) {
  console.error("sandstone: style rewrite failed", e);
}

function install_sheet_hooks() {
  if (typeof CSSStyleSheet === "undefined") return;

  let proto = CSSStyleSheet.prototype;
  let native_insert = proto.insertRule;
  let native_delete = proto.deleteRule;
  let native_replace_sync = proto.replaceSync;
  let versions = new WeakMap();

  let rewrite_rule = (sheet, rule) => {
    let text;
    try {
      text = rule.cssText;
    }
    catch {
      return;
    }
    if (!needs_rewrite(text)) return;

    Promise.resolve(parse_css(text, base_url(), 0, true)).then((rewritten) => {
      if (rewritten === text) return;
      let index = -1;
      try {
        index = Array.prototype.indexOf.call(sheet.cssRules, rule);
      }
      catch {
        return;
      }
      if (index < 0) return;
      Reflect.apply(native_delete, sheet, [index]);
      Reflect.apply(native_insert, sheet, [rewritten, index]);
    }).catch(report);
  };

  let rewrite_text = (sheet, text) => {
    let version = (versions.get(sheet) || 0) + 1;
    versions.set(sheet, version);
    if (!needs_rewrite(text)) return;

    Promise.resolve(parse_css(text, base_url(), 0, true)).then((rewritten) => {
      if (versions.get(sheet) !== version || rewritten === text) return;
      Reflect.apply(native_replace_sync, sheet, [rewritten]);
    }).catch(report);
  };

  proxy_function(proto, "insertRule", (func, this_arg, args) => {
    let index = Reflect.apply(func, this_arg, args);
    try {
      let rule = this_arg.cssRules[index];
      if (rule) rewrite_rule(this_arg, rule);
    }
    catch {}
    return index;
  });

  proxy_function(proto, "replaceSync", (func, this_arg, args) => {
    let result = Reflect.apply(func, this_arg, args);
    rewrite_text(this_arg, String(args[0]));
    return result;
  });

  proxy_function(proto, "replace", (func, this_arg, args) => {
    let text = String(args[0]);
    return Reflect.apply(func, this_arg, args).then((sheet) => {
      rewrite_text(sheet, text);
      return sheet;
    });
  });
}

function check_style(style) {
  let text = style.textContent;
  if (!needs_rewrite(text) || written.get(style) === text) return;

  Promise.resolve(parse_css(text, base_url(), 0, true)).then((rewritten) => {
    if (style.textContent !== text) return;
    written.set(style, rewritten);
    if (rewritten !== text) style.textContent = rewritten;
  }).catch(report);
}

export function observe_style_tree(node) {
  if (!style_observer || !node) return;
  try {
    style_observer.observe(node, {childList: true, characterData: true, subtree: true});
  }
  catch (e) {
    report(e);
  }
}

function install_style_observer() {
  if (typeof MutationObserver === "undefined" || typeof document === "undefined") return;
  if (typeof HTMLStyleElement === "undefined") return;

  style_observer = new MutationObserver((records) => {
    let styles = new Set();
    for (let record of records) {
      let target = record.target;
      let owner = target.nodeType === 1 ? target : target.parentElement;
      if (owner instanceof HTMLStyleElement) styles.add(owner);
    }
    for (let style of styles) check_style(style);
  });
  observe_style_tree(document);
}

install_sheet_hooks();
install_style_observer();
