export function init(K) {
  const btn = document.getElementById('study-cookies-btn');
  if (!btn || btn.__sgCookies) return;
  btn.__sgCookies = true;

  const STORE_KEY = 'proxy_cookie_storage';

  const style = document.createElement('style');
  style.textContent = `
.sg-cookies{position:fixed;right:14px;bottom:14px;width:min(680px,calc(100vw - 28px));height:min(62vh,560px);z-index:2000;display:none;flex-direction:column;background:var(--card-bg,#111);color:var(--text-color,#fff);border:1px solid var(--hairline,rgba(255,255,255,.15));border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.45);overflow:hidden}
.sg-cookies.open{display:flex}
.sg-cookies-head{display:flex;align-items:center;gap:8px;padding:9px 10px;border-bottom:1px solid var(--hairline,rgba(255,255,255,.15));flex-shrink:0;flex-wrap:wrap}
.sg-cookies-title{font-weight:800;letter-spacing:.04em;font-size:.85rem;margin-right:auto}
.sg-cookies-count{opacity:.55;font-size:.75rem;font-variant-numeric:tabular-nums}
.sg-cookies-btn,.sg-cookies-scope{background:var(--card-bg,#111);color:var(--text-color,#fff);border:1px solid var(--hairline,rgba(255,255,255,.15));border-radius:10px;padding:5px 10px;font:inherit;font-size:.75rem;font-weight:700;cursor:pointer;transition:all .15s ease}
.sg-cookies-btn:hover,.sg-cookies-scope:hover{background-color:var(--tint-strong,rgba(255,255,255,.1));border-color:var(--ring,rgba(255,255,255,.35))}
.sg-cookies-site{padding:6px 10px;font-size:.75rem;opacity:.65;border-bottom:1px solid var(--hairline,rgba(255,255,255,.15));word-break:break-all;flex-shrink:0}
.sg-cookies-body{flex:1;overflow:auto;padding:6px 10px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.45;user-select:text;-webkit-user-select:text}
.sg-cookies-origin{font-weight:800;margin:10px 0 4px;word-break:break-all}
.sg-cookies-row{display:grid;grid-template-columns:minmax(80px,28%) 1fr;gap:2px 10px;padding:6px 0;border-bottom:1px solid color-mix(in srgb,var(--text-color,#fff) 7%,transparent)}
.sg-cookies-name{font-weight:700;word-break:break-all}
.sg-cookies-value{word-break:break-all;white-space:pre-wrap;user-select:text;-webkit-user-select:text}
.sg-cookies-meta{grid-column:2;opacity:.55;font-size:.72rem}
.sg-cookies-flag{display:inline-block;margin-right:6px;padding:0 6px;border-radius:6px;border:1px solid var(--hairline,rgba(255,255,255,.25));font-size:.68rem;font-weight:700;opacity:.9}
.sg-cookies-empty{opacity:.55;padding:12px 2px}
`;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.className = 'sg-cookies';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Cookies');
  panel.innerHTML = '<div class="sg-cookies-head"><span class="sg-cookies-title">Cookies</span><span class="sg-cookies-count"></span><select class="sg-cookies-scope" aria-label="Scope"><option value="site">This site</option><option value="all">All sites</option></select><button type="button" class="sg-cookies-btn" data-act="refresh">Refresh</button><button type="button" class="sg-cookies-btn" data-act="copy">Copy</button><button type="button" class="sg-cookies-btn" data-act="json">Copy JSON</button><button type="button" class="sg-cookies-btn" data-act="close">Close</button></div><div class="sg-cookies-site"></div><div class="sg-cookies-body"></div>';
  document.body.appendChild(panel);

  const body = panel.querySelector('.sg-cookies-body');
  const count = panel.querySelector('.sg-cookies-count');
  const scope = panel.querySelector('.sg-cookies-scope');
  const siteEl = panel.querySelector('.sg-cookies-site');

  const readStore = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch {
      return {};
    }
  };

  const currentOrigin = () => {
    const v = (K.tbInput ? K.tbInput.value : '').trim();
    if (!/^https?:\/\//i.test(v)) return '';
    try { return new URL(v).origin; } catch { return ''; }
  };

  const normalize = entries => {
    const out = [];
    const now = Date.now();
    (Array.isArray(entries) ? entries : []).forEach(pair => {
      if (!Array.isArray(pair) || typeof pair[0] !== 'string') return;
      const e = pair[1] && typeof pair[1] === 'object' ? pair[1] : { value: String(pair[1] ?? '') };
      if (e.expires !== null && e.expires !== undefined && Number(e.expires) <= now) return;
      out.push({
        name: pair[0],
        value: String(e.value ?? ''),
        expires: e.expires === null || e.expires === undefined ? null : Number(e.expires),
        httpOnly: !!e.http_only
      });
    });
    return out;
  };

  const collect = () => {
    const store = readStore();
    const origin = currentOrigin();
    const groups = [];
    if (scope.value === 'all') {
      Object.keys(store).sort().forEach(o => {
        const list = normalize(store[o]);
        if (list.length) groups.push({ origin: o, cookies: list });
      });
    } else if (origin) {
      groups.push({ origin, cookies: normalize(store[origin]) });
    }
    return { origin, groups };
  };

  const fmtExpiry = t => t === null ? 'Session' : new Date(t).toLocaleString();

  const render = () => {
    const { origin, groups } = collect();
    siteEl.textContent = scope.value === 'all' ? 'Every proxied site with saved cookies' : (origin || 'Open a proxied page to see its cookies');
    body.textContent = '';
    const total = groups.reduce((n, g) => n + g.cookies.length, 0);
    count.textContent = total + (total === 1 ? ' cookie' : ' cookies');
    if (!total) {
      const empty = document.createElement('div');
      empty.className = 'sg-cookies-empty';
      empty.textContent = scope.value === 'all' || origin ? 'No cookies saved yet.' : 'No proxied page is open.';
      body.appendChild(empty);
      return;
    }
    const frag = document.createDocumentFragment();
    groups.forEach(g => {
      if (scope.value === 'all') {
        const h = document.createElement('div');
        h.className = 'sg-cookies-origin';
        h.textContent = g.origin;
        frag.appendChild(h);
      }
      g.cookies.forEach(c => {
        const row = document.createElement('div');
        row.className = 'sg-cookies-row';
        const name = document.createElement('span');
        name.className = 'sg-cookies-name';
        name.textContent = c.name;
        const value = document.createElement('span');
        value.className = 'sg-cookies-value';
        value.textContent = c.value;
        const meta = document.createElement('span');
        meta.className = 'sg-cookies-meta';
        if (c.httpOnly) {
          const flag = document.createElement('span');
          flag.className = 'sg-cookies-flag';
          flag.textContent = 'HttpOnly';
          meta.appendChild(flag);
        }
        meta.appendChild(document.createTextNode('Expires: ' + fmtExpiry(c.expires)));
        row.appendChild(name);
        row.appendChild(value);
        row.appendChild(meta);
        frag.appendChild(row);
      });
    });
    body.appendChild(frag);
  };

  const copyText = async text => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch {
        return false;
      }
    }
  };

  const setOpen = open => {
    panel.classList.toggle('open', open);
    btn.classList.toggle('is-on', open);
    btn.setAttribute('aria-pressed', open ? 'true' : 'false');
    if (open) render();
  };

  btn.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  scope.addEventListener('change', render);
  window.addEventListener('storage', e => {
    if (e.key === STORE_KEY && panel.classList.contains('open')) render();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) setOpen(false);
  });

  panel.addEventListener('click', async e => {
    const target = e.target.closest('[data-act]');
    const act = target?.dataset.act;
    if (!act) return;
    if (act === 'close') { setOpen(false); return; }
    if (act === 'refresh') { render(); return; }
    const { groups } = collect();
    const flat = groups.flatMap(g => g.cookies);
    const text = act === 'json'
      ? JSON.stringify(groups.map(g => ({ origin: g.origin, cookies: g.cookies })), null, 2)
      : flat.map(c => c.name + '=' + c.value).join('; ');
    const ok = await copyText(text);
    const old = target.textContent;
    target.textContent = ok ? 'Copied' : 'Copy failed';
    setTimeout(() => { target.textContent = old; }, 1200);
  });
}
