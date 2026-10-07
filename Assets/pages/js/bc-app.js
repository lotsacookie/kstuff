# Assets/pages/js/bc-app.js

````js
        const urlParams = new URLSearchParams(window.location.search);
        const targetSite = urlParams.get('site');
        const iframe = document.getElementById('content-frame');

        let proxyPort = null;

        window.addEventListener('message', (event) => {
            if (event.data === 'init-port' && event.ports && event.ports.length > 0) {
                proxyPort = event.ports[0];
                proxyPort.start();
            }
        });

        if (targetSite) {
            iframe.src = targetSite;
        }

        setInterval(() => {
            try {
                const win = iframe.contentWindow;
                if (!win) return;

                const currentTitle = win.document.title;
                const currentUrl = win.location.href;
                
                let currentFavicon = "";
                const iconElement = win.document.querySelector("link[rel*='icon']");
                if (iconElement && iconElement.href) {
                    currentFavicon = iconElement.href;
                }

                if (proxyPort) {
                    proxyPort.postMessage({
                        type: 'tabData',
                        title: currentTitle,
                        favicon: currentFavicon,
                        url: currentUrl
                    });
                }
            } catch (e) {
            }
        }, 100);
````
