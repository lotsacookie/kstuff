// GeForce NOW games (SingularityNOW). Clicking a GFN card on the Games page shows the Singularity loading screen
// (same markup/CSS as the VMs tab) while the embedded SingularityNOW client signs in (if needed) and starts the stream.
//
// Loading: the GitHub API gives the latest commit of the repo (K.getRefSha, cached + pinned in localStorage),
// Assets/now/index.html is fetched from jsDelivr at that exact commit and cached in localStorage by commit,
// and the client's own modules (stream.js) are imported from the same pinned jsDelivr URL.
export function init(K) {
  const $ = id => document.getElementById(id);
  const REPO = K.MAIN_REPO || 'lotsacookie/kstuff';
  const DIR = 'Assets/now/';
  const HTML_CACHE = 'kstuff_gfn_html_v1';
  let host = null, ui = null, frame = null, frameP = null, ready = false, base = '';
  let launching = false, live = false, wanted = null, token = 0;

  const LOGO = '<svg class="ld-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><g id="gfn-arm" fill="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10"><path pathLength="1" d="M50 3 L83 13 L92 43 L75 69 L49 73 L35 57" stroke-width="5.5"/><path pathLength="1" d="M50 13 L76 22 L82 44 L70 62 L52 65" stroke-width="2.2" opacity="0.7"/></g></defs><g class="ld-arms" stroke="currentColor"><use href="#gfn-arm"/><use href="#gfn-arm" transform="rotate(120 50 50)"/><use href="#gfn-arm" transform="rotate(240 50 50)"/></g><g class="ld-core" fill="currentColor"><path d="M50.0 29.0 L51.7 45.8 L58.5 41.5 L54.2 48.3 L71.0 50.0 L54.2 51.7 L58.5 58.5 L51.7 54.2 L50.0 71.0 L48.3 54.2 L41.5 58.5 L45.8 51.7 L29.0 50.0 L45.8 48.3 L41.5 41.5 L48.3 45.8 Z"/></g></svg>';
  const CSS = `
#gfn-loading{position:absolute;inset:0;width:100%;height:100%;background:transparent;color:var(--text-color,#fff);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:1.1rem;z-index:60;transition:opacity .5s ease,visibility .5s ease}
#gfn-loading.hidden{opacity:0;visibility:hidden;pointer-events:none}
#gfn-loading .ld-status{text-align:center;max-width:80vw;padding:0 12px}
#gfn-loading.failed .ld-status{color:#ff6b6b;opacity:1}
#gfn-loading .gfn-ld-btns{display:flex;gap:10px;min-height:2.6rem;align-items:center}
#gfn-loading .page-btn{padding:8px 20px}
#gfn-frame{position:absolute;inset:0;display:block;width:100%!important;height:100%!important;min-width:100%;min-height:100%;border:0;background:transparent;z-index:55;visibility:hidden}
#readingcorner.gfn-running{min-height:100%}
#gfn-frame.on{visibility:visible}
#gfn-frame.ui{z-index:70;background:var(--bg-color,var(--background,#0b0d10))}
#gfn-x{position:absolute;top:10px;right:10px;z-index:80;width:2.2rem;height:2.2rem;border-radius:50%;display:none;align-items:center;justify-content:center;padding:0;cursor:pointer;background:var(--nav-bg,rgba(0,0,0,.6));color:var(--text-color,#fff);border:1px solid var(--line,rgba(255,255,255,.25))}
#gfn-x.on{display:flex}
#readingcorner.gfn-running>.filter-bar,#readingcorner.gfn-running>.item-grid,#readingcorner.gfn-running>.pagination-bar{display:none!important}`;

  // ---------------------------------------------------------------- loading the client (GitHub API -> jsDelivr @commit)
  async function resolveBase(force) {
    const sha = await K.getRefSha(REPO, 'main', force).catch(() => '');
    return { sha, base: `https://cdn.jsdelivr.net/gh/${REPO}@${sha || 'main'}/${DIR}` };
  }
  async function clientHtml(force) {
    const { sha, base: b } = await resolveBase(force);
    base = b;
    if (sha) {
      try { const c = JSON.parse(localStorage.getItem(HTML_CACHE) || 'null'); if (c && c.sha === sha && c.html) return c.html; } catch {}
    }
    let html = '';
    const urls = [b + 'index.html'];
    if (sha) urls.push(`https://raw.githubusercontent.com/${REPO}/${sha}/${DIR}index.html`);
    urls.push(`https://cdn.jsdelivr.net/gh/${REPO}@main/${DIR}index.html`);
    let err;
    for (const u of urls) {
      try { const r = await fetch(u, { cache: 'default' }); if (r.ok) { html = await r.text(); break; } err = new Error(r.status + ' ' + u); } catch (e) { err = e; }
    }
    if (!html) throw err || new Error('Couldn’t load the GeForce NOW client');
    if (sha) { try { localStorage.setItem(HTML_CACHE, JSON.stringify({ sha, at: Date.now(), html })); } catch {} }
    return html;
  }

  function ensureHost() {
    host = host || $('readingcorner');
    return host;
  }
  function ensureUi() {
    if (ui) return ui;
    ensureHost();
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    const load = document.createElement('div'); load.id = 'gfn-loading'; load.className = 'hidden';
    load.innerHTML = `${LOGO}<div class="ld-word">Singularity</div><div class="ld-bar"><div class="ld-fill" id="gfn-ld-fill"></div></div><div class="ld-status" id="gfn-ld-status">Loading</div><div class="gfn-ld-btns"><button class="page-btn" id="gfn-ld-cancel" type="button">Cancel</button><button class="page-btn" id="gfn-ld-back" type="button" hidden>Back</button></div>`;
    host.appendChild(load);
    const x = document.createElement('button'); x.id = 'gfn-x'; x.type = 'button'; x.title = 'Close'; x.innerHTML = '<i class="ph ph-x"></i>'; x.onclick = () => end(true); host.appendChild(x);
    ui = { x, load, fill: $('gfn-ld-fill'), status: $('gfn-ld-status'), cancel: $('gfn-ld-cancel'), back: $('gfn-ld-back') };
    ui.cancel.onclick = ui.back.onclick = () => end(true);
    return ui;
  }
  const setStatus = t => { if (ui) ui.status.textContent = t || ''; };
  const setProg = p => { if (ui) ui.fill.style.transform = `scaleX(${Math.min(Math.max(p, 0), 1)})`; };

  function mountFrame() {
    if (frameP) return frameP;
    ensureHost();
    frameP = (async () => {
      const html = await clientHtml(false);
      const boot = `<script>window.__NOW_EMBED=true;window.__NOW_BASE=${JSON.stringify(base)};<\/script>`;
      const doc = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + boot) : boot + html;
      frame = document.createElement('iframe');
      frame.id = 'gfn-frame'; frame.title = 'GeForce NOW';
      frame.setAttribute('allow', K.IFRAME_ALLOW || 'fullscreen; pointer-lock; gamepad; keyboard-map; autoplay; clipboard-read; clipboard-write');
      frame.setAttribute('allowfullscreen', '');
      host.appendChild(frame);
      ready = false;
      const wait = new Promise(res => { frame._ready = res; });
      frame.srcdoc = doc;
      await Promise.race([wait, new Promise((_, rej) => setTimeout(() => rej(new Error('The GeForce NOW client didn’t start')), 25000))]);
    })().catch(e => { frameP = null; if (frame) { frame.remove(); frame = null; } throw e; });
    return frameP;
  }
  const focusFrame = () => { try { frame?.focus(); frame?.contentWindow?.focus(); } catch {} };
  const post = msg => { try { frame?.contentWindow?.postMessage(msg, '*'); } catch {} };

  // If the games page measures too small (grid hidden, no height from its parent), cover the visible area beside the nav instead.
  function fit() {
    if (!frame || !host) return;
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
    fit();
    frame.classList.toggle('on', !!on);
    frame.classList.toggle('ui', !!withUi);
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
    if (userCancelled && frame) post({ type: 'gfn:stop' });
    launching = false; live = false; wanted = null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    showFrame(false);
    frame?.style.removeProperty('visibility');
    ui?.x?.classList.remove('on');
    host?.classList.remove('gfn-running');
    if (ui) { ui.load.classList.add('hidden'); ui.load.classList.remove('failed'); ui.back.hidden = true; ui.cancel.hidden = false; }
  }
  function fail(text) {
    if (!ui) return;
    live = false; showFrame(false); frame?.style.removeProperty('visibility'); ui.x.classList.remove('on');
    ui.load.classList.remove('hidden'); ui.load.classList.add('failed');
    setStatus(text); ui.cancel.hidden = true; ui.back.hidden = false;
  }

  // ---------------------------------------------------------------- messages from the embedded client
  window.addEventListener('message', e => {
    if (!frame || e.source !== frame.contentWindow) return;
    const d = e.data;
    if (!d || typeof d !== 'object' || typeof d.type !== 'string' || !d.type.startsWith('gfn:')) return;
    switch (d.type) {
      case 'gfn:ready': ready = true; frame._ready?.(); break;
      case 'gfn:status':
        if (!launching || live) break;
        if (typeof d.text === 'string') setStatus(d.text);
        if (typeof d.p === 'number') setProg(d.p);
        break;
      case 'gfn:view': // the client needs the screen (sign-in, ads, settings) or gives it back to the loading screen
        if (d.ui) { showFrame(true, true); ui?.load.classList.add('hidden'); }
        else if (!live) { showFrame(false); if (launching && !ui.load.classList.contains('failed')) ui.load.classList.remove('hidden'); }
        break;
      case 'gfn:live':
        live = true; setProg(1); showFrame(true, false); ui?.x?.classList.remove('on'); ui?.load.classList.add('hidden'); focusFrame(); setTimeout(focusFrame, 300); break;
      case 'gfn:failed': if (launching) fail(d.text || 'Couldn’t start the game'); break;
      case 'gfn:closed':
        if (!launching && !live) break;
        end(false);
        break;
      case 'gfn:signedout': break;
      case 'gfn:catalog': { // the full GeForce NOW list from the signed-in client: add the titles the public list lacks
        const n = Array.isArray(d.games) && K.mergeGfnExtra ? K.mergeGfnExtra(d.games) : 0;
        if (n && !launching && !live) K.hardRefreshGrid?.('readingcorner');
        break;
      }
    }
  });

  // ---------------------------------------------------------------- public API
  K.openGfnGame = async item => {
    if (!item || !/^[\w.-]{1,40}$/.test(String(item.gfnId || ''))) return;
    if (launching) return;
    ensureUi(); ensureHost();
    const my = ++token;
    launching = true; live = false;
    host.classList.add('gfn-running');
    ui.load.classList.remove('hidden', 'failed'); ui.cancel.hidden = false; ui.back.hidden = true;
    setProg(0.02); setStatus('Starting');
    try {
      setStatus('Loading the GeForce NOW client…');
      await mountFrame();
      if (my !== token) return;
      wanted = { id: /^\d+$/.test(item.gfnId) ? Number(item.gfnId) : item.gfnId, title: item.gfnName || item.title };
      setProg(0.05); setStatus('Starting ' + wanted.title);
      post({ type: 'gfn:launch', game: wanted });
    } catch (err) {
      if (my !== token) return;
      fail('Couldn’t start GeForce NOW: ' + ((err && err.message) || err));
    }
  };

  // quietly load the client while idle so a signed-in user's full catalog gets merged into the grid
  const signedIn = () => { try { return !!localStorage.getItem('singularitynow.session'); } catch { return false; } };
  K.syncGfnCatalog = async () => {
    if (launching || live || !signedIn()) return;
    try { await mountFrame(); if (!launching && !live) post({ type: 'gfn:sync' }); } catch {}
  };
  setTimeout(() => K.syncGfnCatalog(), 8000);

  K.openGfnSettings = async () => {
    try { await mountFrame(); } catch (e) { return; }
    post({ type: 'gfn:settings' });
  };

  // (the settings gear that used to sit in the games filter bar was removed; server / resolution / FPS stay reachable from the client's own Settings button while streaming)
  document.getElementById('gfn-settings-btn')?.remove();
}
