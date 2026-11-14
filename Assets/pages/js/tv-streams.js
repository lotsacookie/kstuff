// Aether's stream setup: its providers library (crawled into rtischeduler/Aether-/ref/aether.cx)
// runs in this page and scrapes every source. Every request it makes goes through the net hub (kNet).
(function () {
    var TV = window.TV;
    var SITE = 'https://aether.cx';
    var REF_BASES = [
        'https://cdn.jsdelivr.net/gh/rtischeduler/Aether-@main/ref/aether.cx/',
        'https://fastly.jsdelivr.net/gh/rtischeduler/Aether-@main/ref/aether.cx/',
        'https://gcore.jsdelivr.net/gh/rtischeduler/Aether-@main/ref/aether.cx/'
    ];
    var DEFAULT_MAP = { file: 'assets/vendor-DTcQ0b48.js', makeProviders: 'aP', makeStandardFetcher: 'aQ', targets: 'aR' };
    var providersP = null;
    var used = {};

    function hubFetch(u, init) {
        init = init || {};
        var host = '';
        try { host = new URL(u).hostname; } catch (e) {}
        if (/(^|\.)(raccoonunbutteredbagel\.zip|aether\.cx)$/i.test(host)) {
            var hd = init.headers || {};
            if (typeof Headers !== 'undefined' && hd instanceof Headers) { var o = {}; hd.forEach(function (v, k) { o[k] = v; }); hd = o; }
            init = Object.assign({}, init, { headers: Object.assign({ origin: SITE, referer: SITE + '/', 'user-agent': navigator.userAgent, accept: '*/*' }, hd) });
        }
        var ctl = new AbortController();
        var timer = setTimeout(function () { ctl.abort(); }, 60000);
        init.signal = init.signal || ctl.signal;
        return hubLibcurl().then(function (lc) {
            // same client Aether uses (libcurl over the hub's wisp), so headers/redirects/urls behave the same
            return lc ? lc.fetch(u, Object.assign({ method: 'GET', redirect: 'follow' }, init)) : TV.fetch(u, init);
        }).then(function (r) {
            clearTimeout(timer);
            try { if (r && !r.url) Object.defineProperty(r, 'url', { value: u }); } catch (e) {}
            return r;
        }, function (e) { clearTimeout(timer); throw e; });
    }

    function hubLibcurl() {
        var d = null;
        try { d = (window.parent && window.parent !== window && window.parent.kNetDirect) || window.kNetDirect || null; } catch (e) {}
        if (d && typeof d.libcurl === 'function') return d.libcurl().catch(function () { return null; });
        return Promise.resolve(null);
    }

    TV.getProviders = function () {
        if (providersP) return providersP;
        providersP = (async function () {
            var lastErr;
            for (var i = 0; i < REF_BASES.length; i++) {
                try {
                    var base = REF_BASES[i], map = DEFAULT_MAP;
                    try { var r = await TV.fetch(base + 'providers.json', {}); if (r.ok) map = await r.json(); } catch (e) {}
                    var mod = await import(base + map.file);
                    var mk = mod[map.makeProviders], std = mod[map.makeStandardFetcher], tg = mod[map.targets];
                    if (!mk || !std || !tg) throw new Error('providers export map is out of date');
                    return mk({ fetcher: std(hubFetch), proxiedFetcher: std(hubFetch), target: tg.NATIVE });
                } catch (e) { lastErr = e; }
            }
            throw new Error('could not load the providers library: ' + (lastErr && lastErr.message));
        })();
        providersP.catch(function () { providersP = null; });
        return providersP;
    };

    TV.listSources = async function (type) {
        var P = await TV.getProviders();
        var want = type === 'movie' ? 'movie' : 'show';
        return P.listSources().filter(function (m) { return !Array.isArray(m.mediaTypes) || m.mediaTypes.indexOf(want) > -1; })
            .sort(function (a, b) { return (b.rank || 0) - (a.rank || 0); });
    };

    async function buildMedia(entry, s, e) {
        var kind = entry.type === 'tv' ? 'tv' : 'movie';
        var jobs = [TV.tmdb('/' + kind + '/' + entry.tid), TV.tmdb('/' + kind + '/' + entry.tid + '/external_ids')];
        if (kind === 'tv') jobs.push(TV.tmdb('/tv/' + entry.tid + '/season/' + s));
        var r = await Promise.all(jobs);
        var d = r[0] || {}, ext = r[1] || {};
        var year = Number(String(d.release_date || d.first_air_date || entry.year || '').slice(0, 4));
        var media = { title: d.title || d.name || entry.title, releaseYear: year, tmdbId: String(entry.tid), imdbId: ext.imdb_id || undefined };
        if (kind === 'movie') { media.type = 'movie'; return media; }
        var season = r[2] || {};
        var ep = (season.episodes || []).filter(function (x) { return x.episode_number === Number(e); })[0] || {};
        media.type = 'show';
        media.season = { number: Number(s), tmdbId: String(season.id || '') };
        media.episode = { number: Number(e), tmdbId: String(ep.id || '') };
        return media;
    }

    function toStreams(r) {
        var st = r && (Array.isArray(r.stream) ? r.stream[0] : r.stream);
        if (!st) return [];
        var name = [r.sourceId, r.embedId].filter(Boolean).join(' → ') || 'Source';
        var headers = Object.assign({}, st.preferredHeaders || {}, st.headers || {});
        var caps = st.captions || [];
        if (st.type === 'hls' && st.playlist) return [{ type: 'hls', url: st.playlist, headers: headers, providerName: name, captions: caps }];
        if (st.type === 'file') {
            return Object.keys(st.qualities || {}).filter(function (k) { return st.qualities[k] && st.qualities[k].url; }).map(function (k) {
                return { type: 'file', url: st.qualities[k].url, quality: k === 'unknown' ? '' : k, headers: headers, providerName: name, captions: caps };
            });
        }
        return [];
    }

    // Runs the sources one after another (best first). Sources already handed out for this title are skipped
    // on a refresh, so each retry finds a different one.
    TV.scrapeStreams = async function (entry, s, e, fresh, onUpdate) {
        var key = entry.type + ':' + entry.tid + ':' + s + ':' + e;
        if (!fresh) used[key] = {};
        var P = await TV.getProviders();
        var all = await TV.listSources(entry.type);
        var skip = used[key] || (used[key] = {});
        var order = all.map(function (x) { return x.id; }).filter(function (id) { return !skip[id]; });
        if (!order.length) { used[key] = skip = {}; order = all.map(function (x) { return x.id; }); }
        if (onUpdate) onUpdate({ total: all.length, left: order.length });
        var media = await buildMedia(entry, s, e);
        var seen = {};
        var r = await P.runAll({
            media: media,
            sourceOrder: order,
            events: { update: function (v) {
                if (v && v.id) { seen[v.id] = v.status; console.log('[tv] source', v.id, v.status, v.reason || ''); }
                if (onUpdate && v && v.id) onUpdate({ id: v.id, status: v.status, total: all.length });
            } }
        });
        if (!r) {
            var bad = Object.keys(seen).filter(function (k) { return seen[k] !== 'success'; });
            throw new Error(all.length + ' sources listed, none returned a stream' + (bad.length ? ' (' + bad.slice(0, 6).map(function (k) { return k + ': ' + seen[k]; }).join(', ') + ')' : ''));
        }
        if (r.sourceId) skip[r.sourceId] = 1;
        return toStreams(r);
    };

    // hls.js loader that adds the stream's own headers and goes through the net hub
    TV.hubLoaderWith = function (headers) {
        function L(c) { TV.HubLoader.call(this, c); }
        L.prototype = Object.create(TV.HubLoader.prototype);
        L.prototype.load = function (ctx, cfg, cb) {
            ctx.headers = Object.assign({}, headers || {}, ctx.headers || {});
            return TV.HubLoader.prototype.load.call(this, ctx, cfg, cb);
        };
        return L;
    };

    TV.hubBlob = async function (url, headers) {
        var res = await TV.fetch(url, { headers: headers || {} });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var buf = await res.arrayBuffer();
        return URL.createObjectURL(new Blob([buf], { type: 'video/mp4' }));
    };
})();
