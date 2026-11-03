export function maskDocument(win, live, light) {
  if (win.__kGlyph) return;
  win.__kGlyph = 1;
  var doc = win.document;
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, OPTION: 1, SELECT: 1, OPTGROUP: 1, TITLE: 1, CODE: 1, PRE: 1, INPUT: 1, IFRAME: 1, CANVAS: 1, HEAD: 1, TEMPLATE: 1, SVG: 1, MATH: 1 };
  var LIGHT = { H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, P: 1, LABEL: 1, LEGEND: 1, SMALL: 1, TH: 1, FIGCAPTION: 1, SUMMARY: 1 };
  var TOFU = '�';
  var style = doc.createElement('style');
  style.textContent = '.k-gm::before{content:attr(data-g)}.k-gx{display:none!important}';
  (doc.head || doc.documentElement).appendChild(style);

  function blocked(el) {
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      if (SKIP[e.tagName.toUpperCase()] || e.namespaceURI !== 'http://www.w3.org/1999/xhtml') return true;
      if (e.contentEditable === 'true' || e.hasAttribute('data-nomask')) return true;
      if (e.classList.contains('k-gm')) return true;
    }
    return false;
  }

  function maskText(n) {
    var v = n.nodeValue;
    if (!v || !v.trim()) return;
    var p = n.parentNode;
    if (!p || p.nodeType !== 1) return;
    if (light && !LIGHT[p.tagName]) return;
    if (blocked(p)) return;
    var s = doc.createElement('span');
    var x = doc.createElement('span');
    s.className = 'k-gm';
    s.setAttribute('data-g', v);
    x.className = 'k-gx';
    x.textContent = new Array(Math.min(v.length, 32) + 1).join(TOFU);
    s.appendChild(x);
    p.replaceChild(s, n);
  }

  function walk(root) {
    if (!root.isConnected) return;
    if (root.nodeType === 3) return maskText(root);
    if (root.nodeType !== 1 || blocked(root)) return;
    var w = doc.createTreeWalker(root, 4, null);
    var list = [];
    var n;
    while ((n = w.nextNode())) list.push(n);
    for (var i = 0; i < list.length; i++) maskText(list[i]);
  }

  if (!live) {
    if (doc.body) walk(doc.body);
    return;
  }

  var real = Object.getOwnPropertyDescriptor(win.Node.prototype, 'textContent');
  function read(node) {
    var out = '';
    var c = node.firstChild;
    while (c) {
      if (c.nodeType === 3) out += c.nodeValue;
      else if (c.nodeType === 1) out += c.classList.contains('k-gm') ? c.getAttribute('data-g') : read(c);
      c = c.nextSibling;
    }
    return out;
  }
  Object.defineProperty(win.Node.prototype, 'textContent', {
    configurable: true,
    enumerable: real.enumerable,
    set: real.set,
    get: function () {
      var t = this;
      if (t.nodeType !== 1 && t.nodeType !== 11) return real.get.call(t);
      if (t.nodeType === 1 && t.classList.contains('k-gm')) return t.getAttribute('data-g');
      if (!t.querySelector('.k-gm')) return real.get.call(t);
      return read(t);
    }
  });

  var queue = [];
  var pending = false;
  function flush() {
    pending = false;
    var items = queue;
    queue = [];
    for (var i = 0; i < items.length; i++) walk(items[i]);
  }
  function schedule() {
    if (pending) return;
    pending = true;
    if (win.requestIdleCallback) win.requestIdleCallback(flush, { timeout: 300 });
    else win.setTimeout(flush, 50);
  }
  new win.MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (r.type === 'characterData') {
        queue.push(r.target);
      } else {
        for (var j = 0; j < r.addedNodes.length; j++) queue.push(r.addedNodes[j]);
      }
    }
    if (queue.length) schedule();
  }).observe(doc.documentElement, { childList: true, subtree: true, characterData: true });

  if (doc.body) {
    queue.push(doc.body);
    schedule();
  }
}

export function init(K) {
  K.maskDocument = maskDocument;
  try {
    if (K.getStorage && K.getStorage('kstuff_text_mask') === 'off') return;
  } catch {}
  const start = () => maskDocument(window, true, false);
  document.body ? start() : document.addEventListener('DOMContentLoaded', start, { once: true });
}
