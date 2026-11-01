(function () {
  const API = "https://api.deepai.org";
  const SITE = "https://deepai.org";
  const PREFIX = "deepai:";
  const COOKIE_KEY = "DAIJ";
  const WISP_KEY = "DAIW";
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

  async function loadSandstone() {
    for (const base of SANDSTONE_BASES) {
      try {
        return await import(base + SANDSTONE_DIST);
      } catch (e) {}
    }
    const code = await (await fetch("https://raw.githubusercontent.com/lotsacookie/Singuloxy/main/" + SANDSTONE_DIST)).text();
    return import(URL.createObjectURL(new Blob([code], { type: "text/javascript" })));
  }

  function wispUrl(entry) {
    const url = entry.includes("://") ? entry : "wss://" + entry + "/";
    return url.endsWith("/") ? url : url + "/";
  }

  function wispCandidates() {
    const out = [];
    const add = entry => {
      if (typeof entry === "string" && entry && !out.includes(entry)) out.push(entry);
    };
    let parent = null;
    try {
      parent = window.parent && window.parent !== window ? window.parent : null;
    } catch (e) {}
    add(store.get(WISP_KEY));
    if (parent) {
      try {
        add(parent.wlspServer);
      } catch (e) {}
    }
    add(window.wlspServer);
    const lists = [window.serverList];
    if (parent) {
      try {
        lists.push(parent.serverList);
      } catch (e) {}
    }
    lists.forEach(list => Array.isArray(list) && list.forEach(add));
    return out;
  }

  async function pickWisp() {
    const entries = wispCandidates();
    const budget = new Promise(resolve => setTimeout(() => resolve(null), 15000));
    const search = (async () => {
      for (let i = 0; i < entries.length; i += 6) {
        const wave = entries.slice(i, i + 6);
        const pings = await Promise.all(wave.map(entry => _wvTest(entry, 3000)));
        const alive = wave.map((entry, j) => ({ entry, ping: pings[j] })).filter(x => x.ping !== null).sort((a, b) => a.ping - b.ping);
        if (alive.length) return alive[0].entry;
      }
      return null;
    })();
    const hit = await Promise.race([search, budget]);
    const chosen = hit || entries[0];
    if (!chosen) throw new Error("no wisp server available");
    store.set(WISP_KEY, chosen);
    return wispUrl(chosen);
  }

  async function createProxy() {
    const sandstone = await loadSandstone();
    const entries = wispCandidates();
    if (entries.length) sandstone.network.set_websocket(wispUrl(entries[0]));
    for (let i = 0; i < 300 && !sandstone.libcurl.ready; i++) await new Promise(r => setTimeout(r, 100));
    if (!sandstone.libcurl.ready) throw new Error("libcurl did not load");
    const url = await pickWisp();
    sandstone.network.set_websocket(url);
    try {
      sandstone.network.set_wisp_pool([url]);
    } catch (e) {}
    return { fetch: (target, init) => sandstone.libcurl.fetch(target, init), wisp: url };
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

  const state = { client: null, models: [], user: null, booting: null, abort: null, wisp: "" };

  function owns(id) {
    return typeof id === "string" && id.indexOf(PREFIX) === 0;
  }

  function label(id) {
    const model = state.models.find(m => PREFIX + m.id === id);
    return model ? model.label : id.replace(PREFIX, "");
  }

  function mergeGroups(grouped) {
    if (!state.models.length) return grouped;
    return Object.assign({}, grouped, { deepai: state.models.map(m => PREFIX + m.id) });
  }

  function syncUi() {
    const sel = document.getElementById("aiModelSelect");
    const account = document.getElementById("aiDeepAIAccount");
    const input = document.getElementById("aiImageInput");
    const active = sel && owns(sel.value);
    if (account) {
      account.style.display = active ? "inline-flex" : "none";
      account.textContent = state.user ? (state.user.email || state.user.username || "Account") : "Sign in";
      account.title = state.user ? "Sign out of DeepAI" : "Sign in to DeepAI";
    }
    if (input) {
      if (active) input.removeAttribute("accept");
      else input.setAttribute("accept", "image/png,image/jpeg,image/webp,image/gif");
    }
  }

  function rerender() {
    if (typeof _renderModelSelect === "function" && document.getElementById("aiModelSelect")) {
      _renderModelSelect(_aiModelsGrouped);
    }
  }

  function boot() {
    if (state.booting) return state.booting;
    state.booting = (async () => {
      const proxy = await createProxy();
      state.wisp = proxy.wisp;
      state.client = createClient(proxy.fetch);
      const results = await Promise.allSettled([state.client.listModels(), state.client.me()]);
      if (results[0].status === "fulfilled") state.models = results[0].value;
      if (results[1].status === "fulfilled") state.user = results[1].value;
      if (!state.models.length) throw results[0].reason || new Error("no models");
      rerender();
      syncUi();
    })().catch(error => {
      state.booting = null;
      console.warn("[deepai] boot failed", error);
      throw error;
    });
    return state.booting;
  }

  function ensureChat() {
    if (!_aiCurrentChatId) _aiCurrentChatId = "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const chat = _getChat(_aiCurrentChatId);
    chat.provider = "deepai";
    chat.sessionUuid = chat.sessionUuid || uuid();
    if (owns(_aiSelectedModel)) chat.model = _aiSelectedModel;
    return chat;
  }

  function describe(error) {
    const code = error.code || "";
    if (code === "anonymous try it exceeded") {
      openLogin();
      return "DeepAI free limit reached. Sign in to keep going.";
    }
    if (code === "pro user out of credits" || code === "chat allowance unavailable") {
      return error.body && error.body.message ? error.body.message : "DeepAI allowance used up.";
    }
    return error.message || "DeepAI request failed";
  }

  async function followTask(taskId, signal) {
    let seenThinking = 0;
    let seenAnswer = 0;
    for (let i = 0; i < 400; i++) {
      if (signal.aborted) throw new DOMException("aborted", "AbortError");
      const data = await state.client.taskStatus(taskId);
      const thinking = data.thinking_text || "";
      const answer = data.answer_text || "";
      if (thinking.length > seenThinking) {
        _onStreamThinking(thinking.slice(seenThinking));
        seenThinking = thinking.length;
      }
      if (answer.length > seenAnswer) {
        _onStreamContent(answer.slice(seenAnswer));
        seenAnswer = answer.length;
      }
      const status = String(data.status || "");
      if (status === "COMPLETED") return;
      if (/fail|error|cancel/i.test(status)) throw new DeepAIError(status, { body: data });
      await new Promise(r => setTimeout(r, 1500));
    }
    throw new DeepAIError("DeepAI took too long to answer");
  }

  async function run(attachments) {
    await boot();
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
      for await (const part of state.client.chat({
        model: (owns(chat.model) ? chat.model : _aiSelectedModel).slice(PREFIX.length),
        messages: history,
        attachments: files,
        sessionUuid: chat.sessionUuid,
        webAccess: _aiWebSearchEnabled,
        signal: state.abort.signal
      })) {
        if (part.type === "text") {
          _onStreamContent(part.value);
        } else if (part.value && part.value.task_id) {
          await followTask(part.value.task_id, state.abort.signal);
        } else {
          const body = part.value || {};
          const text = typeof body === "string" ? body : body.answer_text || body.output || JSON.stringify(body);
          _onStreamContent(text);
        }
      }
      _onStreamDone();
    } catch (error) {
      if (error && error.name === "AbortError") {
        _onStreamDone();
      } else {
        _onStreamError(describe(error));
      }
    } finally {
      state.abort = null;
    }
  }

  async function send(text, file) {
    await boot();
    const attachments = [];
    if (file) {
      _setAIStatus("Uploading " + file.name + "…");
      try {
        const uploaded = await state.client.upload(file);
        attachments.push({ uuid: uploaded.uuid, name: file.name });
      } finally {
        _setAIStatus("");
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
    const sel = document.getElementById("aiModelSelect");
    const account = document.getElementById("aiDeepAIAccount");
    const dialog = document.getElementById("aiDeepAIDialog");
    const form = document.getElementById("aiDeepAIForm");
    const cancel = document.getElementById("aiDeepAICancel");
    if (sel) sel.addEventListener("change", syncUi);
    if (account) {
      account.addEventListener("click", async () => {
        try {
          await boot();
        } catch (e) {
          _toast("DeepAI proxy unavailable");
          return;
        }
        if (state.user) {
          await state.client.logout();
          state.user = null;
          syncUi();
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
          await boot();
          state.user = await state.client.login(email.value.trim(), password.value);
          password.value = "";
          dialog.close();
          syncUi();
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

  window.DeepAI = { owns, label, mergeGroups, syncUi, run, send, stop, boot, openLogin, fileIcon: FILE_ICON };

  function start() {
    bindUi();
    setTimeout(() => boot().catch(() => {}), 1200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
