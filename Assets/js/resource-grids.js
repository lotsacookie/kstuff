export function init(K) {
  const grids = {
    readingcorner: { data: [], pool: [], gridEl: K.$('readingcorner-grid'), pageEl: K.$('readingcorner-pagination'), category: "All", search: "", page: 1, id: 'readingcorner', renderId: 0, sig: '', filterCache: null, pageKey: '' },
    sciencequiz: { data: [], pool: [], gridEl: K.$('sciencequiz-grid'), pageEl: K.$('sciencequiz-pagination'), category: "All", search: "", page: 1, id: 'sciencequiz', renderId: 0, sig: '', filterCache: null, pageKey: '' }
  };
  K.grids = grids;
  K.lastGridRefresh = {};

  const REFRESH_TTL = 60000;
  const FIRST_PAINT_IMAGES = 24;

  const hashSig = str => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36) + ':' + str.length;
  };

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

  const releaseImage = img => {
    if (!img) return;
    img.onload = img.onerror = null;
    img.removeAttribute('src');
    img.style.display = 'none';
    delete img.dataset.src;
  };

  function clearGridPool(type) {
    const grid = grids[type];
    if (!grid) return;
    grid.pool.forEach(p => releaseImage(p.img));
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

  const launchInline = async (ifr, url, stale, onLoad) => {
    const res = await fetch(url);
    let text = await res.text();
    if (stale()) return;
    if (K.isSeraphUrl && K.isSeraphUrl(url)) text = K.cleanSeraphHtml(text);

    const doc = ifr.contentDocument;
    if (!doc) throw new Error('iframe document unavailable');

    ifr.removeEventListener('load', onLoad);
    ifr.__resourceLoadHandler = null;

    const base = String(url).replace(/[^\/]*$/, '');
    const html = /<base\s/i.test(text) ? text : (/<head[^>]*>/i.test(text) ? text.replace(/<head([^>]*)>/i, `<head$1><base href="${base}">`) : `<base href="${base}">` + text);

    doc.open();
    doc.write(html);
    doc.close();

    if (!stale()) K.toggleLoader(false);
  };

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

    if (targetUrl.startsWith('lumin:')) {
      try {
        const luminUrl = await K.luminGameUrl(targetUrl.slice(6));
        if (stale()) return;
        if (luminUrl) ifr.src = luminUrl;
        else K.toggleLoader(false);
      } catch {
        if (!stale()) K.toggleLoader(false);
      }
      return;
    }

    if (K.MIRROR_PH.test(targetUrl)) {
      await K.embedInFrame(ifr, targetUrl);
      return;
    }

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
      try {
        await launchInline(ifr, launchTarget, stale, onLoad);
      } catch {
        if (stale()) return;
        ifr.src = `https://cdn.jsdelivr.net/gh/deltamath1/deltamath@main/l.svg?url=${launchTarget}`;
      }
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

  const cardTemplate = document.createElement('div');
  cardTemplate.className = 'round-btn';
  cardTemplate.innerHTML = `<img alt="" style="display:none;"><div class="category-label"></div><div class="overlay"><h3></h3><p></p></div>`;

  const buildPool = type => {
    const grid = grids[type];
    if (!grid.gridEl) return;
    const needed = K.ITEMS_PER_PAGE;
    if (grid.pool.length !== needed) {
      grid.pool.forEach(p => releaseImage(p.img));
      grid.gridEl.textContent = '';
      grid.pool = [];
      const frag = document.createDocumentFragment();
      for (let i = 0; i < needed; i++) {
        const card = cardTemplate.cloneNode(true);
        card.dataset.index = i;
        grid.pool.push({ el: card, img: card.querySelector('img'), t: card.querySelector('h3'), d: card.querySelector('p'), c: card.querySelector('.category-label') });
        frag.appendChild(card);
      }
      grid.gridEl.appendChild(frag);
      grid.pageKey = '';
    }
    grid.gridEl.onclick = e => {
      const c = e.target.closest('.round-btn');
      if (c && c.style.display !== 'none') openResource(grid.paginatedData?.[c.dataset.index], { pageId: type });
    };
  };
  K.buildPool = buildPool;

  const gridImageStyle = document.createElement('style');
  gridImageStyle.textContent = `
    .round-btn{position:relative;overflow:hidden;aspect-ratio:1/1;contain:layout paint style;content-visibility:auto;contain-intrinsic-size:auto 220px;}
    .round-btn>img{position:absolute;inset:0;display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:cover!important;object-position:center;}
    .round-btn>img[src=""]{display:none!important;}
  `;
  document.head.appendChild(gridImageStyle);

  const getFiltered = grid => {
    const key = grid.category + '\u0000' + grid.search;
    const cache = grid.filterCache;
    if (cache && cache.data === grid.data && cache.key === key) return cache.list;
    const search = grid.search;
    const cat = grid.category;
    const list = (grid.data || []).filter(i =>
      (cat === 'All' || i.category === cat) &&
      (!search || (i._lt ?? (i.title || '').toLowerCase()).includes(search))
    );
    grid.filterCache = { data: grid.data, key, list };
    return list;
  };

  const renderGrid = (type, preload = false, mode = 'loading') => {
    const grid = grids[type];
    if (!grid?.gridEl) return;

    grid.renderId = (grid.renderId || 0) + 1;
    const myRenderId = grid.renderId;

    K.toggleLoader(true, mode);

    const filtered = getFiltered(grid);
    const totalPages = Math.max(1, Math.ceil(filtered.length / K.ITEMS_PER_PAGE));
    if (grid.page > totalPages) grid.page = 1;
    const start = (grid.page - 1) * K.ITEMS_PER_PAGE;
    grid.paginatedData = filtered.slice(start, start + K.ITEMS_PER_PAGE);

    const pool = grid.pool;
    const paginated = grid.paginatedData;
    const len = pool.length;

    for (let idx = 0; idx < len; idx++) {
      const p = pool[idx];
      const item = paginated[idx];

      if (!item) {
        if (p.el.style.display !== 'none') p.el.style.display = 'none';
        if (p.img.dataset.src !== undefined || p.img.getAttribute('src')) releaseImage(p.img);
        if (p.c?.textContent) p.c.textContent = '';
        if (p.el.dataset.tooltip !== undefined) delete p.el.dataset.tooltip;
        continue;
      }

      if (p.el.style.display !== 'block') p.el.style.display = 'block';
      if (p.t.textContent !== item.title) p.t.textContent = item.title;

      const desc = item.description || '';
      if (p.d.textContent !== desc) p.d.textContent = desc;

      const cat = item.category || 'All';
      if (p.c && p.c.textContent !== cat) p.c.textContent = cat;

      if (p.el.dataset.tooltip !== item.title) p.el.dataset.tooltip = item.title;

      const wanted = item.image || (item.imageToken && K.luminImgCache?.get(item.imageToken)) || '';

      if (p.img.dataset.src !== wanted) {
        p.img.onload = p.img.onerror = null;
        if (p.img.getAttribute('src')) p.img.removeAttribute('src');
        p.img.dataset.src = wanted;

        if (wanted) {
          p.img.style.display = 'block';
          p.img.loading = idx < FIRST_PAINT_IMAGES ? 'eager' : 'lazy';
          p.img.fetchPriority = idx < FIRST_PAINT_IMAGES ? 'auto' : 'low';
          p.img.decoding = 'async';
          const alts = (item.imageAlts || []).slice();
          p.img.onerror = () => { if (alts.length) { p.img.onerror = null; p.img.src = alts.shift(); } };
          p.img.src = wanted;
        } else {
          p.img.style.display = 'none';
          if (item.imageToken && K.resolveLuminImage) {
            const capturedItem = item;
            const capturedIdx = idx;
            K.resolveLuminImage(capturedItem).then(url => {
              if (!url || grid.paginatedData[capturedIdx] !== capturedItem || p.img.dataset.src) return;
              p.img.dataset.src = url;
              p.img.style.display = 'block';
              p.img.src = url;
            });
          }
        }
      } else if (wanted && p.img.style.display !== 'block') {
        p.img.style.display = 'block';
      }
    }

    if (grid.pageEl) {
      const pageKey = `${grid.page}/${totalPages}`;
      if (grid.pageKey !== pageKey) {
        grid.pageKey = pageKey;
        const prevDis = grid.page === 1 ? ' style="opacity:0.4;cursor:not-allowed;"' : '';
        const nextDis = grid.page === totalPages ? ' style="opacity:0.4;cursor:not-allowed;"' : '';
        grid.pageEl.innerHTML =
          `<button class="page-btn" data-action="prev"${prevDis}><i class="ph ph-caret-left"></i></button>` +
          `<span style="font-weight:700;font-size:1.1rem;min-width:80px;text-align:center;user-select:none;">${grid.page} / ${totalPages}</span>` +
          `<button class="page-btn" data-action="next"${nextDis}><i class="ph ph-caret-right"></i></button>`;
      }
      if (!grid.pageEl.dataset.bound) {
        grid.pageEl.dataset.bound = 'true';
        grid.pageEl.onclick = e => {
          const btn = e.target.closest('.page-btn');
          if (!btn) return;
          const tp = Math.max(1, Math.ceil(getFiltered(grid).length / K.ITEMS_PER_PAGE));
          const act = btn.dataset.action;
          if (act === 'prev' && grid.page > 1) { grid.page--; renderGrid(type, true); }
          else if (act === 'next' && grid.page < tp) { grid.page++; renderGrid(type, true); }
        };
      }
    }

    if (grid.renderId === myRenderId) {
      requestAnimationFrame(() => {
        if (grid.renderId === myRenderId) K.toggleLoader(false);
      });
    }
  };
  K.renderGrid = renderGrid;

  Object.keys(grids).forEach(type => {
    let timer;
    K.$(`${type}-search`)?.addEventListener('input', e => {
      const clr = K.$(`${type}-search-clear`);
      if (clr) clr.style.display = e.target.value ? 'block' : 'none';
      clearTimeout(timer);
      timer = setTimeout(() => {
        grids[type].search = e.target.value.toLowerCase().trim();
        grids[type].page = 1;
        renderGrid(type, true);
      }, 120);
    });
    K.$(`${type}-search-clear`)?.addEventListener('click', () => {
      K.$(`${type}-search`).value = '';
      K.$(`${type}-search-clear`).style.display = 'none';
      grids[type].search = '';
      grids[type].page = 1;
      renderGrid(type, true);
    });
  });

  document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;
    const type = activePage.id;
    if (!grids[type] || K.resourceOpenFor[type]) return;
    const grid = grids[type];
    const totalPages = Math.max(1, Math.ceil(getFiltered(grid).length / K.ITEMS_PER_PAGE));
    if (e.key === 'ArrowLeft' && grid.page > 1) { e.preventDefault(); grid.page--; renderGrid(type, true); }
    else if (e.key === 'ArrowRight' && grid.page < totalPages) { e.preventDefault(); grid.page++; renderGrid(type, true); }
  });

  K.fetchWithProxy('Assets/json/categories.json').then(c => {
    const setC = (id, opts, type) => {
      const s = K.$(id);
      if (!s) return;
      s.innerHTML = (opts || []).map(o => `<option value="${o}">${o}</option>`).join('');
      K.applyCustomDropdown(s);
      s.addEventListener('change', e => { grids[type].category = e.target.value; grids[type].page = 1; renderGrid(type, true); });
    };
    setC('readingcorner-category-select', c.Games, 'readingcorner');
    setC('sciencequiz-category-select', c.Apps, 'sciencequiz');
  }).catch(err => console.error('categories.json failed', err));

  // Page URLs with a mirror placeholder are kept as-is so openResource can embed them via scram.
  // Image URLs with a placeholder are dropped, as before.
  const appB = (s, isPage = false) => {
    if (typeof s !== 'string') return s;
    if (K.MIRROR_PH.test(s)) return isPage ? s : '';
    return s.replace(/([^:]\/)\/+/g, '$1').replace(/^http:\/\//i, 'https://');
  };
  K.appB = appB;

  const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
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
    p.url = appB(p.url, true);
    p.image = appB(p.image);
    p._lt = (p.title || '').toLowerCase();
    return p;
  }).sort((a, b) => collator.compare(a.title || '', b.title || ''));
  K.proc = proc;

  const rData = async (t, p, resetPage = true, mode = 'updating', silent = false) => {
    try {
      const n = await K.fetchWithProxy(p).catch(err => { console.error('rData fetch failed', p, err); return null; });
      if (!Array.isArray(n)) { if (!silent) K.toggleLoader(false); return false; }
      const sig = hashSig(JSON.stringify(n));
      if (sig === grids[t].sig) { if (!silent) K.toggleLoader(false); return false; }
      if (t === 'sciencequiz') K.rawSciencequizData = n;
      const processed = proc(n);
      K.toggleLoader(true, mode);
      grids[t].sig = sig;
      grids[t].data = processed;
      if (resetPage) grids[t].page = 1;
      renderGrid(t, true, mode);
      return true;
    } catch (err) {
      console.error('rData failed', t, p, err);
      if (!silent) K.toggleLoader(false);
      return false;
    }
  };
  K.rData = rData;

  const NUM_WORDS = { zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10' };
  const normName = t => {
    const base = (t || '').toLowerCase().replace(/\s*[(\[][^)\]]*[)\]]\s*$/, '').replace(/['']/g, '').replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten)\b/g, m => NUM_WORDS[m]);
    const stripped = base.replace(/\b(unblocked|online|games?|the|free)\b/g, '').replace(/[^a-z0-9]+/g, '');
    return stripped || base.replace(/[^a-z0-9]+/g, '');
  };

  let edPrev = new Int32Array(64), edCur = new Int32Array(64);
  const editDistance = (a, b, max) => {
    const al = a.length, bl = b.length;
    if (Math.abs(al - bl) > max) return max + 1;
    if (edPrev.length < bl + 1) {
      edPrev = new Int32Array(bl + 1);
      edCur = new Int32Array(bl + 1);
    }
    let prev = edPrev, cur = edCur;
    for (let j = 0; j <= bl; j++) prev[j] = j;
    for (let i = 1; i <= al; i++) {
      cur[0] = i;
      let rowMin = i;
      const ac = a.charCodeAt(i - 1);
      for (let j = 1; j <= bl; j++) {
        let v = prev[j] + 1;
        const ins = cur[j - 1] + 1;
        if (ins < v) v = ins;
        const sub = prev[j - 1] + (ac === b.charCodeAt(j - 1) ? 0 : 1);
        if (sub < v) v = sub;
        cur[j] = v;
        if (v < rowMin) rowMin = v;
      }
      if (rowMin > max) return max + 1;
      const tmp = prev; prev = cur; cur = tmp;
    }
    return prev[bl];
  };

  const fillMissingImages = rows => {
    const donors = new Map();
    rows.forEach(r => {
      if (!r.image) return;
      const n = normName(r.title);
      if (!n) return;
      const existing = donors.get(n);
      if (!existing || (!r.imageAlts && existing.imageAlts)) donors.set(n, r);
    });
    const buckets = new Map();
    donors.forEach((row, n) => {
      if (!buckets.has(n[0])) buckets.set(n[0], []);
      buckets.get(n[0]).push([n, row, n.replace(/\D/g, '')]);
    });
    rows.forEach(r => {
      if (r.image || r.imageToken) return;
      const n = normName(r.title);
      if (!n) return;
      let hit = donors.get(n);
      if (!hit && n.length >= 6) {
        const max = n.length >= 12 ? 2 : 1;
        const digits = n.replace(/\D/g, '');
        let best = max + 1;
        const bucket = buckets.get(n[0]) || [];
        for (let k = 0; k < bucket.length; k++) {
          const entry = bucket[k];
          const m = entry[0];
          if (Math.abs(m.length - n.length) > max || entry[2] !== digits) continue;
          const d = editDistance(n, m, max);
          if (d < best) { best = d; hit = entry[1]; }
        }
      }
      if (hit) {
        r.image = hit.image;
        if (hit.imageAlts) r.imageAlts = hit.imageAlts.slice();
      }
    });
  };

  const fetchReadingCornerRaw = async (prevSig = '') => {
    const coverBase = 'https://cdn.jsdelivr.net/gh/freebuisness/covers@main';
    const htmlBase = 'https://cdn.jsdelivr.net/gh/freebuisness/html@main';
    const manualRes = await K.fetchWithProxy('Assets/json/g.json').catch(() => null);
    const manualList = Array.isArray(manualRes) ? manualRes : [];

    const [zones, extras] = await Promise.all([
      K.fetchRepoFile('freebuisness/assets', 'zones.json', false, 12000)
        .then(json => {
          if (!Array.isArray(json)) throw new Error('zones.json is not an array');
          return json.map(z => ({ source: 'gn-math', name: z.name, url: z.url, cover: z.cover }));
        })
        .catch(e => { console.error('fetchReadingCornerRaw zones failed', e); return []; }),
      K.fetchExtraGames ? K.fetchExtraGames().catch(e => { console.error('extra game sources failed', e); return []; }) : []
    ]);

    let sig = '';
    try { sig = hashSig(JSON.stringify([manualList, zones, extras])); } catch {}
    if (prevSig && sig === prevSig) return { unchanged: true, sig };

    const manualMap = new Map();
    manualList.forEach(item => { if (item?.title) manualMap.set(item.title.toLowerCase().trim(), item); });

    const entries = [...zones, ...extras];
    if (entries.length) {
      const mappedData = [];
      const used = new Set();
      entries.forEach(item => {
        const baseName = item.name || '';
        const key = baseName.toLowerCase().trim();
        const manualMatch = manualMap.get(key);
        let finalUrl = item.url, finalCover = item.cover, finalCategory = 'All';
        if (manualMatch) {
          if (manualMatch.url) finalUrl = manualMatch.url;
          if (manualMatch.category) finalCategory = manualMatch.category;
          if (manualMatch.image || manualMatch.img) finalCover = manualMatch.image || manualMatch.img;
          used.add(key);
        }
        if (baseName.includes('[!]')) return;
        const covers = Array.isArray(finalCover) ? finalCover : [finalCover];
        const row = {
          title: item.suffix ? `${baseName} (${item.suffix})` : baseName,
          image: (covers[0] || '').replace('{COVER_URL}', coverBase + '/'),
          url: (finalUrl || '').replace('{HTML_URL}', htmlBase + '/'),
          category: finalCategory,
          description: ''
        };
        if (covers.length > 1) row.imageAlts = covers.slice(1);
        if (item.imageToken && !manualMatch?.image && !manualMatch?.img) row.imageToken = item.imageToken;
        mappedData.push(row);
      });
      manualMap.forEach((manualItem, key) => {
        if (used.has(key) || !manualItem.title || manualItem.title.includes('[!]')) return;
        mappedData.push({
          title: manualItem.title,
          image: manualItem.image || manualItem.img || '',
          url: manualItem.url || '',
          category: manualItem.category || 'Manual',
          description: ''
        });
      });
      fillMissingImages(mappedData);
      return { data: mappedData, sig };
    }

    const fallbackMapped = [];
    manualList.forEach(item => {
      if (!item?.title || item.title.includes('[!]')) return;
      fallbackMapped.push({ ...item, image: item.image || item.img || '', category: item.category || 'All' });
    });
    return { data: fallbackMapped, sig };
  };
  K.fetchReadingCornerRaw = fetchReadingCornerRaw;

  const refreshReadingCorner = async (resetPage = true, mode = 'updating', silent = false) => {
    try {
      const result = await fetchReadingCornerRaw(grids.readingcorner.sig);
      if (result?.unchanged || !result?.data?.length) { if (!silent) K.toggleLoader(false); return false; }
      K.rawReadingCornerData = result.data;
      const processed = proc(result.data);
      K.toggleLoader(true, mode);
      grids.readingcorner.sig = result.sig || '';
      grids.readingcorner.data = processed;
      if (resetPage) grids.readingcorner.page = 1;
      renderGrid('readingcorner', true, mode);
      return true;
    } catch (err) {
      console.error('refreshReadingCorner failed', err);
      if (!silent) K.toggleLoader(false);
      return false;
    }
  };
  K.refreshReadingCorner = refreshReadingCorner;

  const runWhenIdle = fn => new Promise(resolve => {
    const run = () => { Promise.resolve().then(fn).then(resolve, () => resolve(false)); };
    if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 2000 });
    else setTimeout(run, 250);
  });

  K.refreshGridSource = (tId, silent = true) => {
    if (K.resourceOpenFor[tId]) return Promise.resolve(false);
    if (tId !== 'readingcorner' && tId !== 'sciencequiz') return Promise.resolve(false);
    if (silent && Date.now() - (K.lastGridRefresh[tId] || 0) < REFRESH_TTL) return Promise.resolve(false);
    K.lastGridRefresh[tId] = Date.now();
    return runWhenIdle(() => tId === 'readingcorner'
      ? refreshReadingCorner(false, 'updating', silent)
      : rData('sciencequiz', 'Assets/json/a.json', false, 'updating', silent));
  };

  K.$('readingcorner-refresh-btn')?.addEventListener('click', () => { K.lastGridRefresh.readingcorner = Date.now(); refreshReadingCorner(); });
  K.$('sciencequiz-refresh-btn')?.addEventListener('click', () => { K.lastGridRefresh.sciencequiz = Date.now(); rData('sciencequiz', 'Assets/json/a.json'); });

  K.rawReadingCornerData = [];
  K.rawSciencequizData = [];

  K.initPromise = Promise.all([
    fetchReadingCornerRaw().catch(error => { console.error('Reading Corner initialization failed:', error); return { data: [], sig: '' }; }),
    K.fetchWithProxy('Assets/json/a.json').catch(error => { console.error('Science Quiz initialization failed:', error); return []; }),
    K.fetchWithProxy('Assets/json/truffled.json').catch(error => { console.error('Truffled initialization failed:', error); return null; }),
    K.fetchWisps()
  ]).then(async ([readingResult, scienceData, truffledData]) => {
    K.gTruf.clear();
    if (Array.isArray(truffledData?.games)) {
      truffledData.games.forEach(game => { if (game?.name) K.gTruf.set(K.cleanGameTitle(game.name), game); });
    }

    K.rawReadingCornerData = readingResult?.data || [];
    K.rawSciencequizData = Array.isArray(scienceData) ? scienceData : [];

    grids.readingcorner.data = proc(K.rawReadingCornerData);
    grids.readingcorner.sig = readingResult?.sig || '';
    grids.sciencequiz.data = proc(K.rawSciencequizData);
    try { grids.sciencequiz.sig = hashSig(JSON.stringify(K.rawSciencequizData)); } catch { grids.sciencequiz.sig = ''; }

    const now = Date.now();
    K.lastGridRefresh.readingcorner = now;
    K.lastGridRefresh.sciencequiz = now;

    Object.keys(grids).forEach(type => { if (grids[type].gridEl && !grids[type].pool.length) buildPool(type); });

    const activePage = document.querySelector('.page.active');
    if (activePage && grids[activePage.id]) renderGrid(activePage.id, false, 'loading');

    K.toggleLoader(false);
  }).catch(error => {
    console.error('init failed:', error);
    K.toggleLoader(false);
  });
}
