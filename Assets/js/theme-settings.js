export function init(K) {
  const notifyIframesTheme = () => Object.values(K.iframePages).forEach(p => {
    try { K.$(p.id)?.contentWindow?.postMessage('theme-updated', '*'); } catch {}
  });
  K.notifyIframesTheme = notifyIframesTheme;

  const handleThemesLoaded = themes => {
    let css = '', html = '';
    themes.forEach(t => {
      css += `.${t.id}{${Object.entries(t.variables).map(([k, v]) => `${k}:${v};`).join('')}}\n`;
      html += `<option value="${t.id}">${t.name}</option>`;
    });
    const style = K.$('dynamic-themes-style') || document.head.appendChild(K.el('style', { id: 'dynamic-themes-style' }));
    style.textContent = css;
    const sel = K.$('layout-theme-select');
    if (sel) {
      sel.innerHTML = html;
      const chosen = K.currentUser?.settings?.theme || K.currentUser?.theme || K.getStorage('kstuff_theme') || 'theme-pitch-black';
      sel.value = chosen;
      K.setStorage('kstuff_theme', chosen);
      K.body.className = K.body.className.replace(/\btheme-\S+/g, '').trim() + ' ' + chosen;
      K.applyCustomDropdown(sel);
    }
    notifyIframesTheme();
  };
  K.handleThemesLoaded = handleThemesLoaded;

  try { handleThemesLoaded(JSON.parse(K.getStorage('kstuff_themes_cache'))); } catch {}
  K.fetchWithProxy('Assets/json/themes.json').then(t => { K.setStorage('kstuff_themes_cache', JSON.stringify(t)); handleThemesLoaded(t); }).catch(err => console.error('themes.json failed', err));

  const SYSTEM_FONT_NAMES = new Set([
    'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
    'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded',
    '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'segoe ui emoji',
    'arial', 'helvetica', 'verdana', 'tahoma', 'trebuchet ms', 'georgia',
    'times new roman', 'times', 'courier new', 'courier', 'impact',
    'lucida console', 'roboto', 'inherit'
  ]);

  const primaryFontName = fontValue => {
    if (!fontValue) return '';
    const first = fontValue.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
    return first;
  };
  K.primaryFontName = primaryFontName;

  const loadedGoogleFonts = new Set();
  const ensureParentFontLoaded = fontValue => {
    const name = primaryFontName(fontValue);
    if (!name || SYSTEM_FONT_NAMES.has(name.toLowerCase()) || loadedGoogleFonts.has(name)) return;
    loadedGoogleFonts.add(name);
    const link = K.el('link', {
      rel: 'stylesheet',
      href: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@300;400;500;600;700;800&display=swap`
    });
    document.head.appendChild(link);
  };
  K.ensureParentFontLoaded = ensureParentFontLoaded;
  ensureParentFontLoaded(K.getStorage('kstuff_font'));

  [
    ['layout-theme-select', 'kstuff_theme', 'theme', v => { if (v) { K.body.classList.add(v); K.setStorage('kstuff_theme', v); } }],
    ['layout-floating-select', 'kstuff_floating_ui', 'floating', v => { if (v) K.body.classList.add(v); }],
    ['layout-font-select', 'kstuff_font', '', v => { if (v) { document.documentElement.style.setProperty('--font', v); ensureParentFontLoaded(v); } }],
    ['search-engine-select', 'kstuff_search_engine', '', v => { K.updateSearchEngineExample(v); }],
    ['dev-mode-select', 'kstuff_dev_mode', '', v => {
      const on = v === 'on';
      document.documentElement.classList.toggle('sg-dev', on);
      if (!on) document.querySelectorAll('.sg-console.open, .sg-cookies.open').forEach(el => el.classList.remove('open'));
      window.dispatchEvent(new Event('resize'));
    }]
  ].forEach(([id, key, prefix, fn]) => {
    const select = K.$(id); if (!select) return;
    const val = K.getStorage(key) || select.value; select.value = val; fn(val);
    if (id !== 'layout-theme-select') K.applyCustomDropdown(select);
    select.addEventListener('change', e => {
      if (prefix) K.body.className = K.body.className.replace(new RegExp(`\\b${prefix}-\\S+`, 'g'), '').trim();
      fn(e.target.value); K.setStorage(key, e.target.value);
      notifyIframesTheme();
    });
  });

  const flipSelect = K.$('layout-flip-select');
  if (flipSelect) {
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const originals = new Map();
    const SKIP = 'script,style,noscript,textarea,#homeworkhelper-modal';
    const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@?!*+=';
    let scrambleTimer = null;
    const scrambleText = str => str.replace(/[^\s]/g, () => CHARS[Math.floor(Math.random() * CHARS.length)]);
    const scrambleTick = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: n => {
          if (!n.data.trim()) return NodeFilter.FILTER_REJECT;
          const p = n.parentElement;
          return p && !p.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      let n;
      while ((n = walker.nextNode())) {
        const rec = originals.get(n);
        if (!rec || n.data !== rec.scrambled) originals.set(n, { original: n.data, scrambled: '' });
        const r = originals.get(n);
        r.scrambled = scrambleText(r.original);
        n.data = r.scrambled;
      }
      originals.forEach((r, node) => { if (!node.isConnected) originals.delete(node); });
    };
    const restoreText = () => {
      originals.forEach((r, node) => { if (node.isConnected && node.data === r.scrambled) node.data = r.original; });
      originals.clear();
    };
    const syncScramble = () => {
      const should = document.documentElement.classList.contains('sg-flip') && !reduceMq.matches;
      if (should && !scrambleTimer) scrambleTimer = setInterval(scrambleTick, 140);
      if (!should && scrambleTimer) { clearInterval(scrambleTimer); scrambleTimer = null; restoreText(); }
    };
    const applyFlip = v => { document.documentElement.classList.toggle('sg-flip', v === 'flip-on'); syncScramble(); };
    reduceMq.addEventListener('change', syncScramble);
    const flipVal = K.getStorage('kstuff_flip') || 'flip-off';
    flipSelect.value = flipVal;
    applyFlip(flipVal);
    K.applyCustomDropdown(flipSelect);
    flipSelect.addEventListener('change', e => {
      applyFlip(e.target.value);
      K.setStorage('kstuff_flip', e.target.value);
    });
  }

  K.applyCloudSettings = s => {
    if (!s) return;
    if (s.theme) K.setStorage('kstuff_theme', s.theme);
    if (s.font) K.setStorage('kstuff_font', s.font);
    if (s.searchEngine) K.setStorage('kstuff_search_engine', s.searchEngine);
    if (s.floatingUi) K.setStorage('kstuff_floating_ui', s.floatingUi);
    [
      { i: 'layout-theme-select', k: 'kstuff_theme', v: s.theme },
      { i: 'layout-floating-select', k: 'kstuff_floating_ui', v: s.floatingUi },
      { i: 'layout-font-select', k: 'kstuff_font', v: s.font },
      { i: 'search-engine-select', k: 'kstuff_search_engine', v: s.searchEngine }
    ].forEach(({ i, k, v }) => {
      const select = K.$(i);
      if (v && select) {
        K.setStorage(k, v); select.value = v; select.dispatchEvent(new Event('change'));
        const wrap = select.nextElementSibling;
        if (wrap?.classList.contains('custom-select-wrapper')) {
          wrap.querySelector('.custom-select-trigger span').textContent = select.options[select.selectedIndex]?.text || '';
          wrap.querySelectorAll('.custom-select-option').forEach((o, idx) => o.classList.toggle('selected', idx === select.selectedIndex));
        }
      }
    });
  };

  K.userSettings = u => u?.settings || { theme: u?.theme, floatingUi: u?.floatingUi, font: u?.font, searchEngine: u?.searchEngine };

  K.saveSettings = () => {
    const p = {
      theme: K.$('layout-theme-select')?.value,
      floatingUi: K.$('layout-floating-select')?.value,
      font: K.$('layout-font-select')?.value,
      searchEngine: K.$('search-engine-select')?.value,
      lastUpdated: Date.now()
    };
    if (K.currentUser && K.favorites) p.favorites = K.favorites.exportAll();
    if (p.theme) K.setStorage('kstuff_theme', p.theme);
    if (p.font) K.setStorage('kstuff_font', p.font);
    if (p.searchEngine) K.setStorage('kstuff_search_engine', p.searchEngine);
    if (p.floatingUi) K.setStorage('kstuff_floating_ui', p.floatingUi);
    if (K.currentUser) {
      K.currentUser.settings = p;
      K.setStorage('kstuff_user', JSON.stringify(K.currentUser));
    }
    K.sessionSettingsUpdated = true;
    if (K.currentUser?.username) K.sendBackend({ type: 'update-settings', username: K.currentUser.username, settings: p });
  };
}
