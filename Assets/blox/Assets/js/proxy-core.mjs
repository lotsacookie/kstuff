// Proxy core taken from rtischeduler/SingularityNOW: loads sandstone (libcurl) and picks a working wisp server.
const BAD_KEY = "WB_BAD";
const BAD_TTL_MS = 6 * 3600000;

function createBadList({ storage, now = () => Date.now(), ttl = BAD_TTL_MS, key = (entry) => String(entry) } = {}) {
  const box = () => {
    try { return storage || globalThis.localStorage || null; } catch { return null; }
  };
  const read = () => {
    const s = box();
    if (!s) return {};
    try {
      const v = JSON.parse(s.getItem(BAD_KEY));
      return v && typeof v === "object" && !Array.isArray(v) ? v : {};
    } catch { return {}; }
  };
  const live = () => {
    const t = now(), out = {};
    for (const [k, ts] of Object.entries(read())) if (typeof ts === "number" && t - ts < ttl) out[k] = ts;
    return out;
  };
  return {
    has: (entry) => Object.hasOwn(live(), key(entry)),
    add(entry) {
      const s = box();
      if (!s) return;
      const v = live();
      v[key(entry)] = now();
      try { s.setItem(BAD_KEY, JSON.stringify(v)); } catch {}
    },
    clear() {
      const s = box();
      try { if (s) s.removeItem(BAD_KEY); } catch {}
    },
  };
}

const KSTUFF = "lotsacookie/kstuff";
const STORAGE = "TongSherbet/storage";
const LIST_PATH = "Assets/json/wss.json";
const jsd = (repo) => [
  `https://cdn.jsdelivr.net/gh/${repo}@main/`,
  `https://fastly.jsdelivr.net/gh/${repo}@main/`,
  `https://gcore.jsdelivr.net/gh/${repo}@main/`,
];
const KSTUFF_MIRRORS = [...jsd(KSTUFF), `https://raw.githubusercontent.com/${KSTUFF}/main/`, `https://cdn.statically.io/gh/${KSTUFF}/main/`];
const STORAGE_MIRRORS = [...jsd(STORAGE), `https://raw.githubusercontent.com/${STORAGE}/main/`];
const BUILTIN = [
  "cdn.northstreetumc.org", "cdn.vipersfutbol.com", "cdn.pcesc.org", "cdn.kcchallengevbc.com",
  "cdn.slcbmooc.org", "cdn.topstargym.net", "cdn.goaplytexas.org", "cdn.clearfieldswimming.com",
  "wss://athollcottage.com/connection/", "wss://api.personalloanonline.net/ws/",
  "wss://kristenblackburnvolleyballcamps.com/socket/", "wss://southpadreislandkiteboarding.com/socket/",
];
const FALLBACK = "wss://api.personalloanonline.net/ws/";

const HOST_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
const WSS_RE = /^wss:\/\/[a-z0-9.-]+(:\d{1,5})?(\/[\w\-./]*)?$/i;
const isBackup = (e) => e.includes("://");
const toWss = (e) => {
  e = String(e || "").trim();
  if (!e) return null;
  const u = isBackup(e) ? e : `wss://${e}/`;
  return u.endsWith("/") ? u : u + "/";
};
const bad = createBadList({ key: toWss });
function decodeLoaderList(src, hostRe, wssRe, max, depth = 0) {
  if (depth > 3 || typeof src !== "string") return [];
  let code = null;
  try {
    const stub = new Proxy({}, { get: () => (a) => { if (code === null && typeof a === "string") code = a; } });
    new Function("globalThis", src)(stub);
  } catch {}
  if (!code) return [];
  const arrays = code.match(/\[(?:\s*"[^"\\]{3,120}"\s*,?)+\s*\]/g) || [];
  for (const arr of arrays) {
    let vals;
    try { vals = JSON.parse(arr.replace(/,\s*\]$/, "]")); } catch { continue; }
    const out = [];
    for (const v of vals) {
      const value = String(v).trim();
      if ((hostRe.test(value) || wssRe.test(value)) && !out.includes(value)) out.push(value);
      if (out.length >= max) break;
    }
    if (out.length >= 3 && out.length >= vals.length * 0.6) return out;
  }
  return decodeLoaderList(code, hostRe, wssRe, max, depth + 1);
}
function parseServerList(src, decode = (s) => decodeLoaderList(s, HOST_RE, WSS_RE, 32)) {
  if (typeof src !== "string") return [];
  const text = src.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  const block = text.match(/serverList\s*=\s*\[([\s\S]*?)\]\s*[;,]/);
  if (!block) return decode(src);
  const item = /(["'])((?:\\.|(?!\1)[^\\])*)\1(\s*\.split\(\s*(?:""|'')\s*\)\s*\.reverse\(\)\s*\.join\(\s*(?:""|'')\s*\))?/g;
  const out = [];
  let m;
  while ((m = item.exec(block[1]))) {
    const value = (m[3] ? [...m[2]].reverse().join("") : m[2]).trim();
    if ((HOST_RE.test(value) || WSS_RE.test(value)) && !out.includes(value)) out.push(value);
    if (out.length >= 32) break;
  }
  return out;
}
function decodeInSandbox(src, ms = 4000) {
  return new Promise((resolve) => {
    const f = document.createElement("iframe");
    f.sandbox = "allow-scripts";
    f.style.display = "none";
    const done = (v) => { clearTimeout(t); removeEventListener("message", on); f.remove(); resolve(v); };
    const t = setTimeout(() => done([]), ms);
    const on = (e) => { if (e.source === f.contentWindow && e.data && e.data.wbDecoded) done(e.data.list || []); };
    addEventListener("message", on);
    f.srcdoc = `<script>const decode=${decodeLoaderList.toString()};` +
      `addEventListener("message",e=>{let l=[];try{l=decode(e.data.src,new RegExp(e.data.h,"i"),new RegExp(e.data.w,"i"),32)}catch{}` +
      `parent.postMessage({wbDecoded:1,list:l},"*")});parent.postMessage({wbReady:1},"*")<\/script>`;
    const ready = (e) => {
      if (e.source !== f.contentWindow || !e.data || !e.data.wbReady) return;
      removeEventListener("message", ready);
      f.contentWindow.postMessage({ src, h: HOST_RE.source, w: WSS_RE.source }, "*");
    };
    addEventListener("message", ready);
    document.body.append(f);
  });
}
const parseInBrowser = async (src) => parseServerList(src, (s) => decodeInSandbox(s));
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
async function fetchWith(url, type, ms = 4000) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store", signal: c.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r[type]();
  } finally { clearTimeout(t); }
}
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const b64ToText = (b) => new TextDecoder().decode(Uint8Array.from(atob(b.trim()), (c) => c.charCodeAt(0)));
function parseWispList(json) {
  const b64 = Array.isArray(json) ? json.find((v) => typeof v === "string" && v.trim()) : json;
  if (typeof b64 !== "string") return [];
  let data;
  try { data = JSON.parse(b64ToText(b64)); } catch { return []; }
  const out = [];
  (function walk(v) {
    if (typeof v === "string" && /^wss:\/\//i.test(v.trim())) out.push(v.trim());
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  })(data);
  return [...new Set(out)];
}
async function fetchWispList(mirrors = KSTUFF_MIRRORS) {
  try { return parseWispList(await Promise.any(mirrors.map((m) => fetchWith(m + LIST_PATH, "json", 5000)))); }
  catch { return []; }
}
async function syncStorageList(mirrors = STORAGE_MIRRORS) {
  const cached = store.get("WB_SYNC");
  const cachedList = cached && Array.isArray(cached.list) ? cached.list.filter((u) => HOST_RE.test(u) || WSS_RE.test(u)) : [];
  if (cachedList.length && Date.now() - (cached.ts || 0) < 3600000) return cachedList;
  const failed = store.get("WB_SYNCF");
  if (failed && Date.now() - (failed.ts || 0) < 600000) return cachedList;
  for (const m of mirrors) {
    try {
      const list = await parseInBrowser(await fetchWith(m + "loader.js", "text", 3500));
      if (!list.length) throw new Error("no servers in loader.js");
      store.set("WB_SYNC", { ts: Date.now(), list });
      return list;
    } catch (e) { console.warn("[wisp] storage sync failed:", m, e && e.message || e); }
  }
  store.set("WB_SYNCF", { ts: Date.now() });
  return cachedList;
}
function probeWisp(entry, timeoutMs = 3000) {
  return new Promise((resolve) => {
    let ws;
    try { ws = new WebSocket(toWss(entry)); } catch { return resolve(null); }
    ws.binaryType = "arraybuffer";
    let connected = false, sentAt = 0;
    const streamId = (Math.floor(Math.random() * 0xFFFFFFFE) + 1) >>> 0;
    const finish = (ping) => { clearTimeout(timer); ws.onmessage = ws.onerror = ws.onclose = null; try { ws.close(); } catch {} resolve(ping); };
    const timer = setTimeout(() => finish(null), timeoutMs);
    ws.onmessage = (e) => {
      if (!(e.data instanceof ArrayBuffer) || e.data.byteLength < 5) return;
      const v = new DataView(e.data), type = v.getUint8(0), stream = v.getUint32(1, true);
      if (!connected) {
        if (type === 5 && stream === 0) ws.send(new Uint8Array([5, 0, 0, 0, 0, 2, 1]));
        else if (type === 3 && stream === 0) {
          connected = true;
          const host = new TextEncoder().encode("127.0.0.1");
          const buf = new ArrayBuffer(8 + host.length), dv = new DataView(buf);
          dv.setUint8(0, 1); dv.setUint32(1, streamId, true); dv.setUint8(5, 1); dv.setUint16(6, 69, true);
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

async function firstAlive(entries, say, label, waveSize = 6) {
  const alive = [];
  for (let i = 0; i < entries.length && !alive.length; i += waveSize) {
    const wave = entries.slice(i, i + waveSize);
    say(`${label} (${Math.min(i + waveSize, entries.length)}/${entries.length})…`);
    const pings = await Promise.all(wave.map((e) => probeWisp(e)));
    wave.forEach((e, j) => { if (pings[j] !== null) alive.push({ entry: e, ping: pings[j] }); });
  }
  return alive.sort((a, b) => a.ping - b.ping)[0] || null;
}
function provisionalWisp(network) {
  const last = store.get("WB_LAST");
  const url = toWss(last && last.entry && !bad.has(last.entry) ? last.entry : FALLBACK);
  network.set_websocket(url);
  return url;
}
async function pickWisp(network, say = () => {}, opts = {}) {
  const budgetMs = opts.budgetMs || 15000;
  const excluded = new Set((opts.exclude || []).map(toWss));
  const allowed = (entry) => !excluded.has(toWss(entry));
  const prefer = (list) => {
    const ok = list.filter(allowed);
    return [...ok.filter((e) => !bad.has(e)), ...ok.filter((e) => bad.has(e))];
  };
  const apply = (entry) => {
    const url = toWss(entry);
    network.set_websocket(url);
    try { network.set_wisp_pool([url]); } catch {}
    store.set("WB_LAST", { entry, ts: Date.now() });
    return url;
  };
  const search = async () => {
    const last = store.get("WB_LAST");
    if (last && last.entry && allowed(last.entry) && !bad.has(last.entry) && Date.now() - last.ts < 600000 && (await probeWisp(last.entry)) !== null) return apply(last.entry);

    say("Syncing wisp list…");
    const synced = await syncStorageList(opts.storageBases ? [...opts.storageBases, ...STORAGE_MIRRORS.filter((m) => !opts.storageBases.includes(m))] : STORAGE_MIRRORS);
    const all = prefer([...new Set([...synced, ...BUILTIN])]);
    const primary = all.filter((e) => !isBackup(e));
    const hit = await firstAlive(primary, say, "Testing wisp servers");
    if (hit) return apply(hit.entry);

    say("Trying backup wisps…");
    const remote = await fetchWispList(opts.kstuffBases ? [...opts.kstuffBases, ...KSTUFF_MIRRORS.filter((m) => !opts.kstuffBases.includes(m))] : KSTUFF_MIRRORS);
    const backups = prefer([...new Set([...all.filter(isBackup), FALLBACK, ...shuffle(remote.filter((u) => !all.includes(u))).slice(0, 16)])]);
    const bhit = await firstAlive(backups, say, "Testing backup wisps");
    if (bhit) return apply(bhit.entry);
    return null;
  };
  const timeout = new Promise((r) => setTimeout(() => r(null), budgetMs));
  try {
    const url = await Promise.race([search(), timeout]);
    if (url) return url;
  } catch (e) { console.warn("[wisp] pick failed", e); }
  console.warn("[wisp] no wisp validated, using fallback");
  return apply([FALLBACK, ...BUILTIN.filter(isBackup)].find(allowed) || FALLBACK);
}

const DIST = "dist/sandstone.mjs";
const BASES = [
  "https://cdn.jsdelivr.net/gh/lotsacookie/Singuloxy@main/",
  "https://fastly.jsdelivr.net/gh/lotsacookie/Singuloxy@main/",
];

const withTimeout = (p, ms, label) => { let t; return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(new Error(label + " timed out")), ms); })]).finally(() => clearTimeout(t)); };

async function loadSandstone(log) {
  try { return await Promise.any(BASES.map((b) => withTimeout(import(b + DIST), 12000, "proxy script"))); }
  catch { log("[proxy] CDN import failed, trying GitHub raw"); }
  const r = await withTimeout(fetch("https://raw.githubusercontent.com/lotsacookie/Singuloxy/main/" + DIST), 12000, "GitHub raw");
  const code = await r.text();
  return import(URL.createObjectURL(new Blob([code], { type: "text/javascript" })));
}

let ready = null, state = null, rotating = null;
async function verifyWisp(libcurl) {
  const t0 = performance.now();
  const r = await withTimeout(libcurl.fetch("https://www.roblox.com/robots.txt", { method: "GET", redirect: "manual" }), 10000, "proxy check");
  await withTimeout(r.text(), 8000, "proxy check");
  return Math.round(performance.now() - t0);
}
async function connectWisp(st, say, log) {
  for (let i = 0; i < 4; i++) {
    const wisp = await pickWisp(st.network, say, { exclude: st.tried, budgetMs: 12000 });
    say("Checking proxy…");
    try { const ms = await verifyWisp(st.libcurl); log("[proxy] wisp", String(wisp), ms + "ms"); st.wisp = String(wisp); return; }
    catch (e) { log("[proxy] wisp failed check", String(wisp), (e && e.message) || e); bad.add(wisp); st.tried.push(wisp); }
  }
  throw new Error("No working proxy found. Reload to try again.");
}
function getProxy({ log = () => {}, say = () => {} } = {}) {
  return (ready ||= (async () => {
    const t0 = Date.now(), say2 = (t) => say(t + " (" + Math.round((Date.now() - t0) / 1000) + "s)");
    say2("Loading proxy…");
    const sandstone = await loadSandstone(log);
    provisionalWisp(sandstone.network);
    for (let i = 0; i < 150 && !sandstone.libcurl.ready; i++) await new Promise((r) => setTimeout(r, 100));
    if (!sandstone.libcurl.ready) throw new Error("libcurl did not load");
    state = { libcurl: sandstone.libcurl, network: sandstone.network, wisp: "", tried: [] };
    await connectWisp(state, say2, log);
    return state;
  })().catch((e) => { ready = null; throw e; }));
}
async function rotateProxy(log = () => {}, say = () => {}) {
  if (!state) return getProxy({ log, say });
  if (rotating) return rotating;
  rotating = (async () => {
    log("[proxy] switching wisp");
    if (state.wisp) { bad.add(state.wisp); state.tried.push(state.wisp); }
    if (state.tried.length > 6) state.tried.length = 0;
    await connectWisp(state, say, log);
    return state;
  })().finally(() => { rotating = null; });
  return rotating;
}
window.__getProxy = getProxy;
window.__rotateProxy = rotateProxy;
export { getProxy, rotateProxy };
