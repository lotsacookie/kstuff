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


    // Every request goes through the net hub (kNet). No direct fetches.
    function tvFetch(url, init) {
        init = init || {};
        if (!window.kNet) return Promise.reject(new Error('net hub missing'));
        return window.kNet.waitAvailable(20000).then(function (ok) {
            if (!ok) throw new Error('net hub unavailable');
            return window.kNet.fetch(url, init);
        });
    }
    TV.fetch = tvFetch;

    function timedFetch(url, ms) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, ms);
        return tvFetch(url, { signal: controller.signal }).then(function (res) {
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

    TV.hostApi = async function (path, timeout) {
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


    // ---- Aether catalog: TMDB through the net hub ----
    var SITE = 'https://aether.cx';
    var TMDB_BASES = ['https://api.themoviedb.org/3', 'https://api.tmdb.org/3'];
    var tmdbToken = '';
    var tmdbMem = {};
    var tmdbBusy = 0;
    var tmdbWait = [];

    function tmdbSlot() {
        if (tmdbBusy < 6) { tmdbBusy++; return Promise.resolve(); }
        return new Promise(function (r) { tmdbWait.push(r); }).then(function () { tmdbBusy++; });
    }
    function tmdbFree() { tmdbBusy--; var w = tmdbWait.shift(); if (w) w(); }

    async function hubText(url, ms) {
        var res = await timedFetch(url, ms || 20000);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
    }

    TV.getToken = async function () {
        if (tmdbToken) return tmdbToken;
        var own = TV.store.get('AE_TMDB');
        if (own && own.trim()) return (tmdbToken = own.trim());
        var auto = TV.store.json('AE_TMDB_AUTO');
        if (auto && auto.v && Date.now() - auto.ts < 7 * 86400000) return (tmdbToken = auto.v);
        var page = await hubText(SITE + '/', 25000);
        var m = page.match(/<script[^>]*\ssrc=["']([^"']*\/assets\/index-[^"']+\.js)["']/i) || page.match(/<script[^>]+type=["']module["'][^>]*\ssrc=["']([^"']+)["']/i);
        if (!m) throw new Error('could not find the catalog script');
        var js = await hubText(new URL(m[1], SITE + '/').href, 120000);
        var k = js.match(/TMDB_READ_API_KEY\s*:\s*"(eyJ[\w.\-]+)"/);
        if (!k) throw new Error('could not read a catalog token');
        TV.store.set('AE_TMDB_AUTO', JSON.stringify({ v: k[1], ts: Date.now() }));
        return (tmdbToken = k[1]);
    };

    TV.tmdb = function (path, params) {
        var qs = new URLSearchParams(Object.assign({ language: 'en-US' }, params || {})).toString();
        var key = path + '?' + qs;
        if (tmdbMem[key]) return tmdbMem[key];
        var p = (async function () {
            await tmdbSlot();
            try {
                var t = await TV.getToken();
                var err;
                for (var i = 0; i < TMDB_BASES.length; i++) {
                    try {
                        var res = await tvFetch(TMDB_BASES[i] + path + '?' + qs, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + t } });
                        if (res.status === 401) { tmdbToken = ''; TV.store.set('AE_TMDB_AUTO', 'null'); throw new Error('catalog token rejected'); }
                        if (!res.ok) throw new Error('TMDB HTTP ' + res.status);
                        return await res.json();
                    } catch (e) { err = e; if (/rejected/.test(String(e.message))) break; }
                }
                throw err;
            } finally { tmdbFree(); }
        })();
        tmdbMem[key] = p;
        p.catch(function () { delete tmdbMem[key]; });
        return p;
    };

    function tag(list, type) {
        return (list || []).filter(function (r) { return r && r.poster_path; }).map(function (r) {
            r.media_type = r.media_type || type;
            return r;
        });
    }

    // list of items for a type, optionally several pages
    TV.list = async function (type, path, params, pages) {
        var jobs = [];
        for (var i = 1; i <= (pages || 1); i++) jobs.push(TV.tmdb(path, Object.assign({}, params || {}, { page: String(i) })));
        var all = await Promise.all(jobs);
        var seen = {};
        var out = [];
        all.forEach(function (d) {
            tag(d.results, type).forEach(function (r) { if (!seen[r.id]) { seen[r.id] = 1; out.push(r); } });
        });
        return out;
    };

    TV.api = async function (path, timeout) {
        if (path.indexOf('/stream/') === 0) return TV.hostApi(path, timeout);
        var m;
        var url = new URL('http://x' + path);
        var q = {};
        url.searchParams.forEach(function (v, k) { q[k] = v; });
        if ((m = url.pathname.match(/^\/search\/multi$/))) {
            var d = await TV.tmdb('/search/multi', { query: q.query, page: q.page || '1', include_adult: 'false' });
            d.results = (d.results || []).filter(function (r) { return (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path; });
            return d;
        }
        if ((m = url.pathname.match(/^\/(movie|tv)\/(\d+)\/season\/(\d+)$/))) return TV.tmdb('/tv/' + m[2] + '/season/' + m[3]);
        if ((m = url.pathname.match(/^\/(movie|tv)\/(\d+)$/))) return TV.tmdb('/' + m[1] + '/' + m[2]);
        return TV.hostApi(path, timeout);
    };

    TV.proxyUrl = function (path) {
        var host = (TV.store.json(HOST_KEY) || {}).host || hostList[0] || FALLBACK_HOSTS[1];
        return host + '/movies/proxy?url=' + encodeURIComponent(path);
    };

    TV.img = function (path, size) {
        if (!path) return '';
        var full = IMG_BASE + (size || 'w342') + path;
        return full;
    };

    // Fallback images: if an image fails to load on its own, fetch it through the
    // main app's net hub (wisp) and show it from a blob URL. Never used when the image loads normally.
    TV.imgFallbacks = function (path, size) {
        if (!path) return [];
        var full = IMG_BASE + (size || 'w342') + path;
        return [full];
    };

    var hubImgCache = {};
    var hubImgBusy = 0;
    var hubImgWait = [];
    var HUB_IMG_SLOTS = 4;

    function hubImgSlot() {
        if (hubImgBusy < HUB_IMG_SLOTS) { hubImgBusy++; return Promise.resolve(); }
        return new Promise(function (r) { hubImgWait.push(r); }).then(function () { hubImgBusy++; });
    }

    function hubImgFree() {
        hubImgBusy--;
        var w = hubImgWait.shift();
        if (w) w();
    }

    TV.hubImage = function (urls) {
        urls = (urls || []).filter(Boolean);
        if (!urls.length) return Promise.reject(new Error('no url'));
        var key = urls[0];
        if (hubImgCache[key]) return hubImgCache[key];
        var job = (async function () {
            if (!window.kNet) throw new Error('no net hub');
            if (!(await window.kNet.waitAvailable(15000))) throw new Error('net hub unavailable');
            await hubImgSlot();
            try {
                var last = null;
                for (var i = 0; i < urls.length; i++) {
                    try {
                        var res = await Promise.race([
                            window.kNet.fetch(urls[i], { headers: { Accept: 'image/avif,image/webp,image/*,*/*;q=0.8' } }),
                            TV.sleep(15000).then(function () { throw new Error('timeout'); })
                        ]);
                        if (!res.ok) throw new Error('HTTP ' + res.status);
                        var buf = await res.arrayBuffer();
                        if (buf.byteLength < 64) throw new Error('empty image');
                        var type = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
                        return URL.createObjectURL(new Blob([buf], { type: /^image\//i.test(type) ? type : 'image/jpeg' }));
                    } catch (e) { last = e; }
                }
                throw last || new Error('image failed');
            } finally { hubImgFree(); }
        })();
        hubImgCache[key] = job;
        job.catch(function () { delete hubImgCache[key]; });
        return job;
    };

    // hls.js loader that pulls playlists and segments through the net hub. Only used as a
    // fallback when a stream fails to play through the normal route.
    TV.HubLoader = function (config) {
        this.config = config;
        this.context = null;
        this.ctl = null;
        this.timer = 0;
        this.stats = { aborted: false, loaded: 0, retry: 0, total: 0, chunkCount: 0, bwEstimate: 0, loading: { start: 0, first: 0, end: 0 }, parsing: { start: 0, end: 0 }, buffering: { start: 0, first: 0, end: 0 } };
    };
    TV.HubLoader.prototype.destroy = function () { this.abort(); this.callbacks = null; };
    TV.HubLoader.prototype.abort = function () {
        clearTimeout(this.timer);
        if (this.ctl) { try { this.ctl.abort(); } catch (e) {} }
        if (!this.stats.loading.end) {
            this.stats.aborted = true;
            var cb = this.callbacks;
            this.callbacks = null;
            if (cb && cb.onAbort) cb.onAbort(this.stats, this.context, null);
        }
    };
    TV.HubLoader.prototype.getCacheAge = function () { return null; };
    TV.HubLoader.prototype.getResponseHeader = function () { return null; };
    TV.HubLoader.prototype.load = function (context, config, callbacks) {
        var self = this;
        var stats = this.stats;
        this.context = context;
        this.callbacks = callbacks;
        stats.loading.start = performance.now();
        this.ctl = new AbortController();
        var headers = {};
        if (context.headers) Object.keys(context.headers).forEach(function (k) { headers[k] = context.headers[k]; });
        if (context.rangeEnd != null) headers.Range = 'bytes=' + (context.rangeStart || 0) + '-' + (context.rangeEnd - 1);
        var limit = (config && (config.maxLoadTimeMs || config.timeout)) || 60000;
        var timedOut = false;
        this.timer = setTimeout(function () {
            timedOut = true;
            try { self.ctl.abort(); } catch (e) {}
            var cb = self.callbacks;
            self.callbacks = null;
            if (cb && cb.onTimeout) cb.onTimeout(stats, context, null);
        }, limit);
        window.kNet.fetch(context.url, { headers: headers, signal: this.ctl.signal }).then(function (res) {
            stats.loading.first = performance.now();
            if (!res.ok && res.status !== 206) throw Object.assign(new Error('HTTP ' + res.status), { code: res.status });
            return (context.responseType === 'arraybuffer' ? res.arrayBuffer() : res.text()).then(function (data) {
                clearTimeout(self.timer);
                var cb = self.callbacks;
                if (!cb || timedOut) return;
                self.callbacks = null;
                stats.loading.end = performance.now();
                stats.loaded = stats.total = data.byteLength != null ? data.byteLength : data.length;
                cb.onSuccess({ url: res.url || context.url, data: data, code: res.status }, stats, context, res);
            });
        }).catch(function (err) {
            clearTimeout(self.timer);
            if (timedOut || !self.callbacks) return;
            var cb = self.callbacks;
            self.callbacks = null;
            if (self.ctl.signal.aborted) { if (cb.onAbort) cb.onAbort(stats, context, null); return; }
            cb.onError({ code: (err && err.code) || 0, text: (err && err.message) || 'network error' }, context, null, stats);
        });
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
