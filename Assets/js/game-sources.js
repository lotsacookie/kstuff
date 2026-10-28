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

  K.fetchExtraGames = async () => {
    const lists = await Promise.all([
      source('seraph', fetchSeraph),
      source('storage', fetchStorageGames)
    ]);
    return lists.flat();
  };
}
