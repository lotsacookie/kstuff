function initApp() {
  const MAIN_REPO = 'lotsacookie/kstuff';
  const MODULE_DIR = 'Assets/js';
  const SHA_FETCH_TIMEOUT = 6000;
  const IMPORT_TIMEOUT = 10000;
  const MODULE_NAMES = ['core', 'wisp', 'net-hub', 'live-json', 'theme-settings', 'auth-backend', 'iframe-loader', 'game-sources', 'resource-grids', 'music-player', 'navigation', 'tabs', 'ui-extras', 'vms-grid', 'gfn-launch', 'moon-launch', 'blox-launch'];

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
      // Fast path: the singularity bundle already holds every module, so
      // import it from memory (blob URL) with no GitHub API call and no CDN trip.
      const sg = window.singularity;
      if (sg && sg.has(`${MODULE_DIR}/${name}.js`)) {
        try {
          return await sg.module(name);
        } catch (err) {
          console.warn('bundled module failed, falling back to network:', name, err);
        }
      }

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
    window.kProgress?.setTotal((window.kProgress.base || 2) + MODULE_NAMES.length + 1);

    try {
      const [favMod, modules] = await Promise.all([
        loadModule('favorites').catch(err => { console.warn('favorites unavailable', err); return null; }),
        Promise.all(MODULE_NAMES.map(loadModule))
      ]);
      const K = {};
      for (let i = 0; i < modules.length; i++) {
        modules[i].init(K);
        if (MODULE_NAMES[i] === 'core' && favMod) {
          try { favMod.init(K); } catch (err) { console.warn('favorites init failed', err); }
        }
        await yieldToMain();
      }

      // Optional extras: loaded after the app is up and never allowed to break it.
      loadModule('console-panel')
        .then(mod => mod.init(K))
        .catch(err => console.warn('console panel unavailable', err));
      loadModule('header-overflow')
        .then(mod => mod.init(K))
        .catch(err => console.warn('header overflow unavailable', err));
      loadModule('nav-overflow')
        .then(mod => mod.init(K))
        .catch(err => console.warn('nav overflow unavailable', err));
      loadModule('cookie-viewer')
        .then(mod => mod.init(K))
        .catch(err => console.warn('cookie viewer unavailable', err));
      loadModule('gamepad-nav')
        .then(mod => mod.init(K))
        .catch(err => console.warn('gamepad navigation unavailable', err));
      loadModule('coi-isolate')
        .then(mod => mod.init(K))
        .catch(err => console.warn('coi isolate unavailable', err));
      loadModule('welcome-tour')
        .then(mod => mod.init(K))
        .catch(err => console.warn('welcome tour unavailable', err));
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

/* ===== macOS-style genie modal animation ===== */
// GENIE-START
function genieFrames(W, H, ox, oy, count = 44, rows = 32) {
    const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
    const lerp = (a, b, t) => a + (b - a) * t;
    const smooth = t => t * t * (3 - 2 * t);
    const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const D = 0.7; // how far the bottom lags behind the leading top edge
    const frames = [];
    for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const T = inOut(t);
        const E = smooth(clamp(T));
        const sc = lerp(0.14, 1, E);
        const ax = lerp(ox, W / 2, E), ay = lerp(oy, H, E);
        const left = [], right = [];
        for (let r = 0; r <= rows; r++) {
            const v = r / rows;
            const p = clamp(T * (1 + D) - v * D);
            const ey = smooth(p);
            const ex = Math.pow(smooth(p), 1.35);
            const y = lerp(H, v * H, ey);
            const half = (W / 2) * ex + 1.5 * (1 - ex);
            left.push(`${(W / 2 - half).toFixed(1)}px ${y.toFixed(1)}px`);
            right.push(`${(W / 2 + half).toFixed(1)}px ${y.toFixed(1)}px`);
        }
        frames.push({
            transform: `translate(${(ax - sc * W / 2).toFixed(1)}px, ${(ay - sc * H).toFixed(1)}px) scale(${sc.toFixed(4)})`,
            clipPath: `polygon(${left.concat(right.reverse()).join(',')})`,
            opacity: clamp(t / 0.12),
            offset: t
        });
    }
    return frames;
}
// GENIE-END

(function () {
    if (typeof document === 'undefined') return;
    let last = { x: null, y: null, t: 0 };
    document.addEventListener('pointerdown', e => {
        const el = e.target.closest && e.target.closest('button, a, .round-btn, .footer-item, .nav-btn, [onclick]');
        const r = el && el.getBoundingClientRect();
        last = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, t: Date.now() } : { x: e.clientX, y: e.clientY, t: Date.now() };
    }, true);

    const play = (overlay, opening) => {
        const box = overlay.querySelector(':scope > .modal-content') || overlay.querySelector('.modal-content');
        if (!box || !box.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        box.getAnimations().forEach(a => a.cancel());
        const W = box.offsetWidth, H = box.offsetHeight;
        const r = box.getBoundingClientRect();
        const fresh = last.x != null && Date.now() - last.t < 1000;
        const ox = fresh ? last.x - r.left : W / 2;
        const oy = fresh ? last.y - r.top : H + 60;
        let frames = genieFrames(W, H, ox, oy);
        if (!opening) frames = frames.reverse().map((f, i, a) => ({ ...f, offset: i / (a.length - 1) }));
        box.style.transformOrigin = '0 0';
        box.animate(frames, { duration: opening ? 720 : 440, easing: 'linear', fill: opening ? 'none' : 'forwards' });
    };

    new MutationObserver(list => {
        for (const m of list) {
            const el = m.target;
            if (!el.classList || !el.classList.contains('modal-overlay')) continue;
            const was = (m.oldValue || '').split(/\s+/).includes('active');
            const now = el.classList.contains('active');
            if (was !== now) play(el, now);
        }
    }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
})();
