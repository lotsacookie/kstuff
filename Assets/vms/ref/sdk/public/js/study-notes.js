<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="8aceff4bc927c95549e035a83e96378d42bf137c" content="8aceff4bc927c95549e035a83e96378d42bf137c" />
    <!-- Ads (Adsterra popunder) load from src/lib/ads.ts, which skips bots and
         automated browsers so they never count as invalid traffic. -->
    <link rel="icon" type="image/png" href="/astra-logo.png" />
    <link rel="apple-touch-icon" href="/astra-logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Astra</title>
    <meta name="description" content="Astra — cloud gaming and cloud browser, running straight in your browser. Play Roblox, Clash Royale, A Browser and more, no downloads." />
    <meta name="application-name" content="Astra" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Astra" />
    <meta property="og:title" content="Astra" />
    <meta property="og:description" content="Cloud gaming and cloud browser, running straight in your browser. Play Roblox, Clash Royale, A Browser and more, no downloads." />
    <meta property="og:image" content="/astra-logo.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary" />
    <meta property="twitter:title" content="Astra" />
    <meta property="twitter:description" content="Cloud gaming and cloud browser, running straight in your browser." />
    <meta property="twitter:image" content="/astra-logo.png" />

    <meta name="theme-color" content="#3b82f6" />

    <!-- Google tag (gtag.js): queued now, library fetched when idle so it never competes with first paint -->
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      /* SPA: page_view events are sent from the router on every navigation */
      gtag('config', 'G-RD2558RZJZ', { send_page_view: false });

      (function () {
        function load() {
          var s = document.createElement('script');
          s.async = true;
          s.src = 'https://www.googletagmanager.com/gtag/js?id=G-RD2558RZJZ';
          document.head.appendChild(s);
        }
        function idle() {
          if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 4000 });
          else setTimeout(load, 2000);
        }
        if (document.readyState === 'complete') idle();
        else window.addEventListener('load', idle);
      })();
    </script>

    <!-- Fonts (loaded once for the whole app) -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'" />
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Inter:wght@400;500;600;700&display=swap" /></noscript>
    <script type="module" crossorigin src="/assets/index-C45bD3V2.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/vendor-react-BLSnyxkJ.js">
    <link rel="modulepreload" crossorigin href="/assets/vendor-ui-tZMmN1M_.js">
    <link rel="modulepreload" crossorigin href="/assets/vendor-radix-C74W69qG.js">
    <link rel="stylesheet" crossorigin href="/assets/index-B1aMZBp8.css">
  </head>
  <body>
    <div id="root"></div>
  <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js/vce701823e78c4301a35b7e07294d87301792088814092" integrity="sha512-UKNk8GbxkABxKcXYuLkO16EleLGUkcvJWtpSNmExE0Too3ZaFAxTscNWEc1OdAv5/BikHawapSCaiD2XCmp+Bw==" data-cf-beacon='{"version":"2024.11.0","token":"f9a2f9f3d0c841d29eff57da53e66dbf","r":1,"spa":2}' crossorigin="anonymous"></script>
</body>
</html>
