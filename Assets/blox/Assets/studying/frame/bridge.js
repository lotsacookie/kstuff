const READY_MESSAGE = "studying-bridge-ready";
const ERROR_MESSAGE = "studying-bridge-error";
const URL_MESSAGE = "studying-host-url";
const FRAME_LOADED_MESSAGE = "studying-host-frame-loaded";
const META_MESSAGE = "studying-host-meta";
const LOAD_MESSAGE = "studying-load";
const BACK_MESSAGE = "studying-back";
const FORWARD_MESSAGE = "studying-forward";
const RELOAD_MESSAGE = "studying-reload";
const NEW_TAB_MESSAGE = "studying-new-tab";
const DEVTOOLS_MESSAGE = "studying-devtools-message";
const PAGE_DEVTOOLS_MESSAGE = "site-page-devtools-message";
const proxyFrame = document.getElementById("proxy-frame");
const bridgeParams = new URLSearchParams(location.search);
const bridgeMode = bridgeParams.get("mode") || "host";
const bridgeTransport = bridgeParams.get("transport") || undefined;
const previewUrl = bridgeParams.get("url") || "";
let controller;
let studyingFrame;
let lastProxyUrl = "";
let chobitsuSourcePromise;
let devtoolsConnectPromise;
let devtoolsTarget;
function normalizeTargetUrl(value) {
  try {
    const parsedUrl = new URL(String(value || "").trim());
    return ["http:", "https:"].includes(parsedUrl.protocol)
      ? parsedUrl.href
      : "";
  } catch {
    return "";
  }
}
function postToParent(type, extra = {}) {
  if (bridgeMode === "preview" || window.parent === window) return;
  window.parent.postMessage({ type, ...extra }, location.origin);
}
function loadRuntimeScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.head.appendChild(script);
  });
}
async function ensureRuntimeFiles() {
  if (!globalThis.$readings) {
    await loadRuntimeScript(WB_ASSETS + "studying/lesson.js");
  }
  if (!globalThis.$readingsController?.Controller) {
    await loadRuntimeScript(WB_ASSETS + "studying/session.js");
  }
  if (!globalThis.proxyTransport)
    await loadRuntimeScript(WB_ASSETS + "js/proxy-transport.js");
}
function createUrlWatcherPlugin(onUrlChange) {
  const ManagedPlugin = globalThis.$readingsController.ManagedPlugin;
  return new (class extends ManagedPlugin {
    constructor() {
      super("url-watcher", []);
    }
    install(frame) {
      super.install(frame);
      this.tap(frame.hooks.init.post, (event) => {
        if (!event.isTopLevel) return;
        const historyPrototype = event.window.History?.prototype;
        if (
          historyPrototype &&
          !historyPrototype.__siteOptionalUrlFix
        ) {
          for (const methodName of ["pushState", "replaceState"]) {
            const originalMethod = historyPrototype[methodName];
            if (typeof originalMethod !== "function") continue;
            historyPrototype[methodName] = function (state, unused, url) {
              if (url === undefined) {
                return originalMethod.call(
                  this,
                  state,
                  unused,
                  event.client.url.href,
                );
              }
              return originalMethod.call(this, state, unused, url);
            };
          }
          Object.defineProperty(
            historyPrototype,
            "__siteOptionalUrlFix",
            {
              configurable: true,
              value: true,
            },
          );
        }
        const update = () => onUrlChange(event.client.url.href);
        update();
        this.tap(
          event.client.hooks.lifecycle.navigate,
          (_event, navigation) => {
            onUrlChange(navigation.url);
          },
        );
        event.window.addEventListener("hashchange", update, {
          capture: true,
        });
      });
    }
  })();
}
function createResponseHeadersPlugin() {
  const ManagedPlugin = globalThis.$readingsController.ManagedPlugin;
  return new (class extends ManagedPlugin {
    constructor() {
      super("response-headers", []);
    }
    install(frame) {
      super.install(frame);
      this.tap(frame.hooks.fetch.preresponse, (_event, state) => {
        const headers = state.response.rawHeaders;
        const blocked = new Set([
          "content-encoding",
          "content-length",
          "transfer-encoding",
          "content-security-policy",
          "content-security-policy-report-only",
          "x-frame-options",
        ]);
        for (let index = headers.length - 1; index >= 0; index -= 1) {
          if (blocked.has(headers[index][0].toLowerCase()))
            headers.splice(index, 1);
        }
      });
    }
  })();
}
const adblockFallbackHosts = [
  "effectivecpmnetwork.com",
  "highperformanceformat.com",
  "adsterra.com",
  "propellerads.com",
  "propeller-ads.com",
  "popads.net",
  "popcash.net",
  "popmyads.com",
  "exoclick.com",
  "exdynsrv.com",
  "adcash.com",
  "hilltopads.com",
  "hilltopads.net",
  "clickadu.com",
  "onclkds.com",
  "ad-maven.com",
  "juicyads.com",
  "eroadvertising.com",
  "trafficjunky.net",
  "plugrush.com",
  "adnxs.com",
  "doubleclick.net",
  "googlesyndication.com",
  "googleadservices.com",
  "adservice.google.com",
  "pubmatic.com",
  "rubiconproject.com",
  "criteo.com",
  "outbrain.com",
  "taboola.com",
  "revcontent.com",
  "mgid.com",
  "adblade.com",
  "nativo.com",
  "sharethrough.com",
  "triplelift.com",
  "openx.net",
  "indexww.com",
  "casalemedia.com",
  "spotxchange.com",
  "freewheel.tv",
  "moatads.com",
  "adsrvr.org",
  "mathtag.com",
  "bauval.org",
];
const adblockState = { domains: null, scoped: [], exc: [], logged: 0 };
let adblockLoadStarted = false;
function loadAdblockFilters() {
  if (adblockLoadStarted) return;
  adblockLoadStarted = true;
  try {
    fetch(WB_ASSETS + "js/json/ab.json", { cache: "force-cache" })
      .then((res) => {
        if (!res.ok) throw new Error("bad status");
        return res.json();
      })
      .then((data) => {
        if (data && data.v === 1 && Array.isArray(data.domains)) {
          adblockState.domains = new Set(data.domains);
          adblockState.scoped = Array.isArray(data.scoped)
            ? data.scoped
            : [];
          adblockState.exc = Array.isArray(data.exc) ? data.exc : [];
        }
      })
      .catch(() => {});
  } catch {}
}
function adblockPageHost(event) {
  try {
    const u = event && event.client && event.client.url;
    const href = typeof u === "string" ? u : u && u.href;
    if (href) return new URL(href).hostname.toLowerCase();
  } catch {}
  return "";
}
function adblockIsThirdParty(reqHost, pageHost) {
  if (!reqHost || !pageHost || reqHost === pageHost) return false;
  if (
    reqHost.endsWith("." + pageHost) ||
    pageHost.endsWith("." + reqHost)
  )
    return false;
  return true;
}
function adblockBlocked(rawUrl, pageHost) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:")
    return false;
  const host = url.hostname.toLowerCase();
  const hit = (h) => host === h || host.endsWith("." + h);
  const scopeOk = (r, isExc) => {
    if (r.only || r.not) {
      if (!pageHost) return !!isExc;
      const phit = (d) =>
        pageHost === d || pageHost.endsWith("." + d);
      if (r.only && !r.only.some(phit)) return false;
      if (r.not && r.not.some(phit)) return false;
    }
    return true;
  };
  const tpOk = (r) => {
    if (!r.tp && !r.fp) return true;
    if (!pageHost) return false;
    const third = adblockIsThirdParty(host, pageHost);
    if (r.tp && !third) return false;
    if (r.fp && third) return false;
    return true;
  };
  if (adblockState.domains) {
    for (const e of adblockState.exc) {
      if (
        hit(e.h) &&
        (!e.p || url.pathname.startsWith(e.p)) &&
        scopeOk(e, true)
      )
        return false;
    }
  }
  for (const h of adblockFallbackHosts) if (hit(h)) return true;
  if (!adblockState.domains) return false;
  let h = host;
  for (;;) {
    if (adblockState.domains.has(h)) return true;
    const i = h.indexOf(".");
    if (i < 0) break;
    h = h.slice(i + 1);
  }
  for (const r of adblockState.scoped) {
    if (!hit(r.h)) continue;
    if (r.p && !url.pathname.startsWith(r.p)) continue;
    if (!scopeOk(r, false) || !tpOk(r)) continue;
    return true;
  }
  return false;
}
function createAdblockPlugin() {
  const ManagedPlugin = globalThis.$readingsController.ManagedPlugin;
  loadAdblockFilters();
  return new (class extends ManagedPlugin {
    constructor() {
      super("site-adblock", []);
    }
    install(frame) {
      super.install(frame);
      try {
        this.tap(frame.hooks.fetch.request, (event, state) => {
          try {
            const raw =
              state && state.url != null ? String(state.url) : "";
            if (!raw) return;
            const pageHost = adblockPageHost(event);
            const url = new URL(raw);
            const shield = url.hostname === "cdn.jsdelivr.net" && url.pathname.startsWith("/gh/ad-shield/");
            if (shield || adblockBlocked(raw, pageHost)) {
              const script = event.request?.destination === "script" || /\.js$/i.test(url.pathname);
              state.earlyResponse = new Response("", {
                status: 200,
                statusText: "Blocked",
                headers: {
                  "Content-Type": script ? "application/javascript; charset=utf-8" : "text/plain; charset=utf-8",
                },
              });
              if (adblockState.logged < 5) {
                adblockState.logged += 1;
                console.info("[adblock] blocked", raw);
              }
            }
          } catch {}
        });
      } catch {}
      this.tap(frame.hooks.init.post, (event) => {
        try {
          const src =
            `(${proxiedAdblockMain.toString()})(${JSON.stringify(event.client.url.href)});`;
          event.window.eval(src);
        } catch {}
      });
    }
  })();
}
function proxiedAdblockMain(expectedHref) {
  try {
    if (window.__siteAdblock) return;
    const here = String(location.href || "");
    const want = String(expectedHref || "");
    const norm = (u) => u.replace(/\/$/, "");
    if (want && norm(here) !== norm(want)) return;
    window.__siteAdblock = true;
  } catch {
    return;
  }
  const BLOCK_HOSTS = [
    "effectivecpmnetwork.com",
    "highperformanceformat.com",
    "adsterra.com",
    "propellerads.com",
    "propeller-ads.com",
    "popads.net",
    "popcash.net",
    "popmyads.com",
    "exoclick.com",
    "exdynsrv.com",
    "adcash.com",
    "hilltopads.com",
    "hilltopads.net",
    "clickadu.com",
    "onclkds.com",
    "ad-maven.com",
    "juicyads.com",
    "eroadvertising.com",
    "trafficjunky.net",
    "plugrush.com",
    "adnxs.com",
    "doubleclick.net",
    "googlesyndication.com",
    "googleadservices.com",
    "adservice.google.com",
    "pubmatic.com",
    "rubiconproject.com",
    "criteo.com",
    "outbrain.com",
    "taboola.com",
    "revcontent.com",
    "mgid.com",
    "adblade.com",
    "nativo.com",
    "sharethrough.com",
    "triplelift.com",
    "openx.net",
    "indexww.com",
    "casalemedia.com",
    "spotxchange.com",
    "freewheel.tv",
    "moatads.com",
    "adsrvr.org",
    "mathtag.com",
    "bauval.org",
  ];
  const AD_SNIPPET =
    /effectivecpmnetwork|highperformanceformat|adsterra|popads|popcash|popmyads|exoclick|exdynsrv|adcash|hilltopads|clickadu|onclkds|ad-maven|juicyads|propeller|bauval/i;
  let pageHost = "";
  try {
    pageHost = new URL(location.href).hostname.toLowerCase();
  } catch {}
  const strict = false;
  function hostOf(value) {
    try {
      const u = String(value || "").trim();
      if (!u) return "";
      if (/^(data|blob|about|javascript):/i.test(u)) return "";
      return new URL(u, location.href).hostname.toLowerCase();
    } catch {
      return "";
    }
  }
  function blockedHost(h) {
    if (!h) return false;
    for (let i = 0; i < BLOCK_HOSTS.length; i++) {
      const b = BLOCK_HOSTS[i];
      if (h === b || h.endsWith("." + b)) return true;
    }
    return false;
  }
  function blockedUrl(value) {
    return blockedHost(hostOf(value));
  }
  try {
    const rawFetch = window.fetch;
    if (typeof rawFetch === "function") {
      window.fetch = function (input, init) {
        try {
          const u =
            typeof input === "string" ? input : input && input.url;
          if (blockedUrl(u))
            return Promise.resolve(
              new Response("", {
                status: 200,
                statusText: "Blocked",
              }),
            );
        } catch {}
        return rawFetch.apply(this, arguments);
      };
    }
  } catch {}
  try {
    const rawOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      try {
        if (blockedUrl(url)) arguments[1] = "data:text/plain,";
      } catch {}
      return rawOpen.apply(this, arguments);
    };
  } catch {}
  try {
    if (navigator.sendBeacon) {
      const rawBeacon = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = function (url) {
        try {
          if (blockedUrl(url)) return false;
        } catch {}
        return rawBeacon.apply(this, arguments);
      };
    }
  } catch {}
  try {
    const RawWS = window.WebSocket;
    if (typeof RawWS === "function") {
      window.WebSocket = function (url, protocols) {
        if (blockedUrl(url)) throw new Error("blocked");
        return arguments.length > 1
          ? new RawWS(url, protocols)
          : new RawWS(url);
      };
    }
  } catch {}
  try {
    const RawES = window.EventSource;
    if (typeof RawES === "function") {
      window.EventSource = function (url, opts) {
        if (blockedUrl(url)) throw new Error("blocked");
        return arguments.length > 1
          ? new RawES(url, opts)
          : new RawES(url);
      };
    }
  } catch {}
  try {
    const rawWindowOpen = window.open;
    if (typeof rawWindowOpen === "function") {
      window.open = function (url) {
        try {
          if (url == null || url === "") {
            if (strict) return null;
          } else if (blockedUrl(url)) {
            return null;
          }
        } catch {}
        return rawWindowOpen.apply(this, arguments);
      };
    }
  } catch {}
  if (strict) {
    try {
      const rawWrite = document.write.bind(document);
      const rawWriteln = document.writeln.bind(document);
      document.write = function () {
        const s = Array.prototype.join.call(arguments, " ");
        if (AD_SNIPPET.test(s)) return;
        return rawWrite.apply(this, arguments);
      };
      document.writeln = function () {
        const s = Array.prototype.join.call(arguments, " ");
        if (AD_SNIPPET.test(s)) return;
        return rawWriteln.apply(this, arguments);
      };
    } catch {}
  }
  function collapseEmptyOverlays(node) {
    let p = null;
    try {
      p = node.parentElement;
      node.remove();
    } catch {
      return;
    }
    while (p && p !== document.body && p !== document.documentElement) {
      try {
        if (p.childElementCount !== 0) break;
        if ((p.textContent || "").trim() !== "") break;
        let pos = "";
        try {
          pos = getComputedStyle(p).position;
        } catch {}
        if (pos !== "fixed" && pos !== "absolute" && pos !== "sticky")
          break;
        const next = p.parentElement;
        p.remove();
        p = next;
      } catch {
        break;
      }
    }
  }
  function srcOf(el) {
    try {
      return el.src || el.href || el.data || "";
    } catch {
      return "";
    }
  }
  function scrub(root) {
    try {
      const els = root.querySelectorAll
        ? root.querySelectorAll(
            "script[src],iframe[src],img[src],link[href],source[src],embed[src],object[data]",
          )
        : [];
      for (let i = 0; i < els.length; i++) {
        if (blockedUrl(srcOf(els[i]))) collapseEmptyOverlays(els[i]);
      }
    } catch {}
  }
  try {
    if (document.documentElement) scrub(document);
    const obs = new MutationObserver((records) => {
      for (let r = 0; r < records.length; r++) {
        const rec = records[r];
        if (rec.type === "attributes" && rec.target) {
          if (blockedUrl(srcOf(rec.target)))
            collapseEmptyOverlays(rec.target);
          continue;
        }
        const added = rec.addedNodes || [];
        for (let k = 0; k < added.length; k++) {
          const n = added[k];
          if (!n || n.nodeType !== 1) continue;
          if (blockedUrl(srcOf(n))) {
            collapseEmptyOverlays(n);
            continue;
          }
          if (n.querySelectorAll) scrub(n);
        }
      }
    });
    obs.observe(document.documentElement || document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "href", "data"],
    });
  } catch {}
  try {
    const toB64 = (s) => {
      const bytes = new TextEncoder().encode(s);
      let bin = "";
      for (let i = 0; i < bytes.length; i += 8192) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
      }
      return btoa(bin);
    };
    document.addEventListener(
      "copy",
      (ev) => {
        try {
          if (!ev.clipboardData) return;
          const sel = getSelection();
          if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
          const n = sel.anchorNode;
          const el = n && (n.nodeType === 1 ? n : n.parentElement);
          if (
            el &&
            el.closest &&
            el.closest("input,textarea,select,[contenteditable]")
          )
            return;
          const text = sel.toString();
          if (!text || text.length > 100000) return;
          const out = toB64(text);
          if (!out) return;
          ev.clipboardData.setData("text/plain", out);
          ev.preventDefault();
        } catch {}
      },
      true,
    );
  } catch {}
  try {} catch {}
}
function getChobitsuSource() {
  if (!chobitsuSourcePromise) {
    chobitsuSourcePromise = fetch(WB_ASSETS + "studying/chobitsu/chobitsu.js").then(
      (response) => {
        if (!response.ok)
          throw new Error("DevTools runtime failed to load");
        return response.text();
      },
    );
  }
  return chobitsuSourcePromise;
}
async function connectDevtools() {
  const targetWindow = proxyFrame.contentWindow;
  if (devtoolsTarget === targetWindow && targetWindow.chobitsu) return;
  if (!devtoolsConnectPromise) {
    devtoolsConnectPromise = (async () => {
      for (let attempt = 0; attempt < 100; attempt += 1) {
        if (targetWindow.document?.documentElement) break;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (!targetWindow.document?.documentElement) {
        throw new Error("The inspected page is not ready");
      }
      const source = await getChobitsuSource();
      targetWindow.eval(source);
      targetWindow.eval(`
        chobitsu.setOnMessage((message) => {
          parent.postMessage({
            type: "site-page-devtools-message",
            message
          }, "*");
        });
      `);
      devtoolsTarget = targetWindow;
    })().finally(() => {
      devtoolsConnectPromise = null;
    });
  }
  await devtoolsConnectPromise;
}
async function sendDevtoolsMessage(message) {
  try {
    await connectDevtools();
    proxyFrame.contentWindow.chobitsu.sendRawMessage(message);
  } catch (error) {
    postToParent(ERROR_MESSAGE, {
      message: error?.message || "DevTools failed to connect",
    });
  }
}
function updateProxyUrl(url) {
  if (!url || url === lastProxyUrl) return;
  lastProxyUrl = url;
  window.trackProxyNavigation?.();
  postToParent(URL_MESSAGE, { url });
}
function sendFrameMeta() {
  try {
    const frameDocument = proxyFrame.contentDocument;
    if (!frameDocument) return;
    const icon =
      frameDocument.querySelector("link[rel~='icon']")?.href || "";
    postToParent(META_MESSAGE, {
      title: frameDocument.title || lastProxyUrl,
      icon,
    });
  } catch {}
}
function bindFrameShortcuts() {
  try {
    proxyFrame.contentWindow.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        postToParent(NEW_TAB_MESSAGE);
      }
    });
  } catch {}
}
function setupHostBridge() {
  window.addEventListener("message", (event) => {
    if (
      event.source === proxyFrame.contentWindow &&
      event.data?.type === PAGE_DEVTOOLS_MESSAGE
    ) {
      postToParent(DEVTOOLS_MESSAGE, {
        message: event.data.message,
      });
      return;
    }
    if (
      event.origin !== location.origin ||
      event.source !== window.parent
    )
      return;
    switch (event.data?.type) {
      case LOAD_MESSAGE:
        if (event.data.url) {
          const targetUrl = normalizeTargetUrl(event.data.url);
          if (!targetUrl) break;
          lastProxyUrl = targetUrl;
          studyingFrame.go(targetUrl);
        }
        break;
      case BACK_MESSAGE:
        studyingFrame.back();
        break;
      case FORWARD_MESSAGE:
        studyingFrame.forward();
        break;
      case RELOAD_MESSAGE:
        studyingFrame.reload();
        break;
      case DEVTOOLS_MESSAGE:
        sendDevtoolsMessage(event.data.message);
        break;
      default:
        break;
    }
  });
  proxyFrame.addEventListener("load", () => {
    devtoolsConnectPromise = null;
    devtoolsTarget = null;
    bindFrameShortcuts();
    sendFrameMeta();
    postToParent(FRAME_LOADED_MESSAGE);
  });
}
async function initializeBridge() {
  await ensureRuntimeFiles();
  if (
    !globalThis.$readings ||
    !globalThis.$readingsController?.Controller
  ) {
    throw new Error("Studying runtime files failed to load.");
  }
  if (!globalThis.proxyTransport) {
    throw new Error("Studying transport failed to load.");
  }
  const worker = await globalThis.startStudyingWorker();
  const transport =
    await globalThis.proxyTransport.createClient(bridgeTransport, bridgeParams.get("wisp") || undefined);
  const BaseController = globalThis.$readingsController.Controller;
  const Controller = bridgeMode === "webblox-signin"
    ? window.createWebbloxSessionController(BaseController) : BaseController;
  controller = new Controller({
    serviceworker: worker,
    transport,
    config: {
      prefix: WB_ASSETS + "studying/service/",
      readingsPath: WB_ASSETS + "studying/lesson.js",
      injectPath: WB_ASSETS + "studying/page.js",
      wasmPath: WB_ASSETS + "studying/lesson.wasm",
      virtualWasmPath: "lesson-data.js",
    },
  });
  await controller.wait();
  if (bridgeMode === "webblox-signin") {
    window.startWebbloxSignIn({ controller, transport });
  }
  const urlWatcher = createUrlWatcherPlugin(updateProxyUrl);
  const responseHeaders = createResponseHeadersPlugin();
  const adblock = createAdblockPlugin();
  studyingFrame = controller.createFrame(proxyFrame, {
    plugins: [urlWatcher, responseHeaders, adblock],
  });
  if (bridgeMode === "preview") {
    const targetUrl = normalizeTargetUrl(previewUrl);
    if (targetUrl) studyingFrame.go(targetUrl);
  } else {
    setupHostBridge();
    postToParent(READY_MESSAGE);
    if (bridgeMode === "webblox-signin") {
      studyingFrame.go("https://www.roblox.com/login");
    }
  }
}
initializeBridge().catch((error) => {
  console.error("studying bridge init error", error);
  postToParent(ERROR_MESSAGE, {
    message: error instanceof Error ? error.message : String(error),
  });
});
