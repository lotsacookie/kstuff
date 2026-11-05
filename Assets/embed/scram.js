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

    // Singuloxy/sandstone and the wisp/libcurl layer belong to the site's net hub (Assets/js/net-hub.js,
    // window.kNetDirect). This embed loads nothing of its own and picks no wisp: it borrows the hub's instance.
    const findHub = () => {
        for (const w of [window.parent, window.top, window]) {
            try { if (w && w.kNetDirect && typeof w.kNetDirect.sandstone === "function") return w.kNetDirect; } catch (e) {}
        }
        return null;
    };

    setStatus("Connecting to net hub...");
    let hub = findHub();
    for (let i = 0; !hub && i < 100; i++) {
        await new Promise((r) => setTimeout(r, 100));
        hub = findHub();
    }
    if (!hub) {
        setStatus("Net hub unavailable.\nOpen this from the main site so it can provide the proxy.");
        console.error("EasyGame: window.kNetDirect not found.");
        return;
    }

    let sandstone;
    try {
        sandstone = await hub.sandstone();
        await hub.ready();
    } catch (err) {
        setStatus("Net hub failed to start.\n" + (err && err.message ? err.message : err));
        console.error("EasyGame: net hub failed:", err);
        return;
    }
    console.log("EasyGame: net hub wisp", hub.wisp());

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
