import * as network from "../network.mjs";
import { convert_url } from "../context.mjs";

const url_regex = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s'"]*))\s*\)/gi;

const import_regex = /@import\s+(?:url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s'"]*))\s*\)|"([^"]*)"|'([^']*)')\s*([^;{}]*);?/gi;

const MAX_IMPORT_DEPTH = 5;
const ASSET_TIMEOUT_MS = 20 * 1000;
const ASSET_BUDGET_MS = 6 * 1000;
const MAX_ASSET_FETCHES = 6;
const BODY_TIMEOUT_MS = 60 * 1000;
const ASSET_CACHE_LIMIT = 400;

const asset_cache = new Map();

let active_asset_fetches = 0;
const asset_waiters = [];

function acquire_asset_slot() {
  if (active_asset_fetches < MAX_ASSET_FETCHES) {
    active_asset_fetches++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    asset_waiters.push(resolve);
  });
}

function release_asset_slot() {
  let next = asset_waiters.shift();
  if (next) next();
  else active_asset_fetches--;
}

function should_skip(url) {
  if (!url) return true;
  return /^(data:|blob:|about:|#)/i.test(url);
}

function is_legacy_font(url) {
  return /\.eot(?:[?#]|$)/i.test(url);
}

function safe_absolute(url, base) {
  try {
    return convert_url(url, base);
  }
  catch {
    return url;
  }
}

export function with_deadline(promise, ms) {
  let timer;
  let deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("timed out after " + ms + "ms")), ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

async function cancel_body(response) {
  try {
    await response?.body?.cancel();
  }
  catch {}
}

async function fetch_ok(absolute_url) {
  await acquire_asset_slot();
  let released = false;
  let release = () => {
    if (released) return;
    released = true;
    release_asset_slot();
  };

  let response = null;
  let request = null;
  try {
    request = network.fetch(absolute_url);
    request.then(release, release);
    response = await with_deadline(request, ASSET_TIMEOUT_MS);
    if (response.ok === false) {
      await cancel_body(response);
      return null;
    }
    return response;
  }
  catch (e) {
    console.error("sandstone: css asset fetch failed", absolute_url, e);
    await cancel_body(response);
    return null;
  }
  finally {
    if (!request) release();
  }
}

function load_asset(absolute_url) {
  let fetch_url = absolute_url.split("#")[0];
  let cached = asset_cache.get(fetch_url);
  if (cached) return cached;

  let task = (async () => {
    let response = await fetch_ok(fetch_url);
    if (!response) throw new Error("asset download failed");
    try {
      let blob = await with_deadline(response.blob(), BODY_TIMEOUT_MS);
      return network.create_blob_url(blob, fetch_url);
    }
    catch (e) {
      console.error("sandstone: css asset download failed", fetch_url, e);
      await cancel_body(response);
      throw e;
    }
  })();

  asset_cache.set(fetch_url, task);
  task.catch(() => asset_cache.delete(fetch_url));
  while (asset_cache.size > ASSET_CACHE_LIMIT)
    asset_cache.delete(asset_cache.keys().next().value);
  return task;
}

async function load_asset_retry(absolute_url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await load_asset(absolute_url);
    }
    catch {}
    await new Promise((resolve) => setTimeout(resolve, Math.min(500 * 2 ** attempt, 3000) + Math.random() * 300));
  }
  return absolute_url;
}

export function evict_assets(css_str, css_url) {
  for (let m of css_str.matchAll(url_regex)) {
    let url = (m[1] ?? m[2] ?? m[3] ?? "").trim();
    if (should_skip(url)) continue;
    asset_cache.delete(safe_absolute(url, css_url).split("#")[0]);
  }
}

function load_asset_budgeted(absolute_url) {
  let timer;
  let fallback = new Promise((resolve) => {
    timer = setTimeout(() => resolve(absolute_url), ASSET_BUDGET_MS);
  });
  return Promise.race([
    load_asset(absolute_url).catch(() => absolute_url),
    fallback
  ]).finally(() => clearTimeout(timer));
}

async function inline_imports(css_str, css_url, depth) {
  let matches = [...css_str.matchAll(import_regex)];
  if (!matches.length) return css_str;

  let results = await Promise.all(matches.map(async (m) => {
    let url = (m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5] ?? "").trim();
    if (should_skip(url)) return null;

    let absolute_url = safe_absolute(url, css_url);
    let response = await fetch_ok(absolute_url);
    if (!response) return {blob_url: null, absolute_url: absolute_url};

    try {
      let text = await with_deadline(response.text(), BODY_TIMEOUT_MS);
      let inner = await parse_css(text, response.url || absolute_url, depth + 1);
      let blob = new Blob([inner], {type: "text/css"});
      return {blob_url: network.create_blob_url(blob, absolute_url), absolute_url: absolute_url};
    }
    catch (e) {
      console.error("sandstone: css import failed", absolute_url, e);
      await cancel_body(response);
      return {blob_url: null, absolute_url: absolute_url};
    }
  }));

  let i = 0;
  return css_str.replace(import_regex, (match, ...groups) => {
    let result = results[i++];
    if (!result) return match;
    let tail = (groups[5] || "").trim();
    let target = result.blob_url || result.absolute_url;
    return `@import url("${target}")${tail ? " " + tail : ""};`;
  });
}

async function replace_urls(css_str, css_url, dynamic) {
  let matches = [...css_str.matchAll(url_regex)];
  if (!matches.length) return css_str;

  let requests = new Map();
  for (let m of matches) {
    let url = (m[1] ?? m[2] ?? m[3] ?? "").trim();
    if (should_skip(url) || is_legacy_font(url) || requests.has(url)) continue;

    let absolute_url = safe_absolute(url, css_url);
    requests.set(url, dynamic ? load_asset_retry(absolute_url) : load_asset_budgeted(absolute_url));
  }
  if (!requests.size) return css_str;

  let keys = [...requests.keys()];
  let values = await Promise.all(requests.values());
  let blob_map = new Map(keys.map((key, i) => [key, values[i]]));

  return css_str.replace(url_regex, (match, a, b, c) => {
    let url = (a ?? b ?? c ?? "").trim();
    let replacement = blob_map.get(url);
    return replacement ? `url("${replacement}")` : match;
  });
}

function find_image_sets(css_str) {
  let ranges = [];
  let finder = /(?:-webkit-)?image-set\(/gi;
  let match;
  while ((match = finder.exec(css_str))) {
    let start = match.index + match[0].length;
    let depth = 1;
    let quote = null;
    let i = start;
    for (; i < css_str.length && depth > 0; i++) {
      let ch = css_str[i];
      if (quote) {
        if (ch === "\\") i++;
        else if (ch === quote) quote = null;
      }
      else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === "(") depth++;
      else if (ch === ")") depth--;
    }
    if (depth === 0) {
      ranges.push([start, i - 1]);
      finder.lastIndex = i;
    }
  }
  return ranges;
}

async function replace_image_set_strings(css_str, css_url, dynamic) {
  let ranges = find_image_sets(css_str);
  if (!ranges.length) return css_str;

  let item_regex = /(^|,)(\s*)(["'])((?:\\.|(?!\3)[^\\])*)\3/g;
  let urls = new Set();
  for (let [start, end] of ranges) {
    for (let m of css_str.slice(start, end).matchAll(item_regex)) {
      let url = m[4].trim();
      if (!should_skip(url) && !is_legacy_font(url)) urls.add(url);
    }
  }
  if (!urls.size) return css_str;

  let entries = await Promise.all([...urls].map(async (url) => {
    let absolute_url = safe_absolute(url, css_url);
    return [url, await (dynamic ? load_asset_retry(absolute_url) : load_asset_budgeted(absolute_url))];
  }));
  let map = new Map(entries);

  let output = "";
  let previous = 0;
  for (let [start, end] of ranges) {
    output += css_str.slice(previous, start);
    output += css_str.slice(start, end).replace(item_regex, (match, lead, space, quote, url) => {
      let replacement = map.get(url.trim());
      return replacement ? `${lead}${space}"${replacement}"` : match;
    });
    previous = end;
  }
  return output + css_str.slice(previous);
}

export function parse_css(css_str, css_url, depth = 0, dynamic = false) {
  let has_import = /@import/i.test(css_str);
  let has_url = /url\(|image-set\(/i.test(css_str);
  if (!has_import && !has_url) return css_str;

  return (async () => {
    let result = css_str;
    if (has_import && depth < MAX_IMPORT_DEPTH) {
      result = await inline_imports(result, css_url, depth);
    }
    result = await replace_urls(result, css_url, dynamic);
    return await replace_image_set_strings(result, css_url, dynamic);
  })();
}
