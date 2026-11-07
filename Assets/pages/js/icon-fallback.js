(function () {
  // If the Phosphor icon CSS/font don't load on their own, fetch them through the
  // main app's net hub (wisp) via window.kNet (js/net-client.js) and inject them.
  var V = '2.1.1';
  var BASES = ['https://unpkg.com/@phosphor-icons/web@' + V + '/src/', 'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@' + V + '/src/'];
  var WEIGHTS = ['regular', 'bold', 'fill', 'light', 'thin', 'duotone'];
  var busy = false, done = false;
  function log() { try { console.log.apply(console, ['[icons]'].concat([].slice.call(arguments))); } catch (e) {} }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function loaded() {
    try {
      var p = document.createElement('i');
      p.className = 'ph ph-house';
      p.setAttribute('aria-hidden', 'true');
      p.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none';
      document.body.appendChild(p);
      var c = getComputedStyle(p, '::before').content;
      var css = !!c && c !== 'none' && c !== 'normal' && c !== '""';
      p.remove();
      var font = false;
      document.fonts.forEach(function (f) { if (/phosphor/i.test(f.family) && f.status === 'loaded') font = true; });
      return css && font;
    } catch (e) { return false; }
  }
  function px(u, ms) {
    return Promise.race([window.kNet.fetch(u), new Promise(function (_, j) { setTimeout(function () { j(new Error('timeout')); }, ms); })]);
  }
  async function viaHub() {
    if (busy || done) return;
    busy = true;
    try {
      if (!window.kNet) throw new Error('net client missing');
      var ok = await window.kNet.waitAvailable(30000);
      if (!ok) throw new Error('net hub unavailable');
      var used = WEIGHTS.filter(function (w) { return w === 'regular' || document.querySelector('.ph-' + w); });
      var css = '';
      for (var wi = 0; wi < used.length; wi++) {
        var w = used[wi], got = false;
        for (var bi = 0; bi < BASES.length && !got; bi++) {
          var b = BASES[bi];
          try {
            var r = await px(b + w + '/style.css', 20000);
            if (!r.ok) throw new Error('HTTP ' + r.status);
            var t = await r.text();
            var m = t.match(/url\(["']?([^"')]*\.woff2[^"')]*)["']?\)/i);
            if (!m) throw new Error('no woff2 url');
            var fr = await px(new URL(m[1], b + w + '/style.css').href, 30000);
            if (!fr.ok) throw new Error('font HTTP ' + fr.status);
            var buf = await fr.arrayBuffer();
            if (buf.byteLength < 1024) throw new Error('empty font');
            var blob = URL.createObjectURL(new Blob([buf], { type: 'font/woff2' }));
            css += t.replace(/src:[^;]*;/g, 'src:url("' + blob + '") format("woff2");');
            got = true;
          } catch (e) { log('proxy', w, b, 'failed:', e && e.message || e); }
        }
      }
      if (css) {
        var s = document.createElement('style');
        s.id = 'icon-fallback-css';
        s.textContent = css;
        document.head.appendChild(s);
        done = true;
        log('loaded via net hub');
      }
    } catch (e) { log('fallback failed:', e && e.message || e); }
    finally { busy = false; }
  }
  async function check() {
    var t0 = Date.now();
    while (Date.now() - t0 < 8000) {
      if (loaded()) return log('loaded normally, no proxy needed');
      await sleep(500);
    }
    log('not loaded, using net hub');
    await viaHub();
    if (!done) { await sleep(15000); if (!loaded()) await viaHub(); }
  }
  function go() { check().catch(function () {}); }
  if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
})();
