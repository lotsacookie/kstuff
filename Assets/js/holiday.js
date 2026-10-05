(function () {
    if (window.kHolidayLoaded) return;
    window.kHolidayLoaded = true;
    if (new Date().getMonth() !== 9) return;

    var REPO = 'lotsacookie/kstuff';

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

    function decode(b64) {
        var bin = atob(b64.replace(/\s/g, ''));
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    }

    function fetchRepoFile(path) {
        var key = 'kstuff_gh_' + path;
        var api = 'https://api.github.com/repos/' + REPO + '/contents/' + path + '?ref=main';
        return fetch(api, { headers: { Accept: 'application/vnd.github+json' } })
            .then(function (res) {
                if (!res.ok) throw new Error('GitHub API ' + res.status);
                return res.json();
            })
            .then(function (data) {
                var text = decode(data.content);
                localStorage.setItem(key, JSON.stringify({ sha: data.sha, text: text }));
                return text;
            })
            .catch(function (err) {
                var cached = null;
                try { cached = JSON.parse(localStorage.getItem(key)); } catch (e) {}
                if (cached && cached.text) return cached.text;
                throw err;
            });
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

    function init() {
        document.documentElement.classList.add('halloween-season');

        // browser.html already has its own background, so keep it clear
        if (document.getElementById('library-home')) {
            var reset = document.createElement('style');
            reset.id = 'halloween-no-bg';
            reset.textContent = NO_BACKGROUND_CSS;
            document.head.appendChild(reset);
        }

        ['#nav-logo', '#loading-screen .ld-logo', '#logo-wrap'].forEach(function (sel) {
            addPumpkin(document.querySelector(sel));
        });

        fetchRepoFile('Assets/css/halloween.css').then(function (css) {
            var style = document.getElementById('halloween-style');
            if (!style) {
                style = document.createElement('style');
                style.id = 'halloween-style';
                document.head.appendChild(style);
            }
            style.textContent = css;
        }).catch(function (err) {
            console.error('halloween.css failed', err);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
