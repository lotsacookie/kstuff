import * as network from "../network.mjs";
import * as loader from "../loader.mjs";
import * as rpc from "../../rpc.mjs";
import * as util from "../../util.mjs";
import { scan_import_scripts } from "./worker_scan.mjs";

const DISCOVERY_TIMEOUT_MS = 10000;
const discovery_cache = new Map();

function clone_worker_event(event) {
  if (event.type === "error") {
    return new ErrorEvent("error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      cancelable: true
    });
  }
  return new MessageEvent(event.type, {
    data: event.data,
    origin: event.origin,
    lastEventId: event.lastEventId,
    ports: Array.from(event.ports || [])
  });
}
import { wrap_obj, run_script_safe, convert_url, document_base } from "../context.mjs";

export function fakeImportScripts(...paths) {
  let script_urls = paths.map((path) => convert_url(path, network.worker_base || document_base()));

  if (network.requests_allowed) {
    for (let url of script_urls) {
      if (typeof network.resource_cache[url] === "string") {
        run_script_safe(network.resource_cache[url]);
      }
      else if (network.resource_cache[url] === false) {
        throw Error("Script network request failed");
      }
      else {
        console.warn("sandstone: importScripts cache miss for", url);
        network.fetch(url).then(r => r.text()).then((js) => {
          run_script_safe(js);
        }).catch((e) => console.error("sandstone: importScripts fetch failed", url, e));
      }
    }
  }
  else {
    self.postMessage({
      frame_id: loader.frame_id,
      urls: script_urls
    })
  }
}

export class FakeWorker extends EventTarget {
  #url; #options; #worker; #msg_queue; #terminated;

  constructor(url, options) {
    super();
    this.#url = url;
    this.#options = options;
    this.#worker = null;
    this.#msg_queue = [];
    this.#terminated = false;

    this.onerror = () => {};
    this.onmessage = () => {};
    this.onmessageerror = () => {};

    if (options && options.type === "module") {
      console.warn("sandstone: module workers are not supported, running as a classic worker");
    }

    this.#load_worker().catch((e) => {
      if (e && e.name === "DataCloneError" && !self.crossOriginIsolated) {
        if (!self.__sandstone_isolation_warned) {
          self.__sandstone_isolation_warned = true;
          console.error("sandstone: the top-level page is not cross-origin isolated, so shared-memory (pthread) workers cannot start. Serve the host page and the embed that loads sandstone with 'Cross-Origin-Opener-Policy: same-origin' and 'Cross-Origin-Embedder-Policy: credentialless' (see docs/cross-origin-isolation.md).");
        }
      }
      else console.error("sandstone: worker failed to start", url, e);
      try {
        this.onerror(new ErrorEvent("error", {message: String(e)}));
      }
      catch {}
    });
  }

  async #discover(worker_text, worker_js, worker_base_json) {
    let worker_id = "" + Math.random();
    let temp_script = `
      ${loader.runtime_src}
      sandstone_frame.loader.set_url("${loader.url}");
      sandstone_frame.network.set_worker_base(${worker_base_json});
      sandstone_frame.loader.set_worker_url(${worker_base_json});
      sandstone_frame.loader.set_frame_id("${worker_id}");
      sandstone_frame.context.update_ctx();
      sandstone_frame.rpc.set_on_attach(() => {
        try {
          sandstone_frame.context.run_script(${worker_js});
        }
        finally {
          self.postMessage({frame_id: "${worker_id}", urls: [], done: true});
        }
      })
    `;
    let temp_blob = new Blob([temp_script], {type: "text/javascript"});
    let temp_blob_url = URL.createObjectURL(temp_blob);

    let temp_worker = new Worker(temp_blob_url, {...this.#options, type: "classic"});
    this.#worker_attach(temp_worker);
    let recorded_urls = new Set();
    let terminate_worker;
    temp_worker.onmessage = (event) => {
      let data = event.data;
      if (!data || data.frame_id !== worker_id) return;
      for (let url of data.urls || [])
        recorded_urls.add(url);
      if (data.done) terminate_worker();
    }
    temp_worker.onerror = () => {
      terminate_worker();
    }

    await new Promise((resolve) => {
      terminate_worker = resolve;
      setTimeout(resolve, DISCOVERY_TIMEOUT_MS);
    });
    temp_worker.terminate();
    for (let url of scan_import_scripts(worker_text, JSON.parse(worker_base_json))) {
      recorded_urls.add(url);
    }

    let promises = [];
    let script_data = {};
    for (let url of recorded_urls) {
      script_data[url] = false;
      promises.push((async () => {
        let response = await network.fetch(url);
        let script_text = await response.text();
        script_data[url] = script_text;
      })());
    }
    await util.run_parallel(promises);

    return {recorded_urls, script_data};
  }

  async #load_worker() {
    let response = await network.fetch(this.#url);
    let worker_text = await response.text();
    let worker_js = JSON.stringify(worker_text);
    let worker_id = "" + Math.random();
    let worker_base_json = JSON.stringify(new URL(String(this.#url), document_base()).href);

    // Emscripten spawns many pthread workers from the same script. Discover its
    // dependencies once and share the result, instead of running a 10s probe each time.
    let discovered = discovery_cache.get(worker_base_json);
    if (!discovered) {
      discovered = this.#discover(worker_text, worker_js, worker_base_json);
      discovery_cache.set(worker_base_json, discovered);
      discovered.catch(() => discovery_cache.delete(worker_base_json));
    }
    let {recorded_urls, script_data} = await discovered;
    if (this.#terminated) return;

    let cache_puts = [];
    for (let url of recorded_urls) {
      let safe_url = JSON.stringify(url);
      let safe_contents = JSON.stringify(script_data[url]);
      cache_puts.push(`sandstone_frame.network.cache_put(${safe_url}, ${safe_contents});`);
    }
    let cache_substr = cache_puts.join("\n");
    let real_script = `
      ${loader.runtime_src}
      ${cache_substr}
      sandstone_frame.loader.set_url(${JSON.stringify(loader.url)});
      sandstone_frame.network.set_worker_base(${worker_base_json});
      sandstone_frame.loader.set_worker_url(${worker_base_json});
      sandstone_frame.loader.set_frame_id("${worker_id}");
      sandstone_frame.network.enable_network();
      sandstone_frame.context.update_ctx();
      sandstone_frame.rpc.set_on_attach(() => {
        sandstone_frame.context.run_script(${worker_js});
      })
    `;
    let real_blob = new Blob([real_script], {type: "text/javascript"});
    let real_blob_url = network.create_blob_url(real_blob, this.#url);

    if (this.#terminated) return;
    this.#worker = new Worker(real_blob_url, {...this.#options, type: "classic"});
    this.#worker_attach(this.#worker);
    for (let event of ["error", "message", "messageerror"]) {
      this.#setup_listener(event);
    }
    for (let [message, transfer] of this.#msg_queue) {
      this.#worker.postMessage(message, transfer);
    }
    this.#msg_queue = [];

    this.#worker.addEventListener("message", (event) => {
      rpc.message_listener(event);
      event.stopImmediatePropagation();
    }, {once: true});

    window.addEventListener("beforeunload", () => {
      this.terminate();
    }, true);
  }

  #worker_attach(worker) {
    let msg_channel = new MessageChannel();
    rpc.attach_host(msg_channel.port1);
    rpc.set_host(worker, msg_channel.port2);
  }

  #setup_listener(event_name) {
    this.#worker.addEventListener(event_name, (event) => {
      if (event_name === "error") {
        util.quiet_error("sandstone: worker error", String(this.#url), event.message, event.filename, event.lineno, event.colno);
      }
      let cloned = clone_worker_event(event);
      let handler = this["on" + event_name];
      if (typeof handler === "function") handler.call(this, cloned);
      this.dispatchEvent(cloned);
    })
  }

  postMessage(message, transfer) {
    if (this.#worker == null) 
      this.#msg_queue.push([message, transfer]);
    else
      this.#worker.postMessage(message, transfer)
  }

  terminate() {
    if (this.#worker)
      this.#worker.terminate();
    this.#terminated = true;
  }
}
