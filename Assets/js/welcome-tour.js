export function init(K) {
  const SEEN_KEY = 'kstuff_welcome_seen';
  const forced = /[?&]welcome\b/.test(location.search);

  const read = () => { try { return localStorage.getItem(SEEN_KEY); } catch { return '1'; } };
  const markSeen = () => { try { localStorage.setItem(SEEN_KEY, '1'); } catch {} };

  const $q = sel => document.querySelector(sel);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const footerBtn = t => `.footer-btn[data-go="${t}"]`;
  const portal = () => $q('#classroom-portal-container');
  const SET_MODAL = '#homeworkhelper-modal .modal-content';
  const tab = id => `.settings-tab[data-panel="settings-panel-${id}"]`;

  // Bounding box in top-level viewport coordinates (works for elements inside iframes)
  const rect = el => {
    const r = el.getBoundingClientRect();
    let x = r.left, y = r.top, w = el.ownerDocument && el.ownerDocument.defaultView;
    try {
      while (w && w.frameElement) {
        const f = w.frameElement.getBoundingClientRect();
        x += f.left; y += f.top; w = w.parent;
      }
    } catch {}
    return { left: x, top: y, width: r.width, height: r.height };
  };

  let busy = false, renderTok = 0, shown = 0, navigated = false;

  const loaderDone = async () => {
    await sleep(250);
    const t0 = Date.now();
    while (K.loader && !K.loader.classList.contains('hidden') && Date.now() - t0 < 3500) await sleep(100);
  };
  const goPage = async id => {
    const btn = K.findNavBtn && K.findNavBtn(id);
    if (!btn || btn.classList.contains('active')) return;
    navigated = true;
    btn.click();
    await loaderDone();
  };

  const settingsModal = () => document.getElementById('homeworkhelper-modal');
  const settingsOpen = () => !!(settingsModal() && settingsModal().classList.contains('active'));
  const openSettings = async () => {
    if (settingsOpen()) return;
    const btn = (K.findNavBtn && K.findNavBtn('homeworkhelper')) || $q(footerBtn('homeworkhelper'));
    btn && btn.click();
    await sleep(850);
  };
  const closeSettings = async () => {
    if (!settingsOpen()) return;
    const c = document.getElementById('homeworkhelper-close-btn');
    if (c) c.click(); else settingsModal().classList.remove('active');
    await sleep(500);
  };

  // --- AI welcome message (typed into the AI page's chat, same-origin iframe) ---
  const AI_TEXT = 'Hey! I\u2019m SingularityAI. Ask me anything: homework help, code, ideas, or just a chat. You can pick a model from the dropdown, and your past chats will show up in the sidebar.';
  let aiNode = null, aiTimer = 0, aiHidWelcome = false;
  const aiDoc = () => { try { const f = document.getElementById('lessonplanner-iframe'); return (f && f.contentDocument) || null; } catch { return null; } };
  const clearAi = () => {
    clearTimeout(aiTimer); aiTimer = 0;
    if (aiNode) { aiNode.remove(); aiNode = null; }
    const d = aiDoc();
    const list = d && d.getElementById('aiMessages'), w = d && d.getElementById('aiWelcome');
    if (aiHidWelcome && w && list && !list.children.length) w.style.display = 'flex';
    aiHidWelcome = false;
  };
  const aiWelcome = async () => {
    clearAi();
    let d = null;
    const t0 = Date.now();
    while (Date.now() - t0 < 5000) {
      d = aiDoc();
      if (d && d.getElementById('aiMessages')) break;
      d = null; await sleep(150);
    }
    if (!d) return;
    const list = d.getElementById('aiMessages'), w = d.getElementById('aiWelcome');
    if (!list.children.length && w) { w.style.display = 'none'; aiHidWelcome = true; }
    const msg = d.createElement('div');
    msg.className = 'ai-message assistant';
    msg.setAttribute('data-sg-tour', '1');
    const dots = d.createElement('div');
    dots.className = 'ai-thinking-dots';
    dots.innerHTML = '<span class="ai-typing-dot"></span><span class="ai-typing-dot"></span><span class="ai-typing-dot"></span>';
    msg.appendChild(dots);
    list.appendChild(msg);
    aiNode = msg;
    await sleep(900);
    if (aiNode !== msg) return;
    dots.remove();
    const text = d.createElement('div');
    text.className = 'ai-message-text';
    msg.appendChild(text);
    let i = 0;
    const type = () => {
      if (aiNode !== msg) return;
      i = Math.min(AI_TEXT.length, i + 2);
      text.textContent = AI_TEXT.slice(0, i);
      if (i < AI_TEXT.length) aiTimer = setTimeout(type, 24);
    };
    type();
  };

  // Idempotent per-step setup: opens/closes Settings, navigates, switches tabs, triggers the AI hello
  const prepare = async step => {
    if (step.settings) {
      await openSettings();
      const t = step.tab && $q(tab(step.tab));
      if (t && !t.classList.contains('active')) { t.click(); await sleep(250); }
    } else {
      await closeSettings();
    }
    if (step.page) await goPage(step.page);
    if (step.id === 'ai') await aiWelcome();
    else if (aiNode) clearAi();
  };

  const STEPS = [
    {
      title: 'Welcome to Singularity',
      text: 'Quick tour: I\u2019ll open pages and Settings for you as we go, so you can see where everything is. It only takes a minute.',
      center: true,
      page: 'mathworksheets'
    },
    { sel: () => K.tbInput && K.tbInput.parentElement, title: 'Address bar', text: 'Type a search or a web address here, and use the buttons beside it to go back, forward or reload.' },
    { sel: '.sg-tabbar', title: 'Tabs', text: 'Open several pages and sites at once, just like a normal browser. Use the + button for a new tab.' },
    { id: 'home', sel: '#hdr-home-btn', always: true, page: 'mathworksheets', title: 'Home', text: 'This is Home, your starting point. The house button up here brings you back any time.' },
    { id: 'games', sel: portal, always: true, page: 'readingcorner', title: 'Games', text: 'Browse and search the games library, then click a card to play.' },
    { id: 'apps', sel: portal, always: true, page: 'sciencequiz', title: 'Apps', text: 'Web apps and tools, laid out the same way as Games.' },
    { id: 'music', sel: portal, always: true, page: 'gradebook', title: 'Music', text: 'Search for songs, queue them up and build your own playlists.' },
    { id: 'tv', sel: portal, always: true, page: 'civics', title: 'TV', text: 'Browse movies and shows, search, or watch live TV.' },
    {
      id: 'ai', sel: () => { const d = aiDoc(); return d && d.getElementById('aiComposer'); }, always: true,
      page: 'lessonplanner', side: 'top', title: 'AI',
      text: 'Chat with SingularityAI. Type your question down here, and pick a model from the dropdown. It even said hi!'
    },
    { id: 'vms', sel: portal, always: true, page: 'vms', title: 'VMs', text: 'Virtual machines, right in your browser.' },
    { id: 'chat', sel: portal, always: true, page: 'studyhall', when: () => !!K.currentUser, title: 'Chat', text: 'Message other people and make group chats.' },
    {
      id: 'settings', sel: SET_MODAL, always: true, settings: true, title: 'Settings',
      text: 'I\u2019ve opened Settings for you. It\u2019s split into tabs, and I\u2019ll show you each one.'
    },
    { sel: tab('appearance'), always: true, settings: true, tab: 'appearance', anchor: SET_MODAL, side: 'bottom', force: true, title: 'Appearance', text: 'Pick a theme and font, move the navigation bar, and tweak how the interface looks.' },
    { sel: tab('search'), always: true, settings: true, tab: 'search', anchor: SET_MODAL, side: 'bottom', force: true, title: 'Search', text: 'Choose which search engine the address bar uses.' },
    { sel: tab('proxy'), always: true, settings: true, tab: 'proxy', anchor: SET_MODAL, side: 'bottom', force: true, title: 'Proxy', text: 'Controls how sites load: the Wisp server, transport and isolation options. Most people never need to touch these.' },
    { sel: tab('preferences'), always: true, settings: true, tab: 'preferences', anchor: SET_MODAL, side: 'bottom', force: true, title: 'Preferences', text: 'Switches for how Singularity behaves.' },
    { sel: tab('data'), always: true, settings: true, tab: 'data', anchor: SET_MODAL, side: 'bottom', force: true, title: 'Data', text: 'Data tools will live here. It\u2019s coming soon.' },
    { sel: tab('about'), always: true, settings: true, tab: 'about', anchor: SET_MODAL, side: 'bottom', force: true, title: 'About', text: 'Version info, a button to load the latest version, and you can replay this tour from here any time.' },
    { sel: footerBtn('changelog'), title: 'What\u2019s new', text: 'The changelog shows recent updates and new features.' },
    {
      sel: () => $q(footerBtn('profile')) || $q('.nav-btn[data-target="profile"]'),
      title: 'Make it yours',
      text: 'Create a free account to save your settings, get a profile and unlock Chat. You can also do it later from this button.',
      last: true
    }
  ];

  let root, spot, card, titleEl, textEl, dotsEl, backBtn, nextBtn, skipBtn, accountBtn;
  let index = 0, active = false, prevFocus = null, resizeRaf = 0;
  let raf = 0, lastT = 0, cur = null, stepsCache = [];

  const injectStyle = () => {
    if (document.getElementById('sg-tour-style')) return;
    const s = document.createElement('style');
    s.id = 'sg-tour-style';
    s.textContent = `
      #sg-tour{position:fixed;inset:0;z-index:100000;opacity:0;transition:opacity .4s var(--ease,ease);font-family:var(--font,inherit)}
      #sg-tour.on{opacity:1}
      #sg-tour .sg-tour-spot{position:fixed;left:0;top:0;width:0;height:0;border-radius:16px;pointer-events:none;
        box-shadow:0 0 0 100vmax rgba(0,0,0,.74);will-change:transform,width,height}
      #sg-tour .sg-tour-spot.has-target::after{content:"";position:absolute;inset:0;border-radius:inherit;
        border:2px solid var(--text-color,#fff);animation:sg-tour-pulse 1.8s ease-in-out infinite}
      #sg-tour .sg-tour-card{position:fixed;left:0;top:0;width:min(340px,calc(100vw - 24px));box-sizing:border-box;padding:20px 20px 16px;
        border-radius:18px;background:var(--nav-bg,#111);color:var(--text-color,#fff);
        border:1px solid color-mix(in srgb,var(--text-color,#fff) 18%,transparent);
        box-shadow:0 20px 50px rgba(0,0,0,.5);
        will-change:transform;transition:opacity .3s ease}
      #sg-tour .sg-tour-card.big{width:min(420px,calc(100vw - 24px));padding:28px 26px 20px;text-align:center}
      #sg-tour .sg-tour-body{transition:opacity .2s ease,transform .2s ease}
      #sg-tour .sg-tour-body.swap{opacity:0;transform:translateY(6px)}
      #sg-tour h2{margin:0 0 8px;font-size:1.25rem;line-height:1.2}
      #sg-tour .big h2{font-size:1.7rem}
      #sg-tour p{margin:0;font-size:.95rem;line-height:1.45;opacity:.85;font-weight:600}
      #sg-tour .sg-tour-dots{display:flex;gap:6px;margin:16px 0 14px}
      #sg-tour .big .sg-tour-dots{justify-content:center}
      #sg-tour .sg-tour-dots i{width:6px;height:6px;border-radius:99px;background:currentColor;opacity:.25;transition:all .3s var(--ease,ease)}
      #sg-tour .sg-tour-dots i.on{opacity:1;width:18px}
      #sg-tour .sg-tour-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      #sg-tour .big .sg-tour-row{justify-content:center}
      #sg-tour .sg-tour-row .grow{flex:1}
      #sg-tour button{font:inherit;font-weight:700;font-size:.9rem;padding:9px 16px;border-radius:12px;cursor:pointer;
        border:1px solid color-mix(in srgb,var(--text-color,#fff) 25%,transparent);background:transparent;color:inherit;
        transition:transform .2s var(--ease,ease),background-color .2s ease,opacity .2s ease}
      #sg-tour button:hover{background:color-mix(in srgb,var(--text-color,#fff) 12%,transparent)}
      #sg-tour button:active{transform:scale(.95)}
      #sg-tour button:focus-visible{outline:2px solid var(--text-color,#fff);outline-offset:2px}
      #sg-tour button.primary{background:var(--text-color,#fff);color:var(--bg-color,#000);border-color:var(--text-color,#fff)}
      #sg-tour button.primary:hover{opacity:.88;background:var(--text-color,#fff)}
      #sg-tour button.link{border-color:transparent;opacity:.7;padding-left:8px;padding-right:8px}
      #sg-tour button.link:hover{opacity:1}
      #sg-tour button[hidden]{display:none}
      @keyframes sg-tour-pulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--text-color,#fff) 45%,transparent)}50%{box-shadow:0 0 0 7px transparent}}
      @media (prefers-reduced-motion:reduce){
        #sg-tour,#sg-tour .sg-tour-spot,#sg-tour .sg-tour-card,#sg-tour .sg-tour-body,#sg-tour .sg-tour-dots i{transition:none}
        #sg-tour .sg-tour-spot.has-target::after{animation:none}
      }
    `;
    document.head.appendChild(s);
  };

  const build = () => {
    root = document.createElement('div');
    root.id = 'sg-tour';
    root.innerHTML = `
      <div class="sg-tour-spot"></div>
      <div class="sg-tour-card" role="dialog" aria-modal="true" aria-labelledby="sg-tour-title" aria-describedby="sg-tour-text">
        <div class="sg-tour-body">
          <h2 id="sg-tour-title"></h2>
          <p id="sg-tour-text" aria-live="polite"></p>
        </div>
        <div class="sg-tour-dots"></div>
        <div class="sg-tour-row">
          <button type="button" class="link" data-act="skip">Skip</button>
          <span class="grow"></span>
          <button type="button" data-act="back">Back</button>
          <button type="button" class="primary" data-act="next">Next</button>
          <button type="button" class="primary" data-act="account" hidden>Create account</button>
        </div>
      </div>`;
    spot = root.querySelector('.sg-tour-spot');
    card = root.querySelector('.sg-tour-card');
    titleEl = root.querySelector('h2');
    textEl = root.querySelector('p');
    dotsEl = root.querySelector('.sg-tour-dots');
    backBtn = root.querySelector('[data-act="back"]');
    nextBtn = root.querySelector('[data-act="next"]');
    skipBtn = root.querySelector('[data-act="skip"]');
    accountBtn = root.querySelector('[data-act="account"]');
    root.addEventListener('click', e => {
      const act = e.target.closest('button')?.dataset.act;
      if (act === 'next') go(1);
      else if (act === 'back') go(-1);
      else if (act === 'skip') finish(false);
      else if (act === 'account') finish(true);
    });
    document.body.appendChild(root);
  };

  const targetFor = step => {
    if (!step.sel) return null;
    const el = typeof step.sel === 'function' ? step.sel() : document.querySelector(step.sel);
    if (!el) return null;
    const r = rect(el);
    return r.width > 0 && r.height > 0 ? el : null;
  };

  const visibleSteps = () => STEPS.filter(s => (!s.when || s.when()) && (s.center || s.always || targetFor(s)));

  const refreshSteps = () => {
    stepsCache = visibleSteps();
    if (index > stepsCache.length - 1) index = Math.max(0, stepsCache.length - 1);
  };

  const computeTarget = () => {
    const step = stepsCache[shown] || stepsCache[index];
    if (!step) return null;
    const vw = window.innerWidth, vh = window.innerHeight, m = 12, gap = 16;
    const el = targetFor(step);
    const cw = card.offsetWidth, ch = card.offsetHeight;
    const clampX = x => Math.max(m, Math.min(x, vw - cw - m));
    const clampY = y => Math.max(m, Math.min(y, vh - ch - m));

    if (!el) {
      return {
        has: false,
        x: vw / 2, y: vh / 2, w: 0, h: 0, r: 16,
        cx: (vw - cw) / 2, cy: (vh - ch) / 2
      };
    }

    const r = rect(el);
    const pad = 6;
    const sx = r.left - pad, sy = r.top - pad, sw = r.width + pad * 2, sh = r.height + pad * 2;
    let radius = 16;
    try { radius = (parseFloat(el.ownerDocument.defaultView.getComputedStyle(el).borderTopLeftRadius) || 10) + pad; } catch {}

    // Card placement can be anchored to a different element than the spotlight
    let px = sx, py = sy, pw = sw, ph = sh;
    const an = step.anchor && document.querySelector(step.anchor);
    if (an) { const a = rect(an); if (a.width > 0 && a.height > 0) { px = a.left; py = a.top; pw = a.width; ph = a.height; } }

    const fits = {
      right: px + pw + gap + cw + m <= vw,
      left: px - gap - cw - m >= 0,
      bottom: py + ph + gap + ch + m <= vh,
      top: py - gap - ch - m >= 0
    };
    const order = step.side ? [step.side, ...['right', 'left', 'bottom', 'top'].filter(k => k !== step.side)] : ['right', 'left', 'bottom', 'top'];
    const side = step.force ? step.side : (order.find(k => fits[k]) || 'bottom');
    let x, y;
    if (side === 'right') { x = px + pw + gap; y = py + ph / 2 - ch / 2; }
    else if (side === 'left') { x = px - gap - cw; y = py + ph / 2 - ch / 2; }
    else if (side === 'bottom') { x = px + pw / 2 - cw / 2; y = py + ph + gap; }
    else { x = px + pw / 2 - cw / 2; y = py - gap - ch; }
    return { has: true, x: sx, y: sy, w: sw, h: sh, r: radius, cx: clampX(x), cy: clampY(y) };
  };

  const FIELDS = ['x', 'y', 'w', 'h', 'r', 'cx', 'cy'];

  const tick = now => {
    raf = 0;
    if (!active || !root) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - (lastT || now)) / 1000));
    lastT = now;
    const t = computeTarget();
    if (t) {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const a = !cur ? 1 : 1 - Math.exp(-(reduce ? 26 : 8) * dt);
      if (!cur) cur = {};
      for (const f of FIELDS) {
        const from = cur[f] === undefined ? t[f] : cur[f];
        const next = from + (t[f] - from) * a;
        cur[f] = Math.abs(t[f] - next) < 0.05 ? t[f] : next;
      }
      spot.classList.toggle('has-target', t.has);
      spot.style.width = cur.w + 'px';
      spot.style.height = cur.h + 'px';
      spot.style.borderRadius = cur.r + 'px';
      spot.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      card.style.transform = `translate3d(${cur.cx}px, ${cur.cy}px, 0)`;
    }
    raf = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    cur = null;
    lastT = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const render = (instant = false) => {
    refreshSteps();
    const steps = stepsCache;
    const step = steps[index];
    const body = card.querySelector('.sg-tour-body');
    const tok = ++renderTok;
    const apply = () => {
      if (!active || !root || tok !== renderTok) return;
      shown = index;
      card.classList.toggle('big', !!step.center);
      titleEl.textContent = step.title;
      textEl.textContent = step.text;
      dotsEl.innerHTML = steps.map((_, i) => `<i class="${i === index ? 'on' : ''}"></i>`).join('');
      backBtn.hidden = index === 0;
      const isLast = index === steps.length - 1;
      nextBtn.textContent = index === 0 ? 'Show me' : (isLast ? 'Done' : 'Next');
      accountBtn.hidden = !isLast;
      skipBtn.textContent = isLast ? 'Maybe later' : 'Skip';
      skipBtn.hidden = false;
      if (isLast && K.currentUser) accountBtn.hidden = true;
      body.classList.remove('swap');
      (isLast && !accountBtn.hidden ? accountBtn : nextBtn).focus({ preventScroll: true });
    };
    if (instant) { shown = index; apply(); busy = true; prepare(step).catch(() => {}).then(() => { if (tok === renderTok) busy = false; }); return; }
    busy = true;
    body.classList.add('swap');
    Promise.all([sleep(140), prepare(step).catch(err => console.warn('tour step failed', err))]).then(() => {
      if (tok !== renderTok) return;
      busy = false;
      apply();
    });
  };

  const go = dir => {
    if (busy) return;
    const steps = stepsCache.length ? stepsCache : visibleSteps();
    const next = index + dir;
    if (next < 0) return;
    if (next >= steps.length) { finish(false); return; }
    index = next;
    render();
  };

  const onKey = e => {
    if (!active) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); go(-1); }
    else if (e.key === 'Tab') {
      const btns = [...card.querySelectorAll('button')].filter(b => !b.hidden);
      if (!btns.length) return;
      const i = btns.indexOf(document.activeElement);
      e.preventDefault();
      btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
    }
  };

  const onResize = () => {
    if (!active || resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; refreshSteps(); });
  };

  function finish(openAccount) {
    if (!active) return;
    active = false;
    renderTok++;
    busy = false;
    markSeen();
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onResize);
    clearAi();
    root.classList.remove('on');
    const closing = root;
    setTimeout(() => { closing.remove(); if (root === closing) root = null; }, 450);
    try { prevFocus?.focus?.({ preventScroll: true }); } catch {}
    (async () => {
      try {
        await closeSettings();
        if (navigated) await goPage('mathworksheets');
      } catch {}
      if (openAccount && !K.currentUser) K.authMod?.classList.add('active');
    })();
  }

  const start = () => {
    if (active) return;
    injectStyle();
    build();
    active = true;
    index = 0;
    shown = 0;
    navigated = false;
    prevFocus = document.activeElement;
    K.tooltipEl && (K.tooltipEl.style.display = 'none');
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onResize);
    render(true);
    startLoop();
    requestAnimationFrame(() => requestAnimationFrame(() => root && root.classList.add('on')));
  };
  K.startWelcomeTour = start;

  const tourBtn = document.getElementById('take-tour-btn');
  if (tourBtn) {
    tourBtn.hidden = false;
    tourBtn.addEventListener('click', () => {
      document.getElementById('homeworkhelper-close-btn')?.click();
      setTimeout(start, 350);
    });
  }

  if (!forced) {
    if (read()) return;
    if (K.currentUser) { markSeen(); return; }
  }

  const begin = () => setTimeout(() => { if (!document.hidden || forced) start(); else document.addEventListener('visibilitychange', function f() { if (!document.hidden) { document.removeEventListener('visibilitychange', f); start(); } }); }, 500);
  const t0 = Date.now();
  const wait = setInterval(() => {
    const loaded = !K.loader || K.loader.classList.contains('hidden');
    if (loaded || Date.now() - t0 > 12000) { clearInterval(wait); begin(); }
  }, 250);
}
