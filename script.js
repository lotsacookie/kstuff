function initApp() {
  const MAIN_REPO = 'lotsacookie/kstuff';
  const MODULE_DIR = 'Assets/js';
  const SHA_FETCH_TIMEOUT = 6000;
  const IMPORT_TIMEOUT = 10000;
  const MODULE_NAMES = ['core', 'theme-settings', 'auth-backend', 'iframe-loader', 'game-sources', 'resource-grids', 'music-player', 'navigation', 'tabs', 'ui-extras'];

  let shaPromise = null;

  async function fetchSha() {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), SHA_FETCH_TIMEOUT);
    try {
      const r = await fetch(`https://api.github.com/repos/${MAIN_REPO}/commits/main`, { cache: 'no-store', signal: ctrl.signal });
      if (!r.ok) return '';
      const data = await r.json();
      const sha = data?.sha;
      return typeof sha === 'string' && /^[0-9a-f]{40}$/i.test(sha) ? sha : '';
    } catch {
      return '';
    } finally {
      clearTimeout(timer);
    }
  }

  function getRepoSha() {
    if (!shaPromise) shaPromise = window.kShaP || fetchSha();
    return shaPromise;
  }

  function importWithTimeout(url) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('import timeout: ' + url)), IMPORT_TIMEOUT);
    });
    return Promise.race([import(url), timeout]).finally(() => clearTimeout(timer));
  }

  async function loadModule(name) {
    try {
      const sha = await getRepoSha();
      const candidates = [];
      if (sha) candidates.push(`https://cdn.jsdelivr.net/gh/${MAIN_REPO}@${sha}/${MODULE_DIR}/${name}.js`);
      candidates.push(`https://cdn.jsdelivr.net/gh/${MAIN_REPO}@main/${MODULE_DIR}/${name}.js`);
      candidates.push(`https://raw.githubusercontent.com/${MAIN_REPO}/main/${MODULE_DIR}/${name}.js`);

      let lastErr = null;
      for (const url of candidates) {
        try {
          return await importWithTimeout(url);
        } catch (err) {
          lastErr = err;
        }
      }
      throw new Error('Failed to load module ' + name + ': ' + lastErr);
    } finally {
      window.kProgress?.tick();
    }
  }

  const yieldToMain = () => window.scheduler?.yield ? window.scheduler.yield() : new Promise(resolve => setTimeout(resolve, 0));

  async function start() {
    window.kModulesStarted = true;
    window.kProgress?.setTotal((window.kProgress.base || 2) + MODULE_NAMES.length);

    try {
      const modules = await Promise.all(MODULE_NAMES.map(loadModule));
      const K = {};
      for (const mod of modules) {
        mod.init(K);
        await yieldToMain();
      }
    } catch (err) {
      console.error('singularity module load failed', err);
      const loader = document.querySelector('.section-loader');
      if (loader) {
        loader.classList.remove('hidden');
        loader.style.opacity = '1';
        const t = loader.querySelector('.loading-text');
        if (t) t.textContent = 'Failed to load';
      }
    } finally {
      window.kReadyResolve?.();
    }
  }

  start();
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', initApp) : initApp();
