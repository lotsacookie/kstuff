export function init(K) {
  document.head.appendChild(K.el('style', { textContent: `i.profile-avatar-container{width:1.2em;height:1.2em;border-radius:50%;overflow:hidden;display:inline-flex;justify-content:center;align-items:center;}i.profile-avatar-container img{width:100%;height:100%;object-fit:cover;}` }));

  const AUTH_ERRORS = {
    invalid: 'Fill out all fields.',
    exists: 'That username is already taken.',
    not_found: 'No account with that username.',
    invalid_password: 'Incorrect password.',
    failed: 'Something went wrong. Please try again.'
  };
  K.AUTH_ERRORS = AUTH_ERRORS;

  const showAuthError = msg => {
    const errEl = K.$('auth-error-msg');
    if (!errEl) return;
    errEl.textContent = msg;
    errEl.style.display = 'block';
  };
  K.showAuthError = showAuthError;

  const setAuthBusy = (busy, label = '', which = '') => {
    clearTimeout(K.authBusyTimer);
    [['login', K.$('do-login-btn')], ['signup', K.$('do-signup-btn')]].forEach(([kind, btn]) => {
      if (!btn) return;
      if (!btn.dataset.label) btn.dataset.label = btn.textContent;
      btn.disabled = busy;
      btn.textContent = busy && kind === which ? label : btn.dataset.label;
    });
    if (busy) {
      K.authBusyTimer = setTimeout(() => {
        setAuthBusy(false);
        settleAuthWatchdog();
        showAuthError('The server took too long to respond. Please try again.');
      }, K.AUTH_TIMEOUT);
    }
  };
  K.setAuthBusy = setAuthBusy;

  const updateAuthUI = () => {
    const btn = K.$('profile-nav-btn'); if (!btn) return;
    const pic = K.currentUser?.profilePicture || K.DEFAULT_PIC;
    if (K.currentUser) {
      if (K.$('profile-modal-pic')) K.$('profile-modal-pic').src = pic;
      if (K.$('profile-modal-username')) K.$('profile-modal-username').textContent = K.currentUser.username || "User";
      if (K.$('profile-modal-desc')) K.$('profile-modal-desc').textContent = K.currentUser.description || "No bio.";
      const newI = K.el('i', { className: 'ph profile-avatar-container', innerHTML: `<img src="${pic}" onerror="this.src='${K.DEFAULT_PIC}'">` });
      btn.querySelector('i')?.replaceWith(newI);
    } else {
      btn.querySelector('i')?.replaceWith(K.el('i', { className: 'ph ph-user', id: 'profile-nav-icon' }));
    }
  };
  K.updateAuthUI = updateAuthUI;

  updateAuthUI();
  if (K.currentUser) K.applyCloudSettings(K.userSettings(K.currentUser));

  [['auth-modal-overlay', 'auth-close-btn'], ['profile-modal-overlay', 'profile-close-btn'], ['changelog-modal', 'changelog-close-btn']]
    .forEach(([mId, bId]) => {
      const m = K.$(mId);
      K.$(bId)?.addEventListener('click', () => m?.classList.remove('active'));
      m?.addEventListener('click', e => e.target === m && m.classList.remove('active'));
    });

  const homeworkModal = K.$('homeworkhelper-modal');
  const closeSettingsModal = () => {
    K.saveSettings();
    homeworkModal?.classList.remove('active');
  };
  K.$('homeworkhelper-close-btn')?.addEventListener('click', closeSettingsModal);
  homeworkModal?.addEventListener('click', e => { if (e.target === homeworkModal) closeSettingsModal(); });

  const authMod = K.$('auth-modal-overlay'), profMod = K.$('profile-modal-overlay');
  K.authMod = authMod;
  K.profMod = profMod;

  const applyBackendUser = (payload, isAuto) => {
    const { password, ...safeUser } = payload;
    const keepLocalSettings = isAuto && K.sessionSettingsUpdated;
    const localSettings = K.currentUser?.settings;
    K.currentUser = safeUser;
    if (keepLocalSettings && localSettings) K.currentUser.settings = localSettings;
    K.setStorage('kstuff_user', JSON.stringify(K.currentUser));
    updateAuthUI();
    if (!keepLocalSettings) K.applyCloudSettings(K.userSettings(K.currentUser));
  };
  K.applyBackendUser = applyBackendUser;

  const flushBackendQueue = () => {
    while (K.backendQueue.length && K.backendLinked && K.backendPort) {
      const message = K.backendQueue.shift();
      try {
        K.backendPort.postMessage(message);
      } catch (err) {
        K.backendQueue.unshift(message);
        break;
      }
    }
  };

  const clearAuthWatchdog = () => {
    clearTimeout(K.authWatchdogTimer);
    K.authWatchdogTimer = null;
  };

  const settleAuthWatchdog = () => {
    K.pendingAuthMessage = null;
    clearAuthWatchdog();
  };

  const armAuthWatchdog = message => {
    clearAuthWatchdog();
    K.pendingAuthMessage = message;
    K.authWatchdogTimer = setTimeout(() => {
      if (!K.pendingAuthMessage) return;
      const retryMessage = K.pendingAuthMessage;
      K.dbg('auth watchdog: no response after', K.AUTH_RECONNECT_AFTER, 'ms, reconnecting backend');
      closeBackendPort();
      if (K.backendFrame) { K.backendFrame.remove(); K.backendFrame = null; }
      K.backendUrlIndex++;
      startBackend();
      if (K.backendQueue.length < 20) K.backendQueue.push(retryMessage);
    }, K.AUTH_RECONNECT_AFTER);
  };

  const handleBackendMessage = data => {
    if (!data || typeof data !== 'object') return;

    K.dbg('received', data.type, data.reason || '');

    if (data.type === 'ready') {
      K.backendReady = true;
      K.backendAttempts = 0;
      flushBackendQueue();
      return;
    }

    if (data.type === 'auto-login') {
      if (data.success && data.payload) applyBackendUser(data.payload, true);
      return;
    }

    if (data.type === 'login' || data.type === 'signup') {
      settleAuthWatchdog();
      setAuthBusy(false);
      if (data.success && data.payload) {
        applyBackendUser(data.payload, false);
        if (K.$('auth-pass')) K.$('auth-pass').value = '';
        authMod?.classList.remove('active');
      } else {
        showAuthError(AUTH_ERRORS[data.reason] || AUTH_ERRORS.failed);
      }
    }
  };

  const closeBackendPort = () => {
    K.backendLinked = false;
    K.backendReady = false;
    if (K.backendPort) {
      K.backendPort.onmessage = null;
      try { K.backendPort.close(); } catch {}
      K.backendPort = null;
    }
  };

  const linkBackend = frame => {
    if (frame !== K.backendFrame) return;

    closeBackendPort();

    const channel = new MessageChannel();
    K.backendPort = channel.port1;
    K.backendPort.onmessage = e => handleBackendMessage(e.data);
    K.backendPort.start();

    try {
      frame.contentWindow.postMessage({ type: 'init_cable' }, '*', [channel.port2]);
    } catch (err) {
      console.error('backend init_cable failed', err);
      closeBackendPort();
      return;
    }

    K.backendLinked = true;
    K.backendAttempts = 0;
    clearTimeout(K.backendLinkTimer);
    K.dbg('linked, init_cable sent, queued messages:', K.backendQueue.length);
    flushBackendQueue();
  };

  const mountBackendFrame = async url => {
    clearTimeout(K.backendLinkTimer);
    closeBackendPort();

    if (K.backendFrame) {
      K.backendFrame.remove();
      K.backendFrame = null;
    }

    const frame = document.createElement('iframe');
    frame.id = 'kstuff-backend-frame';
    frame.title = 'kstuff-backend';
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('hidden', '');
    frame.style.setProperty('display', 'none', 'important');
    frame.addEventListener('load', () => linkBackend(frame));

    K.backendFrame = frame;
    K.body.appendChild(frame);
    K.dbg('iframe created, fetching backend html', url);

    K.backendLinkTimer = setTimeout(() => {
      if (K.backendLinked || frame !== K.backendFrame) return;
      K.dbg('link timeout, trying next backend url');
      K.backendAttempts = Math.min(K.backendAttempts + 1, 6);
      K.backendUrlIndex++;
      startBackend();
    }, K.BACKEND_LINK_TIMEOUT);

    try {
      const html = await K.timedFetch(url, true, K.BACKEND_LINK_TIMEOUT);
      if (frame !== K.backendFrame) return;
      K.dbg('backend html fetched, injecting srcdoc', url);
      frame.srcdoc = html;
    } catch (err) {
      console.error('backend fetch failed', url, err);
      if (frame !== K.backendFrame) return;
      K.dbg('backend fetch failed, trying next backend url');
      clearTimeout(K.backendLinkTimer);
      K.backendAttempts = Math.min(K.backendAttempts + 1, 6);
      K.backendUrlIndex++;
      startBackend();
    }
  };

  function startBackend() {
    mountBackendFrame(K.BACKEND_URLS[K.backendUrlIndex % K.BACKEND_URLS.length]);
  }
  K.startBackend = startBackend;

  function ensureBackend() {
    if (!K.backendFrame || !K.backendFrame.isConnected || !K.backendFrame.contentWindow) {
      closeBackendPort();
      K.backendFrame = null;
      startBackend();
    }
  }
  K.ensureBackend = ensureBackend;

  function sendBackend(message) {
    K.dbg('send', message && message.type, K.backendLinked ? '(linked)' : '(queued)');
    if (K.backendLinked && K.backendPort) {
      try {
        K.backendPort.postMessage(message);
        return true;
      } catch {}
    }
    if (K.backendQueue.length < 20) K.backendQueue.push(message);
    ensureBackend();
    return false;
  }
  K.sendBackend = sendBackend;

  startBackend();
  setInterval(() => { if (!K.isAnyResourceOpen()) ensureBackend(); }, K.BACKEND_WATCHDOG_INTERVAL);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) ensureBackend();
  });

  const handleAuth = t => () => {
    const u = (K.$('auth-user')?.value || '').trim(), p = (K.$('auth-pass')?.value || '').trim();
    if (!u || !p) return showAuthError(AUTH_ERRORS.invalid);
    if (t === 'signup') {
      if (u.length > K.MAX_USERNAME_LENGTH) return showAuthError('Username cannot exceed 20 characters.');
      if (!/^[a-zA-Z0-9_]+$/.test(u)) return showAuthError('Username can only contain letters, numbers, and underscores.');
      if ((u.match(/_/g) || []).length > K.MAX_UNDERSCORES) return showAuthError(`Username can only contain up to ${K.MAX_UNDERSCORES} underscores.`);
    }
    setAuthBusy(true, t === 'signup' ? 'Signing up...' : 'Logging in...', t);
    const message = { type: t, username: u, password: p, ...(t === 'signup' ? { profilePicture: K.DEFAULT_PIC } : {}) };
    armAuthWatchdog(message);
    sendBackend(message);
  };

  K.$('do-login-btn')?.addEventListener('click', handleAuth('login'));
  K.$('do-signup-btn')?.addEventListener('click', handleAuth('signup'));
  ['auth-user', 'auth-pass'].forEach(id => K.$(id)?.addEventListener('input', () => K.$('auth-error-msg') && (K.$('auth-error-msg').style.display = 'none')));

  K.$('do-logout-btn')?.addEventListener('click', () => {
    K.currentUser = null;
    localStorage.removeItem('kstuff_user');
    localStorage.removeItem('neocities_last_user');
    sendBackend({ type: 'logout' });
    updateAuthUI(); profMod?.classList.remove('active');
  });

  const toggleProfEdit = show => {
    if (!K.pContainer) return;
    K.pContainer.style.display = show ? 'flex' : 'none';
    K.pContainer.style.opacity = show ? '1' : '0';
  };
  K.toggleProfEdit = toggleProfEdit;

  K.$('edit-profile-btn')?.addEventListener('click', () => {
    if (K.currentUser) {
      const isHidden = K.pContainer.style.display === 'none' || !K.pContainer.style.display;
      if (isHidden) { K.$('profile-edit-pic-url').value = K.currentUser.profilePicture || ""; K.$('profile-edit-desc').value = K.currentUser.description || ""; }
      toggleProfEdit(isHidden);
    }
  });

  K.$('save-profile-changes-btn')?.addEventListener('click', e => {
    if (!K.currentUser) return;
    const btn = e.target, oT = btn.textContent; btn.textContent = "Saving...";
    K.currentUser.profilePicture = K.$('profile-edit-pic-url').value.trim() || "https://kstuff.neocities.org/assets/default-profile.png";
    K.currentUser.description = K.$('profile-edit-desc').value.trim() || "No bio provided yet.";
    K.setStorage('kstuff_user', JSON.stringify(K.currentUser)); updateAuthUI();
    sendBackend({ type: 'update-settings', username: K.currentUser.username, settings: { profilePicture: K.currentUser.profilePicture, description: K.currentUser.description } });
    setTimeout(() => { btn.textContent = oT; toggleProfEdit(false); }, 600);
  });
}
