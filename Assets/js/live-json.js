export function init(K) {
  const REPO = K.MAIN_REPO || 'lotsacookie/kstuff';
  const FILES = new Set(['Assets/json/g.json', 'Assets/json/a.json']);
  const REFS = ['HEAD', 'latest', 'main'];

  const FETCH_MS = 8000;
  const CHECK_TTL = 60 * 1000;
  const SWEEP_MS = 5 * 60 * 1000; 
  const PURGE_COOLDOWN = 10 * 60 * 1000;
  const PURGE_SPACING = 2000;         
  const LS_PREFIX = 'kstuff_live_';
  const PURGE_PREFIX = 'kstuff_purge_';

  K.LIVE_JSON = FILES;
  const mem = {};

  const lsGet = path => { try { return JSON.parse(localStorage.getItem(LS_PREFIX + path)); } catch { return null; } };
  const lsSet = (path, text) => { try { localStorage.setItem(LS_PREFIX + path, JSON.stringify({ text, at: Date.now() })); } catch {} };

  async function getText(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_MS);
    try {
      const r = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.text();
    } finally { clearTimeout(timer); }
  }
  const soft = p => p.then(v => v, () => null);

  const queue = [];
  let draining = false;
  function drain() {
    if (draining) return;
    draining = true;
    const step = () => {
      const url = queue.shift();
      if (!url) { draining = false; return; }
      fetch(url, { mode: 'no-cors', cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' }).catch(() => {});
      setTimeout(step, PURGE_SPACING);
    };
    step();
  }
  function purge(path, ref) {
    const key = `${PURGE_PREFIX}${ref}:${path}`;
    let last = 0;
    try { last = +localStorage.getItem(key) || 0; } catch {}
    const now = Date.now();
    if (now - last < PURGE_COOLDOWN) return false;
    try { localStorage.setItem(key, String(now)); } catch {}
    queue.push(`https://purge.jsdelivr.net/gh/${REPO}@${ref}/${path}`);
    drain();
    return true;
  }

  async function check(path) {
    const jd = ref => `https://cdn.jsdelivr.net/gh/${REPO}@${ref}/${path}`;
    const raw = `https://raw.githubusercontent.com/${REPO}/main/${path}?t=${Date.now()}`;
    const got = await Promise.all([raw, ...REFS.map(jd)].map(u => soft(getText(u))));
    const truth = got[0];
    const byRef = {};
    REFS.forEach((r, i) => { byRef[r] = got[i + 1]; });

    let text = null, data = null;
    for (const c of [truth, byRef.main, byRef.HEAD, byRef.latest]) {
      if (typeof c !== 'string') continue;
      try { data = JSON.parse(c); text = c; break; } catch {}
    }
    if (text === null) return null;

    if (typeof truth === 'string') {
      REFS.forEach(r => {
        const t = byRef[r];
        if (typeof t === 'string' && t !== truth) purge(path, r);
      });
    }
    return { text, data };
  }

  function entryFor(path) {
    if (mem[path]) return mem[path];
    const c = lsGet(path);
    let data = null;
    if (c && typeof c.text === 'string') { try { data = JSON.parse(c.text); } catch {} }
    return (mem[path] = { text: data ? c.text : '', data, checkedAt: 0, p: null });
  }

  function revalidate(path, quiet = false) {
    const e = entryFor(path);
    if (e.p) return e.p;
    e.checkedAt = Date.now();
    e.p = (async () => {
      const had = !!e.text;
      const best = await check(path);
      if (best && best.text !== e.text) {
        e.text = best.text;
        e.data = best.data;
        lsSet(path, best.text);
        if (had && !quiet) window.dispatchEvent(new CustomEvent('kstuff:live-json', { detail: { path } }));
      }
      return e;
    })().finally(() => { e.p = null; });
    return e.p;
  }

  K.fetchLiveJson = async (path, asText = false, opts = {}) => {
    const e = entryFor(path);
    const force = !!(opts.force || K.liveForce);
    if (e.text && !force) {
      if (Date.now() - e.checkedAt > CHECK_TTL) revalidate(path).catch(() => {});
      return asText ? e.text : e.data;
    }
    await revalidate(path, force);            // first ever load, or an explicit refresh
    if (!e.text) throw new Error('live json unavailable: ' + path);
    return asText ? e.text : e.data;
  };

  const base = K.fetchWithProxy;
  K.fetchWithProxy = (path, asText = false, ...rest) =>
    FILES.has(path) ? K.fetchLiveJson(path, asText) : base(path, asText, ...rest);

  const sweep = () => {
    if (document.hidden) return;
    FILES.forEach(p => { if (mem[p] && Date.now() - mem[p].checkedAt > CHECK_TTL) revalidate(p).catch(() => {}); });
  };
  setInterval(sweep, SWEEP_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sweep(); });

  K.liveJson = { check, purge, revalidate };
}
