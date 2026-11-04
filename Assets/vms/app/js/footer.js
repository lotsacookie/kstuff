/**
 * Bottom footer bar shared by the FreezeNova and Astra stream screens (replaces the old top-right close/fullscreen buttons).
 *
 * Timer accuracy (mirrors how Astra does it): the timer never counts ticks. It stores an absolute deadline (epoch ms)
 * and recomputes `deadline - now` on every paint, so throttled background tabs, slow frames or a missed interval can't
 * make it drift. A server clock offset is applied on top when the server's clock is clearly off from ours.
 *
 * The pure helpers at the top have no DOM access (unit-tested in scripts/footer.test.mjs).
 */

export const SESSION_MS = 30 * 60 * 1000; // Astra's fixed session length for streams that don't report their own end time

/** Epoch ms from a server value: ms or seconds since epoch (number or numeric string) or an ISO date. null if unusable. */
export function parseDeadline(v) {
  if (v == null || v === "") return null;
  const s = typeof v === "string" ? v.trim() : v;
  const n = typeof s === "number" ? s : /^\d+(\.\d+)?$/.test(s) ? Number(s) : Date.parse(s);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n < 1e11 ? n * 1000 : n); // below 1e11 can only be seconds since epoch
}

/** Whole seconds left, rounded up like Astra so the display hits 0:00 exactly when the session does. */
export function remainingSeconds(deadline, now = Date.now()) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function formatClock(total) {
  const s = Math.max(0, Math.floor(total));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${p(m)}:${p(x)}` : `${m}:${p(x)}`;
}

export const timerTone = (sec) => (sec <= 60 ? "danger" : sec <= 300 ? "warn" : "");
export const fpsTone = (fps) => (fps >= 50 ? "good" : fps >= 25 ? "warn" : "danger");

/** Server clock offset (ms, server - client) from an HTTP Date header. Ignored under 3s: the header only has 1s resolution. */
export function clockSkew(dateHeader, now = Date.now()) {
  const d = Date.parse(dateHeader || "");
  if (!Number.isFinite(d)) return 0;
  const skew = d - now;
  return Math.abs(skew) >= 3000 && Math.abs(skew) < 10 * 60 * 1000 ? skew : 0;
}

const ICON = {
  exit: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M8 1L3 6l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clock: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/><path d="M6 3.2V6l2 1.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bars: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="0.5" y="7" width="2.4" height="4" rx="0.6" fill="currentColor"/><rect x="4.3" y="4" width="2.4" height="7" rx="0.6" fill="currentColor"/><rect x="8.1" y="1" width="2.4" height="10" rx="0.6" fill="currentColor"/></svg>',
  sound: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
  muted: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/></svg>',
  enter: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 4V1h3M8 1h3v3M1 8v3h3M11 8v3H8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  leave: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M4.5 1v3H1.5M7.5 1v3h3M4.5 11v-3H1.5M7.5 11v-3h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
};

const OFF_TITLE = "Not available for this game";

export class StreamFooter {
  /**
   * @param {HTMLElement} screen  the .screen the footer lives in (it is positioned at the bottom of it)
   * @param {{ title?: string, onExit?: () => void, off?: Array<"timer"|"stats"|"mute">, doc?: Document, now?: () => number }} o
   *   `off` greys out items that don't apply to this stream (they stay visible so the bar looks the same everywhere).
   */
  constructor(screen, { title = "", onExit = () => {}, off = [], doc = document, now = () => Date.now() } = {}) {
    this.doc = doc; this.screen = screen; this.now = now; this.onExit = onExit;
    this.off = new Set(off);
    this.mode = null; this.deadline = 0; this.skew = 0; this.startedAt = 0;
    this.video = null; this._undo = [];

    // The old top-right buttons are replaced by this bar; drop them if a cached index.html still has them.
    screen.querySelectorAll(".hud").forEach((h) => h.remove());
    screen.querySelectorAll(".stream-footer").forEach((h) => h.remove());

    const el = (tag, cls, html = "") => { const e = doc.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
    const bar = (this.bar = el("footer", "stream-footer"));
    const left = el("div", "sf-group"), mid = el("div", "sf-group sf-mid"), right = el("div", "sf-group");

    this.exitBtn = el("button", "sf-btn", `${ICON.exit}<span class="sf-label">Exit</span>`);
    this.exitBtn.type = "button"; this.exitBtn.title = "Leave game"; this.exitBtn.setAttribute("aria-label", "Leave game");
    this.titleEl = el("span", "sf-title"); this.titleEl.textContent = title;

    this.timerEl = el("div", "sf-chip sf-timer", `${ICON.clock}<span class="sf-timer-text">--:--</span>`);
    this.timerText = this.timerEl.querySelector(".sf-timer-text");
    this.statsEl = el("div", "sf-chip sf-stats", `${ICON.bars}<span class="sf-stats-text">-- FPS</span>`);
    this.statsText = this.statsEl.querySelector(".sf-stats-text");
    this.muteBtn = el("button", "sf-btn sf-icon", ICON.sound);
    this.muteBtn.type = "button";
    this.fsBtn = el("button", "sf-btn", `${ICON.enter}<span class="sf-label">Fullscreen</span>`);
    this.fsBtn.type = "button"; this.fsBtn.title = "Toggle fullscreen"; this.fsBtn.setAttribute("aria-label", "Toggle fullscreen");

    left.append(this.exitBtn); mid.append(this.titleEl); right.append(this.timerEl, this.statsEl, this.muteBtn, this.fsBtn);
    bar.append(left, mid, right);
    screen.append(bar);

    this._click(this.exitBtn, () => this.onExit());
    this._click(this.fsBtn, () => this.toggleFullscreen());
    this._click(this.muteBtn, () => this.toggleMute());
    this._listen(doc, "fullscreenchange", () => { this._paintFs(); this.poke(); });
    this._listen(doc, "visibilitychange", () => this.tick());
    for (const t of ["pointermove", "pointerdown", "touchstart"]) this._listen(screen, t, () => this.poke(), { passive: true });

    this._applyOff();
    this._paintFs(); this._paintMute();
    this._interval = setInterval(() => this.tick(), 250);
  }

  _listen(target, type, fn, opts) { target.addEventListener(type, fn, opts); this._undo.push(() => target.removeEventListener(type, fn, opts)); }

  /** Click handler that also drops focus, so the game keeps getting the keyboard afterwards. */
  _click(btn, fn) { btn.addEventListener("click", () => { if (btn.disabled) return; fn(); btn.blur(); }); }

  setTitle(t) { this.titleEl.textContent = t || ""; }

  /** Which items are greyed out right now. */
  setOff(list) { this.off = new Set(list); this._applyOff(); }

  _applyOff() {
    const set = (node, key, btn) => {
      const off = this.off.has(key);
      node.classList.toggle("sf-off", off);
      if (btn) node.disabled = off;
      node.setAttribute("aria-disabled", String(off));
      if (off) node.title = OFF_TITLE;
      else if (key === "stats") node.title = "Resolution and frames per second";
    };
    set(this.timerEl, "timer"); set(this.statsEl, "stats"); set(this.muteBtn, "mute", true);
    if (!this.off.has("mute")) this.muteBtn.title = "Mute / unmute";
    if (this.off.has("timer")) this.timerText.textContent = "--:--";
    if (this.off.has("stats")) this.statsText.textContent = "-- FPS";
    this._paintTimer();
  }

  /* ------------------------------- timer -------------------------------- */

  /** Count down to an absolute epoch-ms deadline. `skew` = server clock - our clock (ms). */
  startCountdown(deadline, skew = 0) {
    this.mode = "down"; this.deadline = deadline; this.skew = skew || 0;
    this.timerEl.title = "Time remaining in this session";
    this.setOff([...this.off].filter((k) => k !== "timer"));
  }

  /** No end time known for this stream: show how long the session has been running instead. */
  startElapsed(since = this.now()) {
    this.mode = "up"; this.startedAt = since; this.skew = 0;
    this.timerEl.title = "Session time";
    this.setOff([...this.off].filter((k) => k !== "timer"));
  }

  stopTimer() {
    this.mode = null;
    this.timerEl.className = "sf-chip sf-timer" + (this.off.has("timer") ? " sf-off" : "");
    this.timerText.textContent = "--:--";
  }

  /** Seconds left (count-down) or elapsed (count-up); null when no timer is running. */
  seconds() {
    if (this.mode === "down") return remainingSeconds(this.deadline, this.now() + this.skew);
    if (this.mode === "up") return Math.max(0, Math.floor((this.now() - this.startedAt) / 1000));
    return null;
  }

  tick() { this._paintTimer(); }

  _paintTimer() {
    if (this.off.has("timer") || !this.mode) return;
    const s = this.seconds();
    const text = formatClock(s);
    if (this.timerText.textContent !== text) this.timerText.textContent = text;
    const tone = this.mode === "down" ? timerTone(s) : "";
    const cls = "sf-chip sf-timer" + (tone ? " " + tone : "");
    if (this.timerEl.className !== cls) this.timerEl.className = cls;
  }

  /* ------------------------------ stats / mute ------------------------------ */

  /** Live resolution + FPS read off the <video> element (frame callbacks, or the playback-quality counter as a fallback). */
  watchVideo(video) {
    this.unwatchVideo();
    this.video = video;
    this._paintMute();
    if (video) {
      const vc = () => this._paintMute();
      video.addEventListener("volumechange", vc);
      this._unVolume = () => video.removeEventListener("volumechange", vc);
    }
    if (!video || this.off.has("stats")) return;
    let frames = 0, last = performance.now(), alive = true;
    const rvfc = typeof video.requestVideoFrameCallback === "function";
    const total = () => { try { return video.getVideoPlaybackQuality().totalVideoFrames; } catch { return null; } };
    let lastTotal = rvfc ? null : total();
    if (rvfc) { const loop = () => { if (!alive) return; frames++; video.requestVideoFrameCallback(loop); }; video.requestVideoFrameCallback(loop); }
    else if (lastTotal === null) { this.statsEl.classList.add("sf-off"); return; }
    const t = setInterval(() => {
      const now = performance.now(), dt = Math.max(1, now - last);
      if (!rvfc) { const tt = total(); frames = tt === null ? 0 : tt - lastTotal; lastTotal = tt; }
      const fps = Math.round((frames * 1000) / dt);
      frames = 0; last = now;
      const h = video.videoHeight;
      this.statsText.textContent = `${h ? h + "p · " : ""}${video.paused ? "--" : fps} FPS`;
      this.statsEl.className = "sf-chip sf-stats" + (video.paused ? "" : " " + fpsTone(fps));
    }, 1000);
    this._stopMeter = () => { alive = false; clearInterval(t); };
  }

  unwatchVideo() {
    this._stopMeter?.(); this._stopMeter = null;
    this._unVolume?.(); this._unVolume = null; this.video = null;
    if (!this.off.has("stats")) { this.statsText.textContent = "-- FPS"; this.statsEl.className = "sf-chip sf-stats"; }
  }

  toggleMute() {
    if (!this.video) return;
    this.video.muted = !this.video.muted;
    this._paintMute();
  }

  _paintMute() {
    const m = !this.video || this.video.muted;
    this.muteBtn.innerHTML = m ? ICON.muted : ICON.sound;
    if (!this.off.has("mute")) this.muteBtn.setAttribute("aria-label", m ? "Unmute" : "Mute");
  }

  /* ------------------------------ fullscreen ------------------------------ */

  toggleFullscreen() {
    const d = this.doc;
    if (d.fullscreenElement) d.exitFullscreen?.().catch(() => {});
    else d.documentElement.requestFullscreen?.().catch(() => {});
  }

  _paintFs() {
    const on = !!this.doc.fullscreenElement;
    this.fsBtn.innerHTML = `${on ? ICON.leave : ICON.enter}<span class="sf-label">${on ? "Exit fullscreen" : "Fullscreen"}</span>`;
  }

  /** Show the bar; in fullscreen it fades out again after a few idle seconds so it doesn't cover the game. */
  poke() {
    this.bar.classList.remove("idle");
    clearTimeout(this._idle);
    if (!this.doc.fullscreenElement) return;
    this._idle = setTimeout(() => {
      if (!this.bar.matches(":hover, :focus-within")) this.bar.classList.add("idle");
    }, 3000);
  }

  /** Back to a clean state between sessions. */
  reset({ title = "", off = null } = {}) {
    this.stopTimer(); this.unwatchVideo(); this.setTitle(title);
    if (off) this.setOff(off);
    this.bar.classList.remove("idle");
  }

  destroy() {
    clearInterval(this._interval); clearTimeout(this._idle); this.unwatchVideo();
    this._undo.forEach((f) => f()); this.bar.remove();
  }
}
