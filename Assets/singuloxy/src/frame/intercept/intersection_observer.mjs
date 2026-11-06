const node_type_getter = typeof Node !== "undefined"
  ? Object.getOwnPropertyDescriptor(Node.prototype, "nodeType")?.get
  : undefined;

function native_node_type(value) {
  if (!node_type_getter || !value || typeof value !== "object") return 0;
  try {
    return node_type_getter.call(value);
  }
  catch {
    return 0;
  }
}

function is_valid_root(value) {
  let type = native_node_type(value);
  return type === 1 || type === 9;
}

function unwrap_root(root) {
  let current = root;
  for (let depth = 0; depth < 4; depth++) {
    if (is_valid_root(current)) return current;
    let next;
    try {
      next = current?.__target__;
    }
    catch {
      next = undefined;
    }
    if (!next || next === current) break;
    current = next;
  }
  return is_valid_root(current) ? current : null;
}

if (typeof IntersectionObserver !== "undefined") {
  globalThis.IntersectionObserver = new Proxy(IntersectionObserver, {
    construct(target, args, new_target) {
      let options = args[1];
      if (options && typeof options === "object" && options.root !== undefined && options.root !== null) {
        let root = unwrap_root(options.root);
        if (root !== options.root) {
          args = [args[0], {...options, root: root}];
        }
      }
      return Reflect.construct(target, args, new_target);
    }
  });
}
