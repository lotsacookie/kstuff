(function () {
    if (new Date().getMonth() !== 9) return;
    var PATH = 'Assets/js/holiday.js';
    var KEY = 'kstuff_hw_js_v1';

    function run(src) {
        var s = document.createElement('script');
        s.textContent = src;
        (document.head || document.documentElement).appendChild(s);
        s.remove();
    }
    function bundled() {
        try {
            var sg = window.parent && window.parent !== window && window.parent.singularity;
            if (sg && sg.has(PATH)) return sg.text(PATH);
        } catch (e) {}
        return null;
    }
    function readCache() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
    function writeCache(t) { try { localStorage.setItem(KEY, t); } catch (e) {} }

    var src = bundled();
    if (src) {
        run(src);
        if (src !== readCache()) writeCache(src);
        return;
    }

    var cached = readCache();
    if (cached) run(cached);

    fetch('https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/' + PATH)
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (t) {
            writeCache(t);
            if (!cached) run(t);
        })
        .catch(function () {});
})();
