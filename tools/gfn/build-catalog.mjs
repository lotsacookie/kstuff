// Builds Assets/now/catalog.json from NVIDIA's public GeForce NOW game list.
// Compact on purpose: games = [[id, title, store, steamAppId, imageUrl], ...]
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const OUT = 'Assets/now/catalog.json';
const SOURCES = [
  'https://static.nvidiagrid.net/supported-public-games-list/locales/gfnpc-en-US.json',
  'https://static.nvidiagrid.net/supported-public-game-list/locales/gfnpc-en-US.json',
  'https://static.nvidiagrid.net/supported-public-game-list/gfnpc.json',
];

async function pull() {
  for (const url of SOURCES) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) { console.log('skip', url, r.status); continue; }
      const j = await r.json();
      const list = Array.isArray(j) ? j : (j.games || j.items || []);
      if (list.length) { console.log('using', url, list.length); return list; }
    } catch (e) { console.log('skip', url, e.message); }
  }
  return [];
}

const img = g => {
  const i = g.images || {};
  const v = i.GAME_BOX_ART || i.TV_BANNER || i.HERO_IMAGE || g.image || g.imageUrl || '';
  return typeof v === 'string' && /^https:\/\//.test(v) ? v : '';
};
const steamId = g => { const m = /store\.steampowered\.com\/app\/(\d+)/.exec(g.steamUrl || ''); return m ? m[1] : ''; };

const list = await pull();
const seen = new Set(), games = [];
for (const g of list) {
  const id = g && (g.id ?? g.appId);
  const title = g && String(g.title || g.name || '').trim();
  if (!id || !title || seen.has(String(id))) continue;
  seen.add(String(id));
  games.push([Number.isFinite(Number(id)) ? Number(id) : String(id), title, String(g.store || g.appStore || ''), steamId(g), img(g)]);
}
games.sort((a, b) => a[1].localeCompare(b[1], 'en', { sensitivity: 'base' }));

if (!games.length) {
  if (existsSync(OUT)) { console.log('nothing fetched; keeping the existing catalog'); process.exit(0); }
  console.error('nothing fetched and no existing catalog'); process.exit(1);
}
let prev = null; try { prev = JSON.parse(readFileSync(OUT, 'utf8')); } catch {}
if (prev && JSON.stringify(prev.games) === JSON.stringify(games)) { console.log('catalog unchanged'); process.exit(0); }
writeFileSync(OUT, JSON.stringify({ v: 1, at: new Date().toISOString(), count: games.length, games }));
console.log('wrote', games.length, 'games');
