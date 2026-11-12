(function () {
  if (window.kAiDoc) return;
  var JAR_KEY = "deepai.jar", DB_NAME = "kstuff-ai", STORE_NAME = "docs", DOC_ID = "chat";
  var FRESH_MS = 25 * 60 * 1000, MAX_AGE_MS = 12 * 3600 * 1000;
  var noop = function () {};
  var log = function () { try { console.log.apply(console, arguments); } catch (e) {} };
  var say = noop;
  const withTimeout = (p, ms, label) => { let t; return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(new Error(label + " timed out")), ms); })]).finally(() => clearTimeout(t)); };
  const SITE = "https://deepai.org";
  const OWN_RE = /(^|\.)deepai\.org$/i;
  const BLOCK_RE = /googletagmanager|google-analytics|googlesyndication|doubleclick|sentry|koah|twitter|facebook|reddit|linkedin|stripe|clarity|hotjar|zeroclick|taboola|outbrain/i;
  const PAGE_ACCEPT = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
  const RESTYLE = `
body>header,body>footer,#language-banner,#announcement-banner,.language-banner,.announcement-banner,.sidebar-ad,.permanent-announcement-banner,.dyn-content-block,#modelPageProNotice,.model-page-pro-notice{display:none!important}
#voicePillButton,#websiteBuilderPillButton,#chatMemoryPillButton,#chatMemorySettingsButton,.pro-only-pill,#chat-memory-modal-root,.chat-memory-modal{display:none!important}
.landing-title-group>h1,.landing-title-group .landing-description-group>h3{display:none!important}
.chat-model-chip:has(.model-chip-lock),.chat-mode-menu-item.chat-mode-locked,.chat-mode-menu-item:has(.chat-mode-lock-icon),.slash-cmd-item:has(img[src*="lock-icon"]),.cmd-palette-item:has(.cmd-palette-item-lock),.presets-dropdown-item:has(img[src*="lock-icon"]),.attach-dropdown-item:has(img[src*="lock-icon"]),.attach-dropdown-item:has(.pro-lock-icon),.chat-chip:has(img[src*="lock-icon"]){display:none!important}
html,body{background:transparent!important;background-image:none!important;color:#fff!important}
*,*::before,*::after{border-radius:0!important;font-family:"Comfortaa",sans-serif!important;font-weight:700!important;-webkit-tap-highlight-color:transparent}
pre,pre *,code,code *,.code-block-wrapper *{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important}
.katex,.katex *{font-family:KaTeX_Main,"Times New Roman",serif!important}
*{-webkit-user-select:none;user-select:none}
.outputBox,.outputBox *,.chatbox-wrapper,.chatbox-wrapper *,textarea,input{-webkit-user-select:text!important;user-select:text!important}
body{min-height:100dvh!important;padding-top:0!important}
.chat-main{min-height:100dvh!important}
.chat-sidebar{top:12px!important;bottom:12px!important;left:12px!important;width:260px!important;background:#0a0a0a!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:none!important;backdrop-filter:blur(12px)}
.chat-layout-container.sidebar-open .chat-main{margin-left:284px!important}
@media(max-width:720px){.chat-sidebar{top:0!important;bottom:0!important;left:0!important;width:min(300px,85vw)!important;box-shadow:0 0 40px rgba(0,0,0,.55)!important}.chat-layout-container.sidebar-open .chat-main{margin-left:0!important}}
.sidebar-top-bar{border-bottom:1px solid rgba(255,255,255,.14)!important}
.sidebar-toggle-container{top:10px!important;left:12px!important}
.new-chat-button-container{top:10px!important}
.sidebar-new-chat-btn,.sidebar-close-btn,.new-chat-button,.compose-plus-btn,.chat-chip,.delete-all-history-button,.sidebar-toggle,.chat-mode-dropdown-trigger{background:#141414!important;border:1px solid rgba(255,255,255,.14)!important;color:#fff!important;box-shadow:none!important;opacity:1!important;transition:border-color .25s ease,background-color .25s ease,color .25s ease!important}
.sidebar-new-chat-btn:hover,.sidebar-close-btn:hover,.new-chat-button:hover,.compose-plus-btn:hover,.chat-chip:hover,.delete-all-history-button:hover,.sidebar-toggle:hover,.chat-mode-dropdown-trigger:hover,.chatoptionsBox button:hover,.optionsBox button:hover,.attach-dropdown-item:hover,.presets-dropdown-item:hover,.chat-mode-menu-item:hover{background:#fff!important;color:#000!important;border-color:#fff!important}
.compose-plus-btn.open,.compose-plus-btn.open:hover{background:#fff!important;color:#000!important;border-color:#fff!important;transform:none!important}
.compose-plus-btn,.compose-plus-btn.open{transform:none!important}
.sidebar-new-chat-btn:hover svg [stroke="white"],.sidebar-close-btn:hover svg [stroke="white"],.new-chat-button:hover svg [stroke="white"],.sidebar-toggle:hover svg [stroke="white"],.chatoptionsBox button:hover svg [stroke="white"],.optionsBox button:hover svg [stroke="white"]{stroke:#000!important}
.sidebar-new-chat-btn:hover svg [fill="white"],.sidebar-close-btn:hover svg [fill="white"],.new-chat-button:hover svg [fill="white"],.sidebar-toggle:hover svg [fill="white"],.chatoptionsBox button:hover svg [fill="white"],.optionsBox button:hover svg [fill="white"]{fill:#000!important}
.sidebar-new-chat-btn:hover svg,.sidebar-close-btn:hover svg,.new-chat-button:hover svg,.compose-plus-btn:hover svg,.compose-plus-btn.open svg,.delete-all-history-button:hover svg,.sidebar-toggle:hover svg,.chat-mode-dropdown-trigger:hover svg,.chatoptionsBox button:hover svg,.optionsBox button:hover svg,.attach-dropdown-item:hover svg,.presets-dropdown-item:hover svg{color:#000!important}
.chat-chip:hover img,.attach-dropdown-item:hover img,.presets-dropdown-item:hover img{filter:invert(1)!important}
.attach-dropdown-item:hover *,.presets-dropdown-item:hover *,.chat-mode-menu-item:hover *{color:#000!important}
.chat-history-search-input{background:#141414!important;border:1px solid rgba(255,255,255,.14)!important;color:#fff!important}
.chat-history-search-input:focus{border-color:#fff!important;outline:none!important}
#chatHistoryList>*{border:1px solid transparent!important;opacity:.85}
#chatHistoryList>*:hover{background:rgba(255,255,255,.09)!important;border-color:rgba(255,255,255,.14)!important;opacity:1}
.sidebar-footer{border-top:1px solid rgba(255,255,255,.14)!important}
#attachDropdownMenu,#chatModeMenu,#presetsDropdownMenu,.presets-dropdown-menu{background:#0a0a0a!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:none!important}
.persistent-compose-area{background:#141414!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:none!important;transition:border-color .3s ease,box-shadow .3s ease!important}
.persistent-compose-area:focus-within{border-color:#fff!important;box-shadow:0 0 0 3px rgba(255,255,255,.3)!important}
#persistentChatbox{font-size:.9rem!important;color:#fff!important}
#persistentChatbox::placeholder{color:#fff!important;opacity:.4!important}
#chatSubmitButton{background:#fff!important;border:none!important;color:#000!important}
#chatSubmitButton img,#chatSubmitButton svg{filter:invert(1)!important}
#chatSubmitButton:hover{background:#fff!important;transform:translateY(-1px)}
.chatbox-wrapper .chatbox{background:#141414!important;border:1px solid rgba(255,255,255,.14)!important;font-size:.95rem!important;line-height:1.6!important}
.outputBox{font-size:.95rem!important;line-height:1.6!important}
pre,.code-block-wrapper,.code-block-wrapper pre{background:#000!important;border:1px solid rgba(255,255,255,.14)!important}
.ai-disclaimer{opacity:.4!important}
::selection{background:rgba(255,255,255,.28)}
*{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.28) transparent}
.chat-history-search-container::after{display:none!important}
.sidebar-footer{background:#0a0a0a!important;border-top:1px solid rgba(255,255,255,.14)!important}
.sidebar-scroll-wrapper{scrollbar-color:rgba(255,255,255,.28) transparent!important}
.chat-history-items{padding-top:8px!important}
.chat-mode-menu-item.selected,.chat-mode-menu-item.selected:hover,.chat-mode-menu-item.menu-arrow-hl,.chat-mode-menu-item.menu-arrow-hl.selected,.presets-dropdown-item.selected,.presets-dropdown-item.selected:hover,.active-mode-chip,.active-mode-chip:hover,.attach-dropdown-toggle.active,.attach-dropdown-toggle.active:hover,.attach-dropdown-toggle.active.plus-menu-hl{background:rgba(255,255,255,.16)!important;color:#fff!important;border-color:rgba(255,255,255,.14)!important}
.presets-dropdown-item.selected svg,.attach-dropdown-toggle.active svg,.active-mode-chip svg{color:#fff!important}
.pro-badge,.beta-badge,.model-page-pro-badge,.sources-badge,.thinking-badge{background:rgba(255,255,255,.14)!important;color:#fff!important;border-color:rgba(255,255,255,.14)!important}
[role="switch"][aria-checked="true"] .attach-dropdown-switch,.oc-toggle input[type="checkbox"]:checked + .oc-toggle-slider{background:#fff!important}
[role="switch"][aria-checked="true"] .attach-dropdown-switch::after{background:#000!important}
#deepaiProgressBar{background:#fff!important}
.results-tab.active{background:rgba(255,255,255,.16)!important;color:#fff!important;border-color:#fff!important}
.cmd-palette-match,.cmd-palette-current-dot{color:#fff!important;background-color:transparent!important}
.chatEditSubmitButton{background:#fff!important;color:#000!important;border-color:#fff!important}
.optionsBox button:focus-visible,.chatoptionsBox button:focus-visible{outline:1px solid #fff!important;box-shadow:none!important}
#upload-successful{background:#141414!important;border:1px solid rgba(255,255,255,.14)!important}
:root{--purple:#fff;--pink:#fff}
.more-models-btn,.model-menu-divider,.pin-model-btn{display:none!important}
#chatModeMenu{max-height:60vh!important;overflow-y:auto!important}
.ai-disclaimer{display:none!important}
.chat-main.has-messages{padding-top:56px!important}
#recordButton{background:#141414!important;border:1px solid rgba(255,255,255,.14)!important;color:#fff!important;box-shadow:none!important;transition:width .3s ease,color .25s ease,background-color .25s ease,border-color .25s ease!important}
#recordButton:hover{background:#fff!important;color:#000!important;border-color:#fff!important}
#recordButton:hover img{filter:invert(1)!important}
#recordButton.recording,#recordButton.recording:hover{color:#ee7a7a!important}
#recordButton.recording{border-color:rgba(238,122,122,.4)!important}
#recordButton.recording:hover{background:#141414!important;border-color:#ee7a7a!important}
#errorpopup,#summarypopup,#copypopup,#successpopup,#upload-successful,#upload-unsuccessful,#upload-too-many,#big-file-type,#bad-file-type{background:#141414!important;border:1px solid rgba(255,255,255,.14)!important;color:#fff!important;box-shadow:none!important;backdrop-filter:none!important}
#errorpopup,#upload-unsuccessful,#upload-too-many,#big-file-type,#bad-file-type{color:#ee7a7a!important;border-color:rgba(238,122,122,.4)!important}
.sidebar-toggle::before,.new-chat-button::before{content:none!important;display:none!important;background:none!important}
.chat-layout-container .sidebar-toggle,.chat-layout-container .new-chat-button{width:40px!important;height:40px!important;filter:none!important}
.chat-layout-container .sidebar-toggle:hover,.chat-layout-container .new-chat-button:hover{background:#fff!important}
.chat-layout-container:has(.has-messages) .sidebar-toggle,.chat-layout-container:has(.has-messages) .new-chat-button{background:#141414!important;border:1px solid rgba(255,255,255,.14)!important}
.chat-layout-container:has(.has-messages) .sidebar-toggle:hover,.chat-layout-container:has(.has-messages) .new-chat-button:hover{background:#fff!important;border-color:#fff!important}
.sidebar-toggle-container,.sidebar-toggle,#sidebarToggle,.sidebar-close-btn,#sidebarCloseBtn,#sidebarOverlay{display:none!important}
.chat-sidebar{transform:none!important;display:flex!important;background:rgba(0,0,0,.5)!important;backdrop-filter:blur(8px)}
.sidebar-footer,.sidebar-top-bar{background:transparent!important}
.chat-layout-container .chat-main.has-messages{padding-top:56px!important}
.chat-layout-container .chat-main{margin-left:284px!important;margin-top:0!important;margin-bottom:0!important;background:transparent!important}
.chat-main:not(.has-messages){height:100dvh!important}
.chat-main,.chat-layout-container,#layoutContainer,#convo,.outputBox{background:transparent!important}
.new-chat-button-container{left:auto!important;right:12px!important}
@media(max-width:720px){.chat-sidebar{width:170px!important}.chat-layout-container .chat-main{margin-left:182px!important}}
.modal-root{background-color:rgba(0,0,0,.6)!important}
.modal{background:#0a0a0a!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:none!important}
.confirm-desc{color:rgba(255,255,255,.6)!important}
.confirm-input{background:#141414!important;border:1px solid rgba(255,255,255,.14)!important;color:#fff!important}
.confirm-input:focus{border-color:#fff!important;outline:none!important}
.confirm-button,#confirm-yes-btn,#confirm-cancel-btn{background:#141414!important;background-color:#141414!important;border:1px solid rgba(255,255,255,.14)!important;color:#fff!important;transition:border-color .25s ease,background-color .25s ease,color .25s ease!important}
.confirm-button:hover:not(:disabled),#confirm-yes-btn:hover:not(:disabled),#confirm-cancel-btn:hover:not(:disabled){background:#fff!important;background-color:#fff!important;color:#000!important;border-color:#fff!important}
.history-delete-btn{color:#fff!important}
.history-delete-btn:hover,.history-delete-btn.ctx-hl{background:#fff!important;color:#000!important}
.chat-history-item.current-chat,.chat-history-item.current-chat.menu-open,.chat-history-item.current-chat.rename-open,.chat-history-item.current-chat:hover{background:#fff!important;background-color:#fff!important;color:#000!important;border-color:#fff!important}
.chat-history-item.current-chat *{color:#000!important}
.chat-history-item.current-chat svg [stroke="white"]{stroke:#000!important}
.chat-history-item.current-chat svg [fill="white"]{fill:#000!important}
#chatHistoryList>*:has(.current-chat){opacity:1!important}
[data-tooltip]::after,[data-hint]::after,.keybind-tooltip{background:#0a0a0a!important;background-color:#0a0a0a!important;border:1px solid rgba(255,255,255,.14)!important;color:#fff!important;box-shadow:none!important}
.keybind-tooltip-label{color:#fff!important}
.keybind-tooltip-key{color:rgba(255,255,255,.5)!important}
`;

function shim() {
  const SITE = "https://deepai.org";
  const own = (u) => {
    try { return /(^|\.)deepai\.org$/i.test(new URL(u, SITE + "/").hostname); } catch { return false; }
  };
  const aborted = () => new DOMException("The operation was aborted.", "AbortError");
  const reads = /^(GET|HEAD)$/;
  window.__pxShim = true;

  const encode = async (body, headers) => {
    if (body == null) return undefined;
    if (typeof body === "string") {
      if (!headers["content-type"]) headers["content-type"] = "text/plain;charset=UTF-8";
      return body;
    }
    const r = new Response(body);
    const type = r.headers.get("content-type");
    if (type && (!headers["content-type"] || body instanceof FormData)) headers["content-type"] = type;
    return new Uint8Array(await r.arrayBuffer());
  };

  const follow = (res, signal) => {
    if (!res.body || [101, 204, 205, 304].includes(res.status)) return res;
    const reader = res.body.getReader();
    let done = false;
    const stream = new ReadableStream({
      start(c) {
        signal.addEventListener("abort", () => {
          if (done) return;
          done = true;
          try { reader.cancel(); } catch {}
          try { c.error(aborted()); } catch {}
        }, { once: true });
      },
      async pull(c) {
        if (done) return;
        try {
          const { value, done: end } = await reader.read();
          if (end) { done = true; c.close(); } else c.enqueue(value);
        } catch (e) {
          if (!done) { done = true; c.error(e); }
        }
      },
      cancel() {
        done = true;
        try { reader.cancel(); } catch {}
      },
    });
    const out = new Response(stream, { status: res.status, statusText: res.statusText, headers: res.headers });
    try { Object.defineProperty(out, "url", { value: res.url }); } catch {}
    return out;
  };

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const raw = typeof input === "string" ? input : input && input.url ? input.url : String(input);
    if (/^(blob|data):/i.test(raw)) return realFetch(input, init);
    let method = "GET", body, signal;
    const headers = {};
    if (typeof Request !== "undefined" && input instanceof Request) {
      method = input.method;
      input.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
      signal = input.signal;
      if (!reads.test(method)) body = await input.clone().arrayBuffer();
    }
    if (init) {
      if (init.method) method = String(init.method).toUpperCase();
      if (init.headers) new Headers(init.headers).forEach((v, k) => { headers[k.toLowerCase()] = v; });
      if ("body" in init) body = init.body;
      if (init.signal) signal = init.signal;
    }
    if (signal && signal.aborted) throw aborted();
    const url = new URL(raw, SITE + "/").href;
    const payload = reads.test(method) ? undefined : await encode(body, headers);
    const call = parent.__px({ url, method, headers, body: payload, signal });
    if (!signal) return call;
    const res = await Promise.race([
      call,
      new Promise((_, reject) => signal.addEventListener("abort", () => reject(aborted()), { once: true })),
    ]);
    return follow(res, signal);
  };

  const seen = new WeakMap();
  const fixImage = (img) => {
    if (!img || img.tagName !== "IMG") return;
    const src = img.getAttribute("src");
    if (!src || /^(data|blob):/i.test(src) || !own(src) || seen.get(img) === src) return;
    seen.set(img, src);
    const url = new URL(src, SITE + "/").href;
    parent.__px({ url, method: "GET", headers: { accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" } })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("HTTP " + r.status))))
      .then((b) => {
        const typed = !b.type && /\.svg(\?|$)/i.test(url) ? new Blob([b], { type: "image/svg+xml" }) : b;
        img.src = URL.createObjectURL(typed);
      })
      .catch(() => {});
  };
  const scan = (node) => {
    if (!node || node.nodeType !== 1) return;
    fixImage(node);
    if (node.querySelectorAll) node.querySelectorAll("img[src]").forEach(fixImage);
  };
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === "attributes") fixImage(m.target);
      else m.addedNodes.forEach(scan);
    }
  }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });

  for (const k of ["pushState", "replaceState"]) {
    const original = history[k].bind(history);
    history[k] = (s, t, u) => {
      try { return original(s, t, u); } catch {
        try { return original(s, t); } catch {}
      }
    };
  }

  navigator.sendBeacon = () => true;

  const srcDesc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
  if (srcDesc && srcDesc.set) {
    Object.defineProperty(HTMLScriptElement.prototype, "src", {
      configurable: true,
      enumerable: srcDesc.enumerable,
      get: srcDesc.get,
      set(v) {
        if (own(v)) srcDesc.set.call(this, v);
        else this.type = "text/blocked";
      },
    });
  }
  const setAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (n, v) {
    if (this.tagName === "SCRIPT" && String(n).toLowerCase() === "src" && !own(v)) {
      this.type = "text/blocked";
      return;
    }
    return setAttr.call(this, n, v);
  };

  document.addEventListener("click", (e) => {
    const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    const raw = a.getAttribute("href");
    if (!raw || raw[0] === "#" || /^(javascript|blob|data|mailto):/i.test(raw) || a.hasAttribute("download")) return;
    let u;
    try { u = new URL(raw, SITE + "/"); } catch { return; }
    if (own(u.href)) { e.preventDefault(); return; }
    if (a.target === "_blank") return;
    e.preventDefault();
  }, true);

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("img[src]").forEach(fixImage);
    parent.__pxReady();
  });
}


  function cursorBoot() {
    if (!(window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches)) return;
    var SIZE = 28, AO = [4 * SIZE / 24, 2.4 * SIZE / 24], HO = [10.5 * SIZE / 24, 2 * SIZE / 24];
    var SEL = "a[href],button:not(:disabled),[role='button'],[onclick],select,summary,label[for],input[type='button']:not(:disabled),input[type='submit']:not(:disabled),input[type='checkbox'],input[type='radio'],input[type='range'],[data-act]:not(:disabled),[data-target],.chat-history-item,.chat-chip,.attach-dropdown-item,.presets-dropdown-item,.chat-mode-menu-item,.history-delete-btn,.history-rename-btn";
    var SVG = '<svg class="k-arrow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 2.4 19.8 9.9c.6.3.5 1.1-.1 1.3l-6.6 1.8-2.3 6.4c-.2.6-1 .6-1.3 0L4 2.4z" fill="currentColor" stroke="rgba(0,0,0,.35)" stroke-width=".7" stroke-linejoin="round"/></svg><svg class="k-hand" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 3.5a1.5 1.5 0 0 1 3 0V10h.5V8.5a1.3 1.3 0 0 1 2.6 0V10h.4V9.4a1.3 1.3 0 0 1 2.6 0V10.5h.3a1.3 1.3 0 0 1 1.3 1.3V15c0 3.3-2.2 6-5.5 6h-1.4c-1.8 0-3-.8-4-2.1L5.3 15.2a1.4 1.4 0 0 1 2.1-1.8L9 15V3.5z" fill="currentColor" stroke="rgba(0,0,0,.35)" stroke-width=".7" stroke-linejoin="round"/></svg>';
    var root = document.documentElement, el = null, hand = false, lastT = null, announced = false;
    function post(a) { try { window.parent.postMessage({ type: "kstuff-cursor", action: a }, "*"); } catch (e) {} }
    function tint() {
      var c = "";
      try { c = window.parent.document.documentElement.style.getPropertyValue("--text") || ""; } catch (e) {}
      return c.trim() || "#fff";
    }
    root.classList.add("kstuff-cursor-active");
    var st = document.createElement("style");
    st.textContent = "html.kstuff-cursor-active,html.kstuff-cursor-active *{cursor:none !important;}.kstuff-cursor{position:fixed;top:0;left:0;width:" + SIZE + "px;height:" + SIZE + "px;pointer-events:none;z-index:2147483647;opacity:0;transition:opacity .1s ease;will-change:transform;contain:layout style;}.kstuff-cursor.visible{opacity:1;}.kstuff-cursor svg{width:100%;height:100%;display:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));}.kstuff-cursor .k-arrow{display:block;}.kstuff-cursor.pointer .k-arrow{display:none;}.kstuff-cursor.pointer .k-hand{display:block;}";
    (document.head || root).appendChild(st);
    function build() {
      if (el || !document.body) return;
      el = document.createElement("div");
      el.className = "kstuff-cursor";
      el.innerHTML = SVG;
      document.body.appendChild(el);
    }
    function place(x, y, t) {
      build();
      if (!el) return;
      if (t !== lastT) {
        lastT = t;
        var h = false;
        try { h = !!(t && t.closest && t.closest(SEL)); } catch (e) {}
        if (h !== hand) { hand = h; el.classList.toggle("pointer", h); }
      }
      var o = hand ? HO : AO;
      el.style.transform = "translate(" + (x - o[0]) + "px," + (y - o[1]) + "px)";
      if (!announced) { announced = true; el.style.color = tint(); post("enter"); }
      el.classList.add("visible");
      try { window.parent.__kPtr = { x: x, y: y }; } catch (e) {}
    }
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      place(e.clientX, e.clientY, e.target);
    }, { passive: true });
    function seed() {
      var p = null;
      try { p = window.parent.__kPtr; } catch (e) {}
      if (!p) return;
      var t = null;
      try { t = document.elementFromPoint(p.x, p.y); } catch (e) {}
      place(p.x, p.y, t);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", seed); else seed();
    root.addEventListener("mouseleave", function () {
      if (el) el.classList.remove("visible");
      announced = false;
      post("leave");
    });
  }
  var host = (function () {
    try { if (window.parent && window.parent !== window && window.parent.kAiDoc && window.parent.__kAiDocStore) return window.parent; } catch (e) {}
    return window;
  })();
  var store = host.__kAiDocStore || (host.__kAiDocStore = { html: "", at: 0, busy: null, jar: null });
  if (!store.jar) {
    try {
      var jv = JSON.parse(localStorage.getItem(JAR_KEY));
      store.jar = Array.isArray(jv) ? jv.filter(function (c) { return c && c.name && c.domain; }) : [];
    } catch (e) { store.jar = []; }
  }
  var jar = store.jar;
  var saveJar = function () { try { localStorage.setItem(JAR_KEY, JSON.stringify(jar)); } catch (e) {} };

  function cookieFor(url) {
    var h = new URL(url).hostname;
    return jar.filter(function (c) { return h === c.domain || h.endsWith("." + c.domain); }).map(function (c) { return c.name + "=" + c.value; }).join("; ");
  }
  function setCookieLines(r) {
    var out = [];
    try {
      if (Array.isArray(r.raw_headers)) r.raw_headers.forEach(function (kv) { if (/^set-cookie$/i.test(kv[0])) out.push(kv[1]); });
      if (!out.length && r.headers) {
        if (typeof r.headers.getSetCookie === "function") out.push.apply(out, r.headers.getSetCookie());
        if (!out.length && typeof r.headers.get === "function") {
          var v = r.headers.get("set-cookie");
          if (v) out.push.apply(out, v.split(/,(?=\s*[^;,=\s]+=)/));
        }
      }
    } catch (e) {}
    return out;
  }
  function absorb(url, r) {
    var lines = setCookieLines(r);
    if (!lines.length) return;
    var h = new URL(url).hostname;
    lines.forEach(function (line) {
      var parts = line.split(";").map(function (p) { return p.trim(); });
      var eq = parts[0].indexOf("=");
      if (eq < 1) return;
      var name = parts[0].slice(0, eq), value = parts[0].slice(eq + 1), domain = h, expired = false;
      parts.slice(1).forEach(function (p) {
        var i = p.indexOf("="), k = (i < 0 ? p : p.slice(0, i)).toLowerCase(), v = i < 0 ? "" : p.slice(i + 1);
        if (k === "domain" && v) domain = v.replace(/^\./, "").toLowerCase();
        if (k === "max-age" && Number(v) <= 0) expired = true;
        if (k === "expires" && Date.parse(v) < Date.now()) expired = true;
      });
      var idx = jar.findIndex(function (c) { return c.name === name && c.domain === domain; });
      if (idx >= 0) jar.splice(idx, 1);
      if (!expired && value) jar.push({ name: name, value: value, domain: domain });
    });
    saveJar();
  }

  var net = function () { return window.kNet || window.kNetDirect || null; };
  var isRead = function (m) { return /^(GET|HEAD)$/i.test(m); };
  function toBody(b) {
    if (b == null || typeof b === "string") return b;
    var src = ArrayBuffer.isView(b) ? new Uint8Array(b.buffer, b.byteOffset, b.byteLength) : new Uint8Array(b);
    var out = new Uint8Array(src.byteLength);
    out.set(src);
    return out;
  }
  async function waitNet() {
    var n = net();
    if (!n) throw new Error("Net hub is not available");
    if (typeof n.waitAvailable === "function") {
      var ok = await n.waitAvailable(8000);
      if (!ok) throw new Error("Net hub is not available");
    } else if (typeof n.ready === "function") {
      await withTimeout(n.ready(), 30000, "Net hub");
    }
    return n;
  }

  async function px(req) {
    var u = new URL(req.url, SITE + "/");
    if (!/^https?:$/.test(u.protocol)) throw new TypeError("Unsupported URL " + req.url);
    if (BLOCK_RE.test(u.hostname)) return new Response(null, { status: 204 });
    var method = String(req.method || "GET").toUpperCase();
    var once = async function () {
      var n = await waitNet();
      var headers = Object.assign({}, req.headers || {});
      if (OWN_RE.test(u.hostname)) {
        headers["User-Agent"] = navigator.userAgent;
        headers.Origin = SITE;
        headers.Referer = SITE + "/chat";
        var ck = cookieFor(u.href);
        if (ck) headers.Cookie = ck;
      }
      var init = { method: method, headers: headers, redirect: "follow" };
      if (req.body != null && !isRead(method)) init.body = toBody(req.body);
      if (req.signal) init.signal = req.signal;
      var r = await withTimeout(n.fetch(u.href, init), isRead(method) ? 45000 : 120000, "Request");
      absorb(u.href, r);
      return r;
    };
    try {
      return await once();
    } catch (e) {
      var m = String((e && e.message) || e);
      if (req.signal && req.signal.aborted) throw e;
      var netErr = /error code (6|7|28|35|52|55|56)\b|timed out|websocket|wisp|network|net hub/i.test(m);
      var safe = isRead(method) || /error code (6|7|35)\b/.test(m);
      if (netErr && safe) {
        log("[ai-doc] request failed (" + m + "), asking hub to rotate and retrying once");
        try { var n2 = net(); if (n2 && typeof n2.rotate === "function") await n2.rotate(null, true, false); } catch (e1) {}
        return await once();
      }
      throw e;
    }
  }

  async function fetchText(url, ms) {
    var r = await px({ url: url, method: "GET", headers: { accept: url === SITE + "/chat" ? PAGE_ACCEPT : "*/*" } });
    if (!r.ok) throw new Error("HTTP " + r.status + " for " + new URL(url).pathname);
    return withTimeout(r.text(), ms || 60000, "Response");
  }

async function buildDocument() {
    let html = await fetchText(SITE + "/chat");
  html = html
    .split('const divider=document.createElement("div");divider.className="model-menu-divider";menu.appendChild(divider);const moreBtn=document.createElement("div");')
    .join('const moreBtn=document.createElement("div");')
    .split("menu.appendChild(moreBtn);}")
    .join("extendedModels.forEach((mode)=>{if(pinnedValues.includes(mode.value))return;const item=createMenuItem(mode,savedMode,canUseGenius);item.appendChild(createPinBtn(mode.value));menu.appendChild(item);});}");
  if (!/<head[\s>]/i.test(html) || !/chatMain/.test(html)) throw new Error("DeepAI returned an unexpected page");
  html = html
    .split("function setSidebarState(open){").join("function setSidebarState(open){open=true;")
    .split("sidebarOverlay.classList.toggle('active',open)").join("sidebarOverlay.classList.toggle('active',false)");
  const tags = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>\s*<\/script>/gi)];
  say("Loading scripts…");
  const swaps = await Promise.all(tags.map(async (m) => {
    if (/type\s*=\s*["']module/i.test(m[0])) return [m[0], m[0]];
    let abs = "";
    try { abs = new URL(m[1], SITE + "/").href; } catch {}
    if (!abs || !OWN_RE.test(new URL(abs).hostname)) return [m[0], ""];
    try {
      const code = await fetchText(abs);
      return [m[0], "<script>" + code.replace(/<\/script/gi, "<\\/script") + "<\/script>"];
    } catch (e) {
      log("[load] script failed", abs, (e && e.message) || e);
      return [m[0], ""];
    }
  }));
  for (const [from, to] of swaps) html = html.replace(from, () => to);
  html = html
    .replace(/window\.location\.hostname\s*===\s*["']deepai\.org["']/g, "true")
    .replace(/window\.top\.location\.href\s*=\s*window\.location\.href/g, "void 0")
    .replace(/function applyStoredLanguage\(\)\s*\{/, (m) => m + "return false;");
  html = html.replace(/<head[^>]*>/i, (h) => h + '<base href="' + SITE + '/"><script>(' + shim.toString() + ")();<\/script><script>(" + cursorBoot.toString() + ")();<\/script>");
  html = html.replace(/<\/head>/i, () => '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap"><style id="px-style">' + RESTYLE + "</style></head>");
  return html;
}

  function idb() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(STORE_NAME); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  async function idbGet() {
    try {
      var db = await idb();
      return await new Promise(function (res) {
        var q = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(DOC_ID);
        q.onsuccess = function () { res(q.result || null); };
        q.onerror = function () { res(null); };
      });
    } catch (e) { return null; }
  }
  async function idbPut(v) {
    try {
      var db = await idb();
      await new Promise(function (res) {
        var t = db.transaction(STORE_NAME, "readwrite");
        t.objectStore(STORE_NAME).put(v, DOC_ID);
        t.oncomplete = res; t.onerror = res; t.onabort = res;
      });
    } catch (e) {}
  }

  var CODE_VER = (function () {
    var str = RESTYLE + String(shim) + String(buildDocument), h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  })();
  DOC_ID = "chat-" + CODE_VER;
  if (store.ver !== CODE_VER) { store.html = ""; store.at = 0; store.ver = CODE_VER; }

  var usable = function (rec) { return !!(rec && rec.html && Date.now() - rec.at < MAX_AGE_MS); };
  function peek() { return usable(store) ? { html: store.html, at: store.at } : null; }
  async function load() {
    var p = peek();
    if (p) return p;
    var rec = await idbGet();
    if (usable(rec)) { store.html = rec.html; store.at = rec.at; return { html: rec.html, at: rec.at }; }
    return null;
  }
  function ensure(force) {
    if (store.busy) return store.busy;
    if (!force && usable(store) && Date.now() - store.at < FRESH_MS) return Promise.resolve(store.html);
    store.busy = (async function () {
      var html = await buildDocument();
      store.html = html;
      store.at = Date.now();
      idbPut({ html: html, at: store.at });
      return html;
    })().finally(function () { store.busy = null; });
    return store.busy;
  }

  window.kAiDoc = { ver: CODE_VER, px: px, peek: peek, load: load, ensure: ensure, build: buildDocument, age: function () { return store.at ? Date.now() - store.at : Infinity; } };

  if (host === window) {
    var warm = function (n) {
      var d = window.kNetDirect;
      if (!d || typeof d.ready !== "function") { if (n < 90) setTimeout(function () { warm(n + 1); }, 2000); return; }
      load().then(function (rec) {
        if (rec && Date.now() - rec.at < FRESH_MS) return null;
        return d.ready().then(function () { return ensure(false); });
      }).catch(noop);
    };
    var go = function () {
      setTimeout(function () {
        (window.requestIdleCallback || function (f) { setTimeout(f, 0); })(function () { warm(0); }, { timeout: 8000 });
      }, 4000);
    };
    if (document.readyState === "complete") go(); else window.addEventListener("load", go);
    setInterval(function () {
      var d = window.kNetDirect;
      if (!document.hidden && d && typeof d.status === "function" && d.status() === "on") ensure(false).catch(noop);
    }, 10 * 60 * 1000);
  }
})();
