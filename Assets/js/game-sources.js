export function init(K) {
  const LUMIN_SCRIPT = 'https://cdn.jsdelivr.net/gh/luminsdk/script@latest/lumin.min.js';
  const GMSHELF_SOURCES = ['seraph', 'ugs', 'ckv'];
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
    return out.filter(g => !seen.has(g.id) && seen.add(g.id));
  }

  const coverCandidates = url => {
    const dir = url.replace(/\/[^/]*$/, '').split('/').pop();
    const file = url.split('/').pop().replace(/\.[^.]*$/, '');
    const set = new Set();
    [dir, file].forEach(n => { if (n) ['jpg', 'png', 'webp', 'jpeg'].forEach(ext => set.add(`${n}.${ext}`)); });
    return [...set];
  };

  async function fetchGmshelf(name) {
    const repo = 'gmshelf/' + name;
    const base = `https://cdn.jsdelivr.net/gh/${repo}`;
    const data = await K.fetchRepoFile(repo, `${name}.json`, false, 12000, [[base + '/', 12000]]);
    const list = Array.isArray(data) ? data : (data?.games || []);
    return list.filter(g => g && g.url && g.name).map(g => ({
      source: name,
      name: g.name,
      suffix: name,
      url: base + (name === 'ckv' ? g.url.replace('.html', '2.html') : g.url),
      cover: name === 'ugs' ? [] : coverCandidates(g.url).map(n => `${base}/covers/${n}`)
    }));
  }

  K.fetchExtraGames = async () => {
    const lists = await Promise.all([
      source('lumin', fetchLumin),
      ...GMSHELF_SOURCES.map(n => source(n, () => fetchGmshelf(n)))
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
