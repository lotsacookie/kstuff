// Roblox sign-in through Singuloxy (sandstone ProxyFrame + libcurl over wisp), no service worker.
// The login page is shown in a ProxyFrame; the libcurl session keeps the cookies, and every later
// Roblox request (webbloxProxyFetch) goes through that same session.
(() => {
  let frame, bar, pendingSignIn, timer;
  const JAR_KEY = 'proxy_libcurl_jar';
  const AUTH_URL = 'https://users.roblox.com/v1/users/authenticated';
  try {
    localStorage.removeItem('cobalt-cookies');
    if (localStorage.getItem('webblox.launcher.theme') === 'Truffled') {
      localStorage.setItem('webblox.launcher.theme', 'Default');
    }
  } catch {}

  const hasSecurityCookie = () => {
    try { return /ROBLOSECURITY\t[^\s]{20,}/.test(localStorage.getItem(JAR_KEY) || ''); } catch { return false; }
  };
  const proxy = () => window.proxyTransport.start();
  const COOKIE_KEY = 'webblox.roblosecurity';
  const manualCookie = () => { try { return localStorage.getItem(COOKIE_KEY) || ''; } catch { return ''; } };
  const withCookie = headers => { const c = manualCookie(); return c ? { ...headers, cookie: '.ROBLOSECURITY=' + c } : headers; };
  const isSignedIn = async () => {
    try {
      const { libcurl } = await proxy();
      const res = await libcurl.fetch(AUTH_URL, { headers: withCookie({ accept: 'application/json' }) });
      return res.status === 200 && !!JSON.parse(await res.text()).id;
    } catch { return false; }
  };
  const closeFrame = () => {
    clearInterval(timer);
    if (frame) { frame.iframe.remove(); frame = null; }
    if (bar) { bar.remove(); bar = null; }
  };

  window.webbloxProxySignIn = (quiet = false) => {
    if (pendingSignIn) return pendingSignIn;
    const run = (async () => {
      if (await isSignedIn()) return true;
      if (quiet) return false;
      const st = await proxy();
      const { ProxyFrame } = st.sandstone.controller;
      frame = new ProxyFrame();
      frame.iframe.title = 'Sign in with Roblox';
      frame.iframe.className = 'session-prompt';
      frame.iframe.setAttribute('allow', 'autoplay; fullscreen; clipboard-write');
      Object.assign(frame.iframe.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', border: '0', background: '#fff', zIndex: 2147483000 });
      document.body.append(frame.iframe);
      await frame.wait_for_libcurl();
      frame.navigate_to('https://www.roblox.com/login').catch(e => console.warn('[signin] navigate failed', e));
      return new Promise((resolve, reject) => {
        const css = document.createElement('style');
        css.textContent = [
          '.wb-cookie{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483001;box-sizing:border-box;width:min(560px,calc(100% - 24px));padding:16px;display:flex;flex-direction:column;gap:12px;background:#232527;color:#f7f7f8;border:1px solid #393b3d;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.55);font:400 14px/20px "Builder Sans","HCo Gotham SSm",Gotham,"Helvetica Neue",Arial,sans-serif}',
          '.wb-cookie .wb-title{font-weight:700;font-size:16px;line-height:22px}',
          '.wb-cookie .wb-hint{color:#bdbebe;font-size:13px}',
          '.wb-cookie .wb-hint.wb-bad{color:#f6797f}',
          '.wb-cookie input{box-sizing:border-box;width:100%;height:40px;padding:0 12px;background:#191a1c;color:#f7f7f8;border:1px solid #5c5e60;border-radius:8px;font:inherit;outline:0}',
          '.wb-cookie input::placeholder{color:#8f9092}',
          '.wb-cookie input:hover{border-color:#8f9092}',
          '.wb-cookie input:focus{border-color:#f7f7f8}',
          '.wb-cookie .wb-row{display:flex;gap:8px;justify-content:flex-end}',
          '.wb-cookie button{height:36px;padding:0 20px;border:0;border-radius:8px;font:inherit;font-weight:600;cursor:pointer;background:#393b3d;color:#f7f7f8}',
          '.wb-cookie button:hover{background:#4a4c4e}',
          '.wb-cookie button.wb-primary{background:#335fff;color:#fff}',
          '.wb-cookie button.wb-primary:hover{background:#4d74ff}',
          '.wb-cookie button:disabled{opacity:.5;cursor:default}',
        ].join('\n');
        bar = document.createElement('div');
        bar.className = 'wb-cookie';
        bar.append(css);
        const title = document.createElement('div');
        title.className = 'wb-title'; title.textContent = 'Sign in with your cookie';
        const label = document.createElement('div');
        label.className = 'wb-hint';
        label.textContent = 'Puzzle failing? Paste your .ROBLOSECURITY cookie instead.';
        const input = document.createElement('input');
        input.type = 'password'; input.autocomplete = 'off'; input.spellcheck = false; input.placeholder = '.ROBLOSECURITY cookie';
        const go = document.createElement('button');
        go.type = 'button'; go.textContent = 'Use cookie'; go.className = 'wb-primary';
        const cancel = document.createElement('button');
        cancel.type = 'button'; cancel.textContent = 'Cancel';
        input.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
        go.onclick = async () => {
          const value = input.value.trim().replace(/^\.?ROBLOSECURITY=/i, '').replace(/^["']|["';]$/g, '');
          if (!value) return;
          go.disabled = true; label.className = 'wb-hint'; label.textContent = 'Checking cookie…';
          try { localStorage.setItem(COOKIE_KEY, value); } catch {}
          if (await isSignedIn()) { input.value = ''; closeFrame(); resolve(true); return; }
          try { localStorage.removeItem(COOKIE_KEY); } catch {}
          go.disabled = false; label.className = 'wb-hint wb-bad'; label.textContent = 'Roblox rejected that cookie. Paste a fresh one.';
        };
        cancel.onclick = () => { closeFrame(); reject(new Error('Sign-in cancelled.')); };
        const row = document.createElement('div');
        row.className = 'wb-row'; row.append(cancel, go);
        bar.append(title, label, input, row);
        document.body.append(bar);
        const started = Date.now();
        let busy = false;
        timer = setInterval(async () => {
          if (busy) return;
          if (Date.now() - started > 15 * 60000) { closeFrame(); return reject(new Error('Roblox sign-in timed out.')); }
          if (!hasSecurityCookie()) return;
          busy = true;
          try { if (await isSignedIn()) { closeFrame(); resolve(true); } }
          finally { busy = false; }
        }, 2000);
      });
    })();
    pendingSignIn = run.finally(() => { pendingSignIn = null; });
    return pendingSignIn;
  };

  window.webbloxProxyCookie = async raw => {
    const value = String(raw || '').trim().replace(/^\.?ROBLOSECURITY=/i, '').replace(/^["']|["';]$/g, '');
    if (!value) return false;
    try { localStorage.setItem(COOKIE_KEY, value); } catch { return false; }
    if (await isSignedIn()) { closeFrame(); return true; }
    try { localStorage.removeItem(COOKIE_KEY); } catch {}
    return false;
  };

  window.webbloxProxyResume = async () => {
    try { return await window.webbloxProxySignIn(true); } catch { return false; }
  };

  // Auth check used to run through the hub before EVERY request (doubling latency); remember it for a while.
  let signedAt = 0;
  const rawSignIn = window.webbloxProxySignIn;
  window.webbloxProxySignIn = (quiet) => {
    if (!pendingSignIn && signedAt && Date.now() - signedAt < 5 * 60000) return Promise.resolve(true);
    return rawSignIn(quiet).then(ok => { if (ok) signedAt = Date.now(); return ok; });
  };
  const PUBLIC_HOST = /(^|\.)rbxcdn\.com$/i;
  const fetchVia = async (libcurl, url, opts) => {
    try { return await libcurl.fetch(url, opts); }
    catch (e) {
      if (opts.signal && opts.signal.aborted) throw e;
      const st = await proxy();
      if (st.hub) { await st.hub.rotate(st.wisp, true).catch(() => {}); st.wisp = String(st.hub.wisp() || ''); }
      return (await proxy()).libcurl.fetch(url, opts);
    }
  };
  window.webbloxProxyFetch = async (url, init = {}) => {
    let isPublic = false;
    try { isPublic = PUBLIC_HOST.test(new URL(String(url)).hostname); } catch {}
    // Images/assets on the CDN are public: no sign-in wait, no cookie, straight through the net hub.
    if (!isPublic && !(await window.webbloxProxySignIn())) throw new Error('Not signed in to Roblox.');
    const { libcurl } = await proxy();
    const headers = {};
    for (const [k, v] of new Headers(init.headers || {})) {
      if (!['cookie', 'host', 'content-length'].includes(k.toLowerCase())) headers[k] = v;
    }
    let body = init.body ?? undefined;
    if (body instanceof Blob) body = await body.arrayBuffer();
    const method = init.method || 'GET';
    const res = await fetchVia(libcurl, String(url), { method, headers: isPublic ? headers : withCookie(headers), body, redirect: 'follow' });
    const out = new Headers();
    for (const [k, v] of res.headers.entries()) {
      if (!['set-cookie', 'content-encoding', 'content-length', 'transfer-encoding'].includes(k.toLowerCase())) out.append(k, v);
    }
    const empty = [204, 205, 304].includes(res.status) || method === 'HEAD';
    return new Response(empty ? null : await res.arrayBuffer(), { status: res.status, headers: out });
  };

  // Game-server and realtime connections (wss://*.qdmux.roblox.com, *.roblox.com) are WebSockets the engine opens itself.
  // A direct browser WebSocket skips the net hub, so route every Roblox-host WebSocket through the same libcurl/wisp session.
  (() => {
    const NativeWS = window.WebSocket;
    if (!NativeWS || NativeWS.__wbProxied) return;
    const RBX = /(^|\.)(roblox\.com|rbxcdn\.com|robloxlabs\.com|rbx\.com)$/i;
    const NEEDS_COOKIE = /(^|\.)roblox\.com$/i;
    const roblox = u => { try { return RBX.test(u.hostname) && /^(wss?|https?):$/.test(u.protocol); } catch { return false; } };
    const EVENTS = ['open', 'message', 'error', 'close'];
    class ProxiedWebSocket extends EventTarget {
      constructor(url, protocols) {
        super();
        const u = new URL(String(url));
        u.protocol = u.protocol === 'http:' ? 'ws:' : u.protocol === 'https:' ? 'wss:' : u.protocol;
        const list = protocols === undefined ? [] : Array.isArray(protocols) ? protocols.map(String) : [String(protocols)];
        this._u = u.href; this._state = 0; this._proto = ''; this._ext = ''; this._bin = 'blob'; this._queue = []; this._ws = null; this._h = {};
        this._connect(u, list, 0);
      }
      get url() { return this._u; }
      get readyState() { return this._state; }
      get bufferedAmount() { return 0; }
      get extensions() { return this._ext; }
      get protocol() { return this._proto; }
      get binaryType() { return this._bin; }
      set binaryType(v) { if (v === 'blob' || v === 'arraybuffer') this._bin = v; }
      _emit(ev) { try { const h = this._h[ev.type]; if (h) h.call(this, ev); } catch (e) { console.error('[ws]', e); } this.dispatchEvent(ev); }
      async _connect(u, list, attempt) {
        try {
          const st = await proxy();
          const headers = { origin: 'https://www.roblox.com' };
          if (NEEDS_COOKIE.test(u.hostname) && !/\.qdmux\.roblox\.com$/i.test(u.hostname)) Object.assign(headers, withCookie({}));
          const ws = new st.libcurl.WebSocket(u.href, list, { headers });
          ws.binaryType = 'arraybuffer';
          this._ws = ws;
          let opened = false;
          ws.onopen = () => {
            opened = true;
            this._proto = ws.protocol || ''; this._ext = ws.extensions || ''; this._state = 1;
            this._emit(new Event('open'));
            const q = this._queue; this._queue = [];
            for (const d of q) { try { ws.send(d); } catch {} }
            if (this._closeReq) ws.close(this._closeReq[0], this._closeReq[1]);
          };
          ws.onmessage = e => {
            let data = e.data;
            if (this._bin === 'blob' && data instanceof ArrayBuffer) data = new Blob([data]);
            this._emit(new MessageEvent('message', { data }));
          };
          ws.onerror = () => {
            if (!opened && attempt < 1 && this._state === 0) {
              // first attempt never connected: rotate the wisp server once and try again before reporting the failure
              (async () => { try { if (st.hub) { await st.hub.rotate(st.wisp, true).catch(() => {}); st.wisp = String(st.hub.wisp() || ''); } } catch {} this._connect(u, list, attempt + 1); })();
              ws.onclose = ws.onerror = ws.onopen = ws.onmessage = null;
              return;
            }
            this._emit(new Event('error'));
          };
          ws.onclose = e => {
            if (this._state === 3) return;
            this._state = 3;
            this._emit(new CloseEvent('close', { code: e.code || 1006, reason: e.reason || '', wasClean: !!e.wasClean }));
          };
        } catch (err) {
          console.warn('[ws] proxy connect failed', u.hostname, err && err.message);
          this._state = 3;
          this._emit(new Event('error'));
          this._emit(new CloseEvent('close', { code: 1006, reason: '', wasClean: false }));
        }
      }
      send(data) {
        if (this._state > 1) return;
        if (data instanceof Blob) { data.arrayBuffer().then(b => this.send(b)); return; }
        if (this._state === 0 || !this._ws) { this._queue.push(data); return; }
        this._ws.send(data);
      }
      close(code, reason) {
        if (this._state >= 2) return;
        if (this._state === 0) { this._closeReq = [code, reason]; this._state = 2; return; }
        this._state = 2;
        try { this._ws.close(code, reason || ''); } catch {}
      }
    }
    for (const ev of EVENTS) {
      Object.defineProperty(ProxiedWebSocket.prototype, 'on' + ev, { configurable: true, enumerable: true, get() { return this._h[ev] || null; }, set(fn) { this._h[ev] = typeof fn === 'function' ? fn : null; } });
    }
    Object.assign(ProxiedWebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
    Object.assign(ProxiedWebSocket.prototype, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
    try { if (NativeWS.prototype instanceof EventTarget) Object.setPrototypeOf(ProxiedWebSocket.prototype, NativeWS.prototype); } catch {}
    const Wrapped = new Proxy(NativeWS, {
      construct(target, args, newTarget) {
        let u = null;
        try { u = new URL(String(args[0])); } catch {}
        if (u && roblox(u)) { console.log('[hub] websocket via proxy', u.hostname); return new ProxiedWebSocket(...args); }
        return Reflect.construct(target, args, newTarget === Wrapped ? target : newTarget);
      },
      get(target, key, recv) { return key === '__wbProxied' ? true : Reflect.get(target, key, target); },
    });
    window.WebSocket = Wrapped;
  })();
})();
