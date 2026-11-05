import * as rewrite from "../rewrite/index.mjs";
import { proxy_function } from "../context.mjs";
import { observe_tree } from "./dom.mjs";
import { observe_style_tree } from "./css_dom.mjs";

function handle(node) {
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

function install() {
  if (typeof Range !== "undefined") {
    for (let key of ["insertNode", "surroundContents"]) {
      proxy_function(Range.prototype, key, (func, this_arg, args) => {
        handle(args[0]);
        return Reflect.apply(func, this_arg, args);
      });
    }
  }

  for (let name of ["Element", "ShadowRoot"]) {
    let constructor = globalThis[name];
    if (!constructor) continue;
    for (let key of ["setHTMLUnsafe", "setHTML"]) {
      if (typeof constructor.prototype[key] !== "function") continue;
      proxy_function(constructor.prototype, key, (func, this_arg, args) => {
        let result = Reflect.apply(func, this_arg, args);
        handle(this_arg);
        return result;
      });
    }
  }

  if (typeof Element !== "undefined" && typeof Element.prototype.attachShadow === "function") {
    proxy_function(Element.prototype, "attachShadow", (func, this_arg, args) => {
      let root = Reflect.apply(func, this_arg, args);
      observe_tree(root);
      observe_style_tree(root);
      return root;
    });
  }
}

install();
