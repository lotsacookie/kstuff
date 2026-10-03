export function init(K) {
  const tooltipEl = K.body.appendChild(K.el('div', { className: 'js-custom-tooltip' }));
  tooltipEl.style.cssText = 'position:fixed;left:0;top:0;display:none;padding:6px 10px;background:rgba(0,0,0,0.85);color:#fff;font-size:0.75rem;border-radius:6px;pointer-events:none;z-index:999999;white-space:nowrap;will-change:transform;';
  K.tooltipEl = tooltipEl;

  document.head.appendChild(K.el('style', {
    textContent: `
      html.kstuff-cursor-active, html.kstuff-cursor-active *{cursor:none !important;}
      .kstuff-cursor{position:fixed;top:0;left:0;width:${K.CURSOR_SIZE}px;height:${K.CURSOR_SIZE}px;pointer-events:none;z-index:2147483647;color:var(--text-color, inherit);opacity:0;transition:opacity .1s ease;will-change:transform;contain:layout style;}
      .kstuff-cursor.visible{opacity:1;}
      .kstuff-cursor svg{width:100%;height:100%;display:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));}
      .kstuff-cursor .k-arrow{display:block;}
      .kstuff-cursor.pointer .k-arrow{display:none;}
      .kstuff-cursor.pointer .k-hand{display:block;}
    `
  }));

  const cursorEl = K.body.appendChild(K.el('div', { className: 'kstuff-cursor', innerHTML: K.CURSOR_SVG_MARKUP }));
  document.documentElement.classList.add('kstuff-cursor-active');

  let cursorSuppressed = false, cursorShown = false;
  const showCustomCursor = () => {
    if (cursorSuppressed || cursorShown) return;
    cursorShown = true;
    cursorEl.classList.add('visible');
  };
  const hideCustomCursor = () => {
    cursorShown = false;
    cursorEl.classList.remove('visible');
  };
  const setCursorSuppressed = state => {
    cursorSuppressed = state;
    if (state) hideCustomCursor();
  };
  K.setCursorSuppressed = setCursorSuppressed;

  let pointerPending = false, lastPointerEvent = null, cursorIsHand = false;
  let lastTarget = null, lastTipEl = null, lastTipText = null;

  function onPointerFrame() {
    pointerPending = false;
    const e = lastPointerEvent;
    if (!e) return;
    const target = e.target;

    if (target !== lastTarget) {
      lastTarget = target;
      let isHand = false;
      try { isHand = !!target?.closest?.(K.CLICKABLE_SELECTOR); } catch {}
      if (isHand !== cursorIsHand) {
        cursorIsHand = isHand;
        cursorEl.classList.toggle('pointer', isHand);
      }
      lastTipEl = target?.closest?.('[data-tooltip]') || null;
    }

    const off = cursorIsHand ? K.CURSOR_OFFSETS.hand : K.CURSOR_OFFSETS.arrow;
    cursorEl.style.transform = `translate(${e.clientX - off[0]}px, ${e.clientY - off[1]}px)`;

    const text = lastTipEl ? lastTipEl.dataset.tooltip : undefined;
    if (text === undefined) {
      if (tooltipEl.style.display !== 'none') tooltipEl.style.display = 'none';
      lastTipText = null;
    } else {
      if (text !== lastTipText) {
        tooltipEl.textContent = text;
        lastTipText = text;
      }
      tooltipEl.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 12}px)`;
      if (tooltipEl.style.display !== 'block') tooltipEl.style.display = 'block';
    }
  }

  document.addEventListener('pointermove', e => {
    lastPointerEvent = e;
    if (cursorSuppressed && !(e.target instanceof HTMLIFrameElement)) cursorSuppressed = false;
    if (!pointerPending) { pointerPending = true; requestAnimationFrame(onPointerFrame); }
    showCustomCursor();
  }, { passive: true });
  document.addEventListener('pointerout', e => {
    if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('[data-tooltip]')) tooltipEl.style.display = 'none';
  }, { passive: true });
  document.addEventListener('pointerleave', () => hideCustomCursor(), { passive: true });
  document.addEventListener('pointerenter', () => { if (lastPointerEvent) showCustomCursor(); }, { passive: true });

  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || d.type !== 'kstuff-cursor') return;
    setCursorSuppressed(d.action === 'enter');
  });

  Object.values(K.iframePages).forEach(p => {
    const f = K.$(p.id);
    if (!f) return;
    f.addEventListener('mouseenter', () => setCursorSuppressed(true));
    f.addEventListener('mouseleave', () => setCursorSuppressed(false));
  });
  ['readingcorner', 'sciencequiz'].forEach(pageId => {
    const ifr = K.resourceIframeFor(pageId);
    if (!ifr) return;
    ifr.addEventListener('mouseenter', () => setCursorSuppressed(true));
    ifr.addEventListener('mouseleave', () => setCursorSuppressed(false));
  });

  let indicator = K.navBar?.querySelector('.nav-indicator') || (K.navBar && (K.navBar.prepend(K.el('div', { className: 'nav-indicator' })), K.navBar.querySelector('.nav-indicator')));
  const updateIndicator = btn => {
    if (!btn || !indicator || !K.navBar) return;
    const isVert = K.body.className.includes('nav-left') || K.body.className.includes('nav-right');
    const nR = K.navBar.getBoundingClientRect(), bR = btn.getBoundingClientRect();
    indicator.style.cssText = `transition:transform .22s ease,width .22s ease,height .22s ease;` +
      (isVert ? `width:3px;height:${bR.height}px;transform:translateY(${bR.top - nR.top}px);` : `width:${bR.width}px;height:3px;transform:translateX(${bR.left - nR.left}px);`);
  };
  K.updateIndicator = updateIndicator;

  let indicatorRaf = 0;
  const scheduleIndicator = () => {
    if (indicatorRaf) return;
    indicatorRaf = requestAnimationFrame(() => {
      indicatorRaf = 0;
      updateIndicator(document.querySelector('.nav-btn.active'));
    });
  };

  if (K.navBar) {
    new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.target.classList?.contains('nav-btn')) { scheduleIndicator(); return; }
      }
    }).observe(K.navBar, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  if (K.navBar && window.ResizeObserver) {
    new ResizeObserver(scheduleIndicator).observe(K.navBar);
  } else {
    let rs;
    window.addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(scheduleIndicator, 120); }, { passive: true });
  }

  const navLogo = K.$('nav-logo');
  let lastLogoHome = null;
  const isHomeView = () => {
    const value = (K.tbInput?.value || '').trim().toLowerCase().replace(/\/+$/, '');
    return value === 'singularity://home' && document.querySelector('.page.active')?.id === 'mathworksheets';
  };
  const updateLogoState = () => {
    if (!navLogo) return;
    const home = isHomeView();
    if (home === lastLogoHome) return;
    lastLogoHome = home;
    navLogo.classList.toggle('is-home', home);
  };
  K.updateLogoState = updateLogoState;

  if (typeof K.setAddress === 'function') {
    const baseSetAddress = K.setAddress;
    K.setAddress = function (...args) {
      const result = baseSetAddress.apply(this, args);
      updateLogoState();
      return result;
    };
  }
  K.tbInput?.addEventListener('input', updateLogoState);

  if (navLogo) {
    const burstLogo = () => {
      navLogo.classList.remove('burst');
      void navLogo.offsetWidth;
      navLogo.classList.add('burst');
    };
    const activateLogo = () => {
      tooltipEl.style.display = 'none';
      burstLogo();
      K.findNavBtn('mathworksheets')?.click();
    };
    navLogo.addEventListener('click', activateLogo);
    navLogo.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateLogo();
      }
    });
    navLogo.addEventListener('animationend', e => {
      if (e.target === navLogo && e.animationName === 'nl-click') navLogo.classList.remove('burst');
    });
    setInterval(() => { if (!document.hidden) updateLogoState(); }, 2000);
    updateLogoState();
  }

  const loadContent = async (tId, forceReload = false, customSrc = null) => {
    K.firstNavStarted = true;
    K.isNavigating = true;

    try {
      if (tId === 'studyhall' && !K.currentUser) {
        K.authMod?.classList.add('active');
        K.toggleLoader(false);
        return;
      }

      const targetPage = K.$(tId);
      if (!targetPage) {
        K.toggleLoader(false);
        return;
      }

      if (!customSrc) K.setAddress(K.pageAddress(tId));

      if (targetPage.classList.contains('active') && !forceReload && !customSrc) {
        const ifr = K.iframePages[tId];
        if (ifr && K.iframeInFlight[ifr.id]) return;
        if (!(ifr && (K.iframeLoadFailed[ifr.id] || !K.$(ifr.id)?.srcdoc))) {
          K.toggleLoader(false);
          return;
        }
      }

      const currentActive = document.querySelector('.page.active:not(#' + tId + ')');
      K.toggleLoader(true);

      if (currentActive) {
        currentActive.classList.remove('active');
        currentActive.style.display = 'none';

        if (K.iframePages[currentActive.id]) {
          const oldId = K.iframePages[currentActive.id].id;
          if (!K.isKeepAliveLoaded(oldId)) {
            K.cancelIframeLoads(oldId);
            const oldIframe = K.$(oldId);
            if (oldIframe) {
              oldIframe.removeAttribute('srcdoc');
              oldIframe.src = 'about:blank';
            }
          }
        }
      }

      Object.keys(K.grids).forEach(k => {
        if (k !== tId) {
          if (K.grids[k].gridEl) K.clearGridPool(k);
          if (K.resourceOpenFor[k]) K.resetResourceView(k);
        }
      });

      targetPage.style.display = 'block';
      targetPage.style.opacity = '1';
      targetPage.classList.add('active');
      K.updateLogoState?.();

      if (K.grids[tId]) {
        K.buildPool(tId);
        await K.renderGrid(tId, false);
        K.refreshGridSource(tId);
      } else if (K.iframePages[tId]) {
        const iframeData = K.iframePages[tId];
        const iframeEl = K.$(iframeData.id);
        if (iframeEl) iframeEl.style.display = 'block';
        if (customSrc && iframeEl) {
          K.cancelIframeLoads(iframeData.id);
          iframeEl.removeAttribute('srcdoc');
          iframeEl.src = customSrc;
          K.toggleLoader(false);
        } else {
          await K.loadIframePage(iframeData.id, iframeData.path);
        }
      }
    } finally {
      K.isNavigating = false;
    }
  };
  K.loadContent = loadContent;

  K.navBtns.forEach(btn => {
    const labelDivs = btn.querySelectorAll('.label-data div');

    btn.dataset.tooltip = labelDivs.length
      ? Array.from(labelDivs)
          .map(item => item.textContent)
          .reverse()
          .join('')
      : (btn.title || btn.dataset.target);

    btn.addEventListener('click', event => {
      event.preventDefault();

      tooltipEl.style.display = 'none';

      const targetId = btn.dataset.target;

      if (targetId === 'profile') {
        if (!K.currentUser) {
          K.authMod?.classList.add('active');
        } else {
          K.updateAuthUI();
          K.profMod?.classList.add('active');
        }

        return;
      }

      if (targetId === 'homeworkhelper') {
        K.$('homeworkhelper-modal')?.classList.add('active');
        return;
      }

      if (targetId === 'studyhall' && !K.currentUser) {
        K.authMod?.classList.add('active');
        return;
      }

      K.navBtns.forEach(other => {
        if (!['homeworkhelper', 'profile'].includes(other.dataset.target)) {
          other.classList.remove('active');
        }
      });

      btn.classList.add('active');
      updateIndicator(btn);
      K.toggleLoader(true);

      loadContent(targetId).then(() => {
        const pendingTitle = K.pendingResourceOpen[targetId];
        if (pendingTitle) {
          K.pendingResourceOpen[targetId] = null;
          const grid = K.grids[targetId];
          if (grid) {
            const match = (grid.data || []).find(i => K.slugifyTitle(i.title) === pendingTitle)
              || (grid.data || []).find(i => i.title === pendingTitle)
              || (grid.data || []).find(i => (i.title || '').toLowerCase() === pendingTitle.toLowerCase());
            if (match) K.openResource(match, { pageId: targetId, isHistory: true });
          }
        }
      }).catch(error => {
        console.error(`Navigation to ${targetId} failed:`, error);
        K.toggleLoader(false);
      });
    });
  });

  window.addEventListener('message', event => {
    if (typeof event.data === 'string' && event.data.startsWith('nav: ')) {
      const pageName = event.data.replace('nav: ', '').trim().toLowerCase();
      const targetMap = { 'home': 'mathworksheets', 'games': 'readingcorner', 'apps': 'sciencequiz', 'music': 'gradebook', 'ai': 'lessonplanner', 'vms': 'vms', 'chat': 'studyhall' };
      const targetId = targetMap[pageName] || pageName;
      const targetBtn = K.findNavBtn(targetId);
      if (targetBtn) targetBtn.click();
    }
  });

  const updateBrowserNav = () => {
    if (K.sBack) K.sBack.disabled = K.historyIndex <= 0;
    if (K.sFwd) K.sFwd.disabled = K.historyIndex >= K.history.length - 1;
  };
  K.updateBrowserNav = updateBrowserNav;

  const loadBrowserUrl = (val, isHistory = false) => {
    const targetUrl = K.formatWebUrl(val);
    if (!targetUrl) return;

    if (targetUrl.startsWith(K.SCHEME)) {
      const rest = targetUrl.slice(K.SCHEME.length);
      const slashIdx = rest.indexOf('/');
      const pageSeg = (slashIdx === -1 ? rest : rest.slice(0, slashIdx)).toLowerCase();
      const titleSeg = slashIdx === -1 ? '' : K.slugifyTitle(rest.slice(slashIdx + 1));
      const targetId = K.reverseUrlMap[pageSeg] || pageSeg;
      const btn = K.findNavBtn(targetId);

      if (!isHistory && K.history[K.historyIndex] !== targetUrl) {
        K.history = K.history.slice(0, K.historyIndex + 1);
        K.history.push(targetUrl);
        K.historyIndex++;
      }
      K.setAddress(targetUrl);
      updateBrowserNav();

      if (!titleSeg) {
        K.pendingResourceOpen[targetId] = null;
        if (K.grids[targetId] && K.resourceOpenFor[targetId] && document.querySelector('.page.active')?.id === targetId) {
          K.closeResourceInline(targetId);
        }
        if (btn) btn.click();
        return;
      }

      K.pendingResourceOpen[targetId] = titleSeg;
      if (btn) btn.click();
      return;
    }

    if (!isHistory && K.history[K.historyIndex] !== targetUrl) {
      K.history = K.history.slice(0, K.historyIndex + 1);
      K.history.push(targetUrl);
      K.historyIndex++;
    }

    K.setAddress(targetUrl);
    updateBrowserNav();

    const proxiedUrl = K.buildIxlUrl(targetUrl);
    loadContent('mathworksheets', true, proxiedUrl);
  };
  K.loadBrowserUrl = loadBrowserUrl;

  if (K.tbInput) {
    K.tbInput.addEventListener('keydown', e => { if (e.key === 'Enter') loadBrowserUrl(e.target.value); });
    K.$('study-enter-btn')?.addEventListener('click', () => loadBrowserUrl(K.tbInput.value));
  }

  K.sBack?.addEventListener('click', () => { if (K.historyIndex > 0) { K.historyIndex--; loadBrowserUrl(K.history[K.historyIndex], true); } });
  K.sFwd?.addEventListener('click', () => { if (K.historyIndex < K.history.length - 1) { K.historyIndex++; loadBrowserUrl(K.history[K.historyIndex], true); } });
  K.sReload?.addEventListener('click', () => { if (K.studyIframe) { try { K.studyIframe.contentWindow.location.reload(); } catch(e) { K.studyIframe.src = K.studyIframe.src; } } });
  K.sHome?.addEventListener('click', () => loadBrowserUrl('singularity://home'));

  let activePort = null;
  const mathworksIframe = K.$('mathworksheets-iframe');

  if (mathworksIframe) {
    mathworksIframe.addEventListener('load', () => {
      try {
        const channel = new MessageChannel();
        activePort = channel.port1;

        activePort.onmessage = (event) => {
          if (event.data && event.data.type === 'tabData') {
            const reportedUrl = event.data.url;

            if (document.activeElement === K.tbInput) return;
            if (document.querySelector('.page.active')?.id !== 'mathworksheets') return;

            const normalize = u => u ? u.replace(/\/$/, '').trim().toLowerCase() : '';
            const currentVal = K.tbInput ? K.tbInput.value : '';
            if (reportedUrl && normalize(reportedUrl) !== normalize(currentVal) && reportedUrl !== 'about:blank') {
              K.setAddress(reportedUrl);

              if (K.history[K.historyIndex] !== reportedUrl) {
                K.history = K.history.slice(0, K.historyIndex + 1);
                K.history.push(reportedUrl);
                K.historyIndex++;
                updateBrowserNav();
              }
            }
          }
        };

        if (mathworksIframe.contentWindow) {
          mathworksIframe.contentWindow.postMessage('init-port', '*', [channel.port2]);
        }
      } catch (e) {
      }
    });
  }

  window.addEventListener('message', (event) => {
    if (event.data && typeof event.data === 'string') {
      const data = event.data.trim();
      if (
        data.startsWith('http://') ||
        data.startsWith('https://') ||
        data.startsWith('kstuff://') ||
        data.startsWith('singularity://') ||
        (data.includes('.') && !data.includes(' '))
      ) {
        loadBrowserUrl(data);
      }
    }
  });

  K.initPromise
    .then(async () => {
      if (K.firstNavStarted) return;

      let activePage = document.querySelector('.page.active');

      if (!activePage) {
        const defaultHomeButton = K.findNavBtn('mathworksheets');

        if (defaultHomeButton) {
          K.navBtns.forEach(button => {
            button.classList.remove('active');
          });

          defaultHomeButton.classList.add('active');
          updateIndicator(defaultHomeButton);

          activePage = { id: 'mathworksheets' };
        }
      }

      if (activePage) {
        await loadContent(activePage.id, true);
      } else {
        K.toggleLoader(false);
      }
    })
    .catch(error => {
      console.error('Initial page load failed:', error);
      K.toggleLoader(false);
    });

  const isAnyModalActive = () => !!document.querySelector('.modal-overlay.active');
  K.isAnyModalActive = isAnyModalActive;

  async function autoRefreshActivePage() {
    if (K.autoRefreshBusy || K.isNavigating || isAnyModalActive() || document.hidden || K.isAnyResourceOpen()) return;
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;
    const tId = activePage.id;

    if (tId === 'mathworksheets' && K.tbInput && K.tbInput.value && K.tbInput.value !== 'singularity://home') return;

    K.autoRefreshBusy = true;
    try {
      const ifr = K.iframePages[tId];

      if (ifr) {
        await K.maybeReloadIframe(ifr.id, ifr.path);
        return;
      }

      if (K.grids[tId]) {
        window.kstuffLastRefresh = Date.now();
        await K.refreshGridSource(tId, true);
      }
    } finally {
      K.autoRefreshBusy = false;
    }
  }
  K.autoRefreshActivePage = autoRefreshActivePage;

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) autoRefreshActivePage();
  });

  setInterval(autoRefreshActivePage, 200000);
  }
