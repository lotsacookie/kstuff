export function init(K) {
  const STORE_KEY = 'kstuff_favorites';
  const OWNER_KEY = 'kstuff_favorites_owner';
  const PUSH_KEY = 'kstuff_favorites_push';
  const MAX_ACTIVE = 100;
  const TOMB_TTL = 30 * 24 * 3600 * 1000;
  const COOLDOWN = 60000;
  const DEBOUNCE = 2500;

  const read = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  const drop = k => { try { localStorage.removeItem(k); } catch {} };

  const keyOf = (p, t) => p + '\u0000' + t;
  const clean = e => {
    if (!e || typeof e.p !== 'string' || typeof e.t !== 'string' || !e.p || !e.t) return null;
    const out = { p: e.p, t: e.t.slice(0, 200), u: Number(e.u) || 0 };
    if (typeof e.i === 'string' && /^https?:\/\//i.test(e.i) && e.i.length <= 400) out.i = e.i;
    if (typeof e.c === 'string' && e.c) out.c = e.c.slice(0, 40);
    if (e.d) out.d = 1;
    return out;
  };

  const entries = new Map();
  const loadLocal = () => {
    entries.clear();
    try {
      const arr = JSON.parse(read(STORE_KEY) || '[]');
      if (Array.isArray(arr)) arr.forEach(e => { const c = clean(e); if (c) entries.set(keyOf(c.p, c.t), c); });
    } catch {}
  };

  const prune = () => {
    const now = Date.now();
    entries.forEach((e, k) => { if (e.d && now - e.u > TOMB_TTL) entries.delete(k); });
    const active = [...entries.values()].filter(e => !e.d).sort((a, b) => b.u - a.u);
    active.slice(MAX_ACTIVE).forEach(e => entries.delete(keyOf(e.p, e.t)));
  };

  const exportAll = () => [...entries.values()].map(e => ({ ...e }));
  const sigOf = arr => arr.map(e => `${e.p}|${e.t}|${e.u}|${e.d ? 1 : 0}`).sort().join('\n');

  const listeners = new Set();
  const api = { version: 0 };
  K.favorites = api;

  const emit = () => {
    api.version++;
    listeners.forEach(fn => { try { fn(); } catch {} });
    pushHome();
  };
  const persist = () => { prune(); write(STORE_KEY, JSON.stringify(exportAll())); };

  api.onChange = fn => { listeners.add(fn); return () => listeners.delete(fn); };
  api.has = (p, t) => { const e = entries.get(keyOf(p, t)); return !!e && !e.d; };
  api.list = () => [...entries.values()].filter(e => !e.d).sort((a, b) => a.t.localeCompare(b.t, undefined, { sensitivity: 'base' }));
  api.exportAll = exportAll;

  api.toggle = (page, item) => {
    if (!page || !item || !item.title) return false;
    const k = keyOf(page, item.title);
    const cur = entries.get(k);
    const now = Date.now();
    let on;
    if (cur && !cur.d) {
      entries.set(k, { ...cur, u: now, d: 1 });
      on = false;
    } else {
      const img = item.image || '';
      const e = clean({ p: page, t: item.title, i: img, c: item.category, u: now });
      if (!e) return false;
      entries.set(k, e);
      on = true;
    }
    persist();
    schedulePush();
    emit();
    return on;
  };

  // ---- cloud sync: at most one write per COOLDOWN, always the latest full list ----
  let lastPush = Number(read(PUSH_KEY)) || 0;
  let pushTimer = 0;
  let pending = false;

  const loggedIn = () => !!K.currentUser?.username;

  const push = () => {
    clearTimeout(pushTimer);
    pushTimer = 0;
    if (!loggedIn()) return;
    pending = false;
    lastPush = Date.now();
    write(PUSH_KEY, String(lastPush));
    const favorites = exportAll();
    const settings = { ...(K.userSettings ? K.userSettings(K.currentUser) : {}), favorites };
    if (K.currentUser.settings) {
      K.currentUser.settings.favorites = favorites;
      write('kstuff_user', JSON.stringify(K.currentUser));
    }
    K.sendBackend?.({ type: 'update-settings', username: K.currentUser.username, settings });
  };

  function schedulePush() {
    if (!loggedIn()) return;
    pending = true;
    clearTimeout(pushTimer);
    const wait = Math.max(DEBOUNCE, lastPush + COOLDOWN - Date.now());
    pushTimer = setTimeout(push, wait);
  }
  api.flush = () => { if (pending) push(); };

  // Merge what the cloud holds with what is stored here (newest change per favorite wins).
  api.syncFromCloud = (cloud, username) => {
    const owner = read(OWNER_KEY);
    if (owner && username && owner !== username) { entries.clear(); drop(PUSH_KEY); lastPush = 0; }
    if (username) write(OWNER_KEY, username);

    const before = sigOf(exportAll());
    let cloudSig = '';
    if (Array.isArray(cloud)) {
      const cleaned = cloud.map(clean).filter(Boolean);
      cloudSig = sigOf(cleaned);
      cleaned.forEach(c => {
        const k = keyOf(c.p, c.t);
        const mine = entries.get(k);
        if (!mine || c.u > mine.u) entries.set(k, c);
      });
    }
    persist();
    const after = sigOf(exportAll());
    if (after !== before) emit();
    if (after !== cloudSig) schedulePush();
  };

  api.onLogout = () => {
    api.flush();
    entries.clear();
    drop(STORE_KEY);
    drop(OWNER_KEY);
    drop(PUSH_KEY);
    lastPush = 0;
    emit();
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && pending && Date.now() - lastPush >= COOLDOWN) push();
  });
  window.addEventListener('pagehide', () => { if (pending) push(); });

  // ---- home page bridge ----
  const homeWin = () => {
    try {
      const f = K.$('mathworksheets-iframe');
      const d = f?.contentDocument;
      return d && d.getElementById('favs-row') ? f.contentWindow : null;
    } catch { return null; }
  };

  let homeRaf = 0;
  function pushHome() {
    if (homeRaf) return;
    homeRaf = requestAnimationFrame(() => {
      homeRaf = 0;
      const w = homeWin();
      if (!w) return;
      const items = api.list().map(e => ({ page: e.p, title: e.t, image: e.i || '', category: e.c || '' }));
      try { w.postMessage({ type: 'kstuff-favorites', items }, '*'); } catch {}
    });
  }

  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type !== 'kstuff-fav-request' && d.type !== 'kstuff-fav-open') return;
    if (e.source !== homeWin()) return;
    if (d.type === 'kstuff-fav-request') { pushHome(); return; }
    if (typeof d.page !== 'string' || typeof d.title !== 'string' || !K.grids?.[d.page]) return;
    K.loadBrowserUrl?.(K.pageAddress(d.page) + '/' + K.slugifyTitle(d.title));
  });

  loadLocal();
  prune();
}
