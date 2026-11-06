(function () {
    var root = document.documentElement;

    window.__kReadyPending = true;
    function markReady() {
        if (root.classList.contains('ready')) return;
        root.classList.add('ready');
        window.__kReadySent = true;
        try { window.parent.postMessage({ type: 'kstuff-frame-ready' }, '*'); } catch (e) {}
    }
    function whenSettled() {
        var fonts = (document.fonts && document.fonts.ready) || Promise.resolve();
        Promise.race([fonts, new Promise(function (r) { setTimeout(r, 1200); })]).then(function () {
            requestAnimationFrame(function () { requestAnimationFrame(markReady); });
        });
    }
    if (document.readyState === 'complete') whenSettled();
    else window.addEventListener('load', whenSettled);
    setTimeout(markReady, 2000);

    var logoWrap = document.getElementById('logo-wrap');
    if (logoWrap) {
        logoWrap.addEventListener('click', function () {
            logoWrap.classList.remove('burst');
            void logoWrap.offsetWidth;
            logoWrap.classList.add('burst');
        });
        logoWrap.addEventListener('animationend', function (e) {
            if (e.target === logoWrap && e.animationName === 'logo-click') {
                logoWrap.classList.remove('burst');
            }
        });
    }
})();


(function () {
    var section = document.getElementById('favs-section');
    var row = document.getElementById('favs-row');
    if (!section || !row) return;
    var lastKey = '';

    function tile(item, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'fav-tile';
        b.style.setProperty('--i', Math.min(i, 20));
        b.title = item.title;
        var art = document.createElement('span');
        art.className = 'fav-art';
        if (item.image) {
            art.classList.add('loading');
            var img = document.createElement('img');
            img.alt = '';
            img.decoding = 'async';
            img.loading = 'lazy';
            img.onload = function () { art.classList.remove('loading'); img.classList.add('loaded'); };
            img.onerror = function () {
                art.classList.remove('loading');
                img.remove();
                var l = document.createElement('span');
                l.className = 'fav-letter';
                l.textContent = (item.title || '?').charAt(0).toUpperCase();
                art.appendChild(l);
            };
            img.src = item.image;
            art.appendChild(img);
        } else {
            var l = document.createElement('span');
            l.className = 'fav-letter';
            l.textContent = (item.title || '?').charAt(0).toUpperCase();
            art.appendChild(l);
        }
        var name = document.createElement('span');
        name.className = 'fav-name';
        name.textContent = item.title;
        b.appendChild(art);
        b.appendChild(name);
        b.addEventListener('click', function () {
            try { window.parent.postMessage({ type: 'kstuff-fav-open', page: item.page, title: item.title }, '*'); } catch (e) {}
        });
        return b;
    }

    var navHidden = false;

    function render(items) {
        section.hidden = navHidden;
        var key = JSON.stringify(items);
        if (key === lastKey) return;
        lastKey = key;
        row.textContent = '';
        if (!items.length) return;
        var frag = document.createDocumentFragment();
        items.forEach(function (it, i) { frag.appendChild(tile(it, i)); });
        row.appendChild(frag);
    }

    window.addEventListener('message', function (e) {
        if (e.source !== window.parent) return;
        var d = e.data;
        if (!d || d.type !== 'kstuff-favorites' || !Array.isArray(d.items)) return;
        navHidden = !!d.hidden;
        render(d.items.filter(function (it) { return it && typeof it.title === 'string' && typeof it.page === 'string'; }));
    });

    function ask() { try { window.parent.postMessage({ type: 'kstuff-fav-request' }, '*'); } catch (e) {} }
    if (document.readyState === 'complete') ask(); else window.addEventListener('load', ask);
    setTimeout(ask, 1500);
})();
