// Unit test for the postMessage deep-link bridge (run: node scripts/bridge.test.mjs). No DOM, no network.
import assert from "node:assert/strict";
import { parseLaunch, installBridge } from "../app/js/bridge.js";

// --- parseLaunch validation
assert.deepEqual(parseLaunch({ type: "singularity:launch", gameId: "5fc75ac4dda24018b4bb3d10", name: "Biped" }), { id: "5fc75ac4dda24018b4bb3d10", name: "Biped", freezenova: false });
assert.equal(parseLaunch({ type: "singularity:launch", gameId: "FreezeNova" }).freezenova, true);
assert.equal(parseLaunch({ type: "singularity:launch", gameId: "kj0214" }).name, "kj0214"); // name falls back to the id
for (const bad of [null, "x", {}, { type: "other", gameId: "a" }, { type: "singularity:launch" }, { type: "singularity:launch", gameId: "a b" }, { type: "singularity:launch", gameId: "../x" }, { type: "singularity:launch", gameId: "x".repeat(81) }])
  assert.equal(parseLaunch(bad), null);

// --- bridge behaviour with fakes
function setup({ embedded = true } = {}) {
  const out = [], listeners = [];
  const parent = { postMessage: (m) => out.push(m) };
  const win = { parent: embedded ? parent : null, addEventListener: (t, f) => t === "message" && listeners.push(f) };
  if (!embedded) win.parent = win;
  const calls = [];
  const app = { onClosed: null, currentScreen: () => "screen-select", selectGame: (...a) => calls.push(["freezenova", ...a]), resetToSelect: (r) => calls.push(["app.reset", r]) };
  const astra = { onClosed: null, sessionId: null, player: null, play: (...a) => calls.push(["astra.play", ...a]), leave: async (r) => { calls.push(["astra.leave", r]); astra.sessionId = null; astra.player = null; astra.onClosed?.(r); } };
  const hub = { onRender: null };
  let t = 1000;
  installBridge({ app, astra, hub, win, now: () => t });
  const send = (data, source = parent) => listeners.forEach((f) => f({ data, source }));
  const tick = (ms) => { t += ms; };
  return { out, calls, app, astra, hub, send, tick, parent };
}
const flush = () => new Promise((r) => setTimeout(r, 0));

{ // announces itself, answers hello
  const s = setup();
  assert.deepEqual(s.out[0], { type: "singularity:ready" });
  s.send({ type: "singularity:hello" });
  assert.equal(s.out.length, 2);
}
{ // Astra launch: acknowledged, started in deeplink mode (no Cancel)
  const s = setup();
  s.send({ type: "singularity:launch", gameId: "abc123", name: "Some Game" }); await flush();
  assert.ok(s.out.some((m) => m.type === "singularity:launching" && m.gameId === "abc123"));
  assert.deepEqual(s.calls.at(-1), ["astra.play", { id: "abc123", name: "Some Game" }, { deeplink: true }]);
  // closing reports the reason, once
  s.astra.onClosed("ended"); s.astra.onClosed("ended");
  assert.deepEqual(s.out.filter((m) => m.type === "singularity:closed"), [{ type: "singularity:closed", gameId: "abc123", reason: "ended" }]);
}
{ // FreezeNova launch goes through App.selectGame
  const s = setup();
  s.send({ type: "singularity:launch", gameId: "freezenova" }); await flush();
  assert.deepEqual(s.calls.at(-1), ["freezenova", "roblox", { deeplink: true }]);
  s.app.onClosed("exit");
  assert.equal(s.out.at(-1).reason, "exit");
}
{ // host retries until it sees "launching": repeats inside the window are re-acked, not relaunched
  const s = setup();
  s.send({ type: "singularity:launch", gameId: "g1" }); await flush();
  s.tick(500); s.send({ type: "singularity:launch", gameId: "g1" }); await flush();
  assert.equal(s.calls.filter((c) => c[0] === "astra.play").length, 1);
  assert.equal(s.out.filter((m) => m.type === "singularity:launching").length, 2);
}
{ // launching another game while one runs stops the first silently (no "closed" for it)
  const s = setup();
  s.send({ type: "singularity:launch", gameId: "g1" }); await flush();
  s.astra.sessionId = "sess";
  s.send({ type: "singularity:launch", gameId: "g2" }); await flush();
  assert.deepEqual(s.calls.filter((c) => c[0] !== "astra.play").map((c) => c[0] + ":" + c[1]), ["astra.leave:exit"]);
  assert.equal(s.out.filter((m) => m.type === "singularity:closed").length, 0);
  assert.equal(s.calls.at(-1)[1].id, "g2");
}
{ // only the embedding parent may drive it
  const s = setup();
  s.send({ type: "singularity:launch", gameId: "g1" }, { postMessage() {} }); await flush();
  assert.equal(s.calls.length, 0);
}
{ // not embedded: stays silent and inert
  const s = setup({ embedded: false });
  assert.equal(s.out.length, 0);
  s.send({ type: "singularity:launch", gameId: "g1" }, s.parent); await flush();
  assert.equal(s.calls.length, 0);
}
{ // library render is forwarded as a catalog
  const s = setup();
  s.hub.onRender([{ id: "a", name: "A", icon: "/cg/a.jpg", extra: 1 }]);
  assert.deepEqual(s.out.at(-1), { type: "singularity:catalog", games: [{ id: "a", name: "A", icon: "/cg/a.jpg" }] });
}
console.log("bridge tests passed");
