const BAD_KEY = "WB_BAD";
const BAD_TTL_MS = 6 * 3600000;
const ENGINE_FAILURE_RE = /\[LoadingScreen\]\s*Engine failure/i;

export const classifyLog = (text) => (typeof text === "string" && ENGINE_FAILURE_RE.test(text) ? "engine-failure" : null);

export function parseEngineFailure(text) {
  if (classifyLog(text) !== "engine-failure") return null;
  const msg = /"message"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(text);
  const code = /"errorCode"\s*:\s*(-?\d+)/.exec(text);
  return { message: msg ? msg[1] : "", code: code ? Number(code[1]) : null };
}

export function createBadList({ storage, now = () => Date.now(), ttl = BAD_TTL_MS, key = (entry) => String(entry) } = {}) {
  const box = () => {
    try { return storage || globalThis.localStorage || null; } catch { return null; }
  };
  const read = () => {
    const s = box();
    if (!s) return {};
    try {
      const v = JSON.parse(s.getItem(BAD_KEY));
      return v && typeof v === "object" && !Array.isArray(v) ? v : {};
    } catch { return {}; }
  };
  const live = () => {
    const t = now(), out = {};
    for (const [k, ts] of Object.entries(read())) if (typeof ts === "number" && t - ts < ttl) out[k] = ts;
    return out;
  };
  return {
    has: (entry) => Object.hasOwn(live(), key(entry)),
    add(entry) {
      const s = box();
      if (!s) return;
      const v = live();
      v[key(entry)] = now();
      try { s.setItem(BAD_KEY, JSON.stringify(v)); } catch {}
    },
    clear() {
      const s = box();
      try { if (s) s.removeItem(BAD_KEY); } catch {}
    },
  };
}

export function createWatchdog({ current, markBad, switchWisp, relaunch, log = () => {}, max = 2 }) {
  let used = 0, busy = false, lastSig = null, shared = false;
  return {
    get used() { return used; },
    async feed(text) {
      if (classifyLog(text) !== "engine-failure") return false;
      if (busy || used >= max || shared) return false;
      const info = parseEngineFailure(text);
      const sig = info ? info.code + "|" + info.message : "";
      if (info) log("engine failure detail: code=" + info.code + " message=" + info.message);
      if (lastSig !== null && sig === lastSig) {
        // identical failure on a different server: not the server's fault, so stop blaming/cycling servers
        shared = true;
        log("same engine failure on " + (used + 1) + " servers, not server-specific; not retrying (check Roblox API/chat traffic through the proxy)");
        return false;
      }
      busy = true;
      used++;
      try {
        const failed = current();
        if (failed) markBad(failed);
        log("engine failed on " + failed + ", trying another server (" + used + "/" + max + ")");
        const next = await switchWisp(failed ? [failed] : []);
        if (!next || next === failed) {
          log("no other server available");
          return false;
        }
        await relaunch();
        lastSig = sig;
        return true;
      } catch (e) {
        log("recovery failed: " + ((e && e.message) || e));
        return false;
      } finally {
        busy = false;
      }
    },
  };
}
