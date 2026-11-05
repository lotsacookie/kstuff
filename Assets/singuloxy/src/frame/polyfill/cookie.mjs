import * as loader from "../loader.mjs";

export class FakeCookieJar {
  #map;
  #pending_sync;

  constructor() {
    this.#map = new Map();
    this.#pending_sync = false;
  }

  load(entries) {
    this.#map = new Map(entries);
    this.#purge_expired();
  }

  #purge_expired() {
    let now = Date.now();
    for (let [name, entry] of this.#map) {
      if (entry.expires !== null && entry.expires <= now) {
        this.#map.delete(name);
      }
    }
  }

  #push() {
    this.#purge_expired();
    loader.cookies(loader.frame_id, [...this.#map]);
  }

  #sync() {
    if (this.#pending_sync) return;
    this.#pending_sync = true;
    setTimeout(() => {
      if (!this.#pending_sync) return;
      this.#pending_sync = false;
      this.#push();
    }, 100);
  }

  _flush() {
    if (!this.#pending_sync) return;
    this.#pending_sync = false;
    this.#push();
  }

  _get_entries() {
    this.#purge_expired();
    return [...this.#map];
  }

  get() {
    this.#purge_expired();
    let parts = [];
    for (let [name, entry] of this.#map) {
      if (entry.http_only) continue;
      parts.push(`${name}=${entry.value}`);
    }
    return parts.join("; ");
  }

  get_header() {
    this.#purge_expired();
    let parts = [];
    for (let [name, entry] of this.#map) {
      parts.push(`${name}=${entry.value}`);
    }
    return parts.join("; ");
  }

  set(cookie_string, from_http = false) {
    let parts = cookie_string.split(";").map((p) => p.trim());
    let [name_value, ...attr_parts] = parts;
    let eq_index = name_value.indexOf("=");
    if (eq_index === -1) return;
    let name = name_value.substring(0, eq_index).trim();
    let value = name_value.substring(eq_index + 1).trim();
    if (!name) return;

    let expires = null;
    let max_age_seen = false;
    let http_only = false;
    for (let attr of attr_parts) {
      let attr_eq = attr.indexOf("=");
      let attr_name = (attr_eq === -1 ? attr : attr.substring(0, attr_eq)).trim().toLowerCase();
      let attr_value = attr_eq === -1 ? "" : attr.substring(attr_eq + 1).trim();

      if (attr_name === "max-age") {
        let seconds = parseInt(attr_value, 10);
        if (Number.isFinite(seconds)) {
          expires = Date.now() + seconds * 1000;
          max_age_seen = true;
        }
      }
      else if (attr_name === "expires" && !max_age_seen) {
        let parsed = Date.parse(attr_value);
        expires = Number.isFinite(parsed) ? parsed : null;
      }
      else if (attr_name === "httponly") {
        http_only = true;
      }
    }

    let existing = this.#map.get(name);
    if (!from_http && existing && existing.http_only) return;

    if (expires !== null && expires <= Date.now()) {
      this.#map.delete(name);
    }
    else {
      this.#map.set(name, { value, expires, http_only: from_http && http_only });
    }
    this.#sync();
  }
}
