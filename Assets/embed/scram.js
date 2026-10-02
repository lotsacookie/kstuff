(async function() {
    let sandstone = window.sandstone;
    if (!sandstone) {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/sandstone-proxy/dist/sandstone.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error("Script failed to load from CDN"));
            document.head.appendChild(script);
        });
        sandstone = window.sandstone;
    }

    if (!sandstone) {
        console.error("EasyGame: Could not load sandstone proxy. Please ensure the CDN is accessible.");
        return;
    }

    const FALLBACK_WISP = "wss://girlspreples.org/wi/";
    sandstone.libcurl.set_websocket(FALLBACK_WISP);

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

    const setupWisp = async () => {
        try {
            const outerRes = await fetch("https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/json/wss.json");
            if (!outerRes.ok) throw new Error("Failed to fetch wss.json");
            const outerArr = await outerRes.json();

            if (!Array.isArray(outerArr) || outerArr.length === 0) throw new Error("wss.json is empty or not an array");

            const innerJson = atob(outerArr[0]);
            const wssUrls = JSON.parse(innerJson);

            if (!Array.isArray(wssUrls) || wssUrls.length === 0) throw new Error("Decoded WSS list is empty");

            for (const url of wssUrls) {
                const works = await testWisp(url);
                if (works) {
                    sandstone.libcurl.set_websocket(url);
                    console.log("EasyGame: Using wisp server:", url);
                    return;
                }
            }

            console.warn("EasyGame: No working wisp server found, falling back to default.");
            sandstone.libcurl.set_websocket(wssUrls[0]);
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

                try {
                    await proxyFrame.navigate_to(finalTargetUrl);
                } catch (err) {
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
