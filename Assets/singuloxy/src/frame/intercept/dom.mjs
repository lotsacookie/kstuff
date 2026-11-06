import * as rewrite from "../rewrite/index.mjs";
import { parse_css, evict_assets } from "../rewrite/css.mjs";
import { strip_urls } from "../rewrite/placeholder.mjs";
import { ctx, document_base, proxy_function } from "../context.mjs";

const MEDIA_TAGS = new Set(["img", "audio", "video", "source"]);
const MEDIA_SELECTOR = "img, source, video, audio, input[type='image']";
const SRC_TAGS = new Set(["IMG", "SOURCE"]);

function handle_node(node) {
  if (!node) return;
  try {
    if (node instanceof DocumentFragment) {
      for (let child of [...node.children]) {
        rewrite.element(child);
      }
    }
    else if (node instanceof Element) {
      rewrite.element(node);
    }
  }
  catch (e) {
    console.error(e);
  }
}

function handle_all(nodes) {
  for (let node of nodes) {
    handle_node(node);
  }
}

function rewrite_media_only(node) {
  if (!node) return;
  try {
    let list = [];
    if (node instanceof Element) {
      if (node.matches(MEDIA_SELECTOR)) list.push(node);
      list.push(...node.querySelectorAll(MEDIA_SELECTOR));
    }
    else if (node instanceof DocumentFragment) {
      list.push(...node.querySelectorAll(MEDIA_SELECTOR));
    }
    for (let element of list) {
      if (element.__media_hooked__) continue;
      rewrite.media(element);
    }
  }
  catch (e) {
    console.error(e);
  }
}

function hook_first_arg(target, key) {
  proxy_function(target, key, (func, this_arg, args) => {
    handle_node(args[0]);
    return Reflect.apply(func, this_arg, args);
  });
}

function hook_all_args(target, key) {
  proxy_function(target, key, (func, this_arg, args) => {
    handle_all(args);
    return Reflect.apply(func, this_arg, args);
  });
}

function hook_html_setter(proto, name) {
  if (!proto) return;
  let descriptor = Object.getOwnPropertyDescriptor(proto, name);
  if (!descriptor || !descriptor.set) return;
  Object.defineProperty(proto, name, {
    configurable: true,
    enumerable: descriptor.enumerable,
    get: descriptor.get,
    set: function(value) {
      let scope = name === "outerHTML" ? this.parentElement : this;
      descriptor.set.call(this, value);
      handle_node(scope);
    }
  });
}

function hook_media_src_setter(proto) {
  if (!proto) return;
  let descriptor = Object.getOwnPropertyDescriptor(proto, "src");
  if (!descriptor || !descriptor.set) return;
  Object.defineProperty(proto, "src", {
    configurable: true,
    enumerable: descriptor.enumerable,
    get: descriptor.get,
    set: function(value) {
      if (!this.__media_hooked__) {
        try {
          rewrite.media(this);
        }
        catch (e) {
          console.error(e);
        }
        if (Object.prototype.hasOwnProperty.call(this, "src")) {
          this.src = value;
          return;
        }
      }
      descriptor.set.call(this, value);
    }
  });
}

const REWRITABLE_URL = /url\(\s*(?!["']?(?:data:|blob:|about:|#))/i;
const STYLE_PROPS = [
  "backgroundImage", "background", "listStyleImage", "listStyle",
  "borderImage", "borderImageSource", "maskImage", "webkitMaskImage",
  "mask", "webkitMask", "cursor", "content"
];
const pending_css = new WeakMap();
const NativeImage = globalThis.Image;

function blob_urls_in(text) {
  let urls = [];
  for (let m of String(text).matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s'"]*))\s*\)/gi)) {
    let url = (m[1] ?? m[2] ?? m[3] ?? "").trim();
    if (/^blob:/i.test(url)) urls.push(url);
  }
  return urls;
}

function image_loads(url) {
  return new Promise((resolve) => {
    if (typeof NativeImage !== "function") return resolve(true);
    let done = false;
    let finish = (ok) => {
      if (done) return;
      done = true;
      resolve(ok);
    };
    try {
      let probe = new NativeImage();
      probe.onload = () => finish(true);
      probe.onerror = () => finish(false);
      probe.src = url;
      setTimeout(() => finish(true), 20000);
    }
    catch {
      finish(true);
    }
  });
}

async function images_ok(text) {
  let urls = blob_urls_in(text);
  if (!urls.length) return true;
  let results = await Promise.all(urls.map(image_loads));
  return results.every(Boolean);
}

function needs_css_rewrite(text) {
  return typeof text === "string" && REWRITABLE_URL.test(text);
}

function apply_css(style, key, text, commit) {
  let result;
  try {
    result = parse_css(text, document_base(), 0, true);
  }
  catch (e) {
    console.error("sandstone: style rewrite failed", e);
    commit(text);
    return;
  }
  if (typeof result === "string") {
    commit(result);
    return;
  }

  let map = pending_css.get(style);
  if (!map) {
    map = new Map();
    pending_css.set(style, map);
  }
  let id = (map.get(key) || 0) + 1;
  map.set(key, id);

  commit(strip_urls(text));

  result.then(async (value) => {
    if (map.get(key) !== id) return;
    commit(value);
    try {
      if (!/^\s*$/.test(value) && !(await images_ok(value)) && map.get(key) === id) {
        evict_assets(text, document_base());
        let again = await parse_css(text, document_base(), 0, true);
        if (map.get(key) === id) commit(again);
      }
    }
    catch {}
  }, (e) => {
    console.error("sandstone: style rewrite failed", e);
  });
}

function hook_style() {
  if (typeof CSSStyleDeclaration === "undefined") return;
  let protos = [CSSStyleDeclaration.prototype];
  if (typeof CSS2Properties !== "undefined") protos.push(CSS2Properties.prototype);

  for (let proto of protos) {
    for (let name of STYLE_PROPS.concat(["cssText"])) {
      let descriptor = Object.getOwnPropertyDescriptor(proto, name);
      if (!descriptor || !descriptor.set) continue;
      Object.defineProperty(proto, name, {
        configurable: true,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set: function(value) {
          let text = value === null || value === undefined ? "" : String(value);
          if (!needs_css_rewrite(text)) {
            descriptor.set.call(this, value);
            return;
          }
          apply_css(this, name, text, (rewritten) => descriptor.set.call(this, rewritten));
        }
      });
    }
  }

  proxy_function(CSSStyleDeclaration.prototype, "setProperty", (func, this_arg, args) => {
    let text = args[1] === null || args[1] === undefined ? "" : String(args[1]);
    if (!needs_css_rewrite(text)) return Reflect.apply(func, this_arg, args);
    apply_css(this_arg, "p:" + args[0], text, (rewritten) => {
      Reflect.apply(func, this_arg, [args[0], rewritten, args[2]]);
    });
  });
}

let net_observer = null;
const NET_OPTIONS = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["src", "srcset"]
};

function net_rewrite(node) {
  if (node.nodeType !== 1) return;
  try {
    if (node instanceof HTMLScriptElement) {
      node.__rewritten__ = true;
      return;
    }
    for (let script of node.querySelectorAll("script")) {
      script.__rewritten__ = true;
    }
  }
  catch (e) {
    console.error(e);
  }

  rewrite_media_only(node);
  try {
    if (!node.__rewritten__) rewrite.element(node);
  }
  catch (e) {
    console.error(e);
  }
}

export function observe_tree(node) {
  if (!net_observer || !node) return;
  try {
    net_observer.observe(node, NET_OPTIONS);
  }
  catch (e) {
    console.error(e);
  }
}

function start_safety_net() {
  if (typeof MutationObserver === "undefined" || typeof document === "undefined") return;

  net_observer = new MutationObserver((records) => {
    for (let record of records) {
      if (record.type === "childList") {
        for (let node of record.addedNodes) {
          net_rewrite(node);
        }
      }
      else if (record.type === "attributes" && record.target.nodeType === 1) {
        let target = record.target;
        if (!target.__media_hooked__ && target.matches(MEDIA_SELECTOR)) rewrite_media_only(target);
      }
    }
  });
  observe_tree(document);
}

if (typeof Node !== "undefined") {
  hook_first_arg(Node.prototype, "appendChild");
  proxy_function(Node.prototype, "insertBefore", (func, this_arg, args) => {
    handle_node(args[0]);
    let reference = args[1];
    if (reference && reference.parentNode !== this_arg) {
      return Reflect.apply(func, this_arg, [args[0], null]);
    }
    return Reflect.apply(func, this_arg, args);
  });
  hook_first_arg(Node.prototype, "replaceChild");

  proxy_function(Node.prototype, "cloneNode", (func, this_arg, args) => {
    let clone = Reflect.apply(func, this_arg, args);
    rewrite_media_only(clone);
    return clone;
  });
}

if (typeof Element !== "undefined") {
  for (let key of ["append", "prepend", "before", "after", "replaceWith", "replaceChildren"]) {
    hook_all_args(Element.prototype, key);
  }
  proxy_function(Element.prototype, "insertAdjacentElement", (func, this_arg, args) => {
    handle_node(args[1]);
    return Reflect.apply(func, this_arg, args);
  });
  proxy_function(Element.prototype, "insertAdjacentHTML", (func, this_arg, args) => {
    let result = Reflect.apply(func, this_arg, args);
    let position = String(args[0]).toLowerCase();
    let scope = position === "beforebegin" || position === "afterend" ? this_arg.parentElement : this_arg;
    handle_node(scope);
    return result;
  });
  hook_html_setter(Element.prototype, "innerHTML");
  hook_html_setter(Element.prototype, "outerHTML");

  proxy_function(Element.prototype, "setAttribute", (func, this_arg, args) => {
    try {
      let name = String(args[0]).toLowerCase();
      if ((name === "src" || name === "srcset") && SRC_TAGS.has(this_arg.tagName) && !this_arg.__media_hooked__) {
        rewrite.media(this_arg);
        this_arg.setAttribute(args[0], args[1]);
        return;
      }
      if (name === "style") {
        let text = args[1] === null || args[1] === undefined ? "" : String(args[1]);
        if (needs_css_rewrite(text)) {
          apply_css(this_arg, "attr:style", text, (rewritten) => {
            Reflect.apply(func, this_arg, [args[0], rewritten]);
          });
          return;
        }
      }
    }
    catch (e) {
      console.error(e);
    }
    return Reflect.apply(func, this_arg, args);
  });
}

if (typeof ShadowRoot !== "undefined") {
  hook_html_setter(ShadowRoot.prototype, "innerHTML");
}

if (typeof DocumentFragment !== "undefined") {
  for (let key of ["append", "prepend", "replaceChildren"]) {
    hook_all_args(DocumentFragment.prototype, key);
  }
}

if (typeof Range !== "undefined") {
  proxy_function(Range.prototype, "createContextualFragment", (func, this_arg, args) => {
    let fragment = Reflect.apply(func, this_arg, args);
    rewrite_media_only(fragment);
    return fragment;
  });
}

if (typeof Document !== "undefined") {
  proxy_function(Document.prototype, "createElement", (func, this_arg, args) => {
    let element = Reflect.apply(func, this_arg, args);
    try {
      if (MEDIA_TAGS.has(String(args[0]).toLowerCase())) {
        rewrite.element(element);
      }
    }
    catch (e) {
      console.error(e);
    }
    return element;
  });

  proxy_function(Document.prototype, "createElementNS", (func, this_arg, args) => {
    let element = Reflect.apply(func, this_arg, args);
    try {
      if (args[0] === "http://www.w3.org/1999/xhtml" && MEDIA_TAGS.has(String(args[1]).toLowerCase())) {
        rewrite.element(element);
      }
    }
    catch (e) {
      console.error(e);
    }
    return element;
  });

  proxy_function(Document.prototype, "importNode", (func, this_arg, args) => {
    let node = Reflect.apply(func, this_arg, args);
    rewrite_media_only(node);
    return node;
  });
}

if (typeof HTMLImageElement !== "undefined") hook_media_src_setter(HTMLImageElement.prototype);
if (typeof HTMLSourceElement !== "undefined") hook_media_src_setter(HTMLSourceElement.prototype);

hook_style();
start_safety_net();

for (let name of ["Image", "Audio"]) {
  if (globalThis[name]) {
    globalThis[name] = new Proxy(globalThis[name], {
      construct(target, args) {
        let ret = Reflect.construct(target, args);
        rewrite.element(ret);
        return ret;
      }
    });
  }
}
