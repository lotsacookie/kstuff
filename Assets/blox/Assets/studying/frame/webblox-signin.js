(() => {
  const sessionCache = 'webblox-session-v1';
  const sessionKey = new URL(WB_ASSETS + 'studying/webblox-session', location.origin).href;
  window.createWebbloxSessionController = Base => class extends Base {
    async loadSavedCookies() {
      if (!this.webbloxSessionLoading) this.webbloxSessionLoading = (async () => {
        try {
          const cache = await caches.open(sessionCache);
          const saved = await cache.match(sessionKey);
          if (saved) this.cookieJar.load(await saved.text());
        } catch {}
      })();
      await this.webbloxSessionLoading;
    }
    async persistCookies() {
      await this.loadSavedCookies();
      this.webbloxSessionSaving = (this.webbloxSessionSaving || Promise.resolve()).catch(() => {}).then(async () => {
        try {
          const cache = await caches.open(sessionCache);
          await cache.put(sessionKey, new Response(this.cookieJar.dump(), { headers: { 'Content-Type': 'application/json' } }));
        } catch {}
      });
      await this.webbloxSessionSaving;
    }
    async clearSavedSession() {
      await this.webbloxSessionSaving;
      try { await (await caches.open(sessionCache)).delete(sessionKey); } catch {}
    }
    async propagateCookieSync() {}
  };

  window.startWebbloxSignIn = ({ controller, transport }) => {
    let parentPort, signedIn = false, busy = false, stopped = false, loginRequired = false;
    const needLogin = () => {
      if (loginRequired) return;
      loginRequired = true;
      parentPort?.postMessage({ needsSignIn: true });
    };
    const request = async (input, method = 'GET', headers = [], body = null, redirects = 0) => {
      const url = new URL(input);
      if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Unsupported request URL.');
      if (redirects > 10) throw new Error('Too many redirects.');
      const clean = new Headers(headers);
      clean.delete('cookie');
      clean.delete('host');
      clean.delete('content-length');
      const cookies = controller.cookieJar.getCookies(url, false);
      if (cookies) clean.set('cookie', cookies);
      const response = await transport.request(url, method, body, [...clean], AbortSignal.timeout(20000));
      const responseHeaders = [];
      let changed = false;
      for (const [name, value] of response.headers || []) {
        if (name.toLowerCase() === 'set-cookie') { controller.cookieJar.setCookies(value, url); changed = true; }
        else responseHeaders.push([name, value]);
      }
      if (changed) await controller.persistCookies();
      const next = new Headers(responseHeaders).get('location');
      if (next && [301, 302, 303, 307, 308].includes(response.status)) {
        await response.body?.cancel?.();
        const get = response.status === 303 || ([301, 302].includes(response.status) && method === 'POST');
        if (get) { clean.delete('content-type'); body = null; }
        const target = new URL(next, url);
        if (target.origin !== url.origin) clean.delete('authorization');
        return request(target, get && method !== 'HEAD' ? 'GET' : method, [...clean], body, redirects + 1);
      }
      return { status: response.status, headers: responseHeaders, body: await new Response(response.body).arrayBuffer() };
    };
    const connect = event => {
      if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== 'webblox-memory-connect' || !event.ports[0]) return;
      if (parentPort) return;
      parentPort = event.ports[0];
      parentPort.onmessage = async ({ data }) => {
        if (!signedIn || typeof data?.id !== 'number') return;
        try {
          const response = await request(data.url, data.method, data.headers, data.body);
          parentPort.postMessage({ id: data.id, response }, [response.body]);
        } catch {
          parentPort.postMessage({ id: data.id, error: 'The proxy request failed.' });
        }
      };
      if (signedIn) parentPort.postMessage({ signedIn: true });
      else if (loginRequired) parentPort.postMessage({ needsSignIn: true });
    };
    window.addEventListener('message', connect);
    const stop = () => { stopped = true; clearInterval(timer); };
    const check = async () => {
      if (busy || stopped || transport.ready === false) return;
      const url = new URL('https://users.roblox.com/v1/users/authenticated');
      if (!controller.cookieJar.getCookies(url, false)) { needLogin(); return; }
      busy = true;
      try {
        const response = await request(url);
        if (stopped) return;
        if (response.status !== 200) {
          if (response.status === 401) await controller.clearSavedSession?.();
          needLogin();
          return;
        }
        const user = JSON.parse(new TextDecoder().decode(response.body));
        if (!Number.isSafeInteger(user.id) || user.id <= 0) { needLogin(); return; }
        await controller.persistCookies();
        signedIn = true;
        stop();
        parentPort?.postMessage({ signedIn: true });
      } catch { needLogin(); } finally { busy = false; }
    };
    const timer = setInterval(check, 3000);
    window.addEventListener('pagehide', stop, { once: true });
    check();
    return stop;
  };
})();
