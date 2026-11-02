(function () {
  const API = "https://api.deepai.org";
  const SITE = "https://deepai.org";
  const PREFIX = "deepai:";
  const COOKIE_KEY = "DAIJ";
  const MODEL_KEY = "DAIM";
  const CRED_KEY = "DAIC";
  const GUEST_KEY = "DAIG";
  const USER_KEY = "DAIU";
  const DOMAIN = "singularity.com";
  const CONTEXT = "You are the AI assistant built into Singularity, a web portal. The site you are running on is Singularity, not DeepAI, so never say you are on DeepAI or mention DeepAI. Files and images the user attaches are included with their messages: read and use them directly.";
  const GAMES_PATH = "Assets/json/g.json";
  const LAST_KEY = "DA_LAST";
  const BAD_KEY = "DA_BAD";
  const BAD_TTL_MS = 6 * 3600000;
  const KSTUFF = "lotsacookie/kstuff";
  const LIST_PATH = "Assets/json/wss.json";
  const FALLBACK = "wss://api.personalloanonline.net/ws/";
  const BUILTIN = [
    "cdn.northstreetumc.org",
    "cdn.vipersfutbol.com",
    "cdn.pcesc.org",
    "cdn.kcchallengevbc.com",
    "cdn.slcbmooc.org",
    "cdn.topstargym.net",
    "cdn.goaplytexas.org",
    "cdn.clearfieldswimming.com",
    "wss://athollcottage.com/connection/",
    "wss://api.personalloanonline.net/ws/",
    "wss://kristenblackburnvolleyballcamps.com/socket/",
    "wss://southpadreislandkiteboarding.com/socket/"
  ];
  const LIST_MIRRORS = [
    "https://cdn.jsdelivr.net/gh/" + KSTUFF + "@main/",
    "https://fastly.jsdelivr.net/gh/" + KSTUFF + "@main/",
    "https://gcore.jsdelivr.net/gh/" + KSTUFF + "@main/",
    "https://raw.githubusercontent.com/" + KSTUFF + "/main/",
    "https://cdn.statically.io/gh/" + KSTUFF + "/main/"
  ];
  const SANDSTONE_BASES = [
    "https://cdn.jsdelivr.net/gh/lotsacookie/Singuloxy@main/",
    "https://fastly.jsdelivr.net/gh/lotsacookie/Singuloxy@main/"
  ];
  const SANDSTONE_DIST = "dist/sandstone.mjs";
  const FILE_ICON = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>');
  const UA = navigator.userAgent;

  const md5Reversed = (function () {
    const a = [];
    for (let b = 0; 64 > b;) a[b] = 0 | 4294967296 * Math.sin(++b % Math.PI);
    return function (input) {
      let d, e, f, g = [d = 1732584193, e = 4023233417, ~d, ~e], h = [], l = unescape(encodeURI(input)) + "\u0080", k = l.length;
      let c = --k / 4 + 2 | 15;
      for (h[--c] = 8 * k; ~k;) h[k >> 2] |= l.charCodeAt(k) << 8 * k--;
      for (let b = 0, l = 0; b < c; b += 16) {
        for (k = g; 64 > l;) k = [f = k[3], d + ((f = k[0] + [d & e | ~d & f, f & d | ~f & e, d ^ e ^ f, e ^ (d | ~f)][k = l >> 4] + a[l] + ~~h[b | [l, 5 * l + 1, 3 * l + 5, 7 * l][k] & 15]) << (k = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][4 * k + l++ % 4]) | f >>> -k), d, e];
        d = k[1] | 0, e = k[2];
        for (l = 4; l;) g[--l] += k[l];
      }
      let result = "";
      for (let l = 0; 32 > l;) result += (g[l >> 3] >> 4 * (1 ^ l++) & 15).toString(16);
      return result.split("").reverse().join("");
    };
  })();

  function apiKey() {
    const random = Math.round(Math.random() * 100000000000) + "";
    const inner = md5Reversed(UA + random + "hackers_become_a_little_stinkier_every_time_they_hack");
    const middle = md5Reversed(UA + inner);
    return "tryit-" + random + "-" + md5Reversed(UA + middle);
  }

  class DeepAIError extends Error {
    constructor(message, info) {
      super(message);
      this.name = "DeepAIError";
      info = info || {};
      this.status = info.status || 0;
      this.code = info.code || "";
      this.body = info.body || null;
    }
  }

  const store = {
    get(key) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {}
    },
    del(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  function withTimeout(promise, ms, message) {
    let timer;
    const timeout = new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }

  function createJar() {
    const jar = new Map(Object.entries(store.get(COOKIE_KEY) || {}));
    const save = () => store.set(COOKIE_KEY, Object.fromEntries(jar));
    const lines = headers => {
      if (typeof headers.getSetCookie === "function") {
        const list = headers.getSetCookie();
        if (list.length) return list;
      }
      const raw = headers.get("set-cookie");
      return raw ? raw.split(/,(?=\s*[A-Za-z0-9_.\-]+=)/) : [];
    };
    return {
      absorb(headers) {
        let changed = false;
        for (const line of lines(headers)) {
          const pair = line.split(";")[0];
          const eq = pair.indexOf("=");
          if (eq < 1) continue;
          const name = pair.slice(0, eq).trim();
          const value = pair.slice(eq + 1).trim();
          if (/max-age=0|expires=thu, 01 jan 1970/i.test(line) || value === "") jar.delete(name);
          else jar.set(name, value);
          changed = true;
        }
        if (changed) save();
      },
      header() {
        return [...jar.entries()].map(([k, v]) => k + "=" + v).join("; ");
      },
      clear() {
        jar.clear();
        store.del(COOKIE_KEY);
      }
    };
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === "x" ? r : r & 3 | 8).toString(16);
    });
  }

  async function multipart(fields, file) {
    const boundary = "----k" + Math.random().toString(16).slice(2) + Date.now().toString(16);
    const enc = new TextEncoder();
    const parts = [];
    for (const key of Object.keys(fields)) {
      const value = fields[key];
      if (value === undefined || value === null) continue;
      parts.push(enc.encode("--" + boundary + '\r\nContent-Disposition: form-data; name="' + key + '"\r\n\r\n' + value + "\r\n"));
    }
    if (file) {
      const name = String(file.name || "file").replace(/["\r\n]/g, "_");
      parts.push(enc.encode("--" + boundary + '\r\nContent-Disposition: form-data; name="file"; filename="' + name + '"\r\nContent-Type: ' + (file.type || "application/octet-stream") + "\r\n\r\n"));
      parts.push(new Uint8Array(await file.arrayBuffer()));
      parts.push(enc.encode("\r\n"));
    }
    parts.push(enc.encode("--" + boundary + "--\r\n"));
    const size = parts.reduce((n, p) => n + p.length, 0);
    const body = new Uint8Array(size);
    let at = 0;
    for (const p of parts) {
      body.set(p, at);
      at += p.length;
    }
    return { body, type: "multipart/form-data; boundary=" + boundary };
  }

  const toWss = entry => {
    const text = String(entry || "").trim();
    if (!text) return null;
    const url = text.includes("://") ? text : "wss://" + text + "/";
    return url.endsWith("/") ? url : url + "/";
  };

  const badList = {
    live() {
      const now = Date.now();
      const out = {};
      const saved = store.get(BAD_KEY);
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        for (const key of Object.keys(saved)) {
          if (typeof saved[key] === "number" && now - saved[key] < BAD_TTL_MS) out[key] = saved[key];
        }
      }
      return out;
    },
    has(entry) {
      const key = toWss(entry);
      return !!key && Object.prototype.hasOwnProperty.call(this.live(), key);
    },
    add(entry) {
      const key = toWss(entry);
      if (!key) return;
      const list = this.live();
      list[key] = Date.now();
      store.set(BAD_KEY, list);
    }
  };

  function probeWisp(entry, timeoutMs) {
    return new Promise(resolve => {
      let ws;
      try {
        ws = new WebSocket(toWss(entry));
      } catch (e) {
        resolve(null);
        return;
      }
      ws.binaryType = "arraybuffer";
      let connected = false;
      let sentAt = 0;
      const streamId = Math.floor(Math.random() * 0xFFFFFFFE) + 1 >>> 0;
      const finish = ping => {
        clearTimeout(timer);
        ws.onmessage = ws.onerror = ws.onclose = null;
        try {
          ws.close();
        } catch (e) {}
        resolve(ping);
      };
      const timer = setTimeout(() => finish(null), timeoutMs || 3000);
      ws.onmessage = event => {
        if (!(event.data instanceof ArrayBuffer) || event.data.byteLength < 5) return;
        const view = new DataView(event.data);
        const type = view.getUint8(0);
        const stream = view.getUint32(1, true);
        if (!connected) {
          if (type === 5 && stream === 0) {
            ws.send(new Uint8Array([5, 0, 0, 0, 0, 2, 1]));
          } else if (type === 3 && stream === 0) {
            connected = true;
            const host = new TextEncoder().encode("127.0.0.1");
            const buf = new ArrayBuffer(8 + host.length);
            const dv = new DataView(buf);
            dv.setUint8(0, 1);
            dv.setUint32(1, streamId, true);
            dv.setUint8(5, 1);
            dv.setUint16(6, 69, true);
            new Uint8Array(buf).set(host, 8);
            sentAt = performance.now();
            ws.send(buf);
          }
          return;
        }
        if (stream === streamId) finish(Math.round(performance.now() - sentAt));
      };
      ws.onerror = ws.onclose = () => finish(null);
    });
  }

  async function firstAlive(entries, waveSize) {
    const size = waveSize || 6;
    for (let i = 0; i < entries.length; i += size) {
      const wave = entries.slice(i, i + size);
      const pings = await Promise.all(wave.map(entry => probeWisp(entry, 3000)));
      const alive = wave.map((entry, j) => ({ entry, ping: pings[j] })).filter(x => x.ping !== null).sort((a, b) => a.ping - b.ping);
      if (alive.length) return alive[0];
    }
    return null;
  }

  async function fetchText(url, ms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      const response = await fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function parseWispList(json) {
    const encoded = Array.isArray(json) ? json.find(v => typeof v === "string" && v.trim()) : json;
    if (typeof encoded !== "string") return [];
    let data;
    try {
      data = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(encoded.trim()), c => c.charCodeAt(0))));
    } catch (e) {
      return [];
    }
    const out = [];
    (function walk(value) {
      if (typeof value === "string" && /^wss:\/\//i.test(value.trim())) out.push(value.trim());
      else if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object") Object.values(value).forEach(walk);
    })(data);
    return [...new Set(out)];
  }

  async function fetchWispList() {
    try {
      return parseWispList(await Promise.any(LIST_MIRRORS.map(base => fetchText(base + LIST_PATH, 5000))));
    } catch (e) {
      return [];
    }
  }

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.random() * (i + 1) | 0;
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function parentWindow() {
    try {
      return window.parent && window.parent !== window ? window.parent : null;
    } catch (e) {
      return null;
    }
  }

  function readGlobal(target, key) {
    try {
      return target ? target[key] : undefined;
    } catch (e) {
      return undefined;
    }
  }

  async function parentReady() {
    const promise = readGlobal(parentWindow(), "kWispP");
    if (promise && typeof promise.then === "function") {
      await Promise.race([promise.catch(() => {}), delay(6000)]);
    }
  }

  function localCandidates() {
    const out = [];
    const add = entry => {
      const text = typeof entry === "string" ? entry.trim() : "";
      if (text && !out.includes(text)) out.push(text);
    };
    const parent = parentWindow();
    add(readGlobal(parent, "wlspServer"));
    add(readGlobal(window, "wlspServer"));
    [parent, window].forEach(target => {
      const list = readGlobal(target, "serverList");
      if (Array.isArray(list)) list.forEach(add);
    });
    BUILTIN.forEach(add);
    return out;
  }

  function provisionalWisp(network) {
    const last = store.get(LAST_KEY);
    const url = toWss(last && last.entry && !badList.has(last.entry) ? last.entry : FALLBACK);
    network.set_websocket(url);
    return url;
  }

  async function pickWisp(network, exclude) {
    const skip = new Set((exclude || []).map(toWss));
    const allowed = entry => !skip.has(toWss(entry));
    const prefer = list => {
      const ok = list.filter(allowed);
      return [...ok.filter(e => !badList.has(e)), ...ok.filter(e => badList.has(e))];
    };
    let settled = false;
    const apply = entry => {
      const url = toWss(entry);
      network.set_websocket(url);
      try {
        network.set_wisp_pool([url]);
      } catch (e) {}
      store.set(LAST_KEY, { entry, ts: Date.now() });
      return url;
    };
    const search = async () => {
      await parentReady();
      const last = store.get(LAST_KEY);
      if (last && last.entry && allowed(last.entry) && !badList.has(last.entry) && Date.now() - last.ts < 600000 && (await probeWisp(last.entry, 3000)) !== null) {
        return settled ? null : apply(last.entry);
      }
      const local = prefer(localCandidates());
      let hit = await firstAlive(local);
      if (hit) return settled ? null : apply(hit.entry);
      const remote = await fetchWispList();
      const extra = prefer([FALLBACK, ...shuffle(remote.filter(u => !local.includes(u))).slice(0, 16)]);
      hit = await firstAlive(extra);
      if (hit) return settled ? null : apply(hit.entry);
      return null;
    };
    const timeout = new Promise(resolve => setTimeout(() => resolve(null), 20000));
    let url = null;
    try {
      url = await Promise.race([search(), timeout]);
    } catch (e) {
      url = null;
    }
    settled = true;
    if (url) return url;
    return apply([FALLBACK, ...BUILTIN].find(allowed) || FALLBACK);
  }

  async function loadSandstone() {
    for (const base of SANDSTONE_BASES) {
      try {
        return await import(base + SANDSTONE_DIST);
      } catch (e) {}
    }
    const code = await (await fetch("https://raw.githubusercontent.com/lotsacookie/Singuloxy/main/" + SANDSTONE_DIST)).text();
    return import(URL.createObjectURL(new Blob([code], { type: "text/javascript" })));
  }

  async function createProxy(exclude) {
    const sandstone = await loadSandstone();
    provisionalWisp(sandstone.network);
    for (let i = 0; i < 300 && !sandstone.libcurl.ready; i++) await delay(100);
    if (!sandstone.libcurl.ready) throw new Error("libcurl did not load");
    const wisp = await pickWisp(sandstone.network, exclude);
    return { fetch: (target, init) => sandstone.libcurl.fetch(target, init), wisp };
  }

  function createClient(send) {
    const jar = createJar();
    const headers = extra => {
      const out = { "User-Agent": UA, "Origin": SITE, "Referer": SITE + "/chat" };
      for (const key of Object.keys(extra || {})) out[key] = extra[key];
      const cookie = jar.header();
      if (cookie) out.Cookie = cookie;
      return out;
    };
    const describeBody = b => {
      if (b == null) return "none";
      if (typeof b === "string") return "string(" + b.length + ")";
      if (typeof FormData !== "undefined" && b instanceof FormData) {
        return "FormData{" + [...b.entries()].map(([k, v]) => k + "=" + (typeof v === "string" ? (v.length > 120 ? v.slice(0, 120) + "..." : v) : "File(" + (v.name || "") + "," + (v.type || "") + "," + (v.size || 0) + "b)")).join(", ") + "}";
      }
      return (b.constructor && b.constructor.name || "body") + "(" + (b.byteLength || b.size || b.length || "?") + ")";
    };
    async function raw(path, init) {
      init = init || {};
      const url = path.startsWith("http") ? path : API + path;
      const sent = headers(init.headers);
      const started = Date.now();
      console.log("[deepai] ->", init.method || "GET", url, "headers:", Object.keys(sent).filter(k => k !== "Cookie").join(","), "cookies:", sent.Cookie ? sent.Cookie.split(";").map(c => c.split("=")[0].trim()).join(",") : "none", "body:", describeBody(init.body));
      let response;
      try {
        response = await send(url, Object.assign({ redirect: "follow" }, init, { headers: sent }));
      } catch (e) {
        console.error("[deepai] <- network error", init.method || "GET", url, e);
        throw e;
      }
      jar.absorb(response.headers);
      console.log("[deepai] <-", response.status, init.method || "GET", url, (response.headers.get("content-type") || ""), (Date.now() - started) + "ms");
      return response;
    }
    async function readBody(response) {
      let text = "";
      try {
        text = await response.text();
      } catch (e) {}
      let body = null;
      try {
        body = JSON.parse(text);
      } catch (e) {}
      if (!response.ok) console.error("[deepai] error body", response.status, response.url || "", text.slice(0, 2000));
      return { body, text };
    }
    async function json(path, init) {
      const response = await raw(path, init);
      const { body, text } = await readBody(response);
      if (!response.ok) {
        const code = body && (body.status || body.error || body.detail) || "";
        throw new DeepAIError(String(code || "HTTP " + response.status + (text ? ": " + text.replace(/\s+/g, " ").slice(0, 200) : "")), { status: response.status, code: String(code), body });
      }
      return body;
    }
    async function post(path, fields, file, extra) {
      const packed = await multipart(fields, file);
      return json(path, { method: "POST", body: packed.body, headers: Object.assign({ "Content-Type": packed.type }, extra || {}) });
    }
    return {
      async userLoginType(email) {
        return post("/get_user_login_type", { email });
      },
      async login(email, password) {
        const type = await this.userLoginType(email);
        if (!type.user_exists) throw new DeepAIError("No account for this email", { code: "no_account", body: type });
        if (!type.login_with_password) {
          const via = (type.login_with_social_accounts || [])[0] || "a social account";
          throw new DeepAIError("This account signs in with " + via, { code: "social_only", body: type });
        }
        await post("/daily-time-sync/login/", { username: email, password });
        return this.me();
      },
      async logout() {
        try {
          await raw("/daily-time-sync/logout/", { method: "POST" });
        } finally {
          jar.clear();
        }
      },
      async register(email, password) {
        try {
          await post("/daily-time-sync/registration/", { email, username: email, password1: password, password2: password });
        } catch (error) {
          const body = error.body;
          const first = body && typeof body === "object" ? Object.values(body).flat().find(v => typeof v === "string") : null;
          throw new DeepAIError(first || error.message, { status: error.status, code: "register", body });
        }
        return this.me();
      },
      async saveSession(session) {
        return post("/save_chat_session", { uuid: session.uuid, title: "", chat_style: "chat", chat_model: session.model, messages: JSON.stringify(session.messages) });
      },
      async me() {
        const response = await raw("/daily-time-sync/user/");
        if (response.status !== 200) return null;
        try {
          return await response.json();
        } catch (e) {
          return null;
        }
      },
      async listModels() {
        const response = await raw(SITE + "/chat");
        if (!response.ok) throw new DeepAIError("Could not load model list", { status: response.status });
        const html = await response.text();
        const seen = new Map();
        for (const m of html.matchAll(/\{"value":"([^"]+)","label":"([^"]*)"(?:,"locked":(true|false))?/g)) {
          if (!seen.has(m[1])) seen.set(m[1], { id: m[1], label: m[2], locked: m[3] === "true" });
        }
        if (!seen.size) throw new DeepAIError("No models found", { code: "no_models" });
        return [...seen.values()];
      },
      async upload(file) {
        const name = String(file.name || "file");
        const formData = () => {
          const data = new FormData();
          data.append("file", file, name);
          return data;
        };
        const attempts = [
          () => json("/chat_attachments/upload", { method: "POST", body: formData() }),
          () => json("/chat_attachments/upload", { method: "POST", body: formData(), headers: { "api-key": apiKey() } }),
          async () => {
            const packed = await multipart({}, file);
            return json("/chat_attachments/upload", { method: "POST", body: packed.body, headers: { "Content-Type": packed.type, "api-key": apiKey() } });
          },
          () => json(SITE + "/chat_attachments/upload", { method: "POST", body: formData(), headers: { "api-key": apiKey() } })
        ];
        let last = null;
        const notes = [];
        console.log("[deepai] upload", name, file.type || "", file.size || 0, "bytes");
        for (const attempt of attempts) {
          try {
            const body = await attempt();
            console.log("[deepai] upload response", JSON.stringify(body));
            if (body && body.success && body.attachment) return body.attachment;
            last = new DeepAIError(body && body.error || "Upload failed", { body });
          } catch (e) {
            last = e;
          }
          notes.push(String(last && (last.status || last.code || last.message) || "error"));
          console.warn("[deepai] upload attempt failed", notes[notes.length - 1]);
        }
        throw new DeepAIError("Upload failed (" + notes.join(", ") + ")", { status: last && last.status, code: last && last.code, body: last && last.body });
      },
      async taskStatus(taskId) {
        return json("/check_chat_task_status?type=thinking-task&task_id=" + encodeURIComponent(taskId));
      },
      async *chat(options) {
        const fields = {
          chat_style: "chat",
          language: "en",
          chatHistory: JSON.stringify(options.messages),
          model: options.model,
          session_uuid: options.sessionUuid,
          sensitivity_request_id: uuid(),
          tool_activity_support: "1",
          thinking_image_tool_support: "1",
          hacker_is_stinky: "very_stinky",
          enabled_tools: JSON.stringify(["image_generator", "image_editor"])
        };
        if (options.webAccess !== undefined) fields.web_access_enabled = options.webAccess ? "true" : "false";
        if (options.attachments && options.attachments.length) fields.attachment_uuids = JSON.stringify(options.attachments);
        const packed = await multipart(fields);
        console.log("[deepai] chat fields", Object.assign({}, fields, { chatHistory: "(" + fields.chatHistory.length + " chars, " + options.messages.length + " messages)" }));
        const response = await raw("/hacking_is_a_serious_crime", {
          method: "POST",
          body: packed.body,
          signal: options.signal,
          headers: { "Content-Type": packed.type, "api-key": apiKey() }
        });
        if (!response.ok) {
          const { body, text } = await readBody(response);
          const code = body && body.status || "";
          throw new DeepAIError(String(code || "HTTP " + response.status + (text ? ": " + text.replace(/\s+/g, " ").slice(0, 200) : "")), { status: response.status, code: String(code), body });
        }
        if ((response.headers.get("content-type") || "").includes("application/json")) {
          yield { type: "json", value: await response.json() };
          return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          yield { type: "text", value: decoder.decode(next.value, { stream: true }) };
        }
        const tail = decoder.decode();
        if (tail) yield { type: "text", value: tail };
      }
    };
  }

  const state = { client: null, models: [], user: null, booting: null, abort: null, wisp: "", skip: [], games: "", lastSign: 0 };

  function say(text) {
    if (typeof _setAIStatus === "function") _setAIStatus(text || "");
  }

  function owns(id) {
    return typeof id === "string" && id.indexOf(PREFIX) === 0;
  }

  function entryFor(id) {
    return state.models.find(m => PREFIX + m.id === id) || null;
  }

  function label(id) {
    const model = entryFor(id);
    return model ? model.label : String(id).replace(PREFIX, "");
  }

  function catalog() {
    return state.models.filter(m => !m.locked).map(m => ({ value: PREFIX + m.id, label: m.label, locked: false }));
  }

  function defaultModel() {
    const list = catalog();
    if (!list.length) return null;
    const saved = store.get(MODEL_KEY);
    if (saved && list.some(m => m.value === saved)) return saved;
    return list[0].value;
  }

  function rememberModel(value) {
    if (owns(value)) store.set(MODEL_KEY, value);
  }

  function syncUi() {
    const input = document.getElementById("aiImageInput");
    if (input) input.removeAttribute("accept");
  }

  function slug(text) {
    return String(text || "").toLowerCase().replace(/[^a-z0-9._-]+/g, "").slice(0, 32);
  }

  function randomText(length) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => chars[b % chars.length]).join("");
  }

  function kstuffUsername() {
    const targets = [window];
    const parent = parentWindow();
    if (parent) targets.push(parent);
    for (const target of targets) {
      try {
        const saved = JSON.parse(target.localStorage.getItem("kstuff_user"));
        const name = slug(saved && saved.username);
        if (name) return name;
      } catch (e) {}
    }
    return "";
  }

  function guestName() {
    let guest = store.get(GUEST_KEY);
    if (!guest) {
      guest = "guest" + randomText(8);
      store.set(GUEST_KEY, guest);
    }
    return guest;
  }

  async function accountFor(client, name) {
    const email = name + "@" + DOMAIN;
    const creds = store.get(CRED_KEY) || {};
    const current = await client.me();
    if (current && store.get(USER_KEY) === email) return current;
    if (current) await client.logout();
    const type = await client.userLoginType(email);
    let user = null;
    if (type && type.user_exists) {
      if (!creds[name]) return null;
      user = await client.login(email, creds[name]);
    } else {
      const password = creds[name] || randomText(24);
      creds[name] = password;
      store.set(CRED_KEY, creds);
      user = await client.register(email, password);
    }
    if (user) store.set(USER_KEY, email);
    return user;
  }

  async function ensureAccount(client) {
    const names = [];
    const known = kstuffUsername();
    if (known) names.push(known);
    names.push(guestName());
    for (const name of names) {
      try {
        const user = await accountFor(client, name);
        if (user) return user;
      } catch (error) {
        console.warn("[deepai] account setup failed for", name, error);
      }
    }
    for (let i = 0; i < 2; i++) {
      const fresh = "guest" + randomText(8);
      try {
        const user = await accountFor(client, fresh);
        if (user) {
          store.set(GUEST_KEY, fresh);
          return user;
        }
      } catch (error) {
        console.warn("[deepai] account setup failed for", fresh, error);
      }
    }
    return null;
  }

  async function signIn() {
    if (!state.client) return false;
    try {
      state.user = await ensureAccount(state.client);
    } catch (e) {
      state.user = null;
    }
    return !!state.user;
  }

  async function autoSignIn() {
    if (state.user) return true;
    if (!state.client || Date.now() - state.lastSign < 30000) return false;
    state.lastSign = Date.now();
    return signIn();
  }

  function buildHistory(messages) {
    const history = [];
    const files = [];
    messages.forEach(m => {
      if (m.role !== "user" && m.role !== "assistant") return;
      const ids = m.role === "user" && m.attachments ? m.attachments.map(a => a.uuid).filter(Boolean) : [];
      const content = m.content || (ids.length ? "Please look at the attached file." : "");
      if (!content) return;
      const entry = { role: m.role, content };
      if (ids.length) {
        entry.attachment_uuids = ids;
        ids.forEach(id => {
          if (!files.includes(id)) files.push(id);
        });
      }
      history.push(entry);
    });
    return { history, files };
  }

  function userContext() {
    const name = kstuffUsername();
    return name ? CONTEXT + " The user's name on Singularity is \"" + name + "\"; use it when it fits naturally." : CONTEXT;
  }

  function wantsGames(messages) {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return /\bgames?\b|\bplay\b|\bbored\b/i.test(String(messages[i].content || ""));
    }
    return false;
  }

  async function loadGames() {
    if (state.games) return state.games;
    for (const base of LIST_MIRRORS) {
      try {
        const list = await fetchText(base + GAMES_PATH, 8000);
        if (!Array.isArray(list) || !list.length) continue;
        const groups = {};
        list.forEach(g => {
          if (!g || !g.title) return;
          const key = g.category || "Other";
          (groups[key] = groups[key] || []).push(g.title);
        });
        state.games = Object.keys(groups).map(key => key + ": " + groups[key].join(", ")).join("\n");
        return state.games;
      } catch (e) {}
    }
    return "";
  }

  function withContext(messages, games) {
    let first = -1;
    let last = -1;
    messages.forEach((m, i) => {
      if (m.role !== "user") return;
      if (first < 0) first = i;
      last = i;
    });
    return messages.map((m, i) => {
      if (i !== first && !(games && i === last)) return m;
      let content = m.content;
      if (games && i === last) content = "[The Singularity games list, grouped by category. If the user asks for a game suggestion, recommend only games from this list.\n" + games + "]\n\n" + content;
      if (i === first) content = "[" + userContext() + "]\n\n" + content;
      return Object.assign({}, m, { content });
    });
  }

  function rerender() {
    if (typeof _renderModelSelect === "function") _renderModelSelect();
    syncUi();
  }

  async function refreshModels() {
    if (!state.client) return;
    try {
      state.models = await withTimeout(state.client.listModels(), 20000, "model list timed out");
    } catch (e) {}
    rerender();
  }

  function dropConnection() {
    if (state.wisp) {
      badList.add(state.wisp);
      state.skip.push(state.wisp);
    }
    state.booting = null;
    state.client = null;
  }

  async function attemptBoot() {
    say("Connecting…");
    const proxy = await createProxy(state.skip);
    state.wisp = proxy.wisp;
    const client = createClient(proxy.fetch);
    let models = null;
    let failure = null;
    try {
      models = await withTimeout(client.listModels(), 25000, "DeepAI did not respond");
    } catch (error) {
      failure = error;
    }
    if (!models) {
      badList.add(proxy.wisp);
      state.skip.push(proxy.wisp);
      throw failure || new Error("no models");
    }
    let user = null;
    try {
      user = await withTimeout(ensureAccount(client), 45000, "account setup timed out");
    } catch (e) {
      console.warn("[deepai] account setup failed", e);
    }
    state.client = client;
    state.models = models;
    state.user = user;
    say("");
    rerender();
  }

  function boot() {
    if (state.booting) return state.booting;
    state.booting = attemptBoot().catch(error => {
      state.booting = null;
      console.warn("[deepai] boot failed", error);
      throw error;
    });
    return state.booting;
  }

  async function ready() {
    try {
      await boot();
    } catch (error) {
      throw new Error("Could not reach DeepAI through the proxy. Try again in a moment.");
    }
  }

  async function connect(attempt) {
    try {
      await boot();
    } catch (error) {
      if (attempt >= 4) {
        say("DeepAI unavailable. Send a message to retry.");
        return;
      }
      say("DeepAI proxy failed, trying another server…");
      setTimeout(() => connect(attempt + 1), 1500 * (attempt + 1));
    }
  }

  function ensureChat() {
    if (!_aiCurrentChatId) _aiCurrentChatId = "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const chat = _getChat(_aiCurrentChatId);
    chat.provider = "deepai";
    chat.sessionUuid = chat.sessionUuid || uuid();
    if (owns(_aiSelectedModel)) chat.model = _aiSelectedModel;
    return chat;
  }

  function explain(error) {
    const code = error && error.code || "";
    if (code === "anonymous try it exceeded") {
      return "Free limit reached for now. Try again later or pick another model.";
    }
    if (code === "pro user out of credits" || code === "chat allowance unavailable") {
      return error.body && error.body.message ? error.body.message : "Allowance used up.";
    }
    return error && error.message || "Request failed";
  }

  async function followTask(taskId, signal, handlers) {
    let seenThinking = 0;
    let seenAnswer = 0;
    for (let i = 0; i < 400; i++) {
      if (signal && signal.aborted) throw new DOMException("aborted", "AbortError");
      const data = await state.client.taskStatus(taskId);
      const thinking = data.thinking_text || "";
      const answer = data.answer_text || "";
      if (thinking.length > seenThinking) {
        handlers.thinking(thinking.slice(seenThinking));
        seenThinking = thinking.length;
      }
      if (answer.length > seenAnswer) {
        handlers.content(answer.slice(seenAnswer));
        seenAnswer = answer.length;
      }
      const status = String(data.status || "");
      if (status === "COMPLETED") return;
      if (/fail|error|cancel/i.test(status)) throw new DeepAIError(status, { body: data });
      await delay(1500);
    }
    throw new DeepAIError("DeepAI took too long to answer");
  }

  async function stream(options, handlers) {
    await ready();
    const value = String(options.model);
    const modelValue = owns(value) ? value : PREFIX + value;
    // Like the site, send every attachment uuid of the conversation, not only the new ones.
    const attachments = [];
    const addAttachment = v => {
      const id = typeof v === "string" ? v : v && v.uuid;
      if (id && !attachments.includes(id)) attachments.push(id);
    };
    (options.messages || []).forEach(m => {
      (m.attachment_uuids || []).forEach(addAttachment);
      (m.attachments || []).forEach(addAttachment);
    });
    (options.attachments || []).forEach(addAttachment);
    const newest = [];
    (options.attachments || []).forEach(v => {
      const id = typeof v === "string" ? v : v && v.uuid;
      if (id && !newest.includes(id)) newest.push(id);
    });
    let sendIds = attachments.slice();
    let emitted = false;
    console.log("[deepai] stream", { model: value, session: options.sessionUuid, messages: (options.messages || []).length, all: attachments, newest });
    await autoSignIn();
    const games = wantsGames(options.messages) ? await loadGames() : "";
    const wrapped = {
      thinking: delta => {
        emitted = true;
        handlers.thinking(delta);
      },
      content: delta => {
        emitted = true;
        handlers.content(delta);
      }
    };
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attachments.length) {
          try {
            await state.client.saveSession({ uuid: options.sessionUuid, model: modelValue.slice(PREFIX.length), messages: options.messages });
          } catch (e) {}
        }
        for await (const part of state.client.chat({
          model: modelValue.slice(PREFIX.length),
          messages: withContext(options.messages, games),
          attachments: sendIds,
          sessionUuid: options.sessionUuid,
          webAccess: options.webAccess,
          signal: options.signal
        })) {
          if (part.type === "text") {
            wrapped.content(part.value);
          } else if (part.value && part.value.task_id) {
            await followTask(part.value.task_id, options.signal, wrapped);
          } else {
            const body = part.value || {};
            wrapped.content(typeof body === "string" ? body : body.answer_text || body.output || JSON.stringify(body));
          }
        }
        return;
      } catch (error) {
        console.error("[deepai] stream error", attempt, error && error.name, error && error.status, error && error.code, error && error.message, error && error.body);
        if (!emitted && error && error.status === 404 && sendIds.length && newest.length && sendIds.length !== newest.length) {
          console.warn("[deepai] 404 with", sendIds.length, "attachment ids, retrying with only the newest", newest);
          sendIds = newest.slice();
          continue;
        }
        if (attempt === 0 && !emitted && error && error.code === "anonymous try it exceeded" && await signIn()) continue;
        if (!(error instanceof DeepAIError) && !(error && error.name === "AbortError")) dropConnection();
        throw error;
      }
    }
  }

  async function uploadFile(file) {
    const session = state.user ? await state.client.me().catch(() => null) : null;
    if (!session) {
      state.user = null;
      await signIn();
    }
    try {
      return await state.client.upload(file);
    } catch (error) {
      if (!(error && error.status === 404)) throw error;
      state.user = null;
      await signIn();
      return state.client.upload(file);
    }
  }

  async function upload(file) {
    await ready();
    return uploadFile(file);
  }

  async function run(attachments) {
    await ready();
    const chat = ensureChat();
    const pending = _pendingUserMsg;
    const title = chat.title || (pending && pending.content ? pending.content.slice(0, 40) : "DeepAI chat");
    _onStreamStart({ conversationId: chat.id, title, model: chat.model });
    if (pending && attachments && attachments.length) {
      const stored = chat.messages.find(m => m.id === pending.id);
      if (stored) stored.attachments = attachments;
    }
    const built = buildHistory(chat.messages);
    state.abort = new AbortController();
    try {
      await stream({
        model: owns(chat.model) ? chat.model : _aiSelectedModel,
        messages: built.history,
        attachments: built.files,
        sessionUuid: chat.sessionUuid,
        webAccess: _aiWebSearchEnabled,
        signal: state.abort.signal
      }, { thinking: _onStreamThinking, content: _onStreamContent });
      _onStreamDone();
    } catch (error) {
      if (error && error.name === "AbortError") _onStreamDone();
      else _onStreamError(explain(error));
    } finally {
      state.abort = null;
    }
  }

  async function send(text, file) {
    await ready();
    const attachments = [];
    if (file) {
      say("Uploading " + file.name + "…");
      try {
        const uploaded = await uploadFile(file);
        attachments.push({ uuid: uploaded.uuid, name: file.name });
      } finally {
        say("");
      }
    }
    await run(attachments);
  }

  function stop() {
    if (state.abort) state.abort.abort();
  }

  window.DeepAI = {
    owns,
    label,
    catalog,
    defaultModel,
    rememberModel,
    syncUi,
    history: buildHistory,
    run,
    send,
    stream,
    upload,
    newSession: uuid,
    explain,
    stop,
    boot,
    fileIcon: FILE_ICON
  };

  function fixConnectingLabel() {
    document.querySelectorAll(".ai-select-trigger span").forEach(node => {
      if (node.textContent.indexOf("Connecting to DeepAI") === 0) node.textContent = "Connecting…";
    });
  }

  function start() {
    if (typeof window._aiBuildModelDropdown === "function" && !window._aiBuildModelDropdown.wrappedByDeepAI) {
      const original = window._aiBuildModelDropdown;
      const wrapped = function () {
        const result = original.apply(this, arguments);
        fixConnectingLabel();
        return result;
      };
      wrapped.wrappedByDeepAI = true;
      window._aiBuildModelDropdown = wrapped;
    }
    fixConnectingLabel();
    syncUi();
    setTimeout(() => connect(0), 200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
