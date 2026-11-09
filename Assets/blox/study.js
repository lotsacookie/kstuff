importScripts("Assets/studying/worker.js");
addEventListener("fetch", (event) => {
  if ($readingsController.shouldRoute(event)) {
    event.respondWith($readingsController.route(event));
  }
});
