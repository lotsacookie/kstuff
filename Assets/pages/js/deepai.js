(function () {
  const API = "https://api.deepai.org";
  const SITE = "https://deepai.org";
  const PREFIX = "deepai:";
  const COOKIE_KEY = "DAIJ";
  const MODEL_KEY = "DAIM";
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
    async function raw(path, init) {
      init = init || {};
      const url = path.startsWith("http") ? path : API + path;
      const response = await send(url, Object.assign({ redirect: "follow" }, init, { headers: headers(init.headers) }));
      jar.absorb(response.headers);
      return response;
    }
    async function json(path, init) {
      const response = await raw(path, init);
      let body = null;
      try {
        body = await response.json();
      } catch (e) {}
      if (!response.ok) {
        const code = body && (body.status || body.error || body.detail) || "";
        throw new DeepAIError(String(code || "HTTP " + response.status), { status: response.status, code: String(code), body });
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
        const body = await post("/chat_attachments/upload", {}, file);
        if (!body.success || !body.attachment) throw new DeepAIError(body.error || "Upload failed", { body });
        return body.attachment;
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
        const response = await raw("/hacking_is_a_serious_crime", {
          method: "POST",
          body: packed.body,
          signal: options.signal,
          headers: { "Content-Type": packed.type, "api-key": apiKey() }
        });
        if (!response.ok) {
          let body = null;
          try {
            body = await response.json();
          } catch (e) {}
          const code = body && body.status || "";
          throw new DeepAIError(String(code || "HTTP " + response.status), { status: response.status, code: String(code), body });
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

  const state = { client: null, models: [], user: null, booting: null, abort: null, wisp: "", skip: [] };

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
    return state.models.map(m => ({ value: PREFIX + m.id, label: m.label, locked: m.locked }));
  }

  function defaultModel() {
    const list = catalog();
    if (!list.length) return null;
    const saved = store.get(MODEL_KEY);
    if (saved && list.some(m => m.value === saved)) return saved;
    const open = list.find(m => !m.locked || state.user);
    return (open || list[0]).value;
  }

  function rememberModel(value) {
    if (owns(value)) store.set(MODEL_KEY, value);
  }

  function syncUi() {
    const account = document.getElementById("aiDeepAIAccount");
    const input = document.getElementById("aiImageInput");
    if (account) {
      account.style.display = "inline-flex";
      account.textContent = state.user ? (state.user.email || state.user.username || "Account") : "Sign in";
      account.title = state.user ? "Sign out of DeepAI" : "Sign in to DeepAI";
    }
    if (input) input.removeAttribute("accept");
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
    say("Connecting to DeepAI…");
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
      user = await withTimeout(client.me(), 15000, "DeepAI did not respond");
    } catch (e) {}
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
      openLogin();
      return "DeepAI free limit reached. Sign in to keep going.";
    }
    if (code === "pro user out of credits" || code === "chat allowance unavailable") {
      return error.body && error.body.message ? error.body.message : "DeepAI allowance used up.";
    }
    return error && error.message || "DeepAI request failed";
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
    const found = entryFor(modelValue);
    if (found && found.locked && !state.user) {
      openLogin();
      throw new DeepAIError("Sign in to use " + found.label, { code: "locked" });
    }
    try {
      for await (const part of state.client.chat({
        model: modelValue.slice(PREFIX.length),
        messages: options.messages,
        attachments: options.attachments || [],
        sessionUuid: options.sessionUuid,
        webAccess: options.webAccess,
        signal: options.signal
      })) {
        if (part.type === "text") {
          handlers.content(part.value);
        } else if (part.value && part.value.task_id) {
          await followTask(part.value.task_id, options.signal, handlers);
        } else {
          const body = part.value || {};
          handlers.content(typeof body === "string" ? body : body.answer_text || body.output || JSON.stringify(body));
        }
      }
    } catch (error) {
      if (!(error instanceof DeepAIError) && !(error && error.name === "AbortError")) dropConnection();
      throw error;
    }
  }

  async function upload(file) {
    await ready();
    return state.client.upload(file);
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
    const history = chat.messages
      .filter(m => (m.role === "user" || m.role === "assistant") && m.content)
      .map(m => ({ role: m.role, content: m.content }));
    const files = [];
    chat.messages.forEach(m => (m.attachments || []).forEach(a => {
      if (!files.includes(a.uuid)) files.push(a.uuid);
    }));
    state.abort = new AbortController();
    try {
      await stream({
        model: owns(chat.model) ? chat.model : _aiSelectedModel,
        messages: history,
        attachments: files,
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
        const uploaded = await state.client.upload(file);
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

  function openLogin() {
    const dialog = document.getElementById("aiDeepAIDialog");
    if (!dialog || dialog.open) return;
    const err = document.getElementById("aiDeepAIError");
    if (err) err.textContent = "";
    dialog.showModal();
    const email = document.getElementById("aiDeepAIEmail");
    if (email) email.focus();
  }

  function bindUi() {
    const account = document.getElementById("aiDeepAIAccount");
    const dialog = document.getElementById("aiDeepAIDialog");
    const form = document.getElementById("aiDeepAIForm");
    const cancel = document.getElementById("aiDeepAICancel");
    if (account) {
      account.addEventListener("click", async () => {
        try {
          await boot();
        } catch (e) {
          _toast("DeepAI proxy unavailable");
          return;
        }
        if (state.user) {
          try {
            await state.client.logout();
          } catch (e) {}
          state.user = null;
          await refreshModels();
          _toast("Signed out of DeepAI");
        } else {
          openLogin();
        }
      });
    }
    if (cancel && dialog) cancel.addEventListener("click", () => dialog.close());
    if (form && dialog) {
      form.addEventListener("submit", async event => {
        event.preventDefault();
        const err = document.getElementById("aiDeepAIError");
        const submit = document.getElementById("aiDeepAISubmit");
        const email = document.getElementById("aiDeepAIEmail");
        const password = document.getElementById("aiDeepAIPassword");
        if (err) err.textContent = "";
        submit.disabled = true;
        submit.textContent = "Signing in…";
        try {
          await ready();
          state.user = await state.client.login(email.value.trim(), password.value);
          password.value = "";
          dialog.close();
          await refreshModels();
          _toast("Signed in to DeepAI");
        } catch (error) {
          if (err) err.textContent = error.message || "Sign in failed";
        } finally {
          submit.disabled = false;
          submit.textContent = "Sign in";
        }
      });
    }
    syncUi();
  }

  window.DeepAI = {
    owns,
    label,
    catalog,
    defaultModel,
    rememberModel,
    signedIn: () => !!state.user,
    syncUi,
    run,
    send,
    stream,
    upload,
    newSession: uuid,
    explain,
    stop,
    boot,
    openLogin,
    fileIcon: FILE_ICON
  };

  function start() {
    bindUi();
    setTimeout(() => connect(0), 200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
