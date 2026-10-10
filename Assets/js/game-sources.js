export function init(K) {
  const LUMIN_SCRIPT = 'https://cdn.jsdelivr.net/gh/luminsdk/script@latest/lumin.min.js';
  const TTL = 600000;
  const WAIT = 9000;
  const store = {};

  K.luminImgCache = new Map();

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

  let luminScript = null, luminInit = null;
  const loadLuminScript = () => luminScript || (luminScript = new Promise((resolve, reject) => {
    if (window.Lumin) return resolve();
    const s = document.createElement('script');
    s.src = LUMIN_SCRIPT;
    s.onload = () => resolve();
    s.onerror = () => { luminScript = null; reject(new Error('Lumin script failed to load')); };
    document.head.appendChild(s);
  }));
  const ensureLumin = () => luminInit || (luminInit = loadLuminScript()
    .then(() => window.Lumin.init({ headless: true }))
    .catch(err => { luminInit = null; throw err; }));

  async function fetchLumin() {
    await ensureLumin();
    const out = [];
    let page = 1, pages = 1;
    do {
      const res = await window.Lumin.getGames({ page, limit: 99999 });
      (res.games || []).forEach(g => {
        if (!g || !g.id || !g.name) return;
        out.push({
          source: 'lumin',
          name: g.name,
          suffix: g.id.includes('/') ? g.id.split('/')[0] : 'lumin',
          url: 'lumin:' + g.id,
          imageToken: g.image_token,
          id: g.id
        });
      });
      pages = res.pages || 1;
      page++;
    } while (page <= pages);
    const seen = new Set();
    const unique = out.filter(g => !seen.has(g.id) && seen.add(g.id));


    unique.forEach(g => {
      if (g.imageToken && !g.image) {
        const cached = K.luminImgCache.get(g.imageToken);
        if (cached) g.image = cached;
      }
    });

    return unique;
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
      source('lumin', fetchLumin),
      source('seraph', fetchSeraph)
    ]);
    return lists.flat();
  };

  K.resolveLuminImage = async item => {
    const token = item.imageToken;
    if (!token) return '';
    if (K.luminImgCache.has(token)) return K.luminImgCache.get(token);
    try {
      await ensureLumin();
      const url = await window.Lumin.getImageUrl(token);
      if (url) K.luminImgCache.set(token, url);
      return url || '';
    } catch { return ''; }
  };

  K.luminGameUrl = async id => {
    await ensureLumin();
    const res = await window.Lumin.getGameUrl(id);
    return res?.url || '';
  };
}
