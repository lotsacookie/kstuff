/**
 * postMessage bridge so a host page (kstuff's Cloud tab) can deep-link straight into one game and follow the session.
 *
 * Host -> SingularityCloud
 *   { type: "singularity:hello" }                                  -> replies with singularity:ready
 *   { type: "singularity:launch", gameId, name? }                  -> starts that game right away (no library, no Cancel button)
 *       gameId: an Astra game id, or "freezenova" for our own Roblox
 * SingularityCloud -> host
 *   { type: "singularity:ready" }                                  once the app is up (and in answer to hello)
 *   { type: "singularity:launching", gameId }                      the launch was accepted (stop retrying)
 *   { type: "singularity:closed", gameId, reason }                 reason: "exit" (user left) | "ended" (session over) | "error"
 *   { type: "singularity:catalog", games: [{ id, name, icon }] }   the Astra library, so the host can list the games
 *
 * Only messages from the embedding parent window are accepted, and ids are validated, so a random page can't drive it.
 * No DOM access at import time (unit-tested in scripts/bridge.test.mjs).
 */

const ID = /^[\w.-]{1,80}$/;
export const FREEZENOVA_ID = "freezenova";
const DUP_MS = 5000; // the host retries until it sees "launching"; a repeat inside this window is only re-acknowledged

export function parseLaunch(data) {
  if (!data || typeof data !== "object" || data.type !== "singularity:launch") return null;
  const id = String(data.gameId ?? "").trim();
  if (!ID.test(id)) return null;
  const name = String(data.name ?? "").trim().slice(0, 120) || id;
  return { id, name, freezenova: id.toLowerCase() === FREEZENOVA_ID };
}

export function installBridge({ app, astra, hub, win = window, now = () => Date.now() }) {
  const parent = win.parent;
  const embedded = !!parent && parent !== win;
  const post = (msg) => { if (embedded) { try { parent.postMessage(msg, "*"); } catch {} } };

  let active = false, suppress = false, current = null, startedAt = 0;

  const closed = (reason) => {
    if (suppress || !active) return;
    active = false;
    post({ type: "singularity:closed", gameId: current?.id, reason });
  };
  app.onClosed = closed;
  astra.onClosed = closed;
  hub.onRender = (games) => post({ type: "singularity:catalog", games: games.map((g) => ({ id: g.id, name: g.name, icon: g.icon })) });

  async function stopCurrent() {
    suppress = true;
    try {
      if (astra.sessionId || astra.player) await astra.leave("exit");
      if (app.currentScreen() === "screen-game") app.resetToSelect("exit");
    } finally { suppress = false; }
  }

  async function launch(req) {
    if (active && current && current.id === req.id && now() - startedAt < DUP_MS) { post({ type: "singularity:launching", gameId: req.id }); return; }
    post({ type: "singularity:launching", gameId: req.id });
    await stopCurrent();
    active = true; current = req; startedAt = now();
    if (req.freezenova) app.selectGame("roblox", { deeplink: true });
    else astra.play({ id: req.id, name: req.name }, { deeplink: true });
  }

  win.addEventListener("message", (e) => {
    if (!embedded || e.source !== parent) return;
    const d = e.data;
    if (d && d.type === "singularity:hello") { post({ type: "singularity:ready" }); return; }
    const req = parseLaunch(d);
    if (req) launch(req).catch((err) => console.error("[bridge] launch failed:", err));
  });

  post({ type: "singularity:ready" });
  return { launch };
}
