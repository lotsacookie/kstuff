import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";

const start = process.argv[2];
const out_dir = process.argv[3];
const MAX_FETCHES = 700;
const MAX_DEPTH = 5;
const MAX_SAVE = 6 * 1024 * 1024;
const WORKERS = 8;
const HOSTS = /(^|\.)(roblox\.com|rbxcdn\.com)$/i;
const TEXTUAL = /(javascript|json|html|css|xml|text\/)/i;
const BINARY_EXT = /\.(wasm|data|bin|png|jpe?g|gif|webp|svg|woff2?|ttf|ico|mp3|ogg|zip|br|gz)(\?|#|$)/i;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const ENGINE = /https:\/\/setup\.rbxcdn\.com\/webclient\/version-[A-Za-z0-9]+-RobloxWebClient/;

const seen = new Map();
const discovered = new Map();
const rows = [];
const queue = [{ url: start, depth: 0, from: "" }];
let fetched = 0;
let engine_base = null;
const asset_bases = new Set();
const ENGINE_FILES = ["WasmPlayer.js", "WebClient.js", "WebClient.wasm", "WebFlags.json", "WebClient.metadata.json"];
const WEBCLIENT_FILES = ["WasmLoader.js", "stub.js"];

function note(url, from) {
  if (!discovered.has(url)) discovered.set(url, from);
}

function extract(text, base) {
  const found = new Set();
  const absolute = /https?:\/\/[A-Za-z0-9.\-]+(?::\d+)?(?:\/[^\s"'`<>\\)(]*)?/g;
  for (const match of text.matchAll(absolute)) found.add(match[0].replace(/[,;.]+$/, ""));
  for (const match of text.matchAll(/\/[0-9a-f]{40}\/assets/g)) {
    try {
      asset_bases.add(new URL(base).origin + match[0]);
    }
    catch {}
  }
  for (const root of asset_bases) {
    for (const name of WEBCLIENT_FILES) found.add(`${root}/webclient/${name}`);
  }
  const versions = text.match(/version-[a-f0-9]{16}/g);
  if (versions && !engine_base) engine_base = `https://setup.rbxcdn.com/webclient/${versions[0]}-RobloxWebClient`;
  if (engine_base) {
    for (const name of ENGINE_FILES) found.add(`${engine_base}/${name}`);
  }
  const relative = /["'`]((?:\.{0,2}\/)?[A-Za-z0-9_\-.\/@%+]+\.(?:js|mjs|json|wasm|css|data|html|txt|map|bin|br))(?:\?[^"'`]*)?["'`]/g;
  for (const match of text.matchAll(relative)) {
    if (match[1].startsWith("/")) {
      for (const root of asset_bases) found.add(root + match[1]);
    }
    const candidates = [base];
    if (engine_base) candidates.push(engine_base + "/");
    for (const root of candidates) {
      try {
        found.add(new URL(match[1], root).href);
      }
      catch {}
    }
  }
  const attributes = /(?:src|href)=["']([^"']+)["']/g;
  for (const match of text.matchAll(attributes)) {
    try {
      found.add(new URL(match[1], base).href);
    }
    catch {}
  }
  return [...found];
}

function save_path(url) {
  const parsed = new URL(url);
  let path = parsed.pathname.endsWith("/") ? parsed.pathname + "index" : parsed.pathname;
  path = path.replace(/[^A-Za-z0-9._\-\/]/g, "_").slice(-160);
  if (parsed.search) path += "__" + createHash("sha1").update(parsed.search).digest("hex").slice(0, 8);
  return join(out_dir, "files", parsed.hostname, path);
}

async function visit(item) {
  const { url, depth, from } = item;
  if (seen.has(url)) return;
  seen.set(url, true);
  let parsed;
  try {
    parsed = new URL(url);
  }
  catch {
    return;
  }
  if (!HOSTS.test(parsed.hostname) || !/^https?:$/.test(parsed.protocol)) {
    rows.push([depth, "skipped", "", "", url, from]);
    return;
  }
  if (fetched >= MAX_FETCHES) {
    rows.push([depth, "limit", "", "", url, from]);
    return;
  }
  fetched++;

  const binary = BINARY_EXT.test(url);
  const headers = { "User-Agent": UA, "Accept": "*/*", "Accept-Language": "en-US,en;q=0.9" };
  if (/rbxcdn\.com$/i.test(parsed.hostname)) {
    headers["Origin"] = "https://play.roblox.com";
    headers["Referer"] = "https://play.roblox.com/";
  }
  if (binary) headers["Range"] = "bytes=0-1023";

  let response;
  try {
    response = await fetch(url, { headers, redirect: "follow" });
  }
  catch (error) {
    rows.push([depth, "error", "", String(error?.cause?.code || error?.message || error), url, from]);
    return;
  }

  const type = (response.headers.get("content-type") || "").split(";")[0].trim();
  const range = response.headers.get("content-range") || response.headers.get("content-length") || "";
  const server = response.headers.get("server") || "";
  rows.push([depth, response.status, type, `${range} ${server}`.trim(), url, from]);

  if (binary || !TEXTUAL.test(type)) {
    try {
      await response.body?.cancel();
    }
    catch {}
    return;
  }

  let text = "";
  try {
    text = await response.text();
  }
  catch {
    return;
  }

  if (response.status >= 200 && response.status < 300) {
    try {
      const file = save_path(url);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, text.length > MAX_SAVE ? text.slice(0, MAX_SAVE) : text);
    }
    catch {}
  }
  else {
    return;
  }

  if (!engine_base) {
    const match = ENGINE.exec(text) || ENGINE.exec(url);
    if (match) engine_base = match[0];
  }

  if (depth >= MAX_DEPTH) return;
  for (const found of extract(text, response.url || url)) {
    note(found, url);
    if (!seen.has(found)) queue.push({ url: found, depth: depth + 1, from: url });
  }
}

async function worker() {
  while (true) {
    const item = queue.shift();
    if (!item) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (queue.length === 0) return;
      continue;
    }
    await visit(item);
  }
}

mkdirSync(out_dir, { recursive: true });
note(start, "");
await Promise.all(Array.from({ length: WORKERS }, () => worker()));

rows.sort((a, b) => String(a[4]).localeCompare(String(b[4])));
const header = ["depth", "status", "content_type", "size_or_server", "url", "found_in"].join("\t");
writeFileSync(join(out_dir, "index.tsv"), [header, ...rows.map((row) => row.join("\t"))].join("\n") + "\n");
writeFileSync(join(out_dir, "urls.txt"), [...discovered.keys()].sort().join("\n") + "\n");
writeFileSync(join(out_dir, "engine-base.txt"), (engine_base || "not found") + "\n");
console.log(`fetched ${fetched}, discovered ${discovered.size}, engine base ${engine_base || "not found"}`);
