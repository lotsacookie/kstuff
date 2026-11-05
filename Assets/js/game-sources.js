export function init(K) {
  const TTL = 600000;
  const WAIT = 9000;
  const store = {};

  function source(name, fn) {
    const now = Date.now();
    let e = store[name];
    if (!e || (e.done && now - e.at > TTL)) {
      e = store[name] = { at: now, done: false, items: null, p: null };
      const entry = e;
      entry.p = fn()
        .then(items => { entry.items = items; entry.done = true; entry.at = items.length ? Date.now() : 0; return items; })
        .catch(err => { console.error('game source failed', name, err); entry.items = []; entry.done = true; entry.at = 0; return []; });
    }
    const entry = e;
    return Promise.race([entry.p, new Promise(r => setTimeout(() => r(entry.items || []), WAIT))]);
  }

  const coverCandidates = url => {
    const dir = url.replace(/\/[^/]*$/, '').split('/').pop();
    const file = url.split('/').pop().replace(/\.[^.]*$/, '');
    const set = new Set();
    [dir, file].forEach(n => { if (n) ['jpg', 'png', 'webp', 'jpeg'].forEach(ext => set.add(`${n}.${ext}`)); });
    return [...set];
  };

  async function fetchSeraph() {
    const repo = 'gmshelf/seraph';
    const base = `https://cdn.jsdelivr.net/gh/${repo}`;
    const data = await K.fetchRepoFile(repo, 'seraph.json', false, 12000, [[base + '/', 12000]]);
    const list = Array.isArray(data) ? data : (data?.games || []);
    return list.filter(g => g && g.url && g.name).map(g => ({
      source: 'seraph',
      name: g.name,
      suffix: 'seraph',
      url: base + g.url,
      cover: coverCandidates(g.url).map(n => `${base}/covers/${n}`)
    }));
  }

  const STORAGE_REPO = 'TongSherbet/storage';
  const CDN_GH = 'https://cdn.jsdelivr.net/gh/';
  const POOR_COVER = /(TemplateData|unity-logo|progresslogo|fullscreen-button|splash\.)/i;
  const iconCache = new Map();

  const escXml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const hashStr = s => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };
  const initialsOf = name => {
    const words = String(name).replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '?';
    const s = words.length === 1 ? Array.from(words[0]).slice(0, 2).join('') : Array.from(words[0])[0] + Array.from(words[1])[0];
    return s.toUpperCase();
  };
  const normName = n => String(n || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const safeEncode = p => {
    try { return encodeURI(decodeURI(p)); } catch { return p; }
  };
  const assetUrl = (author, file) => (author && file) ? CDN_GH + author + '/' + safeEncode(String(file).replace(/^\/+/, '')) : '';

  K.gameFallbackIcon = name => {
    const key = String(name || '');
    let icon = iconCache.get(key);
    if (icon) return icon;
    const h = hashStr(key);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h % 360},65%,48%)"/><stop offset="1" stop-color="hsl(${(h + 40) % 360},70%,30%)"/></linearGradient></defs><rect width="256" height="256" fill="url(#g)"/><text x="128" y="128" font-family="Arial,Helvetica,sans-serif" font-size="96" font-weight="700" fill="#fff" fill-opacity="0.92" text-anchor="middle" dominant-baseline="central">${escXml(initialsOf(key))}</text></svg>`;
    icon = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    iconCache.set(key, icon);
    return icon;
  };

  const loadLibrary = async name => {
    try {
      const data = await K.fetchRepoFile(STORAGE_REPO, name + '.json', false, 15000);
      if (Array.isArray(data) && data.length) return data;
    } catch {}
    try {
      const data = await K.fetchWithProxy('Assets/json/' + name + '.json');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  const libraryCovers = g => {
    const cover = assetUrl(g.cover_author, g.cover_file);
    const list = cover && !POOR_COVER.test(cover) ? [cover] : [];
    list.push(K.gameFallbackIcon(g.name));
    return list;
  };

  async function fetchStorageGames() {
    const [ckv, ugs] = await Promise.all([loadLibrary('ckv'), loadLibrary('ugs')]);
    const seen = new Set();
    const out = [];
    const add = (list, source) => {
      list.forEach(g => {
        if (!g || !g.name || !g.file) return;
        const key = normName(g.name);
        if (!key || seen.has(key)) return;
        const url = assetUrl(g.author, g.file);
        if (!url) return;
        seen.add(key);
        out.push({ source, name: g.name, suffix: source, url, cover: libraryCovers(g) });
      });
    };
    add(ckv, 'ckv');
    add(ugs, 'ugs');
    return out;
  }

  const AD_CLASS = /^(ads?|ad-[\w-]+|adsbygoogle)$/i;
  const AD_ID = /^(ads?([-_].*)?|ad[-_].*|ad(Rectangle|Leaderboard|Banner|Skyscraper|Container|Slot|Unit)\w*)$/i;
  const AD_WRITE = /document\.write\(\s*['"]<div[^>]*style=["']?[^>]*width:\s*\d+px;\s*height:\s*\d+px/i;
  const HTML_NS = 'http://www.w3.org/1999/xhtml';

  K.isSeraphUrl = url => /gmshelf\/seraph/i.test(String(url || ''));

  K.cleanSeraphHtml = html => {
    let doc;
    try { doc = new DOMParser().parseFromString(html, 'text/html'); } catch { return html; }
    if (!doc || !doc.documentElement) return html;

    doc.querySelectorAll('script[src]').forEach(s => {
      if (/(^|\/)cloak\.js(\?|#|$)/i.test(s.getAttribute('src') || '')) s.remove();
    });

    doc.querySelectorAll('title').forEach(t => { if (t.namespaceURI === HTML_NS) t.remove(); });

    doc.querySelectorAll('[class]').forEach(el => {
      if (!el.isConnected) return;
      const cls = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
      if (cls.some(c => AD_CLASS.test(c))) el.remove();
    });

    doc.querySelectorAll('[id]').forEach(el => {
      if (!el.isConnected) return;
      if (AD_ID.test(el.id)) el.remove();
    });

    doc.querySelectorAll('script:not([src])').forEach(s => {
      if (AD_WRITE.test(s.textContent || '')) s.remove();
    });

    const dt = doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>` : '';
    return dt + doc.documentElement.outerHTML;
  };


  // ---- Cloud games: SingularityCloud's library (FreezeNova + Astra). Clicking a card deep-links into that game inside the Cloud tab.
  const CLOUD_REPO = 'rtischeduler/SingularityCloud';
  const CLOUD_CACHE = 'kstuff_cloud_catalog';
  const CLOUD_ID_OK = /^[\w.-]{1,80}$/;

  const readCloudCache = () => {
    try {
      const c = JSON.parse(localStorage.getItem(CLOUD_CACHE) || 'null');
      return c && Array.isArray(c.games) ? c.games : [];
    } catch { return []; }
  };
  // The Cloud tab reports its own library when it loads (see the message handler below), so the list also works before catalog.json exists.
  K.cacheCloudCatalog = games => {
    const clean = (Array.isArray(games) ? games : [])
      .filter(g => g && CLOUD_ID_OK.test(String(g.id || '')) && g.name)
      .map(g => ({ id: String(g.id), name: String(g.name).slice(0, 120), icon: typeof g.icon === 'string' && g.icon.startsWith('/cg/') ? g.icon : null }));
    if (!clean.length) return;
    try { localStorage.setItem(CLOUD_CACHE, JSON.stringify({ t: Date.now(), games: clean })); } catch {}
  };

  async function fetchCloud() {
    let listed = [];
    try {
      const data = await K.fetchRepoFile(CLOUD_REPO, 'catalog.json', false, 12000);
      if (Array.isArray(data?.games)) listed = data.games;
    } catch (e) { console.warn('cloud catalog.json unavailable', e); }
    const sha = (await K.getLatestSha(false, CLOUD_REPO).catch(() => '')) || 'main';
    const art = icon => `https://cdn.jsdelivr.net/gh/${CLOUD_REPO}@${sha}/ref${icon}`;
    const out = [], seen = new Set();
    const add = (id, name, icon) => {
      id = String(id || '');
      if (!CLOUD_ID_OK.test(id) || !name || seen.has(id)) return;
      seen.add(id);
      const cover = [];
      if (typeof icon === 'string' && icon.startsWith('/cg/')) cover.push(art(icon));
      cover.push(K.gameFallbackIcon(name));
      out.push({ source: 'cloud', cloudId: id, name: String(name), cover });
    };
    add('freezenova', 'Roblox (FreezeNova)', '/cg/tg-roblox-launch.jpg');
    listed.forEach(g => g && add(g.id, g.name, g.icon));
    readCloudCache().forEach(g => add(g.id, g.name, g.icon));
    return out;
  }

  // ---- Deep link: switch to the Cloud tab, then ask SingularityCloud (postMessage) to start that game.
  // The request is repeated until the app acknowledges it, so it works whether the tab was already running or still loading.
  let pendingCloud = null, cloudRetry = null, lastCloud = null;
  const RELAUNCH_MS = 15000; // a Cloud tab reload this soon after a launch was accepted wiped that game, so start it again
  const cloudWin = () => K.$('cloud-iframe')?.contentWindow || null;
  const sendCloudLaunch = () => {
    const w = cloudWin();
    if (w && pendingCloud) { try { w.postMessage({ type: 'singularity:launch', gameId: pendingCloud.id, name: pendingCloud.name }, '*'); } catch {} }
  };
  const clickNav = target => document.querySelector(`.nav-btn[data-target="${target}"]`)?.click();
  const stopCloudRetry = () => { clearInterval(cloudRetry); cloudRetry = null; };
  const startCloudRetry = () => {
    stopCloudRetry();
    cloudRetry = setInterval(() => {
      if (!pendingCloud || Date.now() - pendingCloud.at > 45000) { stopCloudRetry(); pendingCloud = null; return; }
      sendCloudLaunch();
    }, 600);
  };

  K.openCloudGame = item => {
    if (!item || !CLOUD_ID_OK.test(String(item.cloudId || ''))) return;
    pendingCloud = lastCloud = { id: item.cloudId, name: item.cloudName || item.title, at: Date.now() };
    startCloudRetry();
    // Switching tabs (re)loads the Cloud page, which shows its own loading screen; the launch is repeated until the app acknowledges it.
    if (document.querySelector('.page.active')?.id !== 'cloud') {
      K.cloudNavAllowed = true;
      try { clickNav('cloud'); } finally { K.cloudNavAllowed = false; }
    }
    sendCloudLaunch();
  };

  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || typeof d !== 'object' || typeof d.type !== 'string' || !d.type.startsWith('singularity:')) return;
    const w = cloudWin();
    if (!w || e.source !== w) return;
    if (d.type === 'singularity:ready') {
      // A fresh "ready" after we already got an acknowledgement means the Cloud page reloaded under the game: launch it again.
      if (!pendingCloud && lastCloud && Date.now() - lastCloud.at < RELAUNCH_MS) { pendingCloud = { ...lastCloud, at: Date.now() }; startCloudRetry(); }
      sendCloudLaunch();
    } else if (d.type === 'singularity:launching') {
      if (pendingCloud && pendingCloud.id === d.gameId) { pendingCloud = null; stopCloudRetry(); }
    } else if (d.type === 'singularity:closed') {
      lastCloud = null;
      // Left the game (or it ended): go back to the games grid. Errors stay put so the message in the Cloud tab is seen.
      if (d.reason !== 'error' && document.querySelector('.page.active')?.id === 'cloud') clickNav('readingcorner');
    } else if (d.type === 'singularity:catalog') K.cacheCloudCatalog(d.games);
  });

  // ---- GeForce NOW catalog (SingularityNOW). The list is a small JSON built by CI into Assets/now/catalog.json.
  // We ask the GitHub API for the latest commit, read the catalog from jsDelivr at that exact commit, and keep the
  // result pinned in localStorage: while the commit is unchanged the catalog is served from the pinned copy.
  const GFN_REPO = K.MAIN_REPO || 'lotsacookie/kstuff';
  const GFN_STORE = 'kstuff_gfn_catalog_v1';
  const GFN_LIST = 'https://static.nvidiagrid.net/supported-public-games-list/locales/gfnpc-en-US.json';
  const readGfn = () => { try { const c = JSON.parse(localStorage.getItem(GFN_STORE) || 'null'); return c && Array.isArray(c.games) ? c : null; } catch { return null; } };
  const writeGfn = (sha, games) => { try { localStorage.setItem(GFN_STORE, JSON.stringify({ sha, at: Date.now(), games })); } catch {} };
  const gfnItems = games => games.filter(r => Array.isArray(r) && r[0] && r[1]).map(r => {
    const cover = [];
    if (r[4]) cover.push(r[4]);
    if (r[3]) cover.push(`https://cdn.cloudflare.steamstatic.com/steam/apps/${r[3]}/header.jpg`);
    cover.push(K.gameFallbackIcon(r[1]));
    return { source: 'gfn', gfnId: String(r[0]), name: String(r[1]), store: r[2] || '', cover };
  });
  const GFN_EXTRA = 'kstuff_gfn_extra_v1';
  const normTitle = t => String(t || '').toLowerCase().replace(/[®™©]/g, '').replace(/[^a-z0-9]+/g, '');
  const readExtra = () => { try { const c = JSON.parse(localStorage.getItem(GFN_EXTRA) || 'null'); return c && Array.isArray(c.games) ? c : null; } catch { return null; } };
  let gfnBaseNames = null;
  // full catalog from the signed-in SingularityNOW client; returns how many of its titles the grid doesn't have yet
  K.mergeGfnExtra = rows => {
    const games = (Array.isArray(rows) ? rows : []).filter(r => Array.isArray(r) && r[0] && r[1]).slice(0, 6000);
    if (!games.length) return 0;
    const prev = readExtra();
    const same = prev && prev.games.length === games.length && prev.games[0][0] === games[0][0] && prev.games[games.length - 1][0] === games[games.length - 1][0];
    try { localStorage.setItem(GFN_EXTRA, JSON.stringify({ at: Date.now(), games })); } catch {}
    if (same) return 0;
    const have = gfnBaseNames || new Set();
    return games.filter(r => !have.has(normTitle(r[1]))).length;
  };
  async function fetchGfnBase() {
    const sha = await K.getRefSha(GFN_REPO, 'main').catch(() => '');
    const cached = readGfn();
    if (cached && sha && cached.sha === sha && cached.games.length) return gfnItems(cached.games);
    const urls = [];
    if (sha) urls.push(`https://cdn.jsdelivr.net/gh/${GFN_REPO}@${sha}/Assets/now/catalog.json`);
    urls.push(`https://cdn.jsdelivr.net/gh/${GFN_REPO}@main/Assets/now/catalog.json`);
    let games = null;
    for (const u of urls) {
      try {
        const r = await fetch(u, { cache: u.includes('@main') ? 'no-cache' : 'default' });
        if (!r.ok) continue;
        const j = await r.json();
        if (Array.isArray(j?.games) && j.games.length) { games = j.games; break; }
      } catch {}
    }
    if (!games) {
      try { // straight from NVIDIA when the CI catalog isn't there yet (needs their CORS to allow it)
        const r = await fetch(GFN_LIST, { cache: 'no-cache' });
        if (r.ok) {
          const j = await r.json();
          games = (Array.isArray(j) ? j : j.games || []).filter(x => x && x.id && x.title).map(x => {
            const m = /store\.steampowered\.com\/app\/(\d+)/.exec(x.steamUrl || '');
            return [x.id, x.title, x.store || '', m ? m[1] : '', ''];
          });
        }
      } catch {}
    }
    if (games && games.length) { writeGfn(sha, games); return gfnItems(games); }
    return cached ? gfnItems(cached.games) : [];
  }

  async function fetchGfn() {
    const items = await fetchGfnBase();
    gfnBaseNames = new Set(items.map(i => normTitle(i.name)));
    const extra = readExtra();
    if (!extra) return items;
    const have = new Set(gfnBaseNames), add = [];
    for (const r of extra.games) { const k = normTitle(r[1]); if (!k || have.has(k)) continue; have.add(k); add.push(r); }
    return add.length ? items.concat(gfnItems(add)) : items;
  }

  K.fetchExtraGames = async () => {
    const lists = await Promise.all([
      source('seraph', fetchSeraph),
      source('storage', fetchStorageGames),
      source('cloud', fetchCloud),
      source('gfn', fetchGfn)
    ]);
    return lists.flat();
  };
}
