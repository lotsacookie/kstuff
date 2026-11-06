export function init(K) {
  const BASES = [
    'https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/build/',
    'https://fastly.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/build/'
  ];
  const DIST = 'sandstone.mjs';
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
  const VERIFY_EVERY = 3;
  const VERIFY_MS = 22000;
  const MAIN_VERIFY_MS = 16000;
  const MAIN_TRIALS = 2;
  const MAIN_RETRY_MIN = 60000;
  const MAIN_RETRY_MAX = 1200000;
  const HOLD_BASE = 60000;
  const HOLD_MAX = 600000;
  const WS_BUSY_MAX = 1800000;
  const STALL_MS = 45000;
  const RETRY_STEPS = [3000, 6000, 12000, 24000, 30000];
  const STRIKE_BASE = 30000;
  const STRIKE_MAX = 1800000;
  const CHECK_URLS = ['https://deepai.org/favicon.ico', 'https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/json/wss.json', 'https://login.nvidia.com/.well-known/openid-configuration', 'https://www.gstatic.com/generate_204', 'https://api.deezer.com/infos', 'https://www.cloudflare.com/cdn-cgi/trace'];
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const toWss = entry => {
    const t = String(entry || '').trim();
    if (!t) return null;
    const u = t.includes('://') ? t : 'wss://' + t + '/';
    return u.endsWith('/') ? u : u + '/';
  };
  const NO_BODY = new Set([101, 204, 205, 304]);

  let lastRotateAt = 0, bootP = null, sandstone = null, current = null, rotating = null, watching = false, okUrl = null, okAt = 0, inflight = 0, verified = false, retryTimer = null, retryStep = 0, watchTick = 0;
  let aliveFallback = null, lastDone = Date.now(), vchain = Promise.resolve(), trialP = null, mainCancel = false, mainFails = 0, nextMainTry = 0, rotateStreak = 0, rotateHoldUntil = 0;
  const sockets = new Map();
  const busySockets = () => {
    const now = Date.now();
    for (const [ws, at] of sockets) {
      if (ws.readyState === 2 || ws.readyState === 3 || now - at > WS_BUSY_MAX) sockets.delete(ws);
    }
    return sockets.size;
  };

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
  const strikes = {};
  const markBad = url => {
    if (!url) return;
    const count = Math.min((strikes[url] || 0) + 1, 8);
    strikes[url] = count;
    badMem[url] = Math.max(badMem[url] || 0, Date.now() + Math.min(STRIKE_BASE * Math.pow(4, count - 1), STRIKE_MAX));
  };
  const clearBad = url => { delete badMem[url]; delete strikes[url]; };

  const readGood = () => {
    const v = readJson(LAST_KEY);
    return v && typeof v.url === 'string' && typeof v.ts === 'number' ? v : null;
  };
  const writeGood = url => writeJson(LAST_KEY, { url, ts: Date.now() });
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

  // Checks are serialized: a check may temporarily point the shared libcurl at a candidate wisp, so two of
  // them running at once used to swap the wisp out from under each other (false timeouts on every wisp).
  function verify(url, ms) {
    const run = vchain.then(() => verifyNow(url, ms || VERIFY_MS));
    vchain = run.catch(() => {});
    return run;
  }

  async function verifyNow(url, ms) {
    const prev = current;
    const trial = url !== current;
    let release = null, mine = null;
    if (trial) {
      mine = new Promise(r => { release = r; });
      trialP = mine;
      applyWisp(url);
    }
    const started = Date.now();
    let ok = false, why = '';
    if (!trial && Date.now() - lastDone < OK_WINDOW) {
      okUrl = url; okAt = Date.now(); verified = true; retryStep = 0; clearBad(url);
      return true;
    }
    const budgets = [0.7, 0.15, 0.15];
    const why_list = [];
    for (let i = 0; i < CHECK_URLS.length && !ok; i++) {
      const left = ms - (Date.now() - started);
      if (left < 1500) break;
      const slice = i < budgets.length ? Math.max(ms * budgets[i], 2500) : 2500;
      const limit = Math.min(left, slice);
      const t0 = Date.now();
      try {
        const res = await Promise.race([
          lcFetch(CHECK_URLS[i], { method: 'GET', redirect: 'manual' }).then(async r => { await r.arrayBuffer(); return r; }),
          delay(limit).then(() => { throw new Error('timeout ' + limit + 'ms'); })
        ]);
        ok = true;
        why_list.push(CHECK_URLS[i] + ' -> ' + res.status + ' ' + (Date.now() - t0) + 'ms');
      } catch (e) {
        why_list.push(CHECK_URLS[i] + ' -> ' + String((e && e.message) || e));
      }
    }
    why = why_list.join(' | ');
    if (ok) {
      okUrl = url;
      okAt = Date.now();
      clearBad(url);
      verified = true;
      retryStep = 0;
    } else {
      if (url === prev) verified = false;
      if (trial) {
        // Drop the half-open connection to the failed candidate so a later try starts clean, then go back.
        resetConnection(url, true);
        if (prev && current === url) applyWisp(prev);
      }
    }
    if (trial) {
      if (trialP === mine) trialP = null;
      release && release();
    }
    console.log('[net-hub] verify', url, ok, why, trial ? '(trial)' : '', Date.now() - started + 'ms');
    return ok;
  }

  function resetConnection(url, force) {
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
    const good = readGood();
    if (good && !skip.has(good.url) && Date.now() - good.ts < LAST_TTL && !isBad(good.url)) {
      if (await verify(good.url)) return good.url;
      markBad(good.url);
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

  const idle = () => !inflight && !live.size && !busySockets();
  let mainBusy = null;
  // Tries to move back onto a main (primary) wisp. It only runs while nothing is using the network, tries at most
  // MAIN_TRIALS candidates per run, strikes the ones that fail, and backs off between runs. It used to re-test every
  // pingable primary every minute, leaving the shared wisp pointed at an unverified candidate most of the time.
  async function preferMain() {
    if (mainBusy) return mainBusy;
    mainBusy = (async () => {
      mainCancel = false;
      const primary = tiers()[0];
      if (!primary.length || primary.includes(current)) {
        nextMainTry = Date.now() + MAIN_RETRY_MIN;
        return false;
      }
      const pool = primary.filter(u => !isBad(u));
      let trials = 0;
      for (let i = 0; i < pool.length && trials < MAIN_TRIALS; i += 8) {
        const wave = pool.slice(i, i + 8);
        const pings = await Promise.all(wave.map(u => probe(u, 3000)));
        const alive = [];
        wave.forEach((u, j) => { if (pings[j] !== null) alive.push({ u, ping: pings[j] }); });
        alive.sort((x, y) => x.ping - y.ping);
        for (const row of alive) {
          if (trials >= MAIN_TRIALS || mainCancel || rotating || !idle()) break;
          trials++;
          if (await verify(row.u, MAIN_VERIFY_MS)) {
            writeGood(row.u);
            mainFails = 0;
            console.log('[net-hub] main wisp back, using', row.u);
            return true;
          }
          markBad(row.u);
        }
        if (mainCancel || rotating || !idle()) break;
      }
      if (trials) mainFails++;
      nextMainTry = Date.now() + Math.min(MAIN_RETRY_MIN * Math.pow(2, Math.max(mainFails - 1, 0)), MAIN_RETRY_MAX);
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
    if (current && !tiers()[0].includes(current) && Date.now() >= nextMainTry && !rotating && !mainBusy && !document.hidden && idle()) preferMain().catch(() => {});
    // Pending requests only count as "busy" while requests are actually completing. If nothing has finished for
    // STALL_MS the wisp is probably stuck, and checking it is exactly what is needed (hung requests used to
    // keep the watchdog off forever).
    const pending = inflight > 0 || live.size > 0;
    const stalled = pending && Date.now() - Math.max(lastDone, okAt) >= STALL_MS;
    if (!current || document.hidden || rotating || mainBusy || (pending && !stalled) || busySockets()) return;
    let healthy = (await probe(current, 4000, !tiers()[0].includes(current))) !== null;
    watchTick++;
    if (healthy && stalled) healthy = await verify(current);
    else if (healthy && (!verified || watchTick % VERIFY_EVERY === 0)) { if (await verify(current)) writeGood(current); }
    if (!healthy) fails++;
    else {
      fails = 0;
      writeGood(current);
    }
    if (fails >= (stalled ? 2 : (verified ? WATCH_FAILS : 1))) {
      fails = 0;
      rotate(current, true);
    }
  }

  async function loadSandstone() {
    for (const b of BASES) { try { return await import(b + DIST); } catch {} }
    const code = await (await fetch('https://raw.githubusercontent.com/lotsacookie/kstuff/main/Assets/build/' + DIST)).text();
    return import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
  }

  function lcFetch(url, opts) {
    let via = sandstone.libcurl;
    try {
      const sess = sandstone.network && sandstone.network.session;
      if (sess && typeof sess.fetch === 'function') via = sess;
    } catch {}
    return via.fetch(url, Object.assign({ credentials: 'omit' }, opts));
  }

  function applyWisp(url) {
    current = url;
    sandstone.network.set_websocket(url);
    try { sandstone.network.set_wisp_pool([url]); } catch {}
    window.kNetWisp = url;
    updateWispUi();
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
      for (let i = 0; i < 50 && !(sg.network && sg.network.session); i++) await delay(100);
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
      mainCancel = true;
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
        rotateStreak = 0;
        rotateHoldUntil = 0;
      } else {
        // Nothing verified. Back off instead of re-running the whole search (and re-pointing the shared wisp)
        // every few seconds; it is usually the check or the network failing, not every wisp at once.
        verified = false;
        rotateStreak++;
        rotateHoldUntil = Date.now() + Math.min(HOLD_BASE * Math.pow(2, rotateStreak - 1), HOLD_MAX);
        scheduleRetry();
      }
      lastRotateAt = Date.now();
      console.log('[net-hub] rotated to', current);
      return current;
    })().finally(() => { rotating = null; });
    return rotating;
  }

  function scheduleRetry() {
    if (retryTimer || verified) return;
    const wait = Math.max(RETRY_STEPS[Math.min(retryStep, RETRY_STEPS.length - 1)], rotateHoldUntil - Date.now());
    retryStep++;
    retryTimer = setTimeout(async () => {
      retryTimer = null;
      if (verified) { retryStep = 0; return; }
      try { if (!rotating) await rotate(current); } catch {}
      if (verified) retryStep = 0;
      else scheduleRetry();
    }, wait);
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
    const opts = Object.assign({}, init, { signal: hard.signal });
    const run = async () => {
      inflight++;
      try {
        const res = await lcFetch(url, opts);
        lastDone = Date.now();
        return res;
      } finally { inflight--; }
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
    rotate: (bad, soft) => rotate(bad ? toWss(bad) : null, !!soft),
    // The hub's single Singuloxy instance. Everything that needs sandstone (ProxyFrame, network) or libcurl
    // (WebSocket) borrows it from here instead of loading and configuring its own copy.
    sandstone: () => boot(),
    libcurl: () => boot().then(sg => sg.libcurl),
    websocket: async (url, protocols) => {
      const sg = await boot();
      const ws = new sg.libcurl.WebSocket(url, protocols);
      sockets.set(ws, Date.now());
      try { ws.addEventListener('close', () => sockets.delete(ws)); } catch {}
      return ws;
    },
    wisp: () => current
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

  const hostOf = u => { try { return new URL(u).host; } catch { return String(u || ''); } };
  const updateWispUi = () => {
    const cur = document.getElementById('proxy-wisp-current');
    if (cur) cur.textContent = current ? 'Current: ' + hostOf(current) : 'Not connected yet';
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
  const bindUi = () => { bindSwitch(); updateWispUi(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindUi);
  else bindUi();
  document.addEventListener('click', e => {
    if (e.target && e.target.closest && e.target.closest('.settings-tab')) bindUi();
  });

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
