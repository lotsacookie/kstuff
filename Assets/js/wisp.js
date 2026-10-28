const STORAGE_SOURCES = [
  'https://cdn.jsdelivr.net/gh/TongSherbet/storage@main/loader.js',
  'https://raw.githubusercontent.com/TongSherbet/storage/main/loader.js'
];
const SYNC_KEY = 'WSYNC';
const SYNC_TTL = 3600000;
const SYNC_TIMEOUT = 3500;
const SYNC_MAX = 32;

const HOST_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
const WSS_RE = /^wss:\/\/[a-z0-9.-]+(:\d{1,5})?(\/[\w\-./]*)?$/i;

// Reads the serverList array out of TongSherbet/storage's loader.js without eval.
// Handles \uXXXX escapes and the "ten.xxx".split("").reverse().join("") trick.
// loader.js is obfuscated: it passes its real code to eval() via globalThis. We run only the
// decoder arithmetic against a capturing stub (eval never executes) and read the host array.
function decodeLoaderList(src, depth = 0) {
  if (depth > 3 || typeof src !== 'string') return [];
  let code = null;
  try {
    const stub = new Proxy({}, { get: (_, k) => (a) => { if (code === null && typeof a === 'string') code = a; } });
    new Function('globalThis', src)(stub);
  } catch {}
  if (!code) return [];
  const arrays = code.match(/\[(?:\s*"[^"\\]{3,120}"\s*,?)+\s*\]/g) || [];
  for (const arr of arrays) {
    let vals;
    try { vals = JSON.parse(arr.replace(/,\s*\]$/, ']')); } catch { continue; }
    const out = [];
    for (const v of vals) {
      const value = String(v).trim();
      if ((HOST_RE.test(value) || WSS_RE.test(value)) && !out.includes(value)) out.push(value);
      if (out.length >= SYNC_MAX) break;
    }
    if (out.length >= 3 && out.length >= vals.length * 0.6) return out;
  }
  return decodeLoaderList(code, depth + 1);
}

export function parseServerList(src) {
  if (typeof src !== 'string') return [];
  const text = src.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  const block = text.match(/serverList\s*=\s*\[([\s\S]*?)\]\s*[;,]/);
  if (!block) return decodeLoaderList(src);
  const item = /(["'])((?:\\.|(?!\1)[^\\])*)\1(\s*\.split\(\s*(?:""|'')\s*\)\s*\.reverse\(\)\s*\.join\(\s*(?:""|'')\s*\))?/g;
  const out = [];
  let m;
  while ((m = item.exec(block[1]))) {
    const value = (m[3] ? [...m[2]].reverse().join('') : m[2]).trim();
    if ((HOST_RE.test(value) || WSS_RE.test(value)) && !out.includes(value)) out.push(value);
    if (out.length >= SYNC_MAX) break;
  }
  return out;
}

export function init(K) {
  const WISP_LIST_PATH = 'Assets/json/wss.json';
  const TEST_TIMEOUT = 3000;
  const PROBE_WAVE = 6;
  const SPEED_TARGETS = [
    { host: 'speedtest.tele2.net', path: '/10MB.zip' },
    { host: 'ipv4.download.thinkbroadband.com', path: '/10MB.zip' }
  ];
  const SPEED_CHUNK = 262144;
  const SPEED_CHUNKS = 4;
  const SPEED_LIMIT = 6000;
  const SPEED_GOOD = 1500000;
  const SPEED_CANDIDATES = 4;
  const EXTRA_LIMIT = 16;
  const BACKUP_KEY = 'WBK';
  const BACKUP_TTL = 600000;
  const HISTORY_KEY = 'WBH';

  K.WISP_SERVERS = [
    'cdn.northstreetumc.org',
    'cdn.vipersfutbol.com',
    'cdn.pcesc.org',
    'cdn.kcchallengevbc.com',
    'cdn.slcbmooc.org',
    'cdn.topstargym.net',
    'cdn.goaplytexas.org',
    'cdn.clearfieldswimming.com',
    'wss://athollcottage.com/connection/',
    'wss://api.personalloanonline.net/ws/',
    'wss://kristenblackburnvolleyballcamps.com/socket/',
    'wss://southpadreislandkiteboarding.com/socket/'
  ];
  K.WISP_FALLBACK = 'wss://api.personalloanonline.net/ws/';
  K.WISP_VERSION = 7;
  K.WISP_BASE = K.WISP_SERVERS.slice();
  console.log('[wisp] module loaded, build', K.WISP_VERSION);
  K.wispUrls = [];
  window.serverList = K.WISP_SERVERS;

  const wlspUrl = entry => (entry.includes('://') ? entry : `wss://${entry}/`);
  const isBackupServer = entry => entry.includes('://');

  const readStore = key => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const writeStore = (key, value) => {
    try { localStorage.setItem(key, String(value)); } catch {}
  };

  function testWlspDomain(entry, timeoutMs = TEST_TIMEOUT) {
    return new Promise(resolve => {
      let ws;
      try {
        ws = new WebSocket(wlspUrl(entry));
      } catch {
        resolve(null);
        return;
      }
      ws.binaryType = 'arraybuffer';
      let connected = false;
      let sentAt = 0;
      let timer = 0;
      const streamId = (Math.floor(Math.random() * 0xFFFFFFFE) + 1) >>> 0;
      const finish = ping => {
        clearTimeout(timer);
        ws.onmessage = ws.onerror = ws.onclose = null;
        try { ws.close(); } catch {}
        resolve(ping);
      };
      timer = setTimeout(() => finish(null), timeoutMs);
      ws.onmessage = e => {
        if (!(e.data instanceof ArrayBuffer) || e.data.byteLength < 5) return;
        const view = new DataView(e.data);
        const type = view.getUint8(0);
        const stream = view.getUint32(1, true);
        if (!connected) {
          if (type === 5 && stream === 0) {
            ws.send(new Uint8Array([5, 0, 0, 0, 0, 2, 1]));
          } else if (type === 3 && stream === 0) {
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
        if (stream !== streamId) return;
        finish(Math.round(performance.now() - sentAt));
      };
      ws.onerror = ws.onclose = () => finish(null);
    });
  }

  const readJson = key => {
    try { return JSON.parse(readStore(key)) || null; } catch { return null; }
  };

  const recordOutcome = (entry, ok) => {
    const history = readJson(HISTORY_KEY) || {};
    const row = history[entry] || { ok: 0, fail: 0 };
    if (ok) row.ok = Math.min(row.ok + 1, 20); else row.fail = Math.min(row.fail + 1, 20);
    history[entry] = row;
    writeStore(HISTORY_KEY, JSON.stringify(history));
  };

  const reliability = entry => {
    const row = (readJson(HISTORY_KEY) || {})[entry];
    return row ? (row.ok + 1) / (row.ok + row.fail + 1) : 1;
  };

  const findHeaderEnd = bytes => {
    for (let i = 0; i + 3 < bytes.length; i++) {
      if (bytes[i] === 13 && bytes[i + 1] === 10 && bytes[i + 2] === 13 && bytes[i + 3] === 10) return i;
    }
    return -1;
  };

  function speedTestWisp(entry, limitMs = SPEED_LIMIT) {
    return new Promise(resolve => {
      let ws;
      try {
        ws = new WebSocket(wlspUrl(entry));
      } catch {
        resolve(null);
        return;
      }
      ws.binaryType = 'arraybuffer';
      const enc = new TextEncoder();
      let ready = false;
      let done = false;
      let streamId = 0;
      let target = 0;
      let chunk = 0;
      let completed = 0;
      let headerBuf = new Uint8Array(0);
      let headerDone = false;
      let body = 0;
      let totalBody = 0;
      let startedAt = 0;
      let lastData = 0;
      let maxGap = 0;
      let timer = 0;

      const summary = () => {
        if (!ready) return null;
        const elapsed = Math.max(1, performance.now() - startedAt);
        return { bps: Math.round(totalBody / elapsed * 1000), completed, maxGap: Math.round(maxGap), bytes: totalBody };
      };

      const finish = result => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        ws.onmessage = ws.onerror = ws.onclose = null;
        try { ws.close(); } catch {}
        resolve(result);
      };

      const openChunk = () => {
        streamId = (Math.floor(Math.random() * 0xFFFFFFFE) + 1) >>> 0;
        headerBuf = new Uint8Array(0);
        headerDone = false;
        body = 0;
        const t = SPEED_TARGETS[target];
        const host = enc.encode(t.host);
        const connect = new ArrayBuffer(8 + host.length);
        const cv = new DataView(connect);
        cv.setUint8(0, 1);
        cv.setUint32(1, streamId, true);
        cv.setUint8(5, 1);
        cv.setUint16(6, 80, true);
        new Uint8Array(connect).set(host, 8);
        const from = chunk * SPEED_CHUNK;
        const request = enc.encode(`GET ${t.path} HTTP/1.1\r\nHost: ${t.host}\r\nRange: bytes=${from}-${from + SPEED_CHUNK - 1}\r\nAccept-Encoding: identity\r\nConnection: close\r\n\r\n`);
        const data = new Uint8Array(5 + request.length);
        data[0] = 2;
        new DataView(data.buffer).setUint32(1, streamId, true);
        data.set(request, 5);
        try {
          ws.send(connect);
          ws.send(data);
        } catch {
          finish(summary());
        }
      };

      const endChunk = ok => {
        const closing = new Uint8Array(6);
        closing[0] = 4;
        new DataView(closing.buffer).setUint32(1, streamId, true);
        closing[5] = 2;
        try { ws.send(closing); } catch {}
        streamId = 0;
        if (!ok && chunk === 0 && body === 0 && target + 1 < SPEED_TARGETS.length) {
          target++;
          openChunk();
          return;
        }
        if (ok) completed++;
        chunk++;
        if (!ok || chunk >= SPEED_CHUNKS) {
          finish(summary());
          return;
        }
        openChunk();
      };

      timer = setTimeout(() => finish(summary()), limitMs);

      ws.onmessage = e => {
        if (!(e.data instanceof ArrayBuffer) || e.data.byteLength < 5) return;
        const view = new DataView(e.data);
        const type = view.getUint8(0);
        const stream = view.getUint32(1, true);
        if (!ready) {
          if (type === 5 && stream === 0) {
            ws.send(new Uint8Array([5, 0, 0, 0, 0, 2, 1]));
          } else if (type === 3 && stream === 0) {
            ready = true;
            startedAt = performance.now();
            openChunk();
          }
          return;
        }
        if (!streamId || stream !== streamId) return;
        if (type === 2) {
          const now = performance.now();
          if (lastData) maxGap = Math.max(maxGap, now - lastData);
          lastData = now;
          let payload = new Uint8Array(e.data, 5);
          if (!headerDone) {
            const merged = new Uint8Array(headerBuf.length + payload.length);
            merged.set(headerBuf);
            merged.set(payload, headerBuf.length);
            const end = findHeaderEnd(merged);
            if (end === -1) {
              if (merged.length > 16384) endChunk(false);
              else headerBuf = merged;
              return;
            }
            headerDone = true;
            payload = merged.subarray(end + 4);
          }
          body += payload.length;
          totalBody += payload.length;
          if (body >= SPEED_CHUNK) endChunk(true);
        } else if (type === 4) {
          endChunk(body >= SPEED_CHUNK);
        }
      };
      ws.onerror = ws.onclose = () => finish(summary());
    });
  }

  const speedScore = (entry, result) => {
    if (!result || !result.bps) return 0;
    const fullness = result.completed / SPEED_CHUNKS;
    return result.bps * fullness * fullness * reliability(entry) / (1 + result.maxGap / 2000);
  };

  function acceptBackup(entry, ping, bps) {
    window.WlspPing = ping;
    window.WlspIsBackup = true;
    window.WlspSpeed = bps;
    writeStore(BACKUP_KEY, JSON.stringify({ entry, ts: Date.now(), bps: bps || 0 }));
    return wlspUrl(entry);
  }

  async function pickBackup(candidates) {
    const unique = [...new Set(candidates)];
    const stored = readJson(BACKUP_KEY);
    if (stored && stored.entry && unique.includes(stored.entry) && Date.now() - stored.ts < BACKUP_TTL) {
      const ping = await testWlspDomain(stored.entry);
      if (ping !== null) return acceptBackup(stored.entry, ping, stored.bps);
      recordOutcome(stored.entry, false);
    }
    const alive = [];
    for (let i = 0; i < unique.length && alive.length < SPEED_CANDIDATES; i += PROBE_WAVE) {
      const wave = unique.slice(i, i + PROBE_WAVE);
      const pings = await Promise.all(wave.map(entry => testWlspDomain(entry)));
      wave.forEach((entry, j) => {
        if (pings[j] === null) recordOutcome(entry, false);
        else alive.push({ entry, ping: pings[j] });
      });
    }
    alive.sort((a, b) => a.ping - b.ping);
    if (!alive.length) return null;
    let best = null;
    for (const row of alive.slice(0, SPEED_CANDIDATES)) {
      const result = await speedTestWisp(row.entry);
      const score = speedScore(row.entry, result);
      recordOutcome(row.entry, score > 0);
      if (score > 0 && (!best || score > best.score)) best = { ...row, score, bps: result.bps };
      if (result && result.bps >= SPEED_GOOD && result.completed === SPEED_CHUNKS) break;
    }
    if (best) return acceptBackup(best.entry, best.ping, best.bps);
    return acceptBackup(alive[0].entry, alive[0].ping, 0);
  }

  function accept(index, ping) {
    const entry = K.WISP_SERVERS[index];
    if (!isBackupServer(entry)) writeStore('WID', index);
    window.WlspPing = ping;
    window.WlspIsBackup = isBackupServer(entry);
    return wlspUrl(entry);
  }


  const mergeServers = synced => {
    const merged = [...new Set([...synced, ...K.WISP_BASE])];
    K.WISP_SERVERS = merged;
    window.serverList = merged;
    return merged;
  };

  const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });

  let syncPromise = null;

  // Keeps our server list in step with TongSherbet/storage (the origin of the wisp setup).
  K.syncWispServers = () => {
    if (syncPromise) return syncPromise;
    syncPromise = (async () => {
      const cached = readJson(SYNC_KEY);
      const cachedList = cached && Array.isArray(cached.list) ? cached.list.filter(u => HOST_RE.test(u) || WSS_RE.test(u)) : [];
      if (cachedList.length) mergeServers(cachedList);
      if (cachedList.length && Date.now() - (cached.ts || 0) < SYNC_TTL) return K.WISP_SERVERS;
      const failed = readJson(SYNC_KEY + 'F');
      if (failed && Date.now() - (failed.ts || 0) < 600000) return K.WISP_SERVERS;
      for (const url of STORAGE_SOURCES) {
        try {
          const res = await withTimeout(fetch(url, { cache: 'no-store' }), SYNC_TIMEOUT);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const list = parseServerList(await withTimeout(res.text(), SYNC_TIMEOUT));
          if (!list.length) throw new Error('no servers in loader.js');
          writeStore(SYNC_KEY, JSON.stringify({ ts: Date.now(), list }));
          console.log('[wisp] synced', list.length, 'servers from TongSherbet/storage');
          return mergeServers(list);
        } catch (err) {
          console.warn('[wisp] storage sync failed:', url, err && err.message ? err.message : err);
        }
      }
      writeStore(SYNC_KEY + 'F', JSON.stringify({ ts: Date.now() }));
      return K.WISP_SERVERS;
    })();
    return syncPromise;
  };

  async function getWlsp() {
    try { await Promise.race([K.syncWispServers(), new Promise(r => setTimeout(r, 1500))]); } catch {}
    const list = K.WISP_SERVERS;
    const stored = readStore('WID');
    const index = Number(stored);
    if (stored !== null && stored !== '' && Number.isInteger(index) && index >= 0 && index < list.length && !isBackupServer(list[index])) {
      const ping = await testWlspDomain(list[index]);
      if (ping !== null) return accept(index, ping);
    }
    for (let i = 0; i < list.length; i++) {
      if (isBackupServer(list[i])) continue;
      const ping = await testWlspDomain(list[i]);
      if (ping !== null) return accept(i, ping);
    }
    let extra = [];
    try { extra = (await K.fetchWisps()) || []; } catch {}
    extra = extra.filter(u => !list.includes(u));
    for (let i = extra.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [extra[i], extra[j]] = [extra[j], extra[i]];
    }
    const candidates = [...list.filter(isBackupServer), K.WISP_FALLBACK, ...extra.slice(0, EXTRA_LIMIT)];
    const picked = await pickBackup(candidates);
    if (picked) return picked;
    window.WlspPing = undefined;
    window.WlspSpeed = undefined;
    window.WlspIsBackup = isBackupServer(K.WISP_FALLBACK);
    return wlspUrl(K.WISP_FALLBACK);
  }

  K.resolveWlsp = () => {
    window.kWispP = getWlsp()
      .catch(() => wlspUrl(K.WISP_FALLBACK))
      .then(url => {
        window.wlspServer = url;
        console.log('[wisp] wlspServer:', url, 'ping:', window.WlspPing, 'backup:', window.WlspIsBackup);
        return url;
      });
    return window.kWispP;
  };

  K.revalidateWisp = () => {
    window.wlspServer = undefined;
    syncPromise = null;
    return K.resolveWlsp();
  };

  const base64ToText = b64 => new TextDecoder('utf-8').decode(Uint8Array.from(atob(b64.trim()), c => c.charCodeAt(0)));

  const extractWss = value => {
    if (Array.isArray(value)) {
      const direct = value.filter(u => typeof u === 'string' && /^wss:\/\//i.test(u.trim())).map(u => u.trim());
      if (direct.length) return direct;
      for (const item of value) {
        const found = extractWss(item);
        if (found.length) return found;
      }
      return [];
    }
    if (value && typeof value === 'object') {
      for (const item of Object.values(value)) {
        const found = extractWss(item);
        if (found.length) return found;
      }
    }
    return [];
  };

  let wispListPromise = null;

  K.fetchWisps = () => {
    if (!wispListPromise) {
      wispListPromise = (async () => {
        try {
          const outer = await K.fetchWithProxy(WISP_LIST_PATH);
          let b64 = null;
          if (Array.isArray(outer)) b64 = outer.find(v => typeof v === 'string' && v.trim());
          else if (typeof outer === 'string') b64 = outer;
          if (!b64) throw new Error('no wisp list payload');
          const urls = [...new Set(extractWss(JSON.parse(base64ToText(b64))))];
          if (!urls.length) throw new Error('wisp list empty');
          K.wispUrls = urls;
          window.wispUrls = urls;
          return urls;
        } catch (err) {
          wispListPromise = null;
          console.warn('wisp list unavailable:', err && err.message ? err.message : err);
          return K.wispUrls;
        }
      })();
    }
    return wispListPromise;
  };

  K.wisp = {
    test: testWlspDomain,
    speed: speedTestWisp,
    get: getWlsp,
    url: wlspUrl,
    isBackup: isBackupServer
  };

  K.resolveWlsp();
  K.fetchWisps();
}
