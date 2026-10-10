'use strict';
const W = window, D = document, REPO = SG_CFG.repo.toLowerCase(), LIVE = new Set(SG_CFG.live || []);
const MIME = { html: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript', json: 'application/json', svg: 'image/svg+xml', txt: 'text/plain', xml: 'application/xml' };
const ext = p => p.slice(p.lastIndexOf('.') + 1).toLowerCase();
const mime = p => (MIME[ext(p)] || 'text/plain') + ';charset=utf-8';

function norm(u) {
  let a;
  try { a = new URL(u, D.baseURI); } catch { return null; }
  let p;
  try { p = decodeURIComponent(a.pathname); } catch { return null; }
  const h = a.hostname, [o, r] = REPO.split('/');
  let m;
  if (h === 'cdn.jsdelivr.net') {
    m = p.match(/^\/gh\/([^/@]+)\/([^/@]+)(?:@[^/]+)?\/(.*)$/);
  } else if (h === 'raw.githubusercontent.com' || h === 'raw.githack.com' || h === 'cdn.statically.io') {
    m = p.replace(/^\/gh(?=\/)/, '').match(/^\/([^/]+)\/([^/]+)\/(?:refs\/heads\/)?[^/]+\/(.*)$/);
  } else if (a.origin === location.origin) {
    const base = location.pathname.replace(/[^/]*$/, '');
    return p.startsWith(base) ? p.slice(base.length) : p.replace(/^\//, '');
  } else return null;
  return m && m[1].toLowerCase() === o && m[2].toLowerCase() === r ? m[3] : null;
}
const key = p => {
  if (p == null) return null;
  const k = SG_FILES[p] !== undefined ? p : norm(p);
  return k != null && SG_FILES[k] !== undefined && !LIVE.has(k) ? k : null;
};

const blobs = {};
function blobUrl(k) {
  if (blobs[k]) return blobs[k];
  let t = SG_FILES[k];
  if (ext(k) === 'html' && !/<base[\s>]/i.test(t)) {
    const b = `<base href="https://cdn.jsdelivr.net/gh/${SG_CFG.repo}@main/${k.replace(/[^/]*$/, '')}">`;
    t = /<head[^>]*>/i.test(t) ? t.replace(/<head[^>]*>/i, m => m + b) : b + t;
  }
  return (blobs[k] = URL.createObjectURL(new Blob([t], { type: mime(k) })));
}

const realFetch = W.fetch.bind(W);
W.fetch = function (input, init) {
  try {
    const req = typeof Request !== 'undefined' && input instanceof Request ? input : null;
    const method = ((init && init.method) || (req && req.method) || 'GET').toUpperCase();
    if (method === 'GET') {
      const k = key(req ? req.url : String(input));
      if (k) return Promise.resolve(new Response(SG_FILES[k], { status: 200, headers: { 'content-type': mime(k), 'x-singularity': SG_HASH } }));
    }
  } catch {}
  return realFetch(input, init);
};

try {
  const d = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');
  const map = v => { const k = key(v); return k && ext(k) === 'html' ? blobUrl(k) : v; };
  Object.defineProperty(HTMLIFrameElement.prototype, 'src', { configurable: true, enumerable: true, get: d.get, set(v) { d.set.call(this, map(String(v))); } });
  const sa = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (n, v) {
    if (this instanceof HTMLIFrameElement && String(n).toLowerCase() === 'src') v = map(String(v));
    return sa.call(this, n, v);
  };
} catch (e) { console.warn('singularity: iframe patch skipped', e); }

const mods = {};
const sg = {
  hash: SG_HASH,
  files: SG_FILES,
  has: p => !!key(p),
  text: p => { const k = key(p); return k ? SG_FILES[k] : null; },
  json: p => JSON.parse(sg.text(p)),
  url: p => { const k = key(p); return k ? blobUrl(k) : null; },
  module: name => mods[name] || (mods[name] = import(blobUrl(`Assets/js/${name}.js`))),
  start() {
    const P = W.kProgress;
    P && P.say && P.say('Starting');
    const run = t => { const s = D.createElement('script'); s.textContent = t; D.head.appendChild(s); s.remove(); };
    if (SG_FILES['style.css'] != null) {
      const s = D.createElement('style'); s.id = 'sg-style'; s.textContent = SG_FILES['style.css']; D.head.appendChild(s);
    }
    const holiday = SG_FILES['Assets/js/holiday.js'];
    if (holiday && new Date().getMonth() === 9) {
      try { run(holiday); } catch (e) { console.error(e); }
    }
    if (SG_FILES['script.js'] != null) run(SG_FILES['script.js']);
    P && P.tick && (P.tick(), P.tick());
    W.kAssetsPR && W.kAssetsPR(Promise.resolve());
  }
};
W.singularity = sg;
