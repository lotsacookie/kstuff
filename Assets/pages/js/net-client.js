// net-client: talk to the main app's net-hub (one shared wisp/libcurl) via postMessage.
// kNet.fetch(url, init) -> Promise<Response>; kNet.available() -> Promise<boolean>; kNet.rotate()
(function () {
  if (window.kNet) return;
  var parent = null;
  try { parent = window.parent && window.parent !== window ? window.parent : null; } catch (e) {}
  var seq = 0, pending = {}, availP = null;
  var NOBODY = { 101: 1, 204: 1, 205: 1, 304: 1 };

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d !== 'object' || e.source !== parent) return;
    if (d.type === 'kstuff-net:res' || d.type === 'kstuff-net:ready-ack' || d.type === 'kstuff-net:rotate-ack' || d.type === 'kstuff-net:hello-ack') {
      var key = d.type === 'kstuff-net:hello-ack' ? 'hello' : d.id;
      var p = pending[key];
      if (p) { delete pending[key]; p(d); }
    }
  });

  function call(msg, transfer, ms) {
    return new Promise(function (resolve, reject) {
      if (!parent) return reject(new Error('no net hub'));
      var id = msg.type === 'kstuff-net:hello' ? 'hello' : 'n' + (++seq) + '-' + Date.now();
      msg.id = id;
      var t = ms ? setTimeout(function () { delete pending[id]; reject(new Error('net hub timed out')); }, ms) : 0;
      pending[id] = function (d) { clearTimeout(t); resolve(d); };
      try { parent.postMessage(msg, '*', transfer || []); } catch (err) { clearTimeout(t); delete pending[id]; reject(err); }
    });
  }

  function available() {
    if (!parent) return Promise.resolve(false);
    if (!availP) availP = call({ type: 'kstuff-net:hello' }, null, 2500).then(function () { return true; }, function () { availP = null; return false; });
    return availP;
  }

  async function toPayload(url, init) {
    init = init || {};
    var out = { method: init.method || 'GET', redirect: init.redirect || 'follow' };
    var h = {};
    if (init.headers) {
      if (typeof Headers !== 'undefined' && init.headers instanceof Headers) init.headers.forEach(function (v, k) { h[k] = v; });
      else Object.keys(init.headers).forEach(function (k) { h[k] = init.headers[k]; });
    }
    var body = init.body, transfer = [];
    if (body != null) {
      if (typeof body === 'string') out.body = body;
      else if (body instanceof ArrayBuffer) { out.body = body.slice(0); transfer.push(out.body); }
      else if (ArrayBuffer.isView(body)) { out.body = body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength); transfer.push(out.body); }
      else {
        var r = new Request(url, { method: 'POST', body: body });
        var ct = r.headers.get('content-type');
        if (ct && !Object.keys(h).some(function (k) { return k.toLowerCase() === 'content-type'; })) h['Content-Type'] = ct;
        out.body = await r.arrayBuffer(); transfer.push(out.body);
      }
    }
    out.headers = h;
    return { init: out, transfer: transfer };
  }

  function fetchViaHub(url, init) {
    init = init || {};
    var signal = init.signal;
    if (signal && signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
    return toPayload(url, init).then(function (pl) {
      return new Promise(function (resolve, reject) {
        if (!parent) return reject(new Error('no net hub'));
        var id = 'f' + (++seq) + '-' + Date.now();
        var onAbort = function () { delete pending[id]; try { parent.postMessage({ type: 'kstuff-net:abort', id: id }, '*'); } catch (e) {} reject(new DOMException('Aborted', 'AbortError')); };
        if (signal) signal.addEventListener('abort', onAbort, { once: true });
        pending[id] = function (d) {
          if (signal) signal.removeEventListener('abort', onAbort);
          if (!d.ok) return reject(new TypeError(d.error || 'network error'));
          var status = d.status, res;
          try { res = new Response(NOBODY[status] ? null : d.body, { status: status, statusText: d.statusText }); }
          catch (e) { res = new Response(null, { status: status >= 200 && status <= 599 ? status : 200 }); }
          var headers = new Headers();
          (d.headers || []).forEach(function (kv) { try { headers.append(kv[0], kv[1]); } catch (e) {} });
          try { Object.defineProperty(res, 'headers', { value: headers }); } catch (e) {}
          try { Object.defineProperty(res, 'url', { value: d.url || url }); } catch (e) {}
          resolve(res);
        };
        try { parent.postMessage({ type: 'kstuff-net:fetch', id: id, url: String(url), init: pl.init }, '*', pl.transfer); }
        catch (err) { delete pending[id]; reject(err); }
      });
    });
  }

  window.kNet = {
    available: available,
    fetch: fetchViaHub,
    rotate: function (bad) { return call({ type: 'kstuff-net:rotate', bad: bad }, null, 20000).catch(function () {}); },
    ready: function () { return call({ type: 'kstuff-net:ready' }, null, 40000); }
  };
})();
