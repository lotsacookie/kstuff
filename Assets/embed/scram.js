(async function () {
    const selfSrc = document.currentScript && document.currentScript.src ? document.currentScript.src : "";
    const statusEl = document.getElementById('eg-status');
    const setStatus = (msg) => {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.classList.remove('hidden');
    };
    const hideStatus = () => {
        if (!statusEl) return;
        statusEl.classList.add('hidden');
    };

    const REPO = "lotsacookie/Singuloxy";
    const BRANCH = "main";
    const DIST_PATH = "dist/sandstone.js";
    const KSTUFF_REPO = "lotsacookie/kstuff";
    const SELF_PATH = "Assets/embed/scram.js";
    const WISP_MODULE_PATH = "Assets/js/wisp.js";
    const WISP_LIST_PATH = "Assets/json/wss.json";
    const WISP_FALLBACK = "wss://api.personalloanonline.net/ws/";
    const WISP_WAIT_MS = 22000;
    const WISP_TOTAL_MS = 24000;

    const withTimeout = (promise, ms, label) => new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error((label || "operation") + " timed out")), ms);
        promise.then(
            (v) => { clearTimeout(timer); resolve(v); },
            (e) => { clearTimeout(timer); reject(e); }
        );
    });

    const SHA_RE = /^[0-9a-f]{40}$/i;
    const SHA_CACHE_PREFIX = "kSha:";
    const readSha = (repo) => {
        try {
            const value = localStorage.getItem(SHA_CACHE_PREFIX + repo);
            return SHA_RE.test(value || "") ? value : null;
        } catch (e) {
            return null;
        }
    };
    const writeSha = (repo, sha) => {
        try { localStorage.setItem(SHA_CACHE_PREFIX + repo, sha); } catch (e) {}
    };
    const resolveSha = async (repo) => {
        const viaJsdelivr = withTimeout(
            fetch("https://data.jsdelivr.com/v1/packages/gh/" + repo + "/resolved?specifier=main", { cache: "no-store" })
                .then((r) => r.json())
                .then((d) => (d && SHA_RE.test(d.version || "") ? d.version : Promise.reject(new Error("bad sha")))),
            3500,
            "jsdelivr api"
        );
        const viaGithub = withTimeout(
            fetch("https://api.github.com/repos/" + repo + "/commits/main", { cache: "no-store" })
                .then((r) => r.json())
                .then((d) => (d && SHA_RE.test(d.sha || "") ? d.sha : Promise.reject(new Error("bad sha")))),
            3500,
            "github api"
        );
        const githubSha = viaGithub.catch(() => null);
        let sha = null;
        try { sha = await Promise.any([viaJsdelivr, viaGithub]); } catch (e) { sha = null; }
        if (sha) {
            const fresh = await Promise.race([githubSha, new Promise((resolve) => setTimeout(() => resolve(null), 1500))]);
            if (fresh) sha = fresh;
            writeSha(repo, sha);
            return sha;
        }
        return readSha(repo);
    };
    const kstuffShaP = resolveSha("lotsacookie/kstuff");

    const loadScript = (src, ms) => new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const timer = setTimeout(() => {
            script.remove();
            reject(new Error("Script timed out: " + src));
        }, ms);
        script.src = src;
        script.onload = () => { clearTimeout(timer); resolve(); };
        script.onerror = () => {
            clearTimeout(timer);
            script.remove();
            reject(new Error("Script failed to load: " + src));
        };
        document.head.appendChild(script);
    });

    const loadSandstone = async () => {
        const hosts = ["cdn", "fastly", "gcore"];
        const sha = await resolveSha(REPO);
        const refs = sha ? [sha, BRANCH] : [BRANCH];
        for (const ref of refs) {
            const path = "/gh/" + REPO + "@" + ref + "/" + DIST_PATH;
            for (const host of hosts) {
                try {
                    await loadScript("https://" + host + ".jsdelivr.net" + path, 8000);
                    if (window.sandstone) {
                        if (SHA_RE.test(ref)) writeSha(REPO, ref);
                        return;
                    }
                } catch (err) {
                    console.warn("EasyGame: CDN failed:", err.message);
                }
            }
        }
    };

    setStatus("Loading proxy...");
    if (!window.sandstone) await loadSandstone();
    const sandstone = window.sandstone;

    if (!sandstone) {
        setStatus("Failed to load sandstone proxy.\nThe CDN script did not load — check your network connection.");
        console.error("EasyGame: Could not load sandstone proxy.");
        return;
    }

    const hostWindows = () => {
        const list = [window];
        try { if (window.parent && window.parent !== window) list.push(window.parent); } catch (e) {}
        try { if (window.top && !list.includes(window.top)) list.push(window.top); } catch (e) {}
        return list;
    };

    const readHost = (key) => {
        for (const w of hostWindows()) {
            try {
                if (w[key] !== undefined && w[key] !== null) return w[key];
            } catch (e) {}
        }
        return undefined;
    };

    const normalizeWisp = (url) => {
        if (typeof url !== "string" || !url) return null;
        return url.includes("://") ? url : "wss://" + url + "/";
    };

    const selfBase = (() => {
        const index = selfSrc.indexOf(SELF_PATH);
        return index > 0 ? selfSrc.slice(0, index) : "";
    })();

    const kstuffBases = async () => {
        const bases = [];
        const sha = await kstuffShaP;
        if (selfBase && !/@main\//.test(selfBase)) bases.push(selfBase);
        if (sha) {
            for (const host of ["cdn", "fastly", "gcore"]) {
                const base = "https://" + host + ".jsdelivr.net/gh/" + KSTUFF_REPO + "@" + sha + "/";
                if (!bases.includes(base)) bases.push(base);
            }
        }
        if (selfBase && !bases.includes(selfBase)) bases.push(selfBase);
        for (const host of ["cdn", "fastly", "gcore"]) {
            const base = "https://" + host + ".jsdelivr.net/gh/" + KSTUFF_REPO + "@main/";
            if (!bases.includes(base)) bases.push(base);
        }
        return bases;
    };

    const firstValid = (promises, ms) => new Promise((resolve) => {
        let pending = promises.length;
        const timer = setTimeout(() => resolve(null), ms);
        const settle = (value) => {
            if (value) {
                clearTimeout(timer);
                resolve(value);
                return;
            }
            pending -= 1;
            if (pending <= 0) {
                clearTimeout(timer);
                resolve(null);
            }
        };
        promises.forEach((p) => p.then(settle, () => settle(null)));
    });

    const hostWisp = () => {
        const direct = normalizeWisp(readHost("wlspServer"));
        if (direct && typeof readHost("WlspPing") === "number") return Promise.resolve(direct);
        const promise = readHost("kWispP");
        if (promise && typeof promise.then === "function") {
            return withTimeout(Promise.resolve(promise), WISP_WAIT_MS, "host wisp")
                .then((url) => (typeof readHost("WlspPing") === "number" ? normalizeWisp(url) : null))
                .catch((err) => {
                    console.warn("EasyGame: host wisp unavailable:", err.message);
                    return null;
                });
        }
        return Promise.resolve(null);
    };

    const loadWispModule = async () => {
        for (const base of await kstuffBases()) {
            try {
                return await withTimeout(import(base + WISP_MODULE_PATH), 8000, "wisp.js import");
            } catch (err) {
                console.warn("EasyGame: wisp.js failed to load:", err.message);
            }
        }
        return null;
    };

    const fetchWispList = async (path) => {
        let lastError = null;
        for (const base of await kstuffBases()) {
            try {
                const response = await withTimeout(fetch(base + path, { cache: "no-store" }), 6000, "wisp list");
                if (response.ok) return await response.json();
            } catch (err) {
                lastError = err;
            }
        }
        throw lastError || new Error("wisp list unavailable");
    };

    const ownWisp = async () => {
        const mod = await loadWispModule();
        if (!mod || typeof mod.init !== "function") return null;
        mod.init({ fetchWithProxy: fetchWispList });
        const url = await withTimeout(Promise.resolve(window.kWispP), WISP_WAIT_MS, "wisp resolve");
        return typeof window.WlspPing === "number" ? normalizeWisp(url) : null;
    };

    const BUILTIN_WISPS = [
        WISP_FALLBACK,
        "wss://athollcottage.com/connection/",
        "wss://kristenblackburnvolleyballcamps.com/socket/",
        "wss://southpadreislandkiteboarding.com/socket/"
    ];
    let wispPool = [];

    const shuffle = (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    const testOpen = (url, ms) => new Promise((resolve) => {
        let ws;
        try {
            ws = new WebSocket(url);
        } catch (e) {
            resolve(false);
            return;
        }
        const timer = setTimeout(() => {
            try { ws.close(); } catch (e) {}
            resolve(false);
        }, ms);
        ws.onopen = () => {
            clearTimeout(timer);
            try { ws.close(); } catch (e) {}
            resolve(true);
        };
        ws.onerror = () => {
            clearTimeout(timer);
            resolve(false);
        };
    });

    const loadPool = async () => {
        try {
            const outer = await fetchWispList(WISP_LIST_PATH);
            const list = JSON.parse(atob(outer[0]));
            wispPool = list.filter((u) => typeof u === "string" && /^wss:\/\//i.test(u));
        } catch (e) {
            console.warn("EasyGame: wss.json unavailable:", e && e.message ? e.message : e);
        }
        return wispPool;
    };

    const openRace = async () => {
        await new Promise((r) => setTimeout(r, 3500));
        const list = await loadPool();
        const hostGuess = normalizeWisp(readHost("wlspServer"));
        const candidates = [...new Set([...(hostGuess ? [hostGuess] : []), ...BUILTIN_WISPS, ...shuffle(list).slice(0, 12)])];
        return new Promise((resolve) => {
            let pending = candidates.length;
            const overall = setTimeout(() => resolve(null), 7000);
            candidates.forEach((url) => {
                testOpen(url, 3500).then((ok) => {
                    if (ok) {
                        clearTimeout(overall);
                        resolve(url);
                    } else if (--pending === 0) {
                        clearTimeout(overall);
                        resolve(null);
                    }
                });
            });
        });
    };

    const resolveWisp = async () => {
        const fromHost = hostWisp();
        const fromOwn = ownWisp().catch((err) => {
            console.warn("EasyGame: wisp.js resolve failed:", err.message);
            return null;
        });
        const fromOpen = openRace().catch(() => null);
        const found = await firstValid([fromHost, fromOwn, fromOpen], WISP_TOTAL_MS);
        if (found) return found;
        console.warn("EasyGame: no wisp resolved, using built-in fallback");
        return WISP_FALLBACK;
    };

    const CACHE_KEY = "kWispLast";
    const readCache = () => {
        try { return normalizeWisp(localStorage.getItem(CACHE_KEY)); } catch (e) { return null; }
    };
    const writeCache = (url) => {
        try { localStorage.setItem(CACHE_KEY, url); } catch (e) {}
    };

    const applyWisp = (best, attempt) => {
        const tries = attempt || 0;
        let ok = false;
        try {
            sandstone.libcurl.set_websocket(best);
            ok = true;
            const hostPool = readHost("wispUrls");
            const pool = Array.isArray(hostPool) && hostPool.length ? hostPool : wispPool;
            if (typeof sandstone.network?.set_wisp_pool === "function") {
                const rest = pool.filter((u) => u !== best).slice(0, 30);
                sandstone.network.set_wisp_pool([best, ...rest]);
            }
        } catch (e) {
            if (!ok && tries < 40) setTimeout(() => applyWisp(best, tries + 1), 250);
            else console.error("EasyGame: applyWisp failed:", e);
        }
    };

    const waitForLibcurl = () => new Promise((resolve) => {
        const libcurl = sandstone.libcurl;
        if (!libcurl || libcurl.ready) return resolve();
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            clearInterval(poll);
            clearTimeout(cap);
            resolve();
        };
        const poll = setInterval(() => { if (libcurl.ready) finish(); }, 100);
        const cap = setTimeout(finish, 5000);
        try {
            libcurl.events.addEventListener("libcurl_load", finish, { once: true });
        } catch (e) {}
    });

    applyWisp(readCache() || normalizeWisp(readHost("wlspServer")) || WISP_FALLBACK);

    setStatus("Finding a wisp server...");
    const results = await Promise.all([waitForLibcurl(), resolveWisp()]);
    const wisp = results[1];
    applyWisp(wisp);
    if (wisp !== WISP_FALLBACK) writeCache(wisp);
    console.log("EasyGame: build 6 wisp", wisp, "kstuff", await kstuffShaP);
    try {
        if (!sandstone.libcurl.ready) {
            sandstone.libcurl.events.addEventListener("libcurl_load", () => applyWisp(wisp), { once: true });
        }
    } catch (e) {}

    try {
        const LV = ["log", "info", "warn", "error", "debug"];
        const NC = {};
        const hook = (m) => {
            const orig = NC[m] || (NC[m] = console[m]);
            if (typeof orig !== "function") return;
            const w = function (...a) {
                try {
                    const fmt = parent.__sgLogFmt || String;
                    parent.__sgLogPush(m, "embed", a.map((x) => fmt(x)).join(" "));
                } catch (e) {}
                return orig.apply(this, a);
            };
            w.__sg = 1;
            try {
                Object.defineProperty(console, m, { configurable: true, enumerable: true, get: () => w, set: () => {} });
            } catch (e) {
                try { console[m] = w; } catch (x) {}
            }
        };
        const ensure = () => {
            try { LV.forEach((m) => { if (!console[m] || !console[m].__sg) hook(m); }); } catch (e) {}
        };
        ensure();
        setInterval(ensure, 1000);
        window.addEventListener("error", (e) => {
            try { parent.__sgLogPush("error", "embed", e.message || "Error"); } catch (x) {}
        });
        window.addEventListener("unhandledrejection", (e) => {
            try { parent.__sgLogPush("error", "embed", "Unhandled rejection: " + (parent.__sgLogFmt || String)(e.reason)); } catch (x) {}
        });
    } catch (e) {}

    const decodeUrl = (str) => {
        try {
            if (!/^[a-zA-Z0-9+/]*={0,2}$/.test(str) || str.length < 4) return str;
            return atob(str);
        } catch (e) {
            return str;
        }
    };

    const replacePTags = () => {
        const pTags = document.querySelectorAll('p[eg-url]');
        for (const p of Array.from(pTags)) {
            const rawUrl = p.getAttribute('eg-url');
            if (!rawUrl) continue;

            const w = p.getAttribute('width') || '800';
            const h = p.getAttribute('height') || '600';

            const wrapper = document.createElement('div');
            wrapper.style.width = w.includes('%') ? w : w + 'px';
            wrapper.style.height = h.includes('%') ? h : h + 'px';
            wrapper.style.display = 'inline-block';

            const proxyFrame = new sandstone.controller.ProxyFrame();
            const iframe = proxyFrame.iframe;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.style.border = 'none';
            iframe.className = 'eg-container-frame';
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('loading', 'lazy');

            wrapper.attachShadow({ mode: 'closed' }).appendChild(iframe);

            if (p.replaceWith) {
                p.replaceWith(wrapper);
            } else {
                p.parentNode.replaceChild(wrapper, p);
            }

            let url = decodeUrl(rawUrl);
            if (!/^(https?|sandstone):/.test(url)) url = "https://" + url;

            const readTheme = () => {
                try {
                    const cs = parent.getComputedStyle(parent.document.body);
                    const pick = (name, fallback) => {
                        const v = cs.getPropertyValue(name).trim();
                        return /^(#|rgb|hsl)/i.test(v) ? v : fallback;
                    };
                    return { bg: pick("--bg-color", cs.backgroundColor), text: pick("--text-color", cs.color) };
                } catch (e) {
                    return null;
                }
            };
            proxyFrame.theme = readTheme();
            proxyFrame.on_info = (info) => {
                try {
                    parent.postMessage({ sgProxyInfo: true, url: info.url, title: info.title, icon: info.icon }, "*");
                } catch (e) {}
            };
            let lastInfoKey = "";
            let lastTitle = "";
            setInterval(() => {
                try {
                    const href = proxyFrame.url && proxyFrame.url.href ? proxyFrame.url.href : "";
                    const title = proxyFrame.title || "";
                    const icon = proxyFrame.icon || "";
                    if (title !== lastTitle) {
                        lastTitle = title;
                        setTimeout(() => { try { proxyFrame.refresh_icon && proxyFrame.refresh_icon(); } catch (e) {} }, 500);
                    }
                    const key = href + "\n" + title + "\n" + icon.length;
                    if (key === lastInfoKey) return;
                    lastInfoKey = key;
                    parent.postMessage({ sgProxyInfo: true, url: href, title: title, icon: icon }, "*");
                } catch (e) {}
            }, 1500);
            proxyFrame.on_console = (batch) => {
                try {
                    let host = "site";
                    try { host = new URL(url).hostname; } catch (e) {}
                    for (const item of batch) parent.__sgLogPush(item[0], host, item[1]);
                } catch (e) {}
            };
            proxyFrame.on_progress = (value, text) => {
                try {
                    parent.postMessage({ sgProxyProgress: true, value: value, text: text }, "*");
                } catch (e) {}
            };
            proxyFrame.on_ready = () => {
                try {
                    parent.postMessage({ sgProxyReady: true }, "*");
                } catch (e) {}
            };
            proxyFrame.on_navigate = () => setStatus("Loading " + url + " ...");
            proxyFrame.on_load = () => hideStatus();
            iframe.addEventListener('error', () => setStatus("The proxied frame failed to load."));

            Promise.resolve(proxyFrame.navigate_to(url)).catch((err) => {
                setStatus("Navigation failed:\n" + (err && err.message ? err.message : err));
                console.error("EasyGame: Error navigating ProxyFrame", err);
            });
        }
    };

    new MutationObserver((mutations) => {
        for (const m of mutations) {
            if ((m.type === 'childList' && m.addedNodes.length > 0) ||
                (m.type === 'attributes' && m.attributeName === 'eg-url')) {
                replacePTags();
                break;
            }
        }
    }).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['eg-url']
    });

    hideStatus();
    replacePTags();
})();
