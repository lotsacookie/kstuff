(async function() {
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
    const WISP_CACHE_KEY = "eg-best-wisp";
    const WISP_CACHE_MS = 30 * 60 * 1000;

    const loadScript = (src) => new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => {
            script.remove();
            reject(new Error("Script failed to load: " + src));
        };
        document.head.appendChild(script);
    });

    const getLatestCommitSha = async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        try {
            const res = await fetch("https://api.github.com/repos/" + REPO + "/commits/" + BRANCH, {
                signal: controller.signal,
                headers: { "Accept": "application/vnd.github+json" },
                cache: "no-store"
            });
            if (!res.ok) throw new Error("GitHub API returned " + res.status);
            const data = await res.json();
            if (!data || typeof data.sha !== "string" || !/^[0-9a-f]{40}$/i.test(data.sha)) {
                throw new Error("GitHub API returned no valid commit sha");
            }
            return data.sha;
        } finally {
            clearTimeout(timer);
        }
    };

    const loadSandstone = async () => {
        const directUrl = "https://cdn.jsdelivr.net/gh/" + REPO + "@" + BRANCH + "/" + DIST_PATH;
        try {
            const sha = await getLatestCommitSha();
            const pinnedUrl = "https://cdn.jsdelivr.net/gh/" + REPO + "@" + sha + "/" + DIST_PATH;
            console.log("EasyGame: Loading sandstone from commit", sha);
            await loadScript(pinnedUrl);
            return;
        } catch (err) {
            console.warn("EasyGame: Latest commit load failed, using direct CDN url:", err);
        }
        await loadScript(directUrl);
    };

    let sandstone = window.sandstone;
    if (!sandstone) {
        try {
            await loadSandstone();
        } catch (err) {
            console.error("EasyGame: Could not load sandstone from any source:", err);
        }
        sandstone = window.sandstone;
    }

    if (!sandstone) {
        setStatus("Failed to load sandstone proxy.\nThe CDN script did not load — check your network connection.");
        console.error("EasyGame: Could not load sandstone proxy. Please ensure the CDN is accessible.");
        return;
    }

    const FALLBACK_WISP = "wss://girlspreples.org/wi/";
    sandstone.libcurl.set_websocket(FALLBACK_WISP);

    function wireStatus(proxyFrame, url) {
        proxyFrame.on_navigate = () => setStatus("Loading " + url + " ...");
        proxyFrame.on_load = () => hideStatus();
    }

    const testWisp = (url) => new Promise((resolve) => {
        try {
            const ws = new WebSocket(url);
            const timer = setTimeout(() => {
                ws.close();
                resolve(false);
            }, 3000);
            ws.onopen = () => {
                clearTimeout(timer);
                ws.close();
                resolve(true);
            };
            ws.onerror = () => {
                clearTimeout(timer);
                resolve(false);
            };
        } catch (e) {
            resolve(false);
        }
    });

    const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), ms);
        promise.then(
            (value) => { clearTimeout(timer); resolve(value); },
            (error) => { clearTimeout(timer); reject(error); }
        );
    });

    const waitForLibcurl = () => new Promise((resolve) => {
        const libcurl = sandstone.libcurl;
        if (libcurl.ready) {
            resolve();
            return;
        }
        libcurl.events.addEventListener("libcurl_load", () => resolve(), { once: true });
    });

    const readCache = () => {
        try {
            const raw = JSON.parse(localStorage.getItem(WISP_CACHE_KEY) || "null");
            if (!raw || Date.now() - raw.time > WISP_CACHE_MS) return null;
            return raw;
        } catch (e) {
            return null;
        }
    };

    const writeCache = (best, ranked) => {
        try {
            localStorage.setItem(WISP_CACHE_KEY, JSON.stringify({ time: Date.now(), best: best, ranked: ranked }));
        } catch (e) {}
    };

    const loadWispList = async () => {
        const outerRes = await fetch("https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/json/wss.json");
        if (!outerRes.ok) throw new Error("Failed to fetch wss.json");
        const outerArr = await outerRes.json();
        if (!Array.isArray(outerArr) || outerArr.length === 0) throw new Error("wss.json is empty or not an array");
        const wssUrls = JSON.parse(atob(outerArr[0]));
        if (!Array.isArray(wssUrls) || wssUrls.length === 0) throw new Error("Decoded WSS list is empty");
        return wssUrls;
    };

    const rankWithBenchmark = async (wssUrls) => {
        const network = sandstone.network;
        if (!network || typeof network.pick_best_wisp !== "function") return null;
        const reachable = [];
        await Promise.all(wssUrls.map(async (url) => {
            if (await testWisp(url)) reachable.push(url);
        }));
        const candidates = wssUrls.filter((url) => reachable.includes(url));
        if (candidates.length === 0) return null;
        setStatus("Benchmarking " + candidates.length + " wisp servers...");
        const outcome = await network.pick_best_wisp(candidates, {
            limit: 12,
            timeout_ms: 9000,
            verbose: false,
            apply: true,
            on_progress: (result) => {
                console.log("EasyGame: wisp bench", result.url, Math.round((result.rate || 0) / 1024) + " KB/s", result.reason);
            }
        });
        if (!outcome || !outcome.best) return null;
        return {
            best: outcome.best,
            ranked: outcome.ranked.map((entry) => entry.url)
        };
    };

    const setupWisp = async () => {
        setStatus("Finding the fastest wisp server...");
        try {
            await withTimeout(waitForLibcurl(), 10000).catch(() => {});

            const cached = readCache();
            if (cached && Array.isArray(cached.ranked) && cached.ranked.length > 0) {
                sandstone.libcurl.set_websocket(cached.best);
                if (typeof sandstone.network?.set_wisp_pool === "function") {
                    sandstone.network.set_wisp_pool(cached.ranked);
                }
                console.log("EasyGame: Using cached wisp server:", cached.best);
                return;
            }

            const wssUrls = await loadWispList();
            const ranked = await rankWithBenchmark(wssUrls);

            if (ranked) {
                writeCache(ranked.best, ranked.ranked);
                console.log("EasyGame: Using fastest wisp server:", ranked.best);
                return;
            }

            let selected = null;
            for (const url of wssUrls) {
                if (await testWisp(url)) {
                    selected = url;
                    break;
                }
            }
            selected = selected || wssUrls[0];
            sandstone.libcurl.set_websocket(selected);
            if (typeof sandstone.network?.set_wisp_pool === "function") {
                sandstone.network.set_wisp_pool([selected, ...wssUrls.filter((url) => url !== selected)]);
            }
            console.log("EasyGame: Using fallback wisp server:", selected);
        } catch (err) {
            console.error("EasyGame: Wisp setup failed:", err);
        }
    };

    await setupWisp();

    const decodeUrl = (str) => {
        try {
            if (!/^[a-zA-Z0-9+/]*={0,2}$/.test(str) || str.length < 4) return str;
            return atob(str);
        } catch (e) {
            return str;
        }
    };

    const replacePTags = async () => {
        const pTags = document.querySelectorAll('p[eg-url]');
        for (const p of Array.from(pTags)) {
            const rawUrl = p.getAttribute('eg-url');
            const w = p.getAttribute('width') || '800';
            const h = p.getAttribute('height') || '600';

            if (rawUrl) {
                const targetUrl = decodeUrl(rawUrl);

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

                const shadowRoot = wrapper.attachShadow({ mode: 'closed' });
                shadowRoot.appendChild(iframe);

                if (p.replaceWith) {
                    p.replaceWith(wrapper);
                } else {
                    p.parentNode.replaceChild(wrapper, p);
                }

                let finalTargetUrl = targetUrl;
                if (!finalTargetUrl.startsWith("http:") && !finalTargetUrl.startsWith("https:") && !finalTargetUrl.startsWith("sandstone:")) {
                    finalTargetUrl = "https://" + finalTargetUrl;
                }

                wireStatus(proxyFrame, finalTargetUrl);
                iframe.addEventListener('error', () => {
                    setStatus("The proxied frame failed to load.");
                });

                try {
                    await proxyFrame.navigate_to(finalTargetUrl);
                } catch (err) {
                    setStatus("Navigation failed:\n" + (err && err.message ? err.message : err));
                    console.error("EasyGame: Error navigating ProxyFrame", err);
                }
            }
        }
    };

    const observer = new MutationObserver((mutations) => {
        let shouldRun = false;
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldRun = true;
                break;
            }
            if (mutation.type === 'attributes' && mutation.attributeName === 'eg-url') {
                shouldRun = true;
                break;
            }
        }
        if (shouldRun) replacePTags();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['eg-url']
    });

    replacePTags();
})();
