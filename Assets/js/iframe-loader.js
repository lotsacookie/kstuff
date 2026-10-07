export function init(K) {
  const THEME_SYNC_SCRIPT = `<script>(function(){function g(cs,n){return(cs.getPropertyValue(n)||'').trim();}function primaryFont(f){if(!f)return'';return f.split(',')[0].trim().replace(/^['"]|['"]\$/g,'');}var SYS=new Set(['sans-serif','serif','monospace','cursive','fantasy','system-ui','ui-sans-serif','ui-serif','ui-monospace','ui-rounded','-apple-system','blinkmacsystemfont','segoe ui','segoe ui emoji','arial','helvetica','verdana','tahoma','trebuchet ms','georgia','times new roman','times','courier new','courier','impact','lucida console','roboto','inherit']);var lastFont='';function ensureFontLink(name){if(!name||SYS.has(name.toLowerCase())||name===lastFont)return;lastFont=name;var id='kstuff-iframe-font-link';var old=document.getElementById(id);if(old)old.remove();var link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(name).replace(/%20/g,'+')+':wght@300;400;500;600;700;800&display=swap';document.head.appendChild(link);}function sT(){try{var p=window.parent;if(!p||p===window)return;var cs=p.getComputedStyle(p.document.body),d=document.documentElement.style;var bg=g(cs,'--background');if(!bg&&cs.backgroundColor!=='rgba(0, 0, 0, 0)'&&cs.backgroundColor!=='transparent')bg=cs.backgroundColor;var tx=g(cs,'--text-color')||cs.color;if(bg&&tx&&bg===tx){bg='';tx='';}var font=g(cs,'--font');var m={'--bg':bg,'--text':tx,'--nav':g(cs,'--nav-bg'),'--card':g(cs,'--card-bg'),'--font':font};for(var k in m){if(m[k])d.setProperty(k,m[k]);else d.removeProperty(k);}ensureFontLink(primaryFont(font));}catch(e){}}sT();window.addEventListener('message',function(e){if(e.data==='theme-updated')sT();});})();<\/script>`;
  const FONT_FORCE_STYLE = `<style>*{font-family:var(--font, inherit) !important;}</style>`;
  const CURSOR_SYNC_SCRIPT = `<script>(function(){var SIZE=${K.CURSOR_SIZE},OFF={a:[${K.CURSOR_OFFSETS.arrow[0]},${K.CURSOR_OFFSETS.arrow[1]}],h:[${K.CURSOR_OFFSETS.hand[0]},${K.CURSOR_OFFSETS.hand[1]}]},SEL=${JSON.stringify(K.CLICKABLE_SELECTOR)};var css="html.kstuff-cursor-active,html.kstuff-cursor-active *{cursor:none !important;}.kstuff-cursor{position:fixed;top:0;left:0;width:"+SIZE+"px;height:"+SIZE+"px;pointer-events:none;z-index:2147483647;color:var(--text,inherit);opacity:0;transition:opacity .1s ease;will-change:transform;contain:layout style;}.kstuff-cursor.visible{opacity:1;}.kstuff-cursor svg{width:100%;height:100%;display:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));}.kstuff-cursor .k-arrow{display:block;}.kstuff-cursor.pointer .k-arrow{display:none;}.kstuff-cursor.pointer .k-hand{display:block;}";var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);document.documentElement.classList.add('kstuff-cursor-active');var c=document.createElement('div');c.className='kstuff-cursor';c.innerHTML='${K.CURSOR_SVG_MARKUP}';(document.body||document.documentElement).appendChild(c);var shown=false,pending=false,last=null,announced=false,hand=false,lt=null;function post(a){try{window.parent.postMessage({type:'kstuff-cursor',action:a},'*');}catch(e){}}function pos(){pending=false;if(!last)return;var t=last.target;if(t!==lt){lt=t;var h=false;try{h=!!(t&&t.closest&&t.closest(SEL));}catch(e){}if(h!==hand){hand=h;c.classList.toggle('pointer',h);}}var o=hand?OFF.h:OFF.a;c.style.transform='translate('+(last.clientX-o[0])+'px,'+(last.clientY-o[1])+'px)';}function show(){if(shown)return;shown=true;c.classList.add('visible');}function hide(){shown=false;c.classList.remove('visible');}document.addEventListener('pointermove',function(e){last=e;if(!pending){pending=true;requestAnimationFrame(pos);}show();if(!announced){announced=true;post('enter');}},{passive:true});document.documentElement.addEventListener('mouseleave',function(){hide();announced=false;post('leave');});})();<\/script>`;
  const INJECTED = FONT_FORCE_STYLE + THEME_SYNC_SCRIPT + CURSOR_SYNC_SCRIPT;

  const buildErrorHtml = id => `<html style="background:#1b1b1f;margin:0;"><body style="margin:0;color:#f5f5f5;background:#1b1b1f;font-family:sans-serif;display:flex;flex-direction:column;gap:14px;justify-content:center;align-items:center;height:100vh;"><h2 style="margin:0;">Failed to load.</h2><button id="js-iframe-retry" style="padding:8px 18px;border:none;border-radius:6px;background:#4a7dff;color:#fff;cursor:pointer;font-size:0.9rem;">Retry</button><script>document.getElementById('js-iframe-retry').onclick=()=>window.parent.postMessage({type:'retry-iframe',id:'${id}'},'*');<\/script></body></html>`;

  const KEEP_ALIVE_IFRAMES = new Set([K.MUSIC_IFRAME_ID]);
  K.KEEP_ALIVE_IFRAMES = KEEP_ALIVE_IFRAMES;

  const IFRAME_ALLOW = 'document-picture-in-picture; picture-in-picture; display-capture; clipboard-write; autoplay';
  K.IFRAME_ALLOW = IFRAME_ALLOW;

  const LOCAL_SCRIPT = /<script\b([^>]*?)\bsrc=(["'])(?!https?:|\/\/|data:|blob:)([^"']+)\2([^>]*)>\s*<\/script>/gi;

  K.fetchPageHtml = async path => {
    const html = await K.fetchWithProxy(path, true);
    const dir = path.replace(/[^/]*$/, '');
    const wanted = new Set();
    html.replace(LOCAL_SCRIPT, (m, a, q, src) => { wanted.add(src); return m; });
    if (!wanted.size) return html;
    const loaded = {};
    await Promise.all(Array.from(wanted).map(async src => {
      const rel = dir + src.replace(/^\.\//, '');
      try { loaded[src] = await K.fetchWithProxy(rel, true); }
      catch { loaded[src] = null; }
    }));
    return html.replace(LOCAL_SCRIPT, (m, a, q, src, b) => {
      const attrs = (a + ' ' + b).replace(/\s+/g, ' ').trim();
      if (loaded[src] === null) return `<script${attrs ? ' ' + attrs : ''} src="https://cdn.jsdelivr.net/gh/${K.MAIN_REPO}@main/${dir}${src.replace(/^\.\//, '')}"></script>`;
      return `<script${attrs ? ' ' + attrs : ''}>${loaded[src].replace(/<\/script/gi, '<\\/script')}</script>`;
    });
  };

  K.lastIframeHtml = {};
  K.iframeLoadFailed = {};
  K.iframeLoadTokens = {};
  K.iframeInFlight = {};

  const isKeepAliveLoaded = id =>
    KEEP_ALIVE_IFRAMES.has(id) && !!K.$(id)?.srcdoc && !K.iframeLoadFailed[id] && !K.iframeInFlight[id];
  K.isKeepAliveLoaded = isKeepAliveLoaded;

  const pageIsHidden = f => { const pg = f.closest('.page'); return !!pg && !pg.classList.contains('active'); };
  K.pageIsHidden = pageIsHidden;

  function cancelIframeLoads(id) {
    K.iframeLoadTokens[id] = (K.iframeLoadTokens[id] || 0) + 1;
    delete K.iframeInFlight[id];
    const f = K.$(id);
    if (f) {
      clearTimeout(f.__kShowTimer);
      if (f.__kLoadHandler) { f.removeEventListener('load', f.__kLoadHandler); f.__kLoadHandler = null; }
    }
  }
  K.cancelIframeLoads = cancelIframeLoads;

  function loadIframePage(id, path, preFetchedHtml = null, isRetry = false) {
    return new Promise(async resolve => {
      const f = K.$(id);
      if (!f) return resolve();

      if (isKeepAliveLoaded(id)) {
        if (!pageIsHidden(f)) {
          f.style.display = 'block';
          K.toggleLoader(false);
        }
        return resolve();
      }

      const token = K.iframeLoadTokens[id] = (K.iframeLoadTokens[id] || 0) + 1;
      K.iframeInFlight[id] = token;
      const stale = () => K.iframeLoadTokens[id] !== token;
      const done = () => { if (K.iframeInFlight[id] === token) delete K.iframeInFlight[id]; resolve(); };

      clearTimeout(f.__kShowTimer);
      if (f.__kLoadHandler) { f.removeEventListener('load', f.__kLoadHandler); f.__kLoadHandler = null; }
      if (f.getAttribute('allow') !== IFRAME_ALLOW) f.setAttribute('allow', IFRAME_ALLOW);
      const mount = html => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          clearTimeout(f.__kShowTimer);
          if (!stale() && !pageIsHidden(f)) {
            f.style.display = 'block';
            K.toggleLoader(false);
          }
          done();
        };
        const onLoad = () => {
          try { if (f.contentWindow.location.href === 'about:blank') return; } catch {}
          f.removeEventListener('load', onLoad);
          if (f.__kLoadHandler === onLoad) f.__kLoadHandler = null;
          if (!stale() && id === 'studyhall-iframe' && K.currentUser) {
            try { f.contentWindow?.postMessage({ type: 'set_user', username: K.currentUser.username }, '*'); } catch {}
          }
          finish();
        };
        f.__kLoadHandler = onLoad;
        f.addEventListener('load', onLoad);
        f.__kShowTimer = setTimeout(finish, K.IFRAME_SHOW_TIMEOUT);
        f.removeAttribute('srcdoc');
        f.srcdoc = html;
      };

      try {
        const html = preFetchedHtml !== null ? preFetchedHtml : await K.fetchPageHtml(path);
        if (stale() || pageIsHidden(f)) return done();
        K.iframeLoadFailed[id] = false;
        K.lastIframeHtml[id] = html;
        const i = html.lastIndexOf('</body>');
        mount(i === -1 ? html + INJECTED : html.slice(0, i) + INJECTED + html.slice(i));
      } catch (err) {
        console.error('loadIframePage failed for', path, err);
        if (stale() || pageIsHidden(f)) return done();
        if (!isRetry) {
          setTimeout(() => {
            if (stale()) return done();
            loadIframePage(id, path, null, true).then(done);
          }, 900);
          return;
        }
        K.iframeLoadFailed[id] = true;
        mount(buildErrorHtml(id));
      }
    });
  }
  K.loadIframePage = loadIframePage;

  window.addEventListener('message', event => {
    if (event.data && event.data.type === 'retry-iframe' && event.data.id) {
      const entry = Object.values(K.iframePages).find(p => p.id === event.data.id);
      if (entry) {
        K.toggleLoader(true);
        loadIframePage(entry.id, entry.path).then(() => { const f = K.$(entry.id); if (f) f.style.display = 'block'; });
      }
    }
  });

  K.maybeReloadIframe = async (id, path) => {
    if (isKeepAliveLoaded(id)) return false;
    try {
      const html = await K.fetchPageHtml(path);
      if (!K.iframeLoadFailed[id] && K.lastIframeHtml[id] === html) return false;
      const currentIfr = Object.values(K.iframePages).find(p => p.id === id);
      const currentPage = currentIfr && document.querySelector('.page.active');
      if (!currentPage || !K.$(id) || pageIsHidden(K.$(id))) return false;
      K.toggleLoader(true, 'updating');
      await loadIframePage(id, path, html);
      K.toggleLoader(false);
      return true;
    } catch (err) {
      console.error('maybeReloadIframe failed for', path, err);
      return false;
    }
  };

  K.$(K.MUSIC_IFRAME_ID)?.addEventListener('load', () => K.renderMiniPlayer?.(null));
}
