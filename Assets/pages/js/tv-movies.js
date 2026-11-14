(function () {
    var HLS_SRC = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    var make = TV.make;
    var el = TV.el;
    var secs = el('mvSecs');
    var feat = el('mvFeat');
    var home = el('mvHome');
    var contBox = el('mvCont');
    var results = el('mvResults');
    var grid = el('mvGrid');
    var resTitle = el('mvResTitle');
    var resCount = el('mvCount');
    var modal = el('mvModal');
    var box = el('mvBox');
    var playerEl = el('mvPlayer');

    var query = '';
    var searchGen = 0;
    var homeGen = 0;
    var homeLoaded = false;
    var item = null;
    var season = 0;
    var detailGen = 0;
    var playGen = 0;
    var hlsLib = null;
    var hlsPromise = null;
    var idleTimer = 0;
    var player = null;

    function norm(e, fallback) {
        var type = e.mediaType || e.media_type || fallback;
        if (type !== 'movie' && type !== 'tv') return null;
        var title = e.title || e.name || '';
        if (!e.id || !title) return null;
        return {
            id: type + ':' + e.id,
            type: type,
            tid: e.id,
            title: title,
            poster: e.poster || e.poster_path || '',
            backdrop: e.backdrop || e.backdrop_path || '',
            year: String(e.year || (e.release_date || e.first_air_date || '').slice(0, 4) || ''),
            rating: e.vote || e.vote_average || 0,
            overview: e.overview || ''
        };
    }

    function normList(list, fallback) {
        return (list || []).map(function (e) { return norm(e, fallback); }).filter(Boolean);
    }

    function loadImg(holder, path, size, cls) {
        if (!path) return;
        var img = document.createElement('img');
        img.alt = '';
        img.referrerPolicy = 'no-referrer';
        img.onload = function () { img.classList.add('in'); };
        img.onerror = function () { img.remove(); };
        if (cls) img.className = cls;
        holder.appendChild(img);
        // lazy: only pull through the net hub once the holder is near the viewport
        var go = function () {
            TV.hubImage(TV.imgFallbacks(path, size)).then(function (u) { img.src = u; }, function () { img.remove(); });
        };
        if (!('IntersectionObserver' in window)) return go();
        var io = new IntersectionObserver(function (es) {
            if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); }
        }, { rootMargin: '400px 600px' });
        io.observe(holder);
    }

    function makeCard(entry, rank) {
        var card = make('button', 'card');
        card.type = 'button';
        card.title = entry.title;
        var poster = make('div', 'poster');
        if (!entry.poster) poster.textContent = entry.title.slice(0, 2).toUpperCase();
        else loadImg(poster, entry.poster, 'w342');
        if (rank) poster.appendChild(make('span', 'rank', String(rank)));
        card.appendChild(poster);
        card.appendChild(make('div', 'card-t', entry.title));
        var sub = [entry.year, entry.type === 'tv' ? 'Series' : 'Movie'].filter(Boolean).join(' · ');
        card.appendChild(make('div', 'card-s', sub));
        card.addEventListener('click', function () { openDetail(entry); });
        return card;
    }

    function skeletonRow() {
        var row = make('div', 'row');
        for (var i = 0; i < 8; i++) {
            var card = make('div', 'card skel');
            card.appendChild(make('div', 'poster'));
            row.appendChild(card);
        }
        return row;
    }

    function errorBlock(err, retry) {
        var node = make('div', 'message', TV.errText(err));
        var btn = make('button', 'pill', 'Try again');
        btn.type = 'button';
        btn.addEventListener('click', retry);
        node.appendChild(document.createElement('br'));
        node.appendChild(btn);
        return node;
    }

    function paintFeatured(entry) {
        feat.textContent = '';
        feat.hidden = false;
        loadImg(feat, entry.backdrop || entry.poster, entry.backdrop ? 'w1280' : 'w780', 'bd');
        var inner = make('div', 'feat-in');
        inner.appendChild(make('h2', 'feat-title', entry.title));
        var meta = make('div', 'feat-meta');
        if (entry.year) meta.appendChild(make('span', '', entry.year));
        meta.appendChild(make('span', '', entry.type === 'tv' ? 'Series' : 'Movie'));
        if (entry.rating > 0) meta.appendChild(make('span', '', '★ ' + Number(entry.rating).toFixed(1)));
        inner.appendChild(meta);
        if (entry.overview) inner.appendChild(make('p', 'feat-over', entry.overview));
        var actions = make('div', 'feat-actions');
        var play = make('button', 'pill solid', 'Play');
        play.type = 'button';
        play.addEventListener('click', function () {
            if (entry.type === 'movie') startPlay(entry, 1, 1, '');
            else openDetail(entry);
        });
        var more = make('button', 'pill', 'Details');
        more.type = 'button';
        more.addEventListener('click', function () { openDetail(entry); });
        actions.appendChild(play);
        actions.appendChild(more);
        inner.appendChild(actions);
        feat.appendChild(inner);
    }

    function paintHome(data) {
        secs.textContent = '';
        var rows = (data && data.rows) || [];
        var first = null;
        rows.forEach(function (row, index) {
            var list = normList(row.items || row.results);
            if (!list.length) return;
            if (!first) first = list.find(function (e) { return e.backdrop; }) || list[0];
            var sec = make('div', 'sec');
            var head = make('div', 'sec-head');
            head.appendChild(make('h2', 'sec-title', row.title || row.name || 'Trending'));
            sec.appendChild(head);
            var rowEl = make('div', 'row');
            var ranked = /top\s*10/i.test(row.title || row.name || '');
            list.forEach(function (entry, i) { rowEl.appendChild(makeCard(entry, ranked ? i + 1 : 0)); });
            sec.appendChild(rowEl);
            secs.appendChild(sec);
        });
        if (first) paintFeatured(first);
        else feat.hidden = true;
        if (!secs.childNodes.length) secs.appendChild(make('div', 'message', 'Nothing to show right now.'));
    }

    // ---- Aether layout: Movies / TV Shows / Editor Picks, rows with chip pickers ----
    var PROVIDERS = {
        movie: [['Netflix', '8'], ['Apple TV+', '2'], ['Amazon Prime Video', '10'], ['Hulu', '15'], ['Disney Plus', '337'], ['Max', '1899'], ['Paramount Plus', '531'], ['Shudder', '99'], ['Crunchyroll', '283'], ['fuboTV', '257'], ['AMC+', '526'], ['Starz', '43']],
        tv: [['Netflix', '8'], ['Apple TV+', '350'], ['Amazon Prime Video', '10'], ['Paramount Plus', '531'], ['Hulu', '15'], ['Max', '1899'], ['Adult Swim', '318'], ['Disney Plus', '337'], ['Crunchyroll', '283'], ['Shudder', '99'], ['Fox', '328']]
    };
    var EDITOR = {
        movie: [9342, 293, 370172, 661374, 207, 378785, 335984, 13353, 27205, 106646, 334533, 693134, 765245, 264660, 92591, 976893, 13187, 11527, 120, 157336, 762, 666243, 545611, 329, 330459, 279, 823219, 22, 18971, 26388, 152601, 11886, 1362, 578, 78, 348],
        tv: [456, 73021, 1434, 1695, 1408, 93740, 60625, 1396, 44217, 90228, 13916, 71912, 61222, 93405, 87108, 105248, 82738, 615, 4625, 513, 110948, 110492, 125988, 87917, 42009, 86831, 261579]
    };
    var homeTab = 'movie';
    var tabBar = null;

    function shuffled(list) {
        var a = list.slice();
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
    }

    function rowDefs(tab) {
        if (tab === 'editor') {
            return ['movie', 'tv'].map(function (type) {
                return { title: 'Editor Picks ' + (type === 'movie' ? 'Movies' : 'Shows'), load: function () {
                    var ids = shuffled(EDITOR[type]).slice(0, 22);
                    return Promise.all(ids.map(function (id) { return TV.tmdb('/' + type + '/' + id).then(function (d) { d.media_type = type; return d; }, function () { return null; }); }))
                        .then(function (l) { return l.filter(function (d) { return d && d.poster_path; }).slice(0, 18); });
                } };
            });
        }
        var type = tab;
        var label = type === 'movie' ? 'Movies' : 'Shows';
        var rows = type === 'movie' ? [
            { title: 'Trending', load: function () { return TV.list('movie', '/trending/movie/week', {}, 3); } },
            { title: 'Most Popular', load: function () { return TV.list('movie', '/discover/movie', { sort_by: 'popularity.desc' }); } },
            { title: 'Top Rated', load: function () { return TV.list('movie', '/discover/movie', { sort_by: 'vote_average.desc', 'vote_count.gte': '1000' }); } }
        ] : [
            { title: 'Trending', load: function () { return TV.list('tv', '/trending/tv/week', {}, 3); } },
            { title: 'Top Rated', load: function () { return TV.list('tv', '/discover/tv', { sort_by: 'vote_average.desc', 'vote_count.gte': '500' }); } },
            { title: 'Most Popular', load: function () { return TV.list('tv', '/discover/tv', { sort_by: 'popularity.desc' }); } },
            { title: 'K-Drama', load: function () { return TV.list('tv', '/discover/tv', { with_origin_country: 'KR', with_original_language: 'ko' }); } }
        ];
        rows.push({
            title: function (c) { return label + ' on ' + (c ? c.name : '...'); },
            chips: function () { return Promise.resolve(PROVIDERS[type].map(function (p) { return { name: p[0], id: p[1] }; })); },
            load: function (c) { return TV.list(type, '/discover/' + type, { with_watch_providers: c.id, watch_region: 'US' }); }
        });
        rows.push({
            title: function (c) { return c ? c.name + ' ' + label : label + ' by genre'; },
            chips: function () { return TV.tmdb('/genre/' + type + '/list').then(function (d) { return (d.genres || []).map(function (g) { return { id: String(g.id), name: g.name }; }); }); },
            load: function (c) { return TV.list(type, '/discover/' + type, { with_genres: c.id }); }
        });
        return rows;
    }

    function buildRow(def, gen) {
        var sec = make('div', 'sec');
        var head = make('div', 'sec-head');
        var title = make('h2', 'sec-title', '');
        head.appendChild(title);
        sec.appendChild(head);
        var chipBar = def.chips ? make('div', 'chipbar') : null;
        if (chipBar) sec.appendChild(chipBar);
        var rowEl = make('div', 'row');
        sec.appendChild(rowEl);
        var selected = null, serial = 0, started = false;
        var setTitle = function () { title.textContent = typeof def.title === 'function' ? def.title(selected) : def.title; };
        var fill = async function () {
            var mine = ++serial;
            setTitle();
            rowEl.textContent = '';
            skeletonRow().childNodes.forEach(function (c) { rowEl.appendChild(c.cloneNode(true)); });
            try {
                var items = normList(await def.load(selected), homeTab === 'tv' ? 'tv' : 'movie');
                if (gen !== homeGen || mine !== serial) return;
                if (!items.length) throw new Error('nothing to show');
                rowEl.textContent = '';
                items.forEach(function (e, i) { rowEl.appendChild(makeCard(e, /^Trending$/.test(def.title) && i < 10 ? i + 1 : 0)); });
                if (!feat.dataset.set && items.some(function (e) { return e.backdrop; })) {
                    feat.dataset.set = '1';
                    paintFeatured(items.filter(function (e) { return e.backdrop; })[Math.floor(Math.random() * Math.min(8, items.length))] || items[0]);
                }
            } catch (e) {
                if (gen !== homeGen || mine !== serial) return;
                rowEl.textContent = '';
                rowEl.appendChild(errorBlock(e, fill));
            }
        };
        var start = async function () {
            if (started) return;
            started = true;
            setTitle();
            if (def.chips) {
                try {
                    var list = await def.chips();
                    selected = list[0] || null;
                    list.forEach(function (c) {
                        var b = make('button', 'sn' + (c === selected ? ' on' : ''), c.name);
                        b.type = 'button';
                        b.addEventListener('click', function () {
                            if (selected === c) return;
                            selected = c;
                            Array.prototype.forEach.call(chipBar.children, function (x) { x.classList.toggle('on', x === b); });
                            fill();
                        });
                        chipBar.appendChild(b);
                    });
                } catch (e) { rowEl.textContent = ''; rowEl.appendChild(errorBlock(e, function () { started = false; start(); })); return; }
            }
            await fill();
        };
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (es) {
                if (es.some(function (x) { return x.isIntersecting; })) { io.disconnect(); if (gen === homeGen) start(); }
            }, { rootMargin: '700px 0px' });
            io.observe(sec);
        } else start();
        return sec;
    }

    function paintTabs() {
        if (!tabBar) {
            tabBar = make('div', 'tabs');
            [['movie', 'Movies'], ['tv', 'TV Shows'], ['editor', 'Editor Picks']].forEach(function (t) {
                var b = make('button', 'sn', t[1]);
                b.type = 'button';
                b.dataset.tab = t[0];
                b.addEventListener('click', function () { if (homeTab !== t[0]) { homeTab = t[0]; loadHome(); } });
                tabBar.appendChild(b);
            });
            home.insertBefore(tabBar, home.firstChild);
        }
        Array.prototype.forEach.call(tabBar.children, function (b) { b.classList.toggle('on', b.dataset.tab === homeTab); });
    }

    async function loadHome() {
        var gen = ++homeGen;
        paintTabs();
        feat.hidden = true;
        feat.textContent = '';
        delete feat.dataset.set;
        secs.textContent = '';
        homeLoaded = true;
        rowDefs(homeTab).forEach(function (def) { secs.appendChild(buildRow(def, gen)); });
    }

    var resultState = { q: '', page: 1, total: 1, seen: {} };

    function addResults(list) {
        var more = grid.querySelector('.more');
        if (more) more.remove();
        list.forEach(function (entry) {
            if (resultState.seen[entry.id]) return;
            resultState.seen[entry.id] = true;
            grid.appendChild(makeCard(entry, 0));
        });
        if (resultState.page < resultState.total) {
            var wrap = make('div', 'more');
            var btn = make('button', 'pill', 'Load more');
            btn.type = 'button';
            btn.addEventListener('click', function () { btn.disabled = true; fetchResults(resultState.page + 1); });
            wrap.appendChild(btn);
            grid.appendChild(wrap);
        }
        resCount.textContent = Object.keys(resultState.seen).length + ' results';
    }

    async function fetchResults(page) {
        var gen = searchGen;
        var q = resultState.q;
        try {
            var data = await TV.api('/search/multi?query=' + encodeURIComponent(q) + '&page=' + page);
            if (gen !== searchGen) return;
            resultState.page = data.page || page;
            resultState.total = data.total_pages || 1;
            var list = normList(data.results);
            if (page === 1) grid.textContent = '';
            addResults(list);
            if (!Object.keys(resultState.seen).length) {
                grid.textContent = '';
                grid.appendChild(make('div', 'message', 'No results for "' + q + '".'));
                resCount.textContent = '';
            }
        } catch (e) {
            if (gen !== searchGen) return;
            var more = grid.querySelector('.more');
            if (more) more.remove();
            grid.appendChild(errorBlock(e, function () { fetchResults(page); }));
        }
    }

    function runSearch(value) {
        query = value.trim();
        var gen = ++searchGen;
        if (!query) {
            results.hidden = true;
            home.hidden = false;
            if (!homeLoaded) loadHome();
            return;
        }
        home.hidden = true;
        results.hidden = false;
        resTitle.textContent = 'Results for "' + query + '"';
        resCount.textContent = '';
        grid.textContent = '';
        resultState = { q: query, page: 1, total: 1, seen: {} };
        for (var i = 0; i < 12; i++) {
            var card = make('div', 'card skel');
            card.appendChild(make('div', 'poster'));
            grid.appendChild(card);
        }
        fetchResults(1);
    }

    function closeDetail() {
        detailGen++;
        modal.classList.remove('open');
        box.textContent = '';
        document.removeEventListener('keydown', onModalKey, true);
    }

    function onModalKey(e) {
        if (e.key === 'Escape' && !playerEl.classList.contains('open')) {
            e.stopPropagation();
            closeDetail();
        }
    }

    modal.addEventListener('click', function (e) { if (e.target === modal) closeDetail(); });

    function seasonNumbers(detail) {
        return ((detail && detail.seasons) || []).map(function (s) { return s.season_number; })
            .filter(function (n) { return n > 0; }).sort(function (a, b) { return a - b; });
    }

    function isFuture(ep) {
        if (!ep.air_date) return false;
        var d = new Date();
        d.setDate(d.getDate() + 1);
        return ep.air_date > d.toISOString().slice(0, 10);
    }

    async function showSeason(entry, n, gen, epsBox, seasonBtns) {
        season = n;
        seasonBtns.forEach(function (b) { b.classList.toggle('on', Number(b.dataset.n) === n); });
        epsBox.textContent = '';
        epsBox.appendChild(make('div', 'message', 'Loading episodes...'));
        try {
            var data = await TV.api('/tv/' + entry.tid + '/season/' + n);
            if (gen !== detailGen || season !== n) return;
            var eps = data.episodes || [];
            epsBox.textContent = '';
            if (!eps.length) {
                epsBox.appendChild(make('div', 'message', 'No episodes listed for this season.'));
                return;
            }
            eps.forEach(function (ep) {
                var future = isFuture(ep);
                var row = make('div', 'ep' + (future ? ' soon' : ''));
                row.tabIndex = future ? -1 : 0;
                row.setAttribute('role', 'button');
                var img = make('div', 'ep-img');
                loadImg(img, ep.still_path, 'w300');
                img.appendChild(make('span', 'ep-n', String(ep.episode_number)));
                var text = make('div', 'ep-t');
                text.appendChild(make('div', 'ep-name', ep.name || 'Episode ' + ep.episode_number));
                if (ep.overview) text.appendChild(make('div', 'ep-desc', ep.overview));
                var status = future ? 'Airs ' + new Date(ep.air_date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : TV.runtime(ep.runtime || 0);
                if (status) text.appendChild(make('div', 'ep-st', status));
                row.appendChild(img);
                row.appendChild(text);
                if (!future) {
                    var go = function () { startPlay(entry, n, ep.episode_number, ep.name); };
                    row.addEventListener('click', go);
                    row.addEventListener('keydown', function (e) {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
                    });
                }
                epsBox.appendChild(row);
            });
        } catch (e) {
            if (gen !== detailGen || season !== n) return;
            epsBox.textContent = '';
            epsBox.appendChild(errorBlock(e, function () { showSeason(entry, n, gen, epsBox, seasonBtns); }));
        }
    }

    async function openDetail(entry) {
        var gen = ++detailGen;
        item = entry;
        season = 0;
        box.textContent = '';
        var hero = make('div', 'hero');
        var closeBtn = make('button', 'x', '✕');
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.addEventListener('click', closeDetail);
        var heroIn = make('div', 'hero-in');
        var heroP = make('div', 'hero-p');
        var heroT = make('div', 'hero-t');
        var title = make('h2', '', entry.title);
        var meta = make('div', 'hero-meta');
        [entry.year, entry.type === 'tv' ? 'Series' : 'Movie'].filter(Boolean).forEach(function (t) { meta.appendChild(make('span', '', t)); });
        heroT.appendChild(title);
        heroT.appendChild(meta);
        heroIn.appendChild(heroP);
        heroIn.appendChild(heroT);
        loadImg(hero, entry.backdrop || entry.poster, 'w780', 'bd');
        loadImg(heroP, entry.poster, 'w185');
        hero.appendChild(closeBtn);
        hero.appendChild(heroIn);
        var body = make('div', 'body');
        var chips = make('div', 'chips');
        chips.hidden = true;
        var tag = make('p', 'tag');
        tag.hidden = true;
        var over = make('p', 'over', entry.overview || '');
        over.hidden = !entry.overview;
        var actions = make('div', 'actions');
        var play = make('button', 'pill solid', entry.type === 'tv' ? 'Play first episode' : 'Play');
        play.type = 'button';
        play.addEventListener('click', function () {
            var n = seasonNumbers(box._detail)[0] || 1;
            startPlay(entry, entry.type === 'tv' ? (season || n) : 1, 1, '');
        });
        actions.appendChild(play);
        body.appendChild(chips);
        body.appendChild(tag);
        body.appendChild(over);
        body.appendChild(actions);
        box.appendChild(hero);
        box.appendChild(body);
        modal.classList.add('open');
        box.scrollTop = 0;
        document.addEventListener('keydown', onModalKey, true);

        var detail = null;
        try { detail = await TV.api('/' + entry.type + '/' + entry.tid); } catch (e) {}
        if (gen !== detailGen) return;
        box._detail = detail;
        if (detail) {
            var rel = (detail.release_date || detail.first_air_date || '').slice(0, 4);
            meta.textContent = '';
            var bits = [rel || entry.year, entry.type === 'tv' ? 'Series' : 'Movie'];
            if (entry.type === 'movie' && detail.runtime) bits.push(TV.runtime(detail.runtime));
            if (entry.type === 'tv' && detail.number_of_seasons) bits.push(detail.number_of_seasons + (detail.number_of_seasons === 1 ? ' season' : ' seasons'));
            if (detail.vote_average > 0) bits.push('★ ' + detail.vote_average.toFixed(1));
            bits.filter(Boolean).forEach(function (t) { meta.appendChild(make('span', '', t)); });
            if (detail.tagline) { tag.textContent = detail.tagline; tag.hidden = false; }
            if (detail.overview) { over.textContent = detail.overview; over.hidden = false; }
            (detail.genres || []).forEach(function (g) { chips.appendChild(make('span', 'chip', g.name)); });
            chips.hidden = !chips.childNodes.length;
        }
        if (entry.type === 'tv') {
            var nums = seasonNumbers(detail);
            if (!nums.length) nums = [1];
            var wrap = make('div');
            var seasonsEl = make('div', 'seasons');
            var epsBox = make('div', 'eps');
            var btns = [];
            if (nums.length > 1) {
                nums.forEach(function (n) {
                    var b = make('button', 'sn', String(n));
                    b.type = 'button';
                    b.dataset.n = n;
                    b.title = 'Season ' + n;
                    b.addEventListener('click', function () { showSeason(entry, n, gen, epsBox, btns); });
                    btns.push(b);
                    seasonsEl.appendChild(b);
                });
                wrap.appendChild(seasonsEl);
            }
            wrap.appendChild(epsBox);
            body.appendChild(wrap);
            showSeason(entry, nums[0], gen, epsBox, btns);
        }
    }

    function loadHls() {
        if (window.Hls) return Promise.resolve(window.Hls);
        if (!hlsPromise) {
            hlsPromise = new Promise(function (resolve, reject) {
                var s = document.createElement('script');
                s.src = HLS_SRC;
                s.async = true;
                s.onload = function () { resolve(window.Hls); };
                s.onerror = function () { reject(new Error('hls.js failed to load')); };
                document.head.appendChild(s);
            });
            hlsPromise.catch(function () { hlsPromise = null; });
        }
        return hlsPromise;
    }

    var RESUME_KEY = 'tvResume';
    function resumeKey(ctx) {
        var e = ctx[0];
        return e.type + ':' + e.tid + (e.type === 'tv' ? ':' + ctx[1] + ':' + ctx[2] : '');
    }
    function loadResume(ctx) {
        var map = TV.store.json(RESUME_KEY) || {};
        var r = map[resumeKey(ctx)];
        return r && r.t > 5 ? r.t : 0;
    }
    function slim(e) {
        return { id: e.id, type: e.type, tid: e.tid, title: e.title, poster: e.poster || '', backdrop: e.backdrop || '', year: e.year || '', rating: e.rating || 0, overview: String(e.overview || '').slice(0, 300) };
    }
    function saveResume(p) {
        if (!p || !p.ctx || !p.watch) return;
        var v = p.video, t = v.currentTime, d = v.duration;
        if (!isFinite(t) || !isFinite(d) || d <= 0 || t < 5) return;
        var map = TV.store.json(RESUME_KEY) || {};
        var key = resumeKey(p.ctx);
        // Finished (nearly at the end): it leaves Continue Watching.
        if (d - t < 60 || t / d > 0.95) delete map[key];
        else map[key] = { t: Math.floor(t), d: Math.floor(d), ts: Date.now(), e: slim(p.ctx[0]), s: p.ctx[1], n: p.ctx[2], nm: p.ctx[3] || '' };
        var keys = Object.keys(map);
        if (keys.length > 200) {
            keys.sort(function (a, b) { return map[a].ts - map[b].ts; });
            keys.slice(0, keys.length - 200).forEach(function (k) { delete map[k]; });
        }
        TV.store.set(RESUME_KEY, JSON.stringify(map));
    }

    // ---- Continue Watching: everything started and not finished, newest first, one card per title
    var backfilled = {};
    function inProgress(r) {
        return r && r.t > 5 && r.d > 0 && r.d - r.t >= 60 && r.t / r.d <= 0.95;
    }
    function continueList() {
        var map = TV.store.json(RESUME_KEY) || {};
        var best = {};
        Object.keys(map).forEach(function (key) {
            var r = map[key];
            if (!inProgress(r)) return;
            var parts = key.split(':');
            var show = parts[0] + ':' + parts[1];
            if (!best[show] || r.ts > best[show].r.ts) best[show] = { key: key, r: r, parts: parts };
        });
        return Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) { return b.r.ts - a.r.ts; }).slice(0, 24);
    }
    function dropContinue(parts) {
        var map = TV.store.json(RESUME_KEY) || {};
        var show = parts[0] + ':' + parts[1];
        Object.keys(map).forEach(function (k) { if (k === show || k.indexOf(show + ':') === 0) delete map[k]; });
        TV.store.set(RESUME_KEY, JSON.stringify(map));
        renderContinue();
    }
    // Progress saved before titles were stored has no poster/title: fetch them once so those cards can show too.
    function backfill(key, parts) {
        if (backfilled[key]) return;
        backfilled[key] = true;
        TV.api('/' + parts[0] + '/' + parts[1]).then(function (d) {
            var entry = norm(d, parts[0]);
            if (!entry) return;
            var map = TV.store.json(RESUME_KEY) || {};
            if (!map[key]) return;
            map[key].e = slim(entry);
            if (parts.length > 3) { map[key].s = Number(parts[2]); map[key].n = Number(parts[3]); }
            TV.store.set(RESUME_KEY, JSON.stringify(map));
            renderContinue();
        }).catch(function () {});
    }
    function leftText(r) {
        var min = Math.round((r.d - r.t) / 60);
        return (min >= 1 ? TV.runtime(min) : '1m') + ' left';
    }
    function continueCard(item) {
        var r = item.r, entry = r.e;
        var wrap = make('div', 'cwrap');
        var card = make('button', 'card');
        card.type = 'button';
        card.title = 'Resume ' + entry.title;
        var poster = make('div', 'poster');
        if (!entry.poster) poster.textContent = entry.title.slice(0, 2).toUpperCase();
        else loadImg(poster, entry.poster, 'w342');
        var bar = make('div', 'bar-prog');
        var fill = document.createElement('i');
        fill.style.width = Math.max(2, Math.min(100, r.t / r.d * 100)) + '%';
        bar.appendChild(fill);
        poster.appendChild(bar);
        card.appendChild(poster);
        card.appendChild(make('div', 'card-t', entry.title));
        var s = r.s != null ? r.s : Number(item.parts[2]) || 1;
        var n = r.n != null ? r.n : Number(item.parts[3]) || 1;
        var sub = entry.type === 'tv' ? 'S' + s + ' E' + n + ' · ' + leftText(r) : leftText(r);
        card.appendChild(make('div', 'card-s', sub));
        card.addEventListener('click', function () {
            if (entry.type === 'tv') startPlay(entry, s, n, r.nm || '');
            else startPlay(entry, 1, 1, '');
        });
        var x = make('button', 'cx', '✕');
        x.type = 'button';
        x.title = 'Remove from Continue Watching';
        x.setAttribute('aria-label', 'Remove ' + entry.title + ' from Continue Watching');
        x.addEventListener('click', function (e) { e.stopPropagation(); dropContinue(item.parts); });
        wrap.appendChild(card);
        wrap.appendChild(x);
        return wrap;
    }
    function renderContinue() {
        var list = continueList();
        var shown = 0;
        var rowEl = make('div', 'row');
        list.forEach(function (item) {
            if (!item.r.e || !item.r.e.title) { backfill(item.key, item.parts); return; }
            rowEl.appendChild(continueCard(item));
            shown++;
        });
        contBox.textContent = '';
        if (!shown) { contBox.hidden = true; return; }
        var sec = make('div', 'sec');
        var head = make('div', 'sec-head');
        head.appendChild(make('h2', 'sec-title', 'Continue Watching'));
        sec.appendChild(head);
        sec.appendChild(rowEl);
        contBox.appendChild(sec);
        contBox.hidden = false;
    }

    function buildPlayer() {
        playerEl.textContent = '';
        var video = document.createElement('video');
        video.controls = true;
        video.playsInline = true;
        video.autoplay = true;
        var top = make('div', 'p-top');
        var back = make('button', 'p-btn', 'Back');
        back.type = 'button';
        back.addEventListener('click', closePlayer);
        var titles = make('div', 'p-titles');
        var t1 = make('div', 'p-t1');
        var t2 = make('div', 'p-t2');
        titles.appendChild(t1);
        titles.appendChild(t2);
        var next = make('button', 'p-btn', 'Next source');
        next.type = 'button';
        top.appendChild(back);
        top.appendChild(titles);
        top.appendChild(next);
        var stat = make('div', 'p-stat');
        playerEl.appendChild(video);
        playerEl.appendChild(top);
        playerEl.appendChild(stat);
        player = { video: video, t1: t1, t2: t2, stat: stat, next: next, hls: null, streams: [], index: 0, ctx: null, vc: null };
        next.addEventListener('click', function () { tryStream(player.index + 1, playGen); });
        player.vc = TV.attachControls(playerEl, video, {
            getHls: function () { return player && player.hls; },
            sources: function () {
                return {
                    list: player.streams.map(streamLabel),
                    index: player.index,
                    pick: function (i) { tryStream(i, playGen); }
                };
            }
        });
        playerEl.focus();
        var stallTimer = 0;
        var lastGood = 0;
        var stalls = 0;
        function clearStall() { clearTimeout(stallTimer); stallTimer = 0; }
        var lastSave = 0;
        video.addEventListener('playing', function () { player.buffering = false; setStatus(''); clearStall(); });
        video.addEventListener('pause', function () {
            clearStall();
            if (player && player.buffering) { player.buffering = false; setStatus(''); }
            saveResume(player);
        });
        video.addEventListener('ended', function () { saveResume(player); });
        window.addEventListener('pagehide', function () { if (player && player.video === video) saveResume(player); });
        video.addEventListener('timeupdate', function () {
            if (Math.abs(video.currentTime - lastGood) > 8) { lastGood = video.currentTime; stalls = 0; }
            if (!video.paused && Date.now() - lastSave > 5000) { lastSave = Date.now(); saveResume(player); }
        });
        video.addEventListener('waiting', function () {
            if (video.paused) return;
            player.buffering = true;
            setStatus('Buffering...', true);
            clearStall();
            stallTimer = setTimeout(function () {
                if (!player || player.video !== video || video.paused || !player.watch) return;
                if (stalls++ < 2) player.watch.again(); else { stalls = 0; player.watch.next('stalled'); }
            }, 20000);
        });
    }

    function streamLabel(stream, index) {
        var name = stream.providerName || stream.name || stream.provider || 'Source ' + (index + 1);
        var q = parseInt(String(stream.quality || ''), 10);
        return q ? name + ' · ' + q + 'p' : name;
    }

    function codecOk(lv) {
        var codec = lv && lv.videoCodec;
        if (!codec) return true;
        try {
            if (window.MediaSource && MediaSource.isTypeSupported) return MediaSource.isTypeSupported('video/mp4; codecs="' + codec + '"');
        } catch (e) {}
        return true;
    }

    function levelHasVideo(lv) {
        return (lv.height > 0 || (lv.videoCodec && lv.videoCodec.length)) && codecOk(lv);
    }

    function pickStartLevel(h, cap) {
        var best = -1;
        var bestHeight = 0;
        h.levels.forEach(function (lv, i) {
            if (!levelHasVideo(lv)) return;
            var height = lv.height || 0;
            if (height <= cap && height >= bestHeight) { best = i; bestHeight = height; }
        });
        if (best === -1) {
            h.levels.forEach(function (lv, i) {
                if (levelHasVideo(lv) && best === -1) best = i;
            });
        }
        return best;
    }

    function framesDecoded(video) {
        try {
            if (video.getVideoPlaybackQuality) return video.getVideoPlaybackQuality().totalVideoFrames;
        } catch (e) {}
        return -1;
    }

    function hasPicture(video, ms) {
        return new Promise(function (resolve) {
            var start = performance.now();
            (function check() {
                var frames = framesDecoded(video);
                if (video.videoWidth > 0 && video.readyState >= 2 && (video.paused || frames !== 0)) return resolve(true);
                if (performance.now() - start > ms) return resolve(false);
                setTimeout(check, 250);
            })();
        });
    }

    function setStatus(text, spin, retry) {
        var stat = player.stat;
        stat.textContent = '';
        stat.hidden = !text;
        if (!text) return;
        if (spin) stat.appendChild(make('div', 'spinner'));
        stat.appendChild(make('div', '', text));
        if (retry) {
            var btn = make('button', 'pill', 'Try again');
            btn.type = 'button';
            btn.addEventListener('click', function () { startPlay.apply(null, player.ctx); });
            stat.appendChild(btn);
        }
    }

    function teardownMedia() {
        if (!player) return;
        if (player.hls) {
            try { player.hls.destroy(); } catch (e) {}
            player.hls = null;
        }
        player.video.onerror = null;
        try { player.video.pause(); } catch (e) {}
        player.video.removeAttribute('src');
        try { player.video.load(); } catch (e) {}
    }

    function closePlayer() {
        saveResume(player);
        playGen++;
        clearTimeout(idleTimer);
        teardownMedia();
        playerEl.classList.remove('open', 'idle');
        playerEl.textContent = '';
        player = null;
        document.removeEventListener('keydown', onPlayerKey, true);
        renderContinue();
    }

    function onPlayerKey(e) {
        if (e.key === 'Escape') {
            e.stopPropagation();
            closePlayer();
        }
    }

    function waitMedia(video, ms) {
        return new Promise(function (resolve, reject) {
            var timer = setTimeout(function () { cleanup(); reject(new Error('timeout')); }, ms);
            function ok() { cleanup(); resolve(); }
            function bad() { cleanup(); reject(new Error('media error')); }
            function cleanup() {
                clearTimeout(timer);
                video.removeEventListener('loadedmetadata', ok);
                video.removeEventListener('error', bad);
            }
            video.addEventListener('loadedmetadata', ok);
            video.addEventListener('error', bad);
        });
    }

    function retryPolicy(ttfb, load, tries) {
        return {
            default: {
                maxTimeToFirstByteMs: ttfb,
                maxLoadTimeMs: load,
                timeoutRetry: { maxNumRetry: 1, retryDelayMs: 0, maxRetryDelayMs: 0 },
                errorRetry: {
                    maxNumRetry: tries,
                    retryDelayMs: 1000,
                    maxRetryDelayMs: 1000,
                    backoff: 'linear',
                    shouldRetry: function (cfg, count, timeout, response) {
                        return count < cfg.maxNumRetry && (timeout || !response || [0, 408, 425, 429, 500, 503, 504].indexOf(response.code) > -1);
                    }
                }
            }
        };
    }

    function isVideoLevel(lv) {
        return lv && (lv.height > 0 || (lv.videoCodec && lv.videoCodec.length > 0));
    }

    function sortStreams(data) {
        var q = function (x) { return parseInt(String(x.quality || '0'), 10) || 0; };
        var hlsFirst = function (x) { return x.type === 'hls' ? 0 : 1; };
        var streams = ((data && data.streams) || []).filter(function (x) { return x && x.url && x.type !== 'dash'; });
        var within = streams.filter(function (x) { return !q(x) || q(x) <= 1080; });
        var above = streams.filter(function (x) { return q(x) > 1080; });
        within.sort(function (a, b) { return hlsFirst(a) - hlsFirst(b) || q(b) - q(a); });
        return within.concat(above);
    }

    async function fetchSources(entry, s, e, fresh) {
        var path = entry.type === 'tv' ? '/stream/tv/' + entry.tid + '/' + s + '/' + e : '/stream/movie/' + entry.tid;
        if (fresh) path += '?fresh=' + Date.now();
        return sortStreams(await TV.api(path, 25000));
    }

    function goodKey(entry, s, e) {
        return 'tvGood:' + entry.type + ':' + entry.tid + (entry.type === 'tv' ? ':' + s + ':' + e : '');
    }

    function providerOf(stream) {
        return String(stream.providerName || stream.name || stream.provider || '').toLowerCase();
    }

    function failCount(p, stream) {
        return (p.failed && p.failed[stream.url]) || 0;
    }

    function markFailed(p, stream) {
        if (!p.failed) p.failed = {};
        p.failed[stream.url] = (p.failed[stream.url] || 0) + 1;
        var name = providerOf(stream);
        if (!p.failedProv) p.failedProv = {};
        p.failedProv[name] = (p.failedProv[name] || 0) + 1;
    }

    function rankStreams(p, list) {
        var good = TV.store.get(goodKey(p.ctx[0], p.ctx[1], p.ctx[2])) || '';
        var order = list.map(function (x, i) { return { x: x, i: i }; });
        order.sort(function (a, b) {
            var fa = failCount(p, a.x);
            var fb = failCount(p, b.x);
            if (fa !== fb) return fa - fb;
            var ga = good && providerOf(a.x) === good ? 0 : 1;
            var gb = good && providerOf(b.x) === good ? 0 : 1;
            if (ga !== gb) return ga - gb;
            return a.i - b.i;
        });
        return order.map(function (o) { return o.x; });
    }

    function mergeStreams(p, incoming) {
        var seen = {};
        var out = [];
        incoming.concat(p.streams || []).forEach(function (x) {
            if (!x || !x.url || seen[x.url]) return;
            seen[x.url] = true;
            out.push(x);
        });
        return rankStreams(p, out);
    }

    async function recover(gen, resume) {
        var p = player;
        if (!p || gen !== playGen) return;
        p.round = (p.round || 0) + 1;
        var tried = Object.keys(p.failed || {}).length;
        setStatus('Looking for more sources (' + tried + ' tried)...', true);
        await TV.sleep(Math.min(6000, 1000 * p.round));
        if (gen !== playGen || player !== p) return;
        try {
            var fresh = await fetchSources(p.ctx[0], p.ctx[1], p.ctx[2], true);
            if (gen !== playGen || player !== p) return;
            if (fresh.length) {
                p.streams = mergeStreams(p, fresh);
                p.next.hidden = p.streams.length < 2;
            } else {
                p.streams = rankStreams(p, p.streams);
            }
        } catch (err) {
            p.streams = rankStreams(p, p.streams);
        }
        if (gen !== playGen || player !== p) return;
        tryStream(0, gen, [], resume);
    }

    async function tryStream(index, gen, reasons, resume, viaHub) {
        if (gen !== playGen || !player) return;
        var p = player;
        reasons = reasons || [];
        var at = resume > 1 ? resume : (p.video.currentTime > 1 ? p.video.currentTime : 0);
        if (!p.streams.length || index >= p.streams.length) {
            teardownMedia();
            console.warn('[tv] every source failed, retrying', reasons);
            recover(gen, at);
            return;
        }
        p.index = index;
        p.netRetry = 0;
        p.mediaRetry = 0;
        p.fileRetry = 0;
        var stream = p.streams[index];
        var label = streamLabel(stream, index);
        setStatus((index ? 'Trying ' : 'Loading ') + label + ' (' + (index + 1) + '/' + p.streams.length + ')...', true);
        teardownMedia();
        var isFile = stream.type === 'file' || /\.(mp4|m4v|webm)(\?|$)/i.test(stream.url);
        if (!isFile && window.kNet) viaHub = true;
        // Normal route first. The net hub (wisp) is only a fallback for HLS streams that failed.
        var url = viaHub ? stream.url : TV.proxyUrl(stream.url);
        var started = false;
        var cur = function () { return p.video.currentTime > 1 ? p.video.currentTime : at; };
        var moveOn = function (why) {
            if (gen !== playGen || player !== p) return;
            var where = cur();
            console.warn('[tv] ' + label + (viaHub ? ' (net hub)' : '') + ' failed: ' + why);
            if (!viaHub && !isFile && window.kNet && !(p.hubTried && p.hubTried[stream.url])) {
                if (!p.hubTried) p.hubTried = {};
                p.hubTried[stream.url] = 1;
                teardownMedia();
                tryStream(index, gen, reasons, where, true);
                return;
            }
            markFailed(p, stream);
            tryStream(index + 1, gen, reasons.concat([label + ': ' + why]), where);
        };
        var sameAgain = function () {
            if (gen !== playGen || player !== p) return;
            var where = cur();
            teardownMedia();
            tryStream(index, gen, reasons, where, viaHub);
        };
        try {
            p.video.preload = 'auto';
            if (isFile) {
                p.video.src = url;
                await waitMedia(p.video, 25000);
                if (gen !== playGen) return;
                if (at > 1) p.video.currentTime = at;
            } else {
                var Hls = await loadHls();
                if (gen !== playGen) return;
                if (Hls && Hls.isSupported()) {
                    var h = new Hls({
                        loader: viaHub ? TV.HubLoader : Hls.DefaultConfig.loader,
                        autoStartLoad: false,
                        startPosition: at > 1 ? at : -1,
                        capLevelToPlayerSize: true,
                        capLevelOnFPSDrop: true,
                        maxBufferLength: 30,
                        maxMaxBufferLength: 40,
                        backBufferLength: 30,
                        manifestLoadPolicy: retryPolicy(Infinity, 20000, 2),
                        playlistLoadPolicy: retryPolicy(10000, 20000, 3),
                        fragLoadPolicy: retryPolicy(10000, 120000, 4)
                    });
                    p.hls = h;
                    await new Promise(function (resolve, reject) {
                        var parsed = false;
                        var timer = setTimeout(function () { reject(new Error('manifest timeout')); }, 20000);
                        h.on(Hls.Events.FRAG_BUFFERED, function () { p.netRetry = 0; p.mediaRetry = 0; });
                        h.on(Hls.Events.ERROR, function (ev, data) {
                            if (!data || !data.fatal) return;
                            if (!parsed) {
                                clearTimeout(timer);
                                reject(new Error(data.details || 'fatal error'));
                                return;
                            }
                            if (gen !== playGen || h !== p.hls) return;
                            if (data.type === Hls.ErrorTypes.NETWORK_ERROR && p.netRetry++ < 4) {
                                setStatus('Reconnecting...', true);
                                setTimeout(function () { if (gen === playGen && h === p.hls) h.startLoad(p.video.currentTime || -1); }, 1000 * p.netRetry);
                            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && p.mediaRetry++ < 3) {
                                h.recoverMediaError();
                            } else {
                                moveOn(data.details || 'stream stopped');
                            }
                        });
                        h.on(Hls.Events.MANIFEST_PARSED, function () {
                            parsed = true;
                            clearTimeout(timer);
                            var savedQ = parseInt(TV.store.get('tvQuality'), 10);
                            var idx = pickStartLevel(h, savedQ > 0 ? savedQ : 1080);
                            if (idx === -1) { reject(new Error('no video track in playlist')); return; }
                            h.startLevel = idx;
                            h.startLoad(at > 1 ? at : -1);
                            if (savedQ > 0) h.currentLevel = idx;
                            resolve();
                        });
                        h.on(Hls.Events.LEVEL_SWITCHED, function (ev, data) {
                            if (isVideoLevel(h.levels[data.level])) return;
                            var fix = pickStartLevel(h, 1080);
                            if (fix !== -1 && fix !== data.level) h.currentLevel = fix;
                        });
                        h.loadSource(url);
                        h.attachMedia(p.video);
                    });
                } else if (p.video.canPlayType('application/vnd.apple.mpegurl')) {
                    p.video.src = url;
                    await waitMedia(p.video, 25000);
                    if (gen !== playGen) return;
                    if (at > 1) p.video.currentTime = at;
                } else {
                    throw new Error('this browser cannot play HLS');
                }
            }
            if (gen !== playGen) return;
            if (p.vc) p.vc.reset();
            var pr = p.video.play();
            if (pr && pr.catch) pr.catch(function () { setStatus(''); });
            var picture = await hasPicture(p.video, 25000);
            if (gen !== playGen) return;
            if (!picture) throw new Error(p.video.readyState >= 2 ? 'audio only, the video track did not load or decode' : 'no data received');
            started = true;
            p.round = 0;
            if (p.ctx) TV.store.set(goodKey(p.ctx[0], p.ctx[1], p.ctx[2]), providerOf(stream));
            p.watch = { index: index, again: sameAgain, next: moveOn };
            var blackAt = p.video.currentTime;
            setTimeout(function () {
                if (gen !== playGen || player !== p || p.index !== index || p.video.paused) return;
                if (p.video.currentTime - blackAt > 2 && framesDecoded(p.video) === 0) moveOn('audio plays but no video frames decode');
            }, 6000);
            p.video.onerror = function () {
                if (!started || gen !== playGen || player !== p) return;
                if (p.fileRetry++ < 2) sameAgain(); else moveOn('playback error');
            };
        } catch (e) {
            moveOn(e && e.message ? e.message : 'failed');
        }
    }

    async function startPlay(entry, s, e, name) {
        var gen = ++playGen;
        if (!player || !playerEl.classList.contains('open')) {
            buildPlayer();
            playerEl.classList.add('open');
            document.addEventListener('keydown', onPlayerKey, true);
        } else {
            teardownMedia();
        }
        player.ctx = [entry, s, e, name];
        player.t1.textContent = entry.title;
        player.t2.textContent = entry.type === 'tv' ? 'S' + s + ' E' + e + (name ? ' · ' + name : '') : entry.year;
        setStatus('Finding sources...', true);
        var round = 0;
        while (gen === playGen && player) {
            try {
                var list = await fetchSources(entry, s, e);
                if (gen !== playGen || !player) return;
                if (list.length) {
                    player.failed = {};
                    player.failedProv = {};
                    player.streams = rankStreams(player, list);
                    player.next.hidden = list.length < 2;
                    tryStream(0, gen, [], loadResume(player.ctx));
                    return;
                }
                setStatus('No sources have this one yet. Still looking...', true);
            } catch (err) {
                if (gen !== playGen || !player) return;
                setStatus('Still trying to reach the movie server...', true);
            }
            round++;
            await TV.sleep(Math.min(8000, 2000 * round));
        }
    }

    TV.register('movies', {
        show: function () {
            renderContinue();
            if (!homeLoaded && !query) loadHome();
        },
        hide: function () {
            if (playerEl.classList.contains('open')) closePlayer();
            if (modal.classList.contains('open')) closeDetail();
        },
        query: function () { return query; },
        search: runSearch
    });
})();
