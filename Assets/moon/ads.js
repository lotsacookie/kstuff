const GPT_URL = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
const ADSENSE_URL = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1583851598175222";
const PREBID_URL = new URL("./prebid.js", import.meta.url).href;
const BANNER_URL = new URL("./ads/banner.js", import.meta.url).href;
const RAMP_URL = "https://cdn.intergient.com/1025644/76560/ramp.js";
const RAMP_PUBLISHER = "1025644";
const RAMP_ID = "76560";
const RAMP_REWARD_TYPE = "rewarded_ad_video";
const REWARD_UNIT = "/23323187298/adsense_rewarded_web";
const NOFILL_EVENTS = ["rewardedVideoNoFill", "rewardedAdNoFill", "pwNoFillEvent"];
const POLL_OK_MS = 5000;
const POLL_BLOCKED_MS = 30000;
const REWARD_COOLDOWN_MS = 60000;
const REWARD_MAX_SECS = 600;

const SIZES = {
  medium: [[300, 600], [160, 600], [120, 600], [300, 1050], [300, 250], [1, 1], "fluid"],
  slim: [[160, 600], [120, 600], [120, 1050], [1, 1], "fluid"],
  wide: [[970, 90], [980, 90], [980, 120], [750, 100], [728, 90], [1, 1], "fluid"],
};
const NETWORKS = {
  adsense: { net: "23323187298", rev: "260615", region: "std" },
  adsense_us: { net: "23323187298", rev: "260615", region: "us" },
  adsense_new: { net: "23324839143", rev: "261020", region: "std" },
  adsense_us_new: { net: "23324839143", rev: "261020", region: "us" },
};
const POSITIONS = {
  lm: { name: "left_medium", size: "medium", w: 300, h: 600, bids: { std: [1672518, "8fbfb61487d7cd51fd280e4ef71e13aa"], us: [1674360, "300c24eeecd4c255fde8c958887ba6c9"] } },
  rm: { name: "right_medium", size: "medium", w: 300, h: 600, bids: { std: [1672520, "3edcfe61e78318239ecbbf8eda6d6610"], us: [1674362, "1f79879537bd747ab88bf385e428ab87"] } },
  ls: { name: "left_slim", size: "slim", w: 160, h: 600, bids: { std: [1672519, "b50c18bc3ca94c71957228e13fc6ccf3"], us: [1674361, "ddb16e5f0a215f8e62ea7d48e1f45d5c"] } },
  rs: { name: "right_slim", size: "slim", w: 160, h: 600, bids: { std: [1672521, "96ed49499b9e335237ef643db274a80f"], us: [1674363, "bb3e5fbb66066ead756db62264a4d1ca"] } },
  t: { name: "top_slim", size: "wide", w: 980, h: 120, bids: { std: [1672522, "94f9e2a05e4cc8beb3f533807e4ff1a3"], us: [1674364, "d3df0ee227dcab17d62a2550ab867e02"] } },
  b: { name: "bottom_slim", size: "wide", w: 980, h: 120, bids: { std: [1672523, "83df14a1ee56ca5ed8575a0fb4aaef84"], us: [1674365, "554c6744fe5c582fa37988b64e8080ea"] } },
};
const LAYOUTS = {
  lyt1: { slots: [["lm", "left"], ["rm", "right"]], margin: [0, 320, 0, 320] },
  lyt2: { slots: [["ls", "left"], ["rs", "right"]], margin: [0, 180, 0, 180] },
  lyt3: { slots: [["t", "top"], ["b", "bottom"]], margin: [128, 0, 128, 0] },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isMobile = () => /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
const isTablet = () => {
  const u = navigator.userAgent;
  return !!((/Android/i.test(u) && !/Mobile/i.test(u)) || /iPad/i.test(u) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
};
const canShowAd = () => (isTablet() ? innerWidth >= 800 && innerWidth >= innerHeight : !isMobile());
const rewardEligible = (secs, pass) => secs <= REWARD_MAX_SECS && !!pass;
const refreshDelay = (secs) => (secs - 660 > 0 ? 60 : 30) * 1000;

function slotConfig(source, pos) {
  const n = NETWORKS[source];
  const p = POSITIONS[pos];
  if (!n || !p) return null;
  const legacyLeft = pos === "ls" && n.rev === "260615";
  const [geniee, microad] = p.bids[n.region];
  return { unit: `/${n.net}/adsense_${legacyLeft ? "left" : p.name}_${n.rev}`, width: p.w, height: p.h, sizes: SIZES[p.size], geniee, microad };
}

const scriptJobs = new Map();
function tagLoad(url, attrs, timeout) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.async = true;
    s.src = url;
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    const t = setTimeout(() => reject(new Error("timeout")), timeout);
    s.onload = () => { clearTimeout(t); resolve(s); };
    s.onerror = () => { clearTimeout(t); s.remove(); reject(new Error("blocked")); };
    document.head.append(s);
  });
}
async function proxiedLoad(url, getLibcurl, attrs) {
  const lc = await getLibcurl();
  const r = await lc.fetch(url, { method: "GET" });
  if (r.status < 200 || r.status >= 300) throw new Error("HTTP " + r.status);
  const code = await r.text();
  const blobUrl = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
  try { return await tagLoad(blobUrl, attrs, 10000); }
  finally { setTimeout(() => URL.revokeObjectURL(blobUrl), 5000); }
}
function loadScript(url, { getLibcurl, attrs = {}, timeout = 3000, ready = () => false } = {}) {
  if (!scriptJobs.has(url)) {
    const job = tagLoad(url, attrs, timeout).catch(async (e) => {
      if (e.message !== "timeout" || !getLibcurl) throw e;
      if (ready()) return null;
      console.warn("[ads] direct load timed out, using proxy:", url);
      return proxiedLoad(url, getLibcurl, attrs);
    });
    scriptJobs.set(url, job);
    job.catch(() => scriptJobs.delete(url));
  }
  return scriptJobs.get(url);
}

let activityBound = false;
function bindActivity() {
  if (activityBound) return;
  activityBound = true;
  window.lastUserActivity = Date.now();
  const mark = () => { window.lastUserActivity = Date.now(); };
  for (const ev of ["mousemove", "keydown", "mousedown", "touchstart", "touchmove", "pointerdown", "pointermove"]) window.addEventListener(ev, mark, { capture: true, passive: true });
}

let gptJob = null;
function ensureGpt(getLibcurl) {
  if (!gptJob) {
    gptJob = (async () => {
      window.googletag = window.googletag || {};
      window.googletag.cmd = window.googletag.cmd || [];
      bindActivity();
      await loadScript(GPT_URL, { getLibcurl, attrs: { crossorigin: "anonymous" }, ready: () => !!(window.googletag && window.googletag.apiReady) });
      await new Promise((resolve) => window.googletag.cmd.push(resolve));
      const g = window.googletag;
      if (!g._servicesEnabled) {
        if (typeof g.setConfig === "function") g.setConfig({ singleRequest: true, disableInitialLoad: true });
        else { g.pubads().enableSingleRequest(); g.pubads().disableInitialLoad(); }
        g.enableServices();
        g._servicesEnabled = true;
      }
    })();
    gptJob.catch(() => { gptJob = null; });
  }
  return gptJob;
}

const rampApiReady = () => !!(window.ramp && window.ramp.spaNewPage && window.ramp.addUnits && window.ramp.displayUnits);
let rampJob = null;
function ensureRamp(getLibcurl) {
  if (!rampJob) {
    rampJob = (async () => {
      window.ramp = window.ramp || {};
      window.ramp.que = window.ramp.que || [];
      window.ramp.passiveMode = true;
      let lastErr = null;
      for (let i = 0; i < 4; i++) {
        try {
          await loadScript(RAMP_URL, { getLibcurl, ready: () => !!(window.ramp && window.ramp.spaNewPage) });
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          scriptJobs.delete(RAMP_URL);
          await sleep(5000);
        }
      }
      if (lastErr) throw lastErr;
      const t0 = Date.now();
      while (!rampApiReady()) {
        if (Date.now() - t0 > 10000) throw new Error("Ramp ads init timeout");
        await sleep(100);
      }
    })();
    rampJob.catch(() => { rampJob = null; });
  }
  return rampJob;
}

function adScriptProbe() {
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = ADSENSE_URL + "&t=" + Date.now();
    const t = setTimeout(() => resolve("unknown"), 3000);
    s.onload = () => {
      clearTimeout(t);
      resolve(!window.adsbygoogle || typeof window.adsbygoogle.push !== "function" ? "blocked" : "clear");
      s.remove();
    };
    s.onerror = () => { clearTimeout(t); resolve("blocked"); s.remove(); };
    document.head.append(s);
  });
}
async function adBannerProbe() {
  try { return (await fetch(BANNER_URL + "?t=" + Date.now(), { cache: "no-store" })).ok ? "clear" : "unknown"; }
  catch { return "unknown"; }
}
function adBaitProbe() {
  return new Promise((resolve) => {
    const d = document.createElement("div");
    d.id = "ad-banner";
    d.className = "adsbox adsbygoogle ad-placement";
    d.style.cssText = "position:absolute;top:-9999px;left:-9999px;width:1px;height:1px";
    document.body.append(d);
    setTimeout(() => {
      if (!document.body.contains(d)) { resolve("unknown"); return; }
      const cs = getComputedStyle(d);
      const hidden = cs.display === "none" || cs.visibility === "hidden" || d.offsetHeight === 0;
      d.remove();
      resolve(hidden ? "blocked" : "clear");
    }, 200);
  });
}
let probing = null;
export function detectBlocked() {
  if (!probing) {
    probing = Promise.all([adBannerProbe(), adScriptProbe(), adBaitProbe()])
      .then(([banner, script, bait]) => bait === "blocked" || banner === "blocked" || (banner === "clear" && script === "blocked"))
      .finally(() => { probing = null; });
  }
  return probing;
}

function staleTargetingKeys(slot) {
  if (typeof slot.getConfig === "function") {
    const t = slot.getConfig("targeting");
    return Object.keys((t && t.targeting) || {}).filter((k) => k.startsWith("hb_"));
  }
  if (typeof slot.getTargetingKeys === "function") return slot.getTargetingKeys().filter((k) => k.startsWith("hb_"));
  return [];
}
function clearStaleTargeting(slot) {
  const keys = staleTargetingKeys(slot);
  if (!keys.length) return;
  if (typeof slot.setConfig === "function") slot.setConfig({ targeting: Object.fromEntries(keys.map((k) => [k, null])) });
  else keys.forEach((k) => slot.clearTargeting(k));
}
function waitPrebid(ms = 2000) {
  return new Promise((resolve) => {
    if (window.pbjs && window.pbjs.libLoaded) { resolve(true); return; }
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (window.pbjs && window.pbjs.libLoaded) { clearInterval(iv); resolve(true); }
      else if (Date.now() - t0 > ms) { clearInterval(iv); resolve(false); }
    }, 30);
  });
}

function mountGam(host, cfg, getLibcurl) {
  const id = "div-gpt-ad-" + String(Math.random()).slice(2);
  const wrap = document.createElement("div");
  wrap.className = "gam-wrapper";
  wrap.style.minWidth = cfg.width + "px";
  wrap.style.minHeight = cfg.height + "px";
  const target = document.createElement("div");
  target.id = id;
  wrap.append(target);
  host.append(wrap);
  const sizes = cfg.sizes.filter(Array.isArray);
  const bids = [{ bidder: "ssp_geniee", params: { zoneId: cfg.geniee } }, { bidder: "microad", params: { spot: cfg.microad } }];
  let slot = null, alive = true, first = false, inflight = false, timer = null;

  const flush = () => {
    if (!alive) return;
    window.googletag.cmd.push(() => {
      if (!alive || !slot) return;
      clearStaleTargeting(slot);
      if (window.pbjs && window.pbjs.setTargetingForGPTAsync) window.pbjs.setTargetingForGPTAsync([id]);
      window.googletag.pubads().refresh([slot]);
    });
  };
  const firstFlush = () => {
    if (first) return;
    first = true;
    flush();
  };
  const startBidding = () => {
    waitPrebid().then((ok) => {
      if (!ok) { firstFlush(); return; }
      window.pbjs.que.push(() => {
        window.pbjs.setConfig({
          priceGranularity: { buckets: [
            { precision: 2, min: 0.01, max: 3, increment: 0.01 },
            { precision: 2, min: 3, max: 8, increment: 0.05 },
            { precision: 2, min: 8, max: 20, increment: 0.5 },
            { precision: 2, min: 20, max: 35, increment: 1 },
          ] },
          currency: { adServerCurrency: "USD", granularityMultiplier: 1 },
          enableSendAllBids: false,
          useBidCache: false,
        });
        window.pbjs.addAdUnits([{ code: id, mediaTypes: { banner: { sizes } }, bids }]);
        window.pbjs.requestBids({ adUnitCodes: [id], timeout: 1500 }).then(firstFlush);
      });
      setTimeout(firstFlush, 4000);
    });
  };
  const tick = () => {
    if (!alive || document.hidden || inflight || !slot || !window.googletag || !window.googletag.pubads) return;
    if (Date.now() - (window.lastUserActivity || 0) >= 90000) return;
    if (!window.pbjs || !window.pbjs.libLoaded) {
      window.googletag.cmd.push(() => {
        if (!alive || !slot) return;
        clearStaleTargeting(slot);
        window.googletag.pubads().refresh([slot]);
      });
      return;
    }
    inflight = true;
    window.pbjs.que.push(() => {
      window.pbjs.requestBids({ adUnitCodes: [id], timeout: 1500 })
        .then(() => { if (inflight) { inflight = false; flush(); } })
        .catch(() => { inflight = false; });
    });
    setTimeout(() => { if (inflight) { inflight = false; flush(); } }, 2500);
  };

  (async () => {
    await Promise.all([ensureGpt(getLibcurl), loadScript(PREBID_URL).catch((e) => console.warn("[ads] prebid load failed", e))]);
    if (!alive) return;
    window.googletag.cmd.push(() => {
      if (!alive) return;
      slot = window.googletag.defineSlot(cfg.unit, cfg.sizes, id);
      if (!slot) return;
      slot.addService(window.googletag.pubads());
      window.googletag.display(id);
      startBidding();
    });
    if (alive) timer = setInterval(tick, 45000);
  })().catch((e) => console.warn("[ads] slot init failed", cfg.unit, e && e.message || e));

  return {
    destroy() {
      alive = false;
      clearInterval(timer);
      const s = slot;
      if (s && window.googletag && window.googletag.cmd) window.googletag.cmd.push(() => { try { window.googletag.destroySlots([s]); } catch {} });
      try { if (window.pbjs && window.pbjs.removeAdUnit) window.pbjs.removeAdUnit(id); } catch {}
      wrap.remove();
    },
  };
}

const freshReward = () => ({ slot: null, ready: false, empty: false, granted: false, closed: false, makeVisible: null, off: null });

function gamReward({ onReady, onUnavailable }, getLibcurl) {
  let rs = freshReward(), dead = false, playing = false, preparing = false;

  const reset = () => {
    if (rs.off) rs.off();
    const g = window.googletag, slot = rs.slot;
    if (slot && g && typeof g.destroySlots === "function") g.cmd.push(() => { try { g.destroySlots([slot]); } catch {} });
    rs = freshReward();
  };

  const register = (state) => new Promise((resolve, reject) => {
    const g = window.googletag;
    const t0 = Date.now();
    const settle = (fn, v) => { clearInterval(iv); fn(v); };
    const iv = setInterval(() => {
      if (state.ready) settle(resolve);
      else if (state.empty) settle(reject, new Error("No rewarded ad available"));
      else if (Date.now() - t0 > 10000) settle(reject, new Error("Ad timeout"));
    }, 200);
    g.cmd.push(() => {
      if (dead || state !== rs) { settle(reject, new Error("cancelled")); return; }
      const slot = g.defineOutOfPageSlot(REWARD_UNIT, g.enums.OutOfPageFormat.REWARDED);
      if (!slot) { state.empty = true; settle(reject, new Error("Rewarded ads are not supported on this device")); return; }
      const p = g.pubads();
      slot.addService(p);
      state.slot = slot;
      const onSlotReady = (e) => { if (e.slot === slot) { state.ready = true; state.makeVisible = () => e.makeRewardedVisible(); } };
      const onGranted = (e) => { if (e.slot === slot) state.granted = true; };
      const onClosed = (e) => { if (e.slot === slot) state.closed = true; };
      const onRendered = (e) => { if (e.slot === slot && e.isEmpty) state.empty = true; };
      p.addEventListener("rewardedSlotReady", onSlotReady);
      p.addEventListener("rewardedSlotGranted", onGranted);
      p.addEventListener("rewardedSlotClosed", onClosed);
      p.addEventListener("slotRenderEnded", onRendered);
      state.off = () => {
        p.removeEventListener("rewardedSlotReady", onSlotReady);
        p.removeEventListener("rewardedSlotGranted", onGranted);
        p.removeEventListener("rewardedSlotClosed", onClosed);
        p.removeEventListener("slotRenderEnded", onRendered);
      };
      g.display(slot);
      p.refresh([slot]);
    });
  });

  async function prepare() {
    if (dead || preparing) return;
    preparing = true;
    const mine = rs;
    try {
      await ensureGpt(getLibcurl);
      if (dead || mine !== rs) return;
      await register(mine);
      if (!dead && mine === rs) onReady();
    } catch (e) {
      if (!dead && mine === rs) { console.warn("[ads] reward slot unavailable:", e && e.message || e); onUnavailable(); }
    } finally { preparing = false; }
  }

  async function show() {
    if (dead || playing || !rs.ready || typeof rs.makeVisible !== "function") throw new Error("Rewarded ad not ready");
    playing = true;
    const mine = rs;
    try {
      mine.makeVisible();
      await new Promise((resolve, reject) => {
        const done = () => { clearInterval(iv); clearTimeout(to); };
        const iv = setInterval(() => {
          if (mine.granted) { done(); resolve(); }
          else if (mine.closed) { done(); reject(new Error("User closed ad")); }
        }, 100);
        const to = setTimeout(() => { done(); reject(new Error("Ad timeout")); }, 60000);
      });
    } finally {
      playing = false;
      reset();
      if (!dead) prepare();
    }
  }

  return { prepare, show, destroy() { dead = true; reset(); } };
}

function rampReward({ onReady, onUnavailable }, getLibcurl) {
  const w = window;
  let dead = false, playing = false, ready = false, registered = false, waitTimer = null;

  const handleReady = () => { ready = true; clearTimeout(waitTimer); if (!dead) onReady(); };
  const handleNoFill = () => { ready = false; clearTimeout(waitTimer); if (!dead) onUnavailable(); };
  w.addEventListener("rewardedAdVideoRewardReady", handleReady);
  for (const n of NOFILL_EVENTS) w.addEventListener(n, handleNoFill);

  const unregister = () => {
    try { if (w.ramp && w.ramp.destroyUnits) w.ramp.destroyUnits(RAMP_REWARD_TYPE); } catch {}
    registered = false;
    ready = false;
  };

  async function prepare() {
    if (dead) return;
    try {
      await ensureRamp(getLibcurl);
      if (dead || (registered && ready)) return;
      if (!registered) {
        if (typeof w.ramp.spaAddAds !== "function") throw new Error("Ramp SDK not available");
        w.ramp.spaAddAds([{ type: RAMP_REWARD_TYPE, selectorId: "" }]);
        registered = true;
      }
      clearTimeout(waitTimer);
      waitTimer = setTimeout(() => { if (!ready && !dead) { console.warn("[ads] ramp reward timed out"); onUnavailable(); } }, 5000);
    } catch (e) {
      if (!dead) { console.warn("[ads] ramp reward unavailable:", e && e.message || e); onUnavailable(); }
    }
  }

  async function show() {
    if (dead || playing || !ready) throw new Error("Rewarded ad not ready");
    if (typeof w.ramp.manuallyCreateRewardUi !== "function") throw new Error("Ramp reward UI not available");
    playing = true;
    try {
      await new Promise((resolve, reject) => {
        const off = () => {
          w.removeEventListener("rewardedAdRewardGranted", granted);
          w.removeEventListener("rewardedCloseButtonTriggered", closed);
          w.removeEventListener("rejectAdCloseCta", rejected);
        };
        const granted = () => { off(); resolve(); };
        const closed = () => { off(); reject(new Error("User closed ad early")); };
        const rejected = () => { off(); reject(new Error("User rejected ad")); };
        w.addEventListener("rewardedAdRewardGranted", granted);
        w.addEventListener("rewardedCloseButtonTriggered", closed);
        w.addEventListener("rejectAdCloseCta", rejected);
        try {
          const p = w.ramp.manuallyCreateRewardUi({ skipConfirmation: true });
          if (p && typeof p.catch === "function") p.catch((e) => { off(); reject(e); });
        } catch (e) { off(); reject(e); }
      });
    } finally {
      playing = false;
      unregister();
      if (!dead) prepare();
    }
  }

  return {
    prepare,
    show,
    destroy() {
      dead = true;
      clearTimeout(waitTimer);
      w.removeEventListener("rewardedAdVideoRewardReady", handleReady);
      for (const n of NOFILL_EVENTS) w.removeEventListener(n, handleNoFill);
      unregister();
    },
  };
}

export function createAds({ api, getLibcurl, mount, send, getRot = () => 0 }) {
  const blank = () => ({ enabled: false, rewardAdPass: false, rewardHash: "", adSource: "", unlimit: false, allSecLeft: 0, initOrientation: 3, isBlocked: false });
  let state = blank();
  let game = "", alive = true;
  let pollTimer = null, pollMs = 0, refreshTimer = null, forceTimer = null, cooldownTimer = null, layoutTimer = null, rampTimer = null;
  let cooldownUntil = 0, panelKey = "", handler = null, handlerKey = "", rewardReady = false;
  let instances = [], panelEls = [], rampEl = null;

  const root = document.createElement("div");
  root.className = "ads-root";
  mount.append(root);
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "reward-btn hidden";
  btn.textContent = "Watch an ad for free time";
  const toolbar = mount.querySelector(".tb");
  if (toolbar) toolbar.insertBefore(btn, toolbar.querySelector(".sp") || null);
  else root.append(btn);

  const sourceKey = () => String(state.adSource || "").toLowerCase();
  const supported = () => sourceKey() === "playwire" || !!NETWORKS[sourceKey()];
  const placeholderText = () => (state.isBlocked
    ? (state.unlimit ? "Ad blocked. Unlimited play time is unavailable." : "Ad blocked. Free play time has been reduced.")
    : "Advertisement");

  function toast(text) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = text;
    root.append(t);
    setTimeout(() => t.remove(), 5000);
  }

  function updateButton() {
    const show = alive && state.enabled && state.rewardAdPass && rewardReady && Date.now() >= cooldownUntil;
    btn.classList.toggle("hidden", !show);
  }

  function updateBlockedUi() {
    for (const el of panelEls) {
      el.classList.toggle("bg-none", !state.isBlocked);
      const ph = el.querySelector(".ad-ph");
      if (ph) ph.textContent = placeholderText();
    }
  }

  function setMargins(margin) {
    const [t, r, b, l] = margin;
    mount.style.setProperty("--ad-t", t + "px");
    mount.style.setProperty("--ad-r", r + "px");
    mount.style.setProperty("--ad-b", b + "px");
    mount.style.setProperty("--ad-l", l + "px");
  }

  function clearPanels() {
    for (const inst of instances) inst.destroy();
    instances = [];
    for (const el of panelEls) el.remove();
    panelEls = [];
    clearTimeout(rampTimer);
    if (rampEl) { rampEl.remove(); rampEl = null; }
    setMargins([0, 0, 0, 0]);
  }

  function layoutKind() {
    const ori = state.initOrientation === 0 || state.initOrientation === 1 ? state.initOrientation : (getRot() === 1 ? 1 : 0);
    const w = mount.clientWidth || innerWidth;
    const h = mount.clientHeight || innerHeight;
    const hideVertical = ori !== 0 && h > 0 && w / h <= 1.5;
    if (!hideVertical && ori === 0 && w >= 1000 && h >= 640) return "lyt1";
    if (!hideVertical && ori === 1 && w >= 840 && h >= 640) return "lyt2";
    if (w >= 760 && h >= 560) return "lyt3";
    return "";
  }

  function applyLayout() {
    if (!alive) return;
    const key = sourceKey();
    const kind = state.enabled && supported() && canShowAd() ? layoutKind() : "";
    const sig = kind + "|" + key;
    if (sig === panelKey) return;
    clearPanels();
    panelKey = sig;
    if (!kind) return;
    const layout = LAYOUTS[kind];
    setMargins(layout.margin);
    const tbH = toolbar ? toolbar.offsetHeight : 0;
    const maxW = (mount.clientWidth || innerWidth) - 20;
    for (const [pos, side] of layout.slots) {
      const panel = document.createElement("div");
      panel.className = "ad-panel " + side + (state.isBlocked ? "" : " bg-none");
      const ph = document.createElement("div");
      ph.className = "ad-ph";
      ph.textContent = placeholderText();
      panel.append(ph);
      if (side === "left" || side === "right") panel.style.width = POSITIONS[pos].w + "px";
      else {
        panel.style.width = Math.min(980, maxW) + "px";
        if (side === "bottom") panel.style.bottom = tbH + 8 + "px";
      }
      root.append(panel);
      panelEls.push(panel);
      if (key === "playwire") {
        const slotDiv = document.createElement("div");
        slotDiv.id = `${kind}-${side}-img-div`;
        panel.append(slotDiv);
      } else {
        const cfg = slotConfig(key, pos);
        if (!cfg) continue;
        if (kind === "lyt3") {
          cfg.sizes = cfg.sizes.filter((s) => !Array.isArray(s) || s[0] <= maxW);
          cfg.width = Math.min(cfg.width, maxW);
        }
        instances.push(mountGam(panel, cfg, getLibcurl));
      }
    }
    if (key === "playwire") startRamp();
  }

  function startRamp() {
    ensureRamp(getLibcurl).then(() => {
      if (!alive || sourceKey() !== "playwire") return;
      if (!rampEl) {
        rampEl = document.createElement("ramp-ad");
        rampEl.setAttribute("publisher-id", RAMP_PUBLISHER);
        rampEl.setAttribute("id", RAMP_ID);
        root.append(rampEl);
      }
      clearTimeout(rampTimer);
      rampTimer = setTimeout(() => {
        if (alive && window.ramp && window.ramp.spaNewPage) window.ramp.spaNewPage(location.pathname);
      }, 1000);
    }).catch((e) => console.warn("[ads] ramp unavailable:", e && e.message || e));
  }

  function syncReward() {
    const want = alive && state.enabled && state.rewardAdPass;
    const key = want ? (sourceKey() === "playwire" ? "ramp" : "gam") : "";
    if (key === handlerKey) return;
    if (handler) { handler.destroy(); handler = null; }
    handlerKey = key;
    rewardReady = false;
    if (!key) { updateButton(); return; }
    const cb = {
      onReady: () => { rewardReady = true; updateButton(); },
      onUnavailable: () => { rewardReady = false; updateButton(); },
    };
    handler = key === "ramp" ? rampReward(cb, getLibcurl) : gamReward(cb, getLibcurl);
    handler.prepare();
  }

  function apply() {
    applyLayout();
    syncReward();
    updateBlockedUi();
    updateButton();
  }

  function stopPoll() {
    clearInterval(pollTimer);
    pollTimer = null;
    pollMs = 0;
  }
  function startPoll() {
    stopPoll();
    pollMs = state.isBlocked ? POLL_BLOCKED_MS : POLL_OK_MS;
    pollTimer = setInterval(checkBlocked, pollMs);
  }
  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    if (!alive) return;
    refreshTimer = setTimeout(refreshConfig, refreshDelay(state.allSecLeft));
  }

  async function checkBlocked() {
    if (!alive || !state.enabled || !supported() || !canShowAd()) return;
    const was = state.isBlocked;
    const blocked = await detectBlocked();
    if (!alive || !state.enabled) return;
    state.isBlocked = blocked;
    updateBlockedUi();
    send("adBlock>" + blocked);
    const want = blocked ? POLL_BLOCKED_MS : POLL_OK_MS;
    if (pollTimer && pollMs !== want) startPoll();
    if (was && !blocked && !refreshTimer) scheduleRefresh();
  }

  function fromResponse(r, prevSource) {
    if (!r || !r.showAD) return blank();
    const secs = r.timeSecLeft ?? 0;
    const st = {
      enabled: true,
      rewardAdPass: rewardEligible(secs, r.rewardAdPass),
      rewardHash: r.rewardHash ?? "",
      adSource: r.adSource ?? "",
      unlimit: !!r.unlimit,
      allSecLeft: secs,
      initOrientation: r.initOrientation ?? 3,
      isBlocked: state.isBlocked,
    };
    if (prevSource && st.adSource !== prevSource) {
      console.warn(`[ads] adSource locked to "${prevSource}", ignoring "${st.adSource}"`);
      st.adSource = prevSource;
    }
    return st;
  }

  async function refreshConfig() {
    if (!alive) return;
    clearTimeout(refreshTimer);
    refreshTimer = null;
    const prevSource = state.adSource;
    let r;
    try {
      const j = await api("/web/ad", { method: "POST", body: { game_name: game }, quiet: true });
      if (j.code !== 0) throw new Error(j.message || "Business error: " + j.code);
      r = j.data || {};
    } catch (e) {
      console.warn("[ads] config failed, retrying on next refresh:", e && e.message || e);
      scheduleRefresh();
      return;
    }
    if (!alive) return;
    console.log("[ads] config:", r.adSource, "showAD=" + !!r.showAD, "rewardAdPass=" + !!r.rewardAdPass, "secLeft=" + (r.timeSecLeft ?? 0));
    if (!canShowAd()) {
      if (r.unlimit && !isTablet() && !forceTimer) forceTimer = setInterval(() => send("adBlock>true"), 5000);
      const pass = rewardEligible(r.timeSecLeft ?? 0, r.rewardAdPass);
      state = pass ? { ...blank(), enabled: true, rewardAdPass: true, rewardHash: r.rewardHash ?? "", adSource: prevSource || r.adSource || "" } : blank();
      apply();
      return;
    }
    state = fromResponse(r, prevSource);
    apply();
    if (!state.enabled) { stopPoll(); return; }
    try {
      await checkBlocked();
      if (!alive) return;
      startPoll();
    } finally {
      if (alive && state.enabled && !state.isBlocked) scheduleRefresh();
    }
  }

  async function claim() {
    try {
      const body = state.rewardHash ? { hash: state.rewardHash, source: state.adSource } : {};
      const j = await api("/ad/gpt_reward", { method: "POST", body, quiet: true });
      if (j.code !== 0) throw new Error(j.message || "Business error: " + j.code);
      const mins = (j.data && j.data.reward_min) || 0;
      toast(`You earned ${mins} minutes of free play time!`);
      await refreshConfig();
    } catch (e) {
      toast("Unable to claim reward: " + ((e && e.message) || "Please try again later."));
    }
  }

  btn.addEventListener("click", async () => {
    if (!state.rewardAdPass) { toast("This bonus is currently unavailable. Please try again later."); return; }
    if (!rewardReady || !handler) { toast("Please wait a moment and try again."); return; }
    rewardReady = false;
    cooldownUntil = Date.now() + REWARD_COOLDOWN_MS;
    clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(updateButton, REWARD_COOLDOWN_MS);
    updateButton();
    try { await handler.show(); }
    catch (e) { console.warn("[ads] reward not granted:", e && e.message || e); return; }
    await claim();
  });

  const onResize = () => {
    clearTimeout(layoutTimer);
    layoutTimer = setTimeout(applyLayout, 250);
  };
  window.addEventListener("resize", onResize);

  return {
    unblocked: async () => !(await detectBlocked()),
    begin(name) {
      game = name;
      return refreshConfig();
    },
    sync() {
      if (!alive || !state.enabled) return;
      applyLayout();
      if (!canShowAd()) {
        if (state.unlimit && !isTablet()) send("adBlock>true");
        return;
      }
      if (supported()) send("adBlock>" + state.isBlocked);
    },
    end() {
      if (!alive) return;
      alive = false;
      clearInterval(pollTimer);
      clearInterval(forceTimer);
      clearTimeout(refreshTimer);
      clearTimeout(cooldownTimer);
      clearTimeout(layoutTimer);
      window.removeEventListener("resize", onResize);
      clearPanels();
      if (handler) { handler.destroy(); handler = null; }
      btn.remove();
      root.remove();
      for (const k of ["--ad-t", "--ad-r", "--ad-b", "--ad-l"]) mount.style.removeProperty(k);
    },
  };
}
