// net-hub: the main app loads sandstone (libcurl) + a wisp connection exactly ONCE.
// Pages (Music, AI, TV...) never load their own transport; they send
// `kstuff-net:*` messages and get status/headers/body (ArrayBuffer, transferred) back.
export function init(K) {
  const BASES = [
    'https://cdn.jsdelivr.net/gh/lotsacookie/Singuloxy@main/',
    'https://fastly.jsdelivr.net/gh/lotsacookie/Singuloxy@main/'
  ];
  const DIST = 'dist/sandstone.mjs';
  const FALLBACK = 'wss://api.personalloanonline.net/ws/';
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const toWss = entry => {
    const t = String(entry || '').trim();
    if (!t) return null;
    const u = t.includes('://') ? t : 'wss://' + t + '/';
    return u.endsWith('/') ? u : u + '/';
  };
  const NO_BODY = new Set([101, 204, 205, 304]);

  let bootP = null, sandstone = null, current = null, rotating = null;

  const candidates = () => {
    const raw = [window.wlspServer, ...(K.wispUrls || []), ...(Array.isArray(window.serverList) ? window.serverList : []), K.WISP_FALLBACK, FALLBACK];
    return [...new Set(raw.map(toWss).filter(Boolean))];
  };

  async function loadSandstone() {
    for (const b of BASES) { try { return await import(b + DIST); } catch {} }
    const code = await (await fetch('https://raw.githubusercontent.com/lotsacookie/Singuloxy/main/' + DIST)).text();
    return import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
  }

  function applyWisp(url) {
    current = url;
    sandstone.network.set_websocket(url);
    try { sandstone.network.set_wisp_pool([url]); } catch {}
    window.kNetWisp = url;
  }

  function boot() {
    if (bootP) return bootP;
    bootP = (async () => {
      const sg = await loadSandstone();
      sandstone = sg;
      if (window.kWispP && window.kWispP.then) await Promise.race([window.kWispP.catch(() => {}), delay(6000)]);
      applyWisp(candidates()[0] || FALLBACK);
      for (let i = 0; i < 300 && !sg.libcurl.ready; i++) await delay(100);
      if (!sg.libcurl.ready) throw new Error('libcurl did not load');
      console.log('[net-hub] ready via', current);
      return sg;
    })().catch(e => { bootP = null; sandstone = null; throw e; });
    return bootP;
  }
  K.netHubBoot = boot;

  // Switch the ONE shared connection to the next wisp; everyone benefits.
  async function rotate(bad) {
    if (rotating) return rotating;
    rotating = (async () => {
      await boot();
      const list = candidates();
      const from = bad || current;
      const next = list.find(u => u !== from && u !== current) || list.find(u => u !== from) || list[0];
      if (next && next !== current) applyWisp(next);
      return current;
    })().finally(() => { rotating = null; });
    return rotating;
  }

  const live = new Map(); // key -> AbortController

  async function doFetch(d) {
    const sg = await boot();
    const ctl = new AbortController();
    live.set(d.key, ctl);
    const init = Object.assign({ redirect: 'follow' }, d.init || {}, { signal: ctl.signal });
    const run = () => sg.libcurl.fetch(d.url, init);
    try {
      try { return await run(); }
      catch (err) {
        const m = (init.method || 'GET').toUpperCase();
        if (ctl.signal.aborted || (m !== 'GET' && m !== 'HEAD')) throw err;
        await rotate(current);
        return await run();
      }
    } finally { /* controller removed after body is read */ }
  }

  async function handleFetch(d, reply) {
    try {
      const res = await doFetch(d);
      const headers = [];
      try { res.headers.forEach((v, k) => headers.push([k, v])); } catch {}
      try {
        const sc = res.headers.getSetCookie && res.headers.getSetCookie();
        if (sc && sc.length && !headers.some(h => h[0].toLowerCase() === 'set-cookie')) sc.forEach(c => headers.push(['set-cookie', c]));
      } catch {}
      const buf = NO_BODY.has(res.status) ? null : await res.arrayBuffer();
      reply({ type: 'kstuff-net:res', id: d.id, ok: true, status: res.status, statusText: res.statusText || '', url: res.url || d.url, headers, body: buf }, buf ? [buf] : []);
    } catch (e) {
      reply({ type: 'kstuff-net:res', id: d.id, ok: false, error: String((e && e.message) || e) });
    } finally { live.delete(d.key); }
  }

  const isPageFrame = src => {
    try { return [...document.querySelectorAll('iframe')].some(f => f.contentWindow === src && f.hasAttribute('srcdoc') && !f.__proxied); }
    catch { return false; }
  };

  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || typeof d !== 'object' || typeof d.type !== 'string' || d.type.indexOf('kstuff-net:') !== 0) return;
    const src = e.source;
    if (!src || !isPageFrame(src)) return;
    const reply = (m, t) => { try { src.postMessage(m, '*', t || []); } catch {} };
    if (d.type === 'kstuff-net:hello') { reply({ type: 'kstuff-net:hello-ack', wisp: current }); boot().catch(() => {}); return; }
    if (d.type === 'kstuff-net:ready') { boot().then(() => reply({ type: 'kstuff-net:ready-ack', id: d.id, wisp: current }), er => reply({ type: 'kstuff-net:ready-ack', id: d.id, error: String(er && er.message || er) })); return; }
    if (d.type === 'kstuff-net:rotate') { rotate(d.bad ? toWss(d.bad) : null).then(w => reply({ type: 'kstuff-net:rotate-ack', id: d.id, wisp: w }), () => reply({ type: 'kstuff-net:rotate-ack', id: d.id })); return; }
    if (d.type === 'kstuff-net:abort') { const c = live.get(d.id); if (c) c.abort(); return; }
    if (d.type === 'kstuff-net:fetch' && typeof d.url === 'string' && /^https?:\/\//i.test(d.url)) {
      d.key = d.id;
      handleFetch(d, reply);
    }
  });
}
