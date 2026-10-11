(function () {
    const $ = id => document.getElementById(id);
    const libList = $("libList"), playlistView = $("playlistView"), coverInput = $("coverInput");
    const newPlaylistBtn = $("newPlaylistBtn"), loopBtn = $("loopBtn"), volIcon = $("volIcon"), totalTime = $("totalTime");
    const toastEl = $("toast"), ctxMenu = $("ctxMenu"), ctxScrim = $("ctxScrim");
    const mobNav = $("mobNav"), mobTitle = $("mobTitle"), npCollapseBtn = $("npCollapseBtn");
    const lyricsCloseBtn = $("lyricsCloseBtn"), queueClearBtn = $("queueClearBtn");
    const qlNow = $("qlNow"), qNow = $("qNow"), qlUser = $("qlUser"), qUser = $("qUser");
    const qlNext = $("qlNext"), qNext = $("qNext"), qNote = $("qNote");
    const bodyEl = document.body;
    const isMobile = () => bodyEl.classList.contains("mobile");

    const IC = {
        play: "M8 5v14l11-7z",
        next: "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z",
        queueAdd: "M14 10H3v2h11v-2zm0-4H3v2h11V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM3 16h7v-2H3v2z",
        plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
        heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
        person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
        copy: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
        trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
        download: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
        mic: "M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z",
        home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
        edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
        image: "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
        shuffle: "M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z",
        close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
        back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
        list: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"
    };
    const svg = (d, s) => `<svg viewBox="0 0 24 24" width="${s || 20}" height="${s || 20}" fill="currentColor"><path d="${d}"/></svg>`;
    const NOTE_ICON = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;

    SVG_ICONS.play = svg(IC.play, 24);
    SVG_ICONS.pause = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    SVG_ICONS.trash = svg(IC.trash, 22);

    let covers = {};
    try { covers = JSON.parse(localStorage.getItem("playlistCovers")) || {}; } catch (e) { covers = {}; }
    const saveCovers = () => { try { localStorage.setItem("playlistCovers", JSON.stringify(covers)); } catch (e) {} };

    function paint(el) {
        const max = Number(el.max) || 100;
        el.style.setProperty("--p", (Number(el.value) / max * 100) + "%");
    }

    let toastTimer = 0;
    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.hidden = false;
        void toastEl.offsetWidth;
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastEl.classList.remove("show");
            setTimeout(() => { if (!toastEl.classList.contains("show")) toastEl.hidden = true; }, 220);
        }, 2200);
    }

    function reconcile(container, items, keyFn, makeFn, updateFn) {
        const old = container._map || new Map();
        const next = new Map();
        const seen = new Map();
        const els = [];
        items.forEach((it, i) => {
            const base = keyFn(it, i);
            const n = seen.get(base) || 0;
            seen.set(base, n + 1);
            const key = n ? base + "#" + n : base;
            let el = old.get(key);
            if (el) { if (updateFn) updateFn(el, it, i); }
            else el = makeFn(it, i);
            next.set(key, el);
            els.push(el);
        });
        const keep = new Set(els);
        Array.from(container.children).forEach(ch => { if (!keep.has(ch)) ch.remove(); });
        els.forEach((el, i) => {
            if (container.children[i] !== el) container.insertBefore(el, container.children[i] || null);
        });
        container._map = next;
    }

    const loadedUrls = new Set();
    window.setImageDirect = function (img, urls, track) {
        const list = (urls || []).filter(Boolean);
        const key = list.join("|");
        if (img._srcKey === key && (img._startLoad || img.getAttribute("src"))) return;
        img._srcKey = key;
        const token = (img._imgToken = (img._imgToken || 0) + 1);
        if (typeof imageObserver !== "undefined" && imageObserver) imageObserver.unobserve(img);
        img._startLoad = null;
        img.classList.remove("no-art");
        let i = 0;
        const giveUp = () => {
            if (img._imgToken !== token) return;
            img.onerror = null;
            img.classList.add("no-art");
            img.src = DEFAULT_ART_DATA_URI;
        };
        const tryNext = async () => {
            if (img._imgToken !== token) return;
            img._startLoad = null;
            if (i >= list.length) {
                try {
                    const found = track ? await lookupArtworkUrl(track) : null;
                    if (img._imgToken !== token) return;
                    if (found) { img.onerror = giveUp; img.src = found; return; }
                } catch (e) {}
                giveUp();
                return;
            }
            const url = list[i++];
            img.onload = () => { loadedUrls.add(url); img.onerror = null; };
            img.onerror = tryNext;
            img.src = url;
        };
        if (!list.length) { tryNext(); return; }
        const known = list.findIndex(u => loadedUrls.has(u));
        if (known >= 0) { i = known; tryNext(); return; }
        if ("IntersectionObserver" in window) {
            img._startLoad = tryNext;
            getImageObserver().observe(img);
        } else {
            tryNext();
        }
    };

    window.showTrackInDock = function (track, loading) {
        nowPlayingTitle.innerHTML = loading ? `${SVG_ICONS.spinner || ""} ${escapeHTML(track.title)}` : escapeHTML(track.title);
        nowPlayingArtist.textContent = track.artist || "";
        if (nowPlayingCover.dataset.key !== track.key) {
            nowPlayingCover.dataset.key = track.key;
            setImage(nowPlayingCover, trackCoverUrls(track), false, track);
        }
    };

    window.showMessage = function (html) {
        currentSearchResults = [];
        resultsList._map = new Map();
        resultsList.innerHTML = `<div class="grid-message">${html}</div>`;
    };

    function coverEl(name) {
        const box = document.createElement("div");
        box.className = "cover";
        const list = playlists[name] || [];
        if (covers[name]) {
            const img = document.createElement("img");
            img.alt = "";
            img.src = covers[name];
            box.appendChild(img);
            return box;
        }
        if (list.length === 0) {
            box.classList.add("empty");
            box.innerHTML = NOTE_ICON;
            return box;
        }
        if (list.length < 4) {
            const img = document.createElement("img");
            img.alt = "";
            setImageDirect(img, trackCoverUrls(list[0]), list[0]);
            box.appendChild(img);
            return box;
        }
        box.classList.add("grid");
        list.slice(0, 4).forEach(track => {
            const cell = document.createElement("div");
            const img = document.createElement("img");
            img.alt = "";
            setImageDirect(img, trackCoverUrls(track), track);
            cell.appendChild(img);
            box.appendChild(cell);
        });
        return box;
    }

    function libItem(name) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "lib-item";
        item.title = name;
        item._playlist = name;
        item.appendChild(coverEl(name));
        const text = document.createElement("div");
        text.className = "lib-text";
        const count = playlists[name].length;
        text.innerHTML = `<div class="lib-name">${escapeHTML(name)}</div><div class="lib-sub">Playlist • ${count} ${count === 1 ? "song" : "songs"}</div>`;
        item.appendChild(text);
        item.addEventListener("click", () => openPlaylist(name));
        return item;
    }

    const libMap = new Map();
    const playlistSig = name => {
        const l = playlists[name] || [];
        return name + "|" + l.length + "|" + (covers[name] ? 1 : 0) + "|" + l.slice(0, 4).map(t => t.key).join(",");
    };

    function renderLibrary() {
        const names = Object.keys(playlists);
        const selected = playlistView.hidden ? null : sidebarPlaylistSelect.value;
        libMap.forEach((rec, name) => {
            if (!playlists[name]) { rec.el.remove(); libMap.delete(name); }
        });
        names.forEach(name => {
            const sig = playlistSig(name);
            const rec = libMap.get(name);
            if (rec && rec.sig === sig) return;        // unchanged: keep the element and its images
            const el = libItem(name);
            if (rec && rec.el.parentNode) rec.el.replaceWith(el);
            libMap.set(name, { el, sig });
        });
        names.forEach((name, i) => {
            const el = libMap.get(name).el;
            if (libList.children[i] !== el) libList.insertBefore(el, libList.children[i] || null);
            el.classList.toggle("sel", name === selected);
        });
    }

    const plvHead = document.createElement("div");
    const plvActions = document.createElement("div");
    const plvEmpty = document.createElement("div");
    const plvRowsEl = document.createElement("div");
    plvEmpty.className = "empty-note";
    plvEmpty.textContent = "This playlist is empty. Right-click a song (long-press on mobile) and choose Add to playlist.";
    playlistView.append(plvHead, plvActions, plvEmpty, plvRowsEl);
    let plvName = null, plvSig = "";

    function shuffled(list) {
        const copy = list.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }
    function playShuffled(name) {
        const list = playlists[name];
        if (!list || !list.length) return;
        const copy = shuffled(list);
        playFromList(copy, copy[0]);
    }

    function buildPlaylistHead(name, list) {
        plvHead.innerHTML = "";
        plvHead.className = "pl-head";
        const cw = document.createElement("div");
        cw.className = "pl-cover";
        cw.appendChild(coverEl(name));
        cw.insertAdjacentHTML("beforeend", `<div class="pl-cover-edit">Choose image</div>`);
        cw.addEventListener("click", () => { sidebarPlaylistSelect.value = name; coverInput.click(); });
        const info = document.createElement("div");
        info.className = "pl-info";
        info.innerHTML = `<p>Playlist</p><h1>${escapeHTML(name)}</h1><p>${list.length} ${list.length === 1 ? "song" : "songs"}</p>`;
        plvHead.append(cw, info);

        plvActions.innerHTML = "";
        plvActions.className = "pl-actions";
        const back = document.createElement("button");
        back.className = "control-button pl-back";
        back.title = "Back";
        back.innerHTML = svg(IC.back, 26);
        back.addEventListener("click", () => setTab("library"));
        const playBtn = document.createElement("button");
        playBtn.className = "play-big";
        playBtn.title = "Play";
        playBtn.innerHTML = SVG_ICONS.play;
        playBtn.addEventListener("click", () => { if (list.length) window.playFromPlaylist(name, 0); });
        const shuf = document.createElement("button");
        shuf.className = "ghost-btn";
        shuf.textContent = "Shuffle";
        shuf.addEventListener("click", () => playShuffled(name));
        const addAll = document.createElement("button");
        addAll.className = "ghost-btn";
        addAll.textContent = "Add all to queue";
        addAll.addEventListener("click", () => enqueueMany(playlists[name] || []));
        plvActions.append(back, playBtn, shuf, addAll);
        if (covers[name]) {
            const reset = document.createElement("button");
            reset.className = "ghost-btn";
            reset.textContent = "Remove image";
            reset.addEventListener("click", () => { delete covers[name]; saveCovers(); renderSidebarTracks(); });
            plvActions.appendChild(reset);
        }
    }

    function makePlaylistRow(track) {
        const row = document.createElement("div");
        row.className = "row";
        row.draggable = true;
        row.innerHTML = `
            <span class="row-n"></span>
            <img class="row-img" alt="">
            <div class="row-text">
                <div class="row-title"></div>
                <div class="row-artist"></div>
            </div>
            <span class="row-dur"></span>
            <button type="button" class="row-rm" title="Remove">${SVG_ICONS.trash}</button>
        `;
        row.querySelector(".row-title").textContent = track.title;
        row.querySelector(".row-artist").textContent = track.artist || "";
        setImageDirect(row.querySelector(".row-img"), trackCoverUrls(track), track);
        row.addEventListener("click", () => window.playFromPlaylist(row._pl, row._idx));
        row.querySelector(".row-rm").addEventListener("click", e => {
            e.stopPropagation();
            window.removeTrack(row._pl, row._idx);
        });
        row.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", row._idx));
        row.addEventListener("dragover", e => { e.preventDefault(); row.classList.add("drag-over"); });
        row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
        row.addEventListener("drop", e => {
            e.preventDefault();
            row.classList.remove("drag-over");
            const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
            if (!isNaN(from) && from !== row._idx) reorderPlaylistTrack(row._pl, from, row._idx);
        });
        return row;
    }
    function fillPlaylistRow(row, track, index, name) {
        row._track = track;
        row._idx = index;
        row._pl = name;
        row.querySelector(".row-n").textContent = index + 1;
        row.querySelector(".row-dur").textContent = track.duration ? formatTime(track.duration) : "";
        row.classList.toggle("active", activePlayingPlaylist === name && activePlayingIndex === index &&
            !!currentTrackInfo && currentTrackInfo.key === track.key);
    }

    function renderPlaylistView() {
        const name = sidebarPlaylistSelect.value;
        const list = playlists[name];
        if (!list) { playlistView.hidden = true; return; }
        if (plvName !== name) { plvRowsEl._map = new Map(); plvRowsEl.textContent = ""; }
        const sig = name + "|" + list.length + "|" + (covers[name] ? 1 : 0) + "|" + list.slice(0, 4).map(t => t.key).join(",");
        if (plvName !== name || plvSig !== sig) {
            buildPlaylistHead(name, list);
            plvName = name;
            plvSig = sig;
        }
        plvEmpty.hidden = list.length > 0;
        reconcile(plvRowsEl, list, t => t.key,
            (t, i) => { const r = makePlaylistRow(t); fillPlaylistRow(r, t, i, name); return r; },
            (r, t, i) => fillPlaylistRow(r, t, i, name));
    }

    window.renderSidebarTracks = function () {
        renderLibrary();
        if (!playlistView.hidden) renderPlaylistView();
    };

    function openPlaylist(name) {
        closeLyricsView();
        sidebarPlaylistSelect.value = name;
        homeView.hidden = true;
        resultsList.hidden = true;
        playlistView.hidden = false;
        if (isMobile()) bodyEl.classList.remove("mob-lib-open");
        window.scrollTo({ top: 0 });
        renderSidebarTracks();
    }

    function leavePlaylist() {
        if (playlistView.hidden) return;
        playlistView.hidden = true;
        renderSidebarTracks();
    }

    searchBtn.addEventListener("click", () => { leavePlaylist(); if (isMobile()) markTab("search"); });
    homeBtn.addEventListener("click", leavePlaylist);
    searchInput.addEventListener("keydown", e => { if (e.key === "Enter") { leavePlaylist(); if (isMobile()) markTab("search"); } });

    toggleSidebarBtn.addEventListener("click", () => { if (!isMobile()) bodyEl.classList.toggle("lib-collapsed"); });

    function createPlaylistPrompt() {
        const name = (window.prompt("Playlist name") || "").trim();
        if (!name || playlists[name]) return;
        playlists[name] = [];
        savePlaylists();
        updatePlaylistDropdowns();
        openPlaylist(name);
    }
    newPlaylistBtn.addEventListener("click", createPlaylistPrompt);

    coverInput.addEventListener("change", () => {
        const file = coverInput.files[0];
        const name = sidebarPlaylistSelect.value;
        coverInput.value = "";
        if (!file || !name) return;
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = canvas.height = 400;
                const side = Math.min(img.width, img.height);
                canvas.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 400, 400);
                covers[name] = canvas.toDataURL("image/jpeg", 0.85);
                saveCovers();
                renderSidebarTracks();
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });

    function renamePlaylist(old) {
        const nn = (window.prompt("Rename playlist", old) || "").trim();
        if (!nn || nn === old || playlists[nn]) return;
        const next = {};
        Object.keys(playlists).forEach(k => { next[k === old ? nn : k] = playlists[k]; });
        playlists = next;
        if (covers[old]) { covers[nn] = covers[old]; delete covers[old]; saveCovers(); }
        if (activePlayingPlaylist === old) activePlayingPlaylist = nn;
        libMap.delete(old);
        savePlaylists();
        updatePlaylistDropdowns();
        if (!playlistView.hidden && sidebarPlaylistSelect.value === old) sidebarPlaylistSelect.value = nn;
        renderSidebarTracks();
    }

    function deletePlaylist(name) {
        if (!window.confirm(`Delete "${name}"?`)) return;
        delete playlists[name];
        delete covers[name];
        saveCovers();
        if (activePlayingPlaylist === name) { activePlayingPlaylist = null; activePlayingIndex = -1; }
        savePlaylists();
        updatePlaylistDropdowns();
        if (!playlistView.hidden && sidebarPlaylistSelect.value === name) {
            playlistView.hidden = true;
            if (isMobile()) setTab("library"); else showHome();
        }
        renderSidebarTracks();
        toast("Playlist deleted");
    }

    let pendingTrack = null;

    function addToPlaylist(track, target) {
        if (!track || !target) return false;
        if (!playlists[target]) playlists[target] = [];
        if (playlists[target].some(t => t.key === track.key)) { toast(`Already in ${target}`); return false; }
        const entry = serializeTrack(track);
        if (!entry.streamId) entry.streamId = workingStreams[track.key] || null;
        playlists[target].push(normalizeTrack({ ...entry }));
        savePlaylists();
        updatePlaylistDropdowns();
        renderSidebarTracks();
        toast(`Added to ${target}`);
        return true;
    }

    function openAddModal(track) {
        pendingTrack = track;
        newPlaylistInput.value = "";
        updatePlaylistDropdowns();
        playlistModal.classList.add("active");
    }

    addToPlaylistBtn.addEventListener("click", () => { pendingTrack = null; });

    const freshConfirm = confirmAddBtn.cloneNode(true);
    confirmAddBtn.replaceWith(freshConfirm);
    freshConfirm.addEventListener("click", () => {
        const track = pendingTrack || currentTrackInfo;
        const newName = newPlaylistInput.value.trim();
        const target = newName || modalPlaylistSelect.value;
        if (!track) { toast("Play a song first"); return; }
        if (!target) { toast("Pick or create a playlist"); return; }
        addToPlaylist(track, target);
        pendingTrack = null;
        playlistModal.classList.remove("active");
    });

    playlistModal.addEventListener("click", e => {
        if (e.target === playlistModal) playlistModal.classList.remove("active");
    });

    window.createTile = function (track, onClick) {
        const card = document.createElement("div");
        card.className = "card";
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card._track = track;
        card.innerHTML = `
            <div class="card-art">
                <img alt="" decoding="async">
                <button type="button" class="card-add" title="Add to playlist">${SVG_ICONS.plus}</button>
                <span class="card-play">${SVG_ICONS.play}</span>
            </div>
            <div class="card-title"></div>
            <div class="card-artist"></div>
        `;
        card.querySelector(".card-title").textContent = track.title;
        card.querySelector(".card-artist").textContent = track.artist;
        card.setAttribute("aria-label", `${track.title} by ${track.artist}`);
        setImageDirect(card.querySelector("img"), trackCoverUrls(track), track);
        card.addEventListener("click", onClick);
        card.addEventListener("keydown", e => { if (e.key === "Enter") onClick(); });
        card.querySelector(".card-add").addEventListener("click", e => {
            e.stopPropagation();
            openAddModal(card._track);
        });
        return card;
    };

    window.renderSearchResults = function (tracks) {
        currentSearchResults = tracks;
        reconcile(resultsList, tracks, t => t.key,
            t => {
                const card = createTile(t, () => playFromList(currentSearchResults, card._track));
                return card;
            },
            (el, t) => { el._track = t; });
    };

    let loopMode = 0;
    let userQueue = [];
    let ctxListIndex = -1;
    let queueSig = "";

    window.playFromList = function (list, track) {
        activePlayingPlaylist = null;
        activePlayingIndex = -1;
        activeList = list;
        ctxListIndex = list.indexOf(track);
        playTrack(track);
    };

    window.getQueue = function () {
        if (activePlayingPlaylist && playlists[activePlayingPlaylist]) {
            return { kind: "playlist", tracks: playlists[activePlayingPlaylist], index: activePlayingIndex };
        }
        if (activeList) return { kind: "list", tracks: activeList, index: ctxListIndex };
        return null;
    };

    window.playQueueIndex = function (q, index) {
        if (q.kind === "playlist") window.playFromPlaylist(activePlayingPlaylist, index);
        else { ctxListIndex = index; playTrack(q.tracks[index]); }
    };

    window.hasNext = function () {
        const q = getQueue();
        return userQueue.length > 0 ||
            (!!q && q.index >= 0 && q.index < q.tracks.length - 1) ||
            (loopMode === 1 && !!q && q.tracks.length > 0);
    };

    window.playNext = function () {
        if (userQueue.length) {
            const t = userQueue.shift();
            playTrack(t);
            if (queueOpen) renderQueue(true);
            return;
        }
        const q = getQueue();
        if (q && q.index >= 0 && q.index < q.tracks.length - 1) { playQueueIndex(q, q.index + 1); return; }
        if (loopMode === 1 && q && q.tracks.length) playQueueIndex(q, 0);
    };

    const originalPrevious = window.playPrevious;
    window.playPrevious = function () {
        if (audioPlayer.currentTime > 3) { audioPlayer.currentTime = 0; return; }
        originalPrevious();
    };
    nextTrackBtn.addEventListener("click", e => { e.stopImmediatePropagation(); window.playNext(); }, true);
    prevTrackBtn.addEventListener("click", e => { e.stopImmediatePropagation(); window.playPrevious(); }, true);

    function refreshQueueUI() {
        updateNavButtons();
        if (queueOpen) renderQueue(true);
    }

    function enqueue(track, next) {
        if (!track) return;
        if (!currentTrackInfo) { playFromList([track], track); toast("Playing"); return; }
        if (next) userQueue.unshift(track); else userQueue.push(track);
        toast(next ? "Playing next" : "Added to queue");
        refreshQueueUI();
    }
    function enqueueMany(tracks) {
        if (!tracks.length) return;
        if (!currentTrackInfo) { playFromList(tracks.slice(), tracks[0]); toast("Playing"); return; }
        tracks.forEach(t => userQueue.push(t));
        toast(`Added ${tracks.length} ${tracks.length === 1 ? "song" : "songs"} to queue`);
        refreshQueueUI();
    }

    function queueRowEl(track) {
        const row = document.createElement("div");
        row.className = "q-row";
        row.innerHTML = `<img alt=""><div class="q-text"><div class="q-title"></div><div class="q-artist"></div></div><button type="button" class="q-x" title="Remove">${svg(IC.close, 18)}</button>`;
        row.querySelector(".q-title").textContent = track.title;
        row.querySelector(".q-artist").textContent = track.artist || "";
        setImageDirect(row.querySelector("img"), trackCoverUrls(track), track);
        row.addEventListener("click", e => {
            if (e.target.closest(".q-x")) { if (row._rm) row._rm(); return; }
            if (row._act) row._act();
        });
        return row;
    }

    window.renderQueue = function (force) {
        const q = getQueue();
        const upcoming = q && q.index >= 0 ? q.tracks.slice(q.index + 1, q.index + 51) : [];
        const sig = (currentTrackInfo ? currentTrackInfo.key : "") + "|" + userQueue.map(t => t.key).join(",") + "|" + upcoming.map(t => t.key).join(",");
        if (!force && sig === queueSig) return;
        queueSig = sig;

        const hasCur = !!currentTrackInfo;
        qlNow.hidden = qNow.hidden = !hasCur;
        reconcile(qNow, hasCur ? [currentTrackInfo] : [], t => t.key, t => queueRowEl(t),
            (row, t) => { row._track = t; });
        Array.from(qNow.children).forEach(r => { r.classList.add("now"); r._act = null; r._rm = null; });

        qlUser.hidden = qUser.hidden = userQueue.length === 0;
        const fillUser = (row, t, i) => {
            row._track = t;
            row._act = () => { const picked = userQueue.splice(0, i + 1).pop(); playTrack(picked); renderQueue(true); updateNavButtons(); };
            row._rm = () => { userQueue.splice(i, 1); refreshQueueUI(); };
        };
        reconcile(qUser, userQueue, t => t.key, (t, i) => { const r = queueRowEl(t); fillUser(r, t, i); return r; }, fillUser);

        qlNext.hidden = qNext.hidden = upcoming.length === 0;
        qlNext.textContent = q && q.kind === "playlist" ? `Next from ${activePlayingPlaylist}` : "Next up";
        const fillNext = (row, t, i) => {
            row._track = t;
            row._act = () => { const live = getQueue(); if (live) playQueueIndex(live, live.index + 1 + i); };
            row._rm = null;
            const x = row.querySelector(".q-x");
            if (x) x.style.display = "none";
        };
        reconcile(qNext, upcoming, t => t.key, (t, i) => { const r = queueRowEl(t); fillNext(r, t, i); return r; }, fillNext);

        const empty = !userQueue.length && !upcoming.length;
        qNote.hidden = !empty;
        if (empty) qNote.textContent = hasCur
            ? `Nothing queued. ${isMobile() ? "Long-press" : "Right-click"} a song and choose Add to queue.`
            : "Nothing is playing.";
    };

    queueClearBtn.addEventListener("click", () => { userQueue.length = 0; refreshQueueUI(); toast("Queue cleared"); });
    $("closePlayerBtn").addEventListener("click", () => { userQueue.length = 0; setExpanded(false); });

    const loopTitles = ["Repeat off", "Repeat all", "Repeat one"];
    loopBtn.addEventListener("click", () => {
        loopMode = (loopMode + 1) % 3;
        audioPlayer.loop = loopMode === 2;
        loopBtn.classList.toggle("on", loopMode > 0);
        loopBtn.classList.toggle("one", loopMode === 2);
        loopBtn.title = loopTitles[loopMode];
        updateNavButtons();
    });

    volIcon.addEventListener("click", () => {
        audioPlayer.muted = !audioPlayer.muted;
        volIcon.style.opacity = audioPlayer.muted ? "0.4" : "1";
    });

    window.updateTime = function () {
        currentTime.textContent = formatTime(audioPlayer.currentTime);
        totalTime.textContent = formatTime(audioPlayer.duration);
    };

    progressBar.addEventListener("input", () => paint(progressBar));
    volumeBar.addEventListener("input", () => paint(volumeBar));
    const syncMini = () => {
        paint(progressBar);
        const d = audioPlayer.duration;
        audioDock.style.setProperty("--mp", d ? (audioPlayer.currentTime / d * 100) + "%" : "0%");
    };
    audioPlayer.addEventListener("timeupdate", syncMini);
    audioPlayer.addEventListener("loadedmetadata", syncMini);
    paint(progressBar);
    paint(volumeBar);

    function hideMenu() {
        ctxMenu.hidden = true;
        ctxScrim.hidden = true;
        ctxMenu.innerHTML = "";
    }

    function showMenu(x, y, items, header) {
        ctxMenu.innerHTML = "";
        if (header) {
            const h = document.createElement("div");
            h.className = "ctx-head";
            const img = document.createElement("img");
            img.alt = "";
            if (header.track) setImageDirect(img, trackCoverUrls(header.track), header.track);
            else if (header.cover) img.src = header.cover;
            else img.style.visibility = "hidden";
            const t = document.createElement("div");
            t.className = "ctx-head-t";
            const a = document.createElement("div"); a.textContent = header.title || "";
            const b = document.createElement("div"); b.textContent = header.sub || "";
            t.append(a, b);
            h.append(img, t);
            ctxMenu.appendChild(h);
        }
        items.forEach(it => {
            if (it === "-") {
                const s = document.createElement("div");
                s.className = "ctx-sep";
                ctxMenu.appendChild(s);
                return;
            }
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "ctx-item" + (it.danger ? " danger" : "");
            btn.innerHTML = (it.icon ? svg(it.icon, 20) : "") + `<span></span>`;
            btn.querySelector("span").textContent = it.label;
            btn.addEventListener("click", e => {
                e.stopPropagation();
                hideMenu();
                try { it.run(); } catch (err) { console.error(err); }
            });
            ctxMenu.appendChild(btn);
        });
        ctxScrim.hidden = false;
        ctxMenu.hidden = false;
        if (!isMobile()) {
            const r = ctxMenu.getBoundingClientRect();
            const left = Math.max(8, Math.min(x, window.innerWidth - r.width - 8));
            const top = Math.max(8, Math.min(y, window.innerHeight - r.height - 8));
            ctxMenu.style.left = left + "px";
            ctxMenu.style.top = top + "px";
        } else {
            ctxMenu.style.left = ctxMenu.style.top = "";
        }
    }

    function copyText(text) {
        const fallback = () => {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.cssText = "position:fixed;opacity:0";
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand("copy"); } catch (e) {}
            ta.remove();
        };
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(fallback);
            else fallback();
        } catch (e) { fallback(); }
        toast("Copied");
    }

    function trackItems(track, el) {
        const isCur = !!currentTrackInfo && currentTrackInfo.key === track.key;
        const items = [
            { label: el && el._isDock ? "Play / pause" : "Play", icon: IC.play, run: () => {
                if (el && el._isDock) playPauseBtn.click();
                else if (el && el.click) el.click();
                else playFromList([track], track);
            } },
            { label: "Play next", icon: IC.next, run: () => enqueue(track, true) },
            { label: "Add to queue", icon: IC.queueAdd, run: () => enqueue(track, false) },
            "-",
            { label: "Add to playlist…", icon: IC.plus, run: () => openAddModal(track) },
            { label: "Add to Favorites", icon: IC.heart, run: () => addToPlaylist(track, "Favorites") }
        ];
        if (el && el._pl) {
            items.push({ label: "Remove from this playlist", icon: IC.trash, danger: true, run: () => window.removeTrack(el._pl, el._idx) });
        }
        if (el && el._rm) {
            items.push({ label: "Remove from queue", icon: IC.trash, danger: true, run: () => el._rm() });
        }
        items.push("-");
        if (track.artist) items.push({ label: "More from this artist", icon: IC.person, run: () => runSearch(track.artist) });
        items.push({ label: "Copy song name", icon: IC.copy, run: () => copyText(`${track.title}${track.artist ? " - " + track.artist : ""}`) });
        if (isCur) {
            items.push("-");
            items.push({ label: "Lyrics", icon: IC.mic, run: () => $("lyricsBtn").click() });
            items.push({ label: "Download audio", icon: IC.download, run: () => $("downloadBtn").click() });
        }
        return items;
    }

    function playlistItems(name) {
        const list = playlists[name] || [];
        const items = [
            { label: "Play", icon: IC.play, run: () => { if (list.length) window.playFromPlaylist(name, 0); } },
            { label: "Shuffle", icon: IC.shuffle, run: () => playShuffled(name) },
            { label: "Add all to queue", icon: IC.queueAdd, run: () => enqueueMany(list) },
            "-",
            { label: "Change image…", icon: IC.image, run: () => { sidebarPlaylistSelect.value = name; coverInput.click(); } }
        ];
        if (covers[name]) items.push({ label: "Remove image", icon: IC.close, run: () => { delete covers[name]; saveCovers(); renderSidebarTracks(); } });
        items.push({ label: "Rename…", icon: IC.edit, run: () => renamePlaylist(name) });
        items.push("-");
        items.push({ label: "Delete playlist", icon: IC.trash, danger: true, run: () => deletePlaylist(name) });
        return items;
    }

    function pageItems() {
        const items = [
            { label: "Home", icon: IC.home, run: () => { if (isMobile()) setTab("home"); else { leavePlaylist(); homeBtn.click(); } } },
            { label: queueOpen ? "Hide queue" : "Show queue", icon: IC.list, run: () => $("queueBtn").click() }
        ];
        if (currentTrackInfo) items.push({ label: "Lyrics", icon: IC.mic, run: () => $("lyricsBtn").click() });
        items.push("-");
        items.push({ label: "New playlist…", icon: IC.plus, run: createPlaylistPrompt });
        if (userQueue.length) items.push({ label: "Clear queue", icon: IC.trash, danger: true, run: () => { userQueue.length = 0; refreshQueueUI(); toast("Queue cleared"); } });
        if (currentTrackInfo) items.push({ label: "Stop player", icon: IC.close, run: () => $("closePlayerBtn").click() });
        return items;
    }

    function runSearch(text) {
        searchInput.value = text;
        leavePlaylist();
        if (isMobile()) markTab("search");
        search();
    }

    function findCtxTarget(node) {
        for (let n = node; n && n !== document.documentElement; n = n.parentElement) {
            if (n._track) return { kind: "track", el: n, track: n._track };
            if (n._playlist) return { kind: "playlist", el: n, name: n._playlist };
            if (n._isDock && currentTrackInfo) return { kind: "track", el: n, track: currentTrackInfo };
        }
        return null;
    }

    function openContextFor(target, x, y) {
        const hit = findCtxTarget(target);
        if (hit && hit.kind === "track") {
            showMenu(x, y, trackItems(hit.track, hit.el), { track: hit.track, title: hit.track.title, sub: hit.track.artist });
        } else if (hit && hit.kind === "playlist") {
            const n = (playlists[hit.name] || []).length;
            showMenu(x, y, playlistItems(hit.name), { cover: covers[hit.name] || null, title: hit.name, sub: `Playlist • ${n} ${n === 1 ? "song" : "songs"}` });
        } else {
            showMenu(x, y, pageItems(), null);
        }
    }

    audioDock.querySelector(".now-playing")._isDock = true;

    document.addEventListener("contextmenu", e => {
        if (e.target.closest("input, textarea")) return;     // keep the native menu for typing
        e.preventDefault();
        openContextFor(e.target, e.clientX, e.clientY);
    });
    ctxScrim.addEventListener("click", hideMenu);
    ctxScrim.addEventListener("contextmenu", e => { e.preventDefault(); hideMenu(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !ctxMenu.hidden) hideMenu(); });
    window.addEventListener("blur", hideMenu);
    window.addEventListener("resize", hideMenu);

    let lpTimer = 0, lpStart = null, lpAt = 0;
    document.addEventListener("touchstart", e => {
        if (e.touches.length !== 1 || e.target.closest("input, textarea")) return;
        const t = e.touches[0];
        const target = e.target;
        if (!findCtxTarget(target)) return;
        lpStart = { x: t.clientX, y: t.clientY };
        clearTimeout(lpTimer);
        lpTimer = setTimeout(() => {
            lpAt = Date.now();
            if (navigator.vibrate) { try { navigator.vibrate(10); } catch (err) {} }
            openContextFor(target, lpStart.x, lpStart.y);
        }, 480);
    }, { passive: true });
    document.addEventListener("touchmove", e => {
        const t = e.touches[0];
        if (lpStart && t && Math.hypot(t.clientX - lpStart.x, t.clientY - lpStart.y) < 10) return;
        clearTimeout(lpTimer);
    }, { passive: true });
    ["touchend", "touchcancel"].forEach(ev => document.addEventListener(ev, () => clearTimeout(lpTimer), { passive: true }));
    document.addEventListener("click", e => {
        if (Date.now() - lpAt < 700) { e.stopPropagation(); e.preventDefault(); }
    }, true);

    const mq = window.matchMedia("(max-width: 760px)");
    let currentTab = "home";

    function markTab(tab) {
        currentTab = tab;
        bodyEl.dataset.tab = tab;
        bodyEl.classList.toggle("mob-lib-open", tab === "library" && playlistView.hidden);
        mobNav.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
        mobTitle.textContent = tab === "library" ? "Your Library" : "Home";
    }

    function setTab(tab) {
        markTab(tab);
        closeLyricsView();
        if (tab === "home") {
            leavePlaylist();
            showHome();
        } else if (tab === "search") {
            leavePlaylist();
            homeView.hidden = true;
            resultsList.hidden = false;
            if (!currentSearchResults.length) showMessage("Search for songs and artists");
            searchInput.focus();
        } else if (tab === "library") {
            homeView.hidden = true;
            resultsList.hidden = true;
            playlistView.hidden = true;
            bodyEl.classList.add("mob-lib-open");
            renderSidebarTracks();
        }
        window.scrollTo({ top: 0 });
    }

    mobNav.querySelectorAll("button").forEach(b => b.addEventListener("click", () => setTab(b.dataset.tab)));
    searchInput.addEventListener("focus", () => { if (isMobile() && currentTab !== "search") setTab("search"); });

    function applyMobile() {
        bodyEl.classList.toggle("mobile", mq.matches);
        if (mq.matches) {
            bodyEl.classList.remove("lib-collapsed");
            markTab(currentTab);
        } else {
            bodyEl.classList.remove("mob-lib-open", "np-open");
            audioDock.classList.remove("expanded");
            delete bodyEl.dataset.tab;
        }
    }
    if (mq.addEventListener) mq.addEventListener("change", applyMobile); else mq.addListener(applyMobile);
    applyMobile();

    function setExpanded(v) {
        const on = !!v && isMobile();
        audioDock.classList.toggle("expanded", on);
        bodyEl.classList.toggle("np-open", on);
    }
    audioDock.querySelector(".now-playing").addEventListener("click", e => {
        if (!isMobile() || audioDock.classList.contains("expanded")) return;
        if (e.target.closest("#addToPlaylistBtn")) return;
        setExpanded(true);
    });
    npCollapseBtn.addEventListener("click", () => setExpanded(false));
    lyricsCloseBtn.addEventListener("click", () => $("lyricsBtn").click());

    let swipeY = null;
    audioDock.addEventListener("touchstart", e => {
        if (!audioDock.classList.contains("expanded") || e.target.closest("input[type=range]")) { swipeY = null; return; }
        swipeY = e.touches[0].clientY;
    }, { passive: true });
    audioDock.addEventListener("touchend", e => {
        if (swipeY === null) return;
        const dy = e.changedTouches[0].clientY - swipeY;
        swipeY = null;
        if (dy > 110 && audioDock.scrollTop <= 0) setExpanded(false);
    }, { passive: true });

    function tintDock() {
        try {
            const img = nowPlayingCover;
            if (!img.naturalWidth || img.classList.contains("no-art")) { audioDock.style.removeProperty("--np-color"); return; }
            const c = document.createElement("canvas");
            c.width = c.height = 12;
            const ctx = c.getContext("2d");
            ctx.drawImage(img, 0, 0, 12, 12);
            const d = ctx.getImageData(0, 0, 12, 12).data;
            let r = 0, g = 0, b = 0, n = 0;
            for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
            audioDock.style.setProperty("--np-color", `rgb(${Math.round(r / n * 0.6)}, ${Math.round(g / n * 0.6)}, ${Math.round(b / n * 0.6)})`);
        } catch (e) {
            audioDock.style.removeProperty("--np-color");
        }
    }
    nowPlayingCover.addEventListener("load", tintDock);

    renderSidebarTracks();
    updateNavButtons();
})();
