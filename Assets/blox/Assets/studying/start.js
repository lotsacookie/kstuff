(function () {
  function waitFor(target, eventName, check, message) {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        target.removeEventListener(eventName, changed);
      };
      const changed = () => {
        try {
          if (!check()) return;
          cleanup();
          resolve();
        } catch (error) {
          cleanup();
          reject(error);
        }
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(message));
      }, 15000);
      target.addEventListener(eventName, changed);
      changed();
    });
  }
  globalThis.startStudyingWorker = async function () {
    if (!navigator.serviceWorker) {
      throw new Error("Studying needs HTTPS or localhost to start.");
    }
    const registration = await navigator.serviceWorker.register(WB_ROOT + "study.js", {
      scope: WB_ROOT,
      type: "classic",
      updateViaCache: "none",
    });
    const worker =
      registration.installing || registration.waiting || registration.active;
    if (!worker) throw new Error("Studying worker did not start.");
    await waitFor(
      worker,
      "statechange",
      () => {
        if (worker.state === "redundant")
          throw new Error("Studying worker failed to activate.");
        return worker.state === "activated";
      },
      "Studying worker activation timed out.",
    );
    await waitFor(
      navigator.serviceWorker,
      "controllerchange",
      () => navigator.serviceWorker.controller === worker,
      "Studying worker did not take control.",
    );
    return worker;
  };
})();
