import { quiet_error } from "./util.mjs";
export let role = null;
export const rpc_handlers = {};
export const rpc_requests = {};
export let host = null;
export let on_attach = () => {};

const MIN_TRANSFER_BYTES = 64 * 1024;

export class RPCTarget {
  constructor(target=null) {
    this.target = null;
    this.extra_targets = [];
    this.msg_callback = this.handle_msg.bind(this);
    this.onmessage = () => {};
    if (target)
      this.set_target(target);
  }

  set_target(new_target) {
    if (this.target)
      this.target.removeEventListener("message", this.msg_callback);
    for (let target of this.extra_targets) {
      target.removeEventListener("message", this.msg_callback);
    }
    this.target = new_target;
    this.extra_targets = [];
    this.target.addEventListener("message", this.msg_callback);
  }

  add_extra_target(target) {
    target.addEventListener("message", this.msg_callback);
    this.extra_targets.push(target);
  }

  handle_msg(event) {
    this.onmessage(event, this);
  }

  postMessage(...args) {
    this.target.postMessage(...args)
  }
}

async function handle_procedure_call(msg, source) {
  if (!rpc_handlers[msg.procedure]) {
    return;
  }

  let output;
  try {
    output = {
      value: await rpc_handlers[msg.procedure].apply({source: source}, msg.arguments),
      success: true
    };
  }
  catch (e) {
    quiet_error(e);
    let message;
    try {
      message = String(e?.message ?? e);
    }
    catch {
      message = "unknown error";
    }
    output = {
      value: {__rpc_error__: true, name: String(e?.name || "Error"), message: message},
      success: false
    };
  }

  return {
    type: "reply",
    id: msg.id,
    content: output
  };
}

function handle_procedure_reply(msg) {
  if (!rpc_requests[msg.id]) {
    return;
  }
  rpc_requests[msg.id](msg.content);
  delete rpc_requests[msg.id];
}

function transfer_list(output) {
  let value = output?.content?.value;
  if (!(value instanceof Uint8Array)) return [];
  let buffer = value.buffer;
  if (!(buffer instanceof ArrayBuffer)) return [];
  if (value.byteOffset !== 0 || value.byteLength !== buffer.byteLength) return [];
  if (value.byteLength < MIN_TRANSFER_BYTES) return [];
  return [buffer];
}

function send_reply(source, output) {
  let transfer = transfer_list(output);
  if (transfer.length === 0) {
    source.postMessage(output, {targetOrigin: "*"});
    return;
  }
  try {
    source.postMessage(output, {targetOrigin: "*", transfer: transfer});
  }
  catch {
    source.postMessage(output, {targetOrigin: "*"});
  }
}

export async function message_listener(event, target) {
  let msg = event.data;
  let source = event.source || event.currentTarget;
  if (!msg || typeof msg.type === "undefined") return;

  if (msg.type === "procedure") {
    let output = await handle_procedure_call(msg, source);
    if (!source) return;
    if (output) {
      send_reply(source, output);
    }
  }
  else if (msg.type === "reply") {
    handle_procedure_reply(msg);
  }
  
  else if (msg.type === "attach") {
    let msg_port = event.ports[0];
    if (role === "frame") {
      host.postMessage(msg, {targetOrigin: "*", transfer: [msg_port]});
    }
    else {
      target.add_extra_target(msg_port);
      msg_port.start();
    }
  }
}

export async function call_procedure(target, procedure, args) {
  if (globalThis.HTMLIFrameElement && target instanceof globalThis.HTMLIFrameElement) {
    target = target.contentWindow || target;
  }
  let msg = {
    type: "procedure",
    id: Math.random() + "",
    procedure: procedure,
    arguments: args
  };

  return await new Promise((resolve, reject) => {
    rpc_requests[msg.id] = (reply) => {
      if (reply.success) resolve(reply.value);
      else if (reply.value && reply.value.__rpc_error__) {
        let error = new Error(reply.value.message);
        try {
          error.name = reply.value.name;
        }
        catch {}
        reject(error);
      }
      else reject(reply.value);
    }
    target.postMessage(msg, {targetOrigin: "*"});  
  });
}

export function create_rpc_wrapper(target, procedure) {
  return function() {
    return call_procedure(target, procedure, [...arguments]);
  }
}

export function attach_host(msg_port) {
  let msg = {
    type: "attach",
    id: Math.random() + ""
  };
  host.postMessage(msg, {targetOrigin: "*", transfer: [msg_port]});
}

export function set_host(frame, msg_port) {
  let msg = {
    type: "set_host",
    id: Math.random() + ""
  };
  let msg_target = frame.contentWindow || frame;
  msg_target.postMessage(msg, {targetOrigin: "*", transfer: [msg_port]})
}

export async function wait_on_frame(frame, timeout_ms = 0) {
  let resolved = false;
  let listener = (event) => {
    let msg = event.data;
    if (!msg || msg.type !== "pong") return;
    if (frame.contentWindow && event.source !== frame.contentWindow) return;
    resolved = true;
  };
  globalThis.addEventListener("message", listener);

  let started = performance.now();
  let delay = 20;
  try {
    while (!resolved) {
      if (timeout_ms > 0 && performance.now() - started > timeout_ms) return false;
      try {
        let msg = {
          type: "ping",
          id: Math.random() + ""
        };
        frame.contentWindow.postMessage(msg, "*");
      }
      catch {}
      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * 1.5, 100);
    }
  }
  finally {
    globalThis.removeEventListener("message", listener);
  }
  return true;
}

function host_set_handler(event) {
  let msg = event.data;
  let msg_port = event.ports[0];

  if (msg.type === "ping") {
    let msg = {
      type: "pong",
      id: Math.random() + ""
    };
    event.source.postMessage(msg, "*");
    return;
  }

  if (msg.type === "set_host" && msg_port) {
    if (!host.target) {
      host.set_target(msg_port);
      on_attach();
    }
    else {
      host.add_extra_target(msg_port);
    }
    msg_port.start();
  }
}

export function set_role(value) {
  role = value;
}
export function set_on_attach(callback) {
  on_attach = callback;
}

if (self.parent !== globalThis || typeof globalThis.importScripts === "function") {
  host = new RPCTarget();
  host.onmessage = message_listener;
  self.addEventListener("message", host_set_handler);
}
