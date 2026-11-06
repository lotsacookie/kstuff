import { ctx } from "../context.mjs";

function proxied_document() {
  try {
    return ctx.document;
  }
  catch {
    return undefined;
  }
}

if (typeof MutationObserver !== "undefined") {
  MutationObserver.prototype.observe = new Proxy(MutationObserver.prototype.observe, {
    apply: (target, this_arg, args) => {
      let node = args[0];
      if (node && typeof node === "object") {
        let document_proxy = proxied_document();
        if (document_proxy && node === document_proxy)
          args[0] = document_proxy.documentElement;
      }
      return Reflect.apply(target, this_arg, args);
    }
  });
}
