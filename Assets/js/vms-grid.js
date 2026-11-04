// VMs tab: a native grid page (same markup/CSS/pagination as Games and Apps) that launches OnWorks VMs
// through Assets/vms/vm/vm.mjs. The connect screen reuses the Singularity loading look; the session is drawn
// straight into this page (no iframes) with a floating toolbar that includes Fullscreen.
export function init(K) {
  const $ = id => document.getElementById(id);
  const gridEl = $('vms-grid');
  if (!gridEl) return;
  const VMS = new URL('Assets/vms/', document.baseURI).href;
  const st = { data: [], category: 'All', search: '', page: 1 };
  let shown = [], catsDone = false;

  const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
  const per = () => K.ITEMS_PER_PAGE || 40;
  const filtered = () => st.data.filter(i =>
    (st.category === 'All' || i.category === st.category) &&
    (!st.search || i.title.toLowerCase().includes(st.search) || i.category.toLowerCase().includes(st.search)));

  async function load() {
    let d = null;
    for (const u of [VMS + 'vms-catalog.json', `https://cdn.jsdelivr.net/gh/${K.MAIN_REPO || 'lotsacookie/kstuff'}@main/Assets/vms/vms-catalog.json`]) {
      try { const r = await fetch(u, { cache: 'no-cache' }); if (r.ok) { d = await r.json(); break; } } catch {}
    }
    st.data = (d?.items || []).filter(i => i.os).map(i => ({
      title: i.name, image: i.icon || '', category: String(i.kind || '').replace(/^OS:\s*/, '') || 'Other', description: i.desc || '', os: i.os, id: i.id,
    })).sort((a, b) => collator.compare(a.title, b.title));
    const sel = $('vms-category-select');
    if (sel) {
      const cats = ['All', ...new Set(st.data.map(i => i.category))];
      sel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
      if (!catsDone) { sel.addEventListener('change', e => { st.category = e.target.value; st.page = 1; render(); }); catsDone = true; }
      K.applyCustomDropdown(sel);
      st.category = 'All';
    }
    render();
  }

  function card(item, idx) {
    const el = document.createElement('div');
    el.className = 'round-btn img-loading';
    el.dataset.index = idx; el.dataset.tooltip = item.title;
    el.innerHTML = '<div class="ph-art" aria-hidden="true"><span></span></div><img alt="" style="display:none;"><div class="category-label"></div><div class="overlay"><h3></h3><p></p></div>';
    let h = 0; for (const ch of item.title) h = (h * 31 + ch.charCodeAt(0)) % 360;
    el.style.setProperty('--ph-h', String(h)); el.style.setProperty('--i', Math.min(idx, 24));
    el.querySelector('.ph-art span').textContent = (item.title.match(/[\p{L}\p{N}]/u) || ['?'])[0].toUpperCase();
    el.querySelector('h3').textContent = item.title;
    el.querySelector('p').textContent = item.description;
    el.querySelector('.category-label').textContent = item.category;
    const img = el.querySelector('img');
    if (item.image) {
      img.referrerPolicy = 'no-referrer'; img.decoding = 'async'; img.loading = idx < 24 ? 'eager' : 'lazy';
      const fail = () => { img.onload = img.onerror = null; img.style.display = 'none'; el.classList.remove('img-loading'); el.classList.add('img-failed'); };
      img.onload = () => {
        if (img.naturalWidth < 8 || img.naturalHeight < 8) return fail();
        img.onload = img.onerror = null; img.style.display = 'block'; img.classList.add('loaded'); el.classList.remove('img-loading');
      };
      img.onerror = fail;
      img.src = item.image;
    } else { el.classList.remove('img-loading'); el.classList.add('img-none'); }
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) el.classList.add('card-in');
    return el;
  }

  function render() {
    const list = filtered(), n = per(), tp = Math.max(1, Math.ceil(list.length / n));
    if (st.page > tp) st.page = tp;
    shown = list.slice((st.page - 1) * n, st.page * n);
    const frag = document.createDocumentFragment();
    shown.forEach((it, i) => frag.appendChild(card(it, i)));
    gridEl.textContent = ''; gridEl.appendChild(frag);
    const pg = $('vms-pagination');
    if (pg) {
      const prev = st.page === 1 ? ' style="opacity:0.4;cursor:not-allowed;"' : '';
      const next = st.page === tp ? ' style="opacity:0.4;cursor:not-allowed;"' : '';
      pg.innerHTML =
        `<button class="page-btn" data-action="prev"${prev}><i class="ph ph-caret-left"></i></button>` +
        `<span style="font-weight:700;font-size:1.1rem;min-width:80px;text-align:center;user-select:none;">${st.page} / ${tp}</span>` +
        `<button class="page-btn" data-action="next"${next}><i class="ph ph-caret-right"></i></button>`;
    }
  }

  $('vms-pagination')?.addEventListener('click', e => {
    const b = e.target.closest('.page-btn'); if (!b) return;
    const tp = Math.max(1, Math.ceil(filtered().length / per()));
    if (b.dataset.action === 'prev' && st.page > 1) { st.page--; render(); }
    else if (b.dataset.action === 'next' && st.page < tp) { st.page++; render(); }
  });
  let timer;
  $('vms-search')?.addEventListener('input', e => {
    const clr = $('vms-search-clear'); if (clr) clr.style.display = e.target.value ? 'block' : 'none';
    clearTimeout(timer);
    timer = setTimeout(() => { st.search = e.target.value.toLowerCase().trim(); st.page = 1; render(); }, 120);
  });
  $('vms-search-clear')?.addEventListener('click', () => { $('vms-search').value = ''; $('vms-search-clear').style.display = 'none'; st.search = ''; st.page = 1; render(); });
  $('vms-refresh-btn')?.addEventListener('click', () => load());
  gridEl.addEventListener('click', e => { const c = e.target.closest('.round-btn'); if (c && shown[c.dataset.index]) start(shown[c.dataset.index]); });

  // ---------------------------------------------------------------- launch UI
  let ui = null, busy = false, token = 0, sess = null, live = false, snd = true, toolsTimer;
  const LOGO = '<svg class="ld-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><g id="vm-arm" fill="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10"><path pathLength="1" d="M50 3 L83 13 L92 43 L75 69 L49 73 L35 57" stroke-width="5.5"/><path pathLength="1" d="M50 13 L76 22 L82 44 L70 62 L52 65" stroke-width="2.2" opacity="0.7"/></g></defs><g class="ld-arms" stroke="currentColor"><use href="#vm-arm"/><use href="#vm-arm" transform="rotate(120 50 50)"/><use href="#vm-arm" transform="rotate(240 50 50)"/></g><g class="ld-core" fill="currentColor"><path d="M50.0 29.0 L51.7 45.8 L58.5 41.5 L54.2 48.3 L71.0 50.0 L54.2 51.7 L58.5 58.5 L51.7 54.2 L50.0 71.0 L48.3 54.2 L41.5 58.5 L45.8 51.7 L29.0 50.0 L45.8 48.3 L41.5 41.5 L48.3 45.8 Z"/></g></svg>';
  const CSS = `
#vm-loading{position:fixed;inset:0;width:100vw;height:100vh;background:var(--bg-color,#000);color:var(--text-color,#fff);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:1.1rem;z-index:999998;transition:opacity .5s ease,visibility .5s ease}
#vm-loading.hidden{opacity:0;visibility:hidden;pointer-events:none}
#vm-loading .ld-status{text-align:center;max-width:80vw;padding:0 12px}
#vm-loading.failed .ld-status{color:#ff6b6b;opacity:1}
#vm-loading .vm-ld-btns{display:flex;gap:10px;min-height:2.6rem;align-items:center}
#vm-loading .page-btn{padding:8px 20px}
#vm-session{position:fixed;inset:0;z-index:999990;background:#000;display:none}
#vm-session.on{display:block}
#vm-screen{position:absolute;inset:0;overflow:hidden}
#vm-tools{position:absolute;top:10px;left:50%;transform:translate(-50%,-160%);display:flex;gap:8px;align-items:center;padding:.5rem .7rem;background:var(--nav-bg);color:var(--text-color);border:1px solid var(--line,var(--hairline));border-radius:24px;box-shadow:0 8px 24px rgba(0,0,0,.28);transition:transform .25s var(--ease);z-index:3;max-width:96vw}
#vm-tools.open{transform:translate(-50%,0)}
#vm-tools .vm-title{font-weight:800;font-size:.85rem;max-width:22vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 6px}
#vm-tools .page-btn{padding:6px 10px;display:inline-flex;align-items:center;justify-content:center}
#vm-tools .page-btn.stop{border-color:#ff6b6b;color:#ff6b6b}
#vm-handle{position:absolute;top:0;left:50%;transform:translateX(-50%);z-index:4;background:var(--nav-bg);color:var(--text-color);border:1px solid var(--line,var(--hairline));border-top:none;border-radius:0 0 14px 14px;padding:2px 16px;cursor:pointer;opacity:.7}
#vm-handle:hover{opacity:1}
#vm-toast{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);background:var(--nav-bg);color:var(--text-color);border:1px solid var(--line,var(--hairline));border-radius:12px;padding:8px 14px;font-size:.8rem;opacity:0;pointer-events:none;transition:opacity .25s;z-index:5}
#vm-toast.show{opacity:1}`;

  function ensureUi() {
    if (ui) return ui;
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    const load = document.createElement('div'); load.id = 'vm-loading'; load.className = 'hidden';
    load.innerHTML = `${LOGO}<div class="ld-word">Singularity</div><div class="ld-bar"><div class="ld-fill" id="vm-ld-fill"></div></div><div class="ld-status" id="vm-ld-status">Loading</div><div class="vm-ld-btns"><button class="page-btn" id="vm-ld-cancel" type="button">Cancel</button><button class="page-btn" id="vm-ld-back" type="button" hidden>Back</button></div>`;
    const ses = document.createElement('div'); ses.id = 'vm-session';
    ses.innerHTML = `<div id="vm-screen"></div>
<button id="vm-handle" type="button" aria-label="Show controls"><i class="ph ph-caret-down"></i></button>
<div id="vm-tools"><span class="vm-title" id="vm-title"></span>
<button class="page-btn" id="vm-snd" type="button" title="Sound"><i class="ph ph-speaker-high"></i></button>
<button class="page-btn" id="vm-cad" type="button" title="Ctrl+Alt+Del"><i class="ph ph-keyboard"></i></button>
<button class="page-btn" id="vm-paste" type="button" title="Paste from clipboard"><i class="ph ph-clipboard-text"></i></button>
<button class="page-btn" id="vm-full" type="button" title="Fullscreen"><i class="ph ph-corners-out"></i></button>
<button class="page-btn stop" id="vm-stop" type="button" title="Stop"><i class="ph ph-stop-circle"></i></button></div>
<div id="vm-toast" role="status"></div>`;
    document.body.append(ses, load);
    ui = { load, ses, fill: $('vm-ld-fill'), status: $('vm-ld-status'), screen: $('vm-screen'), tools: $('vm-tools'), toast: $('vm-toast'), snd: $('vm-snd'), full: $('vm-full'), cancel: $('vm-ld-cancel'), back: $('vm-ld-back') };
    ui.cancel.onclick = ui.back.onclick = () => end();
    $('vm-stop').onclick = () => end();
    $('vm-cad').onclick = () => sess?.ctrlAltDel();
    $('vm-paste').onclick = async () => { try { const t = await navigator.clipboard.readText(); if (t) sess?.paste(t); } catch { toast('Clipboard permission was blocked'); } };
    ui.snd.onclick = () => { snd = !snd; sess?.sound(snd); ui.snd.innerHTML = `<i class="ph ph-speaker-${snd ? 'high' : 'slash'}"></i>`; };
    ui.full.onclick = () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (ui.ses.requestFullscreen) ui.ses.requestFullscreen().catch(() => toast('Fullscreen was blocked'));
      else if (ui.ses.webkitRequestFullscreen) ui.ses.webkitRequestFullscreen();
      else toast('Fullscreen isn’t supported here');
    };
    document.addEventListener('fullscreenchange', () => { ui.full.innerHTML = `<i class="ph ph-corners-${document.fullscreenElement ? 'in' : 'out'}"></i>`; window.dispatchEvent(new Event('resize')); });
    $('vm-handle').onclick = () => openTools(true);
    ui.tools.addEventListener('mouseenter', () => clearTimeout(toolsTimer));
    ui.ses.addEventListener('mousemove', e => { if (e.clientY < 14) openTools(false); });
    return ui;
  }
  function openTools(keep) {
    ui.tools.classList.add('open'); clearTimeout(toolsTimer);
    if (!keep) toolsTimer = setTimeout(() => ui.tools.classList.remove('open'), 3500);
    else toolsTimer = setTimeout(() => ui.tools.classList.remove('open'), 6000);
  }
  function toast(t) { if (!ui) return; ui.toast.textContent = t; ui.toast.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => ui.toast.classList.remove('show'), 2400); }
  const setStatus = t => { if (ui) ui.status.textContent = t || ''; };
  const setProg = p => { if (ui) ui.fill.style.transform = `scaleX(${Math.min(Math.max(p, 0), 1)})`; };

  function end() {
    token++; busy = false; live = false;
    if (sess) { try { sess.stop(); } catch {} sess = null; }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (!ui) return;
    ui.screen.textContent = ''; ui.ses.classList.remove('on'); ui.tools.classList.remove('open');
    ui.load.classList.add('hidden'); ui.load.classList.remove('failed'); ui.back.hidden = true; ui.cancel.hidden = false;
  }

  async function start(item) {
    if (busy || sess) return;
    busy = true; live = false; snd = true;
    const my = ++token; ensureUi();
    ui.snd.innerHTML = '<i class="ph ph-speaker-high"></i>';
    $('vm-title').textContent = item.title;
    ui.load.classList.remove('hidden', 'failed'); ui.cancel.hidden = false; ui.back.hidden = true;
    setProg(0.02); setStatus('Starting');
    ui.ses.classList.add('on'); // sized under the loading screen so the remote gets the right resolution
    const fail = m => { if (my !== token) return; busy = false; ui.load.classList.add('failed'); setStatus(m); ui.cancel.hidden = true; ui.back.hidden = false; };
    try {
      const { launch } = await import(VMS + 'vm/vm.mjs');
      const s = await launch(item.os, {
        el: ui.screen, say: setStatus, progress: setProg, cancelled: () => my !== token,
        onState: (code) => {
          if (my !== token) return;
          if (code === 3 && !live) { live = true; setProg(1); ui.load.classList.add('hidden'); openTools(false); }
          if (code === 5) { if (!live) fail('The session closed before it could start.'); else { toast('Session ended'); openTools(true); } }
        },
      });
      if (my !== token) { s.stop(); return; }
      sess = s; busy = false;
    } catch (e) {
      if (my !== token) return;
      fail(e && e.message === 'Cancelled' ? 'Cancelled' : 'Couldn’t start this VM: ' + (e && e.message || e));
    }
  }

  // navigation.js calls this when the tab is opened (it has nothing else to wait for on this page)
  K.vmsShow = () => { if (!st.data.length) return load(); render(); };
  K.vmsRefresh = load;
  load();
}
