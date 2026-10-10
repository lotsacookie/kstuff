(function () {
    if (window.kHolidayLoaded) return;
    window.kHolidayLoaded = true;
    if (new Date().getMonth() !== 9) return;

    var REPO = 'lotsacookie/kstuff';
    var CSS_PATH = 'Assets/css/halloween.css';
    var CSS_CACHE = 'kstuff_hw_css_v1';
    var root = document.documentElement;

    var PUMPKIN = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<ellipse cx="21" cy="37" rx="12" ry="14" fill="#f06000"/>' +
        '<ellipse cx="43" cy="37" rx="12" ry="14" fill="#f06000"/>' +
        '<ellipse cx="32" cy="37" rx="13" ry="14" fill="#ff7a1a"/>' +
        '<rect x="29" y="11" width="6" height="9" rx="2" fill="#4caf50"/>' +
        '<path d="M28 13q4-3 8 0" stroke="#2e7d32" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path d="M19 32l5 7 5-7z" fill="#1a0a00"/>' +
        '<path d="M37 32l5 7 5-7z" fill="#1a0a00"/>' +
        '<path d="M20 46q12 9 24 0z" fill="#1a0a00"/>' +
        '</svg>';

    var NO_BACKGROUND_CSS =
        'html.halloween-season, html.halloween-season body {' +
        '  background: none !important;' +
        '  background-color: transparent !important;' +
        '}' +
        'html.halloween-season body::before {' +
        '  content: none !important;' +
        '}';

    function bundled(path) {
        var wins = [window];
        try { if (window.parent && window.parent !== window) wins.push(window.parent); } catch (e) {}
        for (var i = 0; i < wins.length; i++) {
            try {
                var sg = wins[i].singularity;
                if (sg && sg.has(path)) return sg.text(path);
            } catch (e) {}
        }
        return null;
    }

    function readCache() { try { return localStorage.getItem(CSS_CACHE) || ''; } catch (e) { return ''; } }
    function writeCache(css) { try { localStorage.setItem(CSS_CACHE, css); } catch (e) {} }

    function applyCss(css) {
        if (!css) return;
        var style = document.getElementById('halloween-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'halloween-style';
            (document.head || root).appendChild(style);
        }
        if (style.textContent !== css) style.textContent = css;
    }

    function refreshFromNetwork(hadCss) {
        fetch('https://cdn.jsdelivr.net/gh/' + REPO + '@main/' + CSS_PATH)
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
            .then(function (css) {
                writeCache(css);
                if (!hadCss || css !== readCache()) applyCss(css);
            })
            .catch(function (err) { if (!hadCss) console.error('halloween.css failed', err); });
    }

    root.classList.add('halloween-season');
    var css = bundled(CSS_PATH);
    if (css) {
        applyCss(css);
        if (css !== readCache()) writeCache(css);
    } else {
        css = readCache();
        applyCss(css);
        refreshFromNetwork(!!css);
    }

    function addPumpkin(el) {
        if (!el || !el.parentNode || el.parentNode.classList.contains('hw-wrap')) return;
        var wrap = document.createElement('span');
        wrap.className = 'hw-wrap';
        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(el);

        var badge = document.createElement('span');
        badge.className = 'hw-badge';
        badge.setAttribute('aria-hidden', 'true');
        badge.innerHTML = PUMPKIN;
        wrap.appendChild(badge);
    }

    function decorate() {
        if (document.getElementById('library-home') && !document.getElementById('halloween-no-bg')) {
            var reset = document.createElement('style');
            reset.id = 'halloween-no-bg';
            reset.textContent = NO_BACKGROUND_CSS;
            document.head.appendChild(reset);
        }
        ['#nav-logo', '#loading-screen .ld-logo', '#logo-wrap'].forEach(function (sel) {
            addPumpkin(document.querySelector(sel));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', decorate);
    } else {
        decorate();
    }
})();
