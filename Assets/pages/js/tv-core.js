(function () {
    var FALLBACK_HOSTS = [
        'https://cdn.northstreetumc.org',
        'https://cdn.vipersfutbol.com',
        'https://cdn.pcesc.org',
        'https://cdn.kcchallengevbc.com',
        'https://cdn.slcbmooc.org',
        'https://cdn.topstargym.net',
        'https://cdn.goaplytexas.org',
        'https://cdn.clearfieldswimming.com',
        'https://cdn.richardacademy.cfd'
    ];
    var HOST_KEY = 'tvMovieHost';
    var HOST_TTL = 1800000;
    var IMG_BASE = 'https://image.tmdb.org/t/p/';

    var TV = window.TV = {};

    TV.el = function (id) { return document.getElementById(id); };

    TV.make = function (tag, cls, text) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.textContent = text;
        return node;
    };

    TV.store = {
        get: function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set: function (key, value) { try { localStorage.setItem(key, value); } catch (e) {} },
        json: function (key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } }
    };

    TV.sleep = function (ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); };

    function parentWin() {
        try { return window.parent && window.parent !== window ? window.parent : null; } catch (e) { return null; }
    }

    function originOf(entry) {
        try {
            var text = String(entry || '').trim();
            if (!text) return null;
            var url = new URL(text.indexOf('://') > -1 ? text : 'wss://' + text + '/');
            return 'https://' + url.host;
        } catch (e) {
            return null;
        }
    }

    function localHosts() {
        var out = [];
        var add = function (entry) {
            var origin = originOf(entry);
            if (origin && out.indexOf(origin) === -1) out.push(origin);
        };
        [parentWin(), window].forEach(function (target) {
            if (!target) return;
            try { add(target.wlspServer); } catch (e) {}
            try {
                var list = target.serverList;
                if (Array.isArray(list)) list.forEach(add);
            } catch (e) {}
        });
        return out;
    }

    function parentHosts() {
        var parent = parentWin();
        var out = [];
        if (!parent) return Promise.resolve(out);
        var fn = null;
        try { fn = parent.movieHosts; } catch (e) {}
        if (typeof fn !== 'function') return Promise.resolve(out);
        return Promise.race([
            Promise.resolve().then(function () { return fn(); }),
            TV.sleep(7000).then(function () { return []; })
        ]).then(function (list) { return Array.isArray(list) ? list : []; }, function () { return []; });
    }

    function unique(list) {
        var seen = {};
        return list.filter(function (item) {
            if (!item || seen[item]) return false;
            seen[item] = true;
            return true;
        });
    }

    function timedFetch(url, ms) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, ms);
        return fetch(url, { signal: controller.signal }).then(function (res) {
            clearTimeout(timer);
            return res;
        }, function (err) {
            clearTimeout(timer);
            throw err;
        });
    }

    var hostPromise = null;
    var hostList = [];

    function probeHost(host) {
        return timedFetch(host + '/movies/home', 8000).then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        }).then(function (data) {
            if (!data || !Array.isArray(data.rows)) throw new Error('bad payload');
            return { host: host, data: data };
        });
    }

    function firstGood(hosts) {
        return new Promise(function (resolve) {
            var pending = hosts.length;
            var done = false;
            if (!pending) return resolve(null);
            hosts.forEach(function (host) {
                probeHost(host).then(function (hit) {
                    if (done) return;
                    done = true;
                    resolve(hit);
                }, function () {
                    pending--;
                    if (!pending && !done) resolve(null);
                });
            });
        });
    }

    TV.resolveHost = function (force) {
        if (hostPromise && !force) return hostPromise;
        hostPromise = (async function () {
            var saved = TV.store.json(HOST_KEY);
            var candidates = [];
            if (!force && saved && saved.host && Date.now() - saved.ts < HOST_TTL) candidates.push(saved.host);
            candidates = candidates.concat(localHosts());
            var extra = await parentHosts();
            candidates = unique(candidates.concat(extra, FALLBACK_HOSTS));
            hostList = candidates;
            for (var i = 0; i < candidates.length; i += 4) {
                var hit = await firstGood(candidates.slice(i, i + 4));
                if (hit) {
                    TV.store.set(HOST_KEY, JSON.stringify({ host: hit.host, ts: Date.now() }));
                    TV.homeData = hit.data;
                    return hit.host;
                }
            }
            throw new Error('no movie server answered');
        })();
        hostPromise.catch(function () { hostPromise = null; });
        return hostPromise;
    };

    TV.api = async function (path, timeout) {
        var limit = timeout || 15000;
        var host = await TV.resolveHost();
        for (var attempt = 0; attempt < 3; attempt++) {
            try {
                var res = await timedFetch(host + '/movies' + path, limit);
                if (res.status === 429 && attempt < 2) {
                    await TV.sleep(1500 * (attempt + 1));
                    continue;
                }
                if (res.status >= 500 && attempt < 1) {
                    await TV.sleep(1000);
                    continue;
                }
                if (!res.ok) {
                    var err = new Error(path + ' -> ' + res.status);
                    err.status = res.status;
                    throw err;
                }
                return await res.json();
            } catch (e) {
                if (e.status) throw e;
                if (attempt === 0) {
                    try { host = await TV.resolveHost(true); } catch (e2) { throw e; }
                    continue;
                }
                throw e;
            }
        }
        throw new Error('request failed');
    };

    TV.proxyUrl = function (path) {
        var host = (TV.store.json(HOST_KEY) || {}).host || hostList[0] || FALLBACK_HOSTS[1];
        return host + '/movies/proxy?url=' + encodeURIComponent(path);
    };

    TV.img = function (path, size) {
        if (!path) return '';
        var full = IMG_BASE + (size || 'w342') + path;
        var host = (TV.store.json(HOST_KEY) || {}).host || hostList[0] || FALLBACK_HOSTS[1];
        try { return host + '/img?' + btoa(full); } catch (e) { return full; }
    };

    TV.errText = function (err) {
        if (err && err.status === 429) return 'Too many requests. Wait a few seconds and try again.';
        if (err && /no movie server/.test(err.message || '')) return 'No movie server answered. Check your connection and try again.';
        return 'Could not load that. Try again in a moment.';
    };

    TV.clock = function (sec) {
        sec = Math.max(0, Math.floor(sec) || 0);
        var h = Math.floor(sec / 3600);
        var m = Math.floor(sec % 3600 / 60);
        var s = sec % 60;
        return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
    };

    TV.runtime = function (min) {
        min = Math.round(min);
        if (!min) return '';
        return min >= 60 ? Math.floor(min / 60) + 'h' + (min % 60 ? ' ' + (min % 60) + 'm' : '') : min + 'm';
    };

    var modes = {};
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.mode'));
    var panels = { movies: TV.el('panel-movies'), live: TV.el('panel-live') };
    var search = TV.el('search');
    var searchTimer = 0;
    TV.mode = 'movies';

    TV.register = function (name, handlers) { modes[name] = handlers; };

    function placeholder(name) {
        search.placeholder = name === 'live' ? 'Search channels' : 'Search movies and shows';
    }

    TV.select = function (name) {
        if (!panels[name]) name = 'movies';
        TV.mode = name;
        tabs.forEach(function (tab) {
            var on = tab.dataset.mode === name;
            tab.setAttribute('aria-selected', on ? 'true' : 'false');
            tab.tabIndex = on ? 0 : -1;
        });
        Object.keys(panels).forEach(function (key) { panels[key].hidden = key !== name; });
        placeholder(name);
        TV.store.set('tvMode', name);
        Object.keys(modes).forEach(function (key) {
            var h = modes[key];
            if (key === name) { if (h.show) h.show(); } else if (h.hide) h.hide();
        });
        search.value = (modes[name] && modes[name].query) ? modes[name].query() : '';
    };

    tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { TV.select(tab.dataset.mode); });
        tab.addEventListener('keydown', function (e) {
            var next = -1;
            if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
            else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
            if (next === -1) return;
            e.preventDefault();
            tabs[next].focus();
            TV.select(tabs[next].dataset.mode);
        });
    });

    search.addEventListener('input', function () {
        clearTimeout(searchTimer);
        var delay = TV.mode === 'live' ? 180 : 350;
        searchTimer = setTimeout(function () {
            var h = modes[TV.mode];
            if (h && h.search) h.search(search.value);
        }, delay);
    });

    window.addEventListener('load', function () {
        TV.select(TV.store.get('tvMode') || 'movies');
    });
})();
