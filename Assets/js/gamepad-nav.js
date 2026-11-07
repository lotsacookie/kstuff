const LEAVE_WINDOW_MS = 2000;
const LEAVE_PRESSES = 3;
const DEADZONE = 0.5;
const FIRST_REPEAT_MS = 380;
const REPEAT_MS = 110;

export function pickNeighbor(rects, from, dir) {
  const c = rects[from];
  if (!c) return -1;
  const cx = c.left + c.width / 2;
  const cy = c.top + c.height / 2;
  let best = -1;
  let bestScore = Infinity;
  for (let i = 0; i < rects.length; i++) {
    if (i === from) continue;
    const r = rects[i];
    const x = r.left + r.width / 2 - cx;
    const y = r.top + r.height / 2 - cy;
    let main;
    let side;
    if (dir === 'right') { main = x; side = y; }
    else if (dir === 'left') { main = -x; side = y; }
    else if (dir === 'down') { main = y; side = x; }
    else { main = -y; side = x; }
    if (main <= 2) continue;
    const score = main + Math.abs(side) * 2.2;
    if (score < bestScore) { bestScore = score; best = i; }
  }
  return best;
}

export function nextTarget(order, activeId, step) {
  if (!order.length) return '';
  let i = order.indexOf(activeId);
  if (i < 0) i = 0;
  const n = Math.max(0, Math.min(order.length - 1, i + step));
  return n === i ? '' : order[n];
}

export function init(K) {
  if (K.gamepadNav || typeof navigator.getGamepads !== 'function') return;
  const token = {};
  try { window.__kGpNav = token; } catch {}
  const isCurrent = () => window.__kGpNav === token;
  const ancestorHas = () => {
    let w = window;
    try {
      while (w.parent && w.parent !== w) {
        w = w.parent;
        if (w.__kGpNav) return true;
      }
    } catch {}
    return false;
  };
  let shadowed = ancestorHas();
  let shadowTick = 0;
  const relAt = [];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const style = document.createElement('style');
  style.id = 'gp-nav-style';
  style.textContent = `
body.gp-active .gp-focus{outline:2px solid var(--text-color,#fff);outline-offset:3px;box-shadow:0 0 0 6px color-mix(in srgb,var(--text-color,#fff) 18%,transparent),0 0 24px color-mix(in srgb,var(--text-color,#fff) 38%,transparent);scale:1.03;transition:box-shadow .15s ease,scale .15s ease,outline-color .15s ease}
body.gp-active .nav-btn.gp-focus,body.gp-active .nav-os-btn.gp-focus,body.gp-active .study-nav-btn.gp-focus,body.gp-active .page-btn.gp-focus,body.gp-active .custom-select-option.gp-focus,body.gp-active .modal-actions button.gp-focus{background-color:color-mix(in srgb,var(--text-color,#fff) 16%,transparent)}
#gp-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(8px);z-index:2147483000;padding:.55rem 1.1rem;border-radius:999px;background:var(--card-bg,#111);color:var(--text-color,#fff);border:1px solid color-mix(in srgb,var(--text-color,#fff) 22%,transparent);box-shadow:0 12px 32px rgba(0,0,0,.35);font-size:.85rem;font-family:var(--font,inherit);opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis}
#gp-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}`;
  document.head.appendChild(style);

  let toastEl = null;
  let toastTimer = 0;
  const toast = (text, ms = 1800) => {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'gp-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), ms);
  };

  const CONTENT_SEL = '.round-btn, button, input:not([type="hidden"]), select, textarea, a[href], .custom-select-trigger, [tabindex]:not([tabindex="-1"])';
  const ZONES = ['nav', 'header', 'content'];

  let raf = 0;
  let cur = null;
  let layerStack = [];
  let lastDepth = 0;
  let prevPressed = [];
  let holdDir = null;
  let holdNext = 0;
  let wasGame = false;
  let startTimes = [];
  let frameCount = 0;
  let hinted = false;
  const lastInZone = {};
  let curZone = 'content';
  let lastRect = null;
  let emptySince = 0;

  const visible = el => {
    if (!el || !el.isConnected || el.disabled || el.hidden || el.getAttribute('aria-hidden') === 'true') return false;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  };

  const getPads = () => {
    try { return Array.from(navigator.getGamepads() || []).filter(p => p && p.connected); } catch { return []; }
  };

  const openResourceId = () => {
    const open = K.resourceOpenFor || {};
    for (const id of Object.keys(open)) {
      if (!open[id]) continue;
      const f = document.getElementById(id + '-resource-iframe');
      const page = document.getElementById(id);
      if (f && page && page.classList.contains('active') && f.style.display !== 'none' && f.getClientRects().length) return id;
    }
    return '';
  };

  const gameState = () => {
    const g = document.getElementById('gfn-frame');
    if (g && g.classList.contains('on')) return { el: g, gfn: true };
    const l = document.getElementById('gfn-loading');
    if (l && !l.classList.contains('hidden') && l.getClientRects().length) return { el: g || l, gfn: true, loading: true, failed: l.classList.contains('failed') };
    const id = openResourceId();
    if (id) return { el: document.getElementById(id + '-resource-iframe'), gfn: false, id };
    return null;
  };

  const focusGame = g => {
    if (!g || !g.el || g.loading) return;
    try { g.el.focus({ preventScroll: true }); } catch {}
    try { g.el.contentWindow && g.el.contentWindow.focus(); } catch {}
  };

  const exitGame = g => {
    startTimes = [];
    toast('Leaving game');
    if (g && g.gfn) {
      if (typeof K.exitGfn === 'function') K.exitGfn();
      else $('#gfn-x')?.click();
    } else if (g && g.id) {
      K.closeResourceInline?.(g.id);
    }
    try { window.focus(); document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch {}
  };

  const topModal = () => {
    const all = $$('.modal-overlay.active');
    return all.length ? all[all.length - 1] : null;
  };
  const openSelect = () => $$('.custom-select-options.open').find(visible) || null;

  const layers = () => {
    const out = [];
    const m = topModal();
    if (m) out.push({ type: 'modal', el: m });
    const s = openSelect();
    if (s) out.push({ type: 'select', el: s });
    return out;
  };
  const topLayer = () => {
    const l = layers();
    return l.length ? l[l.length - 1] : null;
  };

  const MODAL_SEL = 'button, input:not([type="hidden"]), select, textarea, a[href], .custom-select-trigger, [tabindex]:not([tabindex="-1"])';

  const modalTabs = m => $$('.settings-nav button, [role="tab"]', m).filter(visible);
  const layerItems = layer => {
    if (layer.type === 'select') return $$('.custom-select-option', layer.el).filter(visible);
    const m = layer.el;
    const tabs = modalTabs(m);
    const tabSet = new Set(tabs);
    const body = $$(MODAL_SEL, m).filter(e => !tabSet.has(e) && !e.closest('.settings-nav') && !e.closest('.custom-select-options') && visible(e));
    return tabs.concat(body);
  };

  const zoneItems = name => {
    if (name === 'nav') return $$('#teachertouchbar .nav-btn, #teachertouchbar .nav-os-btn').filter(visible);
    if (name === 'header') return $$('.learning-header button, .learning-header input').filter(visible);
    const page = $('.page.active');
    if (!page) return [];
    const seen = new Set();
    return $$(CONTENT_SEL, page).filter(el => {
      if (seen.has(el)) return false;
      seen.add(el);
      if (el.classList.contains('fav-btn')) return false;
      if (el.parentElement && el.parentElement.closest('.round-btn')) return false;
      if (el.closest('.custom-select-options')) return false;
      return visible(el);
    });
  };

  const zoneOf = el => {
    if (!el) return 'content';
    if (el.closest('#teachertouchbar')) return 'nav';
    if (el.closest('.learning-header')) return 'header';
    return 'content';
  };

  const scopeItems = () => {
    const layer = topLayer();
    if (layer) return layerItems(layer);
    return zoneItems(zoneOf(cur));
  };

  const clearMarks = keep => {
    $$('.gp-focus').forEach(e => { if (e !== keep) e.classList.remove('gp-focus'); });
  };

  const setFocus = el => {
    clearMarks(el);
    const a = document.activeElement;
    if (el && a && a !== el && a !== document.body && a.matches && a.matches('button, .nav-btn, .nav-os-btn')) a.blur();
    cur = el || null;
    if (cur) {
      if (!topLayer()) curZone = zoneOf(cur);
      try { const r = cur.getBoundingClientRect(); lastRect = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; } catch {}
      emptySince = 0;
      cur.classList.add('gp-focus');
      try { cur.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch {}
    }
  };

  const preferred = (items, name) => {
    if (name === 'content') return items.find(e => e.classList.contains('round-btn')) || items[0];
    return items[0];
  };

  const ensureCurrent = () => {
    const layer = topLayer();
    if (layer) {
      const items = layerItems(layer);
      const sel = layer.type === 'select' ? items.find(e => e.classList.contains('selected')) : null;
      setFocus(sel || items[0] || null);
      return;
    }
    for (const name of ['content', 'nav', 'header']) {
      const items = zoneItems(name);
      if (items.length) { setFocus(preferred(items, name)); return; }
    }
    setFocus(null);
  };

  const recover = () => {
    if (topLayer() || !cur) { ensureCurrent(); return; }
    const items = zoneItems(curZone);
    if (!items.length) {
      const now = performance.now();
      if (!emptySince) emptySince = now;
      if (now - emptySince > 1500) { emptySince = 0; ensureCurrent(); }
      return;
    }
    emptySince = 0;
    let best = items[0];
    if (lastRect) {
      let bd = Infinity;
      for (const e of items) {
        const r = e.getBoundingClientRect();
        const d = Math.hypot(r.left + r.width / 2 - lastRect.x, r.top + r.height / 2 - lastRect.y);
        if (d < bd) { bd = d; best = e; }
      }
    }
    setFocus(best);
  };

  const enterZone = name => {
    const items = zoneItems(name);
    if (!items.length) return false;
    const mem = lastInZone[name];
    setFocus(mem && items.includes(mem) ? mem : preferred(items, name));
    return true;
  };

  const cycleZone = () => {
    const layer = topLayer();
    if (layer) {
      if (layer.type !== 'modal') return;
      const tabs = modalTabs(layer.el);
      const items = layerItems(layer);
      const body = items.filter(e => !tabs.includes(e));
      const inTabs = cur && tabs.includes(cur);
      const target = inTabs ? body[0] : (tabs.find(t => t.classList.contains('active') || t.getAttribute('aria-selected') === 'true') || tabs[0]);
      if (target) setFocus(target);
      return;
    }
    const from = zoneOf(cur);
    if (cur) lastInZone[from] = cur;
    const start = ZONES.indexOf(from);
    for (let i = 1; i <= ZONES.length; i++) {
      if (enterZone(ZONES[(start + i) % ZONES.length])) return;
    }
  };

  const blurEditing = () => {
    const a = document.activeElement;
    if (a && a !== document.body && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) a.blur();
  };

  const move = dir => {
    const items = scopeItems();
    if (!items.length) return;
    if (!cur || !items.includes(cur)) { ensureCurrent(); return; }
    if (cur.matches && cur.matches('input[type="range"]') && (dir === 'left' || dir === 'right')) {
      const st = Number(cur.step) || 1;
      cur.value = String(Number(cur.value) + (dir === 'right' ? st : -st));
      cur.dispatchEvent(new Event('input', { bubbles: true }));
      cur.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    blurEditing();
    const rects = items.map(e => e.getBoundingClientRect());
    const i = pickNeighbor(rects, items.indexOf(cur), dir);
    if (i >= 0) setFocus(items[i]);
  };

  const activate = () => {
    if (!cur || !cur.isConnected) { ensureCurrent(); return; }
    const tag = cur.tagName;
    if (tag === 'INPUT' && /^(text|search|password|email|url|number|tel)$/i.test(cur.type || 'text')) { cur.focus(); return; }
    if (tag === 'TEXTAREA') { cur.focus(); return; }
    if (tag === 'SELECT') {
      try { cur.focus(); cur.showPicker ? cur.showPicker() : cur.click(); } catch { cur.click(); }
      return;
    }
    cur.click();
  };

  const closeLayer = layer => {
    if (layer.type === 'select') { layer.el.classList.remove('open'); return; }
    const m = layer.el;
    const btn = $('.modal-actions button[id$="close-btn"]', m) || $('button[id$="close-btn"]', m) || $('.modal-header button:last-child', m);
    if (btn) btn.click();
    else document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  };

  const afterPageChange = () => {
    setTimeout(() => {
      if (topLayer()) return;
      if (!enterZone('content')) ensureCurrent();
    }, 350);
  };

  const PAGE_SKIP = new Set(['changelog', 'homeworkhelper', 'profile']);
  let pageLockUntil = 0;
  const switchPage = step => {
    const now = performance.now();
    if (now < pageLockUntil) return;
    const order = [];
    const byTarget = {};
    $$('.nav-btn[data-target]').forEach(b => {
      const t = b.dataset.target;
      if (!t || PAGE_SKIP.has(t) || byTarget[t]) return;
      if (b.hidden || b.getAttribute('aria-hidden') === 'true') return;
      byTarget[t] = b;
      order.push(t);
    });
    const target = nextTarget(order, $('.page.active')?.id, step);
    if (!target || !byTarget[target]) return;
    pageLockUntil = now + 300;
    byTarget[target].click();
    afterPageChange();
  };

  const switchModalTab = (layer, step) => {
    const tabs = modalTabs(layer.el);
    if (!tabs.length) return;
    let i = tabs.findIndex(t => t.classList.contains('active') || t.getAttribute('aria-selected') === 'true');
    if (i < 0) i = 0;
    const n = Math.max(0, Math.min(tabs.length - 1, i + step));
    if (n === i) return;
    tabs[n].click();
    setFocus(tabs[n]);
  };

  const pageStep = dir => {
    const btn = $(`.page.active .page-btn[data-action="${dir}"]`);
    if (!btn || btn.disabled) return;
    btn.click();
    afterPageChange();
  };

  const scrollParent = el => {
    let p = el && el.parentElement;
    while (p && p !== document.body) {
      const oy = getComputedStyle(p).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight + 2) return p;
      p = p.parentElement;
    }
    return $('.page.active') || document.scrollingElement;
  };

  const focusSearch = () => {
    const inp = $$('.page.active input[type="text"], .page.active .modern-input').find(visible);
    if (!inp) return;
    setFocus(inp);
    inp.focus();
  };

  const toggleFavorite = () => {
    const card = cur && cur.closest && cur.closest('.round-btn');
    const fav = card && card.querySelector('.fav-btn');
    if (fav) fav.click();
  };

  const toggleSettings = () => {
    const m = topModal();
    if (m && m.id === 'homeworkhelper-modal') { closeLayer({ type: 'modal', el: m }); return; }
    $('#teachertouchbar .nav-btn[data-target="homeworkhelper"]')?.click();
  };

  const syncLayers = () => {
    const depth = layers().length;
    if (depth === lastDepth) return;
    if (depth > lastDepth) {
      layerStack.push(cur);
      ensureCurrent();
    } else {
      const back = layerStack.pop();
      if (back && visible(back) && !topLayer()) setFocus(back);
      else if (back && topLayer() && layerItems(topLayer()).includes(back)) setFocus(back);
      else ensureCurrent();
    }
    lastDepth = depth;
  };

  const clearUi = () => {
    document.body.classList.remove('gp-active');
  };

  const pointerAway = e => {
    if (e.type === 'mousemove' && !(Math.abs(e.movementX) + Math.abs(e.movementY))) return;
    clearUi();
  };
  window.addEventListener('mousemove', pointerAway, { passive: true });
  window.addEventListener('pointerdown', pointerAway, { passive: true });
  window.addEventListener('keydown', e => { if (!e.repeat) clearUi(); }, { passive: true });

  const poll = ts => {
    if (!isCurrent()) {
      if (cur) cur.classList.remove('gp-focus');
      cur = null;
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(poll);
    if ((shadowTick++ & 31) === 0) shadowed = ancestorHas();
    if (shadowed) {
      if (cur) { cur.classList.remove('gp-focus'); cur = null; }
      return;
    }
    const pads = getPads();
    if (!pads.length) return;

    const pressed = new Array(17).fill(false);
    let ax = 0;
    let ay = 0;
    let ry = 0;
    for (const p of pads) {
      for (let i = 0; i < 17 && i < p.buttons.length; i++) {
        const b = p.buttons[i];
        if (b && (b.pressed || b.value > 0.5)) pressed[i] = true;
      }
      const a = p.axes || [];
      if (Math.abs(a[0] || 0) > Math.abs(ax)) ax = a[0];
      if (Math.abs(a[1] || 0) > Math.abs(ay)) ay = a[1];
      if (Math.abs(a[3] || 0) > Math.abs(ry)) ry = a[3];
    }
    const prev = prevPressed;
    prevPressed = pressed;
    for (let i = 0; i < pressed.length; i++) if (!pressed[i] && prev[i]) relAt[i] = ts;
    const edge = i => pressed[i] && !prev[i] && ts - (relAt[i] === undefined ? -1e9 : relAt[i]) >= 60;
    const anyEdge = pressed.some((v, i) => v && !prev[i]);

    const game = gameState();
    if (game) {
      if (!wasGame) {
        wasGame = true;
        startTimes = [];
        clearMarks();
        clearUi();
        focusGame(game);
        setTimeout(() => { const g = gameState(); if (g) focusGame(g); }, 300);
        setTimeout(() => { const g = gameState(); if (g) focusGame(g); }, 1200);
      }
      if (anyEdge && document.activeElement !== game.el) focusGame(game);
      if (game.failed && (edge(0) || edge(1))) { $('#gfn-ld-back')?.click(); return; }
      if (edge(9)) {
        const now = performance.now();
        startTimes = startTimes.filter(t => now - t <= LEAVE_WINDOW_MS);
        startTimes.push(now);
        if (startTimes.length >= LEAVE_PRESSES) { exitGame(game); return; }
        if (startTimes.length === LEAVE_PRESSES - 1) toast('Press Start once more to leave', LEAVE_WINDOW_MS);
      }
      return;
    }
    if (wasGame) {
      wasGame = false;
      startTimes = [];
      setTimeout(() => { if (document.body.classList.contains('gp-active')) ensureCurrent(); }, 250);
    }

    syncLayers();

    const anyInput = pressed.some(Boolean) || Math.abs(ax) > DEADZONE || Math.abs(ay) > DEADZONE;
    if (anyInput && !document.body.classList.contains('gp-active')) {
      document.body.classList.add('gp-active');
      if (!cur || !cur.isConnected || !visible(cur)) ensureCurrent();
      if (!hinted) {
        hinted = true;
        toast('A select · B back · Select swap area · LB/RB switch tabs · Start ×3 leaves a game', 4200);
      }
      holdDir = null;
      return;
    }
    if (!document.body.classList.contains('gp-active')) return;

    if ((++frameCount & 15) === 0 && (!cur || !cur.isConnected || !visible(cur))) recover();

    let dir = null;
    if (pressed[12]) dir = 'up';
    else if (pressed[13]) dir = 'down';
    else if (pressed[14]) dir = 'left';
    else if (pressed[15]) dir = 'right';
    else if (Math.abs(ax) > DEADZONE || Math.abs(ay) > DEADZONE) {
      dir = Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? 'right' : 'left') : (ay > 0 ? 'down' : 'up');
    }
    if (dir !== holdDir) {
      holdDir = dir;
      if (dir) { move(dir); holdNext = ts + FIRST_REPEAT_MS; }
    } else if (dir && ts >= holdNext) {
      move(dir);
      holdNext = ts + REPEAT_MS;
    }

    if (Math.abs(ry) > 0.2) {
      const sp = scrollParent(cur);
      if (sp) sp.scrollBy(0, ry * 20);
    }

    const layer = topLayer();
    if (edge(0)) activate();
    if (edge(1)) {
      if (layer) closeLayer(layer);
      else if (document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) document.activeElement.blur();
      else { const b = $('#study-back-btn'); if (b && !b.disabled) b.click(); }
    }
    if (edge(2) && !layer) toggleFavorite();
    if (edge(3) && !layer) focusSearch();
    if (edge(4)) { if (layer && layer.type === 'modal') switchModalTab(layer, -1); else if (!layer) switchPage(-1); }
    if (edge(5)) { if (layer && layer.type === 'modal') switchModalTab(layer, 1); else if (!layer) switchPage(1); }
    if (edge(6) && !layer) pageStep('prev');
    if (edge(7) && !layer) pageStep('next');
    if (edge(8)) cycleZone();
    if (edge(9) && !layer) toggleSettings();
    else if (edge(9) && layer && layer.type === 'modal' && layer.el.id === 'homeworkhelper-modal') toggleSettings();
  };

  const start = () => { if (isCurrent() && !raf) raf = requestAnimationFrame(poll); };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    clearUi();
    clearMarks();
    cur = null;
    holdDir = null;
  };

  window.addEventListener('gamepadconnected', () => {
    start();
    const g = gameState();
    if (g) focusGame(g);
  });
  window.addEventListener('gamepaddisconnected', () => { if (!getPads().length) stop(); });
  if (getPads().length) start();

  K.gamepadNav = { exitGame: () => exitGame(gameState()), focus: ensureCurrent };
}
