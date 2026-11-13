const DISCORD_HOSTS = [
  "discord.com",
  "discordapp.com",
  "discord.gg",
  "discordapp.net",
  "discord.media"
];

const MEDIA_HOSTS = [
  "cdn.discordapp.com",
  "media.discordapp.net",
  "images-ext-1.discordapp.net",
  "images-ext-2.discordapp.net"
];

const DISCORD_ORIGIN = "https://discord.com";
const DISCORD_REFERER = "https://discord.com/channels/@me";

function host_of(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  }
  catch {
    return "";
  }
}

function in_list(host, list) {
  return list.some((entry) => host === entry || host.endsWith("." + entry));
}

export function is_discord_url(url) {
  return in_list(host_of(url), DISCORD_HOSTS);
}

export function is_discord_media_url(url) {
  return in_list(host_of(url), MEDIA_HOSTS);
}

function find_key(headers, name) {
  return Object.keys(headers).find((key) => key.toLowerCase() === name);
}

function set_default(headers, name, value) {
  if (value === undefined || value === null || value === "") return;
  if (find_key(headers, name) === undefined) headers[name] = value;
}

function force(headers, name, value) {
  let existing = find_key(headers, name);
  if (existing !== undefined) delete headers[existing];
  headers[name] = value;
}

function drop(headers, name) {
  let existing = find_key(headers, name);
  if (existing !== undefined) delete headers[existing];
}

function accept_language() {
  try {
    let list = Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages : [navigator.language || "en-US"];
    return list
      .map((lang, index) => index === 0 ? lang : lang + ";q=" + Math.max(0.1, 1 - index * 0.1).toFixed(1))
      .join(",");
  }
  catch {
    return "en-US,en;q=0.9";
  }
}

function discord_locale() {
  try {
    return navigator.language || "en-US";
  }
  catch {
    return "en-US";
  }
}

function client_hints() {
  let hints = {};
  try {
    let data = navigator.userAgentData;
    if (!data) return hints;
    let brands = (data.brands || []).map((entry) => `"${entry.brand}";v="${entry.version}"`).join(", ");
    if (brands) hints["Sec-CH-UA"] = brands;
    hints["Sec-CH-UA-Mobile"] = data.mobile ? "?1" : "?0";
    if (data.platform) hints["Sec-CH-UA-Platform"] = `"${data.platform}"`;
  }
  catch {}
  return hints;
}

function fetch_site(url, page_url) {
  try {
    let target = new URL(url);
    let page = new URL(page_url || DISCORD_ORIGIN);
    if (target.origin === page.origin) return "same-origin";
    let a = target.hostname.split(".").slice(-2).join(".");
    let b = page.hostname.split(".").slice(-2).join(".");
    return a === b ? "same-site" : "cross-site";
  }
  catch {
    return "cross-site";
  }
}

export function discord_fetch_options(url, options) {
  if (!is_discord_url(url)) return options;
  let headers = {...(options?.headers || {})};
  let method = String(options?.method || "GET").toUpperCase();
  let media = is_discord_media_url(url);

  if (media && method === "GET") {
    drop(headers, "origin");
    drop(headers, "x-super-properties");
    drop(headers, "x-discord-locale");
    drop(headers, "authorization");
    force(headers, "Referer", DISCORD_ORIGIN + "/");
    set_default(headers, "Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8");
    set_default(headers, "Accept-Language", accept_language());
    set_default(headers, "User-Agent", typeof navigator !== "undefined" ? navigator.userAgent : "");
    for (let [key, value] of Object.entries(client_hints())) set_default(headers, key, value);
    set_default(headers, "Sec-Fetch-Dest", "image");
    set_default(headers, "Sec-Fetch-Mode", "no-cors");
    set_default(headers, "Sec-Fetch-Site", "cross-site");
    return {...(options || {}), headers: headers};
  }

  let page_url = find_key(headers, "referer") ? headers[find_key(headers, "referer")] : DISCORD_REFERER;
  if (find_key(headers, "origin") !== undefined || method !== "GET") force(headers, "Origin", DISCORD_ORIGIN);
  set_default(headers, "Referer", DISCORD_REFERER);
  set_default(headers, "Accept-Language", accept_language());
  set_default(headers, "User-Agent", typeof navigator !== "undefined" ? navigator.userAgent : "");
  for (let [key, value] of Object.entries(client_hints())) set_default(headers, key, value);
  set_default(headers, "Sec-Fetch-Dest", "empty");
  set_default(headers, "Sec-Fetch-Mode", "cors");
  set_default(headers, "Sec-Fetch-Site", fetch_site(url, page_url));
  if (find_key(headers, "x-super-properties") !== undefined) set_default(headers, "X-Discord-Locale", discord_locale());
  return {...(options || {}), headers: headers};
}

export function discord_ws_options(url, options) {
  if (!is_discord_url(url)) return options;
  let headers = {...(options?.headers || {})};
  force(headers, "Origin", DISCORD_ORIGIN);
  set_default(headers, "User-Agent", typeof navigator !== "undefined" ? navigator.userAgent : "");
  set_default(headers, "Accept-Language", accept_language());
  set_default(headers, "Cache-Control", "no-cache");
  set_default(headers, "Pragma", "no-cache");
  return {...(options || {}), headers: headers};
}
