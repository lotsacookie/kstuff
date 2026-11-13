(function () {
  if (window.AC) return;
  var API = "https://api.audio.com";
  var urls = new Map();

  function pathOf(u) { try { return new URL(u).pathname.slice(0, 60); } catch (e) { return ""; } }

  async function get(url) {
    if (!window.kNet) throw new Error("Net hub unavailable");
    if (!(await window.kNet.waitAvailable(8000))) throw new Error("Net hub unavailable");
    for (var i = 0; ; i++) {
      var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, 25000);
      try {
        var r = await window.kNet.fetch(url, { signal: ctl.signal, headers: { Accept: "application/json, text/plain, */*" } });
        if (!r.ok) { var er = new Error("HTTP " + r.status + " " + pathOf(url)); er.status = r.status; throw er; }
        return await r.text();
      } catch (e) {
        var retry = i < 1 && (!e.status || e.status === 429 || e.status === 503);
        if (!retry) throw e;
        await window.kNet.rotate();
      } finally { clearTimeout(t); }
    }
  }

  function expiry(url) {
    try {
      var q = new URL(url).searchParams;
      var d = q.get("X-Amz-Date"), s = Number(q.get("X-Amz-Expires"));
      var m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(d || "");
      if (!m || !s) return Date.now() + 3600000;
      return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) + s * 1000;
    } catch (e) { return Date.now() + 3600000; }
  }

  function pickUrl(m) {
    return (m.play && m.play.url) || (m.playhq && m.playhq.url) || (m.source && m.source.url) || "";
  }

  function usable(item) {
    var m = item && item.model;
    return !!(item && item.type === "audio" && m && m.id && m.title && m.listed !== false && pickUrl(m));
  }

  function cover(m) {
    var u = m.image || m.avatar || "";
    return /^https?:\/\//.test(u) ? u : "";
  }

  function toSong(item) {
    var m = item.model;
    var ms = (m.play && m.play.duration) || (m.source && m.source.duration) || 0;
    return { id: String(m.id), title: m.title, artist: m.author || m.username || "", cover: cover(m), duration: Math.round(ms / 1000) };
  }

  function remember(item) {
    var url = pickUrl(item.model);
    urls.set(String(item.model.id), { url: url, exp: expiry(url) });
  }

  async function search(q, limit) {
    var d = JSON.parse(await get(API + "/search?q=" + encodeURIComponent(q)));
    var out = [];
    (d.items || []).forEach(function (item) {
      if (!usable(item)) return;
      remember(item);
      out.push(toSong(item));
    });
    return out.slice(0, limit || 50);
  }

  async function resolve(track) {
    var id = String(track.id);
    var hit = urls.get(id);
    if (hit && hit.exp - Date.now() > 60000) return hit.url;
    await search(((track.artist || "") + " " + (track.titleShort || track.title || "")).trim(), 50);
    hit = urls.get(id);
    if (hit && hit.exp - Date.now() > 60000) return hit.url;
    throw new Error("audio.com track not found");
  }

  function norm(s) { return String(s || "").toLowerCase().replace(/\(.*?\)|\[.*?\]/g, " ").replace(/[^a-z0-9]+/g, " ").trim(); }

  // Match by song title only (artist names often differ on audio.com). Returns a stream url or "".
  async function resolveByTitle(track, minSec) {
    var raw = track.titleShort || track.title || "";
    var cleaned = raw.replace(/\(.*?\)|\[.*?\]/g, " ").replace(/\s+/g, " ").trim();
    var queries = [raw];
    if (cleaned && cleaned !== raw) queries.push(cleaned); // retry without (...) / [...] and what is inside
    var want = norm(raw);
    if (!want) return "";
    var wantDur = Number(track.duration) || 0, wantArtist = norm(track.artist);
    for (var qi = 0; qi < queries.length; qi++) {
      var d = JSON.parse(await get(API + "/search?q=" + encodeURIComponent(queries[qi])));
      var best = null, bestScore = -1;
      (d.items || []).forEach(function (item) {
        if (!usable(item)) return;
        var song = toSong(item), t = norm(song.title);
        if (song.duration < (minSec || 0)) return;
        var score = t === want ? 100 : (want.length >= 4 && t.indexOf(want) === 0 ? 50 : -1);
        if (score < 0) return;
        if (wantArtist && norm(song.artist) === wantArtist) score += 20;
        if (wantDur > 45) score -= Math.min(30, Math.abs(song.duration - wantDur) / 10);
        if (score > bestScore) { bestScore = score; best = item; }
      });
      if (best) { remember(best); return pickUrl(best.model); }
    }
    return "";
  }

  window.AC = { search: search, resolve: resolve, resolveByTitle: resolveByTitle };
})();
