(() => {
  if (window.CobaltIframe && window.proxyTransport) {
    window.CobaltIframe.transport = window.proxyTransport.getTransport();
  }
  const ROBLOX_HOST = /(^|\.)(roblox\.com|rbxcdn\.com|robloxlabs\.com)$/;
  const SKIP_RESPONSE_HEADERS = new Set([
    'content-encoding', 'content-length', 'transfer-encoding', 'connection', 'keep-alive', 'set-cookie',
    'access-control-allow-origin', 'access-control-allow-credentials', 'access-control-allow-headers',
    'access-control-allow-methods', 'access-control-expose-headers', 'cross-origin-opener-policy',
    'cross-origin-embedder-policy', 'cross-origin-resource-policy', 'strict-transport-security',
  ]);

  const MARK = '<svg viewBox="157 157 710 710" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M307.201 157.281L157.281 716.799L716.799 866.719L866.719 307.201L307.201 157.281ZM569.242 611.157L412.893 569.242L454.807 412.893L611.219 454.807L569.242 611.157Z"/></svg>';

  const askForSession = expired => new Promise(resolve => {
    const root = document.createElement('div');
    root.className = 'session-prompt';
    root.innerHTML =
      '<header class="session-top"><div class="session-logo" role="img" aria-label="WebBlox">' + MARK + '</div></header>' +
      '<div class="session-body">' +
        '<h1 id="session-title">' + (expired ? 'Sign in again' : 'Play WebBlox') + '</h1>' +
        '<p class="session-text">Sign in with Roblox to play.</p>' +
        '<button class="session-submit" type="button">Sign in with Roblox</button>' +
        '<p class="session-text">Or paste your .ROBLOSECURITY cookie:</p>' +
        '<input class="session-cookie" type="password" autocomplete="off" spellcheck="false" placeholder="_|WARNING:-DO-NOT-SHARE-THIS..." style="width:100%;box-sizing:border-box;padding:10px;margin-bottom:8px">' +
        '<button class="session-submit session-cookie-submit" type="button">Use cookie</button>' +
        '<p class="session-error" role="alert"></p>' +
      '</div>';
    const open = root.querySelector('button');
    const error = root.querySelector('.session-error');
    open.onclick = async () => {
      if (open.disabled) return;
      open.disabled = true;
      error.textContent = '';
      try {
        if (!window.webbloxProxySignIn) throw new Error('Reload WebBlox to load Roblox sign-in.');
        await window.webbloxProxySignIn();
        root.remove();
        resolve();
      } catch (err) {
        error.textContent = err.message || 'Roblox sign-in failed. Try again.';
        open.disabled = false;
      }
    };
    const cookieInput = root.querySelector('.session-cookie');
    const cookieButton = root.querySelector('.session-cookie-submit');
    cookieButton.onclick = async () => {
      if (cookieButton.disabled || !cookieInput.value.trim()) return;
      cookieButton.disabled = true;
      error.textContent = '';
      try {
        if (!window.webbloxProxyCookie) throw new Error('Reload WebBlox to load Roblox sign-in.');
        if (!await window.webbloxProxyCookie(cookieInput.value)) throw new Error('Roblox rejected that cookie. Paste a fresh one.');
        cookieInput.value = '';
        root.remove();
        resolve();
      } catch (err) {
        error.textContent = err.message || 'Could not use that cookie.';
        cookieButton.disabled = false;
      }
    };
    const mount = () => {
      document.body.appendChild(root);
      open.focus();
    };
    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/launcher/session.css';
    sheet.onload = sheet.onerror = () => document.body ? mount() : addEventListener('DOMContentLoaded', mount, { once: true });
    document.head.appendChild(sheet);
  });

  const sessionReady = (async () => {
    if (window.webbloxProxyResume && await window.webbloxProxyResume()) return;
    await askForSession(false);
  })();

  window.webbloxSessionReady = sessionReady;

  const spoofNativeUa = headers => {
    const copy = { ...headers };
    if (copy['rbx-user-agent']) {
      copy['rbx-user-agent'] = copy['rbx-user-agent']
        .replace(/Roblox\/Web\s+\w+\s+Desktop/, 'Roblox/WinInet')
        .replace(/\s*Browser\/\S+/, '');
    }
    return copy;
  };

  const cache = new Map();
  const CACHE_LIMIT = 512 * 1024 * 1024;
  const ENTRY_LIMIT = 64 * 1024 * 1024;
  let cacheBytes = 0;
  const CACHEABLE_HOST = /(^|\.)(rbxcdn\.com|assetdelivery\.roblox\.com|contentdelivery\.roblox\.com|thumbnails\.roblox\.com|assetgame\.roblox\.com|clientsettingscdn\.roblox\.com|clientsettings\.roblox\.com|users\.roblox\.com)$/i;

  async function cacheKey(method, url, body) {
    const u = new URL(url);
    if (!CACHEABLE_HOST.test(u.hostname)) return null;
    if (method === 'GET' && ASSET_HOST.test(u.hostname)) return null;
    if (method === 'GET' || method === 'HEAD') return `G ${url}`;
    if (method === 'POST' && (/\/v1\/assets\/batch$/.test(u.pathname) || /\/v1\/users$/.test(u.pathname))) {
      const digest = await crypto.subtle.digest('SHA-1', body || new ArrayBuffer(0));
      return `P ${url} ${[...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')}`;
    }
    return null;
  }

  function cacheTtl(method, headers) {
    const cc = headers.get('cache-control') || '';
    const m = cc.match(/max-age=(\d+)/i);
    if (m) return Math.min(Number(m[1]), 30 * 24 * 3600) * 1000;
    if (/no-store/i.test(cc)) return 0;
    if (method === 'POST') return 10 * 60 * 1000;
    if (/no-cache/i.test(cc)) return 60 * 1000;
    return 60 * 60 * 1000;
  }

  function cacheGet(key) {
    const hit = cache.get(key);
    if (!hit) return null;
    if (hit.expires <= Date.now()) { cache.delete(key); cacheBytes -= hit.body.byteLength; return null; }
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }

  function cacheSet(key, entry, ttl) {
    if (!ttl || entry.status !== 200 || entry.body.byteLength > ENTRY_LIMIT) return;
    if (cache.has(key)) { cacheBytes -= cache.get(key).body.byteLength; cache.delete(key); }
    cache.set(key, { ...entry, expires: Date.now() + ttl });
    cacheBytes += entry.body.byteLength;
    while (cacheBytes > CACHE_LIMIT && cache.size > 1) {
      const [k, v] = cache.entries().next().value;
      cache.delete(k);
      cacheBytes -= v.body.byteLength;
    }
  }

  const ASSET_CACHE = 'webblox-assets-2';
  const ASSET_HOST = /(^|\.)rbxcdn\.com$/i;
  const ASSET_MAX_AGE = 7 * 24 * 3600 * 1000;
  const ASSET_ENTRIES = 5000;
  const PREFETCH_CONCURRENCY = 16;
  let assetCache = null;
  let assetWrites = 0;
  const openAssets = () => (assetCache ??= caches.open(ASSET_CACHE));
  const isAsset = (method, target, headers) => method === 'GET' && ASSET_HOST.test(target.hostname) && !headers.range;
  const assetKey = href => {
    const m = new URL(href).pathname.match(/\/([0-9a-f]{32})$/i);
    return m ? `https://rbxcdn.webblox/${m[1].toLowerCase()}` : href;
  };

  function responseHeaders(headers) {
    const out = [];
    for (const [k, v] of headers) if (!SKIP_RESPONSE_HEADERS.has(k)) out.push([k, v]);
    return out;
  }

  async function storeAsset(href, r, resHeaders) {
    const key = assetKey(href);
    const ttl = key !== href ? ASSET_MAX_AGE : Math.min(cacheTtl('GET', r.headers), ASSET_MAX_AGE);
    if (r.status !== 200 || !ttl || r.body.byteLength > ENTRY_LIMIT) return;
    const body = r.body.slice(0);
    try {
      const cache = await openAssets();
      await cache.put(key, new Response(body, { status: 200, headers: [...resHeaders, ['x-webblox-expires', String(Date.now() + ttl)]] }));
      if (++assetWrites % 250 === 0) {
        const keys = await cache.keys();
        for (const req of keys.slice(0, Math.max(0, keys.length - ASSET_ENTRIES))) cache.delete(req);
      }
    } catch {}
  }

  async function cachedAsset(key) {
    try {
      const hit = await (await openAssets()).match(key);
      if (!hit || !(Number(hit.headers.get('x-webblox-expires')) > Date.now())) return null;
      return { status: hit.status, statusText: hit.statusText, headers: [...hit.headers], body: await hit.arrayBuffer() };
    } catch {
      return null;
    }
  }

  const prefetchQueue = [];
  const prefetchJobs = new Map();
  let prefetchActive = 0;

  function prefetchLocations(list) {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      if (!item || typeof item !== 'object') continue;
      const urls = [];
      if (typeof item.location === 'string') urls.push(item.location);
      if (Array.isArray(item.locations)) {
        for (const loc of item.locations) if (loc && typeof loc.location === 'string') urls.push(loc.location);
      }
      for (const href of urls) {
        let host;
        try { host = new URL(href).hostname; } catch { continue; }
        const key = assetKey(href);
        if (!ASSET_HOST.test(host) || prefetchJobs.has(key)) continue;
        const job = { href, key, started: false };
        job.promise = new Promise(resolve => { job.resolve = resolve; });
        prefetchJobs.set(key, job);
        prefetchQueue.push(job);
      }
    }
    pumpPrefetch();
  }

  async function prefetchJob(job) {
    try {
      const hit = await cachedAsset(job.key);
      if (hit) return hit;
      const r = await wisp(job.href, { method: 'GET', headers: {} });
      const resHeaders = responseHeaders(r.headers);
      await storeAsset(job.href, r, resHeaders);
      return { status: r.status, statusText: r.statusText, headers: resHeaders, body: r.body };
    } catch {
      return null;
    }
  }

  function runPrefetch(job) {
    job.started = true;
    prefetchActive++;
    prefetchJob(job).then(job.resolve).finally(() => {
      prefetchActive--;
      prefetchJobs.delete(job.key);
      pumpPrefetch();
    });
  }

  function pumpPrefetch() {
    while (prefetchActive < PREFETCH_CONCURRENCY && prefetchQueue.length) {
      const job = prefetchQueue.shift();
      if (!job.started) runPrefetch(job);
    }
  }

  async function localAsset(href) {
    const key = assetKey(href);
    const job = prefetchJobs.get(key);
    if (!job) return cachedAsset(key);
    if (!job.started) runPrefetch(job);
    const r = await job.promise;
    return r && { status: r.status, statusText: r.statusText, headers: r.headers, body: r.body.slice(0) };
  }

  function qdmuxFqdn(joinScript) {
    const udmux = joinScript.UdmuxEndpoints && joinScript.UdmuxEndpoints[0];
    const nst = String(joinScript.NetStackTokenValue || '');
    if (!udmux || !nst || !joinScript.MachineAddress || !joinScript.NetStackPort) return null;
    let token = nst.toLowerCase();
    if (!/^[0-9a-f]{32}$/.test(token)) {
      try { token = [...atob(nst)].map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(''); } catch { return null; }
    }
    if (token.length !== 32) return null;
    const octets = udmux.Address.split('.').map(Number);
    if (octets.length !== 4 || octets.some(n => !(n >= 0 && n <= 255))) return null;
    octets[3] += 1;
    const hex = list => list.map(n => n.toString(16).padStart(2, '0')).join('');
    const machine = joinScript.MachineAddress.split('.').map(Number);
    return `${token}-${hex(machine)}-${Number(joinScript.NetStackPort).toString(16)}.${hex(octets)}.qdmux.roblox.com`;
  }

  async function wisp(url, init) {
    const r = await window.webbloxProxyFetch(url, { ...init, redirect: 'follow' });
    return { status: r.status, statusText: r.statusText, headers: r.headers, body: await r.arrayBuffer() };
  }

  const LAUNCHER_JOIN = /(?:^|;\s*)launcher_join=(\d+):([gp]):([A-Za-z0-9-]+)/;

  function launcherJoin(url, body) {
    const match = /\/v1\/join-game$/.test(url) && LAUNCHER_JOIN.exec(document.cookie);
    if (!match) return { url, body };
    try {
      const parsed = JSON.parse(new TextDecoder().decode(body));
      if (String(parsed.placeId) !== match[1] || parsed.isTeleport) return { url, body };
      const server = match[2] === 'g' ? { gameId: match[3] } : { accessCode: match[3] };
      return {
        url: url.replace(/\/join-game$/, match[2] === 'g' ? '/join-game-instance' : '/join-private-game'),
        body: new TextEncoder().encode(JSON.stringify({ ...parsed, ...server })).buffer,
      };
    } catch {
      return { url, body };
    }
  }

  async function handleGameJoin(url, method, headers, body) {
    ({ url, body } = launcherJoin(url, body));
    const r = await wisp(url, { method, headers: spoofNativeUa(headers), body });
    let json = null;
    try { json = JSON.parse(new TextDecoder().decode(r.body)); } catch {}
    console.log('[gamejoin]', url, r.status, JSON.stringify({
      status: json && json.status,
      message: json && json.message,
      hasJoinScript: !!(json && json.joinScript),
    }));
    if (r.status === 200 && json && json.joinScript && !json.joinScript.gameFqdn) {
      const fqdn = qdmuxFqdn(json.joinScript);
      if (fqdn) {
        json.joinScript.gameFqdn = fqdn;
        r.body = new TextEncoder().encode(JSON.stringify(json)).buffer;
      }
    }
    return r;
  }

  const APP_POLICY_URL = /^https:\/\/apis\.roblox\.com\/guac-v2\/v1\/bundles\/app-policy(?:[?#]|$)/;
  const APP_POLICY_OVERRIDES = { EnableWebViewSupport: true };
  function patchAppPolicy(r) {
    try {
      const policy = JSON.parse(new TextDecoder().decode(r.body));
      if (!policy || typeof policy !== 'object' || Array.isArray(policy)) return r;
      Object.assign(policy, APP_POLICY_OVERRIDES);
      return { ...r, body: new TextEncoder().encode(JSON.stringify(policy)).buffer };
    } catch {
      return r;
    }
  }

  async function upstream({ url, method, headers, body }) {
    await sessionReady;
    const target = new URL(url);
    headers = { ...headers };
    delete headers.cookie;
    delete headers['content-length'];
    delete headers.referer;
    delete headers.origin;
    const isRoblox = ROBLOX_HOST.test(target.hostname);
    if (isRoblox) {
      headers.origin = 'https://www.roblox.com';
      headers.referer = 'https://www.roblox.com/';
      Object.assign(headers, spoofNativeUa(headers));
    } else {
      headers.origin = target.origin;
      headers.referer = target.origin + '/';
    }
    if (body && !body.byteLength) body = null;

    const asset = isAsset(method, target, headers);
    if (asset) {
      const ready = await localAsset(url);
      if (ready) return ready;
    }

    const key = await cacheKey(method, url, body);
    if (key) {
      const hit = cacheGet(key);
      if (hit) return { status: hit.status, statusText: hit.statusText, headers: hit.headers, body: hit.body.slice(0) };
    }

    let r = (isRoblox && target.hostname === 'gamejoin.roblox.com' && method === 'POST')
      ? await handleGameJoin(url, method, headers, body)
      : await wisp(url, { method, headers, body });
    if (r.status === 200 && APP_POLICY_URL.test(url)) r = patchAppPolicy(r);

    const resHeaders = responseHeaders(r.headers);
    if (asset) storeAsset(url, r, resHeaders);
    if (r.status === 200 && method === 'POST' && /\/v1\/assets\/batch$/.test(target.pathname)) {
      try { prefetchLocations(JSON.parse(new TextDecoder().decode(r.body))); } catch {}
    }
    if (r.status >= 400) console.log(`[proxy] → ${r.status} ${method} ${target.hostname}${target.pathname}`);

    if (key) {
      let ttl = cacheTtl(method, r.headers);
      if (/\/v1\/(assets\/batch|users)$/.test(target.pathname) &&
          new TextDecoder().decode(r.body).includes('"errors"')) ttl = Math.min(ttl, 60 * 1000);
      cacheSet(key, { status: r.status, statusText: r.statusText, headers: resHeaders, body: r.body.slice(0) }, ttl);
    }
    return { status: r.status, statusText: r.statusText, headers: resHeaders, body: r.body };
  }

  if (window.__webbloxSetUpstream) window.__webbloxSetUpstream(upstream);
  else navigator.serviceWorker.addEventListener('message', async event => {
    const msg = event.data;
    if (!msg || msg.type !== 'webblox-fetch') return;
    const port = event.ports[0];
    try {
      const r = await upstream(msg);
      port.postMessage({ ok: true, ...r }, [r.body]);
    } catch (err) {
      console.error('[proxy]', msg.method, msg.url, '-', err.message || err);
      port.postMessage({ ok: false, error: String(err.message || err) });
    }
  });
  if (!window.__webbloxSetUpstream) navigator.serviceWorker.startMessages();
})();
