(function () {
    if (window.kHolidayLoaded) return;
    window.kHolidayLoaded = true;
    if (new Date().getMonth() !== 9) return;

    var REPO = 'lotsacookie/kstuff';
    var CSS_PATH = 'Assets/css/halloween.css';
    var CSS_CACHE = 'kstuff_hw_css_v2';
    var root = document.documentElement;

    var PUMPKIN = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M29 3L36 5L38 14L27 14Z" fill="#3f6b1c"/>' +
        '<path d="M36 5L42 3L40 9L38 14Z" fill="#2c4e12"/>' +
        '<path d="M6 36L13 21L25 15L24 54L13 50Z" fill="#c24400"/>' +
        '<path d="M58 36L51 21L39 15L40 54L51 50Z" fill="#c24400"/>' +
        '<path d="M32 13L44 17L48 36L43 54L32 58L21 54L16 36L20 17Z" fill="#ff7a1a"/>' +
        '<path d="M32 13L44 17L48 36L43 54L38 56L41 36L38 16Z" fill="#e85d00"/>' +
        '<path d="M32 13L20 17L16 36L21 54L26 56L23 36L26 16Z" fill="#ff9330"/>' +
        '<g class="hw-face" stroke="#2a1000" stroke-width="1.4" stroke-linejoin="miter" fill="#ffd23f">' +
        '<path d="M16 29L28 35L19 40Z"/>' +
        '<path d="M48 29L36 35L45 40Z"/>' +
        '<path d="M32 38L36 46L28 46Z"/>' +
        '<path d="M14 46L22 49L25 44L29 51L32 46L35 51L39 44L42 49L50 46L45 57L38 54L32 59L26 54L19 57Z"/>' +
        '</g>' +
        '</svg>';

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

    try { localStorage.removeItem('kstuff_hw_css_v1'); } catch (e) {}

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
