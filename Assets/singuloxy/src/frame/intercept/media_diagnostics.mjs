import { proxy_function, unwrap_this } from "../context.mjs";

const MAX_PER_KIND = 8;
const counts = new Map();

function report(kind, ...args) {
  let seen = counts.get(kind) || 0;
  if (seen >= MAX_PER_KIND) return;
  counts.set(kind, seen + 1);
  console.warn("sandstone media [" + kind + "]:", ...args);
}

function brief(value) {
  try {
    let text = JSON.stringify(value);
    return text && text.length > 400 ? text.slice(0, 400) + "..." : text;
  }
  catch {
    return String(value);
  }
}

function describe(element) {
  let error = element.error;
  return {
    src: element.currentSrc || element.getAttribute("__src") || "",
    code: error ? error.code : null,
    message: error ? error.message : "",
    networkState: element.networkState,
    readyState: element.readyState
  };
}

function relax_configs(configs) {
  if (!Array.isArray(configs)) return configs;
  return configs.map((config) => {
    let next = {...config};
    if (next.persistentState === "required") next.persistentState = "optional";
    if (next.distinctiveIdentifier === "required") next.distinctiveIdentifier = "optional";
    if (Array.isArray(next.sessionTypes)) next.sessionTypes = ["temporary"];
    return next;
  });
}

function needs_relaxing(configs) {
  if (!Array.isArray(configs)) return false;
  return configs.some((config) => config && (config.persistentState === "required" || config.distinctiveIdentifier === "required" || (Array.isArray(config.sessionTypes) && config.sessionTypes.some((type) => type !== "temporary"))));
}

function install_element_errors() {
  if (typeof document === "undefined" || typeof HTMLMediaElement === "undefined") return;
  document.addEventListener("error", (event) => {
    let target = event.target;
    if (target instanceof HTMLMediaElement) report("element error", describe(target));
  }, true);
}

function install_play_report() {
  if (typeof HTMLMediaElement === "undefined") return;
  proxy_function(HTMLMediaElement.prototype, "play", (func, this_arg, args) => {
    let element = unwrap_this(this_arg);
    let result = Reflect.apply(func, element, args);
    if (result && typeof result.then === "function") {
      result.then(undefined, (e) => report("play rejected", e && e.name, e && e.message, describe(element)));
    }
    return result;
  });
}

function install_eme_report() {
  if (typeof Navigator === "undefined" || typeof Navigator.prototype.requestMediaKeySystemAccess !== "function") return;
  proxy_function(Navigator.prototype, "requestMediaKeySystemAccess", (func, this_arg, args) => {
    let receiver = unwrap_this(this_arg);
    let key_system = args[0];
    let is_widevine = typeof key_system === "string" && key_system.indexOf("com.widevine") === 0;
    let result = Reflect.apply(func, receiver, args);
    if (!result || typeof result.then !== "function") return result;
    return result.then((access) => {
      if (is_widevine) report("key system ok", key_system, brief(access.getConfiguration && access.getConfiguration()));
      return access;
    }, (error) => {
      report("key system rejected", key_system, error && error.name, error && error.message, is_widevine ? brief(args[1]) : "");
      if (is_widevine && needs_relaxing(args[1])) {
        let relaxed = [args[0], relax_configs(args[1]), ...args.slice(2)];
        return Reflect.apply(func, receiver, relaxed).then((access) => {
          report("key system retry ok", key_system, brief(access.getConfiguration && access.getConfiguration()));
          return access;
        }, (retry_error) => {
          report("key system retry rejected", key_system, retry_error && retry_error.name, retry_error && retry_error.message);
          throw error;
        });
      }
      throw error;
    });
  });
}

function install_eme_pipeline_report() {
  if (typeof MediaKeySystemAccess !== "undefined" && typeof MediaKeySystemAccess.prototype.createMediaKeys === "function") {
    proxy_function(MediaKeySystemAccess.prototype, "createMediaKeys", (func, this_arg, args) => {
      let result = Reflect.apply(func, unwrap_this(this_arg), args);
      if (result && typeof result.then === "function") result.then(undefined, (e) => report("createMediaKeys rejected", e && e.name, e && e.message));
      return result;
    });
  }
  if (typeof MediaKeys !== "undefined" && typeof MediaKeys.prototype.setServerCertificate === "function") {
    proxy_function(MediaKeys.prototype, "setServerCertificate", (func, this_arg, args) => {
      let result = Reflect.apply(func, unwrap_this(this_arg), args);
      if (result && typeof result.then === "function") result.then(undefined, (e) => report("setServerCertificate rejected", e && e.name, e && e.message));
      return result;
    });
  }
  if (typeof MediaKeySession !== "undefined" && typeof MediaKeySession.prototype.generateRequest === "function") {
    proxy_function(MediaKeySession.prototype, "generateRequest", (func, this_arg, args) => {
      let result = Reflect.apply(func, unwrap_this(this_arg), args);
      if (result && typeof result.then === "function") result.then(undefined, (e) => report("generateRequest rejected", args[0], e && e.name, e && e.message));
      return result;
    });
  }
}

function install_capabilities_report() {
  if (typeof MediaCapabilities === "undefined" || typeof MediaCapabilities.prototype.decodingInfo !== "function") return;
  proxy_function(MediaCapabilities.prototype, "decodingInfo", (func, this_arg, args) => {
    let result = Reflect.apply(func, unwrap_this(this_arg), args);
    let config = args[0];
    let key_config = config && (config.video && config.video.keySystemConfiguration || config.audio && config.audio.keySystemConfiguration || config.keySystemConfiguration);
    if (key_config && result && typeof result.then === "function") {
      result.then((info) => report("decodingInfo keySystem", key_config.keySystem, "supported=" + info.supported, "access=" + !!info.keySystemAccess), (e) => report("decodingInfo rejected", key_config.keySystem, e && e.name, e && e.message));
    }
    return result;
  });
}

function report_environment() {
  try {
    let brands = navigator.userAgentData ? brief(navigator.userAgentData.brands) : "none";
    report("environment", "secure=" + globalThis.isSecureContext, "ua=" + navigator.userAgent, "brands=" + brands, "eme=" + (typeof navigator.requestMediaKeySystemAccess));
  }
  catch {}
}

let installed = false;

export function install() {
  if (installed) return;
  installed = true;
  install_element_errors();
  install_play_report();
  install_eme_report();
  install_eme_pipeline_report();
  install_capabilities_report();
  report_environment();
}
