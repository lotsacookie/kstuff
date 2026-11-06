// astra-sdk woah
// if you need help just ask me
(function (global) {
  "use strict";

  // session is the JSON your backend got from POST /api/v1/assignments.
  var LOADER_VERSION = "3";

  var SCRIPT_BASE = (function () {
    try {
      var cs = document.currentScript;
      var src = cs && cs.src ? new URL(cs.src, location.href) : null;
      if (!src) return "";
      var m = src.pathname.match(/^(.*)\/sdk\/[^/]*$/);
      return m ? src.origin + m[1] : "";
    } catch (e) {
      return "";
    }
  })();

  function resolveMount(mount) {
    if (!mount) throw new Error("Astra: `mount` is required");
    var el = typeof mount === "string" ? document.querySelector(mount) : mount;
    if (!el) throw new Error("Astra: mount target not found: " + mount);
    return el;
  }

  // loaded once every time
  var cores = {};
  function loadCore(origin) {
    if (!cores[origin]) {
      cores[origin] = fetch(origin + "/sdk/manifest.json", { cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error("Astra: manifest unavailable (" + r.status + ")");
          return r.json();
        })
        .then(function (m) {
          var url = /^https?:/.test(m.core) ? m.core : origin + m.core;
          return import(/* @vite-ignore */ url);
        })
        .catch(function (e) {
          delete cores[origin];
          throw e;
        });
    }
    return cores[origin];
  }

  function Astra(opts) {
    opts = opts || {};
    this.el = resolveMount(opts.mount);
    this.origin = opts.origin ? String(opts.origin).replace(/\/+$/, "") : "";
    this._listeners = {};
    this._player = null;
    this._run = 0;
    this.session = null;
    this.version = null;
  }

  Astra.loaderVersion = LOADER_VERSION;

  Astra.prototype.on = function (event, cb) {
    (this._listeners[event] = this._listeners[event] || []).push(cb);
    return this;
  };

  Astra.prototype.off = function (event, cb) {
    var l = this._listeners[event];
    if (l) this._listeners[event] = l.filter(function (f) { return f !== cb; });
    return this;
  };

  Astra.prototype._emit = function (event, data) {
    (this._listeners[event] || []).forEach(function (cb) {
      try {
        cb(data);
      } catch (e) {
        /* ignore listener errors */
      }
    });
  };

  // start's a session via YOUR BACKEND which is ASTRA's Backend
  Astra.prototype.play = function (session) {
    var self = this;
    session = session || {};
    var conn = session.session || session.stream;
    var lesson = session.lesson || session.app;
    var token = session.enrollmentToken || session.streamToken;
    if (typeof session !== "object" || !conn) {
      return Promise.reject(new Error("Astra: play() needs the /api/v1/assignments response"));
    }
    if (!token || !lesson || !lesson.id) {
      return Promise.reject(new Error("Astra: session is incomplete"));
    }
    this.stop();
    this.session = session;
    var run = ++this._run;
    var origin = (this.origin || SCRIPT_BASE || String(conn.origin || "")).replace(/\/+$/, "");
    session = Object.assign({}, session, {
      session: Object.assign({}, conn, { origin: origin }),
      stream: Object.assign({}, conn, { origin: origin }),
    });
    var emit = function (event, data) {
      if (run === self._run) self._emit(event, data);
    };

    return loadCore(origin)
      .then(function (core) {
        if (run !== self._run) return null;
        self.version = core.version;
        return core.mount(self.el, session, emit);
      })
      .then(function (player) {
        if (!player) return self;
        if (run !== self._run) {
          player.destroy();
          return self;
        }
        self._player = player;
        return self;
      })
      .catch(function (e) {
        emit("error", { message: e && e.message ? e.message : String(e) });
        throw e;
      });
  };

  function call(name) {
    return function (arg) {
      if (this._player) this._player[name](arg);
      return this;
    };
  }

  Astra.prototype.pause = call("pause");
  Astra.prototype.resume = call("resume");
  Astra.prototype.mute = call("mute");
  Astra.prototype.unmute = call("unmute");
  Astra.prototype.setVolume = call("setVolume"); // 0..1
  Astra.prototype.fullscreen = call("fullscreen");

// ends session
  Astra.prototype.end = function () {
    var self = this;
    var p = this._player ? this._player.end() : Promise.resolve();
    return Promise.resolve(p).then(function () {
      self.stop();
      return self;
    });
  };

  Astra.prototype.stop = function () {
    this._run++;
    if (this._player) {
      try {
        this._player.destroy();
      } catch (e) {
        /* ignore */
      }
    }
    this._player = null;
    return this;
  };

  Astra.prototype.destroy = function () {
    this.stop();
    this._listeners = {};
  };

  global.Astra = Astra;
})(typeof window !== "undefined" ? window : this);
