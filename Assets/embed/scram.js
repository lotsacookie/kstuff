(async function () {
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
    const WISP_LIST_URL = "https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/json/wss.json";
    const CACHE_KEY = "eg-wisp-cache";
    const REFRESH_MS = 30 * 60 * 1000;
    const FALLBACK_WISP = "wss://girlspreples.org/wi/";

    const withTimeout = (promise, ms, label) => new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error((label || "operation") + " timed out")), ms);
        promise.then(
            (v) => { clearTimeout(timer); resolve(v); },
            (e) => { clearTimeout(timer); reject(e); }
        );
    });

    const shuffle = (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

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
        const path = "/gh/" + REPO + "@" + BRANCH + "/" + DIST_PATH;
        const hosts = ["cdn", "fastly", "gcore"];
        for (const host of hosts) {
            try {
                await loadScript("https://" + host + ".jsdelivr.net" + path, 8000);
                if (window.sandstone) return;
            } catch (err) {
                console.warn("EasyGame: CDN failed:", err.message);
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

    const applyWisp = (best, pool) => {
        try {
            sandstone.libcurl.set_websocket(best);
            if (typeof sandstone.network?.set_wisp_pool === "function") {
                sandstone.network.set_wisp_pool([best, ...(pool || []).filter((u) => u !== best)]);
            }
        } catch (e) {
            console.error("EasyGame: applyWisp failed:", e);
        }
    };

    const readCache = () => {
        try {
            const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
            if (!raw || typeof raw.best !== "string") return null;
            return {
                time: raw.time || 0,
                best: raw.best,
                ranked: Array.isArray(raw.ranked) ? raw.ranked : [],
                list: Array.isArray(raw.list) ? raw.list : []
            };
        } catch (e) {
            return null;
        }
    };

    const writeCache = (best, ranked, list) => {
        try {
            const prev = readCache();
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                time: Date.now(),
                best: best,
                ranked: ranked,
                list: list || (prev && prev.list) || []
            }));
        } catch (e) {}
    };

    const testWisp = (url, ms) => new Promise((resolve) => {
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

    const firstReachable = (urls, ms) => new Promise((resolve) => {
        if (!urls.length) return resolve(null);
        let pending = urls.length;
        const overall = setTimeout(() => resolve(null), ms + 500);
        urls.forEach((url) => {
            testWisp(url, ms).then((ok) => {
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

    const allReachable = async (urls, ms) => {
        const results = await Promise.all(urls.map(async (u) => (await testWisp(u, ms)) ? u : null));
        return results.filter(Boolean);
    };

    const fetchWispList = async () => {
        const res = await withTimeout(fetch(WISP_LIST_URL), 5000, "wss.json fetch");
        if (!res.ok) throw new Error("wss.json status " + res.status);
        const outer = await res.json();
        if (!Array.isArray(outer) || !outer.length) throw new Error("wss.json empty");
        const urls = JSON.parse(atob(outer[0]));
        if (!Array.isArray(urls) || !urls.length) throw new Error("decoded list empty");
        return urls;
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

    const refreshCache = async (list, current) => {
        try {
            const sample = shuffle(list).slice(0, 10);
            const working = await allReachable(sample, 2500);
            if (current && !working.includes(current)) working.unshift(current);
            if (!working.length) return;

            let ranked = working;
            const network = sandstone.network;
            if (working.length > 1 && network && typeof network.pick_best_wisp === "function") {
                try {
                    const outcome = await withTimeout(
                        network.pick_best_wisp(working.slice(0, 4), {
                            limit: 4,
                            timeout_ms: 4000,
                            verbose: false,
                            apply: false
                        }),
                        20000,
                        "benchmark"
                    );
                    if (outcome && outcome.best && Array.isArray(outcome.ranked)) {
                        const order = outcome.ranked.map((e) => e.url);
                        ranked = [...order, ...working.filter((u) => !order.includes(u))];
                    }
                } catch (e) {}
            }
            writeCache(ranked[0], ranked, list);
        } catch (e) {}
    };

    const setupWisp = async () => {
        const cached = readCache();
        let list = cached ? cached.list : [];
        const tried = new Set();

        if (cached) {
            tried.add(cached.best);
            if (await testWisp(cached.best, 1500)) {
                applyWisp(cached.best, cached.ranked);
                if (Date.now() - cached.time > REFRESH_MS && list.length) refreshCache(list, cached.best);
                return;
            }
            const others = cached.ranked.filter((u) => !tried.has(u)).slice(0, 6);
            others.forEach((u) => tried.add(u));
            const alt = await firstReachable(others, 2000);
            if (alt) {
                applyWisp(alt, cached.ranked);
                writeCache(alt, [alt, ...cached.ranked.filter((u) => u !== alt)], list);
                if (list.length) refreshCache(list, alt);
                return;
            }
        }

        setStatus("Finding a wisp server...");
        if (!list.length || cached) {
            try {
                list = await fetchWispList();
            } catch (err) {
                console.warn("EasyGame: wisp list unavailable:", err.message);
            }
        }

        const pool = shuffle(list.filter((u) => !tried.has(u))).slice(0, 8);
        const pick = await firstReachable(pool, 2500);
        if (pick) {
            applyWisp(pick, list);
            writeCache(pick, [pick], list);
            refreshCache(list, pick);
            return;
        }

        if (!tried.has(FALLBACK_WISP) && await testWisp(FALLBACK_WISP, 2500)) {
            applyWisp(FALLBACK_WISP, list);
            writeCache(FALLBACK_WISP, [FALLBACK_WISP], list);
            return;
        }

        applyWisp(cached ? cached.best : (list[0] || FALLBACK_WISP), list);
        if (list.length) refreshCache(list, null);
    };

    const startCache = readCache();
    applyWisp(startCache ? startCache.best : FALLBACK_WISP, startCache ? startCache.ranked : []);

    await waitForLibcurl();
    try {
        await withTimeout(setupWisp(), 9000, "wisp setup");
    } catch (err) {
        console.warn("EasyGame: wisp setup slow, continuing:", err.message);
    }

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
