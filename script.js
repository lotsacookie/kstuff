function initApp() {
  const MAIN_REPO = 'lotsacookie/kstuff';
  const MODULE_DIR = 'Assets/js';
  const SHA_FETCH_TIMEOUT = 6000;
  const IMPORT_TIMEOUT = 10000;
  let shaCache = null, shaPending = null;

  async function timedFetchJson(url, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } finally { clearTimeout(timer); }
  }

  async function getRepoSha() {
    if (shaCache) return shaCache;
    if (shaPending) return shaPending;
    shaPending = (async () => {
      try {
        const data = await timedFetchJson(`https://api.github.com/repos/${MAIN_REPO}/commits/main`, SHA_FETCH_TIMEOUT);
        const sha = data?.sha;
        if (typeof sha === 'string' && /^[0-9a-f]{40}$/i.test(sha)) { shaCache = sha; return sha; }
      } catch {}
      return '';
    })();
    try { return await shaPending; } finally { shaPending = null; }
  }

  async function importWithTimeout(url) {
    return await Promise.race([
      import(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error('import timeout: ' + url)), IMPORT_TIMEOUT))
    ]);
  }

  async function loadModule(name) {
    const sha = await getRepoSha();
    const candidates = [];
    if (sha) candidates.push(`https://cdn.jsdelivr.net/gh/${MAIN_REPO}@${sha}/${MODULE_DIR}/${name}.js`);
    candidates.push(`https://raw.githubusercontent.com/${MAIN_REPO}/main/${MODULE_DIR}/${name}.js`);
    candidates.push(`https://cdn.jsdelivr.net/gh/${MAIN_REPO}@main/${MODULE_DIR}/${name}.js`);

    let lastErr = null;
    for (const url of candidates) {
      try {
        return await importWithTimeout(url);
      } catch (err) {
        lastErr = err;
      }
    }
    throw new Error('Failed to load module ' + name + ': ' + lastErr);
  }

  const MODULE_NAMES = ['core', 'theme-settings', 'auth-backend', 'iframe-loader', 'resource-grids', 'music-player', 'navigation'];

  Promise.all(MODULE_NAMES.map(loadModule))
    .then(modules => {
      const K = {};
      const [core, themeSettings, authBackend, iframeLoader, resourceGrids, musicPlayer, navigation] = modules;
      core.init(K);
      themeSettings.init(K);
      authBackend.init(K);
      iframeLoader.init(K);
      resourceGrids.init(K);
      musicPlayer.init(K);
      navigation.init(K);
    })
    .catch(err => {
      console.error('kstuff module load failed', err);
      const loader = document.querySelector('.section-loader');
      if (loader) {
        loader.classList.remove('hidden');
        loader.style.opacity = '1';
        const t = loader.querySelector('.loading-text');
        if (t) t.textContent = 'Failed to load';
      }
    });
}

document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", initApp) : initApp();
