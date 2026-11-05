# Cross-origin isolation (Roblox web client, Unity threads, any pthread wasm)

Sandstone has no service worker, so it cannot add headers itself. Emscripten pthreads need
`SharedArrayBuffer`/shared `WebAssembly.Memory` posted to workers, which browsers only allow when
`self.crossOriginIsolated === true`. That is decided by the TOP-LEVEL page, so the page you load
sandstone on (and every page between it and the proxy iframes, e.g. an embed iframe) must send:

    Cross-Origin-Opener-Policy: same-origin
    Cross-Origin-Embedder-Policy: credentialless

and any embedding iframe needs `allow="cross-origin-isolated"`. Sandstone's own frames already set it
and inherit the policy because they are blob/srcdoc documents.

Check in the console: `crossOriginIsolated` must be `true` on the top page AND inside the embed.

## Setting the headers (pick what your host is)

- Cloudflare (any host proxied by it): Rules > Transform Rules > Modify Response Header > set both headers above.
- Cloudflare Pages / Netlify: add a `_headers` file at the site root:

      /*
        Cross-Origin-Opener-Policy: same-origin
        Cross-Origin-Embedder-Policy: credentialless

- Vercel `vercel.json`:

      {"headers":[{"source":"/(.*)","headers":[
        {"key":"Cross-Origin-Opener-Policy","value":"same-origin"},
        {"key":"Cross-Origin-Embedder-Policy","value":"credentialless"}]}]}

- nginx: `add_header Cross-Origin-Opener-Policy same-origin always; add_header Cross-Origin-Embedder-Policy credentialless always;`
- GitHub Pages cannot set headers; use the header service worker described below, put Cloudflare in front, or move the host.

`credentialless` needs Chromium (Chrome/Edge). Cross-origin popups/OAuth logins on the top page lose `window.opener` under COOP.

## Emscripten and WebGL handling

`src/frame/intercept/emscripten.mjs` hooks canvas creation for pages that load Emscripten builds such as the Roblox web client.

- `getContext` on `HTMLCanvasElement` and `OffscreenCanvas` for `webgl`, `webgl2` and `experimental-webgl` always sends `failIfMajorPerformanceCaveat: false`, retries once with conservative attributes, and logs one console error if the browser still returns `null`.
- `webglcontextlost` is default-prevented so the engine can receive `webglcontextrestored` instead of dying silently.
- `navigator.gpu.requestAdapter()` resolves `null` instead of rejecting so engines can fall back to WebGL.
- On load the frame logs a console error when `crossOriginIsolated` is false or `SharedArrayBuffer` is missing.

There is no single-threaded fallback. The Roblox web client needs shared WebAssembly memory for its pthread workers, and browsers only provide that on a cross-origin isolated top-level page, so the headers above are required.

## Hosts that cannot set headers (GitHub Pages)

`example/coi-sw.js` is a small service worker whose only job is to add `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` to same-origin responses. Cross-origin requests are passed through untouched. `example/coi-register.js` registers it, then reloads the page once so the document itself is served with the headers.

To use it on your own page:

- Put `coi-sw.js` and `coi-register.js` in the same folder as the page, served from the same origin (a CDN copy will not work, the worker script must be same-origin).
- Add `<script src="coi-register.js"></script>` in the `<head>`, before any script that loads sandstone.
- The first visit reloads once. If the page is still not isolated after that, the console prints an error and it does not reload again.

Limits: it needs HTTPS (GitHub Pages is), it does not run in Firefox private windows, the very first load is not isolated until the reload, and `COOP: same-origin` still breaks `window.opener` for popups. If the host already sends the headers, the register script exits immediately.
