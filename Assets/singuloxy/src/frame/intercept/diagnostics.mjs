const reported = new Set();

if (typeof document !== "undefined" && typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => {
    let element = event.target;
    if (!element || element === globalThis || !element.tagName) return;

    let source = "";
    try {
      source = element.currentSrc || element.src || element.href || element.getAttribute("__src") || element.getAttribute("src") || element.getAttribute("href") || "";
    }
    catch {}

    let key = element.tagName + "|" + source;
    if (reported.has(key)) return;
    reported.add(key);

    let html = "";
    try {
      html = element.outerHTML.slice(0, 240);
    }
    catch {}

    console.warn("sandstone: resource failed to load:", element.tagName.toLowerCase(), source, html);
  }, true);
}
