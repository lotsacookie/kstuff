(function () {
    var API_BASE = 'https://iptv-org.github.io/api/';
    var MIRROR_BASE = 'https://cdn.jsdelivr.net/gh/iptv-org/api@gh-pages/';
    var HLS_SRC = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    var PAGE_SIZE = 48;
    var STALL_MS = 15000;
    var HLS_MIME = 'application/vnd.apple.mpegurl';

    var el = TV.el;
    var store = TV.store;
    var video = el('video');
    var overlay = el('overlay');
    var nowBox = el('now');
    var nowLogo = el('nowLogo');
    var nowName = el('nowName');
    var nowMeta = el('nowMeta');
    var altBtn = el('altBtn');
    var search = el('search');
    var countrySelect = el('country');
    var categorySelect = el('category');
    var countEl = el('count');
    var grid = el('grid');
    var sentinel = el('sentinel');

    var channels = [];
    var countryNames = {};
    var countryFlags = {};
    var categoryNames = {};
    var filtered = [];
    var shown = 0;
    var cards = {};
    var current = null;
    var streamIndex = 0;
    var hls = null;
    var hlsPromise = null;
    var stallTimer = 0;
    var playToken = 0;
    var livePromise = null;
    var liveReady = false;
    var query = '';

    function fetchJSON(url) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 30000);
        return fetch(url, { signal: controller.signal }).then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        }).then(function (data) {
            clearTimeout(timer);
            return data;
        }, function (err) {
            clearTimeout(timer);
            throw err;
        });
    }

    function getApi(name) {
        return fetchJSON(API_BASE + name).catch(function () { return fetchJSON(MIRROR_BASE + name); });
    }

    function qualityValue(q) {
        var n = parseInt(q, 10);
        return isNaN(n) ? 0 : n;
    }

    function initials(name) {
        var words = String(name || '').trim().split(/\s+/).filter(Boolean);
        if (!words.length) return 'TV';
        if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
        return (words[0][0] + words[1][0]).toUpperCase();
    }

    function setLogo(box, channel) {
        box.textContent = '';
        if (channel.logo) {
            var img = document.createElement('img');
            img.alt = '';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.referrerPolicy = 'no-referrer';
            img.onerror = function () { box.textContent = initials(channel.name); };
            img.src = channel.logo;
            box.appendChild(img);
        } else {
            box.textContent = initials(channel.name);
        }
    }

    function countryLabel(code) {
        if (!code) return '';
        var flag = countryFlags[code] || '';
        return (flag ? flag + ' ' : '') + (countryNames[code] || code);
    }

    function categoryLabel(channel) {
        if (!channel.categories.length) return '';
        return channel.categories.map(function (id) { return categoryNames[id] || id; }).join(', ');
    }

    function metaLine(channel) {
        return [countryLabel(channel.country), categoryLabel(channel)].filter(Boolean).join(' · ');
    }

    function setOverlay(text, spinning, clickable) {
        overlay.hidden = false;
        overlay.className = 'overlay' + (clickable ? ' click' : '');
        overlay.textContent = '';
        if (spinning) overlay.appendChild(TV.make('div', 'spinner'));
        overlay.appendChild(TV.make('div', '', text));
    }

    function hideOverlay() { overlay.hidden = true; }

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

    function clearStall() {
        clearTimeout(stallTimer);
        stallTimer = 0;
    }

    function stopStream() {
        clearStall();
        if (hls) {
            try { hls.destroy(); } catch (e) {}
            hls = null;
        }
        try { video.pause(); } catch (e) {}
        video.removeAttribute('src');
        try { video.load(); } catch (e) {}
    }

    function updateAltButton() {
        if (!current) { altBtn.hidden = true; return; }
        altBtn.hidden = current.streams.length < 2;
        altBtn.textContent = 'Try another feed (' + (streamIndex + 1) + '/' + current.streams.length + ')';
    }

    function failChannel(token) {
        if (token !== playToken) return;
        clearStall();
        if (current && streamIndex + 1 < current.streams.length) {
            streamIndex++;
            updateAltButton();
            startStream(token);
            return;
        }
        stopStream();
        setOverlay('This channel is not available right now. Try another one.', false, false);
    }

    function startStream(existingToken) {
        var token = existingToken || ++playToken;
        if (existingToken) playToken = existingToken;
        var url = current.streams[streamIndex].url;
        stopStream();
        setOverlay('Loading ' + current.name + '...', true, false);
        stallTimer = setTimeout(function () { failChannel(token); }, STALL_MS);
        var native = video.canPlayType(HLS_MIME);

        function nativePlay() {
            video.src = url;
            var p = video.play();
            if (p && p.catch) p.catch(function () {});
        }

        loadHls().then(function (Hls) {
            if (token !== playToken) return;
            if (Hls && Hls.isSupported()) {
                hls = new Hls({ enableWorker: true, lowLatencyMode: false, manifestLoadingMaxRetry: 1, levelLoadingMaxRetry: 1, fragLoadingMaxRetry: 2 });
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    if (token !== playToken) return;
                    var p = video.play();
                    if (p && p.catch) p.catch(function () {
                        if (token === playToken) setOverlay('Tap to play', false, true);
                    });
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (token !== playToken || !data || !data.fatal) return;
                    failChannel(token);
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else if (native) {
                nativePlay();
            } else {
                failChannel(token);
            }
        }, function () {
            if (token !== playToken) return;
            if (native) nativePlay(); else failChannel(token);
        });
    }

    function playChannel(channel) {
        current = channel;
        streamIndex = 0;
        Object.keys(cards).forEach(function (id) { cards[id].classList.remove('active'); });
        if (cards[channel.id]) cards[channel.id].classList.add('active');
        nowBox.hidden = false;
        setLogo(nowLogo, channel);
        nowName.textContent = channel.name;
        nowMeta.textContent = metaLine(channel);
        updateAltButton();
        startStream();
    }

    video.addEventListener('playing', function () { clearStall(); hideOverlay(); });
    video.addEventListener('waiting', function () {
        if (current && !video.paused && !video.ended) setOverlay('Buffering...', true, false);
    });
    video.addEventListener('canplay', function () { if (!video.paused) hideOverlay(); });
    video.addEventListener('error', function () {
        if (!current || hls || !video.getAttribute('src')) return;
        failChannel(playToken);
    });

    overlay.addEventListener('click', function () {
        if (!overlay.classList.contains('click')) return;
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
    });

    altBtn.addEventListener('click', function () {
        if (!current || current.streams.length < 2) return;
        streamIndex = (streamIndex + 1) % current.streams.length;
        updateAltButton();
        startStream();
    });

    function makeCard(channel) {
        var card = TV.make('button', 'ch' + (current && current.id === channel.id ? ' active' : ''));
        card.type = 'button';
        card.title = channel.name;
        var logo = TV.make('div', 'ch-logo');
        setLogo(logo, channel);
        card.appendChild(logo);
        card.appendChild(TV.make('div', 'ch-name', channel.name));
        card.appendChild(TV.make('div', 'ch-meta', metaLine(channel) || ' '));
        card.addEventListener('click', function () { playChannel(channel); });
        cards[channel.id] = card;
        return card;
    }

    function renderMore() {
        if (shown >= filtered.length) return;
        var frag = document.createDocumentFragment();
        var end = Math.min(shown + PAGE_SIZE, filtered.length);
        for (var i = shown; i < end; i++) frag.appendChild(makeCard(filtered[i]));
        shown = end;
        grid.appendChild(frag);
    }

    function updateCount() {
        if (!liveReady) { countEl.textContent = ''; return; }
        countEl.textContent = filtered.length + (filtered.length === 1 ? ' channel' : ' channels');
    }

    function applyFilters() {
        var q = query.trim().toLowerCase();
        var country = countrySelect.value;
        var category = categorySelect.value;
        filtered = channels.filter(function (c) {
            if (country && c.country !== country) return false;
            if (category && c.categories.indexOf(category) === -1) return false;
            if (q && c.search.indexOf(q) === -1) return false;
            return true;
        });
        shown = 0;
        cards = {};
        grid.textContent = '';
        if (!filtered.length) {
            grid.appendChild(TV.make('div', 'message', 'No channels match your filters.'));
        } else {
            renderMore();
        }
        updateCount();
    }

    function showSkeleton() {
        grid.textContent = '';
        for (var i = 0; i < 12; i++) grid.appendChild(TV.make('div', 'cskel'));
    }

    function showLoadError() {
        grid.textContent = '';
        var box = TV.make('div', 'message', 'Could not load the channel list.');
        var retry = TV.make('button', 'pill', 'Try again');
        retry.type = 'button';
        retry.addEventListener('click', function () { ensureLive(); });
        box.appendChild(document.createElement('br'));
        box.appendChild(retry);
        grid.appendChild(box);
    }

    function fillSelect(select, firstLabel, items) {
        select.textContent = '';
        var first = document.createElement('option');
        first.value = '';
        first.textContent = firstLabel;
        select.appendChild(first);
        items.forEach(function (item) {
            var o = document.createElement('option');
            o.value = item.value;
            o.textContent = item.label;
            select.appendChild(o);
        });
    }

    function buildData(raw) {
        var channelList = raw[0] || [];
        var streamList = raw[1] || [];
        var logoList = raw[2] || [];
        var categoryList = raw[3] || [];
        var countryList = raw[4] || [];

        countryList.forEach(function (c) {
            countryNames[c.code] = c.name;
            countryFlags[c.code] = c.flag || '';
        });
        categoryList.forEach(function (c) { categoryNames[c.id] = c.name; });

        var streamMap = {};
        streamList.forEach(function (s) {
            if (!s || !s.channel || !s.url) return;
            if (!/^https:\/\//i.test(s.url)) return;
            if (s.referrer || s.user_agent) return;
            var list = streamMap[s.channel] || (streamMap[s.channel] = []);
            for (var i = 0; i < list.length; i++) if (list[i].url === s.url) return;
            list.push({ url: s.url, q: qualityValue(s.quality) });
        });
        Object.keys(streamMap).forEach(function (id) {
            streamMap[id].sort(function (a, b) { return b.q - a.q; });
        });

        var logoMap = {};
        logoList.forEach(function (l) {
            if (!l || !l.channel || !l.url || !/^https:\/\//i.test(l.url)) return;
            var existing = logoMap[l.channel];
            if (!existing || (l.in_use && !existing.in_use)) logoMap[l.channel] = l;
        });

        channels = [];
        channelList.forEach(function (c) {
            if (!c || c.is_nsfw || c.closed) return;
            var st = streamMap[c.id];
            if (!st || !st.length) return;
            var alt = Array.isArray(c.alt_names) ? c.alt_names.join(' ') : '';
            channels.push({
                id: c.id,
                name: c.name,
                country: c.country || '',
                categories: Array.isArray(c.categories) ? c.categories : [],
                logo: logoMap[c.id] ? logoMap[c.id].url : '',
                streams: st,
                search: (c.name + ' ' + alt).toLowerCase()
            });
        });
        channels.sort(function (a, b) { return a.name.localeCompare(b.name); });

        var usedCountries = {};
        var usedCategories = {};
        channels.forEach(function (c) {
            if (c.country) usedCountries[c.country] = true;
            c.categories.forEach(function (id) { usedCategories[id] = true; });
        });

        var countryItems = Object.keys(usedCountries).map(function (code) {
            return { value: code, label: (countryFlags[code] ? countryFlags[code] + ' ' : '') + (countryNames[code] || code), sort: countryNames[code] || code };
        }).sort(function (a, b) { return a.sort.localeCompare(b.sort); });

        var categoryItems = Object.keys(usedCategories).map(function (id) {
            return { value: id, label: categoryNames[id] || id };
        }).sort(function (a, b) { return a.label.localeCompare(b.label); });

        fillSelect(countrySelect, 'All countries', countryItems);
        fillSelect(categorySelect, 'All categories', categoryItems);

        var wanted = store.get('tvCountry');
        if (wanted === null) {
            var region = ((navigator.language || 'en-US').split('-')[1] || '').toUpperCase();
            wanted = usedCountries[region] ? region : 'US';
        }
        countrySelect.value = usedCountries[wanted] ? wanted : '';

        var savedCategory = store.get('tvCategory');
        categorySelect.value = savedCategory && usedCategories[savedCategory] ? savedCategory : '';
    }

    function ensureLive() {
        if (liveReady) return Promise.resolve();
        if (livePromise) return livePromise;
        showSkeleton();
        countEl.textContent = 'Loading channels...';
        livePromise = Promise.all([
            getApi('channels.json'),
            getApi('streams.json'),
            getApi('logos.json').catch(function () { return []; }),
            getApi('categories.json').catch(function () { return []; }),
            getApi('countries.json').catch(function () { return []; })
        ]).then(function (raw) {
            buildData(raw);
            liveReady = true;
            applyFilters();
        }).catch(function () {
            livePromise = null;
            countEl.textContent = '';
            showLoadError();
        });
        return livePromise;
    }

    countrySelect.addEventListener('change', function () {
        store.set('tvCountry', countrySelect.value);
        if (liveReady) applyFilters();
    });
    categorySelect.addEventListener('change', function () {
        store.set('tvCategory', categorySelect.value);
        if (liveReady) applyFilters();
    });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            if (entries[0] && entries[0].isIntersecting && liveReady) renderMore();
        }, { rootMargin: '400px 0px' }).observe(sentinel);
    } else {
        window.addEventListener('scroll', function () {
            if (!liveReady) return;
            if (sentinel.getBoundingClientRect().top < window.innerHeight + 400) renderMore();
        }, { passive: true });
    }

    TV.register('live', {
        show: function () { ensureLive(); },
        hide: function () { try { video.pause(); } catch (e) {} },
        query: function () { return query; },
        search: function (value) {
            query = value;
            if (liveReady) applyFilters();
        }
    });
})();
