export function init(K) {
  const BASES = [
    'https://cdn.jsdelivr.net/gh/lotsacookie/Singuloxy@main/',
    'https://fastly.jsdelivr.net/gh/lotsacookie/Singuloxy@main/'
  ];
  const DIST = 'dist/sandstone.mjs';
  const FALLBACK = 'wss://api.personalloanonline.net/ws/';
  const LAST_KEY = 'WLAST2';
  const BAD_KEY = 'WBAD2';
  const LAST_TTL = 21600000;
  const BAD_TTL = 21600000;
  const SOFT_TTL = 600000;
  const OK_WINDOW = 15000;
  const WATCH_MS = 20000;
  const WATCH_FAILS = 3;
  const CHOOSE_BUDGET = 20000;
  const ROTATE_WAIT = 8000;
  const HARD_MS = 90000;
  const VERIFY_BAD_TTL = 60000;
  const COOLDOWN = 45000;
  const CHECK_URLS = ['https://www.gstatic.com/generate_204', 'https://api.deezer.com/infos', 'https://www.cloudflare.com/cdn-cgi/trace'];
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const toWss = entry => {
    const t = String(entry || '').trim();
    if (!t) return null;
    const u = t.includes('://') ? t : 'wss://' + t + '/';
    return u.endsWith('/') ? u : u + '/';
  };
  const NO_BODY = new Set([101, 204, 205, 304]);

  let lastRotateAt = 0, bootP = null, sandstone = null, current = null, rotating = null, watching = false, okUrl = null, okAt = 0, inflight = 0;

  const readJson = key => {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  };
  const writeJson = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };

  try { localStorage.removeItem('WBAD'); localStorage.removeItem('WBAD2'); } catch {}
  let badMem = {};
  const liveBad = () => {
    const now = Date.now();
    for (const k of Object.keys(badMem)) if (badMem[k] <= now) delete badMem[k];
    return badMem;
  };
  const isBad = url => Object.prototype.hasOwnProperty.call(liveBad(), url);
  const markBad = (url, ttl) => {
    if (!url) return;
    badMem[url] = Math.max(badMem[url] || 0, Date.now() + Math.min(ttl || SOFT_TTL, 60000));
  };
  const clearBad = url => { delete badMem[url]; };

  const readGood = () => {
    const v = readJson(LAST_KEY);
    return v && typeof v.url === 'string' && typeof v.ts === 'number' ? v : null;
  };
  const writeGood = url => writeJson(LAST_KEY, { url, ts: Date.now() });
  const freshGood = () => {
    const good = readGood();
    return good && Date.now() - good.ts < LAST_TTL && !isBad(good.url) ? good.url : null;
  };

  function probe(url, ms) {
    return new Promise(resolve => {
      let ws;
      try { ws = new WebSocket(url); } catch { resolve(null); return; }
      ws.binaryType = 'arraybuffer';
      let connected = false, sentAt = 0;
      const streamId = Math.floor(Math.random() * 0xFFFFFFFE) + 1 >>> 0;
      const finish = ping => {
        clearTimeout(timer);
        ws.onmessage = ws.onerror = ws.onclose = null;
        try { ws.close(); } catch {}
        resolve(ping);
      };
      const timer = setTimeout(() => finish(null), ms || 3000);
      ws.onmessage = ev => {
        if (!(ev.data instanceof ArrayBuffer) || ev.data.byteLength < 5) return;
        const v = new DataView(ev.data);
        const type = v.getUint8(0), stream = v.getUint32(1, true);
        if (!connected) {
          if (type === 5 && stream === 0) ws.send(new Uint8Array([5, 0, 0, 0, 0, 2, 1]));
          else if (type === 3 && stream === 0) {
            connected = true;
            const host = new TextEncoder().encode('127.0.0.1');
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

  async function verify(url) {
    if (url !== current) applyWisp(url);
    const ctl = new AbortController();
    let ok = false, why = '';
    try {
      await Promise.any(CHECK_URLS.map(t => Promise.race([
        sandstone.libcurl.fetch(t, { method: 'GET', signal: ctl.signal }).then(async r => { await r.arrayBuffer(); return r; }),
        delay(10000).then(() => { throw new Error('timeout'); })
      ])));
      ok = true;
    } catch (e) {
      why = e && e.errors ? e.errors.map(x => (x && x.message) || String(x)).join(' | ') : String((e && e.message) || e);
    }
    try { ctl.abort(); } catch {}
    if (ok) {
      okUrl = url;
      okAt = Date.now();
      clearBad(url);
    }
    console.log('[net-hub] verify', url, ok, ok ? '' : why);
    return ok;
  }

  function resetConnection(url) {
    try {
      const connections = (sandstone.libcurl.wisp && sandstone.libcurl.wisp.wisp_connections) || {};
      const connection = connections[url];
      if (!connection) return false;
      if (Object.keys(connection.active_streams || {}).length) return false;
      try { connection.close && connection.close(); } catch {}
      delete connections[url];
      console.log('[net-hub] reset stalled connection', url);
      return true;
    } catch { return false; }
  }

  const tiers = () => {
    const servers = Array.isArray(K.WISP_SERVERS) && K.WISP_SERVERS.length ? K.WISP_SERVERS : (Array.isArray(window.serverList) ? window.serverList : []);
    const primary = [];
    const backup = [];
    const put = (list, entry) => {
      const u = toWss(entry);
      if (u && !primary.includes(u) && !backup.includes(u)) list.push(u);
    };
    servers.forEach(entry => { if (typeof entry === 'string' && !entry.includes('://')) put(primary, entry); });
    servers.forEach(entry => { if (typeof entry === 'string' && entry.includes('://')) put(backup, entry); });
    put(backup, K.WISP_FALLBACK);
    put(backup, FALLBACK);
    (Array.isArray(K.wispUrls) ? K.wispUrls : []).forEach(entry => put(backup, entry));
    const hint = toWss(window.wlspServer);
    [primary, backup].forEach(tier => {
      const i = tier.indexOf(hint);
      if (i > 0) tier.unshift(tier.splice(i, 1)[0]);
    });
    return [primary, backup];
  };

  async function choose(exclude) {
    const skip = new Set(exclude);
    const good = readGood();
    if (good && !skip.has(good.url) && Date.now() - good.ts < LAST_TTL && !isBad(good.url)) {
      if ((await probe(good.url, 3000)) !== null) return good.url;
      markBad(good.url, SOFT_TTL);
    }
    let bestAlive = null;
    for (const tier of tiers()) {
      const deadline = Date.now() + CHOOSE_BUDGET;
      const pool = tier.filter(u => !skip.has(u));
      const ordered = [...pool.filter(u => !isBad(u)), ...pool.filter(u => isBad(u))];
      for (let i = 0; i < ordered.length; i += 6) {
        if (Date.now() > deadline) break;
        const wave = ordered.slice(i, i + 6);
        const pings = await Promise.all(wave.map(u => probe(u, 3000)));
        const alive = [];
        wave.forEach((u, j) => {
          if (pings[j] === null) markBad(u, SOFT_TTL);
          else alive.push({ u, ping: pings[j] });
        });
        alive.sort((x, y) => x.ping - y.ping);
        if (alive.length && (!bestAlive || alive[0].ping < bestAlive.ping)) bestAlive = alive[0];
        for (const row of alive.slice(0, 2)) {
          if (await verify(row.u)) {
            writeGood(row.u);
            return row.u;
          }
          markBad(row.u, VERIFY_BAD_TTL);
        }
      }
    }
    return bestAlive ? bestAlive.u : null;
  }

  let lastMainTry = 0, mainBusy = null;
  async function preferMain() {
    if (mainBusy) return mainBusy;
    mainBusy = (async () => {
      lastMainTry = Date.now();
      const primary = tiers()[0];
      if (!primary.length || primary.includes(current)) return false;
      const prev = current;
      for (let i = 0; i < primary.length; i += 8) {
        const wave = primary.slice(i, i + 8);
        const pings = await Promise.all(wave.map(u => probe(u, 3000)));
        const alive = [];
        wave.forEach((u, j) => { if (pings[j] !== null) alive.push({ u, ping: pings[j] }); });
        alive.sort((x, y) => x.ping - y.ping);
        for (const row of alive.slice(0, 3)) {
          if (await verify(row.u)) {
            writeGood(row.u);
            console.log('[net-hub] main wisp back, using', row.u);
            return true;
          }
        }
      }
      if (prev && current !== prev) applyWisp(prev);
      return false;
    })().finally(() => { mainBusy = null; });
    return mainBusy;
  }

  async function recover() {
    if (!current) return;
    if (rotating) return rotating;
    return rotate(current, true);
  }

  let fails = 0;
  async function watch() {
    if (current && !tiers()[0].includes(current) && Date.now() - lastMainTry > 60000 && !rotating && !mainBusy) preferMain().catch(() => {});
    if (!current || document.hidden || rotating || live.size || inflight) return;
    const ping = await probe(current, 4000);
    if (ping === null) fails++;
    else {
      fails = 0;
      writeGood(current);
    }
    if (fails >= WATCH_FAILS) {
      fails = 0;
      rotate(current, true);
    }
  }

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
      let url = freshGood();
      if (!url && window.kWispP && window.kWispP.then) await Promise.race([window.kWispP.catch(() => {}), delay(6000)]);
      url = url || freshGood() || toWss(window.wlspServer) || tiers().flat()[0] || FALLBACK;
      applyWisp(url);
      for (let i = 0; i < 300 && !sg.libcurl.ready; i++) await delay(100);
      if (!sg.libcurl.ready) throw new Error('libcurl did not load');
      const mainFirst = preferMain().catch(() => false);
      setTimeout(() => {
        (async () => {
          if (await mainFirst) return;
          if (await verify(current)) { writeGood(current); return; }
          await delay(800);
          if (await verify(current)) { writeGood(current); return; }
          if (resetConnection(current)) {
            await delay(400);
            if (await verify(current)) { writeGood(current); return; }
          }
          if ((await probe(current, 3000)) !== null) { console.log('[net-hub] verify failed but wisp answers, keeping', current); return; }
          rotate(current);
        })().catch(() => {});
      }, 1500);
      console.log('[net-hub] ready via', current);
      if (!watching) { watching = true; setInterval(watch, WATCH_MS); }
      return sg;
    })().catch(e => { bootP = null; sandstone = null; throw e; });
    return bootP;
  }
  K.netHubBoot = boot;

  async function rotate(bad, auto) {
    if (rotating) return rotating;
    rotating = (async () => {
      await boot();
      if (auto && current) {
        if (bad && bad !== current) return current;
        if (Date.now() - lastRotateAt < COOLDOWN) return current;
        if (okUrl === current && Date.now() - okAt < OK_WINDOW) return current;
        if (await verify(current)) { writeGood(current); return current; }
        await delay(800);
        if (await verify(current)) { writeGood(current); return current; }
        if (resetConnection(current)) {
          await delay(400);
          if (await verify(current)) { writeGood(current); return current; }
        }
        if (await probe(current, 3000) !== null) {
          console.log('[net-hub] wisp still answers, keeping', current);
          okUrl = current;
          okAt = Date.now();
          return current;
        }
      }
      const from = bad || current;
      if (from) markBad(from, auto ? VERIFY_BAD_TTL : SOFT_TTL);
      const hit = await choose(from ? [from] : []);
      const flat = tiers().flat();
      const next = hit || flat.find(u => u !== from && !isBad(u)) || flat.find(u => u !== from) || flat[0] || FALLBACK;
      if (next && next !== current) applyWisp(next);
      if (current) writeGood(current);
      lastRotateAt = Date.now();
      console.log('[net-hub] rotated to', current);
      return current;
    })().finally(() => { rotating = null; });
    return rotating;
  }

  const live = new Map();
  const owners = new Map();
  const dropOwned = src => {
    owners.forEach((o, k) => {
      if (o === src) { const c = live.get(k); if (c) c.abort(); live.delete(k); owners.delete(k); }
    });
  };

  async function core(url, init) {
    const sg = await boot();
    if (rotating) await Promise.race([rotating.catch(() => {}), delay(ROTATE_WAIT)]);
    const outer = init.signal;
    const hard = new AbortController();
    let hardHit = false;
    const timer = setTimeout(() => { hardHit = true; hard.abort(); }, HARD_MS);
    if (outer) {
      if (outer.aborted) hard.abort();
      else outer.addEventListener('abort', () => hard.abort(), { once: true });
    }
    const opts = Object.assign({}, init, { signal: hard.signal });
    const run = async () => {
      inflight++;
      try { return await sg.libcurl.fetch(url, opts); } finally { inflight--; }
    };
    try {
      return await run();
    } catch (err) {
      if (hardHit || hard.signal.aborted || (outer && outer.aborted)) throw err;
      const m = String(init.method || 'GET').toUpperCase();
      if (/http\/2|framing|stream error/i.test(String((err && err.message) || err))) return await run();
      await recover();
      if (m !== 'GET' && m !== 'HEAD') throw err;
      return await run();
    } finally { clearTimeout(timer); }
  }

  async function doFetch(d) {
    const ctl = new AbortController();
    live.set(d.key, ctl);
    owners.set(d.key, d.owner || null);
    return core(d.url, Object.assign({ redirect: 'follow' }, d.init || {}, { signal: ctl.signal }));
  }

  window.kNetDirect = {
    fetch: (url, init) => core(String(url), Object.assign({ redirect: 'follow' }, init || {})),
    ready: () => boot().then(() => current),
    rotate: (bad, soft) => rotate(bad ? toWss(bad) : null, !!soft)
  };

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
    } finally { live.delete(d.key); owners.delete(d.key); }
  }

  const isPageFrame = src => {
    try { return [...document.querySelectorAll('iframe')].some(f => f.contentWindow === src && f.hasAttribute('srcdoc') && !f.__proxied); }
    catch { return false; }
  };

  setTimeout(() => { boot().catch(() => {}); }, 1500);

  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || typeof d !== 'object' || typeof d.type !== 'string' || d.type.indexOf('kstuff-net:') !== 0) return;
    const src = e.source;
    if (!src || !isPageFrame(src)) return;
    const reply = (m, t) => { try { src.postMessage(m, '*', t || []); } catch {} };
    if (d.type === 'kstuff-net:hello') { dropOwned(src); reply({ type: 'kstuff-net:hello-ack', wisp: current }); boot().catch(() => {}); return; }
    if (d.type === 'kstuff-net:ready') { boot().then(() => reply({ type: 'kstuff-net:ready-ack', id: d.id, wisp: current }), er => reply({ type: 'kstuff-net:ready-ack', id: d.id, error: String(er && er.message || er) })); return; }
    if (d.type === 'kstuff-net:rotate') { rotate(d.bad ? toWss(d.bad) : null, !!d.soft).then(w => reply({ type: 'kstuff-net:rotate-ack', id: d.id, wisp: w }), () => reply({ type: 'kstuff-net:rotate-ack', id: d.id })); return; }
    if (d.type === 'kstuff-net:abort') { const c = live.get(d.id); if (c) c.abort(); return; }
    if (d.type === 'kstuff-net:fetch' && typeof d.url === 'string' && /^https?:\/\//i.test(d.url)) {
      d.key = d.id;
      d.owner = src;
      handleFetch(d, reply);
    }
  });
}
