/* Sandbox / CrossOrigin isolate: frame-side shim.
 * Injected by the parent (Assets/js/coi-isolate.js) before anything else in coi.html, together with
 * net-client.js and a window.__COI_STORE snapshot of the parent's localStorage. The frame runs in an
 * opaque origin, so it has no storage, cookies or direct access to the parent. This shim:
 *   - sets window.__COI so every script can tell it is proxied (guards in net-hub.js, wisp.js, ...)
 *   - gives the page localStorage / sessionStorage / document.cookie that start from the parent's
 *     settings (theme, font, account, ...) and forward writes to the parent so they persist
 *   - exposes window.__coiCall(type, data) (RPC to the parent) and window.kNetDirect (net hub requests,
 *     rotate, transport, websockets are all sent to the parent, which owns wisp + sandstone) */
(function () {
  if (window.__COI) return;
  window.__COI = true;
  var parent = null;
  try { parent = window.parent && window.parent !== window ? window.parent : null; } catch (e) {}
  var cfg = window.__COI_CFG || {};

  /* ---- RPC ---- */
  var seq = 0, pending = {}, wsMap = {};
  function post(msg, transfer) { try { parent && parent.postMessage(msg, '*', transfer || []); } catch (e) {} }
  window.__coiCall = function (type, data, ms) {
    return new Promise(function (resolve, reject) {
      if (!parent) return reject(new Error('no parent'));
      var id = 'c' + (++seq) + '-' + Date.now();
      var t = setTimeout(function () { delete pending[id]; reject(new Error(type + ' timed out')); }, ms || 30000);
      pending[id] = function (d) { clearTimeout(t); d.ok ? resolve(d.data) : reject(new Error(d.error || 'failed')); };
      post({ type: 'kstuff-coi:' + type, id: id, data: data });
    });
  };
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d !== 'object' || e.source !== parent) return;
    if (d.type === 'kstuff-coi:res') { var p = pending[d.id]; if (p) { delete pending[d.id]; p(d); } }
    else if (d.type === 'kstuff-coi:ws-event') { var w = wsMap[d.id]; if (w) w._ev(d); }
  });

  /* ---- Storage ---- */
  function makeStorage(seed, onWrite) {
    var m = new Map(Object.keys(seed || {}).map(function (k) { return [k, String(seed[k])]; }));
    var api = {
      getItem: function (k) { k = String(k); return m.has(k) ? m.get(k) : null; },
      setItem: function (k, v) { k = String(k); v = String(v); m.set(k, v); onWrite && onWrite('set', k, v); },
      removeItem: function (k) { k = String(k); m.delete(k); onWrite && onWrite('remove', k); },
      clear: function () { m.clear(); onWrite && onWrite('clear'); },
      key: function (i) { return Array.from(m.keys())[i] == null ? null : Array.from(m.keys())[i]; }
    };
    return new Proxy(api, {
      get: function (t, p) {
        if (p === 'length') return m.size;
        if (typeof p === 'symbol') return undefined;
        if (p in t) return t[p];
        return t.getItem(p) === null ? undefined : t.getItem(p);
      },
      set: function (t, p, v) { t.setItem(p, v); return true; },
      deleteProperty: function (t, p) { t.removeItem(p); return true; },
      has: function (t, p) { return p in t || m.has(String(p)); },
      ownKeys: function () { return Array.from(m.keys()); },
      getOwnPropertyDescriptor: function (t, p) { return m.has(String(p)) ? { value: m.get(String(p)), writable: true, enumerable: true, configurable: true } : undefined; }
    });
  }
  var local = makeStorage(window.__COI_STORE, function (op, k, v) {
    post({ type: 'kstuff-coi:storage-' + (op === 'set' ? 'set' : op === 'remove' ? 'remove' : 'clear'), key: k, value: v });
  });
  var session = makeStorage({}, null);
  try { Object.defineProperty(window, 'localStorage', { configurable: true, get: function () { return local; } }); } catch (e) {}
  try { Object.defineProperty(window, 'sessionStorage', { configurable: true, get: function () { return session; } }); } catch (e) {}

  /* ---- document.cookie (in-memory; opaque origins cannot use real cookies) ---- */
  var jar = {};
  try {
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: function () { return Object.keys(jar).map(function (k) { return k + '=' + jar[k]; }).join('; '); },
      set: function (s) {
        var kv = String(s).split(';')[0], i = kv.indexOf('=');
        if (i < 1) return;
        var k = kv.slice(0, i).trim(), v = kv.slice(i + 1).trim();
        if (/;\s*(max-age=0|expires=[^;]*19(6|7)\d)/i.test(s)) delete jar[k]; else jar[k] = v;
      }
    });
  } catch (e) {}

  /* ---- Hash links: <base> would turn "#x" into a navigation away from the srcdoc ---- */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    e.preventDefault();
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    var el = id && document.getElementById(id);
    if (el && el.scrollIntoView) el.scrollIntoView();
  }, true);

  /* ---- WebSocket over the parent's libcurl ---- */
  function CoiWebSocket(url, protocols) {
    var self = this;
    this.url = String(url);
    this.readyState = 0;
    this.binaryType = 'blob';
    this.protocol = '';
    this.extensions = '';
    this.bufferedAmount = 0;
    this._l = {};
    this._id = 'w' + (++seq) + '-' + Date.now();
    wsMap[this._id] = this;
    post({ type: 'kstuff-coi:ws-open', id: this._id, url: this.url, protocols: protocols });
    ['open', 'message', 'close', 'error'].forEach(function (n) {
      Object.defineProperty(self, 'on' + n, { get: function () { return self['_on' + n] || null; }, set: function (f) { self['_on' + n] = f; } });
    });
  }
  CoiWebSocket.CONNECTING = 0; CoiWebSocket.OPEN = 1; CoiWebSocket.CLOSING = 2; CoiWebSocket.CLOSED = 3;
  CoiWebSocket.prototype.addEventListener = function (n, f) { (this._l[n] = this._l[n] || []).push(f); };
  CoiWebSocket.prototype.removeEventListener = function (n, f) { this._l[n] = (this._l[n] || []).filter(function (x) { return x !== f; }); };
  CoiWebSocket.prototype._emit = function (n, ev) {
    var h = this['_on' + n]; if (h) try { h.call(this, ev); } catch (e) {}
    (this._l[n] || []).slice().forEach(function (f) { try { f.call(this, ev); } catch (e) {} }, this);
  };
  CoiWebSocket.prototype._ev = function (d) {
    if (d.ev === 'open') { this.readyState = 1; this.protocol = d.protocol || ''; this._emit('open', new Event('open')); }
    else if (d.ev === 'message') {
      var data = d.data;
      if (data instanceof ArrayBuffer && this.binaryType === 'blob') data = new Blob([data]);
      this._emit('message', new MessageEvent('message', { data: data }));
    } else if (d.ev === 'error') this._emit('error', new Event('error'));
    else if (d.ev === 'close') {
      this.readyState = 3; delete wsMap[this._id];
      var ev = new Event('close'); ev.code = d.code || 1006; ev.reason = d.reason || ''; ev.wasClean = !!d.clean;
      this._emit('close', ev);
    }
  };
  CoiWebSocket.prototype.send = function (data) {
    if (this.readyState !== 1) throw new DOMException('WebSocket is not open', 'InvalidStateError');
    var id = this._id;
    if (typeof data === 'string') return post({ type: 'kstuff-coi:ws-send', id: id, data: data });
    if (data instanceof Blob) return data.arrayBuffer().then(function (b) { post({ type: 'kstuff-coi:ws-send', id: id, data: b }, [b]); });
    var b = ArrayBuffer.isView(data) ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) : data.slice(0);
    post({ type: 'kstuff-coi:ws-send', id: id, data: b }, [b]);
  };
  CoiWebSocket.prototype.close = function (code, reason) {
    if (this.readyState >= 2) return;
    this.readyState = 2;
    post({ type: 'kstuff-coi:ws-close', id: this._id, code: code, reason: reason });
  };

  /* ---- Net hub: same surface as net-hub.js's window.kNetDirect, but every call goes to the parent ---- */
  var cur = cfg.wisp || null, mode = cfg.transport || 'epoxy';
  window.kTransportMode = mode;
  window.kNetDirect = {
    fetch: function (url, init) { return window.kNet.fetch(String(url), init); },
    ready: function () { return window.kNet.ready().then(function (r) { if (r && r.wisp) cur = r.wisp; return cur; }); },
    rotate: function (bad, soft) { return window.kNet.rotate(bad, soft).then(function (r) { if (r && r.wisp) cur = r.wisp; return cur; }); },
    websocket: function (url, protocols) { return Promise.resolve(new CoiWebSocket(url, protocols)); },
    libcurl: function () {
      return Promise.resolve({
        fetch: function (url, init) { return window.kNetDirect.fetch(url, init); },
        WebSocket: CoiWebSocket
      });
    },
    wisp: function () { return cur; },
    transport: function () { return mode; },
    setTransport: function (m) {
      mode = m === 'libcurl' ? 'libcurl' : 'epoxy';
      window.kTransportMode = mode;
      window.__coiCall('set-transport', { mode: mode }).catch(function () {});
      return mode;
    },
    __refresh: function () {
      return window.__coiCall('wisp-info').then(function (r) { if (r) { cur = r.wisp || cur; if (r.transport) { mode = r.transport; window.kTransportMode = mode; } } return r; });
    }
    /* no raw sandstone()/libcurl(): those objects cannot cross postMessage. Pages that need them
       (Blox, Scramjet) feature-detect sandstone() and fall back. */
  };
  window.CoiWebSocket = CoiWebSocket;

  /* ====================================================================================
   * Page frames (the srcdoc iframes this page creates: Games, Music, Browser, ...).
   * A sandboxed frame's children inherit the sandbox, so each page frame is its own opaque origin and can
   * no longer read this page's DOM, storage or kNetDirect. Every srcdoc set here is therefore prefixed with
   * childBoot(): it gives the page the same theme/font, storage and net access over postMessage, and a
   * stand-in window.parent so pages that read the theme from the parent keep working.
   * ==================================================================================== */
  function childBoot(seed, theme) {
    var real = null;
    try { real = window.parent; } catch (e) {}
    if (!real || real === window || window.__coiRealParent) return;
    window.__coiRealParent = real;
    var seq = 0, pend = {}, T = theme || { vars: {} };
    function post(m, t) { try { real.postMessage(m, '*', t || []); } catch (e) {} }

    function makeStorage(init, onWrite) {
      var m = new Map(Object.keys(init || {}).map(function (k) { return [k, String(init[k])]; }));
      var api = {
        getItem: function (k) { k = String(k); return m.has(k) ? m.get(k) : null; },
        setItem: function (k, v) { k = String(k); v = String(v); m.set(k, v); onWrite && onWrite('set', k, v); },
        removeItem: function (k) { k = String(k); m.delete(k); onWrite && onWrite('remove', k); },
        clear: function () { m.clear(); onWrite && onWrite('clear'); },
        key: function (i) { var a = Array.from(m.keys()); return a[i] == null ? null : a[i]; }
      };
      return new Proxy(api, {
        get: function (t, p) { if (p === 'length') return m.size; if (typeof p === 'symbol') return undefined; if (p in t) return t[p]; var v = t.getItem(p); return v === null ? undefined : v; },
        set: function (t, p, v) { t.setItem(p, v); return true; },
        deleteProperty: function (t, p) { t.removeItem(p); return true; },
        has: function (t, p) { return p in t || m.has(String(p)); },
        ownKeys: function () { return Array.from(m.keys()); },
        getOwnPropertyDescriptor: function (t, p) { return m.has(String(p)) ? { value: m.get(String(p)), writable: true, enumerable: true, configurable: true } : undefined; }
      });
    }
    var ls = makeStorage(seed, function (op, k, v) { post({ type: 'kstuff-coi-child:storage', op: op, key: k, value: v }); });
    var ss = makeStorage({}, null);
    try { Object.defineProperty(window, 'localStorage', { configurable: true, get: function () { return ls; } }); } catch (e) {}
    try { Object.defineProperty(window, 'sessionStorage', { configurable: true, get: function () { return ss; } }); } catch (e) {}

    function call(name, ms) {
      return new Promise(function (resolve, reject) {
        var id = 'k' + (++seq) + '-' + Date.now();
        var t = setTimeout(function () { delete pend[id]; reject(new Error(name + ' timed out')); }, ms || 8000);
        pend[id] = function (d) { clearTimeout(t); d.ok ? resolve(d.data) : reject(new Error(d.error || 'failed')); };
        post({ type: 'kstuff-coi-child:call', id: id, name: name });
      });
    }

    // Stand-in parent: the theme comes from a snapshot the isolated page keeps fresh; postMessage is forwarded.
    function gcs() {
      return {
        getPropertyValue: function (n) { return (T.vars && T.vars[n]) || ''; },
        backgroundColor: T.bg || '', color: T.color || '', fontFamily: (T.vars && T.vars['--font']) || T.font || ''
      };
    }
    var el = { style: {}, className: '', classList: { contains: function () { return false; } }, getAttribute: function () { return null; } };
    var fake = {
      __isCoiParent: true,
      __COI: true,
      document: { body: el, documentElement: el },
      getComputedStyle: gcs,
      postMessage: function (m, o, t) { post(m, t); },
      addEventListener: function () {}, removeEventListener: function () {},
      movieHosts: function () { return call('movieHosts', 10000); }
    };
    try { Object.defineProperty(window, 'parent', { configurable: true, get: function () { return fake; } }); } catch (e) {}

    // Net hub for page frames (NOW, VMs, Singuloxy, ...): they look for window.parent.kNetDirect, so the stand-in
    // parent carries one. Every call is relayed (postMessage) through the isolated page to the real parent hub.
    var nseq = 0, npend = {}, wsm = {}, curWisp = null, tmode = 'epoxy';
    function nOk(d) { if (d && d.wisp) curWisp = d.wisp; return d; }
    function nfetch(url, init) {
      init = init || {};
      var sig = init.signal;
      if (sig && sig.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
      var h = {};
      if (init.headers) {
        if (typeof Headers !== 'undefined' && init.headers instanceof Headers) init.headers.forEach(function (v, k) { h[k] = v; });
        else Object.keys(init.headers).forEach(function (k) { h[k] = init.headers[k]; });
      }
      return Promise.resolve().then(function () {
        var b = init.body, o = { method: init.method || 'GET', redirect: init.redirect || 'follow', headers: h }, tr = [];
        if (b == null) return { o: o, tr: tr };
        if (typeof b === 'string') { o.body = b; return { o: o, tr: tr }; }
        if (b instanceof ArrayBuffer) { o.body = b.slice(0); tr.push(o.body); return { o: o, tr: tr }; }
        if (ArrayBuffer.isView(b)) { o.body = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); tr.push(o.body); return { o: o, tr: tr }; }
        var r = new Request(String(url), { method: 'POST', body: b }), ct = r.headers.get('content-type');
        if (ct && !Object.keys(h).some(function (k) { return k.toLowerCase() === 'content-type'; })) h['Content-Type'] = ct;
        return r.arrayBuffer().then(function (ab) { o.body = ab; tr.push(ab); return { o: o, tr: tr }; });
      }).then(function (p) {
        return new Promise(function (resolve, reject) {
          var id = 'n' + (++nseq) + '-' + Date.now();
          var onAbort = function () { clearTimeout(tm); delete npend[id]; post({ type: 'kstuff-net:abort', id: id }); reject(new DOMException('Aborted', 'AbortError')); };
          if (sig) sig.addEventListener('abort', onAbort, { once: true });
          // guard: a reply lost on the way (frame reloaded, hub restarted) must fail, not hang forever
          var tm = setTimeout(function () {
            delete npend[id]; post({ type: 'kstuff-net:abort', id: id });
            if (sig) sig.removeEventListener('abort', onAbort);
            reject(new TypeError('net hub timed out (no reply from parent)'));
          }, 120000);
          npend[id] = function (d) {
            clearTimeout(tm);
            if (sig) sig.removeEventListener('abort', onAbort);
            if (!d.ok) return reject(new TypeError(d.error || 'network error'));
            var st = d.status, res;
            try { res = new Response({ 101: 1, 204: 1, 205: 1, 304: 1 }[st] ? null : d.body, { status: st, statusText: d.statusText }); }
            catch (e) { res = new Response(null, { status: st >= 200 && st <= 599 ? st : 200 }); }
            var hs = new Headers();
            (d.headers || []).forEach(function (kv) { try { hs.append(kv[0], kv[1]); } catch (e) {} });
            try { Object.defineProperty(res, 'headers', { value: hs }); } catch (e) {}
            try { Object.defineProperty(res, 'url', { value: d.url || String(url) }); } catch (e) {}
            resolve(res);
          };
          post({ type: 'kstuff-net:fetch', id: id, url: String(url), init: p.o }, p.tr);
        });
      });
    }
    function nrpc(msg, ms) {
      return new Promise(function (resolve, reject) {
        var id = 'n' + (++nseq) + '-' + Date.now();
        var t = setTimeout(function () { delete npend[id]; reject(new Error('net hub timed out')); }, ms);
        npend[id] = function (d) { clearTimeout(t); d && d.error ? reject(new Error(d.error)) : resolve(nOk(d)); };
        msg.id = id; post(msg);
      });
    }
    function ChildWS(url, protocols) {
      var self = this;
      this.url = String(url); this.readyState = 0; this.binaryType = 'blob'; this.protocol = ''; this.extensions = ''; this.bufferedAmount = 0; this._l = {};
      this._id = 'cw' + (++nseq) + '-' + Date.now();
      wsm[this._id] = this;
      ['open', 'message', 'close', 'error'].forEach(function (n) {
        Object.defineProperty(self, 'on' + n, { get: function () { return self['_on' + n] || null; }, set: function (f) { self['_on' + n] = f; } });
      });
      post({ type: 'kstuff-coi-child:ws-open', id: this._id, url: this.url, protocols: protocols });
    }
    ChildWS.CONNECTING = 0; ChildWS.OPEN = 1; ChildWS.CLOSING = 2; ChildWS.CLOSED = 3;
    ChildWS.prototype.addEventListener = function (n, f) { (this._l[n] = this._l[n] || []).push(f); };
    ChildWS.prototype.removeEventListener = function (n, f) { this._l[n] = (this._l[n] || []).filter(function (x) { return x !== f; }); };
    ChildWS.prototype._emit = function (n, ev) {
      var h = this['_on' + n]; if (h) try { h.call(this, ev); } catch (e) {}
      (this._l[n] || []).slice().forEach(function (f) { try { f.call(this, ev); } catch (e) {} }, this);
    };
    ChildWS.prototype._ev = function (d) {
      if (d.ev === 'open') { this.readyState = 1; this.protocol = d.protocol || ''; this._emit('open', new Event('open')); }
      else if (d.ev === 'message') { var x = d.data; if (x instanceof ArrayBuffer && this.binaryType === 'blob') x = new Blob([x]); this._emit('message', new MessageEvent('message', { data: x })); }
      else if (d.ev === 'error') this._emit('error', new Event('error'));
      else if (d.ev === 'close') { this.readyState = 3; delete wsm[this._id]; var ev = new Event('close'); ev.code = d.code || 1006; ev.reason = d.reason || ''; ev.wasClean = !!d.clean; this._emit('close', ev); }
    };
    ChildWS.prototype.send = function (data) {
      if (this.readyState !== 1) throw new DOMException('WebSocket is not open', 'InvalidStateError');
      var id = this._id;
      if (typeof data === 'string') return post({ type: 'kstuff-coi-child:ws-send', id: id, data: data });
      if (data instanceof Blob) return data.arrayBuffer().then(function (b) { post({ type: 'kstuff-coi-child:ws-send', id: id, data: b }, [b]); });
      var b = ArrayBuffer.isView(data) ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) : data.slice(0);
      post({ type: 'kstuff-coi-child:ws-send', id: id, data: b }, [b]);
    };
    ChildWS.prototype.close = function (code, reason) {
      if (this.readyState >= 2) return;
      this.readyState = 2;
      post({ type: 'kstuff-coi-child:ws-close', id: this._id, code: code, reason: reason });
    };
    var hubApi = {
      __coiChild: true,
      fetch: nfetch,
      ready: function () { return nrpc({ type: 'kstuff-net:ready' }, 40000).then(function () { return curWisp; }); },
      rotate: function (bad, soft) { return nrpc({ type: 'kstuff-net:rotate', bad: bad, soft: !!soft }, 20000).then(function () { return curWisp; }, function () { return curWisp; }); },
      websocket: function (url, protocols) { return Promise.resolve(new ChildWS(url, protocols)); },
      libcurl: function () { return Promise.resolve({ fetch: nfetch, WebSocket: ChildWS }); },
      wisp: function () { return curWisp; },
      transport: function () { return tmode; },
      setTransport: function (m) { tmode = m === 'libcurl' ? 'libcurl' : 'epoxy'; return tmode; }
    };
    fake.kNetDirect = hubApi;
    try { if (!window.kNetDirect) window.kNetDirect = hubApi; } catch (e) {}
    window.__coiChildWS = wsm;

    // Registered before the page's own scripts: refresh the snapshot, then replay "theme-updated" once.
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (e.source !== real) return;
      if (d === 'theme-updated' && !e.__coiReplay) { e.stopImmediatePropagation(); post({ type: 'kstuff-coi-child:theme-get' }); return; }
      if (!d || typeof d !== 'object') return;
      if (typeof d.type === 'string' && d.type.indexOf('kstuff-net:') === 0) {
        var np = npend[d.id]; if (np) { delete npend[d.id]; np(d); }
        return;
      }
      if (d.type === 'kstuff-coi-child:ws-event') { var cw = wsm[d.id]; if (cw) cw._ev(d); return; }
      if (d.type === 'kstuff-coi-child:theme') {
        T = d.theme || T;
        var ev = new MessageEvent('message', { data: 'theme-updated', source: real });
        ev.__coiReplay = true;
        window.dispatchEvent(ev);
      } else if (d.type === 'kstuff-coi-child:res') {
        var p = pend[d.id]; if (p) { delete pend[d.id]; p(d); }
      }
    });
  }

  var CHILD_MARK = '<!--coi-child-->';
  var safeJson = function (v) { return JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'); };

  function storeSnapshot() {
    var out = {};
    try {
      for (var i = 0; i < local.length; i++) {
        var k = local.key(i), v = local.getItem(k);
        if (k && v != null && v.length <= 50000) out[k] = v;
      }
    } catch (e) {}
    return out;
  }

  var THEME_VARS = ['--bg-color', '--background', '--text-color', '--font', '--nav-bg', '--card-bg', '--hairline', '--ring', '--tint', '--tint-strong', '--line', '--line-strong', '--glow', '--lift', '--fg', '--fr'];
  function themeSnapshot() {
    var names = {};
    THEME_VARS.forEach(function (n) { names[n] = 1; });
    var st = document.getElementById('dynamic-themes-style');
    if (st) (st.textContent.match(/--[\w-]+(?=\s*:)/g) || []).forEach(function (n) { names[n] = 1; });
    var vars = {}, cs = null;
    try { cs = getComputedStyle(document.body); } catch (e) {}
    if (cs) Object.keys(names).forEach(function (n) { var v = (cs.getPropertyValue(n) || '').trim(); if (v) vars[n] = v; });
    if (!vars['--font']) { var f = (document.documentElement.style.getPropertyValue('--font') || '').trim(); if (f) vars['--font'] = f; }
    return { vars: vars, bg: cs ? cs.backgroundColor : '', color: cs ? cs.color : '', font: cs ? cs.fontFamily : '' };
  }

  function childHtml(html) {
    if (typeof html !== 'string' || html.indexOf(CHILD_MARK) !== -1) return html;
    var code = '(' + childBoot.toString() + ')(' + safeJson(storeSnapshot()) + ',' + safeJson(themeSnapshot()) + ');';
    var inj = CHILD_MARK + '<script>' + code.replace(/<\/script/gi, '<\\/script') + '<\/script>';
    var m = /<head(\s[^>]*)?>/i.exec(html) || /<html(\s[^>]*)?>/i.exec(html) || /^\s*<!doctype[^>]*>/i.exec(html);
    return m ? html.slice(0, m.index + m[0].length) + inj + html.slice(m.index + m[0].length) : inj + html;
  }
  window.__coiChildHtml = childHtml;

  try {
    var sd = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc');
    if (sd && sd.set) Object.defineProperty(HTMLIFrameElement.prototype, 'srcdoc', {
      configurable: true, enumerable: sd.enumerable, get: sd.get,
      set: function (v) { sd.set.call(this, typeof v === 'string' ? childHtml(v) : v); }
    });
  } catch (e) {}

  function isChild(src) {
    try { return !!src && Array.prototype.some.call(document.querySelectorAll('iframe'), function (f) { return f.contentWindow === src; }); }
    catch (e) { return false; }
  }

  /* Messages from page frames: theme requests, storage writes, small calls, and the net hub relay. */
  var relay = {}, childWs = {};
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d !== 'object' || typeof d.type !== 'string' || e.source === parent || !isChild(e.source)) return;
    var src = e.source;
    function reply(m, t) { try { src.postMessage(m, '*', t || []); } catch (x) {} }

    if (d.type === 'kstuff-coi-child:theme-get') return reply({ type: 'kstuff-coi-child:theme', theme: themeSnapshot() });
    if (d.type === 'kstuff-coi-child:storage') {
      if (d.op === 'set' && typeof d.key === 'string') local.setItem(d.key, d.value);
      else if (d.op === 'remove' && typeof d.key === 'string') local.removeItem(d.key);
      else if (d.op === 'clear') local.clear();
      return;
    }
    if (d.type === 'kstuff-coi-child:call') {
      if (d.name === 'movieHosts' && typeof window.movieHosts === 'function') {
        Promise.resolve(window.movieHosts()).then(
          function (r) { reply({ type: 'kstuff-coi-child:res', id: d.id, ok: true, data: r }); },
          function (x) { reply({ type: 'kstuff-coi-child:res', id: d.id, ok: false, error: String(x && x.message || x) }); });
      } else reply({ type: 'kstuff-coi-child:res', id: d.id, ok: false, error: 'unknown call' });
      return;
    }

    // websockets for page frames: open them here (CoiWebSocket -> parent libcurl) and mirror events back
    if (d.type === 'kstuff-coi-child:ws-open' && typeof d.url === 'string' && /^wss?:\/\//i.test(d.url)) {
      var cws = new CoiWebSocket(d.url, d.protocols);
      cws.binaryType = 'arraybuffer';
      childWs[d.id] = cws;
      cws.addEventListener('open', function () { reply({ type: 'kstuff-coi-child:ws-event', id: d.id, ev: 'open', protocol: cws.protocol }); });
      cws.addEventListener('message', function (ev) { var x = ev.data; reply({ type: 'kstuff-coi-child:ws-event', id: d.id, ev: 'message', data: x }, x instanceof ArrayBuffer ? [x] : []); });
      cws.addEventListener('error', function () { reply({ type: 'kstuff-coi-child:ws-event', id: d.id, ev: 'error' }); });
      cws.addEventListener('close', function (ev) { delete childWs[d.id]; reply({ type: 'kstuff-coi-child:ws-event', id: d.id, ev: 'close', code: ev.code, reason: ev.reason, clean: ev.wasClean }); });
      return;
    }
    if (d.type === 'kstuff-coi-child:ws-send') { var sw = childWs[d.id]; if (sw && sw.readyState === 1) try { sw.send(d.data); } catch (x) {} return; }
    if (d.type === 'kstuff-coi-child:ws-close') { var cw2 = childWs[d.id]; if (cw2) try { cw2.close(d.code, d.reason); } catch (x) {} return; }

    // net hub: forward to the real parent, remapping ids so replies find their way back
    if (d.type.indexOf('kstuff-net:') !== 0) return;
    if (d.type === 'kstuff-net:hello') return reply({ type: 'kstuff-net:hello-ack', wisp: cur });
    if (d.type === 'kstuff-net:abort') {
      Object.keys(relay).forEach(function (n) { if (relay[n].src === src && relay[n].id === d.id) post({ type: 'kstuff-net:abort', id: n }); });
      return;
    }
    var nid = 'r' + (++seq) + '-' + Date.now();
    relay[nid] = { src: src, id: d.id };
    var out = {}; Object.keys(d).forEach(function (k) { out[k] = d[k]; });
    out.id = nid;
    var tr = d.init && d.init.body instanceof ArrayBuffer ? [d.init.body] : [];
    post(out, tr);
  });
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d !== 'object' || e.source !== parent || typeof d.type !== 'string' || d.type.indexOf('kstuff-net:') !== 0) return;
    var r = relay[d.id];
    if (!r) return;
    delete relay[d.id];
    var out = {}; Object.keys(d).forEach(function (k) { out[k] = d[k]; });
    out.id = r.id;
    try { r.src.postMessage(out, '*', d.body instanceof ArrayBuffer ? [d.body] : []); } catch (x) {}
  });
})();
