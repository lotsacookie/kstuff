// Sandbox / CrossOrigin isolate
//
// When enabled, the whole visible page is cleared (scripts, wisp, net hub and the
// Singuloxy transport keep running in the background) and a single full-screen
// iframe is shown. coi.html is NOT embedded by URL: it is fetched through the
// sandstone/Singuloxy transport (wisp), then mounted via srcdoc in a sandboxed
// frame with no allow-same-origin, so it runs in an opaque origin, cross-origin
// to this page. It talks to this page only over postMessage: the kstuff-net:*
// bridge in net-hub.js (fetch / rotate / abort, which Singuloxy inside the frame
// uses) plus the kstuff-coi:* messages handled here.
export function init(K) {
  if (window.__COI) return initInsideFrame(K); // running inside the isolated frame itself
  const KEY = 'kstuff_coi';
  const BASE_URL = 'https://lotsacookie.github.io/kstuff/';
  const COI_URL = BASE_URL + 'Assets/coi.html';
  const byId = id => document.getElementById(id);
  const SANDBOX = 'allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-pointer-lock allow-presentation';

  const isOn = () => { try { return localStorage.getItem(KEY) === 'on'; } catch { return false; } };
  const setOn = on => { try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch {} };

  // Escape hatch: ?coi=off turns it off, ?coi=on turns it on.
  try {
    const q = new URLSearchParams(location.search).get('coi');
    if (q === 'off' || q === 'on') setOn(q === 'on');
  } catch {}

  K.coi = { isOn, setOn, enter, url: COI_URL };

  // ---- Settings UI (Proxy tab) ----
  function bindUi() {
    const panel = byId('settings-panel-proxy');
    const sel = byId('coi-isolate-select');
    if (!panel || !sel || sel.__coi) return;
    sel.__coi = true;
    sel.value = isOn() ? 'on' : 'off';
    try { K.applyCustomDropdown && K.applyCustomDropdown(sel); } catch {}
    const status = byId('coi-isolate-status');
    sel.addEventListener('change', () => {
      const on = sel.value === 'on';
      setOn(on);
      if (on) {
        if (status) status.textContent = 'Isolating...';
        enter();
      } else if (status) {
        status.textContent = 'Off. Takes effect on the next load.';
      }
    });
  }
  bindUi();
  document.addEventListener('click', e => {
    if (e.target && e.target.closest && e.target.closest('.settings-tab')) bindUi();
  });

  // ---- Isolation ----
  let frame = null;
  let observer = null;

  const keep = n => n === frame || (n.nodeType === 1 && n.tagName === 'SCRIPT');

  function sweep() {
    const body = document.body;
    if (!body) return;
    for (const n of Array.from(body.childNodes)) {
      if (keep(n)) continue;
      try { n.remove(); } catch {}
    }
    // Anything left in <head> that paints (inline hide-nothing, just make sure bg is black).
    if (frame && frame.parentNode !== body) body.appendChild(frame);
  }

  function enter() {
    if (frame) return;
    const root = document.documentElement;
    const style = document.createElement('style');
    style.id = 'coi-isolate-style';
    style.textContent =
      'html,body{background:#000!important;margin:0!important;padding:0!important;overflow:hidden!important;height:100%!important}' +
      '#coi-frame{position:fixed;inset:0;width:100vw;height:100vh;border:0;margin:0;padding:0;background:#000;z-index:2147483647;display:block}';
    document.head.appendChild(style);
    root.style.setProperty('background', '#000', 'important');
    document.body.style.setProperty('background', '#000', 'important');
    document.body.className = '';

    frame = document.createElement('iframe');
    frame.id = 'coi-frame';
    frame.dataset.coi = '1';
    frame.__proxied = false;
    // No allow-same-origin: the frame gets an opaque origin and cannot touch this page.
    frame.setAttribute('sandbox', SANDBOX);
    frame.setAttribute('allow', 'cross-origin-isolated; fullscreen; pointer-lock; gamepad; keyboard-map; autoplay; clipboard-read; clipboard-write; picture-in-picture; microphone; camera');
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('credentialless', '');
    sweep();
    document.body.appendChild(frame);
    load();

    // Keep the host DOM empty: anything modules add later is removed again.
    observer = new MutationObserver(muts => {
      for (const m of muts) for (const n of m.addedNodes) {
        if (n.parentNode === document.body && !keep(n)) { try { n.remove(); } catch {} }
      }
    });
    observer.observe(document.body, { childList: true });
  }

  // ---- Load coi.html through the proxy transport ----
  const withTimeout = (p, ms, what) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error(what + ' timed out')), ms))]);

  async function getScript(name) {
    const path = 'Assets/pages/js/' + name;
    try { return await K.fetchWithProxy(path, true); } catch {}
    const r = await fetch('https://cdn.jsdelivr.net/gh/' + (K.MAIN_REPO || 'lotsacookie/kstuff') + '@main/' + path);
    if (!r.ok) throw new Error(name + ' ' + r.status);
    return r.text();
  }

  const safeJson = v => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const inlineJs = code => '<script>' + code.replace(/<\/script/gi, '<\\/script') + '<\/script>';

  function snapshotStore() {
    const store = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k !== KEY) store[k] = localStorage.getItem(k);
      }
    } catch {}
    return store;
  }

  async function fetchCoiHtml() {
    const net = window.kNetDirect;
    if (!net) throw new Error('net hub unavailable');
    await withTimeout(net.ready(), 40000, 'proxy boot');
    const res = await withTimeout(net.fetch(COI_URL + '?t=' + Date.now(), { method: 'GET', redirect: 'follow' }), 30000, 'coi.html fetch');
    if (!res.ok) throw new Error('coi.html HTTP ' + res.status);
    const html = await res.text();
    if (!/<html|<body|<!doctype/i.test(html)) throw new Error('coi.html looks invalid');
    return html;
  }

  const errorHtml = msg => '<html style="background:#000"><body style="margin:0;height:100vh;display:flex;flex-direction:column;gap:14px;align-items:center;justify-content:center;color:#f5f5f5;font-family:sans-serif"><h2 style="margin:0">Could not load the isolated page</h2><div style="opacity:.7;max-width:80vw;text-align:center;word-break:break-word">' +
    String(msg).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])) +
    '</div><div style="display:flex;gap:10px"><button id="r" style="padding:8px 16px;font:inherit;cursor:pointer">Retry</button><button id="d" style="padding:8px 16px;font:inherit;cursor:pointer">Turn off isolation</button></div><script>' +
    'r.onclick=function(){parent.postMessage({type:"kstuff-coi:reload"},"*")};d.onclick=function(){parent.postMessage({type:"kstuff-coi:disable"},"*")}<\/script></body></html>';

  let loadToken = 0;
  async function load() {
    const token = ++loadToken;
    try {
      const [html, shim, client] = await Promise.all([fetchCoiHtml(), getScript('coi-shim.js'), getScript('net-client.js')]);
      if (token !== loadToken || !frame) return;
      const net = window.kNetDirect || {};
      // base = the site root, so coi.html (a copy of index.html) resolves style.css, Assets/... exactly as index.html does.
      const inject = '<base href="' + BASE_URL + '">' +
        inlineJs('window.__COI_STORE=' + safeJson(snapshotStore()) + ';window.__COI_CFG=' + safeJson({ wisp: net.wisp ? net.wisp() : null, transport: net.transport ? net.transport() : 'epoxy' }) + ';') +
        inlineJs(shim) + inlineJs(client);
      const m = /<head(\s[^>]*)?>/i.exec(html);
      frame.srcdoc = m ? html.slice(0, m.index + m[0].length) + inject + html.slice(m.index + m[0].length) : inject + html;
    } catch (err) {
      console.error('coi load failed', err);
      if (token === loadToken && frame) frame.srcdoc = errorHtml(err && err.message || err);
    }
  }

  // ---- Bundle cache (the frame cannot use IndexedDB, so it borrows ours) ----
  const idb = () => new Promise((ok, no) => {
    const q = indexedDB.open('singularity', 1);
    q.onupgradeneeded = () => q.result.createObjectStore('s');
    q.onsuccess = () => ok(q.result);
    q.onerror = () => no(q.error);
  });
  const bundleGet = async () => {
    try {
      const db = await idb();
      return await new Promise(r => { const q = db.transaction('s').objectStore('s').get('bundle'); q.onsuccess = () => r(q.result || null); q.onerror = () => r(null); });
    } catch { return null; }
  };
  const bundleClear = async () => {
    try {
      const db = await idb();
      await new Promise(done => { const tx = db.transaction('s', 'readwrite'); tx.objectStore('s').delete('bundle'); tx.oncomplete = tx.onerror = tx.onabort = () => done(); });
      db.close();
    } catch {}
  };

  // ---- Messages from the isolated page ----
  // The sandboxed frame has an opaque origin ("null"), so trust the window identity, not the origin.
  const sockets = new Map();
  const closeSockets = () => { sockets.forEach(ws => { try { ws.close(); } catch {} }); sockets.clear(); };

  // ---- Leave isolation: clear the frame and re-import Singularity, the same way the Update button does ----
  const UPDATE_REPO = 'lotsacookie/kstuff';
  const FETCH_MS = 8000;
  const fetchWithTimeout = async (url, type) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_MS);
    try {
      const r = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r[type]();
    } finally { clearTimeout(timer); }
  };
  const looksValid = html => typeof html === 'string' && html.length > 5000 && /<html/i.test(html) && /singularity/i.test(html);
  const fetchLatestHtml = async () => {
    const bust = '?t=' + Date.now();
    const urls = [];
    try {
      const data = await fetchWithTimeout('https://api.github.com/repos/' + UPDATE_REPO + '/commits/main', 'json');
      if (data && /^[0-9a-f]{40}$/i.test(data.sha)) urls.push('https://cdn.jsdelivr.net/gh/' + UPDATE_REPO + '@' + data.sha + '/index.html');
    } catch {}
    urls.push(
      'https://raw.githubusercontent.com/' + UPDATE_REPO + '/main/index.html' + bust,
      'https://cdn.jsdelivr.net/gh/' + UPDATE_REPO + '@main/index.html' + bust,
      'https://cdn.statically.io/gh/' + UPDATE_REPO + '/main/index.html' + bust
    );
    try {
      const here = location.href.split('#')[0];
      if (/^https?:/i.test(here)) urls.push(here + (here.includes('?') ? '&' : '?') + 't=' + Date.now());
    } catch {}
    for (const url of urls) {
      try { const html = await fetchWithTimeout(url, 'text'); if (looksValid(html)) return html; } catch {}
    }
    return null;
  };
  const clearBundleCache = async () => {
    await bundleClear();
    try { if (window.caches) for (const name of await caches.keys()) await caches.delete(name); } catch {}
  };
  const teardown = () => {
    try { const top = setTimeout(() => {}, 0); for (let i = 0; i <= top; i++) { clearTimeout(i); clearInterval(i); } } catch {}
    try { const last = requestAnimationFrame(() => {}); for (let i = 0; i <= last; i++) cancelAnimationFrame(i); } catch {}
    try { if (window.__sgLogSubs) window.__sgLogSubs.clear(); } catch {}
    ['singularity', 'kShaP', 'kWispP', 'kModulesStarted', 'kReady', 'kReadyResolve', 'kAssetsP', 'kAssetsPR', 'kHolidayLoaded'].forEach(key => {
      try { delete window[key]; } catch { try { window[key] = undefined; } catch {} }
    });
  };

  let restoring = false;
  async function restoreSingularity() {
    if (restoring) return;
    restoring = true;
    setOn(false);
    const html = await fetchLatestHtml();
    // Clear the isolation: drop the frame, its sockets and everything that keeps the page empty.
    loadToken++;
    closeSockets();
    if (observer) { observer.disconnect(); observer = null; }
    if (frame) { try { frame.remove(); } catch {} frame = null; }
    if (!html) {
      // Could not fetch anything; reload in place (same URL) rather than leave a black page.
      window.__sgReloading = true;
      location.reload();
      return;
    }
    await clearBundleCache();
    window.__sgReloading = true;
    teardown();
    try {
      document.open();
      document.write(html);
      document.close();
    } catch (err) {
      console.error('coi restore failed', err);
      location.reload();
      return;
    }
    setTimeout(() => { window.__sgReloading = false; }, 3000);
  }
  K.coi.restore = restoreSingularity;

  const handlers = {
    hello: () => ({ store: snapshotStore(), wisp: window.kNetDirect ? window.kNetDirect.wisp() : null, transport: window.kTransportMode || null }),
    'wisp-info': () => ({ wisp: window.kNetDirect ? window.kNetDirect.wisp() : null, transport: window.kNetDirect ? window.kNetDirect.transport() : null, status: window.kNetDirect && window.kNetDirect.status ? window.kNetDirect.status() : null }),
    'set-transport': d => (window.kNetDirect ? window.kNetDirect.setTransport(d && d.mode) : null),
    'bundle-get': () => bundleGet(),
    // Update button inside the frame: the parent fetches the latest coi.html through the proxy and drops its cached bundle
    'coi-html': async () => ({ html: await fetchCoiHtml(), base: BASE_URL }),
    'clear-bundle': async () => { await bundleClear(); return true; },
    reload: async d => { if (d && d.fresh) await bundleClear(); closeSockets(); load(); return true; },
    disable: () => { restoreSingularity(); return true; }
  };

  window.addEventListener('message', e => {
    const d = e.data;
    if (!frame || !d || typeof d !== 'object' || typeof d.type !== 'string' || d.type.indexOf('kstuff-coi:') !== 0) return;
    if (e.source !== frame.contentWindow) return;
    const src = e.source;
    const type = d.type.slice('kstuff-coi:'.length);
    const send = (m, t) => { try { src.postMessage(m, '*', t || []); } catch {} };

    // fire-and-forget
    if (type === 'storage-set' && typeof d.key === 'string' && d.key !== KEY) { try { localStorage.setItem(d.key, String(d.value)); } catch {} return; }
    if (type === 'storage-remove' && typeof d.key === 'string' && d.key !== KEY) { try { localStorage.removeItem(d.key); } catch {} return; }
    if (type === 'storage-clear') {
      try { const keep = localStorage.getItem(KEY); localStorage.clear(); if (keep != null) localStorage.setItem(KEY, keep); } catch {}
      return;
    }
    if (type === 'ws-open' && typeof d.url === 'string' && /^wss?:\/\//i.test(d.url)) {
      (async () => {
        try {
          const ws = await window.kNetDirect.websocket(d.url, d.protocols);
          sockets.set(d.id, ws);
          ws.binaryType = 'arraybuffer';
          ws.addEventListener('open', () => send({ type: 'kstuff-coi:ws-event', id: d.id, ev: 'open', protocol: ws.protocol }));
          ws.addEventListener('message', ev => {
            const data = ev.data;
            send({ type: 'kstuff-coi:ws-event', id: d.id, ev: 'message', data }, data instanceof ArrayBuffer ? [data] : []);
          });
          ws.addEventListener('error', () => send({ type: 'kstuff-coi:ws-event', id: d.id, ev: 'error' }));
          ws.addEventListener('close', ev => { sockets.delete(d.id); send({ type: 'kstuff-coi:ws-event', id: d.id, ev: 'close', code: ev.code, reason: ev.reason, clean: ev.wasClean }); });
        } catch { send({ type: 'kstuff-coi:ws-event', id: d.id, ev: 'close', code: 1006 }); }
      })();
      return;
    }
    if (type === 'ws-send') { const ws = sockets.get(d.id); if (ws) try { ws.send(d.data); } catch {} return; }
    if (type === 'ws-close') { const ws = sockets.get(d.id); if (ws) try { ws.close(d.code, d.reason); } catch {} return; }

    // request / response
    const fn = handlers[type];
    if (!fn) return;
    const payload = type === 'hello' ? undefined : d.data;
    Promise.resolve().then(() => fn(payload)).then(
      data => send({ type: 'kstuff-coi:res', id: d.id, ok: true, data }),
      err => send({ type: 'kstuff-coi:res', id: d.id, ok: false, error: String(err && err.message || err) })
    );
  });

  if (isOn()) {
    const go = () => { try { enter(); } catch (err) { console.error('coi isolate failed', err); } };
    // Let the other modules finish initialising first so wisp / net hub are running.
    (K.kReadyP || window.kReady || Promise.resolve()).then(() => setTimeout(go, 0), go);
  }
}

// Inside the isolated frame: the footer indicator is in coi.html (generated); this wires the Proxy tab.
// The setting reads On here, and turning it off tells the parent to drop isolation and reload the normal site.
function initInsideFrame(K) {
  const byId = id => document.getElementById(id);
  const sandboxed = window.origin === 'null';
  const isolated = window.crossOriginIsolated === true;

  const bind = () => {
    const sel = byId('coi-isolate-select');
    const status = byId('coi-isolate-status');
    if (!sel) return;
    if (!sel.__coi) {
      sel.__coi = true;
      sel.value = 'on';
      try { K.applyCustomDropdown && K.applyCustomDropdown(sel); } catch {}
      sel.addEventListener('change', async () => {
        if (sel.value !== 'off') return;
        const st = byId('coi-isolate-status');
        if (st) st.textContent = 'Switching back to normal Singularity...';
        try { await window.__coiCall('disable'); }
        catch { if (st) st.textContent = 'Could not reach the parent page. Add ?coi=off to its URL.'; }
      });
    }
    if (status) status.textContent = 'On. Sandboxed: ' + (sandboxed ? 'yes' : 'no') + ' · Cross-origin isolated: ' + (isolated ? 'yes' : 'no') + '. Turn off to go back to normal Singularity.';
  };
  bind();
  document.addEventListener('click', e => { if (e.target && e.target.closest && e.target.closest('.settings-tab')) bind(); });
}
