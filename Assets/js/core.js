export function init(K) {
  K.$ = id => document.getElementById(id);
  K.$$ = sel => document.querySelectorAll(sel);
  K.el = (tag, props) => Object.assign(document.createElement(tag), props);
  K.getStorage = k => localStorage.getItem(k);
  K.setStorage = (k, v) => localStorage.setItem(k, v);
  K.cleanUrl = u => u ? u.replace(/\/+$/, '') : '';
  K.trimSlash = u => u ? u.replace(/^\/+/, '') : '';
  K.cleanGameTitle = t => (t || '').toLowerCase().replace(/,\s*webport/gi, '').trim();
  K.slugifyTitle = t => (t || '').toLowerCase().trim().replace(/\s+/g, '-');

  K.urlMap = { 'mathworksheets': 'home', 'readingcorner': 'games', 'sciencequiz': 'apps', 'gradebook': 'music', 'civics': 'tv', 'lessonplanner': 'ai', 'vms': 'vms', 'studyhall': 'chat' };
  K.reverseUrlMap = Object.entries(K.urlMap).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});
  K.SCHEME = 'singularity://';
  K.history = ['singularity://home'];
  K.historyIndex = 0;
  K.pendingResourceOpen = {};
  K.resourceOpenFor = {};
  K.resourceTokens = {};
  K.isAnyResourceOpen = () => Object.values(K.resourceOpenFor).some(Boolean);

  K.HTML_REPO_KEYWORDS = ['freebuisness/html', '{html_url}', 'htm@main'];
  K.LAUNCH_KEYWORDS = [...K.HTML_REPO_KEYWORDS, 'web-port', 'webport', 'web_port', 'gmshelf/'];
  K.urlHasKeyword = (url, keywords) => {
    const lower = (url || '').toLowerCase();
    return keywords.some(k => lower.includes(k));
  };

  K.iframePages = {
    mathworksheets: { id: 'mathworksheets-iframe', path: 'Assets/pages/browser.html' },
    gradebook: { id: 'gradebook-iframe', path: 'Assets/pages/music.html' },
    civics: { id: 'civics-iframe', path: 'Assets/pages/tv.html' },
    lessonplanner: { id: 'lessonplanner-iframe', path: 'Assets/pages/ai.html' },
    studyhall: { id: 'studyhall-iframe', path: 'Assets/pages/chat.html' },
    vms: { id: 'vms-iframe', path: 'Assets/pages/vms.html' }
  };

  K.SEARCH_ENGINES = {
    duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
    google: { name: 'Google', url: 'https://www.google.com/search?q=%s' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=%s' },
    brave: { name: 'Brave', url: 'https://search.brave.com/search?q=%s' },
    startpage: { name: 'Startpage', url: 'https://www.startpage.com/sp/search?query=%s' },
    ecosia: { name: 'Ecosia', url: 'https://www.ecosia.org/search?q=%s' },
    yahoo: { name: 'Yahoo', url: 'https://search.yahoo.com/search?p=%s' }
  };

  K.getSearchEngine = () => K.SEARCH_ENGINES[K.getStorage('kstuff_search_engine')] || K.SEARCH_ENGINES.duckduckgo;

  K.updateSearchEngineExample = engineKey => {
    const exampleEl = K.$('search-engine-example');
    if (!exampleEl) return;
    const engine = K.SEARCH_ENGINES[engineKey] || K.getSearchEngine();
    exampleEl.textContent = engine.url.replace('%s', 'example+search');
  };

  K.formatWebUrl = rawUrl => {
    let val = rawUrl.trim();
    if (!val) return '';
    if (/^(kstuff|singularity):\/\//i.test(val)) return K.SCHEME + val.replace(/^[a-z]+:\/\//i, '');
    if (val.match(/^https?:\/\//)) return val;
    if (val.includes('.') && !val.includes(' ')) return 'https://' + val;
    return K.getSearchEngine().url.replace('%s', encodeURIComponent(val));
  };

  K.tbInput = K.$('textbook-input') || K.$('textbook-url');
  K.studyIframe = K.$('study-iframe') || K.$('browser-iframe');
  K.sBack = K.$('study-back-btn') || K.$('browser-back');
  K.sFwd = K.$('study-forward-btn') || K.$('browser-forward');
  K.sReload = K.$('reload-study-btn') || K.$('browser-refresh');
  K.sHome = K.$('home-study-btn') || K.$('browser-home');
  K.pageAddress = id => K.SCHEME + (K.urlMap[id] || id);
  K.setAddress = value => { if (K.tbInput) K.tbInput.value = value; K.updateLogoState?.(); };
  K.body = document.body;
  K.navBar = K.$('teachertouchbar');
  K.navBtns = K.$$('.nav-btn');
  K.pages = K.$$('.page');
  K.loader = document.querySelector('.section-loader');
  K.pContainer = K.$('profile-edit-container');
  K.findNavBtn = id => Array.from(K.navBtns).find(b => b.dataset.target === id);

  K.ITEMS_PER_PAGE = 48;
  K.IMAGE_LOAD_TIMEOUT = 5000;
  K.FETCH_TIMEOUT = 10000;
  K.SHA_FETCH_TIMEOUT = 6000;
  K.SHA_TTL = 30000;
  K.SHA_FAIL_TTL = 60000;
  K.IFRAME_SHOW_TIMEOUT = 2500;
  K.BACKEND_LINK_TIMEOUT = 15000;
  K.BACKEND_WATCHDOG_INTERVAL = 4000;
  K.AUTH_TIMEOUT = 90000;
  K.AUTH_RECONNECT_AFTER = 20000;
  K.MAIN_REPO = 'lotsacookie/kstuff';
  K.BACKEND_URLS = [
    'https://cdn.jsdelivr.net/gh/rtischeduler/deltamath/backend.svg'
  ];
  K.DEFAULT_PIC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cpath fill='%23888' d='M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0,87.83,87.83,0,0,1-107.84,0ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Zm97.76,66.41a79.66,79.66,0,0,0-36.06-28.75,48,48,0,1,0-61.4,0,79.66,79.66,0,0,0-36.06,28.75,88,88,0,1,1,133.52,0Z'/%3E%3C/svg%3E";
  K.MAX_UNDERSCORES = 2;
  K.MAX_USERNAME_LENGTH = 20;
  K.dbg = (...args) => console.log('[kstuff-backend]', ...args);
  K.MUSIC_IFRAME_ID = 'gradebook-iframe';

  K.CURSOR_SIZE = 28;
  K.CURSOR_OFFSETS = { arrow: [4 * 28 / 24, 2.4 * 28 / 24], hand: [10.5 * 28 / 24, 2 * 28 / 24] };
  K.CURSOR_SVG_MARKUP = `<svg class="k-arrow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 2.4 19.8 9.9c.6.3.5 1.1-.1 1.3l-6.6 1.8-2.3 6.4c-.2.6-1 .6-1.3 0L4 2.4z" fill="currentColor" stroke="rgba(0,0,0,.35)" stroke-width=".7" stroke-linejoin="round"/></svg><svg class="k-hand" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 3.5a1.5 1.5 0 0 1 3 0V10h.5V8.5a1.3 1.3 0 0 1 2.6 0V10h.4V9.4a1.3 1.3 0 0 1 2.6 0V10.5h.3a1.3 1.3 0 0 1 1.3 1.3V15c0 3.3-2.2 6-5.5 6h-1.4c-1.8 0-3-.8-4-2.1L5.3 15.2a1.4 1.4 0 0 1 2.1-1.8L9 15V3.5z" fill="currentColor" stroke="rgba(0,0,0,.35)" stroke-width=".7" stroke-linejoin="round"/></svg>`;
  K.CLICKABLE_SELECTOR = "a[href],button:not(:disabled),[role='button'],[onclick],select,summary,label[for],input[type='button']:not(:disabled),input[type='submit']:not(:disabled),input[type='checkbox'],input[type='radio'],input[type='range'],.round-btn,.nav-btn,.custom-select-trigger,.custom-select-option,.page-btn,[data-act]:not(:disabled),[data-target]";

  K.backendPort = null;
  K.backendLinked = false;
  K.backendReady = false;
  K.syncInterval = null;
  K.currentUser = null;
  K.backendFrame = null;
  K.backendLinkTimer = null;
  K.backendAttempts = 0;
  K.backendUrlIndex = 0;
  K.authBusyTimer = null;
  K.pendingAuthMessage = null;
  K.authWatchdogTimer = null;
  K.backendQueue = [];
  K.gTruf = new Map();

  K.MIRROR_PH = /\$\{(scram|static|uv|frogiee|truffled)\}/;

  K.savedWindowScrollY = 0;
  K.savedPageScrollTop = 0;
  K.sessionSettingsUpdated = false;
  K.initPromise = null;
  K.isNavigating = false;
  K.autoRefreshBusy = false;
  K.firstNavStarted = false;

  K.wispsData = null;
  K.wispsPromise = null;
  K.WISPS_URL = 'https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/json/wss.json';

  K.fetchWisps = () => {
    if (K.wispsPromise) return K.wispsPromise;
    K.wispsPromise = fetch(K.WISPS_URL, { cache: 'no-store' })
      .then(r => r.json())
      .then(j => { K.wispsData = j; return j; })
      .catch(() => { K.wispsData = []; return []; });
    return K.wispsPromise;
  };

  K.b64Url = str => btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  K.buildIxlUrl = rawUrl => {
    const strippedUrl = (rawUrl || '').replace(/\$\{(scram|static|uv|frogiee|truffled)\}/g, '');
    const targetB64 = K.b64Url(JSON.stringify(strippedUrl));
    const wispsB64 = (Array.isArray(K.wispsData) && K.wispsData.length ? K.wispsData[0] : '').replace(/=+$/, '');
    return `https://cdn.jsdelivr.net/gh/rtischeduler/ixl@main/embed.svg?target=${targetB64}&wisps=${wispsB64}`;
  };

  K.timedFetch = async (url, asText = false, ms = K.FETCH_TIMEOUT) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return asText ? await r.text() : await r.json();
    } finally { clearTimeout(timer); }
  };

  K.shaStates = {};

  K.getLatestSha = async (force = false, repo = K.MAIN_REPO) => {
    const st = K.shaStates[repo] || (K.shaStates[repo] = { sha: '', at: 0, failAt: 0, pending: null });
    const now = Date.now();
    if (!force && st.sha && now - st.at < K.SHA_TTL) return st.sha;
    if (!force && !st.sha && st.failAt && now - st.failAt < K.SHA_FAIL_TTL) return '';
    if (st.pending) return st.pending;
    st.pending = (async () => {
      try {
        const data = await K.timedFetch(`https://api.github.com/repos/${repo}/commits/main`, false, K.SHA_FETCH_TIMEOUT);
        const sha = data?.sha;
        if (typeof sha === 'string' && /^[0-9a-f]{40}$/i.test(sha)) {
          st.sha = sha;
          st.at = Date.now();
          st.failAt = 0;
          return sha;
        }
      } catch {}
      st.sha = '';
      st.failAt = Date.now();
      return '';
    })();
    try {
      return await st.pending;
    } finally {
      st.pending = null;
    }
  };

  K.fetchFromSources = async (path, asText, sources) => {
    const cb = (path.includes('?') ? '&' : '?') + '_=' + Date.now();
    let lastErr = null;
    for (const [base, ms] of sources) {
      try {
        return await K.timedFetch(base + path + cb, asText, ms);
      } catch (err) {
        lastErr = err;
      }
    }
    console.error('All sources failed for', path, lastErr);
    throw new Error("Proxies failed: " + path);
  };

  K.fetchRepoFile = async (repo, path, asText = false, ms = K.FETCH_TIMEOUT, extraSources = []) => {
    const sha = await K.getLatestSha(false, repo);
    const sources = [];
    if (sha) sources.push([`https://cdn.jsdelivr.net/gh/${repo}@${sha}/`, ms]);
    sources.push([`https://raw.githubusercontent.com/${repo}/main/`, ms]);
    sources.push(...extraSources);
    sources.push([`https://cdn.jsdelivr.net/gh/${repo}@main/`, ms]);
    return K.fetchFromSources(path, asText, sources);
  };

  K.fetchWithProxy = (path, asText = false) =>
    K.fetchRepoFile(K.MAIN_REPO, path, asText, K.FETCH_TIMEOUT, [['', K.FETCH_TIMEOUT]]);

  K.applyCustomDropdown = selectEl => {
    if (!selectEl || (selectEl.dataset.customized && !selectEl.nextElementSibling?.classList.contains('custom-select-wrapper'))) return;
    if (selectEl.dataset.customized) selectEl.nextElementSibling.remove();
    selectEl.style.display = 'none'; selectEl.dataset.customized = 'true';
    const wrap = K.el('div', { className: 'custom-select-wrapper' }),
      trig = K.el('div', { className: 'custom-select-trigger', tabIndex: 0 }),
      opts = K.el('div', { className: 'custom-select-options' });
    trig.innerHTML = `<span>${selectEl.options[selectEl.selectedIndex]?.text || ''}</span> <i class="ph ph-caret-down"></i>`;
    Array.from(selectEl.options).forEach((opt, idx) => {
      const o = K.el('div', { className: `custom-select-option ${idx === selectEl.selectedIndex ? 'selected' : ''}`, textContent: opt.text });
      o.onclick = e => {
        e.stopPropagation(); selectEl.value = opt.value;
        trig.querySelector('span').textContent = opt.text;
        opts.querySelectorAll('.custom-select-option').forEach(item => item.classList.remove('selected'));
        o.classList.add('selected'); opts.classList.remove('open');
        selectEl.dispatchEvent(new Event('change'));
      };
      opts.appendChild(o);
    });
    trig.onclick = e => {
      e.stopPropagation();
      K.$$('.custom-select-options.open').forEach(m => m !== opts && m.classList.remove('open'));
      opts.classList.toggle('open');
    };
    wrap.append(trig, opts); selectEl.parentNode.insertBefore(wrap, selectEl.nextSibling);
  };

  document.addEventListener('click', () => K.$$('.custom-select-options.open').forEach(el => el.classList.remove('open')));
  K.$$('.setting-group select').forEach(K.applyCustomDropdown);

  const loaderTextEl = K.loader?.querySelector('.loading-text');
  K.toggleLoader = (show, mode = 'loading') => {
    if (!K.loader) return;
    if (show && loaderTextEl) loaderTextEl.textContent = mode === 'updating' ? 'Updating' : 'Loading';
    K.loader.style.opacity = show ? '1' : '0';
    K.loader.classList.toggle('hidden', !show);
  };
  K.toggleLoader(true);

  K.pages.forEach(p => {
    p.style.opacity = p.classList.contains('active') ? '1' : '0';
    if (!p.classList.contains('active')) p.style.display = 'none';
  });

  const initialActivePage = document.querySelector('.page.active');
  if (initialActivePage && K.urlMap[initialActivePage.id]) K.setAddress(K.pageAddress(initialActivePage.id));

  try {
    K.currentUser = JSON.parse(K.getStorage('kstuff_user'));
    if (K.currentUser && !K.currentUser.username) {
      K.currentUser = null;
      localStorage.removeItem('kstuff_user');
    }
    if (K.currentUser?.password) {
      delete K.currentUser.password;
      K.setStorage('kstuff_user', JSON.stringify(K.currentUser));
    }
    const uTheme = K.currentUser?.settings?.theme || K.currentUser?.theme;
    if (uTheme) K.setStorage('kstuff_theme', uTheme);
    const uFont = K.currentUser?.settings?.font;
    if (uFont) K.setStorage('kstuff_font', uFont);
    const uSearchEngine = K.currentUser?.settings?.searchEngine;
    if (uSearchEngine) K.setStorage('kstuff_search_engine', uSearchEngine);
    const uFloating = K.currentUser?.settings?.floatingUi;
    if (uFloating) K.setStorage('kstuff_floating_ui', uFloating);
  } catch { localStorage.removeItem('kstuff_user'); }

  if (!K.getStorage('kstuff_theme')) K.setStorage('kstuff_theme', 'theme-pitch-black');
  if (!K.getStorage('kstuff_font')) K.setStorage('kstuff_font', 'Comfortaa, sans-serif');
  if (!K.getStorage('kstuff_search_engine')) K.setStorage('kstuff_search_engine', 'duckduckgo');
  if (!K.getStorage('kstuff_floating_ui')) K.setStorage('kstuff_floating_ui', 'floating-on');
}
