export function init(K) {
  const BASES = [
    'https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/build/',
    'https://fastly.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/build/'
  ];
  const DIST = 'sandstone.mjs';
  const FALLBACK = 'wss://api.personalloanonline.net/ws/';
  const LAST_KEY = 'WLAST2';
  const TRANSPORT_KEY = 'kTransport';
  const LAST_TTL = 21600000;
  const SOFT_TTL = 600000;
  const OK_WINDOW = 15000;
  const CHOOSE_BUDGET = 20000;
  const ROTATE_WAIT = 8000;
  const HARD_MS = 90000;
  const VERIFY_BAD_TTL = 60000;
  const COOLDOWN = 45000;
  const VERIFY_MS = 22000;
  const HOLD_BASE = 60000;
  const HOLD_MAX = 600000;
  const FAIL_ROTATE = 4;
  const GOOD_SAVE_EVERY = 60000;
  const BOOT_PROBE_MS = 3000;
  const STRIKE_BASE = 30000;
  const STRIKE_MAX = 1800000;
  const EPOXY_POOL = 3;
  const TTFB_MS = 15000;
  const BODY_IDLE_MS = 15000;
  const IDLE_RECYCLE_MS = 40000;
  const MAX_TRIES = 3;
  const CONN_ERR = /hyper|connect|closed|reset|wisp|websocket|eof|broken|channel|stalled/i;
  const EPOXY_URLS = [
    'https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-tls@2.1.19-1/full/epoxy-bundled.js',
    'https://fastly.jsdelivr.net/npm/@mercuryworkshop/epoxy-tls@2.1.19-1/full/epoxy-bundled.js'
  ];
  const CHECK_URLS = ['https://deepai.org/favicon.ico', 'https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/json/wss.json', 'https://login.nvidia.com/.well-known/openid-configuration', 'https://www.gstatic.com/generate_204', 'https://api.deezer.com/infos', 'https://www.cloudflare.com/cdn-cgi/trace'];
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const toWss = entry => {
    const t = String(entry || '').trim();
    if (!t) return null;
    const u = t.includes('://') ? t : 'wss://' + t + '/';
    return u.endsWith('/') ? u : u + '/';
  };
  const NO_BODY = new Set([101, 204, 205, 304]);

  let lastRotateAt = 0, bootP = null, sandstone = null, current = null, rotating = null, okUrl = null, okAt = 0, inflight = 0, verified = false, linkUp = false;
  let aliveFallback = null, lastDone = Date.now(), vchain = Promise.resolve(), trialP = null, rotateStreak = 0, rotateHoldUntil = 0, failStreak = 0, lastSaved = 0;

  const readJson = key => {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  };
  const writeJson = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };

  const readTransport = () => {
    try { return localStorage.getItem(TRANSPORT_KEY) === 'libcurl' ? 'libcurl' : 'epoxy'; } catch { return 'epoxy'; }
  };
  let transportMode = readTransport();
  const useEpoxy = () => transportMode === 'epoxy';
  window.kTransportMode = transportMode;

  try { localStorage.removeItem('WBAD'); localStorage.removeItem('WBAD2'); } catch {}
  let badMem = {};
  const liveBad = () => {
    const now = Date.now();
    for (const k of Object.keys(badMem)) if (badMem[k] <= now) delete badMem[k];
    return badMem;
  };
  const isBad = url => Object.prototype.hasOwnProperty.call(liveBad(), url);
  const strikes = {};
  const markBad = url => {
    if (!url) return;
    const count = Math.min((strikes[url] || 0) + 1, 8);
    strikes[url] = count;
    if (count >= 2) forgetGood(url);
    badMem[url] = Math.max(badMem[url] || 0, Date.now() + Math.min(STRIKE_BASE * Math.pow(4, count - 1), STRIKE_MAX));
  };
  const clearBad = url => { delete badMem[url]; delete strikes[url]; };

  const readGood = () => {
    const v = readJson(LAST_KEY);
    return v && typeof v.url === 'string' && typeof v.ts === 'number' ? v : null;
  };
  const GOOD_LIST_KEY = 'WGOOD3';
  const GOOD_LIST_TTL = 604800000;
  const GOOD_LIST_MAX = 8;
  const GOOD_TRY = 3;
  const FAST_VERIFY_MS = 9000;
  const lastPing = {};
  const readGoodList = () => {
    const list = readJson(GOOD_LIST_KEY);
    const now = Date.now();
    if (!Array.isArray(list)) return [];
    return list.filter(r => r && typeof r.url === 'string' && typeof r.ts === 'number' && r.via === transportMode && now - r.ts < GOOD_LIST_TTL).sort((a, b) => b.ts - a.ts);
  };
  const rememberGood = url => {
    if (!url) return;
    const now = Date.now();
    const raw = readJson(GOOD_LIST_KEY);
    const keep = (Array.isArray(raw) ? raw : []).filter(r => r && typeof r.url === 'string' && typeof r.ts === 'number' && now - r.ts < GOOD_LIST_TTL && !(r.url === url && r.via === transportMode));
    const p = lastPing[url];
    keep.push({ url, via: transportMode, ts: now, ping: Number.isFinite(p) ? p : null });
    keep.sort((a, b) => b.ts - a.ts);
    writeJson(GOOD_LIST_KEY, keep.slice(0, GOOD_LIST_MAX * 2));
  };
  const forgetGood = url => {
    const raw = readJson(GOOD_LIST_KEY);
    if (!Array.isArray(raw)) return;
    writeJson(GOOD_LIST_KEY, raw.filter(r => r && !(r.url === url && r.via === transportMode)));
  };
  const writeGood = url => {
    writeJson(LAST_KEY, { url, ts: Date.now() });
    rememberGood(url);
  };
  const goodCandidates = skip => {
    const out = [];
    const add = u => { if (u && !skip.has(u) && !isBad(u) && !out.includes(u)) out.push(u); };
    readGoodList().forEach(r => add(r.url));
    if (!out.length) {
      const g = readGood();
      if (g && Date.now() - g.ts < LAST_TTL) add(g.url);
    }
    return out;
  };
  const freshGood = () => {
    const good = readGood();
    return good && Date.now() - good.ts < LAST_TTL && !isBad(good.url) ? good.url : null;
  };

  function probe(url, ms, plain) {
    return new Promise(resolve => {
      let ws;
      try { ws = new WebSocket(url); } catch { resolve(null); return; }
      ws.binaryType = 'arraybuffer';
      let connected = false, sentAt = 0;
      const openedAt = performance.now();
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
            if (plain) { finish(Math.round(performance.now() - openedAt)); return; }
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

  function verify(url, ms) {
    const run = vchain.then(() => verifyNow(url, ms || VERIFY_MS));
    vchain = run.catch(() => {});
    return run;
  }

  async function verifyNow(url, ms) {
    const prev = current;
    const other = url !== current;
    const trial = other && !useEpoxy();
    const viaWisp = other && useEpoxy() ? url : undefined;
    let release = null, mine = null;
    if (trial) {
      mine = new Promise(r => { release = r; });
      trialP = mine;
      applyWisp(url);
    }
    const started = Date.now();
    let ok = false, why = '';
    if (!other && Date.now() - lastDone < OK_WINDOW) {
      okUrl = url; okAt = Date.now(); verified = true; clearBad(url);
      return true;
    }
    const budgets = [0.7, 0.15, 0.15];
    const why_list = [];
    const label = useEpoxy() ? 'epoxy ' : '';
    const redirect = useEpoxy() ? 'follow' : 'manual';
    for (let i = 0; i < CHECK_URLS.length && !ok; i++) {
      const left = ms - (Date.now() - started);
      if (left < 1500) break;
      const slice = i < budgets.length ? Math.max(ms * budgets[i], 2500) : 2500;
      const limit = Math.min(left, slice);
      const t0 = Date.now();
      try {
        const res = await Promise.race([
          lcFetch(CHECK_URLS[i], { method: 'GET', redirect, wisp: viaWisp }).then(async r => { await r.arrayBuffer(); return r; }),
          delay(limit).then(() => { throw new Error('timeout ' + limit + 'ms'); })
        ]);
        ok = true;
        why_list.push(label + CHECK_URLS[i] + ' -> ' + res.status + ' ' + (Date.now() - t0) + 'ms');
      } catch (e) {
        why_list.push(label + CHECK_URLS[i] + ' -> ' + String((e && e.message) || e));
      }
    }
    why = why_list.join(' | ');
    if (ok) {
      okUrl = url;
      okAt = Date.now();
      lastPing[url] = okAt - started;
      clearBad(url);
      verified = true;
      if (!other) setLink(true);
    } else {
      if (url === prev) verified = false;
      if (!other) setLink(false);
      if (other) resetConnection(url, true);
      if (trial && prev && current === url) applyWisp(prev);
    }
    if (trial) {
      if (trialP === mine) trialP = null;
      release && release();
    }
    console.log('[net-hub] verify', url, ok, why, trial ? '(trial)' : '', Date.now() - started + 'ms');
    return ok;
  }

  function resetConnection(url, force) {
    if (useEpoxy()) {
      if (!force && inflight) return false;
      const dropped = dropEpoxy(url);
      if (dropped) console.log('[net-hub] reset stalled connection', url);
      return dropped;
    }
    try {
      const connections = (sandstone.libcurl.wisp && sandstone.libcurl.wisp.wisp_connections) || {};
      const connection = connections[url];
      if (!connection) return false;
      if (!force && Object.keys(connection.active_streams || {}).length) return false;
      try { connection.close && connection.close(); } catch {}
      delete connections[url];
      console.log('[net-hub] reset stalled connection', url);
      return true;
    } catch { return false; }
  }

  const tiers = () => {
    const servers = Array.isArray(K.WISP_SERVERS) && K.WISP_SERVERS.length ? K.WISP_SERVERS : (Array.isArray(window.serverList) ? window.serverList : []);
    const primary = [];
    const korona = [];
    const backup = [];
    const taken = u => primary.includes(u) || korona.includes(u) || backup.includes(u);
    const put = (list, entry) => {
      const u = toWss(entry);
      if (u && !taken(u)) list.push(u);
    };
    servers.forEach(entry => { if (typeof entry === 'string' && !entry.includes('://')) put(primary, entry); });
    (Array.isArray(K.KORONA_WISPS) ? K.KORONA_WISPS : []).forEach(entry => put(korona, entry));
    servers.forEach(entry => { if (typeof entry === 'string' && entry.includes('://')) put(backup, entry); });
    put(backup, K.WISP_FALLBACK);
    put(backup, FALLBACK);
    (Array.isArray(K.wispUrls) ? K.wispUrls : []).forEach(entry => put(backup, entry));
    const hint = toWss(window.wlspServer);
    [primary, korona, backup].forEach(tier => {
      const i = tier.indexOf(hint);
      if (i > 0) tier.unshift(tier.splice(i, 1)[0]);
    });
    return [primary, korona, backup];
  };

  async function choose(exclude) {
    const skip = new Set(exclude);
    const mains = new Set(tiers()[0]);
    aliveFallback = null;
    const known = goodCandidates(skip).slice(0, GOOD_TRY);
    if (known.length) {
      const kp = await Promise.all(known.map(u => probe(u, 2500, !mains.has(u))));
      for (let i = 0; i < known.length; i++) {
        if (kp[i] === null) { markBad(known[i]); continue; }
        lastPing[known[i]] = kp[i];
        if (await verify(known[i], FAST_VERIFY_MS)) { writeGood(known[i]); return known[i]; }
        markBad(known[i]);
      }
    }
    for (const tier of tiers()) {
      const deadline = Date.now() + CHOOSE_BUDGET;
      const pool = tier.filter(u => !skip.has(u));
      const ordered = [...pool.filter(u => !isBad(u)), ...pool.filter(u => isBad(u))];
      for (let i = 0; i < ordered.length; i += 6) {
        if (Date.now() > deadline) break;
        const wave = ordered.slice(i, i + 6);
        const pings = await Promise.all(wave.map(u => probe(u, 3000, !mains.has(u))));
        const alive = [];
        wave.forEach((u, j) => {
          if (pings[j] === null) markBad(u, SOFT_TTL);
          else alive.push({ u, ping: pings[j] });
        });
        alive.sort((x, y) => x.ping - y.ping);
        for (const row of alive.slice(0, 2)) {
          if (await verify(row.u)) {
            writeGood(row.u);
            return row.u;
          }
          if (!aliveFallback) aliveFallback = row.u;
          markBad(row.u, VERIFY_BAD_TTL);
        }
      }
    }
    return null;
  }

  const SB_REPO = 'lotsacookie/kstuff';
  const SB_PATH = 'Assets/build/' + DIST;
  const SB_PIN_KEY = 'kSandstonePin';
  const SB_CACHE = 'kstuff-sandstone-v1';
  const SB_FRESH_MS = 600000;
  const SB_SHA = /^[0-9a-f]{40}$/;

  async function sbFetch(url, ms, init) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), ms);
    try {
      const res = await fetch(url, Object.assign({ signal: ctl.signal }, init || {}));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res;
    } finally { clearTimeout(timer); }
  }

  const sbKey = sha => 'https://sandstone-cache.invalid/' + sha + '/' + DIST;

  async function sbCacheGet(sha) {
    try {
      const cache = await caches.open(SB_CACHE);
      const hit = await cache.match(sbKey(sha));
      return hit ? await hit.text() : null;
    } catch { return null; }
  }

  async function sbCachePut(sha, code) {
    try {
      const cache = await caches.open(SB_CACHE);
      await cache.put(sbKey(sha), new Response(code, { headers: { 'Content-Type': 'text/javascript' } }));
      const keep = sbKey(sha);
      for (const req of await cache.keys()) if (req.url !== keep) await cache.delete(req);
    } catch {}
  }

  const sbReadPin = () => {
    const pin = readJson(SB_PIN_KEY);
    return pin && SB_SHA.test(String(pin.sha)) ? pin : null;
  };
  const sbWritePin = (sha, checked) => writeJson(SB_PIN_KEY, { sha, checked });

  async function sbLatestSha() {
    const res = await sbFetch('https://api.github.com/repos/' + SB_REPO + '/commits?sha=main&per_page=1&path=' + encodeURIComponent(SB_PATH), 5000, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
    const list = await res.json();
    const sha = list && list[0] && list[0].sha;
    if (!SB_SHA.test(String(sha))) throw new Error('no commit');
    return sha;
  }

  async function sbFetchAt(sha) {
    const sources = [
      ['https://api.github.com/repos/' + SB_REPO + '/contents/' + SB_PATH + '?ref=' + sha, { headers: { Accept: 'application/vnd.github.raw+json' } }],
      ['https://cdn.jsdelivr.net/gh/' + SB_REPO + '@' + sha + '/' + SB_PATH, null],
      ['https://fastly.jsdelivr.net/gh/' + SB_REPO + '@' + sha + '/' + SB_PATH, null],
      ['https://raw.githubusercontent.com/' + SB_REPO + '/' + sha + '/' + SB_PATH, null]
    ];
    for (const [url, init] of sources) {
      try {
        const code = await (await sbFetch(url, 30000, init)).text();
        if (code.length > 100000 && /\bexport\b/.test(code)) return code;
      } catch {}
    }
    return null;
  }

  const sbImport = code => import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));

  async function loadSandstone() {
    const pin = sbReadPin();
    let code = pin ? await sbCacheGet(pin.sha) : null;
    if (code && Date.now() - (pin.checked || 0) < SB_FRESH_MS) {
      try { return await sbImport(code); } catch { code = null; }
    }
    let sha = null;
    try { sha = await sbLatestSha(); } catch {}
    if (sha && pin && sha === pin.sha && code) {
      try {
        const mod = await sbImport(code);
        sbWritePin(sha, Date.now());
        return mod;
      } catch { code = null; }
    }
    const target = sha || (pin && !code ? pin.sha : null);
    if (target) {
      const fresh = await sbFetchAt(target);
      if (fresh) {
        try {
          const mod = await sbImport(fresh);
          sbCachePut(target, fresh);
          sbWritePin(target, sha ? Date.now() : 0);
          return mod;
        } catch {}
      }
    }
    if (code) { try { return await sbImport(code); } catch {} }
    for (const b of BASES) { try { return await import(b + DIST); } catch {} }
    const raw = await (await fetch('https://raw.githubusercontent.com/lotsacookie/kstuff/main/Assets/build/' + DIST)).text();
    return sbImport(raw);
  }

  const epoxyPools = new Map();
  const slotOf = new WeakMap();
  let epoxyLoad = null;

  function loadEpoxy() {
    if (epoxyLoad) return epoxyLoad;
    epoxyLoad = (async () => {
      let last = null;
      for (const u of EPOXY_URLS) {
        try {
          const m = await import(u);
          if (typeof m.default === 'function') await m.default();
          if (!m.EpoxyClient || !m.EpoxyClientOptions) throw new Error('epoxy exports missing');
          return m;
        } catch (e) { last = e; }
      }
      throw last || new Error('epoxy failed to load');
    })().catch(e => { epoxyLoad = null; throw e; });
    return epoxyLoad;
  }

  const freeClient = (p, again) => {
    p.then(client => {
      try { client.free && client.free(); }
      catch { if (again) setTimeout(() => freeClient(p, false), 10000); }
    }, () => {});
  };

  function newSlot(wisp) {
    const slot = { busy: 0, dead: false, last: Date.now() };
    slot.p = loadEpoxy().then(async m => {
      const o = new m.EpoxyClientOptions();
      o.user_agent = navigator.userAgent;
      return await new m.EpoxyClient(wisp, o);
    });
    slot.p.catch(() => { slot.dead = true; removeSlot(wisp, slot); });
    return slot;
  }

  function removeSlot(wisp, slot) {
    const pool = epoxyPools.get(wisp);
    if (!pool) return;
    const i = pool.indexOf(slot);
    if (i >= 0) pool.splice(i, 1);
  }

  function dropSlot(wisp, slot) {
    if (slot.dead) return;
    slot.dead = true;
    removeSlot(wisp, slot);
    freeClient(slot.p, true);
  }

  function dropSlotOf(res) {
    const info = slotOf.get(res);
    if (info) dropSlot(info.wisp, info.slot);
  }

  function dropEpoxy(url) {
    const pool = epoxyPools.get(url);
    epoxyPools.delete(url);
    if (!pool || !pool.length) return false;
    pool.forEach(slot => { slot.dead = true; freeClient(slot.p, true); });
    return true;
  }

  function pickSlot(wisp) {
    let pool = epoxyPools.get(wisp);
    if (!pool) { pool = []; epoxyPools.set(wisp, pool); }
    const now = Date.now();
    pool.slice().forEach(s => { if (!s.busy && now - s.last > IDLE_RECYCLE_MS) dropSlot(wisp, s); });
    let best = null;
    pool.forEach(s => { if (!s.dead && (!best || s.busy < best.busy)) best = s; });
    if (!best || (best.busy > 0 && pool.length < EPOXY_POOL)) {
      best = newSlot(wisp);
      pool.push(best);
    }
    return best;
  }

  const abortError = () => new DOMException('The operation was aborted.', 'AbortError');

  async function epoxyFetch(url, init) {
    const wisp = (init && init.wisp) || current;
    const method = String((init && init.method) || 'GET').toUpperCase();
    const idem = method === 'GET' || method === 'HEAD';
    const sig = init && init.signal;
    if (sig && sig.aborted) throw abortError();
    const slot = pickSlot(wisp);
    let client;
    try { client = await slot.p; } catch (e) {
      if (e && typeof e === 'object') e.epoxy_unavailable = true;
      throw e;
    }
    const o = { method: (init && init.method) || 'GET', redirect: (init && init.redirect) || 'follow' };
    const h = init && init.headers;
    if (h) o.headers = h instanceof Headers ? Object.fromEntries(h.entries()) : Array.isArray(h) ? Object.fromEntries(h) : Object.assign({}, h);
    if (init && init.body != null) o.body = init.body;
    slot.busy++;
    slot.last = Date.now();
    let timer = null, onAbort = null;
    const guard = new Promise((_, rej) => {
      if (idem) timer = setTimeout(() => rej(new Error('epoxy request stalled ' + TTFB_MS + 'ms')), TTFB_MS);
      if (sig) {
        onAbort = () => rej(abortError());
        sig.addEventListener('abort', onAbort, { once: true });
      }
    });
    const p = client.fetch(String(url), o);
    p.catch(() => {});
    try {
      const res = await Promise.race([p, guard]);
      slotOf.set(res, { wisp, slot });
      return res;
    } catch (e) {
      if (!(sig && sig.aborted) && CONN_ERR.test(String((e && e.message) || e))) dropSlot(wisp, slot);
      throw e;
    } finally {
      slot.busy--;
      slot.last = Date.now();
      clearTimeout(timer);
      if (sig && onAbort) sig.removeEventListener('abort', onAbort);
    }
  }

  async function readBody(res, signal) {
    if (!res.body || !res.body.getReader) return res.arrayBuffer();
    const reader = res.body.getReader();
    const chunks = [];
    let total = 0;
    const stop = () => { try { reader.cancel().catch(() => {}); } catch {} };
    for (;;) {
      if (signal && signal.aborted) { stop(); throw abortError(); }
      let timer;
      const step = await Promise.race([
        reader.read(),
        new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('body stalled ' + BODY_IDLE_MS + 'ms')), BODY_IDLE_MS); })
      ]).catch(e => { stop(); throw e; }).finally(() => clearTimeout(timer));
      if (step.done) break;
      chunks.push(step.value);
      total += step.value.byteLength;
    }
    const out = new Uint8Array(total);
    let at = 0;
    chunks.forEach(c => { out.set(c, at); at += c.byteLength; });
    return out.buffer;
  }

  function lcFetch(url, opts) {
    if (useEpoxy()) return epoxyFetch(url, opts);
    return sandstone.libcurl.fetch(url, opts);
  }

  function syncSandstoneTransport() {
    try {
      const net = sandstone && sandstone.network;
      if (!net || typeof net.set_transport_fetch !== 'function') return;
      net.set_transport_fetch(useEpoxy() ? (url, init) => core(String(url), init || {}) : null);
    } catch {}
  }

  function applyWisp(url) {
    current = url;
    sandstone.network.set_websocket(url);
    try { sandstone.network.set_wisp_pool([url]); } catch {}
    syncSandstoneTransport();
    if (useEpoxy()) {
      epoxyPools.forEach((pool, k) => {
        if (k !== url) setTimeout(() => { if (k !== current) dropEpoxy(k); }, 20000);
      });
      try { pickSlot(url); } catch {}
    }
    window.kNetWisp = url;
    updateWispUi();
  }

  function boot() {
    if (bootP) return bootP;
    bootP = (async () => {
      const sg = await loadSandstone();
      sandstone = sg;
      let url = null;
      let probed = false;
      const mainsNow = tiers()[0];
      const known = goodCandidates(new Set()).slice(0, GOOD_TRY);
      if (known.length) {
        const bp = await Promise.all(known.map(u => probe(u, BOOT_PROBE_MS, !mainsNow.includes(u))));
        known.forEach((u, i) => { if (bp[i] === null) markBad(u); });
        const at = bp.findIndex(p => p !== null);
        if (at >= 0) { url = known[at]; lastPing[url] = bp[at]; probed = true; }
      }
      if (!url && window.kWispP && window.kWispP.then) await Promise.race([window.kWispP.catch(() => {}), delay(6000)]);
      url = url || toWss(window.wlspServer) || tiers().flat()[0] || FALLBACK;
      applyWisp(url);
      setLink(probed);
      for (let i = 0; i < 300 && !sg.libcurl.ready; i++) await delay(100);
      if (!sg.libcurl.ready && !useEpoxy()) throw new Error('libcurl did not load');
      console.log('[net-hub] ready via', current, 'transport', transportMode);
      setTimeout(linkMonitor, 1000);
      return sg;
    })().catch(e => { bootP = null; sandstone = null; setLink(false); throw e; });
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
        if (Date.now() < rotateHoldUntil) return current;
        if (okUrl === current && Date.now() - okAt < OK_WINDOW) return current;
        if (Date.now() - lastDone < OK_WINDOW) return current;
        if (await verify(current)) { writeGood(current); return current; }
        await delay(800);
        if (await verify(current)) { writeGood(current); return current; }
        if (resetConnection(current)) {
          await delay(400);
          if (await verify(current)) { writeGood(current); return current; }
        }
      }
      const from = bad || current;
      if (from) markBad(from, auto ? VERIFY_BAD_TTL : SOFT_TTL);
      const hit = await choose(from ? [from] : []);
      const flat = tiers().flat();
      const next = hit || aliveFallback || flat.find(u => u !== from && !isBad(u)) || flat.find(u => u !== from) || flat[0] || FALLBACK;
      if (next && next !== current) applyWisp(next);
      if (hit) {
        writeGood(current);
        setLink(true);
        rotateStreak = 0;
        rotateHoldUntil = 0;
      } else {
        verified = false;
        setLink(false);
        rotateStreak++;
        rotateHoldUntil = Date.now() + Math.min(HOLD_BASE * Math.pow(2, rotateStreak - 1), HOLD_MAX);
      }
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

  const noteOk = () => {
    lastDone = Date.now();
    failStreak = 0;
    if (current) setLink(true);
    if (current && lastDone - lastSaved > GOOD_SAVE_EVERY) {
      lastSaved = lastDone;
      writeGood(current);
    }
  };

  const noteFail = () => {
    failStreak++;
    if (failStreak >= 2) setLink(false);
    if (failStreak >= FAIL_ROTATE && !rotating) {
      failStreak = 0;
      rotate(current, true).catch(() => {});
    }
  };

  async function core(url, init) {
    await boot();
    const gate = rotating || trialP;
    if (gate) await Promise.race([gate.catch(() => {}), delay(ROTATE_WAIT)]);
    const outer = init.signal;
    const hard = new AbortController();
    let hardHit = false;
    const timer = setTimeout(() => { hardHit = true; hard.abort(); }, HARD_MS);
    if (outer) {
      if (outer.aborted) hard.abort();
      else outer.addEventListener('abort', () => hard.abort(), { once: true });
    }
    const aborted = () => hardHit || hard.signal.aborted || (outer && outer.aborted);
    const opts = Object.assign({}, init, { signal: hard.signal });
    const run = async () => {
      inflight++;
      try {
        const res = await lcFetch(url, opts);
        noteOk();
        return res;
      } finally { inflight--; }
    };
    const m = String(init.method || 'GET').toUpperCase();
    const idem = m === 'GET' || m === 'HEAD';
    let last = null;
    try {
      for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
        try {
          return await run();
        } catch (err) {
          last = err;
          if (aborted()) throw err;
          const retryable = idem || /http\/2|framing|stream error/i.test(String((err && err.message) || err));
          if (!retryable || attempt === MAX_TRIES - 1) break;
          await delay(120 * (attempt + 1));
          if (aborted()) throw err;
        }
      }
      noteFail();
      throw last;
    } finally { clearTimeout(timer); }
  }

  async function doFetch(d) {
    const ctl = new AbortController();
    live.set(d.key, ctl);
    owners.set(d.key, d.owner || null);
    return core(d.url, Object.assign({ redirect: 'follow' }, d.init || {}, { signal: ctl.signal }));
  }

  function setTransport(next) {
    const mode = next === 'libcurl' ? 'libcurl' : 'epoxy';
    const changed = mode !== transportMode;
    transportMode = mode;
    window.kTransportMode = mode;
    try { localStorage.setItem(TRANSPORT_KEY, mode); } catch {}
    syncSandstoneTransport();
    updateTransportUi();
    if (!changed) return mode;
    verified = false;
    okUrl = null;
    okAt = 0;
    lastDone = 0;
    failStreak = 0;
    setLink(false);
    console.log('[net-hub] transport set to', mode);
    if (sandstone && current) verify(current).then(ok => { if (ok) writeGood(current); }).catch(() => {});
    return mode;
  }
  K.setTransport = setTransport;
  K.getTransport = () => transportMode;

  window.kNetDirect = {
    fetch: (url, init) => core(String(url), Object.assign({ redirect: 'follow' }, init || {})),
    ready: () => boot().then(() => current),
    rotate: (bad, soft) => rotate(bad ? toWss(bad) : null, !!soft),
    sandstone: () => boot(),
    libcurl: () => boot().then(sg => sg.libcurl),
    websocket: async (url, protocols) => {
      const sg = await boot();
      return new sg.libcurl.WebSocket(url, protocols);
    },
    wisp: () => current,
    transport: () => transportMode,
    setTransport
  };

  function cookieLines(res) {
    const out = [];
    const add = v => { if (typeof v === 'string' && v && !out.includes(v)) out.push(v); };
    try {
      const sc = res.headers && res.headers.getSetCookie && res.headers.getSetCookie();
      if (sc) sc.forEach(add);
    } catch {}
    [res.rawHeaders, res.raw_headers].forEach(raw => {
      if (!raw) return;
      try {
        const pairs = Array.isArray(raw) ? raw : Object.keys(raw).map(k => [k, raw[k]]);
        pairs.forEach(p => {
          if (!Array.isArray(p) || String(p[0]).toLowerCase() !== 'set-cookie') return;
          if (Array.isArray(p[1])) p[1].forEach(add); else add(p[1]);
        });
      } catch {}
    });
    return out;
  }

  async function handleFetch(d, reply) {
    const m = String((d.init && d.init.method) || 'GET').toUpperCase();
    const attempts = m === 'GET' || m === 'HEAD' ? 2 : 1;
    let failure = null;
    try {
      for (let i = 0; i < attempts; i++) {
        let res = null;
        try {
          res = await doFetch(d);
          const headers = [];
          try { res.headers.forEach((v, k) => headers.push([k, v])); } catch {}
          try {
            if (!headers.some(h => h[0].toLowerCase() === 'set-cookie')) cookieLines(res).forEach(c => headers.push(['set-cookie', c]));
          } catch {}
          const ctl = live.get(d.key);
          const buf = NO_BODY.has(res.status) ? null : await readBody(res, ctl && ctl.signal);
          reply({ type: 'kstuff-net:res', id: d.id, ok: true, status: res.status, statusText: res.statusText || '', url: res.url || d.url, headers, body: buf }, buf ? [buf] : []);
          return;
        } catch (e) {
          failure = e;
          if (res) dropSlotOf(res);
          const ctl = live.get(d.key);
          if (ctl && ctl.signal.aborted) break;
        }
      }
      reply({ type: 'kstuff-net:res', id: d.id, ok: false, error: String((failure && failure.message) || failure) });
    } finally { live.delete(d.key); owners.delete(d.key); }
  }

  const isPageFrame = src => {
    try { return [...document.querySelectorAll('iframe')].some(f => f.contentWindow === src && f.hasAttribute('srcdoc') && !f.__proxied); }
    catch { return false; }
  };

  const hostOf = u => { try { return new URL(u).host; } catch { return String(u || ''); } };
  const updateWispUi = () => {
    const cur = document.getElementById('proxy-wisp-current');
    if (cur) cur.textContent = current ? 'Current: ' + hostOf(current) : 'Not connected yet';
  };
  const updateConnUi = () => {
    const box = document.getElementById('conn-indicator');
    if (!box) return;
    const on = linkUp && !!current;
    const state = on ? 'on' : 'off';
    if (box.dataset.state === state) return;
    box.dataset.state = state;
    const icon = document.getElementById('conn-icon');
    const text = document.getElementById('conn-text');
    if (icon) icon.className = 'ph ' + (on ? 'ph-plugs-connected' : 'ph-plugs');
    if (text) text.textContent = on ? 'Connected' : 'Not connected';
  };
  function setLink(value) {
    linkUp = !!value;
    updateConnUi();
  }
  async function linkMonitor() {
    if (document.hidden || !sandstone || !current || rotating || trialP) return;
    if (navigator.onLine === false) { setLink(false); return; }
    if (linkUp && Date.now() - lastDone < 30000) return;
    try { await verify(current); } catch { setLink(false); }
  }
  setInterval(linkMonitor, 30000);
  window.addEventListener('online', () => setTimeout(linkMonitor, 500));
  window.addEventListener('offline', () => setLink(false));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) linkMonitor(); });
  const updateTransportUi = () => {
    const sel = document.getElementById('proxy-transport-select');
    if (sel && sel.value !== transportMode) sel.value = transportMode;
    const st = document.getElementById('proxy-transport-status');
    if (st) st.textContent = transportMode === 'epoxy'
      ? 'Every proxied request, including the in-page browser engine, uses epoxy. Websockets stay on libcurl.'
      : 'Every proxied request uses libcurl.';
  };
  const bindSwitch = () => {
    const btn = document.getElementById('switch-wisp-btn');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      const st = document.getElementById('proxy-wisp-status');
      const label = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Switching...';
      if (st) st.textContent = 'Testing other wisps, this can take a little while.';
      const from = current;
      try {
        await rotate(from, false);
        if (st) {
          if (current && current !== from) st.textContent = 'Switched to ' + hostOf(current) + (verified ? '' : ' (not verified yet)');
          else st.textContent = 'No other wisp could be reached, staying on ' + hostOf(current);
        }
      } catch {
        if (st) st.textContent = 'Switch failed, try again.';
      }
      btn.disabled = false;
      btn.innerHTML = label;
      updateWispUi();
    });
  };
  const bindTransport = () => {
    const sel = document.getElementById('proxy-transport-select');
    if (!sel) return;
    sel.value = transportMode;
    updateTransportUi();
    if (sel.dataset.bound) return;
    sel.dataset.bound = '1';
    sel.addEventListener('change', () => { setTransport(sel.value); });
  };
  const bindUi = () => { bindSwitch(); bindTransport(); updateWispUi(); updateConnUi(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindUi);
  else bindUi();
  document.addEventListener('click', e => {
    if (e.target && e.target.closest && e.target.closest('.settings-tab')) bindUi();
  });
  window.addEventListener('storage', e => {
    if (e.key === TRANSPORT_KEY) setTransport(e.newValue);
  });

  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || typeof d !== 'object' || typeof d.type !== 'string' || d.type.indexOf('kstuff-net:') !== 0) return;
    const src = e.source;
    if (!src || !isPageFrame(src)) return;
    const reply = (m, t) => { try { src.postMessage(m, '*', t || []); } catch {} };
    if (d.type === 'kstuff-net:hello') { dropOwned(src); reply({ type: 'kstuff-net:hello-ack', wisp: current }); return; }
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
