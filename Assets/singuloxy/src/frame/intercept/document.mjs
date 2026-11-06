import { ctx, document_base, get_handler_keys, create_obj_proxy, get_cookie_jar } from "../context.mjs";

const internal = {
  currentScript: null
}

let write_handler = null;
let ready_state = "complete";

export function set_ready_state(value) {
  ready_state = value;
}

export function set_write_handler(handler) {
  write_handler = handler;
}

export function swap_current_script(value) {
  let previous = internal.currentScript;
  internal.currentScript = value;
  return previous;
}

class CustomDocument {
  constructor() {
    let keys = get_handler_keys(this);
    if (globalThis.document) {
      this.__proxy__ = create_obj_proxy(this, keys, globalThis.document);
      this.__target__ = globalThis.document;
    }   
  }

  get cookie() {return get_cookie_jar().get()}
  set cookie(value) {get_cookie_jar().set(String(value))}
  get body() {return this.__target__.body}
  get location() {return ctx.location}
  get URL() {return ctx.location.href}
  get baseURI() {return document_base()}
  get documentURI() {return ctx.location.href}
  get defaultView() {return ctx.window}
  get currentScript() {
    if (internal.currentScript) return internal.currentScript;
    let native = this.__target__ ? this.__target__.currentScript : null;
    return native || null;
  }
  set currentScript(value) {internal.currentScript = value}
  get activeElement() {return this.__target__.activeElement || this.__target__.body}
  set activeElement(value) {}
  get readyState() {return ready_state}

  createElement(tag_name, options) {
    return this.__target__.createElement(tag_name, options);
  }

  createTreeWalker(root, whatToShow, filter) {
    if (root === this) root = document.documentElement;
    return this.__target__.createTreeWalker(root, whatToShow, filter);
  }

  write(...parts) {
    if (write_handler) write_handler(parts.map(String).join(""));
  }

  writeln(...parts) {
    if (write_handler) write_handler(parts.map(String).join("") + "\n");
  }

  open() {
    return custom_document.__proxy__;
  }

  close() {}
}

export const custom_document = new CustomDocument();
