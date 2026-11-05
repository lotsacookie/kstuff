/**
 * Game hub: FreezeNova Roblox (ours, always first) + the Astra library. Clicking an Astra card calls `hub.onSelect(game)`.
 * Everything that touches the network goes through the injected `fetchAstra` (the site net hub),
 * so the list and the icons are proxied and this file has no browser-only imports.
 */
import { ASTRA_ICONS } from "./astra-icons.js";

export const ASTRA_ORIGIN = "https://astra-education.top";
const CACHE_KEY = "sc_astra_games";
const CACHE_TTL = 60 * 60 * 1000;      // fresh: skip the network
const ICON_CACHE = "sc_astra_icons_v1"; // Cache Storage bucket for icon images
const ICON_CONCURRENCY = 4;

/** Accepts {ok, games:[...]} or a bare array. Drops blanks and dupes; sorts by name. Astra's own Roblox is kept (FreezeNova is the separate card above it). */
export function normalizeGames(raw, icons = ASTRA_ICONS) {
  const list = Array.isArray(raw) ? raw : raw && Array.isArray(raw.games) ? raw.games : [];
  const seen = new Set(), out = [];
  for (const g of list) {
    if (!g || typeof g !== "object") continue;
    const id = String(g.gameId ?? g.id ?? "").trim();
    const name = String(g.gameName ?? g.name ?? "").trim();
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, name, icon: icons[id] || null });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export class Hub {
  /** @param {{ fetchAstra: (url: string, init?: object) => Promise<Response>, doc?: Document }} o */
  constructor({ fetchAstra, doc = typeof document !== "undefined" ? document : null }) {
    this.fetchAstra = fetchAstra;
    this.doc = doc;
    this.icons = new Map();   // path -> blob URL
    this.queue = [];
    this.active = 0;
    this.games = [];
    /** @type {((game: {id: string, name: string}) => void) | null} */
    this.onSelect = null;
    /** @type {((games: Array<{id: string, name: string, icon: string|null}>) => void) | null} called after the library renders */
    this.onRender = null;
  }

  $(id) { return this.doc.getElementById(id); }

  /** Prepare the Astra section (the FreezeNova card is static markup in index.html). */
  mount() {
    this.grid = this.$("game-grid");
    this.note = this.$("astra-note");
    this.io = "IntersectionObserver" in globalThis
      ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { this.io.unobserve(e.target); this.loadIcon(e.target); } }), { rootMargin: "200px" })
      : null;
    this.setNote("Loading library…");
  }

  /** FreezeNova's card is static markup; its image comes through the proxy like the Astra ones. */
  loadFeatured() {
    for (const art of this.grid.querySelectorAll(".has-art .card-art[data-icon]")) this.loadIcon(art);
  }

  setNote(text, retry = false) {
    if (!this.note) return;
    this.note.textContent = text;
    this.note.hidden = !text;
    if (retry) {
      const b = this.doc.createElement("button");
      b.type = "button"; b.className = "ld-retry"; b.textContent = "Try again";
      b.addEventListener("click", () => this.loadAstra());
      this.note.append(" ", b);
    }
  }

  readCache() {
    try { const c = JSON.parse(localStorage.getItem(CACHE_KEY)); return c && Array.isArray(c.games) ? c : null; } catch { return null; }
  }

  async loadAstra() {
    if (!this._featured) { this._featured = true; this.loadFeatured(); }
    const cached = this.readCache();
    if (cached && Date.now() - cached.t < CACHE_TTL) return this.render(cached.games);
    if (cached) this.render(cached.games); // stale: show it instantly, refresh in the background
    else this.setNote("Loading library…");
    try {
      const res = await this.fetchAstra(ASTRA_ORIGIN + "/api/cg/games", { cache: "no-store" });
      const data = await res.json();
      const games = normalizeGames(data);
      if (!games.length) throw new Error("empty catalog");
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), games })); } catch {}
      this.render(games);
    } catch (e) {
      console.warn("[hub] Astra list failed:", e && e.message);
      if (!cached) this.setNote("Couldn't load the library.", true);
    }
  }

  render(games) {
    this.games = games;
    this.setNote("");
    const d = this.doc, frag = d.createDocumentFragment();
    for (const g of games) {
      const card = d.createElement("button");
      card.type = "button";
      card.className = "game-card has-art astra";
      card.addEventListener("click", () => this.onSelect?.(g));
      const art = d.createElement("div");
      art.className = "card-art";
      art.setAttribute("aria-hidden", "true");
      art.textContent = g.name.charAt(0).toUpperCase();
      if (g.icon) art.dataset.icon = g.icon;
      const h = d.createElement("h3"); h.textContent = g.name;
      const tag = d.createElement("div"); tag.className = "play-tag"; tag.textContent = "Play now";
      card.append(art, h);
      if (/^(ng_)?roblox$/i.test(g.id)) { // two Roblox cards (FreezeNova + Astra's), so say which is which
        const src = d.createElement("div"); src.className = "pkg-name"; src.textContent = "Astra"; card.append(src);
      }
      card.append(tag);
      frag.append(card);
    }
    this.grid.querySelectorAll(".game-card.astra").forEach((c) => c.remove());
    this.grid.append(frag);
    for (const art of this.grid.querySelectorAll(".astra .card-art[data-icon]")) this.io ? this.io.observe(art) : this.loadIcon(art);
    try { this.onRender?.(games); } catch {}
  }

  /** Icons come through the proxy too (blob URLs), a few at a time, only when scrolled near. */
  loadIcon(art) {
    const path = art.dataset.icon;
    if (this.icons.has(path)) return this.applyIcon(art, this.icons.get(path));
    this.queue.push([art, path]);
    this.pump();
  }

  /** Icons persist in Cache Storage so they don't re-download every visit. Failures just fall back to the network. */
  async cachedIcon(path) {
    try { const r = await (await caches.open(ICON_CACHE)).match("/__astra" + path); return r ? await r.blob() : null; } catch { return null; }
  }

  async storeIcon(path, blob) {
    try { await (await caches.open(ICON_CACHE)).put("/__astra" + path, new Response(blob, { headers: { "Content-Type": blob.type } })); } catch {}
  }

  applyIcon(art, url) {
    art.style.backgroundImage = `url("${url}")`;
    art.classList.add("has-img");
    art.textContent = "";
  }

  pump() {
    while (this.active < ICON_CONCURRENCY && this.queue.length) {
      const [art, path] = this.queue.shift();
      this.active++;
      (async () => {
        try {
          if (!this.icons.has(path)) {
            let blob = await this.cachedIcon(path);
            if (!blob) {
              const res = await this.fetchAstra(ASTRA_ORIGIN + path);
              if (!res.ok) throw new Error(String(res.status));
              blob = await res.blob();
              this.storeIcon(path, blob);
            }
            this.icons.set(path, URL.createObjectURL(blob));
          }
          this.applyIcon(art, this.icons.get(path));
        } catch (e) { /* keep the lettered placeholder */ }
      })().finally(() => { this.active--; this.pump(); });
    }
  }
}
