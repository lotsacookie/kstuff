(async function() {
    // Load sandstone safely via script tag to avoid VM Obfuscation breaking dynamic imports
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

    // wisp url (changable)
    sandstone.libcurl.set_websocket("wss://wisp.rhw.one/wisp/");

    // chatgpt b64 decoder
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
                // ignoree prepended proxies to avoid double-proxying, let Sandstone rewrite pages directly
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
                // Note: The sandboxing attributes are managed by ProxyFrame internally, 
                // but we apply fullscreen constraints.
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

    // --- START OBSERVER IMMEDIATELY ---
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

    // first pass
    replacePTags();
})();
