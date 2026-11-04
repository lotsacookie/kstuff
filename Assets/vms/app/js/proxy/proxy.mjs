// Browser-side proxy, taken from WebBlox (src/join/proxy.mjs): Sandstone's bundled libcurl.js tunnelled
// over a Wisp relay. Used only when the backend can't be reached directly from this origin.
// libcurl.fetch / libcurl.WebSocket add no Origin header and no spoofed headers; they're plain clients.
import { pickWisp, provisionalWisp } from "./wisps.mjs";

const DIST = "dist/sandstone.mjs";
const BASES = [
  "https://cdn.jsdelivr.net/gh/lotsacookie/Singuloxy@main/",
  "https://fastly.jsdelivr.net/gh/lotsacookie/Singuloxy@main/",
];

async function loadSandstone(log) {
  for (const base of BASES) {
    try { return await import(base + DIST); } catch { log("[proxy] sandstone import failed", base); }
  }
  const code = await (await fetch("https://raw.githubusercontent.com/lotsacookie/Singuloxy/main/" + DIST)).text();
  return import(URL.createObjectURL(new Blob([code], { type: "text/javascript" })));
}

let ready = null;
export function getProxy({ log = () => {}, say = () => {} } = {}) {
  return (ready ||= (async () => {
    say("Loading proxy…");
    const sandstone = await loadSandstone(log);
    provisionalWisp(sandstone.network);
    for (let i = 0; i < 300 && !sandstone.libcurl.ready; i++) await new Promise((r) => setTimeout(r, 100));
    if (!sandstone.libcurl.ready) throw new Error("libcurl did not load");
    const wisp = await pickWisp(sandstone.network, say);
    log("[proxy] wisp", String(wisp));
    return { libcurl: sandstone.libcurl, network: sandstone.network, wisp: String(wisp) };
  })().catch((e) => { ready = null; throw e; }));
}
