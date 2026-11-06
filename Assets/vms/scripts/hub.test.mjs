// Unit test for the hub's catalog normalizer (run: node scripts/hub.test.mjs). No network, no DOM.
import assert from "node:assert/strict";
import { normalizeGames } from "../app/js/hub.js";
const icons = { a1: "/cg/a-launch.jpg" };
const out = normalizeGames({ ok: true, games: [
  { gameId: "b2", gameName: "beta" }, { gameId: "a1", gameName: "Alpha" }, { gameId: "a1", gameName: "Alpha dup" },
  { gameId: "ng_roblox", gameName: "Roblox" }, { gameId: "", gameName: "x" }, null,
] }, icons);
assert.deepEqual(out.map((g) => g.id), ["a1", "b2", "ng_roblox"]); // Astra's Roblox is kept now
assert.equal(out[0].icon, "/cg/a-launch.jpg");
assert.equal(out[1].icon, null);
assert.deepEqual(normalizeGames([{ id: "z", name: "Z" }], {}).map((g) => g.name), ["Z"]);
assert.deepEqual(normalizeGames({ ok: false }), []);
console.log("hub tests passed");
