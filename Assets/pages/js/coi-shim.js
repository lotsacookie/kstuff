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
})();
