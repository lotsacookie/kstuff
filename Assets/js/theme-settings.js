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
      const chosen = K.currentUser?.settings?.theme || K.currentUser?.theme || K.getStorage('kstuff_theme') || themes[0].id;
      sel.value = chosen; K.setStorage('kstuff_theme', chosen);
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
    ['layout-nav-select', 'kstuff_nav_pos', 'nav', v => { if (v) K.body.classList.add(v); }],
    ['layout-size-select', 'kstuff_nav_size', 'size', v => { if (v) K.body.classList.add(v); }],
    ['layout-text-select', 'kstuff_text_vis', '', v => { if (v) K.body.classList.toggle('text-hide', v === 'text-hide'); }],
    ['layout-font-select', 'kstuff_font', '', v => { if (v) { document.documentElement.style.setProperty('--font', v); ensureParentFontLoaded(v); } }],
    ['search-engine-select', 'kstuff_search_engine', '', v => { K.updateSearchEngineExample(v); }]
  ].forEach(([id, key, prefix, fn]) => {
    const select = K.$(id); if (!select) return;
    const val = K.getStorage(key) || select.value; select.value = val; fn(val);
    select.addEventListener('change', e => {
      if (prefix) K.body.className = K.body.className.replace(new RegExp(`\\b${prefix}-\\S+`, 'g'), '').trim();
      fn(e.target.value); K.setStorage(key, e.target.value);
      K.updateIndicator?.(K.navBar?.querySelector('.nav-btn.active'));
      notifyIframesTheme();
    });
  });

  K.applyCloudSettings = s => {
    if (!s) return;
    if (s.theme) K.setStorage('kstuff_theme', s.theme);
    if (s.font) K.setStorage('kstuff_font', s.font);
    if (s.searchEngine) K.setStorage('kstuff_search_engine', s.searchEngine);
    [
      { i: 'layout-theme-select', k: 'kstuff_theme', v: s.theme },
      { i: 'layout-nav-select', k: 'kstuff_nav_pos', v: s.navPos },
      { i: 'layout-size-select', k: 'kstuff_nav_size', v: s.navSize },
      { i: 'layout-text-select', k: 'kstuff_text_vis', v: s.textVis },
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

  K.userSettings = u => u?.settings || { theme: u?.theme, navPos: u?.navPos, navSize: u?.navSize, textVis: u?.textVis, font: u?.font, searchEngine: u?.searchEngine };

  K.saveSettings = () => {
    const p = {
      theme: K.$('layout-theme-select')?.value,
      navPos: K.$('layout-nav-select')?.value,
      navSize: K.$('layout-size-select')?.value,
      textVis: K.$('layout-text-select')?.value,
      font: K.$('layout-font-select')?.value,
      searchEngine: K.$('search-engine-select')?.value,
      lastUpdated: Date.now()
    };
    if (p.theme) K.setStorage('kstuff_theme', p.theme);
    if (p.font) K.setStorage('kstuff_font', p.font);
    if (p.searchEngine) K.setStorage('kstuff_search_engine', p.searchEngine);
    if (K.currentUser) {
      K.currentUser.settings = p;
      K.setStorage('kstuff_user', JSON.stringify(K.currentUser));
    }
    K.sessionSettingsUpdated = true;
    if (K.currentUser?.username) K.sendBackend({ type: 'update-settings', username: K.currentUser.username, settings: p });
  };
}
