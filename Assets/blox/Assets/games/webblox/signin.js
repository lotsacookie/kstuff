// Roblox sign-in through Singuloxy (sandstone ProxyFrame + libcurl over wisp), no service worker.
// The login page is shown in a ProxyFrame; the libcurl session keeps the cookies, and every later
// Roblox request (webbloxProxyFetch) goes through that same session.
(() => {
  let frame, bar, pendingSignIn, timer;
  const JAR_KEY = 'proxy_libcurl_jar';
  const AUTH_URL = 'https://users.roblox.com/v1/users/authenticated';
  try {
    localStorage.removeItem('cobalt-cookies');
    if (localStorage.getItem('webblox.launcher.theme') === 'Truffled') {
      localStorage.setItem('webblox.launcher.theme', 'Default');
    }
  } catch {}

  const hasSecurityCookie = () => {
    try { return /ROBLOSECURITY\t[^\s]{20,}/.test(localStorage.getItem(JAR_KEY) || ''); } catch { return false; }
  };
  const proxy = () => window.proxyTransport.start();
  const COOKIE_KEY = 'webblox.roblosecurity';
  const manualCookie = () => { try { return localStorage.getItem(COOKIE_KEY) || ''; } catch { return ''; } };
  const withCookie = headers => { const c = manualCookie(); return c ? { ...headers, cookie: '.ROBLOSECURITY=' + c } : headers; };
  const isSignedIn = async () => {
    try {
      const { libcurl } = await proxy();
      const res = await libcurl.fetch(AUTH_URL, { headers: withCookie({ accept: 'application/json' }) });
      return res.status === 200 && !!JSON.parse(await res.text()).id;
    } catch { return false; }
  };
  const closeFrame = () => {
    clearInterval(timer);
    if (frame) { frame.iframe.remove(); frame = null; }
    if (bar) { bar.remove(); bar = null; }
  };

  window.webbloxProxySignIn = (quiet = false) => {
    if (pendingSignIn) return pendingSignIn;
    const run = (async () => {
      if (await isSignedIn()) return true;
      if (quiet) return false;
      const st = await proxy();
      const { ProxyFrame } = st.sandstone.controller;
      frame = new ProxyFrame();
      frame.iframe.title = 'Sign in with Roblox';
      frame.iframe.className = 'session-prompt';
      frame.iframe.setAttribute('allow', 'autoplay; fullscreen; clipboard-write');
      Object.assign(frame.iframe.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', border: '0', background: '#fff', zIndex: 2147483000 });
      document.body.append(frame.iframe);
      await frame.wait_for_libcurl();
      frame.navigate_to('https://www.roblox.com/login').catch(e => console.warn('[signin] navigate failed', e));
      return new Promise((resolve, reject) => {
        bar = document.createElement('div');
        Object.assign(bar.style, { position: 'fixed', left: '0', right: '0', bottom: '0', zIndex: 2147483001, display: 'flex', gap: '8px', padding: '8px', background: '#111', color: '#fff', font: '13px sans-serif', alignItems: 'center', flexWrap: 'wrap' });
        const label = document.createElement('span');
        label.textContent = 'Puzzle failing? Paste your .ROBLOSECURITY cookie instead:';
        const input = document.createElement('input');
        input.type = 'password'; input.autocomplete = 'off'; input.placeholder = '_|WARNING:-DO-NOT-SHARE-THIS...';
        Object.assign(input.style, { flex: '1', minWidth: '160px', padding: '6px' });
        const go = document.createElement('button');
        go.type = 'button'; go.textContent = 'Use cookie';
        const cancel = document.createElement('button');
        cancel.type = 'button'; cancel.textContent = 'Cancel';
        go.onclick = async () => {
          const value = input.value.trim().replace(/^\.?ROBLOSECURITY=/i, '').replace(/^["']|["';]$/g, '');
          if (!value) return;
          go.disabled = true; label.textContent = 'Checking cookie…';
          try { localStorage.setItem(COOKIE_KEY, value); } catch {}
          if (await isSignedIn()) { input.value = ''; closeFrame(); resolve(true); return; }
          try { localStorage.removeItem(COOKIE_KEY); } catch {}
          go.disabled = false; label.textContent = 'Roblox rejected that cookie. Paste a fresh one:';
        };
        cancel.onclick = () => { closeFrame(); reject(new Error('Sign-in cancelled.')); };
        bar.append(label, input, go, cancel);
        document.body.append(bar);
        const started = Date.now();
        let busy = false;
        timer = setInterval(async () => {
          if (busy) return;
          if (Date.now() - started > 15 * 60000) { closeFrame(); return reject(new Error('Roblox sign-in timed out.')); }
          if (!hasSecurityCookie()) return;
          busy = true;
          try { if (await isSignedIn()) { closeFrame(); resolve(true); } }
          finally { busy = false; }
        }, 2000);
      });
    })();
    pendingSignIn = run.finally(() => { pendingSignIn = null; });
    return pendingSignIn;
  };

  window.webbloxProxyCookie = async raw => {
    const value = String(raw || '').trim().replace(/^\.?ROBLOSECURITY=/i, '').replace(/^["']|["';]$/g, '');
    if (!value) return false;
    try { localStorage.setItem(COOKIE_KEY, value); } catch { return false; }
    if (await isSignedIn()) { closeFrame(); return true; }
    try { localStorage.removeItem(COOKIE_KEY); } catch {}
    return false;
  };

  window.webbloxProxyResume = async () => {
    try { return await window.webbloxProxySignIn(true); } catch { return false; }
  };

  window.webbloxProxyFetch = async (url, init = {}) => {
    if (!(await window.webbloxProxySignIn())) throw new Error('Not signed in to Roblox.');
    const { libcurl } = await proxy();
    const headers = {};
    for (const [k, v] of new Headers(init.headers || {})) {
      if (!['cookie', 'host', 'content-length'].includes(k.toLowerCase())) headers[k] = v;
    }
    let body = init.body ?? undefined;
    if (body instanceof Blob) body = await body.arrayBuffer();
    const method = init.method || 'GET';
    const res = await libcurl.fetch(String(url), { method, headers: withCookie(headers), body, redirect: 'follow' });
    const out = new Headers();
    for (const [k, v] of res.headers.entries()) {
      if (!['set-cookie', 'content-encoding', 'content-length', 'transfer-encoding'].includes(k.toLowerCase())) out.append(k, v);
    }
    const empty = [204, 205, 304].includes(res.status) || method === 'HEAD';
    return new Response(empty ? null : await res.arrayBuffer(), { status: res.status, headers: out });
  };
})();
