(function () {
    var ICONS = {
        play: '<path d="M8 5v14l11-7z"/>',
        pause: '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>',
        back: '<path d="M12 5V2L7 6.5 12 11V8a5 5 0 1 1-5 5H5a7 7 0 1 0 7-8z"/><text x="12" y="16.5" font-size="6.5" text-anchor="middle" fill="currentColor" stroke="none" font-weight="700">10</text>',
        fwd: '<path d="M12 5V2l5 4.5L12 11V8a5 5 0 1 0 5 5h2a7 7 0 1 1-7-8z"/><text x="12" y="16.5" font-size="6.5" text-anchor="middle" fill="currentColor" stroke="none" font-weight="700">10</text>',
        vol: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        mute: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="m17 9 5 6m0-6-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
        exit: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
        pip: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="12" y="11" width="7" height="5" rx="1"/>',
        gear: '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    };

    function icon(name) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('fill', 'currentColor');
        svg.innerHTML = ICONS[name];
        return svg;
    }

    function setIcon(btn, name) {
        btn.textContent = '';
        btn.appendChild(icon(name));
    }

    function button(name, label, onClick) {
        var b = TV.make('button', 'vc-btn');
        b.type = 'button';
        b.title = label;
        b.setAttribute('aria-label', label);
        setIcon(b, name);
        b.addEventListener('click', function (e) { e.stopPropagation(); onClick(); });
        return b;
    }

    TV.attachControls = function (host, video, opts) {
        opts = opts || {};
        video.controls = false;
        video.removeAttribute('controls');
        host.classList.add('has-vc');
        host.tabIndex = 0;

        var bar = TV.make('div', 'vc');
        var seekWrap = TV.make('div', 'vc-seek');
        var buf = TV.make('div', 'vc-buf');
        var fill = TV.make('div', 'vc-fill');
        var thumb = TV.make('div', 'vc-thumb');
        var tip = TV.make('div', 'vc-tip');
        seekWrap.append(buf, fill, thumb, tip);

        var row = TV.make('div', 'vc-row');
        var playBtn = button('play', 'Play', toggle);
        var backBtn = button('back', 'Back 10 seconds', function () { skip(-10); });
        var fwdBtn = button('fwd', 'Forward 10 seconds', function () { skip(10); });
        var muteBtn = button('vol', 'Mute', function () { video.muted = !video.muted; });
        var vol = document.createElement('input');
        vol.type = 'range';
        vol.min = 0;
        vol.max = 1;
        vol.step = 0.02;
        vol.value = 1;
        vol.className = 'vc-vol';
        vol.setAttribute('aria-label', 'Volume');
        vol.addEventListener('click', function (e) { e.stopPropagation(); });
        vol.addEventListener('input', function () {
            video.volume = Number(vol.value);
            video.muted = Number(vol.value) === 0;
        });
        var time = TV.make('div', 'vc-time', '0:00');
        var spacer = TV.make('div', 'vc-spacer');
        var menuBtn = button('gear', 'Settings', function () { toggleMenu(); });
        var pipBtn = button('pip', 'Picture in picture', function () {
            if (document.pictureInPictureElement) document.exitPictureInPicture().catch(function () {});
            else if (video.requestPictureInPicture) video.requestPictureInPicture().catch(function () {});
        });
        var fsBtn = button('full', 'Fullscreen', toggleFull);
        var menu = TV.make('div', 'vc-menu');
        menu.hidden = true;

        if (opts.live) {
            seekWrap.hidden = true;
            backBtn.hidden = true;
            fwdBtn.hidden = true;
        }
        if (!document.pictureInPictureEnabled) pipBtn.hidden = true;

        row.append(playBtn, backBtn, fwdBtn, muteBtn, vol, time, spacer, menuBtn, pipBtn, fsBtn);
        bar.append(seekWrap, row);
        host.append(bar, menu);

        var idleTimer = 0;
        var dragging = false;
        var menuPage = 'main';
        var speed = 1;

        function toggle() {
            if (video.paused || video.ended) {
                var p = video.play();
                if (p && p.catch) p.catch(function () {});
            } else {
                video.pause();
            }
        }

        function skip(sec) {
            if (!isFinite(video.duration)) return;
            video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + sec));
            wake();
        }

        function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement; }

        function toggleFull() {
            if (fsElement()) {
                (document.exitFullscreen || document.webkitExitFullscreen).call(document);
            } else {
                var req = host.requestFullscreen || host.webkitRequestFullscreen;
                if (req) req.call(host);
            }
        }

        function wake() {
            host.classList.remove('idle');
            clearTimeout(idleTimer);
            idleTimer = setTimeout(function () {
                if (!video.paused && menu.hidden && !dragging) host.classList.add('idle');
            }, 2800);
        }

        function fmt(sec) { return TV.clock(sec); }

        function paintTime() {
            if (opts.live || !isFinite(video.duration) || !video.duration) {
                time.textContent = opts.live ? 'LIVE' : fmt(video.currentTime);
                if (!opts.live) { fill.style.width = '0%'; thumb.style.left = '0%'; }
                return;
            }
            var pct = video.currentTime / video.duration * 100;
            fill.style.width = pct + '%';
            thumb.style.left = pct + '%';
            time.textContent = fmt(video.currentTime) + ' / ' + fmt(video.duration);
        }

        function paintBuffer() {
            if (!isFinite(video.duration) || !video.duration || !video.buffered.length) { buf.style.width = '0%'; return; }
            var t = video.currentTime;
            var end = 0;
            for (var i = 0; i < video.buffered.length; i++) {
                if (video.buffered.start(i) <= t + 0.5 && video.buffered.end(i) >= end) end = video.buffered.end(i);
            }
            buf.style.width = Math.min(100, end / video.duration * 100) + '%';
        }

        function seekFrom(e) {
            var rect = seekWrap.getBoundingClientRect();
            var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            return Math.max(0, Math.min(1, x / rect.width));
        }

        seekWrap.addEventListener('pointerdown', function (e) {
            if (!isFinite(video.duration)) return;
            e.stopPropagation();
            dragging = true;
            seekWrap.setPointerCapture(e.pointerId);
            video.currentTime = seekFrom(e) * video.duration;
        });
        seekWrap.addEventListener('pointermove', function (e) {
            if (!isFinite(video.duration)) return;
            var frac = seekFrom(e);
            tip.textContent = fmt(frac * video.duration);
            tip.style.left = frac * 100 + '%';
            if (dragging) video.currentTime = frac * video.duration;
        });
        seekWrap.addEventListener('pointerup', function () { dragging = false; wake(); });
        seekWrap.addEventListener('pointercancel', function () { dragging = false; });
        seekWrap.addEventListener('click', function (e) { e.stopPropagation(); });

        function levels() {
            var h = opts.getHls && opts.getHls();
            if (!h || !h.levels || h.levels.length < 2) return [];
            var seen = {};
            var out = [];
            h.levels.forEach(function (lv, i) {
                if (!lv.height) return;
                if (!seen[lv.height] || (lv.bitrate || 0) > (h.levels[seen[lv.height] - 1].bitrate || 0)) seen[lv.height] = i + 1;
            });
            Object.keys(seen).forEach(function (height) { out.push({ height: Number(height), index: seen[height] - 1 }); });
            out.sort(function (a, b) { return b.height - a.height; });
            return out;
        }

        function menuItem(label, value, onClick, on) {
            var item = TV.make('button', 'vc-item' + (on ? ' on' : ''));
            item.type = 'button';
            item.appendChild(TV.make('span', '', label));
            if (value) item.appendChild(TV.make('span', 'vc-val', value));
            item.addEventListener('click', function (e) { e.stopPropagation(); onClick(); });
            return item;
        }

        function renderMenu() {
            menu.textContent = '';
            var h = opts.getHls && opts.getHls();
            if (menuPage === 'main') {
                var lv = levels();
                var cur = h && h.autoLevelEnabled ? 'Auto' : (h && h.levels && h.levels[h.currentLevel] && h.levels[h.currentLevel].height ? h.levels[h.currentLevel].height + 'p' : 'Auto');
                if (lv.length) menu.appendChild(menuItem('Quality', cur, function () { menuPage = 'quality'; renderMenu(); }));
                if (!opts.live) menu.appendChild(menuItem('Speed', speed === 1 ? 'Normal' : speed + 'x', function () { menuPage = 'speed'; renderMenu(); }));
                var srcs = opts.sources ? opts.sources() : null;
                if (srcs && srcs.list.length > 1) menu.appendChild(menuItem('Source', srcs.list[srcs.index], function () { menuPage = 'source'; renderMenu(); }));
                if (!menu.childNodes.length) menu.appendChild(TV.make('div', 'vc-empty', 'No settings for this stream.'));
                return;
            }
            var back = menuItem('‹  ' + menuPage.charAt(0).toUpperCase() + menuPage.slice(1), '', function () { menuPage = 'main'; renderMenu(); }, false);
            back.classList.add('vc-back');
            menu.appendChild(back);
            if (menuPage === 'quality') {
                menu.appendChild(menuItem('Auto', '', function () { h.currentLevel = -1; closeMenu(); }, h && h.autoLevelEnabled));
                levels().forEach(function (l) {
                    menu.appendChild(menuItem(l.height + 'p', '', function () { h.currentLevel = l.index; closeMenu(); }, h && !h.autoLevelEnabled && h.currentLevel === l.index));
                });
            } else if (menuPage === 'speed') {
                [0.5, 0.75, 1, 1.25, 1.5, 2].forEach(function (s) {
                    menu.appendChild(menuItem(s === 1 ? 'Normal' : s + 'x', '', function () {
                        speed = s;
                        video.playbackRate = s;
                        closeMenu();
                    }, s === speed));
                });
            } else if (menuPage === 'source') {
                var info = opts.sources();
                info.list.forEach(function (name, i) {
                    menu.appendChild(menuItem(name, '', function () { closeMenu(); info.pick(i); }, i === info.index));
                });
            }
        }

        function closeMenu() {
            menu.hidden = true;
            menuPage = 'main';
            wake();
        }

        function toggleMenu() {
            if (!menu.hidden) { closeMenu(); return; }
            menuPage = 'main';
            renderMenu();
            menu.hidden = false;
            host.classList.remove('idle');
        }

        function paintState() {
            setIcon(playBtn, video.paused || video.ended ? 'play' : 'pause');
            playBtn.title = video.paused ? 'Play' : 'Pause';
            host.classList.toggle('paused', video.paused);
        }

        function paintVolume() {
            setIcon(muteBtn, video.muted || video.volume === 0 ? 'mute' : 'vol');
            vol.value = video.muted ? 0 : video.volume;
        }

        var clickTimer = 0;
        function onSurface(e) {
            if (e.target.closest('.vc, .vc-menu, .p-top, .p-stat button, .overlay.click')) return;
            if (!menu.hidden) { closeMenu(); return; }
            clearTimeout(clickTimer);
            clickTimer = setTimeout(toggle, 220);
        }
        host.addEventListener('click', onSurface);
        host.addEventListener('dblclick', function (e) {
            if (e.target.closest('.vc, .vc-menu, .p-top')) return;
            clearTimeout(clickTimer);
            toggleFull();
        });
        host.addEventListener('mousemove', wake);
        host.addEventListener('touchstart', wake, { passive: true });
        host.addEventListener('mouseleave', function () {
            if (!video.paused && menu.hidden) host.classList.add('idle');
        });

        host.addEventListener('keydown', function (e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            var handled = true;
            switch (e.key) {
                case ' ':
                case 'k': toggle(); break;
                case 'ArrowLeft': if (!opts.live) skip(-10); break;
                case 'ArrowRight': if (!opts.live) skip(10); break;
                case 'ArrowUp': video.muted = false; video.volume = Math.min(1, video.volume + 0.1); break;
                case 'ArrowDown': video.volume = Math.max(0, video.volume - 0.1); break;
                case 'm': video.muted = !video.muted; break;
                case 'f': toggleFull(); break;
                default: handled = false;
            }
            if (handled) { e.preventDefault(); wake(); }
        });

        video.addEventListener('play', paintState);
        video.addEventListener('pause', function () { paintState(); host.classList.remove('idle'); });
        video.addEventListener('ended', paintState);
        video.addEventListener('timeupdate', paintTime);
        video.addEventListener('progress', paintBuffer);
        video.addEventListener('loadedmetadata', function () { paintTime(); paintBuffer(); });
        video.addEventListener('durationchange', paintTime);
        video.addEventListener('volumechange', paintVolume);
        video.addEventListener('playing', wake);
        document.addEventListener('fullscreenchange', function () {
            setIcon(fsBtn, fsElement() === host ? 'exit' : 'full');
        });

        paintState();
        paintVolume();
        paintTime();

        return {
            wake: wake,
            refresh: function () { if (!menu.hidden) renderMenu(); },
            reset: function () {
                speed = 1;
                video.playbackRate = 1;
                fill.style.width = '0%';
                buf.style.width = '0%';
                thumb.style.left = '0%';
                closeMenu();
                paintTime();
            }
        };
    };
})();
