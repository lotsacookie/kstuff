(() => {
  let proxyFrame, port, pendingSignIn, finishSignIn, failSignIn, requestId = 0;
  const requests = new Map();
  try {
    localStorage.removeItem('cobalt-cookies');
    if (localStorage.getItem('webblox.launcher.theme') === 'Truffled') {
      localStorage.setItem('webblox.launcher.theme', 'Default');
    }
  } catch {}

  window.webbloxProxySignIn = (quiet = false) => {
    if (pendingSignIn) return pendingSignIn;
    pendingSignIn = new Promise((resolve, reject) => { finishSignIn = resolve; failSignIn = reject; });
    proxyFrame = document.createElement('iframe');
    proxyFrame.title = 'Sign in with Roblox';
    if (quiet) proxyFrame.hidden = true;
    else proxyFrame.className = 'session-prompt';
    proxyFrame.setAttribute('width', '100%');
    proxyFrame.setAttribute('height', '100%');
    proxyFrame.setAttribute('frameborder', '0');
    const url = new URL(WB_ASSETS + 'studying/frame/index.html', location.origin);
    url.searchParams.set('mode', 'webblox-signin');
    url.searchParams.set('transport', window.proxyTransport?.getTransport() || 'epoxy');
    const relay = window.COBALT_WISP_URLS?.[0];
    if (relay) url.searchParams.set('wisp', relay);
    const onReady = event => {
      if (event.origin !== location.origin || event.source !== proxyFrame.contentWindow) return;
      if (event.data?.type === 'studying-bridge-error') {
        window.removeEventListener('message', onReady);
        proxyFrame.remove();
        pendingSignIn = null;
        failSignIn(new Error('Could not start Roblox sign-in. Try again.'));
        return;
      }
      if (event.data?.type !== 'studying-bridge-ready') return;
      window.removeEventListener('message', onReady);
      const channel = new MessageChannel();
      port = channel.port1;
      port.onmessage = ({ data }) => {
        if (data.needsSignIn && quiet) {
          proxyFrame.remove();
          port.close();
          pendingSignIn = null;
          finishSignIn(false);
          return;
        }
        if (data.signedIn) {
          proxyFrame.removeAttribute('class');
          proxyFrame.hidden = true;
          finishSignIn(true);
          return;
        }
        const waiting = requests.get(data.id);
        if (!waiting) return;
        requests.delete(data.id);
        clearTimeout(waiting.timeout);
        if (data.error) waiting.reject(new Error(data.error));
        else {
          const empty = [204, 205, 304].includes(data.response.status) || waiting.method === 'HEAD';
          waiting.resolve(new Response(empty ? null : data.response.body, { status: data.response.status, headers: data.response.headers }));
        }
      };
      proxyFrame.contentWindow.postMessage({ type: 'webblox-memory-connect' }, location.origin, [channel.port2]);
    };
    window.addEventListener('message', onReady);
    proxyFrame.src = url.href;
    document.body.append(proxyFrame);
    return pendingSignIn;
  };
  window.webbloxProxyResume = async () => {
    try {
      const cache = await caches.open('webblox-session-v1');
      if (!await cache.match(new URL(WB_ASSETS + 'studying/webblox-session', location.origin).href)) return false;
      return await window.webbloxProxySignIn(true);
    } catch { return false; }
  };
  window.webbloxProxyFetch = async (url, init = {}) => {
    await window.webbloxProxySignIn();
    const id = ++requestId;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { requests.delete(id); reject(new Error('The Roblox request timed out.')); }, 30000);
      requests.set(id, { resolve, reject, timeout, method: init.method || 'GET' });
      port.postMessage({ id, url: String(url), method: init.method || 'GET', headers: [...new Headers(init.headers || {})], body: init.body ?? null });
    });
  };

})();
