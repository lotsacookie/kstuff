import { startSession, STEPS } from "./app/js/session.js";
import { auth, astraFetch, astraWebSocket } from "./app/js/net.js";
import { Hub } from "./app/js/hub.js";
import { AstraSessions } from "./app/js/astra.js";
import { Loader } from "./app/js/loader.js";
import { installBridge } from "./app/js/bridge.js";

const FREEZENOVA_STEPS = STEPS.length + 3;

async function ensureSession(onStep = () => {}) {
  auth.token = await startSession((i) => {
    if (i < STEPS.length) onStep(i + 1, FREEZENOVA_STEPS, STEPS[i]);
  });
}

export async function start() {
  const appP = import("./app/js/app.js");
  const hub = new Hub({ fetchAstra: astraFetch });
  hub.mount();

  const { App } = await appP;
  const loader = new Loader();
  const app = new App({ ensureSession, loader, stepTotal: FREEZENOVA_STEPS });
  const astra = new AstraSessions({ fetchAstra: astraFetch, webSocket: astraWebSocket, loader, show: (id) => app.showScreen(id), notify: (t) => app.notify(t) });
  hub.onSelect = (game) => astra.play(game);
  installBridge({ app, astra, hub });
  hub.loadAstra();
  return { app, hub, astra, loader };
}
