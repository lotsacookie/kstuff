// Keeps the navbar usable when the window is too small for every button (any navbar position).
// The last buttons fold into a "..." button that opens a small icon-only popup beside the bar, one at a time.
// Moving a button keeps its handlers; when there is room again everything goes back where it was.
// Settings and Profile live in the bottom card and stay pinned. The active page's button never folds away.
export function init(K, opts = {}) {
  const nav = opts.nav || K.navBar || document.getElementById('teachertouchbar');
  if (!nav || nav.__sgNavOverflow) return null;
  nav.__sgNavOverflow = true;

  const body = document.body;
  const isVertical = () => body.classList.contains('nav-left') || body.classList.contains('nav-right');

  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'nav-btn nav-more';
  more.id = 'nav-more-btn';
  more.title = 'More';
  more.setAttribute('aria-label', 'More');
  more.setAttribute('aria-haspopup', 'true');
  more.setAttribute('aria-expanded', 'false');
  more.hidden = true;
  more.innerHTML = '<i class="ph ph-dots-three-outline"></i><span class="nav-label">More</span>';

  const menu = document.createElement('div');
  menu.className = 'nav-menu';
  menu.setAttribute('role', 'menu');
  menu.hidden = true;
  document.body.appendChild(menu);

  const anchor = () => nav.querySelector(':scope > .nav-favs') || nav.querySelector(':scope > .nav-card');
  nav.insertBefore(more, anchor());

  const parked = []; // { el, ph }
  let busy = false;

  const pinned = () => Array.from(nav.children).filter(c => c.classList.contains('nav-btn') && c !== more);
  const isShown = el => !el.hidden && getComputedStyle(el).display !== 'none';

  // The text on the buttons is stored back to front in .label-data; read it forwards for the tooltip.
  function labelFor(el) {
    const parts = Array.from(el.querySelectorAll('.label-data > div')).map(d => d.textContent);
    const word = parts.reverse().join('').trim();
    return el.getAttribute('aria-label') || el.title || word || el.dataset.target || '';
  }

  function measure() {
    const favs = nav.querySelector(':scope > .nav-favs');
    const prev = favs ? favs.style.display : '';
    if (favs) favs.style.display = 'none'; // bookmarks scroll on their own; they don't decide what folds
    nav.scrollTop = 0; nav.scrollLeft = 0;
    const cs = getComputedStyle(nav);
    const r = nav.getBoundingClientRect();
    const vert = isVertical();
    const limit = vert
      ? r.top + nav.clientHeight - (parseFloat(cs.paddingBottom) || 0)
      : r.left + nav.clientWidth - (parseFloat(cs.paddingRight) || 0);
    const over = Array.from(nav.children).some(c => {
      if (c.classList.contains('nav-indicator') || !isShown(c)) return false;
      const cr = c.getBoundingClientRect();
      return (vert ? cr.bottom : cr.right) > limit + 0.5;
    });
    if (favs) favs.style.display = prev;
    return over;
  }

  function closeMenu() {
    menu.hidden = true;
    more.setAttribute('aria-expanded', 'false');
  }

  function placeMenu() {
    const pad = 8;
    const r = more.getBoundingClientRect();
    const w = menu.offsetWidth, h = menu.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
    let left, top;
    if (body.classList.contains('nav-left')) { left = r.right + 10; top = r.top; }
    else if (body.classList.contains('nav-right')) { left = r.left - 10 - w; top = r.top; }
    else if (body.classList.contains('nav-bottom')) { left = r.left; top = r.top - 8 - h; }
    else { left = r.left; top = r.bottom + 8; }
    menu.style.left = clamp(left, pad, Math.max(pad, vw - w - pad)) + 'px';
    menu.style.top = clamp(top, pad, Math.max(pad, vh - h - pad)) + 'px';
  }

  function openMenu() {
    menu.hidden = false;
    more.setAttribute('aria-expanded', 'true');
    placeMenu();
  }

  function park(el) {
    const ph = document.createComment('nav-slot');
    el.parentNode.insertBefore(ph, el);
    const label = labelFor(el);
    if (label && !el.title) { el.title = label; el.setAttribute('data-nav-title', ''); }
    if (label && !el.getAttribute('aria-label')) { el.setAttribute('aria-label', label); el.setAttribute('data-nav-aria', ''); }
    parked.push({ el, ph });
    menu.insertBefore(el, menu.firstChild); // parked last-to-first, so this keeps the bar's order
    more.hidden = false;
  }

  function restoreAll() {
    while (parked.length) {
      const { el, ph } = parked.pop();
      if (ph.parentNode) ph.parentNode.replaceChild(el, ph);
      if (el.hasAttribute('data-nav-title')) { el.removeAttribute('title'); el.removeAttribute('data-nav-title'); }
      if (el.hasAttribute('data-nav-aria')) { el.removeAttribute('aria-label'); el.removeAttribute('data-nav-aria'); }
    }
    more.hidden = true;
  }

  const observers = [];
  const dropOwnMutations = () => observers.forEach(o => o.takeRecords());

  function relayout() {
    if (busy) return;
    busy = true;
    const wasOpen = !menu.hidden;
    try {
      restoreAll();
      if (measure()) {
        more.hidden = false; // the "..." button takes room too
        const candidates = pinned().filter(isShown).reverse();
        for (const el of candidates) {
          if (!measure()) break;
          if (el.classList.contains('active')) continue;
          park(el);
        }
        if (!parked.length) more.hidden = true;
      }
      if (!parked.length) closeMenu();
      else if (wasOpen) openMenu();
    } finally {
      dropOwnMutations();
      busy = false;
      if (typeof K.updateIndicator === 'function') K.updateIndicator(nav.querySelector('.nav-btn.active'));
    }
  }

  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; relayout(); });
  };

  more.addEventListener('click', e => {
    e.stopPropagation();
    if (menu.hidden) openMenu(); else closeMenu();
  });
  menu.addEventListener('click', e => {
    if (e.target.closest('.nav-btn')) setTimeout(closeMenu, 0);
  });
  document.addEventListener('pointerdown', e => {
    if (!menu.hidden && !menu.contains(e.target) && !more.contains(e.target)) closeMenu();
  }, true);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) { closeMenu(); more.focus(); }
  });

  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(schedule).observe(nav);
  window.addEventListener('resize', schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  if (typeof MutationObserver !== 'undefined') {
    // Buttons added/removed/shown/hidden, the active page changing, or a layout setting (position, size, labels) changing.
    const navMo = new MutationObserver(() => { if (!busy) schedule(); });
    navMo.observe(nav, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    observers.push(navMo);
    const bodyMo = new MutationObserver(() => { if (!busy) schedule(); });
    bodyMo.observe(body, { attributes: true, attributeFilter: ['class'] });
    observers.push(bodyMo);
  }

  relayout();
  return { relayout, closeMenu, menu, more };
}
