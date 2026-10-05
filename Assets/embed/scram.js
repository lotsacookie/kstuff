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

    const PROBE_URLS = [
        "https://www.cloudflare.com/cdn-cgi/trace",
        "https://www.roblox.com/robots.txt"
    ];

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

    const probeWisp = async (url) => {
        sandstone.libcurl.set_websocket(url);
        const results = await Promise.allSettled(PROBE_URLS.map(async (probeUrl) => {
            const res = await withTimeout(sandstone.libcurl.fetch(probeUrl), 8000);
            try { await res.body?.cancel(); } catch (e) {}
            return true;
        }));
        return results.filter((result) => result.status === "fulfilled").length;
    };

    const setupWisp = async () => {
        setStatus("Finding a working wisp server...");
        try {
            const outerRes = await fetch("https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/json/wss.json");
            if (!outerRes.ok) throw new Error("Failed to fetch wss.json");
            const outerArr = await outerRes.json();

            if (!Array.isArray(outerArr) || outerArr.length === 0) throw new Error("wss.json is empty or not an array");

            const innerJson = atob(outerArr[0]);
            const wssUrls = JSON.parse(innerJson);

            if (!Array.isArray(wssUrls) || wssUrls.length === 0) throw new Error("Decoded WSS list is empty");

            await withTimeout(waitForLibcurl(), 10000).catch(() => {});

            let chosen = null;
            let best = null;
            let bestScore = 0;

            for (const url of wssUrls) {
                if (!(await testWisp(url))) continue;
                setStatus("Testing " + url + " ...");
                const score = await probeWisp(url);
                console.log("EasyGame: wisp probe", url, score + "/" + PROBE_URLS.length);
                if (score === PROBE_URLS.length) {
                    chosen = url;
                    break;
                }
                if (score > bestScore) {
                    best = url;
                    bestScore = score;
                }
            }

            const selected = chosen || best || wssUrls[0];
            sandstone.libcurl.set_websocket(selected);
            console.log("EasyGame: Using wisp server:", selected);

            const pool = [selected, ...wssUrls.filter((url) => url !== selected)];
            if (typeof sandstone.network?.set_wisp_pool === "function") {
                sandstone.network.set_wisp_pool(pool);
            }
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
