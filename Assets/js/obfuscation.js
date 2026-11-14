export function init() {
  if (window.__kObf) return;
  try { if (localStorage.getItem('kstuff_obf') === 'off') return; } catch {}
  const cfg = Object.assign({ classes: true, text: true, keep: [/^ph(-|$)/], textSkip: '' }, window.kObfConfig || {});
  try { Object.defineProperty(window, '__kObf', { value: true }); } catch {}

  const cyrb = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };
  let salt;
  try {
    salt = localStorage.getItem('kstuff_obf_salt');
    if (!salt) {
      salt = Array.from(crypto.getRandomValues(new Uint32Array(3)), x => x.toString(36)).join('');
      localStorage.setItem('kstuff_obf_salt', salt);
    }
  } catch { salt = Math.random().toString(36).slice(2) + Date.now().toString(36); }

  const f2h = new Map(), h2f = new Map();
  const mk = name => {
    let h = f2h.get(name);
    if (h !== undefined) return h;
    if (h2f.has(name)) return name;
    if (cfg.keep.some(re => re.test(name))) { f2h.set(name, name); return name; }
    for (let i = 0; ; i++) {
      h = '_' + cyrb(salt + name + (i ? '#' + i : '')).toString(36);
      if (!h2f.has(h) && !f2h.has(h)) break;
    }
    f2h.set(name, h); h2f.set(h, name);
    return h;
  };
  const rev = t => { const o = h2f.get(t); return o === undefined ? t : o; };
  const fwdStr = s => String(s).replace(/\S+/g, mk);
  const revStr = s => String(s).replace(/\S+/g, rev);
  const ft = t => { t = String(t); return t && !/\s/.test(t) ? mk(t) : t; };

  const IDENT = /(?:[\w-]|[^\x00-\x7f]|\\(?:[0-9a-fA-F]{1,6}\s?|[^\n]))+/y;
  const unesc = s => s.replace(/\\([0-9a-fA-F]{1,6})\s?|\\([^\n])/g, (a, hex, c) => {
    if (!hex) return c;
    try { return String.fromCodePoint(parseInt(hex, 16)); } catch { return '\ufffd'; }
  });
  function rewriteSel(s, mode) {
    let out = '', i = 0;
    const n = s.length;
    while (i < n) {
      const ch = s[i];
      if (ch === '\\') { out += s.substr(i, 2); i += 2; continue; }
      if (ch === '"' || ch === "'") {
        let j = i + 1;
        while (j < n && s[j] !== ch) { if (s[j] === '\\') j++; j++; }
        out += s.slice(i, j + 1); i = j + 1; continue;
      }
      if (ch === '[') {
        let j = i + 1;
        while (j < n && s[j] !== ']') {
          if (s[j] === '"' || s[j] === "'") { const q = s[j]; j++; while (j < n && s[j] !== q) { if (s[j] === '\\') j++; j++; } }
          else if (s[j] === '\\') j++;
          j++;
        }
        out += s.slice(i, j + 1); i = j + 1; continue;
      }
      if (ch === '.') {
        IDENT.lastIndex = i + 1;
        const m = IDENT.exec(s);
        if (m && /^(?:-?[A-Za-z_]|[^\x00-\x7f]|\\)/.test(m[0])) {
          const name = unesc(m[0]), h = mk(name);
          if (h === name) out += '.' + m[0];
          else out += mode === 'css' ? '.' + h : ':is(.' + m[0] + ',.' + h + ')';
          i += 1 + m[0].length; continue;
        }
      }
      out += ch; i++;
    }
    return out;
  }
  const selCache = new Map();
  const selTr = sel => {
    if (typeof sel !== 'string' || sel.indexOf('.') < 0) return sel;
    let c = selCache.get(sel);
    if (c === undefined) {
      c = rewriteSel(sel, 'q');
      if (selCache.size > 3000) selCache.clear();
      selCache.set(sel, c);
    }
    return c;
  };

  const E = Element.prototype, D = Document.prototype, F = DocumentFragment.prototype, N = Node.prototype, T = DOMTokenList.prototype;
  const desc = (o, k) => Object.getOwnPropertyDescriptor(o, k);
  const def = (o, k, d) => { try { Object.defineProperty(o, k, d); } catch {} };
  const natGet = E.getAttribute, natSet = E.setAttribute, natQSA = E.querySelectorAll, natQS = E.querySelector, natClosest = E.closest;

  function procRule(r) {
    try {
      if (r.selectorText !== undefined) {
        const s = r.selectorText;
        if (s && s.indexOf('.') >= 0) { const t = rewriteSel(s, 'css'); if (t !== s) r.selectorText = t; }
      }
      if (r.styleSheet) procSheet(r.styleSheet);
      if (r.cssRules && r.cssRules.length && r.type !== 7) procRules(r.cssRules);
    } catch {}
  }
  function procRules(list) { for (let i = 0; i < list.length; i++) procRule(list[i]); }
  function procSheet(sh) { if (!sh) return; try { procRules(sh.cssRules); } catch {} }

  if (cfg.classes) {
    for (const P of [typeof CSSStyleSheet !== 'undefined' && CSSStyleSheet.prototype, typeof CSSGroupingRule !== 'undefined' && CSSGroupingRule.prototype]) {
      if (!P || typeof P.insertRule !== 'function') continue;
      const o = P.insertRule;
      P.insertRule = function (text, index) {
        const i = o.call(this, text, index);
        try { procRule(this.cssRules[i === undefined ? 0 : i]); } catch {}
        return i;
      };
    }
    if (typeof CSSStyleSheet !== 'undefined') {
      const S = CSSStyleSheet.prototype;
      if (typeof S.replaceSync === 'function') { const o = S.replaceSync; S.replaceSync = function (t) { const r = o.call(this, t); procSheet(this); return r; }; }
      if (typeof S.replace === 'function') { const o = S.replace; S.replace = function (t) { return o.call(this, t).then(s => { procSheet(s); return s; }); }; }
    }
  }

  const seen = new WeakSet();
  function convEl(el) {
    const v = natGet.call(el, 'class');
    if (!v) return;
    const t = fwdStr(v);
    if (t !== v) natSet.call(el, 'class', t);
  }
  function convTree(root) {
    if (!root) return;
    if (root.nodeType === 1) convEl(root);
    if (root.querySelectorAll) {
      const l = natQSA.call(root, '[class]');
      for (let i = 0; i < l.length; i++) convEl(l[i]);
    }
  }
  function convTemplates(root) {
    const l = natQSA.call(root, 'template');
    for (let i = 0; i < l.length; i++) { convTree(l[i].content); convTemplates(l[i].content); }
  }

  if (cfg.classes) {
    E.getAttribute = function (name) {
      const v = natGet.call(this, name);
      return v !== null && typeof name === 'string' && name.length === 5 && name.toLowerCase() === 'class' ? revStr(v) : v;
    };
    E.setAttribute = function (name, value) {
      if (typeof name === 'string' && name.length === 5 && name.toLowerCase() === 'class') value = fwdStr(value);
      return natSet.call(this, name, value);
    };
    const cn = desc(E, 'className');
    if (cn && cn.get && cn.set) def(E, 'className', {
      configurable: true, enumerable: cn.enumerable,
      get() { const v = cn.get.call(this); return typeof v === 'string' ? revStr(v) : v; },
      set(v) { cn.set.call(this, fwdStr(v)); }
    });

    const CL = new WeakSet();
    const cl = desc(E, 'classList');
    if (cl && cl.get) {
      def(E, 'classList', {
        configurable: true, enumerable: cl.enumerable,
        get() { const l = cl.get.call(this); CL.add(l); return l; },
        set(v) { if (cl.set) cl.set.call(this, fwdStr(v)); }
      });
      const vd = desc(T, 'value');
      const nAdd = T.add, nRemove = T.remove, nToggle = T.toggle, nContains = T.contains, nReplace = T.replace, nItem = T.item,
        nForEach = T.forEach, nIter = T[Symbol.iterator], nToString = T.toString;
      const fix = l => { const v = vd.get.call(l), t = fwdStr(v); if (t !== v) vd.set.call(l, t); };
      T.add = function (...a) { if (!CL.has(this)) return nAdd.apply(this, a); fix(this); return nAdd.apply(this, a.map(ft)); };
      T.remove = function (...a) { if (!CL.has(this)) return nRemove.apply(this, a); fix(this); return nRemove.apply(this, a.map(ft)); };
      T.toggle = function (t, force) { if (!CL.has(this)) return nToggle.call(this, t, force); fix(this); return force === undefined ? nToggle.call(this, ft(t)) : nToggle.call(this, ft(t), force); };
      T.contains = function (t) { if (!CL.has(this)) return nContains.call(this, t); fix(this); return nContains.call(this, ft(t)); };
      T.replace = function (a, b) { if (!CL.has(this)) return nReplace.call(this, a, b); fix(this); return nReplace.call(this, ft(a), ft(b)); };
      T.item = function (i) { const r = nItem.call(this, i); return CL.has(this) && r != null ? rev(r) : r; };
      T.forEach = function (cb, th) { if (!CL.has(this)) return nForEach.call(this, cb, th); return nForEach.call(this, (t, i, l) => cb.call(th, rev(t), i, l)); };
      T.toString = function () { return CL.has(this) ? revStr(nToString.call(this)) : nToString.call(this); };
      const values = function () { return CL.has(this) ? Array.from(nIter.call(this), rev)[Symbol.iterator]() : nIter.call(this); };
      T[Symbol.iterator] = values;
      if (T.values) T.values = values;
      if (T.entries) { const nEnt = T.entries; T.entries = function () { return CL.has(this) ? Array.from(nIter.call(this), (t, i) => [i, rev(t)])[Symbol.iterator]() : nEnt.call(this); }; }
      if (vd && vd.get) def(T, 'value', {
        configurable: true, enumerable: vd.enumerable,
        get() { const v = vd.get.call(this); return CL.has(this) ? revStr(v) : v; },
        set(v) { vd.set.call(this, CL.has(this) ? fwdStr(v) : v); }
      });
    }

    for (const proto of [E, D, F]) {
      for (const k of ['querySelector', 'querySelectorAll', 'matches', 'closest', 'webkitMatchesSelector']) {
        if (!Object.prototype.hasOwnProperty.call(proto, k) || typeof proto[k] !== 'function') continue;
        const o = proto[k];
        proto[k] = function (s, ...r) { return o.call(this, selTr(s), ...r); };
      }
    }
    for (const proto of [E, D]) {
      const o = proto.getElementsByClassName;
      if (typeof o === 'function') proto.getElementsByClassName = function (n) { return o.call(this, typeof n === 'string' ? fwdStr(n) : n); };
    }

    const ih = desc(E, 'innerHTML');
    if (ih && ih.set) def(E, 'innerHTML', {
      configurable: true, enumerable: ih.enumerable, get: ih.get,
      set(v) {
        ih.set.call(this, v);
        const r = this.localName === 'template' && this.content ? this.content : this;
        for (let c = r.firstElementChild; c; c = c.nextElementSibling) { convTree(c); seen.add(c); }
        if (r.localName === 'template') convTemplates(r);
      }
    });
    const oh = desc(E, 'outerHTML');
    if (oh && oh.set) def(E, 'outerHTML', {
      configurable: true, enumerable: oh.enumerable, get: oh.get,
      set(v) { const p = this.parentNode; oh.set.call(this, v); if (p) convTree(p); }
    });
    const nIAH = E.insertAdjacentHTML;
    E.insertAdjacentHTML = function (pos, html) {
      const p = String(pos).toLowerCase();
      let a = null, b = null, par = null;
      if (p === 'beforeend') { a = this.lastChild; par = this; }
      else if (p === 'afterbegin') { b = this.firstChild; par = this; }
      else if (p === 'beforebegin') { a = this.previousSibling; b = this; par = this.parentNode; }
      else if (p === 'afterend') { a = this; b = this.nextSibling; par = this.parentNode; }
      const r = nIAH.call(this, pos, html);
      if (par) for (let n = a ? a.nextSibling : par.firstChild; n && n !== b; n = n.nextSibling) if (n.nodeType === 1) { convTree(n); seen.add(n); }
      return r;
    };
    if (typeof DOMParser !== 'undefined') {
      const o = DOMParser.prototype.parseFromString;
      DOMParser.prototype.parseFromString = function (s, t) { const d = o.call(this, s, t); try { convTree(d.documentElement); convTemplates(d); } catch {} return d; };
    }
    if (typeof Range !== 'undefined' && Range.prototype.createContextualFragment) {
      const o = Range.prototype.createContextualFragment;
      Range.prototype.createContextualFragment = function (h) { const f = o.call(this, h); convTree(f); convTemplates(f); return f; };
    }
    if (typeof E.setHTMLUnsafe === 'function') { const o = E.setHTMLUnsafe; E.setHTMLUnsafe = function (h) { const r = o.call(this, h); convTree(this); return r; }; }
    if (typeof Document !== 'undefined' && typeof Document.parseHTMLUnsafe === 'function') { const o = Document.parseHTMLUnsafe; Document.parseHTMLUnsafe = function (h) { const d = o.call(this, h); try { convTree(d.documentElement); } catch {} return d; }; }
  }

  const tagId = x => 'q-' + cyrb(salt + x).toString(36).slice(0, 7);
  const TW = tagId('w'), TC = tagId('c');
  const MIR = { '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '\u00ab': '\u00bb', '\u00bb': '\u00ab', '\u2039': '\u203a', '\u203a': '\u2039' };
  const rv = w => { let o = ''; for (let i = w.length - 1; i >= 0; i--) { const c = w[i]; o += MIR[c] || c; } return o; };
  const SAFE = /^[\u0021-\u007e\u00a1-\u00ac\u00ae-\u024f\u0370-\u03ff\u0400-\u04ff\u2010-\u2027]+$/;
  const ours = n => n.localName === TW || n.localName === TC;
  let anyScr = false, skipSel = '';
  const skipCache = new WeakMap();
  const skipEl = p => {
    let v = skipCache.get(p);
    if (v === undefined) { try { v = !!natClosest.call(p, skipSel); } catch { v = false; } skipCache.set(p, v); }
    return v;
  };

  function scr(tn) {
    const p = tn.parentNode;
    if (!p || p.nodeType !== 1 || !tn.isConnected || ours(p)) return;
    const s = tn.data;
    if (s.length < 2) return;
    if (skipEl(p)) return;
    const re = /\S+/g;
    let m, last = 0, wrap = null;
    while ((m = re.exec(s))) {
      const w = m[0];
      if (w.length < 2 || !SAFE.test(w)) continue;
      if (!wrap) wrap = document.createElement(TW);
      if (m.index > last) wrap.appendChild(document.createTextNode(s.slice(last, m.index)));
      const c = document.createElement(TC);
      c.textContent = rv(w);
      wrap.appendChild(c);
      last = re.lastIndex;
    }
    if (!wrap) return;
    if (last < s.length) wrap.appendChild(document.createTextNode(s.slice(last)));
    anyScr = true;
    tn.replaceWith(wrap);
  }

  let pend = [], head = 0, timer = 0;
  const idle = window.requestIdleCallback ? cb => requestIdleCallback(cb, { timeout: 400 }) : cb => setTimeout(cb, 30);
  const sched = () => { if (timer) return; timer = 1; idle(() => { timer = 0; flush(); }); };
  function flush() {
    const t0 = performance.now();
    while (head < pend.length) {
      if ((head & 15) === 0 && performance.now() - t0 > 8) break;
      scr(pend[head++]);
    }
    if (head >= pend.length) { pend = []; head = 0; } else sched();
  }
  function collect(root) {
    if (root.nodeType === 3) { if (root.data.length > 1) pend.push(root); }
    else if (root.nodeType === 1 || root.nodeType === 11) {
      const w = document.createTreeWalker(root, 4);
      for (let n = w.nextNode(); n; n = w.nextNode()) if (n.data.length > 1) pend.push(n);
    }
    if (pend.length > head) sched();
  }

  if (cfg.text) {
    skipSel = selTr('script,style,noscript,textarea,option,select,title,code,pre,svg,math,canvas,iframe,template,kbd,samp,' +
      '[contenteditable]:not([contenteditable="false"]),[data-no-obf],.sg-console,.sg-cookies' + (cfg.textSkip ? ',' + cfg.textSkip : ''));
    const st = document.createElement('style');
    st.textContent = TC + '{unicode-bidi:bidi-override;direction:rtl}' + TW + '{display:inline}';
    (document.head || document.documentElement).appendChild(st);

    const dec = n => {
      const w = document.createTreeWalker(n, 4);
      let o = '';
      for (let t = w.nextNode(); t; t = w.nextNode()) o += t.parentNode && t.parentNode.localName === TC ? rv(t.data) : t.data;
      return o;
    };
    const tc = desc(N, 'textContent');
    if (tc && tc.get) def(N, 'textContent', {
      configurable: true, enumerable: tc.enumerable, set: tc.set,
      get() {
        const v = tc.get.call(this);
        if (!anyScr || v == null) return v;
        if (this.nodeType === 3) return this.parentNode && this.parentNode.localName === TC ? rv(v) : v;
        if (this.nodeType !== 1 && this.nodeType !== 11) return v;
        if (this.localName === TC) return rv(v);
        return natQS.call(this, TC) ? dec(this) : v;
      }
    });
    const it = typeof HTMLElement !== 'undefined' && desc(HTMLElement.prototype, 'innerText');
    if (it && it.get) def(HTMLElement.prototype, 'innerText', {
      configurable: true, enumerable: it.enumerable, set: it.set,
      get() {
        if (anyScr && (this.localName === TC || natQS.call(this, TC))) return this.localName === TC ? rv(it.get.call(this)) : this.textContent;
        return it.get.call(this);
      }
    });
  }

  if (cfg.classes) {
    convTree(document);
    convTemplates(document);
    for (const sh of Array.from(document.styleSheets)) procSheet(sh);
    document.addEventListener('load', e => { const t = e.target; if (t && t.localName === 'link') procSheet(t.sheet); }, true);
  }
  if (cfg.text && document.body) collect(document.body);

  const mo = new MutationObserver(recs => {
    for (const r of recs) {
      if (r.type === 'attributes') {
        if (cfg.classes && r.target.nodeType === 1) convEl(r.target);
      } else if (r.type === 'childList') {
        for (const n of r.addedNodes) {
          if (n.nodeType === 1) {
            if (cfg.classes) {
              if (!seen.has(n)) { convTree(n); convTemplates(n); }
              if (n.localName === 'style') procSheet(n.sheet);
              else if (n.localName === 'link') procSheet(n.sheet);
              else if (n.firstChild) { const l = natQSA.call(n, 'style'); for (let i = 0; i < l.length; i++) procSheet(l[i].sheet); }
            }
            if (cfg.text && !ours(n)) collect(n);
          } else if (n.nodeType === 3) {
            if (cfg.text && n.parentNode && !ours(n.parentNode) && n.parentNode.localName !== 'style') collect(n);
            if (cfg.classes && n.parentNode && n.parentNode.localName === 'style') procSheet(n.parentNode.sheet);
          }
        }
      } else if (r.type === 'characterData') {
        const p = r.target.parentNode;
        if (!p) continue;
        if (p.localName === 'style') { if (cfg.classes) procSheet(p.sheet); }
        else if (cfg.text && !ours(p)) collect(r.target);
      }
    }
  });
  mo.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'], characterData: true });
}
