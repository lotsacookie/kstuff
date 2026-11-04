// Writes catalog.json (the Astra library: id, name, icon path) so host pages like kstuff can list the games without loading this app.
// Run in CI (see .github/workflows/catalog.yml): node scripts/build_catalog.mjs   [GAMES_FILE=local.json to skip the network]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { normalizeGames } from "../app/js/hub.js";

const ORIGIN = "https://astra-education.top";
let raw;
if (process.env.GAMES_FILE) raw = JSON.parse(readFileSync(process.env.GAMES_FILE, "utf8"));
else {
  const res = await fetch(ORIGIN + "/api/cg/games", { headers: { accept: "application/json", "user-agent": "Mozilla/5.0 (catalog-build)" } });
  if (!res.ok) throw new Error(`catalog fetch failed: HTTP ${res.status}`);
  raw = await res.json();
}

const games = normalizeGames(raw)
  // only point at art we actually hold in ref/cg (served from this repo by jsDelivr); everything else gets a lettered placeholder
  .map((g) => ({ id: g.id, name: g.name, icon: g.icon && existsSync("ref" + g.icon) ? g.icon : null }));
if (games.length < 5) throw new Error(`refusing to write a catalog of ${games.length} games`);

let previous = null;
try { previous = JSON.parse(readFileSync("catalog.json", "utf8")); } catch {}
const same = previous && JSON.stringify(previous.games) === JSON.stringify(games);
if (same) { console.log(`catalog unchanged (${games.length} games)`); process.exit(0); }
writeFileSync("catalog.json", JSON.stringify({ updated: new Date().toISOString(), games }, null, 1) + "\n");
console.log(`catalog.json written: ${games.length} games, ${games.filter((g) => g.icon).length} with icons`);
