// WebBlox (Roblox in the browser). Clicking the WebBlox card on the Games page shows the Singularity loading screen while the embedded
// WebBlox client (Assets/blox/index.html) starts. The client never creates its own proxy: all of its requests and the proxy frame itself
// come from the net hub (window.kNetDirect), so proxy cookies are the shared proxy_cookie_storage.
// The client is fetched from jsDelivr at the latest commit (K.getRefSha) and cached in localStorage by commit, so it stays current
// without waiting for the singularity.js rebuild; the copy packed into singularity.js is the offline fallback.
export function init(K) {
  const $ = id => document.getElementById(id);
  const REPO = K.MAIN_REPO || 'lotsacookie/kstuff';
  const DIR = 'Assets/blox/';
    let host = null, ui = null, frame = null, frameP = null, ready = false, base = '';
  let launching = false, live = false, wanted = null, token = 0;

  const LOGO = '<svg class="ld-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><g id="blox-arm" fill="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10"><path pathLength="1" d="M50 3 L83 13 L92 43 L75 69 L49 73 L35 57" stroke-width="5.5"/><path pathLength="1" d="M50 13 L76 22 L82 44 L70 62 L52 65" stroke-width="2.2" opacity="0.7"/></g></defs><g class="ld-arms" stroke="currentColor"><use href="#blox-arm"/><use href="#blox-arm" transform="rotate(120 50 50)"/><use href="#blox-arm" transform="rotate(240 50 50)"/></g><g class="ld-core" fill="currentColor"><path d="M50.0 29.0 L51.7 45.8 L58.5 41.5 L54.2 48.3 L71.0 50.0 L54.2 51.7 L58.5 58.5 L51.7 54.2 L50.0 71.0 L48.3 54.2 L41.5 58.5 L45.8 51.7 L29.0 50.0 L45.8 48.3 L41.5 41.5 L48.3 45.8 Z"/></g></svg>';
  const CSS = `
#blox-loading{position:absolute;inset:0;width:100%;height:100%;background:transparent;color:var(--text-color,#fff);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:1.1rem;z-index:60;transition:opacity .5s ease,visibility .5s ease}
#blox-loading.hidden{opacity:0;visibility:hidden;pointer-events:none}
#blox-loading .ld-word span{font-weight:400;opacity:.6}
#blox-loading .ld-status{text-align:center;max-width:80vw;padding:0 12px}
#blox-loading.failed .ld-status{color:#ff6b6b;opacity:1}
#blox-loading .blox-ld-ask{display:none;gap:10px;align-items:center;justify-content:center;margin:0}
#blox-loading.asking .blox-ld-ask{display:flex}
#blox-ld-place{width:min(300px,62vw);box-sizing:border-box;padding:.55rem .9rem;border-radius:12px;border:1px solid var(--line,var(--hairline,rgba(255,255,255,.2)));background:var(--card-bg,transparent);color:var(--text-color,#fff);font:inherit;font-weight:700;text-align:center;outline:none;transition:border-color .2s ease}
#blox-ld-place::placeholder{color:var(--text-color,#fff);opacity:.45;font-weight:600}
#blox-ld-place:hover,#blox-ld-place:focus{border-color:var(--text-color,#fff)}
#blox-loading .blox-ld-btns{display:flex;gap:10px;min-height:2.6rem;align-items:center}
#blox-loading .page-btn{padding:8px 20px}
#blox-frame{position:absolute;inset:0;display:block;width:100%!important;height:100%!important;min-width:100%;min-height:100%;border:0;background:transparent;z-index:55;visibility:hidden}
*.blox-running{min-height:100%}
#blox-frame.on{visibility:visible}
#blox-frame:not(.on){visibility:hidden!important;pointer-events:none!important}
#blox-frame.ui{z-index:70;background:var(--bg-color,var(--background,#0b0d10))}
#blox-x{position:absolute;top:10px;right:10px;z-index:80;width:2.2rem;height:2.2rem;border-radius:50%;display:none;align-items:center;justify-content:center;padding:0;cursor:pointer;background:var(--nav-bg,rgba(0,0,0,.6));color:var(--text-color,#fff);border:1px solid var(--line,rgba(255,255,255,.25))}
#blox-x.on{display:flex}
*.blox-running>.filter-bar,*.blox-running>.item-grid,*.blox-running>.pagination-bar{display:none!important}`;

  // ---------------------------------------------------------------- loading the client (GitHub API -> jsDelivr @commit)
  // Every push is followed by a bot "build" commit, so the newest commit is often not on jsDelivr yet (it 404s, and the miss is cached).
  // The embedded client resolves all of its relative files against that URL, so pinning to an unserved commit breaks the game start.
  // Use the newest commit jsDelivr can actually serve for the client files, walking back a few commits if needed.
  const servedShas = new Map();
  const served = sha => {
    if (!servedShas.has(sha)) {
      const c = new AbortController(), t = setTimeout(() => c.abort(), 6000);
      servedShas.set(sha, fetch(`https://cdn.jsdelivr.net/gh/${REPO}@${sha}/${DIR}index.html`, { method: 'HEAD', cache: 'no-store', signal: c.signal })
        .then(r => r.ok, () => false).then(ok => { if (!ok) setTimeout(() => servedShas.delete(sha), 30000); return ok; }).finally(() => clearTimeout(t)));
    }
    return servedShas.get(sha);
  };
  async function recentShas() {
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/commits?sha=main&per_page=10`, { cache: 'no-store' });
      if (!r.ok) return [];
      return (await r.json()).map(c => c && c.sha).filter(x => typeof x === 'string' && /^[0-9a-f]{40}$/.test(x));
    } catch { return []; }
  }
  async function resolveBase(force) {
    let sha = await K.getRefSha(REPO, 'main', force).catch(() => '');
    if (sha && !(await served(sha))) {
      const older = (await recentShas()).filter(x => x !== sha);
      const ok = await Promise.all(older.map(served));
      const i = ok.indexOf(true);
      console.warn('[blox] commit', sha.slice(0, 7), 'is not on jsDelivr yet,', i >= 0 ? 'using ' + older[i].slice(0, 7) : 'using main');
      sha = i >= 0 ? older[i] : '';
    }
    return { sha, base: `https://cdn.jsdelivr.net/gh/${REPO}@${sha || 'main'}/${DIR}` };
  }
  function ensureHost() {
    const act = document.querySelector('.page.active')?.id;
    const want = $(act === 'sciencequiz' ? 'sciencequiz' : 'readingcorner');
    if (host && want && host !== want && !launching && !live) {
      host.classList.remove('blox-running');
      frame?.remove(); frame = null; frameP = null; ready = false;
      ui?.load.remove(); ui?.x.remove(); ui = null;
      host = want;
    }
    host = host || want;
    return host;
  }
  let styled = false;
  function ensureStyle() {
    if (styled) return;
    styled = true;
    const style = document.createElement('style'); style.id = 'blox-style'; style.textContent = CSS; document.head.appendChild(style);
  }
  function ensureUi() {
    if (ui) return ui;
    ensureHost();
    ensureStyle();
    const load = document.createElement('div'); load.id = 'blox-loading'; load.className = 'hidden';
    load.innerHTML = `${LOGO}<div class="ld-word">Web<span>Blox</span></div><div class="ld-bar"><div class="ld-fill" id="blox-ld-fill"></div></div><div class="ld-status" id="blox-ld-status">Loading</div><form class="blox-ld-ask" id="blox-ld-ask" autocomplete="off"><input id="blox-ld-place" type="text" inputmode="numeric" placeholder="Place ID or game link" spellcheck="false" aria-label="Place ID"><button class="page-btn" id="blox-ld-go" type="submit">Launch</button></form><div class="blox-ld-btns"><button class="page-btn" id="blox-ld-cancel" type="button">Cancel</button><button class="page-btn" id="blox-ld-log" type="button">Log</button><button class="page-btn" id="blox-ld-back" type="button" hidden>Back</button></div>`;
    host.appendChild(load);
    const x = document.createElement('button'); x.id = 'blox-x'; x.type = 'button'; x.title = 'Close'; x.innerHTML = '<i class="ph ph-x"></i>'; x.onclick = () => end(true); host.appendChild(x);
    ui = { x, load, ask: $('blox-ld-ask'), place: $('blox-ld-place'), fill: $('blox-ld-fill'), status: $('blox-ld-status'), cancel: $('blox-ld-cancel'), back: $('blox-ld-back'), log: $('blox-ld-log') };
    // the loader covers the client page, so this brings the client forward with its console open
    ui.log.onclick = () => { if (!frame) return; showFrame(true, true); post({ type: 'blox:console' }); };
    ui.cancel.onclick = ui.back.onclick = () => end(true);
    return ui;
  }
  // The player always chooses the game: no default Place ID, and nothing starts until one is entered.
  const parsePlace = v => {
    const t = String(v || '').trim();
    const m = /roblox\.com\/(?:[a-z-]+\/)?games\/(\d{1,20})/i.exec(t) || /^(\d{1,20})$/.exec(t);
    return m ? m[1] : '';
  };
  function askPlace() {
    return new Promise(resolve => {
      ui.load.classList.add('asking'); ui.place.value = '';
      ui.status.textContent = 'Enter the Place ID of the game to join';
      ui.ask.onsubmit = e => {
        e.preventDefault();
        const id = parsePlace(ui.place.value);
        if (!id) { ui.status.textContent = 'Enter a numeric Place ID or a roblox.com/games link'; ui.place.focus(); return; }
        ui.load.classList.remove('asking'); ui.ask.onsubmit = null;
        resolve(id);
      };
      setTimeout(() => { try { ui.place.focus(); } catch {} }, 60);
    });
  }
  const setStatus = t => { if (ui) ui.status.textContent = t || ''; };
  const setProg = p => { if (ui) ui.fill.style.transform = `scaleX(${Math.min(Math.max(p, 0), 1)})`; };

  // The client runs as a normal same-origin page (its service worker and ?placeId= mode need a real URL), pinned to the latest commit.
  // Its scripts and the core pack come from jsDelivr at that commit (see Assets/blox/index.html).
  const HTML_CACHE = 'blox-client-html';
  async function clientHtml(sha, base) {
    if (sha) {
      try { const c = JSON.parse(localStorage.getItem(HTML_CACHE) || 'null'); if (c && c.sha === sha && c.html) return c.html; } catch {}
    }
    const urls = [];
    if (sha) urls.push(base + 'index.html', `https://raw.githubusercontent.com/${REPO}/${sha}/${DIR}index.html`);
    urls.push(`https://cdn.jsdelivr.net/gh/${REPO}@main/${DIR}index.html`);
    let err;
    for (const u of urls) {
      try { const r = await fetch(u, { cache: 'default' }); if (r.ok) { const html = await r.text(); if (sha) { try { localStorage.setItem(HTML_CACHE, JSON.stringify({ sha, html })); } catch {} } return html; } err = new Error(r.status + ' ' + u); } catch (e) { err = e; }
    }
    throw err || new Error('Couldn’t load the WebBlox client');
  }
  // The client page comes from kstuff on jsDelivr at the latest commit (GitHub API pin) and is embedded with srcdoc, so it never
  // depends on this site hosting Assets/blox. __WB_PAGE tells the client which URL it lives at, since a srcdoc frame has none.
  const cleanSearch = raw => {
    const params = new URLSearchParams(String(raw || '').replace(/^\?/, ''));
    const id = params.get('placeId');
    if (id && /^\d{1,20}$/.test(id)) return '?placeId=' + id;
    return params.get('launcher') === 'roblox' ? '?launcher=roblox' : '';
  };
  function mountFrame(search) {
    ensureHost();
    ensureStyle();
    return (async () => {
      const { sha, base } = await resolveBase(true);
      console.log('[blox] client commit', sha ? sha.slice(0, 7) : 'unknown, using main');
      setStatus('Loading the WebBlox client ' + (sha ? sha.slice(0, 7) : 'main') + '…');
      const html = await clientHtml(sha, base);
      const page = base + 'index.html' + (search || '');
      const boot = `<base href="${base}"><script>window.__WB_PAGE=${JSON.stringify(page)};window.__WB_SHA=${JSON.stringify(sha || '')};window.__WB_EMBED=true;<\/script>`;
      const doc = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + boot) : boot + html;
      if (frame) frame.remove();
      frame = document.createElement('iframe');
      frame.id = 'blox-frame'; frame.title = 'WebBlox';
      frame.setAttribute('allow', K.IFRAME_ALLOW || 'fullscreen; pointer-lock; gamepad; keyboard-map; autoplay; clipboard-read; clipboard-write; microphone; cross-origin-isolated');
      frame.setAttribute('allowfullscreen', '');
      host.appendChild(frame);
      ready = false;
      frame.srcdoc = doc;
    })().catch(e => { if (frame) { frame.remove(); frame = null; } throw e; });
  }
  const focusFrame = () => { try { frame?.focus(); frame?.contentWindow?.focus(); } catch {} };
  const post = msg => { try { frame?.contentWindow?.postMessage(msg, '*'); } catch {} };

  // If the games page measures too small (grid hidden, no height from its parent), cover the visible area beside the nav instead.
  function fit() {
    if (!frame || !host) return;
    if (!frame.classList.contains('on')) {
      ['position', 'inset', 'left', 'top', 'width', 'height', 'z-index', 'visibility'].forEach(k => frame.style.removeProperty(k));
      return;
    }
    const r = host.getBoundingClientRect();
    const small = r.height < 300 || r.width < 320;
    const st = frame.style;
    if (small) {
      const left = Math.max(r.left, 0), top = Math.max(r.top, 0);
      st.setProperty('position', 'fixed'); st.setProperty('inset', 'auto');
      st.setProperty('left', left + 'px'); st.setProperty('top', top + 'px');
      st.setProperty('width', Math.max(window.innerWidth - left, 320) + 'px', 'important');
      st.setProperty('height', Math.max(window.innerHeight - top, 300) + 'px', 'important');
    } else {
      ['position', 'inset', 'left', 'top'].forEach(k => st.removeProperty(k));
      st.setProperty('width', '100%', 'important'); st.setProperty('height', '100%', 'important');
    }
  }
  window.addEventListener('resize', () => fit());
  document.addEventListener('fullscreenchange', () => fit());

  function showFrame(on, withUi) {
    if (!frame) return;
    frame.classList.toggle('on', !!on);
    frame.classList.toggle('ui', !!withUi);
    fit();
    // the exit button sits above the client while it needs the screen (sign-in, ads, settings), so there is always a way out
    ui?.x?.classList.toggle('on', !!on && !live);
    if (!on) return;
    requestAnimationFrame(fit); setTimeout(fit, 250); setTimeout(fit, 1000);
    setTimeout(() => {
      if (!frame || !frame.classList.contains('on')) return;
      const r = frame.getBoundingClientRect();
      if (r.width < 100 || r.height < 100 || getComputedStyle(frame).visibility !== 'visible') {
        // still collapsed or hidden: pin it over the visible area beside the nav
        const st = frame.style, h = host?.getBoundingClientRect();
        const left = Math.max(h?.left || 0, 0), top = Math.max(h?.top || 0, 0);
        st.setProperty('position', 'fixed'); st.setProperty('inset', 'auto');
        st.setProperty('left', left + 'px'); st.setProperty('top', top + 'px');
        st.setProperty('width', Math.max(window.innerWidth - left, 320) + 'px', 'important');
        st.setProperty('height', Math.max(window.innerHeight - top, 300) + 'px', 'important');
        st.setProperty('visibility', 'visible', 'important'); st.setProperty('z-index', '70', 'important');
      }
    }, 400);
  }

  function end(userCancelled) {
    token++;
    ui?.load.classList.remove('asking');
    if (userCancelled && frame) { frame.remove(); frame = null; frameP = null; ready = false; }
    launching = false; live = false; wanted = null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    showFrame(false);
    frame?.style.removeProperty('visibility');
    ui?.x?.classList.remove('on');
    host?.classList.remove('blox-running');
    if (ui) { ui.load.classList.add('hidden'); ui.load.classList.remove('failed'); ui.back.hidden = true; ui.cancel.hidden = false; }
  }
  function fail(text) {
    if (!ui) return;
    live = false; showFrame(false); frame?.style.removeProperty('visibility'); ui.x.classList.remove('on');
    ui.load.classList.remove('asking');
    ui.load.classList.remove('hidden'); ui.load.classList.add('failed');
    setStatus(text); ui.cancel.hidden = true; ui.back.hidden = false;
  }

  // ---------------------------------------------------------------- messages from the embedded client
  window.addEventListener('message', e => {
    if (!frame || e.source !== frame.contentWindow) return;
    const d = e.data;
    if (!d || typeof d !== 'object' || typeof d.type !== 'string' || !d.type.startsWith('blox:')) return;
    switch (d.type) {
      case 'blox:ready': ready = true; frame._ready?.(); break;
      case 'blox:status':
        if (!launching || live) break;
        if (typeof d.text === 'string') setStatus(d.text);
        if (typeof d.p === 'number') setProg(d.p);
        break;
      case 'blox:view': // the client needs the screen (sign-in, ads, settings) or gives it back to the loading screen
        if (!launching && !live) { showFrame(false); break; }
        if (d.ui) { showFrame(true, true); ui?.load.classList.add('hidden'); }
        else if (!live) { showFrame(false); if (launching && !ui.load.classList.contains('failed')) ui.load.classList.remove('hidden'); }
        break;
      case 'blox:live':
        live = true; setProg(1); showFrame(true, false); ui?.x?.classList.remove('on'); ui?.load.classList.add('hidden'); focusFrame(); setTimeout(focusFrame, 300); break;
      case 'blox:failed': if (launching) fail(d.text || 'Couldn’t start the game'); break;
      case 'blox:closed':
        if (!launching && !live) break;
        end(false);
        break;
      case 'blox:navigate': {
        const search = cleanSearch(d.search);
        const my = ++token;
        launching = true; live = false;
        host?.classList.add('blox-running');
        showFrame(false);
        ui.x.classList.remove('on');
        ui.load.classList.remove('hidden', 'failed', 'asking'); ui.cancel.hidden = false; ui.back.hidden = true;
        setProg(0.1);
        setStatus(search.startsWith('?placeId=') ? 'Starting the game…' : 'Loading WebBlox…');
        mountFrame(search).then(() => {
          if (my !== token) return;
          showFrame(true, true); ui.load.classList.add('hidden'); focusFrame(); setTimeout(focusFrame, 300);
        }).catch(err => {
          if (my !== token) return;
          fail('Couldn’t start the game: ' + ((err && err.message) || err));
        });
        break;
      }
      case 'blox:signedout': break;
    }
  });

  // ---------------------------------------------------------------- public API
  K.openBloxGame = async item => {
    if (!item || launching) return;
    ensureHost(); ensureUi();
    const my = ++token;
    launching = true; live = false; wanted = null;
    host.classList.add('blox-running');
    ui.load.classList.remove('hidden', 'failed'); ui.cancel.hidden = false; ui.back.hidden = true;
    setProg(0.02);
    try {
      setStatus('Loading the WebBlox client…'); setProg(0.05);
      wanted = { id: '', title: item.bloxName || item.title || 'WebBlox' };
      await mountFrame('');
      if (my !== token) return;
      // the client draws its own loading and sign-in screens, so hand it the screen right away
      showFrame(true, true); ui?.load.classList.add('hidden'); focusFrame(); setTimeout(focusFrame, 300);
    } catch (err) {
      if (my !== token) return;
      fail('Couldn’t start WebBlox: ' + ((err && err.message) || err));
    }
  };

  K.exitBlox = () => {
    if (!launching && !live && !(frame && frame.classList.contains('on'))) return false;
    end(true);
    return true;
  };

  K.hideBlox = () => {
    if (launching || live) return;
    showFrame(false);
    host?.classList.remove('blox-running');
    if (ui) { ui.load.classList.add('hidden'); ui.load.classList.remove('failed'); ui.x?.classList.remove('on'); }
  };

}
