(function () {
  if (window.SC) return;
  var API = "https://api-v2.soundcloud.com";
  var SEED_CID = "qLcgHhXgeEFFaSolTB9I71LBsqncsD93";
  var CID_RE = /client_id["']?\s*[:=]\s*\\?["']([A-Za-z0-9]{20,40})\\?["']/;
  var HLS_SRC = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
  var GENRES = { trending: "all-music", pop: "pop", hiphop: "hiphoprap", rock: "rock", dance: "danceedm", rnb: "rbsoul", latin: "latin", electro: "electronic", country: "country", alternative: "alternativerock" };
  var cid = null, cidP = null, hls = null, hlsLib = null;
  try { cid = localStorage.getItem("sc_cid"); } catch (e) {}
  cid = cid || SEED_CID;

  function pathOf(u) { try { return new URL(u).pathname.slice(0, 60); } catch (e) { return ""; } }

  async function get(url, binary) {
    if (!window.kNet) throw new Error("Net hub unavailable");
    if (!(await window.kNet.waitAvailable(8000))) throw new Error("Net hub unavailable");
    for (var i = 0; ; i++) {
      var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, 25000);
      try {
        var r = await window.kNet.fetch(url, { signal: ctl.signal, headers: { Accept: "application/json, text/plain, */*" } });
        if (!r.ok) { var er = new Error("HTTP " + r.status + " " + pathOf(url)); er.status = r.status; throw er; }
        return binary ? await r.arrayBuffer() : await r.text();
      } catch (e) {
        var retry = i < 1 && (!e.status || e.status === 429 || e.status === 503);
        if (!retry) throw e;
        await window.kNet.rotate();
      } finally { clearTimeout(t); }
    }
  }

  function findCid() {
    return (cidP ||= (async function () {
      var html = await get("https://soundcloud.com/");
      var urls = Array.from(new Set(Array.from(html.matchAll(/https:\/\/a-v2\.sndcdn\.com\/assets\/[^"'\s<>]+?\.js/g)).map(function (m) { return m[0]; }))).reverse();
      for (var i = 0; i < urls.length; i += 4) {
        var hits = await Promise.all(urls.slice(i, i + 4).map(function (u) { return get(u).then(function (t) { return CID_RE.exec(t); }, function () { return null; }); }));
        var hit = hits.find(Boolean);
        if (hit) { cid = hit[1]; try { localStorage.setItem("sc_cid", cid); } catch (e) {} return cid; }
      }
      throw new Error("SoundCloud client id not found");
    })().finally(function () { cidP = null; }));
  }

  async function api(url) {
    var u = function () { return url + (url.indexOf("?") >= 0 ? "&" : "?") + "client_id=" + cid; };
    try { return JSON.parse(await get(u())); }
    catch (e) {
      if (e.status !== 401 && e.status !== 403) throw e;
      await findCid();
      return JSON.parse(await get(u()));
    }
  }

  function isDrm(o) {
    var tc = o && o.media && o.media.transcodings;
    return !!(tc && tc.length && tc.every(function (x) { return /encrypted/.test(x.format.protocol); }));
  }
  function rank(list) {
    var mime = function (x) { return (x.format.mime_type || "").toLowerCase(); }, proto = function (x) { return x.format.protocol; };
    return [].concat(
      list.filter(function (x) { return proto(x) === "progressive"; }),
      list.filter(function (x) { return proto(x) === "hls" && mime(x).indexOf("mpeg") >= 0; }),
      list.filter(function (x) { return proto(x) === "hls" && mime(x).indexOf("mp4") >= 0; })
    );
  }
  function cover(o) {
    var u = o.artwork_url || (o.user && o.user.avatar_url) || "";
    return u.replace("-large", "-t300x300");
  }
  function toSong(o) {
    return { id: o.id, title: o.title || "Untitled", artist: (o.user && o.user.username) || "", cover: cover(o), duration: Math.round((o.duration || 0) / 1000) };
  }
  function usable(o) {
    return o && o.id && o.title && o.kind !== "user" && o.kind !== "playlist" && o.policy !== "BLOCK" && o.streamable !== false && !isDrm(o);
  }

  async function search(q, limit) {
    var out = [], url = API + "/search/tracks?q=" + encodeURIComponent(q) + "&limit=" + Math.min(limit || 50, 50) + "&offset=0&linked_partitioning=1&app_locale=en";
    for (var page = 0; url && out.length < (limit || 50) && page < 2; page++) {
      var d = await api(url);
      (d.collection || []).forEach(function (o) { if (usable(o)) out.push(toSong(o)); });
      url = d.next_href || null;
    }
    return out;
  }

  async function shelf(id, title) {
    var slug = GENRES[id];
    if (slug) {
      try {
        var d = await api(API + "/charts?kind=top&genre=" + encodeURIComponent("soundcloud:genres:" + slug) + "&high_tier_only=false&limit=30&linked_partitioning=1");
        var list = (d.collection || []).map(function (x) { return x.track; }).filter(usable).map(toSong);
        if (list.length) return list;
      } catch (e) {}
    }
    return search(title, 30);
  }

  // SoundCloud's real homepage ("mixed selections"): returns the actual category titles it shows
  // plus the playlists inside each one. Tracks are hydrated lazily per category.
  async function home() {
    var d = await api(API + "/mixed-selections?limit=20&offset=0&linked_partitioning=1&app_locale=en");
    var seenTitles = {};
    return (d.collection || []).map(function (sel) {
      var items = ((sel.items && sel.items.collection) || []).filter(function (it) { return it && it.kind !== "user"; });
      return { id: "sel:" + (sel.id || sel.urn || sel.title), title: (sel.title || "").trim(), items: items };
    }).filter(function (sel) {
      if (!sel.title || !sel.items.length || seenTitles[sel.title]) return false;
      seenTitles[sel.title] = 1;
      return true;
    });
  }

  async function selectionTracks(sel, limit) {
    limit = limit || 30;
    var per = sel.items.length > 1 ? Math.max(3, Math.ceil(limit / sel.items.length)) : limit;
    var seen = {}, ordered = [];
    sel.items.forEach(function (it) {
      var list = it.kind === "track" ? [it] : (it.tracks || []);
      var n = 0;
      list.forEach(function (t) {
        if (!t || !t.id || seen[t.id] || n >= per || ordered.length >= limit + 10) return;
        seen[t.id] = 1; n++; ordered.push(t);
      });
    });
    var stubs = ordered.filter(function (t) { return !t.title; }).map(function (t) { return t.id; });
    var full = {};
    for (var i = 0; i < stubs.length; i += 40) {
      try {
        var arr = await api(API + "/tracks?ids=" + stubs.slice(i, i + 40).join(",") + "&app_locale=en");
        (Array.isArray(arr) ? arr : (arr.collection || [])).forEach(function (o) { if (o && o.id) full[o.id] = o; });
      } catch (e) {}
    }
    return ordered.map(function (t) { return t.title ? t : full[t.id]; }).filter(usable).map(toSong).slice(0, limit);
  }

  async function findMatch(track) {
    var list = await search(((track.artist || "") + " " + (track.titleShort || track.title || "")).trim(), 10);
    return list[0] || null;
  }

  async function resolve(id) {
    var tr = await api(API + "/tracks/" + id);
    var ranked = rank((tr.media && tr.media.transcodings) || []);
    if (!ranked.length) throw new Error(isDrm(tr) ? "DRM-protected track" : "no playable stream");
    var errs = [];
    for (var i = 0; i < ranked.length; i++) {
      var c = ranked[i];
      try {
        var res = await api(c.url + (c.url.indexOf("?") >= 0 ? "&" : "?") + "track_authorization=" + encodeURIComponent(tr.track_authorization || ""));
        if (res && res.url) return { protocol: c.format.protocol, url: res.url };
      } catch (e) { errs.push(String((e && e.message) || e)); }
    }
    throw new Error("could not resolve stream: " + errs.join(" | "));
  }

  function loadHls() {
    return (hlsLib ||= new Promise(function (res, rej) {
      if (window.Hls) return res(window.Hls);
      var s = document.createElement("script"); s.src = HLS_SRC;
      s.onload = function () { res(window.Hls); }; s.onerror = function () { hlsLib = null; rej(new Error("hls.js failed to load")); };
      document.head.appendChild(s);
    }));
  }
  function HubLoader() {
    this.context = null;
    this.stats = { aborted: false, loaded: 0, retry: 0, total: 0, chunkCount: 0, bwEstimate: 0, loading: { start: 0, first: 0, end: 0 }, parsing: { start: 0, end: 0 }, buffering: { start: 0, first: 0, end: 0 } };
  }
  HubLoader.prototype.load = function (context, config, cb) {
    var st = this.stats, bin = context.responseType === "arraybuffer";
    this.context = context; st.loading.start = performance.now();
    get(context.url, bin).then(function (data) {
      if (st.aborted) return;
      st.loading.first = st.loading.end = performance.now(); st.loaded = st.total = bin ? data.byteLength : data.length;
      cb.onSuccess({ url: context.url, data: data }, st, context, null);
    }, function (e) { if (!st.aborted) cb.onError({ code: e.status || 0, text: String((e && e.message) || e) }, context, null, st); });
  };
  HubLoader.prototype.abort = function () { this.stats.aborted = true; };
  HubLoader.prototype.destroy = function () {};
  HubLoader.prototype.getCacheAge = function () { return null; };
  HubLoader.prototype.getResponseHeader = function () { return null; };

  function stop() { if (hls) { try { hls.destroy(); } catch (e) {} hls = null; } }
  async function attachHls(audio, url) {
    stop();
    var Hls = await loadHls();
    if (!Hls.isSupported()) throw new Error("no Media Source support for HLS");
    hls = new Hls({ loader: HubLoader, maxBufferLength: 30, manifestLoadingMaxRetry: 2, fragLoadingMaxRetry: 3 });
    hls.on(Hls.Events.ERROR, function (_, d) { if (d.fatal) console.warn("hls fatal:", d.type, d.details); });
    hls.loadSource(url); hls.attachMedia(audio);
    return hls;
  }

  window.SC = { search: search, shelf: shelf, home: home, selectionTracks: selectionTracks, findMatch: findMatch, resolve: resolve, attachHls: attachHls, stop: stop, _t: { rank: rank, isDrm: isDrm, toSong: toSong, usable: usable } };
})();
