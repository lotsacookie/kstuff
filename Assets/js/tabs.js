export function init(K) {
  const MAX = 12;
  const NAMES = { home: 'Home', games: 'Games', apps: 'Apps', music: 'Music', tv: 'TV', ai: 'AI', vms: 'VMS', chat: 'Chat' };
  const PAGE_ALLOW = 'fullscreen; autoplay; clipboard-write; display-capture; picture-in-picture; document-picture-in-picture; gamepad; pointer-lock';
  const RESOURCE_ALLOW = 'autoplay; fullscreen; pointer-lock; gamepad';
  const GLOBAL_IDS = new Set([K.MUSIC_IFRAME_ID]);
  const PLUS = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  const XICON = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  const bar = K.$('sg-tabbar');
  const state = { tabs: [], active: null, seq: 0 };
  const globalFrames = new Map();
  const listeners = new Set();
  let dragId = 0;
  let renderPending = false;

  const find = id => state.tabs.find(t => t.id === id) || null;
  const sectionFor = id => K.$(id.replace(/-resource-iframe$|-iframe$/, ''));

  const titleFor = value => {
    const v = (value || '').trim();
    if (!v) return 'New Tab';
    const m = v.match(/^singularity:\/\/([^\/?#]+)(?:\/(.+))?$/i);
    if (m) {
      if (m[2]) {
        let s = m[2];
        try { s = decodeURIComponent(s); } catch {}
        return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }
      return NAMES[m[1].toLowerCase()] || m[1];
    }
    try { return new URL(v).hostname.replace(/^www\./, ''); } catch { return v; }
  };

  const emit = () => {
    if (renderPending) return;
    renderPending = true;
    requestAnimationFrame(() => {
      renderPending = false;
      render();
      listeners.forEach(fn => { try { fn(); } catch {} });
    });
  };

  const onKey = e => {
    if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.code === 'KeyT') { e.preventDefault(); openTab(); }
    else if (e.code === 'KeyW') { e.preventDefault(); if (state.active) closeTab(state.active.id); }
  };
  document.addEventListener('keydown', onKey);

  const hookKeys = el => {
    try {
      const w = el.contentWindow;
      if (!w || w.__sgKeys) return;
      w.__sgKeys = true;
      w.addEventListener('keydown', onKey);
    } catch {}
  };

  const makeFrame = (id, owner) => {
    const section = sectionFor(id);
    if (!section) return null;
    const isResource = /-resource-iframe$/.test(id);
    const f = document.createElement('iframe');
    f.id = id;
    f.className = 'full-page-iframe';
    f.dataset.sgOwner = String(owner);
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('allow', isResource ? RESOURCE_ALLOW : PAGE_ALLOW);
    if (isResource) f.style.display = 'none';
    else if (id === 'mathworksheets-iframe') f.style.cssText = 'position:relative;z-index:1;background:transparent;';
    section.appendChild(f);
    K.frameHooks.forEach(h => { try { h(id, f); } catch (err) { console.error('frame hook failed', err); } });
    f.addEventListener('load', () => hookKeys(f));
    return f;
  };

  K.ensureFrame = id => {
    if (GLOBAL_IDS.has(id)) {
      let g = globalFrames.get(id);
      if (!g || !g.isConnected) {
        g = makeFrame(id, 'global');
        if (g) globalFrames.set(id, g);
      }
      return g;
    }
    const tab = state.active;
    if (!tab) return K.$(id);
    let f = tab.frames.get(id);
    if (f && f.isConnected) return f;
    f = makeFrame(id, tab.id);
    if (f) tab.frames.set(id, f);
    return f;
  };

  K.isFrameActive = f => {
    const owner = f && f.dataset ? f.dataset.sgOwner : null;
    if (!owner || owner === 'global') return true;
    return !!state.active && owner === String(state.active.id);
  };

  K.isActiveSource = win => {
    if (!win) return true;
    for (const tab of state.tabs) {
      for (const f of tab.frames.values()) {
        if (f.contentWindow === win) return K.isFrameActive(f);
      }
    }
    return true;
  };

  const setIds = (tab, on) => {
    tab.frames.forEach((f, cid) => { f.id = on ? cid : cid + '~' + tab.id; });
  };

  const currentNavTarget = () => {
    const btn = Array.from(K.navBtns).find(b => b.classList.contains('active') && !['homeworkhelper', 'profile'].includes(b.dataset.target));
    return btn ? btn.dataset.target : 'mathworksheets';
  };

  const saveOut = tab => {
    tab.snapshot = {
      page: document.querySelector('.page.active')?.id || 'mathworksheets',
      address: K.tbInput ? K.tbInput.value : '',
      history: K.history,
      index: K.historyIndex,
      resourceOpen: K.resourceOpenFor,
      pending: K.pendingResourceOpen,
      nav: currentNavTarget()
    };
    tab.frames.forEach(f => {
      f.dataset.sgDisp = f.style.display;
      f.style.display = 'none';
    });
    setIds(tab, false);
  };

  const deactivateSections = () => {
    K.$$('.page').forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
      p.style.opacity = '0';
    });
  };

  const pingResize = tab => {
    requestAnimationFrame(() => {
      const wins = [];
      tab.frames.forEach(f => { if (f.style.display !== 'none') wins.push(f); });
      globalFrames.forEach(f => { if (f.offsetParent) wins.push(f); });
      wins.forEach(f => { try { f.contentWindow.dispatchEvent(new Event('resize')); } catch {} });
    });
  };

  const freshView = () => {
    K.history = ['singularity://home'];
    K.historyIndex = 0;
    K.resourceOpenFor = {};
    K.pendingResourceOpen = {};
    deactivateSections();
    Object.keys(K.grids).forEach(k => K.clearGridPool(k));
    K.navBtns.forEach(b => { if (!['homeworkhelper', 'profile'].includes(b.dataset.target)) b.classList.remove('active'); });
    K.updateBrowserNav?.();
    K.loadBrowserUrl('singularity://home', true);
  };

  const frameLoaded = f => !!f && (f.hasAttribute('srcdoc') || ((f.getAttribute('src') || 'about:blank') !== 'about:blank'));

  const restoreView = (tab, sn) => {
    K.history = sn.history;
    K.historyIndex = sn.index;
    K.resourceOpenFor = sn.resourceOpen;
    K.pendingResourceOpen = sn.pending;
    deactivateSections();
    const section = K.$(sn.page);
    if (section) {
      section.classList.add('active');
      section.style.display = 'block';
      section.style.opacity = '1';
    }
    tab.frames.forEach(f => { f.style.display = f.dataset.sgDisp || ''; });
    K.setAddress(sn.address);
    K.navBtns.forEach(b => { if (!['homeworkhelper', 'profile'].includes(b.dataset.target)) b.classList.toggle('active', b.dataset.target === sn.nav); });
    const btn = K.findNavBtn(sn.nav);
    if (btn) K.updateIndicator(btn);
    Object.keys(K.grids).forEach(k => { if (k !== sn.page) K.clearGridPool(k); });
    K.updateBrowserNav?.();
    K.updateLogoState?.();

    if (K.grids[sn.page]) {
      K.buildPool(sn.page);
      const open = !!K.resourceOpenFor[sn.page];
      K.showResourceGrid(sn.page, !open);
      if (!open) K.renderGrid(sn.page, false);
      K.toggleLoader(false);
    } else if (K.iframePages[sn.page]) {
      const id = K.iframePages[sn.page].id;
      const f = GLOBAL_IDS.has(id) ? globalFrames.get(id) : tab.frames.get(id);
      if (f) f.style.display = 'block';
      if (!frameLoaded(f)) K.loadContent(sn.page, true);
      else K.toggleLoader(false);
    } else {
      K.toggleLoader(false);
    }
    pingResize(tab);
  };

  const activate = id => {
    const next = find(id);
    if (!next || next === state.active) return;
    const prev = state.active;
    if (prev) saveOut(prev);
    state.active = next;
    setIds(next, true);
    if (next.snapshot) restoreView(next, next.snapshot);
    else freshView();
    emit();
  };

  const createTab = () => {
    const t = { id: ++state.seq, frames: new Map(), snapshot: null, title: 'Home', address: 'singularity://home', fresh: true };
    state.tabs.push(t);
    return t;
  };

  function openTab() {
    if (state.tabs.length >= MAX) return;
    const t = createTab();
    t.isNew = true;
    activate(t.id);
  }

  const destroyFrames = tab => {
    tab.frames.forEach(f => {
      f.style.display = 'none';
      try { f.removeAttribute('srcdoc'); f.src = 'about:blank'; } catch {}
      setTimeout(() => f.remove(), 400);
    });
    tab.frames.clear();
  };

  function closeTab(id) {
    const i = state.tabs.findIndex(t => t.id === id);
    if (i < 0) return;
    const t = state.tabs[i];
    if (state.tabs.length === 1) {
      const n = createTab();
      activate(n.id);
    } else if (state.active === t) {
      const n = state.tabs[i + 1] || state.tabs[i - 1];
      activate(n.id);
    }
    const j = state.tabs.indexOf(t);
    if (j >= 0) state.tabs.splice(j, 1);
    destroyFrames(t);
    emit();
  }

  function move(id, beforeId) {
    const i = state.tabs.findIndex(t => t.id === id);
    if (i < 0) return;
    const t = state.tabs.splice(i, 1)[0];
    const j = beforeId ? state.tabs.findIndex(x => x.id === beforeId) : -1;
    if (j < 0) state.tabs.push(t);
    else state.tabs.splice(j, 0, t);
    emit();
  }

  const compact = () => {
    const n = bar.querySelectorAll('.sg-tab').length || 1;
    bar.classList.toggle('sg-compact', (bar.clientWidth - 60) / n < 112);
  };

  function render() {
    if (dragId) return;
    bar.textContent = '';
    state.tabs.forEach(t => {
      const on = t === state.active;
      const el = document.createElement('div');
      el.className = 'sg-tab' + (on ? ' active' : '') + (t.isNew ? ' new' : '');
      t.isNew = false;
      el.dataset.id = String(t.id);
      el.draggable = true;
      el.title = t.title;
      el.setAttribute('role', 'tab');
      el.setAttribute('aria-selected', on ? 'true' : 'false');
      el.innerHTML = '<span class="sg-fav"></span><span class="sg-title"></span><button class="sg-x" type="button" aria-label="Close tab">' + XICON + '</button>';
      el.querySelector('.sg-fav').textContent = (t.title.charAt(0) || '?').toUpperCase();
      el.querySelector('.sg-title').textContent = t.title;
      bar.appendChild(el);
    });
    const plus = document.createElement('button');
    plus.className = 'sg-newtab study-nav-btn';
    plus.type = 'button';
    plus.title = 'New tab';
    plus.setAttribute('aria-label', 'New tab');
    plus.innerHTML = PLUS;
    plus.disabled = state.tabs.length >= MAX;
    bar.appendChild(plus);
    compact();
  }

  bar.addEventListener('click', e => {
    if (e.target.closest('.sg-newtab')) { openTab(); return; }
    const el = e.target.closest('.sg-tab');
    if (!el) return;
    const id = Number(el.dataset.id);
    if (e.target.closest('.sg-x')) closeTab(id);
    else activate(id);
  });
  bar.addEventListener('mousedown', e => { if (e.button === 1 && e.target.closest('.sg-tab')) e.preventDefault(); });
  bar.addEventListener('auxclick', e => {
    const el = e.target.closest('.sg-tab');
    if (e.button === 1 && el) { e.preventDefault(); closeTab(Number(el.dataset.id)); }
  });
  bar.addEventListener('dragstart', e => {
    const el = e.target.closest('.sg-tab');
    if (!el) return;
    dragId = Number(el.dataset.id);
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', 'tab'); } catch {}
  });
  bar.addEventListener('dragover', e => {
    if (!dragId) return;
    e.preventDefault();
    const over = e.target.closest('.sg-tab');
    const cur = bar.querySelector('.sg-tab.dragging');
    if (!over || !cur || over === cur) return;
    const r = over.getBoundingClientRect();
    bar.insertBefore(cur, e.clientX < r.left + r.width / 2 ? over : over.nextSibling);
  });
  bar.addEventListener('dragend', () => {
    if (!dragId) return;
    const cur = bar.querySelector('.sg-tab.dragging');
    const id = dragId;
    dragId = 0;
    let beforeId = 0;
    if (cur) {
      cur.classList.remove('dragging');
      const next = cur.nextElementSibling;
      if (next && next.classList.contains('sg-tab')) beforeId = Number(next.dataset.id);
    }
    move(id, beforeId);
  });
  window.addEventListener('resize', compact, { passive: true });

  if (typeof K.setAddress === 'function') {
    const baseSetAddress = K.setAddress;
    K.setAddress = function (...args) {
      const result = baseSetAddress.apply(this, args);
      const t = state.active;
      if (t) {
        const title = titleFor(K.tbInput ? K.tbInput.value : '');
        if (title !== t.title) { t.title = title; emit(); }
      }
      return result;
    };
  }

  const first = createTab();
  first.fresh = false;
  state.active = first;
  render();

  window.__sgTabs = {
    max: MAX,
    list: () => state.tabs.map(t => ({ id: t.id, title: t.title, page: t === state.active ? (document.querySelector('.page.active')?.id || '') : (t.snapshot ? t.snapshot.page : ''), frames: Array.from(t.frames.keys()) })),
    active: () => (state.active ? state.active.id : 0),
    open: openTab,
    close: closeTab,
    activate,
    move,
    subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); }
  };
}
