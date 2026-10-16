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
    const WISP_WAIT_MS = 12000;

    const withTimeout = (promise, ms, label) => new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error((label || "operation") + " timed out")), ms);
        promise.then(
            (v) => { clearTimeout(timer); resolve(v); },
            (e) => { clearTimeout(timer); reject(e); }
        );
    });

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

    const resolveWisp = async () => {
        const promise = readHost("kWispP");
        if (promise && typeof promise.then === "function") {
            try {
                const url = normalizeWisp(await withTimeout(promise, WISP_WAIT_MS, "wisp resolve"));
                if (url) return url;
            } catch (err) {
                console.warn("EasyGame: wisp resolve slow:", err.message);
            }
        }
        const direct = normalizeWisp(readHost("wlspServer"));
        if (direct) return direct;
        const host = hostWindows().map((w) => {
            try { return w.K; } catch (e) { return null; }
        }).find((k) => k && typeof k.revalidateWisp === "function");
        if (host) {
            try {
                return normalizeWisp(await withTimeout(host.revalidateWisp(), WISP_WAIT_MS, "wisp revalidate"));
            } catch (err) {
                console.warn("EasyGame: wisp revalidate failed:", err.message);
            }
        }
        return null;
    };

    const applyWisp = (best) => {
        try {
            sandstone.libcurl.set_websocket(best);
            const pool = readHost("wispUrls");
            if (typeof sandstone.network?.set_wisp_pool === "function") {
                const rest = Array.isArray(pool) ? pool.filter((u) => u !== best) : [];
                sandstone.network.set_wisp_pool([best, ...rest]);
            }
        } catch (e) {
            console.error("EasyGame: applyWisp failed:", e);
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

    setStatus("Finding a wisp server...");
    await waitForLibcurl();
    const wisp = await resolveWisp();
    if (wisp) {
        applyWisp(wisp);
    } else {
        setStatus("No working wisp server was found.\nThe proxy may not connect.");
        console.error("EasyGame: no validated wisp available on window.");
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

    if (wisp) hideStatus();
    replacePTags();
})();
