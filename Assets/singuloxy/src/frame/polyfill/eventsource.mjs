import { ctx, document_base } from "../context.mjs";
import * as network from "../network.mjs";

export class FakeEventSource extends EventTarget {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  CONNECTING = 0;
  OPEN = 1;
  CLOSED = 2;

  #closed = false;
  #last_id = "";
  #retry = 3000;
  #reader = null;

  constructor(url, init) {
    super();
    this.url = new URL(String(url), document_base()).href;
    this.withCredentials = !!(init && init.withCredentials);
    this.readyState = 0;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.#connect();
  }

  #emit(event) {
    let handler = this["on" + event.type];
    if (typeof handler === "function") {
      try {
        handler.call(this, event);
      }
      catch (e) {
        console.error(e);
      }
    }
    this.dispatchEvent(event);
  }

  #fail() {
    this.#closed = true;
    this.readyState = 2;
    this.#emit(new Event("error"));
  }

  async #connect() {
    while (!this.#closed) {
      let headers = {"Accept": "text/event-stream", "Cache-Control": "no-cache"};
      if (this.#last_id) headers["Last-Event-ID"] = this.#last_id;

      try {
        let response = await network.fetch(this.url, {headers: headers});
        if (this.#closed) {
          try { await response.body?.cancel(); } catch {}
          return;
        }
        let type = (response.headers.get("content-type") || "").toLowerCase();
        if (response.status !== 200 || !type.startsWith("text/event-stream")) {
          try { await response.body?.cancel(); } catch {}
          this.#fail();
          return;
        }
        this.readyState = 1;
        this.#emit(new Event("open"));
        await this.#read(response);
      }
      catch (e) {
        if (this.#closed) return;
      }

      if (this.#closed) return;
      this.readyState = 0;
      this.#emit(new Event("error"));
      await new Promise((resolve) => setTimeout(resolve, this.#retry));
    }
  }

  async #read(response) {
    if (!response.body) return;
    let reader = response.body.getReader();
    this.#reader = reader;
    let decoder = new TextDecoder();
    let buffer = "";
    let data = [];
    let event_type = "";

    while (!this.#closed) {
      let result = await reader.read();
      if (result.done) break;
      buffer += decoder.decode(result.value, {stream: true});
      let lines = buffer.split(/\r\n|\r|\n/);
      buffer = lines.pop();

      for (let line of lines) {
        if (line === "") {
          if (data.length > 0) {
            this.#emit(new MessageEvent(event_type || "message", {
              data: data.join("\n"),
              lastEventId: this.#last_id,
              origin: ctx.location.origin
            }));
          }
          data = [];
          event_type = "";
          continue;
        }
        if (line.startsWith(":")) continue;

        let colon = line.indexOf(":");
        let field = colon === -1 ? line : line.slice(0, colon);
        let value = colon === -1 ? "" : line.slice(colon + 1);
        if (value.startsWith(" ")) value = value.slice(1);

        if (field === "event") event_type = value;
        else if (field === "data") data.push(value);
        else if (field === "id" && !value.includes("\0")) this.#last_id = value;
        else if (field === "retry" && /^\d+$/.test(value)) this.#retry = Number(value);
      }
    }
  }

  close() {
    this.#closed = true;
    this.readyState = 2;
    try {
      this.#reader?.cancel().catch(() => {});
    }
    catch {}
  }
}
