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
  const RESTYLE = `:root{--bg:#000;--text:#fff;--card:#141414;--nav:#0a0a0a}

body>header,body>footer,#language-banner,#announcement-banner,.language-banner,.announcement-banner,.sidebar-ad,.permanent-announcement-banner,.dyn-content-block,#modelPageProNotice,.model-page-pro-notice{display:none!important}
ins.adsbygoogle,[id^="google_ads"],[id^="aswift"],[id^="div-gpt-ad"],[data-ad-slot],[data-ad-client],[class*="adsbox" i],[class*="ad-slot" i],[class*="ad-container" i],[class*="ad-wrapper" i],[class*="advert" i],[id*="advert" i],[class*="sponsored" i],[id*="sponsored" i],[id*="koah" i],[class*="koah" i],[id*="zeroclick" i],[class*="zeroclick" i],iframe[src*="doubleclick"],iframe[src*="googlesyndication"],iframe[src*="adservice"],iframe[src*="taboola"],iframe[src*="outbrain"]{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;pointer-events:none!important}
#voicePillButton,#websiteBuilderPillButton,#chatMemoryPillButton,#chatMemorySettingsButton,.pro-only-pill,#chat-memory-modal-root,.chat-memory-modal{display:none!important}
.landing-title-group>h1,.landing-title-group .landing-description-group>h3{display:none!important}
.chat-model-chip:has(.model-chip-lock),.chat-mode-menu-item.chat-mode-locked,.chat-mode-menu-item:has(.chat-mode-lock-icon),.slash-cmd-item:has(img[src*="lock-icon"]),.cmd-palette-item:has(.cmd-palette-item-lock),.presets-dropdown-item:has(img[src*="lock-icon"]),.attach-dropdown-item:has(img[src*="lock-icon"]),.attach-dropdown-item:has(.pro-lock-icon),.chat-chip:has(img[src*="lock-icon"]){display:none!important}
html,body{background:transparent!important;background-image:none!important;color:var(--text)!important}
*,*::before,*::after{border-radius:0!important;font-family:"Comfortaa",sans-serif!important;font-weight:700!important;-webkit-tap-highlight-color:transparent}
pre,pre *,code,code *,.code-block-wrapper *{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important}
.katex,.katex *{font-family:KaTeX_Main,"Times New Roman",serif!important}
*{-webkit-user-select:none;user-select:none}
.outputBox,.outputBox *,.chatbox-wrapper,.chatbox-wrapper *,textarea,input{-webkit-user-select:text!important;user-select:text!important}
body{min-height:100dvh!important;padding-top:0!important}
.chat-main{min-height:100dvh!important}
.chat-sidebar{top:12px!important;bottom:12px!important;left:12px!important;width:260px!important;background:var(--nav)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;box-shadow:none!important;backdrop-filter:blur(12px)}
.chat-layout-container.sidebar-open .chat-main{margin-left:284px!important}
@media(max-width:720px){.chat-sidebar{top:0!important;bottom:0!important;left:0!important;width:min(300px,85vw)!important;box-shadow:0 0 40px color-mix(in srgb,var(--bg) 55%,transparent)!important}.chat-layout-container.sidebar-open .chat-main{margin-left:0!important}}
.sidebar-top-bar{border-bottom:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important}
.sidebar-toggle-container{top:10px!important;left:12px!important}
.new-chat-button-container{top:10px!important}
.sidebar-new-chat-btn,.sidebar-close-btn,.new-chat-button,.compose-plus-btn,.chat-chip,.delete-all-history-button,.sidebar-toggle,.chat-mode-dropdown-trigger{background:var(--card)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;color:var(--text)!important;box-shadow:none!important;opacity:1!important;transition:border-color .25s ease,background-color .25s ease,color .25s ease!important}
.sidebar-new-chat-btn:hover,.sidebar-close-btn:hover,.new-chat-button:hover,.compose-plus-btn:hover,.chat-chip:hover,.delete-all-history-button:hover,.sidebar-toggle:hover,.chat-mode-dropdown-trigger:hover,.chatoptionsBox button:hover,.optionsBox button:hover,.attach-dropdown-item:hover,.presets-dropdown-item:hover,.chat-mode-menu-item:hover{background:var(--text)!important;color:var(--bg)!important;border-color:var(--text)!important}
.compose-plus-btn.open,.compose-plus-btn.open:hover{background:var(--text)!important;color:var(--bg)!important;border-color:var(--text)!important;transform:none!important}
.compose-plus-btn,.compose-plus-btn.open{transform:none!important}
.sidebar-new-chat-btn:hover svg [stroke="white"],.sidebar-close-btn:hover svg [stroke="white"],.new-chat-button:hover svg [stroke="white"],.sidebar-toggle:hover svg [stroke="white"],.chatoptionsBox button:hover svg [stroke="white"],.optionsBox button:hover svg [stroke="white"]{stroke:var(--bg)!important}
.sidebar-new-chat-btn:hover svg [fill="white"],.sidebar-close-btn:hover svg [fill="white"],.new-chat-button:hover svg [fill="white"],.sidebar-toggle:hover svg [fill="white"],.chatoptionsBox button:hover svg [fill="white"],.optionsBox button:hover svg [fill="white"]{fill:var(--bg)!important}
.sidebar-new-chat-btn:hover svg,.sidebar-close-btn:hover svg,.new-chat-button:hover svg,.compose-plus-btn:hover svg,.compose-plus-btn.open svg,.delete-all-history-button:hover svg,.sidebar-toggle:hover svg,.chat-mode-dropdown-trigger:hover svg,.chatoptionsBox button:hover svg,.optionsBox button:hover svg,.attach-dropdown-item:hover svg,.presets-dropdown-item:hover svg{color:var(--bg)!important}
.chat-chip:hover img,.attach-dropdown-item:hover img,.presets-dropdown-item:hover img{filter:invert(1)!important}
.attach-dropdown-item:hover *,.presets-dropdown-item:hover *,.chat-mode-menu-item:hover *{color:var(--bg)!important}
.chat-history-search-input{background:var(--card)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;color:var(--text)!important}
.chat-history-search-input:focus{border-color:var(--text)!important;outline:none!important}
#chatHistoryList>*{border:1px solid transparent!important;opacity:.85}
#chatHistoryList>*:hover{background:color-mix(in srgb,var(--text) 9%,transparent)!important;border-color:color-mix(in srgb,var(--text) 14%,transparent)!important;opacity:1}
.sidebar-footer{border-top:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important}
#attachDropdownMenu,#chatModeMenu,#presetsDropdownMenu,.presets-dropdown-menu{background:var(--nav)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;box-shadow:none!important}
.persistent-compose-area{background:var(--card)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;box-shadow:none!important;transition:border-color .3s ease,box-shadow .3s ease!important}
.persistent-compose-area:focus-within{border-color:var(--text)!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--text) 30%,transparent)!important}
#persistentChatbox{font-size:.9rem!important;color:var(--text)!important}
#persistentChatbox::placeholder{color:var(--text)!important;opacity:.4!important}
#chatSubmitButton{background:var(--text)!important;border:none!important;color:var(--bg)!important}
#chatSubmitButton img,#chatSubmitButton svg{filter:invert(1)!important}
#chatSubmitButton:hover{background:var(--text)!important;transform:translateY(-1px)}
.chatbox-wrapper .chatbox{background:var(--card)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;font-size:.95rem!important;line-height:1.6!important}
.outputBox{font-size:.95rem!important;line-height:1.6!important}
pre,.code-block-wrapper,.code-block-wrapper pre{background:var(--bg)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important}
.ai-disclaimer{opacity:.4!important}
::selection{background:color-mix(in srgb,var(--text) 28%,transparent)}
*{scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--text) 28%,transparent) transparent}
.chat-history-search-container::after{display:none!important}
.sidebar-footer{background:var(--nav)!important;border-top:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important}
.sidebar-scroll-wrapper{scrollbar-color:color-mix(in srgb,var(--text) 28%,transparent) transparent!important}
.chat-history-items{padding-top:8px!important}
.chat-mode-menu-item.selected,.chat-mode-menu-item.selected:hover,.chat-mode-menu-item.menu-arrow-hl,.chat-mode-menu-item.menu-arrow-hl.selected,.presets-dropdown-item.selected,.presets-dropdown-item.selected:hover,.active-mode-chip,.active-mode-chip:hover,.attach-dropdown-toggle.active,.attach-dropdown-toggle.active:hover,.attach-dropdown-toggle.active.plus-menu-hl{background:color-mix(in srgb,var(--text) 16%,transparent)!important;color:var(--text)!important;border-color:color-mix(in srgb,var(--text) 14%,transparent)!important}
.presets-dropdown-item.selected svg,.attach-dropdown-toggle.active svg,.active-mode-chip svg{color:var(--text)!important}
.pro-badge,.beta-badge,.model-page-pro-badge,.sources-badge,.thinking-badge{background:color-mix(in srgb,var(--text) 14%,transparent)!important;color:var(--text)!important;border-color:color-mix(in srgb,var(--text) 14%,transparent)!important}
[role="switch"][aria-checked="true"] .attach-dropdown-switch,.oc-toggle input[type="checkbox"]:checked + .oc-toggle-slider{background:var(--text)!important}
[role="switch"][aria-checked="true"] .attach-dropdown-switch::after{background:var(--bg)!important}
#deepaiProgressBar{background:var(--text)!important}
.results-tab.active{background:color-mix(in srgb,var(--text) 16%,transparent)!important;color:var(--text)!important;border-color:var(--text)!important}
.cmd-palette-match,.cmd-palette-current-dot{color:var(--text)!important;background-color:transparent!important}
.chatEditSubmitButton{background:var(--text)!important;color:var(--bg)!important;border-color:var(--text)!important}
.optionsBox button:focus-visible,.chatoptionsBox button:focus-visible{outline:1px solid var(--text)!important;box-shadow:none!important}
#upload-successful{background:var(--card)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important}
:root{--purple:var(--text);--pink:var(--text)}
.more-models-btn,.model-menu-divider,.pin-model-btn{display:none!important}
#chatModeMenu{max-height:60vh!important;overflow-y:auto!important}
.ai-disclaimer{display:none!important}
.chat-main.has-messages{padding-top:56px!important}
#recordButton{background:var(--card)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;color:var(--text)!important;box-shadow:none!important;transition:width .3s ease,color .25s ease,background-color .25s ease,border-color .25s ease!important}
#recordButton:hover{background:var(--text)!important;color:var(--bg)!important;border-color:var(--text)!important}
#recordButton:hover img{filter:invert(1)!important}
#recordButton.recording,#recordButton.recording:hover{color:#ee7a7a!important}
#recordButton.recording{border-color:rgba(238,122,122,.4)!important}
#recordButton.recording:hover{background:var(--card)!important;border-color:#ee7a7a!important}
#errorpopup,#summarypopup,#copypopup,#successpopup,#upload-successful,#upload-unsuccessful,#upload-too-many,#big-file-type,#bad-file-type{background:var(--card)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;color:var(--text)!important;box-shadow:none!important;backdrop-filter:none!important}
#errorpopup,#upload-unsuccessful,#upload-too-many,#big-file-type,#bad-file-type{color:#ee7a7a!important;border-color:rgba(238,122,122,.4)!important}
.sidebar-toggle::before,.new-chat-button::before{content:none!important;display:none!important;background:none!important}
.chat-layout-container .sidebar-toggle,.chat-layout-container .new-chat-button{width:40px!important;height:40px!important;filter:none!important}
.chat-layout-container .sidebar-toggle:hover,.chat-layout-container .new-chat-button:hover{background:var(--text)!important}
.chat-layout-container:has(.has-messages) .sidebar-toggle,.chat-layout-container:has(.has-messages) .new-chat-button{background:var(--card)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important}
.chat-layout-container:has(.has-messages) .sidebar-toggle:hover,.chat-layout-container:has(.has-messages) .new-chat-button:hover{background:var(--text)!important;border-color:var(--text)!important}
#sidebarOverlay{display:none!important}
.chat-sidebar{display:flex!important;background:color-mix(in srgb,var(--bg) 50%,transparent)!important;backdrop-filter:blur(8px)}
.chat-layout-container.sidebar-open .chat-sidebar{transform:none!important}
.chat-layout-container:not(.sidebar-open) .chat-sidebar{transform:translateX(calc(-100% - 24px))!important;pointer-events:none!important}
@media(max-width:899px){.chat-layout-container.sidebar-open .chat-sidebar{background:var(--card)!important;z-index:8!important;box-shadow:0 0 40px color-mix(in srgb,var(--bg) 55%,transparent)!important}}
.sidebar-footer,.sidebar-top-bar{background:transparent!important}
.chat-layout-container .chat-main.has-messages{padding-top:56px!important}
.chat-layout-container .chat-main{margin-left:284px!important;margin-top:0!important;margin-bottom:0!important;background:transparent!important}
.chat-main:not(.has-messages){height:100dvh!important}
.chat-main:not(.has-messages) .persistent-compose-area{position:fixed!important;bottom:10px!important;top:auto!important;left:var(--k-left,0px)!important;right:0!important;margin:0 auto!important;width:min(862px,calc(100vw - var(--k-left,0px) - 24px))!important;max-width:none!important;box-sizing:border-box!important;order:0!important}
.chat-main:not(.has-messages) .ai-disclaimer{margin-bottom:68px!important}
.chat-main:not(.has-messages) .attach-dropdown-menu{bottom:calc(100% + 8px)!important;top:auto!important;max-height:calc(75dvh - 170px)!important}
.chat-main:not(.has-messages) .presets-dropdown-menu{bottom:calc(100% + 8px)!important;top:auto!important;transform:translateX(-50%)!important}
.chat-main:not(.has-messages) .chat-mode-dropdown-menu{bottom:calc(100% + 5px)!important;top:auto!important}
.chat-main:not(.has-messages) .dropdown-caret{transform:translateY(-50%) rotate(180deg)!important}
.chat-main:not(.has-messages) .chat-mode-dropdown-trigger.open .dropdown-caret{transform:translateY(-50%) rotate(0deg)!important}
.chat-main,.chat-layout-container,#layoutContainer,#convo,.outputBox{background:transparent!important}
.new-chat-button-container{left:auto!important;right:12px!important}
@media(max-width:720px){.chat-sidebar{width:170px!important}.chat-layout-container .chat-main{margin-left:182px!important}}
.modal-root{background-color:color-mix(in srgb,var(--bg) 60%,transparent)!important}
.modal{background:var(--nav)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;box-shadow:none!important}
.confirm-desc{color:color-mix(in srgb,var(--text) 60%,transparent)!important}
.confirm-input{background:var(--card)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;color:var(--text)!important}
.confirm-input:focus{border-color:var(--text)!important;outline:none!important}
.confirm-button,#confirm-yes-btn,#confirm-cancel-btn{background:var(--card)!important;background-color:var(--card)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;color:var(--text)!important;transition:border-color .25s ease,background-color .25s ease,color .25s ease!important}
.confirm-button:hover:not(:disabled),#confirm-yes-btn:hover:not(:disabled),#confirm-cancel-btn:hover:not(:disabled){background:var(--text)!important;background-color:var(--text)!important;color:var(--bg)!important;border-color:var(--text)!important}
.history-delete-btn{color:var(--text)!important}
.history-delete-btn:hover,.history-delete-btn.ctx-hl{background:var(--text)!important;color:var(--bg)!important}
.chat-history-item.current-chat,.chat-history-item.current-chat.menu-open,.chat-history-item.current-chat.rename-open,.chat-history-item.current-chat:hover{background:var(--text)!important;background-color:var(--text)!important;color:var(--bg)!important;border-color:var(--text)!important}
.chat-history-item.current-chat *{color:var(--bg)!important}
.chat-history-item.current-chat svg [stroke="white"]{stroke:var(--bg)!important}
.chat-history-item.current-chat svg [fill="white"]{fill:var(--bg)!important}
#chatHistoryList>*:has(.current-chat){opacity:1!important}
[data-tooltip]::after,[data-hint]::after,.keybind-tooltip{background:var(--nav)!important;background-color:var(--nav)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;color:var(--text)!important;box-shadow:none!important}
.keybind-tooltip-label{color:var(--text)!important}
.keybind-tooltip-key{color:color-mix(in srgb,var(--text) 50%,transparent)!important}
.chat-history-context-menu,.chat-move-submenu{background:var(--nav)!important;background-color:var(--nav)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;box-shadow:none!important}
.chat-history-context-menu button,.chat-move-submenu button{background:transparent!important;color:var(--text)!important;transition:background-color .25s ease,color .25s ease!important}
.chat-history-context-menu button:hover,.chat-history-context-menu button.ctx-hl,.chat-move-submenu button:hover,.chat-move-submenu button.ctx-hl{background:var(--text)!important;background-color:var(--text)!important;color:var(--bg)!important}
html .chat-sidebar{width:clamp(150px,30vw,260px)!important;max-width:calc(100vw - 24px)!important}
html .chat-layout-container .chat-main,html .chat-layout-container.sidebar-open .chat-main{margin-left:var(--k-left,284px)!important;width:calc(100% - var(--k-left,284px))!important;max-width:calc(100% - var(--k-left,284px))!important;min-width:0!important;box-sizing:border-box!important;overflow-x:clip!important}
.chat-main *{min-width:0}
#convo,.outputBox,.chatbox-wrapper{max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
.outputBox,.outputBox *,.chatbox-wrapper .chatbox,.chatbox-wrapper .chatbox *{overflow-wrap:anywhere;word-break:break-word}
.chatbox-wrapper .chatbox{max-width:100%!important;box-sizing:border-box!important}
.outputBox img,.outputBox video,.outputBox canvas,.outputBox svg:not(.k-arrow):not(.k-hand),.chatbox-wrapper img{max-width:100%!important;height:auto}
.outputBox pre,.outputBox .code-block-wrapper,.outputBox table{max-width:100%!important;overflow-x:auto!important}
.outputBox pre{white-space:pre-wrap!important;word-break:normal;overflow-wrap:anywhere}
.persistent-compose-area{max-width:100%!important;box-sizing:border-box!important}
.k-fit{left:var(--k-left,0px)!important;right:0!important;margin-left:auto!important;margin-right:auto!important;transform:none!important;width:min(var(--k-cw,720px),calc(100vw - var(--k-left,0px) - 24px))!important;box-sizing:border-box!important}
.k-screenshare-btn{display:inline-flex!important;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 14px;margin:0 6px;flex:0 0 auto;background:var(--card)!important;border:1px solid color-mix(in srgb,var(--text) 14%,transparent)!important;color:var(--text)!important;font:inherit;font-size:.85rem;cursor:pointer;white-space:nowrap;transition:background-color .25s ease,color .25s ease,border-color .25s ease}
.k-screenshare-btn svg{width:18px;height:18px;flex:0 0 auto}
.k-screenshare-btn:hover:not(:disabled),.k-screenshare-btn:focus-visible{background:var(--text)!important;color:var(--bg)!important;border-color:var(--text)!important}
.k-screenshare-btn:disabled{opacity:.6;cursor:default}
@media(max-width:560px){.k-screenshare-btn span{display:none}.k-screenshare-btn{padding:0 10px}}
`;

function themeSync() {
  function s() {
    try {
      var cs = window.parent.getComputedStyle(window.parent.document.documentElement), d = document.documentElement.style;
      ["--bg", "--text", "--card", "--nav"].forEach(function (k) {
        var v = (cs.getPropertyValue(k) || "").trim();
        if (v) d.setProperty(k, v); else d.removeProperty(k);
      });
    } catch (e) {}
  }
  s();
  window.addEventListener("message", function (e) { if (e.data === "theme-updated") s(); });
  var PH = "Message SingularityAI", busy = false;
  function fixPh() {
    if (busy) return;
    busy = true;
    try {
      var tb = document.getElementById("persistentChatbox");
      if (tb && tb.getAttribute("placeholder") !== PH) tb.setAttribute("placeholder", PH);
    } catch (e) {}
    busy = false;
  }
  function armPh() {
    if (!document.body) return setTimeout(armPh, 30);
    new MutationObserver(fixPh).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["placeholder"] });
    fixPh();
  }
  armPh();
}

function layoutFit() {
  var root = document.documentElement, raf = 0, cw = 0, lastTarget = null, mo = null;
  function target() {
    var c = document.querySelector(".persistent-compose-area");
    for (var n = c; n && n !== document.body && n !== root; n = n.parentElement) {
      try { if (getComputedStyle(n).position === "fixed") return n; } catch (e) {}
    }
    return null;
  }
  function fit() {
    raf = 0;
    var sb = document.querySelector(".chat-sidebar"), lc = document.querySelector(".chat-layout-container"), left = 0;
    try {
      if (sb && lc && lc.classList.contains("sidebar-open") && window.innerWidth >= 900) {
        left = Math.min(Math.max(0, Math.round(sb.offsetLeft + sb.offsetWidth + 12)), Math.round(window.innerWidth * 0.6));
      }
    } catch (e) {}
    root.style.setProperty("--k-left", left + "px");
    var t = target();
    if (lastTarget && lastTarget !== t) lastTarget.classList.remove("k-fit");
    lastTarget = t;
    if (!t) { if (mo) mo.takeRecords(); return; }
    t.classList.remove("k-fit");
    var w = t.getBoundingClientRect().width;
    if (w > cw) { cw = w; root.style.setProperty("--k-cw", Math.round(cw) + "px"); }
    t.classList.add("k-fit");
    if (mo) mo.takeRecords();
  }
  var fitTimer = 0;
  function queue() { if (fitTimer || document.hidden) return; fitTimer = setTimeout(function () { fitTimer = 0; raf = requestAnimationFrame(fit); }, 200); }
  var AD_SEL = 'ins.adsbygoogle,[id^="google_ads"],[id^="aswift"],[id^="div-gpt-ad"],[data-ad-slot],[data-ad-client],[id*="koah" i],[class*="koah" i],[id*="zeroclick" i],[class*="zeroclick" i],iframe[src*="doubleclick"],iframe[src*="googlesyndication"],iframe[src*="adservice"],iframe[src*="taboola"],iframe[src*="outbrain"]';
  function sweepAds() {
    try { document.querySelectorAll(AD_SEL).forEach(function (n) { n.remove(); }); } catch (e) {}
  }
  setInterval(function () { if (!document.hidden) sweepAds(); }, 4000);
  function relevant(recs) {
    var c = document.querySelector(".persistent-compose-area");
    for (var i = 0; i < recs.length; i++) {
      var n = recs[i].target;
      if (!n || n.nodeType !== 1) continue;
      if (n === document.body || n.matches(".chat-sidebar,.chat-layout-container,.persistent-compose-area") || (c && n.contains(c))) return true;
    }
    return false;
  }
  window.addEventListener("resize", queue);
  window.addEventListener("load", queue);
  root.style.setProperty("--k-left", (window.innerWidth >= 900 ? Math.round(Math.min(260, Math.max(150, window.innerWidth * 0.3))) + 24 : 0) + "px");
  document.addEventListener("pointerdown", function (e) {
    try {
      if (window.innerWidth >= 900) return;
      var lc = document.querySelector(".chat-layout-container");
      if (!lc || !lc.classList.contains("sidebar-open")) return;
      if (e.target.closest && e.target.closest(".chat-sidebar,.sidebar-toggle-container,[class*='modal']")) return;
      var b = document.getElementById("sidebarCloseBtn");
      if (b) b.click();
    } catch (err) {}
  }, true);
  function arm() {
    if (!document.body) return setTimeout(arm, 30);
    mo = new MutationObserver(function (recs) { if (relevant(recs)) queue(); });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    var sb = document.querySelector(".chat-sidebar");
    if (sb && window.ResizeObserver) new ResizeObserver(queue).observe(sb);
    queue();
    setTimeout(queue, 500);
    setTimeout(queue, 1500);
  }
  arm();
}

function screenshareBoot() {
  var LABEL = "Screenshare", busy = false, btn = null;
  var stream = null, track = null, pip = null, sharing = false, ui = null, watch = null;
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"></rect><path d="M8 21h8M12 17v4"></path><path d="M12 13V8M9.5 10.5 12 8l2.5 2.5"></path></svg>';
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function setLabel(t) { if (btn) { var sp = btn.querySelector("span"); if (sp) sp.textContent = t; btn.title = t; } }
  function live() { return !!(stream && track && track.readyState === "live"); }
  function base() { return live() ? "Share" : LABEL; }
  function status(t) { if (ui && ui.st) ui.st.textContent = t; }

  // ---- screen capture -------------------------------------------------------
  async function ensureStream(wins) {
    if (live()) return stream;
    var lastErr = null;
    for (var i = 0; i < wins.length; i++) {
      var md = null;
      try { md = wins[i] && wins[i].navigator && wins[i].navigator.mediaDevices; } catch (e) {}
      if (!md || !md.getDisplayMedia) continue;
      try {
        var s = await md.getDisplayMedia({ video: true, audio: false });
        var t = s.getVideoTracks()[0];
        stream = s; track = t;
        t.addEventListener("ended", function () { if (track === t) { stream = null; track = null; status("Screen sharing ended"); if (!busy) setLabel(base()); } });
        return s;
      } catch (e) {
        lastErr = e;
        if (e && /gesture|activation|policy|disallowed/i.test(String(e.message || ""))) continue;
        throw e;
      }
    }
    if (lastErr) throw lastErr;
    var u = new Error("Screen sharing is not supported here"); u.name = "NotSupportedError"; throw u;
  }
  function stopStream() {
    try { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
    stream = null; track = null;
  }
  async function frameFile() {
    var src = null, w = 0, h = 0, vid = null;
    try {
      if (window.ImageCapture && track) { src = await new ImageCapture(track).grabFrame(); w = src.width; h = src.height; }
    } catch (e) { src = null; }
    if (!src) {
      vid = document.createElement("video");
      vid.muted = true; vid.playsInline = true; vid.srcObject = stream;
      await vid.play();
      await new Promise(function (r) {
        var done = false, fin = function () { if (!done) { done = true; r(); } };
        if (vid.requestVideoFrameCallback) vid.requestVideoFrameCallback(function () { setTimeout(fin, 120); });
        setTimeout(fin, 900);
      });
      src = vid; w = vid.videoWidth; h = vid.videoHeight;
    }
    try {
      if (!w || !h) throw new Error("No video frame");
      var k = Math.min(1, 2560 / Math.max(w, h)), cw = Math.round(w * k), ch = Math.round(h * k);
      var c = document.createElement("canvas");
      c.width = cw; c.height = ch;
      c.getContext("2d").drawImage(src, 0, 0, cw, ch);
      var blob = await new Promise(function (r) { c.toBlob(r, "image/png"); }), name = "screenshot.png";
      if (!blob || blob.size > 15 * 1024 * 1024) {
        blob = await new Promise(function (r) { c.toBlob(r, "image/jpeg", 0.85); });
        name = "screenshot.jpg";
      }
      if (!blob) throw new Error("Capture failed");
      return new File([blob], name, { type: blob.type, lastModified: Date.now() });
    } finally {
      if (vid) { try { vid.srcObject = null; } catch (e) {} }
      if (src && src.close) { try { src.close(); } catch (e) {} }
    }
  }

  // ---- attach + send through the chat page's own controls ------------------
  function composeArea() { return document.querySelector(".persistent-compose-area") || document.body; }
  function snapshot() {
    var a = composeArea(), up = document.getElementById("upload-successful"), shown = 0;
    try { if (up) { var cs = getComputedStyle(up); shown = cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity || "1") > 0.05 ? 1 : 0; } } catch (e) {}
    return a.querySelectorAll("img,canvas,[class*='attach'],[class*='preview'],[class*='thumb'],[class*='upload']").length + ":" + a.innerHTML.length + ":" + shown;
  }
  function findInput() {
    var list = [].slice.call(document.querySelectorAll("input[type=file]"));
    for (var i = 0; i < list.length; i++) {
      var acc = list[i].getAttribute("accept") || "";
      if (!acc || /image|\*|png|jpe?g/i.test(acc)) return list[i];
    }
    return list[0] || null;
  }
  async function waitChange(before, ms) {
    var end = Date.now() + ms;
    while (Date.now() < end) { await sleep(150); if (snapshot() !== before) return true; }
    return false;
  }
  async function attach(file) {
    var dt = new DataTransfer(); dt.items.add(file);
    var before = snapshot(), inp = findInput(), plus = document.querySelector(".compose-plus-btn"), opened = false;
    if (!inp && plus) { plus.click(); opened = true; await sleep(200); inp = findInput(); }
    if (inp) {
      try {
        inp.files = dt.files;
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        inp.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (e) {}
    }
    if (opened && plus && plus.classList.contains("open")) plus.click();
    if (inp && await waitChange(before, 3000)) return true;
    var tb = document.getElementById("persistentChatbox") || composeArea();
    try {
      tb.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
      if (await waitChange(before, 2500)) return true;
    } catch (e) {}
    try {
      var area = composeArea();
      ["dragenter", "dragover", "drop"].forEach(function (t) { area.dispatchEvent(new DragEvent(t, { dataTransfer: dt, bubbles: true, cancelable: true })); });
      if (await waitChange(before, 2500)) return true;
    } catch (e) {}
    return false;
  }
  function setText(tb, text) {
    tb.focus();
    if (tb.tagName === "TEXTAREA" || tb.tagName === "INPUT") {
      var proto = tb.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(tb, text);
    } else {
      tb.textContent = text;
    }
    tb.dispatchEvent(new Event("input", { bubbles: true }));
  }
  async function waitUploaded() {
    var end = Date.now() + 20000, t0 = Date.now(), last = snapshot(), since = Date.now();
    while (Date.now() < end) {
      await sleep(200);
      var cur = snapshot();
      if (cur !== last) { last = cur; since = Date.now(); }
      if (Date.now() - t0 > 400 && cur.charAt(cur.length - 1) === "1") return;
      if (Date.now() - since > 1500) return;
    }
  }
  async function send() {
    var tb = document.getElementById("persistentChatbox");
    if (!tb) throw new Error("Chat box not found");
    function val() { return String(tb.value !== undefined ? tb.value : tb.textContent || ""); }
    var base0 = lastReply();
    setText(tb, "Solve");
    await sleep(150);
    for (var i = 0; i < 20; i++) {
      var cur = lastReply();
      if (cur.n > base0.n || !val().trim()) return;
      var sub = document.getElementById("chatSubmitButton");
      if (sub && !sub.disabled) sub.click();
      else {
        tb.focus();
        ["keydown", "keypress", "keyup"].forEach(function (t) {
          tb.dispatchEvent(new KeyboardEvent(t, { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true }));
        });
      }
      await sleep(500);
    }
  }

  // ---- latest AI response, mirrored into the PiP ---------------------------
  function lastReply() {
    var boxes = document.querySelectorAll(".outputBox");
    if (boxes.length) return { n: boxes.length, text: (boxes[boxes.length - 1].innerText || boxes[boxes.length - 1].textContent || "").trim() };
    var cv = document.getElementById("convo"), el = cv && cv.lastElementChild;
    if (el && !el.querySelector(".chatbox")) return { n: cv.children.length, text: (el.innerText || el.textContent || "").trim() };
    return { n: 0, text: "" };
  }
  function startWatch() {
    stopWatch();
    var base = lastReply(), changedAt = 0, last = "", timer = 0;
    watch = { mo: null, iv: 0 };
    function tick() {
      if (!ui || !pip || pip.closed) return;
      var cur = lastReply(), fresh = cur.n > base.n || (cur.text && cur.text !== base.text);
      if (!fresh) return;
      if (cur.text !== last) {
        last = cur.text; changedAt = Date.now();
        ui.out.textContent = cur.text;
        ui.out.scrollTop = ui.out.scrollHeight;
      }
    }
    function sched() { if (!timer) timer = setTimeout(function () { timer = 0; tick(); }, 120); }
    watch.mo = new MutationObserver(sched);
    watch.mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    watch.iv = setInterval(function () {
      tick();
      if (!ui || sharing) return;
      if (!changedAt) status("Thinking…");
      else status(Date.now() - changedAt < 2000 ? "Answering…" : "Done");
    }, 400);
  }
  function stopWatch() {
    if (watch) { try { watch.mo.disconnect(); } catch (e) {} clearInterval(watch.iv); watch = null; }
  }

  // ---- Picture-in-Picture window -------------------------------------------
  function pipApi() {
    var cands = [window, window.parent, window.top];
    for (var i = 0; i < cands.length; i++) {
      try { if (cands[i] && cands[i].documentPictureInPicture) return cands[i].documentPictureInPicture; } catch (e) {}
    }
    return null;
  }
  function themeVar(n, d) {
    try { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || d; } catch (e) { return d; }
  }
  function buildPip(win) {
    var d = win.document;
    var css = d.createElement("style");
    css.textContent =
      ":root{--bg:" + themeVar("--bg", "#000") + ";--text:" + themeVar("--text", "#fff") + ";--card:" + themeVar("--card", "#141414") + "}" +
      "*{box-sizing:border-box}html,body{height:100%}" +
      "body{margin:0;display:flex;flex-direction:column;background:var(--bg);color:var(--text);font:700 13px/1.5 Comfortaa,system-ui,sans-serif}" +
      ".bar{display:flex;align-items:center;gap:8px;padding:10px;border-bottom:1px solid color-mix(in srgb,var(--text) 16%,transparent)}" +
      "button{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 14px;font:inherit;cursor:pointer;color:var(--text);background:var(--card);border:1px solid color-mix(in srgb,var(--text) 16%,transparent);transition:background-color .2s,color .2s}" +
      "button svg{width:16px;height:16px}button:hover:not(:disabled){background:var(--text);color:var(--bg)}button:disabled{opacity:.55;cursor:default}" +
      "#share{background:var(--text);color:var(--bg)}#share:hover:not(:disabled){opacity:.85;background:var(--text)}" +
      "#st{margin-left:auto;opacity:.65;font-size:12px;text-align:right}" +
      "#out{flex:1;overflow:auto;padding:12px;white-space:pre-wrap;overflow-wrap:anywhere;font-weight:600}" +
      "#out.hint{opacity:.55}";
    d.head.appendChild(css);
    var link = d.createElement("link");
    link.rel = "stylesheet"; link.href = "https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap";
    d.head.appendChild(link);
    d.title = "Screenshare";
    var bar = d.createElement("div"); bar.className = "bar";
    var share = d.createElement("button"); share.id = "share"; share.type = "button"; share.innerHTML = ICON + "<span>Share</span>";
    var stop = d.createElement("button"); stop.id = "stop"; stop.type = "button"; stop.textContent = "Stop";
    var st = d.createElement("span"); st.id = "st"; st.textContent = "Ready";
    bar.appendChild(share); bar.appendChild(stop); bar.appendChild(st);
    var out = d.createElement("div"); out.id = "out"; out.className = "hint";
    out.textContent = "Press Share to send your screen. The answer shows up here.";
    d.body.appendChild(bar); d.body.appendChild(out);
    return { win: win, share: share, stop: stop, st: st, out: out };
  }
  async function pipShare() {
    if (sharing || !ui) return;
    sharing = true; ui.share.disabled = true;
    try {
      if (!live()) { status("Pick a screen…"); await ensureStream([pip, window]); }
      status("Capturing…");
      var file = await frameFile();
      status("Attaching…");
      if (!(await attach(file))) { status("Attach failed"); return; }
      status("Uploading…");
      await waitUploaded();
      ui.out.className = ""; ui.out.textContent = "";
      startWatch();
      status("Sending…");
      await send();
      status("Thinking…");
    } catch (e) {
      try { console.error("screenshare", e); } catch (x) {}
      var n = e && e.name;
      status(n === "AbortError" || n === "NotAllowedError" ? "Cancelled" : n === "NotSupportedError" ? "Not supported" : "Failed");
    } finally {
      sharing = false;
      if (ui) ui.share.disabled = false;
    }
  }
  function closePip() {
    stopWatch(); stopStream();
    var p = pip; pip = null; ui = null;
    try { if (p && !p.closed) p.close(); } catch (e) {}
  }
  async function openPip(api) {
    var win = await api.requestWindow({ width: 400, height: 560 });
    pip = win; ui = buildPip(win);
    ui.share.addEventListener("click", pipShare);
    ui.stop.addEventListener("click", function () { stopStream(); status("Screen sharing stopped"); });
    win.addEventListener("pagehide", function () { if (pip === win) { stopWatch(); stopStream(); pip = null; ui = null; } });
    win.addEventListener("message", function (e) { if (e.data === "theme-updated") { /* theme is applied on open */ } });
  }

  // ---- fallback when Picture-in-Picture isn't available --------------------
  async function runDirect() {
    if (busy) return;
    busy = true; btn.disabled = true; setLabel("Sharing…");
    var msg = "";
    try {
      try { await ensureStream([window]); } catch (e) { if (e && (e.name === "NotAllowedError" || e.name === "AbortError")) return; throw e; }
      setLabel("Capturing…");
      var file = await frameFile();
      setLabel("Attaching…");
      if (!(await attach(file))) { msg = "Attach failed"; return; }
      setLabel("Uploading…");
      await waitUploaded();
      if (ui && pip && !pip.closed) { ui.out.className = ""; ui.out.textContent = ""; startWatch(); }
      setLabel("Sending…");
      await send();
    } catch (e) {
      try { console.error("screenshare", e); } catch (x) {}
      msg = (e && e.name === "NotSupportedError") ? "Not supported" : "Failed";
    } finally {
      busy = false; btn.disabled = false;
      setLabel(msg || base());
      if (msg) setTimeout(function () { if (!busy) setLabel(base()); }, 2500);
    }
  }
  async function onClick(e) {
    if (busy) return;
    var api = pipApi();
    if (e && e.shiftKey && api && !(pip && !pip.closed)) {
      try { await openPip(api); } catch (x) { try { console.error("screenshare pip", x); } catch (y) {} }
      return;
    }
    return runDirect();
  }

  // ---- the bar button ------------------------------------------------------
  function place() {
    var plus = document.querySelector(".compose-plus-btn");
    var sub = document.getElementById("chatSubmitButton");
    var tbx = document.getElementById("persistentChatbox");
    var area = document.querySelector(".persistent-compose-area") || (tbx && tbx.parentElement) || (sub && sub.parentElement);
    if (!plus && !area) return;
    if (btn && document.contains(btn) && (plus ? btn.previousElementSibling === plus : btn.parentElement === area || (sub && btn.nextElementSibling === sub))) return;
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "k-screenshare-btn";
      btn.innerHTML = ICON + "<span>" + LABEL + "</span>";
      btn.title = LABEL;
      btn.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); onClick(e); });
    }
    if (plus && plus.parentNode) plus.parentNode.insertBefore(btn, plus.nextSibling);
    else if (sub && sub.parentNode) sub.parentNode.insertBefore(btn, sub);
    else area.appendChild(btn);
  }
  var raf = 0;
  function queue() { if (raf || document.hidden) return; raf = setTimeout(function () { raf = 0; place(); }, 250); }
  function arm() {
    if (!document.body) return setTimeout(arm, 30);
    new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
    queue();
    setTimeout(queue, 600);
    setTimeout(queue, 2000);
  }
  window.addEventListener("pagehide", closePip);
  arm();
}

function shim() {
  const SITE = "https://deepai.org";
  const own = (u) => {
    try { return /(^|\.)deepai\.org$/i.test(new URL(u, SITE + "/").hostname); } catch { return false; }
  };
  const aborted = () => new DOMException("The operation was aborted.", "AbortError");
  const reads = /^(GET|HEAD)$/;
  window.__pxShim = true;

  const SG_CONTEXT = "You are SingularityAI, the AI assistant built into Singularity, a web portal with games, movies and TV, music, apps and tools. The site you are running on is Singularity, not DeepAI, so never say you are on DeepAI or mention DeepAI. Whenever the user greets you or opens the conversation with a hello, welcome them to Singularity.";
  const sgName = () => {
    const wins = [window];
    try { wins.push(parent); } catch (e) {}
    for (const w of wins) {
      try {
        const saved = JSON.parse(w.localStorage.getItem("kstuff_user"));
        const name = String((saved && saved.username) || "").replace(/[^\w .-]/g, "").trim().slice(0, 40);
        if (name) return name;
      } catch (e) {}
    }
    return "";
  };
  const withSingularity = (form) => {
    try {
      const raw = form.get("chatHistory");
      if (typeof raw !== "string") return form;
      const history = JSON.parse(raw);
      if (!Array.isArray(history)) return form;
      const first = history.findIndex((m) => m && m.role === "user" && typeof m.content === "string");
      if (first < 0) return form;
      const name = sgName();
      const note = "\n\n(Background note for you only, never mention it or reply to it: " + SG_CONTEXT + (name ? " The user's name on Singularity is \"" + name + "\"; use it when it fits naturally." : "") + ")";
      history[first] = Object.assign({}, history[first], { content: history[first].content + note });
      const out = new FormData();
      form.forEach((value, key) => {
        if (key === "chatHistory") out.append(key, JSON.stringify(history));
        else out.append(key, value);
      });
      return out;
    } catch (e) {
      return form;
    }
  };

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
    if (body instanceof FormData && /\/hacking_is_a_serious_crime$/.test(new URL(url).pathname)) body = withSingularity(body);
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
    .replace(/function applyStoredLanguage\(\)\s*\{/, (m) => m + "return false;")
    .split("Message AI Chat").join("Message SingularityAI")
    .split("function getSavedSidebarState(){").join("function getSavedSidebarState(){return null;")
    .split("function toggleSidebar(){").join("function toggleSidebar(){window.__kSbManual=true;")
    .split("function initSidebar(){").join("function initSidebar(){window.__kSbSmall=window.innerWidth<900;")
    .split('window.addEventListener("resize",function(){if(window.innerWidth<1260){setSidebarState(false);return;}').join('window.addEventListener("resize",function(){if(window.innerWidth<900){if(!window.__kSbSmall){window.__kSbSmall=true;setSidebarState(false);}return;}window.__kSbSmall=false;')
    .split("else{setSidebarState(true);}});if(sidebarToggle)").join("else{if(!window.__kSbManual){setSidebarState(true);}}});if(sidebarToggle)")
    .split("window.innerWidth<1260").join("window.innerWidth<900")
    .split("window.innerWidth>=1260").join("window.innerWidth>=900");
  html = html.replace(/<head[^>]*>/i, (h) => h + '<base href="' + SITE + '/"><script>(' + shim.toString() + ")();<\/script><script>(" + cursorBoot.toString() + ")();<\/script><script>(" + themeSync.toString() + ")();<\/script><script>(" + layoutFit.toString() + ")();<\/script><script>(" + screenshareBoot.toString() + ")();<\/script>");
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
        var os = t.objectStore(STORE_NAME);
        os.put(v, DOC_ID);
        var c = os.openCursor();
        c.onsuccess = function () {
          var cur = c.result;
          if (!cur) return;
          if (typeof cur.key === "string" && cur.key.indexOf("chat-") === 0 && cur.key !== DOC_ID) cur.delete();
          cur.continue();
        };
        t.oncomplete = res; t.onerror = res; t.onabort = res;
      });
    } catch (e) {}
  }
  async function idbGetStale() {
    try {
      var db = await idb();
      return await new Promise(function (res) {
        var best = null, c = db.transaction(STORE_NAME).objectStore(STORE_NAME).openCursor();
        c.onsuccess = function () {
          var cur = c.result;
          if (!cur) return res(best);
          var v = cur.value;
          if (typeof cur.key === "string" && cur.key.indexOf("chat-") === 0 && v && v.html && Date.now() - v.at < 14 * 24 * 3600 * 1000 && (!best || v.at > best.at)) best = v;
          cur.continue();
        };
        c.onerror = function () { res(best); };
      });
    } catch (e) { return null; }
  }

  var CODE_VER = (function () {
    var str = RESTYLE + String(shim) + String(buildDocument) + String(themeSync) + String(layoutFit) + String(screenshareBoot) + String(cursorBoot), h = 5381;
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
    var old = await idbGetStale();
    if (old) return { html: old.html, at: 0, stale: true };
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
