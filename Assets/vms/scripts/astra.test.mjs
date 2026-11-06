import assert from "node:assert/strict";
import { solveQuiz, sha256hex, quizPayload, parseSetCookie, frame, keyFrame, textFrame, rtcConfig, hasTurn, searchRange, statusText, AstraClient } from "../app/js/astra.js";

const salt = "abc?x=1", target = 1234;
const q = { algorithm: "SHA-256", salt, challenge: await sha256hex(salt + target), maxnumber: 5000, signature: "sig" };
assert.equal(await solveQuiz(q), target);
assert.equal(await solveQuiz({ ...q, challenge: "0".repeat(64), maxnumber: 50 }), null);
await assert.rejects(() => solveQuiz({ ...q, algorithm: "MD5" }));
assert.deepEqual(JSON.parse(atob(quizPayload(q, 7))), { algorithm: "SHA-256", challenge: q.challenge, number: 7, salt, signature: "sig" });
assert.equal(searchRange(q.challenge, salt, 0, 5000), target);
assert.equal(searchRange(q.challenge, salt, target + 1, 5000), null);
assert.equal(searchRange("zz", salt, 0, 10), null);
const longSalt = "x".repeat(70) + "?y=2";
assert.equal(searchRange(await sha256hex(longSalt + 987), longSalt, 900, 1000), 987);

assert.equal(statusText({ queuePosition: 3 }), "Queue position: 3");
assert.equal(statusText({ status: "ready" }), "Ready. Entering stream…");
assert.equal(statusText({ statusText: "Booting" }), "Booting");
assert.equal(statusText({}), "Waiting in queue…");
const seq = [{ ok: true, status: "queued", queuePosition: 2 }, { ok: true, status: "ready", ready: true }];
const fakeFetch = async () => ({ ok: true, headers: { get: (k) => (k === "content-type" ? "application/json" : null) }, json: async () => seq.shift() });
const seen = [];
const polled = await new AstraClient(fakeFetch).waitReady("s1", { interval: 1, onStatus: (t) => seen.push(t) });
assert.equal(polled.ready, true);
assert.deepEqual(seen, ["Queue position: 2", "Ready. Entering stream…"]);
const rejectingFetch = async () => ({ ok: false, headers: { get: () => "application/json" }, json: async () => ({ ok: false, error: "no such session" }) });
await assert.rejects(() => new AstraClient(rejectingFetch).waitReady("s1", { interval: 1 }), /no such session/);

assert.deepEqual(parseSetCookie("a=1; Path=/; HttpOnly, b=2; Expires=Wed, 01 Jan 2031 00:00:00 GMT"), { a: "1", b: "2" });
assert.deepEqual(parseSetCookie(null), {});

const f = new Int32Array(frame(41, [1, 100, 200, 0]));
assert.deepEqual([...f], [41, 1, 100, 200, 0]);
assert.deepEqual([...new Uint8Array(keyFrame(101, 65, 1))], [101, 1, 65, 1]);
assert.deepEqual([...new Uint8Array(textFrame("A"))], [103, 0, 0, 0, 65, 0]);

const turn = [{ urls: ["turns:t.example:443"] }];
assert.equal(hasTurn(turn), true);
assert.equal(rtcConfig({ iceServers: turn }).iceTransportPolicy, "relay");
assert.equal(rtcConfig({ iceServers: turn, preferRelay: false }).iceTransportPolicy, undefined);
assert.equal(rtcConfig({ relayVia: "edge", edgeServers: turn, iceServers: [] }).iceServers, turn);
assert.ok(rtcConfig({}).iceServers.length);
console.log("astra tests passed");

import { AstraRelay, NegoRpc, iceList, bnKey, bnClick, bnButton, bnMouseMove, pictureRect, sgKeyFrame, sgMouseFrame } from "../app/js/astra-streams.js";
class FakeWS { constructor() { this.readyState = 1; this.sent = []; } send(d) { this.sent.push(d); } close() {} }
const relay = new AstraRelay(FakeWS); relay.ws = new FakeWS();
const launched = relay.waitLaunchResult();
relay.message(JSON.stringify({ t: "launchReady", session: { provider: "quaternary", ng: { offerSdp: "x" } } }));
assert.equal((await launched).provider, "quaternary");
relay.message(JSON.stringify({ t: "sig", msg: { type: "config" } }));
const got = []; relay.setSigHandler((m) => got.push(m)); assert.deepEqual(got, [{ type: "config" }]);
relay.attach("sid", true); assert.deepEqual(JSON.parse(relay.ws.sent.pop()), { t: "attach", apiSessionId: "sid", cfTurn: true });
relay.sendInputOut("ping;"); assert.deepEqual([...relay.ws.sent.pop()], [1, ...new TextEncoder().encode("ping;")]);
const waiting = relay.waitInputRelayReady(1000); relay.message(JSON.stringify({ t: "inputRelayReady" })); await waiting;
const failing = relay.waitLaunchResult(); relay.message(JSON.stringify({ t: "launchErr", error: "boom" })); await assert.rejects(failing, /boom/);

const rpc = new NegoRpc(relay); const pr = rpc.post("getConfig", { a: 1 });
const out = JSON.parse(JSON.parse(relay.ws.sent.pop()).raw); assert.equal(out.method, "getConfig");
relay.message(JSON.stringify({ t: "negoIn", raw: JSON.stringify({ cmd_id: out.cmd_id, json_data: { ok: 1 } }) })); assert.deepEqual(await pr, { ok: 1 });
const pe = rpc.post("call", {}); const o2 = JSON.parse(JSON.parse(relay.ws.sent.pop()).raw);
relay.message(JSON.stringify({ t: "negoIn", raw: JSON.stringify({ cmd_id: o2.cmd_id, json_data: { error: { message: "nope" } } }) })); await assert.rejects(pe, /nope/);
assert.deepEqual(iceList({ iceServers: [1] }), [1]); assert.deepEqual(iceList(null), []);

const wire = { Enter: "d" }, sdl = { Enter: 40, KeyA: 4, Unidentified: 0 };
assert.deepEqual(JSON.parse(bnKey({ key: "a", code: "KeyA" }, true, wire, sdl)), { device: "keyboard", json_data: "61|0;", payload: { event: { sc: 4, pr: "0061" } } });
assert.equal(JSON.parse(bnKey({ key: "Enter", code: "Enter" }, false, wire, sdl)).json_data, "0d|1;");
assert.equal(bnKey({ key: "F13", code: "F13" }, true, wire, sdl), null);
assert.equal(JSON.parse(bnClick(bnButton(1), true)).json_data, "M3|0;");
assert.equal(JSON.parse(bnMouseMove(10, 20)).json_data, "xref:10|yref:20;");
const pic = pictureRect({ left: 0, top: 0, width: 1000, height: 1000 }, 1600, 900);
assert.deepEqual([Math.round(pic.top), Math.round(pic.height)], [219, 563]);
const held = new Set(); const k1 = sgKeyFrame(held, 65, true); assert.equal(new DataView(k1).getUint16(4), 65);
const k2 = new DataView(sgKeyFrame(held, 66, true)); assert.equal(k2.getUint16(7), 65); assert.equal(k2.getUint8(k2.byteLength - 1), 255);
const mf = new DataView(sgMouseFrame(500, -500, 20000, -5, 1, -1)); assert.equal(mf.getInt8(8), 127); assert.equal(mf.getInt8(9), -127); assert.equal(mf.getUint16(4), 10000); assert.equal(mf.getUint16(6), 0);
console.log("astra stream tests passed");
