// Unit tests for the footer's timer helpers (run: node scripts/footer.test.mjs). No DOM, no network.
import assert from "node:assert/strict";
import { parseDeadline, remainingSeconds, formatClock, timerTone, clockSkew, SESSION_MS } from "../app/js/footer.js";

// parseDeadline: ms epoch, seconds epoch, numeric strings, ISO dates; junk -> null
const MS = 1_800_000_000_000;
assert.equal(parseDeadline(MS), MS);
assert.equal(parseDeadline(MS / 1000), MS);
assert.equal(parseDeadline(String(MS)), MS);
assert.equal(parseDeadline("2027-01-15T08:00:00Z"), Date.parse("2027-01-15T08:00:00Z"));
for (const bad of [null, undefined, "", "soon", 0, -5, NaN]) assert.equal(parseDeadline(bad), null);

// remainingSeconds rounds up (hits 0:00 exactly when the deadline does) and never goes negative
assert.equal(remainingSeconds(10_000, 0), 10);
assert.equal(remainingSeconds(10_001, 0), 11);
assert.equal(remainingSeconds(10_000, 9_999), 1);
assert.equal(remainingSeconds(10_000, 10_000), 0);
assert.equal(remainingSeconds(10_000, 99_999), 0);
assert.equal(remainingSeconds(SESSION_MS, 0), 1800);

// accuracy: sampled at irregular, throttled intervals the value only depends on the clock, never on tick count
const start = 1_000_000, deadline = start + SESSION_MS;
for (const elapsed of [0, 250, 999, 1000, 5_000, 61_337, 1_799_000, 1_800_000]) {
  assert.equal(remainingSeconds(deadline, start + elapsed), Math.ceil((SESSION_MS - elapsed) / 1000));
}
// a server clock 90s ahead of ours: shifting "now" by the skew gives the server's view of the time left
assert.equal(remainingSeconds(deadline, start + 90_000), 1710);

assert.equal(formatClock(1800), "30:00");
assert.equal(formatClock(59), "0:59");
assert.equal(formatClock(61), "1:01");
assert.equal(formatClock(3725), "1:02:05");
assert.equal(formatClock(-4), "0:00");

assert.equal(timerTone(301), "");
assert.equal(timerTone(300), "warn");
assert.equal(timerTone(61), "warn");
assert.equal(timerTone(60), "danger");
assert.equal(timerTone(0), "danger");

// clockSkew: the Date header has 1s resolution, so small offsets are ignored; big ones (and sane ones) are kept
const now = Date.parse("2027-01-15T08:00:00Z");
assert.equal(clockSkew("Fri, 15 Jan 2027 08:00:01 GMT", now), 0);
assert.equal(clockSkew("Fri, 15 Jan 2027 08:01:30 GMT", now), 90_000);
assert.equal(clockSkew("Fri, 15 Jan 2027 07:58:00 GMT", now), -120_000);
assert.equal(clockSkew("Sat, 16 Jan 2027 08:00:00 GMT", now), 0); // a day off: header is junk, don't trust it
assert.equal(clockSkew(null, now), 0);
assert.equal(clockSkew("garbage", now), 0);

console.log("footer tests passed");
