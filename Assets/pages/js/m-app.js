(function () {
    const libList = document.getElementById("libList");
    const playlistView = document.getElementById("playlistView");
    const coverInput = document.getElementById("coverInput");
    const newPlaylistBtn = document.getElementById("newPlaylistBtn");
    const loopBtn = document.getElementById("loopBtn");
    const volIcon = document.getElementById("volIcon");
    const totalTime = document.getElementById("totalTime");

    const NOTE_ICON = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;

    SVG_ICONS.play = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    SVG_ICONS.pause = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    SVG_ICONS.trash = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;

    let covers = {};
    try { covers = JSON.parse(localStorage.getItem("playlistCovers")) || {}; } catch (e) { covers = {}; }

    function saveCovers() {
        try { localStorage.setItem("playlistCovers", JSON.stringify(covers)); } catch (e) {}
    }

    function paint(el) {
        const max = Number(el.max) || 100;
        el.style.setProperty("--p", (Number(el.value) / max * 100) + "%");
    }

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

    function libItem(name, selected) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "lib-item" + (selected ? " sel" : "");
        item.title = name;
        item.appendChild(coverEl(name));
        const text = document.createElement("div");
        text.className = "lib-text";
        const count = playlists[name].length;
        text.innerHTML = `<div class="lib-name">${escapeHTML(name)}</div><div class="lib-sub">Playlist • ${count} ${count === 1 ? "song" : "songs"}</div>`;
        item.appendChild(text);
        item.addEventListener("click", () => openPlaylist(name));
        return item;
    }

    function renderPlaylistView() {
        const name = sidebarPlaylistSelect.value;
        const list = playlists[name];
        if (!list) {
            playlistView.hidden = true;
            return;
        }
        playlistView.innerHTML = "";

        const head = document.createElement("div");
        head.className = "pl-head";
        const cw = document.createElement("div");
        cw.className = "pl-cover";
        cw.appendChild(coverEl(name));
        cw.insertAdjacentHTML("beforeend", `<div class="pl-cover-edit">Choose image</div>`);
        cw.addEventListener("click", () => coverInput.click());
        const info = document.createElement("div");
        info.className = "pl-info";
        info.innerHTML = `<p>Playlist</p><h1>${escapeHTML(name)}</h1><p>${list.length} ${list.length === 1 ? "song" : "songs"}</p>`;
        head.append(cw, info);
        playlistView.appendChild(head);

        const actions = document.createElement("div");
        actions.className = "pl-actions";
        const playBtn = document.createElement("button");
        playBtn.className = "play-big";
        playBtn.title = "Play";
        playBtn.innerHTML = SVG_ICONS.play;
        playBtn.addEventListener("click", () => { if (list.length) window.playFromPlaylist(name, 0); });
        actions.appendChild(playBtn);
        if (covers[name]) {
            const reset = document.createElement("button");
            reset.className = "ghost-btn";
            reset.textContent = "Remove image";
            reset.addEventListener("click", () => {
                delete covers[name];
                saveCovers();
                renderSidebarTracks();
            });
            actions.appendChild(reset);
        }
        playlistView.appendChild(actions);

        if (!list.length) {
            playlistView.insertAdjacentHTML("beforeend", `<div class="empty-note">This playlist is empty. Hover a song and tap + to add it here.</div>`);
            return;
        }

        list.forEach((track, index) => {
            const row = document.createElement("div");
            const active = activePlayingPlaylist === name && activePlayingIndex === index;
            row.className = "row" + (active ? " active" : "");
            row.draggable = true;
            row.innerHTML = `
                <span class="row-n">${index + 1}</span>
                <img class="row-img" alt="">
                <div class="row-text">
                    <div class="row-title">${escapeHTML(track.title)}</div>
                    <div class="row-artist">${escapeHTML(track.artist || "")}</div>
                </div>
                <span class="row-dur">${track.duration ? formatTime(track.duration) : ""}</span>
                <button type="button" class="row-rm" title="Remove">${SVG_ICONS.trash}</button>
            `;
            setImageDirect(row.querySelector(".row-img"), trackCoverUrls(track), track);
            row.addEventListener("click", () => window.playFromPlaylist(name, index));
            row.querySelector(".row-rm").addEventListener("click", e => {
                e.stopPropagation();
                window.removeTrack(name, index);
            });
            row.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", index));
            row.addEventListener("dragover", e => { e.preventDefault(); row.classList.add("drag-over"); });
            row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
            row.addEventListener("drop", e => {
                e.preventDefault();
                row.classList.remove("drag-over");
                const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
                if (!isNaN(from) && from !== index) reorderPlaylistTrack(name, from, index);
            });
            playlistView.appendChild(row);
        });
    }

    window.renderSidebarTracks = function () {
        libList.innerHTML = "";
        const selected = sidebarPlaylistSelect.value;
        Object.keys(playlists).forEach(name => {
            libList.appendChild(libItem(name, !playlistView.hidden && name === selected));
        });
        if (!playlistView.hidden) renderPlaylistView();
    };

    function openPlaylist(name) {
        closeLyricsView();
        sidebarPlaylistSelect.value = name;
        homeView.hidden = true;
        resultsList.hidden = true;
        playlistView.hidden = false;
        window.scrollTo({ top: 0 });
        renderSidebarTracks();
    }

    function leavePlaylist() {
        if (playlistView.hidden) return;
        playlistView.hidden = true;
        renderSidebarTracks();
    }

    searchBtn.addEventListener("click", leavePlaylist);
    homeBtn.addEventListener("click", leavePlaylist);
    searchInput.addEventListener("keydown", e => { if (e.key === "Enter") leavePlaylist(); });

    toggleSidebarBtn.addEventListener("click", () => document.body.classList.toggle("lib-collapsed"));
    if (window.matchMedia("(max-width: 650px)").matches) document.body.classList.add("lib-collapsed");

    newPlaylistBtn.addEventListener("click", () => {
        const name = (window.prompt("Playlist name") || "").trim();
        if (!name || playlists[name]) return;
        playlists[name] = [];
        savePlaylists();
        updatePlaylistDropdowns();
        openPlaylist(name);
    });

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

    let pendingTrack = null;

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
        let target = modalPlaylistSelect.value;
        const newName = newPlaylistInput.value.trim();
        if (newName) {
            target = newName;
            if (!playlists[target]) playlists[target] = [];
        }
        if (!track || !target || !playlists[target]) return;
        const entry = serializeTrack(track);
        if (!entry.videoId) entry.videoId = workingVideos[track.key] || null;
        if (!entry.streamId) entry.streamId = workingStreams[track.key] || null;
        playlists[target].push(normalizeTrack({ ...entry, videos: [] }));
        savePlaylists();
        updatePlaylistDropdowns();
        sidebarPlaylistSelect.value = target;
        pendingTrack = null;
        playlistModal.classList.remove("active");
        renderSidebarTracks();
    });

    playlistModal.addEventListener("click", e => {
        if (e.target === playlistModal) playlistModal.classList.remove("active");
    });

    window.createTile = function (track, onClick) {
        const card = document.createElement("div");
        card.className = "card";
        card.tabIndex = 0;
        card.setAttribute("role", "button");
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
            openAddModal(track);
        });
        return card;
    };

    window.updateTime = function () {
        currentTime.textContent = formatTime(audioPlayer.currentTime);
        totalTime.textContent = formatTime(audioPlayer.duration);
    };

    let loopMode = 0;
    const loopTitles = ["Repeat off", "Repeat all", "Repeat one"];
    loopBtn.addEventListener("click", () => {
        loopMode = (loopMode + 1) % 3;
        audioPlayer.loop = loopMode === 2;
        loopBtn.classList.toggle("on", loopMode > 0);
        loopBtn.classList.toggle("one", loopMode === 2);
        loopBtn.title = loopTitles[loopMode];
    });

    audioPlayer.addEventListener("ended", () => {
        if (loopMode !== 1) return;
        const q = getQueue();
        if (q && !hasNext()) playQueueIndex(q, 0);
    });

    volIcon.addEventListener("click", () => {
        audioPlayer.muted = !audioPlayer.muted;
        volIcon.style.opacity = audioPlayer.muted ? "0.4" : "1";
    });

    progressBar.addEventListener("input", () => paint(progressBar));
    audioPlayer.addEventListener("timeupdate", () => paint(progressBar));
    audioPlayer.addEventListener("loadedmetadata", () => paint(progressBar));
    volumeBar.addEventListener("input", () => paint(volumeBar));
    paint(progressBar);
    paint(volumeBar);

    renderSidebarTracks();
})();
