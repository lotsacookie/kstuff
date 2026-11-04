// Unit test: the loading screen belongs to a game launch until hide() (run: node scripts/loader.test.mjs). No DOM needed.
import assert from "node:assert/strict";
import { Loader } from "../app/js/loader.js";
const cls = () => { const s = new Set(); return { add: (...c) => c.forEach((x) => s.add(x)), remove: (...c) => c.forEach((x) => s.delete(x)), contains: (c) => s.has(c) }; };
const els = { "loading-screen": { classList: cls() }, "ld-fill": { style: {} }, "ld-status": {}, "ld-count": {}, "ld-cancel": { addEventListener() {} } };
const doc = { getElementById: (id) => els[id], body: { classList: cls() } };
const l = new Loader(doc);
assert.equal(l.gameActive, false);
l.show("Starting X");
assert.equal(l.gameActive, true);
assert.ok(doc.body.classList.contains("loading"));
assert.ok(els["loading-screen"].classList.contains("active"));
assert.equal(els["loading-screen"].classList.contains("hidden"), false);
l.hide();
assert.equal(l.gameActive, false);
assert.ok(els["loading-screen"].classList.contains("hidden"));
console.log("loader tests passed");
