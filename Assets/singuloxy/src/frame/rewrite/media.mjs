import { quiet_error } from "../../util.mjs";
import { ctx, document_base, convert_url, intercept_property, proxy_function } from "../context.mjs";
import * as network from "../network.mjs";

const PICTURE_IMAGE_TYPES = new Set([
  "image/webp", "image/avif", "image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/apng"
]);

const FETCH_ATTEMPTS = 6;
const MAX_MEDIA_CONCURRENCY = 12;
const IMAGE_CACHE_LIMIT = 200;
const IMAGE_CACHE_MAX_BYTES = 2 * 1024 * 1024;
const LAZY_MARGIN = "800px";

const image_cache = new Map();
let active_media = 0;
const media_queue = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function acquire_media_slot() {
  if (active_media < MAX_MEDIA_CONCURRENCY) {
    active_media++;
    return Promise.resolve();
  }
  return new Promise((resolve) => media_queue.push(resolve));
}

function release_media_slot() {
  let next = media_queue.shift();
  if (next) next();
  else active_media--;
}

async function download_blob(url) {
  let last_error;
  for (let attempt = 0; attempt < FETCH_ATTEMPTS; attempt++) {
    let permanent = false;
    await acquire_media_slot();
    try {
      let response = await network.fetch(url);
      if (response.ok === false) {
        try { await response.body?.cancel(); } catch {}
        permanent = (
          response.status >= 400 && response.status < 500 &&
          response.status !== 408 && response.status !== 429
        );
        throw new Error("status " + response.status);
      }
      return await response.blob();
    }
    catch (e) {
      last_error = e;
    }
    finally {
      release_media_slot();
    }
    if (permanent) break;
    await sleep(Math.min(500 * 2 ** attempt, 6000) + Math.random() * 400);
  }
  throw last_error;
}

function fetch_blob(url, cacheable) {
  if (cacheable && image_cache.has(url)) return image_cache.get(url);

  let task = download_blob(url);

  if (cacheable) {
    image_cache.set(url, task);
    task.then(
      (blob) => { if (blob.size > IMAGE_CACHE_MAX_BYTES) image_cache.delete(url); },
      () => image_cache.delete(url)
    );
    while (image_cache.size > IMAGE_CACHE_LIMIT)
      image_cache.delete(image_cache.keys().next().value);
  }
  return task;
}

function wait_until_near(element) {
  if (!(element instanceof HTMLImageElement)) return Promise.resolve();
  if (element.loading !== "lazy" || !element.isConnected) return Promise.resolve();
  if (typeof IntersectionObserver === "undefined") return Promise.resolve();

  return new Promise((resolve) => {
    let observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        resolve();
      }
    }, {rootMargin: LAZY_MARGIN});
    observer.observe(element);
  });
}

function resolve_http_url(value) {
  if (!value) return null;
  let text = String(value);
  if (/^(data|blob|javascript|about):/i.test(text)) return null;
  try {
    let resolved = convert_url(text, document_base());
    if (/^https?:/i.test(resolved)) return resolved;
  }
  catch {}
  return null;
}

function pick_srcset(srcset) {
  let candidates = [];
  for (let part of srcset.split(",")) {
    let pieces = part.trim().split(/\s+/);
    if (!pieces[0]) continue;
    let descriptor = pieces[1] || "1x";
    let unit = descriptor.slice(-1);
    let weight = parseFloat(descriptor);
    if (!Number.isFinite(weight)) {
      weight = 1;
      unit = "x";
    }
    candidates.push({url: pieces[0], weight: weight, unit: unit});
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.weight - b.weight);
  let limit = candidates[0].unit === "w" ? 1200 : 2;
  let fitting = candidates.filter((candidate) => candidate.weight <= limit);
  let best = fitting.length ? fitting[fitting.length - 1] : candidates[0];
  return best.url;
}

function pick_picture_source(image) {
  let picture = image.parentElement;
  if (!(picture instanceof HTMLPictureElement)) return null;
  for (let source of picture.querySelectorAll("source")) {
    let stored = source.getAttribute("__srcset");
    if (!stored) continue;
    let type = (source.getAttribute("type") || "").trim().toLowerCase();
    if (type && !PICTURE_IMAGE_TYPES.has(type)) continue;
    let media = source.getAttribute("media");
    if (media) {
      try {
        if (!matchMedia(media).matches) continue;
      }
      catch {}
    }
    let best = pick_srcset(stored);
    if (best) return best;
  }
  return null;
}

export function rewrite_media(media_element) {
  if (media_element.__media_hooked__) return;
  media_element.__media_hooked__ = true;

  let raw_set = (name, value) => {
    Reflect.apply(Element.prototype.setAttribute, media_element, [name, value]);
  };

  let media_src = media_element.getAttribute("src") || media_element.src;
  if (!media_src) media_src = media_element.getAttribute("__src") || "";

  if (media_element instanceof HTMLVideoElement) {
    let source = media_element.querySelector("source[src]");
    while (media_element.lastChild !== source)
      media_element.lastChild.remove();
  }

  let is_image = media_element instanceof HTMLImageElement;
  let media_url = "";
  let latest_request = 0;
  let allow_error = false;
  let pending = null;
  let loading_count = 0;

  let fetch_src = async (value) => {
    let request_id = ++latest_request;
    raw_set("__src", value);
    loading_count++;
    try {
      media_url = convert_url(value, document_base());
      await wait_until_near(media_element);
      if (request_id !== latest_request) return;
      let media_blob = await fetch_blob(media_url, is_image);
      if (request_id !== latest_request) return;
      let blob_url = URL.createObjectURL(media_blob);
      media_element.src = blob_url;
    }
    catch (e) {
      quiet_error("sandstone: failed to load media", media_url, e);
      if (request_id !== latest_request) return;
      allow_error = true;
      media_element.dispatchEvent(new Event("error"));
      allow_error = false;
      return;
    }
    finally {
      loading_count--;
    }

    if (media_element instanceof HTMLSourceElement) {
      let parent = media_element.parentNode;
      while (parent && !(parent instanceof HTMLVideoElement))
        parent = parent.parentNode;
      if (!parent)
        return;

      parent.load();
      if (!parent.autoplay) return
      parent.play();
    }
  };

  let src_descriptor = intercept_property(media_element, "src", {
    get() {
      return media_url || src_descriptor.get.call(media_element);
    },
    set(value) {
      if (!resolve_http_url(value))
        src_descriptor.set.call(media_element, value);
      else {
        media_element.removeAttribute("src");
        pending = fetch_src(value);
      }
    }
  });

  if (is_image) {
    let current_src_descriptor = intercept_property(media_element, "currentSrc", {
      configurable: true,
      get() {
        let native = current_src_descriptor.get.call(media_element);
        if (media_url && native.startsWith("blob:")) return media_url;
        return native;
      }
    });

    let complete_descriptor = intercept_property(media_element, "complete", {
      configurable: true,
      get() {
        if (loading_count > 0) return false;
        return complete_descriptor.get.call(media_element);
      }
    });

    proxy_function(media_element, "decode", (target, this_arg, args) => {
      let wait = pending || Promise.resolve();
      return wait.then(() => Reflect.apply(target, this_arg, args));
    });
  }

  let apply_srcset = (value) => {
    value = value === null || value === undefined ? "" : String(value);
    raw_set("__srcset", value);
    raw_set("srcset", "");
    if (is_image && value) {
      let best = pick_srcset(value);
      if (best) media_element.src = best;
    }
  };

  let srcset_descriptor = intercept_property(media_element, "srcset", {
    configurable: true,
    get() {
      return media_element.getAttribute("__srcset") || "";
    },
    set(value) {
      apply_srcset(value);
    }
  });

  media_element.addEventListener("error", (event) =>  {
    if (allow_error) return;
    if (!src_descriptor || src_descriptor.get.call(media_element) === "") {
      event.stopImmediatePropagation();
    }
  }, true);

  proxy_function(media_element, "setAttribute", (target, this_arg, args) => {
    let name = String(args[0]).toLowerCase();
    if (name === "src")  {
      media_element.src = args[1];
      return;
    }
    if (name === "srcset" && srcset_descriptor) {
      media_element.srcset = args[1];
      return;
    }
    return Reflect.apply(target, this_arg, args);
  })

  let srcset = media_element.getAttribute("srcset") || media_element.getAttribute("__srcset");
  if (srcset) {
    raw_set("__srcset", srcset);
    raw_set("srcset", "");
    if (is_image && !media_src) {
      let best = pick_srcset(srcset);
      if (best) media_src = best;
    }
  }

  if (!media_src && is_image) {
    let from_picture = pick_picture_source(media_element);
    if (from_picture) media_src = from_picture;
  }

  if (!media_src || media_src.startsWith("data:") || media_src.startsWith("blob:")) {
    return;
  }
  
  media_element.src = media_src;
  }
