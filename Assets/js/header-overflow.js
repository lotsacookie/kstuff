// Keeps everything in the header bar on the bar. When the window (or the navbar) leaves too little width, the header
//   1. drops the song title of the mini player,
//   2. tightens its spacing,
//   3. folds the least important buttons into a "..." menu that drops down from the bar, one at a time.
// Moving a button keeps its id and its click handlers; when there is room again everything goes back where it was.
export function init(K, opts = {}) {
  const hdr = opts.header || document.querySelector('.learning-header');
  if (!hdr || hdr.__sgOverflow) return null;
  hdr.__sgOverflow = true;

  // Folded away first -> last.
  const COLLAPSE = ['.mini-player', '#study-fit-btn', '#study-fullscreen-btn', '#study-cookies-btn', '#study-console-btn', '#reload-study-btn', '#study-forward-btn'];
  // Order inside the menu.
  const MENU_ORDER = ['#study-forward-btn', '#reload-study-btn', '#study-console-btn', '#study-cookies-btn', '#study-fullscreen-btn', '#study-fit-btn', '.mini-player'];
  const LABELS = { 'study-forward-btn': 'Forward', 'reload-study-btn': 'Reload' };
  const NS = 'http://www.w3.org/2000/svg';

  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'study-nav-btn hdr-more';
  more.id = 'study-more-btn';
  more.title = 'More';
  more.setAttribute('aria-label', 'More');
  more.setAttribute('aria-haspopup', 'true');
  more.setAttribute('aria-expanded', 'false');
  more.hidden = true;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  [5, 12, 19].forEach(cx => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', cx); c.setAttribute('cy', 12); c.setAttribute('r', 1.8);
    svg.appendChild(c);
  });
  more.appendChild(svg);

  const menu = document.createElement('div');
  menu.className = 'hdr-menu';
  menu.hidden = true;
  hdr.append(more, menu);

  const parked = []; // { el, ph }
  let busy = false;

  const find = sel => hdr.querySelector(':scope > ' + sel) || menu.querySelector(':scope > ' + sel);
  const measure = opts.overflowing || (() => {
    const cs = getComputedStyle(hdr);
    const limit = hdr.getBoundingClientRect().right - (parseFloat(cs.paddingRight) || 0);
    return Array.from(hdr.children).some(c => {
      if (c === menu || c.hidden || getComputedStyle(c).display === 'none') return false;
      return c.getBoundingClientRect().right > limit + 0.5;
    });
  });

  function closeMenu() {
    menu.hidden = true;
    more.setAttribute('aria-expanded', 'false');
  }

  function labelFor(el) {
    return el.getAttribute('data-label') || el.title || el.getAttribute('aria-label') || LABELS[el.id] || '';
  }

  function park(el) {
    const ph = document.createComment('hdr-slot');
    el.parentNode.insertBefore(ph, el);
    if (!el.classList.contains('mini-player')) {
      // Icon-only in the menu, so the name lives in the tooltip / accessible name instead of on screen.
      const label = labelFor(el);
      el.setAttribute('data-label', label);
      if (label && !el.title) { el.title = label; el.setAttribute('data-hdr-title', ''); }
      if (label && !el.getAttribute('aria-label')) { el.setAttribute('aria-label', label); el.setAttribute('data-hdr-aria', ''); }
    }
    parked.push({ el, ph });
    menu.appendChild(el);
    more.hidden = false;
  }

  function restoreAll() {
    while (parked.length) {
      const { el, ph } = parked.pop();
      if (ph.parentNode) ph.parentNode.replaceChild(el, ph);
      el.removeAttribute('data-label');
      if (el.hasAttribute('data-hdr-title')) { el.removeAttribute('title'); el.removeAttribute('data-hdr-title'); }
      if (el.hasAttribute('data-hdr-aria')) { el.removeAttribute('aria-label'); el.removeAttribute('data-hdr-aria'); }
    }
    more.hidden = true;
  }

  function sortMenu() {
    const rank = el => {
      const i = MENU_ORDER.findIndex(sel => el.matches(sel));
      return i < 0 ? 99 : i;
    };
    Array.from(menu.children).sort((a, b) => rank(a) - rank(b)).forEach(el => menu.appendChild(el));
  }

  const observers = [];
  const dropOwnMutations = () => observers.forEach(o => o.takeRecords());

  function relayout() {
    if (busy) return;
    busy = true;
    const wasOpen = !menu.hidden;
    try {
      restoreAll();
      hdr.classList.remove('hdr-slim', 'hdr-tight');
      if (measure()) hdr.classList.add('hdr-slim');
      if (measure()) hdr.classList.add('hdr-tight');
      for (const sel of COLLAPSE) {
        if (!measure()) break;
        const el = hdr.querySelector(':scope > ' + sel);
        if (!el || el.hidden || getComputedStyle(el).display === 'none') continue;
        park(el);
      }
      sortMenu();
      // Our own moves are not changes to react to (that would re-run this forever and keep closing the menu).
      if (!parked.length) closeMenu();
      else if (wasOpen) { menu.hidden = false; more.setAttribute('aria-expanded', 'true'); }
    } finally {
      dropOwnMutations();
      busy = false;
    }
  }

  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; relayout(); });
  };

  more.addEventListener('click', e => {
    e.stopPropagation();
    const open = menu.hidden;
    menu.hidden = !open;
    more.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn || btn.closest('.mini-player')) return; // music controls keep the menu open
    setTimeout(closeMenu, 0);
  });
  document.addEventListener('pointerdown', e => {
    if (!menu.hidden && !menu.contains(e.target) && !more.contains(e.target)) closeMenu();
  }, true);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) { closeMenu(); more.focus(); }
  });

  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(schedule).observe(hdr);
  window.addEventListener('resize', schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  // The mini player is added to the header by another module and shown/hidden later on.
  if (typeof MutationObserver !== 'undefined') {
    const headMo = new MutationObserver(() => { if (!busy) schedule(); });
    headMo.observe(hdr, { childList: true });
    observers.push(headMo);
    const mini = hdr.querySelector('.mini-player');
    if (mini) {
      const miniMo = new MutationObserver(() => { if (!busy) schedule(); });
      miniMo.observe(mini, { attributes: true, attributeFilter: ['hidden', 'style'] });
      observers.push(miniMo);
    }
  }

  relayout();
  return { relayout, closeMenu, menu, more };
}
