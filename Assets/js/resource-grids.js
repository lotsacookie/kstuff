export function init(K) {
  const grids = {
    readingcorner: { data: [], pool: [], gridEl: K.$('readingcorner-grid'), pageEl: K.$('readingcorner-pagination'), category: "All", search: "", page: 1, id: 'readingcorner', renderId: 0 },
    sciencequiz: { data: [], pool: [], gridEl: K.$('sciencequiz-grid'), pageEl: K.$('sciencequiz-pagination'), category: "All", search: "", page: 1, id: 'sciencequiz', renderId: 0 }
  };
  K.grids = grids;

  const resourceIframeFor = pageId => K.$(`${pageId}-resource-iframe`);
  K.resourceIframeFor = resourceIframeFor;

  const showResourceGrid = (pageId, show) => {
    const grid = grids[pageId];
    const section = K.$(pageId);
    const filterBar = section?.querySelector('.filter-bar');
    if (filterBar) filterBar.style.display = show ? '' : 'none';
    if (grid?.gridEl) grid.gridEl.style.display = show ? '' : 'none';
    if (grid?.pageEl) grid.pageEl.style.display = show ? '' : 'none';
  };
  K.showResourceGrid = showResourceGrid;

  function clearGridPool(type) {
    const grid = grids[type];
    if (!grid) return;
    if (grid.pool) grid.pool.forEach(p => { if (p.img) { p.img.onload = p.img.onerror = null; p.img.src = ''; } });
    if (grid.gridEl) grid.gridEl.innerHTML = '';
    grid.pool = [];
  }
  K.clearGridPool = clearGridPool;

  function resetResourceView(pageId) {
    const ifr = resourceIframeFor(pageId);
    if (ifr) { ifr.style.display = 'none'; ifr.removeAttribute('srcdoc'); ifr.src = 'about:blank'; }
    K.resourceOpenFor[pageId] = null;
    showResourceGrid(pageId, true);
    K.setCursorSuppressed?.(false);
  }
  K.resetResourceView = resetResourceView;

  const closeResourceInline = pageId => {
    const ifr = resourceIframeFor(pageId);
    if (ifr?.__resourceLoadHandler) { ifr.removeEventListener('load', ifr.__resourceLoadHandler); ifr.__resourceLoadHandler = null; }
    resetResourceView(pageId);
    if (grids[pageId]) { buildPool(pageId); renderGrid(pageId, false); }
  };
  K.closeResourceInline = closeResourceInline;

  const openResource = async (item, opts = {}) => {
    if (!item) return;
    const pageId = opts.pageId || document.querySelector('.page.active')?.id;
    if (!pageId || !grids[pageId]) return;
    const ifr = resourceIframeFor(pageId);
    if (!ifr) return;

    K.tooltipEl.style.display = 'none';

    const token = K.resourceTokens[pageId] = (K.resourceTokens[pageId] || 0) + 1;
    const stale = () => K.resourceTokens[pageId] !== token;

    K.resourceOpenFor[pageId] = item;

    const plainAddr = K.pageAddress(pageId);
    const addr = plainAddr + '/' + K.slugifyTitle(item.title);

    if (!opts.isHistory) {
      if (K.history[K.historyIndex] !== plainAddr && K.history[K.historyIndex] !== addr) {
        K.history = K.history.slice(0, K.historyIndex + 1);
        K.history.push(plainAddr);
        K.historyIndex++;
      }
      if (K.history[K.historyIndex] !== addr) {
        K.history = K.history.slice(0, K.historyIndex + 1);
        K.history.push(addr);
        K.historyIndex++;
      }
    }

    K.setAddress(addr);
    K.updateBrowserNav();

    K.toggleLoader(true);
    showResourceGrid(pageId, false);

    if (ifr.__resourceLoadHandler) { ifr.removeEventListener('load', ifr.__resourceLoadHandler); ifr.__resourceLoadHandler = null; }
    ifr.style.display = 'block';
    ifr.removeAttribute('srcdoc'); ifr.src = 'about:blank';

    const onLoad = () => {
      ifr.removeEventListener('load', onLoad);
      if (ifr.__resourceLoadHandler === onLoad) ifr.__resourceLoadHandler = null;
      if (!stale()) K.toggleLoader(false);
    };
    ifr.__resourceLoadHandler = onLoad;
    ifr.addEventListener('load', onLoad);

    if (!item.url) {
      ifr.removeEventListener('load', onLoad);
      ifr.__resourceLoadHandler = null;
      K.toggleLoader(false);
      return;
    }

    let targetUrl = item.url.trim();

    if (stale()) return;

    const isRelativeUrl = !targetUrl.startsWith('http');
    const isHtmlRepo = isRelativeUrl || K.urlHasKeyword(targetUrl, K.HTML_REPO_KEYWORDS);
    const useLaunch = isHtmlRepo || K.urlHasKeyword(targetUrl, K.LAUNCH_KEYWORDS);

    if (useLaunch) {
      let launchTarget = targetUrl;
      if (isHtmlRepo) {
        const cleanPath = targetUrl.replace(/\$?\{HTML_URL\}\/?/gi, '').replace(/^https?:\/\/[^\/]+\/(?:gh\/)?freebuisness\/html(?:@|\/)?(?:main\/)?/gi, '').replace(/^https?:\/\/[^\/]+\/freebuisness\/html\//gi, '').replace(/^\/+/, '');
        const htmlSha = await K.getLatestSha(false, 'freebuisness/html');
        if (stale()) return;
        launchTarget = `https://cdn.jsdelivr.net/gh/freebuisness/html@${htmlSha || 'main'}/${cleanPath}`;
      }
      if (stale()) return;
      ifr.src = `https://cdn.jsdelivr.net/gh/rtischeduler/deltamath@main/launch.svg?url=${launchTarget}`;
    } else {
      const isProxyUrl = targetUrl.includes('rtischeduler/ixl') || item.category === 'Apps' || (!targetUrl.includes('raw.githubusercontent.com') && !targetUrl.includes('cdn.jsdelivr.net'));
      if (isProxyUrl) {
        ifr.src = targetUrl;
      } else {
        try {
          const res = await fetch(targetUrl, { cache: 'no-store' });
          if (stale()) return;
          if (res.ok) ifr.srcdoc = await res.text();
          else ifr.src = targetUrl;
        } catch {
          if (stale()) return;
          ifr.src = targetUrl;
        }
      }
    }
  };
  K.openResource = openResource;

  const buildPool = type => {
    const grid = grids[type]; if (!grid.gridEl) return;
    clearGridPool(type);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < K.ITEMS_PER_PAGE; i++) {
      const card = K.el('div', { className: 'round-btn' }); card.dataset.index = i;
      card.innerHTML = `<img alt="" style="display:none;"><div class="category-label"></div><div class="overlay"><h3></h3><p></p></div>`;
      grid.pool.push({ el: card, img: card.querySelector('img'), t: card.querySelector('h3'), d: card.querySelector('p'), c: card.querySelector('.category-label') });
      frag.appendChild(card);
    }
    grid.gridEl.appendChild(frag);
    grid.gridEl.onclick = e => { const c = e.target.closest('.round-btn'); if (c && c.style.display !== 'none') openResource(grid.paginatedData?.[c.dataset.index], { pageId: type }); };
  };
  K.buildPool = buildPool;

  const gridImageStyle = document.createElement('style');
  gridImageStyle.textContent = `
    .round-btn {
      position: relative;
      overflow: hidden;
      aspect-ratio: 1 / 1;
    }

    .round-btn > img {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: cover !important;
      object-position: center;
    }

    .round-btn > img[src=""] {
      display: none !important;
    }
  `;
  document.head.appendChild(gridImageStyle);

  const renderGrid = (type, preload = false, mode = 'loading') => {
    return new Promise(async resolve => {
      const grid = grids[type]; if (!grid.gridEl) return resolve();
      grid.renderId = (grid.renderId || 0) + 1;
      const myRenderId = grid.renderId;
      K.toggleLoader(true, mode);
      const filtered = (grid.data || []).filter(i => (grid.category === "All" || i.category === grid.category) && i.title.toLowerCase().includes(grid.search));
      const totalPages = Math.max(1, Math.ceil(filtered.length / K.ITEMS_PER_PAGE));
      if (grid.page > totalPages) grid.page = 1;
      grid.paginatedData = filtered.slice((grid.page - 1) * K.ITEMS_PER_PAGE, grid.page * K.ITEMS_PER_PAGE);

      const imagePromises = [];
      for (let idx = 0; idx < grid.pool.length; idx++) {
        const p = grid.pool[idx];
        const item = grid.paginatedData[idx];
        p.el.style.display = item ? 'block' : 'none';

        if (item) {
          if (p.t.textContent !== item.title) p.t.textContent = item.title;
          if (p.d.textContent !== (item.description || '')) p.d.textContent = item.description || '';
          if (p.c) p.c.textContent = item.category || 'All';
          p.el.dataset.tooltip = item.title;

          if (p.img.dataset.src !== (item.image || '')) {
            p.img.onload = p.img.onerror = null;
            if (p.img.src) p.img.src = '';
            p.img.dataset.src = item.image || '';
            if (item.image) {
              p.img.style.display = 'block';
              p.img.loading = 'lazy';
              p.img.decoding = 'async';
              const pr = new Promise(res => {
                let done = false;
                const doneFn = () => { if (done) return; done = true; p.img.onload = p.img.onerror = null; res(); };
                p.img.onload = doneFn; p.img.onerror = doneFn;
                p.img.src = item.image;
              });
              imagePromises.push(pr);
            } else {
              p.img.removeAttribute('src'); p.img.style.display = 'none';
            }
          } else if (item.image) {
            p.img.style.display = 'block';
          }
        } else {
          if (p.img) { p.img.onload = p.img.onerror = null; p.img.src = ''; p.img.removeAttribute('src'); p.img.style.display = 'none'; delete p.img.dataset.src; }
          if (p.c) p.c.textContent = ''; delete p.el.dataset.tooltip;
        }
      }

      if (grid.pageEl) {
        grid.pageEl.innerHTML = `<button class="page-btn" data-action="prev" ${grid.page===1?'style="opacity:0.4;cursor:not-allowed;"':''}><i class="ph ph-caret-left"></i></button><span style="font-weight:700;font-size:1.1rem;min-width:80px;text-align:center;user-select:none;">${grid.page} / ${totalPages}</span><button class="page-btn" data-action="next" ${grid.page===totalPages?'style="opacity:0.4;cursor:not-allowed;"':''}><i class="ph ph-caret-right"></i></button>`;
        if (!grid.pageEl.dataset.bound) {
          grid.pageEl.dataset.bound = 'true';
          grid.pageEl.onclick = e => {
            const btn = e.target.closest('.page-btn'); if (!btn) return;
            const f = (grid.data || []).filter(i => (grid.category === "All" || i.category === grid.category) && i.title.toLowerCase().includes(grid.search));
            const tp = Math.max(1, Math.ceil(f.length / K.ITEMS_PER_PAGE));
            const act = btn.dataset.action;
            if (act === 'prev' && grid.page > 1) { grid.page--; renderGrid(type, true); }
            else if (act === 'next' && grid.page < tp) { grid.page++; renderGrid(type, true); }
          };
        }
      }

      const waitPromise = (imagePromises.length ? Promise.allSettled(imagePromises) : Promise.resolve());
      const timeout = new Promise(r => setTimeout(r, K.IMAGE_LOAD_TIMEOUT));
      await Promise.race([waitPromise, timeout]);

      if (grid.renderId === myRenderId) {
        K.toggleLoader(false);
      }
      resolve();
    });
  };
  K.renderGrid = renderGrid;

  Object.keys(grids).forEach(type => {
    let timer;
    K.$(`${type}-search`)?.addEventListener('input', e => {
      const clr = K.$(`${type}-search-clear`); if (clr) clr.style.display = e.target.value ? 'block' : 'none';
      clearTimeout(timer);
      timer = setTimeout(() => { grids[type].search = e.target.value.toLowerCase().trim(); grids[type].page = 1; renderGrid(type, true); }, 120);
    });
    K.$(`${type}-search-clear`)?.addEventListener('click', () => {
      K.$(`${type}-search`).value = ''; K.$(`${type}-search-clear`).style.display = 'none';
      grids[type].search = ''; grids[type].page = 1; renderGrid(type, true);
    });
  });

  document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    const activePage = document.querySelector('.page.active'); if (!activePage) return;
    const type = activePage.id; if (!grids[type]) return;
    const grid = grids[type];
    const filtered = (grid.data || []).filter(i => (grid.category === "All" || i.category === grid.category) && i.title.toLowerCase().includes(grid.search));
    const totalPages = Math.max(1, Math.ceil(filtered.length / K.ITEMS_PER_PAGE));
    if (e.key === 'ArrowLeft' && grid.page > 1) { e.preventDefault(); grid.page--; renderGrid(type, true); }
    else if (e.key === 'ArrowRight' && grid.page < totalPages) { e.preventDefault(); grid.page++; renderGrid(type, true); }
  });

  K.fetchWithProxy('Assets/json/categories.json').then(c => {
    const setC = (id, opts, type) => {
      const s = K.$(id); if (!s) return;
      s.innerHTML = (opts||[]).map(o => `<option value="${o}">${o}</option>`).join(''); K.applyCustomDropdown(s);
      s.addEventListener('change', e => { grids[type].category = e.target.value; grids[type].page = 1; renderGrid(type, true); });
    };
    setC('readingcorner-category-select', c.Games, 'readingcorner'); setC('sciencequiz-category-select', c.Apps, 'sciencequiz');
  }).catch(err => console.error('categories.json failed', err));

  K.fetchWithProxy('Assets/json/change-log.json').then(l => {
    if (!l) return;
    if (K.$('changelog-timestamp')) K.$('changelog-timestamp').textContent = l.timestamp || "Unknown";
    if (K.$('changelog-content')) K.$('changelog-content').innerHTML = l.changes?.length ? `<ul style="padding-left:1.5rem;margin:0;">${l.changes.map(c => `<li style="margin-bottom:0.5rem;">${c}</li>`).join('')}</ul>` : "No recent changes found.";
    const fetchedJsonString = JSON.stringify(l), savedJsonString = K.getStorage('kstuff_last_changelog');
    if (fetchedJsonString !== savedJsonString) { K.setStorage('kstuff_last_changelog', fetchedJsonString); K.$('changelog-modal')?.classList.add('active'); }
  }).catch(err => console.error('change-log.json failed', err));

  const appB = (s, isPage = false) => {
    if (typeof s !== 'string') return s;
    if (K.MIRROR_PH.test(s)) {
      return isPage ? K.buildIxlUrl(s) : '';
    }
    return s.replace(/([^:]\/)\/+/g, '$1').replace(/^http:\/\//i, 'https://');
  };
  K.appB = appB;

  const proc = arr => (Array.isArray(arr) ? arr : []).map(i => {
    let p = { ...i };
    if (p.url?.includes('${truffled}') || !p.image || p.category === 'Truffled') {
      const m = K.gTruf.get(K.cleanGameTitle(p.title));
      if (m) {
        p.title = m.name;
        p.url = '${truffled}/' + K.trimSlash(m.url);
        p.image = '${truffled}/' + K.trimSlash(m.thumbnail);
        p.description = '';
        p.category = p.category || 'Truffled';
      }
    }
    p.url = appB(p.url, true); p.image = appB(p.image);
    return p;
  }).sort((a, b) => (a.title||"").localeCompare(b.title||"", undefined, { sensitivity: 'base' }));
  K.proc = proc;

  const rData = async (t, p, resetPage = true, mode = 'updating', silent = false) => {
    try {
      const n = await K.fetchWithProxy(p).catch(err => { console.error('rData fetch failed', p, err); return null; });
      if (!Array.isArray(n)) { if (!silent) K.toggleLoader(false); return false; }

      if (t === 'sciencequiz') rawSciencequizData = n;
      const processed = proc(n);
      if (JSON.stringify(processed) === JSON.stringify(grids[t].data)) {
        if (!silent) K.toggleLoader(false);
        return false;
      }

      K.toggleLoader(true, mode);
      grids[t].data = processed;
      if (resetPage) grids[t].page = 1;
      await renderGrid(t, true, mode);
      return true;
    } catch (err) {
      console.error('rData failed', t, p, err);
      if (!silent) K.toggleLoader(false);
      return false;
    }
  };
  K.rData = rData;

  const fetchReadingCornerRaw = async () => {
    const coverBase = 'https://cdn.jsdelivr.net/gh/freebuisness/covers@main';
    const htmlBase = 'https://cdn.jsdelivr.net/gh/freebuisness/html@main';
    const manualRes = await K.fetchWithProxy('Assets/json/g.json').catch(() => null);
    const manualList = Array.isArray(manualRes) ? manualRes : [];
    const manualMap = new Map();
    manualList.forEach(item => { if (item && item.title) manualMap.set(item.title.toLowerCase().trim(), item); });

    try {
      const json = await K.fetchRepoFile('freebuisness/assets', 'zones.json', false, 12000);
      if (!Array.isArray(json)) throw new Error('zones.json is not an array');
      const mappedData = [];
      json.forEach(item => {
        const titleLower = (item.name || '').toLowerCase().trim();
        const manualMatch = manualMap.get(titleLower);
        let finalUrl = item.url, finalCover = item.cover, finalTitle = item.name, finalCategory = 'All';
        if (manualMatch) {
          if (manualMatch.url) finalUrl = manualMatch.url;
          if (manualMatch.category) finalCategory = manualMatch.category;
          if (manualMatch.image || manualMatch.img) finalCover = manualMatch.image || manualMatch.img;
          manualMap.delete(titleLower);
        }
        if (finalTitle && finalTitle.includes('[!]')) return;
        mappedData.push({
          title: finalTitle,
          image: (finalCover || '').replace('{COVER_URL}', coverBase + '/'),
          url: (finalUrl || '').replace('{HTML_URL}', htmlBase + '/'),
          category: finalCategory,
          description: ''
        });
      });
      manualMap.forEach(manualItem => {
        if (manualItem.title && !manualItem.title.includes('[!]')) {
          mappedData.push({
            title: manualItem.title,
            image: manualItem.image || manualItem.img || '',
            url: manualItem.url || '',
            category: manualItem.category || 'Manual',
            description: ''
          });
        }
      });
      return { data: mappedData };
    } catch (e) { console.error('fetchReadingCornerRaw zones failed', e); }

    const fallbackMapped = [];
    manualList.forEach(item => {
      if (!item || !item.title || item.title.includes('[!]')) return;
      fallbackMapped.push({ ...item, image: item.image || item.img || '', category: item.category || 'All' });
    });
    return { data: fallbackMapped };
  };
  K.fetchReadingCornerRaw = fetchReadingCornerRaw;

  const refreshReadingCorner = async (resetPage = true, mode = 'updating', silent = false) => {
    try {
      const result = await fetchReadingCornerRaw();
      if (!result?.data?.length) { if (!silent) K.toggleLoader(false); return false; }

      K.rawReadingCornerData = result.data;
      const processed = proc(result.data);
      if (JSON.stringify(processed) === JSON.stringify(grids.readingcorner.data)) {
        if (!silent) K.toggleLoader(false);
        return false;
      }

      K.toggleLoader(true, mode);
      grids.readingcorner.data = processed;
      if (resetPage) grids.readingcorner.page = 1;
      await renderGrid('readingcorner', true, mode);
      return true;
    } catch (err) {
      console.error('refreshReadingCorner failed', err);
      if (!silent) K.toggleLoader(false);
      return false;
    }
  };
  K.refreshReadingCorner = refreshReadingCorner;

  K.refreshGridSource = (tId, silent = true) => {
    if (K.resourceOpenFor[tId]) return Promise.resolve(false);
    if (tId === 'readingcorner') return refreshReadingCorner(false, 'updating', silent);
    if (tId === 'sciencequiz') return rData('sciencequiz', 'Assets/json/a.json', false, 'updating', silent);
    return Promise.resolve(false);
  };

  K.$('readingcorner-refresh-btn')?.addEventListener('click', () => refreshReadingCorner());
  K.$('sciencequiz-refresh-btn')?.addEventListener('click', () => rData('sciencequiz', 'Assets/json/a.json'));

  K.rawReadingCornerData = [];
  K.rawSciencequizData = [];
  let rawSciencequizData = K.rawSciencequizData;

  K.initPromise = Promise.all([
    fetchReadingCornerRaw().catch(error => {
      console.error('Reading Corner initialization failed:', error);
      return { data: [] };
    }),
    K.fetchWithProxy('Assets/json/a.json').catch(error => {
      console.error('Science Quiz initialization failed:', error);
      return [];
    }),
    K.fetchWithProxy('Assets/json/truffled.json').catch(error => {
      console.error('Truffled initialization failed:', error);
      return null;
    }),
    K.fetchWisps()
  ]).then(async ([readingResult, scienceData, truffledData]) => {
    K.gTruf.clear();

    if (Array.isArray(truffledData?.games)) {
      truffledData.games.forEach(game => {
        if (game?.name) {
          K.gTruf.set(K.cleanGameTitle(game.name), game);
        }
      });
    }

    K.rawReadingCornerData = readingResult?.data || [];
    K.rawSciencequizData = Array.isArray(scienceData) ? scienceData : [];

    grids.readingcorner.data = proc(K.rawReadingCornerData);
    grids.sciencequiz.data = proc(K.rawSciencequizData);

    Object.keys(grids).forEach(type => {
      if (!grids[type].gridEl) return;

      if (!grids[type].pool.length) {
        buildPool(type);
      }
    });

    const activePage = document.querySelector('.page.active');

    if (activePage && grids[activePage.id]) {
      await renderGrid(activePage.id, false, 'loading');
    }

    K.toggleLoader(false);
  }).catch(error => {
    console.error('init failed:', error);
    K.toggleLoader(false);
  });
          }
