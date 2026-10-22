export function init(K) {
  const SEEN_KEY = 'kstuff_welcome_seen';
  const forced = /[?&]welcome\b/.test(location.search);

  const read = () => { try { return localStorage.getItem(SEEN_KEY); } catch { return '1'; } };
  const markSeen = () => { try { localStorage.setItem(SEEN_KEY, '1'); } catch {} };

  const nav = t => `.nav-btn[data-target="${t}"]`;
  const STEPS = [
    {
      title: 'Welcome to Singularity',
      text: 'Quick tour: I\u2019ll point out the main buttons so you know where everything is. It only takes a few seconds.',
      center: true
    },
    { sel: nav('mathworksheets'), title: 'Home', text: 'Your starting point. Click here any time to come back.' },
    { sel: nav('readingcorner'), title: 'Games', text: 'Browse and search the games library, then click a card to play.' },
    { sel: nav('sciencequiz'), title: 'Apps', text: 'Web apps and tools, laid out the same way as Games.' },
    { sel: nav('gradebook'), title: 'Music', text: 'Search for songs and build playlists.' },
    { sel: nav('civics'), title: 'TV', text: 'Search channels and watch.' },
    { sel: nav('lessonplanner'), title: 'AI', text: 'Chat with an AI assistant.' },
    { sel: nav('vms'), title: 'VMs', text: 'Virtual machines, right in your browser.' },
    { sel: nav('studyhall'), title: 'Chat', text: 'Message other people and make group chats. You need an account for this one.' },
    { sel: () => K.tbInput?.parentElement, title: 'Address bar', text: 'Type a search or a web address here, and use the buttons beside it to go back, forward or reload.' },
    { sel: nav('homeworkhelper'), title: 'Settings', text: 'Change the theme, font, navigation layout and search engine.' },
    {
      sel: nav('profile'),
      title: 'Make it yours',
      text: 'Create a free account to save your settings, get a profile and unlock Chat. You can also do it later from this button.',
      last: true
    }
  ];

  let root, spot, card, titleEl, textEl, dotsEl, backBtn, nextBtn, skipBtn, accountBtn;
  let index = 0, active = false, prevFocus = null, resizeRaf = 0;

  const injectStyle = () => {
    if (document.getElementById('sg-tour-style')) return;
    const s = document.createElement('style');
    s.id = 'sg-tour-style';
    s.textContent = `
      #sg-tour{position:fixed;inset:0;z-index:100000;opacity:0;transition:opacity .4s var(--ease,ease);font-family:var(--font,inherit)}
      #sg-tour.on{opacity:1}
      #sg-tour .sg-tour-spot{position:fixed;left:0;top:0;width:0;height:0;border-radius:16px;pointer-events:none;
        box-shadow:0 0 0 100vmax rgba(0,0,0,.74);
        transition:transform .55s var(--ease,ease),width .55s var(--ease,ease),height .55s var(--ease,ease),border-radius .55s var(--ease,ease)}
      #sg-tour .sg-tour-spot.has-target::after{content:"";position:absolute;inset:0;border-radius:inherit;
        border:2px solid var(--text-color,#fff);animation:sg-tour-pulse 1.8s ease-in-out infinite}
      #sg-tour .sg-tour-card{position:fixed;left:0;top:0;width:min(340px,calc(100vw - 24px));box-sizing:border-box;padding:20px 20px 16px;
        border-radius:18px;background:var(--nav-bg,#111);color:var(--text-color,#fff);
        border:1px solid color-mix(in srgb,var(--text-color,#fff) 18%,transparent);
        box-shadow:0 20px 50px rgba(0,0,0,.5);
        transition:transform .55s var(--ease,ease),opacity .3s ease}
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
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? el : null;
  };

  const visibleSteps = () => STEPS.filter(s => s.center || targetFor(s));

  const place = (animate = true) => {
    const steps = visibleSteps();
    const step = steps[index];
    if (!step) return;
    const vw = window.innerWidth, vh = window.innerHeight, m = 12, gap = 16;
    const el = targetFor(step);

    card.classList.toggle('big', !!step.center);
    const cw = card.offsetWidth, ch = card.offsetHeight;

    if (!el) {
      spot.classList.remove('has-target');
      spot.style.width = '0px';
      spot.style.height = '0px';
      spot.style.transform = `translate(${vw / 2}px, ${vh / 2}px)`;
      card.style.transform = `translate(${Math.round((vw - cw) / 2)}px, ${Math.round((vh - ch) / 2)}px)`;
      return;
    }

    const r = el.getBoundingClientRect();
    const pad = 6;
    const sx = r.left - pad, sy = r.top - pad, sw = r.width + pad * 2, sh = r.height + pad * 2;
    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 10;
    spot.classList.add('has-target');
    spot.style.width = sw + 'px';
    spot.style.height = sh + 'px';
    spot.style.borderRadius = (radius + pad) + 'px';
    spot.style.transform = `translate(${sx}px, ${sy}px)`;

    const clampX = x => Math.max(m, Math.min(x, vw - cw - m));
    const clampY = y => Math.max(m, Math.min(y, vh - ch - m));
    const fits = {
      right: sx + sw + gap + cw + m <= vw,
      left: sx - gap - cw - m >= 0,
      bottom: sy + sh + gap + ch + m <= vh,
      top: sy - gap - ch - m >= 0
    };
    const side = ['right', 'left', 'bottom', 'top'].find(s => fits[s]) || 'bottom';
    let x, y;
    if (side === 'right') { x = sx + sw + gap; y = clampY(sy + sh / 2 - ch / 2); }
    else if (side === 'left') { x = sx - gap - cw; y = clampY(sy + sh / 2 - ch / 2); }
    else if (side === 'bottom') { x = clampX(sx + sw / 2 - cw / 2); y = Math.min(sy + sh + gap, vh - ch - m); }
    else { x = clampX(sx + sw / 2 - cw / 2); y = Math.max(m, sy - gap - ch); }
    card.style.transform = `translate(${Math.round(clampX(x))}px, ${Math.round(clampY(y))}px)`;
  };

  const render = (instant = false) => {
    const steps = visibleSteps();
    const step = steps[index];
    const body = card.querySelector('.sg-tour-body');
    const apply = () => {
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
      place();
      body.classList.remove('swap');
      (isLast && !accountBtn.hidden ? accountBtn : nextBtn).focus({ preventScroll: true });
    };
    if (instant) { apply(); return; }
    body.classList.add('swap');
    setTimeout(apply, 140);
  };

  const go = dir => {
    const steps = visibleSteps();
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
    resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; if (visibleSteps()[index]) place(); });
  };

  function finish(openAccount) {
    if (!active) return;
    active = false;
    markSeen();
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onResize);
    root.classList.remove('on');
    setTimeout(() => { root.remove(); root = null; }, 450);
    try { prevFocus?.focus?.({ preventScroll: true }); } catch {}
    if (openAccount && !K.currentUser) K.authMod?.classList.add('active');
  }

  const start = () => {
    if (active) return;
    injectStyle();
    build();
    active = true;
    index = 0;
    prevFocus = document.activeElement;
    K.tooltipEl && (K.tooltipEl.style.display = 'none');
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onResize);
    render(true);
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('on')));
  };
  K.startWelcomeTour = start;

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
