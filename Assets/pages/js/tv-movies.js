(function () {
    var HLS_SRC = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    var make = TV.make;
    var el = TV.el;
    var secs = el('mvSecs');
    var feat = el('mvFeat');
    var home = el('mvHome');
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
        var src = TV.img(path, size);
        if (!src) return;
        var img = document.createElement('img');
        img.alt = '';
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        img.onload = function () { img.classList.add('in'); };
        img.onerror = function () { img.remove(); };
        if (cls) img.className = cls;
        img.src = src;
        holder.appendChild(img);
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

    async function loadHome() {
        var gen = ++homeGen;
        feat.hidden = true;
        secs.textContent = '';
        secs.appendChild(skeletonRow());
        secs.appendChild(skeletonRow());
        try {
            await TV.resolveHost();
            var data = TV.homeData;
            if (!data || !Array.isArray(data.rows)) data = await TV.api('/home');
            if (gen !== homeGen) return;
            homeLoaded = true;
            paintHome(data);
        } catch (e) {
            if (gen !== homeGen) return;
            secs.textContent = '';
            secs.appendChild(errorBlock(e, function () { TV.homeData = null; loadHome(); }));
        }
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
        player = { video: video, t1: t1, t2: t2, stat: stat, next: next, hls: null, streams: [], index: 0, ctx: null };
        next.addEventListener('click', function () { tryStream(player.index + 1, playGen); });
        function wake() {
            playerEl.classList.remove('idle');
            clearTimeout(idleTimer);
            idleTimer = setTimeout(function () { if (!video.paused) playerEl.classList.add('idle'); }, 3000);
        }
        playerEl.addEventListener('mousemove', wake);
        playerEl.addEventListener('touchstart', wake, { passive: true });
        video.addEventListener('playing', function () { setStatus(''); wake(); });
        video.addEventListener('waiting', function () { setStatus('Buffering...', true); });
        video.addEventListener('pause', function () { playerEl.classList.remove('idle'); });
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
        try { player.video.pause(); } catch (e) {}
        player.video.removeAttribute('src');
        try { player.video.load(); } catch (e) {}
    }

    function closePlayer() {
        playGen++;
        clearTimeout(idleTimer);
        teardownMedia();
        playerEl.classList.remove('open', 'idle');
        playerEl.textContent = '';
        player = null;
        document.removeEventListener('keydown', onPlayerKey, true);
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

    async function tryStream(index, gen) {
        if (gen !== playGen || !player) return;
        var p = player;
        if (index >= p.streams.length) {
            teardownMedia();
            setStatus('None of the sources would play this. Try again in a moment.', false, true);
            return;
        }
        p.index = index;
        var stream = p.streams[index];
        var label = stream.providerName || stream.name || stream.provider || ('source ' + (index + 1));
        setStatus((index ? 'Trying ' : 'Loading ') + label + '...', true);
        teardownMedia();
        var url = TV.proxyUrl(stream.url);
        try {
            if (stream.type === 'file' || /\.(mp4|m4v|webm)(\?|$)/i.test(stream.url)) {
                p.video.src = url;
                await waitMedia(p.video, 20000);
            } else {
                var Hls = await loadHls();
                if (gen !== playGen) return;
                if (Hls && Hls.isSupported()) {
                    await new Promise(function (resolve, reject) {
                        var h = new Hls({ enableWorker: true, manifestLoadingMaxRetry: 1, levelLoadingMaxRetry: 1, fragLoadingMaxRetry: 2 });
                        p.hls = h;
                        var timer = setTimeout(function () { reject(new Error('timeout')); }, 20000);
                        h.on(Hls.Events.MANIFEST_PARSED, function () { clearTimeout(timer); resolve(); });
                        h.on(Hls.Events.ERROR, function (ev, data) {
                            if (data && data.fatal) { clearTimeout(timer); reject(new Error('hls error')); }
                        });
                        h.loadSource(url);
                        h.attachMedia(p.video);
                    });
                    if (p.hls) {
                        p.hls.on(Hls.Events.ERROR, function (ev, data) {
                            if (gen === playGen && data && data.fatal) tryStream(p.index + 1, gen);
                        });
                    }
                } else if (p.video.canPlayType('application/vnd.apple.mpegurl')) {
                    p.video.src = url;
                    await waitMedia(p.video, 20000);
                } else {
                    throw new Error('no hls support');
                }
            }
            if (gen !== playGen) return;
            var pr = p.video.play();
            if (pr && pr.catch) pr.catch(function () { setStatus(''); });
        } catch (e) {
            if (gen !== playGen) return;
            tryStream(index + 1, gen);
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
        try {
            var path = entry.type === 'tv' ? '/stream/tv/' + entry.tid + '/' + s + '/' + e : '/stream/movie/' + entry.tid;
            var data = await TV.api(path, 25000);
            if (gen !== playGen || !player) return;
            var streams = (data.streams || []).filter(function (x) { return x && x.url; });
            if (!streams.length) {
                setStatus('No sources have this one right now. Try another title, or check back later.', false, true);
                return;
            }
            player.streams = streams;
            player.next.hidden = streams.length < 2;
            tryStream(0, gen);
        } catch (err) {
            if (gen !== playGen || !player) return;
            setStatus(TV.errText(err), false, true);
        }
    }

    TV.register('movies', {
        show: function () {
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
