var qx = Object.defineProperty;
var Fx = (a, n, r) => n in a ? qx(a, n, { enumerable: !0, configurable: !0, writable: !0, value: r }) : a[n] = r;
var tt = (a, n, r) => Fx(a, typeof n != "symbol" ? n + "" : n, r);
var xd = { exports: {} }, Qo = {};
var t0;
function Gx() {
  if (t0) return Qo;
  t0 = 1;
  var a = /* @__PURE__ */ Symbol.for("react.transitional.element"), n = /* @__PURE__ */ Symbol.for("react.fragment");
  function r(o, l, u) {
    var f = null;
    if (u !== void 0 && (f = "" + u), l.key !== void 0 && (f = "" + l.key), "key" in l) {
      u = {};
      for (var h in l)
        h !== "key" && (u[h] = l[h]);
    } else u = l;
    return l = u.ref, {
      $$typeof: a,
      type: o,
      key: f,
      ref: l !== void 0 ? l : null,
      props: u
    };
  }
  return Qo.Fragment = n, Qo.jsx = r, Qo.jsxs = r, Qo;
}
var e0;
function Ix() {
  return e0 || (e0 = 1, xd.exports = Gx()), xd.exports;
}
var S = Ix(), Sd = { exports: {} }, wt = {};
var n0;
function Xx() {
  if (n0) return wt;
  n0 = 1;
  var a = /* @__PURE__ */ Symbol.for("react.transitional.element"), n = /* @__PURE__ */ Symbol.for("react.portal"), r = /* @__PURE__ */ Symbol.for("react.fragment"), o = /* @__PURE__ */ Symbol.for("react.strict_mode"), l = /* @__PURE__ */ Symbol.for("react.profiler"), u = /* @__PURE__ */ Symbol.for("react.consumer"), f = /* @__PURE__ */ Symbol.for("react.context"), h = /* @__PURE__ */ Symbol.for("react.forward_ref"), p = /* @__PURE__ */ Symbol.for("react.suspense"), m = /* @__PURE__ */ Symbol.for("react.memo"), g = /* @__PURE__ */ Symbol.for("react.lazy"), v = /* @__PURE__ */ Symbol.for("react.activity"), b = Symbol.iterator;
  function k(T) {
    return T === null || typeof T != "object" ? null : (T = b && T[b] || T["@@iterator"], typeof T == "function" ? T : null);
  }
  var E = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, A = Object.assign, C = {};
  function M(T, _, B) {
    this.props = T, this.context = _, this.refs = C, this.updater = B || E;
  }
  M.prototype.isReactComponent = {}, M.prototype.setState = function(T, _) {
    if (typeof T != "object" && typeof T != "function" && T != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, T, _, "setState");
  }, M.prototype.forceUpdate = function(T) {
    this.updater.enqueueForceUpdate(this, T, "forceUpdate");
  };
  function D() {
  }
  D.prototype = M.prototype;
  function R(T, _, B) {
    this.props = T, this.context = _, this.refs = C, this.updater = B || E;
  }
  var z = R.prototype = new D();
  z.constructor = R, A(z, M.prototype), z.isPureReactComponent = !0;
  var Z = Array.isArray;
  function W() {
  }
  var X = { H: null, A: null, T: null, S: null }, F = Object.prototype.hasOwnProperty;
  function at(T, _, B) {
    var Q = B.ref;
    return {
      $$typeof: a,
      type: T,
      key: _,
      ref: Q !== void 0 ? Q : null,
      props: B
    };
  }
  function rt(T, _) {
    return at(T.type, _, T.props);
  }
  function pt(T) {
    return typeof T == "object" && T !== null && T.$$typeof === a;
  }
  function yt(T) {
    var _ = { "=": "=0", ":": "=2" };
    return "$" + T.replace(/[=:]/g, function(B) {
      return _[B];
    });
  }
  var vt = /\/+/g;
  function Tt(T, _) {
    return typeof T == "object" && T !== null && T.key != null ? yt("" + T.key) : _.toString(36);
  }
  function bt(T) {
    switch (T.status) {
      case "fulfilled":
        return T.value;
      case "rejected":
        throw T.reason;
      default:
        switch (typeof T.status == "string" ? T.then(W, W) : (T.status = "pending", T.then(
          function(_) {
            T.status === "pending" && (T.status = "fulfilled", T.value = _);
          },
          function(_) {
            T.status === "pending" && (T.status = "rejected", T.reason = _);
          }
        )), T.status) {
          case "fulfilled":
            return T.value;
          case "rejected":
            throw T.reason;
        }
    }
    throw T;
  }
  function Y(T, _, B, Q, st) {
    var ot = typeof T;
    (ot === "undefined" || ot === "boolean") && (T = null);
    var ht = !1;
    if (T === null) ht = !0;
    else
      switch (ot) {
        case "bigint":
        case "string":
        case "number":
          ht = !0;
          break;
        case "object":
          switch (T.$$typeof) {
            case a:
            case n:
              ht = !0;
              break;
            case g:
              return ht = T._init, Y(
                ht(T._payload),
                _,
                B,
                Q,
                st
              );
          }
      }
    if (ht)
      return st = st(T), ht = Q === "" ? "." + Tt(T, 0) : Q, Z(st) ? (B = "", ht != null && (B = ht.replace(vt, "$&/") + "/"), Y(st, _, B, "", function(Ze) {
        return Ze;
      })) : st != null && (pt(st) && (st = rt(
        st,
        B + (st.key == null || T && T.key === st.key ? "" : ("" + st.key).replace(
          vt,
          "$&/"
        ) + "/") + ht
      )), _.push(st)), 1;
    ht = 0;
    var Ht = Q === "" ? "." : Q + ":";
    if (Z(T))
      for (var xt = 0; xt < T.length; xt++)
        Q = T[xt], ot = Ht + Tt(Q, xt), ht += Y(
          Q,
          _,
          B,
          ot,
          st
        );
    else if (xt = k(T), typeof xt == "function")
      for (T = xt.call(T), xt = 0; !(Q = T.next()).done; )
        Q = Q.value, ot = Ht + Tt(Q, xt++), ht += Y(
          Q,
          _,
          B,
          ot,
          st
        );
    else if (ot === "object") {
      if (typeof T.then == "function")
        return Y(
          bt(T),
          _,
          B,
          Q,
          st
        );
      throw _ = String(T), Error(
        "Objects are not valid as a React child (found: " + (_ === "[object Object]" ? "object with keys {" + Object.keys(T).join(", ") + "}" : _) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return ht;
  }
  function J(T, _, B) {
    if (T == null) return T;
    var Q = [], st = 0;
    return Y(T, Q, "", "", function(ot) {
      return _.call(B, ot, st++);
    }), Q;
  }
  function et(T) {
    if (T._status === -1) {
      var _ = T._result;
      _ = _(), _.then(
        function(B) {
          (T._status === 0 || T._status === -1) && (T._status = 1, T._result = B);
        },
        function(B) {
          (T._status === 0 || T._status === -1) && (T._status = 2, T._result = B);
        }
      ), T._status === -1 && (T._status = 0, T._result = _);
    }
    if (T._status === 1) return T._result.default;
    throw T._result;
  }
  var $ = typeof reportError == "function" ? reportError : function(T) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var _ = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof T == "object" && T !== null && typeof T.message == "string" ? String(T.message) : String(T),
        error: T
      });
      if (!window.dispatchEvent(_)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", T);
      return;
    }
    console.error(T);
  }, O = {
    map: J,
    forEach: function(T, _, B) {
      J(
        T,
        function() {
          _.apply(this, arguments);
        },
        B
      );
    },
    count: function(T) {
      var _ = 0;
      return J(T, function() {
        _++;
      }), _;
    },
    toArray: function(T) {
      return J(T, function(_) {
        return _;
      }) || [];
    },
    only: function(T) {
      if (!pt(T))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return T;
    }
  };
  return wt.Activity = v, wt.Children = O, wt.Component = M, wt.Fragment = r, wt.Profiler = l, wt.PureComponent = R, wt.StrictMode = o, wt.Suspense = p, wt.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = X, wt.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(T) {
      return X.H.useMemoCache(T);
    }
  }, wt.cache = function(T) {
    return function() {
      return T.apply(null, arguments);
    };
  }, wt.cacheSignal = function() {
    return null;
  }, wt.cloneElement = function(T, _, B) {
    if (T == null)
      throw Error(
        "The argument must be a React element, but you passed " + T + "."
      );
    var Q = A({}, T.props), st = T.key;
    if (_ != null)
      for (ot in _.key !== void 0 && (st = "" + _.key), _)
        !F.call(_, ot) || ot === "key" || ot === "__self" || ot === "__source" || ot === "ref" && _.ref === void 0 || (Q[ot] = _[ot]);
    var ot = arguments.length - 2;
    if (ot === 1) Q.children = B;
    else if (1 < ot) {
      for (var ht = Array(ot), Ht = 0; Ht < ot; Ht++)
        ht[Ht] = arguments[Ht + 2];
      Q.children = ht;
    }
    return at(T.type, st, Q);
  }, wt.createContext = function(T) {
    return T = {
      $$typeof: f,
      _currentValue: T,
      _currentValue2: T,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, T.Provider = T, T.Consumer = {
      $$typeof: u,
      _context: T
    }, T;
  }, wt.createElement = function(T, _, B) {
    var Q, st = {}, ot = null;
    if (_ != null)
      for (Q in _.key !== void 0 && (ot = "" + _.key), _)
        F.call(_, Q) && Q !== "key" && Q !== "__self" && Q !== "__source" && (st[Q] = _[Q]);
    var ht = arguments.length - 2;
    if (ht === 1) st.children = B;
    else if (1 < ht) {
      for (var Ht = Array(ht), xt = 0; xt < ht; xt++)
        Ht[xt] = arguments[xt + 2];
      st.children = Ht;
    }
    if (T && T.defaultProps)
      for (Q in ht = T.defaultProps, ht)
        st[Q] === void 0 && (st[Q] = ht[Q]);
    return at(T, ot, st);
  }, wt.createRef = function() {
    return { current: null };
  }, wt.forwardRef = function(T) {
    return { $$typeof: h, render: T };
  }, wt.isValidElement = pt, wt.lazy = function(T) {
    return {
      $$typeof: g,
      _payload: { _status: -1, _result: T },
      _init: et
    };
  }, wt.memo = function(T, _) {
    return {
      $$typeof: m,
      type: T,
      compare: _ === void 0 ? null : _
    };
  }, wt.startTransition = function(T) {
    var _ = X.T, B = {};
    X.T = B;
    try {
      var Q = T(), st = X.S;
      st !== null && st(B, Q), typeof Q == "object" && Q !== null && typeof Q.then == "function" && Q.then(W, $);
    } catch (ot) {
      $(ot);
    } finally {
      _ !== null && B.types !== null && (_.types = B.types), X.T = _;
    }
  }, wt.unstable_useCacheRefresh = function() {
    return X.H.useCacheRefresh();
  }, wt.use = function(T) {
    return X.H.use(T);
  }, wt.useActionState = function(T, _, B) {
    return X.H.useActionState(T, _, B);
  }, wt.useCallback = function(T, _) {
    return X.H.useCallback(T, _);
  }, wt.useContext = function(T) {
    return X.H.useContext(T);
  }, wt.useDebugValue = function() {
  }, wt.useDeferredValue = function(T, _) {
    return X.H.useDeferredValue(T, _);
  }, wt.useEffect = function(T, _) {
    return X.H.useEffect(T, _);
  }, wt.useEffectEvent = function(T) {
    return X.H.useEffectEvent(T);
  }, wt.useId = function() {
    return X.H.useId();
  }, wt.useImperativeHandle = function(T, _, B) {
    return X.H.useImperativeHandle(T, _, B);
  }, wt.useInsertionEffect = function(T, _) {
    return X.H.useInsertionEffect(T, _);
  }, wt.useLayoutEffect = function(T, _) {
    return X.H.useLayoutEffect(T, _);
  }, wt.useMemo = function(T, _) {
    return X.H.useMemo(T, _);
  }, wt.useOptimistic = function(T, _) {
    return X.H.useOptimistic(T, _);
  }, wt.useReducer = function(T, _, B) {
    return X.H.useReducer(T, _, B);
  }, wt.useRef = function(T) {
    return X.H.useRef(T);
  }, wt.useState = function(T) {
    return X.H.useState(T);
  }, wt.useSyncExternalStore = function(T, _, B) {
    return X.H.useSyncExternalStore(
      T,
      _,
      B
    );
  }, wt.useTransition = function() {
    return X.H.useTransition();
  }, wt.version = "19.2.7", wt;
}
var a0;
function Bf() {
  return a0 || (a0 = 1, Sd.exports = Xx()), Sd.exports;
}
var x = Bf(), kd = { exports: {} }, Zo = {}, Td = { exports: {} }, Ed = {};
var i0;
function Wx() {
  return i0 || (i0 = 1, (function(a) {
    function n(Y, J) {
      var et = Y.length;
      Y.push(J);
      t: for (; 0 < et; ) {
        var $ = et - 1 >>> 1, O = Y[$];
        if (0 < l(O, J))
          Y[$] = J, Y[et] = O, et = $;
        else break t;
      }
    }
    function r(Y) {
      return Y.length === 0 ? null : Y[0];
    }
    function o(Y) {
      if (Y.length === 0) return null;
      var J = Y[0], et = Y.pop();
      if (et !== J) {
        Y[0] = et;
        t: for (var $ = 0, O = Y.length, T = O >>> 1; $ < T; ) {
          var _ = 2 * ($ + 1) - 1, B = Y[_], Q = _ + 1, st = Y[Q];
          if (0 > l(B, et))
            Q < O && 0 > l(st, B) ? (Y[$] = st, Y[Q] = et, $ = Q) : (Y[$] = B, Y[_] = et, $ = _);
          else if (Q < O && 0 > l(st, et))
            Y[$] = st, Y[Q] = et, $ = Q;
          else break t;
        }
      }
      return J;
    }
    function l(Y, J) {
      var et = Y.sortIndex - J.sortIndex;
      return et !== 0 ? et : Y.id - J.id;
    }
    if (a.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var u = performance;
      a.unstable_now = function() {
        return u.now();
      };
    } else {
      var f = Date, h = f.now();
      a.unstable_now = function() {
        return f.now() - h;
      };
    }
    var p = [], m = [], g = 1, v = null, b = 3, k = !1, E = !1, A = !1, C = !1, M = typeof setTimeout == "function" ? setTimeout : null, D = typeof clearTimeout == "function" ? clearTimeout : null, R = typeof setImmediate < "u" ? setImmediate : null;
    function z(Y) {
      for (var J = r(m); J !== null; ) {
        if (J.callback === null) o(m);
        else if (J.startTime <= Y)
          o(m), J.sortIndex = J.expirationTime, n(p, J);
        else break;
        J = r(m);
      }
    }
    function Z(Y) {
      if (A = !1, z(Y), !E)
        if (r(p) !== null)
          E = !0, W || (W = !0, yt());
        else {
          var J = r(m);
          J !== null && bt(Z, J.startTime - Y);
        }
    }
    var W = !1, X = -1, F = 5, at = -1;
    function rt() {
      return C ? !0 : !(a.unstable_now() - at < F);
    }
    function pt() {
      if (C = !1, W) {
        var Y = a.unstable_now();
        at = Y;
        var J = !0;
        try {
          t: {
            E = !1, A && (A = !1, D(X), X = -1), k = !0;
            var et = b;
            try {
              e: {
                for (z(Y), v = r(p); v !== null && !(v.expirationTime > Y && rt()); ) {
                  var $ = v.callback;
                  if (typeof $ == "function") {
                    v.callback = null, b = v.priorityLevel;
                    var O = $(
                      v.expirationTime <= Y
                    );
                    if (Y = a.unstable_now(), typeof O == "function") {
                      v.callback = O, z(Y), J = !0;
                      break e;
                    }
                    v === r(p) && o(p), z(Y);
                  } else o(p);
                  v = r(p);
                }
                if (v !== null) J = !0;
                else {
                  var T = r(m);
                  T !== null && bt(
                    Z,
                    T.startTime - Y
                  ), J = !1;
                }
              }
              break t;
            } finally {
              v = null, b = et, k = !1;
            }
            J = void 0;
          }
        } finally {
          J ? yt() : W = !1;
        }
      }
    }
    var yt;
    if (typeof R == "function")
      yt = function() {
        R(pt);
      };
    else if (typeof MessageChannel < "u") {
      var vt = new MessageChannel(), Tt = vt.port2;
      vt.port1.onmessage = pt, yt = function() {
        Tt.postMessage(null);
      };
    } else
      yt = function() {
        M(pt, 0);
      };
    function bt(Y, J) {
      X = M(function() {
        Y(a.unstable_now());
      }, J);
    }
    a.unstable_IdlePriority = 5, a.unstable_ImmediatePriority = 1, a.unstable_LowPriority = 4, a.unstable_NormalPriority = 3, a.unstable_Profiling = null, a.unstable_UserBlockingPriority = 2, a.unstable_cancelCallback = function(Y) {
      Y.callback = null;
    }, a.unstable_forceFrameRate = function(Y) {
      0 > Y || 125 < Y ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : F = 0 < Y ? Math.floor(1e3 / Y) : 5;
    }, a.unstable_getCurrentPriorityLevel = function() {
      return b;
    }, a.unstable_next = function(Y) {
      switch (b) {
        case 1:
        case 2:
        case 3:
          var J = 3;
          break;
        default:
          J = b;
      }
      var et = b;
      b = J;
      try {
        return Y();
      } finally {
        b = et;
      }
    }, a.unstable_requestPaint = function() {
      C = !0;
    }, a.unstable_runWithPriority = function(Y, J) {
      switch (Y) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          Y = 3;
      }
      var et = b;
      b = Y;
      try {
        return J();
      } finally {
        b = et;
      }
    }, a.unstable_scheduleCallback = function(Y, J, et) {
      var $ = a.unstable_now();
      switch (typeof et == "object" && et !== null ? (et = et.delay, et = typeof et == "number" && 0 < et ? $ + et : $) : et = $, Y) {
        case 1:
          var O = -1;
          break;
        case 2:
          O = 250;
          break;
        case 5:
          O = 1073741823;
          break;
        case 4:
          O = 1e4;
          break;
        default:
          O = 5e3;
      }
      return O = et + O, Y = {
        id: g++,
        callback: J,
        priorityLevel: Y,
        startTime: et,
        expirationTime: O,
        sortIndex: -1
      }, et > $ ? (Y.sortIndex = et, n(m, Y), r(p) === null && Y === r(m) && (A ? (D(X), X = -1) : A = !0, bt(Z, et - $))) : (Y.sortIndex = O, n(p, Y), E || k || (E = !0, W || (W = !0, yt()))), Y;
    }, a.unstable_shouldYield = rt, a.unstable_wrapCallback = function(Y) {
      var J = b;
      return function() {
        var et = b;
        b = J;
        try {
          return Y.apply(this, arguments);
        } finally {
          b = et;
        }
      };
    };
  })(Ed)), Ed;
}
var r0;
function Qx() {
  return r0 || (r0 = 1, Td.exports = Wx()), Td.exports;
}
var Md = { exports: {} }, We = {};
var o0;
function Zx() {
  if (o0) return We;
  o0 = 1;
  var a = Bf();
  function n(p) {
    var m = "https://react.dev/errors/" + p;
    if (1 < arguments.length) {
      m += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var g = 2; g < arguments.length; g++)
        m += "&args[]=" + encodeURIComponent(arguments[g]);
    }
    return "Minified React error #" + p + "; visit " + m + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function r() {
  }
  var o = {
    d: {
      f: r,
      r: function() {
        throw Error(n(522));
      },
      D: r,
      C: r,
      L: r,
      m: r,
      X: r,
      S: r,
      M: r
    },
    p: 0,
    findDOMNode: null
  }, l = /* @__PURE__ */ Symbol.for("react.portal");
  function u(p, m, g) {
    var v = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: l,
      key: v == null ? null : "" + v,
      children: p,
      containerInfo: m,
      implementation: g
    };
  }
  var f = a.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function h(p, m) {
    if (p === "font") return "";
    if (typeof m == "string")
      return m === "use-credentials" ? m : "";
  }
  return We.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = o, We.createPortal = function(p, m) {
    var g = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!m || m.nodeType !== 1 && m.nodeType !== 9 && m.nodeType !== 11)
      throw Error(n(299));
    return u(p, m, null, g);
  }, We.flushSync = function(p) {
    var m = f.T, g = o.p;
    try {
      if (f.T = null, o.p = 2, p) return p();
    } finally {
      f.T = m, o.p = g, o.d.f();
    }
  }, We.preconnect = function(p, m) {
    typeof p == "string" && (m ? (m = m.crossOrigin, m = typeof m == "string" ? m === "use-credentials" ? m : "" : void 0) : m = null, o.d.C(p, m));
  }, We.prefetchDNS = function(p) {
    typeof p == "string" && o.d.D(p);
  }, We.preinit = function(p, m) {
    if (typeof p == "string" && m && typeof m.as == "string") {
      var g = m.as, v = h(g, m.crossOrigin), b = typeof m.integrity == "string" ? m.integrity : void 0, k = typeof m.fetchPriority == "string" ? m.fetchPriority : void 0;
      g === "style" ? o.d.S(
        p,
        typeof m.precedence == "string" ? m.precedence : void 0,
        {
          crossOrigin: v,
          integrity: b,
          fetchPriority: k
        }
      ) : g === "script" && o.d.X(p, {
        crossOrigin: v,
        integrity: b,
        fetchPriority: k,
        nonce: typeof m.nonce == "string" ? m.nonce : void 0
      });
    }
  }, We.preinitModule = function(p, m) {
    if (typeof p == "string")
      if (typeof m == "object" && m !== null) {
        if (m.as == null || m.as === "script") {
          var g = h(
            m.as,
            m.crossOrigin
          );
          o.d.M(p, {
            crossOrigin: g,
            integrity: typeof m.integrity == "string" ? m.integrity : void 0,
            nonce: typeof m.nonce == "string" ? m.nonce : void 0
          });
        }
      } else m == null && o.d.M(p);
  }, We.preload = function(p, m) {
    if (typeof p == "string" && typeof m == "object" && m !== null && typeof m.as == "string") {
      var g = m.as, v = h(g, m.crossOrigin);
      o.d.L(p, g, {
        crossOrigin: v,
        integrity: typeof m.integrity == "string" ? m.integrity : void 0,
        nonce: typeof m.nonce == "string" ? m.nonce : void 0,
        type: typeof m.type == "string" ? m.type : void 0,
        fetchPriority: typeof m.fetchPriority == "string" ? m.fetchPriority : void 0,
        referrerPolicy: typeof m.referrerPolicy == "string" ? m.referrerPolicy : void 0,
        imageSrcSet: typeof m.imageSrcSet == "string" ? m.imageSrcSet : void 0,
        imageSizes: typeof m.imageSizes == "string" ? m.imageSizes : void 0,
        media: typeof m.media == "string" ? m.media : void 0
      });
    }
  }, We.preloadModule = function(p, m) {
    if (typeof p == "string")
      if (m) {
        var g = h(m.as, m.crossOrigin);
        o.d.m(p, {
          as: typeof m.as == "string" && m.as !== "script" ? m.as : void 0,
          crossOrigin: g,
          integrity: typeof m.integrity == "string" ? m.integrity : void 0
        });
      } else o.d.m(p);
  }, We.requestFormReset = function(p) {
    o.d.r(p);
  }, We.unstable_batchedUpdates = function(p, m) {
    return p(m);
  }, We.useFormState = function(p, m, g) {
    return f.H.useFormState(p, m, g);
  }, We.useFormStatus = function() {
    return f.H.useHostTransitionStatus();
  }, We.version = "19.2.7", We;
}
var s0;
function cv() {
  if (s0) return Md.exports;
  s0 = 1;
  function a() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a);
      } catch (n) {
        console.error(n);
      }
  }
  return a(), Md.exports = Zx(), Md.exports;
}
var l0;
function Jx() {
  if (l0) return Zo;
  l0 = 1;
  var a = Qx(), n = Bf(), r = cv();
  function o(t) {
    var e = "https://react.dev/errors/" + t;
    if (1 < arguments.length) {
      e += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var i = 2; i < arguments.length; i++)
        e += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + t + "; visit " + e + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function l(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11);
  }
  function u(t) {
    var e = t, i = t;
    if (t.alternate) for (; e.return; ) e = e.return;
    else {
      t = e;
      do
        e = t, (e.flags & 4098) !== 0 && (i = e.return), t = e.return;
      while (t);
    }
    return e.tag === 3 ? i : null;
  }
  function f(t) {
    if (t.tag === 13) {
      var e = t.memoizedState;
      if (e === null && (t = t.alternate, t !== null && (e = t.memoizedState)), e !== null) return e.dehydrated;
    }
    return null;
  }
  function h(t) {
    if (t.tag === 31) {
      var e = t.memoizedState;
      if (e === null && (t = t.alternate, t !== null && (e = t.memoizedState)), e !== null) return e.dehydrated;
    }
    return null;
  }
  function p(t) {
    if (u(t) !== t)
      throw Error(o(188));
  }
  function m(t) {
    var e = t.alternate;
    if (!e) {
      if (e = u(t), e === null) throw Error(o(188));
      return e !== t ? null : t;
    }
    for (var i = t, s = e; ; ) {
      var c = i.return;
      if (c === null) break;
      var d = c.alternate;
      if (d === null) {
        if (s = c.return, s !== null) {
          i = s;
          continue;
        }
        break;
      }
      if (c.child === d.child) {
        for (d = c.child; d; ) {
          if (d === i) return p(c), t;
          if (d === s) return p(c), e;
          d = d.sibling;
        }
        throw Error(o(188));
      }
      if (i.return !== s.return) i = c, s = d;
      else {
        for (var y = !1, w = c.child; w; ) {
          if (w === i) {
            y = !0, i = c, s = d;
            break;
          }
          if (w === s) {
            y = !0, s = c, i = d;
            break;
          }
          w = w.sibling;
        }
        if (!y) {
          for (w = d.child; w; ) {
            if (w === i) {
              y = !0, i = d, s = c;
              break;
            }
            if (w === s) {
              y = !0, s = d, i = c;
              break;
            }
            w = w.sibling;
          }
          if (!y) throw Error(o(189));
        }
      }
      if (i.alternate !== s) throw Error(o(190));
    }
    if (i.tag !== 3) throw Error(o(188));
    return i.stateNode.current === i ? t : e;
  }
  function g(t) {
    var e = t.tag;
    if (e === 5 || e === 26 || e === 27 || e === 6) return t;
    for (t = t.child; t !== null; ) {
      if (e = g(t), e !== null) return e;
      t = t.sibling;
    }
    return null;
  }
  var v = Object.assign, b = /* @__PURE__ */ Symbol.for("react.element"), k = /* @__PURE__ */ Symbol.for("react.transitional.element"), E = /* @__PURE__ */ Symbol.for("react.portal"), A = /* @__PURE__ */ Symbol.for("react.fragment"), C = /* @__PURE__ */ Symbol.for("react.strict_mode"), M = /* @__PURE__ */ Symbol.for("react.profiler"), D = /* @__PURE__ */ Symbol.for("react.consumer"), R = /* @__PURE__ */ Symbol.for("react.context"), z = /* @__PURE__ */ Symbol.for("react.forward_ref"), Z = /* @__PURE__ */ Symbol.for("react.suspense"), W = /* @__PURE__ */ Symbol.for("react.suspense_list"), X = /* @__PURE__ */ Symbol.for("react.memo"), F = /* @__PURE__ */ Symbol.for("react.lazy"), at = /* @__PURE__ */ Symbol.for("react.activity"), rt = /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel"), pt = Symbol.iterator;
  function yt(t) {
    return t === null || typeof t != "object" ? null : (t = pt && t[pt] || t["@@iterator"], typeof t == "function" ? t : null);
  }
  var vt = /* @__PURE__ */ Symbol.for("react.client.reference");
  function Tt(t) {
    if (t == null) return null;
    if (typeof t == "function")
      return t.$$typeof === vt ? null : t.displayName || t.name || null;
    if (typeof t == "string") return t;
    switch (t) {
      case A:
        return "Fragment";
      case M:
        return "Profiler";
      case C:
        return "StrictMode";
      case Z:
        return "Suspense";
      case W:
        return "SuspenseList";
      case at:
        return "Activity";
    }
    if (typeof t == "object")
      switch (t.$$typeof) {
        case E:
          return "Portal";
        case R:
          return t.displayName || "Context";
        case D:
          return (t._context.displayName || "Context") + ".Consumer";
        case z:
          var e = t.render;
          return t = t.displayName, t || (t = e.displayName || e.name || "", t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef"), t;
        case X:
          return e = t.displayName || null, e !== null ? e : Tt(t.type) || "Memo";
        case F:
          e = t._payload, t = t._init;
          try {
            return Tt(t(e));
          } catch {
          }
      }
    return null;
  }
  var bt = Array.isArray, Y = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, J = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, et = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, $ = [], O = -1;
  function T(t) {
    return { current: t };
  }
  function _(t) {
    0 > O || (t.current = $[O], $[O] = null, O--);
  }
  function B(t, e) {
    O++, $[O] = t.current, t.current = e;
  }
  var Q = T(null), st = T(null), ot = T(null), ht = T(null);
  function Ht(t, e) {
    switch (B(ot, e), B(st, t), B(Q, null), e.nodeType) {
      case 9:
      case 11:
        t = (t = e.documentElement) && (t = t.namespaceURI) ? kg(t) : 0;
        break;
      default:
        if (t = e.tagName, e = e.namespaceURI)
          e = kg(e), t = Tg(e, t);
        else
          switch (t) {
            case "svg":
              t = 1;
              break;
            case "math":
              t = 2;
              break;
            default:
              t = 0;
          }
    }
    _(Q), B(Q, t);
  }
  function xt() {
    _(Q), _(st), _(ot);
  }
  function Ze(t) {
    t.memoizedState !== null && B(ht, t);
    var e = Q.current, i = Tg(e, t.type);
    e !== i && (B(st, t), B(Q, i));
  }
  function Ke(t) {
    st.current === t && (_(Q), _(st)), ht.current === t && (_(ht), Go._currentValue = et);
  }
  var Je, on;
  function qe(t) {
    if (Je === void 0)
      try {
        throw Error();
      } catch (i) {
        var e = i.stack.trim().match(/\n( *(at )?)/);
        Je = e && e[1] || "", on = -1 < i.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < i.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + Je + t + on;
  }
  var Fe = !1;
  function Ot(t, e) {
    if (!t || Fe) return "";
    Fe = !0;
    var i = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var s = {
        DetermineComponentFrameRoot: function() {
          try {
            if (e) {
              var I = function() {
                throw Error();
              };
              if (Object.defineProperty(I.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(I, []);
                } catch (K) {
                  var P = K;
                }
                Reflect.construct(t, [], I);
              } else {
                try {
                  I.call();
                } catch (K) {
                  P = K;
                }
                t.call(I.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (K) {
                P = K;
              }
              (I = t()) && typeof I.catch == "function" && I.catch(function() {
              });
            }
          } catch (K) {
            if (K && P && typeof K.stack == "string")
              return [K.stack, P.stack];
          }
          return [null, null];
        }
      };
      s.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var c = Object.getOwnPropertyDescriptor(
        s.DetermineComponentFrameRoot,
        "name"
      );
      c && c.configurable && Object.defineProperty(
        s.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var d = s.DetermineComponentFrameRoot(), y = d[0], w = d[1];
      if (y && w) {
        var j = y.split(`
`), V = w.split(`
`);
        for (c = s = 0; s < j.length && !j[s].includes("DetermineComponentFrameRoot"); )
          s++;
        for (; c < V.length && !V[c].includes(
          "DetermineComponentFrameRoot"
        ); )
          c++;
        if (s === j.length || c === V.length)
          for (s = j.length - 1, c = V.length - 1; 1 <= s && 0 <= c && j[s] !== V[c]; )
            c--;
        for (; 1 <= s && 0 <= c; s--, c--)
          if (j[s] !== V[c]) {
            if (s !== 1 || c !== 1)
              do
                if (s--, c--, 0 > c || j[s] !== V[c]) {
                  var q = `
` + j[s].replace(" at new ", " at ");
                  return t.displayName && q.includes("<anonymous>") && (q = q.replace("<anonymous>", t.displayName)), q;
                }
              while (1 <= s && 0 <= c);
            break;
          }
      }
    } finally {
      Fe = !1, Error.prepareStackTrace = i;
    }
    return (i = t ? t.displayName || t.name : "") ? qe(i) : "";
  }
  function Te(t, e) {
    switch (t.tag) {
      case 26:
      case 27:
      case 5:
        return qe(t.type);
      case 16:
        return qe("Lazy");
      case 13:
        return t.child !== e && e !== null ? qe("Suspense Fallback") : qe("Suspense");
      case 19:
        return qe("SuspenseList");
      case 0:
      case 15:
        return Ot(t.type, !1);
      case 11:
        return Ot(t.type.render, !1);
      case 1:
        return Ot(t.type, !0);
      case 31:
        return qe("Activity");
      default:
        return "";
    }
  }
  function Cn(t) {
    try {
      var e = "", i = null;
      do
        e += Te(t, i), i = t, t = t.return;
      while (t);
      return e;
    } catch (s) {
      return `
Error generating stack: ` + s.message + `
` + s.stack;
    }
  }
  var $e = Object.prototype.hasOwnProperty, An = a.unstable_scheduleCallback, sn = a.unstable_cancelCallback, Ge = a.unstable_shouldYield, Xn = a.unstable_requestPaint, De = a.unstable_now, ya = a.unstable_getCurrentPriorityLevel, nt = a.unstable_ImmediatePriority, it = a.unstable_UserBlockingPriority, Lt = a.unstable_NormalPriority, Rt = a.unstable_LowPriority, ie = a.unstable_IdlePriority, se = a.log, Bt = a.unstable_setDisableYieldValue, le = null, Ee = null;
  function Ut(t) {
    if (typeof se == "function" && Bt(t), Ee && typeof Ee.setStrictMode == "function")
      try {
        Ee.setStrictMode(le, t);
      } catch {
      }
  }
  var je = Math.clz32 ? Math.clz32 : ln, Wn = Math.log, Ne = Math.LN2;
  function ln(t) {
    return t >>>= 0, t === 0 ? 32 : 31 - (Wn(t) / Ne | 0) | 0;
  }
  var ia = 256, Si = 262144, ir = 4194304;
  function yn(t) {
    var e = t & 42;
    if (e !== 0) return e;
    switch (t & -t) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return t & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return t & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return t;
    }
  }
  function ki(t, e, i) {
    var s = t.pendingLanes;
    if (s === 0) return 0;
    var c = 0, d = t.suspendedLanes, y = t.pingedLanes;
    t = t.warmLanes;
    var w = s & 134217727;
    return w !== 0 ? (s = w & ~d, s !== 0 ? c = yn(s) : (y &= w, y !== 0 ? c = yn(y) : i || (i = w & ~t, i !== 0 && (c = yn(i))))) : (w = s & ~d, w !== 0 ? c = yn(w) : y !== 0 ? c = yn(y) : i || (i = s & ~t, i !== 0 && (c = yn(i)))), c === 0 ? 0 : e !== 0 && e !== c && (e & d) === 0 && (d = c & -c, i = e & -e, d >= i || d === 32 && (i & 4194048) !== 0) ? e : c;
  }
  function Ti(t, e) {
    return (t.pendingLanes & ~(t.suspendedLanes & ~t.pingedLanes) & e) === 0;
  }
  function vn(t, e) {
    switch (t) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return e + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function rr() {
    var t = ir;
    return ir <<= 1, (ir & 62914560) === 0 && (ir = 4194304), t;
  }
  function Va(t) {
    for (var e = [], i = 0; 31 > i; i++) e.push(t);
    return e;
  }
  function Qn(t, e) {
    t.pendingLanes |= e, e !== 268435456 && (t.suspendedLanes = 0, t.pingedLanes = 0, t.warmLanes = 0);
  }
  function Ei(t, e, i, s, c, d) {
    var y = t.pendingLanes;
    t.pendingLanes = i, t.suspendedLanes = 0, t.pingedLanes = 0, t.warmLanes = 0, t.expiredLanes &= i, t.entangledLanes &= i, t.errorRecoveryDisabledLanes &= i, t.shellSuspendCounter = 0;
    var w = t.entanglements, j = t.expirationTimes, V = t.hiddenUpdates;
    for (i = y & ~i; 0 < i; ) {
      var q = 31 - je(i), I = 1 << q;
      w[q] = 0, j[q] = -1;
      var P = V[q];
      if (P !== null)
        for (V[q] = null, q = 0; q < P.length; q++) {
          var K = P[q];
          K !== null && (K.lane &= -536870913);
        }
      i &= ~I;
    }
    s !== 0 && ws(t, s, 0), d !== 0 && c === 0 && t.tag !== 0 && (t.suspendedLanes |= d & ~(y & ~e));
  }
  function ws(t, e, i) {
    t.pendingLanes |= e, t.suspendedLanes &= ~e;
    var s = 31 - je(e);
    t.entangledLanes |= e, t.entanglements[s] = t.entanglements[s] | 1073741824 | i & 261930;
  }
  function to(t, e) {
    var i = t.entangledLanes |= e;
    for (t = t.entanglements; i; ) {
      var s = 31 - je(i), c = 1 << s;
      c & e | t[s] & e && (t[s] |= e), i &= ~c;
    }
  }
  function xs(t, e) {
    var i = e & -e;
    return i = (i & 42) !== 0 ? 1 : eo(i), (i & (t.suspendedLanes | e)) !== 0 ? 0 : i;
  }
  function eo(t) {
    switch (t) {
      case 2:
        t = 1;
        break;
      case 8:
        t = 4;
        break;
      case 32:
        t = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        t = 128;
        break;
      case 268435456:
        t = 134217728;
        break;
      default:
        t = 0;
    }
    return t;
  }
  function no(t) {
    return t &= -t, 2 < t ? 8 < t ? (t & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function jn() {
    var t = J.p;
    return t !== 0 ? t : (t = window.event, t === void 0 ? 32 : Ig(t.type));
  }
  function ao(t, e) {
    var i = J.p;
    try {
      return J.p = t, e();
    } finally {
      J.p = i;
    }
  }
  var ye = Math.random().toString(36).slice(2), he = "__reactFiber$" + ye, Oe = "__reactProps$" + ye, Ln = "__reactContainer$" + ye, io = "__reactEvents$" + ye, or = "__reactListeners$" + ye, wc = "__reactHandles$" + ye, Ss = "__reactResources$" + ye, Ha = "__reactMarker$" + ye;
  function Mi(t) {
    delete t[he], delete t[Oe], delete t[io], delete t[or], delete t[wc];
  }
  function Pa(t) {
    var e = t[he];
    if (e) return e;
    for (var i = t.parentNode; i; ) {
      if (e = i[Ln] || i[he]) {
        if (i = e.alternate, e.child !== null || i !== null && i.child !== null)
          for (t = Lg(t); t !== null; ) {
            if (i = t[he]) return i;
            t = Lg(t);
          }
        return e;
      }
      t = i, i = t.parentNode;
    }
    return null;
  }
  function Ya(t) {
    if (t = t[he] || t[Ln]) {
      var e = t.tag;
      if (e === 5 || e === 6 || e === 13 || e === 31 || e === 26 || e === 27 || e === 3)
        return t;
    }
    return null;
  }
  function va(t) {
    var e = t.tag;
    if (e === 5 || e === 26 || e === 27 || e === 6) return t.stateNode;
    throw Error(o(33));
  }
  function Ka(t) {
    var e = t[Ss];
    return e || (e = t[Ss] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), e;
  }
  function pe(t) {
    t[Ha] = !0;
  }
  var Ri = /* @__PURE__ */ new Set(), Ci = {};
  function Dn(t, e) {
    ba(t, e), ba(t + "Capture", e);
  }
  function ba(t, e) {
    for (Ci[t] = e, t = 0; t < e.length; t++)
      Ri.add(e[t]);
  }
  var ro = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), oo = {}, so = {};
  function sr(t) {
    return $e.call(so, t) ? !0 : $e.call(oo, t) ? !1 : ro.test(t) ? so[t] = !0 : (oo[t] = !0, !1);
  }
  function Me(t, e, i) {
    if (sr(e))
      if (i === null) t.removeAttribute(e);
      else {
        switch (typeof i) {
          case "undefined":
          case "function":
          case "symbol":
            t.removeAttribute(e);
            return;
          case "boolean":
            var s = e.toLowerCase().slice(0, 5);
            if (s !== "data-" && s !== "aria-") {
              t.removeAttribute(e);
              return;
            }
        }
        t.setAttribute(e, "" + i);
      }
  }
  function Ai(t, e, i) {
    if (i === null) t.removeAttribute(e);
    else {
      switch (typeof i) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          t.removeAttribute(e);
          return;
      }
      t.setAttribute(e, "" + i);
    }
  }
  function H(t, e, i, s) {
    if (s === null) t.removeAttribute(i);
    else {
      switch (typeof s) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          t.removeAttribute(i);
          return;
      }
      t.setAttributeNS(e, i, "" + s);
    }
  }
  function lt(t) {
    switch (typeof t) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return t;
      case "object":
        return t;
      default:
        return "";
    }
  }
  function mt(t) {
    var e = t.type;
    return (t = t.nodeName) && t.toLowerCase() === "input" && (e === "checkbox" || e === "radio");
  }
  function Et(t, e, i) {
    var s = Object.getOwnPropertyDescriptor(
      t.constructor.prototype,
      e
    );
    if (!t.hasOwnProperty(e) && typeof s < "u" && typeof s.get == "function" && typeof s.set == "function") {
      var c = s.get, d = s.set;
      return Object.defineProperty(t, e, {
        configurable: !0,
        get: function() {
          return c.call(this);
        },
        set: function(y) {
          i = "" + y, d.call(this, y);
        }
      }), Object.defineProperty(t, e, {
        enumerable: s.enumerable
      }), {
        getValue: function() {
          return i;
        },
        setValue: function(y) {
          i = "" + y;
        },
        stopTracking: function() {
          t._valueTracker = null, delete t[e];
        }
      };
    }
  }
  function Mt(t) {
    if (!t._valueTracker) {
      var e = mt(t) ? "checked" : "value";
      t._valueTracker = Et(
        t,
        e,
        "" + t[e]
      );
    }
  }
  function Re(t) {
    if (!t) return !1;
    var e = t._valueTracker;
    if (!e) return !0;
    var i = e.getValue(), s = "";
    return t && (s = mt(t) ? t.checked ? "true" : "false" : t.value), t = s, t !== i ? (e.setValue(t), !0) : !1;
  }
  function _t(t) {
    if (t = t || (typeof document < "u" ? document : void 0), typeof t > "u") return null;
    try {
      return t.activeElement || t.body;
    } catch {
      return t.body;
    }
  }
  var Ie = /[\n"\\]/g;
  function te(t) {
    return t.replace(
      Ie,
      function(e) {
        return "\\" + e.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function _e(t, e, i, s, c, d, y, w) {
    t.name = "", y != null && typeof y != "function" && typeof y != "symbol" && typeof y != "boolean" ? t.type = y : t.removeAttribute("type"), e != null ? y === "number" ? (e === 0 && t.value === "" || t.value != e) && (t.value = "" + lt(e)) : t.value !== "" + lt(e) && (t.value = "" + lt(e)) : y !== "submit" && y !== "reset" || t.removeAttribute("value"), e != null ? Nn(t, y, lt(e)) : i != null ? Nn(t, y, lt(i)) : s != null && t.removeAttribute("value"), c == null && d != null && (t.defaultChecked = !!d), c != null && (t.checked = c && typeof c != "function" && typeof c != "symbol"), w != null && typeof w != "function" && typeof w != "symbol" && typeof w != "boolean" ? t.name = "" + lt(w) : t.removeAttribute("name");
  }
  function cn(t, e, i, s, c, d, y, w) {
    if (d != null && typeof d != "function" && typeof d != "symbol" && typeof d != "boolean" && (t.type = d), e != null || i != null) {
      if (!(d !== "submit" && d !== "reset" || e != null)) {
        Mt(t);
        return;
      }
      i = i != null ? "" + lt(i) : "", e = e != null ? "" + lt(e) : i, w || e === t.value || (t.value = e), t.defaultValue = e;
    }
    s = s ?? c, s = typeof s != "function" && typeof s != "symbol" && !!s, t.checked = w ? t.checked : !!s, t.defaultChecked = !!s, y != null && typeof y != "function" && typeof y != "symbol" && typeof y != "boolean" && (t.name = y), Mt(t);
  }
  function Nn(t, e, i) {
    e === "number" && _t(t.ownerDocument) === t || t.defaultValue === "" + i || (t.defaultValue = "" + i);
  }
  function ze(t, e, i, s) {
    if (t = t.options, e) {
      e = {};
      for (var c = 0; c < i.length; c++)
        e["$" + i[c]] = !0;
      for (i = 0; i < t.length; i++)
        c = e.hasOwnProperty("$" + t[i].value), t[i].selected !== c && (t[i].selected = c), c && s && (t[i].defaultSelected = !0);
    } else {
      for (i = "" + lt(i), e = null, c = 0; c < t.length; c++) {
        if (t[c].value === i) {
          t[c].selected = !0, s && (t[c].defaultSelected = !0);
          return;
        }
        e !== null || t[c].disabled || (e = t[c]);
      }
      e !== null && (e.selected = !0);
    }
  }
  function qt(t, e, i) {
    if (e != null && (e = "" + lt(e), e !== t.value && (t.value = e), i == null)) {
      t.defaultValue !== e && (t.defaultValue = e);
      return;
    }
    t.defaultValue = i != null ? "" + lt(i) : "";
  }
  function Ct(t, e, i, s) {
    if (e == null) {
      if (s != null) {
        if (i != null) throw Error(o(92));
        if (bt(s)) {
          if (1 < s.length) throw Error(o(93));
          s = s[0];
        }
        i = s;
      }
      i == null && (i = ""), e = i;
    }
    i = lt(e), t.defaultValue = i, s = t.textContent, s === i && s !== "" && s !== null && (t.value = s), Mt(t);
  }
  function Vt(t, e) {
    if (e) {
      var i = t.firstChild;
      if (i && i === t.lastChild && i.nodeType === 3) {
        i.nodeValue = e;
        return;
      }
    }
    t.textContent = e;
  }
  var It = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function tn(t, e, i) {
    var s = e.indexOf("--") === 0;
    i == null || typeof i == "boolean" || i === "" ? s ? t.setProperty(e, "") : e === "float" ? t.cssFloat = "" : t[e] = "" : s ? t.setProperty(e, i) : typeof i != "number" || i === 0 || It.has(e) ? e === "float" ? t.cssFloat = i : t[e] = ("" + i).trim() : t[e] = i + "px";
  }
  function bn(t, e, i) {
    if (e != null && typeof e != "object")
      throw Error(o(62));
    if (t = t.style, i != null) {
      for (var s in i)
        !i.hasOwnProperty(s) || e != null && e.hasOwnProperty(s) || (s.indexOf("--") === 0 ? t.setProperty(s, "") : s === "float" ? t.cssFloat = "" : t[s] = "");
      for (var c in e)
        s = e[c], e.hasOwnProperty(c) && i[c] !== s && tn(t, c, s);
    } else
      for (var d in e)
        e.hasOwnProperty(d) && tn(t, d, e[d]);
  }
  function Xe(t) {
    if (t.indexOf("-") === -1) return !1;
    switch (t) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var qa = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), Fa = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function Ga(t) {
    return Fa.test("" + t) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : t;
  }
  function On() {
  }
  var lo = null;
  function ve(t) {
    return t = t.target || t.srcElement || window, t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === 3 ? t.parentNode : t;
  }
  var un = null, ra = null;
  function ee(t) {
    var e = Ya(t);
    if (e && (t = e.stateNode)) {
      var i = t[Oe] || null;
      t: switch (t = e.stateNode, e.type) {
        case "input":
          if (_e(
            t,
            i.value,
            i.defaultValue,
            i.defaultValue,
            i.checked,
            i.defaultChecked,
            i.type,
            i.name
          ), e = i.name, i.type === "radio" && e != null) {
            for (i = t; i.parentNode; ) i = i.parentNode;
            for (i = i.querySelectorAll(
              'input[name="' + te(
                "" + e
              ) + '"][type="radio"]'
            ), e = 0; e < i.length; e++) {
              var s = i[e];
              if (s !== t && s.form === t.form) {
                var c = s[Oe] || null;
                if (!c) throw Error(o(90));
                _e(
                  s,
                  c.value,
                  c.defaultValue,
                  c.defaultValue,
                  c.checked,
                  c.defaultChecked,
                  c.type,
                  c.name
                );
              }
            }
            for (e = 0; e < i.length; e++)
              s = i[e], s.form === t.form && Re(s);
          }
          break t;
        case "textarea":
          qt(t, i.value, i.defaultValue);
          break t;
        case "select":
          e = i.value, e != null && ze(t, !!i.multiple, e, !1);
      }
    }
  }
  var ks = !1;
  function ji(t, e, i) {
    if (ks) return t(e, i);
    ks = !0;
    try {
      var s = t(e);
      return s;
    } finally {
      if (ks = !1, (un !== null || ra !== null) && (ul(), un && (e = un, t = ra, ra = un = null, ee(e), t)))
        for (e = 0; e < t.length; e++) ee(t[e]);
    }
  }
  function Ia(t, e) {
    var i = t.stateNode;
    if (i === null) return null;
    var s = i[Oe] || null;
    if (s === null) return null;
    i = s[e];
    t: switch (e) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (s = !s.disabled) || (t = t.type, s = !(t === "button" || t === "input" || t === "select" || t === "textarea")), t = !s;
        break t;
      default:
        t = !1;
    }
    if (t) return null;
    if (i && typeof i != "function")
      throw Error(
        o(231, e, typeof i)
      );
    return i;
  }
  var wa = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), xc = !1;
  if (wa)
    try {
      var co = {};
      Object.defineProperty(co, "passive", {
        get: function() {
          xc = !0;
        }
      }), window.addEventListener("test", co, co), window.removeEventListener("test", co, co);
    } catch {
      xc = !1;
    }
  var Xa = null, Sc = null, Ts = null;
  function Th() {
    if (Ts) return Ts;
    var t, e = Sc, i = e.length, s, c = "value" in Xa ? Xa.value : Xa.textContent, d = c.length;
    for (t = 0; t < i && e[t] === c[t]; t++) ;
    var y = i - t;
    for (s = 1; s <= y && e[i - s] === c[d - s]; s++) ;
    return Ts = c.slice(t, 1 < s ? 1 - s : void 0);
  }
  function Es(t) {
    var e = t.keyCode;
    return "charCode" in t ? (t = t.charCode, t === 0 && e === 13 && (t = 13)) : t = e, t === 10 && (t = 13), 32 <= t || t === 13 ? t : 0;
  }
  function Ms() {
    return !0;
  }
  function Eh() {
    return !1;
  }
  function dn(t) {
    function e(i, s, c, d, y) {
      this._reactName = i, this._targetInst = c, this.type = s, this.nativeEvent = d, this.target = y, this.currentTarget = null;
      for (var w in t)
        t.hasOwnProperty(w) && (i = t[w], this[w] = i ? i(d) : d[w]);
      return this.isDefaultPrevented = (d.defaultPrevented != null ? d.defaultPrevented : d.returnValue === !1) ? Ms : Eh, this.isPropagationStopped = Eh, this;
    }
    return v(e.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var i = this.nativeEvent;
        i && (i.preventDefault ? i.preventDefault() : typeof i.returnValue != "unknown" && (i.returnValue = !1), this.isDefaultPrevented = Ms);
      },
      stopPropagation: function() {
        var i = this.nativeEvent;
        i && (i.stopPropagation ? i.stopPropagation() : typeof i.cancelBubble != "unknown" && (i.cancelBubble = !0), this.isPropagationStopped = Ms);
      },
      persist: function() {
      },
      isPersistent: Ms
    }), e;
  }
  var Li = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(t) {
      return t.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, Rs = dn(Li), uo = v({}, Li, { view: 0, detail: 0 }), Y1 = dn(uo), kc, Tc, fo, Cs = v({}, uo, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: Mc,
    button: 0,
    buttons: 0,
    relatedTarget: function(t) {
      return t.relatedTarget === void 0 ? t.fromElement === t.srcElement ? t.toElement : t.fromElement : t.relatedTarget;
    },
    movementX: function(t) {
      return "movementX" in t ? t.movementX : (t !== fo && (fo && t.type === "mousemove" ? (kc = t.screenX - fo.screenX, Tc = t.screenY - fo.screenY) : Tc = kc = 0, fo = t), kc);
    },
    movementY: function(t) {
      return "movementY" in t ? t.movementY : Tc;
    }
  }), Mh = dn(Cs), K1 = v({}, Cs, { dataTransfer: 0 }), q1 = dn(K1), F1 = v({}, uo, { relatedTarget: 0 }), Ec = dn(F1), G1 = v({}, Li, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), I1 = dn(G1), X1 = v({}, Li, {
    clipboardData: function(t) {
      return "clipboardData" in t ? t.clipboardData : window.clipboardData;
    }
  }), W1 = dn(X1), Q1 = v({}, Li, { data: 0 }), Rh = dn(Q1), Z1 = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, J1 = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, $1 = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function tw(t) {
    var e = this.nativeEvent;
    return e.getModifierState ? e.getModifierState(t) : (t = $1[t]) ? !!e[t] : !1;
  }
  function Mc() {
    return tw;
  }
  var ew = v({}, uo, {
    key: function(t) {
      if (t.key) {
        var e = Z1[t.key] || t.key;
        if (e !== "Unidentified") return e;
      }
      return t.type === "keypress" ? (t = Es(t), t === 13 ? "Enter" : String.fromCharCode(t)) : t.type === "keydown" || t.type === "keyup" ? J1[t.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Mc,
    charCode: function(t) {
      return t.type === "keypress" ? Es(t) : 0;
    },
    keyCode: function(t) {
      return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
    },
    which: function(t) {
      return t.type === "keypress" ? Es(t) : t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
    }
  }), nw = dn(ew), aw = v({}, Cs, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), Ch = dn(aw), iw = v({}, uo, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Mc
  }), rw = dn(iw), ow = v({}, Li, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), sw = dn(ow), lw = v({}, Cs, {
    deltaX: function(t) {
      return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0;
    },
    deltaY: function(t) {
      return "deltaY" in t ? t.deltaY : "wheelDeltaY" in t ? -t.wheelDeltaY : "wheelDelta" in t ? -t.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), cw = dn(lw), uw = v({}, Li, {
    newState: 0,
    oldState: 0
  }), dw = dn(uw), fw = [9, 13, 27, 32], Rc = wa && "CompositionEvent" in window, ho = null;
  wa && "documentMode" in document && (ho = document.documentMode);
  var hw = wa && "TextEvent" in window && !ho, Ah = wa && (!Rc || ho && 8 < ho && 11 >= ho), jh = " ", Lh = !1;
  function Dh(t, e) {
    switch (t) {
      case "keyup":
        return fw.indexOf(e.keyCode) !== -1;
      case "keydown":
        return e.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function Nh(t) {
    return t = t.detail, typeof t == "object" && "data" in t ? t.data : null;
  }
  var lr = !1;
  function pw(t, e) {
    switch (t) {
      case "compositionend":
        return Nh(e);
      case "keypress":
        return e.which !== 32 ? null : (Lh = !0, jh);
      case "textInput":
        return t = e.data, t === jh && Lh ? null : t;
      default:
        return null;
    }
  }
  function mw(t, e) {
    if (lr)
      return t === "compositionend" || !Rc && Dh(t, e) ? (t = Th(), Ts = Sc = Xa = null, lr = !1, t) : null;
    switch (t) {
      case "paste":
        return null;
      case "keypress":
        if (!(e.ctrlKey || e.altKey || e.metaKey) || e.ctrlKey && e.altKey) {
          if (e.char && 1 < e.char.length)
            return e.char;
          if (e.which) return String.fromCharCode(e.which);
        }
        return null;
      case "compositionend":
        return Ah && e.locale !== "ko" ? null : e.data;
      default:
        return null;
    }
  }
  var gw = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
  };
  function Oh(t) {
    var e = t && t.nodeName && t.nodeName.toLowerCase();
    return e === "input" ? !!gw[t.type] : e === "textarea";
  }
  function _h(t, e, i, s) {
    un ? ra ? ra.push(s) : ra = [s] : un = s, e = yl(e, "onChange"), 0 < e.length && (i = new Rs(
      "onChange",
      "change",
      null,
      i,
      s
    ), t.push({ event: i, listeners: e }));
  }
  var po = null, mo = null;
  function yw(t) {
    yg(t, 0);
  }
  function As(t) {
    var e = va(t);
    if (Re(e)) return t;
  }
  function zh(t, e) {
    if (t === "change") return e;
  }
  var Uh = !1;
  if (wa) {
    var Cc;
    if (wa) {
      var Ac = "oninput" in document;
      if (!Ac) {
        var Bh = document.createElement("div");
        Bh.setAttribute("oninput", "return;"), Ac = typeof Bh.oninput == "function";
      }
      Cc = Ac;
    } else Cc = !1;
    Uh = Cc && (!document.documentMode || 9 < document.documentMode);
  }
  function Vh() {
    po && (po.detachEvent("onpropertychange", Hh), mo = po = null);
  }
  function Hh(t) {
    if (t.propertyName === "value" && As(mo)) {
      var e = [];
      _h(
        e,
        mo,
        t,
        ve(t)
      ), ji(yw, e);
    }
  }
  function vw(t, e, i) {
    t === "focusin" ? (Vh(), po = e, mo = i, po.attachEvent("onpropertychange", Hh)) : t === "focusout" && Vh();
  }
  function bw(t) {
    if (t === "selectionchange" || t === "keyup" || t === "keydown")
      return As(mo);
  }
  function ww(t, e) {
    if (t === "click") return As(e);
  }
  function xw(t, e) {
    if (t === "input" || t === "change")
      return As(e);
  }
  function Sw(t, e) {
    return t === e && (t !== 0 || 1 / t === 1 / e) || t !== t && e !== e;
  }
  var wn = typeof Object.is == "function" ? Object.is : Sw;
  function go(t, e) {
    if (wn(t, e)) return !0;
    if (typeof t != "object" || t === null || typeof e != "object" || e === null)
      return !1;
    var i = Object.keys(t), s = Object.keys(e);
    if (i.length !== s.length) return !1;
    for (s = 0; s < i.length; s++) {
      var c = i[s];
      if (!$e.call(e, c) || !wn(t[c], e[c]))
        return !1;
    }
    return !0;
  }
  function Ph(t) {
    for (; t && t.firstChild; ) t = t.firstChild;
    return t;
  }
  function Yh(t, e) {
    var i = Ph(t);
    t = 0;
    for (var s; i; ) {
      if (i.nodeType === 3) {
        if (s = t + i.textContent.length, t <= e && s >= e)
          return { node: i, offset: e - t };
        t = s;
      }
      t: {
        for (; i; ) {
          if (i.nextSibling) {
            i = i.nextSibling;
            break t;
          }
          i = i.parentNode;
        }
        i = void 0;
      }
      i = Ph(i);
    }
  }
  function Kh(t, e) {
    return t && e ? t === e ? !0 : t && t.nodeType === 3 ? !1 : e && e.nodeType === 3 ? Kh(t, e.parentNode) : "contains" in t ? t.contains(e) : t.compareDocumentPosition ? !!(t.compareDocumentPosition(e) & 16) : !1 : !1;
  }
  function qh(t) {
    t = t != null && t.ownerDocument != null && t.ownerDocument.defaultView != null ? t.ownerDocument.defaultView : window;
    for (var e = _t(t.document); e instanceof t.HTMLIFrameElement; ) {
      try {
        var i = typeof e.contentWindow.location.href == "string";
      } catch {
        i = !1;
      }
      if (i) t = e.contentWindow;
      else break;
      e = _t(t.document);
    }
    return e;
  }
  function jc(t) {
    var e = t && t.nodeName && t.nodeName.toLowerCase();
    return e && (e === "input" && (t.type === "text" || t.type === "search" || t.type === "tel" || t.type === "url" || t.type === "password") || e === "textarea" || t.contentEditable === "true");
  }
  var kw = wa && "documentMode" in document && 11 >= document.documentMode, cr = null, Lc = null, yo = null, Dc = !1;
  function Fh(t, e, i) {
    var s = i.window === i ? i.document : i.nodeType === 9 ? i : i.ownerDocument;
    Dc || cr == null || cr !== _t(s) || (s = cr, "selectionStart" in s && jc(s) ? s = { start: s.selectionStart, end: s.selectionEnd } : (s = (s.ownerDocument && s.ownerDocument.defaultView || window).getSelection(), s = {
      anchorNode: s.anchorNode,
      anchorOffset: s.anchorOffset,
      focusNode: s.focusNode,
      focusOffset: s.focusOffset
    }), yo && go(yo, s) || (yo = s, s = yl(Lc, "onSelect"), 0 < s.length && (e = new Rs(
      "onSelect",
      "select",
      null,
      e,
      i
    ), t.push({ event: e, listeners: s }), e.target = cr)));
  }
  function Di(t, e) {
    var i = {};
    return i[t.toLowerCase()] = e.toLowerCase(), i["Webkit" + t] = "webkit" + e, i["Moz" + t] = "moz" + e, i;
  }
  var ur = {
    animationend: Di("Animation", "AnimationEnd"),
    animationiteration: Di("Animation", "AnimationIteration"),
    animationstart: Di("Animation", "AnimationStart"),
    transitionrun: Di("Transition", "TransitionRun"),
    transitionstart: Di("Transition", "TransitionStart"),
    transitioncancel: Di("Transition", "TransitionCancel"),
    transitionend: Di("Transition", "TransitionEnd")
  }, Nc = {}, Gh = {};
  wa && (Gh = document.createElement("div").style, "AnimationEvent" in window || (delete ur.animationend.animation, delete ur.animationiteration.animation, delete ur.animationstart.animation), "TransitionEvent" in window || delete ur.transitionend.transition);
  function Ni(t) {
    if (Nc[t]) return Nc[t];
    if (!ur[t]) return t;
    var e = ur[t], i;
    for (i in e)
      if (e.hasOwnProperty(i) && i in Gh)
        return Nc[t] = e[i];
    return t;
  }
  var Ih = Ni("animationend"), Xh = Ni("animationiteration"), Wh = Ni("animationstart"), Tw = Ni("transitionrun"), Ew = Ni("transitionstart"), Mw = Ni("transitioncancel"), Qh = Ni("transitionend"), Zh = /* @__PURE__ */ new Map(), Oc = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  Oc.push("scrollEnd");
  function Zn(t, e) {
    Zh.set(t, e), Dn(e, [t]);
  }
  var js = typeof reportError == "function" ? reportError : function(t) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var e = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof t == "object" && t !== null && typeof t.message == "string" ? String(t.message) : String(t),
        error: t
      });
      if (!window.dispatchEvent(e)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", t);
      return;
    }
    console.error(t);
  }, _n = [], dr = 0, _c = 0;
  function Ls() {
    for (var t = dr, e = _c = dr = 0; e < t; ) {
      var i = _n[e];
      _n[e++] = null;
      var s = _n[e];
      _n[e++] = null;
      var c = _n[e];
      _n[e++] = null;
      var d = _n[e];
      if (_n[e++] = null, s !== null && c !== null) {
        var y = s.pending;
        y === null ? c.next = c : (c.next = y.next, y.next = c), s.pending = c;
      }
      d !== 0 && Jh(i, c, d);
    }
  }
  function Ds(t, e, i, s) {
    _n[dr++] = t, _n[dr++] = e, _n[dr++] = i, _n[dr++] = s, _c |= s, t.lanes |= s, t = t.alternate, t !== null && (t.lanes |= s);
  }
  function zc(t, e, i, s) {
    return Ds(t, e, i, s), Ns(t);
  }
  function Oi(t, e) {
    return Ds(t, null, null, e), Ns(t);
  }
  function Jh(t, e, i) {
    t.lanes |= i;
    var s = t.alternate;
    s !== null && (s.lanes |= i);
    for (var c = !1, d = t.return; d !== null; )
      d.childLanes |= i, s = d.alternate, s !== null && (s.childLanes |= i), d.tag === 22 && (t = d.stateNode, t === null || t._visibility & 1 || (c = !0)), t = d, d = d.return;
    return t.tag === 3 ? (d = t.stateNode, c && e !== null && (c = 31 - je(i), t = d.hiddenUpdates, s = t[c], s === null ? t[c] = [e] : s.push(e), e.lane = i | 536870912), d) : null;
  }
  function Ns(t) {
    if (50 < Vo)
      throw Vo = 0, Fu = null, Error(o(185));
    for (var e = t.return; e !== null; )
      t = e, e = t.return;
    return t.tag === 3 ? t.stateNode : null;
  }
  var fr = {};
  function Rw(t, e, i, s) {
    this.tag = t, this.key = i, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = e, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = s, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function xn(t, e, i, s) {
    return new Rw(t, e, i, s);
  }
  function Uc(t) {
    return t = t.prototype, !(!t || !t.isReactComponent);
  }
  function xa(t, e) {
    var i = t.alternate;
    return i === null ? (i = xn(
      t.tag,
      e,
      t.key,
      t.mode
    ), i.elementType = t.elementType, i.type = t.type, i.stateNode = t.stateNode, i.alternate = t, t.alternate = i) : (i.pendingProps = e, i.type = t.type, i.flags = 0, i.subtreeFlags = 0, i.deletions = null), i.flags = t.flags & 65011712, i.childLanes = t.childLanes, i.lanes = t.lanes, i.child = t.child, i.memoizedProps = t.memoizedProps, i.memoizedState = t.memoizedState, i.updateQueue = t.updateQueue, e = t.dependencies, i.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }, i.sibling = t.sibling, i.index = t.index, i.ref = t.ref, i.refCleanup = t.refCleanup, i;
  }
  function $h(t, e) {
    t.flags &= 65011714;
    var i = t.alternate;
    return i === null ? (t.childLanes = 0, t.lanes = e, t.child = null, t.subtreeFlags = 0, t.memoizedProps = null, t.memoizedState = null, t.updateQueue = null, t.dependencies = null, t.stateNode = null) : (t.childLanes = i.childLanes, t.lanes = i.lanes, t.child = i.child, t.subtreeFlags = 0, t.deletions = null, t.memoizedProps = i.memoizedProps, t.memoizedState = i.memoizedState, t.updateQueue = i.updateQueue, t.type = i.type, e = i.dependencies, t.dependencies = e === null ? null : {
      lanes: e.lanes,
      firstContext: e.firstContext
    }), t;
  }
  function Os(t, e, i, s, c, d) {
    var y = 0;
    if (s = t, typeof t == "function") Uc(t) && (y = 1);
    else if (typeof t == "string")
      y = Dx(
        t,
        i,
        Q.current
      ) ? 26 : t === "html" || t === "head" || t === "body" ? 27 : 5;
    else
      t: switch (t) {
        case at:
          return t = xn(31, i, e, c), t.elementType = at, t.lanes = d, t;
        case A:
          return _i(i.children, c, d, e);
        case C:
          y = 8, c |= 24;
          break;
        case M:
          return t = xn(12, i, e, c | 2), t.elementType = M, t.lanes = d, t;
        case Z:
          return t = xn(13, i, e, c), t.elementType = Z, t.lanes = d, t;
        case W:
          return t = xn(19, i, e, c), t.elementType = W, t.lanes = d, t;
        default:
          if (typeof t == "object" && t !== null)
            switch (t.$$typeof) {
              case R:
                y = 10;
                break t;
              case D:
                y = 9;
                break t;
              case z:
                y = 11;
                break t;
              case X:
                y = 14;
                break t;
              case F:
                y = 16, s = null;
                break t;
            }
          y = 29, i = Error(
            o(130, t === null ? "null" : typeof t, "")
          ), s = null;
      }
    return e = xn(y, i, e, c), e.elementType = t, e.type = s, e.lanes = d, e;
  }
  function _i(t, e, i, s) {
    return t = xn(7, t, s, e), t.lanes = i, t;
  }
  function Bc(t, e, i) {
    return t = xn(6, t, null, e), t.lanes = i, t;
  }
  function tp(t) {
    var e = xn(18, null, null, 0);
    return e.stateNode = t, e;
  }
  function Vc(t, e, i) {
    return e = xn(
      4,
      t.children !== null ? t.children : [],
      t.key,
      e
    ), e.lanes = i, e.stateNode = {
      containerInfo: t.containerInfo,
      pendingChildren: null,
      implementation: t.implementation
    }, e;
  }
  var ep = /* @__PURE__ */ new WeakMap();
  function zn(t, e) {
    if (typeof t == "object" && t !== null) {
      var i = ep.get(t);
      return i !== void 0 ? i : (e = {
        value: t,
        source: e,
        stack: Cn(e)
      }, ep.set(t, e), e);
    }
    return {
      value: t,
      source: e,
      stack: Cn(e)
    };
  }
  var hr = [], pr = 0, _s = null, vo = 0, Un = [], Bn = 0, Wa = null, oa = 1, sa = "";
  function Sa(t, e) {
    hr[pr++] = vo, hr[pr++] = _s, _s = t, vo = e;
  }
  function np(t, e, i) {
    Un[Bn++] = oa, Un[Bn++] = sa, Un[Bn++] = Wa, Wa = t;
    var s = oa;
    t = sa;
    var c = 32 - je(s) - 1;
    s &= ~(1 << c), i += 1;
    var d = 32 - je(e) + c;
    if (30 < d) {
      var y = c - c % 5;
      d = (s & (1 << y) - 1).toString(32), s >>= y, c -= y, oa = 1 << 32 - je(e) + c | i << c | s, sa = d + t;
    } else
      oa = 1 << d | i << c | s, sa = t;
  }
  function Hc(t) {
    t.return !== null && (Sa(t, 1), np(t, 1, 0));
  }
  function Pc(t) {
    for (; t === _s; )
      _s = hr[--pr], hr[pr] = null, vo = hr[--pr], hr[pr] = null;
    for (; t === Wa; )
      Wa = Un[--Bn], Un[Bn] = null, sa = Un[--Bn], Un[Bn] = null, oa = Un[--Bn], Un[Bn] = null;
  }
  function ap(t, e) {
    Un[Bn++] = oa, Un[Bn++] = sa, Un[Bn++] = Wa, oa = e.id, sa = e.overflow, Wa = t;
  }
  var Ue = null, ne = null, zt = !1, Qa = null, Vn = !1, Yc = Error(o(519));
  function Za(t) {
    var e = Error(
      o(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw bo(zn(e, t)), Yc;
  }
  function ip(t) {
    var e = t.stateNode, i = t.type, s = t.memoizedProps;
    switch (e[he] = t, e[Oe] = s, i) {
      case "dialog":
        jt("cancel", e), jt("close", e);
        break;
      case "iframe":
      case "object":
      case "embed":
        jt("load", e);
        break;
      case "video":
      case "audio":
        for (i = 0; i < Po.length; i++)
          jt(Po[i], e);
        break;
      case "source":
        jt("error", e);
        break;
      case "img":
      case "image":
      case "link":
        jt("error", e), jt("load", e);
        break;
      case "details":
        jt("toggle", e);
        break;
      case "input":
        jt("invalid", e), cn(
          e,
          s.value,
          s.defaultValue,
          s.checked,
          s.defaultChecked,
          s.type,
          s.name,
          !0
        );
        break;
      case "select":
        jt("invalid", e);
        break;
      case "textarea":
        jt("invalid", e), Ct(e, s.value, s.defaultValue, s.children);
    }
    i = s.children, typeof i != "string" && typeof i != "number" && typeof i != "bigint" || e.textContent === "" + i || s.suppressHydrationWarning === !0 || xg(e.textContent, i) ? (s.popover != null && (jt("beforetoggle", e), jt("toggle", e)), s.onScroll != null && jt("scroll", e), s.onScrollEnd != null && jt("scrollend", e), s.onClick != null && (e.onclick = On), e = !0) : e = !1, e || Za(t, !0);
  }
  function rp(t) {
    for (Ue = t.return; Ue; )
      switch (Ue.tag) {
        case 5:
        case 31:
        case 13:
          Vn = !1;
          return;
        case 27:
        case 3:
          Vn = !0;
          return;
        default:
          Ue = Ue.return;
      }
  }
  function mr(t) {
    if (t !== Ue) return !1;
    if (!zt) return rp(t), zt = !0, !1;
    var e = t.tag, i;
    if ((i = e !== 3 && e !== 27) && ((i = e === 5) && (i = t.type, i = !(i !== "form" && i !== "button") || od(t.type, t.memoizedProps)), i = !i), i && ne && Za(t), rp(t), e === 13) {
      if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t) throw Error(o(317));
      ne = jg(t);
    } else if (e === 31) {
      if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t) throw Error(o(317));
      ne = jg(t);
    } else
      e === 27 ? (e = ne, di(t.type) ? (t = dd, dd = null, ne = t) : ne = e) : ne = Ue ? Pn(t.stateNode.nextSibling) : null;
    return !0;
  }
  function zi() {
    ne = Ue = null, zt = !1;
  }
  function Kc() {
    var t = Qa;
    return t !== null && (mn === null ? mn = t : mn.push.apply(
      mn,
      t
    ), Qa = null), t;
  }
  function bo(t) {
    Qa === null ? Qa = [t] : Qa.push(t);
  }
  var qc = T(null), Ui = null, ka = null;
  function Ja(t, e, i) {
    B(qc, e._currentValue), e._currentValue = i;
  }
  function Ta(t) {
    t._currentValue = qc.current, _(qc);
  }
  function Fc(t, e, i) {
    for (; t !== null; ) {
      var s = t.alternate;
      if ((t.childLanes & e) !== e ? (t.childLanes |= e, s !== null && (s.childLanes |= e)) : s !== null && (s.childLanes & e) !== e && (s.childLanes |= e), t === i) break;
      t = t.return;
    }
  }
  function Gc(t, e, i, s) {
    var c = t.child;
    for (c !== null && (c.return = t); c !== null; ) {
      var d = c.dependencies;
      if (d !== null) {
        var y = c.child;
        d = d.firstContext;
        t: for (; d !== null; ) {
          var w = d;
          d = c;
          for (var j = 0; j < e.length; j++)
            if (w.context === e[j]) {
              d.lanes |= i, w = d.alternate, w !== null && (w.lanes |= i), Fc(
                d.return,
                i,
                t
              ), s || (y = null);
              break t;
            }
          d = w.next;
        }
      } else if (c.tag === 18) {
        if (y = c.return, y === null) throw Error(o(341));
        y.lanes |= i, d = y.alternate, d !== null && (d.lanes |= i), Fc(y, i, t), y = null;
      } else y = c.child;
      if (y !== null) y.return = c;
      else
        for (y = c; y !== null; ) {
          if (y === t) {
            y = null;
            break;
          }
          if (c = y.sibling, c !== null) {
            c.return = y.return, y = c;
            break;
          }
          y = y.return;
        }
      c = y;
    }
  }
  function gr(t, e, i, s) {
    t = null;
    for (var c = e, d = !1; c !== null; ) {
      if (!d) {
        if ((c.flags & 524288) !== 0) d = !0;
        else if ((c.flags & 262144) !== 0) break;
      }
      if (c.tag === 10) {
        var y = c.alternate;
        if (y === null) throw Error(o(387));
        if (y = y.memoizedProps, y !== null) {
          var w = c.type;
          wn(c.pendingProps.value, y.value) || (t !== null ? t.push(w) : t = [w]);
        }
      } else if (c === ht.current) {
        if (y = c.alternate, y === null) throw Error(o(387));
        y.memoizedState.memoizedState !== c.memoizedState.memoizedState && (t !== null ? t.push(Go) : t = [Go]);
      }
      c = c.return;
    }
    t !== null && Gc(
      e,
      t,
      i,
      s
    ), e.flags |= 262144;
  }
  function zs(t) {
    for (t = t.firstContext; t !== null; ) {
      if (!wn(
        t.context._currentValue,
        t.memoizedValue
      ))
        return !0;
      t = t.next;
    }
    return !1;
  }
  function Bi(t) {
    Ui = t, ka = null, t = t.dependencies, t !== null && (t.firstContext = null);
  }
  function Be(t) {
    return op(Ui, t);
  }
  function Us(t, e) {
    return Ui === null && Bi(t), op(t, e);
  }
  function op(t, e) {
    var i = e._currentValue;
    if (e = { context: e, memoizedValue: i, next: null }, ka === null) {
      if (t === null) throw Error(o(308));
      ka = e, t.dependencies = { lanes: 0, firstContext: e }, t.flags |= 524288;
    } else ka = ka.next = e;
    return i;
  }
  var Cw = typeof AbortController < "u" ? AbortController : function() {
    var t = [], e = this.signal = {
      aborted: !1,
      addEventListener: function(i, s) {
        t.push(s);
      }
    };
    this.abort = function() {
      e.aborted = !0, t.forEach(function(i) {
        return i();
      });
    };
  }, Aw = a.unstable_scheduleCallback, jw = a.unstable_NormalPriority, be = {
    $$typeof: R,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function Ic() {
    return {
      controller: new Cw(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function wo(t) {
    t.refCount--, t.refCount === 0 && Aw(jw, function() {
      t.controller.abort();
    });
  }
  var xo = null, Xc = 0, yr = 0, vr = null;
  function Lw(t, e) {
    if (xo === null) {
      var i = xo = [];
      Xc = 0, yr = Zu(), vr = {
        status: "pending",
        value: void 0,
        then: function(s) {
          i.push(s);
        }
      };
    }
    return Xc++, e.then(sp, sp), e;
  }
  function sp() {
    if (--Xc === 0 && xo !== null) {
      vr !== null && (vr.status = "fulfilled");
      var t = xo;
      xo = null, yr = 0, vr = null;
      for (var e = 0; e < t.length; e++) (0, t[e])();
    }
  }
  function Dw(t, e) {
    var i = [], s = {
      status: "pending",
      value: null,
      reason: null,
      then: function(c) {
        i.push(c);
      }
    };
    return t.then(
      function() {
        s.status = "fulfilled", s.value = e;
        for (var c = 0; c < i.length; c++) (0, i[c])(e);
      },
      function(c) {
        for (s.status = "rejected", s.reason = c, c = 0; c < i.length; c++)
          (0, i[c])(void 0);
      }
    ), s;
  }
  var lp = Y.S;
  Y.S = function(t, e) {
    Fm = De(), typeof e == "object" && e !== null && typeof e.then == "function" && Lw(t, e), lp !== null && lp(t, e);
  };
  var Vi = T(null);
  function Wc() {
    var t = Vi.current;
    return t !== null ? t : Zt.pooledCache;
  }
  function Bs(t, e) {
    e === null ? B(Vi, Vi.current) : B(Vi, e.pool);
  }
  function cp() {
    var t = Wc();
    return t === null ? null : { parent: be._currentValue, pool: t };
  }
  var br = Error(o(460)), Qc = Error(o(474)), Vs = Error(o(542)), Hs = { then: function() {
  } };
  function up(t) {
    return t = t.status, t === "fulfilled" || t === "rejected";
  }
  function dp(t, e, i) {
    switch (i = t[i], i === void 0 ? t.push(e) : i !== e && (e.then(On, On), e = i), e.status) {
      case "fulfilled":
        return e.value;
      case "rejected":
        throw t = e.reason, hp(t), t;
      default:
        if (typeof e.status == "string") e.then(On, On);
        else {
          if (t = Zt, t !== null && 100 < t.shellSuspendCounter)
            throw Error(o(482));
          t = e, t.status = "pending", t.then(
            function(s) {
              if (e.status === "pending") {
                var c = e;
                c.status = "fulfilled", c.value = s;
              }
            },
            function(s) {
              if (e.status === "pending") {
                var c = e;
                c.status = "rejected", c.reason = s;
              }
            }
          );
        }
        switch (e.status) {
          case "fulfilled":
            return e.value;
          case "rejected":
            throw t = e.reason, hp(t), t;
        }
        throw Pi = e, br;
    }
  }
  function Hi(t) {
    try {
      var e = t._init;
      return e(t._payload);
    } catch (i) {
      throw i !== null && typeof i == "object" && typeof i.then == "function" ? (Pi = i, br) : i;
    }
  }
  var Pi = null;
  function fp() {
    if (Pi === null) throw Error(o(459));
    var t = Pi;
    return Pi = null, t;
  }
  function hp(t) {
    if (t === br || t === Vs)
      throw Error(o(483));
  }
  var wr = null, So = 0;
  function Ps(t) {
    var e = So;
    return So += 1, wr === null && (wr = []), dp(wr, t, e);
  }
  function ko(t, e) {
    e = e.props.ref, t.ref = e !== void 0 ? e : null;
  }
  function Ys(t, e) {
    throw e.$$typeof === b ? Error(o(525)) : (t = Object.prototype.toString.call(e), Error(
      o(
        31,
        t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t
      )
    ));
  }
  function pp(t) {
    function e(N, L) {
      if (t) {
        var U = N.deletions;
        U === null ? (N.deletions = [L], N.flags |= 16) : U.push(L);
      }
    }
    function i(N, L) {
      if (!t) return null;
      for (; L !== null; )
        e(N, L), L = L.sibling;
      return null;
    }
    function s(N) {
      for (var L = /* @__PURE__ */ new Map(); N !== null; )
        N.key !== null ? L.set(N.key, N) : L.set(N.index, N), N = N.sibling;
      return L;
    }
    function c(N, L) {
      return N = xa(N, L), N.index = 0, N.sibling = null, N;
    }
    function d(N, L, U) {
      return N.index = U, t ? (U = N.alternate, U !== null ? (U = U.index, U < L ? (N.flags |= 67108866, L) : U) : (N.flags |= 67108866, L)) : (N.flags |= 1048576, L);
    }
    function y(N) {
      return t && N.alternate === null && (N.flags |= 67108866), N;
    }
    function w(N, L, U, G) {
      return L === null || L.tag !== 6 ? (L = Bc(U, N.mode, G), L.return = N, L) : (L = c(L, U), L.return = N, L);
    }
    function j(N, L, U, G) {
      var ft = U.type;
      return ft === A ? q(
        N,
        L,
        U.props.children,
        G,
        U.key
      ) : L !== null && (L.elementType === ft || typeof ft == "object" && ft !== null && ft.$$typeof === F && Hi(ft) === L.type) ? (L = c(L, U.props), ko(L, U), L.return = N, L) : (L = Os(
        U.type,
        U.key,
        U.props,
        null,
        N.mode,
        G
      ), ko(L, U), L.return = N, L);
    }
    function V(N, L, U, G) {
      return L === null || L.tag !== 4 || L.stateNode.containerInfo !== U.containerInfo || L.stateNode.implementation !== U.implementation ? (L = Vc(U, N.mode, G), L.return = N, L) : (L = c(L, U.children || []), L.return = N, L);
    }
    function q(N, L, U, G, ft) {
      return L === null || L.tag !== 7 ? (L = _i(
        U,
        N.mode,
        G,
        ft
      ), L.return = N, L) : (L = c(L, U), L.return = N, L);
    }
    function I(N, L, U) {
      if (typeof L == "string" && L !== "" || typeof L == "number" || typeof L == "bigint")
        return L = Bc(
          "" + L,
          N.mode,
          U
        ), L.return = N, L;
      if (typeof L == "object" && L !== null) {
        switch (L.$$typeof) {
          case k:
            return U = Os(
              L.type,
              L.key,
              L.props,
              null,
              N.mode,
              U
            ), ko(U, L), U.return = N, U;
          case E:
            return L = Vc(
              L,
              N.mode,
              U
            ), L.return = N, L;
          case F:
            return L = Hi(L), I(N, L, U);
        }
        if (bt(L) || yt(L))
          return L = _i(
            L,
            N.mode,
            U,
            null
          ), L.return = N, L;
        if (typeof L.then == "function")
          return I(N, Ps(L), U);
        if (L.$$typeof === R)
          return I(
            N,
            Us(N, L),
            U
          );
        Ys(N, L);
      }
      return null;
    }
    function P(N, L, U, G) {
      var ft = L !== null ? L.key : null;
      if (typeof U == "string" && U !== "" || typeof U == "number" || typeof U == "bigint")
        return ft !== null ? null : w(N, L, "" + U, G);
      if (typeof U == "object" && U !== null) {
        switch (U.$$typeof) {
          case k:
            return U.key === ft ? j(N, L, U, G) : null;
          case E:
            return U.key === ft ? V(N, L, U, G) : null;
          case F:
            return U = Hi(U), P(N, L, U, G);
        }
        if (bt(U) || yt(U))
          return ft !== null ? null : q(N, L, U, G, null);
        if (typeof U.then == "function")
          return P(
            N,
            L,
            Ps(U),
            G
          );
        if (U.$$typeof === R)
          return P(
            N,
            L,
            Us(N, U),
            G
          );
        Ys(N, U);
      }
      return null;
    }
    function K(N, L, U, G, ft) {
      if (typeof G == "string" && G !== "" || typeof G == "number" || typeof G == "bigint")
        return N = N.get(U) || null, w(L, N, "" + G, ft);
      if (typeof G == "object" && G !== null) {
        switch (G.$$typeof) {
          case k:
            return N = N.get(
              G.key === null ? U : G.key
            ) || null, j(L, N, G, ft);
          case E:
            return N = N.get(
              G.key === null ? U : G.key
            ) || null, V(L, N, G, ft);
          case F:
            return G = Hi(G), K(
              N,
              L,
              U,
              G,
              ft
            );
        }
        if (bt(G) || yt(G))
          return N = N.get(U) || null, q(L, N, G, ft, null);
        if (typeof G.then == "function")
          return K(
            N,
            L,
            U,
            Ps(G),
            ft
          );
        if (G.$$typeof === R)
          return K(
            N,
            L,
            U,
            Us(L, G),
            ft
          );
        Ys(L, G);
      }
      return null;
    }
    function ct(N, L, U, G) {
      for (var ft = null, Pt = null, dt = L, kt = L = 0, Nt = null; dt !== null && kt < U.length; kt++) {
        dt.index > kt ? (Nt = dt, dt = null) : Nt = dt.sibling;
        var Yt = P(
          N,
          dt,
          U[kt],
          G
        );
        if (Yt === null) {
          dt === null && (dt = Nt);
          break;
        }
        t && dt && Yt.alternate === null && e(N, dt), L = d(Yt, L, kt), Pt === null ? ft = Yt : Pt.sibling = Yt, Pt = Yt, dt = Nt;
      }
      if (kt === U.length)
        return i(N, dt), zt && Sa(N, kt), ft;
      if (dt === null) {
        for (; kt < U.length; kt++)
          dt = I(N, U[kt], G), dt !== null && (L = d(
            dt,
            L,
            kt
          ), Pt === null ? ft = dt : Pt.sibling = dt, Pt = dt);
        return zt && Sa(N, kt), ft;
      }
      for (dt = s(dt); kt < U.length; kt++)
        Nt = K(
          dt,
          N,
          kt,
          U[kt],
          G
        ), Nt !== null && (t && Nt.alternate !== null && dt.delete(
          Nt.key === null ? kt : Nt.key
        ), L = d(
          Nt,
          L,
          kt
        ), Pt === null ? ft = Nt : Pt.sibling = Nt, Pt = Nt);
      return t && dt.forEach(function(gi) {
        return e(N, gi);
      }), zt && Sa(N, kt), ft;
    }
    function gt(N, L, U, G) {
      if (U == null) throw Error(o(151));
      for (var ft = null, Pt = null, dt = L, kt = L = 0, Nt = null, Yt = U.next(); dt !== null && !Yt.done; kt++, Yt = U.next()) {
        dt.index > kt ? (Nt = dt, dt = null) : Nt = dt.sibling;
        var gi = P(N, dt, Yt.value, G);
        if (gi === null) {
          dt === null && (dt = Nt);
          break;
        }
        t && dt && gi.alternate === null && e(N, dt), L = d(gi, L, kt), Pt === null ? ft = gi : Pt.sibling = gi, Pt = gi, dt = Nt;
      }
      if (Yt.done)
        return i(N, dt), zt && Sa(N, kt), ft;
      if (dt === null) {
        for (; !Yt.done; kt++, Yt = U.next())
          Yt = I(N, Yt.value, G), Yt !== null && (L = d(Yt, L, kt), Pt === null ? ft = Yt : Pt.sibling = Yt, Pt = Yt);
        return zt && Sa(N, kt), ft;
      }
      for (dt = s(dt); !Yt.done; kt++, Yt = U.next())
        Yt = K(dt, N, kt, Yt.value, G), Yt !== null && (t && Yt.alternate !== null && dt.delete(Yt.key === null ? kt : Yt.key), L = d(Yt, L, kt), Pt === null ? ft = Yt : Pt.sibling = Yt, Pt = Yt);
      return t && dt.forEach(function(Kx) {
        return e(N, Kx);
      }), zt && Sa(N, kt), ft;
    }
    function Qt(N, L, U, G) {
      if (typeof U == "object" && U !== null && U.type === A && U.key === null && (U = U.props.children), typeof U == "object" && U !== null) {
        switch (U.$$typeof) {
          case k:
            t: {
              for (var ft = U.key; L !== null; ) {
                if (L.key === ft) {
                  if (ft = U.type, ft === A) {
                    if (L.tag === 7) {
                      i(
                        N,
                        L.sibling
                      ), G = c(
                        L,
                        U.props.children
                      ), G.return = N, N = G;
                      break t;
                    }
                  } else if (L.elementType === ft || typeof ft == "object" && ft !== null && ft.$$typeof === F && Hi(ft) === L.type) {
                    i(
                      N,
                      L.sibling
                    ), G = c(L, U.props), ko(G, U), G.return = N, N = G;
                    break t;
                  }
                  i(N, L);
                  break;
                } else e(N, L);
                L = L.sibling;
              }
              U.type === A ? (G = _i(
                U.props.children,
                N.mode,
                G,
                U.key
              ), G.return = N, N = G) : (G = Os(
                U.type,
                U.key,
                U.props,
                null,
                N.mode,
                G
              ), ko(G, U), G.return = N, N = G);
            }
            return y(N);
          case E:
            t: {
              for (ft = U.key; L !== null; ) {
                if (L.key === ft)
                  if (L.tag === 4 && L.stateNode.containerInfo === U.containerInfo && L.stateNode.implementation === U.implementation) {
                    i(
                      N,
                      L.sibling
                    ), G = c(L, U.children || []), G.return = N, N = G;
                    break t;
                  } else {
                    i(N, L);
                    break;
                  }
                else e(N, L);
                L = L.sibling;
              }
              G = Vc(U, N.mode, G), G.return = N, N = G;
            }
            return y(N);
          case F:
            return U = Hi(U), Qt(
              N,
              L,
              U,
              G
            );
        }
        if (bt(U))
          return ct(
            N,
            L,
            U,
            G
          );
        if (yt(U)) {
          if (ft = yt(U), typeof ft != "function") throw Error(o(150));
          return U = ft.call(U), gt(
            N,
            L,
            U,
            G
          );
        }
        if (typeof U.then == "function")
          return Qt(
            N,
            L,
            Ps(U),
            G
          );
        if (U.$$typeof === R)
          return Qt(
            N,
            L,
            Us(N, U),
            G
          );
        Ys(N, U);
      }
      return typeof U == "string" && U !== "" || typeof U == "number" || typeof U == "bigint" ? (U = "" + U, L !== null && L.tag === 6 ? (i(N, L.sibling), G = c(L, U), G.return = N, N = G) : (i(N, L), G = Bc(U, N.mode, G), G.return = N, N = G), y(N)) : i(N, L);
    }
    return function(N, L, U, G) {
      try {
        So = 0;
        var ft = Qt(
          N,
          L,
          U,
          G
        );
        return wr = null, ft;
      } catch (dt) {
        if (dt === br || dt === Vs) throw dt;
        var Pt = xn(29, dt, null, N.mode);
        return Pt.lanes = G, Pt.return = N, Pt;
      }
    };
  }
  var Yi = pp(!0), mp = pp(!1), $a = !1;
  function Zc(t) {
    t.updateQueue = {
      baseState: t.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function Jc(t, e) {
    t = t.updateQueue, e.updateQueue === t && (e.updateQueue = {
      baseState: t.baseState,
      firstBaseUpdate: t.firstBaseUpdate,
      lastBaseUpdate: t.lastBaseUpdate,
      shared: t.shared,
      callbacks: null
    });
  }
  function ti(t) {
    return { lane: t, tag: 0, payload: null, callback: null, next: null };
  }
  function ei(t, e, i) {
    var s = t.updateQueue;
    if (s === null) return null;
    if (s = s.shared, (Kt & 2) !== 0) {
      var c = s.pending;
      return c === null ? e.next = e : (e.next = c.next, c.next = e), s.pending = e, e = Ns(t), Jh(t, null, i), e;
    }
    return Ds(t, s, e, i), Ns(t);
  }
  function To(t, e, i) {
    if (e = e.updateQueue, e !== null && (e = e.shared, (i & 4194048) !== 0)) {
      var s = e.lanes;
      s &= t.pendingLanes, i |= s, e.lanes = i, to(t, i);
    }
  }
  function $c(t, e) {
    var i = t.updateQueue, s = t.alternate;
    if (s !== null && (s = s.updateQueue, i === s)) {
      var c = null, d = null;
      if (i = i.firstBaseUpdate, i !== null) {
        do {
          var y = {
            lane: i.lane,
            tag: i.tag,
            payload: i.payload,
            callback: null,
            next: null
          };
          d === null ? c = d = y : d = d.next = y, i = i.next;
        } while (i !== null);
        d === null ? c = d = e : d = d.next = e;
      } else c = d = e;
      i = {
        baseState: s.baseState,
        firstBaseUpdate: c,
        lastBaseUpdate: d,
        shared: s.shared,
        callbacks: s.callbacks
      }, t.updateQueue = i;
      return;
    }
    t = i.lastBaseUpdate, t === null ? i.firstBaseUpdate = e : t.next = e, i.lastBaseUpdate = e;
  }
  var tu = !1;
  function Eo() {
    if (tu) {
      var t = vr;
      if (t !== null) throw t;
    }
  }
  function Mo(t, e, i, s) {
    tu = !1;
    var c = t.updateQueue;
    $a = !1;
    var d = c.firstBaseUpdate, y = c.lastBaseUpdate, w = c.shared.pending;
    if (w !== null) {
      c.shared.pending = null;
      var j = w, V = j.next;
      j.next = null, y === null ? d = V : y.next = V, y = j;
      var q = t.alternate;
      q !== null && (q = q.updateQueue, w = q.lastBaseUpdate, w !== y && (w === null ? q.firstBaseUpdate = V : w.next = V, q.lastBaseUpdate = j));
    }
    if (d !== null) {
      var I = c.baseState;
      y = 0, q = V = j = null, w = d;
      do {
        var P = w.lane & -536870913, K = P !== w.lane;
        if (K ? (Dt & P) === P : (s & P) === P) {
          P !== 0 && P === yr && (tu = !0), q !== null && (q = q.next = {
            lane: 0,
            tag: w.tag,
            payload: w.payload,
            callback: null,
            next: null
          });
          t: {
            var ct = t, gt = w;
            P = e;
            var Qt = i;
            switch (gt.tag) {
              case 1:
                if (ct = gt.payload, typeof ct == "function") {
                  I = ct.call(Qt, I, P);
                  break t;
                }
                I = ct;
                break t;
              case 3:
                ct.flags = ct.flags & -65537 | 128;
              case 0:
                if (ct = gt.payload, P = typeof ct == "function" ? ct.call(Qt, I, P) : ct, P == null) break t;
                I = v({}, I, P);
                break t;
              case 2:
                $a = !0;
            }
          }
          P = w.callback, P !== null && (t.flags |= 64, K && (t.flags |= 8192), K = c.callbacks, K === null ? c.callbacks = [P] : K.push(P));
        } else
          K = {
            lane: P,
            tag: w.tag,
            payload: w.payload,
            callback: w.callback,
            next: null
          }, q === null ? (V = q = K, j = I) : q = q.next = K, y |= P;
        if (w = w.next, w === null) {
          if (w = c.shared.pending, w === null)
            break;
          K = w, w = K.next, K.next = null, c.lastBaseUpdate = K, c.shared.pending = null;
        }
      } while (!0);
      q === null && (j = I), c.baseState = j, c.firstBaseUpdate = V, c.lastBaseUpdate = q, d === null && (c.shared.lanes = 0), oi |= y, t.lanes = y, t.memoizedState = I;
    }
  }
  function gp(t, e) {
    if (typeof t != "function")
      throw Error(o(191, t));
    t.call(e);
  }
  function yp(t, e) {
    var i = t.callbacks;
    if (i !== null)
      for (t.callbacks = null, t = 0; t < i.length; t++)
        gp(i[t], e);
  }
  var xr = T(null), Ks = T(0);
  function vp(t, e) {
    t = Na, B(Ks, t), B(xr, e), Na = t | e.baseLanes;
  }
  function eu() {
    B(Ks, Na), B(xr, xr.current);
  }
  function nu() {
    Na = Ks.current, _(xr), _(Ks);
  }
  var Sn = T(null), Hn = null;
  function ni(t) {
    var e = t.alternate;
    B(me, me.current & 1), B(Sn, t), Hn === null && (e === null || xr.current !== null || e.memoizedState !== null) && (Hn = t);
  }
  function au(t) {
    B(me, me.current), B(Sn, t), Hn === null && (Hn = t);
  }
  function bp(t) {
    t.tag === 22 ? (B(me, me.current), B(Sn, t), Hn === null && (Hn = t)) : ai();
  }
  function ai() {
    B(me, me.current), B(Sn, Sn.current);
  }
  function kn(t) {
    _(Sn), Hn === t && (Hn = null), _(me);
  }
  var me = T(0);
  function qs(t) {
    for (var e = t; e !== null; ) {
      if (e.tag === 13) {
        var i = e.memoizedState;
        if (i !== null && (i = i.dehydrated, i === null || cd(i) || ud(i)))
          return e;
      } else if (e.tag === 19 && (e.memoizedProps.revealOrder === "forwards" || e.memoizedProps.revealOrder === "backwards" || e.memoizedProps.revealOrder === "unstable_legacy-backwards" || e.memoizedProps.revealOrder === "together")) {
        if ((e.flags & 128) !== 0) return e;
      } else if (e.child !== null) {
        e.child.return = e, e = e.child;
        continue;
      }
      if (e === t) break;
      for (; e.sibling === null; ) {
        if (e.return === null || e.return === t) return null;
        e = e.return;
      }
      e.sibling.return = e.return, e = e.sibling;
    }
    return null;
  }
  var Ea = 0, St = null, Xt = null, we = null, Fs = !1, Sr = !1, Ki = !1, Gs = 0, Ro = 0, kr = null, Nw = 0;
  function ce() {
    throw Error(o(321));
  }
  function iu(t, e) {
    if (e === null) return !1;
    for (var i = 0; i < e.length && i < t.length; i++)
      if (!wn(t[i], e[i])) return !1;
    return !0;
  }
  function ru(t, e, i, s, c, d) {
    return Ea = d, St = e, e.memoizedState = null, e.updateQueue = null, e.lanes = 0, Y.H = t === null || t.memoizedState === null ? nm : wu, Ki = !1, d = i(s, c), Ki = !1, Sr && (d = xp(
      e,
      i,
      s,
      c
    )), wp(t), d;
  }
  function wp(t) {
    Y.H = jo;
    var e = Xt !== null && Xt.next !== null;
    if (Ea = 0, we = Xt = St = null, Fs = !1, Ro = 0, kr = null, e) throw Error(o(300));
    t === null || xe || (t = t.dependencies, t !== null && zs(t) && (xe = !0));
  }
  function xp(t, e, i, s) {
    St = t;
    var c = 0;
    do {
      if (Sr && (kr = null), Ro = 0, Sr = !1, 25 <= c) throw Error(o(301));
      if (c += 1, we = Xt = null, t.updateQueue != null) {
        var d = t.updateQueue;
        d.lastEffect = null, d.events = null, d.stores = null, d.memoCache != null && (d.memoCache.index = 0);
      }
      Y.H = am, d = e(i, s);
    } while (Sr);
    return d;
  }
  function Ow() {
    var t = Y.H, e = t.useState()[0];
    return e = typeof e.then == "function" ? Co(e) : e, t = t.useState()[0], (Xt !== null ? Xt.memoizedState : null) !== t && (St.flags |= 1024), e;
  }
  function ou() {
    var t = Gs !== 0;
    return Gs = 0, t;
  }
  function su(t, e, i) {
    e.updateQueue = t.updateQueue, e.flags &= -2053, t.lanes &= ~i;
  }
  function lu(t) {
    if (Fs) {
      for (t = t.memoizedState; t !== null; ) {
        var e = t.queue;
        e !== null && (e.pending = null), t = t.next;
      }
      Fs = !1;
    }
    Ea = 0, we = Xt = St = null, Sr = !1, Ro = Gs = 0, kr = null;
  }
  function en() {
    var t = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return we === null ? St.memoizedState = we = t : we = we.next = t, we;
  }
  function ge() {
    if (Xt === null) {
      var t = St.alternate;
      t = t !== null ? t.memoizedState : null;
    } else t = Xt.next;
    var e = we === null ? St.memoizedState : we.next;
    if (e !== null)
      we = e, Xt = t;
    else {
      if (t === null)
        throw St.alternate === null ? Error(o(467)) : Error(o(310));
      Xt = t, t = {
        memoizedState: Xt.memoizedState,
        baseState: Xt.baseState,
        baseQueue: Xt.baseQueue,
        queue: Xt.queue,
        next: null
      }, we === null ? St.memoizedState = we = t : we = we.next = t;
    }
    return we;
  }
  function Is() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function Co(t) {
    var e = Ro;
    return Ro += 1, kr === null && (kr = []), t = dp(kr, t, e), e = St, (we === null ? e.memoizedState : we.next) === null && (e = e.alternate, Y.H = e === null || e.memoizedState === null ? nm : wu), t;
  }
  function Xs(t) {
    if (t !== null && typeof t == "object") {
      if (typeof t.then == "function") return Co(t);
      if (t.$$typeof === R) return Be(t);
    }
    throw Error(o(438, String(t)));
  }
  function cu(t) {
    var e = null, i = St.updateQueue;
    if (i !== null && (e = i.memoCache), e == null) {
      var s = St.alternate;
      s !== null && (s = s.updateQueue, s !== null && (s = s.memoCache, s != null && (e = {
        data: s.data.map(function(c) {
          return c.slice();
        }),
        index: 0
      })));
    }
    if (e == null && (e = { data: [], index: 0 }), i === null && (i = Is(), St.updateQueue = i), i.memoCache = e, i = e.data[e.index], i === void 0)
      for (i = e.data[e.index] = Array(t), s = 0; s < t; s++)
        i[s] = rt;
    return e.index++, i;
  }
  function Ma(t, e) {
    return typeof e == "function" ? e(t) : e;
  }
  function Ws(t) {
    var e = ge();
    return uu(e, Xt, t);
  }
  function uu(t, e, i) {
    var s = t.queue;
    if (s === null) throw Error(o(311));
    s.lastRenderedReducer = i;
    var c = t.baseQueue, d = s.pending;
    if (d !== null) {
      if (c !== null) {
        var y = c.next;
        c.next = d.next, d.next = y;
      }
      e.baseQueue = c = d, s.pending = null;
    }
    if (d = t.baseState, c === null) t.memoizedState = d;
    else {
      e = c.next;
      var w = y = null, j = null, V = e, q = !1;
      do {
        var I = V.lane & -536870913;
        if (I !== V.lane ? (Dt & I) === I : (Ea & I) === I) {
          var P = V.revertLane;
          if (P === 0)
            j !== null && (j = j.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: V.action,
              hasEagerState: V.hasEagerState,
              eagerState: V.eagerState,
              next: null
            }), I === yr && (q = !0);
          else if ((Ea & P) === P) {
            V = V.next, P === yr && (q = !0);
            continue;
          } else
            I = {
              lane: 0,
              revertLane: V.revertLane,
              gesture: null,
              action: V.action,
              hasEagerState: V.hasEagerState,
              eagerState: V.eagerState,
              next: null
            }, j === null ? (w = j = I, y = d) : j = j.next = I, St.lanes |= P, oi |= P;
          I = V.action, Ki && i(d, I), d = V.hasEagerState ? V.eagerState : i(d, I);
        } else
          P = {
            lane: I,
            revertLane: V.revertLane,
            gesture: V.gesture,
            action: V.action,
            hasEagerState: V.hasEagerState,
            eagerState: V.eagerState,
            next: null
          }, j === null ? (w = j = P, y = d) : j = j.next = P, St.lanes |= I, oi |= I;
        V = V.next;
      } while (V !== null && V !== e);
      if (j === null ? y = d : j.next = w, !wn(d, t.memoizedState) && (xe = !0, q && (i = vr, i !== null)))
        throw i;
      t.memoizedState = d, t.baseState = y, t.baseQueue = j, s.lastRenderedState = d;
    }
    return c === null && (s.lanes = 0), [t.memoizedState, s.dispatch];
  }
  function du(t) {
    var e = ge(), i = e.queue;
    if (i === null) throw Error(o(311));
    i.lastRenderedReducer = t;
    var s = i.dispatch, c = i.pending, d = e.memoizedState;
    if (c !== null) {
      i.pending = null;
      var y = c = c.next;
      do
        d = t(d, y.action), y = y.next;
      while (y !== c);
      wn(d, e.memoizedState) || (xe = !0), e.memoizedState = d, e.baseQueue === null && (e.baseState = d), i.lastRenderedState = d;
    }
    return [d, s];
  }
  function Sp(t, e, i) {
    var s = St, c = ge(), d = zt;
    if (d) {
      if (i === void 0) throw Error(o(407));
      i = i();
    } else i = e();
    var y = !wn(
      (Xt || c).memoizedState,
      i
    );
    if (y && (c.memoizedState = i, xe = !0), c = c.queue, pu(Ep.bind(null, s, c, t), [
      t
    ]), c.getSnapshot !== e || y || we !== null && we.memoizedState.tag & 1) {
      if (s.flags |= 2048, Tr(
        9,
        { destroy: void 0 },
        Tp.bind(
          null,
          s,
          c,
          i,
          e
        ),
        null
      ), Zt === null) throw Error(o(349));
      d || (Ea & 127) !== 0 || kp(s, e, i);
    }
    return i;
  }
  function kp(t, e, i) {
    t.flags |= 16384, t = { getSnapshot: e, value: i }, e = St.updateQueue, e === null ? (e = Is(), St.updateQueue = e, e.stores = [t]) : (i = e.stores, i === null ? e.stores = [t] : i.push(t));
  }
  function Tp(t, e, i, s) {
    e.value = i, e.getSnapshot = s, Mp(e) && Rp(t);
  }
  function Ep(t, e, i) {
    return i(function() {
      Mp(e) && Rp(t);
    });
  }
  function Mp(t) {
    var e = t.getSnapshot;
    t = t.value;
    try {
      var i = e();
      return !wn(t, i);
    } catch {
      return !0;
    }
  }
  function Rp(t) {
    var e = Oi(t, 2);
    e !== null && gn(e, t, 2);
  }
  function fu(t) {
    var e = en();
    if (typeof t == "function") {
      var i = t;
      if (t = i(), Ki) {
        Ut(!0);
        try {
          i();
        } finally {
          Ut(!1);
        }
      }
    }
    return e.memoizedState = e.baseState = t, e.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Ma,
      lastRenderedState: t
    }, e;
  }
  function Cp(t, e, i, s) {
    return t.baseState = i, uu(
      t,
      Xt,
      typeof s == "function" ? s : Ma
    );
  }
  function _w(t, e, i, s, c) {
    if (Js(t)) throw Error(o(485));
    if (t = e.action, t !== null) {
      var d = {
        payload: c,
        action: t,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(y) {
          d.listeners.push(y);
        }
      };
      Y.T !== null ? i(!0) : d.isTransition = !1, s(d), i = e.pending, i === null ? (d.next = e.pending = d, Ap(e, d)) : (d.next = i.next, e.pending = i.next = d);
    }
  }
  function Ap(t, e) {
    var i = e.action, s = e.payload, c = t.state;
    if (e.isTransition) {
      var d = Y.T, y = {};
      Y.T = y;
      try {
        var w = i(c, s), j = Y.S;
        j !== null && j(y, w), jp(t, e, w);
      } catch (V) {
        hu(t, e, V);
      } finally {
        d !== null && y.types !== null && (d.types = y.types), Y.T = d;
      }
    } else
      try {
        d = i(c, s), jp(t, e, d);
      } catch (V) {
        hu(t, e, V);
      }
  }
  function jp(t, e, i) {
    i !== null && typeof i == "object" && typeof i.then == "function" ? i.then(
      function(s) {
        Lp(t, e, s);
      },
      function(s) {
        return hu(t, e, s);
      }
    ) : Lp(t, e, i);
  }
  function Lp(t, e, i) {
    e.status = "fulfilled", e.value = i, Dp(e), t.state = i, e = t.pending, e !== null && (i = e.next, i === e ? t.pending = null : (i = i.next, e.next = i, Ap(t, i)));
  }
  function hu(t, e, i) {
    var s = t.pending;
    if (t.pending = null, s !== null) {
      s = s.next;
      do
        e.status = "rejected", e.reason = i, Dp(e), e = e.next;
      while (e !== s);
    }
    t.action = null;
  }
  function Dp(t) {
    t = t.listeners;
    for (var e = 0; e < t.length; e++) (0, t[e])();
  }
  function Np(t, e) {
    return e;
  }
  function Op(t, e) {
    if (zt) {
      var i = Zt.formState;
      if (i !== null) {
        t: {
          var s = St;
          if (zt) {
            if (ne) {
              e: {
                for (var c = ne, d = Vn; c.nodeType !== 8; ) {
                  if (!d) {
                    c = null;
                    break e;
                  }
                  if (c = Pn(
                    c.nextSibling
                  ), c === null) {
                    c = null;
                    break e;
                  }
                }
                d = c.data, c = d === "F!" || d === "F" ? c : null;
              }
              if (c) {
                ne = Pn(
                  c.nextSibling
                ), s = c.data === "F!";
                break t;
              }
            }
            Za(s);
          }
          s = !1;
        }
        s && (e = i[0]);
      }
    }
    return i = en(), i.memoizedState = i.baseState = e, s = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Np,
      lastRenderedState: e
    }, i.queue = s, i = $p.bind(
      null,
      St,
      s
    ), s.dispatch = i, s = fu(!1), d = bu.bind(
      null,
      St,
      !1,
      s.queue
    ), s = en(), c = {
      state: e,
      dispatch: null,
      action: t,
      pending: null
    }, s.queue = c, i = _w.bind(
      null,
      St,
      c,
      d,
      i
    ), c.dispatch = i, s.memoizedState = t, [e, i, !1];
  }
  function _p(t) {
    var e = ge();
    return zp(e, Xt, t);
  }
  function zp(t, e, i) {
    if (e = uu(
      t,
      e,
      Np
    )[0], t = Ws(Ma)[0], typeof e == "object" && e !== null && typeof e.then == "function")
      try {
        var s = Co(e);
      } catch (y) {
        throw y === br ? Vs : y;
      }
    else s = e;
    e = ge();
    var c = e.queue, d = c.dispatch;
    return i !== e.memoizedState && (St.flags |= 2048, Tr(
      9,
      { destroy: void 0 },
      zw.bind(null, c, i),
      null
    )), [s, d, t];
  }
  function zw(t, e) {
    t.action = e;
  }
  function Up(t) {
    var e = ge(), i = Xt;
    if (i !== null)
      return zp(e, i, t);
    ge(), e = e.memoizedState, i = ge();
    var s = i.queue.dispatch;
    return i.memoizedState = t, [e, s, !1];
  }
  function Tr(t, e, i, s) {
    return t = { tag: t, create: i, deps: s, inst: e, next: null }, e = St.updateQueue, e === null && (e = Is(), St.updateQueue = e), i = e.lastEffect, i === null ? e.lastEffect = t.next = t : (s = i.next, i.next = t, t.next = s, e.lastEffect = t), t;
  }
  function Bp() {
    return ge().memoizedState;
  }
  function Qs(t, e, i, s) {
    var c = en();
    St.flags |= t, c.memoizedState = Tr(
      1 | e,
      { destroy: void 0 },
      i,
      s === void 0 ? null : s
    );
  }
  function Zs(t, e, i, s) {
    var c = ge();
    s = s === void 0 ? null : s;
    var d = c.memoizedState.inst;
    Xt !== null && s !== null && iu(s, Xt.memoizedState.deps) ? c.memoizedState = Tr(e, d, i, s) : (St.flags |= t, c.memoizedState = Tr(
      1 | e,
      d,
      i,
      s
    ));
  }
  function Vp(t, e) {
    Qs(8390656, 8, t, e);
  }
  function pu(t, e) {
    Zs(2048, 8, t, e);
  }
  function Uw(t) {
    St.flags |= 4;
    var e = St.updateQueue;
    if (e === null)
      e = Is(), St.updateQueue = e, e.events = [t];
    else {
      var i = e.events;
      i === null ? e.events = [t] : i.push(t);
    }
  }
  function Hp(t) {
    var e = ge().memoizedState;
    return Uw({ ref: e, nextImpl: t }), function() {
      if ((Kt & 2) !== 0) throw Error(o(440));
      return e.impl.apply(void 0, arguments);
    };
  }
  function Pp(t, e) {
    return Zs(4, 2, t, e);
  }
  function Yp(t, e) {
    return Zs(4, 4, t, e);
  }
  function Kp(t, e) {
    if (typeof e == "function") {
      t = t();
      var i = e(t);
      return function() {
        typeof i == "function" ? i() : e(null);
      };
    }
    if (e != null)
      return t = t(), e.current = t, function() {
        e.current = null;
      };
  }
  function qp(t, e, i) {
    i = i != null ? i.concat([t]) : null, Zs(4, 4, Kp.bind(null, e, t), i);
  }
  function mu() {
  }
  function Fp(t, e) {
    var i = ge();
    e = e === void 0 ? null : e;
    var s = i.memoizedState;
    return e !== null && iu(e, s[1]) ? s[0] : (i.memoizedState = [t, e], t);
  }
  function Gp(t, e) {
    var i = ge();
    e = e === void 0 ? null : e;
    var s = i.memoizedState;
    if (e !== null && iu(e, s[1]))
      return s[0];
    if (s = t(), Ki) {
      Ut(!0);
      try {
        t();
      } finally {
        Ut(!1);
      }
    }
    return i.memoizedState = [s, e], s;
  }
  function gu(t, e, i) {
    return i === void 0 || (Ea & 1073741824) !== 0 && (Dt & 261930) === 0 ? t.memoizedState = e : (t.memoizedState = i, t = Im(), St.lanes |= t, oi |= t, i);
  }
  function Ip(t, e, i, s) {
    return wn(i, e) ? i : xr.current !== null ? (t = gu(t, i, s), wn(t, e) || (xe = !0), t) : (Ea & 42) === 0 || (Ea & 1073741824) !== 0 && (Dt & 261930) === 0 ? (xe = !0, t.memoizedState = i) : (t = Im(), St.lanes |= t, oi |= t, e);
  }
  function Xp(t, e, i, s, c) {
    var d = J.p;
    J.p = d !== 0 && 8 > d ? d : 8;
    var y = Y.T, w = {};
    Y.T = w, bu(t, !1, e, i);
    try {
      var j = c(), V = Y.S;
      if (V !== null && V(w, j), j !== null && typeof j == "object" && typeof j.then == "function") {
        var q = Dw(
          j,
          s
        );
        Ao(
          t,
          e,
          q,
          Mn(t)
        );
      } else
        Ao(
          t,
          e,
          s,
          Mn(t)
        );
    } catch (I) {
      Ao(
        t,
        e,
        { then: function() {
        }, status: "rejected", reason: I },
        Mn()
      );
    } finally {
      J.p = d, y !== null && w.types !== null && (y.types = w.types), Y.T = y;
    }
  }
  function Bw() {
  }
  function yu(t, e, i, s) {
    if (t.tag !== 5) throw Error(o(476));
    var c = Wp(t).queue;
    Xp(
      t,
      c,
      e,
      et,
      i === null ? Bw : function() {
        return Qp(t), i(s);
      }
    );
  }
  function Wp(t) {
    var e = t.memoizedState;
    if (e !== null) return e;
    e = {
      memoizedState: et,
      baseState: et,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Ma,
        lastRenderedState: et
      },
      next: null
    };
    var i = {};
    return e.next = {
      memoizedState: i,
      baseState: i,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Ma,
        lastRenderedState: i
      },
      next: null
    }, t.memoizedState = e, t = t.alternate, t !== null && (t.memoizedState = e), e;
  }
  function Qp(t) {
    var e = Wp(t);
    e.next === null && (e = t.alternate.memoizedState), Ao(
      t,
      e.next.queue,
      {},
      Mn()
    );
  }
  function vu() {
    return Be(Go);
  }
  function Zp() {
    return ge().memoizedState;
  }
  function Jp() {
    return ge().memoizedState;
  }
  function Vw(t) {
    for (var e = t.return; e !== null; ) {
      switch (e.tag) {
        case 24:
        case 3:
          var i = Mn();
          t = ti(i);
          var s = ei(e, t, i);
          s !== null && (gn(s, e, i), To(s, e, i)), e = { cache: Ic() }, t.payload = e;
          return;
      }
      e = e.return;
    }
  }
  function Hw(t, e, i) {
    var s = Mn();
    i = {
      lane: s,
      revertLane: 0,
      gesture: null,
      action: i,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, Js(t) ? tm(e, i) : (i = zc(t, e, i, s), i !== null && (gn(i, t, s), em(i, e, s)));
  }
  function $p(t, e, i) {
    var s = Mn();
    Ao(t, e, i, s);
  }
  function Ao(t, e, i, s) {
    var c = {
      lane: s,
      revertLane: 0,
      gesture: null,
      action: i,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (Js(t)) tm(e, c);
    else {
      var d = t.alternate;
      if (t.lanes === 0 && (d === null || d.lanes === 0) && (d = e.lastRenderedReducer, d !== null))
        try {
          var y = e.lastRenderedState, w = d(y, i);
          if (c.hasEagerState = !0, c.eagerState = w, wn(w, y))
            return Ds(t, e, c, 0), Zt === null && Ls(), !1;
        } catch {
        }
      if (i = zc(t, e, c, s), i !== null)
        return gn(i, t, s), em(i, e, s), !0;
    }
    return !1;
  }
  function bu(t, e, i, s) {
    if (s = {
      lane: 2,
      revertLane: Zu(),
      gesture: null,
      action: s,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, Js(t)) {
      if (e) throw Error(o(479));
    } else
      e = zc(
        t,
        i,
        s,
        2
      ), e !== null && gn(e, t, 2);
  }
  function Js(t) {
    var e = t.alternate;
    return t === St || e !== null && e === St;
  }
  function tm(t, e) {
    Sr = Fs = !0;
    var i = t.pending;
    i === null ? e.next = e : (e.next = i.next, i.next = e), t.pending = e;
  }
  function em(t, e, i) {
    if ((i & 4194048) !== 0) {
      var s = e.lanes;
      s &= t.pendingLanes, i |= s, e.lanes = i, to(t, i);
    }
  }
  var jo = {
    readContext: Be,
    use: Xs,
    useCallback: ce,
    useContext: ce,
    useEffect: ce,
    useImperativeHandle: ce,
    useLayoutEffect: ce,
    useInsertionEffect: ce,
    useMemo: ce,
    useReducer: ce,
    useRef: ce,
    useState: ce,
    useDebugValue: ce,
    useDeferredValue: ce,
    useTransition: ce,
    useSyncExternalStore: ce,
    useId: ce,
    useHostTransitionStatus: ce,
    useFormState: ce,
    useActionState: ce,
    useOptimistic: ce,
    useMemoCache: ce,
    useCacheRefresh: ce
  };
  jo.useEffectEvent = ce;
  var nm = {
    readContext: Be,
    use: Xs,
    useCallback: function(t, e) {
      return en().memoizedState = [
        t,
        e === void 0 ? null : e
      ], t;
    },
    useContext: Be,
    useEffect: Vp,
    useImperativeHandle: function(t, e, i) {
      i = i != null ? i.concat([t]) : null, Qs(
        4194308,
        4,
        Kp.bind(null, e, t),
        i
      );
    },
    useLayoutEffect: function(t, e) {
      return Qs(4194308, 4, t, e);
    },
    useInsertionEffect: function(t, e) {
      Qs(4, 2, t, e);
    },
    useMemo: function(t, e) {
      var i = en();
      e = e === void 0 ? null : e;
      var s = t();
      if (Ki) {
        Ut(!0);
        try {
          t();
        } finally {
          Ut(!1);
        }
      }
      return i.memoizedState = [s, e], s;
    },
    useReducer: function(t, e, i) {
      var s = en();
      if (i !== void 0) {
        var c = i(e);
        if (Ki) {
          Ut(!0);
          try {
            i(e);
          } finally {
            Ut(!1);
          }
        }
      } else c = e;
      return s.memoizedState = s.baseState = c, t = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: t,
        lastRenderedState: c
      }, s.queue = t, t = t.dispatch = Hw.bind(
        null,
        St,
        t
      ), [s.memoizedState, t];
    },
    useRef: function(t) {
      var e = en();
      return t = { current: t }, e.memoizedState = t;
    },
    useState: function(t) {
      t = fu(t);
      var e = t.queue, i = $p.bind(null, St, e);
      return e.dispatch = i, [t.memoizedState, i];
    },
    useDebugValue: mu,
    useDeferredValue: function(t, e) {
      var i = en();
      return gu(i, t, e);
    },
    useTransition: function() {
      var t = fu(!1);
      return t = Xp.bind(
        null,
        St,
        t.queue,
        !0,
        !1
      ), en().memoizedState = t, [!1, t];
    },
    useSyncExternalStore: function(t, e, i) {
      var s = St, c = en();
      if (zt) {
        if (i === void 0)
          throw Error(o(407));
        i = i();
      } else {
        if (i = e(), Zt === null)
          throw Error(o(349));
        (Dt & 127) !== 0 || kp(s, e, i);
      }
      c.memoizedState = i;
      var d = { value: i, getSnapshot: e };
      return c.queue = d, Vp(Ep.bind(null, s, d, t), [
        t
      ]), s.flags |= 2048, Tr(
        9,
        { destroy: void 0 },
        Tp.bind(
          null,
          s,
          d,
          i,
          e
        ),
        null
      ), i;
    },
    useId: function() {
      var t = en(), e = Zt.identifierPrefix;
      if (zt) {
        var i = sa, s = oa;
        i = (s & ~(1 << 32 - je(s) - 1)).toString(32) + i, e = "_" + e + "R_" + i, i = Gs++, 0 < i && (e += "H" + i.toString(32)), e += "_";
      } else
        i = Nw++, e = "_" + e + "r_" + i.toString(32) + "_";
      return t.memoizedState = e;
    },
    useHostTransitionStatus: vu,
    useFormState: Op,
    useActionState: Op,
    useOptimistic: function(t) {
      var e = en();
      e.memoizedState = e.baseState = t;
      var i = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return e.queue = i, e = bu.bind(
        null,
        St,
        !0,
        i
      ), i.dispatch = e, [t, e];
    },
    useMemoCache: cu,
    useCacheRefresh: function() {
      return en().memoizedState = Vw.bind(
        null,
        St
      );
    },
    useEffectEvent: function(t) {
      var e = en(), i = { impl: t };
      return e.memoizedState = i, function() {
        if ((Kt & 2) !== 0)
          throw Error(o(440));
        return i.impl.apply(void 0, arguments);
      };
    }
  }, wu = {
    readContext: Be,
    use: Xs,
    useCallback: Fp,
    useContext: Be,
    useEffect: pu,
    useImperativeHandle: qp,
    useInsertionEffect: Pp,
    useLayoutEffect: Yp,
    useMemo: Gp,
    useReducer: Ws,
    useRef: Bp,
    useState: function() {
      return Ws(Ma);
    },
    useDebugValue: mu,
    useDeferredValue: function(t, e) {
      var i = ge();
      return Ip(
        i,
        Xt.memoizedState,
        t,
        e
      );
    },
    useTransition: function() {
      var t = Ws(Ma)[0], e = ge().memoizedState;
      return [
        typeof t == "boolean" ? t : Co(t),
        e
      ];
    },
    useSyncExternalStore: Sp,
    useId: Zp,
    useHostTransitionStatus: vu,
    useFormState: _p,
    useActionState: _p,
    useOptimistic: function(t, e) {
      var i = ge();
      return Cp(i, Xt, t, e);
    },
    useMemoCache: cu,
    useCacheRefresh: Jp
  };
  wu.useEffectEvent = Hp;
  var am = {
    readContext: Be,
    use: Xs,
    useCallback: Fp,
    useContext: Be,
    useEffect: pu,
    useImperativeHandle: qp,
    useInsertionEffect: Pp,
    useLayoutEffect: Yp,
    useMemo: Gp,
    useReducer: du,
    useRef: Bp,
    useState: function() {
      return du(Ma);
    },
    useDebugValue: mu,
    useDeferredValue: function(t, e) {
      var i = ge();
      return Xt === null ? gu(i, t, e) : Ip(
        i,
        Xt.memoizedState,
        t,
        e
      );
    },
    useTransition: function() {
      var t = du(Ma)[0], e = ge().memoizedState;
      return [
        typeof t == "boolean" ? t : Co(t),
        e
      ];
    },
    useSyncExternalStore: Sp,
    useId: Zp,
    useHostTransitionStatus: vu,
    useFormState: Up,
    useActionState: Up,
    useOptimistic: function(t, e) {
      var i = ge();
      return Xt !== null ? Cp(i, Xt, t, e) : (i.baseState = t, [t, i.queue.dispatch]);
    },
    useMemoCache: cu,
    useCacheRefresh: Jp
  };
  am.useEffectEvent = Hp;
  function xu(t, e, i, s) {
    e = t.memoizedState, i = i(s, e), i = i == null ? e : v({}, e, i), t.memoizedState = i, t.lanes === 0 && (t.updateQueue.baseState = i);
  }
  var Su = {
    enqueueSetState: function(t, e, i) {
      t = t._reactInternals;
      var s = Mn(), c = ti(s);
      c.payload = e, i != null && (c.callback = i), e = ei(t, c, s), e !== null && (gn(e, t, s), To(e, t, s));
    },
    enqueueReplaceState: function(t, e, i) {
      t = t._reactInternals;
      var s = Mn(), c = ti(s);
      c.tag = 1, c.payload = e, i != null && (c.callback = i), e = ei(t, c, s), e !== null && (gn(e, t, s), To(e, t, s));
    },
    enqueueForceUpdate: function(t, e) {
      t = t._reactInternals;
      var i = Mn(), s = ti(i);
      s.tag = 2, e != null && (s.callback = e), e = ei(t, s, i), e !== null && (gn(e, t, i), To(e, t, i));
    }
  };
  function im(t, e, i, s, c, d, y) {
    return t = t.stateNode, typeof t.shouldComponentUpdate == "function" ? t.shouldComponentUpdate(s, d, y) : e.prototype && e.prototype.isPureReactComponent ? !go(i, s) || !go(c, d) : !0;
  }
  function rm(t, e, i, s) {
    t = e.state, typeof e.componentWillReceiveProps == "function" && e.componentWillReceiveProps(i, s), typeof e.UNSAFE_componentWillReceiveProps == "function" && e.UNSAFE_componentWillReceiveProps(i, s), e.state !== t && Su.enqueueReplaceState(e, e.state, null);
  }
  function qi(t, e) {
    var i = e;
    if ("ref" in e) {
      i = {};
      for (var s in e)
        s !== "ref" && (i[s] = e[s]);
    }
    if (t = t.defaultProps) {
      i === e && (i = v({}, i));
      for (var c in t)
        i[c] === void 0 && (i[c] = t[c]);
    }
    return i;
  }
  function om(t) {
    js(t);
  }
  function sm(t) {
    console.error(t);
  }
  function lm(t) {
    js(t);
  }
  function $s(t, e) {
    try {
      var i = t.onUncaughtError;
      i(e.value, { componentStack: e.stack });
    } catch (s) {
      setTimeout(function() {
        throw s;
      });
    }
  }
  function cm(t, e, i) {
    try {
      var s = t.onCaughtError;
      s(i.value, {
        componentStack: i.stack,
        errorBoundary: e.tag === 1 ? e.stateNode : null
      });
    } catch (c) {
      setTimeout(function() {
        throw c;
      });
    }
  }
  function ku(t, e, i) {
    return i = ti(i), i.tag = 3, i.payload = { element: null }, i.callback = function() {
      $s(t, e);
    }, i;
  }
  function um(t) {
    return t = ti(t), t.tag = 3, t;
  }
  function dm(t, e, i, s) {
    var c = i.type.getDerivedStateFromError;
    if (typeof c == "function") {
      var d = s.value;
      t.payload = function() {
        return c(d);
      }, t.callback = function() {
        cm(e, i, s);
      };
    }
    var y = i.stateNode;
    y !== null && typeof y.componentDidCatch == "function" && (t.callback = function() {
      cm(e, i, s), typeof c != "function" && (si === null ? si = /* @__PURE__ */ new Set([this]) : si.add(this));
      var w = s.stack;
      this.componentDidCatch(s.value, {
        componentStack: w !== null ? w : ""
      });
    });
  }
  function Pw(t, e, i, s, c) {
    if (i.flags |= 32768, s !== null && typeof s == "object" && typeof s.then == "function") {
      if (e = i.alternate, e !== null && gr(
        e,
        i,
        c,
        !0
      ), i = Sn.current, i !== null) {
        switch (i.tag) {
          case 31:
          case 13:
            return Hn === null ? dl() : i.alternate === null && ue === 0 && (ue = 3), i.flags &= -257, i.flags |= 65536, i.lanes = c, s === Hs ? i.flags |= 16384 : (e = i.updateQueue, e === null ? i.updateQueue = /* @__PURE__ */ new Set([s]) : e.add(s), Xu(t, s, c)), !1;
          case 22:
            return i.flags |= 65536, s === Hs ? i.flags |= 16384 : (e = i.updateQueue, e === null ? (e = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([s])
            }, i.updateQueue = e) : (i = e.retryQueue, i === null ? e.retryQueue = /* @__PURE__ */ new Set([s]) : i.add(s)), Xu(t, s, c)), !1;
        }
        throw Error(o(435, i.tag));
      }
      return Xu(t, s, c), dl(), !1;
    }
    if (zt)
      return e = Sn.current, e !== null ? ((e.flags & 65536) === 0 && (e.flags |= 256), e.flags |= 65536, e.lanes = c, s !== Yc && (t = Error(o(422), { cause: s }), bo(zn(t, i)))) : (s !== Yc && (e = Error(o(423), {
        cause: s
      }), bo(
        zn(e, i)
      )), t = t.current.alternate, t.flags |= 65536, c &= -c, t.lanes |= c, s = zn(s, i), c = ku(
        t.stateNode,
        s,
        c
      ), $c(t, c), ue !== 4 && (ue = 2)), !1;
    var d = Error(o(520), { cause: s });
    if (d = zn(d, i), Bo === null ? Bo = [d] : Bo.push(d), ue !== 4 && (ue = 2), e === null) return !0;
    s = zn(s, i), i = e;
    do {
      switch (i.tag) {
        case 3:
          return i.flags |= 65536, t = c & -c, i.lanes |= t, t = ku(i.stateNode, s, t), $c(i, t), !1;
        case 1:
          if (e = i.type, d = i.stateNode, (i.flags & 128) === 0 && (typeof e.getDerivedStateFromError == "function" || d !== null && typeof d.componentDidCatch == "function" && (si === null || !si.has(d))))
            return i.flags |= 65536, c &= -c, i.lanes |= c, c = um(c), dm(
              c,
              t,
              i,
              s
            ), $c(i, c), !1;
      }
      i = i.return;
    } while (i !== null);
    return !1;
  }
  var Tu = Error(o(461)), xe = !1;
  function Ve(t, e, i, s) {
    e.child = t === null ? mp(e, null, i, s) : Yi(
      e,
      t.child,
      i,
      s
    );
  }
  function fm(t, e, i, s, c) {
    i = i.render;
    var d = e.ref;
    if ("ref" in s) {
      var y = {};
      for (var w in s)
        w !== "ref" && (y[w] = s[w]);
    } else y = s;
    return Bi(e), s = ru(
      t,
      e,
      i,
      y,
      d,
      c
    ), w = ou(), t !== null && !xe ? (su(t, e, c), Ra(t, e, c)) : (zt && w && Hc(e), e.flags |= 1, Ve(t, e, s, c), e.child);
  }
  function hm(t, e, i, s, c) {
    if (t === null) {
      var d = i.type;
      return typeof d == "function" && !Uc(d) && d.defaultProps === void 0 && i.compare === null ? (e.tag = 15, e.type = d, pm(
        t,
        e,
        d,
        s,
        c
      )) : (t = Os(
        i.type,
        null,
        s,
        e,
        e.mode,
        c
      ), t.ref = e.ref, t.return = e, e.child = t);
    }
    if (d = t.child, !Du(t, c)) {
      var y = d.memoizedProps;
      if (i = i.compare, i = i !== null ? i : go, i(y, s) && t.ref === e.ref)
        return Ra(t, e, c);
    }
    return e.flags |= 1, t = xa(d, s), t.ref = e.ref, t.return = e, e.child = t;
  }
  function pm(t, e, i, s, c) {
    if (t !== null) {
      var d = t.memoizedProps;
      if (go(d, s) && t.ref === e.ref)
        if (xe = !1, e.pendingProps = s = d, Du(t, c))
          (t.flags & 131072) !== 0 && (xe = !0);
        else
          return e.lanes = t.lanes, Ra(t, e, c);
    }
    return Eu(
      t,
      e,
      i,
      s,
      c
    );
  }
  function mm(t, e, i, s) {
    var c = s.children, d = t !== null ? t.memoizedState : null;
    if (t === null && e.stateNode === null && (e.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), s.mode === "hidden") {
      if ((e.flags & 128) !== 0) {
        if (d = d !== null ? d.baseLanes | i : i, t !== null) {
          for (s = e.child = t.child, c = 0; s !== null; )
            c = c | s.lanes | s.childLanes, s = s.sibling;
          s = c & ~d;
        } else s = 0, e.child = null;
        return gm(
          t,
          e,
          d,
          i,
          s
        );
      }
      if ((i & 536870912) !== 0)
        e.memoizedState = { baseLanes: 0, cachePool: null }, t !== null && Bs(
          e,
          d !== null ? d.cachePool : null
        ), d !== null ? vp(e, d) : eu(), bp(e);
      else
        return s = e.lanes = 536870912, gm(
          t,
          e,
          d !== null ? d.baseLanes | i : i,
          i,
          s
        );
    } else
      d !== null ? (Bs(e, d.cachePool), vp(e, d), ai(), e.memoizedState = null) : (t !== null && Bs(e, null), eu(), ai());
    return Ve(t, e, c, i), e.child;
  }
  function Lo(t, e) {
    return t !== null && t.tag === 22 || e.stateNode !== null || (e.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), e.sibling;
  }
  function gm(t, e, i, s, c) {
    var d = Wc();
    return d = d === null ? null : { parent: be._currentValue, pool: d }, e.memoizedState = {
      baseLanes: i,
      cachePool: d
    }, t !== null && Bs(e, null), eu(), bp(e), t !== null && gr(t, e, s, !0), e.childLanes = c, null;
  }
  function tl(t, e) {
    return e = nl(
      { mode: e.mode, children: e.children },
      t.mode
    ), e.ref = t.ref, t.child = e, e.return = t, e;
  }
  function ym(t, e, i) {
    return Yi(e, t.child, null, i), t = tl(e, e.pendingProps), t.flags |= 2, kn(e), e.memoizedState = null, t;
  }
  function Yw(t, e, i) {
    var s = e.pendingProps, c = (e.flags & 128) !== 0;
    if (e.flags &= -129, t === null) {
      if (zt) {
        if (s.mode === "hidden")
          return t = tl(e, s), e.lanes = 536870912, Lo(null, t);
        if (au(e), (t = ne) ? (t = Ag(
          t,
          Vn
        ), t = t !== null && t.data === "&" ? t : null, t !== null && (e.memoizedState = {
          dehydrated: t,
          treeContext: Wa !== null ? { id: oa, overflow: sa } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, i = tp(t), i.return = e, e.child = i, Ue = e, ne = null)) : t = null, t === null) throw Za(e);
        return e.lanes = 536870912, null;
      }
      return tl(e, s);
    }
    var d = t.memoizedState;
    if (d !== null) {
      var y = d.dehydrated;
      if (au(e), c)
        if (e.flags & 256)
          e.flags &= -257, e = ym(
            t,
            e,
            i
          );
        else if (e.memoizedState !== null)
          e.child = t.child, e.flags |= 128, e = null;
        else throw Error(o(558));
      else if (xe || gr(t, e, i, !1), c = (i & t.childLanes) !== 0, xe || c) {
        if (s = Zt, s !== null && (y = xs(s, i), y !== 0 && y !== d.retryLane))
          throw d.retryLane = y, Oi(t, y), gn(s, t, y), Tu;
        dl(), e = ym(
          t,
          e,
          i
        );
      } else
        t = d.treeContext, ne = Pn(y.nextSibling), Ue = e, zt = !0, Qa = null, Vn = !1, t !== null && ap(e, t), e = tl(e, s), e.flags |= 4096;
      return e;
    }
    return t = xa(t.child, {
      mode: s.mode,
      children: s.children
    }), t.ref = e.ref, e.child = t, t.return = e, t;
  }
  function el(t, e) {
    var i = e.ref;
    if (i === null)
      t !== null && t.ref !== null && (e.flags |= 4194816);
    else {
      if (typeof i != "function" && typeof i != "object")
        throw Error(o(284));
      (t === null || t.ref !== i) && (e.flags |= 4194816);
    }
  }
  function Eu(t, e, i, s, c) {
    return Bi(e), i = ru(
      t,
      e,
      i,
      s,
      void 0,
      c
    ), s = ou(), t !== null && !xe ? (su(t, e, c), Ra(t, e, c)) : (zt && s && Hc(e), e.flags |= 1, Ve(t, e, i, c), e.child);
  }
  function vm(t, e, i, s, c, d) {
    return Bi(e), e.updateQueue = null, i = xp(
      e,
      s,
      i,
      c
    ), wp(t), s = ou(), t !== null && !xe ? (su(t, e, d), Ra(t, e, d)) : (zt && s && Hc(e), e.flags |= 1, Ve(t, e, i, d), e.child);
  }
  function bm(t, e, i, s, c) {
    if (Bi(e), e.stateNode === null) {
      var d = fr, y = i.contextType;
      typeof y == "object" && y !== null && (d = Be(y)), d = new i(s, d), e.memoizedState = d.state !== null && d.state !== void 0 ? d.state : null, d.updater = Su, e.stateNode = d, d._reactInternals = e, d = e.stateNode, d.props = s, d.state = e.memoizedState, d.refs = {}, Zc(e), y = i.contextType, d.context = typeof y == "object" && y !== null ? Be(y) : fr, d.state = e.memoizedState, y = i.getDerivedStateFromProps, typeof y == "function" && (xu(
        e,
        i,
        y,
        s
      ), d.state = e.memoizedState), typeof i.getDerivedStateFromProps == "function" || typeof d.getSnapshotBeforeUpdate == "function" || typeof d.UNSAFE_componentWillMount != "function" && typeof d.componentWillMount != "function" || (y = d.state, typeof d.componentWillMount == "function" && d.componentWillMount(), typeof d.UNSAFE_componentWillMount == "function" && d.UNSAFE_componentWillMount(), y !== d.state && Su.enqueueReplaceState(d, d.state, null), Mo(e, s, d, c), Eo(), d.state = e.memoizedState), typeof d.componentDidMount == "function" && (e.flags |= 4194308), s = !0;
    } else if (t === null) {
      d = e.stateNode;
      var w = e.memoizedProps, j = qi(i, w);
      d.props = j;
      var V = d.context, q = i.contextType;
      y = fr, typeof q == "object" && q !== null && (y = Be(q));
      var I = i.getDerivedStateFromProps;
      q = typeof I == "function" || typeof d.getSnapshotBeforeUpdate == "function", w = e.pendingProps !== w, q || typeof d.UNSAFE_componentWillReceiveProps != "function" && typeof d.componentWillReceiveProps != "function" || (w || V !== y) && rm(
        e,
        d,
        s,
        y
      ), $a = !1;
      var P = e.memoizedState;
      d.state = P, Mo(e, s, d, c), Eo(), V = e.memoizedState, w || P !== V || $a ? (typeof I == "function" && (xu(
        e,
        i,
        I,
        s
      ), V = e.memoizedState), (j = $a || im(
        e,
        i,
        j,
        s,
        P,
        V,
        y
      )) ? (q || typeof d.UNSAFE_componentWillMount != "function" && typeof d.componentWillMount != "function" || (typeof d.componentWillMount == "function" && d.componentWillMount(), typeof d.UNSAFE_componentWillMount == "function" && d.UNSAFE_componentWillMount()), typeof d.componentDidMount == "function" && (e.flags |= 4194308)) : (typeof d.componentDidMount == "function" && (e.flags |= 4194308), e.memoizedProps = s, e.memoizedState = V), d.props = s, d.state = V, d.context = y, s = j) : (typeof d.componentDidMount == "function" && (e.flags |= 4194308), s = !1);
    } else {
      d = e.stateNode, Jc(t, e), y = e.memoizedProps, q = qi(i, y), d.props = q, I = e.pendingProps, P = d.context, V = i.contextType, j = fr, typeof V == "object" && V !== null && (j = Be(V)), w = i.getDerivedStateFromProps, (V = typeof w == "function" || typeof d.getSnapshotBeforeUpdate == "function") || typeof d.UNSAFE_componentWillReceiveProps != "function" && typeof d.componentWillReceiveProps != "function" || (y !== I || P !== j) && rm(
        e,
        d,
        s,
        j
      ), $a = !1, P = e.memoizedState, d.state = P, Mo(e, s, d, c), Eo();
      var K = e.memoizedState;
      y !== I || P !== K || $a || t !== null && t.dependencies !== null && zs(t.dependencies) ? (typeof w == "function" && (xu(
        e,
        i,
        w,
        s
      ), K = e.memoizedState), (q = $a || im(
        e,
        i,
        q,
        s,
        P,
        K,
        j
      ) || t !== null && t.dependencies !== null && zs(t.dependencies)) ? (V || typeof d.UNSAFE_componentWillUpdate != "function" && typeof d.componentWillUpdate != "function" || (typeof d.componentWillUpdate == "function" && d.componentWillUpdate(s, K, j), typeof d.UNSAFE_componentWillUpdate == "function" && d.UNSAFE_componentWillUpdate(
        s,
        K,
        j
      )), typeof d.componentDidUpdate == "function" && (e.flags |= 4), typeof d.getSnapshotBeforeUpdate == "function" && (e.flags |= 1024)) : (typeof d.componentDidUpdate != "function" || y === t.memoizedProps && P === t.memoizedState || (e.flags |= 4), typeof d.getSnapshotBeforeUpdate != "function" || y === t.memoizedProps && P === t.memoizedState || (e.flags |= 1024), e.memoizedProps = s, e.memoizedState = K), d.props = s, d.state = K, d.context = j, s = q) : (typeof d.componentDidUpdate != "function" || y === t.memoizedProps && P === t.memoizedState || (e.flags |= 4), typeof d.getSnapshotBeforeUpdate != "function" || y === t.memoizedProps && P === t.memoizedState || (e.flags |= 1024), s = !1);
    }
    return d = s, el(t, e), s = (e.flags & 128) !== 0, d || s ? (d = e.stateNode, i = s && typeof i.getDerivedStateFromError != "function" ? null : d.render(), e.flags |= 1, t !== null && s ? (e.child = Yi(
      e,
      t.child,
      null,
      c
    ), e.child = Yi(
      e,
      null,
      i,
      c
    )) : Ve(t, e, i, c), e.memoizedState = d.state, t = e.child) : t = Ra(
      t,
      e,
      c
    ), t;
  }
  function wm(t, e, i, s) {
    return zi(), e.flags |= 256, Ve(t, e, i, s), e.child;
  }
  var Mu = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function Ru(t) {
    return { baseLanes: t, cachePool: cp() };
  }
  function Cu(t, e, i) {
    return t = t !== null ? t.childLanes & ~i : 0, e && (t |= En), t;
  }
  function xm(t, e, i) {
    var s = e.pendingProps, c = !1, d = (e.flags & 128) !== 0, y;
    if ((y = d) || (y = t !== null && t.memoizedState === null ? !1 : (me.current & 2) !== 0), y && (c = !0, e.flags &= -129), y = (e.flags & 32) !== 0, e.flags &= -33, t === null) {
      if (zt) {
        if (c ? ni(e) : ai(), (t = ne) ? (t = Ag(
          t,
          Vn
        ), t = t !== null && t.data !== "&" ? t : null, t !== null && (e.memoizedState = {
          dehydrated: t,
          treeContext: Wa !== null ? { id: oa, overflow: sa } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, i = tp(t), i.return = e, e.child = i, Ue = e, ne = null)) : t = null, t === null) throw Za(e);
        return ud(t) ? e.lanes = 32 : e.lanes = 536870912, null;
      }
      var w = s.children;
      return s = s.fallback, c ? (ai(), c = e.mode, w = nl(
        { mode: "hidden", children: w },
        c
      ), s = _i(
        s,
        c,
        i,
        null
      ), w.return = e, s.return = e, w.sibling = s, e.child = w, s = e.child, s.memoizedState = Ru(i), s.childLanes = Cu(
        t,
        y,
        i
      ), e.memoizedState = Mu, Lo(null, s)) : (ni(e), Au(e, w));
    }
    var j = t.memoizedState;
    if (j !== null && (w = j.dehydrated, w !== null)) {
      if (d)
        e.flags & 256 ? (ni(e), e.flags &= -257, e = ju(
          t,
          e,
          i
        )) : e.memoizedState !== null ? (ai(), e.child = t.child, e.flags |= 128, e = null) : (ai(), w = s.fallback, c = e.mode, s = nl(
          { mode: "visible", children: s.children },
          c
        ), w = _i(
          w,
          c,
          i,
          null
        ), w.flags |= 2, s.return = e, w.return = e, s.sibling = w, e.child = s, Yi(
          e,
          t.child,
          null,
          i
        ), s = e.child, s.memoizedState = Ru(i), s.childLanes = Cu(
          t,
          y,
          i
        ), e.memoizedState = Mu, e = Lo(null, s));
      else if (ni(e), ud(w)) {
        if (y = w.nextSibling && w.nextSibling.dataset, y) var V = y.dgst;
        y = V, s = Error(o(419)), s.stack = "", s.digest = y, bo({ value: s, source: null, stack: null }), e = ju(
          t,
          e,
          i
        );
      } else if (xe || gr(t, e, i, !1), y = (i & t.childLanes) !== 0, xe || y) {
        if (y = Zt, y !== null && (s = xs(y, i), s !== 0 && s !== j.retryLane))
          throw j.retryLane = s, Oi(t, s), gn(y, t, s), Tu;
        cd(w) || dl(), e = ju(
          t,
          e,
          i
        );
      } else
        cd(w) ? (e.flags |= 192, e.child = t.child, e = null) : (t = j.treeContext, ne = Pn(
          w.nextSibling
        ), Ue = e, zt = !0, Qa = null, Vn = !1, t !== null && ap(e, t), e = Au(
          e,
          s.children
        ), e.flags |= 4096);
      return e;
    }
    return c ? (ai(), w = s.fallback, c = e.mode, j = t.child, V = j.sibling, s = xa(j, {
      mode: "hidden",
      children: s.children
    }), s.subtreeFlags = j.subtreeFlags & 65011712, V !== null ? w = xa(
      V,
      w
    ) : (w = _i(
      w,
      c,
      i,
      null
    ), w.flags |= 2), w.return = e, s.return = e, s.sibling = w, e.child = s, Lo(null, s), s = e.child, w = t.child.memoizedState, w === null ? w = Ru(i) : (c = w.cachePool, c !== null ? (j = be._currentValue, c = c.parent !== j ? { parent: j, pool: j } : c) : c = cp(), w = {
      baseLanes: w.baseLanes | i,
      cachePool: c
    }), s.memoizedState = w, s.childLanes = Cu(
      t,
      y,
      i
    ), e.memoizedState = Mu, Lo(t.child, s)) : (ni(e), i = t.child, t = i.sibling, i = xa(i, {
      mode: "visible",
      children: s.children
    }), i.return = e, i.sibling = null, t !== null && (y = e.deletions, y === null ? (e.deletions = [t], e.flags |= 16) : y.push(t)), e.child = i, e.memoizedState = null, i);
  }
  function Au(t, e) {
    return e = nl(
      { mode: "visible", children: e },
      t.mode
    ), e.return = t, t.child = e;
  }
  function nl(t, e) {
    return t = xn(22, t, null, e), t.lanes = 0, t;
  }
  function ju(t, e, i) {
    return Yi(e, t.child, null, i), t = Au(
      e,
      e.pendingProps.children
    ), t.flags |= 2, e.memoizedState = null, t;
  }
  function Sm(t, e, i) {
    t.lanes |= e;
    var s = t.alternate;
    s !== null && (s.lanes |= e), Fc(t.return, e, i);
  }
  function Lu(t, e, i, s, c, d) {
    var y = t.memoizedState;
    y === null ? t.memoizedState = {
      isBackwards: e,
      rendering: null,
      renderingStartTime: 0,
      last: s,
      tail: i,
      tailMode: c,
      treeForkCount: d
    } : (y.isBackwards = e, y.rendering = null, y.renderingStartTime = 0, y.last = s, y.tail = i, y.tailMode = c, y.treeForkCount = d);
  }
  function km(t, e, i) {
    var s = e.pendingProps, c = s.revealOrder, d = s.tail;
    s = s.children;
    var y = me.current, w = (y & 2) !== 0;
    if (w ? (y = y & 1 | 2, e.flags |= 128) : y &= 1, B(me, y), Ve(t, e, s, i), s = zt ? vo : 0, !w && t !== null && (t.flags & 128) !== 0)
      t: for (t = e.child; t !== null; ) {
        if (t.tag === 13)
          t.memoizedState !== null && Sm(t, i, e);
        else if (t.tag === 19)
          Sm(t, i, e);
        else if (t.child !== null) {
          t.child.return = t, t = t.child;
          continue;
        }
        if (t === e) break t;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e)
            break t;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
    switch (c) {
      case "forwards":
        for (i = e.child, c = null; i !== null; )
          t = i.alternate, t !== null && qs(t) === null && (c = i), i = i.sibling;
        i = c, i === null ? (c = e.child, e.child = null) : (c = i.sibling, i.sibling = null), Lu(
          e,
          !1,
          c,
          i,
          d,
          s
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (i = null, c = e.child, e.child = null; c !== null; ) {
          if (t = c.alternate, t !== null && qs(t) === null) {
            e.child = c;
            break;
          }
          t = c.sibling, c.sibling = i, i = c, c = t;
        }
        Lu(
          e,
          !0,
          i,
          null,
          d,
          s
        );
        break;
      case "together":
        Lu(
          e,
          !1,
          null,
          null,
          void 0,
          s
        );
        break;
      default:
        e.memoizedState = null;
    }
    return e.child;
  }
  function Ra(t, e, i) {
    if (t !== null && (e.dependencies = t.dependencies), oi |= e.lanes, (i & e.childLanes) === 0)
      if (t !== null) {
        if (gr(
          t,
          e,
          i,
          !1
        ), (i & e.childLanes) === 0)
          return null;
      } else return null;
    if (t !== null && e.child !== t.child)
      throw Error(o(153));
    if (e.child !== null) {
      for (t = e.child, i = xa(t, t.pendingProps), e.child = i, i.return = e; t.sibling !== null; )
        t = t.sibling, i = i.sibling = xa(t, t.pendingProps), i.return = e;
      i.sibling = null;
    }
    return e.child;
  }
  function Du(t, e) {
    return (t.lanes & e) !== 0 ? !0 : (t = t.dependencies, !!(t !== null && zs(t)));
  }
  function Kw(t, e, i) {
    switch (e.tag) {
      case 3:
        Ht(e, e.stateNode.containerInfo), Ja(e, be, t.memoizedState.cache), zi();
        break;
      case 27:
      case 5:
        Ze(e);
        break;
      case 4:
        Ht(e, e.stateNode.containerInfo);
        break;
      case 10:
        Ja(
          e,
          e.type,
          e.memoizedProps.value
        );
        break;
      case 31:
        if (e.memoizedState !== null)
          return e.flags |= 128, au(e), null;
        break;
      case 13:
        var s = e.memoizedState;
        if (s !== null)
          return s.dehydrated !== null ? (ni(e), e.flags |= 128, null) : (i & e.child.childLanes) !== 0 ? xm(t, e, i) : (ni(e), t = Ra(
            t,
            e,
            i
          ), t !== null ? t.sibling : null);
        ni(e);
        break;
      case 19:
        var c = (t.flags & 128) !== 0;
        if (s = (i & e.childLanes) !== 0, s || (gr(
          t,
          e,
          i,
          !1
        ), s = (i & e.childLanes) !== 0), c) {
          if (s)
            return km(
              t,
              e,
              i
            );
          e.flags |= 128;
        }
        if (c = e.memoizedState, c !== null && (c.rendering = null, c.tail = null, c.lastEffect = null), B(me, me.current), s) break;
        return null;
      case 22:
        return e.lanes = 0, mm(
          t,
          e,
          i,
          e.pendingProps
        );
      case 24:
        Ja(e, be, t.memoizedState.cache);
    }
    return Ra(t, e, i);
  }
  function Tm(t, e, i) {
    if (t !== null)
      if (t.memoizedProps !== e.pendingProps)
        xe = !0;
      else {
        if (!Du(t, i) && (e.flags & 128) === 0)
          return xe = !1, Kw(
            t,
            e,
            i
          );
        xe = (t.flags & 131072) !== 0;
      }
    else
      xe = !1, zt && (e.flags & 1048576) !== 0 && np(e, vo, e.index);
    switch (e.lanes = 0, e.tag) {
      case 16:
        t: {
          var s = e.pendingProps;
          if (t = Hi(e.elementType), e.type = t, typeof t == "function")
            Uc(t) ? (s = qi(t, s), e.tag = 1, e = bm(
              null,
              e,
              t,
              s,
              i
            )) : (e.tag = 0, e = Eu(
              null,
              e,
              t,
              s,
              i
            ));
          else {
            if (t != null) {
              var c = t.$$typeof;
              if (c === z) {
                e.tag = 11, e = fm(
                  null,
                  e,
                  t,
                  s,
                  i
                );
                break t;
              } else if (c === X) {
                e.tag = 14, e = hm(
                  null,
                  e,
                  t,
                  s,
                  i
                );
                break t;
              }
            }
            throw e = Tt(t) || t, Error(o(306, e, ""));
          }
        }
        return e;
      case 0:
        return Eu(
          t,
          e,
          e.type,
          e.pendingProps,
          i
        );
      case 1:
        return s = e.type, c = qi(
          s,
          e.pendingProps
        ), bm(
          t,
          e,
          s,
          c,
          i
        );
      case 3:
        t: {
          if (Ht(
            e,
            e.stateNode.containerInfo
          ), t === null) throw Error(o(387));
          s = e.pendingProps;
          var d = e.memoizedState;
          c = d.element, Jc(t, e), Mo(e, s, null, i);
          var y = e.memoizedState;
          if (s = y.cache, Ja(e, be, s), s !== d.cache && Gc(
            e,
            [be],
            i,
            !0
          ), Eo(), s = y.element, d.isDehydrated)
            if (d = {
              element: s,
              isDehydrated: !1,
              cache: y.cache
            }, e.updateQueue.baseState = d, e.memoizedState = d, e.flags & 256) {
              e = wm(
                t,
                e,
                s,
                i
              );
              break t;
            } else if (s !== c) {
              c = zn(
                Error(o(424)),
                e
              ), bo(c), e = wm(
                t,
                e,
                s,
                i
              );
              break t;
            } else
              for (t = e.stateNode.containerInfo, t.nodeType === 9 ? t = t.body : t = t.nodeName === "HTML" ? t.ownerDocument.body : t, ne = Pn(t.firstChild), Ue = e, zt = !0, Qa = null, Vn = !0, i = mp(
                e,
                null,
                s,
                i
              ), e.child = i; i; )
                i.flags = i.flags & -3 | 4096, i = i.sibling;
          else {
            if (zi(), s === c) {
              e = Ra(
                t,
                e,
                i
              );
              break t;
            }
            Ve(t, e, s, i);
          }
          e = e.child;
        }
        return e;
      case 26:
        return el(t, e), t === null ? (i = _g(
          e.type,
          null,
          e.pendingProps,
          null
        )) ? e.memoizedState = i : zt || (i = e.type, t = e.pendingProps, s = vl(
          ot.current
        ).createElement(i), s[he] = e, s[Oe] = t, He(s, i, t), pe(s), e.stateNode = s) : e.memoizedState = _g(
          e.type,
          t.memoizedProps,
          e.pendingProps,
          t.memoizedState
        ), null;
      case 27:
        return Ze(e), t === null && zt && (s = e.stateNode = Dg(
          e.type,
          e.pendingProps,
          ot.current
        ), Ue = e, Vn = !0, c = ne, di(e.type) ? (dd = c, ne = Pn(s.firstChild)) : ne = c), Ve(
          t,
          e,
          e.pendingProps.children,
          i
        ), el(t, e), t === null && (e.flags |= 4194304), e.child;
      case 5:
        return t === null && zt && ((c = s = ne) && (s = bx(
          s,
          e.type,
          e.pendingProps,
          Vn
        ), s !== null ? (e.stateNode = s, Ue = e, ne = Pn(s.firstChild), Vn = !1, c = !0) : c = !1), c || Za(e)), Ze(e), c = e.type, d = e.pendingProps, y = t !== null ? t.memoizedProps : null, s = d.children, od(c, d) ? s = null : y !== null && od(c, y) && (e.flags |= 32), e.memoizedState !== null && (c = ru(
          t,
          e,
          Ow,
          null,
          null,
          i
        ), Go._currentValue = c), el(t, e), Ve(t, e, s, i), e.child;
      case 6:
        return t === null && zt && ((t = i = ne) && (i = wx(
          i,
          e.pendingProps,
          Vn
        ), i !== null ? (e.stateNode = i, Ue = e, ne = null, t = !0) : t = !1), t || Za(e)), null;
      case 13:
        return xm(t, e, i);
      case 4:
        return Ht(
          e,
          e.stateNode.containerInfo
        ), s = e.pendingProps, t === null ? e.child = Yi(
          e,
          null,
          s,
          i
        ) : Ve(t, e, s, i), e.child;
      case 11:
        return fm(
          t,
          e,
          e.type,
          e.pendingProps,
          i
        );
      case 7:
        return Ve(
          t,
          e,
          e.pendingProps,
          i
        ), e.child;
      case 8:
        return Ve(
          t,
          e,
          e.pendingProps.children,
          i
        ), e.child;
      case 12:
        return Ve(
          t,
          e,
          e.pendingProps.children,
          i
        ), e.child;
      case 10:
        return s = e.pendingProps, Ja(e, e.type, s.value), Ve(t, e, s.children, i), e.child;
      case 9:
        return c = e.type._context, s = e.pendingProps.children, Bi(e), c = Be(c), s = s(c), e.flags |= 1, Ve(t, e, s, i), e.child;
      case 14:
        return hm(
          t,
          e,
          e.type,
          e.pendingProps,
          i
        );
      case 15:
        return pm(
          t,
          e,
          e.type,
          e.pendingProps,
          i
        );
      case 19:
        return km(t, e, i);
      case 31:
        return Yw(t, e, i);
      case 22:
        return mm(
          t,
          e,
          i,
          e.pendingProps
        );
      case 24:
        return Bi(e), s = Be(be), t === null ? (c = Wc(), c === null && (c = Zt, d = Ic(), c.pooledCache = d, d.refCount++, d !== null && (c.pooledCacheLanes |= i), c = d), e.memoizedState = { parent: s, cache: c }, Zc(e), Ja(e, be, c)) : ((t.lanes & i) !== 0 && (Jc(t, e), Mo(e, null, null, i), Eo()), c = t.memoizedState, d = e.memoizedState, c.parent !== s ? (c = { parent: s, cache: s }, e.memoizedState = c, e.lanes === 0 && (e.memoizedState = e.updateQueue.baseState = c), Ja(e, be, s)) : (s = d.cache, Ja(e, be, s), s !== c.cache && Gc(
          e,
          [be],
          i,
          !0
        ))), Ve(
          t,
          e,
          e.pendingProps.children,
          i
        ), e.child;
      case 29:
        throw e.pendingProps;
    }
    throw Error(o(156, e.tag));
  }
  function Ca(t) {
    t.flags |= 4;
  }
  function Nu(t, e, i, s, c) {
    if ((e = (t.mode & 32) !== 0) && (e = !1), e) {
      if (t.flags |= 16777216, (c & 335544128) === c)
        if (t.stateNode.complete) t.flags |= 8192;
        else if (Zm()) t.flags |= 8192;
        else
          throw Pi = Hs, Qc;
    } else t.flags &= -16777217;
  }
  function Em(t, e) {
    if (e.type !== "stylesheet" || (e.state.loading & 4) !== 0)
      t.flags &= -16777217;
    else if (t.flags |= 16777216, !Hg(e))
      if (Zm()) t.flags |= 8192;
      else
        throw Pi = Hs, Qc;
  }
  function al(t, e) {
    e !== null && (t.flags |= 4), t.flags & 16384 && (e = t.tag !== 22 ? rr() : 536870912, t.lanes |= e, Cr |= e);
  }
  function Do(t, e) {
    if (!zt)
      switch (t.tailMode) {
        case "hidden":
          e = t.tail;
          for (var i = null; e !== null; )
            e.alternate !== null && (i = e), e = e.sibling;
          i === null ? t.tail = null : i.sibling = null;
          break;
        case "collapsed":
          i = t.tail;
          for (var s = null; i !== null; )
            i.alternate !== null && (s = i), i = i.sibling;
          s === null ? e || t.tail === null ? t.tail = null : t.tail.sibling = null : s.sibling = null;
      }
  }
  function ae(t) {
    var e = t.alternate !== null && t.alternate.child === t.child, i = 0, s = 0;
    if (e)
      for (var c = t.child; c !== null; )
        i |= c.lanes | c.childLanes, s |= c.subtreeFlags & 65011712, s |= c.flags & 65011712, c.return = t, c = c.sibling;
    else
      for (c = t.child; c !== null; )
        i |= c.lanes | c.childLanes, s |= c.subtreeFlags, s |= c.flags, c.return = t, c = c.sibling;
    return t.subtreeFlags |= s, t.childLanes = i, e;
  }
  function qw(t, e, i) {
    var s = e.pendingProps;
    switch (Pc(e), e.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return ae(e), null;
      case 1:
        return ae(e), null;
      case 3:
        return i = e.stateNode, s = null, t !== null && (s = t.memoizedState.cache), e.memoizedState.cache !== s && (e.flags |= 2048), Ta(be), xt(), i.pendingContext && (i.context = i.pendingContext, i.pendingContext = null), (t === null || t.child === null) && (mr(e) ? Ca(e) : t === null || t.memoizedState.isDehydrated && (e.flags & 256) === 0 || (e.flags |= 1024, Kc())), ae(e), null;
      case 26:
        var c = e.type, d = e.memoizedState;
        return t === null ? (Ca(e), d !== null ? (ae(e), Em(e, d)) : (ae(e), Nu(
          e,
          c,
          null,
          s,
          i
        ))) : d ? d !== t.memoizedState ? (Ca(e), ae(e), Em(e, d)) : (ae(e), e.flags &= -16777217) : (t = t.memoizedProps, t !== s && Ca(e), ae(e), Nu(
          e,
          c,
          t,
          s,
          i
        )), null;
      case 27:
        if (Ke(e), i = ot.current, c = e.type, t !== null && e.stateNode != null)
          t.memoizedProps !== s && Ca(e);
        else {
          if (!s) {
            if (e.stateNode === null)
              throw Error(o(166));
            return ae(e), null;
          }
          t = Q.current, mr(e) ? ip(e) : (t = Dg(c, s, i), e.stateNode = t, Ca(e));
        }
        return ae(e), null;
      case 5:
        if (Ke(e), c = e.type, t !== null && e.stateNode != null)
          t.memoizedProps !== s && Ca(e);
        else {
          if (!s) {
            if (e.stateNode === null)
              throw Error(o(166));
            return ae(e), null;
          }
          if (d = Q.current, mr(e))
            ip(e);
          else {
            var y = vl(
              ot.current
            );
            switch (d) {
              case 1:
                d = y.createElementNS(
                  "http://www.w3.org/2000/svg",
                  c
                );
                break;
              case 2:
                d = y.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  c
                );
                break;
              default:
                switch (c) {
                  case "svg":
                    d = y.createElementNS(
                      "http://www.w3.org/2000/svg",
                      c
                    );
                    break;
                  case "math":
                    d = y.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      c
                    );
                    break;
                  case "script":
                    d = y.createElement("div"), d.innerHTML = "<script><\/script>", d = d.removeChild(
                      d.firstChild
                    );
                    break;
                  case "select":
                    d = typeof s.is == "string" ? y.createElement("select", {
                      is: s.is
                    }) : y.createElement("select"), s.multiple ? d.multiple = !0 : s.size && (d.size = s.size);
                    break;
                  default:
                    d = typeof s.is == "string" ? y.createElement(c, { is: s.is }) : y.createElement(c);
                }
            }
            d[he] = e, d[Oe] = s;
            t: for (y = e.child; y !== null; ) {
              if (y.tag === 5 || y.tag === 6)
                d.appendChild(y.stateNode);
              else if (y.tag !== 4 && y.tag !== 27 && y.child !== null) {
                y.child.return = y, y = y.child;
                continue;
              }
              if (y === e) break t;
              for (; y.sibling === null; ) {
                if (y.return === null || y.return === e)
                  break t;
                y = y.return;
              }
              y.sibling.return = y.return, y = y.sibling;
            }
            e.stateNode = d;
            t: switch (He(d, c, s), c) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                s = !!s.autoFocus;
                break t;
              case "img":
                s = !0;
                break t;
              default:
                s = !1;
            }
            s && Ca(e);
          }
        }
        return ae(e), Nu(
          e,
          e.type,
          t === null ? null : t.memoizedProps,
          e.pendingProps,
          i
        ), null;
      case 6:
        if (t && e.stateNode != null)
          t.memoizedProps !== s && Ca(e);
        else {
          if (typeof s != "string" && e.stateNode === null)
            throw Error(o(166));
          if (t = ot.current, mr(e)) {
            if (t = e.stateNode, i = e.memoizedProps, s = null, c = Ue, c !== null)
              switch (c.tag) {
                case 27:
                case 5:
                  s = c.memoizedProps;
              }
            t[he] = e, t = !!(t.nodeValue === i || s !== null && s.suppressHydrationWarning === !0 || xg(t.nodeValue, i)), t || Za(e, !0);
          } else
            t = vl(t).createTextNode(
              s
            ), t[he] = e, e.stateNode = t;
        }
        return ae(e), null;
      case 31:
        if (i = e.memoizedState, t === null || t.memoizedState !== null) {
          if (s = mr(e), i !== null) {
            if (t === null) {
              if (!s) throw Error(o(318));
              if (t = e.memoizedState, t = t !== null ? t.dehydrated : null, !t) throw Error(o(557));
              t[he] = e;
            } else
              zi(), (e.flags & 128) === 0 && (e.memoizedState = null), e.flags |= 4;
            ae(e), t = !1;
          } else
            i = Kc(), t !== null && t.memoizedState !== null && (t.memoizedState.hydrationErrors = i), t = !0;
          if (!t)
            return e.flags & 256 ? (kn(e), e) : (kn(e), null);
          if ((e.flags & 128) !== 0)
            throw Error(o(558));
        }
        return ae(e), null;
      case 13:
        if (s = e.memoizedState, t === null || t.memoizedState !== null && t.memoizedState.dehydrated !== null) {
          if (c = mr(e), s !== null && s.dehydrated !== null) {
            if (t === null) {
              if (!c) throw Error(o(318));
              if (c = e.memoizedState, c = c !== null ? c.dehydrated : null, !c) throw Error(o(317));
              c[he] = e;
            } else
              zi(), (e.flags & 128) === 0 && (e.memoizedState = null), e.flags |= 4;
            ae(e), c = !1;
          } else
            c = Kc(), t !== null && t.memoizedState !== null && (t.memoizedState.hydrationErrors = c), c = !0;
          if (!c)
            return e.flags & 256 ? (kn(e), e) : (kn(e), null);
        }
        return kn(e), (e.flags & 128) !== 0 ? (e.lanes = i, e) : (i = s !== null, t = t !== null && t.memoizedState !== null, i && (s = e.child, c = null, s.alternate !== null && s.alternate.memoizedState !== null && s.alternate.memoizedState.cachePool !== null && (c = s.alternate.memoizedState.cachePool.pool), d = null, s.memoizedState !== null && s.memoizedState.cachePool !== null && (d = s.memoizedState.cachePool.pool), d !== c && (s.flags |= 2048)), i !== t && i && (e.child.flags |= 8192), al(e, e.updateQueue), ae(e), null);
      case 4:
        return xt(), t === null && ed(e.stateNode.containerInfo), ae(e), null;
      case 10:
        return Ta(e.type), ae(e), null;
      case 19:
        if (_(me), s = e.memoizedState, s === null) return ae(e), null;
        if (c = (e.flags & 128) !== 0, d = s.rendering, d === null)
          if (c) Do(s, !1);
          else {
            if (ue !== 0 || t !== null && (t.flags & 128) !== 0)
              for (t = e.child; t !== null; ) {
                if (d = qs(t), d !== null) {
                  for (e.flags |= 128, Do(s, !1), t = d.updateQueue, e.updateQueue = t, al(e, t), e.subtreeFlags = 0, t = i, i = e.child; i !== null; )
                    $h(i, t), i = i.sibling;
                  return B(
                    me,
                    me.current & 1 | 2
                  ), zt && Sa(e, s.treeForkCount), e.child;
                }
                t = t.sibling;
              }
            s.tail !== null && De() > ll && (e.flags |= 128, c = !0, Do(s, !1), e.lanes = 4194304);
          }
        else {
          if (!c)
            if (t = qs(d), t !== null) {
              if (e.flags |= 128, c = !0, t = t.updateQueue, e.updateQueue = t, al(e, t), Do(s, !0), s.tail === null && s.tailMode === "hidden" && !d.alternate && !zt)
                return ae(e), null;
            } else
              2 * De() - s.renderingStartTime > ll && i !== 536870912 && (e.flags |= 128, c = !0, Do(s, !1), e.lanes = 4194304);
          s.isBackwards ? (d.sibling = e.child, e.child = d) : (t = s.last, t !== null ? t.sibling = d : e.child = d, s.last = d);
        }
        return s.tail !== null ? (t = s.tail, s.rendering = t, s.tail = t.sibling, s.renderingStartTime = De(), t.sibling = null, i = me.current, B(
          me,
          c ? i & 1 | 2 : i & 1
        ), zt && Sa(e, s.treeForkCount), t) : (ae(e), null);
      case 22:
      case 23:
        return kn(e), nu(), s = e.memoizedState !== null, t !== null ? t.memoizedState !== null !== s && (e.flags |= 8192) : s && (e.flags |= 8192), s ? (i & 536870912) !== 0 && (e.flags & 128) === 0 && (ae(e), e.subtreeFlags & 6 && (e.flags |= 8192)) : ae(e), i = e.updateQueue, i !== null && al(e, i.retryQueue), i = null, t !== null && t.memoizedState !== null && t.memoizedState.cachePool !== null && (i = t.memoizedState.cachePool.pool), s = null, e.memoizedState !== null && e.memoizedState.cachePool !== null && (s = e.memoizedState.cachePool.pool), s !== i && (e.flags |= 2048), t !== null && _(Vi), null;
      case 24:
        return i = null, t !== null && (i = t.memoizedState.cache), e.memoizedState.cache !== i && (e.flags |= 2048), Ta(be), ae(e), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(o(156, e.tag));
  }
  function Fw(t, e) {
    switch (Pc(e), e.tag) {
      case 1:
        return t = e.flags, t & 65536 ? (e.flags = t & -65537 | 128, e) : null;
      case 3:
        return Ta(be), xt(), t = e.flags, (t & 65536) !== 0 && (t & 128) === 0 ? (e.flags = t & -65537 | 128, e) : null;
      case 26:
      case 27:
      case 5:
        return Ke(e), null;
      case 31:
        if (e.memoizedState !== null) {
          if (kn(e), e.alternate === null)
            throw Error(o(340));
          zi();
        }
        return t = e.flags, t & 65536 ? (e.flags = t & -65537 | 128, e) : null;
      case 13:
        if (kn(e), t = e.memoizedState, t !== null && t.dehydrated !== null) {
          if (e.alternate === null)
            throw Error(o(340));
          zi();
        }
        return t = e.flags, t & 65536 ? (e.flags = t & -65537 | 128, e) : null;
      case 19:
        return _(me), null;
      case 4:
        return xt(), null;
      case 10:
        return Ta(e.type), null;
      case 22:
      case 23:
        return kn(e), nu(), t !== null && _(Vi), t = e.flags, t & 65536 ? (e.flags = t & -65537 | 128, e) : null;
      case 24:
        return Ta(be), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Mm(t, e) {
    switch (Pc(e), e.tag) {
      case 3:
        Ta(be), xt();
        break;
      case 26:
      case 27:
      case 5:
        Ke(e);
        break;
      case 4:
        xt();
        break;
      case 31:
        e.memoizedState !== null && kn(e);
        break;
      case 13:
        kn(e);
        break;
      case 19:
        _(me);
        break;
      case 10:
        Ta(e.type);
        break;
      case 22:
      case 23:
        kn(e), nu(), t !== null && _(Vi);
        break;
      case 24:
        Ta(be);
    }
  }
  function No(t, e) {
    try {
      var i = e.updateQueue, s = i !== null ? i.lastEffect : null;
      if (s !== null) {
        var c = s.next;
        i = c;
        do {
          if ((i.tag & t) === t) {
            s = void 0;
            var d = i.create, y = i.inst;
            s = d(), y.destroy = s;
          }
          i = i.next;
        } while (i !== c);
      }
    } catch (w) {
      Gt(e, e.return, w);
    }
  }
  function ii(t, e, i) {
    try {
      var s = e.updateQueue, c = s !== null ? s.lastEffect : null;
      if (c !== null) {
        var d = c.next;
        s = d;
        do {
          if ((s.tag & t) === t) {
            var y = s.inst, w = y.destroy;
            if (w !== void 0) {
              y.destroy = void 0, c = e;
              var j = i, V = w;
              try {
                V();
              } catch (q) {
                Gt(
                  c,
                  j,
                  q
                );
              }
            }
          }
          s = s.next;
        } while (s !== d);
      }
    } catch (q) {
      Gt(e, e.return, q);
    }
  }
  function Rm(t) {
    var e = t.updateQueue;
    if (e !== null) {
      var i = t.stateNode;
      try {
        yp(e, i);
      } catch (s) {
        Gt(t, t.return, s);
      }
    }
  }
  function Cm(t, e, i) {
    i.props = qi(
      t.type,
      t.memoizedProps
    ), i.state = t.memoizedState;
    try {
      i.componentWillUnmount();
    } catch (s) {
      Gt(t, e, s);
    }
  }
  function Oo(t, e) {
    try {
      var i = t.ref;
      if (i !== null) {
        switch (t.tag) {
          case 26:
          case 27:
          case 5:
            var s = t.stateNode;
            break;
          case 30:
            s = t.stateNode;
            break;
          default:
            s = t.stateNode;
        }
        typeof i == "function" ? t.refCleanup = i(s) : i.current = s;
      }
    } catch (c) {
      Gt(t, e, c);
    }
  }
  function la(t, e) {
    var i = t.ref, s = t.refCleanup;
    if (i !== null)
      if (typeof s == "function")
        try {
          s();
        } catch (c) {
          Gt(t, e, c);
        } finally {
          t.refCleanup = null, t = t.alternate, t != null && (t.refCleanup = null);
        }
      else if (typeof i == "function")
        try {
          i(null);
        } catch (c) {
          Gt(t, e, c);
        }
      else i.current = null;
  }
  function Am(t) {
    var e = t.type, i = t.memoizedProps, s = t.stateNode;
    try {
      t: switch (e) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          i.autoFocus && s.focus();
          break t;
        case "img":
          i.src ? s.src = i.src : i.srcSet && (s.srcset = i.srcSet);
      }
    } catch (c) {
      Gt(t, t.return, c);
    }
  }
  function Ou(t, e, i) {
    try {
      var s = t.stateNode;
      hx(s, t.type, i, e), s[Oe] = e;
    } catch (c) {
      Gt(t, t.return, c);
    }
  }
  function jm(t) {
    return t.tag === 5 || t.tag === 3 || t.tag === 26 || t.tag === 27 && di(t.type) || t.tag === 4;
  }
  function _u(t) {
    t: for (; ; ) {
      for (; t.sibling === null; ) {
        if (t.return === null || jm(t.return)) return null;
        t = t.return;
      }
      for (t.sibling.return = t.return, t = t.sibling; t.tag !== 5 && t.tag !== 6 && t.tag !== 18; ) {
        if (t.tag === 27 && di(t.type) || t.flags & 2 || t.child === null || t.tag === 4) continue t;
        t.child.return = t, t = t.child;
      }
      if (!(t.flags & 2)) return t.stateNode;
    }
  }
  function zu(t, e, i) {
    var s = t.tag;
    if (s === 5 || s === 6)
      t = t.stateNode, e ? (i.nodeType === 9 ? i.body : i.nodeName === "HTML" ? i.ownerDocument.body : i).insertBefore(t, e) : (e = i.nodeType === 9 ? i.body : i.nodeName === "HTML" ? i.ownerDocument.body : i, e.appendChild(t), i = i._reactRootContainer, i != null || e.onclick !== null || (e.onclick = On));
    else if (s !== 4 && (s === 27 && di(t.type) && (i = t.stateNode, e = null), t = t.child, t !== null))
      for (zu(t, e, i), t = t.sibling; t !== null; )
        zu(t, e, i), t = t.sibling;
  }
  function il(t, e, i) {
    var s = t.tag;
    if (s === 5 || s === 6)
      t = t.stateNode, e ? i.insertBefore(t, e) : i.appendChild(t);
    else if (s !== 4 && (s === 27 && di(t.type) && (i = t.stateNode), t = t.child, t !== null))
      for (il(t, e, i), t = t.sibling; t !== null; )
        il(t, e, i), t = t.sibling;
  }
  function Lm(t) {
    var e = t.stateNode, i = t.memoizedProps;
    try {
      for (var s = t.type, c = e.attributes; c.length; )
        e.removeAttributeNode(c[0]);
      He(e, s, i), e[he] = t, e[Oe] = i;
    } catch (d) {
      Gt(t, t.return, d);
    }
  }
  var Aa = !1, Se = !1, Uu = !1, Dm = typeof WeakSet == "function" ? WeakSet : Set, Le = null;
  function Gw(t, e) {
    if (t = t.containerInfo, id = El, t = qh(t), jc(t)) {
      if ("selectionStart" in t)
        var i = {
          start: t.selectionStart,
          end: t.selectionEnd
        };
      else
        t: {
          i = (i = t.ownerDocument) && i.defaultView || window;
          var s = i.getSelection && i.getSelection();
          if (s && s.rangeCount !== 0) {
            i = s.anchorNode;
            var c = s.anchorOffset, d = s.focusNode;
            s = s.focusOffset;
            try {
              i.nodeType, d.nodeType;
            } catch {
              i = null;
              break t;
            }
            var y = 0, w = -1, j = -1, V = 0, q = 0, I = t, P = null;
            e: for (; ; ) {
              for (var K; I !== i || c !== 0 && I.nodeType !== 3 || (w = y + c), I !== d || s !== 0 && I.nodeType !== 3 || (j = y + s), I.nodeType === 3 && (y += I.nodeValue.length), (K = I.firstChild) !== null; )
                P = I, I = K;
              for (; ; ) {
                if (I === t) break e;
                if (P === i && ++V === c && (w = y), P === d && ++q === s && (j = y), (K = I.nextSibling) !== null) break;
                I = P, P = I.parentNode;
              }
              I = K;
            }
            i = w === -1 || j === -1 ? null : { start: w, end: j };
          } else i = null;
        }
      i = i || { start: 0, end: 0 };
    } else i = null;
    for (rd = { focusedElem: t, selectionRange: i }, El = !1, Le = e; Le !== null; )
      if (e = Le, t = e.child, (e.subtreeFlags & 1028) !== 0 && t !== null)
        t.return = e, Le = t;
      else
        for (; Le !== null; ) {
          switch (e = Le, d = e.alternate, t = e.flags, e.tag) {
            case 0:
              if ((t & 4) !== 0 && (t = e.updateQueue, t = t !== null ? t.events : null, t !== null))
                for (i = 0; i < t.length; i++)
                  c = t[i], c.ref.impl = c.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((t & 1024) !== 0 && d !== null) {
                t = void 0, i = e, c = d.memoizedProps, d = d.memoizedState, s = i.stateNode;
                try {
                  var ct = qi(
                    i.type,
                    c
                  );
                  t = s.getSnapshotBeforeUpdate(
                    ct,
                    d
                  ), s.__reactInternalSnapshotBeforeUpdate = t;
                } catch (gt) {
                  Gt(
                    i,
                    i.return,
                    gt
                  );
                }
              }
              break;
            case 3:
              if ((t & 1024) !== 0) {
                if (t = e.stateNode.containerInfo, i = t.nodeType, i === 9)
                  ld(t);
                else if (i === 1)
                  switch (t.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      ld(t);
                      break;
                    default:
                      t.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((t & 1024) !== 0) throw Error(o(163));
          }
          if (t = e.sibling, t !== null) {
            t.return = e.return, Le = t;
            break;
          }
          Le = e.return;
        }
  }
  function Nm(t, e, i) {
    var s = i.flags;
    switch (i.tag) {
      case 0:
      case 11:
      case 15:
        La(t, i), s & 4 && No(5, i);
        break;
      case 1:
        if (La(t, i), s & 4)
          if (t = i.stateNode, e === null)
            try {
              t.componentDidMount();
            } catch (y) {
              Gt(i, i.return, y);
            }
          else {
            var c = qi(
              i.type,
              e.memoizedProps
            );
            e = e.memoizedState;
            try {
              t.componentDidUpdate(
                c,
                e,
                t.__reactInternalSnapshotBeforeUpdate
              );
            } catch (y) {
              Gt(
                i,
                i.return,
                y
              );
            }
          }
        s & 64 && Rm(i), s & 512 && Oo(i, i.return);
        break;
      case 3:
        if (La(t, i), s & 64 && (t = i.updateQueue, t !== null)) {
          if (e = null, i.child !== null)
            switch (i.child.tag) {
              case 27:
              case 5:
                e = i.child.stateNode;
                break;
              case 1:
                e = i.child.stateNode;
            }
          try {
            yp(t, e);
          } catch (y) {
            Gt(i, i.return, y);
          }
        }
        break;
      case 27:
        e === null && s & 4 && Lm(i);
      case 26:
      case 5:
        La(t, i), e === null && s & 4 && Am(i), s & 512 && Oo(i, i.return);
        break;
      case 12:
        La(t, i);
        break;
      case 31:
        La(t, i), s & 4 && zm(t, i);
        break;
      case 13:
        La(t, i), s & 4 && Um(t, i), s & 64 && (t = i.memoizedState, t !== null && (t = t.dehydrated, t !== null && (i = ex.bind(
          null,
          i
        ), xx(t, i))));
        break;
      case 22:
        if (s = i.memoizedState !== null || Aa, !s) {
          e = e !== null && e.memoizedState !== null || Se, c = Aa;
          var d = Se;
          Aa = s, (Se = e) && !d ? Da(
            t,
            i,
            (i.subtreeFlags & 8772) !== 0
          ) : La(t, i), Aa = c, Se = d;
        }
        break;
      case 30:
        break;
      default:
        La(t, i);
    }
  }
  function Om(t) {
    var e = t.alternate;
    e !== null && (t.alternate = null, Om(e)), t.child = null, t.deletions = null, t.sibling = null, t.tag === 5 && (e = t.stateNode, e !== null && Mi(e)), t.stateNode = null, t.return = null, t.dependencies = null, t.memoizedProps = null, t.memoizedState = null, t.pendingProps = null, t.stateNode = null, t.updateQueue = null;
  }
  var re = null, fn = !1;
  function ja(t, e, i) {
    for (i = i.child; i !== null; )
      _m(t, e, i), i = i.sibling;
  }
  function _m(t, e, i) {
    if (Ee && typeof Ee.onCommitFiberUnmount == "function")
      try {
        Ee.onCommitFiberUnmount(le, i);
      } catch {
      }
    switch (i.tag) {
      case 26:
        Se || la(i, e), ja(
          t,
          e,
          i
        ), i.memoizedState ? i.memoizedState.count-- : i.stateNode && (i = i.stateNode, i.parentNode.removeChild(i));
        break;
      case 27:
        Se || la(i, e);
        var s = re, c = fn;
        di(i.type) && (re = i.stateNode, fn = !1), ja(
          t,
          e,
          i
        ), Ko(i.stateNode), re = s, fn = c;
        break;
      case 5:
        Se || la(i, e);
      case 6:
        if (s = re, c = fn, re = null, ja(
          t,
          e,
          i
        ), re = s, fn = c, re !== null)
          if (fn)
            try {
              (re.nodeType === 9 ? re.body : re.nodeName === "HTML" ? re.ownerDocument.body : re).removeChild(i.stateNode);
            } catch (d) {
              Gt(
                i,
                e,
                d
              );
            }
          else
            try {
              re.removeChild(i.stateNode);
            } catch (d) {
              Gt(
                i,
                e,
                d
              );
            }
        break;
      case 18:
        re !== null && (fn ? (t = re, Rg(
          t.nodeType === 9 ? t.body : t.nodeName === "HTML" ? t.ownerDocument.body : t,
          i.stateNode
        ), zr(t)) : Rg(re, i.stateNode));
        break;
      case 4:
        s = re, c = fn, re = i.stateNode.containerInfo, fn = !0, ja(
          t,
          e,
          i
        ), re = s, fn = c;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        ii(2, i, e), Se || ii(4, i, e), ja(
          t,
          e,
          i
        );
        break;
      case 1:
        Se || (la(i, e), s = i.stateNode, typeof s.componentWillUnmount == "function" && Cm(
          i,
          e,
          s
        )), ja(
          t,
          e,
          i
        );
        break;
      case 21:
        ja(
          t,
          e,
          i
        );
        break;
      case 22:
        Se = (s = Se) || i.memoizedState !== null, ja(
          t,
          e,
          i
        ), Se = s;
        break;
      default:
        ja(
          t,
          e,
          i
        );
    }
  }
  function zm(t, e) {
    if (e.memoizedState === null && (t = e.alternate, t !== null && (t = t.memoizedState, t !== null))) {
      t = t.dehydrated;
      try {
        zr(t);
      } catch (i) {
        Gt(e, e.return, i);
      }
    }
  }
  function Um(t, e) {
    if (e.memoizedState === null && (t = e.alternate, t !== null && (t = t.memoizedState, t !== null && (t = t.dehydrated, t !== null))))
      try {
        zr(t);
      } catch (i) {
        Gt(e, e.return, i);
      }
  }
  function Iw(t) {
    switch (t.tag) {
      case 31:
      case 13:
      case 19:
        var e = t.stateNode;
        return e === null && (e = t.stateNode = new Dm()), e;
      case 22:
        return t = t.stateNode, e = t._retryCache, e === null && (e = t._retryCache = new Dm()), e;
      default:
        throw Error(o(435, t.tag));
    }
  }
  function rl(t, e) {
    var i = Iw(t);
    e.forEach(function(s) {
      if (!i.has(s)) {
        i.add(s);
        var c = nx.bind(null, t, s);
        s.then(c, c);
      }
    });
  }
  function hn(t, e) {
    var i = e.deletions;
    if (i !== null)
      for (var s = 0; s < i.length; s++) {
        var c = i[s], d = t, y = e, w = y;
        t: for (; w !== null; ) {
          switch (w.tag) {
            case 27:
              if (di(w.type)) {
                re = w.stateNode, fn = !1;
                break t;
              }
              break;
            case 5:
              re = w.stateNode, fn = !1;
              break t;
            case 3:
            case 4:
              re = w.stateNode.containerInfo, fn = !0;
              break t;
          }
          w = w.return;
        }
        if (re === null) throw Error(o(160));
        _m(d, y, c), re = null, fn = !1, d = c.alternate, d !== null && (d.return = null), c.return = null;
      }
    if (e.subtreeFlags & 13886)
      for (e = e.child; e !== null; )
        Bm(e, t), e = e.sibling;
  }
  var Jn = null;
  function Bm(t, e) {
    var i = t.alternate, s = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        hn(e, t), pn(t), s & 4 && (ii(3, t, t.return), No(3, t), ii(5, t, t.return));
        break;
      case 1:
        hn(e, t), pn(t), s & 512 && (Se || i === null || la(i, i.return)), s & 64 && Aa && (t = t.updateQueue, t !== null && (s = t.callbacks, s !== null && (i = t.shared.hiddenCallbacks, t.shared.hiddenCallbacks = i === null ? s : i.concat(s))));
        break;
      case 26:
        var c = Jn;
        if (hn(e, t), pn(t), s & 512 && (Se || i === null || la(i, i.return)), s & 4) {
          var d = i !== null ? i.memoizedState : null;
          if (s = t.memoizedState, i === null)
            if (s === null)
              if (t.stateNode === null) {
                t: {
                  s = t.type, i = t.memoizedProps, c = c.ownerDocument || c;
                  e: switch (s) {
                    case "title":
                      d = c.getElementsByTagName("title")[0], (!d || d[Ha] || d[he] || d.namespaceURI === "http://www.w3.org/2000/svg" || d.hasAttribute("itemprop")) && (d = c.createElement(s), c.head.insertBefore(
                        d,
                        c.querySelector("head > title")
                      )), He(d, s, i), d[he] = t, pe(d), s = d;
                      break t;
                    case "link":
                      var y = Bg(
                        "link",
                        "href",
                        c
                      ).get(s + (i.href || ""));
                      if (y) {
                        for (var w = 0; w < y.length; w++)
                          if (d = y[w], d.getAttribute("href") === (i.href == null || i.href === "" ? null : i.href) && d.getAttribute("rel") === (i.rel == null ? null : i.rel) && d.getAttribute("title") === (i.title == null ? null : i.title) && d.getAttribute("crossorigin") === (i.crossOrigin == null ? null : i.crossOrigin)) {
                            y.splice(w, 1);
                            break e;
                          }
                      }
                      d = c.createElement(s), He(d, s, i), c.head.appendChild(d);
                      break;
                    case "meta":
                      if (y = Bg(
                        "meta",
                        "content",
                        c
                      ).get(s + (i.content || ""))) {
                        for (w = 0; w < y.length; w++)
                          if (d = y[w], d.getAttribute("content") === (i.content == null ? null : "" + i.content) && d.getAttribute("name") === (i.name == null ? null : i.name) && d.getAttribute("property") === (i.property == null ? null : i.property) && d.getAttribute("http-equiv") === (i.httpEquiv == null ? null : i.httpEquiv) && d.getAttribute("charset") === (i.charSet == null ? null : i.charSet)) {
                            y.splice(w, 1);
                            break e;
                          }
                      }
                      d = c.createElement(s), He(d, s, i), c.head.appendChild(d);
                      break;
                    default:
                      throw Error(o(468, s));
                  }
                  d[he] = t, pe(d), s = d;
                }
                t.stateNode = s;
              } else
                Vg(
                  c,
                  t.type,
                  t.stateNode
                );
            else
              t.stateNode = Ug(
                c,
                s,
                t.memoizedProps
              );
          else
            d !== s ? (d === null ? i.stateNode !== null && (i = i.stateNode, i.parentNode.removeChild(i)) : d.count--, s === null ? Vg(
              c,
              t.type,
              t.stateNode
            ) : Ug(
              c,
              s,
              t.memoizedProps
            )) : s === null && t.stateNode !== null && Ou(
              t,
              t.memoizedProps,
              i.memoizedProps
            );
        }
        break;
      case 27:
        hn(e, t), pn(t), s & 512 && (Se || i === null || la(i, i.return)), i !== null && s & 4 && Ou(
          t,
          t.memoizedProps,
          i.memoizedProps
        );
        break;
      case 5:
        if (hn(e, t), pn(t), s & 512 && (Se || i === null || la(i, i.return)), t.flags & 32) {
          c = t.stateNode;
          try {
            Vt(c, "");
          } catch (ct) {
            Gt(t, t.return, ct);
          }
        }
        s & 4 && t.stateNode != null && (c = t.memoizedProps, Ou(
          t,
          c,
          i !== null ? i.memoizedProps : c
        )), s & 1024 && (Uu = !0);
        break;
      case 6:
        if (hn(e, t), pn(t), s & 4) {
          if (t.stateNode === null)
            throw Error(o(162));
          s = t.memoizedProps, i = t.stateNode;
          try {
            i.nodeValue = s;
          } catch (ct) {
            Gt(t, t.return, ct);
          }
        }
        break;
      case 3:
        if (xl = null, c = Jn, Jn = bl(e.containerInfo), hn(e, t), Jn = c, pn(t), s & 4 && i !== null && i.memoizedState.isDehydrated)
          try {
            zr(e.containerInfo);
          } catch (ct) {
            Gt(t, t.return, ct);
          }
        Uu && (Uu = !1, Vm(t));
        break;
      case 4:
        s = Jn, Jn = bl(
          t.stateNode.containerInfo
        ), hn(e, t), pn(t), Jn = s;
        break;
      case 12:
        hn(e, t), pn(t);
        break;
      case 31:
        hn(e, t), pn(t), s & 4 && (s = t.updateQueue, s !== null && (t.updateQueue = null, rl(t, s)));
        break;
      case 13:
        hn(e, t), pn(t), t.child.flags & 8192 && t.memoizedState !== null != (i !== null && i.memoizedState !== null) && (sl = De()), s & 4 && (s = t.updateQueue, s !== null && (t.updateQueue = null, rl(t, s)));
        break;
      case 22:
        c = t.memoizedState !== null;
        var j = i !== null && i.memoizedState !== null, V = Aa, q = Se;
        if (Aa = V || c, Se = q || j, hn(e, t), Se = q, Aa = V, pn(t), s & 8192)
          t: for (e = t.stateNode, e._visibility = c ? e._visibility & -2 : e._visibility | 1, c && (i === null || j || Aa || Se || Fi(t)), i = null, e = t; ; ) {
            if (e.tag === 5 || e.tag === 26) {
              if (i === null) {
                j = i = e;
                try {
                  if (d = j.stateNode, c)
                    y = d.style, typeof y.setProperty == "function" ? y.setProperty("display", "none", "important") : y.display = "none";
                  else {
                    w = j.stateNode;
                    var I = j.memoizedProps.style, P = I != null && I.hasOwnProperty("display") ? I.display : null;
                    w.style.display = P == null || typeof P == "boolean" ? "" : ("" + P).trim();
                  }
                } catch (ct) {
                  Gt(j, j.return, ct);
                }
              }
            } else if (e.tag === 6) {
              if (i === null) {
                j = e;
                try {
                  j.stateNode.nodeValue = c ? "" : j.memoizedProps;
                } catch (ct) {
                  Gt(j, j.return, ct);
                }
              }
            } else if (e.tag === 18) {
              if (i === null) {
                j = e;
                try {
                  var K = j.stateNode;
                  c ? Cg(K, !0) : Cg(j.stateNode, !1);
                } catch (ct) {
                  Gt(j, j.return, ct);
                }
              }
            } else if ((e.tag !== 22 && e.tag !== 23 || e.memoizedState === null || e === t) && e.child !== null) {
              e.child.return = e, e = e.child;
              continue;
            }
            if (e === t) break t;
            for (; e.sibling === null; ) {
              if (e.return === null || e.return === t) break t;
              i === e && (i = null), e = e.return;
            }
            i === e && (i = null), e.sibling.return = e.return, e = e.sibling;
          }
        s & 4 && (s = t.updateQueue, s !== null && (i = s.retryQueue, i !== null && (s.retryQueue = null, rl(t, i))));
        break;
      case 19:
        hn(e, t), pn(t), s & 4 && (s = t.updateQueue, s !== null && (t.updateQueue = null, rl(t, s)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        hn(e, t), pn(t);
    }
  }
  function pn(t) {
    var e = t.flags;
    if (e & 2) {
      try {
        for (var i, s = t.return; s !== null; ) {
          if (jm(s)) {
            i = s;
            break;
          }
          s = s.return;
        }
        if (i == null) throw Error(o(160));
        switch (i.tag) {
          case 27:
            var c = i.stateNode, d = _u(t);
            il(t, d, c);
            break;
          case 5:
            var y = i.stateNode;
            i.flags & 32 && (Vt(y, ""), i.flags &= -33);
            var w = _u(t);
            il(t, w, y);
            break;
          case 3:
          case 4:
            var j = i.stateNode.containerInfo, V = _u(t);
            zu(
              t,
              V,
              j
            );
            break;
          default:
            throw Error(o(161));
        }
      } catch (q) {
        Gt(t, t.return, q);
      }
      t.flags &= -3;
    }
    e & 4096 && (t.flags &= -4097);
  }
  function Vm(t) {
    if (t.subtreeFlags & 1024)
      for (t = t.child; t !== null; ) {
        var e = t;
        Vm(e), e.tag === 5 && e.flags & 1024 && e.stateNode.reset(), t = t.sibling;
      }
  }
  function La(t, e) {
    if (e.subtreeFlags & 8772)
      for (e = e.child; e !== null; )
        Nm(t, e.alternate, e), e = e.sibling;
  }
  function Fi(t) {
    for (t = t.child; t !== null; ) {
      var e = t;
      switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          ii(4, e, e.return), Fi(e);
          break;
        case 1:
          la(e, e.return);
          var i = e.stateNode;
          typeof i.componentWillUnmount == "function" && Cm(
            e,
            e.return,
            i
          ), Fi(e);
          break;
        case 27:
          Ko(e.stateNode);
        case 26:
        case 5:
          la(e, e.return), Fi(e);
          break;
        case 22:
          e.memoizedState === null && Fi(e);
          break;
        case 30:
          Fi(e);
          break;
        default:
          Fi(e);
      }
      t = t.sibling;
    }
  }
  function Da(t, e, i) {
    for (i = i && (e.subtreeFlags & 8772) !== 0, e = e.child; e !== null; ) {
      var s = e.alternate, c = t, d = e, y = d.flags;
      switch (d.tag) {
        case 0:
        case 11:
        case 15:
          Da(
            c,
            d,
            i
          ), No(4, d);
          break;
        case 1:
          if (Da(
            c,
            d,
            i
          ), s = d, c = s.stateNode, typeof c.componentDidMount == "function")
            try {
              c.componentDidMount();
            } catch (V) {
              Gt(s, s.return, V);
            }
          if (s = d, c = s.updateQueue, c !== null) {
            var w = s.stateNode;
            try {
              var j = c.shared.hiddenCallbacks;
              if (j !== null)
                for (c.shared.hiddenCallbacks = null, c = 0; c < j.length; c++)
                  gp(j[c], w);
            } catch (V) {
              Gt(s, s.return, V);
            }
          }
          i && y & 64 && Rm(d), Oo(d, d.return);
          break;
        case 27:
          Lm(d);
        case 26:
        case 5:
          Da(
            c,
            d,
            i
          ), i && s === null && y & 4 && Am(d), Oo(d, d.return);
          break;
        case 12:
          Da(
            c,
            d,
            i
          );
          break;
        case 31:
          Da(
            c,
            d,
            i
          ), i && y & 4 && zm(c, d);
          break;
        case 13:
          Da(
            c,
            d,
            i
          ), i && y & 4 && Um(c, d);
          break;
        case 22:
          d.memoizedState === null && Da(
            c,
            d,
            i
          ), Oo(d, d.return);
          break;
        case 30:
          break;
        default:
          Da(
            c,
            d,
            i
          );
      }
      e = e.sibling;
    }
  }
  function Bu(t, e) {
    var i = null;
    t !== null && t.memoizedState !== null && t.memoizedState.cachePool !== null && (i = t.memoizedState.cachePool.pool), t = null, e.memoizedState !== null && e.memoizedState.cachePool !== null && (t = e.memoizedState.cachePool.pool), t !== i && (t != null && t.refCount++, i != null && wo(i));
  }
  function Vu(t, e) {
    t = null, e.alternate !== null && (t = e.alternate.memoizedState.cache), e = e.memoizedState.cache, e !== t && (e.refCount++, t != null && wo(t));
  }
  function $n(t, e, i, s) {
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; )
        Hm(
          t,
          e,
          i,
          s
        ), e = e.sibling;
  }
  function Hm(t, e, i, s) {
    var c = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        $n(
          t,
          e,
          i,
          s
        ), c & 2048 && No(9, e);
        break;
      case 1:
        $n(
          t,
          e,
          i,
          s
        );
        break;
      case 3:
        $n(
          t,
          e,
          i,
          s
        ), c & 2048 && (t = null, e.alternate !== null && (t = e.alternate.memoizedState.cache), e = e.memoizedState.cache, e !== t && (e.refCount++, t != null && wo(t)));
        break;
      case 12:
        if (c & 2048) {
          $n(
            t,
            e,
            i,
            s
          ), t = e.stateNode;
          try {
            var d = e.memoizedProps, y = d.id, w = d.onPostCommit;
            typeof w == "function" && w(
              y,
              e.alternate === null ? "mount" : "update",
              t.passiveEffectDuration,
              -0
            );
          } catch (j) {
            Gt(e, e.return, j);
          }
        } else
          $n(
            t,
            e,
            i,
            s
          );
        break;
      case 31:
        $n(
          t,
          e,
          i,
          s
        );
        break;
      case 13:
        $n(
          t,
          e,
          i,
          s
        );
        break;
      case 23:
        break;
      case 22:
        d = e.stateNode, y = e.alternate, e.memoizedState !== null ? d._visibility & 2 ? $n(
          t,
          e,
          i,
          s
        ) : _o(t, e) : d._visibility & 2 ? $n(
          t,
          e,
          i,
          s
        ) : (d._visibility |= 2, Er(
          t,
          e,
          i,
          s,
          (e.subtreeFlags & 10256) !== 0 || !1
        )), c & 2048 && Bu(y, e);
        break;
      case 24:
        $n(
          t,
          e,
          i,
          s
        ), c & 2048 && Vu(e.alternate, e);
        break;
      default:
        $n(
          t,
          e,
          i,
          s
        );
    }
  }
  function Er(t, e, i, s, c) {
    for (c = c && ((e.subtreeFlags & 10256) !== 0 || !1), e = e.child; e !== null; ) {
      var d = t, y = e, w = i, j = s, V = y.flags;
      switch (y.tag) {
        case 0:
        case 11:
        case 15:
          Er(
            d,
            y,
            w,
            j,
            c
          ), No(8, y);
          break;
        case 23:
          break;
        case 22:
          var q = y.stateNode;
          y.memoizedState !== null ? q._visibility & 2 ? Er(
            d,
            y,
            w,
            j,
            c
          ) : _o(
            d,
            y
          ) : (q._visibility |= 2, Er(
            d,
            y,
            w,
            j,
            c
          )), c && V & 2048 && Bu(
            y.alternate,
            y
          );
          break;
        case 24:
          Er(
            d,
            y,
            w,
            j,
            c
          ), c && V & 2048 && Vu(y.alternate, y);
          break;
        default:
          Er(
            d,
            y,
            w,
            j,
            c
          );
      }
      e = e.sibling;
    }
  }
  function _o(t, e) {
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; ) {
        var i = t, s = e, c = s.flags;
        switch (s.tag) {
          case 22:
            _o(i, s), c & 2048 && Bu(
              s.alternate,
              s
            );
            break;
          case 24:
            _o(i, s), c & 2048 && Vu(s.alternate, s);
            break;
          default:
            _o(i, s);
        }
        e = e.sibling;
      }
  }
  var zo = 8192;
  function Mr(t, e, i) {
    if (t.subtreeFlags & zo)
      for (t = t.child; t !== null; )
        Pm(
          t,
          e,
          i
        ), t = t.sibling;
  }
  function Pm(t, e, i) {
    switch (t.tag) {
      case 26:
        Mr(
          t,
          e,
          i
        ), t.flags & zo && t.memoizedState !== null && Nx(
          i,
          Jn,
          t.memoizedState,
          t.memoizedProps
        );
        break;
      case 5:
        Mr(
          t,
          e,
          i
        );
        break;
      case 3:
      case 4:
        var s = Jn;
        Jn = bl(t.stateNode.containerInfo), Mr(
          t,
          e,
          i
        ), Jn = s;
        break;
      case 22:
        t.memoizedState === null && (s = t.alternate, s !== null && s.memoizedState !== null ? (s = zo, zo = 16777216, Mr(
          t,
          e,
          i
        ), zo = s) : Mr(
          t,
          e,
          i
        ));
        break;
      default:
        Mr(
          t,
          e,
          i
        );
    }
  }
  function Ym(t) {
    var e = t.alternate;
    if (e !== null && (t = e.child, t !== null)) {
      e.child = null;
      do
        e = t.sibling, t.sibling = null, t = e;
      while (t !== null);
    }
  }
  function Uo(t) {
    var e = t.deletions;
    if ((t.flags & 16) !== 0) {
      if (e !== null)
        for (var i = 0; i < e.length; i++) {
          var s = e[i];
          Le = s, qm(
            s,
            t
          );
        }
      Ym(t);
    }
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        Km(t), t = t.sibling;
  }
  function Km(t) {
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        Uo(t), t.flags & 2048 && ii(9, t, t.return);
        break;
      case 3:
        Uo(t);
        break;
      case 12:
        Uo(t);
        break;
      case 22:
        var e = t.stateNode;
        t.memoizedState !== null && e._visibility & 2 && (t.return === null || t.return.tag !== 13) ? (e._visibility &= -3, ol(t)) : Uo(t);
        break;
      default:
        Uo(t);
    }
  }
  function ol(t) {
    var e = t.deletions;
    if ((t.flags & 16) !== 0) {
      if (e !== null)
        for (var i = 0; i < e.length; i++) {
          var s = e[i];
          Le = s, qm(
            s,
            t
          );
        }
      Ym(t);
    }
    for (t = t.child; t !== null; ) {
      switch (e = t, e.tag) {
        case 0:
        case 11:
        case 15:
          ii(8, e, e.return), ol(e);
          break;
        case 22:
          i = e.stateNode, i._visibility & 2 && (i._visibility &= -3, ol(e));
          break;
        default:
          ol(e);
      }
      t = t.sibling;
    }
  }
  function qm(t, e) {
    for (; Le !== null; ) {
      var i = Le;
      switch (i.tag) {
        case 0:
        case 11:
        case 15:
          ii(8, i, e);
          break;
        case 23:
        case 22:
          if (i.memoizedState !== null && i.memoizedState.cachePool !== null) {
            var s = i.memoizedState.cachePool.pool;
            s != null && s.refCount++;
          }
          break;
        case 24:
          wo(i.memoizedState.cache);
      }
      if (s = i.child, s !== null) s.return = i, Le = s;
      else
        t: for (i = t; Le !== null; ) {
          s = Le;
          var c = s.sibling, d = s.return;
          if (Om(s), s === i) {
            Le = null;
            break t;
          }
          if (c !== null) {
            c.return = d, Le = c;
            break t;
          }
          Le = d;
        }
    }
  }
  var Xw = {
    getCacheForType: function(t) {
      var e = Be(be), i = e.data.get(t);
      return i === void 0 && (i = t(), e.data.set(t, i)), i;
    },
    cacheSignal: function() {
      return Be(be).controller.signal;
    }
  }, Ww = typeof WeakMap == "function" ? WeakMap : Map, Kt = 0, Zt = null, At = null, Dt = 0, Ft = 0, Tn = null, ri = !1, Rr = !1, Hu = !1, Na = 0, ue = 0, oi = 0, Gi = 0, Pu = 0, En = 0, Cr = 0, Bo = null, mn = null, Yu = !1, sl = 0, Fm = 0, ll = 1 / 0, cl = null, si = null, Ce = 0, li = null, Ar = null, Oa = 0, Ku = 0, qu = null, Gm = null, Vo = 0, Fu = null;
  function Mn() {
    return (Kt & 2) !== 0 && Dt !== 0 ? Dt & -Dt : Y.T !== null ? Zu() : jn();
  }
  function Im() {
    if (En === 0)
      if ((Dt & 536870912) === 0 || zt) {
        var t = Si;
        Si <<= 1, (Si & 3932160) === 0 && (Si = 262144), En = t;
      } else En = 536870912;
    return t = Sn.current, t !== null && (t.flags |= 32), En;
  }
  function gn(t, e, i) {
    (t === Zt && (Ft === 2 || Ft === 9) || t.cancelPendingCommit !== null) && (jr(t, 0), ci(
      t,
      Dt,
      En,
      !1
    )), Qn(t, i), ((Kt & 2) === 0 || t !== Zt) && (t === Zt && ((Kt & 2) === 0 && (Gi |= i), ue === 4 && ci(
      t,
      Dt,
      En,
      !1
    )), ca(t));
  }
  function Xm(t, e, i) {
    if ((Kt & 6) !== 0) throw Error(o(327));
    var s = !i && (e & 127) === 0 && (e & t.expiredLanes) === 0 || Ti(t, e), c = s ? Jw(t, e) : Iu(t, e, !0), d = s;
    do {
      if (c === 0) {
        Rr && !s && ci(t, e, 0, !1);
        break;
      } else {
        if (i = t.current.alternate, d && !Qw(i)) {
          c = Iu(t, e, !1), d = !1;
          continue;
        }
        if (c === 2) {
          if (d = e, t.errorRecoveryDisabledLanes & d)
            var y = 0;
          else
            y = t.pendingLanes & -536870913, y = y !== 0 ? y : y & 536870912 ? 536870912 : 0;
          if (y !== 0) {
            e = y;
            t: {
              var w = t;
              c = Bo;
              var j = w.current.memoizedState.isDehydrated;
              if (j && (jr(w, y).flags |= 256), y = Iu(
                w,
                y,
                !1
              ), y !== 2) {
                if (Hu && !j) {
                  w.errorRecoveryDisabledLanes |= d, Gi |= d, c = 4;
                  break t;
                }
                d = mn, mn = c, d !== null && (mn === null ? mn = d : mn.push.apply(
                  mn,
                  d
                ));
              }
              c = y;
            }
            if (d = !1, c !== 2) continue;
          }
        }
        if (c === 1) {
          jr(t, 0), ci(t, e, 0, !0);
          break;
        }
        t: {
          switch (s = t, d = c, d) {
            case 0:
            case 1:
              throw Error(o(345));
            case 4:
              if ((e & 4194048) !== e) break;
            case 6:
              ci(
                s,
                e,
                En,
                !ri
              );
              break t;
            case 2:
              mn = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(o(329));
          }
          if ((e & 62914560) === e && (c = sl + 300 - De(), 10 < c)) {
            if (ci(
              s,
              e,
              En,
              !ri
            ), ki(s, 0, !0) !== 0) break t;
            Oa = e, s.timeoutHandle = Eg(
              Wm.bind(
                null,
                s,
                i,
                mn,
                cl,
                Yu,
                e,
                En,
                Gi,
                Cr,
                ri,
                d,
                "Throttled",
                -0,
                0
              ),
              c
            );
            break t;
          }
          Wm(
            s,
            i,
            mn,
            cl,
            Yu,
            e,
            En,
            Gi,
            Cr,
            ri,
            d,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    ca(t);
  }
  function Wm(t, e, i, s, c, d, y, w, j, V, q, I, P, K) {
    if (t.timeoutHandle = -1, I = e.subtreeFlags, I & 8192 || (I & 16785408) === 16785408) {
      I = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: On
      }, Pm(
        e,
        d,
        I
      );
      var ct = (d & 62914560) === d ? sl - De() : (d & 4194048) === d ? Fm - De() : 0;
      if (ct = Ox(
        I,
        ct
      ), ct !== null) {
        Oa = d, t.cancelPendingCommit = ct(
          ag.bind(
            null,
            t,
            e,
            d,
            i,
            s,
            c,
            y,
            w,
            j,
            q,
            I,
            null,
            P,
            K
          )
        ), ci(t, d, y, !V);
        return;
      }
    }
    ag(
      t,
      e,
      d,
      i,
      s,
      c,
      y,
      w,
      j
    );
  }
  function Qw(t) {
    for (var e = t; ; ) {
      var i = e.tag;
      if ((i === 0 || i === 11 || i === 15) && e.flags & 16384 && (i = e.updateQueue, i !== null && (i = i.stores, i !== null)))
        for (var s = 0; s < i.length; s++) {
          var c = i[s], d = c.getSnapshot;
          c = c.value;
          try {
            if (!wn(d(), c)) return !1;
          } catch {
            return !1;
          }
        }
      if (i = e.child, e.subtreeFlags & 16384 && i !== null)
        i.return = e, e = i;
      else {
        if (e === t) break;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t) return !0;
          e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
      }
    }
    return !0;
  }
  function ci(t, e, i, s) {
    e &= ~Pu, e &= ~Gi, t.suspendedLanes |= e, t.pingedLanes &= ~e, s && (t.warmLanes |= e), s = t.expirationTimes;
    for (var c = e; 0 < c; ) {
      var d = 31 - je(c), y = 1 << d;
      s[d] = -1, c &= ~y;
    }
    i !== 0 && ws(t, i, e);
  }
  function ul() {
    return (Kt & 6) === 0 ? (Ho(0), !1) : !0;
  }
  function Gu() {
    if (At !== null) {
      if (Ft === 0)
        var t = At.return;
      else
        t = At, ka = Ui = null, lu(t), wr = null, So = 0, t = At;
      for (; t !== null; )
        Mm(t.alternate, t), t = t.return;
      At = null;
    }
  }
  function jr(t, e) {
    var i = t.timeoutHandle;
    i !== -1 && (t.timeoutHandle = -1, gx(i)), i = t.cancelPendingCommit, i !== null && (t.cancelPendingCommit = null, i()), Oa = 0, Gu(), Zt = t, At = i = xa(t.current, null), Dt = e, Ft = 0, Tn = null, ri = !1, Rr = Ti(t, e), Hu = !1, Cr = En = Pu = Gi = oi = ue = 0, mn = Bo = null, Yu = !1, (e & 8) !== 0 && (e |= e & 32);
    var s = t.entangledLanes;
    if (s !== 0)
      for (t = t.entanglements, s &= e; 0 < s; ) {
        var c = 31 - je(s), d = 1 << c;
        e |= t[c], s &= ~d;
      }
    return Na = e, Ls(), i;
  }
  function Qm(t, e) {
    St = null, Y.H = jo, e === br || e === Vs ? (e = fp(), Ft = 3) : e === Qc ? (e = fp(), Ft = 4) : Ft = e === Tu ? 8 : e !== null && typeof e == "object" && typeof e.then == "function" ? 6 : 1, Tn = e, At === null && (ue = 1, $s(
      t,
      zn(e, t.current)
    ));
  }
  function Zm() {
    var t = Sn.current;
    return t === null ? !0 : (Dt & 4194048) === Dt ? Hn === null : (Dt & 62914560) === Dt || (Dt & 536870912) !== 0 ? t === Hn : !1;
  }
  function Jm() {
    var t = Y.H;
    return Y.H = jo, t === null ? jo : t;
  }
  function $m() {
    var t = Y.A;
    return Y.A = Xw, t;
  }
  function dl() {
    ue = 4, ri || (Dt & 4194048) !== Dt && Sn.current !== null || (Rr = !0), (oi & 134217727) === 0 && (Gi & 134217727) === 0 || Zt === null || ci(
      Zt,
      Dt,
      En,
      !1
    );
  }
  function Iu(t, e, i) {
    var s = Kt;
    Kt |= 2;
    var c = Jm(), d = $m();
    (Zt !== t || Dt !== e) && (cl = null, jr(t, e)), e = !1;
    var y = ue;
    t: do
      try {
        if (Ft !== 0 && At !== null) {
          var w = At, j = Tn;
          switch (Ft) {
            case 8:
              Gu(), y = 6;
              break t;
            case 3:
            case 2:
            case 9:
            case 6:
              Sn.current === null && (e = !0);
              var V = Ft;
              if (Ft = 0, Tn = null, Lr(t, w, j, V), i && Rr) {
                y = 0;
                break t;
              }
              break;
            default:
              V = Ft, Ft = 0, Tn = null, Lr(t, w, j, V);
          }
        }
        Zw(), y = ue;
        break;
      } catch (q) {
        Qm(t, q);
      }
    while (!0);
    return e && t.shellSuspendCounter++, ka = Ui = null, Kt = s, Y.H = c, Y.A = d, At === null && (Zt = null, Dt = 0, Ls()), y;
  }
  function Zw() {
    for (; At !== null; ) tg(At);
  }
  function Jw(t, e) {
    var i = Kt;
    Kt |= 2;
    var s = Jm(), c = $m();
    Zt !== t || Dt !== e ? (cl = null, ll = De() + 500, jr(t, e)) : Rr = Ti(
      t,
      e
    );
    t: do
      try {
        if (Ft !== 0 && At !== null) {
          e = At;
          var d = Tn;
          e: switch (Ft) {
            case 1:
              Ft = 0, Tn = null, Lr(t, e, d, 1);
              break;
            case 2:
            case 9:
              if (up(d)) {
                Ft = 0, Tn = null, eg(e);
                break;
              }
              e = function() {
                Ft !== 2 && Ft !== 9 || Zt !== t || (Ft = 7), ca(t);
              }, d.then(e, e);
              break t;
            case 3:
              Ft = 7;
              break t;
            case 4:
              Ft = 5;
              break t;
            case 7:
              up(d) ? (Ft = 0, Tn = null, eg(e)) : (Ft = 0, Tn = null, Lr(t, e, d, 7));
              break;
            case 5:
              var y = null;
              switch (At.tag) {
                case 26:
                  y = At.memoizedState;
                case 5:
                case 27:
                  var w = At;
                  if (y ? Hg(y) : w.stateNode.complete) {
                    Ft = 0, Tn = null;
                    var j = w.sibling;
                    if (j !== null) At = j;
                    else {
                      var V = w.return;
                      V !== null ? (At = V, fl(V)) : At = null;
                    }
                    break e;
                  }
              }
              Ft = 0, Tn = null, Lr(t, e, d, 5);
              break;
            case 6:
              Ft = 0, Tn = null, Lr(t, e, d, 6);
              break;
            case 8:
              Gu(), ue = 6;
              break t;
            default:
              throw Error(o(462));
          }
        }
        $w();
        break;
      } catch (q) {
        Qm(t, q);
      }
    while (!0);
    return ka = Ui = null, Y.H = s, Y.A = c, Kt = i, At !== null ? 0 : (Zt = null, Dt = 0, Ls(), ue);
  }
  function $w() {
    for (; At !== null && !Ge(); )
      tg(At);
  }
  function tg(t) {
    var e = Tm(t.alternate, t, Na);
    t.memoizedProps = t.pendingProps, e === null ? fl(t) : At = e;
  }
  function eg(t) {
    var e = t, i = e.alternate;
    switch (e.tag) {
      case 15:
      case 0:
        e = vm(
          i,
          e,
          e.pendingProps,
          e.type,
          void 0,
          Dt
        );
        break;
      case 11:
        e = vm(
          i,
          e,
          e.pendingProps,
          e.type.render,
          e.ref,
          Dt
        );
        break;
      case 5:
        lu(e);
      default:
        Mm(i, e), e = At = $h(e, Na), e = Tm(i, e, Na);
    }
    t.memoizedProps = t.pendingProps, e === null ? fl(t) : At = e;
  }
  function Lr(t, e, i, s) {
    ka = Ui = null, lu(e), wr = null, So = 0;
    var c = e.return;
    try {
      if (Pw(
        t,
        c,
        e,
        i,
        Dt
      )) {
        ue = 1, $s(
          t,
          zn(i, t.current)
        ), At = null;
        return;
      }
    } catch (d) {
      if (c !== null) throw At = c, d;
      ue = 1, $s(
        t,
        zn(i, t.current)
      ), At = null;
      return;
    }
    e.flags & 32768 ? (zt || s === 1 ? t = !0 : Rr || (Dt & 536870912) !== 0 ? t = !1 : (ri = t = !0, (s === 2 || s === 9 || s === 3 || s === 6) && (s = Sn.current, s !== null && s.tag === 13 && (s.flags |= 16384))), ng(e, t)) : fl(e);
  }
  function fl(t) {
    var e = t;
    do {
      if ((e.flags & 32768) !== 0) {
        ng(
          e,
          ri
        );
        return;
      }
      t = e.return;
      var i = qw(
        e.alternate,
        e,
        Na
      );
      if (i !== null) {
        At = i;
        return;
      }
      if (e = e.sibling, e !== null) {
        At = e;
        return;
      }
      At = e = t;
    } while (e !== null);
    ue === 0 && (ue = 5);
  }
  function ng(t, e) {
    do {
      var i = Fw(t.alternate, t);
      if (i !== null) {
        i.flags &= 32767, At = i;
        return;
      }
      if (i = t.return, i !== null && (i.flags |= 32768, i.subtreeFlags = 0, i.deletions = null), !e && (t = t.sibling, t !== null)) {
        At = t;
        return;
      }
      At = t = i;
    } while (t !== null);
    ue = 6, At = null;
  }
  function ag(t, e, i, s, c, d, y, w, j) {
    t.cancelPendingCommit = null;
    do
      hl();
    while (Ce !== 0);
    if ((Kt & 6) !== 0) throw Error(o(327));
    if (e !== null) {
      if (e === t.current) throw Error(o(177));
      if (d = e.lanes | e.childLanes, d |= _c, Ei(
        t,
        i,
        d,
        y,
        w,
        j
      ), t === Zt && (At = Zt = null, Dt = 0), Ar = e, li = t, Oa = i, Ku = d, qu = c, Gm = s, (e.subtreeFlags & 10256) !== 0 || (e.flags & 10256) !== 0 ? (t.callbackNode = null, t.callbackPriority = 0, ax(Lt, function() {
        return lg(), null;
      })) : (t.callbackNode = null, t.callbackPriority = 0), s = (e.flags & 13878) !== 0, (e.subtreeFlags & 13878) !== 0 || s) {
        s = Y.T, Y.T = null, c = J.p, J.p = 2, y = Kt, Kt |= 4;
        try {
          Gw(t, e, i);
        } finally {
          Kt = y, J.p = c, Y.T = s;
        }
      }
      Ce = 1, ig(), rg(), og();
    }
  }
  function ig() {
    if (Ce === 1) {
      Ce = 0;
      var t = li, e = Ar, i = (e.flags & 13878) !== 0;
      if ((e.subtreeFlags & 13878) !== 0 || i) {
        i = Y.T, Y.T = null;
        var s = J.p;
        J.p = 2;
        var c = Kt;
        Kt |= 4;
        try {
          Bm(e, t);
          var d = rd, y = qh(t.containerInfo), w = d.focusedElem, j = d.selectionRange;
          if (y !== w && w && w.ownerDocument && Kh(
            w.ownerDocument.documentElement,
            w
          )) {
            if (j !== null && jc(w)) {
              var V = j.start, q = j.end;
              if (q === void 0 && (q = V), "selectionStart" in w)
                w.selectionStart = V, w.selectionEnd = Math.min(
                  q,
                  w.value.length
                );
              else {
                var I = w.ownerDocument || document, P = I && I.defaultView || window;
                if (P.getSelection) {
                  var K = P.getSelection(), ct = w.textContent.length, gt = Math.min(j.start, ct), Qt = j.end === void 0 ? gt : Math.min(j.end, ct);
                  !K.extend && gt > Qt && (y = Qt, Qt = gt, gt = y);
                  var N = Yh(
                    w,
                    gt
                  ), L = Yh(
                    w,
                    Qt
                  );
                  if (N && L && (K.rangeCount !== 1 || K.anchorNode !== N.node || K.anchorOffset !== N.offset || K.focusNode !== L.node || K.focusOffset !== L.offset)) {
                    var U = I.createRange();
                    U.setStart(N.node, N.offset), K.removeAllRanges(), gt > Qt ? (K.addRange(U), K.extend(L.node, L.offset)) : (U.setEnd(L.node, L.offset), K.addRange(U));
                  }
                }
              }
            }
            for (I = [], K = w; K = K.parentNode; )
              K.nodeType === 1 && I.push({
                element: K,
                left: K.scrollLeft,
                top: K.scrollTop
              });
            for (typeof w.focus == "function" && w.focus(), w = 0; w < I.length; w++) {
              var G = I[w];
              G.element.scrollLeft = G.left, G.element.scrollTop = G.top;
            }
          }
          El = !!id, rd = id = null;
        } finally {
          Kt = c, J.p = s, Y.T = i;
        }
      }
      t.current = e, Ce = 2;
    }
  }
  function rg() {
    if (Ce === 2) {
      Ce = 0;
      var t = li, e = Ar, i = (e.flags & 8772) !== 0;
      if ((e.subtreeFlags & 8772) !== 0 || i) {
        i = Y.T, Y.T = null;
        var s = J.p;
        J.p = 2;
        var c = Kt;
        Kt |= 4;
        try {
          Nm(t, e.alternate, e);
        } finally {
          Kt = c, J.p = s, Y.T = i;
        }
      }
      Ce = 3;
    }
  }
  function og() {
    if (Ce === 4 || Ce === 3) {
      Ce = 0, Xn();
      var t = li, e = Ar, i = Oa, s = Gm;
      (e.subtreeFlags & 10256) !== 0 || (e.flags & 10256) !== 0 ? Ce = 5 : (Ce = 0, Ar = li = null, sg(t, t.pendingLanes));
      var c = t.pendingLanes;
      if (c === 0 && (si = null), no(i), e = e.stateNode, Ee && typeof Ee.onCommitFiberRoot == "function")
        try {
          Ee.onCommitFiberRoot(
            le,
            e,
            void 0,
            (e.current.flags & 128) === 128
          );
        } catch {
        }
      if (s !== null) {
        e = Y.T, c = J.p, J.p = 2, Y.T = null;
        try {
          for (var d = t.onRecoverableError, y = 0; y < s.length; y++) {
            var w = s[y];
            d(w.value, {
              componentStack: w.stack
            });
          }
        } finally {
          Y.T = e, J.p = c;
        }
      }
      (Oa & 3) !== 0 && hl(), ca(t), c = t.pendingLanes, (i & 261930) !== 0 && (c & 42) !== 0 ? t === Fu ? Vo++ : (Vo = 0, Fu = t) : Vo = 0, Ho(0);
    }
  }
  function sg(t, e) {
    (t.pooledCacheLanes &= e) === 0 && (e = t.pooledCache, e != null && (t.pooledCache = null, wo(e)));
  }
  function hl() {
    return ig(), rg(), og(), lg();
  }
  function lg() {
    if (Ce !== 5) return !1;
    var t = li, e = Ku;
    Ku = 0;
    var i = no(Oa), s = Y.T, c = J.p;
    try {
      J.p = 32 > i ? 32 : i, Y.T = null, i = qu, qu = null;
      var d = li, y = Oa;
      if (Ce = 0, Ar = li = null, Oa = 0, (Kt & 6) !== 0) throw Error(o(331));
      var w = Kt;
      if (Kt |= 4, Km(d.current), Hm(
        d,
        d.current,
        y,
        i
      ), Kt = w, Ho(0, !1), Ee && typeof Ee.onPostCommitFiberRoot == "function")
        try {
          Ee.onPostCommitFiberRoot(le, d);
        } catch {
        }
      return !0;
    } finally {
      J.p = c, Y.T = s, sg(t, e);
    }
  }
  function cg(t, e, i) {
    e = zn(i, e), e = ku(t.stateNode, e, 2), t = ei(t, e, 2), t !== null && (Qn(t, 2), ca(t));
  }
  function Gt(t, e, i) {
    if (t.tag === 3)
      cg(t, t, i);
    else
      for (; e !== null; ) {
        if (e.tag === 3) {
          cg(
            e,
            t,
            i
          );
          break;
        } else if (e.tag === 1) {
          var s = e.stateNode;
          if (typeof e.type.getDerivedStateFromError == "function" || typeof s.componentDidCatch == "function" && (si === null || !si.has(s))) {
            t = zn(i, t), i = um(2), s = ei(e, i, 2), s !== null && (dm(
              i,
              s,
              e,
              t
            ), Qn(s, 2), ca(s));
            break;
          }
        }
        e = e.return;
      }
  }
  function Xu(t, e, i) {
    var s = t.pingCache;
    if (s === null) {
      s = t.pingCache = new Ww();
      var c = /* @__PURE__ */ new Set();
      s.set(e, c);
    } else
      c = s.get(e), c === void 0 && (c = /* @__PURE__ */ new Set(), s.set(e, c));
    c.has(i) || (Hu = !0, c.add(i), t = tx.bind(null, t, e, i), e.then(t, t));
  }
  function tx(t, e, i) {
    var s = t.pingCache;
    s !== null && s.delete(e), t.pingedLanes |= t.suspendedLanes & i, t.warmLanes &= ~i, Zt === t && (Dt & i) === i && (ue === 4 || ue === 3 && (Dt & 62914560) === Dt && 300 > De() - sl ? (Kt & 2) === 0 && jr(t, 0) : Pu |= i, Cr === Dt && (Cr = 0)), ca(t);
  }
  function ug(t, e) {
    e === 0 && (e = rr()), t = Oi(t, e), t !== null && (Qn(t, e), ca(t));
  }
  function ex(t) {
    var e = t.memoizedState, i = 0;
    e !== null && (i = e.retryLane), ug(t, i);
  }
  function nx(t, e) {
    var i = 0;
    switch (t.tag) {
      case 31:
      case 13:
        var s = t.stateNode, c = t.memoizedState;
        c !== null && (i = c.retryLane);
        break;
      case 19:
        s = t.stateNode;
        break;
      case 22:
        s = t.stateNode._retryCache;
        break;
      default:
        throw Error(o(314));
    }
    s !== null && s.delete(e), ug(t, i);
  }
  function ax(t, e) {
    return An(t, e);
  }
  var pl = null, Dr = null, Wu = !1, ml = !1, Qu = !1, ui = 0;
  function ca(t) {
    t !== Dr && t.next === null && (Dr === null ? pl = Dr = t : Dr = Dr.next = t), ml = !0, Wu || (Wu = !0, rx());
  }
  function Ho(t, e) {
    if (!Qu && ml) {
      Qu = !0;
      do
        for (var i = !1, s = pl; s !== null; ) {
          if (t !== 0) {
            var c = s.pendingLanes;
            if (c === 0) var d = 0;
            else {
              var y = s.suspendedLanes, w = s.pingedLanes;
              d = (1 << 31 - je(42 | t) + 1) - 1, d &= c & ~(y & ~w), d = d & 201326741 ? d & 201326741 | 1 : d ? d | 2 : 0;
            }
            d !== 0 && (i = !0, pg(s, d));
          } else
            d = Dt, d = ki(
              s,
              s === Zt ? d : 0,
              s.cancelPendingCommit !== null || s.timeoutHandle !== -1
            ), (d & 3) === 0 || Ti(s, d) || (i = !0, pg(s, d));
          s = s.next;
        }
      while (i);
      Qu = !1;
    }
  }
  function ix() {
    dg();
  }
  function dg() {
    ml = Wu = !1;
    var t = 0;
    ui !== 0 && mx() && (t = ui);
    for (var e = De(), i = null, s = pl; s !== null; ) {
      var c = s.next, d = fg(s, e);
      d === 0 ? (s.next = null, i === null ? pl = c : i.next = c, c === null && (Dr = i)) : (i = s, (t !== 0 || (d & 3) !== 0) && (ml = !0)), s = c;
    }
    Ce !== 0 && Ce !== 5 || Ho(t), ui !== 0 && (ui = 0);
  }
  function fg(t, e) {
    for (var i = t.suspendedLanes, s = t.pingedLanes, c = t.expirationTimes, d = t.pendingLanes & -62914561; 0 < d; ) {
      var y = 31 - je(d), w = 1 << y, j = c[y];
      j === -1 ? ((w & i) === 0 || (w & s) !== 0) && (c[y] = vn(w, e)) : j <= e && (t.expiredLanes |= w), d &= ~w;
    }
    if (e = Zt, i = Dt, i = ki(
      t,
      t === e ? i : 0,
      t.cancelPendingCommit !== null || t.timeoutHandle !== -1
    ), s = t.callbackNode, i === 0 || t === e && (Ft === 2 || Ft === 9) || t.cancelPendingCommit !== null)
      return s !== null && s !== null && sn(s), t.callbackNode = null, t.callbackPriority = 0;
    if ((i & 3) === 0 || Ti(t, i)) {
      if (e = i & -i, e === t.callbackPriority) return e;
      switch (s !== null && sn(s), no(i)) {
        case 2:
        case 8:
          i = it;
          break;
        case 32:
          i = Lt;
          break;
        case 268435456:
          i = ie;
          break;
        default:
          i = Lt;
      }
      return s = hg.bind(null, t), i = An(i, s), t.callbackPriority = e, t.callbackNode = i, e;
    }
    return s !== null && s !== null && sn(s), t.callbackPriority = 2, t.callbackNode = null, 2;
  }
  function hg(t, e) {
    if (Ce !== 0 && Ce !== 5)
      return t.callbackNode = null, t.callbackPriority = 0, null;
    var i = t.callbackNode;
    if (hl() && t.callbackNode !== i)
      return null;
    var s = Dt;
    return s = ki(
      t,
      t === Zt ? s : 0,
      t.cancelPendingCommit !== null || t.timeoutHandle !== -1
    ), s === 0 ? null : (Xm(t, s, e), fg(t, De()), t.callbackNode != null && t.callbackNode === i ? hg.bind(null, t) : null);
  }
  function pg(t, e) {
    if (hl()) return null;
    Xm(t, e, !0);
  }
  function rx() {
    yx(function() {
      (Kt & 6) !== 0 ? An(
        nt,
        ix
      ) : dg();
    });
  }
  function Zu() {
    if (ui === 0) {
      var t = yr;
      t === 0 && (t = ia, ia <<= 1, (ia & 261888) === 0 && (ia = 256)), ui = t;
    }
    return ui;
  }
  function mg(t) {
    return t == null || typeof t == "symbol" || typeof t == "boolean" ? null : typeof t == "function" ? t : Ga("" + t);
  }
  function gg(t, e) {
    var i = e.ownerDocument.createElement("input");
    return i.name = e.name, i.value = e.value, t.id && i.setAttribute("form", t.id), e.parentNode.insertBefore(i, e), t = new FormData(t), i.parentNode.removeChild(i), t;
  }
  function ox(t, e, i, s, c) {
    if (e === "submit" && i && i.stateNode === c) {
      var d = mg(
        (c[Oe] || null).action
      ), y = s.submitter;
      y && (e = (e = y[Oe] || null) ? mg(e.formAction) : y.getAttribute("formAction"), e !== null && (d = e, y = null));
      var w = new Rs(
        "action",
        "action",
        null,
        s,
        c
      );
      t.push({
        event: w,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (s.defaultPrevented) {
                if (ui !== 0) {
                  var j = y ? gg(c, y) : new FormData(c);
                  yu(
                    i,
                    {
                      pending: !0,
                      data: j,
                      method: c.method,
                      action: d
                    },
                    null,
                    j
                  );
                }
              } else
                typeof d == "function" && (w.preventDefault(), j = y ? gg(c, y) : new FormData(c), yu(
                  i,
                  {
                    pending: !0,
                    data: j,
                    method: c.method,
                    action: d
                  },
                  d,
                  j
                ));
            },
            currentTarget: c
          }
        ]
      });
    }
  }
  for (var Ju = 0; Ju < Oc.length; Ju++) {
    var $u = Oc[Ju], sx = $u.toLowerCase(), lx = $u[0].toUpperCase() + $u.slice(1);
    Zn(
      sx,
      "on" + lx
    );
  }
  Zn(Ih, "onAnimationEnd"), Zn(Xh, "onAnimationIteration"), Zn(Wh, "onAnimationStart"), Zn("dblclick", "onDoubleClick"), Zn("focusin", "onFocus"), Zn("focusout", "onBlur"), Zn(Tw, "onTransitionRun"), Zn(Ew, "onTransitionStart"), Zn(Mw, "onTransitionCancel"), Zn(Qh, "onTransitionEnd"), ba("onMouseEnter", ["mouseout", "mouseover"]), ba("onMouseLeave", ["mouseout", "mouseover"]), ba("onPointerEnter", ["pointerout", "pointerover"]), ba("onPointerLeave", ["pointerout", "pointerover"]), Dn(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), Dn(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), Dn("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), Dn(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), Dn(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), Dn(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var Po = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), cx = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Po)
  );
  function yg(t, e) {
    e = (e & 4) !== 0;
    for (var i = 0; i < t.length; i++) {
      var s = t[i], c = s.event;
      s = s.listeners;
      t: {
        var d = void 0;
        if (e)
          for (var y = s.length - 1; 0 <= y; y--) {
            var w = s[y], j = w.instance, V = w.currentTarget;
            if (w = w.listener, j !== d && c.isPropagationStopped())
              break t;
            d = w, c.currentTarget = V;
            try {
              d(c);
            } catch (q) {
              js(q);
            }
            c.currentTarget = null, d = j;
          }
        else
          for (y = 0; y < s.length; y++) {
            if (w = s[y], j = w.instance, V = w.currentTarget, w = w.listener, j !== d && c.isPropagationStopped())
              break t;
            d = w, c.currentTarget = V;
            try {
              d(c);
            } catch (q) {
              js(q);
            }
            c.currentTarget = null, d = j;
          }
      }
    }
  }
  function jt(t, e) {
    var i = e[io];
    i === void 0 && (i = e[io] = /* @__PURE__ */ new Set());
    var s = t + "__bubble";
    i.has(s) || (vg(e, t, 2, !1), i.add(s));
  }
  function td(t, e, i) {
    var s = 0;
    e && (s |= 4), vg(
      i,
      t,
      s,
      e
    );
  }
  var gl = "_reactListening" + Math.random().toString(36).slice(2);
  function ed(t) {
    if (!t[gl]) {
      t[gl] = !0, Ri.forEach(function(i) {
        i !== "selectionchange" && (cx.has(i) || td(i, !1, t), td(i, !0, t));
      });
      var e = t.nodeType === 9 ? t : t.ownerDocument;
      e === null || e[gl] || (e[gl] = !0, td("selectionchange", !1, e));
    }
  }
  function vg(t, e, i, s) {
    switch (Ig(e)) {
      case 2:
        var c = Ux;
        break;
      case 8:
        c = Bx;
        break;
      default:
        c = gd;
    }
    i = c.bind(
      null,
      e,
      i,
      t
    ), c = void 0, !xc || e !== "touchstart" && e !== "touchmove" && e !== "wheel" || (c = !0), s ? c !== void 0 ? t.addEventListener(e, i, {
      capture: !0,
      passive: c
    }) : t.addEventListener(e, i, !0) : c !== void 0 ? t.addEventListener(e, i, {
      passive: c
    }) : t.addEventListener(e, i, !1);
  }
  function nd(t, e, i, s, c) {
    var d = s;
    if ((e & 1) === 0 && (e & 2) === 0 && s !== null)
      t: for (; ; ) {
        if (s === null) return;
        var y = s.tag;
        if (y === 3 || y === 4) {
          var w = s.stateNode.containerInfo;
          if (w === c) break;
          if (y === 4)
            for (y = s.return; y !== null; ) {
              var j = y.tag;
              if ((j === 3 || j === 4) && y.stateNode.containerInfo === c)
                return;
              y = y.return;
            }
          for (; w !== null; ) {
            if (y = Pa(w), y === null) return;
            if (j = y.tag, j === 5 || j === 6 || j === 26 || j === 27) {
              s = d = y;
              continue t;
            }
            w = w.parentNode;
          }
        }
        s = s.return;
      }
    ji(function() {
      var V = d, q = ve(i), I = [];
      t: {
        var P = Zh.get(t);
        if (P !== void 0) {
          var K = Rs, ct = t;
          switch (t) {
            case "keypress":
              if (Es(i) === 0) break t;
            case "keydown":
            case "keyup":
              K = nw;
              break;
            case "focusin":
              ct = "focus", K = Ec;
              break;
            case "focusout":
              ct = "blur", K = Ec;
              break;
            case "beforeblur":
            case "afterblur":
              K = Ec;
              break;
            case "click":
              if (i.button === 2) break t;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              K = Mh;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              K = q1;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              K = rw;
              break;
            case Ih:
            case Xh:
            case Wh:
              K = I1;
              break;
            case Qh:
              K = sw;
              break;
            case "scroll":
            case "scrollend":
              K = Y1;
              break;
            case "wheel":
              K = cw;
              break;
            case "copy":
            case "cut":
            case "paste":
              K = W1;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              K = Ch;
              break;
            case "toggle":
            case "beforetoggle":
              K = dw;
          }
          var gt = (e & 4) !== 0, Qt = !gt && (t === "scroll" || t === "scrollend"), N = gt ? P !== null ? P + "Capture" : null : P;
          gt = [];
          for (var L = V, U; L !== null; ) {
            var G = L;
            if (U = G.stateNode, G = G.tag, G !== 5 && G !== 26 && G !== 27 || U === null || N === null || (G = Ia(L, N), G != null && gt.push(
              Yo(L, G, U)
            )), Qt) break;
            L = L.return;
          }
          0 < gt.length && (P = new K(
            P,
            ct,
            null,
            i,
            q
          ), I.push({ event: P, listeners: gt }));
        }
      }
      if ((e & 7) === 0) {
        t: {
          if (P = t === "mouseover" || t === "pointerover", K = t === "mouseout" || t === "pointerout", P && i !== lo && (ct = i.relatedTarget || i.fromElement) && (Pa(ct) || ct[Ln]))
            break t;
          if ((K || P) && (P = q.window === q ? q : (P = q.ownerDocument) ? P.defaultView || P.parentWindow : window, K ? (ct = i.relatedTarget || i.toElement, K = V, ct = ct ? Pa(ct) : null, ct !== null && (Qt = u(ct), gt = ct.tag, ct !== Qt || gt !== 5 && gt !== 27 && gt !== 6) && (ct = null)) : (K = null, ct = V), K !== ct)) {
            if (gt = Mh, G = "onMouseLeave", N = "onMouseEnter", L = "mouse", (t === "pointerout" || t === "pointerover") && (gt = Ch, G = "onPointerLeave", N = "onPointerEnter", L = "pointer"), Qt = K == null ? P : va(K), U = ct == null ? P : va(ct), P = new gt(
              G,
              L + "leave",
              K,
              i,
              q
            ), P.target = Qt, P.relatedTarget = U, G = null, Pa(q) === V && (gt = new gt(
              N,
              L + "enter",
              ct,
              i,
              q
            ), gt.target = U, gt.relatedTarget = Qt, G = gt), Qt = G, K && ct)
              e: {
                for (gt = ux, N = K, L = ct, U = 0, G = N; G; G = gt(G))
                  U++;
                G = 0;
                for (var ft = L; ft; ft = gt(ft))
                  G++;
                for (; 0 < U - G; )
                  N = gt(N), U--;
                for (; 0 < G - U; )
                  L = gt(L), G--;
                for (; U--; ) {
                  if (N === L || L !== null && N === L.alternate) {
                    gt = N;
                    break e;
                  }
                  N = gt(N), L = gt(L);
                }
                gt = null;
              }
            else gt = null;
            K !== null && bg(
              I,
              P,
              K,
              gt,
              !1
            ), ct !== null && Qt !== null && bg(
              I,
              Qt,
              ct,
              gt,
              !0
            );
          }
        }
        t: {
          if (P = V ? va(V) : window, K = P.nodeName && P.nodeName.toLowerCase(), K === "select" || K === "input" && P.type === "file")
            var Pt = zh;
          else if (Oh(P))
            if (Uh)
              Pt = xw;
            else {
              Pt = bw;
              var dt = vw;
            }
          else
            K = P.nodeName, !K || K.toLowerCase() !== "input" || P.type !== "checkbox" && P.type !== "radio" ? V && Xe(V.elementType) && (Pt = zh) : Pt = ww;
          if (Pt && (Pt = Pt(t, V))) {
            _h(
              I,
              Pt,
              i,
              q
            );
            break t;
          }
          dt && dt(t, P, V), t === "focusout" && V && P.type === "number" && V.memoizedProps.value != null && Nn(P, "number", P.value);
        }
        switch (dt = V ? va(V) : window, t) {
          case "focusin":
            (Oh(dt) || dt.contentEditable === "true") && (cr = dt, Lc = V, yo = null);
            break;
          case "focusout":
            yo = Lc = cr = null;
            break;
          case "mousedown":
            Dc = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Dc = !1, Fh(I, i, q);
            break;
          case "selectionchange":
            if (kw) break;
          case "keydown":
          case "keyup":
            Fh(I, i, q);
        }
        var kt;
        if (Rc)
          t: {
            switch (t) {
              case "compositionstart":
                var Nt = "onCompositionStart";
                break t;
              case "compositionend":
                Nt = "onCompositionEnd";
                break t;
              case "compositionupdate":
                Nt = "onCompositionUpdate";
                break t;
            }
            Nt = void 0;
          }
        else
          lr ? Dh(t, i) && (Nt = "onCompositionEnd") : t === "keydown" && i.keyCode === 229 && (Nt = "onCompositionStart");
        Nt && (Ah && i.locale !== "ko" && (lr || Nt !== "onCompositionStart" ? Nt === "onCompositionEnd" && lr && (kt = Th()) : (Xa = q, Sc = "value" in Xa ? Xa.value : Xa.textContent, lr = !0)), dt = yl(V, Nt), 0 < dt.length && (Nt = new Rh(
          Nt,
          t,
          null,
          i,
          q
        ), I.push({ event: Nt, listeners: dt }), kt ? Nt.data = kt : (kt = Nh(i), kt !== null && (Nt.data = kt)))), (kt = hw ? pw(t, i) : mw(t, i)) && (Nt = yl(V, "onBeforeInput"), 0 < Nt.length && (dt = new Rh(
          "onBeforeInput",
          "beforeinput",
          null,
          i,
          q
        ), I.push({
          event: dt,
          listeners: Nt
        }), dt.data = kt)), ox(
          I,
          t,
          V,
          i,
          q
        );
      }
      yg(I, e);
    });
  }
  function Yo(t, e, i) {
    return {
      instance: t,
      listener: e,
      currentTarget: i
    };
  }
  function yl(t, e) {
    for (var i = e + "Capture", s = []; t !== null; ) {
      var c = t, d = c.stateNode;
      if (c = c.tag, c !== 5 && c !== 26 && c !== 27 || d === null || (c = Ia(t, i), c != null && s.unshift(
        Yo(t, c, d)
      ), c = Ia(t, e), c != null && s.push(
        Yo(t, c, d)
      )), t.tag === 3) return s;
      t = t.return;
    }
    return [];
  }
  function ux(t) {
    if (t === null) return null;
    do
      t = t.return;
    while (t && t.tag !== 5 && t.tag !== 27);
    return t || null;
  }
  function bg(t, e, i, s, c) {
    for (var d = e._reactName, y = []; i !== null && i !== s; ) {
      var w = i, j = w.alternate, V = w.stateNode;
      if (w = w.tag, j !== null && j === s) break;
      w !== 5 && w !== 26 && w !== 27 || V === null || (j = V, c ? (V = Ia(i, d), V != null && y.unshift(
        Yo(i, V, j)
      )) : c || (V = Ia(i, d), V != null && y.push(
        Yo(i, V, j)
      ))), i = i.return;
    }
    y.length !== 0 && t.push({ event: e, listeners: y });
  }
  var dx = /\r\n?/g, fx = /\u0000|\uFFFD/g;
  function wg(t) {
    return (typeof t == "string" ? t : "" + t).replace(dx, `
`).replace(fx, "");
  }
  function xg(t, e) {
    return e = wg(e), wg(t) === e;
  }
  function Wt(t, e, i, s, c, d) {
    switch (i) {
      case "children":
        typeof s == "string" ? e === "body" || e === "textarea" && s === "" || Vt(t, s) : (typeof s == "number" || typeof s == "bigint") && e !== "body" && Vt(t, "" + s);
        break;
      case "className":
        Ai(t, "class", s);
        break;
      case "tabIndex":
        Ai(t, "tabindex", s);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        Ai(t, i, s);
        break;
      case "style":
        bn(t, s, d);
        break;
      case "data":
        if (e !== "object") {
          Ai(t, "data", s);
          break;
        }
      case "src":
      case "href":
        if (s === "" && (e !== "a" || i !== "href")) {
          t.removeAttribute(i);
          break;
        }
        if (s == null || typeof s == "function" || typeof s == "symbol" || typeof s == "boolean") {
          t.removeAttribute(i);
          break;
        }
        s = Ga("" + s), t.setAttribute(i, s);
        break;
      case "action":
      case "formAction":
        if (typeof s == "function") {
          t.setAttribute(
            i,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          typeof d == "function" && (i === "formAction" ? (e !== "input" && Wt(t, e, "name", c.name, c, null), Wt(
            t,
            e,
            "formEncType",
            c.formEncType,
            c,
            null
          ), Wt(
            t,
            e,
            "formMethod",
            c.formMethod,
            c,
            null
          ), Wt(
            t,
            e,
            "formTarget",
            c.formTarget,
            c,
            null
          )) : (Wt(t, e, "encType", c.encType, c, null), Wt(t, e, "method", c.method, c, null), Wt(t, e, "target", c.target, c, null)));
        if (s == null || typeof s == "symbol" || typeof s == "boolean") {
          t.removeAttribute(i);
          break;
        }
        s = Ga("" + s), t.setAttribute(i, s);
        break;
      case "onClick":
        s != null && (t.onclick = On);
        break;
      case "onScroll":
        s != null && jt("scroll", t);
        break;
      case "onScrollEnd":
        s != null && jt("scrollend", t);
        break;
      case "dangerouslySetInnerHTML":
        if (s != null) {
          if (typeof s != "object" || !("__html" in s))
            throw Error(o(61));
          if (i = s.__html, i != null) {
            if (c.children != null) throw Error(o(60));
            t.innerHTML = i;
          }
        }
        break;
      case "multiple":
        t.multiple = s && typeof s != "function" && typeof s != "symbol";
        break;
      case "muted":
        t.muted = s && typeof s != "function" && typeof s != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (s == null || typeof s == "function" || typeof s == "boolean" || typeof s == "symbol") {
          t.removeAttribute("xlink:href");
          break;
        }
        i = Ga("" + s), t.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          i
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        s != null && typeof s != "function" && typeof s != "symbol" ? t.setAttribute(i, "" + s) : t.removeAttribute(i);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        s && typeof s != "function" && typeof s != "symbol" ? t.setAttribute(i, "") : t.removeAttribute(i);
        break;
      case "capture":
      case "download":
        s === !0 ? t.setAttribute(i, "") : s !== !1 && s != null && typeof s != "function" && typeof s != "symbol" ? t.setAttribute(i, s) : t.removeAttribute(i);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        s != null && typeof s != "function" && typeof s != "symbol" && !isNaN(s) && 1 <= s ? t.setAttribute(i, s) : t.removeAttribute(i);
        break;
      case "rowSpan":
      case "start":
        s == null || typeof s == "function" || typeof s == "symbol" || isNaN(s) ? t.removeAttribute(i) : t.setAttribute(i, s);
        break;
      case "popover":
        jt("beforetoggle", t), jt("toggle", t), Me(t, "popover", s);
        break;
      case "xlinkActuate":
        H(
          t,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          s
        );
        break;
      case "xlinkArcrole":
        H(
          t,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          s
        );
        break;
      case "xlinkRole":
        H(
          t,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          s
        );
        break;
      case "xlinkShow":
        H(
          t,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          s
        );
        break;
      case "xlinkTitle":
        H(
          t,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          s
        );
        break;
      case "xlinkType":
        H(
          t,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          s
        );
        break;
      case "xmlBase":
        H(
          t,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          s
        );
        break;
      case "xmlLang":
        H(
          t,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          s
        );
        break;
      case "xmlSpace":
        H(
          t,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          s
        );
        break;
      case "is":
        Me(t, "is", s);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < i.length) || i[0] !== "o" && i[0] !== "O" || i[1] !== "n" && i[1] !== "N") && (i = qa.get(i) || i, Me(t, i, s));
    }
  }
  function ad(t, e, i, s, c, d) {
    switch (i) {
      case "style":
        bn(t, s, d);
        break;
      case "dangerouslySetInnerHTML":
        if (s != null) {
          if (typeof s != "object" || !("__html" in s))
            throw Error(o(61));
          if (i = s.__html, i != null) {
            if (c.children != null) throw Error(o(60));
            t.innerHTML = i;
          }
        }
        break;
      case "children":
        typeof s == "string" ? Vt(t, s) : (typeof s == "number" || typeof s == "bigint") && Vt(t, "" + s);
        break;
      case "onScroll":
        s != null && jt("scroll", t);
        break;
      case "onScrollEnd":
        s != null && jt("scrollend", t);
        break;
      case "onClick":
        s != null && (t.onclick = On);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!Ci.hasOwnProperty(i))
          t: {
            if (i[0] === "o" && i[1] === "n" && (c = i.endsWith("Capture"), e = i.slice(2, c ? i.length - 7 : void 0), d = t[Oe] || null, d = d != null ? d[i] : null, typeof d == "function" && t.removeEventListener(e, d, c), typeof s == "function")) {
              typeof d != "function" && d !== null && (i in t ? t[i] = null : t.hasAttribute(i) && t.removeAttribute(i)), t.addEventListener(e, s, c);
              break t;
            }
            i in t ? t[i] = s : s === !0 ? t.setAttribute(i, "") : Me(t, i, s);
          }
    }
  }
  function He(t, e, i) {
    switch (e) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        jt("error", t), jt("load", t);
        var s = !1, c = !1, d;
        for (d in i)
          if (i.hasOwnProperty(d)) {
            var y = i[d];
            if (y != null)
              switch (d) {
                case "src":
                  s = !0;
                  break;
                case "srcSet":
                  c = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(o(137, e));
                default:
                  Wt(t, e, d, y, i, null);
              }
          }
        c && Wt(t, e, "srcSet", i.srcSet, i, null), s && Wt(t, e, "src", i.src, i, null);
        return;
      case "input":
        jt("invalid", t);
        var w = d = y = c = null, j = null, V = null;
        for (s in i)
          if (i.hasOwnProperty(s)) {
            var q = i[s];
            if (q != null)
              switch (s) {
                case "name":
                  c = q;
                  break;
                case "type":
                  y = q;
                  break;
                case "checked":
                  j = q;
                  break;
                case "defaultChecked":
                  V = q;
                  break;
                case "value":
                  d = q;
                  break;
                case "defaultValue":
                  w = q;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (q != null)
                    throw Error(o(137, e));
                  break;
                default:
                  Wt(t, e, s, q, i, null);
              }
          }
        cn(
          t,
          d,
          w,
          j,
          V,
          y,
          c,
          !1
        );
        return;
      case "select":
        jt("invalid", t), s = y = d = null;
        for (c in i)
          if (i.hasOwnProperty(c) && (w = i[c], w != null))
            switch (c) {
              case "value":
                d = w;
                break;
              case "defaultValue":
                y = w;
                break;
              case "multiple":
                s = w;
              default:
                Wt(t, e, c, w, i, null);
            }
        e = d, i = y, t.multiple = !!s, e != null ? ze(t, !!s, e, !1) : i != null && ze(t, !!s, i, !0);
        return;
      case "textarea":
        jt("invalid", t), d = c = s = null;
        for (y in i)
          if (i.hasOwnProperty(y) && (w = i[y], w != null))
            switch (y) {
              case "value":
                s = w;
                break;
              case "defaultValue":
                c = w;
                break;
              case "children":
                d = w;
                break;
              case "dangerouslySetInnerHTML":
                if (w != null) throw Error(o(91));
                break;
              default:
                Wt(t, e, y, w, i, null);
            }
        Ct(t, s, c, d);
        return;
      case "option":
        for (j in i)
          i.hasOwnProperty(j) && (s = i[j], s != null) && (j === "selected" ? t.selected = s && typeof s != "function" && typeof s != "symbol" : Wt(t, e, j, s, i, null));
        return;
      case "dialog":
        jt("beforetoggle", t), jt("toggle", t), jt("cancel", t), jt("close", t);
        break;
      case "iframe":
      case "object":
        jt("load", t);
        break;
      case "video":
      case "audio":
        for (s = 0; s < Po.length; s++)
          jt(Po[s], t);
        break;
      case "image":
        jt("error", t), jt("load", t);
        break;
      case "details":
        jt("toggle", t);
        break;
      case "embed":
      case "source":
      case "link":
        jt("error", t), jt("load", t);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (V in i)
          if (i.hasOwnProperty(V) && (s = i[V], s != null))
            switch (V) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(o(137, e));
              default:
                Wt(t, e, V, s, i, null);
            }
        return;
      default:
        if (Xe(e)) {
          for (q in i)
            i.hasOwnProperty(q) && (s = i[q], s !== void 0 && ad(
              t,
              e,
              q,
              s,
              i,
              void 0
            ));
          return;
        }
    }
    for (w in i)
      i.hasOwnProperty(w) && (s = i[w], s != null && Wt(t, e, w, s, i, null));
  }
  function hx(t, e, i, s) {
    switch (e) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var c = null, d = null, y = null, w = null, j = null, V = null, q = null;
        for (K in i) {
          var I = i[K];
          if (i.hasOwnProperty(K) && I != null)
            switch (K) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                j = I;
              default:
                s.hasOwnProperty(K) || Wt(t, e, K, null, s, I);
            }
        }
        for (var P in s) {
          var K = s[P];
          if (I = i[P], s.hasOwnProperty(P) && (K != null || I != null))
            switch (P) {
              case "type":
                d = K;
                break;
              case "name":
                c = K;
                break;
              case "checked":
                V = K;
                break;
              case "defaultChecked":
                q = K;
                break;
              case "value":
                y = K;
                break;
              case "defaultValue":
                w = K;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (K != null)
                  throw Error(o(137, e));
                break;
              default:
                K !== I && Wt(
                  t,
                  e,
                  P,
                  K,
                  s,
                  I
                );
            }
        }
        _e(
          t,
          y,
          w,
          j,
          V,
          q,
          d,
          c
        );
        return;
      case "select":
        K = y = w = P = null;
        for (d in i)
          if (j = i[d], i.hasOwnProperty(d) && j != null)
            switch (d) {
              case "value":
                break;
              case "multiple":
                K = j;
              default:
                s.hasOwnProperty(d) || Wt(
                  t,
                  e,
                  d,
                  null,
                  s,
                  j
                );
            }
        for (c in s)
          if (d = s[c], j = i[c], s.hasOwnProperty(c) && (d != null || j != null))
            switch (c) {
              case "value":
                P = d;
                break;
              case "defaultValue":
                w = d;
                break;
              case "multiple":
                y = d;
              default:
                d !== j && Wt(
                  t,
                  e,
                  c,
                  d,
                  s,
                  j
                );
            }
        e = w, i = y, s = K, P != null ? ze(t, !!i, P, !1) : !!s != !!i && (e != null ? ze(t, !!i, e, !0) : ze(t, !!i, i ? [] : "", !1));
        return;
      case "textarea":
        K = P = null;
        for (w in i)
          if (c = i[w], i.hasOwnProperty(w) && c != null && !s.hasOwnProperty(w))
            switch (w) {
              case "value":
                break;
              case "children":
                break;
              default:
                Wt(t, e, w, null, s, c);
            }
        for (y in s)
          if (c = s[y], d = i[y], s.hasOwnProperty(y) && (c != null || d != null))
            switch (y) {
              case "value":
                P = c;
                break;
              case "defaultValue":
                K = c;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (c != null) throw Error(o(91));
                break;
              default:
                c !== d && Wt(t, e, y, c, s, d);
            }
        qt(t, P, K);
        return;
      case "option":
        for (var ct in i)
          P = i[ct], i.hasOwnProperty(ct) && P != null && !s.hasOwnProperty(ct) && (ct === "selected" ? t.selected = !1 : Wt(
            t,
            e,
            ct,
            null,
            s,
            P
          ));
        for (j in s)
          P = s[j], K = i[j], s.hasOwnProperty(j) && P !== K && (P != null || K != null) && (j === "selected" ? t.selected = P && typeof P != "function" && typeof P != "symbol" : Wt(
            t,
            e,
            j,
            P,
            s,
            K
          ));
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var gt in i)
          P = i[gt], i.hasOwnProperty(gt) && P != null && !s.hasOwnProperty(gt) && Wt(t, e, gt, null, s, P);
        for (V in s)
          if (P = s[V], K = i[V], s.hasOwnProperty(V) && P !== K && (P != null || K != null))
            switch (V) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (P != null)
                  throw Error(o(137, e));
                break;
              default:
                Wt(
                  t,
                  e,
                  V,
                  P,
                  s,
                  K
                );
            }
        return;
      default:
        if (Xe(e)) {
          for (var Qt in i)
            P = i[Qt], i.hasOwnProperty(Qt) && P !== void 0 && !s.hasOwnProperty(Qt) && ad(
              t,
              e,
              Qt,
              void 0,
              s,
              P
            );
          for (q in s)
            P = s[q], K = i[q], !s.hasOwnProperty(q) || P === K || P === void 0 && K === void 0 || ad(
              t,
              e,
              q,
              P,
              s,
              K
            );
          return;
        }
    }
    for (var N in i)
      P = i[N], i.hasOwnProperty(N) && P != null && !s.hasOwnProperty(N) && Wt(t, e, N, null, s, P);
    for (I in s)
      P = s[I], K = i[I], !s.hasOwnProperty(I) || P === K || P == null && K == null || Wt(t, e, I, P, s, K);
  }
  function Sg(t) {
    switch (t) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function px() {
    if (typeof performance.getEntriesByType == "function") {
      for (var t = 0, e = 0, i = performance.getEntriesByType("resource"), s = 0; s < i.length; s++) {
        var c = i[s], d = c.transferSize, y = c.initiatorType, w = c.duration;
        if (d && w && Sg(y)) {
          for (y = 0, w = c.responseEnd, s += 1; s < i.length; s++) {
            var j = i[s], V = j.startTime;
            if (V > w) break;
            var q = j.transferSize, I = j.initiatorType;
            q && Sg(I) && (j = j.responseEnd, y += q * (j < w ? 1 : (w - V) / (j - V)));
          }
          if (--s, e += 8 * (d + y) / (c.duration / 1e3), t++, 10 < t) break;
        }
      }
      if (0 < t) return e / t / 1e6;
    }
    return navigator.connection && (t = navigator.connection.downlink, typeof t == "number") ? t : 5;
  }
  var id = null, rd = null;
  function vl(t) {
    return t.nodeType === 9 ? t : t.ownerDocument;
  }
  function kg(t) {
    switch (t) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function Tg(t, e) {
    if (t === 0)
      switch (e) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return t === 1 && e === "foreignObject" ? 0 : t;
  }
  function od(t, e) {
    return t === "textarea" || t === "noscript" || typeof e.children == "string" || typeof e.children == "number" || typeof e.children == "bigint" || typeof e.dangerouslySetInnerHTML == "object" && e.dangerouslySetInnerHTML !== null && e.dangerouslySetInnerHTML.__html != null;
  }
  var sd = null;
  function mx() {
    var t = window.event;
    return t && t.type === "popstate" ? t === sd ? !1 : (sd = t, !0) : (sd = null, !1);
  }
  var Eg = typeof setTimeout == "function" ? setTimeout : void 0, gx = typeof clearTimeout == "function" ? clearTimeout : void 0, Mg = typeof Promise == "function" ? Promise : void 0, yx = typeof queueMicrotask == "function" ? queueMicrotask : typeof Mg < "u" ? function(t) {
    return Mg.resolve(null).then(t).catch(vx);
  } : Eg;
  function vx(t) {
    setTimeout(function() {
      throw t;
    });
  }
  function di(t) {
    return t === "head";
  }
  function Rg(t, e) {
    var i = e, s = 0;
    do {
      var c = i.nextSibling;
      if (t.removeChild(i), c && c.nodeType === 8)
        if (i = c.data, i === "/$" || i === "/&") {
          if (s === 0) {
            t.removeChild(c), zr(e);
            return;
          }
          s--;
        } else if (i === "$" || i === "$?" || i === "$~" || i === "$!" || i === "&")
          s++;
        else if (i === "html")
          Ko(t.ownerDocument.documentElement);
        else if (i === "head") {
          i = t.ownerDocument.head, Ko(i);
          for (var d = i.firstChild; d; ) {
            var y = d.nextSibling, w = d.nodeName;
            d[Ha] || w === "SCRIPT" || w === "STYLE" || w === "LINK" && d.rel.toLowerCase() === "stylesheet" || i.removeChild(d), d = y;
          }
        } else
          i === "body" && Ko(t.ownerDocument.body);
      i = c;
    } while (i);
    zr(e);
  }
  function Cg(t, e) {
    var i = t;
    t = 0;
    do {
      var s = i.nextSibling;
      if (i.nodeType === 1 ? e ? (i._stashedDisplay = i.style.display, i.style.display = "none") : (i.style.display = i._stashedDisplay || "", i.getAttribute("style") === "" && i.removeAttribute("style")) : i.nodeType === 3 && (e ? (i._stashedText = i.nodeValue, i.nodeValue = "") : i.nodeValue = i._stashedText || ""), s && s.nodeType === 8)
        if (i = s.data, i === "/$") {
          if (t === 0) break;
          t--;
        } else
          i !== "$" && i !== "$?" && i !== "$~" && i !== "$!" || t++;
      i = s;
    } while (i);
  }
  function ld(t) {
    var e = t.firstChild;
    for (e && e.nodeType === 10 && (e = e.nextSibling); e; ) {
      var i = e;
      switch (e = e.nextSibling, i.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          ld(i), Mi(i);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (i.rel.toLowerCase() === "stylesheet") continue;
      }
      t.removeChild(i);
    }
  }
  function bx(t, e, i, s) {
    for (; t.nodeType === 1; ) {
      var c = i;
      if (t.nodeName.toLowerCase() !== e.toLowerCase()) {
        if (!s && (t.nodeName !== "INPUT" || t.type !== "hidden"))
          break;
      } else if (s) {
        if (!t[Ha])
          switch (e) {
            case "meta":
              if (!t.hasAttribute("itemprop")) break;
              return t;
            case "link":
              if (d = t.getAttribute("rel"), d === "stylesheet" && t.hasAttribute("data-precedence"))
                break;
              if (d !== c.rel || t.getAttribute("href") !== (c.href == null || c.href === "" ? null : c.href) || t.getAttribute("crossorigin") !== (c.crossOrigin == null ? null : c.crossOrigin) || t.getAttribute("title") !== (c.title == null ? null : c.title))
                break;
              return t;
            case "style":
              if (t.hasAttribute("data-precedence")) break;
              return t;
            case "script":
              if (d = t.getAttribute("src"), (d !== (c.src == null ? null : c.src) || t.getAttribute("type") !== (c.type == null ? null : c.type) || t.getAttribute("crossorigin") !== (c.crossOrigin == null ? null : c.crossOrigin)) && d && t.hasAttribute("async") && !t.hasAttribute("itemprop"))
                break;
              return t;
            default:
              return t;
          }
      } else if (e === "input" && t.type === "hidden") {
        var d = c.name == null ? null : "" + c.name;
        if (c.type === "hidden" && t.getAttribute("name") === d)
          return t;
      } else return t;
      if (t = Pn(t.nextSibling), t === null) break;
    }
    return null;
  }
  function wx(t, e, i) {
    if (e === "") return null;
    for (; t.nodeType !== 3; )
      if ((t.nodeType !== 1 || t.nodeName !== "INPUT" || t.type !== "hidden") && !i || (t = Pn(t.nextSibling), t === null)) return null;
    return t;
  }
  function Ag(t, e) {
    for (; t.nodeType !== 8; )
      if ((t.nodeType !== 1 || t.nodeName !== "INPUT" || t.type !== "hidden") && !e || (t = Pn(t.nextSibling), t === null)) return null;
    return t;
  }
  function cd(t) {
    return t.data === "$?" || t.data === "$~";
  }
  function ud(t) {
    return t.data === "$!" || t.data === "$?" && t.ownerDocument.readyState !== "loading";
  }
  function xx(t, e) {
    var i = t.ownerDocument;
    if (t.data === "$~") t._reactRetry = e;
    else if (t.data !== "$?" || i.readyState !== "loading")
      e();
    else {
      var s = function() {
        e(), i.removeEventListener("DOMContentLoaded", s);
      };
      i.addEventListener("DOMContentLoaded", s), t._reactRetry = s;
    }
  }
  function Pn(t) {
    for (; t != null; t = t.nextSibling) {
      var e = t.nodeType;
      if (e === 1 || e === 3) break;
      if (e === 8) {
        if (e = t.data, e === "$" || e === "$!" || e === "$?" || e === "$~" || e === "&" || e === "F!" || e === "F")
          break;
        if (e === "/$" || e === "/&") return null;
      }
    }
    return t;
  }
  var dd = null;
  function jg(t) {
    t = t.nextSibling;
    for (var e = 0; t; ) {
      if (t.nodeType === 8) {
        var i = t.data;
        if (i === "/$" || i === "/&") {
          if (e === 0)
            return Pn(t.nextSibling);
          e--;
        } else
          i !== "$" && i !== "$!" && i !== "$?" && i !== "$~" && i !== "&" || e++;
      }
      t = t.nextSibling;
    }
    return null;
  }
  function Lg(t) {
    t = t.previousSibling;
    for (var e = 0; t; ) {
      if (t.nodeType === 8) {
        var i = t.data;
        if (i === "$" || i === "$!" || i === "$?" || i === "$~" || i === "&") {
          if (e === 0) return t;
          e--;
        } else i !== "/$" && i !== "/&" || e++;
      }
      t = t.previousSibling;
    }
    return null;
  }
  function Dg(t, e, i) {
    switch (e = vl(i), t) {
      case "html":
        if (t = e.documentElement, !t) throw Error(o(452));
        return t;
      case "head":
        if (t = e.head, !t) throw Error(o(453));
        return t;
      case "body":
        if (t = e.body, !t) throw Error(o(454));
        return t;
      default:
        throw Error(o(451));
    }
  }
  function Ko(t) {
    for (var e = t.attributes; e.length; )
      t.removeAttributeNode(e[0]);
    Mi(t);
  }
  var Yn = /* @__PURE__ */ new Map(), Ng = /* @__PURE__ */ new Set();
  function bl(t) {
    return typeof t.getRootNode == "function" ? t.getRootNode() : t.nodeType === 9 ? t : t.ownerDocument;
  }
  var _a = J.d;
  J.d = {
    f: Sx,
    r: kx,
    D: Tx,
    C: Ex,
    L: Mx,
    m: Rx,
    X: Ax,
    S: Cx,
    M: jx
  };
  function Sx() {
    var t = _a.f(), e = ul();
    return t || e;
  }
  function kx(t) {
    var e = Ya(t);
    e !== null && e.tag === 5 && e.type === "form" ? Qp(e) : _a.r(t);
  }
  var Nr = typeof document > "u" ? null : document;
  function Og(t, e, i) {
    var s = Nr;
    if (s && typeof e == "string" && e) {
      var c = te(e);
      c = 'link[rel="' + t + '"][href="' + c + '"]', typeof i == "string" && (c += '[crossorigin="' + i + '"]'), Ng.has(c) || (Ng.add(c), t = { rel: t, crossOrigin: i, href: e }, s.querySelector(c) === null && (e = s.createElement("link"), He(e, "link", t), pe(e), s.head.appendChild(e)));
    }
  }
  function Tx(t) {
    _a.D(t), Og("dns-prefetch", t, null);
  }
  function Ex(t, e) {
    _a.C(t, e), Og("preconnect", t, e);
  }
  function Mx(t, e, i) {
    _a.L(t, e, i);
    var s = Nr;
    if (s && t && e) {
      var c = 'link[rel="preload"][as="' + te(e) + '"]';
      e === "image" && i && i.imageSrcSet ? (c += '[imagesrcset="' + te(
        i.imageSrcSet
      ) + '"]', typeof i.imageSizes == "string" && (c += '[imagesizes="' + te(
        i.imageSizes
      ) + '"]')) : c += '[href="' + te(t) + '"]';
      var d = c;
      switch (e) {
        case "style":
          d = Or(t);
          break;
        case "script":
          d = _r(t);
      }
      Yn.has(d) || (t = v(
        {
          rel: "preload",
          href: e === "image" && i && i.imageSrcSet ? void 0 : t,
          as: e
        },
        i
      ), Yn.set(d, t), s.querySelector(c) !== null || e === "style" && s.querySelector(qo(d)) || e === "script" && s.querySelector(Fo(d)) || (e = s.createElement("link"), He(e, "link", t), pe(e), s.head.appendChild(e)));
    }
  }
  function Rx(t, e) {
    _a.m(t, e);
    var i = Nr;
    if (i && t) {
      var s = e && typeof e.as == "string" ? e.as : "script", c = 'link[rel="modulepreload"][as="' + te(s) + '"][href="' + te(t) + '"]', d = c;
      switch (s) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          d = _r(t);
      }
      if (!Yn.has(d) && (t = v({ rel: "modulepreload", href: t }, e), Yn.set(d, t), i.querySelector(c) === null)) {
        switch (s) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (i.querySelector(Fo(d)))
              return;
        }
        s = i.createElement("link"), He(s, "link", t), pe(s), i.head.appendChild(s);
      }
    }
  }
  function Cx(t, e, i) {
    _a.S(t, e, i);
    var s = Nr;
    if (s && t) {
      var c = Ka(s).hoistableStyles, d = Or(t);
      e = e || "default";
      var y = c.get(d);
      if (!y) {
        var w = { loading: 0, preload: null };
        if (y = s.querySelector(
          qo(d)
        ))
          w.loading = 5;
        else {
          t = v(
            { rel: "stylesheet", href: t, "data-precedence": e },
            i
          ), (i = Yn.get(d)) && fd(t, i);
          var j = y = s.createElement("link");
          pe(j), He(j, "link", t), j._p = new Promise(function(V, q) {
            j.onload = V, j.onerror = q;
          }), j.addEventListener("load", function() {
            w.loading |= 1;
          }), j.addEventListener("error", function() {
            w.loading |= 2;
          }), w.loading |= 4, wl(y, e, s);
        }
        y = {
          type: "stylesheet",
          instance: y,
          count: 1,
          state: w
        }, c.set(d, y);
      }
    }
  }
  function Ax(t, e) {
    _a.X(t, e);
    var i = Nr;
    if (i && t) {
      var s = Ka(i).hoistableScripts, c = _r(t), d = s.get(c);
      d || (d = i.querySelector(Fo(c)), d || (t = v({ src: t, async: !0 }, e), (e = Yn.get(c)) && hd(t, e), d = i.createElement("script"), pe(d), He(d, "link", t), i.head.appendChild(d)), d = {
        type: "script",
        instance: d,
        count: 1,
        state: null
      }, s.set(c, d));
    }
  }
  function jx(t, e) {
    _a.M(t, e);
    var i = Nr;
    if (i && t) {
      var s = Ka(i).hoistableScripts, c = _r(t), d = s.get(c);
      d || (d = i.querySelector(Fo(c)), d || (t = v({ src: t, async: !0, type: "module" }, e), (e = Yn.get(c)) && hd(t, e), d = i.createElement("script"), pe(d), He(d, "link", t), i.head.appendChild(d)), d = {
        type: "script",
        instance: d,
        count: 1,
        state: null
      }, s.set(c, d));
    }
  }
  function _g(t, e, i, s) {
    var c = (c = ot.current) ? bl(c) : null;
    if (!c) throw Error(o(446));
    switch (t) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof i.precedence == "string" && typeof i.href == "string" ? (e = Or(i.href), i = Ka(
          c
        ).hoistableStyles, s = i.get(e), s || (s = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, i.set(e, s)), s) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (i.rel === "stylesheet" && typeof i.href == "string" && typeof i.precedence == "string") {
          t = Or(i.href);
          var d = Ka(
            c
          ).hoistableStyles, y = d.get(t);
          if (y || (c = c.ownerDocument || c, y = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, d.set(t, y), (d = c.querySelector(
            qo(t)
          )) && !d._p && (y.instance = d, y.state.loading = 5), Yn.has(t) || (i = {
            rel: "preload",
            as: "style",
            href: i.href,
            crossOrigin: i.crossOrigin,
            integrity: i.integrity,
            media: i.media,
            hrefLang: i.hrefLang,
            referrerPolicy: i.referrerPolicy
          }, Yn.set(t, i), d || Lx(
            c,
            t,
            i,
            y.state
          ))), e && s === null)
            throw Error(o(528, ""));
          return y;
        }
        if (e && s !== null)
          throw Error(o(529, ""));
        return null;
      case "script":
        return e = i.async, i = i.src, typeof i == "string" && e && typeof e != "function" && typeof e != "symbol" ? (e = _r(i), i = Ka(
          c
        ).hoistableScripts, s = i.get(e), s || (s = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, i.set(e, s)), s) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(o(444, t));
    }
  }
  function Or(t) {
    return 'href="' + te(t) + '"';
  }
  function qo(t) {
    return 'link[rel="stylesheet"][' + t + "]";
  }
  function zg(t) {
    return v({}, t, {
      "data-precedence": t.precedence,
      precedence: null
    });
  }
  function Lx(t, e, i, s) {
    t.querySelector('link[rel="preload"][as="style"][' + e + "]") ? s.loading = 1 : (e = t.createElement("link"), s.preload = e, e.addEventListener("load", function() {
      return s.loading |= 1;
    }), e.addEventListener("error", function() {
      return s.loading |= 2;
    }), He(e, "link", i), pe(e), t.head.appendChild(e));
  }
  function _r(t) {
    return '[src="' + te(t) + '"]';
  }
  function Fo(t) {
    return "script[async]" + t;
  }
  function Ug(t, e, i) {
    if (e.count++, e.instance === null)
      switch (e.type) {
        case "style":
          var s = t.querySelector(
            'style[data-href~="' + te(i.href) + '"]'
          );
          if (s)
            return e.instance = s, pe(s), s;
          var c = v({}, i, {
            "data-href": i.href,
            "data-precedence": i.precedence,
            href: null,
            precedence: null
          });
          return s = (t.ownerDocument || t).createElement(
            "style"
          ), pe(s), He(s, "style", c), wl(s, i.precedence, t), e.instance = s;
        case "stylesheet":
          c = Or(i.href);
          var d = t.querySelector(
            qo(c)
          );
          if (d)
            return e.state.loading |= 4, e.instance = d, pe(d), d;
          s = zg(i), (c = Yn.get(c)) && fd(s, c), d = (t.ownerDocument || t).createElement("link"), pe(d);
          var y = d;
          return y._p = new Promise(function(w, j) {
            y.onload = w, y.onerror = j;
          }), He(d, "link", s), e.state.loading |= 4, wl(d, i.precedence, t), e.instance = d;
        case "script":
          return d = _r(i.src), (c = t.querySelector(
            Fo(d)
          )) ? (e.instance = c, pe(c), c) : (s = i, (c = Yn.get(d)) && (s = v({}, i), hd(s, c)), t = t.ownerDocument || t, c = t.createElement("script"), pe(c), He(c, "link", s), t.head.appendChild(c), e.instance = c);
        case "void":
          return null;
        default:
          throw Error(o(443, e.type));
      }
    else
      e.type === "stylesheet" && (e.state.loading & 4) === 0 && (s = e.instance, e.state.loading |= 4, wl(s, i.precedence, t));
    return e.instance;
  }
  function wl(t, e, i) {
    for (var s = i.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), c = s.length ? s[s.length - 1] : null, d = c, y = 0; y < s.length; y++) {
      var w = s[y];
      if (w.dataset.precedence === e) d = w;
      else if (d !== c) break;
    }
    d ? d.parentNode.insertBefore(t, d.nextSibling) : (e = i.nodeType === 9 ? i.head : i, e.insertBefore(t, e.firstChild));
  }
  function fd(t, e) {
    t.crossOrigin == null && (t.crossOrigin = e.crossOrigin), t.referrerPolicy == null && (t.referrerPolicy = e.referrerPolicy), t.title == null && (t.title = e.title);
  }
  function hd(t, e) {
    t.crossOrigin == null && (t.crossOrigin = e.crossOrigin), t.referrerPolicy == null && (t.referrerPolicy = e.referrerPolicy), t.integrity == null && (t.integrity = e.integrity);
  }
  var xl = null;
  function Bg(t, e, i) {
    if (xl === null) {
      var s = /* @__PURE__ */ new Map(), c = xl = /* @__PURE__ */ new Map();
      c.set(i, s);
    } else
      c = xl, s = c.get(i), s || (s = /* @__PURE__ */ new Map(), c.set(i, s));
    if (s.has(t)) return s;
    for (s.set(t, null), i = i.getElementsByTagName(t), c = 0; c < i.length; c++) {
      var d = i[c];
      if (!(d[Ha] || d[he] || t === "link" && d.getAttribute("rel") === "stylesheet") && d.namespaceURI !== "http://www.w3.org/2000/svg") {
        var y = d.getAttribute(e) || "";
        y = t + y;
        var w = s.get(y);
        w ? w.push(d) : s.set(y, [d]);
      }
    }
    return s;
  }
  function Vg(t, e, i) {
    t = t.ownerDocument || t, t.head.insertBefore(
      i,
      e === "title" ? t.querySelector("head > title") : null
    );
  }
  function Dx(t, e, i) {
    if (i === 1 || e.itemProp != null) return !1;
    switch (t) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (typeof e.precedence != "string" || typeof e.href != "string" || e.href === "")
          break;
        return !0;
      case "link":
        if (typeof e.rel != "string" || typeof e.href != "string" || e.href === "" || e.onLoad || e.onError)
          break;
        return e.rel === "stylesheet" ? (t = e.disabled, typeof e.precedence == "string" && t == null) : !0;
      case "script":
        if (e.async && typeof e.async != "function" && typeof e.async != "symbol" && !e.onLoad && !e.onError && e.src && typeof e.src == "string")
          return !0;
    }
    return !1;
  }
  function Hg(t) {
    return !(t.type === "stylesheet" && (t.state.loading & 3) === 0);
  }
  function Nx(t, e, i, s) {
    if (i.type === "stylesheet" && (typeof s.media != "string" || matchMedia(s.media).matches !== !1) && (i.state.loading & 4) === 0) {
      if (i.instance === null) {
        var c = Or(s.href), d = e.querySelector(
          qo(c)
        );
        if (d) {
          e = d._p, e !== null && typeof e == "object" && typeof e.then == "function" && (t.count++, t = Sl.bind(t), e.then(t, t)), i.state.loading |= 4, i.instance = d, pe(d);
          return;
        }
        d = e.ownerDocument || e, s = zg(s), (c = Yn.get(c)) && fd(s, c), d = d.createElement("link"), pe(d);
        var y = d;
        y._p = new Promise(function(w, j) {
          y.onload = w, y.onerror = j;
        }), He(d, "link", s), i.instance = d;
      }
      t.stylesheets === null && (t.stylesheets = /* @__PURE__ */ new Map()), t.stylesheets.set(i, e), (e = i.state.preload) && (i.state.loading & 3) === 0 && (t.count++, i = Sl.bind(t), e.addEventListener("load", i), e.addEventListener("error", i));
    }
  }
  var pd = 0;
  function Ox(t, e) {
    return t.stylesheets && t.count === 0 && Tl(t, t.stylesheets), 0 < t.count || 0 < t.imgCount ? function(i) {
      var s = setTimeout(function() {
        if (t.stylesheets && Tl(t, t.stylesheets), t.unsuspend) {
          var d = t.unsuspend;
          t.unsuspend = null, d();
        }
      }, 6e4 + e);
      0 < t.imgBytes && pd === 0 && (pd = 62500 * px());
      var c = setTimeout(
        function() {
          if (t.waitingForImages = !1, t.count === 0 && (t.stylesheets && Tl(t, t.stylesheets), t.unsuspend)) {
            var d = t.unsuspend;
            t.unsuspend = null, d();
          }
        },
        (t.imgBytes > pd ? 50 : 800) + e
      );
      return t.unsuspend = i, function() {
        t.unsuspend = null, clearTimeout(s), clearTimeout(c);
      };
    } : null;
  }
  function Sl() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) Tl(this, this.stylesheets);
      else if (this.unsuspend) {
        var t = this.unsuspend;
        this.unsuspend = null, t();
      }
    }
  }
  var kl = null;
  function Tl(t, e) {
    t.stylesheets = null, t.unsuspend !== null && (t.count++, kl = /* @__PURE__ */ new Map(), e.forEach(_x, t), kl = null, Sl.call(t));
  }
  function _x(t, e) {
    if (!(e.state.loading & 4)) {
      var i = kl.get(t);
      if (i) var s = i.get(null);
      else {
        i = /* @__PURE__ */ new Map(), kl.set(t, i);
        for (var c = t.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), d = 0; d < c.length; d++) {
          var y = c[d];
          (y.nodeName === "LINK" || y.getAttribute("media") !== "not all") && (i.set(y.dataset.precedence, y), s = y);
        }
        s && i.set(null, s);
      }
      c = e.instance, y = c.getAttribute("data-precedence"), d = i.get(y) || s, d === s && i.set(null, c), i.set(y, c), this.count++, s = Sl.bind(this), c.addEventListener("load", s), c.addEventListener("error", s), d ? d.parentNode.insertBefore(c, d.nextSibling) : (t = t.nodeType === 9 ? t.head : t, t.insertBefore(c, t.firstChild)), e.state.loading |= 4;
    }
  }
  var Go = {
    $$typeof: R,
    Provider: null,
    Consumer: null,
    _currentValue: et,
    _currentValue2: et,
    _threadCount: 0
  };
  function zx(t, e, i, s, c, d, y, w, j) {
    this.tag = 1, this.containerInfo = t, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Va(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Va(0), this.hiddenUpdates = Va(null), this.identifierPrefix = s, this.onUncaughtError = c, this.onCaughtError = d, this.onRecoverableError = y, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = j, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function Pg(t, e, i, s, c, d, y, w, j, V, q, I) {
    return t = new zx(
      t,
      e,
      i,
      y,
      j,
      V,
      q,
      I,
      w
    ), e = 1, d === !0 && (e |= 24), d = xn(3, null, null, e), t.current = d, d.stateNode = t, e = Ic(), e.refCount++, t.pooledCache = e, e.refCount++, d.memoizedState = {
      element: s,
      isDehydrated: i,
      cache: e
    }, Zc(d), t;
  }
  function Yg(t) {
    return t ? (t = fr, t) : fr;
  }
  function Kg(t, e, i, s, c, d) {
    c = Yg(c), s.context === null ? s.context = c : s.pendingContext = c, s = ti(e), s.payload = { element: i }, d = d === void 0 ? null : d, d !== null && (s.callback = d), i = ei(t, s, e), i !== null && (gn(i, t, e), To(i, t, e));
  }
  function qg(t, e) {
    if (t = t.memoizedState, t !== null && t.dehydrated !== null) {
      var i = t.retryLane;
      t.retryLane = i !== 0 && i < e ? i : e;
    }
  }
  function md(t, e) {
    qg(t, e), (t = t.alternate) && qg(t, e);
  }
  function Fg(t) {
    if (t.tag === 13 || t.tag === 31) {
      var e = Oi(t, 67108864);
      e !== null && gn(e, t, 67108864), md(t, 67108864);
    }
  }
  function Gg(t) {
    if (t.tag === 13 || t.tag === 31) {
      var e = Mn();
      e = eo(e);
      var i = Oi(t, e);
      i !== null && gn(i, t, e), md(t, e);
    }
  }
  var El = !0;
  function Ux(t, e, i, s) {
    var c = Y.T;
    Y.T = null;
    var d = J.p;
    try {
      J.p = 2, gd(t, e, i, s);
    } finally {
      J.p = d, Y.T = c;
    }
  }
  function Bx(t, e, i, s) {
    var c = Y.T;
    Y.T = null;
    var d = J.p;
    try {
      J.p = 8, gd(t, e, i, s);
    } finally {
      J.p = d, Y.T = c;
    }
  }
  function gd(t, e, i, s) {
    if (El) {
      var c = yd(s);
      if (c === null)
        nd(
          t,
          e,
          s,
          Ml,
          i
        ), Xg(t, s);
      else if (Hx(
        c,
        t,
        e,
        i,
        s
      ))
        s.stopPropagation();
      else if (Xg(t, s), e & 4 && -1 < Vx.indexOf(t)) {
        for (; c !== null; ) {
          var d = Ya(c);
          if (d !== null)
            switch (d.tag) {
              case 3:
                if (d = d.stateNode, d.current.memoizedState.isDehydrated) {
                  var y = yn(d.pendingLanes);
                  if (y !== 0) {
                    var w = d;
                    for (w.pendingLanes |= 2, w.entangledLanes |= 2; y; ) {
                      var j = 1 << 31 - je(y);
                      w.entanglements[1] |= j, y &= ~j;
                    }
                    ca(d), (Kt & 6) === 0 && (ll = De() + 500, Ho(0));
                  }
                }
                break;
              case 31:
              case 13:
                w = Oi(d, 2), w !== null && gn(w, d, 2), ul(), md(d, 2);
            }
          if (d = yd(s), d === null && nd(
            t,
            e,
            s,
            Ml,
            i
          ), d === c) break;
          c = d;
        }
        c !== null && s.stopPropagation();
      } else
        nd(
          t,
          e,
          s,
          null,
          i
        );
    }
  }
  function yd(t) {
    return t = ve(t), vd(t);
  }
  var Ml = null;
  function vd(t) {
    if (Ml = null, t = Pa(t), t !== null) {
      var e = u(t);
      if (e === null) t = null;
      else {
        var i = e.tag;
        if (i === 13) {
          if (t = f(e), t !== null) return t;
          t = null;
        } else if (i === 31) {
          if (t = h(e), t !== null) return t;
          t = null;
        } else if (i === 3) {
          if (e.stateNode.current.memoizedState.isDehydrated)
            return e.tag === 3 ? e.stateNode.containerInfo : null;
          t = null;
        } else e !== t && (t = null);
      }
    }
    return Ml = t, null;
  }
  function Ig(t) {
    switch (t) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (ya()) {
          case nt:
            return 2;
          case it:
            return 8;
          case Lt:
          case Rt:
            return 32;
          case ie:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var bd = !1, fi = null, hi = null, pi = null, Io = /* @__PURE__ */ new Map(), Xo = /* @__PURE__ */ new Map(), mi = [], Vx = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function Xg(t, e) {
    switch (t) {
      case "focusin":
      case "focusout":
        fi = null;
        break;
      case "dragenter":
      case "dragleave":
        hi = null;
        break;
      case "mouseover":
      case "mouseout":
        pi = null;
        break;
      case "pointerover":
      case "pointerout":
        Io.delete(e.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Xo.delete(e.pointerId);
    }
  }
  function Wo(t, e, i, s, c, d) {
    return t === null || t.nativeEvent !== d ? (t = {
      blockedOn: e,
      domEventName: i,
      eventSystemFlags: s,
      nativeEvent: d,
      targetContainers: [c]
    }, e !== null && (e = Ya(e), e !== null && Fg(e)), t) : (t.eventSystemFlags |= s, e = t.targetContainers, c !== null && e.indexOf(c) === -1 && e.push(c), t);
  }
  function Hx(t, e, i, s, c) {
    switch (e) {
      case "focusin":
        return fi = Wo(
          fi,
          t,
          e,
          i,
          s,
          c
        ), !0;
      case "dragenter":
        return hi = Wo(
          hi,
          t,
          e,
          i,
          s,
          c
        ), !0;
      case "mouseover":
        return pi = Wo(
          pi,
          t,
          e,
          i,
          s,
          c
        ), !0;
      case "pointerover":
        var d = c.pointerId;
        return Io.set(
          d,
          Wo(
            Io.get(d) || null,
            t,
            e,
            i,
            s,
            c
          )
        ), !0;
      case "gotpointercapture":
        return d = c.pointerId, Xo.set(
          d,
          Wo(
            Xo.get(d) || null,
            t,
            e,
            i,
            s,
            c
          )
        ), !0;
    }
    return !1;
  }
  function Wg(t) {
    var e = Pa(t.target);
    if (e !== null) {
      var i = u(e);
      if (i !== null) {
        if (e = i.tag, e === 13) {
          if (e = f(i), e !== null) {
            t.blockedOn = e, ao(t.priority, function() {
              Gg(i);
            });
            return;
          }
        } else if (e === 31) {
          if (e = h(i), e !== null) {
            t.blockedOn = e, ao(t.priority, function() {
              Gg(i);
            });
            return;
          }
        } else if (e === 3 && i.stateNode.current.memoizedState.isDehydrated) {
          t.blockedOn = i.tag === 3 ? i.stateNode.containerInfo : null;
          return;
        }
      }
    }
    t.blockedOn = null;
  }
  function Rl(t) {
    if (t.blockedOn !== null) return !1;
    for (var e = t.targetContainers; 0 < e.length; ) {
      var i = yd(t.nativeEvent);
      if (i === null) {
        i = t.nativeEvent;
        var s = new i.constructor(
          i.type,
          i
        );
        lo = s, i.target.dispatchEvent(s), lo = null;
      } else
        return e = Ya(i), e !== null && Fg(e), t.blockedOn = i, !1;
      e.shift();
    }
    return !0;
  }
  function Qg(t, e, i) {
    Rl(t) && i.delete(e);
  }
  function Px() {
    bd = !1, fi !== null && Rl(fi) && (fi = null), hi !== null && Rl(hi) && (hi = null), pi !== null && Rl(pi) && (pi = null), Io.forEach(Qg), Xo.forEach(Qg);
  }
  function Cl(t, e) {
    t.blockedOn === e && (t.blockedOn = null, bd || (bd = !0, a.unstable_scheduleCallback(
      a.unstable_NormalPriority,
      Px
    )));
  }
  var Al = null;
  function Zg(t) {
    Al !== t && (Al = t, a.unstable_scheduleCallback(
      a.unstable_NormalPriority,
      function() {
        Al === t && (Al = null);
        for (var e = 0; e < t.length; e += 3) {
          var i = t[e], s = t[e + 1], c = t[e + 2];
          if (typeof s != "function") {
            if (vd(s || i) === null)
              continue;
            break;
          }
          var d = Ya(i);
          d !== null && (t.splice(e, 3), e -= 3, yu(
            d,
            {
              pending: !0,
              data: c,
              method: i.method,
              action: s
            },
            s,
            c
          ));
        }
      }
    ));
  }
  function zr(t) {
    function e(j) {
      return Cl(j, t);
    }
    fi !== null && Cl(fi, t), hi !== null && Cl(hi, t), pi !== null && Cl(pi, t), Io.forEach(e), Xo.forEach(e);
    for (var i = 0; i < mi.length; i++) {
      var s = mi[i];
      s.blockedOn === t && (s.blockedOn = null);
    }
    for (; 0 < mi.length && (i = mi[0], i.blockedOn === null); )
      Wg(i), i.blockedOn === null && mi.shift();
    if (i = (t.ownerDocument || t).$$reactFormReplay, i != null)
      for (s = 0; s < i.length; s += 3) {
        var c = i[s], d = i[s + 1], y = c[Oe] || null;
        if (typeof d == "function")
          y || Zg(i);
        else if (y) {
          var w = null;
          if (d && d.hasAttribute("formAction")) {
            if (c = d, y = d[Oe] || null)
              w = y.formAction;
            else if (vd(c) !== null) continue;
          } else w = y.action;
          typeof w == "function" ? i[s + 1] = w : (i.splice(s, 3), s -= 3), Zg(i);
        }
      }
  }
  function Jg() {
    function t(d) {
      d.canIntercept && d.info === "react-transition" && d.intercept({
        handler: function() {
          return new Promise(function(y) {
            return c = y;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function e() {
      c !== null && (c(), c = null), s || setTimeout(i, 20);
    }
    function i() {
      if (!s && !navigation.transition) {
        var d = navigation.currentEntry;
        d && d.url != null && navigation.navigate(d.url, {
          state: d.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if (typeof navigation == "object") {
      var s = !1, c = null;
      return navigation.addEventListener("navigate", t), navigation.addEventListener("navigatesuccess", e), navigation.addEventListener("navigateerror", e), setTimeout(i, 100), function() {
        s = !0, navigation.removeEventListener("navigate", t), navigation.removeEventListener("navigatesuccess", e), navigation.removeEventListener("navigateerror", e), c !== null && (c(), c = null);
      };
    }
  }
  function wd(t) {
    this._internalRoot = t;
  }
  jl.prototype.render = wd.prototype.render = function(t) {
    var e = this._internalRoot;
    if (e === null) throw Error(o(409));
    var i = e.current, s = Mn();
    Kg(i, s, t, e, null, null);
  }, jl.prototype.unmount = wd.prototype.unmount = function() {
    var t = this._internalRoot;
    if (t !== null) {
      this._internalRoot = null;
      var e = t.containerInfo;
      Kg(t.current, 2, null, t, null, null), ul(), e[Ln] = null;
    }
  };
  function jl(t) {
    this._internalRoot = t;
  }
  jl.prototype.unstable_scheduleHydration = function(t) {
    if (t) {
      var e = jn();
      t = { blockedOn: null, target: t, priority: e };
      for (var i = 0; i < mi.length && e !== 0 && e < mi[i].priority; i++) ;
      mi.splice(i, 0, t), i === 0 && Wg(t);
    }
  };
  var $g = n.version;
  if ($g !== "19.2.7")
    throw Error(
      o(
        527,
        $g,
        "19.2.7"
      )
    );
  J.findDOMNode = function(t) {
    var e = t._reactInternals;
    if (e === void 0)
      throw typeof t.render == "function" ? Error(o(188)) : (t = Object.keys(t).join(","), Error(o(268, t)));
    return t = m(e), t = t !== null ? g(t) : null, t = t === null ? null : t.stateNode, t;
  };
  var Yx = {
    bundleType: 0,
    version: "19.2.7",
    rendererPackageName: "react-dom",
    currentDispatcherRef: Y,
    reconcilerVersion: "19.2.7"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Ll = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Ll.isDisabled && Ll.supportsFiber)
      try {
        le = Ll.inject(
          Yx
        ), Ee = Ll;
      } catch {
      }
  }
  return Zo.createRoot = function(t, e) {
    if (!l(t)) throw Error(o(299));
    var i = !1, s = "", c = om, d = sm, y = lm;
    return e != null && (e.unstable_strictMode === !0 && (i = !0), e.identifierPrefix !== void 0 && (s = e.identifierPrefix), e.onUncaughtError !== void 0 && (c = e.onUncaughtError), e.onCaughtError !== void 0 && (d = e.onCaughtError), e.onRecoverableError !== void 0 && (y = e.onRecoverableError)), e = Pg(
      t,
      1,
      !1,
      null,
      null,
      i,
      s,
      null,
      c,
      d,
      y,
      Jg
    ), t[Ln] = e.current, ed(t), new wd(e);
  }, Zo.hydrateRoot = function(t, e, i) {
    if (!l(t)) throw Error(o(299));
    var s = !1, c = "", d = om, y = sm, w = lm, j = null;
    return i != null && (i.unstable_strictMode === !0 && (s = !0), i.identifierPrefix !== void 0 && (c = i.identifierPrefix), i.onUncaughtError !== void 0 && (d = i.onUncaughtError), i.onCaughtError !== void 0 && (y = i.onCaughtError), i.onRecoverableError !== void 0 && (w = i.onRecoverableError), i.formState !== void 0 && (j = i.formState)), e = Pg(
      t,
      1,
      !0,
      e,
      i ?? null,
      s,
      c,
      j,
      d,
      y,
      w,
      Jg
    ), e.context = Yg(null), i = e.current, s = Mn(), s = eo(s), c = ti(s), c.callback = null, ei(i, c, s), i = s, e.current.lanes = i, Qn(e, i), ca(e), t[Ln] = e.current, ed(t), new jl(e);
  }, Zo.version = "19.2.7", Zo;
}
var c0;
function $x() {
  if (c0) return kd.exports;
  c0 = 1;
  function a() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a);
      } catch (n) {
        console.error(n);
      }
  }
  return a(), kd.exports = Jx(), kd.exports;
}
var t2 = $x();
var Vf = /^(?:[a-z][a-z0-9+.-]*:|[\\/]{2})/i, e2 = /^[\\/]{2}/;
function n2(a, n) {
  return n + a.replace(/\\/g, "/");
}
function u0(a) {
  return typeof a == "object" && a != null && "pathname" in a && "search" in a && "hash" in a && "state" in a && "key" in a;
}
function a2(a = {}) {
  let { initialEntries: n = ["/"], initialIndex: r, v5Compat: o = !1 } = a, l;
  l = n.map(
    (k, E) => g(
      k,
      typeof k == "string" ? null : k.state,
      E === 0 ? "default" : void 0,
      typeof k == "string" ? void 0 : k.mask
    )
  );
  let u = p(
    r ?? l.length - 1
  ), f = "POP", h = null;
  function p(k) {
    return Math.min(Math.max(k, 0), l.length - 1);
  }
  function m() {
    return l[u];
  }
  function g(k, E = null, A, C) {
    let M = r2(
      l ? m().pathname : "/",
      k,
      E,
      A,
      C
    );
    return Gn(
      M.pathname.charAt(0) === "/",
      `relative pathnames are not supported in memory history: ${JSON.stringify(
        k
      )}`
    ), M;
  }
  function v(k) {
    return typeof k == "string" ? k : ss(k);
  }
  return {
    get index() {
      return u;
    },
    get action() {
      return f;
    },
    get location() {
      return m();
    },
    createHref: v,
    createURL(k) {
      return new URL(v(k), "http://localhost");
    },
    encodeLocation(k) {
      let E = typeof k == "string" ? ar(k) : k;
      return {
        pathname: E.pathname || "",
        search: E.search || "",
        hash: E.hash || ""
      };
    },
    push(k, E) {
      f = "PUSH";
      let A = u0(k) ? k : g(k, E);
      u += 1, l.splice(u, l.length, A), o && h && h({ action: f, location: A, delta: 1 });
    },
    replace(k, E) {
      f = "REPLACE";
      let A = u0(k) ? k : g(k, E);
      l[u] = A, o && h && h({ action: f, location: A, delta: 0 });
    },
    go(k) {
      f = "POP";
      let E = p(u + k), A = l[E];
      u = E, h && h({ action: f, location: A, delta: k });
    },
    listen(k) {
      return h = k, () => {
        h = null;
      };
    }
  };
}
function fe(a, n) {
  if (a === !1 || a === null || typeof a > "u")
    throw new Error(n);
}
function Gn(a, n) {
  if (!a) {
    typeof console < "u" && console.warn(n);
    try {
      throw new Error(n);
    } catch {
    }
  }
}
function i2() {
  return Math.random().toString(36).substring(2, 10);
}
function r2(a, n, r = null, o, l) {
  return {
    pathname: typeof a == "string" ? a : a.pathname,
    search: "",
    hash: "",
    ...typeof n == "string" ? ar(n) : n,
    state: r,
    // TODO: This could be cleaned up.  push/replace should probably just take
    // full Locations now and avoid the need to run through this flow at all
    // But that's a pretty big refactor to the current test suite so going to
    // keep as is for the time being and just let any incoming keys take precedence
    key: n && n.key || o || i2(),
    mask: l
  };
}
function ss({
  pathname: a = "/",
  search: n = "",
  hash: r = ""
}) {
  return n && n !== "?" && (a += n.charAt(0) === "?" ? n : "?" + n), r && r !== "#" && (a += r.charAt(0) === "#" ? r : "#" + r), a;
}
function ar(a) {
  let n = {};
  if (a) {
    let r = a.indexOf("#");
    r >= 0 && (n.hash = a.substring(r), a = a.substring(0, r));
    let o = a.indexOf("?");
    o >= 0 && (n.search = a.substring(o), a = a.substring(0, o)), a && (n.pathname = a);
  }
  return n;
}
function uv(a, n, r = "/") {
  return o2(a, n, r, !1);
}
function o2(a, n, r, o, l) {
  let u = typeof n == "string" ? ar(n) : n, f = Ba(u.pathname || "/", r);
  if (f == null)
    return null;
  let h = s2(a), p = null, m = v2(f);
  for (let g = 0; p == null && g < h.length; ++g)
    p = y2(
      h[g],
      m,
      o
    );
  return p;
}
function s2(a) {
  let n = dv(a);
  return l2(n), n;
}
function dv(a, n = [], r = [], o = "", l = !1) {
  let u = (f, h, p = l, m) => {
    let g = {
      relativePath: m === void 0 ? f.path || "" : m,
      caseSensitive: f.caseSensitive === !0,
      childrenIndex: h,
      route: f
    };
    if (g.relativePath.startsWith("/")) {
      if (!g.relativePath.startsWith(o) && p)
        return;
      fe(
        g.relativePath.startsWith(o),
        `Absolute route path "${g.relativePath}" nested under path "${o}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`
      ), g.relativePath = g.relativePath.slice(o.length);
    }
    let v = na([o, g.relativePath]), b = r.concat(g);
    f.children && f.children.length > 0 && (fe(
      // Our types know better, but runtime JS may not!
      // @ts-expect-error
      f.index !== !0,
      `Index routes must not have child routes. Please remove all child routes from route path "${v}".`
    ), dv(
      f.children,
      n,
      b,
      v,
      p
    )), !(f.path == null && !f.index) && n.push({
      path: v,
      score: m2(v, f.index),
      routesMeta: b.map((k, E) => {
        let [A, C] = pv(
          k.relativePath,
          k.caseSensitive,
          E === b.length - 1
        );
        return {
          ...k,
          matcher: A,
          compiledParams: C
        };
      })
    });
  };
  return a.forEach((f, h) => {
    if (f.path === "" || !f.path?.includes("?"))
      u(f, h);
    else
      for (let p of fv(f.path))
        u(f, h, !0, p);
  }), n;
}
function fv(a) {
  let n = a.split("/");
  if (n.length === 0) return [];
  let [r, ...o] = n, l = r.endsWith("?"), u = r.replace(/\?$/, "");
  if (o.length === 0)
    return l ? [u, ""] : [u];
  let f = fv(o.join("/")), h = [];
  return h.push(
    ...f.map(
      (p) => p === "" ? u : [u, p].join("/")
    )
  ), l && h.push(...f), h.map(
    (p) => a.startsWith("/") && p === "" ? "/" : p
  );
}
function l2(a) {
  a.sort(
    (n, r) => n.score !== r.score ? r.score - n.score : g2(
      n.routesMeta.map((o) => o.childrenIndex),
      r.routesMeta.map((o) => o.childrenIndex)
    )
  );
}
var c2 = /^:[\w-]+$/, u2 = 3, d2 = 2, f2 = 1, h2 = 10, p2 = -2, d0 = (a) => a === "*";
function m2(a, n) {
  let r = a.split("/"), o = r.length;
  return r.some(d0) && (o += p2), n && (o += d2), r.filter((l) => !d0(l)).reduce(
    (l, u) => l + (c2.test(u) ? u2 : u === "" ? f2 : h2),
    o
  );
}
function g2(a, n) {
  return a.length === n.length && a.slice(0, -1).every((o, l) => o === n[l]) ? (
    // If two routes are siblings, we should try to match the earlier sibling
    // first. This allows people to have fine-grained control over the matching
    // behavior by simply putting routes with identical paths in the order they
    // want them tried.
    a[a.length - 1] - n[n.length - 1]
  ) : (
    // Otherwise, it doesn't really make sense to rank non-siblings by index,
    // so they sort equally.
    0
  );
}
function y2(a, n, r = !1) {
  let { routesMeta: o } = a, l = {}, u = "/", f = [];
  for (let h = 0; h < o.length; ++h) {
    let p = o[h], m = h === o.length - 1, g = u === "/" ? n : n.slice(u.length) || "/", v = {
      path: p.relativePath,
      caseSensitive: p.caseSensitive,
      end: m
    }, b = (
      // Use precomputed matcher if it exists
      p.matcher && p.compiledParams ? hv(
        v,
        g,
        p.matcher,
        p.compiledParams
      ) : ec(v, g)
    ), k = p.route;
    if (!b && m && r && !o[o.length - 1].route.index && (b = ec(
      {
        path: p.relativePath,
        caseSensitive: p.caseSensitive,
        end: !1
      },
      g
    )), !b)
      return null;
    Object.assign(l, b.params), f.push({
      // TODO: Can this as be avoided?
      params: l,
      pathname: na([u, b.pathname]),
      pathnameBase: x2(
        na([u, b.pathnameBase])
      ),
      route: k
    }), b.pathnameBase !== "/" && (u = na([u, b.pathnameBase]));
  }
  return f;
}
function ec(a, n) {
  typeof a == "string" && (a = { path: a, caseSensitive: !1, end: !0 });
  let [r, o] = pv(
    a.path,
    a.caseSensitive,
    a.end
  );
  return hv(a, n, r, o);
}
function hv(a, n, r, o) {
  let l = n.match(r);
  if (!l) return null;
  let u = l[0], f = Ir(u, 1), h = l.slice(1);
  return {
    params: o.reduce(
      (m, { paramName: g, isOptional: v }, b) => {
        if (g === "*") {
          let E = h[b] || "";
          f = Ir(
            u.slice(0, u.length - E.length),
            1
          );
        }
        const k = h[b];
        return v && !k ? m[g] = void 0 : m[g] = (k || "").replace(/%2F/g, "/"), m;
      },
      {}
    ),
    pathname: u,
    pathnameBase: f,
    pattern: a
  };
}
function pv(a, n = !1, r = !0) {
  Gn(
    a === "*" || !a.endsWith("*") || a.endsWith("/*"),
    `Route path "${a}" will be treated as if it were "${a.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${a.replace(/\*$/, "/*")}".`
  );
  let o = [], l = "^" + a.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(
    /\/:([\w-]+)(\?)?/g,
    (f, h, p, m, g) => {
      if (o.push({ paramName: h, isOptional: p != null }), p) {
        let v = g.charAt(m + f.length);
        return v && v !== "/" ? "/([^\\/]*)" : "(?:/([^\\/]*))?";
      }
      return "/([^\\/]+)";
    }
  ).replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
  return a.endsWith("*") ? (o.push({ paramName: "*" }), l += a === "*" || a === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$") : r ? l += "\\/*$" : a !== "" && a !== "/" && (l += "(?:(?=\\/|$))"), [new RegExp(l, n ? void 0 : "i"), o];
}
function v2(a) {
  try {
    return a.split("/").map((n) => decodeURIComponent(n).replace(/\//g, "%2F")).join("/");
  } catch (n) {
    return Gn(
      !1,
      `The URL path "${a}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${n}).`
    ), a;
  }
}
function Ba(a, n) {
  if (n === "/") return a;
  if (!a.toLowerCase().startsWith(n.toLowerCase()))
    return null;
  let r = n.endsWith("/") ? n.length - 1 : n.length, o = a.charAt(r);
  return o && o !== "/" ? null : a.slice(r) || "/";
}
function b2(a, n = "/") {
  let {
    pathname: r,
    search: o = "",
    hash: l = ""
  } = typeof a == "string" ? ar(a) : a, u;
  return r ? (r = gv(r), r.startsWith("/") || r.startsWith("\\") ? u = f0(r.substring(1), "/") : u = f0(r, n)) : u = n, {
    pathname: u,
    search: S2(o),
    hash: k2(l)
  };
}
function f0(a, n) {
  let r = Ir(n).split("/");
  return a.split("/").forEach((l) => {
    l === ".." ? r.length > 1 && r.pop() : l !== "." && r.push(l);
  }), r.length > 1 ? r.join("/") : "/";
}
function Rd(a, n, r, o) {
  return `Cannot include a '${a}' character in a manually specified \`to.${n}\` field [${JSON.stringify(
    o
  )}].  Please separate it out to the \`to.${r}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`;
}
function w2(a) {
  return a.filter(
    (n, r) => r === 0 || n.route.path && n.route.path.length > 0
  );
}
function mv(a) {
  let n = w2(a);
  return n.map(
    (r, o) => o === n.length - 1 ? r.pathname : r.pathnameBase
  );
}
function Hf(a, n, r, o = !1) {
  let l;
  typeof a == "string" ? l = ar(a) : (l = { ...a }, fe(
    !l.pathname || !l.pathname.includes("?"),
    Rd("?", "pathname", "search", l)
  ), fe(
    !l.pathname || !l.pathname.includes("#"),
    Rd("#", "pathname", "hash", l)
  ), fe(
    !l.search || !l.search.includes("#"),
    Rd("#", "search", "hash", l)
  ));
  let u = a === "" || l.pathname === "", f = u ? "/" : l.pathname, h;
  if (f == null)
    h = r;
  else {
    let v = n.length - 1;
    if (!o && f.startsWith("..")) {
      let b = f.split("/");
      for (; b[0] === ".."; )
        b.shift(), v -= 1;
      l.pathname = b.join("/");
    }
    h = v >= 0 ? n[v] : "/";
  }
  let p = b2(l, h), m = f && f !== "/" && f.endsWith("/"), g = (u || f === ".") && r.endsWith("/");
  return !p.pathname.endsWith("/") && (m || g) && (p.pathname += "/"), p;
}
var gv = (a) => a.replace(/[\\/]{2,}/g, "/"), na = (a) => gv(a.join("/"));
function Ir(a, n = 0) {
  let r = a.length;
  for (; r > n && a.charCodeAt(r - 1) === 47; )
    r--;
  return r === a.length ? a : a.slice(0, r);
}
var x2 = (a) => Ir(a).replace(/^\/*/, "/"), S2 = (a) => !a || a === "?" ? "" : a.startsWith("?") ? a : "?" + a, k2 = (a) => !a || a === "#" ? "" : a.startsWith("#") ? a : "#" + a, T2 = class {
  constructor(a, n, r, o = !1) {
    this.status = a, this.statusText = n || "", this.internal = o, r instanceof Error ? (this.data = r.toString(), this.error = r) : this.data = r;
  }
};
function E2(a) {
  return a != null && typeof a.status == "number" && typeof a.statusText == "string" && typeof a.internal == "boolean" && "data" in a;
}
function M2(a) {
  let n = a.map((r) => r.route.path).filter(Boolean);
  return na(n) || "/";
}
var yv = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u";
function vv(a, n) {
  let r = a;
  if (typeof r != "string" || !Vf.test(r))
    return {
      absoluteURL: void 0,
      isExternal: !1,
      to: r
    };
  let o = r, l = !1;
  if (yv)
    try {
      let u = new URL(window.location.href), f = e2.test(r) ? new URL(n2(r, u.protocol)) : new URL(r), h = Ba(f.pathname, n);
      f.origin === u.origin && h != null ? r = h + f.search + f.hash : l = !0;
    } catch {
      Gn(
        !1,
        `<Link to="${r}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`
      );
    }
  return {
    absoluteURL: o,
    isExternal: l,
    to: r
  };
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
var h0 = new URL("http://localhost");
function bv(a) {
  if (a.createURL)
    return a.createURL("/");
  try {
    return new URL(a.createHref("/"), h0);
  } catch {
    return h0;
  }
}
function Cd(a, n) {
  return a.origin === n.origin && (a.origin !== "null" || a.protocol === n.protocol && a.host === n.host);
}
function R2(a, n) {
  if (a.startsWith("//"))
    return !0;
  let r = n.protocol.toLowerCase();
  return a.toLowerCase().startsWith(r) ? n.host === "" || a.slice(r.length).startsWith("//") : !1;
}
function wv(a, n, r, o) {
  let l = null;
  try {
    l = a == null ? null : new URL(a, r);
  } catch {
  }
  let u = new URL(n, r), f = l != null && !Cd(l, r), h = !Cd(u, r);
  if (o === "reject") {
    if (f || h)
      throw new Error("External navigation is not allowed");
  } else if (h && (l == null || !R2(a, l) || !Cd(l, u)))
    throw new Error("External navigation is not allowed");
}
var xv = [
  "POST",
  "PUT",
  "PATCH",
  "DELETE"
];
new Set(
  xv
);
var C2 = [
  "GET",
  ...xv
];
new Set(C2);
var A2 = [
  "about:",
  "blob:",
  "chrome:",
  "chrome-untrusted:",
  "content:",
  "data:",
  "devtools:",
  "file:",
  "filesystem:",
  // eslint-disable-next-line no-script-url
  "javascript:"
];
function j2(a) {
  try {
    return A2.includes(new URL(a).protocol);
  } catch {
    return !1;
  }
}
var Qr = x.createContext(null);
Qr.displayName = "DataRouter";
var fc = x.createContext(null);
fc.displayName = "DataRouterState";
var Sv = x.createContext(!1);
function L2() {
  return x.useContext(Sv);
}
var kv = x.createContext({
  isTransitioning: !1
});
kv.displayName = "ViewTransition";
var D2 = x.createContext(
  /* @__PURE__ */ new Map()
);
D2.displayName = "Fetchers";
var N2 = x.createContext(null);
N2.displayName = "Await";
var In = x.createContext(
  null
);
In.displayName = "Navigation";
var hs = x.createContext(
  null
);
hs.displayName = "Location";
var ma = x.createContext({
  outlet: null,
  matches: [],
  isDataRoute: !1
});
ma.displayName = "Route";
var Pf = x.createContext(null);
Pf.displayName = "RouteError";
var Tv = "REACT_ROUTER_ERROR", O2 = "REDIRECT", _2 = "ROUTE_ERROR_RESPONSE";
function z2(a) {
  if (a.startsWith(`${Tv}:${O2}:{`))
    try {
      let n = JSON.parse(a.slice(28));
      if (typeof n == "object" && n && typeof n.status == "number" && typeof n.statusText == "string" && typeof n.location == "string" && typeof n.reloadDocument == "boolean" && typeof n.replace == "boolean")
        return n;
    } catch {
    }
}
function U2(a) {
  if (a.startsWith(
    `${Tv}:${_2}:{`
  ))
    try {
      let n = JSON.parse(a.slice(40));
      if (typeof n == "object" && n && typeof n.status == "number" && typeof n.statusText == "string")
        return new T2(
          n.status,
          n.statusText,
          n.data
        );
    } catch {
    }
}
function B2(a, { relative: n } = {}) {
  fe(
    ps(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useHref() may be used only in the context of a <Router> component."
  );
  let { basename: r, navigator: o } = x.useContext(In), { hash: l, pathname: u, search: f } = ms(a, { relative: n }), h = u;
  return r !== "/" && (h = u === "/" ? r : na([r, u])), o.createHref({ pathname: h, search: f, hash: l });
}
function ps() {
  return x.useContext(hs) != null;
}
function ga() {
  return fe(
    ps(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useLocation() may be used only in the context of a <Router> component."
  ), x.useContext(hs).location;
}
var Ev = "You should call navigate() in a React.useEffect(), not when your component is first rendered.";
function Mv(a) {
  x.useContext(In).static || x.useLayoutEffect(a);
}
function Yf() {
  let { isDataRoute: a } = x.useContext(ma);
  return a ? J2() : V2();
}
function V2() {
  fe(
    ps(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useNavigate() may be used only in the context of a <Router> component."
  );
  let a = x.useContext(Qr), { basename: n, navigator: r } = x.useContext(In), { matches: o } = x.useContext(ma), { pathname: l } = ga(), u = JSON.stringify(mv(o)), f = x.useRef(!1);
  return Mv(() => {
    f.current = !0;
  }), x.useCallback(
    (p, m = {}) => {
      if (Gn(f.current, Ev), !f.current) return;
      if (typeof p == "number") {
        r.go(p);
        return;
      }
      let g = Hf(
        p,
        JSON.parse(u),
        l,
        m.relative === "path"
      );
      a == null && n !== "/" && (g.pathname = g.pathname === "/" ? n : na([n, g.pathname])), wv(
        typeof p == "string" ? p : ss(p),
        r.createHref(g),
        bv(r),
        "reject"
      ), (m.replace ? r.replace : r.push)(
        g,
        m.state,
        m
      );
    },
    [
      n,
      r,
      u,
      l,
      a
    ]
  );
}
x.createContext(null);
function H2() {
  let { matches: a } = x.useContext(ma);
  return a[a.length - 1]?.params ?? {};
}
function ms(a, { relative: n } = {}) {
  let { matches: r } = x.useContext(ma), { pathname: o } = ga(), l = JSON.stringify(mv(r));
  return x.useMemo(
    () => Hf(
      a,
      JSON.parse(l),
      o,
      n === "path"
    ),
    [a, l, o, n]
  );
}
function P2(a, n) {
  return Rv(a, n);
}
function Rv(a, n, r) {
  fe(
    ps(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useRoutes() may be used only in the context of a <Router> component."
  );
  let { navigator: o } = x.useContext(In), { matches: l } = x.useContext(ma), u = l[l.length - 1], f = u ? u.params : {}, h = u ? u.pathname : "/", p = u ? u.pathnameBase : "/", m = u && u.route;
  {
    let C = m && m.path || "";
    Av(
      h,
      !m || C.endsWith("*") || C.endsWith("*?"),
      `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${h}" (under <Route path="${C}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${C}"> to <Route path="${C === "/" ? "*" : `${C}/*`}">.`
    );
  }
  let g = ga(), v;
  if (n) {
    let C = typeof n == "string" ? ar(n) : n;
    fe(
      p === "/" || C.pathname?.startsWith(p),
      `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${p}" but pathname "${C.pathname}" was given in the \`location\` prop.`
    ), v = C;
  } else
    v = g;
  let b = v.pathname || "/", k = b;
  if (p !== "/") {
    let C = p.replace(/^\//, "").split("/");
    k = "/" + b.replace(/^\//, "").split("/").slice(C.length).join("/");
  }
  let E = r && r.state.matches.length ? (
    // If we're in a data router, use the matches we've already identified but ensure
    // we have the latest route instances from the manifest in case elements have changed
    r.state.matches.map(
      (C) => Object.assign(C, {
        route: r.manifest[C.route.id] || C.route
      })
    )
  ) : uv(a, { pathname: k });
  Gn(
    m || E != null,
    `No routes matched location "${v.pathname}${v.search}${v.hash}" `
  ), Gn(
    E == null || E[E.length - 1].route.element !== void 0 || E[E.length - 1].route.Component !== void 0 || E[E.length - 1].route.lazy !== void 0,
    `Matched leaf route at location "${v.pathname}${v.search}${v.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`
  );
  let A = G2(
    E && E.map(
      (C) => Object.assign({}, C, {
        params: Object.assign({}, f, C.params),
        pathname: na([
          p,
          // Re-encode pathnames that were decoded inside matchRoutes.
          // Pre-encode `%`, `?` and `#` ahead of `encodeLocation` because it uses
          // `new URL()` internally and we need to prevent it from treating
          // them as separators
          o.encodeLocation ? o.encodeLocation(
            C.pathname.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")
          ).pathname : C.pathname
        ]),
        pathnameBase: C.pathnameBase === "/" ? p : na([
          p,
          // Re-encode pathnames that were decoded inside matchRoutes
          // Pre-encode `%`, `?` and `#` ahead of `encodeLocation` because it uses
          // `new URL()` internally and we need to prevent it from treating
          // them as separators
          o.encodeLocation ? o.encodeLocation(
            C.pathnameBase.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")
          ).pathname : C.pathnameBase
        ])
      })
    ),
    l,
    r
  );
  return n && A ? /* @__PURE__ */ x.createElement(
    hs.Provider,
    {
      value: {
        location: {
          pathname: "/",
          search: "",
          hash: "",
          state: null,
          key: "default",
          mask: void 0,
          ...v
        },
        navigationType: "POP"
        /* Pop */
      }
    },
    A
  ) : A;
}
function Y2() {
  let a = Z2(), n = E2(a) ? `${a.status} ${a.statusText}` : a instanceof Error ? a.message : JSON.stringify(a), r = a instanceof Error ? a.stack : null, o = "rgba(200,200,200, 0.5)", l = { padding: "0.5rem", backgroundColor: o }, u = { padding: "2px 4px", backgroundColor: o }, f = null;
  return console.error(
    "Error handled by React Router default ErrorBoundary:",
    a
  ), f = /* @__PURE__ */ x.createElement(x.Fragment, null, /* @__PURE__ */ x.createElement("p", null, "💿 Hey developer 👋"), /* @__PURE__ */ x.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", /* @__PURE__ */ x.createElement("code", { style: u }, "ErrorBoundary"), " or", " ", /* @__PURE__ */ x.createElement("code", { style: u }, "errorElement"), " prop on your route.")), /* @__PURE__ */ x.createElement(x.Fragment, null, /* @__PURE__ */ x.createElement("h2", null, "Unexpected Application Error!"), /* @__PURE__ */ x.createElement("h3", { style: { fontStyle: "italic" } }, n), r ? /* @__PURE__ */ x.createElement("pre", { style: l }, r) : null, f);
}
var K2 = /* @__PURE__ */ x.createElement(Y2, null), Cv = class extends x.Component {
  constructor(a) {
    super(a), this.state = {
      location: a.location,
      revalidation: a.revalidation,
      error: a.error
    };
  }
  static getDerivedStateFromError(a) {
    return { error: a };
  }
  static getDerivedStateFromProps(a, n) {
    return n.location !== a.location || n.revalidation !== "idle" && a.revalidation === "idle" ? {
      error: a.error,
      location: a.location,
      revalidation: a.revalidation
    } : {
      error: a.error !== void 0 ? a.error : n.error,
      location: n.location,
      revalidation: a.revalidation || n.revalidation
    };
  }
  componentDidCatch(a, n) {
    this.props.onError ? this.props.onError(a, n) : console.error(
      "React Router caught the following error during render",
      a
    );
  }
  render() {
    let a = this.state.error;
    if (this.context && typeof a == "object" && a && "digest" in a && typeof a.digest == "string") {
      const r = U2(a.digest);
      r && (a = r);
    }
    let n = a !== void 0 ? /* @__PURE__ */ x.createElement(ma.Provider, { value: this.props.routeContext }, /* @__PURE__ */ x.createElement(
      Pf.Provider,
      {
        value: a,
        children: this.props.component
      }
    )) : this.props.children;
    return this.context ? /* @__PURE__ */ x.createElement(q2, { error: a }, n) : n;
  }
};
Cv.contextType = Sv;
var Ad = /* @__PURE__ */ new WeakMap();
function q2({
  children: a,
  error: n
}) {
  let { basename: r, navigator: o } = x.useContext(In);
  if (typeof n == "object" && n && "digest" in n && typeof n.digest == "string") {
    let l = z2(n.digest);
    if (l) {
      let u = Ad.get(n);
      if (u) throw u;
      let f = vv(l.location, r), h = f.absoluteURL || f.to;
      if (wv(
        l.location,
        h,
        bv(o),
        "allow-explicit"
      ), j2(h))
        throw new Error("Invalid redirect location");
      if (yv && !Ad.get(n))
        if (f.isExternal || l.reloadDocument)
          window.location.href = h;
        else {
          const p = Promise.resolve().then(
            () => window.__reactRouterDataRouter.navigate(f.to, {
              replace: l.replace
            })
          );
          throw Ad.set(n, p), p;
        }
      return /* @__PURE__ */ x.createElement("meta", { httpEquiv: "refresh", content: `0;url=${h}` });
    }
  }
  return a;
}
function F2({ routeContext: a, match: n, children: r }) {
  let o = x.useContext(Qr);
  return o && o.static && o.staticContext && (n.route.errorElement || n.route.ErrorBoundary) && (o.staticContext._deepestRenderedBoundaryId = n.route.id), /* @__PURE__ */ x.createElement(ma.Provider, { value: a }, r);
}
function G2(a, n = [], r) {
  let o = r?.state;
  if (a == null) {
    if (!o)
      return null;
    if (o.errors)
      a = o.matches;
    else if (n.length === 0 && !o.initialized && o.matches.length > 0)
      a = o.matches;
    else
      return null;
  }
  let l = a, u = o?.errors;
  if (u != null) {
    let g = l.findIndex(
      (v) => v.route.id && u?.[v.route.id] !== void 0
    );
    fe(
      g >= 0,
      `Could not find a matching route for errors on route IDs: ${Object.keys(
        u
      ).join(",")}`
    ), l = l.slice(
      0,
      Math.min(l.length, g + 1)
    );
  }
  let f = !1, h = -1;
  if (r && o) {
    f = o.renderFallback;
    for (let g = 0; g < l.length; g++) {
      let v = l[g];
      if ((v.route.HydrateFallback || v.route.hydrateFallbackElement) && (h = g), v.route.id) {
        let { loaderData: b, errors: k } = o, E = v.route.loader && !b.hasOwnProperty(v.route.id) && (!k || k[v.route.id] === void 0);
        if (v.route.lazy || E) {
          r.isStatic && (f = !0), h >= 0 ? l = l.slice(0, h + 1) : l = [l[0]];
          break;
        }
      }
    }
  }
  let p = r?.onError, m = o && p ? (g, v) => {
    p(g, {
      location: o.location,
      params: o.matches?.[0]?.params ?? {},
      pattern: M2(o.matches),
      errorInfo: v
    });
  } : void 0;
  return l.reduceRight(
    (g, v, b) => {
      let k, E = !1, A = null, C = null;
      o && (k = u && v.route.id ? u[v.route.id] : void 0, A = v.route.errorElement || K2, f && (h < 0 && b === 0 ? (Av(
        "route-fallback",
        !1,
        "No `HydrateFallback` element provided to render during initial hydration"
      ), E = !0, C = null) : h === b && (E = !0, C = v.route.hydrateFallbackElement || null)));
      let M = n.concat(l.slice(0, b + 1)), D = () => {
        let R;
        return k ? R = A : E ? R = C : v.route.Component ? R = /* @__PURE__ */ x.createElement(v.route.Component, null) : v.route.element ? R = v.route.element : R = g, /* @__PURE__ */ x.createElement(
          F2,
          {
            match: v,
            routeContext: {
              outlet: g,
              matches: M,
              isDataRoute: o != null
            },
            children: R
          }
        );
      };
      return o && (v.route.ErrorBoundary || v.route.errorElement || b === 0) ? /* @__PURE__ */ x.createElement(
        Cv,
        {
          location: o.location,
          revalidation: o.revalidation,
          component: A,
          error: k,
          children: D(),
          routeContext: { outlet: null, matches: M, isDataRoute: !0 },
          onError: m
        }
      ) : D();
    },
    null
  );
}
function Kf(a) {
  return `${a} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function I2(a) {
  let n = x.useContext(Qr);
  return fe(n, Kf(a)), n;
}
function X2(a) {
  let n = x.useContext(fc);
  return fe(n, Kf(a)), n;
}
function W2(a) {
  let n = x.useContext(ma);
  return fe(n, Kf(a)), n;
}
function qf(a) {
  let n = W2(a), r = n.matches[n.matches.length - 1];
  return fe(
    r.route.id,
    `${a} can only be used on routes that contain a unique "id"`
  ), r.route.id;
}
function Q2() {
  return qf(
    "useRouteId"
    /* UseRouteId */
  );
}
function Z2() {
  let a = x.useContext(Pf), n = X2(
    "useRouteError"
    /* UseRouteError */
  ), r = qf(
    "useRouteError"
    /* UseRouteError */
  );
  return a !== void 0 ? a : n.errors?.[r];
}
function J2() {
  let { router: a } = I2(
    "useNavigate"
    /* UseNavigateStable */
  ), n = qf(
    "useNavigate"
    /* UseNavigateStable */
  ), r = x.useRef(!1);
  return Mv(() => {
    r.current = !0;
  }), x.useCallback(
    async (l, u = {}) => {
      Gn(r.current, Ev), r.current && (typeof l == "number" ? await a.navigate(l) : await a.navigate(l, { fromRouteId: n, ...u }));
    },
    [a, n]
  );
}
var p0 = {};
function Av(a, n, r) {
  !n && !p0[a] && (p0[a] = !0, Gn(!1, r));
}
x.memo($2);
function $2({
  routes: a,
  manifest: n,
  future: r,
  state: o,
  isStatic: l,
  onError: u
}) {
  return Rv(a, void 0, {
    manifest: n,
    state: o,
    isStatic: l,
    onError: u
  });
}
function t5({
  basename: a,
  children: n,
  initialEntries: r,
  initialIndex: o,
  useTransitions: l
}) {
  let u = x.useRef();
  u.current == null && (u.current = a2({
    initialEntries: r,
    initialIndex: o,
    v5Compat: !0
  }));
  let f = u.current, [h, p] = x.useState({
    action: f.action,
    location: f.location
  }), m = x.useCallback(
    (g) => {
      l === !1 ? p(g) : x.startTransition(() => p(g));
    },
    [l]
  );
  return x.useLayoutEffect(() => f.listen(m), [f, m]), /* @__PURE__ */ x.createElement(
    e5,
    {
      basename: a,
      children: n,
      location: h.location,
      navigationType: h.action,
      navigator: f,
      useTransitions: l
    }
  );
}
function tf(a) {
  fe(
    !1,
    "A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>."
  );
}
function e5({
  basename: a = "/",
  children: n = null,
  location: r,
  navigationType: o = "POP",
  navigator: l,
  static: u = !1,
  useTransitions: f
}) {
  fe(
    !ps(),
    "You cannot render a <Router> inside another <Router>. You should never have more than one in your app."
  );
  let h = a.replace(/^\/*/, "/"), p = x.useMemo(
    () => ({
      basename: h,
      navigator: l,
      static: u,
      useTransitions: f,
      future: {}
    }),
    [h, l, u, f]
  );
  typeof r == "string" && (r = ar(r));
  let {
    pathname: m = "/",
    search: g = "",
    hash: v = "",
    state: b = null,
    key: k = "default",
    mask: E
  } = r, A = x.useMemo(() => {
    let C = Ba(m, h);
    return C == null ? null : {
      location: {
        pathname: C,
        search: g,
        hash: v,
        state: b,
        key: k,
        mask: E
      },
      navigationType: o
    };
  }, [h, m, g, v, b, k, o, E]);
  return Gn(
    A != null,
    `<Router basename="${h}"> is not able to match the URL "${m}${g}${v}" because it does not start with the basename, so the <Router> won't render anything.`
  ), A == null ? null : /* @__PURE__ */ x.createElement(In.Provider, { value: p }, /* @__PURE__ */ x.createElement(hs.Provider, { children: n, value: A }));
}
function n5({
  children: a,
  location: n
}) {
  return P2(ef(a), n);
}
function ef(a, n = []) {
  let r = [];
  return x.Children.forEach(a, (o, l) => {
    if (!x.isValidElement(o))
      return;
    let u = [...n, l];
    if (o.type === x.Fragment) {
      r.push.apply(
        r,
        ef(o.props.children, u)
      );
      return;
    }
    fe(
      o.type === tf,
      `[${typeof o.type == "string" ? o.type : o.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`
    ), fe(
      !o.props.index || !o.props.children,
      "An index route cannot have child routes."
    );
    let f = {
      id: o.props.id || u.join("-"),
      caseSensitive: o.props.caseSensitive,
      element: o.props.element,
      Component: o.props.Component,
      index: o.props.index,
      path: o.props.path,
      middleware: o.props.middleware,
      loader: o.props.loader,
      action: o.props.action,
      hydrateFallbackElement: o.props.hydrateFallbackElement,
      HydrateFallback: o.props.HydrateFallback,
      errorElement: o.props.errorElement,
      ErrorBoundary: o.props.ErrorBoundary,
      hasErrorBoundary: o.props.hasErrorBoundary === !0 || o.props.ErrorBoundary != null || o.props.errorElement != null,
      shouldRevalidate: o.props.shouldRevalidate,
      handle: o.props.handle,
      lazy: o.props.lazy
    };
    o.props.children && (f.children = ef(
      o.props.children,
      u
    )), r.push(f);
  }), r;
}
var Yl = "get", Kl = "application/x-www-form-urlencoded";
function hc(a) {
  return typeof HTMLElement < "u" && a instanceof HTMLElement;
}
function a5(a) {
  return hc(a) && a.tagName.toLowerCase() === "button";
}
function i5(a) {
  return hc(a) && a.tagName.toLowerCase() === "form";
}
function r5(a) {
  return hc(a) && a.tagName.toLowerCase() === "input";
}
function o5(a) {
  return !!(a.metaKey || a.altKey || a.ctrlKey || a.shiftKey);
}
function s5(a, n) {
  return a.button === 0 && // Ignore everything but left clicks
  (!n || n === "_self") && // Let browser handle "target=_blank" etc.
  !o5(a);
}
function nf(a = "") {
  return new URLSearchParams(
    typeof a == "string" || Array.isArray(a) || a instanceof URLSearchParams ? a : Object.keys(a).reduce((n, r) => {
      let o = a[r];
      return n.concat(
        Array.isArray(o) ? o.map((l) => [r, l]) : [[r, o]]
      );
    }, [])
  );
}
function l5(a, n) {
  let r = nf(a);
  return n && n.forEach((o, l) => {
    r.has(l) || n.getAll(l).forEach((u) => {
      r.append(l, u);
    });
  }), r;
}
var Dl = null;
function c5() {
  if (Dl === null)
    try {
      new FormData(
        document.createElement("form"),
        // @ts-expect-error if FormData supports the submitter parameter, this will throw
        0
      ), Dl = !1;
    } catch {
      Dl = !0;
    }
  return Dl;
}
var u5 = /* @__PURE__ */ new Set([
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
]);
function jd(a) {
  return a != null && !u5.has(a) ? (Gn(
    !1,
    `"${a}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${Kl}"`
  ), null) : a;
}
function d5(a, n) {
  let r, o, l, u, f;
  if (i5(a)) {
    let h = a.getAttribute("action");
    o = h ? Ba(h, n) : null, r = a.getAttribute("method") || Yl, l = jd(a.getAttribute("enctype")) || Kl, u = new FormData(a);
  } else if (a5(a) || r5(a) && (a.type === "submit" || a.type === "image")) {
    let h = a.form;
    if (h == null)
      throw new Error(
        'Cannot submit a <button> or <input type="submit"> without a <form>'
      );
    let p = a.getAttribute("formaction") || h.getAttribute("action");
    if (o = p ? Ba(p, n) : null, r = a.getAttribute("formmethod") || h.getAttribute("method") || Yl, l = jd(a.getAttribute("formenctype")) || jd(h.getAttribute("enctype")) || Kl, u = new FormData(h, a), !c5()) {
      let { name: m, type: g, value: v } = a;
      if (g === "image") {
        let b = m ? `${m}.` : "";
        u.append(`${b}x`, "0"), u.append(`${b}y`, "0");
      } else m && u.append(m, v);
    }
  } else {
    if (hc(a))
      throw new Error(
        'Cannot submit element that is not <form>, <button>, or <input type="submit|image">'
      );
    r = Yl, o = null, l = Kl, f = a;
  }
  return u && l === "text/plain" && (f = u, u = void 0), { action: o, method: r.toLowerCase(), encType: l, formData: u, body: f };
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function Ff(a, n) {
  if (a === !1 || a === null || typeof a > "u")
    throw new Error(n);
}
function jv(a, n, r, o) {
  let l = typeof a == "string" ? new URL(
    a,
    // This can be called during the SSR flow via PrefetchPageLinksImpl so
    // don't assume window is available
    typeof window > "u" ? "server://singlefetch/" : window.location.origin
  ) : a;
  return r ? l.pathname.endsWith("/") ? l.pathname = `${l.pathname}_.${o}` : l.pathname = `${l.pathname}.${o}` : l.pathname === "/" ? l.pathname = `_root.${o}` : n && Ba(l.pathname, n) === "/" ? l.pathname = `${Ir(n)}/_root.${o}` : l.pathname = `${Ir(l.pathname)}.${o}`, l;
}
async function f5(a, n) {
  if (a.id in n)
    return n[a.id];
  try {
    let r = await import(
      /* @vite-ignore */
      /* webpackIgnore: true */
      a.module
    );
    return n[a.id] = r, r;
  } catch (r) {
    return console.error(
      `Error loading route module \`${a.module}\`, reloading page...`
    ), console.error(r), window.__reactRouterContext && window.__reactRouterContext.isSpaMode, window.location.reload(), new Promise(() => {
    });
  }
}
function h5(a) {
  return a == null ? !1 : a.href == null ? a.rel === "preload" && typeof a.imageSrcSet == "string" && typeof a.imageSizes == "string" : typeof a.rel == "string" && typeof a.href == "string";
}
async function p5(a, n, r) {
  let o = await Promise.all(
    a.map(async (l) => {
      let u = n.routes[l.route.id];
      if (u) {
        let f = await f5(u, r);
        return f.links ? f.links() : [];
      }
      return [];
    })
  );
  return v5(
    o.flat(1).filter(h5).filter((l) => l.rel === "stylesheet" || l.rel === "preload").map(
      (l) => l.rel === "stylesheet" ? { ...l, rel: "prefetch", as: "style" } : { ...l, rel: "prefetch" }
    )
  );
}
function m0(a, n, r, o, l, u) {
  let f = (p, m) => r[m] ? p.route.id !== r[m].route.id : !0, h = (p, m) => (
    // param change, /users/123 -> /users/456
    r[m].pathname !== p.pathname || // splat param changed, which is not present in match.path
    // e.g. /files/images/avatar.jpg -> files/finances.xls
    r[m].route.path?.endsWith("*") && r[m].params["*"] !== p.params["*"]
  );
  return u === "assets" ? n.filter(
    (p, m) => f(p, m) || h(p, m)
  ) : u === "data" ? n.filter((p, m) => {
    let g = o.routes[p.route.id];
    if (!g || !g.hasLoader)
      return !1;
    if (f(p, m) || h(p, m))
      return !0;
    if (p.route.shouldRevalidate) {
      let v = p.route.shouldRevalidate({
        currentUrl: new URL(
          l.pathname + l.search + l.hash,
          window.origin
        ),
        currentParams: r[0]?.params || {},
        nextUrl: new URL(a, window.origin),
        nextParams: p.params,
        defaultShouldRevalidate: !0
      });
      if (typeof v == "boolean")
        return v;
    }
    return !0;
  }) : [];
}
function m5(a, n, { includeHydrateFallback: r } = {}) {
  return g5(
    a.map((o) => {
      let l = n.routes[o.route.id];
      if (!l) return [];
      let u = [l.module];
      return l.clientActionModule && (u = u.concat(l.clientActionModule)), l.clientLoaderModule && (u = u.concat(l.clientLoaderModule)), r && l.hydrateFallbackModule && (u = u.concat(l.hydrateFallbackModule)), l.imports && (u = u.concat(l.imports)), u;
    }).flat(1)
  );
}
function g5(a) {
  return [...new Set(a)];
}
function y5(a) {
  let n = {}, r = Object.keys(a).sort();
  for (let o of r)
    n[o] = a[o];
  return n;
}
function v5(a, n) {
  let r = /* @__PURE__ */ new Set();
  return new Set(n), a.reduce((o, l) => {
    let u = JSON.stringify(y5(l));
    return r.has(u) || (r.add(u), o.push({ key: u, link: l })), o;
  }, []);
}
function Gf() {
  let a = x.useContext(Qr);
  return Ff(
    a,
    "You must render this element inside a <DataRouterContext.Provider> element"
  ), a;
}
function b5() {
  let a = x.useContext(fc);
  return Ff(
    a,
    "You must render this element inside a <DataRouterStateContext.Provider> element"
  ), a;
}
var If = x.createContext(void 0);
If.displayName = "FrameworkContext";
function pc() {
  let a = x.useContext(If);
  return Ff(
    a,
    "You must render this element inside a <HydratedRouter> element"
  ), a;
}
function w5(a, n) {
  let r = x.useContext(If), [o, l] = x.useState(!1), [u, f] = x.useState(!1), { onFocus: h, onBlur: p, onMouseEnter: m, onMouseLeave: g, onTouchStart: v } = n, b = x.useRef(null);
  x.useEffect(() => {
    if (a === "render" && f(!0), a === "viewport") {
      let A = (M) => {
        M.forEach((D) => {
          f(D.isIntersecting);
        });
      }, C = new IntersectionObserver(A, { threshold: 0.5 });
      return b.current && C.observe(b.current), () => {
        C.disconnect();
      };
    }
  }, [a]), x.useEffect(() => {
    if (o) {
      let A = setTimeout(() => {
        f(!0);
      }, 100);
      return () => {
        clearTimeout(A);
      };
    }
  }, [o]);
  let k = () => {
    l(!0);
  }, E = () => {
    l(!1), f(!1);
  };
  return r ? a !== "intent" ? [u, b, {}] : [
    u,
    b,
    {
      onFocus: Jo(h, k),
      onBlur: Jo(p, E),
      onMouseEnter: Jo(m, k),
      onMouseLeave: Jo(g, E),
      onTouchStart: Jo(v, k)
    }
  ] : [!1, b, {}];
}
function Jo(a, n) {
  return (r) => {
    a && a(r), r.defaultPrevented || n(r);
  };
}
function x5({ page: a, ...n }) {
  let r = L2(), { nonce: o } = pc(), { router: l } = Gf(), u = x.useMemo(
    () => uv(l.routes, a, l.basename),
    [l.routes, a, l.basename]
  );
  return u ? (n.nonce == null && o && (n = { ...n, nonce: o }), r ? /* @__PURE__ */ x.createElement(k5, { page: a, matches: u, ...n }) : /* @__PURE__ */ x.createElement(T5, { page: a, matches: u, ...n })) : null;
}
function S5(a) {
  let { manifest: n, routeModules: r } = pc(), [o, l] = x.useState([]);
  return x.useEffect(() => {
    let u = !1;
    return p5(a, n, r).then(
      (f) => {
        u || l(f);
      }
    ), () => {
      u = !0;
    };
  }, [a, n, r]), o;
}
function k5({
  page: a,
  matches: n,
  ...r
}) {
  let o = ga(), { future: l } = pc(), { basename: u } = Gf(), f = x.useMemo(() => {
    if (a === o.pathname + o.search + o.hash)
      return [];
    let h = jv(
      a,
      u,
      l.v8_trailingSlashAwareDataRequests,
      "rsc"
    ), p = !1, m = [];
    for (let g of n)
      typeof g.route.shouldRevalidate == "function" ? p = !0 : m.push(g.route.id);
    return p && m.length > 0 && h.searchParams.set("_routes", m.join(",")), [h.pathname + h.search];
  }, [
    u,
    l.v8_trailingSlashAwareDataRequests,
    a,
    o,
    n
  ]);
  return /* @__PURE__ */ x.createElement(x.Fragment, null, f.map((h) => /* @__PURE__ */ x.createElement("link", { key: h, rel: "prefetch", as: "fetch", href: h, ...r })));
}
function T5({
  page: a,
  matches: n,
  ...r
}) {
  let o = ga(), { future: l, manifest: u, routeModules: f } = pc(), { basename: h } = Gf(), { loaderData: p, matches: m } = b5(), g = x.useMemo(
    () => m0(
      a,
      n,
      m,
      u,
      o,
      "data"
    ),
    [a, n, m, u, o]
  ), v = x.useMemo(
    () => m0(
      a,
      n,
      m,
      u,
      o,
      "assets"
    ),
    [a, n, m, u, o]
  ), b = x.useMemo(() => {
    if (a === o.pathname + o.search + o.hash)
      return [];
    let A = /* @__PURE__ */ new Set(), C = !1;
    if (n.forEach((D) => {
      let R = u.routes[D.route.id];
      !R || !R.hasLoader || (!g.some((z) => z.route.id === D.route.id) && D.route.id in p && f[D.route.id]?.shouldRevalidate || R.hasClientLoader ? C = !0 : A.add(D.route.id));
    }), A.size === 0)
      return [];
    let M = jv(
      a,
      h,
      l.v8_trailingSlashAwareDataRequests,
      "data"
    );
    return C && A.size > 0 && M.searchParams.set(
      "_routes",
      n.filter((D) => A.has(D.route.id)).map((D) => D.route.id).join(",")
    ), [M.pathname + M.search];
  }, [
    h,
    l.v8_trailingSlashAwareDataRequests,
    p,
    o,
    u,
    g,
    n,
    a,
    f
  ]), k = x.useMemo(
    () => m5(v, u),
    [v, u]
  ), E = S5(v);
  return /* @__PURE__ */ x.createElement(x.Fragment, null, b.map((A) => /* @__PURE__ */ x.createElement("link", { key: A, rel: "prefetch", as: "fetch", href: A, ...r })), k.map((A) => /* @__PURE__ */ x.createElement("link", { key: A, rel: "modulepreload", href: A, ...r })), E.map(({ key: A, link: C }) => (
    // these don't spread `linkProps` because they are full link descriptors
    // already with their own props
    /* @__PURE__ */ x.createElement(
      "link",
      {
        key: A,
        nonce: r.nonce,
        ...C,
        crossOrigin: C.crossOrigin ?? r.crossOrigin
      }
    )
  )));
}
function E5(...a) {
  return (n) => {
    a.forEach((r) => {
      typeof r == "function" ? r(n) : r != null && (r.current = n);
    });
  };
}
var M5 = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u";
try {
  M5 && (window.__reactRouterVersion = // @ts-expect-error
  "7.18.3");
} catch {
}
var Lv = x.forwardRef(
  function({
    onClick: n,
    discover: r = "render",
    prefetch: o = "none",
    relative: l,
    reloadDocument: u,
    replace: f,
    mask: h,
    state: p,
    target: m,
    to: g,
    preventScrollReset: v,
    viewTransition: b,
    defaultShouldRevalidate: k,
    ...E
  }, A) {
    let { basename: C, navigator: M, useTransitions: D } = x.useContext(In), R = typeof g == "string" && Vf.test(g), z = vv(g, C);
    g = z.to;
    let Z = B2(g, { relative: l }), W = ga(), X = null;
    if (h) {
      let bt = Hf(
        h,
        [],
        W.mask ? W.mask.pathname : "/",
        !0
      );
      C !== "/" && (bt.pathname = bt.pathname === "/" ? C : na([C, bt.pathname])), X = M.createHref(bt);
    }
    let [F, at, rt] = w5(
      o,
      E
    ), pt = j5(g, {
      replace: f,
      mask: h,
      state: p,
      target: m,
      preventScrollReset: v,
      relative: l,
      viewTransition: b,
      defaultShouldRevalidate: k,
      useTransitions: D
    });
    function yt(bt) {
      n && n(bt), bt.defaultPrevented || pt(bt);
    }
    let vt = !(z.isExternal || u), Tt = (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      /* @__PURE__ */ x.createElement(
        "a",
        {
          ...E,
          ...rt,
          href: (vt ? X : void 0) || z.absoluteURL || Z,
          onClick: vt ? yt : n,
          ref: E5(A, at),
          target: m,
          "data-discover": !R && r === "render" ? "true" : void 0
        }
      )
    );
    return F && !R ? /* @__PURE__ */ x.createElement(x.Fragment, null, Tt, /* @__PURE__ */ x.createElement(x5, { page: Z })) : Tt;
  }
);
Lv.displayName = "Link";
var R5 = x.forwardRef(
  function({
    "aria-current": n = "page",
    caseSensitive: r = !1,
    className: o = "",
    end: l = !1,
    style: u,
    to: f,
    viewTransition: h,
    children: p,
    ...m
  }, g) {
    let v = ms(f, { relative: m.relative }), b = ga(), k = x.useContext(fc), { navigator: E, basename: A } = x.useContext(In), C = k != null && // Conditional usage is OK here because the usage of a data router is static
    // eslint-disable-next-line react-hooks/rules-of-hooks
    z5(v) && h === !0, M = E.encodeLocation ? E.encodeLocation(v).pathname : v.pathname, D = b.pathname, R = k && k.navigation && k.navigation.location ? k.navigation.location.pathname : null;
    r || (D = D.toLowerCase(), R = R ? R.toLowerCase() : null, M = M.toLowerCase()), R && A && (R = Ba(R, A) || R);
    const z = M !== "/" && M.endsWith("/") ? M.length - 1 : M.length;
    let Z = D === M || !l && D.startsWith(M) && D.charAt(z) === "/", W = R != null && (R === M || !l && R.startsWith(M) && R.charAt(M.length) === "/"), X = {
      isActive: Z,
      isPending: W,
      isTransitioning: C
    }, F = Z ? n : void 0, at;
    typeof o == "function" ? at = o(X) : at = [
      o,
      Z ? "active" : null,
      W ? "pending" : null,
      C ? "transitioning" : null
    ].filter(Boolean).join(" ");
    let rt = typeof u == "function" ? u(X) : u;
    return /* @__PURE__ */ x.createElement(
      Lv,
      {
        ...m,
        "aria-current": F,
        className: at,
        ref: g,
        style: rt,
        to: f,
        viewTransition: h
      },
      typeof p == "function" ? p(X) : p
    );
  }
);
R5.displayName = "NavLink";
var C5 = x.forwardRef(
  ({
    discover: a = "render",
    fetcherKey: n,
    navigate: r,
    reloadDocument: o,
    replace: l,
    state: u,
    method: f = Yl,
    action: h,
    onSubmit: p,
    relative: m,
    preventScrollReset: g,
    viewTransition: v,
    defaultShouldRevalidate: b,
    ...k
  }, E) => {
    let { useTransitions: A } = x.useContext(In), C = O5(), M = _5(h, { relative: m }), D = f.toLowerCase() === "get" ? "get" : "post", R = typeof h == "string" && Vf.test(h), z = (Z) => {
      if (p && p(Z), Z.defaultPrevented) return;
      Z.preventDefault();
      let W = Z.nativeEvent.submitter, X = W?.getAttribute("formmethod") || f, F = () => C(W || Z.currentTarget, {
        fetcherKey: n,
        method: X,
        navigate: r,
        replace: l,
        state: u,
        relative: m,
        preventScrollReset: g,
        viewTransition: v,
        defaultShouldRevalidate: b
      });
      A && r !== !1 ? x.startTransition(() => F()) : F();
    };
    return /* @__PURE__ */ x.createElement(
      "form",
      {
        ref: E,
        method: D,
        action: M,
        onSubmit: o ? p : z,
        ...k,
        "data-discover": !R && a === "render" ? "true" : void 0
      }
    );
  }
);
C5.displayName = "Form";
function A5(a) {
  return `${a} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function Dv(a) {
  let n = x.useContext(Qr);
  return fe(n, A5(a)), n;
}
function j5(a, {
  target: n,
  replace: r,
  mask: o,
  state: l,
  preventScrollReset: u,
  relative: f,
  viewTransition: h,
  defaultShouldRevalidate: p,
  useTransitions: m
} = {}) {
  let g = Yf(), v = ga(), b = ms(a, { relative: f });
  return x.useCallback(
    (k) => {
      if (s5(k, n)) {
        k.preventDefault();
        let E = r !== void 0 ? r : ss(v) === ss(b), A = () => g(a, {
          replace: E,
          mask: o,
          state: l,
          preventScrollReset: u,
          relative: f,
          viewTransition: h,
          defaultShouldRevalidate: p
        });
        m ? x.startTransition(() => A()) : A();
      }
    },
    [
      v,
      g,
      b,
      r,
      o,
      l,
      n,
      a,
      u,
      f,
      h,
      p,
      m
    ]
  );
}
function L5(a) {
  Gn(
    typeof URLSearchParams < "u",
    "You cannot use the `useSearchParams` hook in a browser that does not support the URLSearchParams API. If you need to support Internet Explorer 11, we recommend you load a polyfill such as https://github.com/ungap/url-search-params."
  );
  let n = x.useRef(nf(a)), r = x.useRef(!1), o = ga(), l = x.useMemo(
    () => (
      // Only merge in the defaults if we haven't yet called setSearchParams.
      // Once we call that we want those to take precedence, otherwise you can't
      // remove a param with setSearchParams({}) if it has an initial value
      l5(
        o.search,
        r.current ? null : n.current
      )
    ),
    [o.search]
  ), u = Yf(), f = x.useCallback(
    (h, p) => {
      const m = nf(
        typeof h == "function" ? h(new URLSearchParams(l)) : h
      );
      r.current = !0, u("?" + m, p);
    },
    [u, l]
  );
  return [l, f];
}
var D5 = 0, N5 = () => `__${String(++D5)}__`;
function O5() {
  let { router: a } = Dv(
    "useSubmit"
    /* UseSubmit */
  ), { basename: n } = x.useContext(In), r = Q2(), o = a.fetch, l = a.navigate;
  return x.useCallback(
    async (u, f = {}) => {
      let { action: h, method: p, encType: m, formData: g, body: v } = d5(
        u,
        n
      );
      if (f.navigate === !1) {
        let b = f.fetcherKey || N5();
        await o(b, r, f.action || h, {
          defaultShouldRevalidate: f.defaultShouldRevalidate,
          preventScrollReset: f.preventScrollReset,
          formData: g,
          body: v,
          formMethod: f.method || p,
          formEncType: f.encType || m,
          flushSync: f.flushSync
        });
      } else
        await l(f.action || h, {
          defaultShouldRevalidate: f.defaultShouldRevalidate,
          preventScrollReset: f.preventScrollReset,
          formData: g,
          body: v,
          formMethod: f.method || p,
          formEncType: f.encType || m,
          replace: f.replace,
          state: f.state,
          fromRouteId: r,
          flushSync: f.flushSync,
          viewTransition: f.viewTransition
        });
    },
    [o, l, n, r]
  );
}
function _5(a, { relative: n } = {}) {
  let { basename: r } = x.useContext(In), o = x.useContext(ma);
  fe(o, "useFormAction must be used inside a RouteContext");
  let [l] = o.matches.slice(-1), u = { ...ms(a || ".", { relative: n }) }, f = ga();
  if (a == null) {
    u.search = f.search;
    let h = new URLSearchParams(u.search), p = h.getAll("index");
    if (p.some((g) => g === "")) {
      h.delete("index"), p.filter((v) => v).forEach((v) => h.append("index", v));
      let g = h.toString();
      u.search = g ? `?${g}` : "";
    }
  }
  return (!a || a === ".") && l.route.index && (u.search = u.search ? u.search.replace(/^\?/, "?index&") : "?index"), r !== "/" && (u.pathname = u.pathname === "/" ? r : na([r, u.pathname])), ss(u);
}
function z5(a, { relative: n } = {}) {
  let r = x.useContext(kv);
  fe(
    r != null,
    "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?"
  );
  let { basename: o } = Dv(
    "useViewTransitionState"
    /* useViewTransitionState */
  ), l = ms(a, { relative: n });
  if (!r.isTransitioning)
    return !1;
  let u = Ba(r.currentLocation.pathname, o) || r.currentLocation.pathname, f = Ba(r.nextLocation.pathname, o) || r.nextLocation.pathname;
  return ec(l.pathname, f) != null || ec(l.pathname, u) != null;
}
const U5 = /* @__PURE__ */ new Set([
  "",
  "browser",
  "chrome",
  "dashboard",
  "disclaimer",
  "dmca",
  "embed",
  "games",
  "lite",
  "login",
  "privacy",
  "sdk",
  "start",
  "terms",
  "troubleshoot",
  // The admin panel slug (kept in sync with VITE_ADMIN_PANEL_SLUG).
  "q8fz2r7lp3v9"
]);
function B5() {
  if (typeof window > "u") return "";
  const a = window.__ASTRA_PREFIX__;
  if (typeof a == "string") return a;
  const n = window.location.pathname.split("/")[1] ?? "";
  return n && !U5.has(n) ? `/${n}` : "";
}
const V5 = B5();
let ns = V5, af = "";
function Nv(a, n = "") {
  ns = a.replace(/\/+$/, ""), af = n;
}
function oe(a) {
  return ns + a;
}
function Xf(a) {
  const n = /^https?:/i.test(ns), r = n ? ns : location.origin, o = n ? "" : ns;
  let l = r.replace(/^http/, "ws") + o + a;
  return n && af && (l += (l.includes("?") ? "&" : "?") + "g=" + encodeURIComponent(af)), l;
}
let Nl = null, Ol = null;
async function Ov() {
  if (Nl) return Nl;
  const a = await fetch(oe("/bn/keymap-wire-hex.json"));
  if (!a.ok) throw new Error(`keymap HTTP ${a.status}`);
  return Nl = await a.json(), Nl;
}
async function _v() {
  if (Ol) return Ol;
  const a = await fetch(oe("/bn/keymap-code-to-sdl-scancode.json"));
  if (!a.ok) throw new Error(`SDL scancode keymap HTTP ${a.status}`);
  return Ol = await a.json(), Ol;
}
function H5(a, n) {
  return n[a] ?? null;
}
function P5(a, n) {
  return n[a] !== void 0 ? n[a] : n.Unidentified ?? 0;
}
const g0 = "input";
function Y5(a) {
  const n = new URL(a), { hostname: r, port: o, protocol: l, pathname: u, search: f } = n;
  return `${l}//${r}:${o}${u}${f}`;
}
function K5(a, n) {
  const r = n ? `${a.includes("?") ? "&" : "?"}token=${encodeURIComponent(n)}` : "";
  return Y5(`${a}${r}`);
}
function q5(a, n, r = 12e4) {
  return new Promise((o) => {
    let l = !1;
    const u = (m) => {
      l || (l = !0, clearTimeout(p), a.removeEventListener("playing", h), o());
    };
    if (!a.paused && a.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      u();
      return;
    }
    const h = () => u(), p = setTimeout(() => u(), r);
    a.addEventListener("playing", h);
  });
}
const F5 = {
  A: "A___",
  B: "B___",
  X: "X___",
  Y: "Y___",
  START: "STRT",
  SELECT: "SLCT",
  LB: "LB__",
  RB: "RB__",
  LS: "L3__",
  RS: "R3__",
  DPU: "UP__",
  DPD: "DOWN",
  DPL: "LEFT",
  DPR: "RGHT"
}, G5 = [
  "A",
  "B",
  "X",
  "Y",
  "LB",
  "RB",
  null,
  null,
  "SELECT",
  "START",
  "LS",
  "RS",
  "DPU",
  "DPD",
  "DPL",
  "DPR"
];
function Ur(a) {
  return Math.round((Math.min(Math.max(a, -1), 1) + 1e-5) * 100) / 100;
}
class I5 {
  /**
   * @param {{
   *   inputWsUrl?: string;
   *   streamToken?: string;
   *   videoEl: HTMLVideoElement;
   *   log?: (s: string) => void;
   *   mouseInputMode?: string;
   *   streamSize?: { width: number; height: number };
   *   relay?: { send: (raw: string) => void; waitUntilOpen: Promise<void> };
   *   cursorRootEl?: HTMLElement;
   *   pointerLockEl?: HTMLElement;
   * }} opts
   */
  constructor(n) {
    tt(this, "_pollGamepad", () => {
      this._gpRaf = requestAnimationFrame(this._pollGamepad);
      const n = navigator.getGamepads?.(), r = n && n[0];
      if (!r || !r.connected) {
        this._gpOpen && (this.sendGamepad("CLOS;;"), this._gpOpen = !1, this._gpBtnPrev = null, this._gpAxesPrev = null, this.log("gamepad0 disconnected"));
        return;
      }
      this._gpOpen || (this.sendGamepad("OPEN;;", {
        gamepad: { id: r.id || "web", hapticCaps: {} }
      }), this._gpOpen = !0, this.log(`gamepad0 OPEN (${r.id || "web"})`)), (!this._gpBtnPrev || this._gpBtnPrev.length !== r.buttons.length) && (this._gpBtnPrev = r.buttons.map((h) => !!(h.pressed || h.value > 0.5)));
      for (let h = 0; h < r.buttons.length; h++) {
        if (h === 6 || h === 7) continue;
        const p = G5[h];
        if (!p) continue;
        const m = !!(r.buttons[h].pressed || r.buttons[h].value > 0.5);
        if (m !== this._gpBtnPrev[h]) {
          const g = F5[p], v = m ? 0 : 1;
          this.sendGamepad(`${g}|${v};`), this._gpBtnPrev[h] = m;
        }
      }
      if (r.buttons[6]) {
        const h = r.buttons[6].value, p = Ur(h * 2 - 1);
        (this._gpLtPrev == null || Math.abs(p - this._gpLtPrev) > 0.02) && (this.sendGamepad(`LT_Z|${p};`), this._gpLtPrev = p);
      }
      if (r.buttons[7]) {
        const h = r.buttons[7].value, p = Ur(h * 2 - 1);
        (this._gpRtPrev == null || Math.abs(p - this._gpRtPrev) > 0.02) && (this.sendGamepad(`RT_Z|${p};`), this._gpRtPrev = p);
      }
      const o = r.axes;
      if (!o || o.length < 2) return;
      const l = Ur(o[0]), u = Ur(o[1]), f = [l, u];
      if ((!this._gpAxesPrev || Math.abs(f[0] - this._gpAxesPrev[0]) > 0.02 || Math.abs(f[1] - this._gpAxesPrev[1]) > 0.02) && (this.sendGamepad(`LT_X|${l};LT_Y|${u};`), this._gpAxesPrev = [...f, ...this._gpAxesPrev?.slice(2) || []]), o.length >= 4) {
        const h = Ur(o[2]), p = Ur(o[3]), m = this._gpAxesPrev?.[2] ?? 0, g = this._gpAxesPrev?.[3] ?? 0;
        (Math.abs(h - m) > 0.02 || Math.abs(p - g) > 0.02) && (this.sendGamepad(`RT_X|${h};RT_Y|${p};`), this._gpAxesPrev ? (this._gpAxesPrev[2] = h, this._gpAxesPrev[3] = p) : this._gpAxesPrev = [0, 0, h, p]);
      }
    });
    this._relay = n.relay || null, this.url = n.inputWsUrl ? K5(n.inputWsUrl, n.streamToken) : "", this.videoEl = n.videoEl, this._pointerLockEl = n.pointerLockEl || this.videoEl, this._cursorRoot = n.cursorRootEl || /** @type {HTMLElement} */
    n.videoEl.parentElement || n.videoEl, this.log = n.log || (() => {
    }), this.ws = null, this._pingTimer = null, this._mapPromise = Ov(), this._sdlMapPromise = _v(), this._streamW = n.streamSize?.width || 0, this._streamH = n.streamSize?.height || 0, this._mouseMode = n.mouseInputMode === "relative" ? "relative" : "absolute", this._connectTimeoutMs = n.connectTimeoutMs || 3e4, this._down = /* @__PURE__ */ new Set(), this._handlersBound = !1, this._detach = null, this._cachedRect = null, this._rectObserver = null, this._cachedSF = null, this._lastMX = -1, this._lastMY = -1, this._gpRaf = null, this._gpDevice = "gamepad1", this._gpOpen = !1, this._gpBtnPrev = null, this._gpAxesPrev = null, this._gpLtPrev = null, this._gpRtPrev = null, this._touchLast = null, this._touchUseMulti = !1, this._sendBlockedLogged = !1, this._documentRelativeMove = null, this._mouseBtnMask = 0, this._escapeHoldTid = null, this._escapeHoldTriggered = !1;
  }
  /** Host + path for DevTools (token stripped). */
  safeInputWsLabel() {
    try {
      const n = new URL(this.url);
      return n.searchParams.get("token") && n.searchParams.set("token", "(redacted)"), n.toString();
    } catch {
      return this.url ? "(invalid input URL)" : "(no input URL)";
    }
  }
  _sendRaw(n) {
    if (this._relay)
      return this._relay.send(n), !0;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (!this._sendBlockedLogged) {
        this._sendBlockedLogged = !0;
        const r = this.ws ? String(this.ws.readyState) : "no socket";
        this.log(
          `input dropped (socket not OPEN, readyState=${r}). Use the dedicated input WebSocket (${this.safeInputWsLabel()}) in Network → WS, not the site relay.`
        );
      }
      return !1;
    }
    return this.ws.send(n), !0;
  }
  sendJson(n, r, o) {
    const l = JSON.stringify(o !== void 0 ? { device: n, json_data: r, payload: o } : { device: n, json_data: r });
    return this._sendRaw(l);
  }
  /** Gamepad wire channel */
  sendGamepad(n, r) {
    return this.sendJson(this._gpDevice, n, r);
  }
  sendTouch(n) {
    return this.sendJson("touch", n);
  }
  _pointerLocked() {
    return document.pointerLockElement === this._pointerLockEl;
  }
  _requestPointerLockNow() {
    const n = this._pointerLockEl;
    (() => {
      try {
        const o = n.requestPointerLock?.({ unadjustedMovement: !0 });
        o && typeof o.catch == "function" && o.catch(() => {
          try {
            const l = n.requestPointerLock?.();
            l && typeof l.catch == "function" && l.catch(() => {
            });
          } catch {
          }
        });
      } catch {
        try {
          const o = n.requestPointerLock?.();
          o && typeof o.catch == "function" && o.catch(() => {
          });
        } catch {
        }
      }
    })();
  }
  /**
   * Hide OS cursor when pointer-locked; show when not locked (menus / aiming).
   * on the webrtc surface (they use class `forceShowCursor`; we use `bn-force-show-cursor`).
   */
  _syncBnCursorClass() {
    const n = this._cursorRoot;
    !n || !n.classList || (document.pointerLockElement ? n.classList.remove("bn-force-show-cursor") : n.classList.add("bn-force-show-cursor"));
  }
  _vidDims() {
    const n = this.videoEl;
    return {
      w: n.videoWidth > 0 ? n.videoWidth : this._streamW || 1,
      h: n.videoHeight > 0 ? n.videoHeight : this._streamH || 1
    };
  }
  /**
   * InputListener.getEffectiveBoundingClientRect — letterboxed video area inside element.
   */
  _effectiveVideoRect() {
    const n = this.videoEl, r = this._cachedRect || n.getBoundingClientRect(), { w: o, h: l } = this._vidDims(), u = o / l, f = r.width / r.height, h = r.width;
    let p = r.height;
    const m = r.left;
    let g = r.top;
    return u > f && (p = r.width * l / o, g = r.top + (r.height - p) / 2), { left: m, top: g, width: h, height: p };
  }
  _mouseScaleFactors() {
    if (this._cachedSF) return this._cachedSF;
    const n = this.videoEl, r = this._cachedRect || n.getBoundingClientRect(), o = r.width, l = r.height;
    if (o <= 0 || l <= 0) return null;
    const u = n.videoWidth > 0 ? n.videoWidth : this._streamW || o, f = n.videoHeight > 0 ? n.videoHeight : this._streamH || l, h = u / o, p = f / l;
    return this._cachedSF = { rect: r, m: o, v: l, p: h, C: p, vidW: u, vidH: f }, this._cachedSF;
  }
  sendMouseMove(n, r) {
    const o = this._mouseScaleFactors();
    if (!o) return;
    const l = Math.ceil((n - o.rect.left) * o.p + 0.5), u = Math.ceil((r - o.rect.top) * o.C + 0.5);
    l === this._lastMX && u === this._lastMY || (this._lastMX = l, this._lastMY = u, this.sendJson("mouse", `xref:${l}|yref:${u};`));
  }
  sendMouseMoveRelative(n, r) {
    const o = this._mouseScaleFactors();
    if (!o) return;
    const l = Math.sign(n) * Math.ceil(Math.abs(n * o.p)), u = Math.sign(r) * Math.ceil(Math.abs(r * o.C));
    (l !== 0 || u !== 0) && this.sendJson("mouse", `xpos:${l}|ypos:${u};`);
  }
  sendMouseClick(n, r) {
    const o = r ? 0 : 1;
    this.sendJson("mouse", `M${n}|${o};`);
  }
  sendWheel(n) {
    this.sendJson("mouse", `MW|${n};`);
  }
  /**
   * Desk `InputListener` + `WebSocketManager.sendDataKeyboard`: same JSON line as mouse,
   * with `payload.event.sc` (SDL scancode) and optional `payload.event.pr` for length-1 keys.
   */
  async sendKeyEvent(n, r) {
    const o = await this._sdlMapPromise;
    let l;
    if (typeof n.key == "string" && n.key.length === 1)
      l = n.key.toLowerCase().charCodeAt(0).toString(16);
    else {
      const m = await this._mapPromise;
      l = H5(n.code, m);
    }
    if (!l) return;
    const u = l.length === 1 ? `0${l}` : l, f = r === "press" ? 0 : 1, p = { event: { sc: P5(n.code, o) } };
    typeof n.key == "string" && n.key.length === 1 && (p.event.pr = n.key.charCodeAt(0).toString(16).padStart(4, "0")), this.sendJson("keyboard", `${u}|${f};`, p);
  }
  _stopGamepadPoll() {
    this._gpRaf != null && (cancelAnimationFrame(this._gpRaf), this._gpRaf = null), this._gpOpen && (this.sendGamepad("CLOS;;"), this._gpOpen = !1), this._gpBtnPrev = null, this._gpAxesPrev = null, this._gpLtPrev = null, this._gpRtPrev = null;
  }
  _startGamepadPoll() {
    this._stopGamepadPoll(), "getGamepads" in navigator && (this._gpRaf = requestAnimationFrame(this._pollGamepad));
  }
  _touchClientToVideo(n, r) {
    const o = this._effectiveVideoRect(), { w: l, h: u } = this._vidDims(), f = Math.ceil((n - o.left) * l / o.width), h = Math.ceil((r - o.top) * u / o.height);
    return { x: f, y: h };
  }
  _sendSingleTouch(n, r, o) {
    const { x: l, y: u } = this._touchClientToVideo(n, r);
    let f = `TX:${l}|TY:${u}`;
    (o === "press" || o === "release") && (f += `;TO|${o === "press" ? 0 : 1}`), this.sendTouch(f);
  }
  _sendMultiTouch(n, r) {
    const o = this._effectiveVideoRect(), { w: l, h: u } = this._vidDims(), { clientX: f, clientY: h } = n, p = Math.ceil((f - o.left) * l / o.width), m = Math.ceil((h - o.top) * u / o.height), g = n.identifier || 0, v = Math.ceil(((n.force ?? 0.5) || 0.5) * 100);
    let b = `TX:${p}|TY:${m}|TP:${v}|TI:${g};`;
    if (r === "press")
      b += `TO|0|TI:${g};`, this._touchLast || (this._touchLast = /* @__PURE__ */ new Map()), this._touchLast.set(g, { x: p, y: m, p: v });
    else if (r === "release")
      b += `TO|1|TI:${g};`, this._touchLast?.delete(g);
    else {
      const k = this._touchLast?.get(g);
      if (k && k.x === p && k.y === m && k.p === v) return;
      this._touchLast || (this._touchLast = /* @__PURE__ */ new Map()), this._touchLast.set(g, { x: p, y: m, p: v });
    }
    this.sendTouch(b);
  }
  attachWindowHandlers() {
    if (this._handlersBound) return;
    this._handlersBound = !0, this._mouseMode === "relative" && this.log(
      "stream wants relative mouse — moves use xref|yref until pointer lock, then xpos|ypos"
    );
    const n = () => {
      this._cachedRect = this.videoEl.getBoundingClientRect(), this._cachedSF = null;
    };
    n(), this._rectObserver = new ResizeObserver(n), this._rectObserver.observe(this.videoEl), this._pointerLockEl !== this.videoEl && this._rectObserver.observe(this._pointerLockEl), this._rectObserver.observe(document.documentElement), window.addEventListener("scroll", n, { passive: !0, capture: !0 }), document.addEventListener("fullscreenchange", n, { passive: !0 }), this.videoEl.addEventListener("resize", n);
    const r = this._pointerLockEl, o = 550, l = (R) => {
      R.preventDefault(), !this._down.has(R.code) && (this._down.add(R.code), R.code === "Escape" && this._pointerLocked() && (this._escapeHoldTriggered = !1, this._escapeHoldTid = setTimeout(() => {
        if (this._pointerLocked()) {
          this._escapeHoldTriggered = !0;
          try {
            document.exitPointerLock();
          } catch {
          }
          this.log("pointer lock released (Esc hold)");
        }
      }, o)), this.sendKeyEvent(R, "press").catch(
        (z) => this.log(`keyboard send error: ${z && z.message ? z.message : z}`)
      ));
    }, u = (R) => {
      R.preventDefault(), R.code === "Escape" && this._escapeHoldTid && (clearTimeout(this._escapeHoldTid), this._escapeHoldTid = null), this._down.delete(R.code), this.sendKeyEvent(R, "release").catch(
        (z) => this.log(`keyboard send error: ${z && z.message ? z.message : z}`)
      );
    }, f = (R) => {
      if (!r.contains(R.target)) return;
      R.preventDefault();
      let z;
      if (R.deltaY > 0) z = 1;
      else if (R.deltaY < 0) z = 0;
      else return;
      this.sendWheel(z);
    }, h = (R) => {
      if (!r.contains(R.target)) return;
      this._mouseBtnMask |= 1 << R.button;
      const z = R.button === 1 ? 3 : R.button === 2 ? 2 : R.button + 1;
      this.sendMouseClick(z, !0);
    }, p = (R) => {
      const z = 1 << R.button;
      if (!(this._mouseBtnMask & z)) return;
      this._mouseBtnMask &= ~z;
      const Z = R.button === 1 ? 3 : R.button === 2 ? 2 : R.button + 1;
      this.sendMouseClick(Z, !1);
    }, m = (R) => {
      R.preventDefault();
    }, g = (R) => {
      if (this._pointerLocked()) return;
      const z = r.getBoundingClientRect();
      R.clientX < z.left || R.clientX >= z.right || R.clientY < z.top || R.clientY >= z.bottom || this.sendMouseMove(R.clientX, R.clientY);
    };
    this._documentRelativeMove = (R) => {
      this._pointerLocked() && this.sendMouseMoveRelative(R.movementX, R.movementY);
    };
    const v = () => {
      this._pointerLocked() || this._requestPointerLockNow();
    }, b = (R) => {
      R.button === 0 && (this._pointerLocked() || this._requestPointerLockNow());
    }, k = () => {
      this._syncBnCursorClass();
      const R = this._pointerLocked();
      R ? document.addEventListener("mousemove", this._documentRelativeMove, !0) : this._documentRelativeMove && document.removeEventListener("mousemove", this._documentRelativeMove, !0), this.log(R ? "Pointer captured — Esc to release" : "Pointer released");
    }, E = (R) => {
      if (R.preventDefault(), R.touches.length >= 2 && (this._touchUseMulti = !0), this._touchUseMulti)
        for (const z of R.changedTouches)
          this._sendMultiTouch(z, "press");
      else {
        const z = R.changedTouches[0];
        this._sendSingleTouch(z.clientX, z.clientY, "press");
      }
    }, A = (R) => {
      if (R.preventDefault(), this._touchUseMulti) {
        for (const z of R.changedTouches)
          this._sendMultiTouch(z, "release");
        R.touches.length === 0 && (this._touchUseMulti = !1, this._touchLast = null);
      } else {
        const z = R.changedTouches[0];
        this._sendSingleTouch(z.clientX, z.clientY, "release");
      }
    }, C = (R) => {
      if (R.preventDefault(), this._touchUseMulti)
        for (const z of R.changedTouches)
          this._sendMultiTouch(z, "move");
      else if (R.touches.length === 1) {
        const z = R.touches[0];
        this._sendSingleTouch(z.clientX, z.clientY, "move");
      }
    }, M = (R) => {
      this.log(`gamepad connected: ${R.gamepad?.id || "?"}`), this._startGamepadPoll();
    }, D = () => {
      this.log("gamepad disconnected"), this._stopGamepadPoll();
    };
    window.addEventListener("keydown", l, !0), window.addEventListener("keyup", u, !0), r.addEventListener("wheel", f, { passive: !1 }), r.addEventListener("mousedown", h), window.addEventListener("mouseup", p, !0), r.addEventListener("contextmenu", m), r.addEventListener("mousemove", g), r.addEventListener("click", v), r.addEventListener("pointerdown", b, { capture: !0 }), document.addEventListener("pointerlockchange", k), this._syncBnCursorClass(), this._pointerLocked() && this._documentRelativeMove && document.addEventListener("mousemove", this._documentRelativeMove, !0), r.addEventListener("touchstart", E, { passive: !1 }), r.addEventListener("touchend", A, { passive: !1 }), r.addEventListener("touchcancel", A, { passive: !1 }), r.addEventListener("touchmove", C, { passive: !1 }), window.addEventListener("gamepadconnected", M), window.addEventListener("gamepaddisconnected", D), this._detach = () => {
      window.removeEventListener("keydown", l, !0), window.removeEventListener("keyup", u, !0);
      const R = this._pointerLockEl;
      R.removeEventListener("wheel", f), R.removeEventListener("mousedown", h), window.removeEventListener("mouseup", p, !0), R.removeEventListener("contextmenu", m), R.removeEventListener("mousemove", g), R.removeEventListener("click", v), R.removeEventListener("pointerdown", b, { capture: !0 }), document.removeEventListener("pointerlockchange", k), this._documentRelativeMove && document.removeEventListener("mousemove", this._documentRelativeMove, !0), R.removeEventListener("touchstart", E), R.removeEventListener("touchend", A), R.removeEventListener("touchcancel", A), R.removeEventListener("touchmove", C), window.removeEventListener("gamepadconnected", M), window.removeEventListener("gamepaddisconnected", D), this._stopGamepadPoll(), this._touchLast = null, this._touchUseMulti = !1, this._mouseBtnMask = 0, this._escapeHoldTriggered = !1, this._escapeHoldTid && (clearTimeout(this._escapeHoldTid), this._escapeHoldTid = null), this._rectObserver?.disconnect(), this._rectObserver = null, this._cachedRect = null, this._cachedSF = null, window.removeEventListener("scroll", n, { capture: !0 }), document.removeEventListener("fullscreenchange", n), this.videoEl.removeEventListener("resize", n), this._cursorRoot?.classList && this._cursorRoot.classList.add("bn-force-show-cursor"), this._detach = null;
    }, navigator.getGamepads && navigator.getGamepads()[0]?.connected && this._startGamepadPoll();
  }
  connect() {
    return this._relay ? (this._relay.waitUntilOpen || Promise.resolve()).then(() => {
      this.log("input relay ready"), this._pingTimer = setInterval(() => {
        this._sendRaw("ping;");
      }, 3e4);
    }) : this.url ? new Promise((n, r) => {
      let o = !1, l = !1;
      const u = (p) => {
        l || (l = !0, r(new Error(p)));
      };
      this.log(`input ws connecting: ${this.safeInputWsLabel()}`), this.ws = new WebSocket(this.url, g0), this._sendBlockedLogged = !1;
      const f = this._connectTimeoutMs, h = setTimeout(() => {
        if (!o && !l) {
          this.log(
            `input ws connect TIMEOUT (${f / 1e3}s) — handshake never completed; check Network→WS row for this URL`
          );
          try {
            this.ws?.close();
          } catch {
          }
          u(`input WebSocket connect timeout (${f / 1e3}s)`);
        }
      }, f);
      this.ws.onopen = () => {
        if (!l) {
          clearTimeout(h), o = !0, l = !0, this.log(
            `input WebSocket OPEN — ${this.safeInputWsLabel()} — Network→WS messages use subprotocol "${g0}" (not the site /live-lesson relay)`
          );
          try {
            this.ws.send("ping;");
          } catch {
          }
          {
            let p = !1;
            this.ws.onmessage = (m) => {
              if (p) return;
              p = !0;
              const g = typeof m.data == "string" ? m.data.slice(0, 240) : "(binary)";
              this.log(`input ws first inbound: ${g}`);
            };
          }
          this._pingTimer = setInterval(() => {
            try {
              this.ws?.readyState === WebSocket.OPEN && this.ws.send("ping;");
            } catch {
            }
          }, 3e4), n();
        }
      }, this.ws.onerror = (p) => {
        this.log(
          `input ws onerror — type=${p?.type || "?"} url=${this.safeInputWsLabel()}`
        ), o || (clearTimeout(h), u(
          "input WebSocket error (see DevTools → Network → WS: token, origin, or firewall)"
        ));
      }, this.ws.onclose = (p) => {
        clearTimeout(h), this._pingTimer && clearInterval(this._pingTimer), this._pingTimer = null, this.log(
          `input ws onclose — code=${p.code} reason=${p.reason || "(none)"} wasClean=${p.wasClean}`
        ), o || u(
          `input WebSocket closed before open (code=${p.code} reason=${p.reason || "(none)"})`
        );
      };
    }) : Promise.reject(
      new Error("InputClient: missing inputWsUrl (or streamToken) — cannot open direct socket")
    );
  }
  close() {
    if (this._pointerLocked())
      try {
        document.exitPointerLock();
      } catch {
      }
    this._detach?.(), this._handlersBound = !1, this._syncBnCursorClass();
    try {
      this._sendRaw("exit|0;");
    } catch {
    }
    try {
      this.ws?.close();
    } catch {
    }
    this.ws = null, this._pingTimer && clearInterval(this._pingTimer);
  }
}
class X5 {
  constructor() {
    tt(this, "ws", null);
    tt(this, "launchResolve", null);
    tt(this, "launchReject", null);
    tt(this, "onNegoIn", null);
    tt(this, "onSig", null);
    tt(this, "onSaved", null);
    tt(this, "sigBuffer", []);
    tt(this, "_inputRelayReady", !1);
    tt(this, "_inputRelayFailed", !1);
    tt(this, "_inputRelayFailMsg", null);
    tt(this, "_inputRelayWaiters", []);
  }
  rejectInputWaiters(n) {
    const r = this._inputRelayWaiters;
    this._inputRelayWaiters = [];
    for (const o of r)
      clearTimeout(o.tid), o.reject(new Error(n));
  }
  connect() {
    return new Promise((n, r) => {
      this.ws = new WebSocket(Xf("/live-lesson")), this.ws.onopen = () => n(), this.ws.onerror = () => r(new Error("Stream relay socket failed")), this.ws.onmessage = (o) => {
        let l;
        try {
          l = JSON.parse(String(o.data));
        } catch {
          return;
        }
        const u = l.t;
        if (u === "launchReady") {
          if (this._inputRelayReady = !1, this._inputRelayFailed = !1, this._inputRelayFailMsg = null, this.rejectInputWaiters("new launch — input relay wait reset"), this.launchResolve) {
            const f = this.launchResolve;
            this.launchResolve = null, this.launchReject = null, f(l.session);
          }
        } else if (u === "launchErr" && this.launchReject) {
          const f = this.launchReject;
          this.launchResolve = null, this.launchReject = null, f(new Error(String(l.error ?? "Launch failed")));
        } else if (u === "inputRelayErr") {
          this._inputRelayFailed = !0, this._inputRelayFailMsg = String(l.error ?? "input relay failed");
          const f = this._inputRelayWaiters;
          this._inputRelayWaiters = [];
          for (const h of f)
            clearTimeout(h.tid), h.reject(new Error(this._inputRelayFailMsg));
        } else if (u === "inputRelayReady") {
          this._inputRelayReady = !0;
          const f = this._inputRelayWaiters;
          this._inputRelayWaiters = [];
          for (const h of f)
            clearTimeout(h.tid), h.resolve();
        } else u === "negoIn" && this.onNegoIn ? this.onNegoIn(String(l.raw)) : u === "sig" ? this.onSig ? this.onSig(l.msg) : this.sigBuffer.push(l.msg) : u === "ctSaved" && this.onSaved?.(String(l.saveTime ?? ""), String(l.why ?? ""));
      };
    });
  }
  waitLaunchResult() {
    return new Promise((n, r) => {
      this.launchResolve = n, this.launchReject = r;
    });
  }
  launch(n) {
    this.ws?.send(JSON.stringify({ t: "launch", ...n }));
  }
  /**
   * Attach to a ready session. `cfTurn` (secondary/Raccoon only) overrides the
   * server's own roll: true forces the Cloudflare TURN fallback, false forces
   * the direct path on Raccoon's own ICE. Omit to let the server decide.
   */
  attach(n, r) {
    this.ws?.send(
      JSON.stringify({
        t: "attach",
        apiSessionId: n,
        ...typeof r == "boolean" ? { cfTurn: r } : {}
      })
    );
  }
  sendNegoOut(n) {
    this.ws?.send(JSON.stringify({ t: "negoOut", raw: n }));
  }
  setNegoHandler(n) {
    this.onNegoIn = n;
  }
  /** Secondary (Raccoon) plain-WebRTC signaling. */
  setSigHandler(n) {
    if (this.onSig = n, this.sigBuffer.length) {
      const r = this.sigBuffer;
      this.sigBuffer = [];
      for (const o of r) n(o);
    }
  }
  sendSig(n) {
    this.ws?.send(JSON.stringify({ t: "sig", raw: JSON.stringify(n) }));
  }
  /** Quinary (Cato): ask the server to snapshot the current save now. */
  sendSave() {
    this.ws?.send(JSON.stringify({ t: "save" }));
  }
  /** Called when the server confirms a save was captured (periodic or button). */
  setSavedHandler(n) {
    this.onSaved = n;
  }
  sendInputOut(n) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const o = new TextEncoder().encode(n), l = new Uint8Array(o.length + 1);
    l[0] = 1, l.set(o, 1), this.ws.send(l);
  }
  openServerInputRelay() {
    this.ws?.send(JSON.stringify({ t: "openInputRelay" }));
  }
  waitInputRelayReady(n = 55e3) {
    return this._inputRelayReady ? Promise.resolve() : this._inputRelayFailed ? Promise.reject(
      new Error(this._inputRelayFailMsg || "input relay failed")
    ) : new Promise((r, o) => {
      const l = {
        tid: 0,
        resolve: () => r(),
        reject: (u) => o(u)
      };
      l.tid = setTimeout(() => {
        const u = this._inputRelayWaiters.indexOf(l);
        u >= 0 && this._inputRelayWaiters.splice(u, 1), o(new Error("inputRelayReady timeout"));
      }, n), this._inputRelayWaiters.push(l);
    });
  }
  close() {
    try {
      this.ws?.close();
    } catch {
    }
    this.ws = null;
  }
}
function Ld(a) {
  if (!a || typeof a != "object") return !1;
  const n = a.error;
  return !!n && typeof n == "object" && "message" in n && typeof n.message == "string";
}
function Dd(a) {
  return a.error?.message ?? "Request failed";
}
function W5(a) {
  if (Array.isArray(a)) return a;
  if (a && typeof a == "object" && "iceServers" in a) {
    const n = a.iceServers;
    if (Array.isArray(n)) return n;
  }
  return [];
}
class Q5 {
  constructor(n, r) {
    tt(this, "relay");
    tt(this, "socketQueueId", 0);
    tt(this, "socketQueue", {});
    tt(this, "onPush");
    this.relay = n, this.onPush = r || null, n.setNegoHandler((o) => this.ingestIncoming(o));
  }
  ingestIncoming(n) {
    let r;
    try {
      r = JSON.parse(n);
    } catch {
      return;
    }
    if (typeof r.cmd_id < "u" && this.socketQueue[`i_${r.cmd_id}`]) {
      const o = this.socketQueue[`i_${r.cmd_id}`];
      delete this.socketQueue[`i_${r.cmd_id}`], o(r.json_data);
      return;
    }
    r?.method && this.onPush && this.onPush(r);
  }
  postData(n, r, o) {
    this.socketQueueId += 1;
    const l = this.socketQueueId;
    this.socketQueue[`i_${l}`] = o, this.relay.sendNegoOut(JSON.stringify({ cmd_id: l, method: n, json_data: r }));
  }
  async connect() {
    const n = await new Promise(
      (l, u) => {
        this.postData(
          "getConfig",
          { "user-agent": navigator.userAgent },
          (f) => {
            Ld(f) ? u(new Error(Dd(f))) : l(f);
          }
        );
      }
    ), r = await new Promise((l, u) => {
      this.postData("getIceServers", null, (f) => {
        Ld(f) ? u(new Error(Dd(f))) : l(f);
      });
    }), o = W5(r);
    return { cfg: n, iceServers: o };
  }
  call(n, r) {
    return new Promise((o, l) => {
      this.postData("call", { body: r, peerid: n }, (u) => {
        Ld(u) ? l(new Error(Dd(u))) : o(u);
      });
    });
  }
  callAck(n) {
    this.postData("callAck", { peerid: n }, () => {
    });
  }
  addIce(n, r) {
    this.postData("addIceCandidate", { body: r, peerid: n }, () => {
    });
  }
}
const y0 = 40;
function Z5(a) {
  try {
    const n = RTCRtpReceiver.getCapabilities?.("video");
    if (!n?.codecs?.length || !a.setCodecPreferences) return;
    const r = (o) => /h264/i.test(o.mimeType);
    if (!n.codecs.some(r)) return;
    a.setCodecPreferences([
      ...n.codecs.filter(r),
      ...n.codecs.filter((o) => !r(o))
    ]);
  } catch {
  }
}
function J5(a) {
  const n = a;
  try {
    "jitterBufferTarget" in n ? n.jitterBufferTarget = y0 : "playoutDelayHint" in n && (n.playoutDelayHint = y0 / 1e3);
  } catch {
  }
}
async function $5({
  relay: a,
  videoEl: n
}) {
  let r = null;
  const o = new MediaStream(), l = new Q5(a, (v) => {
    if (r) {
      if (v?.method === "addIceCandidate") {
        const b = v?.json_data?.body;
        if (!b) {
          r.addIceCandidate(null).catch(() => {
          });
          return;
        }
        const k = {
          candidate: b.candidate,
          sdpMLineIndex: b.sdpMLineIndex ?? 0,
          sdpMid: b.sdpMid ?? null,
          usernameFragment: b.usernameFragment
        };
        r.addIceCandidate(k).catch(() => {
        });
      }
      if (v?.method === "hangup")
        try {
          r.close();
        } catch {
        }
    }
  }), { iceServers: u, cfg: f } = await l.connect();
  r = new RTCPeerConnection({
    iceServers: u,
    iceTransportPolicy: "all",
    bundlePolicy: "balanced",
    // Pre-gather ICE candidates while the offer is being built — shaves the
    // connect time without touching the media path.
    iceCandidatePoolSize: 2
  });
  const h = Math.floor(Math.random() * 1e5) + 1;
  r.addTransceiver("audio", { direction: "recvonly" });
  const p = r.addTransceiver("video", {
    direction: "recvonly"
  });
  Z5(p), r.ontrack = (v) => {
    n.srcObject !== o && (n.srcObject = o), J5(v.receiver), o.getTracks().some((b) => b.id === v.track.id) || o.addTrack(v.track);
  }, r.onicecandidate = (v) => {
    v.candidate && l.addIce(h, v.candidate.toJSON());
  };
  const m = await r.createOffer({
    offerToReceiveAudio: !0,
    offerToReceiveVideo: !0
  });
  await r.setLocalDescription(m);
  const g = await l.call(h, m);
  return await r.setRemoteDescription(new RTCSessionDescription(g)), l.callAck(h), {
    pc: r,
    streamingSize: {
      width: Number(f?.videoWidth) || 1280,
      height: Number(f?.videoHeight) || 720
    }
  };
}
async function tS(a = 2500) {
  if (typeof RTCPeerConnection > "u") return !1;
  let n = null;
  try {
    n = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }]
    });
  } catch {
    return !1;
  }
  return await new Promise((r) => {
    let o = !1;
    const l = (f) => {
      if (!o) {
        o = !0, clearTimeout(u);
        try {
          n?.close();
        } catch {
        }
        r(f);
      }
    }, u = setTimeout(() => l(!0), a);
    n.onicecandidate = (f) => {
      const h = f.candidate;
      if (!h || !h.candidate) return;
      const p = h.candidate.toLowerCase(), m = p.includes(" udp ") && p.includes("typ host"), g = p.includes("typ srflx");
      (m || g) && l(!1);
    }, n.onicegatheringstatechange = () => {
      n && n.iceGatheringState === "complete" && l(!0);
    };
    try {
      n.createDataChannel("probe"), n.createOffer().then((f) => n.setLocalDescription(f)).catch(() => l(!1));
    } catch {
      l(!1);
    }
  });
}
const zv = "sg-transport";
function eS() {
  try {
    const a = localStorage.getItem(zv);
    if (a === "direct" || a === "fallback" || a === "auto") return a;
  } catch {
  }
  return "auto";
}
function nS(a) {
  try {
    localStorage.setItem(zv, a);
  } catch {
  }
}
async function aS(a) {
  return a === "direct" ? !1 : a === "fallback" ? !0 : await tS();
}
const Wf = x.createContext({});
function Qf(a) {
  const n = x.useRef(null);
  return n.current === null && (n.current = a()), n.current;
}
const iS = typeof window < "u", Zf = iS ? x.useLayoutEffect : x.useEffect, mc = /* @__PURE__ */ x.createContext(null);
function Jf(a, n) {
  a.indexOf(n) === -1 && a.push(n);
}
function nc(a, n) {
  const r = a.indexOf(n);
  r > -1 && a.splice(r, 1);
}
const pa = (a, n, r) => r > n ? n : r < a ? a : r;
let $f = () => {
};
const bi = {}, Uv = (a) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(a), Bv = (a) => typeof a == "object" && a !== null, Vv = (a) => /^0[^.\s]+$/u.test(a);
// @__NO_SIDE_EFFECTS__
function Hv(a) {
  let n;
  return () => (n === void 0 && (n = a()), n);
}
const Fn = /* @__NO_SIDE_EFFECTS__ */ (a) => a, gs = (...a) => a.reduce((n, r) => (o) => r(n(o))), ls = /* @__NO_SIDE_EFFECTS__ */ (a, n, r) => {
  const o = n - a;
  return o ? (r - a) / o : 1;
};
class th {
  constructor() {
    this.subscriptions = [];
  }
  add(n) {
    return Jf(this.subscriptions, n), () => nc(this.subscriptions, n);
  }
  notify(n, r, o) {
    const l = this.subscriptions.length;
    if (l)
      if (l === 1)
        this.subscriptions[0](n, r, o);
      else
        for (let u = 0; u < l; u++) {
          const f = this.subscriptions[u];
          f && f(n, r, o);
        }
  }
  getSize() {
    return this.subscriptions.length;
  }
  clear() {
    this.subscriptions.length = 0;
  }
}
const Rn = /* @__NO_SIDE_EFFECTS__ */ (a) => a * 1e3, qn = /* @__NO_SIDE_EFFECTS__ */ (a) => a / 1e3, Pv = /* @__NO_SIDE_EFFECTS__ */ (a, n) => n ? a * (1e3 / n) : 0, Yv = (a, n, r) => (((1 - 3 * r + 3 * n) * a + (3 * r - 6 * n)) * a + 3 * n) * a, rS = 1e-7, oS = 12;
function sS(a, n, r, o, l) {
  let u, f, h = 0;
  do
    f = n + (r - n) / 2, u = Yv(f, o, l) - a, u > 0 ? r = f : n = f;
  while (Math.abs(u) > rS && ++h < oS);
  return f;
}
// @__NO_SIDE_EFFECTS__
function ys(a, n, r, o) {
  if (a === n && r === o)
    return Fn;
  const l = (u) => sS(u, 0, 1, a, r);
  return (u) => u === 0 || u === 1 ? u : Yv(l(u), n, o);
}
const Kv = /* @__NO_SIDE_EFFECTS__ */ (a) => (n) => n <= 0.5 ? a(2 * n) / 2 : (2 - a(2 * (1 - n))) / 2, qv = /* @__NO_SIDE_EFFECTS__ */ (a) => (n) => 1 - a(1 - n), Fv = /* @__PURE__ */ ys(0.33, 1.53, 0.69, 0.99), eh = /* @__PURE__ */ qv(Fv), Gv = /* @__PURE__ */ Kv(eh), Iv = (a) => a >= 1 ? 1 : (a *= 2) < 1 ? 0.5 * eh(a) : 0.5 * (2 - Math.pow(2, -10 * (a - 1))), nh = (a) => 1 - Math.sin(Math.acos(a)), Xv = /* @__PURE__ */ qv(nh), Wv = /* @__PURE__ */ Kv(nh), lS = /* @__PURE__ */ ys(0.42, 0, 1, 1), cS = /* @__PURE__ */ ys(0, 0, 0.58, 1), Qv = /* @__PURE__ */ ys(0.42, 0, 0.58, 1), uS = /* @__NO_SIDE_EFFECTS__ */ (a) => Array.isArray(a) && typeof a[0] != "number", Zv = /* @__NO_SIDE_EFFECTS__ */ (a) => Array.isArray(a) && typeof a[0] == "number", dS = {
  linear: Fn,
  easeIn: lS,
  easeInOut: Qv,
  easeOut: cS,
  circIn: nh,
  circInOut: Wv,
  circOut: Xv,
  backIn: eh,
  backInOut: Gv,
  backOut: Fv,
  anticipate: Iv
}, fS = (a) => typeof a == "string", v0 = (a) => {
  if (/* @__PURE__ */ Zv(a)) {
    $f(a.length === 4);
    const [n, r, o, l] = a;
    return /* @__PURE__ */ ys(n, r, o, l);
  } else if (fS(a))
    return dS[a];
  return a;
}, _l = [
  "setup",
  // Compute
  "read",
  // Read
  "resolveKeyframes",
  // Write/Read/Write/Read
  "preUpdate",
  // Compute
  "update",
  // Compute
  "preRender",
  // Compute
  "render",
  // Write
  "postRender"
  // Compute
];
function hS(a) {
  let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), o = !1, l = !1;
  const u = /* @__PURE__ */ new WeakSet();
  let f = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function h(m) {
    u.has(m) && (p.schedule(m), a()), m(f);
  }
  const p = {
    /**
     * Schedule a process to run on the next frame.
     */
    schedule: (m, g = !1, v = !1) => {
      const k = v && o ? n : r;
      return g && u.add(m), k.add(m), m;
    },
    /**
     * Cancel the provided callback from running on the next frame.
     */
    cancel: (m) => {
      r.delete(m), u.delete(m);
    },
    /**
     * Execute all schedule callbacks.
     */
    process: (m) => {
      if (f = m, o) {
        l = !0;
        return;
      }
      o = !0;
      const g = n;
      n = r, r = g, n.forEach(h), n.clear(), o = !1, l && (l = !1, p.process(m));
    }
  };
  return p;
}
const pS = 40;
function Jv(a, n) {
  let r = !1, o = !0;
  const l = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, u = () => r = !0, f = _l.reduce((R, z) => (R[z] = hS(u), R), {}), { setup: h, read: p, resolveKeyframes: m, preUpdate: g, update: v, preRender: b, render: k, postRender: E } = f, A = () => {
    const R = bi.useManualTiming, z = R ? l.timestamp : performance.now();
    r = !1, R || (l.delta = o ? 1e3 / 60 : Math.max(Math.min(z - l.timestamp, pS), 1)), l.timestamp = z, l.isProcessing = !0, h.process(l), p.process(l), m.process(l), g.process(l), v.process(l), b.process(l), k.process(l), E.process(l), l.isProcessing = !1, r && n && (o = !1, a(A));
  }, C = () => {
    r = !0, o = !0, l.isProcessing || a(A);
  };
  return { schedule: _l.reduce((R, z) => {
    const Z = f[z];
    return R[z] = (W, X = !1, F = !1) => (r || C(), Z.schedule(W, X, F)), R;
  }, {}), cancel: (R) => {
    for (let z = 0; z < _l.length; z++)
      f[_l[z]].cancel(R);
  }, state: l, steps: f };
}
const { schedule: $t, cancel: wi, state: Pe, steps: Nd } = /* @__PURE__ */ Jv(typeof requestAnimationFrame < "u" ? requestAnimationFrame : Fn, !0);
let ql;
function mS() {
  ql = void 0;
}
const an = {
  now: () => (ql === void 0 && an.set(Pe.isProcessing || bi.useManualTiming ? Pe.timestamp : performance.now()), ql),
  set: (a) => {
    ql = a, queueMicrotask(mS);
  }
}, $v = (a) => (n) => typeof n == "string" && n.startsWith(a), tb = /* @__PURE__ */ $v("--"), gS = /* @__PURE__ */ $v("var(--"), ah = (a) => gS(a) ? yS.test(a.split("/*")[0].trim()) : !1, yS = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function b0(a) {
  return typeof a != "string" ? !1 : a.split("/*")[0].includes("var(--");
}
const Zr = {
  test: (a) => typeof a == "number",
  parse: parseFloat,
  transform: (a) => a
}, cs = {
  ...Zr,
  transform: (a) => pa(0, 1, a)
}, zl = {
  ...Zr,
  default: 1
}, as = (a) => Math.round(a * 1e5) / 1e5, ih = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function vS(a) {
  return a == null;
}
const bS = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, rh = (a, n) => (r) => !!(typeof r == "string" && bS.test(r) && r.startsWith(a) || n && !vS(r) && Object.prototype.hasOwnProperty.call(r, n)), eb = (a, n, r) => (o) => {
  if (typeof o != "string")
    return o;
  const [l, u, f, h] = o.match(ih);
  return {
    [a]: parseFloat(l),
    [n]: parseFloat(u),
    [r]: parseFloat(f),
    alpha: h !== void 0 ? parseFloat(h) : 1
  };
}, wS = (a) => pa(0, 255, a), Od = {
  ...Zr,
  transform: (a) => Math.round(wS(a))
}, $i = {
  test: /* @__PURE__ */ rh("rgb", "red"),
  parse: /* @__PURE__ */ eb("red", "green", "blue"),
  transform: ({ red: a, green: n, blue: r, alpha: o = 1 }) => "rgba(" + Od.transform(a) + ", " + Od.transform(n) + ", " + Od.transform(r) + ", " + as(cs.transform(o)) + ")"
};
function xS(a) {
  let n = "", r = "", o = "", l = "";
  return a.length > 5 ? (n = a.substring(1, 3), r = a.substring(3, 5), o = a.substring(5, 7), l = a.substring(7, 9)) : (n = a.substring(1, 2), r = a.substring(2, 3), o = a.substring(3, 4), l = a.substring(4, 5), n += n, r += r, o += o, l += l), {
    red: parseInt(n, 16),
    green: parseInt(r, 16),
    blue: parseInt(o, 16),
    alpha: l ? parseInt(l, 16) / 255 : 1
  };
}
const rf = {
  test: /* @__PURE__ */ rh("#"),
  parse: xS,
  transform: $i.transform
}, vs = /* @__NO_SIDE_EFFECTS__ */ (a) => ({
  test: (n) => typeof n == "string" && n.endsWith(a) && n.split(" ").length === 1,
  parse: parseFloat,
  transform: (n) => `${n}${a}`
}), Ua = /* @__PURE__ */ vs("deg"), ha = /* @__PURE__ */ vs("%"), ut = /* @__PURE__ */ vs("px"), SS = /* @__PURE__ */ vs("vh"), kS = /* @__PURE__ */ vs("vw"), w0 = {
  ...ha,
  parse: (a) => ha.parse(a) / 100,
  transform: (a) => ha.transform(a * 100)
}, Pr = {
  test: /* @__PURE__ */ rh("hsl", "hue"),
  parse: /* @__PURE__ */ eb("hue", "saturation", "lightness"),
  transform: ({ hue: a, saturation: n, lightness: r, alpha: o = 1 }) => "hsla(" + Math.round(a) + ", " + ha.transform(as(n)) + ", " + ha.transform(as(r)) + ", " + as(cs.transform(o)) + ")"
}, ke = {
  test: (a) => $i.test(a) || rf.test(a) || Pr.test(a),
  parse: (a) => $i.test(a) ? $i.parse(a) : Pr.test(a) ? Pr.parse(a) : rf.parse(a),
  transform: (a) => typeof a == "string" ? a : a.hasOwnProperty("red") ? $i.transform(a) : Pr.transform(a),
  getAnimatableNone: (a) => {
    const n = ke.parse(a);
    return n.alpha = 0, ke.transform(n);
  }
}, TS = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function ES(a) {
  return isNaN(a) && typeof a == "string" && (a.match(ih)?.length || 0) + (a.match(TS)?.length || 0) > 0;
}
const nb = "number", ab = "color", MS = "var", RS = "var(", x0 = "${}", CS = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function Xr(a) {
  const n = a.toString(), r = [], o = {
    color: [],
    number: [],
    var: []
  }, l = [];
  let u = 0;
  const h = n.replace(CS, (p) => (ke.test(p) ? (o.color.push(u), l.push(ab), r.push(ke.parse(p))) : p.startsWith(RS) ? (o.var.push(u), l.push(MS), r.push(p)) : (o.number.push(u), l.push(nb), r.push(parseFloat(p))), ++u, x0)).split(x0);
  return { values: r, split: h, indexes: o, types: l };
}
function AS(a) {
  return Xr(a).values;
}
function ib({ split: a, types: n }) {
  const r = a.length;
  return (o) => {
    let l = "";
    for (let u = 0; u < r; u++)
      if (l += a[u], o[u] !== void 0) {
        const f = n[u];
        f === nb ? l += as(o[u]) : f === ab ? l += ke.transform(o[u]) : l += o[u];
      }
    return l;
  };
}
function jS(a) {
  return ib(Xr(a));
}
const LS = (a) => typeof a == "number" ? 0 : ke.test(a) ? ke.getAnimatableNone(a) : a, DS = (a, n) => typeof a == "number" ? n?.trim().endsWith("/") ? a : 0 : LS(a);
function NS(a) {
  const n = Xr(a);
  return ib(n)(n.values.map((o, l) => DS(o, n.split[l])));
}
const aa = {
  test: ES,
  parse: AS,
  createTransformer: jS,
  getAnimatableNone: NS
};
function _d(a, n, r) {
  return r < 0 && (r += 1), r > 1 && (r -= 1), r < 1 / 6 ? a + (n - a) * 6 * r : r < 1 / 2 ? n : r < 2 / 3 ? a + (n - a) * (2 / 3 - r) * 6 : a;
}
function OS({ hue: a, saturation: n, lightness: r, alpha: o }) {
  a /= 360, n /= 100, r /= 100;
  let l = 0, u = 0, f = 0;
  if (!n)
    l = u = f = r;
  else {
    const h = r < 0.5 ? r * (1 + n) : r + n - r * n, p = 2 * r - h;
    l = _d(p, h, a + 1 / 3), u = _d(p, h, a), f = _d(p, h, a - 1 / 3);
  }
  return {
    red: Math.round(l * 255),
    green: Math.round(u * 255),
    blue: Math.round(f * 255),
    alpha: o
  };
}
function ac(a, n) {
  return (r) => r > 0 ? n : a;
}
const Jt = (a, n, r) => a + (n - a) * r, zd = (a, n, r) => {
  const o = a * a, l = r * (n * n - o) + o;
  return l < 0 ? 0 : Math.sqrt(l);
}, _S = [rf, $i, Pr], zS = (a) => _S.find((n) => n.test(a));
function S0(a) {
  const n = zS(a);
  if (!n)
    return !1;
  let r = n.parse(a);
  return n === Pr && (r = OS(r)), r;
}
const k0 = (a, n) => {
  const r = S0(a), o = S0(n);
  if (!r || !o)
    return ac(a, n);
  const l = { ...r };
  return (u) => (l.red = zd(r.red, o.red, u), l.green = zd(r.green, o.green, u), l.blue = zd(r.blue, o.blue, u), l.alpha = Jt(r.alpha, o.alpha, u), $i.transform(l));
}, of = /* @__PURE__ */ new Set(["none", "hidden"]);
function US(a, n) {
  return of.has(a) ? (r) => r <= 0 ? a : n : (r) => r >= 1 ? n : a;
}
function BS(a, n) {
  return (r) => Jt(a, n, r);
}
function oh(a) {
  return typeof a == "number" ? BS : typeof a == "string" ? ah(a) ? ac : ke.test(a) ? k0 : PS : Array.isArray(a) ? rb : typeof a == "object" ? ke.test(a) ? k0 : VS : ac;
}
function rb(a, n) {
  const r = [...a], o = r.length, l = a.map((u, f) => oh(u)(u, n[f]));
  return (u) => {
    for (let f = 0; f < o; f++)
      r[f] = l[f](u);
    return r;
  };
}
function VS(a, n) {
  const r = { ...a, ...n }, o = {};
  for (const l in r)
    a[l] !== void 0 && n[l] !== void 0 && (o[l] = oh(a[l])(a[l], n[l]));
  return (l) => {
    for (const u in o)
      r[u] = o[u](l);
    return r;
  };
}
function HS(a, n) {
  const r = [], o = { color: 0, var: 0, number: 0 };
  for (let l = 0; l < n.values.length; l++) {
    const u = n.types[l], f = a.indexes[u][o[u]], h = a.values[f] ?? 0;
    r[l] = h, o[u]++;
  }
  return r;
}
const PS = (a, n) => {
  const r = aa.createTransformer(n), o = Xr(a), l = Xr(n);
  return o.indexes.var.length === l.indexes.var.length && o.indexes.color.length === l.indexes.color.length && o.indexes.number.length >= l.indexes.number.length ? of.has(a) && !l.values.length || of.has(n) && !o.values.length ? US(a, n) : gs(rb(HS(o, l), l.values), r) : ac(a, n);
};
function ob(a, n, r) {
  return typeof a == "number" && typeof n == "number" && typeof r == "number" ? Jt(a, n, r) : oh(a)(a, n);
}
const YS = (a) => {
  const n = ({ timestamp: r }) => a(r);
  return {
    start: (r = !0) => $t.update(n, r),
    stop: () => wi(n),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => Pe.isProcessing ? Pe.timestamp : an.now()
  };
}, sb = (a, n, r = 10) => {
  let o = "";
  const l = Math.max(Math.round(n / r), 2);
  for (let u = 0; u < l; u++)
    o += Math.round(a(u / (l - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${o.substring(0, o.length - 2)})`;
}, ic = 2e4;
function sh(a) {
  let n = 0;
  const r = 50;
  let o = a.next(n);
  for (; !o.done && n < ic; )
    n += r, o = a.next(n);
  return n >= ic ? 1 / 0 : n;
}
function KS(a, n = 100, r) {
  const o = r({ ...a, keyframes: [0, n] }), l = Math.min(sh(o), ic);
  return {
    type: "keyframes",
    ease: (u) => o.next(l * u).value / n,
    duration: /* @__PURE__ */ qn(l)
  };
}
const de = {
  // Default spring physics
  stiffness: 100,
  damping: 10,
  mass: 1,
  velocity: 0,
  // Default duration/bounce-based options
  duration: 800,
  // in ms
  bounce: 0.3,
  visualDuration: 0.3,
  // in seconds
  // Rest thresholds
  restSpeed: {
    granular: 0.01,
    default: 2
  },
  restDelta: {
    granular: 5e-3,
    default: 0.5
  },
  // Limits
  minDuration: 0.01,
  // in seconds
  maxDuration: 10,
  // in seconds
  minDamping: 0.05,
  maxDamping: 1
};
function sf(a, n) {
  return a * Math.sqrt(1 - n * n);
}
const qS = 12;
function FS(a, n, r) {
  let o = r;
  for (let l = 1; l < qS; l++)
    o = o - a(o) / n(o);
  return o;
}
const Ud = 1e-3;
function GS({ duration: a = de.duration, bounce: n = de.bounce, velocity: r = de.velocity, mass: o = de.mass }) {
  let l, u, f = 1 - n;
  f = pa(de.minDamping, de.maxDamping, f), a = pa(de.minDuration, de.maxDuration, /* @__PURE__ */ qn(a)), f < 1 ? (l = (m) => {
    const g = m * f, v = g * a, b = g - r, k = sf(m, f), E = Math.exp(-v);
    return Ud - b / k * E;
  }, u = (m) => {
    const v = m * f * a, b = v * r + r, k = Math.pow(f, 2) * Math.pow(m, 2) * a, E = Math.exp(-v), A = sf(Math.pow(m, 2), f);
    return (-l(m) + Ud > 0 ? -1 : 1) * ((b - k) * E) / A;
  }) : (l = (m) => {
    const g = Math.exp(-m * a), v = (m - r) * a + 1;
    return -Ud + g * v;
  }, u = (m) => {
    const g = Math.exp(-m * a), v = (r - m) * (a * a);
    return g * v;
  });
  const h = 5 / a, p = FS(l, u, h);
  if (a = /* @__PURE__ */ Rn(a), isNaN(p))
    return {
      stiffness: de.stiffness,
      damping: de.damping,
      duration: a
    };
  {
    const m = Math.pow(p, 2) * o;
    return {
      stiffness: m,
      damping: f * 2 * Math.sqrt(o * m),
      duration: a
    };
  }
}
const IS = ["duration", "bounce"], XS = ["stiffness", "damping", "mass"];
function T0(a, n) {
  return n.some((r) => a[r] !== void 0);
}
function WS(a) {
  let n = {
    velocity: de.velocity,
    stiffness: de.stiffness,
    damping: de.damping,
    mass: de.mass,
    isResolvedFromDuration: !1,
    ...a
  };
  if (!T0(a, XS) && T0(a, IS))
    if (n.velocity = 0, a.visualDuration) {
      const r = a.visualDuration, o = 2 * Math.PI / (r * 1.2), l = o * o, u = 2 * pa(0.05, 1, 1 - (a.bounce || 0)) * Math.sqrt(l);
      n = {
        ...n,
        mass: de.mass,
        stiffness: l,
        damping: u
      };
    } else {
      const r = GS({ ...a, velocity: 0 });
      n = {
        ...n,
        ...r,
        mass: de.mass
      }, n.isResolvedFromDuration = !0;
    }
  return n;
}
function rc(a = de.visualDuration, n = de.bounce) {
  const r = typeof a != "object" ? {
    visualDuration: a,
    keyframes: [0, 1],
    bounce: n
  } : a;
  let { restSpeed: o, restDelta: l } = r;
  const u = r.keyframes[0], f = r.keyframes[r.keyframes.length - 1], h = { done: !1, value: u }, { stiffness: p, damping: m, mass: g, duration: v, velocity: b, isResolvedFromDuration: k } = WS({
    ...r,
    velocity: -/* @__PURE__ */ qn(r.velocity || 0)
  }), E = b || 0, A = m / (2 * Math.sqrt(p * g)), C = f - u, M = /* @__PURE__ */ qn(Math.sqrt(p / g)), D = Math.abs(C) < 5;
  o || (o = D ? de.restSpeed.granular : de.restSpeed.default), l || (l = D ? de.restDelta.granular : de.restDelta.default);
  let R, z, Z, W, X, F;
  if (A < 1)
    Z = sf(M, A), W = (E + A * M * C) / Z, R = (rt) => {
      const pt = Math.exp(-A * M * rt);
      return f - pt * (W * Math.sin(Z * rt) + C * Math.cos(Z * rt));
    }, X = A * M * W + C * Z, F = A * M * C - W * Z, z = (rt) => Math.exp(-A * M * rt) * (X * Math.sin(Z * rt) + F * Math.cos(Z * rt));
  else if (A === 1) {
    R = (pt) => f - Math.exp(-M * pt) * (C + (E + M * C) * pt);
    const rt = E + M * C;
    z = (pt) => Math.exp(-M * pt) * (M * rt * pt - E);
  } else {
    const rt = M * Math.sqrt(A * A - 1);
    R = (Tt) => {
      const bt = Math.exp(-A * M * Tt), Y = Math.min(rt * Tt, 300);
      return f - bt * ((E + A * M * C) * Math.sinh(Y) + rt * C * Math.cosh(Y)) / rt;
    };
    const pt = (E + A * M * C) / rt, yt = A * M * pt - C * rt, vt = A * M * C - pt * rt;
    z = (Tt) => {
      const bt = Math.exp(-A * M * Tt), Y = Math.min(rt * Tt, 300);
      return bt * (yt * Math.sinh(Y) + vt * Math.cosh(Y));
    };
  }
  const at = {
    calculatedDuration: k && v || null,
    velocity: (rt) => /* @__PURE__ */ Rn(z(rt)),
    next: (rt) => {
      if (!k && A < 1) {
        const yt = Math.exp(-A * M * rt), vt = Math.sin(Z * rt), Tt = Math.cos(Z * rt), bt = f - yt * (W * vt + C * Tt), Y = /* @__PURE__ */ Rn(yt * (X * vt + F * Tt));
        return h.done = Math.abs(Y) <= o && Math.abs(f - bt) <= l, h.value = h.done ? f : bt, h;
      }
      const pt = R(rt);
      if (k)
        h.done = rt >= v;
      else {
        const yt = /* @__PURE__ */ Rn(z(rt));
        h.done = Math.abs(yt) <= o && Math.abs(f - pt) <= l;
      }
      return h.value = h.done ? f : pt, h;
    },
    toString: () => {
      const rt = Math.min(sh(at), ic), pt = sb((yt) => at.next(rt * yt).value, rt, 30);
      return rt + "ms " + pt;
    },
    toTransition: () => {
    }
  };
  return at;
}
rc.applyToOptions = (a) => {
  const n = KS(a, 100, rc);
  return a.ease = n.ease, a.duration = /* @__PURE__ */ Rn(n.duration), a.type = "keyframes", a;
};
const QS = 5;
function lb(a, n, r) {
  const o = Math.max(n - QS, 0);
  return /* @__PURE__ */ Pv(r - a(o), n - o);
}
function lf({ keyframes: a, velocity: n = 0, power: r = 0.8, timeConstant: o = 325, bounceDamping: l = 10, bounceStiffness: u = 500, modifyTarget: f, min: h, max: p, restDelta: m = 0.5, restSpeed: g }) {
  const v = a[0], b = {
    done: !1,
    value: v
  }, k = (F) => h !== void 0 && F < h || p !== void 0 && F > p, E = (F) => h === void 0 ? p : p === void 0 || Math.abs(h - F) < Math.abs(p - F) ? h : p;
  let A = r * n;
  const C = v + A, M = f === void 0 ? C : f(C);
  M !== C && (A = M - v);
  const D = (F) => -A * Math.exp(-F / o), R = (F) => M + D(F), z = (F) => {
    const at = D(F), rt = R(F);
    b.done = Math.abs(at) <= m, b.value = b.done ? M : rt;
  };
  let Z, W;
  const X = (F) => {
    k(b.value) && (Z = F, W = rc({
      keyframes: [b.value, E(b.value)],
      velocity: lb(R, F, b.value),
      // TODO: This should be passing * 1000
      damping: l,
      stiffness: u,
      restDelta: m,
      restSpeed: g
    }));
  };
  return X(0), {
    calculatedDuration: null,
    next: (F) => {
      let at = !1;
      return !W && Z === void 0 && (at = !0, z(F), X(F)), Z !== void 0 && F >= Z ? W.next(F - Z) : (!at && z(F), b);
    }
  };
}
function ZS(a, n, r) {
  const o = [], l = r || bi.mix || ob, u = a.length - 1;
  for (let f = 0; f < u; f++) {
    let h = l(a[f], a[f + 1]);
    if (n) {
      const p = Array.isArray(n) ? n[f] || Fn : n;
      h = gs(p, h);
    }
    o.push(h);
  }
  return o;
}
function JS(a, n, { clamp: r = !0, ease: o, mixer: l } = {}) {
  const u = a.length;
  if ($f(u === n.length), u === 1)
    return () => n[0];
  if (u === 2 && n[0] === n[1])
    return () => n[1];
  const f = a[0] === a[1];
  a[0] > a[u - 1] && (a = [...a].reverse(), n = [...n].reverse());
  const h = ZS(n, o, l), p = h.length, m = (g) => {
    if (f && g < a[0])
      return n[0];
    let v = 0;
    if (p > 1)
      for (; v < a.length - 2 && !(g < a[v + 1]); v++)
        ;
    const b = /* @__PURE__ */ ls(a[v], a[v + 1], g);
    return h[v](b);
  };
  return r ? (g) => m(pa(a[0], a[u - 1], g)) : m;
}
function $S(a, n) {
  const r = a[a.length - 1];
  for (let o = 1; o <= n; o++) {
    const l = /* @__PURE__ */ ls(0, n, o);
    a.push(Jt(r, 1, l));
  }
}
function tk(a) {
  const n = [0];
  return $S(n, a.length - 1), n;
}
function ek(a, n) {
  return a.map((r) => r * n);
}
function nk(a, n) {
  return a.map(() => n || Qv).splice(0, a.length - 1);
}
function is({ duration: a = 300, keyframes: n, times: r, ease: o = "easeInOut" }) {
  const l = /* @__PURE__ */ uS(o) ? o.map(v0) : v0(o), u = {
    done: !1,
    value: n[0]
  }, f = ek(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    r && r.length === n.length ? r : tk(n),
    a
  ), h = JS(f, n, {
    ease: Array.isArray(l) ? l : nk(n, l)
  });
  return {
    calculatedDuration: a,
    next: (p) => (u.value = h(p), u.done = p >= a, u)
  };
}
const ak = (a) => a !== null;
function gc(a, { repeat: n, repeatType: r = "loop" }, o, l = 1) {
  const u = a.filter(ak), h = l < 0 || n && r !== "loop" && n % 2 === 1 ? 0 : u.length - 1;
  return !h || o === void 0 ? u[h] : o;
}
const ik = {
  decay: lf,
  inertia: lf,
  tween: is,
  keyframes: is,
  spring: rc
};
function cb(a) {
  typeof a.type == "string" && (a.type = ik[a.type]);
}
class lh {
  constructor() {
    this.updateFinished();
  }
  get finished() {
    return this._finished;
  }
  updateFinished() {
    this._finished = new Promise((n) => {
      this.resolve = n;
    });
  }
  notifyFinished() {
    this.resolve();
  }
  /**
   * Allows the animation to be awaited.
   *
   * @deprecated Use `finished` instead.
   */
  then(n, r) {
    return this.finished.then(n, r);
  }
}
const rk = (a) => a / 100;
class oc extends lh {
  constructor(n) {
    super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
      done: !1,
      value: void 0
    }, this.stop = () => {
      const { motionValue: r } = this.options;
      r && r.updatedAt !== an.now() && this.tick(an.now()), this.isStopped = !0, this.state !== "idle" && (this.teardown(), this.options.onStop?.());
    }, this.options = n, this.initAnimation(), this.play(), n.autoplay === !1 && this.pause();
  }
  initAnimation() {
    const { options: n } = this;
    cb(n);
    const { type: r = is, repeat: o = 0, repeatDelay: l = 0, repeatType: u, velocity: f = 0 } = n;
    let { keyframes: h } = n;
    const p = r || is;
    p !== is && typeof h[0] != "number" && (this.mixKeyframes = gs(rk, ob(h[0], h[1])), h = [0, 100]);
    const m = p({ ...n, keyframes: h });
    u === "mirror" && (this.mirroredGenerator = p({
      ...n,
      keyframes: [...h].reverse(),
      velocity: -f
    })), m.calculatedDuration === null && (m.calculatedDuration = sh(m));
    const { calculatedDuration: g } = m;
    this.calculatedDuration = g, this.resolvedDuration = g + l, this.totalDuration = this.resolvedDuration * (o + 1) - l, this.generator = m;
  }
  updateTime(n) {
    const r = Math.round(n - this.startTime) * this.playbackSpeed;
    this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = r;
  }
  tick(n, r = !1) {
    const { generator: o, totalDuration: l, mixKeyframes: u, mirroredGenerator: f, resolvedDuration: h, calculatedDuration: p } = this;
    if (this.startTime === null)
      return o.next(0);
    const { delay: m = 0, keyframes: g, repeat: v, repeatType: b, repeatDelay: k, type: E, onUpdate: A, finalKeyframe: C } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, n) : this.speed < 0 && (this.startTime = Math.min(n - l / this.speed, this.startTime)), r ? this.currentTime = n : this.updateTime(n);
    const M = this.currentTime - m * (this.playbackSpeed >= 0 ? 1 : -1), D = this.playbackSpeed >= 0 ? M < 0 : M > l;
    this.currentTime = Math.max(M, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = l);
    let R = this.currentTime, z = o;
    if (v) {
      const F = Math.min(this.currentTime, l) / h;
      let at = Math.floor(F), rt = F % 1;
      !rt && F >= 1 && (rt = 1), rt === 1 && at--, at = Math.min(at, v + 1), at % 2 && (b === "reverse" ? (rt = 1 - rt, k && (rt -= k / h)) : b === "mirror" && (z = f)), R = pa(0, 1, rt) * h;
    }
    let Z;
    D ? (this.delayState.value = g[0], Z = this.delayState) : Z = z.next(R), u && !D && (Z.value = u(Z.value));
    let { done: W } = Z;
    !D && p !== null && (W = this.playbackSpeed >= 0 ? this.currentTime >= l : this.currentTime <= 0);
    const X = this.holdTime === null && (this.state === "finished" || this.state === "running" && W);
    return X && E !== lf && (Z.value = gc(g, this.options, C, this.speed)), A && A(Z.value), X && this.finish(), Z;
  }
  /**
   * Allows the returned animation to be awaited or promise-chained. Currently
   * resolves when the animation finishes at all but in a future update could/should
   * reject if its cancels.
   */
  then(n, r) {
    return this.finished.then(n, r);
  }
  get duration() {
    return /* @__PURE__ */ qn(this.calculatedDuration);
  }
  get iterationDuration() {
    const { delay: n = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ qn(n);
  }
  get time() {
    return /* @__PURE__ */ qn(this.currentTime);
  }
  set time(n) {
    n = /* @__PURE__ */ Rn(n), this.currentTime = n, this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0 ? this.holdTime = n : this.driver && (this.startTime = this.driver.now() - n / this.playbackSpeed), this.driver ? this.driver.start(!1) : (this.startTime = 0, this.state = "paused", this.holdTime = n, this.tick(n));
  }
  /**
   * Returns the generator's velocity at the current time in units/second.
   * Uses the analytical derivative when available (springs), avoiding
   * the MotionValue's frame-dependent velocity estimation.
   */
  getGeneratorVelocity() {
    const n = this.currentTime;
    if (n <= 0)
      return this.options.velocity || 0;
    if (this.generator.velocity)
      return this.generator.velocity(n);
    const r = this.generator.next(n).value;
    return lb((o) => this.generator.next(o).value, n, r);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(n) {
    const r = this.playbackSpeed !== n;
    r && this.driver && this.updateTime(an.now()), this.playbackSpeed = n, r && this.driver && (this.time = /* @__PURE__ */ qn(this.currentTime));
  }
  play() {
    if (this.isStopped)
      return;
    const { driver: n = YS, startTime: r } = this.options;
    this.driver || (this.driver = n((l) => this.tick(l))), this.options.onPlay?.();
    const o = this.driver.now();
    this.state === "finished" ? (this.updateFinished(), this.startTime = o) : this.holdTime !== null ? this.startTime = o - this.holdTime : this.startTime || (this.startTime = r ?? o), this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start();
  }
  pause() {
    this.state = "paused", this.updateTime(an.now()), this.holdTime = this.currentTime;
  }
  complete() {
    this.state !== "running" && this.play(), this.state = "finished", this.holdTime = null;
  }
  finish() {
    this.notifyFinished(), this.teardown(), this.state = "finished", this.options.onComplete?.();
  }
  cancel() {
    this.holdTime = null, this.startTime = 0, this.tick(0), this.teardown(), this.options.onCancel?.();
  }
  teardown() {
    this.state = "idle", this.stopDriver(), this.startTime = this.holdTime = null;
  }
  stopDriver() {
    this.driver && (this.driver.stop(), this.driver = void 0);
  }
  sample(n) {
    return this.startTime = 0, this.tick(n, !0);
  }
  attachTimeline(n) {
    return this.options.allowFlatten && (this.options.type = "keyframes", this.options.ease = "linear", this.initAnimation()), this.driver?.stop(), n.observe(this);
  }
}
function ok(a) {
  for (let n = 1; n < a.length; n++)
    a[n] ?? (a[n] = a[n - 1]);
}
const tr = (a) => a * 180 / Math.PI, cf = (a) => {
  const n = tr(Math.atan2(a[1], a[0]));
  return uf(n);
}, sk = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (a) => (Math.abs(a[0]) + Math.abs(a[3])) / 2,
  rotate: cf,
  rotateZ: cf,
  skewX: (a) => tr(Math.atan(a[1])),
  skewY: (a) => tr(Math.atan(a[2])),
  skew: (a) => (Math.abs(a[1]) + Math.abs(a[2])) / 2
}, uf = (a) => (a = a % 360, a < 0 && (a += 360), a), E0 = cf, M0 = (a) => Math.sqrt(a[0] * a[0] + a[1] * a[1]), R0 = (a) => Math.sqrt(a[4] * a[4] + a[5] * a[5]), lk = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: M0,
  scaleY: R0,
  scale: (a) => (M0(a) + R0(a)) / 2,
  rotateX: (a) => uf(tr(Math.atan2(a[6], a[5]))),
  rotateY: (a) => uf(tr(Math.atan2(-a[2], a[0]))),
  rotateZ: E0,
  rotate: E0,
  skewX: (a) => tr(Math.atan(a[4])),
  skewY: (a) => tr(Math.atan(a[1])),
  skew: (a) => (Math.abs(a[1]) + Math.abs(a[4])) / 2
};
function df(a) {
  return a.includes("scale") ? 1 : 0;
}
function ff(a, n) {
  if (!a || a === "none")
    return df(n);
  const r = a.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let o, l;
  if (r)
    o = lk, l = r;
  else {
    const h = a.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    o = sk, l = h;
  }
  if (!l)
    return df(n);
  const u = o[n], f = l[1].split(",").map(uk);
  return typeof u == "function" ? u(f) : f[u];
}
const ck = (a, n) => {
  const { transform: r = "none" } = getComputedStyle(a);
  return ff(r, n);
};
function uk(a) {
  return parseFloat(a.trim());
}
const Jr = [
  "transformPerspective",
  "x",
  "y",
  "z",
  "translateX",
  "translateY",
  "translateZ",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skew",
  "skewX",
  "skewY"
], $r = /* @__PURE__ */ new Set([...Jr, "pathRotation"]), C0 = (a) => a === Zr || a === ut, dk = /* @__PURE__ */ new Set(["x", "y", "z"]), fk = Jr.filter((a) => !dk.has(a));
function hk(a) {
  const n = [];
  return fk.forEach((r) => {
    const o = a.getValue(r);
    o !== void 0 && (n.push([r, o.get()]), o.set(r.startsWith("scale") ? 1 : 0));
  }), n;
}
const vi = {
  // Dimensions
  width: ({ x: a }, { paddingLeft: n = "0", paddingRight: r = "0", boxSizing: o }) => {
    const l = a.max - a.min;
    return o === "border-box" ? l : l - parseFloat(n) - parseFloat(r);
  },
  height: ({ y: a }, { paddingTop: n = "0", paddingBottom: r = "0", boxSizing: o }) => {
    const l = a.max - a.min;
    return o === "border-box" ? l : l - parseFloat(n) - parseFloat(r);
  },
  top: (a, { top: n }) => parseFloat(n),
  left: (a, { left: n }) => parseFloat(n),
  bottom: ({ y: a }, { top: n }) => parseFloat(n) + (a.max - a.min),
  right: ({ x: a }, { left: n }) => parseFloat(n) + (a.max - a.min),
  // Transform
  x: (a, { transform: n }) => ff(n, "x"),
  y: (a, { transform: n }) => ff(n, "y")
};
vi.translateX = vi.x;
vi.translateY = vi.y;
const er = /* @__PURE__ */ new Set();
let hf = !1, pf = !1, mf = !1;
function ub() {
  if (pf) {
    const a = Array.from(er).filter((o) => o.needsMeasurement), n = new Set(a.map((o) => o.element)), r = /* @__PURE__ */ new Map();
    n.forEach((o) => {
      const l = hk(o);
      l.length && (r.set(o, l), o.render());
    }), a.forEach((o) => o.measureInitialState()), n.forEach((o) => {
      o.render();
      const l = r.get(o);
      l && l.forEach(([u, f]) => {
        o.getValue(u)?.set(f);
      });
    }), a.forEach((o) => o.measureEndState()), a.forEach((o) => {
      o.suspendedScrollY !== void 0 && window.scrollTo(0, o.suspendedScrollY);
    });
  }
  pf = !1, hf = !1, er.forEach((a) => a.complete(mf)), er.clear();
}
function db() {
  er.forEach((a) => {
    a.readKeyframes(), a.needsMeasurement && (pf = !0);
  });
}
function pk() {
  mf = !0, db(), ub(), mf = !1;
}
class ch {
  constructor(n, r, o, l, u, f = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...n], this.onComplete = r, this.name = o, this.motionValue = l, this.element = u, this.isAsync = f;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (er.add(this), hf || (hf = !0, $t.read(db), $t.resolveKeyframes(ub))) : (this.readKeyframes(), this.complete());
  }
  readKeyframes() {
    const { unresolvedKeyframes: n, name: r, element: o, motionValue: l } = this;
    if (n[0] === null) {
      const u = l?.get(), f = n[n.length - 1];
      if (u !== void 0)
        n[0] = u;
      else if (o && r) {
        const h = o.readValue(r, f);
        h != null && (n[0] = h);
      }
      n[0] === void 0 && (n[0] = f), l && u === void 0 && l.set(n[0]);
    }
    ok(n);
  }
  setFinalKeyframe() {
  }
  measureInitialState() {
  }
  renderEndStyles() {
  }
  measureEndState() {
  }
  complete(n = !1) {
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, n), er.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (er.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const mk = (a) => a.startsWith("--");
function fb(a, n, r) {
  mk(n) ? a.style.setProperty(n, r) : a.style[n] = r;
}
const gk = {};
function hb(a, n) {
  const r = /* @__PURE__ */ Hv(a);
  return () => gk[n] ?? r();
}
const yk = /* @__PURE__ */ hb(() => window.ScrollTimeline !== void 0, "scrollTimeline"), pb = /* @__PURE__ */ hb(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), es = ([a, n, r, o]) => `cubic-bezier(${a}, ${n}, ${r}, ${o})`, A0 = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ es([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ es([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ es([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ es([0.33, 1.53, 0.69, 0.99])
};
function mb(a, n) {
  if (a)
    return typeof a == "function" ? pb() ? sb(a, n) : "ease-out" : /* @__PURE__ */ Zv(a) ? es(a) : Array.isArray(a) ? a.map((r) => mb(r, n) || A0.easeOut) : A0[a];
}
function vk(a, n, r, { delay: o = 0, duration: l = 300, repeat: u = 0, repeatType: f = "loop", ease: h = "easeOut", times: p } = {}, m = void 0) {
  const g = {
    [n]: r
  };
  p && (g.offset = p);
  const v = mb(h, l);
  Array.isArray(v) && (g.easing = v);
  const b = {
    delay: o,
    duration: l,
    easing: Array.isArray(v) ? "linear" : v,
    fill: "both",
    iterations: u + 1,
    direction: f === "reverse" ? "alternate" : "normal"
  };
  return m && (b.pseudoElement = m), a.animate(g, b);
}
function gb(a) {
  return typeof a == "function" && "applyToOptions" in a;
}
function bk({ type: a, ...n }) {
  return gb(a) && pb() ? a.applyToOptions(n) : (n.duration ?? (n.duration = 300), n.ease ?? (n.ease = "easeOut"), n);
}
class yb extends lh {
  constructor(n) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !n)
      return;
    const { element: r, name: o, keyframes: l, pseudoElement: u, allowFlatten: f = !1, finalKeyframe: h, onComplete: p } = n;
    this.isPseudoElement = !!u, this.allowFlatten = f, this.options = n, $f(typeof n.type != "string");
    const m = bk(n);
    this.animation = vk(r, o, l, m, u), m.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !u) {
        const g = gc(l, this.options, h, this.speed);
        this.updateMotionValue && this.updateMotionValue(g), fb(r, o, g), this.animation.cancel();
      }
      p?.(), this.notifyFinished();
    };
  }
  play() {
    this.isStopped || (this.manualStartTime = null, this.animation.play(), this.state === "finished" && this.updateFinished());
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    this.animation.finish?.();
  }
  cancel() {
    try {
      this.animation.cancel();
    } catch {
    }
  }
  stop() {
    if (this.isStopped)
      return;
    this.isStopped = !0;
    const { state: n } = this;
    n === "idle" || n === "finished" || (this.updateMotionValue ? this.updateMotionValue() : this.commitStyles(), this.isPseudoElement || this.cancel());
  }
  /**
   * WAAPI doesn't natively have any interruption capabilities.
   *
   * In this method, we commit styles back to the DOM before cancelling
   * the animation.
   *
   * This is designed to be overridden by NativeAnimationExtended, which
   * will create a renderless JS animation and sample it twice to calculate
   * its current value, "previous" value, and therefore allow
   * Motion to also correctly calculate velocity for any subsequent animation
   * while deferring the commit until the next animation frame.
   */
  commitStyles() {
    const n = this.options?.element;
    !this.isPseudoElement && n?.isConnected && this.animation.commitStyles?.();
  }
  get duration() {
    const n = this.animation.effect?.getComputedTiming?.().duration || 0;
    return /* @__PURE__ */ qn(Number(n));
  }
  get iterationDuration() {
    const { delay: n = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ qn(n);
  }
  get time() {
    return /* @__PURE__ */ qn(Number(this.animation.currentTime) || 0);
  }
  set time(n) {
    const r = this.finishedTime !== null;
    this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = /* @__PURE__ */ Rn(n), r && this.animation.pause();
  }
  /**
   * The playback speed of the animation.
   * 1 = normal speed, 2 = double speed, 0.5 = half speed.
   */
  get speed() {
    return this.animation.playbackRate;
  }
  set speed(n) {
    n < 0 && (this.finishedTime = null), this.animation.playbackRate = n;
  }
  get state() {
    return this.finishedTime !== null ? "finished" : this.animation.playState;
  }
  get startTime() {
    return this.manualStartTime ?? Number(this.animation.startTime);
  }
  set startTime(n) {
    this.manualStartTime = this.animation.startTime = n;
  }
  /**
   * Attaches a timeline to the animation, for instance the `ScrollTimeline`.
   */
  attachTimeline({ timeline: n, rangeStart: r, rangeEnd: o, observe: l }) {
    return this.allowFlatten && this.animation.effect?.updateTiming({ easing: "linear" }), this.animation.onfinish = null, n && yk() ? (this.animation.timeline = n, r && (this.animation.rangeStart = r), o && (this.animation.rangeEnd = o), Fn) : l(this);
  }
}
const vb = {
  anticipate: Iv,
  backInOut: Gv,
  circInOut: Wv
};
function wk(a) {
  return a in vb;
}
function xk(a) {
  typeof a.ease == "string" && wk(a.ease) && (a.ease = vb[a.ease]);
}
const Bd = 10;
class Sk extends yb {
  constructor(n) {
    xk(n), cb(n), super(n), n.startTime !== void 0 && n.autoplay !== !1 && (this.startTime = n.startTime), this.options = n;
  }
  /**
   * WAAPI doesn't natively have any interruption capabilities.
   *
   * Rather than read committed styles back out of the DOM, we can
   * create a renderless JS animation and sample it twice to calculate
   * its current value, "previous" value, and therefore allow
   * Motion to calculate velocity for any subsequent animation.
   */
  updateMotionValue(n) {
    const { motionValue: r, onUpdate: o, onComplete: l, element: u, ...f } = this.options;
    if (!r)
      return;
    if (n !== void 0) {
      r.set(n);
      return;
    }
    const h = new oc({
      ...f,
      autoplay: !1
    }), p = Math.max(Bd, an.now() - this.startTime), m = pa(0, Bd, p - Bd), g = h.sample(p).value, { name: v } = this.options;
    u && v && fb(u, v, g), r.setWithVelocity(h.sample(Math.max(0, p - m)).value, g, m), h.stop();
  }
}
const j0 = (a, n) => n === "zIndex" ? !1 : !!(typeof a == "number" || Array.isArray(a) || typeof a == "string" && // It's animatable if we have a string
(aa.test(a) || a === "0") && // And it contains numbers and/or colors
!a.startsWith("url("));
function kk(a) {
  const n = a[0];
  if (a.length === 1)
    return !0;
  for (let r = 0; r < a.length; r++)
    if (a[r] !== n)
      return !0;
}
function Tk(a, n, r, o) {
  const l = a[0];
  if (l === null)
    return !1;
  if (n === "display" || n === "visibility")
    return !0;
  const u = a[a.length - 1], f = j0(l, n), h = j0(u, n);
  return !f || !h ? !1 : kk(a) || (r === "spring" || gb(r)) && o;
}
function gf(a) {
  a.duration = 0, a.type = "keyframes";
}
const bb = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]), Ek = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function Mk(a) {
  for (let n = 0; n < a.length; n++)
    if (typeof a[n] == "string" && Ek.test(a[n]))
      return !0;
  return !1;
}
const Rk = /* @__PURE__ */ new Set([
  "color",
  "backgroundColor",
  "outlineColor",
  "fill",
  "stroke",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor"
]), Ck = /* @__PURE__ */ Hv(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function Ak(a) {
  const { motionValue: n, name: r, repeatDelay: o, repeatType: l, damping: u, type: f, keyframes: h } = a;
  if (!(n?.owner?.current instanceof HTMLElement))
    return !1;
  const { onUpdate: m, transformTemplate: g } = n.owner.getProps();
  return Ck() && r && /**
   * Force WAAPI for color properties with browser-only color formats
   * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
   */
  (bb.has(r) || Rk.has(r) && Mk(h)) && (r !== "transform" || !g) && /**
   * If we're outputting values to onUpdate then we can't use WAAPI as there's
   * no way to read the value from WAAPI every frame.
   */
  !m && !o && l !== "mirror" && u !== 0 && f !== "inertia";
}
const jk = 40;
class Lk extends lh {
  constructor({ autoplay: n = !0, delay: r = 0, type: o = "keyframes", repeat: l = 0, repeatDelay: u = 0, repeatType: f = "loop", keyframes: h, name: p, motionValue: m, element: g, ...v }) {
    super(), this.stop = () => {
      this._animation && (this._animation.stop(), this.stopTimeline?.()), this.keyframeResolver?.cancel();
    }, this.createdAt = an.now();
    const b = {
      autoplay: n,
      delay: r,
      type: o,
      repeat: l,
      repeatDelay: u,
      repeatType: f,
      name: p,
      motionValue: m,
      element: g,
      ...v
    }, k = g?.KeyframeResolver || ch;
    this.keyframeResolver = new k(h, (E, A, C) => this.onKeyframesResolved(E, A, b, !C), p, m, g), this.keyframeResolver?.scheduleResolve();
  }
  onKeyframesResolved(n, r, o, l) {
    this.keyframeResolver = void 0;
    const { name: u, type: f, velocity: h, delay: p, isHandoff: m, onUpdate: g } = o;
    this.resolvedAt = an.now();
    let v = !0;
    Tk(n, u, f, h) || (v = !1, (bi.instantAnimations || !p) && g?.(gc(n, o, r)), n[0] = n[n.length - 1], gf(o), o.repeat = 0);
    const k = {
      startTime: l ? this.resolvedAt ? this.resolvedAt - this.createdAt > jk ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: r,
      ...o,
      keyframes: n
    }, E = v && !m && Ak(k), A = k.motionValue?.owner?.current;
    let C;
    if (E)
      try {
        C = new Sk({
          ...k,
          element: A
        });
      } catch {
        C = new oc(k);
      }
    else
      C = new oc(k);
    C.finished.then(() => {
      this.notifyFinished();
    }).catch(Fn), this.pendingTimeline && (this.stopTimeline = C.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = C;
  }
  get finished() {
    return this._animation ? this.animation.finished : this._finished;
  }
  then(n, r) {
    return this.finished.finally(n).then(() => {
    });
  }
  get animation() {
    return this._animation || (this.keyframeResolver?.resume(), pk()), this._animation;
  }
  get duration() {
    return this.animation.duration;
  }
  get iterationDuration() {
    return this.animation.iterationDuration;
  }
  get time() {
    return this.animation.time;
  }
  set time(n) {
    this.animation.time = n;
  }
  get speed() {
    return this.animation.speed;
  }
  get state() {
    return this.animation.state;
  }
  set speed(n) {
    this.animation.speed = n;
  }
  get startTime() {
    return this.animation.startTime;
  }
  attachTimeline(n) {
    return this._animation ? this.stopTimeline = this.animation.attachTimeline(n) : this.pendingTimeline = n, () => this.stop();
  }
  play() {
    this.animation.play();
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    this.animation.complete();
  }
  cancel() {
    this._animation && this.animation.cancel(), this.keyframeResolver?.cancel();
  }
}
function wb(a, n, r, o = 0, l = 1) {
  const u = Array.from(a).sort((m, g) => m.sortNodePosition(g)).indexOf(n), f = a.size, h = (f - 1) * o;
  return typeof r == "function" ? r(u, f) : l === 1 ? u * o : h - u * o;
}
const L0 = 30, Dk = (a) => !isNaN(parseFloat(a));
class Nk {
  /**
   * @param init - The initiating value
   * @param config - Optional configuration options
   *
   * -  `transformer`: A function to transform incoming values with.
   */
  constructor(n, r = {}) {
    this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (o) => {
      const l = an.now();
      if (this.updatedAt !== l && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(o), this.current !== this.prev && (this.events.change?.notify(this.current), this.dependents))
        for (const u of this.dependents)
          u.dirty();
    }, this.hasAnimated = !1, this.setCurrent(n), this.owner = r.owner;
  }
  setCurrent(n) {
    this.current = n, this.updatedAt = an.now(), this.canTrackVelocity === null && n !== void 0 && (this.canTrackVelocity = Dk(this.current));
  }
  setPrevFrameValue(n = this.current) {
    this.prevFrameValue = n, this.prevUpdatedAt = this.updatedAt;
  }
  /**
   * Adds a function that will be notified when the `MotionValue` is updated.
   *
   * It returns a function that, when called, will cancel the subscription.
   *
   * When calling `onChange` inside a React component, it should be wrapped with the
   * `useEffect` hook. As it returns an unsubscribe function, this should be returned
   * from the `useEffect` function to ensure you don't add duplicate subscribers..
   *
   * ```jsx
   * export const MyComponent = () => {
   *   const x = useMotionValue(0)
   *   const y = useMotionValue(0)
   *   const opacity = useMotionValue(1)
   *
   *   useEffect(() => {
   *     function updateOpacity() {
   *       const maxXY = Math.max(x.get(), y.get())
   *       const newOpacity = transform(maxXY, [0, 100], [1, 0])
   *       opacity.set(newOpacity)
   *     }
   *
   *     const unsubscribeX = x.on("change", updateOpacity)
   *     const unsubscribeY = y.on("change", updateOpacity)
   *
   *     return () => {
   *       unsubscribeX()
   *       unsubscribeY()
   *     }
   *   }, [])
   *
   *   return <motion.div style={{ x }} />
   * }
   * ```
   *
   * @param subscriber - A function that receives the latest value.
   * @returns A function that, when called, will cancel this subscription.
   *
   * @deprecated
   */
  onChange(n) {
    return this.on("change", n);
  }
  on(n, r) {
    this.events[n] || (this.events[n] = new th());
    const o = this.events[n].add(r);
    return n === "change" ? () => {
      o(), $t.read(() => {
        this.events.change.getSize() || this.stop();
      });
    } : o;
  }
  clearListeners() {
    for (const n in this.events)
      this.events[n].clear();
  }
  /**
   * Attaches a passive effect to the `MotionValue`.
   */
  attach(n, r) {
    this.passiveEffect = n, this.stopPassiveEffect = r;
  }
  /**
   * Sets the state of the `MotionValue`.
   *
   * @remarks
   *
   * ```jsx
   * const x = useMotionValue(0)
   * x.set(10)
   * ```
   *
   * @param latest - Latest value to set.
   * @param render - Whether to notify render subscribers. Defaults to `true`
   *
   * @public
   */
  set(n) {
    this.passiveEffect ? this.passiveEffect(n, this.updateAndNotify) : this.updateAndNotify(n);
  }
  setWithVelocity(n, r, o) {
    this.set(r), this.prev = void 0, this.prevFrameValue = n, this.prevUpdatedAt = this.updatedAt - o;
  }
  /**
   * Set the state of the `MotionValue`, stopping any active animations,
   * effects, and resets velocity to `0`.
   */
  jump(n, r = !0) {
    this.updateAndNotify(n), this.prev = n, this.prevUpdatedAt = this.prevFrameValue = void 0, r && this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
  dirty() {
    this.events.change?.notify(this.current);
  }
  addDependent(n) {
    this.dependents || (this.dependents = /* @__PURE__ */ new Set()), this.dependents.add(n);
  }
  removeDependent(n) {
    this.dependents && this.dependents.delete(n);
  }
  /**
   * Returns the latest state of `MotionValue`
   *
   * @returns - The latest state of `MotionValue`
   *
   * @public
   */
  get() {
    return this.current;
  }
  /**
   * @public
   */
  getPrevious() {
    return this.prev;
  }
  /**
   * Returns the latest velocity of `MotionValue`
   *
   * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
   *
   * @public
   */
  getVelocity() {
    const n = an.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || n - this.updatedAt > L0)
      return 0;
    const r = Math.min(this.updatedAt - this.prevUpdatedAt, L0);
    return /* @__PURE__ */ Pv(parseFloat(this.current) - parseFloat(this.prevFrameValue), r);
  }
  /**
   * Registers a new animation to control this `MotionValue`. Only one
   * animation can drive a `MotionValue` at one time.
   *
   * ```jsx
   * value.start()
   * ```
   *
   * @param animation - A function that starts the provided animation
   */
  start(n) {
    return this.stop(), new Promise((r) => {
      this.hasAnimated = !0, this.animation = n(r), this.events.animationStart && this.events.animationStart.notify();
    }).then(() => {
      this.events.animationComplete && this.events.animationComplete.notify(), this.clearAnimation();
    });
  }
  /**
   * Stop the currently active animation.
   *
   * @public
   */
  stop() {
    this.animation && (this.animation.stop(), this.events.animationCancel && this.events.animationCancel.notify()), this.clearAnimation();
  }
  /**
   * Returns `true` if this value is currently animating.
   *
   * @public
   */
  isAnimating() {
    return !!this.animation;
  }
  clearAnimation() {
    delete this.animation;
  }
  /**
   * Destroy and clean up subscribers to this `MotionValue`.
   *
   * The `MotionValue` hooks like `useMotionValue` and `useTransform` automatically
   * handle the lifecycle of the returned `MotionValue`, so this method is only necessary if you've manually
   * created a `MotionValue` via the `motionValue` function.
   *
   * @public
   */
  destroy() {
    this.dependents?.clear(), this.events.destroy?.notify(), this.clearListeners(), this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
}
function Wr(a, n) {
  return new Nk(a, n);
}
function xb(a, n) {
  if (a?.inherit && n) {
    const { inherit: r, ...o } = a;
    return { ...n, ...o };
  }
  return a;
}
function uh(a, n) {
  const r = a?.[n] ?? a?.default ?? a;
  return r !== a ? xb(r, a) : r;
}
const Ok = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, _k = (a) => ({
  type: "spring",
  stiffness: 550,
  damping: a === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), zk = {
  type: "keyframes",
  duration: 0.8
}, Uk = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, Bk = (a, { keyframes: n }) => n.length > 2 ? zk : $r.has(a) ? a.startsWith("scale") ? _k(n[1]) : Ok : Uk, Vk = /* @__PURE__ */ new Set([
  "when",
  "delay",
  "delayChildren",
  "staggerChildren",
  "staggerDirection",
  "repeat",
  "repeatType",
  "repeatDelay",
  "from",
  "elapsed"
]);
function Hk(a) {
  for (const n in a)
    if (!Vk.has(n))
      return !0;
  return !1;
}
const dh = (a, n, r, o = {}, l, u) => (f) => {
  const h = uh(o, a) || {}, p = h.delay || o.delay || 0;
  let { elapsed: m = 0 } = o;
  m = m - /* @__PURE__ */ Rn(p);
  const g = {
    keyframes: Array.isArray(r) ? r : [null, r],
    ease: "easeOut",
    velocity: n.getVelocity(),
    ...h,
    delay: -m,
    onUpdate: (b) => {
      n.set(b), h.onUpdate && h.onUpdate(b);
    },
    onComplete: () => {
      f(), h.onComplete && h.onComplete();
    },
    name: a,
    motionValue: n,
    element: u ? void 0 : l
  };
  Hk(h) || Object.assign(g, Bk(a, g)), g.duration && (g.duration = /* @__PURE__ */ Rn(g.duration)), g.repeatDelay && (g.repeatDelay = /* @__PURE__ */ Rn(g.repeatDelay)), g.from !== void 0 && (g.keyframes[0] = g.from);
  let v = !1;
  if ((g.type === !1 || g.duration === 0 && !g.repeatDelay) && (gf(g), g.delay === 0 && (v = !0)), (bi.instantAnimations || bi.skipAnimations || l?.shouldSkipAnimations || h.skipAnimations) && (v = !0, gf(g), g.delay = 0), g.allowFlatten = !h.type && !h.ease, v && !u && n.get() !== void 0) {
    const b = gc(g.keyframes, h);
    if (b !== void 0) {
      $t.update(() => {
        g.onUpdate(b), g.onComplete();
      });
      return;
    }
  }
  return h.isSync ? new oc(g) : new Lk(g);
}, Pk = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function Yk(a) {
  const n = Pk.exec(a);
  if (!n)
    return [,];
  const [, r, o, l] = n;
  return [`--${r ?? o}`, l];
}
function Sb(a, n, r = 1) {
  const [o, l] = Yk(a);
  if (!o)
    return;
  const u = window.getComputedStyle(n).getPropertyValue(o);
  if (u) {
    const f = u.trim();
    return Uv(f) ? parseFloat(f) : f;
  }
  return ah(l) ? Sb(l, n, r + 1) : l;
}
function D0(a) {
  const n = [{}, {}];
  return a?.values.forEach((r, o) => {
    n[0][o] = r.get(), n[1][o] = r.getVelocity();
  }), n;
}
function fh(a, n, r, o) {
  if (typeof n == "function") {
    const [l, u] = D0(o);
    n = n(r !== void 0 ? r : a.custom, l, u);
  }
  if (typeof n == "string" && (n = a.variants && a.variants[n]), typeof n == "function") {
    const [l, u] = D0(o);
    n = n(r !== void 0 ? r : a.custom, l, u);
  }
  return n;
}
function nr(a, n, r) {
  const o = a.getProps();
  return fh(o, n, r !== void 0 ? r : o.custom, a);
}
const kb = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...Jr
]), yf = (a) => Array.isArray(a);
function Kk(a, n, r) {
  a.hasValue(n) ? a.getValue(n).set(r) : a.addValue(n, Wr(r));
}
function qk(a) {
  return yf(a) ? a[a.length - 1] || 0 : a;
}
function Fk(a, n) {
  const r = nr(a, n);
  let { transitionEnd: o = {}, transition: l = {}, ...u } = r || {};
  u = { ...u, ...o };
  for (const f in u) {
    const h = qk(u[f]);
    Kk(a, f, h);
  }
}
const Ye = (a) => !!(a && a.getVelocity);
function Gk(a) {
  return !!(Ye(a) && a.add);
}
function vf(a, n) {
  const r = a.getValue("willChange");
  if (Gk(r))
    return r.add(n);
  if (!r && bi.WillChange) {
    const o = new bi.WillChange("auto");
    a.addValue("willChange", o), o.add(n);
  }
}
function hh(a) {
  return a.replace(/([A-Z])/g, (n) => `-${n.toLowerCase()}`);
}
const Ik = "framerAppearId", Tb = "data-" + hh(Ik);
function Eb(a) {
  return a.props[Tb];
}
function Xk({ protectedKeys: a, needsAnimating: n }, r) {
  const o = a.hasOwnProperty(r) && n[r] !== !0;
  return n[r] = !1, o;
}
function Mb(a, n, { delay: r = 0, transitionOverride: o, type: l } = {}) {
  let { transition: u, transitionEnd: f, ...h } = n;
  const p = a.getDefaultTransition();
  u = u ? xb(u, p) : p;
  const m = u?.reduceMotion, g = u?.skipAnimations;
  o && (u = o);
  const v = [], b = l && a.animationState && a.animationState.getState()[l], k = u?.path;
  k && k.animateVisualElement(a, h, u, r, v);
  for (const E in h) {
    const A = a.getValue(E, a.latestValues[E] ?? null), C = h[E];
    if (C === void 0 || b && Xk(b, E))
      continue;
    const M = {
      delay: r,
      ...uh(u || {}, E)
    };
    g && (M.skipAnimations = !0);
    const D = A.get();
    if (D !== void 0 && !A.isAnimating() && !Array.isArray(C) && C === D && !M.velocity) {
      $t.update(() => A.set(C));
      continue;
    }
    let R = !1;
    if (window.MotionHandoffAnimation) {
      const W = Eb(a);
      if (W) {
        const X = window.MotionHandoffAnimation(W, E, $t);
        X !== null && (M.startTime = X, R = !0);
      }
    }
    vf(a, E);
    const z = m ?? a.shouldReduceMotion;
    A.start(dh(E, A, C, z && kb.has(E) ? { type: !1 } : M, a, R));
    const Z = A.animation;
    Z && v.push(Z);
  }
  if (f) {
    const E = () => $t.update(() => {
      f && Fk(a, f);
    });
    v.length ? Promise.all(v).then(E) : E();
  }
  return v;
}
function bf(a, n, r = {}) {
  const o = nr(a, n, r.type === "exit" ? a.presenceContext?.custom : void 0);
  let { transition: l = a.getDefaultTransition() || {} } = o || {};
  r.transitionOverride && (l = r.transitionOverride);
  const u = o ? () => Promise.all(Mb(a, o, r)) : () => Promise.resolve(), f = a.variantChildren && a.variantChildren.size ? (p = 0) => {
    const { delayChildren: m = 0, staggerChildren: g, staggerDirection: v } = l;
    return Wk(a, n, p, m, g, v, r);
  } : () => Promise.resolve(), { when: h } = l;
  if (h) {
    const [p, m] = h === "beforeChildren" ? [u, f] : [f, u];
    return p().then(() => m());
  } else
    return Promise.all([u(), f(r.delay)]);
}
function Wk(a, n, r = 0, o = 0, l = 0, u = 1, f) {
  const h = [];
  for (const p of a.variantChildren)
    p.notify("AnimationStart", n), h.push(bf(p, n, {
      ...f,
      delay: r + (typeof o == "function" ? 0 : o) + wb(a.variantChildren, p, o, l, u)
    }).then(() => p.notify("AnimationComplete", n)));
  return Promise.all(h);
}
function Qk(a, n, r = {}) {
  a.notify("AnimationStart", n);
  let o;
  if (Array.isArray(n)) {
    const l = n.map((u) => bf(a, u, r));
    o = Promise.all(l);
  } else if (typeof n == "string")
    o = bf(a, n, r);
  else {
    const l = typeof n == "function" ? nr(a, n, r.custom) : n;
    o = Promise.all(Mb(a, l, r));
  }
  return o.then(() => {
    a.notify("AnimationComplete", n);
  });
}
const Zk = {
  test: (a) => a === "auto",
  parse: (a) => a
}, Rb = (a) => (n) => n.test(a), Cb = [Zr, ut, ha, Ua, kS, SS, Zk], N0 = (a) => Cb.find(Rb(a));
function Jk(a) {
  return typeof a == "number" ? a === 0 : a !== null ? a === "none" || a === "0" || Vv(a) : !0;
}
const $k = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function t3(a) {
  const [n, r] = a.slice(0, -1).split("(");
  if (n === "drop-shadow")
    return a;
  const [o] = r.match(ih) || [];
  if (!o)
    return a;
  const l = r.replace(o, "");
  let u = $k.has(n) ? 1 : 0;
  return o !== r && (u *= 100), n + "(" + u + l + ")";
}
const e3 = /\b([a-z-]*)\(.*?\)/gu, wf = {
  ...aa,
  getAnimatableNone: (a) => {
    const n = a.match(e3);
    return n ? n.map(t3).join(" ") : a;
  }
}, xf = {
  ...aa,
  getAnimatableNone: (a) => {
    const n = aa.parse(a);
    return aa.createTransformer(a)(n.map((o) => typeof o == "number" ? 0 : typeof o == "object" ? { ...o, alpha: 1 } : o));
  }
}, O0 = {
  ...Zr,
  transform: Math.round
}, n3 = {
  rotate: Ua,
  /**
   * Internal channel for `transition.path` orientToPath. Composed onto
   * `rotate` at the transform-build sites so the user's `rotate` is
   * never read or overwritten. Not part of `transformPropOrder`.
   */
  pathRotation: Ua,
  rotateX: Ua,
  rotateY: Ua,
  rotateZ: Ua,
  scale: zl,
  scaleX: zl,
  scaleY: zl,
  scaleZ: zl,
  skew: Ua,
  skewX: Ua,
  skewY: Ua,
  distance: ut,
  translateX: ut,
  translateY: ut,
  translateZ: ut,
  x: ut,
  y: ut,
  z: ut,
  perspective: ut,
  transformPerspective: ut,
  opacity: cs,
  originX: w0,
  originY: w0,
  originZ: ut
}, sc = {
  // Border props
  borderWidth: ut,
  borderTopWidth: ut,
  borderRightWidth: ut,
  borderBottomWidth: ut,
  borderLeftWidth: ut,
  borderRadius: ut,
  borderTopLeftRadius: ut,
  borderTopRightRadius: ut,
  borderBottomRightRadius: ut,
  borderBottomLeftRadius: ut,
  // Positioning props
  width: ut,
  maxWidth: ut,
  height: ut,
  maxHeight: ut,
  top: ut,
  right: ut,
  bottom: ut,
  left: ut,
  inset: ut,
  insetBlock: ut,
  insetBlockStart: ut,
  insetBlockEnd: ut,
  insetInline: ut,
  insetInlineStart: ut,
  insetInlineEnd: ut,
  // Spacing props
  padding: ut,
  paddingTop: ut,
  paddingRight: ut,
  paddingBottom: ut,
  paddingLeft: ut,
  paddingBlock: ut,
  paddingBlockStart: ut,
  paddingBlockEnd: ut,
  paddingInline: ut,
  paddingInlineStart: ut,
  paddingInlineEnd: ut,
  margin: ut,
  marginTop: ut,
  marginRight: ut,
  marginBottom: ut,
  marginLeft: ut,
  marginBlock: ut,
  marginBlockStart: ut,
  marginBlockEnd: ut,
  marginInline: ut,
  marginInlineStart: ut,
  marginInlineEnd: ut,
  // Typography
  fontSize: ut,
  // Misc
  backgroundPositionX: ut,
  backgroundPositionY: ut,
  ...n3,
  zIndex: O0,
  // SVG
  fillOpacity: cs,
  strokeOpacity: cs,
  numOctaves: O0
}, a3 = {
  ...sc,
  // Color props
  color: ke,
  backgroundColor: ke,
  outlineColor: ke,
  fill: ke,
  stroke: ke,
  // Border props
  borderColor: ke,
  borderTopColor: ke,
  borderRightColor: ke,
  borderBottomColor: ke,
  borderLeftColor: ke,
  filter: wf,
  WebkitFilter: wf,
  mask: xf,
  WebkitMask: xf
}, Ab = (a) => a3[a], i3 = /* @__PURE__ */ new Set([wf, xf]);
function jb(a, n) {
  let r = Ab(a);
  return i3.has(r) || (r = aa), r.getAnimatableNone ? r.getAnimatableNone(n) : void 0;
}
const r3 = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function o3(a, n, r) {
  let o = 0, l;
  for (; o < a.length && !l; ) {
    const u = a[o];
    typeof u == "string" && !r3.has(u) && Xr(u).values.length && (l = a[o]), o++;
  }
  if (l && r)
    for (const u of n)
      a[u] = jb(r, l);
}
class s3 extends ch {
  constructor(n, r, o, l, u) {
    super(n, r, o, l, u, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: n, element: r, name: o } = this;
    if (!r || !r.current)
      return;
    super.readKeyframes();
    for (let g = 0; g < n.length; g++) {
      let v = n[g];
      if (typeof v == "string" && (v = v.trim(), ah(v))) {
        const b = Sb(v, r.current);
        b !== void 0 && (n[g] = b), g === n.length - 1 && (this.finalKeyframe = v);
      }
    }
    if (this.resolveNoneKeyframes(), !kb.has(o) || n.length !== 2)
      return;
    const [l, u] = n, f = N0(l), h = N0(u), p = b0(l), m = b0(u);
    if (p !== m && vi[o]) {
      this.needsMeasurement = !0;
      return;
    }
    if (f !== h)
      if (C0(f) && C0(h))
        for (let g = 0; g < n.length; g++) {
          const v = n[g];
          typeof v == "string" && (n[g] = parseFloat(v));
        }
      else vi[o] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: n, name: r } = this, o = [];
    for (let l = 0; l < n.length; l++)
      (n[l] === null || Jk(n[l])) && o.push(l);
    o.length && o3(n, o, r);
  }
  measureInitialState() {
    const { element: n, unresolvedKeyframes: r, name: o } = this;
    if (!n || !n.current)
      return;
    o === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = vi[o](n.measureViewportBox(), window.getComputedStyle(n.current)), r[0] = this.measuredOrigin;
    const l = r[r.length - 1];
    l !== void 0 && n.getValue(o, l).jump(l, !1);
  }
  measureEndState() {
    const { element: n, name: r, unresolvedKeyframes: o } = this;
    if (!n || !n.current)
      return;
    const l = n.getValue(r);
    l && l.jump(this.measuredOrigin, !1);
    const u = o.length - 1, f = o[u];
    o[u] = vi[r](n.measureViewportBox(), window.getComputedStyle(n.current)), f !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = f), this.removedTransforms?.length && this.removedTransforms.forEach(([h, p]) => {
      n.getValue(h).set(p);
    }), this.resolveNoneKeyframes();
  }
}
function Lb(a, n, r) {
  if (a == null)
    return [];
  if (a instanceof EventTarget)
    return [a];
  if (typeof a == "string") {
    let o = document;
    const l = r?.[a] ?? o.querySelectorAll(a);
    return l ? Array.from(l) : [];
  }
  return Array.from(a).filter((o) => o != null);
}
const Sf = (a, n) => n && typeof a == "number" ? n.transform(a) : a;
function Fl(a) {
  return Bv(a) && "offsetHeight" in a && !("ownerSVGElement" in a);
}
const { schedule: ph } = /* @__PURE__ */ Jv(queueMicrotask, !1), ea = {
  x: !1,
  y: !1
};
function Db() {
  return ea.x || ea.y;
}
function l3(a) {
  return a === "x" || a === "y" ? ea[a] ? null : (ea[a] = !0, () => {
    ea[a] = !1;
  }) : ea.x || ea.y ? null : (ea.x = ea.y = !0, () => {
    ea.x = ea.y = !1;
  });
}
function Nb(a, n) {
  const r = Lb(a), o = new AbortController(), l = {
    passive: !0,
    ...n,
    signal: o.signal
  };
  return [r, l, () => o.abort()];
}
function c3(a) {
  return !(a.pointerType === "touch" || Db());
}
function u3(a, n, r = {}) {
  const [o, l, u] = Nb(a, r);
  return o.forEach((f) => {
    let h = !1, p = !1, m;
    const g = () => {
      f.removeEventListener("pointerleave", E);
    }, v = (C) => {
      m && (m(C), m = void 0), g();
    }, b = (C) => {
      h = !1, window.removeEventListener("pointerup", b), window.removeEventListener("pointercancel", b), p && (p = !1, v(C));
    }, k = () => {
      h = !0, window.addEventListener("pointerup", b, l), window.addEventListener("pointercancel", b, l);
    }, E = (C) => {
      if (C.pointerType !== "touch") {
        if (h) {
          p = !0;
          return;
        }
        v(C);
      }
    }, A = (C) => {
      if (!c3(C))
        return;
      p = !1;
      const M = n(f, C);
      typeof M == "function" && (m = M, f.addEventListener("pointerleave", E, l));
    };
    f.addEventListener("pointerenter", A, l), f.addEventListener("pointerdown", k, l);
  }), u;
}
const Ob = (a, n) => n ? a === n ? !0 : Ob(a, n.parentElement) : !1, mh = (a) => a.pointerType === "mouse" ? typeof a.button != "number" || a.button <= 0 : a.isPrimary !== !1, d3 = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function f3(a) {
  return d3.has(a.tagName) || a.isContentEditable === !0;
}
const h3 = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA"]);
function p3(a) {
  return h3.has(a.tagName) || a.isContentEditable === !0;
}
const Gl = /* @__PURE__ */ new WeakSet();
function _0(a) {
  return (n) => {
    n.key === "Enter" && a(n);
  };
}
function Vd(a, n) {
  a.dispatchEvent(new PointerEvent("pointer" + n, { isPrimary: !0, bubbles: !0 }));
}
const m3 = (a, n) => {
  const r = a.currentTarget;
  if (!r)
    return;
  const o = _0(() => {
    if (Gl.has(r))
      return;
    Vd(r, "down");
    const l = _0(() => {
      Vd(r, "up");
    }), u = () => Vd(r, "cancel");
    r.addEventListener("keyup", l, n), r.addEventListener("blur", u, n);
  });
  r.addEventListener("keydown", o, n), r.addEventListener("blur", () => r.removeEventListener("keydown", o), n);
};
function z0(a) {
  return mh(a) && !Db();
}
const U0 = /* @__PURE__ */ new WeakSet();
function g3(a, n, r = {}) {
  const [o, l, u] = Nb(a, r), f = (h) => {
    const p = h.currentTarget;
    if (!z0(h) || U0.has(h))
      return;
    Gl.add(p), r.stopPropagation && U0.add(h);
    const m = n(p, h), g = { ...l, capture: !0 }, v = (E, A) => {
      window.removeEventListener("pointerup", b, g), window.removeEventListener("pointercancel", k, g), Gl.has(p) && Gl.delete(p), z0(E) && typeof m == "function" && m(E, { success: A });
    }, b = (E) => {
      v(E, p === window || p === document || r.useGlobalTarget || Ob(p, E.target));
    }, k = (E) => {
      v(E, !1);
    };
    window.addEventListener("pointerup", b, g), window.addEventListener("pointercancel", k, g);
  };
  return o.forEach((h) => {
    (r.useGlobalTarget ? window : h).addEventListener("pointerdown", f, l), Fl(h) && (h.addEventListener("focus", (m) => m3(m, l)), !f3(h) && !h.hasAttribute("tabindex") && (h.tabIndex = 0));
  }), u;
}
function gh(a) {
  return Bv(a) && "ownerSVGElement" in a;
}
const Il = /* @__PURE__ */ new WeakMap();
let Xl;
const _b = (a, n, r) => (o, l) => l && l[0] ? l[0][a + "Size"] : gh(o) && "getBBox" in o ? o.getBBox()[n] : o[r], y3 = /* @__PURE__ */ _b("inline", "width", "offsetWidth"), v3 = /* @__PURE__ */ _b("block", "height", "offsetHeight");
function b3({ target: a, borderBoxSize: n }) {
  Il.get(a)?.forEach((r) => {
    r(a, {
      get width() {
        return y3(a, n);
      },
      get height() {
        return v3(a, n);
      }
    });
  });
}
function w3(a) {
  a.forEach(b3);
}
function x3() {
  typeof ResizeObserver > "u" || (Xl = new ResizeObserver(w3));
}
function S3(a, n) {
  Xl || x3();
  const r = Lb(a);
  return r.forEach((o) => {
    let l = Il.get(o);
    l || (l = /* @__PURE__ */ new Set(), Il.set(o, l)), l.add(n), Xl?.observe(o);
  }), () => {
    r.forEach((o) => {
      const l = Il.get(o);
      l?.delete(n), l?.size || Xl?.unobserve(o);
    });
  };
}
const Wl = /* @__PURE__ */ new Set();
let Yr;
function k3() {
  Yr = () => {
    const a = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      }
    };
    Wl.forEach((n) => n(a));
  }, window.addEventListener("resize", Yr);
}
function T3(a) {
  return Wl.add(a), Yr || k3(), () => {
    Wl.delete(a), !Wl.size && typeof Yr == "function" && (window.removeEventListener("resize", Yr), Yr = void 0);
  };
}
function B0(a, n) {
  return typeof a == "function" ? T3(a) : S3(a, n);
}
function E3(a) {
  return gh(a) && a.tagName === "svg";
}
const M3 = [...Cb, ke, aa], R3 = (a) => M3.find(Rb(a)), V0 = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), Kr = () => ({
  x: V0(),
  y: V0()
}), H0 = () => ({ min: 0, max: 0 }), Ae = () => ({
  x: H0(),
  y: H0()
}), C3 = /* @__PURE__ */ new WeakMap();
function yc(a) {
  return a !== null && typeof a == "object" && typeof a.start == "function";
}
function us(a) {
  return typeof a == "string" || Array.isArray(a);
}
const yh = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], vh = ["initial", ...yh];
function vc(a) {
  return yc(a.animate) || vh.some((n) => us(a[n]));
}
function zb(a) {
  return !!(vc(a) || a.variants);
}
function A3(a, n, r) {
  for (const o in n) {
    const l = n[o], u = r[o];
    if (Ye(l))
      a.addValue(o, l);
    else if (Ye(u))
      a.addValue(o, Wr(l, { owner: a }));
    else if (u !== l)
      if (a.hasValue(o)) {
        const f = a.getValue(o);
        f.liveStyle === !0 ? f.jump(l) : f.hasAnimated || f.set(l);
      } else {
        const f = a.getStaticValue(o);
        a.addValue(o, Wr(f !== void 0 ? f : l, { owner: a }));
      }
  }
  for (const o in r)
    n[o] === void 0 && a.removeValue(o);
  return n;
}
const kf = { current: null }, Ub = { current: !1 }, j3 = typeof window < "u";
function L3() {
  if (Ub.current = !0, !!j3)
    if (window.matchMedia) {
      const a = window.matchMedia("(prefers-reduced-motion)"), n = () => kf.current = a.matches;
      a.addEventListener("change", n), n();
    } else
      kf.current = !1;
}
const P0 = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
let lc = {};
function Bb(a) {
  lc = a;
}
function D3() {
  return lc;
}
class N3 {
  /**
   * This method takes React props and returns found MotionValues. For example, HTML
   * MotionValues will be found within the style prop, whereas for Three.js within attribute arrays.
   *
   * This isn't an abstract method as it needs calling in the constructor, but it is
   * intended to be one.
   */
  scrapeMotionValuesFromProps(n, r, o) {
    return {};
  }
  constructor({ parent: n, props: r, presenceContext: o, reducedMotionConfig: l, skipAnimations: u, blockInitialAnimation: f, visualState: h }, p = {}) {
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = ch, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const k = an.now();
      this.renderScheduledAt < k && (this.renderScheduledAt = k, $t.render(this.render, !1, !0));
    };
    const { latestValues: m, renderState: g } = h;
    this.latestValues = m, this.baseTarget = { ...m }, this.initialValues = r.initial ? { ...m } : {}, this.renderState = g, this.parent = n, this.props = r, this.presenceContext = o, this.depth = n ? n.depth + 1 : 0, this.reducedMotionConfig = l, this.skipAnimationsConfig = u, this.options = p, this.blockInitialAnimation = !!f, this.isControllingVariants = vc(r), this.isVariantNode = zb(r), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(n && n.current);
    const { willChange: v, ...b } = this.scrapeMotionValuesFromProps(r, {}, this);
    for (const k in b) {
      const E = b[k];
      m[k] !== void 0 && Ye(E) && E.set(m[k]);
    }
  }
  mount(n) {
    if (this.hasBeenMounted)
      for (const r in this.initialValues)
        this.values.get(r)?.jump(this.initialValues[r]), this.latestValues[r] = this.initialValues[r];
    this.current = n, C3.set(n, this), this.projection && !this.projection.instance && this.projection.mount(n), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((r, o) => this.bindToMotionValue(o, r)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (Ub.current || L3(), this.shouldReduceMotion = kf.current), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, this.parent?.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    this.projection && this.projection.unmount(), wi(this.notifyUpdate), wi(this.render), this.valueSubscriptions.forEach((n) => n()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), this.parent?.removeChild(this);
    for (const n in this.events)
      this.events[n].clear();
    for (const n in this.features) {
      const r = this.features[n];
      r && (r.unmount(), r.isMounted = !1);
    }
    this.current = null;
  }
  addChild(n) {
    this.children.add(n), this.enteringChildren ?? (this.enteringChildren = /* @__PURE__ */ new Set()), this.enteringChildren.add(n);
  }
  removeChild(n) {
    this.children.delete(n), this.enteringChildren && this.enteringChildren.delete(n);
  }
  bindToMotionValue(n, r) {
    if (this.valueSubscriptions.has(n) && this.valueSubscriptions.get(n)(), r.accelerate && bb.has(n) && this.current instanceof HTMLElement) {
      const { factory: f, keyframes: h, times: p, ease: m, duration: g } = r.accelerate, v = new yb({
        element: this.current,
        name: n,
        keyframes: h,
        times: p,
        ease: m,
        duration: /* @__PURE__ */ Rn(g)
      }), b = f(v);
      this.valueSubscriptions.set(n, () => {
        b(), v.cancel();
      });
      return;
    }
    const o = $r.has(n);
    o && this.onBindTransform && this.onBindTransform();
    const l = r.on("change", (f) => {
      this.latestValues[n] = f, this.props.onUpdate && $t.preRender(this.notifyUpdate), o && this.projection && (this.projection.isTransformDirty = !0), this.scheduleRender();
    });
    let u;
    typeof window < "u" && window.MotionCheckAppearSync && (u = window.MotionCheckAppearSync(this, n, r)), this.valueSubscriptions.set(n, () => {
      l(), u && u();
    });
  }
  sortNodePosition(n) {
    return !this.current || !this.sortInstanceNodePosition || this.type !== n.type ? 0 : this.sortInstanceNodePosition(this.current, n.current);
  }
  updateFeatures() {
    let n = "animation";
    for (n in lc) {
      const r = lc[n];
      if (!r)
        continue;
      const { isEnabled: o, Feature: l } = r;
      if (!this.features[n] && l && o(this.props) && (this.features[n] = new l(this)), this.features[n]) {
        const u = this.features[n];
        u.isMounted ? u.update() : (u.mount(), u.isMounted = !0);
      }
    }
  }
  triggerBuild() {
    this.build(this.renderState, this.latestValues, this.props);
  }
  /**
   * Measure the current viewport box with or without transforms.
   * Only measures axis-aligned boxes, rotate and skew must be manually
   * removed with a re-render to work.
   */
  measureViewportBox() {
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : Ae();
  }
  getStaticValue(n) {
    return this.latestValues[n];
  }
  setStaticValue(n, r) {
    this.latestValues[n] = r;
  }
  /**
   * Update the provided props. Ensure any newly-added motion values are
   * added to our map, old ones removed, and listeners updated.
   */
  update(n, r) {
    (n.transformTemplate || this.props.transformTemplate) && this.scheduleRender(), this.prevProps = this.props, this.props = n, this.prevPresenceContext = this.presenceContext, this.presenceContext = r;
    for (let o = 0; o < P0.length; o++) {
      const l = P0[o];
      this.propEventSubscriptions[l] && (this.propEventSubscriptions[l](), delete this.propEventSubscriptions[l]);
      const u = "on" + l, f = n[u];
      f && (this.propEventSubscriptions[l] = this.on(l, f));
    }
    this.prevMotionValues = A3(this, this.scrapeMotionValuesFromProps(n, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
  }
  getProps() {
    return this.props;
  }
  /**
   * Returns the variant definition with a given name.
   */
  getVariant(n) {
    return this.props.variants ? this.props.variants[n] : void 0;
  }
  /**
   * Returns the defined default transition on this component.
   */
  getDefaultTransition() {
    return this.props.transition;
  }
  getTransformPagePoint() {
    return this.props.transformPagePoint;
  }
  getClosestVariantNode() {
    return this.isVariantNode ? this : this.parent ? this.parent.getClosestVariantNode() : void 0;
  }
  /**
   * Add a child visual element to our set of children.
   */
  addVariantChild(n) {
    const r = this.getClosestVariantNode();
    if (r)
      return r.variantChildren && r.variantChildren.add(n), () => r.variantChildren.delete(n);
  }
  /**
   * Add a motion value and bind it to this visual element.
   */
  addValue(n, r) {
    const o = this.values.get(n);
    r !== o && (o && this.removeValue(n), this.bindToMotionValue(n, r), this.values.set(n, r), this.latestValues[n] = r.get());
  }
  /**
   * Remove a motion value and unbind any active subscriptions.
   */
  removeValue(n) {
    this.values.delete(n);
    const r = this.valueSubscriptions.get(n);
    r && (r(), this.valueSubscriptions.delete(n)), delete this.latestValues[n], this.removeValueFromRenderState(n, this.renderState);
  }
  /**
   * Check whether we have a motion value for this key
   */
  hasValue(n) {
    return this.values.has(n);
  }
  getValue(n, r) {
    if (this.props.values && this.props.values[n])
      return this.props.values[n];
    let o = this.values.get(n);
    return o === void 0 && r !== void 0 && (o = Wr(r === null ? void 0 : r, { owner: this }), this.addValue(n, o)), o;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(n, r) {
    let o = this.latestValues[n] !== void 0 || !this.current ? this.latestValues[n] : this.getBaseTargetFromProps(this.props, n) ?? this.readValueFromInstance(this.current, n, this.options);
    return o != null && (typeof o == "string" && (Uv(o) || Vv(o)) ? o = parseFloat(o) : !R3(o) && aa.test(r) && (o = jb(n, r)), this.setBaseTarget(n, Ye(o) ? o.get() : o)), Ye(o) ? o.get() : o;
  }
  /**
   * Set the base target to later animate back to. This is currently
   * only hydrated on creation and when we first read a value.
   */
  setBaseTarget(n, r) {
    this.baseTarget[n] = r;
  }
  /**
   * Find the base target for a value thats been removed from all animation
   * props.
   */
  getBaseTarget(n) {
    const { initial: r } = this.props;
    let o;
    if (typeof r == "string" || typeof r == "object") {
      const u = fh(this.props, r, this.presenceContext?.custom);
      u && (o = u[n]);
    }
    if (r && o !== void 0)
      return o;
    const l = this.getBaseTargetFromProps(this.props, n);
    return l !== void 0 && !Ye(l) ? l : this.initialValues[n] !== void 0 && o === void 0 ? void 0 : this.baseTarget[n];
  }
  on(n, r) {
    return this.events[n] || (this.events[n] = new th()), this.events[n].add(r);
  }
  notify(n, ...r) {
    this.events[n] && this.events[n].notify(...r);
  }
  scheduleRenderMicrotask() {
    ph.render(this.render);
  }
}
class Vb extends N3 {
  constructor() {
    super(...arguments), this.KeyframeResolver = s3;
  }
  sortInstanceNodePosition(n, r) {
    return n.compareDocumentPosition(r) & 2 ? 1 : -1;
  }
  getBaseTargetFromProps(n, r) {
    const o = n.style;
    return o ? o[r] : void 0;
  }
  removeValueFromRenderState(n, { vars: r, style: o }) {
    delete r[n], delete o[n];
  }
  handleChildMotionValue() {
    this.childSubscription && (this.childSubscription(), delete this.childSubscription);
    const { children: n } = this.props;
    Ye(n) && (this.childSubscription = n.on("change", (r) => {
      this.current && (this.current.textContent = `${r}`);
    }));
  }
}
class xi {
  constructor(n) {
    this.isMounted = !1, this.node = n;
  }
  update() {
  }
}
function Hb({ top: a, left: n, right: r, bottom: o }) {
  return {
    x: { min: n, max: r },
    y: { min: a, max: o }
  };
}
function O3({ x: a, y: n }) {
  return { top: n.min, right: a.max, bottom: n.max, left: a.min };
}
function _3(a, n) {
  if (!n)
    return a;
  const r = n({ x: a.left, y: a.top }), o = n({ x: a.right, y: a.bottom });
  return {
    top: r.y,
    left: r.x,
    bottom: o.y,
    right: o.x
  };
}
function Hd(a) {
  return a === void 0 || a === 1;
}
function Tf({ scale: a, scaleX: n, scaleY: r }) {
  return !Hd(a) || !Hd(n) || !Hd(r);
}
function Qi(a) {
  return Tf(a) || Pb(a) || a.z || a.rotate || a.rotateX || a.rotateY || a.skewX || a.skewY;
}
function Pb(a) {
  return Y0(a.x) || Y0(a.y);
}
function Y0(a) {
  return a && a !== "0%";
}
function cc(a, n, r) {
  const o = a - r, l = n * o;
  return r + l;
}
function K0(a, n, r, o, l) {
  return l !== void 0 && (a = cc(a, l, o)), cc(a, r, o) + n;
}
function Ef(a, n = 0, r = 1, o, l) {
  a.min = K0(a.min, n, r, o, l), a.max = K0(a.max, n, r, o, l);
}
function Yb(a, { x: n, y: r }) {
  Ef(a.x, n.translate, n.scale, n.originPoint), Ef(a.y, r.translate, r.scale, r.originPoint);
}
const q0 = 0.999999999999, F0 = 1.0000000000001;
function z3(a, n, r, o = !1) {
  const l = r.length;
  if (!l)
    return;
  n.x = n.y = 1;
  let u, f;
  for (let h = 0; h < l; h++) {
    u = r[h], f = u.projectionDelta;
    const { visualElement: p } = u.options;
    p && p.props.style && p.props.style.display === "contents" || (o && u.options.layoutScroll && u.scroll && u !== u.root && (fa(a.x, -u.scroll.offset.x), fa(a.y, -u.scroll.offset.y)), f && (n.x *= f.x.scale, n.y *= f.y.scale, Yb(a, f)), o && Qi(u.latestValues) && Ql(a, u.latestValues, u.layout?.layoutBox));
  }
  n.x < F0 && n.x > q0 && (n.x = 1), n.y < F0 && n.y > q0 && (n.y = 1);
}
function fa(a, n) {
  a.min += n, a.max += n;
}
function G0(a, n, r, o, l = 0.5) {
  const u = Jt(a.min, a.max, l);
  Ef(a, n, r, u, o);
}
function I0(a, n) {
  return typeof a == "string" ? parseFloat(a) / 100 * (n.max - n.min) : a;
}
function Ql(a, n, r) {
  const o = r ?? a;
  G0(a.x, I0(n.x, o.x), n.scaleX, n.scale, n.originX), G0(a.y, I0(n.y, o.y), n.scaleY, n.scale, n.originY);
}
function Kb(a, n) {
  return Hb(_3(a.getBoundingClientRect(), n));
}
function U3(a, n, r) {
  const o = Kb(a, r), { scroll: l } = n;
  return l && (fa(o.x, l.offset.x), fa(o.y, l.offset.y)), o;
}
const B3 = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, V3 = Jr.length;
function H3(a, n, r) {
  let o = "", l = !0;
  for (let f = 0; f < V3; f++) {
    const h = Jr[f], p = a[h];
    if (p === void 0)
      continue;
    let m = !0;
    if (typeof p == "number")
      m = p === (h.startsWith("scale") ? 1 : 0);
    else {
      const g = parseFloat(p);
      m = h.startsWith("scale") ? g === 1 : g === 0;
    }
    if (!m || r) {
      const g = Sf(p, sc[h]);
      if (!m) {
        l = !1;
        const v = B3[h] || h;
        o += `${v}(${g}) `;
      }
      r && (n[h] = g);
    }
  }
  const u = a.pathRotation;
  return u && (l = !1, o += `rotate(${Sf(u, sc.pathRotation)}) `), o = o.trim(), r ? o = r(n, l ? "" : o) : l && (o = "none"), o;
}
function bh(a, n, r) {
  const { style: o, vars: l, transformOrigin: u } = a;
  let f = !1, h = !1;
  for (const p in n) {
    const m = n[p];
    if ($r.has(p)) {
      f = !0;
      continue;
    } else if (tb(p)) {
      l[p] = m;
      continue;
    } else {
      const g = Sf(m, sc[p]);
      p.startsWith("origin") ? (h = !0, u[p] = g) : o[p] = g;
    }
  }
  if (n.transform || (f || r ? o.transform = H3(n, a.transform, r) : o.transform && (o.transform = "none")), h) {
    const { originX: p = "50%", originY: m = "50%", originZ: g = 0 } = u;
    o.transformOrigin = `${p} ${m} ${g}`;
  }
}
function qb(a, { style: n, vars: r }, o, l) {
  const u = a.style;
  let f;
  for (f in n)
    u[f] = n[f];
  l?.applyProjectionStyles(u, o);
  for (f in r)
    u.setProperty(f, r[f]);
}
function X0(a, n) {
  return n.max === n.min ? 0 : a / (n.max - n.min) * 100;
}
const $o = {
  correct: (a, n) => {
    if (!n.target)
      return a;
    if (typeof a == "string")
      if (ut.test(a))
        a = parseFloat(a);
      else
        return a;
    const r = X0(a, n.target.x), o = X0(a, n.target.y);
    return `${r}% ${o}%`;
  }
}, P3 = {
  correct: (a, { treeScale: n, projectionDelta: r }) => {
    const o = a, l = aa.parse(a);
    if (l.length > 5)
      return o;
    const u = aa.createTransformer(a), f = typeof l[0] != "number" ? 1 : 0, h = r.x.scale * n.x, p = r.y.scale * n.y;
    l[0 + f] /= h, l[1 + f] /= p;
    const m = Jt(h, p, 0.5);
    return typeof l[2 + f] == "number" && (l[2 + f] /= m), typeof l[3 + f] == "number" && (l[3 + f] /= m), u(l);
  }
}, Mf = {
  borderRadius: {
    ...$o,
    applyTo: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius"
    ]
  },
  borderTopLeftRadius: $o,
  borderTopRightRadius: $o,
  borderBottomLeftRadius: $o,
  borderBottomRightRadius: $o,
  boxShadow: P3
};
function Fb(a, { layout: n, layoutId: r }) {
  return $r.has(a) || a.startsWith("origin") || (n || r !== void 0) && (!!Mf[a] || a === "opacity");
}
function wh(a, n, r) {
  const o = a.style, l = n?.style, u = {};
  if (!o)
    return u;
  for (const f in o)
    (Ye(o[f]) || l && Ye(l[f]) || Fb(f, a) || r?.getValue(f)?.liveStyle !== void 0) && (u[f] = o[f]);
  return u;
}
function Y3(a) {
  return window.getComputedStyle(a);
}
class K3 extends Vb {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = qb;
  }
  readValueFromInstance(n, r) {
    if ($r.has(r))
      return this.projection?.isProjecting ? df(r) : ck(n, r);
    {
      const o = Y3(n), l = (tb(r) ? o.getPropertyValue(r) : o[r]) || 0;
      return typeof l == "string" ? l.trim() : l;
    }
  }
  measureInstanceViewportBox(n, { transformPagePoint: r }) {
    return Kb(n, r);
  }
  build(n, r, o) {
    bh(n, r, o.transformTemplate);
  }
  scrapeMotionValuesFromProps(n, r, o) {
    return wh(n, r, o);
  }
}
const q3 = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, F3 = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function G3(a, n, r = 1, o = 0, l = !0) {
  a.pathLength = 1;
  const u = l ? q3 : F3;
  a[u.offset] = `${-o}`, a[u.array] = `${n} ${r}`;
}
const I3 = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function Gb(a, {
  attrX: n,
  attrY: r,
  attrScale: o,
  pathLength: l,
  pathSpacing: u = 1,
  pathOffset: f = 0,
  // This is object creation, which we try to avoid per-frame.
  ...h
}, p, m, g) {
  if (bh(a, h, m), p) {
    a.style.viewBox && (a.attrs.viewBox = a.style.viewBox);
    return;
  }
  a.attrs = a.style, a.style = {};
  const { attrs: v, style: b } = a;
  v.transform && (b.transform = v.transform, delete v.transform), (b.transform || v.transformOrigin) && (b.transformOrigin = v.transformOrigin ?? "50% 50%", delete v.transformOrigin), b.transform && (b.transformBox = g?.transformBox ?? "fill-box", delete v.transformBox);
  for (const k of I3)
    v[k] !== void 0 && (b[k] = v[k], delete v[k]);
  n !== void 0 && (v.x = n), r !== void 0 && (v.y = r), o !== void 0 && (v.scale = o), l !== void 0 && G3(v, l, u, f, !1);
}
const Ib = /* @__PURE__ */ new Set([
  "baseFrequency",
  "diffuseConstant",
  "kernelMatrix",
  "kernelUnitLength",
  "keySplines",
  "keyTimes",
  "limitingConeAngle",
  "markerHeight",
  "markerWidth",
  "numOctaves",
  "targetX",
  "targetY",
  "surfaceScale",
  "specularConstant",
  "specularExponent",
  "stdDeviation",
  "tableValues",
  "viewBox",
  "gradientTransform",
  "pathLength",
  "startOffset",
  "textLength",
  "lengthAdjust"
]), Xb = (a) => typeof a == "string" && a.toLowerCase() === "svg";
function X3(a, n, r, o) {
  qb(a, n, void 0, o);
  for (const l in n.attrs)
    a.setAttribute(Ib.has(l) ? l : hh(l), n.attrs[l]);
}
function Wb(a, n, r) {
  const o = wh(a, n, r);
  for (const l in a)
    if (Ye(a[l]) || Ye(n[l])) {
      const u = Jr.indexOf(l) !== -1 ? "attr" + l.charAt(0).toUpperCase() + l.substring(1) : l;
      o[u] = a[l];
    }
  return o;
}
class W3 extends Vb {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = Ae;
  }
  getBaseTargetFromProps(n, r) {
    return n[r];
  }
  readValueFromInstance(n, r) {
    if ($r.has(r)) {
      const o = Ab(r);
      return o && o.default || 0;
    }
    return r = Ib.has(r) ? r : hh(r), n.getAttribute(r);
  }
  scrapeMotionValuesFromProps(n, r, o) {
    return Wb(n, r, o);
  }
  build(n, r, o) {
    Gb(n, r, this.isSVGTag, o.transformTemplate, o.style);
  }
  renderInstance(n, r, o, l) {
    X3(n, r, o, l);
  }
  mount(n) {
    this.isSVGTag = Xb(n.tagName), super.mount(n);
  }
}
const Q3 = vh.length;
function Qb(a) {
  if (!a)
    return;
  if (!a.isControllingVariants) {
    const r = a.parent ? Qb(a.parent) || {} : {};
    return a.props.initial !== void 0 && (r.initial = a.props.initial), r;
  }
  const n = {};
  for (let r = 0; r < Q3; r++) {
    const o = vh[r], l = a.props[o];
    (us(l) || l === !1) && (n[o] = l);
  }
  return n;
}
function Zb(a, n) {
  if (!Array.isArray(n))
    return !1;
  const r = n.length;
  if (r !== a.length)
    return !1;
  for (let o = 0; o < r; o++)
    if (n[o] !== a[o])
      return !1;
  return !0;
}
const Z3 = [...yh].reverse(), J3 = yh.length;
function $3(a) {
  return (n) => Promise.all(n.map(({ animation: r, options: o }) => Qk(a, r, o)));
}
function tT(a) {
  let n = $3(a), r = W0(), o = !0, l = !1;
  const u = (m) => (g, v) => {
    const b = nr(a, v, m === "exit" ? a.presenceContext?.custom : void 0);
    if (b) {
      const { transition: k, transitionEnd: E, ...A } = b;
      g = { ...g, ...A, ...E };
    }
    return g;
  };
  function f(m) {
    n = m(a);
  }
  function h(m) {
    const { props: g } = a, v = Qb(a.parent) || {}, b = [], k = /* @__PURE__ */ new Set();
    let E = {}, A = 1 / 0;
    for (let M = 0; M < J3; M++) {
      const D = Z3[M], R = r[D], z = g[D] !== void 0 ? g[D] : v[D], Z = us(z), W = D === m ? R.isActive : null;
      W === !1 && (A = M);
      let X = z === v[D] && z !== g[D] && Z;
      if (X && (o || l) && a.manuallyAnimateOnMount && (X = !1), R.protectedKeys = { ...E }, // If it isn't active and hasn't *just* been set as inactive
      !R.isActive && W === null || // If we didn't and don't have any defined prop for this animation type
      !z && !R.prevProp || // Or if the prop doesn't define an animation
      yc(z) || typeof z == "boolean")
        continue;
      if (D === "exit" && R.isActive && W !== !0) {
        R.prevResolvedValues && (E = {
          ...E,
          ...R.prevResolvedValues
        });
        continue;
      }
      const F = eT(R.prevProp, z);
      let at = F || // If we're making this variant active, we want to always make it active
      D === m && R.isActive && !X && Z || // If we removed a higher-priority variant (i is in reverse order)
      M > A && Z, rt = !1;
      const pt = Array.isArray(z) ? z : [z];
      let yt = pt.reduce(u(D), {});
      W === !1 && (yt = {});
      const { prevResolvedValues: vt = {} } = R, Tt = {
        ...vt,
        ...yt
      }, bt = (et) => {
        at = !0, k.has(et) && (rt = !0, k.delete(et)), R.needsAnimating[et] = !0;
        const $ = a.getValue(et);
        $ && ($.liveStyle = !1);
      };
      for (const et in Tt) {
        const $ = yt[et], O = vt[et];
        if (E.hasOwnProperty(et))
          continue;
        let T = !1;
        yf($) && yf(O) ? T = !Zb($, O) || F : T = $ !== O, T ? $ != null ? bt(et) : k.add(et) : $ !== void 0 && k.has(et) ? bt(et) : R.protectedKeys[et] = !0;
      }
      R.prevProp = z, R.prevResolvedValues = yt, R.isActive && (E = { ...E, ...yt }), (o || l) && a.blockInitialAnimation && (at = !1);
      const Y = X && F;
      at && (!Y || rt) && b.push(...pt.map((et) => {
        const $ = { type: D };
        if (typeof et == "string" && (o || l) && !Y && a.manuallyAnimateOnMount && a.parent) {
          const { parent: O } = a, T = nr(O, et);
          if (O.enteringChildren && T) {
            const { delayChildren: _ } = T.transition || {};
            $.delay = wb(O.enteringChildren, a, _);
          }
        }
        return {
          animation: et,
          options: $
        };
      }));
    }
    if (k.size) {
      const M = {};
      if (typeof g.initial != "boolean") {
        const D = nr(a, Array.isArray(g.initial) ? g.initial[0] : g.initial);
        D && D.transition && (M.transition = D.transition);
      }
      k.forEach((D) => {
        const R = a.getBaseTarget(D), z = a.getValue(D);
        z && (z.liveStyle = !0), M[D] = R ?? null;
      }), b.push({ animation: M });
    }
    let C = !!b.length;
    return o && (g.initial === !1 || g.initial === g.animate) && !a.manuallyAnimateOnMount && (C = !1), o = !1, l = !1, C ? n(b) : Promise.resolve();
  }
  function p(m, g) {
    if (r[m].isActive === g)
      return Promise.resolve();
    a.variantChildren?.forEach((b) => b.animationState?.setActive(m, g)), r[m].isActive = g;
    const v = h(m);
    for (const b in r)
      r[b].protectedKeys = {};
    return v;
  }
  return {
    animateChanges: h,
    setActive: p,
    setAnimateFunction: f,
    getState: () => r,
    reset: () => {
      r = W0(), l = !0;
    }
  };
}
function eT(a, n) {
  return typeof n == "string" ? n !== a : Array.isArray(n) ? !Zb(n, a) : !1;
}
function Ii(a = !1) {
  return {
    isActive: a,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function W0() {
  return {
    animate: Ii(!0),
    whileInView: Ii(),
    whileHover: Ii(),
    whileTap: Ii(),
    whileDrag: Ii(),
    whileFocus: Ii(),
    exit: Ii()
  };
}
function Rf(a, n) {
  a.min = n.min, a.max = n.max;
}
function ta(a, n) {
  Rf(a.x, n.x), Rf(a.y, n.y);
}
function Q0(a, n) {
  a.translate = n.translate, a.scale = n.scale, a.originPoint = n.originPoint, a.origin = n.origin;
}
const Jb = 1e-4, nT = 1 - Jb, aT = 1 + Jb, $b = 0.01, iT = 0 - $b, rT = 0 + $b;
function rn(a) {
  return a.max - a.min;
}
function oT(a, n, r) {
  return Math.abs(a - n) <= r;
}
function Z0(a, n, r, o = 0.5) {
  a.origin = o, a.originPoint = Jt(n.min, n.max, a.origin), a.scale = rn(r) / rn(n), a.translate = Jt(r.min, r.max, a.origin) - a.originPoint, (a.scale >= nT && a.scale <= aT || isNaN(a.scale)) && (a.scale = 1), (a.translate >= iT && a.translate <= rT || isNaN(a.translate)) && (a.translate = 0);
}
function rs(a, n, r, o) {
  Z0(a.x, n.x, r.x, o ? o.originX : void 0), Z0(a.y, n.y, r.y, o ? o.originY : void 0);
}
function J0(a, n, r, o = 0) {
  const l = o ? Jt(r.min, r.max, o) : r.min;
  a.min = l + n.min, a.max = a.min + rn(n);
}
function sT(a, n, r, o) {
  J0(a.x, n.x, r.x, o?.x), J0(a.y, n.y, r.y, o?.y);
}
function $0(a, n, r, o = 0) {
  const l = o ? Jt(r.min, r.max, o) : r.min;
  a.min = n.min - l, a.max = a.min + rn(n);
}
function uc(a, n, r, o) {
  $0(a.x, n.x, r.x, o?.x), $0(a.y, n.y, r.y, o?.y);
}
function ty(a, n, r, o, l) {
  return a -= n, a = cc(a, 1 / r, o), l !== void 0 && (a = cc(a, 1 / l, o)), a;
}
function lT(a, n = 0, r = 1, o = 0.5, l, u = a, f = a) {
  if (ha.test(n) && (n = parseFloat(n), n = Jt(f.min, f.max, n / 100) - f.min), typeof n != "number")
    return;
  let h = Jt(u.min, u.max, o);
  a === u && (h -= n), a.min = ty(a.min, n, r, h, l), a.max = ty(a.max, n, r, h, l);
}
function ey(a, n, [r, o, l], u, f) {
  lT(a, n[r], n[o], n[l], n.scale, u, f);
}
const cT = ["x", "scaleX", "originX"], uT = ["y", "scaleY", "originY"];
function ny(a, n, r, o) {
  ey(a.x, n, cT, r ? r.x : void 0, o ? o.x : void 0), ey(a.y, n, uT, r ? r.y : void 0, o ? o.y : void 0);
}
function ay(a) {
  return a.translate === 0 && a.scale === 1;
}
function t1(a) {
  return ay(a.x) && ay(a.y);
}
function iy(a, n) {
  return a.min === n.min && a.max === n.max;
}
function dT(a, n) {
  return iy(a.x, n.x) && iy(a.y, n.y);
}
function ry(a, n) {
  return Math.round(a.min) === Math.round(n.min) && Math.round(a.max) === Math.round(n.max);
}
function e1(a, n) {
  return ry(a.x, n.x) && ry(a.y, n.y);
}
function oy(a) {
  return rn(a.x) / rn(a.y);
}
function sy(a, n) {
  return a.translate === n.translate && a.scale === n.scale && a.originPoint === n.originPoint;
}
function da(a) {
  return [a("x"), a("y")];
}
function fT(a, n, r) {
  let o = "";
  const l = a.x.translate / n.x, u = a.y.translate / n.y, f = r?.z || 0;
  if ((l || u || f) && (o = `translate3d(${l}px, ${u}px, ${f}px) `), (n.x !== 1 || n.y !== 1) && (o += `scale(${1 / n.x}, ${1 / n.y}) `), r) {
    const { transformPerspective: m, rotate: g, pathRotation: v, rotateX: b, rotateY: k, skewX: E, skewY: A } = r;
    m && (o = `perspective(${m}px) ${o}`), g && (o += `rotate(${g}deg) `), v && (o += `rotate(${v}deg) `), b && (o += `rotateX(${b}deg) `), k && (o += `rotateY(${k}deg) `), E && (o += `skewX(${E}deg) `), A && (o += `skewY(${A}deg) `);
  }
  const h = a.x.scale * n.x, p = a.y.scale * n.y;
  return (h !== 1 || p !== 1) && (o += `scale(${h}, ${p})`), o || "none";
}
const n1 = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius"
], hT = n1.length, ly = (a) => typeof a == "string" ? parseFloat(a) : a, cy = (a) => typeof a == "number" || ut.test(a);
function pT(a, n, r, o, l, u) {
  l ? (a.opacity = Jt(0, r.opacity ?? 1, mT(o)), a.opacityExit = Jt(n.opacity ?? 1, 0, gT(o))) : u && (a.opacity = Jt(n.opacity ?? 1, r.opacity ?? 1, o));
  for (let f = 0; f < hT; f++) {
    const h = n1[f];
    let p = uy(n, h), m = uy(r, h);
    if (p === void 0 && m === void 0)
      continue;
    p || (p = 0), m || (m = 0), p === 0 || m === 0 || cy(p) === cy(m) ? (a[h] = Math.max(Jt(ly(p), ly(m), o), 0), (ha.test(m) || ha.test(p)) && (a[h] += "%")) : a[h] = m;
  }
  (n.rotate || r.rotate) && (a.rotate = Jt(n.rotate || 0, r.rotate || 0, o));
}
function uy(a, n) {
  return a[n] !== void 0 ? a[n] : a.borderRadius;
}
const mT = /* @__PURE__ */ a1(0, 0.5, Xv), gT = /* @__PURE__ */ a1(0.5, 0.95, Fn);
function a1(a, n, r) {
  return (o) => o < a ? 0 : o > n ? 1 : r(/* @__PURE__ */ ls(a, n, o));
}
function yT(a, n, r) {
  const o = Ye(a) ? a : Wr(a);
  return o.start(dh("", o, n, r)), o.animation;
}
function ds(a, n, r, o = { passive: !0 }) {
  return a.addEventListener(n, r, o), () => a.removeEventListener(n, r, o);
}
const vT = (a, n) => a.depth - n.depth;
class bT {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(n) {
    Jf(this.children, n), this.isDirty = !0;
  }
  remove(n) {
    nc(this.children, n), this.isDirty = !0;
  }
  forEach(n) {
    this.isDirty && this.children.sort(vT), this.isDirty = !1, this.children.forEach(n);
  }
}
function wT(a, n) {
  const r = an.now(), o = ({ timestamp: l }) => {
    const u = l - r;
    u >= n && (wi(o), a(u - n));
  };
  return $t.setup(o, !0), () => wi(o);
}
function Zl(a) {
  return Ye(a) ? a.get() : a;
}
class xT {
  constructor() {
    this.members = [];
  }
  add(n) {
    Jf(this.members, n);
    for (let r = this.members.length - 1; r >= 0; r--) {
      const o = this.members[r];
      if (o === n || o === this.lead || o === this.prevLead)
        continue;
      const l = o.instance;
      (!l || l.isConnected === !1) && !o.snapshot && (nc(this.members, o), o.unmount());
    }
    n.scheduleRender();
  }
  remove(n) {
    if (nc(this.members, n), n === this.prevLead && (this.prevLead = void 0), n === this.lead) {
      const r = this.members[this.members.length - 1];
      r && this.promote(r);
    }
  }
  relegate(n) {
    for (let r = this.members.indexOf(n) - 1; r >= 0; r--) {
      const o = this.members[r];
      if (o.isPresent !== !1 && o.instance?.isConnected !== !1)
        return this.promote(o), !0;
    }
    return !1;
  }
  promote(n, r) {
    const o = this.lead;
    if (n !== o && (this.prevLead = o, this.lead = n, n.show(), o)) {
      o.updateSnapshot(), n.scheduleRender();
      const { layoutDependency: l } = o.options, { layoutDependency: u } = n.options;
      (l === void 0 || l !== u) && (n.resumeFrom = o, r && (o.preserveOpacity = !0), o.snapshot && (n.snapshot = o.snapshot, n.snapshot.latestValues = o.animationValues || o.latestValues), n.root?.isUpdating && (n.isLayoutDirty = !0)), n.options.crossfade === !1 && o.hide();
    }
  }
  exitAnimationComplete() {
    this.members.forEach((n) => {
      n.options.onExitComplete?.(), n.resumingFrom?.options.onExitComplete?.();
    });
  }
  scheduleRender() {
    this.members.forEach((n) => n.instance && n.scheduleRender(!1));
  }
  removeLeadSnapshot() {
    this.lead?.snapshot && (this.lead.snapshot = void 0);
  }
}
const Jl = {
  /**
   * Global flag as to whether the tree has animated since the last time
   * we resized the window
   */
  hasAnimatedSinceResize: !0,
  /**
   * We set this to true once, on the first update. Any nodes added to the tree beyond that
   * update will be given a `data-projection-id` attribute.
   */
  hasEverUpdated: !1
}, Pd = ["", "X", "Y", "Z"], ST = 1e3;
let kT = 0;
function Yd(a, n, r, o) {
  const { latestValues: l } = n;
  l[a] && (r[a] = l[a], n.setStaticValue(a, 0), o && (o[a] = 0));
}
function i1(a) {
  if (a.hasCheckedOptimisedAppear = !0, a.root === a)
    return;
  const { visualElement: n } = a.options;
  if (!n)
    return;
  const r = Eb(n);
  if (window.MotionHasOptimisedAnimation(r, "transform")) {
    const { layout: l, layoutId: u } = a.options;
    window.MotionCancelOptimisedAnimation(r, "transform", $t, !(l || u));
  }
  const { parent: o } = a;
  o && !o.hasCheckedOptimisedAppear && i1(o);
}
function r1({ attachResizeListener: a, defaultParent: n, measureScroll: r, checkIsScrollRoot: o, resetTransform: l }) {
  return class {
    constructor(f = {}, h = n?.()) {
      this.id = kT++, this.animationId = 0, this.animationCommitId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.layoutVersion = 0, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, this.nodes.forEach(MT), this.nodes.forEach(DT), this.nodes.forEach(NT), this.nodes.forEach(RT);
      }, this.resolvedRelativeTargetAt = 0, this.linkedParentVersion = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = f, this.root = h ? h.root || h : this, this.path = h ? [...h.path, h] : [], this.parent = h, this.depth = h ? h.depth + 1 : 0;
      for (let p = 0; p < this.path.length; p++)
        this.path[p].shouldResetTransform = !0;
      this.root === this && (this.nodes = new bT());
    }
    addEventListener(f, h) {
      return this.eventHandlers.has(f) || this.eventHandlers.set(f, new th()), this.eventHandlers.get(f).add(h);
    }
    notifyListeners(f, ...h) {
      const p = this.eventHandlers.get(f);
      p && p.notify(...h);
    }
    hasListeners(f) {
      return this.eventHandlers.has(f);
    }
    /**
     * Lifecycles
     */
    mount(f) {
      if (this.instance)
        return;
      this.isSVG = gh(f) && !E3(f), this.instance = f;
      const { layoutId: h, layout: p, visualElement: m } = this.options;
      if (m && !m.current && m.mount(f), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (p || h) && (this.isLayoutDirty = !0), a) {
        let g, v = 0;
        const b = () => this.root.updateBlockedByResize = !1;
        $t.read(() => {
          v = window.innerWidth;
        }), a(f, () => {
          const k = window.innerWidth;
          k !== v && (v = k, this.root.updateBlockedByResize = !0, g && g(), g = wT(b, 250), Jl.hasAnimatedSinceResize && (Jl.hasAnimatedSinceResize = !1, this.nodes.forEach(hy)));
        });
      }
      h && this.root.registerSharedNode(h, this), this.options.animate !== !1 && m && (h || p) && this.addEventListener("didUpdate", ({ delta: g, hasLayoutChanged: v, hasRelativeLayoutChanged: b, layout: k }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const E = this.options.transition || m.getDefaultTransition() || BT, { onLayoutAnimationStart: A, onLayoutAnimationComplete: C } = m.getProps(), M = !this.targetLayout || !e1(this.targetLayout, k), D = !v && b;
        if (this.options.layoutRoot || this.resumeFrom || D || v && (M || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
          const R = {
            ...uh(E, "layout"),
            onPlay: A,
            onComplete: C
          };
          (m.shouldReduceMotion || this.options.layoutRoot) && (R.delay = 0, R.type = !1), this.startAnimation(R), this.setAnimationOrigin(g, D, R.path);
        } else
          v || hy(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = k;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const f = this.getStack();
      f && f.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, this.eventHandlers.clear(), wi(this.updateProjection);
    }
    // only on the root
    blockUpdate() {
      this.updateManuallyBlocked = !0;
    }
    unblockUpdate() {
      this.updateManuallyBlocked = !1;
    }
    isUpdateBlocked() {
      return this.updateManuallyBlocked || this.updateBlockedByResize;
    }
    isTreeAnimationBlocked() {
      return this.isAnimationBlocked || this.parent && this.parent.isTreeAnimationBlocked() || !1;
    }
    // Note: currently only running on root node
    startUpdate() {
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(OT), this.animationId++);
    }
    getTransformTemplate() {
      const { visualElement: f } = this.options;
      return f && f.getProps().transformTemplate;
    }
    willUpdate(f = !0) {
      if (this.root.hasTreeAnimated = !0, this.root.isUpdateBlocked()) {
        this.options.onExitComplete && this.options.onExitComplete();
        return;
      }
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && i1(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
        return;
      this.isLayoutDirty = !0;
      for (let g = 0; g < this.path.length; g++) {
        const v = this.path[g];
        v.shouldResetTransform = !0, (typeof v.latestValues.x == "string" || typeof v.latestValues.y == "string") && (v.isLayoutDirty = !0), v.updateScroll("snapshot"), v.options.layoutRoot && v.willUpdate(!1);
      }
      const { layoutId: h, layout: p } = this.options;
      if (h === void 0 && !p)
        return;
      const m = this.getTransformTemplate();
      this.prevTransformTemplateValue = m ? m(this.latestValues, "") : void 0, this.updateSnapshot(), f && this.notifyListeners("willUpdate");
    }
    update() {
      if (this.updateScheduled = !1, this.isUpdateBlocked()) {
        const p = this.updateBlockedByResize;
        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), p && this.nodes.forEach(AT), this.nodes.forEach(dy);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(fy);
        return;
      }
      this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(jT), this.nodes.forEach(LT), this.nodes.forEach(TT), this.nodes.forEach(ET)) : this.nodes.forEach(fy), this.clearAllSnapshots();
      const h = an.now();
      Pe.delta = pa(0, 1e3 / 60, h - Pe.timestamp), Pe.timestamp = h, Pe.isProcessing = !0, Nd.update.process(Pe), Nd.preRender.process(Pe), Nd.render.process(Pe), Pe.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, ph.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(CT), this.sharedNodes.forEach(_T);
    }
    scheduleUpdateProjection() {
      this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0, $t.preRender(this.updateProjection, !1, !0));
    }
    scheduleCheckAfterUnmount() {
      $t.postRender(() => {
        this.isLayoutDirty ? this.root.didUpdate() : this.root.checkUpdateFailed();
      });
    }
    /**
     * Update measurements
     */
    updateSnapshot() {
      this.snapshot || !this.instance || (this.snapshot = this.measure(), this.snapshot && !rn(this.snapshot.measuredBox.x) && !rn(this.snapshot.measuredBox.y) && (this.snapshot = void 0));
    }
    updateLayout() {
      if (!this.instance || (this.updateScroll(), !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty))
        return;
      if (this.resumeFrom && !this.resumeFrom.instance)
        for (let p = 0; p < this.path.length; p++)
          this.path[p].updateScroll();
      const f = this.layout;
      this.layout = this.measure(!1), this.layoutVersion++, this.layoutCorrected || (this.layoutCorrected = Ae()), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
      const { visualElement: h } = this.options;
      h && h.notify("LayoutMeasure", this.layout.layoutBox, f ? f.layoutBox : void 0);
    }
    updateScroll(f = "measure") {
      let h = !!(this.options.layoutScroll && this.instance);
      if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === f && (h = !1), h && this.instance) {
        const p = o(this.instance);
        this.scroll = {
          animationId: this.root.animationId,
          phase: f,
          isRoot: p,
          offset: r(this.instance),
          wasRoot: this.scroll ? this.scroll.isRoot : p
        };
      }
    }
    resetTransform() {
      if (!l)
        return;
      const f = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, h = this.projectionDelta && !t1(this.projectionDelta), p = this.getTransformTemplate(), m = p ? p(this.latestValues, "") : void 0, g = m !== this.prevTransformTemplateValue;
      f && this.instance && (h || Qi(this.latestValues) || g) && (l(this.instance, m), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(f = !0) {
      const h = this.measurePageBox();
      let p = this.removeElementScroll(h);
      return f && (p = this.removeTransform(p)), VT(p), {
        animationId: this.root.animationId,
        measuredBox: h,
        layoutBox: p,
        latestValues: {},
        source: this.id
      };
    }
    measurePageBox() {
      const { visualElement: f } = this.options;
      if (!f)
        return Ae();
      const h = f.measureViewportBox();
      if (!(this.scroll?.wasRoot || this.path.some(HT))) {
        const { scroll: m } = this.root;
        m && (fa(h.x, m.offset.x), fa(h.y, m.offset.y));
      }
      return h;
    }
    removeElementScroll(f) {
      const h = Ae();
      if (ta(h, f), this.scroll?.wasRoot)
        return h;
      for (let p = 0; p < this.path.length; p++) {
        const m = this.path[p], { scroll: g, options: v } = m;
        m !== this.root && g && v.layoutScroll && (g.wasRoot && ta(h, f), fa(h.x, g.offset.x), fa(h.y, g.offset.y));
      }
      return h;
    }
    applyTransform(f, h = !1, p) {
      const m = p || Ae();
      ta(m, f);
      for (let g = 0; g < this.path.length; g++) {
        const v = this.path[g];
        !h && v.options.layoutScroll && v.scroll && v !== v.root && (fa(m.x, -v.scroll.offset.x), fa(m.y, -v.scroll.offset.y)), Qi(v.latestValues) && Ql(m, v.latestValues, v.layout?.layoutBox);
      }
      return Qi(this.latestValues) && Ql(m, this.latestValues, this.layout?.layoutBox), m;
    }
    removeTransform(f) {
      const h = Ae();
      ta(h, f);
      for (let p = 0; p < this.path.length; p++) {
        const m = this.path[p];
        if (!Qi(m.latestValues))
          continue;
        let g;
        m.instance && (Tf(m.latestValues) && m.updateSnapshot(), g = Ae(), ta(g, m.measurePageBox())), ny(h, m.latestValues, m.snapshot?.layoutBox, g);
      }
      return Qi(this.latestValues) && ny(h, this.latestValues), h;
    }
    setTargetDelta(f) {
      this.targetDelta = f, this.root.scheduleUpdateProjection(), this.isProjectionDirty = !0;
    }
    setOptions(f) {
      this.options = {
        ...this.options,
        ...f,
        crossfade: f.crossfade !== void 0 ? f.crossfade : !0
      };
    }
    clearMeasurements() {
      this.scroll = void 0, this.layout = void 0, this.snapshot = void 0, this.prevTransformTemplateValue = void 0, this.targetDelta = void 0, this.target = void 0, this.isLayoutDirty = !1;
    }
    forceRelativeParentToResolveTarget() {
      this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== Pe.timestamp && this.relativeParent.resolveTargetDelta(!0);
    }
    resolveTargetDelta(f = !1) {
      const h = this.getLead();
      this.isProjectionDirty || (this.isProjectionDirty = h.isProjectionDirty), this.isTransformDirty || (this.isTransformDirty = h.isTransformDirty), this.isSharedProjectionDirty || (this.isSharedProjectionDirty = h.isSharedProjectionDirty);
      const p = !!this.resumingFrom || this !== h;
      if (!(f || p && this.isSharedProjectionDirty || this.isProjectionDirty || this.parent?.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize))
        return;
      const { layout: g, layoutId: v } = this.options;
      if (!this.layout || !(g || v))
        return;
      this.resolvedRelativeTargetAt = Pe.timestamp;
      const b = this.getClosestProjectingParent();
      b && this.linkedParentVersion !== b.layoutVersion && !b.options.layoutRoot && this.removeRelativeTarget(), !this.targetDelta && !this.relativeTarget && (this.options.layoutAnchor !== !1 && b && b.layout ? this.createRelativeTarget(b, this.layout.layoutBox, b.layout.layoutBox) : this.removeRelativeTarget()), !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = Ae(), this.targetWithTransforms = Ae()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), sT(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || void 0)) : this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : ta(this.target, this.layout.layoutBox), Yb(this.target, this.targetDelta)) : ta(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, this.options.layoutAnchor !== !1 && b && !!b.resumingFrom == !!this.resumingFrom && !b.options.layoutScroll && b.target && this.animationProgress !== 1 ? this.createRelativeTarget(b, this.target, b.target) : this.relativeParent = this.relativeTarget = void 0));
    }
    getClosestProjectingParent() {
      if (!(!this.parent || Tf(this.parent.latestValues) || Pb(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    createRelativeTarget(f, h, p) {
      this.relativeParent = f, this.linkedParentVersion = f.layoutVersion, this.forceRelativeParentToResolveTarget(), this.relativeTarget = Ae(), this.relativeTargetOrigin = Ae(), uc(this.relativeTargetOrigin, h, p, this.options.layoutAnchor || void 0), ta(this.relativeTarget, this.relativeTargetOrigin);
    }
    removeRelativeTarget() {
      this.relativeParent = this.relativeTarget = void 0;
    }
    calcProjection() {
      const f = this.getLead(), h = !!this.resumingFrom || this !== f;
      let p = !0;
      if ((this.isProjectionDirty || this.parent?.isProjectionDirty) && (p = !1), h && (this.isSharedProjectionDirty || this.isTransformDirty) && (p = !1), this.resolvedRelativeTargetAt === Pe.timestamp && (p = !1), p)
        return;
      const { layout: m, layoutId: g } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(m || g))
        return;
      ta(this.layoutCorrected, this.layout.layoutBox);
      const v = this.treeScale.x, b = this.treeScale.y;
      z3(this.layoutCorrected, this.treeScale, this.path, h), f.layout && !f.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (f.target = f.layout.layoutBox, f.targetWithTransforms = Ae());
      const { target: k } = f;
      if (!k) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (Q0(this.prevProjectionDelta.x, this.projectionDelta.x), Q0(this.prevProjectionDelta.y, this.projectionDelta.y)), rs(this.projectionDelta, this.layoutCorrected, k, this.latestValues), (this.treeScale.x !== v || this.treeScale.y !== b || !sy(this.projectionDelta.x, this.prevProjectionDelta.x) || !sy(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", k));
    }
    hide() {
      this.isVisible = !1;
    }
    show() {
      this.isVisible = !0;
    }
    scheduleRender(f = !0) {
      if (this.options.visualElement?.scheduleRender(), f) {
        const h = this.getStack();
        h && h.scheduleRender();
      }
      this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0);
    }
    createProjectionDeltas() {
      this.prevProjectionDelta = Kr(), this.projectionDelta = Kr(), this.projectionDeltaWithTransform = Kr();
    }
    setAnimationOrigin(f, h = !1, p) {
      const m = this.snapshot, g = m ? m.latestValues : {}, v = { ...this.latestValues }, b = Kr();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !h;
      const k = Ae(), E = m ? m.source : void 0, A = this.layout ? this.layout.source : void 0, C = E !== A, M = this.getStack(), D = !M || M.members.length <= 1, R = !!(C && !D && this.options.crossfade === !0 && !this.path.some(UT));
      this.animationProgress = 0;
      let z;
      const Z = p?.interpolateProjection(f);
      this.mixTargetDelta = (W) => {
        const X = W / 1e3, F = Z?.(X);
        F ? (b.x.translate = F.x, b.x.scale = Jt(f.x.scale, 1, X), b.x.origin = f.x.origin, b.x.originPoint = f.x.originPoint, b.y.translate = F.y, b.y.scale = Jt(f.y.scale, 1, X), b.y.origin = f.y.origin, b.y.originPoint = f.y.originPoint) : (py(b.x, f.x, X), py(b.y, f.y, X)), this.setTargetDelta(b), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (uc(k, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), zT(this.relativeTarget, this.relativeTargetOrigin, k, X), z && dT(this.relativeTarget, z) && (this.isProjectionDirty = !1), z || (z = Ae()), ta(z, this.relativeTarget)), C && (this.animationValues = v, pT(v, g, this.latestValues, X, R, D)), F && F.rotate !== void 0 && (this.animationValues || (this.animationValues = v), this.animationValues.pathRotation = F.rotate), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = X;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(f) {
      this.notifyListeners("animationStart"), this.currentAnimation?.stop(), this.resumingFrom?.currentAnimation?.stop(), this.pendingAnimation && (wi(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = $t.update(() => {
        Jl.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = Wr(0)), this.motionValue.jump(0, !1), this.currentAnimation = yT(this.motionValue, [0, 1e3], {
          ...f,
          velocity: 0,
          isSync: !0,
          onUpdate: (h) => {
            this.mixTargetDelta(h), f.onUpdate && f.onUpdate(h);
          },
          onComplete: () => {
            f.onComplete && f.onComplete(), this.completeAnimation();
          }
        }), this.resumingFrom && (this.resumingFrom.currentAnimation = this.currentAnimation), this.pendingAnimation = void 0;
      });
    }
    completeAnimation() {
      this.resumingFrom && (this.resumingFrom.currentAnimation = void 0, this.resumingFrom.preserveOpacity = void 0);
      const f = this.getStack();
      f && f.exitAnimationComplete(), this.resumingFrom = this.currentAnimation = this.animationValues = void 0, this.notifyListeners("animationComplete");
    }
    finishAnimation() {
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(ST), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const f = this.getLead();
      let { targetWithTransforms: h, target: p, layout: m, latestValues: g } = f;
      if (!(!h || !p || !m)) {
        if (this !== f && this.layout && m && o1(this.options.animationType, this.layout.layoutBox, m.layoutBox)) {
          p = this.target || Ae();
          const v = rn(this.layout.layoutBox.x);
          p.x.min = f.target.x.min, p.x.max = p.x.min + v;
          const b = rn(this.layout.layoutBox.y);
          p.y.min = f.target.y.min, p.y.max = p.y.min + b;
        }
        ta(h, p), Ql(h, g), rs(this.projectionDeltaWithTransform, this.layoutCorrected, h, g);
      }
    }
    registerSharedNode(f, h) {
      this.sharedNodes.has(f) || this.sharedNodes.set(f, new xT()), this.sharedNodes.get(f).add(h);
      const m = h.options.initialPromotionConfig;
      h.promote({
        transition: m ? m.transition : void 0,
        preserveFollowOpacity: m && m.shouldPreserveFollowOpacity ? m.shouldPreserveFollowOpacity(h) : void 0
      });
    }
    isLead() {
      const f = this.getStack();
      return f ? f.lead === this : !0;
    }
    getLead() {
      const { layoutId: f } = this.options;
      return f ? this.getStack()?.lead || this : this;
    }
    getPrevLead() {
      const { layoutId: f } = this.options;
      return f ? this.getStack()?.prevLead : void 0;
    }
    getStack() {
      const { layoutId: f } = this.options;
      if (f)
        return this.root.sharedNodes.get(f);
    }
    promote({ needsReset: f, transition: h, preserveFollowOpacity: p } = {}) {
      const m = this.getStack();
      m && m.promote(this, p), f && (this.projectionDelta = void 0, this.needsReset = !0), h && this.setOptions({ transition: h });
    }
    relegate() {
      const f = this.getStack();
      return f ? f.relegate(this) : !1;
    }
    resetSkewAndRotation() {
      const { visualElement: f } = this.options;
      if (!f)
        return;
      let h = !1;
      const { latestValues: p } = f;
      if ((p.z || p.rotate || p.rotateX || p.rotateY || p.rotateZ || p.skewX || p.skewY) && (h = !0), !h)
        return;
      const m = {};
      p.z && Yd("z", f, m, this.animationValues);
      for (let g = 0; g < Pd.length; g++)
        Yd(`rotate${Pd[g]}`, f, m, this.animationValues), Yd(`skew${Pd[g]}`, f, m, this.animationValues);
      f.render();
      for (const g in m)
        f.setStaticValue(g, m[g]), this.animationValues && (this.animationValues[g] = m[g]);
      f.scheduleRender();
    }
    applyProjectionStyles(f, h) {
      if (!this.instance || this.isSVG)
        return;
      if (!this.isVisible) {
        f.visibility = "hidden";
        return;
      }
      const p = this.getTransformTemplate();
      if (this.needsReset) {
        this.needsReset = !1, f.visibility = "", f.opacity = "", f.pointerEvents = Zl(h?.pointerEvents) || "", f.transform = p ? p(this.latestValues, "") : "none";
        return;
      }
      const m = this.getLead();
      if (!this.projectionDelta || !this.layout || !m.target) {
        this.options.layoutId && (f.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, f.pointerEvents = Zl(h?.pointerEvents) || ""), this.hasProjected && !Qi(this.latestValues) && (f.transform = p ? p({}, "") : "none", this.hasProjected = !1);
        return;
      }
      f.visibility = "";
      const g = m.animationValues || m.latestValues;
      this.applyTransformsToTarget();
      let v = fT(this.projectionDeltaWithTransform, this.treeScale, g);
      p && (v = p(g, v)), f.transform = v;
      const { x: b, y: k } = this.projectionDelta;
      f.transformOrigin = `${b.origin * 100}% ${k.origin * 100}% 0`, m.animationValues ? f.opacity = m === this ? g.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : g.opacityExit : f.opacity = m === this ? g.opacity !== void 0 ? g.opacity : "" : g.opacityExit !== void 0 ? g.opacityExit : 0;
      for (const E in Mf) {
        if (g[E] === void 0)
          continue;
        const { correct: A, applyTo: C, isCSSVariable: M } = Mf[E], D = v === "none" ? g[E] : A(g[E], m);
        if (C) {
          const R = C.length;
          for (let z = 0; z < R; z++)
            f[C[z]] = D;
        } else
          M ? this.options.visualElement.renderState.vars[E] = D : f[E] = D;
      }
      this.options.layoutId && (f.pointerEvents = m === this ? Zl(h?.pointerEvents) || "" : "none");
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((f) => f.currentAnimation?.stop()), this.root.nodes.forEach(dy), this.root.sharedNodes.clear();
    }
  };
}
function TT(a) {
  a.updateLayout();
}
function ET(a) {
  const n = a.resumeFrom?.snapshot || a.snapshot;
  if (a.isLead() && a.layout && n && a.hasListeners("didUpdate")) {
    const { layoutBox: r, measuredBox: o } = a.layout, { animationType: l } = a.options, u = n.source !== a.layout.source;
    if (l === "size")
      da((g) => {
        const v = u ? n.measuredBox[g] : n.layoutBox[g], b = rn(v);
        v.min = r[g].min, v.max = v.min + b;
      });
    else if (l === "x" || l === "y") {
      const g = l === "x" ? "y" : "x";
      Rf(u ? n.measuredBox[g] : n.layoutBox[g], r[g]);
    } else o1(l, n.layoutBox, r) && da((g) => {
      const v = u ? n.measuredBox[g] : n.layoutBox[g], b = rn(r[g]);
      v.max = v.min + b, a.relativeTarget && !a.currentAnimation && (a.isProjectionDirty = !0, a.relativeTarget[g].max = a.relativeTarget[g].min + b);
    });
    const f = Kr();
    rs(f, r, n.layoutBox);
    const h = Kr();
    u ? rs(h, a.applyTransform(o, !0), n.measuredBox) : rs(h, r, n.layoutBox);
    const p = !t1(f);
    let m = !1;
    if (!a.resumeFrom) {
      const g = a.getClosestProjectingParent();
      if (g && !g.resumeFrom) {
        const { snapshot: v, layout: b } = g;
        if (v && b) {
          const k = a.options.layoutAnchor || void 0, E = Ae();
          uc(E, n.layoutBox, v.layoutBox, k);
          const A = Ae();
          uc(A, r, b.layoutBox, k), e1(E, A) || (m = !0), g.options.layoutRoot && (a.relativeTarget = A, a.relativeTargetOrigin = E, a.relativeParent = g);
        }
      }
    }
    a.notifyListeners("didUpdate", {
      layout: r,
      snapshot: n,
      delta: h,
      layoutDelta: f,
      hasLayoutChanged: p,
      hasRelativeLayoutChanged: m
    });
  } else if (a.isLead()) {
    const { onExitComplete: r } = a.options;
    r && r();
  }
  a.options.transition = void 0;
}
function MT(a) {
  a.parent && (a.isProjecting() || (a.isProjectionDirty = a.parent.isProjectionDirty), a.isSharedProjectionDirty || (a.isSharedProjectionDirty = !!(a.isProjectionDirty || a.parent.isProjectionDirty || a.parent.isSharedProjectionDirty)), a.isTransformDirty || (a.isTransformDirty = a.parent.isTransformDirty));
}
function RT(a) {
  a.isProjectionDirty = a.isSharedProjectionDirty = a.isTransformDirty = !1;
}
function CT(a) {
  a.clearSnapshot();
}
function dy(a) {
  a.clearMeasurements();
}
function AT(a) {
  a.isLayoutDirty = !0, a.updateLayout();
}
function fy(a) {
  a.isLayoutDirty = !1;
}
function jT(a) {
  a.isAnimationBlocked && a.layout && !a.isLayoutDirty && (a.snapshot = a.layout, a.isLayoutDirty = !0);
}
function LT(a) {
  const { visualElement: n } = a.options;
  n && n.getProps().onBeforeLayoutMeasure && n.notify("BeforeLayoutMeasure"), a.resetTransform();
}
function hy(a) {
  a.finishAnimation(), a.targetDelta = a.relativeTarget = a.target = void 0, a.isProjectionDirty = !0;
}
function DT(a) {
  a.resolveTargetDelta();
}
function NT(a) {
  a.calcProjection();
}
function OT(a) {
  a.resetSkewAndRotation();
}
function _T(a) {
  a.removeLeadSnapshot();
}
function py(a, n, r) {
  a.translate = Jt(n.translate, 0, r), a.scale = Jt(n.scale, 1, r), a.origin = n.origin, a.originPoint = n.originPoint;
}
function my(a, n, r, o) {
  a.min = Jt(n.min, r.min, o), a.max = Jt(n.max, r.max, o);
}
function zT(a, n, r, o) {
  my(a.x, n.x, r.x, o), my(a.y, n.y, r.y, o);
}
function UT(a) {
  return a.animationValues && a.animationValues.opacityExit !== void 0;
}
const BT = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, gy = (a) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(a), yy = gy("applewebkit/") && !gy("chrome/") ? Math.round : Fn;
function vy(a) {
  a.min = yy(a.min), a.max = yy(a.max);
}
function VT(a) {
  vy(a.x), vy(a.y);
}
function o1(a, n, r) {
  return a === "position" || a === "preserve-aspect" && !oT(oy(n), oy(r), 0.2);
}
function HT(a) {
  return a !== a.root && a.scroll?.wasRoot;
}
const PT = r1({
  attachResizeListener: (a, n) => ds(a, "resize", n),
  measureScroll: () => ({
    x: document.documentElement.scrollLeft || document.body?.scrollLeft || 0,
    y: document.documentElement.scrollTop || document.body?.scrollTop || 0
  }),
  checkIsScrollRoot: () => !0
}), Kd = {
  current: void 0
}, s1 = r1({
  measureScroll: (a) => ({
    x: a.scrollLeft,
    y: a.scrollTop
  }),
  defaultParent: () => {
    if (!Kd.current) {
      const a = new PT({});
      a.mount(window), a.setOptions({ layoutScroll: !0 }), Kd.current = a;
    }
    return Kd.current;
  },
  resetTransform: (a, n) => {
    a.style.transform = n !== void 0 ? n : "none";
  },
  checkIsScrollRoot: (a) => window.getComputedStyle(a).position === "fixed"
}), xh = x.createContext({
  transformPagePoint: (a) => a,
  isStatic: !1,
  reducedMotion: "never"
});
function by(a, n) {
  if (typeof a == "function")
    return a(n);
  a != null && (a.current = n);
}
function YT(...a) {
  return (n) => {
    let r = !1;
    const o = a.map((l) => {
      const u = by(l, n);
      return !r && typeof u == "function" && (r = !0), u;
    });
    if (r)
      return () => {
        for (let l = 0; l < o.length; l++) {
          const u = o[l];
          typeof u == "function" ? u() : by(a[l], null);
        }
      };
  };
}
function KT(...a) {
  return x.useCallback(YT(...a), a);
}
class qT extends x.Component {
  getSnapshotBeforeUpdate(n) {
    const r = this.props.childRef.current;
    if (Fl(r) && n.isPresent && !this.props.isPresent && this.props.pop !== !1) {
      const o = r.offsetParent, l = Fl(o) && o.offsetWidth || 0, u = Fl(o) && o.offsetHeight || 0, f = getComputedStyle(r), h = this.props.sizeRef.current;
      h.height = parseFloat(f.height), h.width = parseFloat(f.width), h.top = r.offsetTop, h.left = r.offsetLeft, h.right = l - h.width - h.left, h.bottom = u - h.height - h.top, h.direction = f.direction;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function FT({ children: a, isPresent: n, anchorX: r, anchorY: o, root: l, pop: u }) {
  const f = x.useId(), h = x.useRef(null), p = x.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  }), { nonce: m } = x.useContext(xh), g = a.props?.ref ?? a?.ref, v = KT(h, g);
  return x.useInsertionEffect(() => {
    const { width: b, height: k, top: E, left: A, right: C, bottom: M, direction: D } = p.current;
    if (n || u === !1 || !h.current || !b || !k)
      return;
    const R = D === "rtl", z = r === "left" ? R ? `right: ${C}` : `left: ${A}` : R ? `left: ${A}` : `right: ${C}`, Z = o === "bottom" ? `bottom: ${M}` : `top: ${E}`;
    h.current.dataset.motionPopId = f;
    const W = document.createElement("style");
    m && (W.nonce = m);
    const X = l ?? document.head;
    return X.appendChild(W), W.sheet && W.sheet.insertRule(`
          [data-motion-pop-id="${f}"] {
            position: absolute !important;
            width: ${b}px !important;
            height: ${k}px !important;
            ${z}px !important;
            ${Z}px !important;
          }
        `), () => {
      h.current?.removeAttribute("data-motion-pop-id"), X.contains(W) && X.removeChild(W);
    };
  }, [n]), S.jsx(qT, { isPresent: n, childRef: h, sizeRef: p, pop: u, children: u === !1 ? a : x.cloneElement(a, { ref: v }) });
}
const GT = ({ children: a, initial: n, isPresent: r, onExitComplete: o, custom: l, presenceAffectsLayout: u, mode: f, anchorX: h, anchorY: p, root: m }) => {
  const g = Qf(IT), v = x.useId(), b = x.useRef(r), k = x.useRef(o);
  Zf(() => {
    b.current = r, k.current = o;
  });
  let E = !0, A = x.useMemo(() => (E = !1, {
    id: v,
    initial: n,
    isPresent: r,
    custom: l,
    onExitComplete: (C) => {
      g.set(C, !0);
      for (const M of g.values())
        if (!M)
          return;
      o && o();
    },
    register: (C) => (g.set(C, !1), () => {
      g.delete(C), !b.current && !g.size && k.current?.();
    })
  }), [r, g, o]);
  return u && E && (A = { ...A }), x.useMemo(() => {
    g.forEach((C, M) => g.set(M, !1));
  }, [r]), x.useEffect(() => {
    !r && !g.size && o && o();
  }, [r]), a = S.jsx(FT, { pop: f === "popLayout", isPresent: r, anchorX: h, anchorY: p, root: m, children: a }), S.jsx(mc.Provider, { value: A, children: a });
};
function IT() {
  return /* @__PURE__ */ new Map();
}
function l1(a = !0) {
  const n = x.useContext(mc);
  if (n === null)
    return [!0, null];
  const { isPresent: r, onExitComplete: o, register: l } = n, u = x.useId();
  x.useEffect(() => {
    if (a)
      return l(u);
  }, [a]);
  const f = x.useCallback(() => a && o && o(u), [u, o, a]);
  return !r && o ? [!1, f] : [!0];
}
const Ul = (a) => a.key || "";
function wy(a) {
  const n = [];
  return x.Children.forEach(a, (r) => {
    x.isValidElement(r) && n.push(r);
  }), n;
}
const yi = ({ children: a, custom: n, initial: r = !0, onExitComplete: o, presenceAffectsLayout: l = !0, mode: u = "sync", propagate: f = !1, anchorX: h = "left", anchorY: p = "top", root: m }) => {
  const [g, v] = l1(f), b = x.useMemo(() => wy(a), [a]), k = f && !g ? [] : b.map(Ul), E = x.useRef(!0), A = x.useRef(b), C = Qf(() => /* @__PURE__ */ new Map()), M = x.useRef(/* @__PURE__ */ new Set()), [D, R] = x.useState(b), [z, Z] = x.useState(b);
  Zf(() => {
    E.current = !1, A.current = b;
    for (let F = 0; F < z.length; F++) {
      const at = Ul(z[F]);
      k.includes(at) ? (C.delete(at), M.current.delete(at)) : C.get(at) !== !0 && C.set(at, !1);
    }
  }, [z, k.length, k.join("-")]);
  const W = [];
  if (b !== D) {
    let F = [...b];
    for (let at = 0; at < z.length; at++) {
      const rt = z[at], pt = Ul(rt);
      k.includes(pt) || (F.splice(at, 0, rt), W.push(rt));
    }
    return u === "wait" && W.length && (F = W), Z(wy(F)), R(b), null;
  }
  const { forceRender: X } = x.useContext(Wf);
  return S.jsx(S.Fragment, { children: z.map((F) => {
    const at = Ul(F), rt = f && !g ? !1 : b === z || k.includes(at), pt = () => {
      if (M.current.has(at))
        return;
      if (C.has(at))
        M.current.add(at), C.set(at, !0);
      else
        return;
      let yt = !0;
      C.forEach((vt) => {
        vt || (yt = !1);
      }), yt && (X?.(), Z(A.current), f && v?.(), o && o());
    };
    return S.jsx(GT, { isPresent: rt, initial: !E.current || r ? void 0 : !1, custom: n, presenceAffectsLayout: l, mode: u, root: m, onExitComplete: rt ? void 0 : pt, anchorX: h, anchorY: p, children: F }, at);
  }) });
}, c1 = x.createContext({ strict: !1 }), xy = {
  animation: [
    "animate",
    "variants",
    "whileHover",
    "whileTap",
    "exit",
    "whileInView",
    "whileFocus",
    "whileDrag"
  ],
  exit: ["exit"],
  drag: ["drag", "dragControls"],
  focus: ["whileFocus"],
  hover: ["whileHover", "onHoverStart", "onHoverEnd"],
  tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
  pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
  inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
  layout: ["layout", "layoutId"]
};
let Sy = !1;
function XT() {
  if (Sy)
    return;
  const a = {};
  for (const n in xy)
    a[n] = {
      isEnabled: (r) => xy[n].some((o) => !!r[o])
    };
  Bb(a), Sy = !0;
}
function u1() {
  return XT(), D3();
}
function WT(a) {
  const n = u1();
  for (const r in a)
    n[r] = {
      ...n[r],
      ...a[r]
    };
  Bb(n);
}
const QT = /* @__PURE__ */ new Set([
  "animate",
  "exit",
  "variants",
  "initial",
  "style",
  "values",
  "variants",
  "transition",
  "transformTemplate",
  "custom",
  "inherit",
  "onBeforeLayoutMeasure",
  "onAnimationStart",
  "onAnimationComplete",
  "onUpdate",
  "onDragStart",
  "onDrag",
  "onDragEnd",
  "onMeasureDragConstraints",
  "onDirectionLock",
  "onDragTransitionEnd",
  "_dragX",
  "_dragY",
  "onHoverStart",
  "onHoverEnd",
  "onViewportEnter",
  "onViewportLeave",
  "globalTapTarget",
  "propagate",
  "ignoreStrict",
  "viewport"
]);
function dc(a) {
  return a.startsWith("while") || a.startsWith("drag") && a !== "draggable" || a.startsWith("layout") || a.startsWith("onTap") || a.startsWith("onPan") || a.startsWith("onLayout") || QT.has(a);
}
let d1 = (a) => !dc(a);
function ZT(a) {
  typeof a == "function" && (d1 = (n) => n.startsWith("on") ? !dc(n) : a(n));
}
try {
  ZT(require("@emotion/is-prop-valid").default);
} catch {
}
function JT(a, n, r) {
  const o = {};
  for (const l in a)
    l === "values" && typeof a.values == "object" || Ye(a[l]) || (d1(l) || r === !0 && dc(l) || !n && !dc(l) || // If trying to use native HTML drag events, forward drag listeners
    a.draggable && l.startsWith("onDrag")) && (o[l] = a[l]);
  return o;
}
const bc = /* @__PURE__ */ x.createContext({});
function $T(a, n) {
  if (vc(a)) {
    const { initial: r, animate: o } = a;
    return {
      initial: r === !1 || us(r) ? r : void 0,
      animate: us(o) ? o : void 0
    };
  }
  return a.inherit !== !1 ? n : {};
}
function tE(a) {
  const { initial: n, animate: r } = $T(a, x.useContext(bc));
  return x.useMemo(() => ({ initial: n, animate: r }), [ky(n), ky(r)]);
}
function ky(a) {
  return Array.isArray(a) ? a.join(" ") : a;
}
const Sh = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function f1(a, n, r) {
  for (const o in n)
    !Ye(n[o]) && !Fb(o, r) && (a[o] = n[o]);
}
function eE({ transformTemplate: a }, n) {
  return x.useMemo(() => {
    const r = Sh();
    return bh(r, n, a), Object.assign({}, r.vars, r.style);
  }, [n]);
}
function nE(a, n) {
  const r = a.style || {}, o = {};
  return f1(o, r, a), Object.assign(o, eE(a, n)), o;
}
function aE(a, n) {
  const r = {}, o = nE(a, n);
  return a.drag && a.dragListener !== !1 && (r.draggable = !1, o.userSelect = o.WebkitUserSelect = o.WebkitTouchCallout = "none", o.touchAction = a.drag === !0 ? "none" : `pan-${a.drag === "x" ? "y" : "x"}`), a.tabIndex === void 0 && (a.onTap || a.onTapStart || a.whileTap) && (r.tabIndex = 0), r.style = o, r;
}
const h1 = () => ({
  ...Sh(),
  attrs: {}
});
function iE(a, n, r, o) {
  const l = x.useMemo(() => {
    const u = h1();
    return Gb(u, n, Xb(o), a.transformTemplate, a.style), {
      ...u.attrs,
      style: { ...u.style }
    };
  }, [n]);
  if (a.style) {
    const u = {};
    f1(u, a.style, a), l.style = { ...u, ...l.style };
  }
  return l;
}
const rE = [
  "animate",
  "circle",
  "defs",
  "desc",
  "ellipse",
  "g",
  "image",
  "line",
  "filter",
  "marker",
  "mask",
  "metadata",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "rect",
  "stop",
  "switch",
  "symbol",
  "svg",
  "text",
  "tspan",
  "use",
  "view"
];
function kh(a) {
  return (
    /**
     * If it's not a string, it's a custom React component. Currently we only support
     * HTML custom React components.
     */
    typeof a != "string" || /**
     * If it contains a dash, the element is a custom HTML webcomponent.
     */
    a.includes("-") ? !1 : (
      /**
       * If it's in our list of lowercase SVG tags, it's an SVG component
       */
      !!(rE.indexOf(a) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(a))
    )
  );
}
function oE(a, n, r, { latestValues: o }, l, u = !1, f) {
  const p = (f ?? kh(a) ? iE : aE)(n, o, l, a), m = JT(n, typeof a == "string", u), g = a !== x.Fragment ? { ...m, ...p, ref: r } : {}, { children: v } = n, b = x.useMemo(() => Ye(v) ? v.get() : v, [v]);
  return x.createElement(a, {
    ...g,
    children: b
  });
}
function sE({ scrapeMotionValuesFromProps: a, createRenderState: n }, r, o, l) {
  return {
    latestValues: lE(r, o, l, a),
    renderState: n()
  };
}
function lE(a, n, r, o) {
  const l = {}, u = o(a, {});
  for (const b in u)
    l[b] = Zl(u[b]);
  let { initial: f, animate: h } = a;
  const p = vc(a), m = zb(a);
  n && m && !p && a.inherit !== !1 && (f === void 0 && (f = n.initial), h === void 0 && (h = n.animate));
  let g = r ? r.initial === !1 : !1;
  g = g || f === !1;
  const v = g ? h : f;
  if (v && typeof v != "boolean" && !yc(v)) {
    const b = Array.isArray(v) ? v : [v];
    for (let k = 0; k < b.length; k++) {
      const E = fh(a, b[k]);
      if (E) {
        const { transitionEnd: A, transition: C, ...M } = E;
        for (const D in M) {
          let R = M[D];
          if (Array.isArray(R)) {
            const z = g ? R.length - 1 : 0;
            R = R[z];
          }
          R !== null && (l[D] = R);
        }
        for (const D in A)
          l[D] = A[D];
      }
    }
  }
  return l;
}
const p1 = (a) => (n, r) => {
  const o = x.useContext(bc), l = x.useContext(mc), u = () => sE(a, n, o, l);
  return r ? u() : Qf(u);
}, cE = /* @__PURE__ */ p1({
  scrapeMotionValuesFromProps: wh,
  createRenderState: Sh
}), uE = /* @__PURE__ */ p1({
  scrapeMotionValuesFromProps: Wb,
  createRenderState: h1
}), dE = /* @__PURE__ */ Symbol.for("motionComponentSymbol");
function fE(a, n, r) {
  const o = x.useRef(r);
  x.useInsertionEffect(() => {
    o.current = r;
  });
  const l = x.useRef(null);
  return x.useCallback((u) => {
    u && a.onMount?.(u), n && (u ? n.mount(u) : n.unmount());
    const f = o.current;
    if (typeof f == "function")
      if (u) {
        const h = f(u);
        typeof h == "function" && (l.current = h);
      } else l.current ? (l.current(), l.current = null) : f(u);
    else f && (f.current = u);
  }, [n]);
}
const m1 = x.createContext({});
function Hr(a) {
  return a && typeof a == "object" && Object.prototype.hasOwnProperty.call(a, "current");
}
function hE(a, n, r, o, l, u) {
  const { visualElement: f } = x.useContext(bc), h = x.useContext(c1), p = x.useContext(mc), m = x.useContext(xh), g = m.reducedMotion, v = m.skipAnimations, b = x.useRef(null), k = x.useRef(!1);
  o = o || h.renderer, !b.current && o && (b.current = o(a, {
    visualState: n,
    parent: f,
    props: r,
    presenceContext: p,
    blockInitialAnimation: p ? p.initial === !1 : !1,
    reducedMotionConfig: g,
    skipAnimations: v,
    isSVG: u
  }), k.current && b.current && (b.current.manuallyAnimateOnMount = !0));
  const E = b.current, A = x.useContext(m1);
  E && !E.projection && l && (E.type === "html" || E.type === "svg") && pE(b.current, r, l, A);
  const C = x.useRef(!1);
  x.useInsertionEffect(() => {
    E && C.current && E.update(r, p);
  });
  const M = r[Tb], D = x.useRef(!!M && typeof window < "u" && !window.MotionHandoffIsComplete?.(M) && window.MotionHasOptimisedAnimation?.(M));
  return Zf(() => {
    k.current = !0, E && (C.current = !0, window.MotionIsMounted = !0, E.updateFeatures(), E.scheduleRenderMicrotask(), D.current && E.animationState && E.animationState.animateChanges());
  }), x.useEffect(() => {
    E && (!D.current && E.animationState && E.animationState.animateChanges(), D.current && (queueMicrotask(() => {
      window.MotionHandoffMarkAsComplete?.(M);
    }), D.current = !1), E.enteringChildren = void 0);
  }), E;
}
function pE(a, n, r, o) {
  const { layoutId: l, layout: u, drag: f, dragConstraints: h, layoutScroll: p, layoutRoot: m, layoutAnchor: g, layoutCrossfade: v } = n;
  a.projection = new r(a.latestValues, n["data-framer-portal-id"] ? void 0 : g1(a.parent)), a.projection.setOptions({
    layoutId: l,
    layout: u,
    alwaysMeasureLayout: !!f || h && Hr(h),
    visualElement: a,
    /**
     * TODO: Update options in an effect. This could be tricky as it'll be too late
     * to update by the time layout animations run.
     * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
     * ensuring it gets called if there's no potential layout animations.
     *
     */
    animationType: typeof u == "string" ? u : "both",
    initialPromotionConfig: o,
    crossfade: v,
    layoutScroll: p,
    layoutRoot: m,
    layoutAnchor: g
  });
}
function g1(a) {
  if (a)
    return a.options.allowProjection !== !1 ? a.projection : g1(a.parent);
}
function qd(a, { forwardMotionProps: n = !1, type: r } = {}, o, l) {
  o && WT(o);
  const u = r ? r === "svg" : kh(a), f = u ? uE : cE;
  function h(m, g) {
    let v;
    const b = {
      ...x.useContext(xh),
      ...m,
      layoutId: mE(m)
    }, { isStatic: k } = b, E = tE(m), A = f(m, k);
    if (!k && typeof window < "u") {
      gE();
      const C = yE(b);
      v = C.MeasureLayout, E.visualElement = hE(a, A, b, l, C.ProjectionNode, u);
    }
    return S.jsxs(bc.Provider, { value: E, children: [v && E.visualElement ? S.jsx(v, { visualElement: E.visualElement, ...b }) : null, oE(a, m, fE(A, E.visualElement, g), A, k, n, u)] });
  }
  h.displayName = `motion.${typeof a == "string" ? a : `create(${a.displayName ?? a.name ?? ""})`}`;
  const p = x.forwardRef(h);
  return p[dE] = a, p;
}
function mE({ layoutId: a }) {
  const n = x.useContext(Wf).id;
  return n && a !== void 0 ? n + "-" + a : a;
}
function gE(a, n) {
  x.useContext(c1).strict;
}
function yE(a) {
  const n = u1(), { drag: r, layout: o } = n;
  if (!r && !o)
    return {};
  const l = { ...r, ...o };
  return {
    MeasureLayout: r?.isEnabled(a) || o?.isEnabled(a) ? l.MeasureLayout : void 0,
    ProjectionNode: l.ProjectionNode
  };
}
function vE(a, n) {
  if (typeof Proxy > "u")
    return qd;
  const r = /* @__PURE__ */ new Map(), o = (u, f) => qd(u, f, a, n), l = (u, f) => o(u, f);
  return new Proxy(l, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (u, f) => f === "create" ? o : (r.has(f) || r.set(f, qd(f, void 0, a, n)), r.get(f))
  });
}
const bE = (a, n) => n.isSVG ?? kh(a) ? new W3(n) : new K3(n, {
  allowProjection: a !== x.Fragment
});
class wE extends xi {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(n) {
    super(n), n.animationState || (n.animationState = tT(n));
  }
  updateAnimationControlsSubscription() {
    const { animate: n } = this.node.getProps();
    yc(n) && (this.unmountControls = n.subscribe(this.node));
  }
  /**
   * Subscribe any provided AnimationControls to the component's VisualElement
   */
  mount() {
    this.updateAnimationControlsSubscription();
  }
  update() {
    const { animate: n } = this.node.getProps(), { animate: r } = this.node.prevProps || {};
    n !== r && this.updateAnimationControlsSubscription();
  }
  unmount() {
    this.node.animationState.reset(), this.unmountControls?.();
  }
}
let xE = 0;
class SE extends xi {
  constructor() {
    super(...arguments), this.id = xE++, this.isExitComplete = !1;
  }
  update() {
    if (!this.node.presenceContext)
      return;
    const { isPresent: n, onExitComplete: r } = this.node.presenceContext, { isPresent: o } = this.node.prevPresenceContext || {};
    if (!this.node.animationState || n === o)
      return;
    if (n && o === !1) {
      if (this.isExitComplete) {
        const { initial: u, custom: f } = this.node.getProps();
        if (typeof u == "string" || typeof u == "object" && u !== null && !Array.isArray(u)) {
          const h = nr(this.node, u, f);
          if (h) {
            const { transition: p, transitionEnd: m, ...g } = h;
            for (const v in g)
              this.node.getValue(v)?.jump(g[v]);
          }
        }
        this.node.animationState.reset(), this.node.animationState.animateChanges();
      } else
        this.node.animationState.setActive("exit", !1);
      this.isExitComplete = !1;
      return;
    }
    const l = this.node.animationState.setActive("exit", !n);
    r && !n && l.then(() => {
      this.isExitComplete = !0, r(this.id);
    });
  }
  mount() {
    const { register: n, onExitComplete: r } = this.node.presenceContext || {};
    r && r(this.id), n && (this.unmount = n(this.id));
  }
  unmount() {
  }
}
const kE = {
  animation: {
    Feature: wE
  },
  exit: {
    Feature: SE
  }
};
function bs(a) {
  return {
    point: {
      x: a.pageX,
      y: a.pageY
    }
  };
}
const TE = (a) => (n) => mh(n) && a(n, bs(n));
function os(a, n, r, o) {
  return ds(a, n, TE(r), o);
}
const y1 = ({ current: a }) => a ? a.ownerDocument.defaultView : null, Ty = (a, n) => Math.abs(a - n);
function EE(a, n) {
  const r = Ty(a.x, n.x), o = Ty(a.y, n.y);
  return Math.sqrt(r ** 2 + o ** 2);
}
const Ey = /* @__PURE__ */ new Set(["auto", "scroll"]);
class v1 {
  constructor(n, r, { transformPagePoint: o, contextWindow: l = window, dragSnapToOrigin: u = !1, distanceThreshold: f = 3, element: h } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = /* @__PURE__ */ new Map(), this.removeScrollListeners = null, this.onElementScroll = (E) => {
      this.handleScroll(E.target);
    }, this.onWindowScroll = () => {
      this.handleScroll(window);
    }, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      this.lastRawMoveEventInfo && (this.lastMoveEventInfo = Bl(this.lastRawMoveEventInfo, this.transformPagePoint));
      const E = Fd(this.lastMoveEventInfo, this.history), A = this.startEvent !== null, C = EE(E.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
      if (!A && !C)
        return;
      const { point: M } = E, { timestamp: D } = Pe;
      this.history.push({ ...M, timestamp: D });
      const { onStart: R, onMove: z } = this.handlers;
      A || (R && R(this.lastMoveEvent, E), this.startEvent = this.lastMoveEvent), z && z(this.lastMoveEvent, E);
    }, this.handlePointerMove = (E, A) => {
      this.lastMoveEvent = E, this.lastRawMoveEventInfo = A, this.lastMoveEventInfo = Bl(A, this.transformPagePoint), $t.update(this.updatePoint, !0);
    }, this.handlePointerUp = (E, A) => {
      this.end();
      const { onEnd: C, onSessionEnd: M, resumeAnimation: D } = this.handlers;
      if ((this.dragSnapToOrigin || !this.startEvent) && D && D(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const R = Fd(E.type === "pointercancel" ? this.lastMoveEventInfo : Bl(A, this.transformPagePoint), this.history);
      this.startEvent && C && C(E, R), M && M(E, R);
    }, !mh(n))
      return;
    this.dragSnapToOrigin = u, this.handlers = r, this.transformPagePoint = o, this.distanceThreshold = f, this.contextWindow = l || window;
    const p = bs(n), m = Bl(p, this.transformPagePoint), { point: g } = m, { timestamp: v } = Pe;
    this.history = [{ ...g, timestamp: v }];
    const { onSessionStart: b } = r;
    b && b(n, Fd(m, this.history));
    const k = { passive: !0, capture: !0 };
    this.removeListeners = gs(os(this.contextWindow, "pointermove", this.handlePointerMove, k), os(this.contextWindow, "pointerup", this.handlePointerUp, k), os(this.contextWindow, "pointercancel", this.handlePointerUp, k)), h && this.startScrollTracking(h);
  }
  /**
   * Start tracking scroll on ancestors and window.
   */
  startScrollTracking(n) {
    let r = n.parentElement;
    for (; r; ) {
      const o = getComputedStyle(r);
      (Ey.has(o.overflowX) || Ey.has(o.overflowY)) && this.scrollPositions.set(r, {
        x: r.scrollLeft,
        y: r.scrollTop
      }), r = r.parentElement;
    }
    this.scrollPositions.set(window, {
      x: window.scrollX,
      y: window.scrollY
    }), window.addEventListener("scroll", this.onElementScroll, {
      capture: !0
    }), window.addEventListener("scroll", this.onWindowScroll), this.removeScrollListeners = () => {
      window.removeEventListener("scroll", this.onElementScroll, {
        capture: !0
      }), window.removeEventListener("scroll", this.onWindowScroll);
    };
  }
  /**
   * Handle scroll compensation during drag.
   *
   * For element scroll: adjusts history origin since pageX/pageY doesn't change.
   * For window scroll: adjusts lastMoveEventInfo since pageX/pageY would change.
   */
  handleScroll(n) {
    const r = this.scrollPositions.get(n);
    if (!r)
      return;
    const o = n === window, l = o ? { x: window.scrollX, y: window.scrollY } : {
      x: n.scrollLeft,
      y: n.scrollTop
    }, u = { x: l.x - r.x, y: l.y - r.y };
    u.x === 0 && u.y === 0 || (o ? this.lastMoveEventInfo && (this.lastMoveEventInfo.point.x += u.x, this.lastMoveEventInfo.point.y += u.y) : this.history.length > 0 && (this.history[0].x -= u.x, this.history[0].y -= u.y), this.scrollPositions.set(n, l), $t.update(this.updatePoint, !0));
  }
  updateHandlers(n) {
    this.handlers = n;
  }
  end() {
    this.removeListeners && this.removeListeners(), this.removeScrollListeners && this.removeScrollListeners(), this.scrollPositions.clear(), wi(this.updatePoint);
  }
}
function Bl(a, n) {
  return n ? { point: n(a.point) } : a;
}
function My(a, n) {
  return { x: a.x - n.x, y: a.y - n.y };
}
function Fd({ point: a }, n) {
  return {
    point: a,
    delta: My(a, b1(n)),
    offset: My(a, ME(n)),
    velocity: RE(n, 0.1)
  };
}
function ME(a) {
  return a[0];
}
function b1(a) {
  return a[a.length - 1];
}
function RE(a, n) {
  if (a.length < 2)
    return { x: 0, y: 0 };
  let r = a.length - 1, o = null;
  const l = b1(a);
  for (; r >= 0 && (o = a[r], !(l.timestamp - o.timestamp > /* @__PURE__ */ Rn(n))); )
    r--;
  if (!o)
    return { x: 0, y: 0 };
  o === a[0] && a.length > 2 && l.timestamp - o.timestamp > /* @__PURE__ */ Rn(n) * 2 && (o = a[1]);
  const u = /* @__PURE__ */ qn(l.timestamp - o.timestamp);
  if (u === 0)
    return { x: 0, y: 0 };
  const f = {
    x: (l.x - o.x) / u,
    y: (l.y - o.y) / u
  };
  return f.x === 1 / 0 && (f.x = 0), f.y === 1 / 0 && (f.y = 0), f;
}
function CE(a, { min: n, max: r }, o) {
  return n !== void 0 && a < n ? a = o ? Jt(n, a, o.min) : Math.max(a, n) : r !== void 0 && a > r && (a = o ? Jt(r, a, o.max) : Math.min(a, r)), a;
}
function Ry(a, n, r) {
  return {
    min: n !== void 0 ? a.min + n : void 0,
    max: r !== void 0 ? a.max + r - (a.max - a.min) : void 0
  };
}
function AE(a, { top: n, left: r, bottom: o, right: l }) {
  return {
    x: Ry(a.x, r, l),
    y: Ry(a.y, n, o)
  };
}
function Cy(a, n) {
  let r = n.min - a.min, o = n.max - a.max;
  return n.max - n.min < a.max - a.min && ([r, o] = [o, r]), { min: r, max: o };
}
function jE(a, n) {
  return {
    x: Cy(a.x, n.x),
    y: Cy(a.y, n.y)
  };
}
function LE(a, n) {
  let r = 0.5;
  const o = rn(a), l = rn(n);
  return l > o ? r = /* @__PURE__ */ ls(n.min, n.max - o, a.min) : o > l && (r = /* @__PURE__ */ ls(a.min, a.max - l, n.min)), pa(0, 1, r);
}
function DE(a, n) {
  const r = {};
  return n.min !== void 0 && (r.min = n.min - a.min), n.max !== void 0 && (r.max = n.max - a.min), r;
}
const Cf = 0.35;
function NE(a = Cf) {
  return a === !1 ? a = 0 : a === !0 && (a = Cf), {
    x: Ay(a, "left", "right"),
    y: Ay(a, "top", "bottom")
  };
}
function Ay(a, n, r) {
  return {
    min: jy(a, n),
    max: jy(a, r)
  };
}
function jy(a, n) {
  return typeof a == "number" ? a : a[n] || 0;
}
const OE = /* @__PURE__ */ new WeakMap();
class _E {
  constructor(n) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = Ae(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = n;
  }
  start(n, { snapToCursor: r = !1, distanceThreshold: o } = {}) {
    const { presenceContext: l } = this.visualElement;
    if (l && l.isPresent === !1)
      return;
    const u = (v) => {
      r && this.snapToCursor(bs(v).point), this.stopAnimation();
    }, f = (v, b) => {
      const { drag: k, dragPropagation: E, onDragStart: A } = this.getProps();
      if (k && !E && (this.openDragLock && this.openDragLock(), this.openDragLock = l3(k), !this.openDragLock))
        return;
      this.latestPointerEvent = v, this.latestPanInfo = b, this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), da((M) => {
        let D = this.getAxisMotionValue(M).get() || 0;
        if (ha.test(D)) {
          const { projection: R } = this.visualElement;
          if (R && R.layout) {
            const z = R.layout.layoutBox[M];
            z && (D = rn(z) * (parseFloat(D) / 100));
          }
        }
        this.originPoint[M] = D;
      }), A && $t.update(() => A(v, b), !1, !0), vf(this.visualElement, "transform");
      const { animationState: C } = this.visualElement;
      C && C.setActive("whileDrag", !0);
    }, h = (v, b) => {
      this.latestPointerEvent = v, this.latestPanInfo = b;
      const { dragPropagation: k, dragDirectionLock: E, onDirectionLock: A, onDrag: C } = this.getProps();
      if (!k && !this.openDragLock)
        return;
      const { offset: M } = b;
      if (E && this.currentDirection === null) {
        this.currentDirection = UE(M), this.currentDirection !== null && A && A(this.currentDirection);
        return;
      }
      this.updateAxis("x", b.point, M), this.updateAxis("y", b.point, M), this.visualElement.render(), C && $t.update(() => C(v, b), !1, !0);
    }, p = (v, b) => {
      this.latestPointerEvent = v, this.latestPanInfo = b, this.stop(v, b), this.latestPointerEvent = null, this.latestPanInfo = null;
    }, m = () => {
      const { dragSnapToOrigin: v } = this.getProps();
      (v || this.constraints) && this.startAnimation({ x: 0, y: 0 });
    }, { dragSnapToOrigin: g } = this.getProps();
    this.panSession = new v1(n, {
      onSessionStart: u,
      onStart: f,
      onMove: h,
      onSessionEnd: p,
      resumeAnimation: m
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: g,
      distanceThreshold: o,
      contextWindow: y1(this.visualElement),
      element: this.visualElement.current
    });
  }
  /**
   * @internal
   */
  stop(n, r) {
    const o = n || this.latestPointerEvent, l = r || this.latestPanInfo, u = this.isDragging;
    if (this.cancel(), !u || !l || !o)
      return;
    const { velocity: f } = l;
    this.startAnimation(f);
    const { onDragEnd: h } = this.getProps();
    h && $t.postRender(() => h(o, l));
  }
  /**
   * @internal
   */
  cancel() {
    this.isDragging = !1;
    const { projection: n, animationState: r } = this.visualElement;
    n && (n.isAnimationBlocked = !1), this.endPanSession();
    const { dragPropagation: o } = this.getProps();
    !o && this.openDragLock && (this.openDragLock(), this.openDragLock = null), r && r.setActive("whileDrag", !1);
  }
  /**
   * Clean up the pan session without modifying other drag state.
   * This is used during unmount to ensure event listeners are removed
   * without affecting projection animations or drag locks.
   * @internal
   */
  endPanSession() {
    this.panSession && this.panSession.end(), this.panSession = void 0;
  }
  updateAxis(n, r, o) {
    const { drag: l } = this.getProps();
    if (!o || !Vl(n, l, this.currentDirection))
      return;
    const u = this.getAxisMotionValue(n);
    let f = this.originPoint[n] + o[n];
    this.constraints && this.constraints[n] && (f = CE(f, this.constraints[n], this.elastic[n])), u.set(f);
  }
  resolveConstraints() {
    const { dragConstraints: n, dragElastic: r } = this.getProps(), o = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : this.visualElement.projection?.layout, l = this.constraints;
    n && Hr(n) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : n && o ? this.constraints = AE(o.layoutBox, n) : this.constraints = !1, this.elastic = NE(r), l !== this.constraints && !Hr(n) && o && this.constraints && !this.hasMutatedConstraints && da((u) => {
      this.constraints !== !1 && this.getAxisMotionValue(u) && (this.constraints[u] = DE(o.layoutBox[u], this.constraints[u]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: n, onMeasureDragConstraints: r } = this.getProps();
    if (!n || !Hr(n))
      return !1;
    const o = n.current, { projection: l } = this.visualElement;
    if (!l || !l.layout)
      return !1;
    l.root && (l.root.scroll = void 0, l.root.updateScroll());
    const u = U3(o, l.root, this.visualElement.getTransformPagePoint());
    let f = jE(l.layout.layoutBox, u);
    if (r) {
      const h = r(O3(f));
      this.hasMutatedConstraints = !!h, h && (f = Hb(h));
    }
    return f;
  }
  startAnimation(n) {
    const { drag: r, dragMomentum: o, dragElastic: l, dragTransition: u, dragSnapToOrigin: f, onDragTransitionEnd: h } = this.getProps(), p = this.constraints || {}, m = da((g) => {
      if (!Vl(g, r, this.currentDirection))
        return;
      let v = p && p[g] || {};
      (f === !0 || f === g) && (v = { min: 0, max: 0 });
      const b = l ? 200 : 1e6, k = l ? 40 : 1e7, E = {
        type: "inertia",
        velocity: o ? n[g] : 0,
        bounceStiffness: b,
        bounceDamping: k,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10,
        ...u,
        ...v
      };
      return this.startAxisValueAnimation(g, E);
    });
    return Promise.all(m).then(h);
  }
  startAxisValueAnimation(n, r) {
    const o = this.getAxisMotionValue(n);
    return vf(this.visualElement, n), o.start(dh(n, o, 0, r, this.visualElement, !1));
  }
  stopAnimation() {
    da((n) => this.getAxisMotionValue(n).stop());
  }
  /**
   * Drag works differently depending on which props are provided.
   *
   * - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
   * - Otherwise, we apply the delta to the x/y motion values.
   */
  getAxisMotionValue(n) {
    const r = `_drag${n.toUpperCase()}`, l = this.visualElement.getProps()[r];
    return l || this.visualElement.getValue(n, this.visualElement.latestValues[n] ?? 0);
  }
  snapToCursor(n) {
    da((r) => {
      const { drag: o } = this.getProps();
      if (!Vl(r, o, this.currentDirection))
        return;
      const { projection: l } = this.visualElement, u = this.getAxisMotionValue(r);
      if (l && l.layout) {
        const { min: f, max: h } = l.layout.layoutBox[r], p = u.get() || 0;
        u.set(n[r] - Jt(f, h, 0.5) + p);
      }
    });
  }
  /**
   * When the viewport resizes we want to check if the measured constraints
   * have changed and, if so, reposition the element within those new constraints
   * relative to where it was before the resize.
   */
  scalePositionWithinConstraints() {
    if (!this.visualElement.current)
      return;
    const { drag: n, dragConstraints: r } = this.getProps(), { projection: o } = this.visualElement;
    if (!Hr(r) || !o || !this.constraints)
      return;
    this.stopAnimation();
    const l = { x: 0, y: 0 };
    da((f) => {
      const h = this.getAxisMotionValue(f);
      if (h && this.constraints !== !1) {
        const p = h.get();
        l[f] = LE({ min: p, max: p }, this.constraints[f]);
      }
    });
    const { transformTemplate: u } = this.visualElement.getProps();
    this.visualElement.current.style.transform = u ? u({}, "") : "none", o.root && o.root.updateScroll(), o.updateLayout(), this.constraints = !1, this.resolveConstraints(), da((f) => {
      if (!Vl(f, n, null))
        return;
      const h = this.getAxisMotionValue(f), { min: p, max: m } = this.constraints[f];
      h.set(Jt(p, m, l[f]));
    }), this.visualElement.render();
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    OE.set(this.visualElement, this);
    const n = this.visualElement.current, r = os(n, "pointerdown", (m) => {
      const { drag: g, dragListener: v = !0 } = this.getProps(), b = m.target, k = b !== n && p3(b);
      g && v && !k && this.start(m);
    });
    let o;
    const l = () => {
      const { dragConstraints: m } = this.getProps();
      Hr(m) && m.current && (this.constraints = this.resolveRefConstraints(), o || (o = zE(n, m.current, () => this.scalePositionWithinConstraints())));
    }, { projection: u } = this.visualElement, f = u.addEventListener("measure", l);
    u && !u.layout && (u.root && u.root.updateScroll(), u.updateLayout()), $t.read(l);
    const h = ds(window, "resize", () => this.scalePositionWithinConstraints()), p = u.addEventListener("didUpdate", (({ delta: m, hasLayoutChanged: g }) => {
      this.isDragging && g && (da((v) => {
        const b = this.getAxisMotionValue(v);
        b && (this.originPoint[v] += m[v].translate, b.set(b.get() + m[v].translate));
      }), this.visualElement.render());
    }));
    return () => {
      h(), r(), f(), p && p(), o && o();
    };
  }
  getProps() {
    const n = this.visualElement.getProps(), { drag: r = !1, dragDirectionLock: o = !1, dragPropagation: l = !1, dragConstraints: u = !1, dragElastic: f = Cf, dragMomentum: h = !0 } = n;
    return {
      ...n,
      drag: r,
      dragDirectionLock: o,
      dragPropagation: l,
      dragConstraints: u,
      dragElastic: f,
      dragMomentum: h
    };
  }
}
function Ly(a) {
  let n = !0;
  return () => {
    if (n) {
      n = !1;
      return;
    }
    a();
  };
}
function zE(a, n, r) {
  const o = B0(a, Ly(r)), l = B0(n, Ly(r));
  return () => {
    o(), l();
  };
}
function Vl(a, n, r) {
  return (n === !0 || n === a) && (r === null || r === a);
}
function UE(a, n = 10) {
  let r = null;
  return Math.abs(a.y) > n ? r = "y" : Math.abs(a.x) > n && (r = "x"), r;
}
class BE extends xi {
  constructor(n) {
    super(n), this.removeGroupControls = Fn, this.removeListeners = Fn, this.controls = new _E(n);
  }
  mount() {
    const { dragControls: n } = this.node.getProps();
    n && (this.removeGroupControls = n.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || Fn;
  }
  update() {
    const { dragControls: n } = this.node.getProps(), { dragControls: r } = this.node.prevProps || {};
    n !== r && (this.removeGroupControls(), n && (this.removeGroupControls = n.subscribe(this.controls)));
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners(), this.controls.isDragging || this.controls.endPanSession();
  }
}
const Gd = (a) => (n, r) => {
  a && $t.update(() => a(n, r), !1, !0);
};
class VE extends xi {
  constructor() {
    super(...arguments), this.removePointerDownListener = Fn;
  }
  onPointerDown(n) {
    this.session = new v1(n, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: y1(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: n, onPanStart: r, onPan: o, onPanEnd: l } = this.node.getProps();
    return {
      onSessionStart: Gd(n),
      onStart: Gd(r),
      onMove: Gd(o),
      onEnd: (u, f) => {
        delete this.session, l && $t.postRender(() => l(u, f));
      }
    };
  }
  mount() {
    this.removePointerDownListener = os(this.node.current, "pointerdown", (n) => this.onPointerDown(n));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
let Id = !1;
class HE extends x.Component {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: n, layoutGroup: r, switchLayoutGroup: o, layoutId: l } = this.props, { projection: u } = n;
    u && (r.group && r.group.add(u), o && o.register && l && o.register(u), Id && u.root.didUpdate(), u.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), u.setOptions({
      ...u.options,
      layoutDependency: this.props.layoutDependency,
      onExitComplete: () => this.safeToRemove()
    })), Jl.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(n) {
    const { layoutDependency: r, visualElement: o, drag: l, isPresent: u } = this.props, { projection: f } = o;
    return f && (f.isPresent = u, n.layoutDependency !== r && f.setOptions({
      ...f.options,
      layoutDependency: r
    }), Id = !0, l || n.layoutDependency !== r || r === void 0 || n.isPresent !== u ? f.willUpdate() : this.safeToRemove(), n.isPresent !== u && (u ? f.promote() : f.relegate() || $t.postRender(() => {
      const h = f.getStack();
      (!h || !h.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { visualElement: n, layoutAnchor: r } = this.props, { projection: o } = n;
    o && (o.options.layoutAnchor = r, o.root.didUpdate(), ph.postRender(() => {
      !o.currentAnimation && o.isLead() && this.safeToRemove();
    }));
  }
  componentWillUnmount() {
    const { visualElement: n, layoutGroup: r, switchLayoutGroup: o } = this.props, { projection: l } = n;
    Id = !0, l && (l.scheduleCheckAfterUnmount(), r && r.group && r.group.remove(l), o && o.deregister && o.deregister(l));
  }
  safeToRemove() {
    const { safeToRemove: n } = this.props;
    n && n();
  }
  render() {
    return null;
  }
}
function w1(a) {
  const [n, r] = l1(), o = x.useContext(Wf);
  return S.jsx(HE, { ...a, layoutGroup: o, switchLayoutGroup: x.useContext(m1), isPresent: n, safeToRemove: r });
}
const PE = {
  pan: {
    Feature: VE
  },
  drag: {
    Feature: BE,
    ProjectionNode: s1,
    MeasureLayout: w1
  }
};
function Dy(a, n, r) {
  const { props: o } = a;
  a.animationState && o.whileHover && a.animationState.setActive("whileHover", r === "Start");
  const l = "onHover" + r, u = o[l];
  u && $t.postRender(() => u(n, bs(n)));
}
class YE extends xi {
  mount() {
    const { current: n } = this.node;
    n && (this.unmount = u3(n, (r, o) => (Dy(this.node, o, "Start"), (l) => Dy(this.node, l, "End"))));
  }
  unmount() {
  }
}
class KE extends xi {
  constructor() {
    super(...arguments), this.isActive = !1;
  }
  onFocus() {
    let n = !1;
    try {
      n = this.node.current.matches(":focus-visible");
    } catch {
      n = !0;
    }
    !n || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !0), this.isActive = !0);
  }
  onBlur() {
    !this.isActive || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !1), this.isActive = !1);
  }
  mount() {
    this.unmount = gs(ds(this.node.current, "focus", () => this.onFocus()), ds(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function Ny(a, n, r) {
  const { props: o } = a;
  if (a.current instanceof HTMLButtonElement && a.current.disabled)
    return;
  a.animationState && o.whileTap && a.animationState.setActive("whileTap", r === "Start");
  const l = "onTap" + (r === "End" ? "" : r), u = o[l];
  u && $t.postRender(() => u(n, bs(n)));
}
class qE extends xi {
  mount() {
    const { current: n } = this.node;
    if (!n)
      return;
    const { globalTapTarget: r, propagate: o } = this.node.props;
    this.unmount = g3(n, (l, u) => (Ny(this.node, u, "Start"), (f, { success: h }) => Ny(this.node, f, h ? "End" : "Cancel")), {
      useGlobalTarget: r,
      stopPropagation: o?.tap === !1
    });
  }
  unmount() {
  }
}
const Af = /* @__PURE__ */ new WeakMap(), Xd = /* @__PURE__ */ new WeakMap(), FE = (a) => {
  const n = Af.get(a.target);
  n && n(a);
}, GE = (a) => {
  a.forEach(FE);
};
function IE({ root: a, ...n }) {
  const r = a || document;
  Xd.has(r) || Xd.set(r, {});
  const o = Xd.get(r), l = JSON.stringify(n);
  return o[l] || (o[l] = new IntersectionObserver(GE, { root: a, ...n })), o[l];
}
function XE(a, n, r) {
  const o = IE(n);
  return Af.set(a, r), o.observe(a), () => {
    Af.delete(a), o.unobserve(a);
  };
}
const WE = {
  some: 0,
  all: 1
};
class QE extends xi {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    this.stopObserver?.();
    const { viewport: n = {} } = this.node.getProps(), { root: r, margin: o, amount: l = "some", once: u } = n, f = {
      root: r ? r.current : void 0,
      rootMargin: o,
      threshold: typeof l == "number" ? l : WE[l]
    }, h = (p) => {
      const { isIntersecting: m } = p;
      if (this.isInView === m || (this.isInView = m, u && !m && this.hasEnteredView))
        return;
      m && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", m);
      const { onViewportEnter: g, onViewportLeave: v } = this.node.getProps(), b = m ? g : v;
      b && b(p);
    };
    this.stopObserver = XE(this.node.current, f, h);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: n, prevProps: r } = this.node;
    ["amount", "margin", "root"].some(ZE(n, r)) && this.startObserver();
  }
  unmount() {
    this.stopObserver?.(), this.hasEnteredView = !1, this.isInView = !1;
  }
}
function ZE({ viewport: a = {} }, { viewport: n = {} } = {}) {
  return (r) => a[r] !== n[r];
}
const JE = {
  inView: {
    Feature: QE
  },
  tap: {
    Feature: qE
  },
  focus: {
    Feature: KE
  },
  hover: {
    Feature: YE
  }
}, $E = {
  layout: {
    ProjectionNode: s1,
    MeasureLayout: w1
  }
}, t4 = {
  ...kE,
  ...JE,
  ...PE,
  ...$E
}, nn = /* @__PURE__ */ vE(t4, bE), e4 = [
  {
    value: "direct",
    title: "Direct",
    sub: "Best speed and lowest lag. Works on most home networks."
  },
  {
    value: "fallback",
    title: "Fallback (TURN)",
    sub: "Routes over a relay on port 443. Use on school / work Wi‑Fi that blocks games."
  },
  {
    value: "auto",
    title: "Auto (recommended)",
    sub: "Detect whether this network blocks direct play and pick for you."
  }
];
function n4({
  open: a,
  gameName: n,
  onChoose: r,
  onCancel: o
}) {
  return /* @__PURE__ */ S.jsx(yi, { children: a ? /* @__PURE__ */ S.jsx(
    nn.div,
    {
      role: "presentation",
      className: "fixed inset-0 z-[70] flex cursor-default items-center justify-center p-4",
      style: {
        background: "rgba(0,0,0,0.80)",
        backdropFilter: "blur(18px)"
      },
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      onClick: o,
      children: /* @__PURE__ */ S.jsxs(
        nn.div,
        {
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "Choose how to connect",
          className: "w-full max-w-md cursor-auto overflow-hidden rounded-2xl px-6 pb-6 pt-5",
          style: {
            background: "linear-gradient(160deg, #12141f 0%, #0b0d18 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 32px 80px rgba(0,0,0,0.85), 0 0 60px rgba(59,130,246,0.12)"
          },
          initial: { scale: 0.96, y: 12 },
          animate: { scale: 1, y: 0 },
          exit: { scale: 0.96, y: 12, opacity: 0 },
          onClick: (l) => l.stopPropagation(),
          children: [
            /* @__PURE__ */ S.jsx(
              "div",
              {
                className: "mb-4 flex h-11 w-11 items-center justify-center rounded-xl",
                style: {
                  background: "linear-gradient(135deg, rgba(29,78,216,0.35), rgba(59,130,246,0.12))",
                  border: "1px solid rgba(96,165,250,0.35)",
                  boxShadow: "0 0 24px rgba(59,130,246,0.25)"
                },
                children: /* @__PURE__ */ S.jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", "aria-hidden": !0, children: [
                  /* @__PURE__ */ S.jsx(
                    "path",
                    {
                      d: "M4 12a8 8 0 0 1 16 0M7 12a5 5 0 0 1 10 0M10 12a2 2 0 0 1 4 0",
                      stroke: "#93c5fd",
                      strokeWidth: "1.6",
                      strokeLinecap: "round"
                    }
                  ),
                  /* @__PURE__ */ S.jsx("circle", { cx: "12", cy: "18", r: "1.4", fill: "#93c5fd" })
                ] })
              }
            ),
            /* @__PURE__ */ S.jsxs("h2", { className: "text-[22px] font-bold leading-tight tracking-tight text-white", children: [
              "How should ",
              n || "this game",
              " connect?"
            ] }),
            /* @__PURE__ */ S.jsx(
              "p",
              {
                className: "mt-1.5 text-[13px] leading-relaxed",
                style: { color: "rgba(255,255,255,0.45)" },
                children: "Direct is fastest. If your network blocks games (many schools do), use Fallback. Not sure? Pick Auto and we’ll choose."
              }
            ),
            /* @__PURE__ */ S.jsx(
              "div",
              {
                className: "my-5",
                style: {
                  height: "1px",
                  background: "linear-gradient(to right, rgba(255,255,255,0.07), transparent)"
                }
              }
            ),
            /* @__PURE__ */ S.jsx("div", { className: "flex flex-col gap-2.5", children: e4.map((l) => /* @__PURE__ */ S.jsxs(
              "button",
              {
                type: "button",
                onClick: () => r(l.value),
                className: "w-full rounded-xl px-4 py-3 text-left transition-colors",
                style: {
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)"
                },
                children: [
                  /* @__PURE__ */ S.jsx("div", { className: "text-[15px] font-semibold text-white", children: l.title }),
                  /* @__PURE__ */ S.jsx(
                    "div",
                    {
                      className: "mt-0.5 text-[12.5px] leading-snug",
                      style: { color: "rgba(255,255,255,0.5)" },
                      children: l.sub
                    }
                  )
                ]
              },
              l.value
            )) })
          ]
        }
      )
    },
    "sg-transport-picker"
  ) : null });
}
const a4 = 500, i4 = 2e3, Oy = 20;
function r4(a) {
  const [n, r] = x.useState(null);
  return x.useEffect(() => {
    if (!a) {
      r(null);
      return;
    }
    let o = null, l = !1, u = null, f = 0;
    const h = /* @__PURE__ */ new Map(), p = [], m = [], g = (E) => {
      m.push(E), m.length > Oy && m.shift();
    }, v = () => {
      if (!p.length) return;
      const E = [...p].sort((M, D) => M - D);
      let A = 0;
      for (let M = 1; M < p.length; M++)
        A += Math.abs(p[M] - p[M - 1]);
      const C = m.filter((M) => !M).length;
      r({
        rtt: Math.round(E[Math.floor(E.length / 2)]),
        jitter: p.length > 1 ? Math.round(A / (p.length - 1)) : 0,
        loss: m.length ? Math.round(C / m.length * 100) : 0
      });
    }, b = () => {
      l || (o = new WebSocket(Xf("/live-lesson?ping=1")), o.onmessage = (E) => {
        const A = Number(E.data), C = h.get(A);
        C !== void 0 && (h.delete(A), p.push(performance.now() - C), p.length > Oy && p.shift(), g(!0), v());
      }, o.onclose = () => {
        o = null, l || (u = setTimeout(b, 2e3));
      });
    };
    b();
    const k = setInterval(() => {
      const E = performance.now();
      for (const [A, C] of h)
        E - C > i4 && (h.delete(A), g(!1));
      o?.readyState === WebSocket.OPEN && (f += 1, h.set(f, E), o.send(String(f))), v();
    }, a4);
    return () => {
      l = !0, clearInterval(k), u && clearTimeout(u), o?.close();
    };
  }, [a]), n;
}
const o4 = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]), Xi = new Uint32Array(64), Qe = new Uint32Array(8);
function s4(a, n) {
  const o = (n + 8 >> 6) + 1 << 6;
  a[n] = 128, a.fill(0, n + 1, o);
  const l = n * 8;
  a[o - 4] = l >>> 24, a[o - 3] = l >>> 16 & 255, a[o - 2] = l >>> 8 & 255, a[o - 1] = l & 255;
  let u = 1779033703, f = 3144134277, h = 1013904242, p = 2773480762, m = 1359893119, g = 2600822924, v = 528734635, b = 1541459225;
  for (let k = 0; k < o; k += 64) {
    for (let W = 0; W < 16; W++) {
      const X = k + (W << 2);
      Xi[W] = a[X] << 24 | a[X + 1] << 16 | a[X + 2] << 8 | a[X + 3];
    }
    for (let W = 16; W < 64; W++) {
      const X = Xi[W - 15], F = Xi[W - 2], at = (X >>> 7 | X << 25) ^ (X >>> 18 | X << 14) ^ X >>> 3, rt = (F >>> 17 | F << 15) ^ (F >>> 19 | F << 13) ^ F >>> 10;
      Xi[W] = Xi[W - 16] + at + Xi[W - 7] + rt | 0;
    }
    let E = u, A = f, C = h, M = p, D = m, R = g, z = v, Z = b;
    for (let W = 0; W < 64; W++) {
      const X = (D >>> 6 | D << 26) ^ (D >>> 11 | D << 21) ^ (D >>> 25 | D << 7), F = D & R ^ ~D & z, at = Z + X + F + o4[W] + Xi[W] | 0, rt = (E >>> 2 | E << 30) ^ (E >>> 13 | E << 19) ^ (E >>> 22 | E << 10), pt = E & A ^ E & C ^ A & C, yt = rt + pt | 0;
      Z = z, z = R, R = D, D = M + at | 0, M = C, C = A, A = E, E = at + yt | 0;
    }
    u = u + E | 0, f = f + A | 0, h = h + C | 0, p = p + M | 0, m = m + D | 0, g = g + R | 0, v = v + z | 0, b = b + Z | 0;
  }
  Qe[0] = u, Qe[1] = f, Qe[2] = h, Qe[3] = p, Qe[4] = m, Qe[5] = g, Qe[6] = v, Qe[7] = b;
}
function l4(a, n, r, o) {
  if (!/^[0-9a-f]{64}$/.test(a) || !/^[\x20-\x7e]*$/.test(n))
    return null;
  const l = new Int32Array(8);
  for (let h = 0; h < 8; h++)
    l[h] = parseInt(a.slice(h * 8, h * 8 + 8), 16) | 0;
  const u = n.length, f = new Uint8Array((u + 16 + 8 >> 6) * 64 + 64);
  for (let h = 0; h < u; h++) f[h] = n.charCodeAt(h);
  for (let h = Math.max(0, r); h <= o; h++) {
    const p = String(h);
    for (let m = 0; m < p.length; m++)
      f[u + m] = p.charCodeAt(m);
    if (s4(f, u + p.length), (Qe[0] | 0) === l[0] && (Qe[1] | 0) === l[1] && (Qe[2] | 0) === l[2] && (Qe[3] | 0) === l[3] && (Qe[4] | 0) === l[4] && (Qe[5] | 0) === l[5] && (Qe[6] | 0) === l[6] && (Qe[7] | 0) === l[7])
      return h;
  }
  return null;
}
const c4 = 240 * 1e3;
let Zi = null;
function u4() {
  const a = typeof navigator < "u" && navigator.hardwareConcurrency || 4;
  return Math.max(1, Math.min(8, a - 1));
}
function d4(a) {
  const n = u4(), r = Math.ceil((a.maxnumber + 1) / n), o = [];
  return new Promise((l, u) => {
    let f = n;
    const h = (p) => {
      for (const m of o) m.terminate();
      l(p);
    };
    try {
      for (let p = 0; p < n; p++) {
        const m = new Worker(
          new URL(
            /* @vite-ignore */
            "/assets/solver.worker-B8FcolQf.js",
            import.meta.url
          ),
          {
            type: "module"
          }
        );
        o.push(m), m.onmessage = (v) => {
          typeof v.data?.number == "number" ? h(v.data.number) : --f === 0 && h(null);
        }, m.onerror = (v) => {
          v.preventDefault();
          for (const b of o) b.terminate();
          u(new Error("quiz worker failed"));
        };
        const g = p * r;
        m.postMessage({
          challenge: a.challenge,
          salt: a.salt,
          start: g,
          end: Math.min(a.maxnumber, g + r - 1)
        });
      }
    } catch (p) {
      for (const m of o) m.terminate();
      u(p);
    }
  });
}
async function f4(a) {
  for (let r = 0; r <= a.maxnumber; r += 5e4) {
    const o = l4(
      a.challenge,
      a.salt,
      r,
      Math.min(a.maxnumber, r + 5e4 - 1)
    );
    if (o !== null) return o;
    await new Promise((l) => setTimeout(l, 0));
  }
  return null;
}
async function h4() {
  const a = await fetch(oe("/api/cg/quiz"), {
    cache: "no-store",
    credentials: "include"
  }), n = await a.json().catch(() => null);
  if (!a.ok || !n?.ok) throw new Error("quiz unavailable");
  const r = n.quiz;
  if (!r) return null;
  const o = await d4(r).catch(() => f4(r));
  if (o === null) throw new Error("quiz unsolved");
  return btoa(
    JSON.stringify({
      algorithm: r.algorithm,
      challenge: r.challenge,
      number: o,
      salt: r.salt,
      signature: r.signature
    })
  );
}
function x1() {
  if (Zi && Date.now() - Zi.at < c4) return;
  const a = h4(), n = { at: Date.now(), promise: a };
  Zi = n, a.catch(() => {
    Zi === n && (Zi = null);
  });
}
async function _y() {
  x1();
  const a = Zi;
  return Zi = null, a.promise;
}
async function p4() {
  const a = await fetch(oe("/api/cg/embed/games"), { credentials: "include" });
  if (!(a.headers.get("content-type") || "").includes("application/json"))
    throw new Error(
      "Game catalog unavailable — the server may need a restart to pick up /api/cg/embed/games."
    );
  const r = await a.json();
  if (!a.ok || !r.ok) throw new Error("Couldn't load games.");
  return r.games ?? [];
}
async function S1() {
  try {
    const a = await fetch(oe("/api/cg/ng/server-pools"), {
      credentials: "include"
    });
    if (!a.ok) return { pools: [], method: "both", fallbackDown: !1 };
    const n = await a.json();
    return {
      pools: Array.isArray(n?.pools) ? n.pools : [],
      method: n?.method ?? "both",
      fallbackDown: n?.fallbackDown === !0
    };
  } catch {
    return { pools: [], method: "both", fallbackDown: !1 };
  }
}
async function jf(a, n) {
  const r = {
    // `gameId` doubles as the embed id when opts.byEmbedId is set — the
    // server resolves it and never needs the real id to leave the box.
    ...n?.byEmbedId ? { embedId: a } : { gameId: a },
    ...n?.sgUserToken ? { sg_user_token: n.sgUserToken } : {},
    ...n?.webrtc ? { webrtc: n.webrtc } : {},
    ...n?.ngRelay ? { ngRelay: n.ngRelay } : {},
    ...n?.warpRegion ? { warpRegion: n.warpRegion } : {},
    // Astra SDK embed: the short-lived streamToken the customer's backend
    // minted. Present it so the launch skips the public proof-of-work and is
    // metered against the api key. See server/lib/apiSessionToken.ts.
    ...n?.streamToken ? { streamToken: n.streamToken } : {},
    // The browser's own IANA timezone (e.g. "America/Los_Angeles"). The
    // quaternary launcher maps it to a US region so its last-resort exit draw
    // lands in the visitor's own region instead of anywhere in the country —
    // no server-side geoip and no Cloudflare setting needed. Best-effort.
    ...(() => {
      try {
        const f = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return f ? { tz: f } : {};
      } catch {
        return {};
      }
    })()
  }, o = async (f) => {
    const h = await fetch(oe("/api/cg/launch"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...r, ...f ? { quiz: f } : {} })
    }), p = await h.json().catch(() => null);
    return { res: h, data: p };
  };
  let { res: l, data: u } = await o(await _y().catch(() => null));
  if (l.status === 403 && u?.code === "QUIZ_FAILED" && ({ res: l, data: u } = await o(await _y().catch(() => null))), !l.ok || !u?.ok) throw new Error(u?.error || "Launch failed");
  return u;
}
async function Lf(a) {
  const n = await fetch(
    oe(`/api/cg/status?sessionId=${encodeURIComponent(a)}`),
    {
      cache: "no-store",
      credentials: "include"
    }
  ), o = (n.headers.get("content-type") || "").includes("application/json") ? await n.json().catch(() => null) : null;
  if (!o)
    return {
      ok: !0,
      sessionId: a,
      status: "pending",
      ready: !1
    };
  if (!n.ok || !o.ok) throw new Error(o?.error || "Status failed");
  return o;
}
async function Gr(a) {
  await fetch(oe("/api/cg/stop"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ sessionId: a })
  });
}
function m4(a) {
  const n = {
    useast: "US East",
    uswest: "US West",
    uscentral: "US Central",
    eu: "Europe",
    euwest: "EU West",
    eucentral: "EU Central",
    asia: "Asia",
    ap: "Asia Pacific"
  }, r = a.toLowerCase().replace(/[\s_-]/g, "");
  return n[r] ? n[r] : a.replace(/[_-]+/g, " ").replace(/\b\w/g, (o) => o.toUpperCase());
}
function zy(a) {
  const n = a.toLowerCase().replace(/[\s_-]/g, "");
  return {
    uswest: "West Coast · CA, OR, WA, NV",
    uscentral: "Central · TX, IL, CO, MN",
    useast: "East Coast · NY, VA, FL, GA",
    eu: "Europe",
    euwest: "UK, France, Spain",
    eucentral: "Germany, Netherlands, Poland",
    asia: "Asia",
    ap: "Asia Pacific"
  }[n] ?? "";
}
function k1({
  open: a,
  gameName: n,
  pools: r,
  storageKey: o,
  onChoose: l,
  onCancel: u,
  description: f,
  label: h = "Fallback server region",
  fallbackDown: p = !1
}) {
  const [m, g] = x.useState(null), [v, b] = x.useState(!1), k = (C) => p ? b(!0) : l(C), [E, A] = x.useState(null);
  return x.useEffect(() => {
    if (!a) return;
    b(!1);
    let C = null;
    try {
      C = localStorage.getItem(o);
    } catch {
    }
    const M = C && r.some((D) => D.name === C) ? C : r[0]?.name ?? null;
    g(M), A(
      C && r.some((D) => D.name === C) ? C : null
    );
  }, [a, r, o]), /* @__PURE__ */ S.jsx(yi, { children: a ? /* @__PURE__ */ S.jsx(
    nn.div,
    {
      role: "presentation",
      className: "fixed inset-0 z-[70] flex cursor-default items-center justify-center p-4",
      style: {
        background: "rgba(0,0,0,0.80)",
        backdropFilter: "blur(18px)"
      },
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      onClick: u,
      children: /* @__PURE__ */ S.jsxs(
        nn.div,
        {
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "Choose the closest server",
          className: "w-full max-w-md cursor-auto overflow-hidden rounded-2xl px-6 pb-6 pt-5",
          style: {
            background: "linear-gradient(160deg, #12141f 0%, #0b0d18 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 32px 80px rgba(0,0,0,0.85), 0 0 60px rgba(59,130,246,0.12)"
          },
          initial: { scale: 0.96, y: 12 },
          animate: { scale: 1, y: 0 },
          exit: { scale: 0.96, y: 12, opacity: 0 },
          onClick: (C) => C.stopPropagation(),
          children: [
            /* @__PURE__ */ S.jsx(
              "div",
              {
                className: "mb-4 flex h-11 w-11 items-center justify-center rounded-xl",
                style: {
                  background: "linear-gradient(135deg, rgba(29,78,216,0.35), rgba(59,130,246,0.12))",
                  border: "1px solid rgba(96,165,250,0.35)",
                  boxShadow: "0 0 24px rgba(59,130,246,0.25)"
                },
                children: /* @__PURE__ */ S.jsxs(
                  "svg",
                  {
                    width: "20",
                    height: "20",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    "aria-hidden": !0,
                    children: [
                      /* @__PURE__ */ S.jsx(
                        "circle",
                        {
                          cx: "12",
                          cy: "12",
                          r: "9",
                          stroke: "#93c5fd",
                          strokeWidth: "1.6"
                        }
                      ),
                      /* @__PURE__ */ S.jsx(
                        "path",
                        {
                          d: "M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z",
                          stroke: "#93c5fd",
                          strokeWidth: "1.6",
                          strokeLinejoin: "round"
                        }
                      )
                    ]
                  }
                )
              }
            ),
            v ? /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
              /* @__PURE__ */ S.jsx("h2", { className: "text-[22px] font-bold leading-tight tracking-tight text-white", children: "Fallback Option is currently down" }),
              /* @__PURE__ */ S.jsx(
                "p",
                {
                  className: "mt-1.5 text-[13px] leading-relaxed",
                  style: { color: "rgba(255,255,255,0.45)" },
                  children: "Check back later."
                }
              ),
              /* @__PURE__ */ S.jsx(
                "button",
                {
                  type: "button",
                  onClick: u,
                  className: "mt-5 w-full rounded-xl py-2.5 text-sm font-semibold text-white",
                  style: {
                    background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 52%, #60a5fa 100%)"
                  },
                  children: "OK"
                }
              )
            ] }) : /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
              /* @__PURE__ */ S.jsx("h2", { className: "text-[22px] font-bold leading-tight tracking-tight text-white", children: "Which server is closest to you?" }),
              /* @__PURE__ */ S.jsx(
                "p",
                {
                  className: "mt-1.5 text-[13px] leading-relaxed",
                  style: { color: "rgba(255,255,255,0.45)" },
                  children: f ?? (n ? `The usual server couldn't connect, so ${n} will start on a fallback server. Pick the region nearest you for the best connection.` : "The usual server couldn't connect, so this will start on a fallback server. Pick the region nearest you for the best connection.")
                }
              ),
              /* @__PURE__ */ S.jsx(
                "div",
                {
                  className: "my-5",
                  style: {
                    height: "1px",
                    background: "linear-gradient(to right, rgba(255,255,255,0.07), transparent)"
                  }
                }
              ),
              /* @__PURE__ */ S.jsx(
                "div",
                {
                  className: "mb-2 text-[11px] font-semibold uppercase tracking-wider",
                  style: { color: "rgba(255,255,255,0.38)" },
                  children: h
                }
              ),
              /* @__PURE__ */ S.jsx("div", { role: "radiogroup", "aria-label": h, className: "grid gap-2", children: r.map((C) => {
                const M = C.name === m;
                return /* @__PURE__ */ S.jsxs(
                  "button",
                  {
                    type: "button",
                    role: "radio",
                    "aria-checked": M,
                    onClick: () => g(C.name),
                    onDoubleClick: () => k(C.name),
                    className: "flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-[13.5px] font-semibold text-white transition-colors hover:brightness-125",
                    style: {
                      background: M ? "linear-gradient(135deg, rgba(29,78,216,0.28), rgba(59,130,246,0.12))" : "rgba(255,255,255,0.035)",
                      border: `1px solid ${M ? "rgba(96,165,250,0.55)" : "rgba(255,255,255,0.08)"}`,
                      boxShadow: M ? "0 0 0 3px rgba(59,130,246,0.12)" : "none"
                    },
                    children: [
                      /* @__PURE__ */ S.jsxs("span", { className: "flex min-w-0 items-center gap-3", children: [
                        /* @__PURE__ */ S.jsx(
                          "span",
                          {
                            "aria-hidden": !0,
                            className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            style: {
                              background: M ? "rgba(59,130,246,0.22)" : "rgba(255,255,255,0.05)"
                            },
                            children: /* @__PURE__ */ S.jsxs(
                              "svg",
                              {
                                width: "16",
                                height: "16",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                children: [
                                  /* @__PURE__ */ S.jsx(
                                    "path",
                                    {
                                      d: "M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z",
                                      stroke: M ? "#93c5fd" : "rgba(255,255,255,0.55)",
                                      strokeWidth: "1.7",
                                      strokeLinejoin: "round"
                                    }
                                  ),
                                  /* @__PURE__ */ S.jsx(
                                    "circle",
                                    {
                                      cx: "12",
                                      cy: "9.5",
                                      r: "2.4",
                                      stroke: M ? "#93c5fd" : "rgba(255,255,255,0.55)",
                                      strokeWidth: "1.7"
                                    }
                                  )
                                ]
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ S.jsxs("span", { className: "min-w-0", children: [
                          /* @__PURE__ */ S.jsxs("span", { className: "flex items-center gap-2", children: [
                            m4(C.name),
                            C.name === E ? /* @__PURE__ */ S.jsx(
                              "span",
                              {
                                className: "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                style: {
                                  color: "rgba(147,197,253,0.95)",
                                  background: "rgba(59,130,246,0.15)"
                                },
                                children: "Last used"
                              }
                            ) : null
                          ] }),
                          zy(C.name) ? /* @__PURE__ */ S.jsx(
                            "span",
                            {
                              className: "mt-0.5 block truncate text-[11.5px] font-medium",
                              style: { color: "rgba(255,255,255,0.42)" },
                              children: zy(C.name)
                            }
                          ) : null
                        ] })
                      ] }),
                      /* @__PURE__ */ S.jsx(
                        "span",
                        {
                          "aria-hidden": !0,
                          className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          style: {
                            border: `1.5px solid ${M ? "#60a5fa" : "rgba(255,255,255,0.2)"}`,
                            background: M ? "#3b82f6" : "transparent"
                          },
                          children: M ? /* @__PURE__ */ S.jsx(
                            "svg",
                            {
                              width: "10",
                              height: "10",
                              viewBox: "0 0 12 12",
                              fill: "none",
                              children: /* @__PURE__ */ S.jsx(
                                "path",
                                {
                                  d: "M2.5 6.2l2.3 2.3L9.5 3.8",
                                  stroke: "#fff",
                                  strokeWidth: "1.8",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round"
                                }
                              )
                            }
                          ) : null
                        }
                      )
                    ]
                  },
                  C.name
                );
              }) }),
              /* @__PURE__ */ S.jsxs("div", { className: "mt-5 grid grid-cols-[auto_1fr] gap-2", children: [
                /* @__PURE__ */ S.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: u,
                    className: "rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/5",
                    style: {
                      color: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    },
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ S.jsx(
                  "button",
                  {
                    type: "button",
                    disabled: !m,
                    onClick: () => m && k(m),
                    className: "relative flex items-center justify-center overflow-hidden rounded-xl py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60",
                    style: {
                      background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 52%, #60a5fa 100%)",
                      boxShadow: "0 8px 32px rgba(2,132,199,0.45), inset 0 1px 0 rgba(255,255,255,0.18)"
                    },
                    children: "Start"
                  }
                )
              ] })
            ] })
          ]
        }
      )
    },
    "ng-server-picker"
  ) : null });
}
function g4(a) {
  const { video: n } = a;
  let r = a.relay;
  const o = a.cursorRootEl ?? null;
  let l = a.iceServers, u = a.iceTransportPolicy ?? "all", f = !1, h = null, p = null, m = !1, g = !1;
  const v = [];
  let b = null;
  const k = (nt) => {
    if (!g) {
      g = !0;
      try {
        r.sendSig({
          type: "client_end",
          reason: nt,
          detail: v.slice(-6).join(" ")
        });
      } catch {
      }
    }
  };
  let E, A;
  const C = new Promise((nt, it) => {
    E = nt, A = it, setTimeout(
      () => it(new Error("Stream connection timed out (240s)")),
      24e4
    );
  });
  let M = !1, D = !1, R = 0, z = 0, Z = 0, W = 0, X = 0;
  const F = /* @__PURE__ */ new Set();
  let at = null;
  function rt() {
    const nt = n.getBoundingClientRect(), it = n.videoWidth || nt.width, Lt = n.videoHeight || nt.height, Rt = Math.min(nt.width / it, nt.height / Lt), ie = it * Rt, se = Lt * Rt;
    return {
      left: nt.left + (nt.width - ie) / 2,
      top: nt.top + (nt.height - se) / 2,
      width: ie,
      height: se
    };
  }
  function pt(nt) {
    p && p.readyState === "open" && p.send(nt);
  }
  function yt(nt, it) {
    it ? F.add(nt) : F.delete(nt);
    const Lt = new ArrayBuffer(24), Rt = new DataView(Lt);
    Rt.setUint8(0, 1), Rt.setUint8(2, 1), Rt.setUint8(3, 1), Rt.setUint16(4, nt), Rt.setUint8(6, it ? 1 : 0);
    let ie = 7;
    for (const se of F)
      se !== nt && se > 0 && se < 255 && ie < 21 && (Rt.setUint16(ie, se), ie += 2, Rt.setUint8(ie, 1), ie++);
    Rt.setUint8(ie++, 255), Rt.setUint8(1, ie - 1), pt(Lt.slice(0, ie));
  }
  function vt(nt = 0, it = 0, Lt = 0) {
    nt = Math.max(-127, Math.min(127, nt)), it = Math.max(-127, Math.min(127, it));
    const Rt = rt(), ie = Math.floor((Z - Rt.left) / Rt.width * 1e4), se = Math.floor((W - Rt.top) / Rt.height * 1e4), Bt = new ArrayBuffer(12), le = new DataView(Bt);
    le.setUint8(0, 1), le.setUint8(1, 11), le.setUint8(2, 2), le.setUint8(3, 8), le.setUint16(4, Math.max(0, Math.min(1e4, ie))), le.setUint16(6, Math.max(0, Math.min(1e4, se))), le.setInt8(8, nt), le.setInt8(9, it), le.setUint8(10, X), le.setInt8(11, Lt), pt(Bt);
  }
  const Tt = [
    4096,
    8192,
    16384,
    32768,
    256,
    512,
    0,
    0,
    32,
    16,
    64,
    128,
    1,
    2,
    4,
    8,
    0
  ];
  function bt() {
    const nt = navigator.getGamepads?.() || [];
    for (let it = 0; it < nt.length; it++) {
      const Lt = nt[it];
      if (!Lt) continue;
      let Rt = 0, ie = 0, se = 0;
      for (let ln = 0; ln < Math.min(Lt.buttons.length, 17); ln++) {
        const ia = Lt.buttons[ln];
        ia.pressed && (ln === 6 ? ie = Math.round(ia.value * 255) : ln === 7 ? se = Math.round(ia.value * 255) : Rt |= Tt[ln]);
      }
      const Bt = Lt.axes, le = Bt[0] ? Math.round(32767 * Bt[0]) : 0, Ee = Bt[1] ? Math.round(-32767 * Bt[1]) : 0, Ut = Bt[2] ? Math.round(32767 * Bt[2]) : 0, je = Bt[3] ? Math.round(-32767 * Bt[3]) : 0, Wn = new ArrayBuffer(17), Ne = new DataView(Wn);
      Ne.setUint8(0, 1), Ne.setUint8(1, 16), Ne.setUint8(2, 3), Ne.setUint8(3, 2), Ne.setUint8(4, it), Ne.setUint16(5, Rt), Ne.setUint8(7, ie), Ne.setUint8(8, se), Ne.setInt16(9, le), Ne.setInt16(11, Ee), Ne.setInt16(13, Ut), Ne.setInt16(15, je), pt(Wn);
    }
  }
  let Y = 0;
  function J() {
    p && p.readyState === "open" && bt(), Y = requestAnimationFrame(J);
  }
  let et = null;
  const $ = {
    0: "image/x-icon",
    1: "image/jpeg",
    2: "image/png",
    3: "image/gif"
  };
  let O = 0, T = 0, _ = !0, B = null;
  function Q() {
    return B || (B = document.createElement("img"), B.alt = "", B.draggable = !1, B.style.cssText = "position:fixed;left:0;top:0;pointer-events:none;z-index:2147483647;display:none;user-select:none;", (o ?? document.body).appendChild(B)), B;
  }
  function st() {
    !B || B.style.display === "none" || (B.style.transform = `translate(${Math.round(Z - O)}px, ${Math.round(W - T)}px)`);
  }
  function ot() {
    if (_ || !et) return;
    const nt = Q();
    nt.src = et, nt.style.display = "block", st();
  }
  function ht() {
    B && (B.style.display = "none");
  }
  function Ht(nt) {
    const it = new DataView(nt);
    if (it.byteLength > 4 && it.getUint8(0) === 163 && it.getUint8(1) === 6)
      if (it.byteLength <= 32)
        n.style.cursor = "none", _ = !0, ht(), et && (URL.revokeObjectURL(et), et = null);
      else {
        const Lt = $[it.getUint8(2)] || "image/png";
        O = it.getUint8(3), T = it.getUint8(4);
        const Rt = new Blob([nt.slice(5)], { type: Lt });
        et && URL.revokeObjectURL(et), et = URL.createObjectURL(Rt), _ = !1, n.style.cursor = "none", D && ot();
      }
  }
  const xt = () => {
    if (D = document.pointerLockElement === n, D) {
      const nt = rt();
      R = Z - nt.left, z = W - nt.top, ot();
    } else
      ht(), navigator.keyboard?.unlock?.();
  }, Ze = () => {
    p && (M = !0, navigator.keyboard?.lock?.().catch(() => {
    }), D || n.requestPointerLock?.());
  }, Ke = (nt) => {
    M && !n.contains(nt.target) && (M = !1, navigator.keyboard?.unlock?.());
  }, Je = (nt) => {
    if (M && p) {
      const it = nt.movementX || 0, Lt = nt.movementY || 0;
      if (D) {
        const Rt = rt();
        R = Math.max(0, Math.min(Rt.width, R + it)), z = Math.max(0, Math.min(Rt.height, z + Lt)), Z = Rt.left + R, W = Rt.top + z, st();
      } else
        Z = nt.clientX, W = nt.clientY;
      vt(it, Lt, 0);
    } else
      Z = nt.clientX, W = nt.clientY;
  }, on = (nt) => {
    !M || !p || (D || n.requestPointerLock?.(), X = nt.buttons, vt(0, 0, 0));
  }, qe = (nt) => {
    !M || !p || (X = nt.buttons, vt(0, 0, 0));
  }, Fe = (nt) => {
    M && nt.preventDefault();
  }, Ot = (nt) => {
    M && (nt.preventDefault(), vt(0, 0, nt.deltaY > 0 ? -1 : 1));
  }, Te = (nt) => {
    !M || !p || (nt.preventDefault(), nt.stopPropagation(), !nt.repeat && (nt.keyCode === 27 && !at && (at = setTimeout(() => {
      document.pointerLockElement && document.exitPointerLock(), M = !1, at = null;
    }, 1200)), yt(nt.keyCode, !0)));
  }, Cn = (nt) => {
    !M || !p || (nt.preventDefault(), nt.stopPropagation(), nt.keyCode === 27 && at && (clearTimeout(at), at = null), yt(nt.keyCode, !1));
  };
  function $e() {
    document.addEventListener("pointerlockchange", xt), n.addEventListener("click", Ze), document.addEventListener("click", Ke), document.addEventListener("mousemove", Je), document.addEventListener("mousedown", on), document.addEventListener("mouseup", qe), document.addEventListener("contextmenu", Fe), n.addEventListener("wheel", Ot, { passive: !1 }), document.addEventListener("keydown", Te, { capture: !0 }), document.addEventListener("keyup", Cn, { capture: !0 }), Y = requestAnimationFrame(J);
  }
  function An() {
    document.removeEventListener("pointerlockchange", xt), n.removeEventListener("click", Ze), document.removeEventListener("click", Ke), document.removeEventListener("mousemove", Je), document.removeEventListener("mousedown", on), document.removeEventListener("mouseup", qe), document.removeEventListener("contextmenu", Fe), n.removeEventListener("wheel", Ot), document.removeEventListener("keydown", Te, { capture: !0 }), document.removeEventListener("keyup", Cn, { capture: !0 }), Y && cancelAnimationFrame(Y), Y = 0, B && (B.remove(), B = null), et && (URL.revokeObjectURL(et), et = null);
  }
  async function sn(nt = 0) {
    if (!(f || !h || m))
      try {
        const it = await h.getStats();
        let Lt = null;
        it.forEach((se) => {
          const Bt = se;
          Bt.type !== "candidate-pair" || Bt.state !== "succeeded" || (Bt.nominated || Bt.selected || !Lt) && (Lt = Bt);
        });
        const Rt = Lt;
        if (!Rt) {
          nt < 8 && setTimeout(() => {
            sn(nt + 1);
          }, 500);
          return;
        }
        f = !0;
        const ie = (se) => {
          const Bt = se ? it.get(se) : void 0;
          if (!Bt) return "?";
          const le = Bt.relayProtocol ? `(${Bt.relayProtocol})` : "";
          return `${Bt.candidateType ?? "?"}/${Bt.protocol ?? "?"}${le} ${Bt.address ?? Bt.ip ?? "?"}:${Bt.port ?? "?"}`;
        };
        r.sendSig({
          type: "client_stats",
          local: ie(Rt.localCandidateId),
          remote: ie(Rt.remoteCandidateId),
          rttMs: typeof Rt.currentRoundTripTime == "number" ? Math.round(Rt.currentRoundTripTime * 1e3) : null
        });
      } catch {
      }
  }
  let Ge = !1;
  function Xn() {
    if (Ge) return;
    Ge = !0;
    const nt = () => {
      if (m || n.videoWidth === 0)
        return void setTimeout(nt, 250);
      b ?? (b = Date.now()), a.onLive?.(), E();
    };
    n.muted = !0, n.play().catch(() => {
    }), typeof n.requestVideoFrameCallback == "function" ? n.requestVideoFrameCallback(() => nt()) : n.addEventListener("loadeddata", nt, { once: !0 });
  }
  function De() {
    if (h) return;
    h = new RTCPeerConnection({
      iceServers: l,
      iceTransportPolicy: u,
      // One transport for audio+video+data instead of up to three: a third
      // fewer candidates to gather and pair, so the relay connects faster.
      // The winning path (Raccoon's own relay) is unchanged.
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
      // No speculative pre-gathering — it only opened relay allocations that
      // often went unused.
      iceCandidatePoolSize: 0
    }), h.addTransceiver("audio", { direction: "recvonly" }), h.addTransceiver("video", { direction: "recvonly" });
    const nt = h.createDataChannel("JYSDK", {
      id: 1,
      ordered: !1,
      maxRetransmits: 0
    });
    nt.binaryType = "arraybuffer", nt.onopen = () => {
      p = nt;
    }, nt.onmessage = (it) => {
      it.data instanceof ArrayBuffer && Ht(it.data);
    }, h.ondatachannel = (it) => {
      it.channel.label === "JYSDK" && (p = it.channel, p.binaryType = "arraybuffer", p.onmessage = (Lt) => {
        Lt.data instanceof ArrayBuffer && Ht(Lt.data);
      });
    }, h.ontrack = (it) => {
      n.srcObject || (n.srcObject = new MediaStream()), n.srcObject.addTrack(it.track), it.track.kind === "video" && Xn();
    }, h.onicecandidate = (it) => {
      it.candidate && r.sendSig({
        type: "rtc_candidate",
        candidate: it.candidate.toJSON()
      });
    }, h.oniceconnectionstatechange = () => {
      const it = h?.iceConnectionState;
      if (it) {
        const Lt = b == null ? "pre" : `${Math.round((Date.now() - b) / 1e3)}s`;
        v.push(`${it}@${Lt}`);
      }
      (it === "connected" || it === "completed") && b == null && (b = Date.now()), (it === "connected" || it === "completed") && (sn(), n.play().catch(() => {
      }), a.onLive?.(), E()), it === "failed" && (k("ice_failed"), a.onEnded?.("ice_failed"));
    }, h.createOffer().then((it) => h.setLocalDescription(it).then(() => it)).then((it) => r.sendSig({ type: "rtc_offer", sdp: it.sdp })).catch((it) => A(it instanceof Error ? it : new Error(String(it))));
  }
  const ya = (nt) => {
    const it = nt;
    if (!(!it || typeof it != "object"))
      switch (it.type) {
        case "config":
          Array.isArray(it.iceServers) && it.iceServers.length && (l = it.iceServers), it.iceTransportPolicy && (u = it.iceTransportPolicy);
          break;
        case "game_ready":
          De();
          break;
        case "rtc_answer":
          h?.setRemoteDescription(
            new RTCSessionDescription({ type: "answer", sdp: it.sdp.sdp })
          ).catch(() => {
          });
          break;
        case "rtc_candidate": {
          if (!h || !it.candidate) break;
          const Lt = typeof it.candidate == "string" ? { candidate: it.candidate } : it.candidate;
          h.addIceCandidate(new RTCIceCandidate(Lt)).catch(() => {
          });
          break;
        }
        case "time":
          Number.isFinite(it.msLeft) && a.onTime?.(it.msLeft);
          break;
        case "ended":
          a.onEnded?.(it.reason || "ended"), A(new Error(`Session ended (${it.reason || "ended"})`));
          break;
      }
  };
  return r.setSigHandler(ya), $e(), {
    ready: C,
    getPeer() {
      return h;
    },
    rebindRelay(nt) {
      m || (r = nt, nt.setSigHandler(ya));
    },
    dispose() {
      if (!m) {
        k("stream_closed"), m = !0, An(), r.setSigHandler(() => {
        });
        try {
          p?.close();
        } catch {
        }
        try {
          h?.close();
        } catch {
        }
        et && URL.revokeObjectURL(et), p = null, h = null;
      }
    }
  };
}
async function Wd(a, n) {
  const r = { sessionId: n };
  a && (r.url = a);
  const o = await fetch(oe("/api/cg/relay-slot"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  }), l = await o.json();
  if (!o.ok || !l.ok || typeof l.t != "string")
    throw new Error(l.error || "relay slot failed");
  return Xf(`/live-lesson?t=${encodeURIComponent(l.t)}`);
}
class T1 {
  constructor(n, r = 1e4) {
    tt(this, "worker", null);
    tt(this, "blobUrl", null);
    tt(this, "fallbackId", null);
    tt(this, "cb");
    tt(this, "intervalMs");
    this.cb = n, this.intervalMs = r;
  }
  start() {
    if (this.worker || this.fallbackId) return;
    const n = () => {
      try {
        this.cb();
      } catch {
      }
    };
    try {
      const r = "let id=null;onmessage=function(e){var d=e.data||{};if(d.cmd==='start'){if(id)clearInterval(id);id=setInterval(function(){postMessage(0)},d.ms||10000);}else if(d.cmd==='stop'){if(id)clearInterval(id);id=null;}};", o = new Blob([r], { type: "application/javascript" });
      this.blobUrl = URL.createObjectURL(o), this.worker = new Worker(this.blobUrl), this.worker.onmessage = n, this.worker.postMessage({ cmd: "start", ms: this.intervalMs });
    } catch {
      this.teardownWorker(), this.fallbackId = setInterval(n, this.intervalMs);
    }
  }
  stop() {
    this.teardownWorker(), this.fallbackId && (clearInterval(this.fallbackId), this.fallbackId = null);
  }
  teardownWorker() {
    if (this.worker) {
      try {
        this.worker.postMessage({ cmd: "stop" }), this.worker.terminate();
      } catch {
      }
      this.worker = null;
    }
    if (this.blobUrl) {
      try {
        URL.revokeObjectURL(this.blobUrl);
      } catch {
      }
      this.blobUrl = null;
    }
  }
}
const y4 = "web-master-6.43.2-05be21c4", v4 = 60, b4 = 16, w4 = 1, x4 = 0.28, S4 = 0.5, k4 = 110, Uy = 0.14, Hl = 0.08;
function By(a) {
  const n = a.webRtcInfo || {}, r = a.signalV2Url || n.signalV2Url;
  return typeof r == "string" && r.startsWith("wss:") ? r : "";
}
function T4(a, n) {
  if (!n || typeof n != "object") return a;
  const r = n, o = a?.webRtcInfo || {}, l = r.webRtcInfo && typeof r.webRtcInfo == "object" ? r.webRtcInfo : {}, u = Object.keys(l).length > 0 ? { ...o, ...l } : { ...o };
  return { ...a || {}, ...r, webRtcInfo: u };
}
const E4 = [
  {
    urls: [
      "turn:openrelay.metered.ca:80",
      "turn:openrelay.metered.ca:443",
      "turn:openrelay.metered.ca:443?transport=tcp",
      "turns:openrelay.metered.ca:443"
    ],
    username: "openrelayproject",
    credential: "openrelayproject"
  }
], Qd = [
  {
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302"
    ]
  },
  { urls: "stun:stun.cloudflare.com:3478" },
  ...E4
];
function M4(a) {
  const r = (a.webRtcInfo || {}).coTurnUrl ?? a.coTurnUrl;
  if (typeof r != "string" || !r) return Qd;
  const o = r.includes(",") ? r.split(",").map((l) => l.trim()).filter(Boolean) : [r.trim()];
  return o.length ? [{ urls: o }, ...Qd] : Qd;
}
function Vy(a, n) {
  qr(
    a,
    JSON.stringify({
      head: { type: "request", method: "handshake", cid: n },
      body: { sdk_info: { version: y4 } }
    })
  );
}
function qr(a, n) {
  a.readyState === WebSocket.OPEN && a.send(n);
}
async function R4(a, n, r, o, l) {
  await a.setRemoteDescription(new RTCSessionDescription(n));
  const u = await a.createAnswer();
  u.sdp && (u.sdp = u.sdp.replace(
    "useinbandfec=1",
    "useinbandfec=1;stereo=1"
  )), await a.setLocalDescription(u), qr(
    r,
    JSON.stringify({
      head: { type: "request", method: "setanswer", cid: o },
      body: { media_description: { type: "answer", sdp: u.sdp } }
    })
  );
}
const C4 = {
  left: { down: 1, up: 2 },
  right: { down: 4, up: 5 }
};
class A4 {
  constructor(n, r, o, l, u) {
    tt(this, "cfg");
    tt(this, "videoEl");
    tt(this, "inputSurface");
    tt(this, "onError");
    tt(this, "saasWs", null);
    tt(this, "signalWs", null);
    tt(this, "pc", null);
    tt(this, "inputWs", null);
    /** Latest mouse move held back while the input socket is backlogged. */
    tt(this, "pendingMove", null);
    tt(this, "moveFlushTimer", null);
    /**
     * Single keepalive driver for the whole session. A Web Worker ticks every 10s
     * even when the tab is hidden (main-thread timers get throttled in background),
     * pinging the SaaS + input WebSockets so the session never dies while you're
     * away. See {@link BackgroundTicker}.
     */
    tt(this, "keepAlive", null);
    tt(this, "visibilityHandler", null);
    tt(this, "streamAccum", null);
    tt(this, "lastRtcSessionId", null);
    tt(this, "lastStartedStoken", "");
    tt(this, "inputStageBound", !1);
    tt(this, "lastPointerNorm", { x: 0, y: 0 });
    /**
     * Virtual cursor in stream-normalized space, used while the pointer is locked.
     *
     * The Haima input socket only speaks *absolute* positions (`mouse:3:x,y`) —
     * there is no relative-delta verb. So mouse-look is emulated the same way the
     * reference client does it (`public/js/study-notes.js` `_onMouseMove`): keep
     * our own cursor, integrate `movementX/Y` into it, clamp to the picture, and
     * send the resulting absolute point. That gives Roblox a continuously moving
     * cursor for camera control even though the real cursor is pinned by the
     * browser's Pointer Lock.
     */
    tt(this, "cursorNorm", { x: 0.5, y: 0.5 });
    tt(this, "pointerLocked", !1);
    /**
     * Camera mode: the pointer behaves as a finger already pressed to the glass.
     *
     * Roblox here is the Android build, so the camera is turned by *dragging*,
     * not by moving a cursor. Without this you'd have to hold a mouse button the
     * whole time you wanted to look around. With it on, the touch is held for
     * you: move the mouse and the camera turns. Paired with Pointer Lock and an
     * edge re-grip so a long turn never runs out of screen.
     */
    tt(this, "cameraMode", !1);
    tt(this, "pointerLockHandler", null);
    /** Notified whenever mouse-look engages or drops, so the UI can show a hint. */
    tt(this, "onPointerLockChange");
    /** Notified when camera mode toggles, so the UI button can reflect it. */
    tt(this, "onCameraModeChange");
    /** Mouse buttons currently held via the overlay, so lock-exit can release them. */
    tt(this, "heldMouseButtons", /* @__PURE__ */ new Set());
    /** Last time any real input (or anti-idle nudge) was sent — drives keep-alive. */
    tt(this, "lastActivityAt", Date.now());
    /** After op 5 delivers WebRTC params, ignore further SaaS frames (noise in DevTools). */
    tt(this, "saasMuteInbound", !1);
    /** Clash Royale: landscape-encoded portrait — rotate display + remap pointers. */
    tt(this, "pointerRemap", "none");
    /** PC images have a real second mouse button; touch-native ones don't. */
    tt(this, "rightButtonSupported", !1);
    tt(this, "portraitResizeHandler", null);
    /** Audio sink for this session's track — owned here so rotation can dispose it. */
    tt(this, "audioEl", null);
    /**
     * Pre-warm mode (session rotation): the stream connects and renders into a
     * hidden video element, but swallows all input and stays muted so it can't
     * act on the player's clicks or talk over the session still on screen.
     * Cleared by {@link activate} at the moment of the swap.
     */
    tt(this, "standby");
    tt(this, "firstFrame");
    tt(this, "resolveFirstFrame");
    /**
     * While Haima has us queued, the wall-clock time it told us to expect. Used
     * to hold {@link waitForFirstFrame} open — a queued session is progressing
     * normally, it just has no instance yet, so timing it out and reconnecting
     * would only lose our place in line.
     */
    tt(this, "queuedUntil", 0);
    /** Fires on each Haima queue notice (`operation:1`). */
    tt(this, "onQueue");
    /**
     * In-flight wheel gesture. Positions are kept in *client* pixels rather than
     * stream coordinates so rotation (Clash's `r90cw`) is handled for free by
     * `clientToStreamNorm` on each send.
     */
    tt(this, "scroll", { down: !1, x: 0, y: 0, pending: 0, raf: 0, liftTimer: null });
    this.cfg = n, this.videoEl = r, this.inputSurface = o, this.onError = l, this.standby = !!u?.standby, this.onQueue = u?.onQueue, this.firstFrame = new Promise((f) => {
      this.resolveFirstFrame = f;
    });
  }
  /** Live RTCPeerConnection (for reading stream stats), or null before/after the session. */
  get peerConnection() {
    return this.pc;
  }
  /** True while this session is a hidden pre-warm that must not take input. */
  get isStandby() {
    return this.standby;
  }
  /**
   * Resolves once the video element has actually painted a frame — not merely
   * when the track arrived. Rotation waits on this before swapping so the
   * incoming stream is proven live and the cut has no black gap.
   */
  waitForFirstFrame(n = 45e3) {
    return new Promise((r, o) => {
      let l = !1;
      this.firstFrame.then(() => {
        l || (l = !0, r());
      });
      const u = Date.now() + n, f = () => {
        if (!l) {
          if (Date.now() >= Math.max(u, this.queuedUntil)) {
            l = !0, o(new Error("stream did not render in time"));
            return;
          }
          setTimeout(f, 500);
        }
      };
      setTimeout(f, 500);
    });
  }
  /** Leave pre-warm: take over input and sound. Called at the swap. */
  activate() {
    this.standby && (this.standby = !1, this.videoEl.muted = !1, this.audioEl && (this.audioEl.muted = !1), this.videoEl.play().catch(() => {
    }));
  }
  async start() {
    this.portraitResizeHandler && (window.removeEventListener("resize", this.portraitResizeHandler), this.portraitResizeHandler = null), this.teardownRtc(), this.teardownInput(), this.streamAccum = null, this.lastRtcSessionId = null, this.lastStartedStoken = "", this.saasMuteInbound = !1, this.pointerRemap = this.cfg.gameId === "clash_royale" ? "r90cw" : "none", this.rightButtonSupported = !1;
    try {
      const n = await Wd(null, this.cfg.relaySessionId);
      this.saasWs = new WebSocket(n);
    } catch (n) {
      this.onError?.(n instanceof Error ? n : new Error(String(n)));
      return;
    }
    this.saasWs.onopen = () => {
      this.startKeepAlive();
    }, this.saasWs.onmessage = (n) => this.onSaasMessage(String(n.data)), this.saasWs.onerror = () => this.onError?.(new Error("stream WebSocket error")), this.saasWs.onclose = () => {
    };
  }
  /**
   * Start the background-resilient keepalive (idempotent). Each tick pings every
   * currently-open session WebSocket so the cloud session stays alive while the
   * tab is backgrounded — letting the user leave and come back to a live stream.
   */
  startKeepAlive() {
    const r = () => {
      if (!this.isInputConnected || Date.now() - this.lastActivityAt < 25e3) return;
      const l = this.lastPointerNorm, u = Math.max(0, Math.min(1, l.x + 4e-3));
      this.sendMouseStreamNorm(u, l.y, 3), this.sendMouseStreamNorm(l.x, l.y, 3);
    }, o = () => {
      if (this.inputWs?.readyState === WebSocket.OPEN && qr(this.inputWs, `ping:${Date.now()}`), this.saasWs?.readyState === WebSocket.OPEN)
        try {
          this.saasWs.send("");
        } catch {
        }
      r();
    };
    this.keepAlive || (this.keepAlive = new T1(o, 1e4), this.keepAlive.start()), this.visibilityHandler || (this.visibilityHandler = () => {
      document.visibilityState === "visible" && o();
    }, document.addEventListener("visibilitychange", this.visibilityHandler));
  }
  stopKeepAlive() {
    this.keepAlive && (this.keepAlive.stop(), this.keepAlive = null), this.visibilityHandler && (document.removeEventListener("visibilitychange", this.visibilityHandler), this.visibilityHandler = null);
  }
  dispose() {
    if (this.portraitResizeHandler && (window.removeEventListener("resize", this.portraitResizeHandler), this.portraitResizeHandler = null), this.clearPortraitFit(this.videoEl), this.pointerRemap = "none", this.stopKeepAlive(), this.saasWs) {
      try {
        this.saasWs.close();
      } catch {
      }
      this.saasWs = null;
    }
    this.teardownRtc(), this.teardownInput(), this.teardownAudio();
    try {
      this.videoEl.srcObject = null;
    } catch {
    }
    this.streamAccum = null, this.lastRtcSessionId = null, this.lastStartedStoken = "", this.saasMuteInbound = !1;
  }
  onSaasMessage(n) {
    if (this.saasMuteInbound) return;
    let r;
    try {
      r = JSON.parse(n);
    } catch {
      return;
    }
    let o = r.payload;
    if (typeof o == "string")
      try {
        o = JSON.parse(o);
      } catch {
        return;
      }
    if (!o || typeof o != "object") return;
    const l = o.operation, u = o.data;
    if (l === 1 && u && typeof u == "object") {
      const f = Number(u.time), h = Number(u.index), p = Number.isFinite(f) && f > 0 ? f : 120;
      this.queuedUntil = Date.now() + (p + v4) * 1e3, this.onQueue?.({
        index: Number.isFinite(h) ? h : null,
        seconds: p
      });
      return;
    }
    if (u && typeof u == "object") {
      this.streamAccum = T4(this.streamAccum, u);
      const f = this.streamAccum, h = f.streamType ?? u.streamType, p = f.webRtcInfo, m = !!(p && p.roomId);
      if (!(h === "WEBRTC" || m) || o.code != null && o.code !== 0) return;
      const v = By(f) !== "";
      (l === 5 || l === 62 && v) && (this.maybeStartWebRtc(r, f).catch(
        (k) => this.onError?.(k instanceof Error ? k : new Error(String(k)))
      ), l === 5 && (this.saasMuteInbound = !0, this.saasWs && (this.saasWs.onmessage = () => {
      })));
    }
  }
  async maybeStartWebRtc(n, r) {
    const o = String(r.cid != null ? r.cid : n.to ?? ""), l = r.webRtcInfo || {}, u = By(r), f = l.roomId ?? r.roomId;
    if (!f || !u) return;
    const h = String(r.stoken ?? r.sToken ?? ""), p = `${f}${o}`;
    if (this.pc && this.lastRtcSessionId === p) {
      const k = this.pc.connectionState;
      if (k === "connected" || k === "connecting" || k === "new" && h && h === this.lastStartedStoken && this.pc.remoteDescription === null)
        return;
      if (k === "new" && this.pc.remoteDescription === null && h && h !== this.lastStartedStoken) {
        if (this.lastStartedStoken = h, this.signalWs) {
          try {
            this.signalWs.close();
          } catch {
          }
          this.signalWs = null;
        }
        const E = `${u}${u.includes("?") ? "&" : "?"}act=1&proto=6`;
        this.signalWs = await this.connectSignal(
          E,
          f,
          o,
          !0
        ), this.pc && (this.pc.onicecandidate = (A) => {
          A.candidate && this.signalWs && qr(
            this.signalWs,
            JSON.stringify({
              head: { type: "request", method: "candidate", cid: o },
              body: {
                candidate_info: {
                  label: A.candidate.sdpMLineIndex,
                  id: A.candidate.sdpMid,
                  candidate: A.candidate.candidate
                }
              }
            })
          );
        }), await this.openInputWebSocket(r.inputUrl || "");
        return;
      }
    }
    this.lastRtcSessionId = p, this.lastStartedStoken = h, this.teardownRtc();
    const m = `${u}${u.includes("?") ? "&" : "?"}act=1&proto=6`, g = M4(r);
    this.pc = new RTCPeerConnection({ iceServers: g, iceCandidatePoolSize: 4 });
    const v = h;
    this.pc.onconnectionstatechange = () => {
      this.pc?.connectionState;
    }, this.pc.oniceconnectionstatechange = () => {
      this.pc?.iceConnectionState;
    }, this.pc.ontrack = (k) => {
      k.track.kind, k.streams.length;
      const E = k.streams[0] ?? (typeof MediaStream < "u" ? new MediaStream([k.track]) : null);
      if (E && (k.track.kind === "video" && (this.videoEl.srcObject = E, this.videoEl.muted = !0, this.videoEl.readyState, this.videoEl.paused, this.watchForFirstFrame(), this.videoEl.play().then(() => {
        this.standby || (this.videoEl.muted = !1);
      }).catch((A) => {
        console.error("[tc-rtc] play() failed:", A);
      }), this.applyPortraitFit()), k.track.kind === "audio")) {
        this.teardownAudio();
        const A = document.createElement("audio");
        A.autoplay = !0, A.srcObject = E, A.muted = this.standby, A.style.display = "none", document.body.appendChild(A), this.audioEl = A;
      }
    };
    const b = await this.connectSignal(
      m,
      f,
      o,
      !0
    );
    if (this.lastStartedStoken !== v) {
      try {
        b.close();
      } catch {
      }
      return;
    }
    this.signalWs = b, this.pc && (this.pc.onicecandidate = (k) => {
      k.candidate && this.signalWs && qr(
        this.signalWs,
        JSON.stringify({
          head: { type: "request", method: "candidate", cid: o },
          body: {
            candidate_info: {
              label: k.candidate.sdpMLineIndex,
              id: k.candidate.sdpMid,
              candidate: k.candidate.candidate
            }
          }
        })
      );
    }), await this.openInputWebSocket(r.inputUrl || "");
  }
  async connectSignal(n, r, o, l) {
    const u = await Wd(n, this.cfg.relaySessionId), f = new WebSocket(u);
    return f.onopen = () => {
      l ? Vy(f, o) : qr(f, JSON.stringify({ to: r, type: "join", payload: {} }));
    }, f.onmessage = async (h) => {
      let p;
      try {
        p = JSON.parse(String(h.data));
      } catch {
        return;
      }
      if (!(p && typeof p.orientation == "number" && p.head == null) && l)
        if (p.head?.method === "setoffer" && p.body?.media_description && this.pc)
          await R4(this.pc, p.body.media_description, f, o);
        else if (p.head?.method === "candidate" && p.body?.candidate_info && this.pc) {
          const m = p.body.candidate_info;
          await this.pc.addIceCandidate(
            new RTCIceCandidate({
              sdpMLineIndex: m.label,
              sdpMid: m.id,
              candidate: m.candidate
            })
          ).catch(() => {
          });
        } else p.head?.method === "reconnect" && Vy(f, o);
    }, f;
  }
  teardownRtc() {
    if (this.signalWs) {
      try {
        this.signalWs.close();
      } catch {
      }
      this.signalWs = null;
    }
    if (this.pc) {
      try {
        this.pc.close();
      } catch {
      }
      this.pc = null;
    }
  }
  async openInputWebSocket(n) {
    if (this.teardownInputOnlyWs(), !n) return;
    let r;
    try {
      r = await Wd(n, this.cfg.relaySessionId);
    } catch (o) {
      this.onError?.(o instanceof Error ? o : new Error(String(o)));
      return;
    }
    try {
      this.inputWs = new WebSocket(r);
    } catch (o) {
      this.onError?.(o instanceof Error ? o : new Error(String(o)));
      return;
    }
    this.inputWs.onopen = () => {
      this.ensureInputStageListeners(), this.startKeepAlive();
    }, this.inputWs.onmessage = (o) => this.onInputMessage(o.data), this.inputWs.onclose = () => {
      this.removeInputStageListeners();
    };
  }
  /**
   * Resolve `firstFrame` when a frame is genuinely on screen. `requestVideoFrameCallback`
   * is exact where it exists; elsewhere fall back to `timeupdate` with a non-zero
   * currentTime, which only advances once decoding has actually started.
   */
  watchForFirstFrame() {
    const n = this.videoEl, r = () => {
      n.currentTime > 0 && n.readyState >= 2 && (n.removeEventListener("timeupdate", r), this.resolveFirstFrame());
    };
    n.addEventListener("timeupdate", r), typeof n.requestVideoFrameCallback == "function" && n.requestVideoFrameCallback(() => {
      n.removeEventListener("timeupdate", r), this.resolveFirstFrame();
    });
  }
  /**
   * Clash Royale streams a portrait game inside a landscape frame — rotate the
   * element and size it to the viewport's transposed dimensions. Reads
   * `this.videoEl` on every call, so it follows the element across
   * {@link adoptVideoElement}.
   */
  applyPortraitFit() {
    if (this.pointerRemap !== "r90cw") return;
    this.videoEl.style.transform = "rotate(90deg)", this.videoEl.style.transformOrigin = "center center";
    const n = () => {
      const r = window.innerWidth, o = window.innerHeight;
      this.videoEl.style.width = `${o}px`, this.videoEl.style.height = `${r}px`, this.videoEl.style.maxWidth = `${o}px`, this.videoEl.style.maxHeight = `${r}px`;
    };
    n(), this.portraitResizeHandler && window.removeEventListener("resize", this.portraitResizeHandler), this.portraitResizeHandler = n, window.addEventListener("resize", n), this.videoEl.addEventListener("loadedmetadata", n, { once: !0 });
  }
  clearPortraitFit(n) {
    this.pointerRemap === "r90cw" && (n.style.transform = "", n.style.transformOrigin = "", n.style.width = "", n.style.height = "", n.style.maxWidth = "", n.style.maxHeight = "");
  }
  /**
   * Move this session's picture onto a different `<video>`, carrying the live
   * MediaStream over. Used by session rotation: the replacement renders into an
   * off-screen element while it warms up, then adopts the on-screen one at the
   * swap so every other consumer (touch overlay, fullscreen, pointer mapping)
   * keeps pointing at the same element it always has.
   */
  adoptVideoElement(n) {
    if (n === this.videoEl) return;
    const r = this.videoEl, o = r.srcObject;
    try {
      r.srcObject = null;
    } catch {
    }
    this.clearPortraitFit(r), this.videoEl = n, n.srcObject = o, n.muted = this.standby, this.applyPortraitFit(), n.play().catch(() => {
    });
  }
  teardownAudio() {
    if (this.audioEl) {
      try {
        this.audioEl.srcObject = null, this.audioEl.remove();
      } catch {
      }
      this.audioEl = null;
    }
  }
  /**
   * Anything the cloud VM sends back on the input socket.
   *
   * Until now nothing listened here at all, so every inbound frame was
   * discarded. This is the only plausible route for a copy-out (VM clipboard →
   * browser): the SaaS socket carries session lifecycle only, and WebRTC is
   * media. Haima's config advertises `ime_switch_enable`, so an IME/clipboard
   * message may well exist — but the shape is undocumented, so for now this
   * logs candidates under XC_DEBUG rather than guessing at a parser.
   *
   * If a frame here ever turns out to carry clipboard text, writing it to
   * `navigator.clipboard` is the remaining step.
   */
  onInputMessage(n) {
    typeof n != "string" || !n || n.startsWith("pong") || typeof localStorage < "u" && localStorage.getItem("tc-debug-input") === "1" && n.slice(0, 500);
  }
  teardownInput() {
    this.stopKeepAlive(), this.endScroll(), this.removeInputStageListeners(), this.teardownInputOnlyWs();
  }
  teardownInputOnlyWs() {
    if (this.pendingMove = null, this.moveFlushTimer && (clearTimeout(this.moveFlushTimer), this.moveFlushTimer = null), this.inputWs) {
      try {
        this.inputWs.close();
      } catch {
      }
      this.inputWs = null;
    }
  }
  sendInput(n) {
    if (this.standby) return;
    this.lastActivityAt = Date.now(), typeof localStorage < "u" && localStorage.getItem("tc-debug-input") === "1" && n.startsWith("mouse:3:");
    const r = this.inputWs;
    if (r?.readyState === WebSocket.OPEN) {
      if (n.startsWith("mouse:3:")) {
        if (r.bufferedAmount > 0 || this.pendingMove) {
          this.pendingMove = n, this.scheduleMoveFlush();
          return;
        }
        r.send(n);
        return;
      }
      this.flushPendingMove(), r.send(n);
    }
  }
  flushPendingMove() {
    this.moveFlushTimer && (clearTimeout(this.moveFlushTimer), this.moveFlushTimer = null);
    const n = this.pendingMove;
    this.pendingMove = null, n && this.inputWs?.readyState === WebSocket.OPEN && this.inputWs.send(n);
  }
  scheduleMoveFlush() {
    this.moveFlushTimer || (this.moveFlushTimer = setTimeout(() => {
      this.moveFlushTimer = null, this.pendingMove && ((this.inputWs?.bufferedAmount ?? 0) > 0 ? this.scheduleMoveFlush() : this.flushPendingMove());
    }, 4));
  }
  /**
   * Axis-aligned rect of the **visible picture** (object-fit: contain inset), not the full element box.
   * Fixes skew when clicks land "to the left" of the finger due to letterboxing.
   */
  contentRectForPointerNorm() {
    const n = this.videoEl;
    if (n.videoWidth > 0 && n.videoHeight > 0) {
      const o = n.getBoundingClientRect(), l = n.videoWidth, u = n.videoHeight;
      if (this.pointerRemap === "r90cw") {
        const v = Math.min(o.width / u, o.height / l), b = u * v, k = l * v;
        return {
          left: o.left + (o.width - b) / 2,
          top: o.top + (o.height - k) / 2,
          width: b,
          height: k
        };
      }
      const f = Math.min(o.width / l, o.height / u), h = l * f, p = u * f, m = o.left + (o.width - h) / 2, g = o.top + (o.height - p) / 2;
      return { left: m, top: g, width: h, height: p };
    }
    const r = n.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }
  /** Map screen coords → stream-side normalized coords (same space as `mouse:` lines). */
  clientToStreamNorm(n, r) {
    const o = this.contentRectForPointerNorm();
    let l = o.width > 0 ? (n - o.left) / o.width : 0, u = o.height > 0 ? (r - o.top) / o.height : 0;
    if (this.pointerRemap === "r90cw") {
      const f = l;
      l = u, u = 1 - f;
    }
    return {
      x: Math.max(0, Math.min(1, l)),
      y: Math.max(0, Math.min(1, u))
    };
  }
  /** Center of a stream-normalized point in viewport pixels (for overlay buttons). */
  streamNormToClientPoint(n, r) {
    let o = n, l = r;
    if (this.pointerRemap === "r90cw") {
      const f = n;
      o = 1 - r, l = f;
    }
    const u = this.contentRectForPointerNorm();
    return {
      x: u.left + o * u.width,
      y: u.top + l * u.height
    };
  }
  get isInputConnected() {
    return this.inputWs?.readyState === WebSocket.OPEN;
  }
  /** mouse verb: 1 down, 2 up, 3 move */
  sendMouseStreamNorm(n, r, o) {
    const l = Math.max(0, Math.min(1, n)), u = Math.max(0, Math.min(1, r));
    this.sendInput(`mouse:${o}:${l.toFixed(4)},${u.toFixed(4)}`);
  }
  get isCameraMode() {
    return this.cameraMode;
  }
  /**
   * Turn the held-drag camera on or off. Engaging also grabs the pointer, so
   * the mouse can keep travelling in one direction without leaving the window.
   */
  setCameraMode(n) {
    n !== this.cameraMode && (this.cameraMode = n, n ? (this.cursorNorm = { ...this.lastPointerNorm }, this.requestPointerLock(), this.sendMouseStreamNorm(this.cursorNorm.x, this.cursorNorm.y, 1)) : (this.sendMouseStreamNorm(this.cursorNorm.x, this.cursorNorm.y, 2), this.exitPointerLock()), this.onCameraModeChange?.(n));
  }
  /**
   * Keep a held drag going when it reaches the edge of the picture: lift, jump
   * back to the middle, and press again. The game sees one continuous gesture
   * per segment, so the camera keeps turning as long as the mouse keeps moving.
   */
  regripCamera() {
    this.sendMouseStreamNorm(this.cursorNorm.x, this.cursorNorm.y, 2), this.cursorNorm = { x: 0.5, y: 0.5 }, this.sendMouseStreamNorm(0.5, 0.5, 1);
  }
  /** Where the cloud cursor currently is, in stream-normalized coords. */
  get cursorStreamNorm() {
    return { ...this.cursorNorm };
  }
  get isPointerLocked() {
    return this.pointerLocked;
  }
  /**
   * Enter mouse-look. The browser hides the real cursor and starts reporting
   * `movementX/Y`; {@link ensureInputStageListeners} integrates those into
   * {@link cursorNorm}. Roblox (and any other PC title with a free camera)
   * needs this — without it the cursor stops at the edge of the video and the
   * camera stops turning with it.
   */
  requestPointerLock() {
    const n = this.inputSurface;
    if (!(!n?.requestPointerLock || this.standby)) {
      this.cursorNorm = { ...this.lastPointerNorm };
      try {
        const r = n.requestPointerLock({ unadjustedMovement: !0 });
        r && typeof r.catch == "function" && r.catch(() => {
          try {
            n.requestPointerLock();
          } catch {
          }
        });
      } catch {
        try {
          n.requestPointerLock();
        } catch {
        }
      }
    }
  }
  exitPointerLock() {
    try {
      document.exitPointerLock?.();
    } catch {
    }
  }
  /**
   * Press or release a mouse button **at the cloud cursor**, not at a screen
   * position. On-screen LMB/RMB pads need this: the pad sits in the corner, but
   * the click has to land wherever the player is aiming.
   */
  sendMouseButton(n, r) {
    const o = n === "right" && !this.rightButtonSupported ? "left" : n, l = C4[o];
    if (!l) return;
    r ? this.heldMouseButtons.add(o) : this.heldMouseButtons.delete(o);
    const { x: u, y: f } = this.cursorNorm;
    this.sendInput(
      `mouse:${r ? l.down : l.up}:${u.toFixed(4)},${f.toFixed(4)}`
    );
  }
  /** Release anything the overlay is still holding (lock exit, teardown). */
  releaseHeldMouseButtons() {
    for (const n of [...this.heldMouseButtons]) this.sendMouseButton(n, !1);
  }
  /** Short press at normalized stream coordinates (WebSocket — not DOM events). */
  tapStreamNorm(n, r) {
    const o = Math.max(0, Math.min(1, n)), l = Math.max(0, Math.min(1, r));
    this.sendMouseStreamNorm(o, l, 1), this.sendMouseStreamNorm(o, l, 3), this.sendMouseStreamNorm(o, l, 2);
  }
  /**
   * Send a raw key event by numeric code. The cloud host treats the code as a
   * Windows Virtual-Key code (physical keyboard forwards `KeyboardEvent.keyCode`;
   * the touch-key overlay supplies its own configured codes).
   */
  sendAndroidKeyEvent(n, r) {
    const o = Math.floor(n);
    r ? this.sendInput(`keyDown:${o}`) : this.sendInput(`keyUp:${o}`);
  }
  /**
   * Wheel delta → pixels, following the same `deltaMode` rules a browser uses:
   * 0 is already pixels, 1 is lines, 2 is pages. Mice that report lines (most
   * non-trackpad hardware) were previously treated identically to a trackpad's
   * pixel deltas, so a notch and a flick scrolled the same distance.
   */
  wheelDeltaPx(n) {
    return n.deltaMode === 1 ? n.deltaY * b4 : n.deltaMode === 2 ? n.deltaY * (this.contentRectForPointerNorm().height || 1) : n.deltaY;
  }
  /** Feed a wheel event into the running drag, starting one if needed. */
  queueScroll(n, r, o) {
    const l = this.scroll;
    l.down || (l.x = n, l.y = r, l.pending = 0, l.down = !0, this.sendPointerClient(1, l.x, l.y)), l.pending += o, l.liftTimer && clearTimeout(l.liftTimer), l.liftTimer = setTimeout(() => this.endScroll(), k4), l.raf || (l.raf = requestAnimationFrame(() => this.stepScroll()));
  }
  /**
   * One frame of the drag. Eases toward the outstanding distance so the motion
   * is smooth rather than one jump per notch, and re-grips when the finger runs
   * out of screen — without that, a long scroll would walk off the bottom and
   * stop dead partway down a list.
   */
  stepScroll() {
    const n = this.scroll;
    if (n.raf = 0, !n.down) return;
    const r = this.contentRectForPointerNorm(), o = r.top + r.height * Uy, l = r.top + r.height * (1 - Uy), u = Math.abs(n.pending) <= S4 ? n.pending : n.pending * x4;
    n.pending -= u;
    const f = n.y + u;
    if (f < o || f > l) {
      const h = Math.max(o, Math.min(l, f));
      this.sendPointerClient(3, n.x, h), this.sendPointerClient(2, n.x, h);
      const p = (f < o ? l : o) + (f - h), m = Math.max(o, Math.min(l, p));
      n.pending += p - m, n.y = m, this.sendPointerClient(1, n.x, n.y);
    } else
      n.y = f, this.sendPointerClient(3, n.x, n.y);
    n.pending !== 0 && (n.raf = requestAnimationFrame(() => this.stepScroll()));
  }
  /** Lift the scrolling finger. Safe to call when no gesture is running. */
  endScroll() {
    const n = this.scroll;
    n.liftTimer && (clearTimeout(n.liftTimer), n.liftTimer = null), n.raf && (cancelAnimationFrame(n.raf), n.raf = 0), n.down && (n.down = !1, n.pending = 0, this.sendPointerClient(2, n.x, n.y));
  }
  /** Send a pointer verb at a *client* pixel position. */
  sendPointerClient(n, r, o) {
    const l = this.clientToStreamNorm(r, o);
    this.lastPointerNorm = l, this.sendInput(`mouse:${n}:${l.x.toFixed(4)},${l.y.toFixed(4)}`);
  }
  /** Text input path. */
  sendTextIm(n) {
    const r = String(n).replace(/\r\n/g, `
`).replace(/\n/g, "");
    r && this.sendInput(`textIM:${r}`);
  }
  /**
   * Ctrl/Cmd+V — push the browser's clipboard into the cloud VM's focused
   * field. Uses the IME channel rather than synthesised keystrokes so
   * punctuation and non-ASCII survive, and so it lands in one go.
   *
   * `readText()` needs a secure context and a user gesture; the keydown that
   * triggers this counts as one. A denied permission just does nothing —
   * there's no meaningful recovery, and throwing here would break typing.
   */
  async pasteFromHostClipboard() {
    try {
      const n = await navigator.clipboard?.readText();
      n && this.sendTextIm(n);
    } catch {
    }
  }
  ensureInputStageListeners() {
    if (this.inputStageBound) return;
    const n = (M) => {
      if (this.pointerLocked) {
        const R = this.contentRectForPointerNorm();
        let z = R.width > 0 ? (M.movementX || 0) / R.width : 0, Z = R.height > 0 ? (M.movementY || 0) / R.height : 0;
        if (this.pointerRemap === "r90cw") {
          const at = z;
          z = Z, Z = -at;
        }
        const W = this.cursorNorm.x + z, X = this.cursorNorm.y + Z;
        if (this.cameraMode && (W <= Hl || W >= 1 - Hl || X <= Hl || X >= 1 - Hl)) {
          this.regripCamera(), this.lastPointerNorm = this.cursorNorm;
          return;
        }
        const F = {
          x: Math.max(0, Math.min(1, W)),
          y: Math.max(0, Math.min(1, X))
        };
        this.cursorNorm = F, this.lastPointerNorm = F, this.sendInput(`mouse:3:${F.x.toFixed(4)},${F.y.toFixed(4)}`);
        return;
      }
      const D = this.clientToStreamNorm(M.clientX, M.clientY);
      this.lastPointerNorm = D, this.cursorNorm = D, this.sendInput(`mouse:3:${D.x.toFixed(4)},${D.y.toFixed(4)}`);
    }, r = (M) => M.button === 0 ? "left" : M.button === 2 ? "right" : null, o = (M) => {
      const D = r(M);
      if (D) {
        if (!this.pointerLocked) {
          const R = this.clientToStreamNorm(M.clientX, M.clientY);
          this.lastPointerNorm = R, this.cursorNorm = R;
        }
        this.sendMouseButton(D, !0);
      }
    }, l = (M) => {
      const D = r(M);
      if (D) {
        if (!this.pointerLocked) {
          const R = this.clientToStreamNorm(M.clientX, M.clientY);
          this.lastPointerNorm = R, this.cursorNorm = R;
        }
        this.sendMouseButton(D, !1);
      }
    }, u = () => {
      const M = document.pointerLockElement === this.inputSurface;
      M !== this.pointerLocked && (this.pointerLocked = M, M || (this.releaseHeldMouseButtons(), this.cameraMode && this.setCameraMode(!1)), this.onPointerLockChange?.(M));
    }, f = (M) => {
      M.preventDefault(), this.isInputConnected && this.queueScroll(
        M.clientX,
        M.clientY,
        -this.wheelDeltaPx(M) * w4
      );
    }, h = (M) => M.preventDefault(), p = () => {
      const M = document.activeElement;
      if (!M) return !1;
      const D = M.tagName;
      return D === "INPUT" || D === "TEXTAREA" || D === "SELECT" || M.isContentEditable;
    }, m = () => {
      try {
        return localStorage.getItem("tc-backspace") || "vk";
      } catch {
        return "vk";
      }
    }, g = (M) => M.key === "Backspace" || M.code === "Backspace", v = (M, D) => {
      if (!g(M)) return !1;
      const R = m();
      return R === "im" ? (D && this.sendInput("textIM:\b"), !0) : (this.sendAndroidKeyEvent(R === "android" ? 67 : 8, D), !0);
    }, b = (M) => M.key === "Escape" || M.code === "Escape" ? 27 : typeof M.keyCode == "number" && M.keyCode > 0 && M.keyCode < 255 ? M.keyCode : 0, k = (M) => (M.ctrlKey || M.metaKey) && !M.altKey && M.key.toLowerCase() === "v", E = (M) => M.ctrlKey || M.metaKey || M.altKey ? "" : [...M.key].length === 1 ? M.key : "", A = (M) => {
      if (!this.isInputConnected || p()) return;
      if (k(M)) {
        M.preventDefault(), this.pasteFromHostClipboard();
        return;
      }
      const D = E(M);
      if (D) {
        M.preventDefault(), this.sendTextIm(D);
        return;
      }
      if (v(M, !0)) {
        M.preventDefault();
        return;
      }
      const R = b(M);
      R && (M.preventDefault(), this.sendAndroidKeyEvent(R, !0));
    }, C = (M) => {
      if (!this.isInputConnected || p()) return;
      if (k(M)) {
        M.preventDefault();
        return;
      }
      if (E(M)) {
        M.preventDefault();
        return;
      }
      if (v(M, !1)) {
        M.preventDefault();
        return;
      }
      const D = b(M);
      D && (M.preventDefault(), this.sendAndroidKeyEvent(D, !1));
    };
    this.inputSurface.addEventListener("mousemove", n), this.inputSurface.addEventListener("mousedown", o), this.inputSurface.addEventListener("mouseup", l), this.inputSurface.addEventListener("wheel", f, { passive: !1 }), this.inputSurface.addEventListener("contextmenu", h), document.addEventListener("keydown", A, !0), document.addEventListener("keyup", C, !0), document.addEventListener("pointerlockchange", u), this.pointerLockHandler = u, this._inputCleanups = () => {
      this.releaseHeldMouseButtons(), this.exitPointerLock(), document.removeEventListener("pointerlockchange", u), this.pointerLockHandler = null, this.pointerLocked = !1, this.inputSurface.removeEventListener("mousemove", n), this.inputSurface.removeEventListener("mousedown", o), this.inputSurface.removeEventListener("mouseup", l), this.inputSurface.removeEventListener("wheel", f), this.inputSurface.removeEventListener("contextmenu", h), document.removeEventListener("keydown", A, !0), document.removeEventListener("keyup", C, !0);
    }, this.inputStageBound = !0;
  }
  removeInputStageListeners() {
    if (!this.inputStageBound) return;
    const n = this._inputCleanups;
    n?.(), this._inputCleanups = void 0, this.inputStageBound = !1;
  }
}
async function E1(a, n, r, o, l) {
  const u = new A4(a, n, r, o, l);
  return await u.start(), u;
}
const j4 = 1200, Hy = 6e3, L4 = 10;
async function D4(a) {
  const n = await fetch(
    oe(`/api/cg/tc-rotation?sessionId=${encodeURIComponent(a)}`),
    { credentials: "include" }
  );
  if (!n.ok) return { state: "none" };
  const r = await n.json();
  return r.ok && r.rotation ? r.rotation : { state: "none" };
}
async function N4(a, n) {
  await fetch(oe("/api/cg/tc-rotation/commit"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: a, nextSessionId: n })
  });
}
function O4(a) {
  let n = !1, r = !1, o = !1, l = null;
  const u = (h) => {
    o !== h && (o = h, a.onRotatingChange?.(h));
  }, f = async () => {
    if (n || r) return;
    const h = a.getCurrentSessionId();
    if (!h) return;
    let p;
    try {
      p = await D4(h);
    } catch {
      return;
    }
    if (n || (u(p.state === "finishing" || p.state === "ready"), p.state !== "ready")) return;
    r = !0;
    let m = null;
    try {
      const g = a.getStandbyVideo();
      if (!g) return;
      for (let v = 1; !n; v++) {
        m = await E1(
          { gameId: a.gameId, relaySessionId: p.nextSessionId },
          g,
          a.getInputSurface(),
          (b) => a.onError?.(b),
          { standby: !0 }
        );
        try {
          await m.waitForFirstFrame(Hy), `${v}`;
          break;
        } catch (b) {
          if (console.warn(
            `[tc-rotate] attempt ${v} got no frames in ${Hy}ms — reconnecting`
          ), m.dispose(), m = null, v >= L4) throw b;
        }
      }
      if (n || !m) {
        m?.dispose();
        return;
      }
      m.activate(), a.onSwap(m, p.nextSessionId), u(!1), await N4(h, p.nextSessionId);
    } catch (g) {
      m?.dispose(), a.onError?.(
        g instanceof Error ? g : new Error("session rotation failed")
      );
    } finally {
      r = !1;
    }
  };
  return l = new T1(() => {
    f();
  }, j4), l.start(), () => {
    n = !0, l?.stop(), l = null;
  };
}
const Br = 1, ua = 2, Pl = 3, _4 = 60, z4 = 1280, U4 = 720, Py = 0.12;
function B4(a) {
  return /^Key([A-Z])$/.test(a) ? a.slice(3) : /^Digit(\d)$/.test(a) ? a.slice(5) : a === "Space" ? "Space" : a === "ShiftLeft" || a === "ShiftRight" ? "Shift" : a === "ControlLeft" || a === "ControlRight" ? "Ctrl" : a === "AltLeft" || a === "AltRight" ? "Alt" : a === "Tab" ? "Tab" : a === "Enter" ? "Enter" : a === "Escape" ? "Esc" : /^Arrow(Left|Right|Up|Down)$/.test(a) ? a.slice(5) : null;
}
const Yy = (a) => a.replace(/_alt\d+$/, "");
class V4 {
  constructor(n, r, o) {
    tt(this, "send");
    tt(this, "map", null);
    /** Scheme key names currently held down. */
    tt(this, "held", /* @__PURE__ */ new Set());
    /** True while typing mode was asserted by the GAME rather than chosen. */
    tt(this, "typingAuto", !1);
    /** Set from the game's own keyboardStatus messages, or by the user toggle. */
    tt(this, "typing", !1);
    tt(this, "pointerLockEl", null);
    /** control -> whether its virtual finger is currently down. */
    tt(this, "dpads", /* @__PURE__ */ new Map());
    /**
     * Whoever owns a finger slot while it is down — a control, or a real
     * touchscreen pointer. Slots are handed out lowest-free, so a player's thumb
     * on the game's own stick and a key-driven tap never share an index (which
     * the host reads as one finger teleporting between the two).
     */
    tt(this, "fingers", /* @__PURE__ */ new Map());
    /** Real touchscreen pointers currently down, by PointerEvent.pointerId. */
    tt(this, "rawDown", /* @__PURE__ */ new Set());
    /** Coalesced real-touch moves, flushed once per frame as one batched frame. */
    tt(this, "rawPending", /* @__PURE__ */ new Map());
    tt(this, "rawQueued", !1);
    /** finger -> where it is being held, for the keep-alive above. */
    tt(this, "holding", /* @__PURE__ */ new Map());
    tt(this, "keepAlive", null);
    tt(this, "pan", {
      control: null,
      active: !1,
      x: 0,
      y: 0,
      suspended: !1
    });
    tt(this, "streamSize");
    /** Told when Escape rescued the controls, so the HUD toggle follows. */
    tt(this, "onTypingEscape", null);
    this.send = n, this.pointerLockEl = r ?? null, this.streamSize = o ?? (() => ({ w: z4, h: U4 }));
  }
  /**
   * One finger per control, so holding the stick while tapping a button is two
   * touches rather than one that keeps jumping between them.
   */
  fingerFor(n) {
    const r = this.fingers.get(n);
    if (r !== void 0) return r;
    const o = new Set(this.fingers.values());
    let l = 0;
    for (; o.has(l); ) l += 1;
    return this.fingers.set(n, l), l;
  }
  /** Frees a finger slot once its touch has been lifted. */
  freeFinger(n) {
    for (const [r, o] of this.fingers)
      o === n && this.fingers.delete(r);
  }
  /** Percentage of the stream -> pixels, which is what a touch frame carries. */
  px(n) {
    const { w: r, h: o } = this.streamSize();
    return { x: n.x / 100 * r, y: n.y / 100 * o };
  }
  setKeymap(n) {
    for (const [r, o] of this.dpads) {
      if (!o.active) continue;
      const l = this.px(r);
      this.sendTouch(ua, this.fingerFor(r), l.x, l.y);
    }
    this.pan.active && this.panStop(), this.map = n, this.held.clear(), this.dpads.clear();
  }
  hasKeymap() {
    return !!this.map?.controls.length;
  }
  /**
   * True when the title is steered by an on-screen stick, so every input it
   * sees has to be a touch. See the mouse handling in ngStream for why.
   */
  touchDriven() {
    return !!this.map?.controls.some((n) => n.type === "Dpad");
  }
  /** True while this pointer is down as a touch (rather than a mouse). */
  isRawDown(n) {
    return this.rawDown.has(n);
  }
  /** True while the game (or the user) says keys should be characters, not controls. */
  isTyping() {
    return this.typing;
  }
  /**
   * The game has a text field open, or just closed one.
   *
   * While it is open every key has to reach the raw key path as a character —
   * this layer must not turn W into a stick push while someone is typing
   * "well". Anything currently held is released on the way in, or the stick
   * stays pressed for as long as the chat box is up.
   */
  setTyping(n, r = "user") {
    if (n !== this.typing && (this.typing = n, this.typingAuto = n && r === "host", !!n)) {
      for (const o of this.map?.controls ?? []) {
        if (o.type !== "Dpad" && o.type !== "FreeLook") continue;
        const l = this.dpads.get(o);
        if (l?.active) {
          const u = this.px(o);
          this.sendTouch(ua, this.fingerFor(o), u.x, u.y), l.active = !1;
        }
      }
      this.held.clear(), this.pan.active && this.panStop();
    }
  }
  /**
   * Tracks what is held and keeps the timer running only while something is.
   *
   * Driven from sendTouch so every path — stick, tap, camera, and all the
   * release paths — is covered without each one remembering to.
   */
  noteTouch(n, r, o, l) {
    n === ua ? (this.holding.delete(r), this.rawPending.delete(r), this.freeFinger(r)) : this.holding.set(r, { x: o, y: l }), this.holding.size && !this.keepAlive ? this.keepAlive = setInterval(() => {
      for (const [u, f] of this.holding)
        this.emitTouch(Pl, u, f.x, f.y);
    }, _4) : !this.holding.size && this.keepAlive && (clearInterval(this.keepAlive), this.keepAlive = null);
  }
  /** Uint16 [op, finger, x, y] — see the protocol note at the top. */
  sendTouch(n, r, o, l) {
    return this.noteTouch(n, r, o, l), this.emitTouch(n, r, o, l);
  }
  emitTouch(n, r, o, l) {
    const { w: u, h: f } = this.streamSize(), h = new ArrayBuffer(8), p = new Uint16Array(h);
    return p[0] = n, p[1] = r, p[2] = Math.max(0, Math.min(u, Math.round(o))), p[3] = Math.max(0, Math.min(f, Math.round(l))), this.send(h);
  }
  /** Every control this key appears in, with the role it plays there. */
  controlsFor(n) {
    if (!this.map) return [];
    const r = [];
    for (const o of this.map.controls)
      for (const [l, u] of Object.entries(o.keys ?? {}))
        String(u).toLowerCase() === n.toLowerCase() && r.push({ c: o, role: Yy(l) });
    return r;
  }
  // --- Dpad: a virtual stick -----------------------------------------------
  //
  // Touch down at the stick's centre, then drag toward the pressed direction by
  // its radius, exactly as a thumb would. Diagonals compose, and the touch is
  // released only when the LAST direction key comes up — lifting between steps
  // would read as stop-start rather than a held run.
  dpadVector(n) {
    let r = 0, o = 0;
    const l = /* @__PURE__ */ new Set();
    for (const [u, f] of Object.entries(n.keys ?? {}))
      this.held.has(String(f).toLowerCase()) && l.add(Yy(u));
    for (const u of l)
      u === "KeyUp" ? o -= 1 : u === "KeyDown" ? o += 1 : u === "KeyLeft" ? r -= 1 : u === "KeyRight" && (r += 1);
    return { dx: r, dy: o };
  }
  updateDpad(n) {
    const { dx: r, dy: o } = this.dpadVector(n), l = this.dpads.get(n) ?? { active: !1 }, { x: u, y: f } = this.px(n);
    if (!r && !o) {
      l.active && (this.sendTouch(ua, this.fingerFor(n), u, f), l.active = !1, this.dpads.set(n, l));
      return;
    }
    const h = Math.hypot(r, o) || 1, { w: p } = this.streamSize(), m = (n.radius || 5) / 100 * p;
    l.active || (this.sendTouch(Br, this.fingerFor(n), u, f), l.active = !0, this.dpads.set(n, l)), this.sendTouch(
      Pl,
      this.fingerFor(n),
      u + r / h * m,
      f + o / h * m
    );
  }
  // --- Pan: the camera ------------------------------------------------------
  //
  // "Pan" is mouse-look: hold the start key and the pointer stops being a
  // cursor — its MOVEMENT becomes a finger dragging from the control's anchor.
  //
  // Two details make it usable rather than merely present. Pointer lock, or the
  // cursor hits the window edge after a quarter turn and the camera stops,
  // which is the classic broken-mouselook feel. And re-anchoring: a real finger
  // also runs out of screen, so when the virtual touch drifts near an edge it
  // is lifted and put back at the anchor. The lift is one frame and reads as
  // continuous.
  panStart(n) {
    if (this.pan.active) return;
    const r = this.px(n);
    this.pan.control = n, this.pan.x = r.x, this.pan.y = r.y, this.pan.active = !0, this.sendTouch(Br, this.fingerFor(n), this.pan.x, this.pan.y);
    const o = this.pointerLockEl;
    o?.requestPointerLock && o.requestPointerLock();
  }
  panStop() {
    if (!this.pan.active) return;
    const n = this.pan.control;
    this.sendTouch(ua, n ? this.fingerFor(n) : 0, this.pan.x, this.pan.y), this.pan.active = !1, this.pan.control = null, document.pointerLockElement && document.exitPointerLock();
  }
  isPanning() {
    return this.pan.active;
  }
  /** The Pan control in the current scheme, if it has one. */
  panControl() {
    return this.map?.controls.find((n) => n.type === "Pan") ?? null;
  }
  panMove(n, r) {
    if (!this.pan.active || this.pan.suspended) return;
    const o = this.pan.control;
    if (!o) return;
    const l = this.fingerFor(o), { w: u, h: f } = this.streamSize(), h = o.sensitivity || 1;
    this.pan.x += n * h, this.pan.y += r * h;
    const p = u * Py, m = f * Py;
    if (this.pan.x < p || this.pan.x > u - p || this.pan.y < m || this.pan.y > f - m) {
      this.sendTouch(ua, l, this.pan.x, this.pan.y);
      const g = this.px(o);
      this.pan.x = g.x, this.pan.y = g.y, this.sendTouch(Br, this.fingerFor(o), this.pan.x, this.pan.y);
      return;
    }
    this.sendTouch(Pl, l, this.pan.x, this.pan.y);
  }
  // --- key handling ---------------------------------------------------------
  /**
   * Routes one key event.
   *
   * Returns what the keymap did with it:
   *
   *   "none"  — not ours; the caller sends it as an ordinary keystroke.
   *   "touch" — turned into a screen touch; sending the key too would give the
   *             game both, which double-fires anything discrete like a jump.
   *   "move"  — turned into a thumbstick drag, and the caller should ALSO send
   *             the raw key.
   *
   * That last one exists because a control scheme describes where a title draws
   * its on-screen stick, and some builds do not draw one at all — they take a
   * hardware keyboard instead. The scheme cannot tell us which, and the drag
   * then lands on empty ground with the key already swallowed, so movement
   * silently does nothing. Sending both is safe *for movement specifically*:
   * whichever mode the build is in ignores the other, and a direction that
   * arrives twice is still just that direction. Discrete keys stay touch-only.
   */
  handleKey(n, r) {
    if (!this.map) return "none";
    if (this.typing)
      return r && this.typingAuto && n === "Escape" && (this.setTyping(!1, "user"), this.onTypingEscape?.()), "none";
    const o = B4(n);
    if (!o) return "none";
    const l = this.controlsFor(o);
    if (!l.length) return "none";
    const u = o.toLowerCase();
    if (r) {
      if (this.held.has(u)) return "touch";
      this.held.add(u);
    } else
      this.held.delete(u);
    let f = !1;
    for (const { c: h, role: p } of l) {
      if (p === "KeySuspend" && h.type === "Pan") {
        this.pan.suspended = r, this.pan.active && this.sendTouch(
          r ? ua : Br,
          this.fingerFor(h),
          this.pan.x,
          this.pan.y
        );
        continue;
      }
      if (p === "KeyStartStop" && h.type === "Pan") {
        r && (this.pan.active ? this.panStop() : this.panStart(h));
        continue;
      }
      if (h.type === "Dpad" || h.type === "FreeLook") {
        this.updateDpad(h), f = !0;
        continue;
      }
      if (h.type === "Tap" && p === "Key") {
        const m = this.px(h);
        this.sendTouch(
          r ? Br : ua,
          this.fingerFor(h),
          m.x,
          m.y
        );
      }
    }
    return f ? "move" : "touch";
  }
  /** Releases everything. Called on blur and on teardown, so nothing sticks down. */
  releaseAll() {
    this.keepAlive && (clearInterval(this.keepAlive), this.keepAlive = null);
    for (const [n, r] of [...this.holding])
      this.sendTouch(ua, n, r.x, r.y);
    this.holding.clear(), this.fingers.clear(), this.rawDown.clear(), this.rawPending.clear(), this.pan.active && (this.pan.active = !1, this.pan.control = null, document.pointerLockElement && document.exitPointerLock());
    for (const n of this.dpads.values()) n.active = !1;
    this.held.clear();
  }
  // --- real touchscreen fingers ----------------------------------------------
  //
  // A phone or tablet player's own fingers. These must go out as TOUCHES, never
  // as the mouse frame: a Roblox build that sees a mouse flips to its
  // keyboard-and-mouse UI and hides the on-screen thumbstick, so the stick
  // cannot be grabbed at all — only tapped. Real touch points keep it in touch
  // mode, and each finger gets its own slot so stick + jump works together.
  /** A finger landed. Coordinates are stream pixels. */
  rawTouchDown(n, r, o) {
    this.rawDown.has(n) || (this.rawDown.add(n), this.sendTouch(Br, this.fingerFor(`ptr:${n}`), r, o));
  }
  /**
   * A finger moved. Coalesced to one batched frame per animation frame — a
   * touchscreen reports far faster than the picture can change.
   */
  rawTouchMove(n, r, o) {
    if (!this.rawDown.has(n)) return;
    const l = this.fingerFor(`ptr:${n}`);
    this.holding.set(l, { x: r, y: o }), this.rawPending.set(l, { x: r, y: o }), !this.rawQueued && (this.rawQueued = !0, requestAnimationFrame(() => {
      if (this.rawQueued = !1, !this.rawPending.size) return;
      const { w: u, h: f } = this.streamSize(), h = new Uint16Array(1 + 3 * this.rawPending.size);
      h[0] = Pl;
      let p = 1;
      for (const [m, g] of this.rawPending)
        h[p++] = m, h[p++] = Math.max(0, Math.min(u, Math.round(g.x))), h[p++] = Math.max(0, Math.min(f, Math.round(g.y)));
      this.rawPending.clear(), this.send(h.buffer);
    }));
  }
  /** A finger lifted, or the browser cancelled it. */
  rawTouchUp(n, r, o) {
    if (!this.rawDown.delete(n)) return;
    const l = this.fingerFor(`ptr:${n}`), u = this.holding.get(l);
    this.sendTouch(ua, l, r ?? u?.x ?? 0, o ?? u?.y ?? 0);
  }
}
const Ky = [
  {
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun.cloudflare.com:3478"
    ]
  },
  {
    urls: [
      "turn:openrelay.metered.ca:80",
      "turn:openrelay.metered.ca:443",
      "turn:openrelay.metered.ca:443?transport=tcp",
      "turns:openrelay.metered.ca:443"
    ],
    username: "openrelayproject",
    credential: "openrelayproject"
  }
];
function $l(a) {
  if (!a) return !1;
  for (const n of a) {
    const r = Array.isArray(n.urls) ? n.urls : [n.urls];
    for (const o of r) if (/^turns?:/i.test(String(o))) return !0;
  }
  return !1;
}
function H4(a) {
  const n = $l(a.iceServers);
  let r = null;
  try {
    r = localStorage.getItem("ng-relay");
  } catch {
  }
  return r === "0" ? null : a.relayVia === "edge" && $l(a.edgeServers) ? "own" : r === "cf" ? $l(a.edgeServers) ? "own" : null : r === "1" ? n ? "ng" : null : n && (a.preferRelay ?? !0) ? "ng" : null;
}
function P4(a) {
  return a.iceServers && a.iceServers.length ? a.iceServers : $l(a.edgeServers) ? [Ky[0], ...a.edgeServers] : Ky;
}
function Y4(a, n) {
  return a.iceGatheringState === "complete" ? Promise.resolve() : new Promise((r) => {
    let o = !1;
    const l = () => {
      o || (o = !0, a.removeEventListener("icegatheringstatechange", u), clearTimeout(f), r());
    }, u = () => {
      a.iceGatheringState === "complete" && l();
    };
    a.addEventListener("icegatheringstatechange", u);
    const f = setTimeout(l, n);
  });
}
const K4 = 41, qy = 32767, Kn = {
  MOVE: 0,
  L_DOWN: 1,
  L_UP: 2,
  M_DOWN: 3,
  M_UP: 4,
  R_DOWN: 5,
  R_UP: 6,
  WHEEL: 11
}, Wi = { DOWN: 101, UP: 102 }, q4 = 103, F4 = 25e3, G4 = 12e3, I4 = [Kn.L_DOWN, Kn.M_DOWN, Kn.R_DOWN], Fy = [Kn.L_UP, Kn.M_UP, Kn.R_UP], X4 = 100, Gy = 3, W4 = 16, Q4 = 2e3;
function Z4(a) {
  let n = 32;
  try {
    const f = localStorage.getItem("ng-audio-kbps");
    f !== null && (n = Number(f));
  } catch {
  }
  if (!a || !Number.isFinite(n) || n <= 0) return a;
  const r = Math.round(n * 1e3), o = /a=rtpmap:(\d+) opus\/48000/i.exec(a)?.[1];
  if (!o) return a;
  const l = new RegExp(`^a=fmtp:${o} (.*)$`, "m"), u = l.exec(a);
  if (u) {
    const f = u[1].split(";").map((h) => h.trim()).filter((h) => h && !/^maxaveragebitrate=/i.test(h));
    return f.push(`maxaveragebitrate=${r}`), a.replace(l, `a=fmtp:${o} ${f.join(";")}`);
  }
  return a.replace(
    new RegExp(`^(a=rtpmap:${o} opus/48000[^\\r\\n]*)(\\r?\\n)`, "mi"),
    `$1$2a=fmtp:${o} maxaveragebitrate=${r}$2`
  );
}
const Iy = 4500;
function J4(a, n) {
  let r = null;
  try {
    const l = localStorage.getItem("ng-video-kbps");
    l !== null && (r = Number(l));
  } catch {
  }
  if (r === null) {
    const l = Math.round(
      (n.clientHeight || 1080) * (window.devicePixelRatio || 1)
    );
    r = l <= 800 ? 2500 : l <= 1200 ? 3500 : 4500;
  }
  if ((!Number.isFinite(r) || r <= 0 || r > Iy) && (r = Iy), !a) return a;
  const o = a.split(/(?=^m=)/m);
  for (let l = 0; l < o.length; l++) {
    if (!/^m=video/.test(o[l])) continue;
    const u = o[l].replace(/^b=(?:AS|TIAS):\d+\r?\n/gm, "");
    o[l] = u.replace(
      /^(m=video[^\r\n]*\r?\n(?:c=[^\r\n]*\r?\n)?)/,
      `$1b=AS:${r}\r
b=TIAS:${r * 1e3}\r
`
    );
  }
  return o.join("");
}
class $4 {
  constructor(n) {
    tt(this, "pc", null);
    tt(this, "control", null);
    tt(this, "keymap");
    tt(this, "opts");
    tt(this, "detachers", []);
    tt(this, "disposed", !1);
    tt(this, "scrollStep", X4);
    tt(this, "scrollAcc", 0);
    tt(this, "firstFrame");
    tt(this, "resolveFirstFrame");
    tt(this, "movePending", null);
    tt(this, "moveQueued", !1);
    /** True once a frame has actually been decoded — see connectionstatechange. */
    tt(this, "sawFrames", !1);
    /** Pending keep-alive report — see armAliveReport. */
    tt(this, "aliveTimer", null);
    /** Recurring stop-check — see startHeartbeat. */
    tt(this, "heartbeatTimer", null);
    /** True once the keep-alive has been sent, so it is sent at most once. */
    tt(this, "aliveSent", !1);
    /** Rolling decode diagnostic — see startDiagnostics. */
    tt(this, "statsTimer", null);
    this.opts = n, this.keymap = new V4(
      (r) => this.sendRaw(r),
      n.inputSurface,
      // Touch frames carry stream PIXELS, so the layer needs the live size —
      // read per call rather than captured, because it is 0 until the first
      // frame arrives and can change if the host re-negotiates.
      () => ({
        w: n.video.videoWidth || 1280,
        h: n.video.videoHeight || 720
      })
    ), this.keymap.onTypingEscape = () => n.onTypingChange?.(!1), this.firstFrame = new Promise((r) => {
      this.resolveFirstFrame = r;
    });
  }
  /**
   * The live peer, for the HUD's round-trip gauge. Read-only: the stats effect
   * calls getStats() on it and nothing else.
   */
  get peerConnection() {
    return this.pc;
  }
  // --- lifecycle ------------------------------------------------------------
  async start() {
    const { launch: n, video: r } = this.opts, o = H4(n), l = o === "ng" ? n.iceServers : o === "own" ? n.edgeServers : P4(n), u = new RTCPeerConnection(
      o ? { iceServers: l, iceTransportPolicy: "relay" } : { iceServers: l }
    );
    this.pc = u, o && this.opts.onStatus?.(
      o === "ng" ? "Connecting through the game's own server…" : "Connecting through the relay…"
    );
    const f = new MediaStream();
    u.addEventListener("track", (v) => {
      v.track && f.addTrack(v.track), r.srcObject !== f && (r.srcObject = f);
    }), u.addEventListener("datachannel", (v) => {
      const b = v.channel;
      if (b.label === "fileUpload" || b.label === "fileDownload") return;
      this.control = b;
      const k = () => this.sendRaw(
        `tabstatus::${document.visibilityState === "visible" ? "active" : "inactive"}`
      );
      b.onopen = k, b.readyState === "open" && k(), document.addEventListener("visibilitychange", k), this.detachers.push(
        () => document.removeEventListener("visibilitychange", k)
      ), b.onmessage = (E) => {
        typeof E.data == "string" && this.onControlMessage(E.data);
      };
    }), u.addEventListener("connectionstatechange", () => {
      this.disposed || u.connectionState === "failed" && this.opts.onError?.(
        new Error(
          this.sawFrames ? "The stream connection dropped." : "That session expired before the stream opened — launch again."
        )
      );
    }), this.opts.onStatus?.("Negotiating stream…"), await u.setRemoteDescription({ type: "offer", sdp: n.offerSdp });
    for (const v of n.iceCandidates)
      try {
        await u.addIceCandidate(v);
      } catch {
      }
    try {
      if (localStorage.getItem("ng-codec") !== "default") {
        const v = (k) => ["video/av1", "video/vp9", "video/h265", "video/h264"].indexOf(
          k.toLowerCase()
        ), b = RTCRtpReceiver.getCapabilities?.("video")?.codecs ?? [];
        for (const k of u.getTransceivers()) {
          if (k.receiver.track?.kind !== "video" || !k.setCodecPreferences)
            continue;
          const E = [...b].sort((A, C) => {
            const M = v(A.mimeType), D = v(C.mimeType);
            return (M < 0 ? 99 : M) - (D < 0 ? 99 : D);
          });
          k.setCodecPreferences(E);
        }
      }
    } catch {
    }
    const h = await u.createAnswer();
    if (h.sdp = J4(
      Z4(h.sdp ?? ""),
      this.opts.video
    ), await u.setLocalDescription(h), /m=video[^\n]*\n(?:[^\n]*\n)*?a=rtpmap:\d+ ([^/\s]+)/.exec(
      h.sdp ?? ""
    )?.[1], this.disposed) return;
    await Y4(u, 4e3);
    const p = u.localDescription?.sdp || h.sdp;
    this.opts.onStatus?.("Starting playback…");
    const m = await fetch(oe("/api/cg/ng/answer"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        sessionId: this.opts.sessionId,
        answerSdp: p
      })
    }), g = await m.json().catch(() => null);
    if (!m.ok || !g?.ok)
      throw new Error(g?.error || "Could not complete the handshake.");
    this.watchForFirstFrame(), this.startDiagnostics(), this.armAliveReport(), this.startHeartbeat(), this.attachInput(), this.loadKeymap();
  }
  /**
   * Prints what the decode path is actually doing, once every two seconds.
   *
   * A choppy picture has several unrelated causes that look identical from the
   * outside — the host encoding slowly, the network losing packets, or the
   * browser dropping frames it received fine — and guessing between them wastes
   * far more time than measuring. Each line carries the three separately:
   *
   *   recv/dec/drop  frames the wire delivered, the decoder finished, and the
   *                  compositor threw away. recv low = it is the host or the
   *                  network; drop high = it is this machine.
   *   loss/nack/pli  packets lost, retransmits asked for, keyframes demanded.
   *                  A high pli with a low fps is the classic loss spiral: the
   *                  decoder cannot use anything until the next keyframe, so
   *                  the picture updates once per keyframe interval — which
   *                  looks exactly like one frame per second.
   *   pair           which ICE path won and its round trip.
   *
   * Two seconds is slow enough to cost nothing and quick enough to catch a
   * stall while it is happening. Silence it with localStorage ng-quiet=1.
   */
  startDiagnostics() {
    try {
      if (localStorage.getItem("ng-quiet") === "1") return;
    } catch {
    }
    const n = {};
    this.statsTimer = setInterval(async () => {
      const r = this.pc;
      if (!r || this.disposed) return;
      let o = null, l = null;
      const u = /* @__PURE__ */ new Map();
      try {
        (await r.getStats()).forEach((k) => {
          u.set(String(k.id), k), k.type === "inbound-rtp" && k.kind === "video" ? o = k : k.type === "candidate-pair" && (k.nominated === !0 || k.state === "succeeded") && (l = k);
        });
      } catch {
        return;
      }
      if (!o) return;
      const f = o, h = (k) => Number(f[k] ?? 0), p = (k) => {
        const E = h(k), A = n[k] ?? E;
        return n[k] = E, E - A;
      }, m = 2, g = Math.round(p("bytesReceived") * 8 / 1e3 / m), v = l ?? {}, b = (k) => {
        const E = u.get(String(k)), A = String(E?.candidateType ?? "?");
        return A === "relay" && E?.relayProtocol ? `relay/${E.relayProtocol}` : A;
      };
      `${Math.round(p("framesReceived") / m)}${Math.round(p("framesDecoded") / m)}${Math.round(p("framesDropped") / m)}${h("frameWidth")}${h("frameHeight")}${g}${p("packetsLost")}${p("nackCount")}${p("pliCount")}${p("freezeCount")}${p("totalFreezesDuration").toFixed(2)}${b(v.localCandidateId)}${b(v.remoteCandidateId)}${Math.round(Number(v.currentRoundTripTime ?? 0) * 1e3)}${Math.round(Number(v.availableIncomingBitrate ?? 0) / 1e3)}`;
    }, 2e3), this.statsTimer.unref?.();
  }
  /**
   * Resolves once frames are genuinely arriving.
   *
   * The handshake completing says nothing about whether there is a picture, so
   * clearing a loading overlay on it drops the player onto a black screen.
   */
  waitForFirstFrame(n) {
    return Promise.race([
      this.firstFrame,
      new Promise(
        (r, o) => setTimeout(
          () => o(
            new Error("The cloud server didn't start the stream in time.")
          ),
          n
        )
      )
    ]);
  }
  cancelAliveReport() {
    this.aliveTimer && clearTimeout(this.aliveTimer), this.aliveTimer = null, this.aliveSent = !0;
  }
  /**
   * Check in with the server every few seconds. When it answers `stop` (the
   * session was ended by an admin, or is gone), tear the stream down at once —
   * the reliable kill, since revoking the CF-TURN credential leaves an already
   * open relay carrying media until its next refresh.
   */
  startHeartbeat() {
    this.heartbeatTimer || (this.heartbeatTimer = setInterval(() => {
      this.disposed || fetch(oe("/api/cg/school/report"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId: this.opts.sessionId })
      }).then((n) => n.ok ? n.json() : null).then((n) => {
        this.disposed || !n?.stop || (this.cancelHeartbeat(), this.cancelAliveReport(), this.opts.onEnded?.("ended by host"));
      }).catch(() => {
      });
    }, G4));
  }
  cancelHeartbeat() {
    this.heartbeatTimer && clearInterval(this.heartbeatTimer), this.heartbeatTimer = null;
  }
  dispose() {
    if (!this.disposed) {
      this.disposed = !0, this.statsTimer && clearInterval(this.statsTimer), this.statsTimer = null, this.cancelAliveReport(), this.cancelHeartbeat(), this.keymap.releaseAll();
      for (const n of this.detachers.splice(0)) n();
      try {
        this.control?.close();
      } catch {
      }
      try {
        this.pc?.close();
      } catch {
      }
      this.pc = null, this.control = null;
    }
  }
  // --- settings the HUD drives ---------------------------------------------
  /**
   * Manual override for a text field the game never announces. The automatic
   * path is `onControlMessage` below, driven by the game itself.
   */
  setTyping(n) {
    this.keymap.setTyping(n), this.opts.onTypingChange?.(n);
  }
  isTyping() {
    return this.keymap.isTyping();
  }
  /**
   * Types a string into the game, one UTF-16 code unit per frame.
   *
   * This is the only way text gets in: the host takes characters as opcode-103
   * frames, not as keystrokes, so a clipboard paste has to be replayed
   * character by character. Paced a frame apart because the Android side drops
   * units that arrive faster than it can consume them — a burst of fifty
   * arrives as a handful of letters.
   *
   * Bounded, because a stray paste of a whole document would otherwise spend
   * minutes dribbling into a text field with no way to stop it.
   */
  async typeText(n) {
    if (!this.ready()) return 0;
    const r = [...String(n)].slice(0, Q4);
    let o = 0;
    for (const l of r) {
      if (this.disposed || !this.ready()) break;
      l === `
` || l === "\r" ? (this.sendKey(Wi.DOWN, 13, 0), this.sendKey(Wi.UP, 13, 0)) : this.sendText(l), o += 1, await new Promise((u) => setTimeout(u, W4));
    }
    return o;
  }
  /** Reads the clipboard and types it. Needs a user gesture for permission. */
  async pasteFromClipboard() {
    try {
      const n = await navigator.clipboard.readText();
      return n ? await this.typeText(n) : 0;
    } catch {
      return 0;
    }
  }
  /**
   * Brings the running game back to the foreground.
   *
   * `backtogame` is one of the host's own control-channel verbs. It exists
   * because these are whole Android instances, not just a game surface: the app
   * can put something else in front of itself — a store page, a browser, a
   * permission dialog, or just the launcher after an Android back press — and
   * from the player's side the stream is then showing the wrong thing with no
   * obvious way out. There is no Android "home" for them to press.
   *
   * Returns false when the control channel is not open, so the caller can keep
   * the button out of the way until the game can actually receive it.
   */
  backToGame() {
    return this.sendRaw("backtogame");
  }
  /** True once the game's control channel is open and taking commands. */
  get controlReady() {
    return this.ready();
  }
  setScrollStep(n) {
    n > 0 && (this.scrollStep = n, this.scrollAcc = 0);
  }
  /**
   * Autoplay only ever grants a muted stream, so unmuting needs a real user
   * gesture — a HUD click is one.
   */
  setSoundEnabled(n) {
    const r = this.opts.video;
    r.muted = !n, n && r.play().catch(() => {
    });
  }
  // --- control channel ------------------------------------------------------
  sendRaw(n) {
    const r = this.control;
    if (!r || r.readyState !== "open") return !1;
    try {
      return r.send(n), !0;
    } catch {
      return !1;
    }
  }
  ready() {
    return this.control?.readyState === "open";
  }
  /** The game's "key=value:::key=value" messages. */
  onControlMessage(n) {
    const r = {};
    for (const l of n.split(":::")) {
      const u = l.indexOf("=");
      u > 0 && (r[l.slice(0, u)] = l.slice(u + 1));
    }
    if (r.msgType === "keyboardStatus") {
      const l = String(r.enabled) === "true";
      this.keymap.setTyping(l, "host"), this.opts.onTypingChange?.(l);
      return;
    }
    if (r.msgType !== "sessionComplete") return;
    const o = r.reason || "Unknown";
    this.cancelAliveReport(), fetch(oe("/api/cg/ng/report"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        sessionId: this.opts.sessionId,
        // A reasonless ending carries its cause elsewhere in the message, so
        // report the message itself (the server logs the first 120 chars).
        reason: r.reason ? o : `Unknown ${n.slice(0, 110)}`
      })
    }).catch(() => {
    }), this.opts.onEnded?.(o);
  }
  /** Int32 frame: [opcode, ...args]. */
  frame(n, r) {
    const o = new ArrayBuffer(4 + 4 * r.length), l = new Int32Array(o);
    l[0] = n;
    for (let u = 0; u < r.length; u += 1) l[u + 1] = r[u];
    return o;
  }
  sendMouse(n, r, o, l = 0) {
    return this.sendRaw(this.frame(K4, [n, r, o, l]));
  }
  /** 4-byte key frame: [type, 1, keyCode, mods]. */
  sendKey(n, r, o = 0) {
    const l = new ArrayBuffer(4), u = new Uint8Array(l);
    return u[0] = n, u[1] = 1, u[2] = r, u[3] = o, this.sendRaw(l);
  }
  /** 6-byte text frame: opcode 103 then one UTF-16 code unit. */
  sendText(n) {
    const r = new ArrayBuffer(6), o = new Uint8Array(r), l = new Uint16Array([n.codePointAt(0) ?? 0]), u = new Uint8Array(l.buffer);
    return o[0] = q4, o[4] = u[0], o[5] = u[1], this.sendRaw(r);
  }
  /**
   * Android meta state, not a bit order of our own choosing: shift is 0x01 and
   * alt is 0x02. Ctrl is 0x1000 and does not fit the byte, so it is dropped
   * rather than aliased onto another modifier — a wrong modifier is worse than
   * a missing one.
   */
  modifiers(n) {
    return (n.shiftKey ? 1 : 0) | (n.altKey ? 2 : 0);
  }
  /**
   * One keyboard event, routed the way the host routes it:
   *
   *   named key, or keyboard closed  -> 4-byte keycode frame
   *   printable char, keyboard open  -> 6-byte text frame with the character
   *
   * The keycode is the legacy `event.which || event.keyCode`, not an Android
   * KEYCODE_* constant. And printable characters are not sent as keycodes at
   * all — which is why typing produces nothing however complete a keycode
   * table gets.
   */
  sendKeyEvent(n, r) {
    const o = n.key;
    if (!o || o === "Unidentified") return;
    const l = n.which ?? n.keyCode;
    if (!(l === 229 || n.isComposing)) {
      if (o.length > 1 || !this.keymap.isTyping()) {
        this.sendKey(r, l, this.modifiers(n));
        return;
      }
      r === Wi.DOWN && this.sendText(o);
    }
  }
  // --- coordinates ----------------------------------------------------------
  /**
   * Viewport coordinates -> the stream's own space.
   *
   * `object-fit: contain` letterboxes the picture, so the element's box is not
   * the picture's box — mapping a click without undoing that puts every
   * coordinate out by the size of the bars.
   */
  toStreamCoords(n) {
    const r = this.opts.video, o = r.getBoundingClientRect(), l = r.videoWidth || o.width, u = r.videoHeight || o.height, f = Math.min(o.width / l, o.height / u), h = (o.width - l * f) / 2, p = (o.height - u * f) / 2, m = (n.clientX - o.left - h) / f, g = (n.clientY - o.top - p) / f, v = m >= 0 && g >= 0 && m <= l && g <= u;
    return {
      x: Math.round(Math.max(0, Math.min(l, m)) / l * qy),
      y: Math.round(Math.max(0, Math.min(u, g)) / u * qy),
      inside: v
    };
  }
  /**
   * Viewport coordinates -> stream PIXELS, the space touch frames carry.
   * Same letterbox undo as toStreamCoords.
   */
  toStreamPixels(n) {
    const r = this.opts.video, o = r.getBoundingClientRect(), l = r.videoWidth || o.width, u = r.videoHeight || o.height, f = Math.min(o.width / l, o.height / u), h = (o.width - l * f) / 2, p = (o.height - u * f) / 2, m = (n.clientX - o.left - h) / f, g = (n.clientY - o.top - p) / f;
    return {
      x: Math.max(0, Math.min(l, m)),
      y: Math.max(0, Math.min(u, g)),
      inside: m >= 0 && g >= 0 && m <= l && g <= u
    };
  }
  // --- input ----------------------------------------------------------------
  on(n, r, o, l) {
    const u = o;
    n.addEventListener(r, u, l), this.detachers.push(() => n.removeEventListener(r, u, l));
  }
  attachInput() {
    const n = this.opts.inputSurface, r = n.style.touchAction;
    n.style.touchAction = "none", this.detachers.push(() => {
      n.style.touchAction = r;
    });
    const o = (h) => {
      h.cancelable && h.preventDefault();
    };
    this.on(n, "touchstart", o, { passive: !1 }), this.on(n, "touchmove", o, { passive: !1 });
    const l = (h) => h.pointerType !== "mouse", u = () => this.keymap.touchDriven(), f = (h) => {
      const p = this.toStreamPixels(h);
      this.keymap.rawTouchUp(h.pointerId, p.x, p.y);
      try {
        n.releasePointerCapture(h.pointerId);
      } catch {
      }
    };
    this.on(n, "pointercancel", (h) => {
      if (l(h) || this.keymap.isRawDown(h.pointerId)) {
        f(h);
        return;
      }
      if (this.ready()) {
        const p = this.toStreamCoords(h);
        this.sendMouse(Fy[h.button] ?? Kn.L_UP, p.x, p.y);
      }
    }), this.on(n, "pointerdown", (h) => {
      if (!this.ready()) return;
      if (l(h)) {
        const g = this.toStreamPixels(h);
        if (!g.inside) return;
        h.preventDefault();
        try {
          n.setPointerCapture(h.pointerId);
        } catch {
        }
        this.keymap.rawTouchDown(h.pointerId, g.x, g.y);
        return;
      }
      const p = h.button === 2 ? this.keymap.panControl() : null;
      if (p) {
        h.preventDefault(), this.keymap.panStart(p);
        return;
      }
      if (u()) {
        if (h.button !== 0) return;
        const g = this.toStreamPixels(h);
        if (!g.inside) return;
        h.preventDefault(), n.setPointerCapture(h.pointerId), this.keymap.rawTouchDown(h.pointerId, g.x, g.y);
        return;
      }
      const m = this.toStreamCoords(h);
      m.inside && (h.preventDefault(), n.setPointerCapture(h.pointerId), this.sendMouse(Kn.MOVE, m.x, m.y), this.sendMouse(I4[h.button] ?? Kn.L_DOWN, m.x, m.y));
    }), this.on(n, "pointerup", (h) => {
      if (l(h)) {
        h.preventDefault(), f(h);
        return;
      }
      if (!this.ready()) return;
      if (h.button === 2 && this.keymap.isPanning()) {
        h.preventDefault(), this.keymap.panStop();
        return;
      }
      if (this.keymap.isRawDown(h.pointerId)) {
        h.preventDefault(), h.button === 0 && f(h);
        return;
      }
      if (u()) return;
      const p = this.toStreamCoords(h);
      h.preventDefault(), this.sendMouse(Fy[h.button] ?? Kn.L_UP, p.x, p.y);
      try {
        n.releasePointerCapture(h.pointerId);
      } catch {
      }
    }), this.on(n, "pointermove", (h) => {
      if (!this.ready()) return;
      if (l(h)) {
        const m = this.toStreamPixels(h);
        this.keymap.rawTouchMove(h.pointerId, m.x, m.y);
        return;
      }
      if (this.keymap.isPanning()) {
        this.keymap.panMove(h.movementX || 0, h.movementY || 0);
        return;
      }
      if (this.keymap.isRawDown(h.pointerId)) {
        if (!(h.buttons & 1)) {
          f(h);
          return;
        }
        const m = this.toStreamPixels(h);
        this.keymap.rawTouchMove(h.pointerId, m.x, m.y);
        return;
      }
      if (u()) return;
      const p = this.toStreamCoords(h);
      p.inside && (this.movePending = p, !this.moveQueued && (this.moveQueued = !0, requestAnimationFrame(() => {
        this.moveQueued = !1;
        const m = this.movePending;
        this.movePending = null, m && this.ready() && this.sendMouse(Kn.MOVE, m.x, m.y);
      })));
    }), this.on(
      n,
      "wheel",
      (h) => {
        if (!this.ready()) return;
        const p = this.toStreamCoords(h);
        if (!p.inside) return;
        h.preventDefault();
        const m = h.deltaMode === 1 ? h.deltaY * 16 : h.deltaMode === 2 ? h.deltaY * 800 : h.deltaY;
        this.scrollAcc += m;
        let g = Math.trunc(this.scrollAcc / this.scrollStep);
        if (!g) return;
        this.scrollAcc -= g * this.scrollStep, g = Math.max(-Gy, Math.min(Gy, g));
        const v = g > 0 ? -1 : 1;
        for (let b = 0; b < Math.abs(g); b += 1)
          this.sendMouse(Kn.WHEEL, p.x, p.y, v);
      },
      { passive: !1 }
    ), this.on(n, "contextmenu", (h) => h.preventDefault()), this.on(window, "paste", (h) => {
      if (!this.ready()) return;
      const p = h.clipboardData?.getData("text");
      p && (h.preventDefault(), this.typeText(p));
    }), this.on(window, "keydown", (h) => {
      if (this.ready() && !((h.ctrlKey || h.metaKey) && h.key.toLowerCase() === "v") && !(h.metaKey || h.ctrlKey && !this.keymap.isTyping())) {
        if (this.keymap.handleKey(h.code, !0) !== "none") {
          h.preventDefault();
          return;
        }
        h.preventDefault(), this.sendKeyEvent(h, Wi.DOWN);
      }
    }), this.on(window, "keyup", (h) => {
      if (this.ready() && !h.metaKey) {
        if (this.keymap.handleKey(h.code, !1) !== "none") {
          h.preventDefault();
          return;
        }
        h.preventDefault(), this.sendKeyEvent(h, Wi.UP);
      }
    }), this.on(window, "blur", () => this.keymap.releaseAll()), this.on(document, "pointerlockchange", () => {
      !document.pointerLockElement && this.keymap.isPanning() && this.keymap.panStop();
    });
  }
  /** Presses one on-screen control button, down the same path a real key takes. */
  pressKey(n, r) {
    if (!this.ready() || this.keymap.handleKey(n, r) !== "none") return;
    const o = t6[n];
    o && this.sendKey(r ? Wi.DOWN : Wi.UP, o, 0);
  }
  // --- keymap ---------------------------------------------------------------
  async loadKeymap() {
    try {
      const n = await fetch(
        oe(`/api/cg/ng/keymap?sessionId=${encodeURIComponent(this.opts.sessionId)}`),
        { credentials: "include", cache: "no-store" }
      ), r = await n.json();
      if (!n.ok || !r.ok || !r.keymap)
        throw new Error("no control scheme");
      if (this.disposed) return;
      this.keymap.setKeymap(r.keymap);
      return;
    } catch {
      this.keymap.setKeymap(null);
    }
  }
  hasControls() {
    return this.keymap.hasKeymap();
  }
  // --- first frame ----------------------------------------------------------
  /**
   * Tells the server, once, that this stream outlived the region check.
   *
   * The server cannot observe this. `startSession` succeeding over HTTP proves
   * only that the upstream was willing to allocate a machine; whether it will
   * keep it is decided afterwards, by comparing where the WebRTC media came
   * from against where the session request came from, and announced here on
   * the control channel as a teardown several seconds after the picture
   * appears. A stream still running after that window is the only positive
   * evidence that exists that the exit the session was allocated from actually
   * matches this player — so it is what promotes that address in the server's
   * cache, rather than the HTTP success that used to.
   *
   * Waits for a real frame first: the clock has to start when media actually
   * begins flowing, because that is when the upstream starts checking. Arming
   * it at the handshake would let a stream that never produced a picture
   * report itself healthy.
   *
   * One request, fire and forget. A failure to send means the address simply
   * stays unproven for its shorter lifetime, which is the safe direction.
   */
  armAliveReport() {
    this.firstFrame.then(() => {
      this.disposed || this.aliveSent || (this.aliveTimer = setTimeout(() => {
        this.aliveTimer = null, !(this.disposed || this.aliveSent) && (this.aliveSent = !0, fetch(oe("/api/cg/ng/report"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sessionId: this.opts.sessionId, alive: !0 })
        }).catch(() => {
        }));
      }, F4));
    });
  }
  watchForFirstFrame() {
    const n = this.opts.video, r = n.requestVideoFrameCallback, o = () => {
      this.sawFrames = !0, this.resolveFirstFrame();
    };
    if (typeof r == "function") {
      r.call(n, o);
      return;
    }
    this.on(n, "playing", o);
  }
}
const t6 = {
  KeyW: 87,
  KeyA: 65,
  KeyS: 83,
  KeyD: 68,
  Space: 32,
  ShiftLeft: 16
};
async function e6(a) {
  const n = new $4(a);
  return await n.start(), n;
}
const n6 = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
  "stun:stun2.l.google.com:19302",
  // A second, independent operator so a network that blocks or drops Google's
  // STUN (some schools and corporate filters do exactly that) still resolves a
  // reflexive address instead of falling all the way back to the request IP.
  "stun:stun.cloudflare.com:3478"
], M1 = 3500, a6 = 2, Xy = 2, i6 = 2500, r6 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
function Df(a) {
  if (!r6.test(a)) return !1;
  const [n, r] = a.split(".").map(Number);
  return !(n === 10 || n === 127 || n === 0 || n === 192 && r === 168 || n === 172 && r >= 16 && r <= 31 || n === 100 && r >= 64 && r <= 127 || n === 169 && r === 254 || n >= 224);
}
function o6(a) {
  if (a.type && a.type !== "srflx") return null;
  const n = a.address ?? "";
  if (n && Df(n)) return n;
  const o = a.candidate?.match(
    /candidate:\S+ \d+ udp \d+ (\S+) \d+ typ srflx/i
  )?.[1] ?? "";
  return o && Df(o) ? o : null;
}
function s6(a) {
  const n = a.split(".").map(Number);
  return (n[0] << 24 >>> 0) + (n[1] << 16) + (n[2] << 8) + n[3];
}
async function R1(a) {
  try {
    const n = `${a.split(".")[0]}.`, r = await fetch(
      oe(`/api/cg/ng/asn-ranges?prefix=${encodeURIComponent(n)}`),
      { signal: AbortSignal.timeout(i6) }
    );
    if (!r.ok) return null;
    const o = await r.json(), l = o?.ranges, u = Array.isArray(o?.countries) ? o.countries : [];
    if (!o.ok || !Array.isArray(l) || l.length % 4 !== 0)
      return null;
    const f = s6(a);
    let h = 0, p = l.length / 4 - 1;
    for (; h <= p; ) {
      const m = h + p >>> 1, g = l[m * 4], v = l[m * 4 + 1];
      if (g > f) p = m - 1;
      else if (v < f) h = m + 1;
      else {
        const b = u[l[m * 4 + 3]];
        return {
          asn: String(l[m * 4 + 2]),
          ...typeof b == "string" && b ? { cc: b } : {},
          net: [g, v]
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}
function Wy() {
  if (typeof RTCPeerConnection > "u") return Promise.resolve([]);
  let a = null;
  try {
    a = new RTCPeerConnection({
      iceServers: [{ urls: n6 }],
      iceCandidatePoolSize: 0
    });
  } catch {
    return Promise.resolve([]);
  }
  const n = a;
  return new Promise((r) => {
    const o = [];
    let l = !1;
    const u = () => {
      if (!l) {
        l = !0, clearTimeout(f);
        try {
          n.close();
        } catch {
        }
        r(o);
      }
    }, f = setTimeout(u, M1);
    n.addEventListener("icecandidate", (h) => {
      if (!h.candidate) {
        u();
        return;
      }
      const p = o6(h.candidate);
      p && !o.includes(p) && o.push(p);
    }), n.addEventListener("icegatheringstatechange", () => {
      n.iceGatheringState === "complete" && u();
    }), n.createDataChannel("probe"), n.createOffer().then((h) => n.setLocalDescription(h)).catch(u);
  });
}
function Nf(a) {
  const n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  let l = 0;
  for (const f of a) {
    const h = /* @__PURE__ */ new Set();
    for (const p of f)
      r.set(p, (r.get(p) ?? 0) + 1), o.has(p) || o.set(p, l++), h.has(p) || (h.add(p), n.set(p, (n.get(p) ?? 0) + 1));
  }
  let u = null;
  for (const f of o.keys()) {
    if (u === null) {
      u = f;
      continue;
    }
    const h = n.get(u), p = n.get(f);
    (p > h || p === h && r.get(f) > r.get(u)) && (u = f);
  }
  return { ip: u, agree: u ? n.get(u) : 0 };
}
const l6 = 300 * 1e3, C1 = "ng-webrtc-probe";
function c6() {
  try {
    const a = sessionStorage.getItem(C1);
    if (!a) return null;
    const n = JSON.parse(a);
    return !n || typeof n.at != "number" || Date.now() - n.at > l6 ? null : n;
  } catch {
    return null;
  }
}
function u6(a) {
  try {
    sessionStorage.setItem(
      C1,
      JSON.stringify({ at: Date.now(), probe: a })
    );
  } catch {
  }
}
async function d6() {
  if (typeof RTCPeerConnection > "u") return null;
  const a = await Promise.all(
    Array.from({ length: a6 }, () => Wy())
  );
  let { ip: n, agree: r } = Nf(a);
  if (n && r < 2 && Xy > 0) {
    const l = await Promise.all(
      Array.from({ length: Xy }, () => Wy())
    );
    ({ ip: n } = Nf([...a, ...l]));
  }
  if (!n) return null;
  const o = await R1(n);
  return {
    prefix: `${n.split(".")[0]}.`,
    ...o?.asn ? { asn: o.asn } : {},
    ...o?.cc ? { cc: o.cc } : {},
    ...o?.net ? { net: o.net } : {}
  };
}
async function f6() {
  const a = c6();
  if (a) return a.probe;
  const n = await d6();
  return u6(n), n;
}
function h6(a) {
  if (typeof RTCPeerConnection > "u") return Promise.resolve([]);
  let n;
  try {
    n = new RTCPeerConnection({ iceServers: a, iceTransportPolicy: "relay" });
  } catch {
    return Promise.resolve([]);
  }
  return new Promise((r) => {
    const o = [];
    let l = !1;
    const u = () => {
      if (!l) {
        l = !0, clearTimeout(f);
        try {
          n.close();
        } catch {
        }
        r(o);
      }
    }, f = setTimeout(u, M1);
    n.addEventListener("icecandidate", (h) => {
      if (!h.candidate) return u();
      const p = h.candidate;
      if (p.type && p.type !== "relay") return;
      const m = p.address ?? p.candidate?.match(
        /candidate:\S+ \d+ \S+ \d+ (\S+) \d+ typ relay/i
      )?.[1] ?? "";
      Df(m) && !o.includes(m) && o.push(m);
    }), n.createDataChannel("probe"), n.createOffer().then((h) => n.setLocalDescription(h)).catch(u);
  });
}
async function A1(a) {
  const { ip: n } = Nf([await h6(a)]);
  if (!n) return null;
  const r = await R1(n);
  return {
    prefix: `${n.split(".")[0]}.`,
    ...r?.asn ? { asn: r.asn } : {},
    ...r?.cc ? { cc: r.cc } : {},
    ...r?.net ? { net: r.net } : {}
  };
}
const p6 = 1280, m6 = 720, Qy = (a) => a / p6, Zy = (a) => a / m6, g6 = /* @__PURE__ */ new Set(["roblox"]), y6 = {
  v: 1,
  slots: [
    {
      // Sits over Roblox's own thumbstick (the xc config's left rocker centre).
      // No `kbd` → the pad drags a real touch from this point, deflecting the
      // stick underneath it.
      id: "move",
      type: "joystick",
      label: "Move",
      nx: Qy(162),
      ny: Zy(575),
      radius: 66
    },
    {
      // Roblox draws its jump button in the bottom-right. A pad with no key
      // code taps at its own position, so this presses the game's button.
      id: "jump",
      label: "Jump",
      nx: 0.9,
      ny: 0.82
    },
    { id: "esc", label: "Esc", nx: Qy(45), ny: Zy(45), androidKeyCode: 27 }
  ]
}, Zd = {
  roblox: y6
};
let j1 = null;
function Jy(a) {
  j1 = a;
}
function v6() {
  return j1 ?? document.body;
}
var b6 = cv();
async function w6(a) {
  const n = await fetch(
    `/api/cg/touch-keys?gameId=${encodeURIComponent(a)}`,
    { credentials: "include", cache: "no-store" }
  ), r = await n.json();
  return !n.ok || !r.ok ? null : r.layout ?? null;
}
async function x6(a, n) {
  const r = await fetch("/api/cg/touch-keys", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId: a, layout: n })
  });
  let o = {};
  try {
    o = await r.json();
  } catch {
  }
  return !r.ok || !o.ok ? {
    ok: !1,
    error: o.error || r.statusText || "Save failed"
  } : { ok: !0 };
}
const L1 = "astra-tc-touch-v1:", Jd = 280, $y = 100;
function Fr(a) {
  return {
    v: 1,
    slots: a.slots.map((n) => ({
      ...n,
      id: typeof n.id == "string" && n.id.trim() ? n.id.trim().slice(0, 40) : crypto.randomUUID().slice(0, 12)
    }))
  };
}
function S6(a) {
  try {
    const n = localStorage.getItem(`${L1}${a}`);
    if (!n) return null;
    const r = JSON.parse(n);
    return !r?.slots || !Array.isArray(r.slots) ? null : Fr({ v: 1, slots: r.slots });
  } catch {
    return null;
  }
}
function k6(a, n) {
  localStorage.setItem(
    `${L1}${a}`,
    JSON.stringify(Fr(n))
  );
}
function Vr(a) {
  return /^Key[A-Z]$/.test(a) ? a.charCodeAt(3) : /^Digit[0-9]$/.test(a) ? a.charCodeAt(5) : {
    Space: 32,
    ShiftLeft: 16,
    ShiftRight: 16,
    ControlLeft: 17,
    ControlRight: 17,
    AltLeft: 18,
    AltRight: 18,
    Enter: 13,
    Tab: 9,
    Backspace: 8,
    Escape: 27,
    ArrowUp: 38,
    ArrowDown: 40,
    ArrowLeft: 37,
    ArrowRight: 39
  }[a] ?? 0;
}
function T6(a) {
  const n = (r) => r.trim().replace(/^(Key|Digit|Arrow)/, "");
  return a.type === "joystick" ? `Keys · ${(a.kbd || "KeyW,KeyA,KeyS,KeyD").split(",").map(n).join(" ")}` : a.type === "mouse" ? a.mouseButton === "right" ? "Mouse · right" : "Mouse · left" : a.kbd ? `Key · ${n(a.kbd)}` : a.androidKeyCode != null ? `Key code ${a.androidKeyCode}` : "Screen tap";
}
function E6({
  session: a,
  gameId: n,
  videoRef: r,
  userId: o,
  panelOpen: l,
  onPanelChange: u
}) {
  const f = x.useRef(!1), [h, p] = x.useState({ v: 1, slots: [] }), [, m] = x.useReducer((O) => O + 1, 0), [g, v] = x.useState(null), [b, k] = x.useState(""), [E, A] = x.useState(null), [C, M] = x.useState(null), [D, R] = x.useState(Jd), [z, Z] = x.useState(!1), W = x.useRef(0), X = x.useRef(Jd), F = x.useCallback(() => {
    f.current = !0;
  }, []);
  x.useEffect(() => {
    l && (R(Jd), k(""));
  }, [l]), x.useEffect(() => {
    f.current = !1, v(null), k("");
  }, [n]), x.useEffect(() => {
    const O = new AbortController(), { signal: T } = O;
    return (async () => {
      if (o) {
        const Q = await w6(n);
        if (T.aborted || f.current) return;
        if (Q?.slots?.length) {
          p(Fr(Q));
          return;
        }
      }
      const _ = S6(n);
      if (T.aborted || f.current) return;
      if (_?.slots?.length) {
        p(_);
        return;
      }
      const B = Zd[n];
      p(B?.slots?.length ? Fr(B) : { v: 1, slots: [] });
    })(), () => O.abort();
  }, [n, o]), x.useEffect(() => {
    const O = r.current, T = () => m();
    O && O.addEventListener("loadedmetadata", T), window.addEventListener("resize", T);
    const _ = window.setInterval(T, 750);
    return () => {
      O && O.removeEventListener("loadedmetadata", T), window.removeEventListener("resize", T), window.clearInterval(_);
    };
  }, [r, n]);
  const at = !!Zd[n]?.slots?.length, rt = x.useCallback(() => {
    const O = Zd[n];
    O?.slots?.length && (F(), v(null), p(Fr(O)));
  }, [n, F]), pt = x.useCallback(async () => {
    k("");
    const O = Fr(h);
    if (p(O), k6(n, O), f.current = !1, o) {
      const T = await x6(n, O);
      k(T.ok ? "Saved." : T.error || "Save failed");
    } else
      k("Saved locally.");
  }, [n, h, o]), yt = x.useCallback(
    (O) => {
      if (a.isInputConnected) {
        if (O.type === "mouse") {
          const T = O.mouseButton === "right" ? "right" : "left";
          a.sendMouseButton(T, !0), window.setTimeout(() => a.sendMouseButton(T, !1), 72);
          return;
        }
        O.androidKeyCode != null && Number.isFinite(O.androidKeyCode) && O.androidKeyCode > 0 ? (a.sendAndroidKeyEvent(O.androidKeyCode, !0), window.setTimeout(
          () => a.sendAndroidKeyEvent(O.androidKeyCode, !1),
          72
        )) : a.tapStreamNorm(O.nx, O.ny);
      }
    },
    [a]
  ), vt = x.useCallback(
    (O, T) => {
      if (a.isInputConnected) {
        if (O.type === "mouse") {
          a.sendMouseButton(
            O.mouseButton === "right" ? "right" : "left",
            T
          );
          return;
        }
        O.androidKeyCode != null && Number.isFinite(O.androidKeyCode) && O.androidKeyCode > 0 ? a.sendAndroidKeyEvent(O.androidKeyCode, T) : a.sendMouseStreamNorm(O.nx, O.ny, T ? 1 : 2);
      }
    },
    [a]
  ), Tt = x.useRef(/* @__PURE__ */ new Set());
  x.useEffect(() => {
    const O = (_) => {
      if (l || Tt.current.has(_.code)) return;
      const B = h.slots.find((Q) => Q.kbd ? Q.kbd.split(",").map((ot) => ot.trim()).includes(_.code) : !1);
      B && (_.preventDefault(), _.stopImmediatePropagation(), Tt.current.add(_.code), B.type === "joystick" || (B.androidKeyCode != null && Number.isFinite(B.androidKeyCode) && B.androidKeyCode > 0 ? a.sendAndroidKeyEvent(B.androidKeyCode, !0) : yt(B)));
    }, T = (_) => {
      const B = h.slots.find((Q) => Q.kbd ? Q.kbd.split(",").map((ot) => ot.trim()).includes(_.code) : !1);
      B && (_.preventDefault(), _.stopImmediatePropagation(), B.type !== "joystick" && B.androidKeyCode != null && Number.isFinite(B.androidKeyCode) && B.androidKeyCode > 0 && a.sendAndroidKeyEvent(B.androidKeyCode, !1)), Tt.current.delete(_.code);
    };
    return document.addEventListener("keydown", O, !0), document.addEventListener("keyup", T, !0), () => {
      document.removeEventListener("keydown", O, !0), document.removeEventListener("keyup", T, !0);
    };
  }, [h.slots, l, yt, a]);
  const bt = x.useRef(/* @__PURE__ */ new Map());
  x.useEffect(() => {
    if (l) return;
    const O = bt.current, T = setInterval(() => {
      h.slots.forEach((_) => {
        if (_.type !== "joystick" || !_.kbd) return;
        const B = _.kbd.split(",").map((st) => st.trim());
        let Q = O.get(_.id);
        Q || (Q = /* @__PURE__ */ new Set(), O.set(_.id, Q));
        for (const st of B) {
          const ot = Vr(st);
          if (!ot) continue;
          const ht = Tt.current.has(st);
          ht && !Q.has(ot) ? (a.sendAndroidKeyEvent(ot, !0), Q.add(ot)) : !ht && Q.has(ot) && (a.sendAndroidKeyEvent(ot, !1), Q.delete(ot));
        }
      });
    }, 50);
    return () => {
      clearInterval(T), O.forEach((_) => {
        _.forEach((B) => a.sendAndroidKeyEvent(B, !1)), _.clear();
      });
    };
  }, [h.slots, l, a]);
  const Y = x.useMemo(
    () => h.slots.find((O) => O.id === g) ?? null,
    [h.slots, g]
  ), J = x.useCallback(() => {
    u(!1), v(null), k("");
  }, [u]), et = x.useCallback(
    (O) => {
      F(), p((T) => ({
        v: 1,
        slots: T.slots.filter((_) => _.id !== O)
      })), v((T) => T === O ? null : T);
    },
    [F]
  ), $ = x.useCallback(
    (O) => {
      O.preventDefault(), O.stopPropagation(), W.current = O.clientY, X.current = D, Z(!0);
      const T = (B) => {
        const Q = B.clientY - W.current, st = Math.round(window.innerHeight * 0.82);
        R(
          Math.min(st, Math.max($y, X.current - Q))
        );
      }, _ = (B) => {
        window.removeEventListener("pointermove", T), window.removeEventListener("pointerup", _), Z(!1), X.current - (B.clientY - W.current) < $y + 30 && J();
      };
      window.addEventListener("pointermove", T), window.addEventListener("pointerup", _);
    },
    [D, J]
  );
  return b6.createPortal(
    /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
      /* @__PURE__ */ S.jsx("style", { children: `
        .tc-scroll::-webkit-scrollbar { width: 4px; }
        .tc-scroll::-webkit-scrollbar-track { background: transparent; }
        .tc-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 9999px; }
        .tc-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }
        .tc-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
        .tc-field { transition: border-color 0.16s, box-shadow 0.16s, background 0.16s; }
        .tc-field:focus { border-color: rgba(59,130,246,0.55) !important; background: rgba(59,130,246,0.05) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.14); }
        .tc-field option { background: #12141f; color: #fff; }
      ` }),
      h.slots.map((O) => {
        const T = a.streamNormToClientPoint(O.nx, O.ny), _ = E === O.id;
        return /* @__PURE__ */ S.jsx(
          "div",
          {
            className: "fixed z-[9999] -translate-x-1/2 -translate-y-1/2 pointer-events-auto",
            style: { left: T.x, top: T.y },
            children: /* @__PURE__ */ S.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
              O.type === "joystick" ? /* @__PURE__ */ S.jsx(
                "div",
                {
                  className: "relative flex items-center justify-center rounded-full touch-none select-none",
                  style: {
                    width: (O.radius || 60) * 2,
                    height: (O.radius || 60) * 2,
                    background: "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.1) 0%, rgba(15,23,42,0.35) 70%)",
                    border: g === O.id ? "2px solid rgba(92,149,255,0.9)" : "1px solid rgba(255,255,255,0.22)",
                    boxShadow: "inset 0 0 30px rgba(0,0,0,0.35)",
                    backdropFilter: "blur(4px)",
                    cursor: l ? _ ? "grabbing" : "grab" : "pointer"
                  },
                  onPointerDown: (B) => {
                    if (B.stopPropagation(), !l) {
                      if (!a.isInputConnected) return;
                      B.preventDefault(), B.target.setPointerCapture(B.pointerId);
                      const ot = B.clientX, ht = B.clientY;
                      if (!O.kbd) {
                        const Ot = O.radius || 60;
                        a.sendMouseStreamNorm(O.nx, O.ny, 1);
                        const Te = ($e) => {
                          const An = Math.max(
                            -Ot,
                            Math.min(Ot, $e.clientX - ot)
                          ), sn = Math.max(
                            -Ot,
                            Math.min(Ot, $e.clientY - ht)
                          ), Ge = a.streamNormToClientPoint(
                            O.nx,
                            O.ny
                          ), Xn = a.clientToStreamNorm(
                            Ge.x + An,
                            Ge.y + sn
                          );
                          a.sendMouseStreamNorm(Xn.x, Xn.y, 3);
                        }, Cn = ($e) => {
                          const An = Math.max(
                            -Ot,
                            Math.min(Ot, $e.clientX - ot)
                          ), sn = Math.max(
                            -Ot,
                            Math.min(Ot, $e.clientY - ht)
                          ), Ge = a.streamNormToClientPoint(
                            O.nx,
                            O.ny
                          ), Xn = a.clientToStreamNorm(
                            Ge.x + An,
                            Ge.y + sn
                          );
                          a.sendMouseStreamNorm(Xn.x, Xn.y, 2), window.removeEventListener("pointermove", Te), window.removeEventListener("pointerup", Cn), window.removeEventListener("pointercancel", Cn);
                        };
                        window.addEventListener("pointermove", Te), window.addEventListener("pointerup", Cn), window.addEventListener("pointercancel", Cn);
                        return;
                      }
                      const Ht = O.kbd.split(",").map((Ot) => Ot.trim()), xt = /* @__PURE__ */ new Set(), Ze = (Ot, Te) => {
                        Ot && (Te && !xt.has(Ot) ? (a.sendAndroidKeyEvent(Ot, !0), xt.add(Ot)) : !Te && xt.has(Ot) && (a.sendAndroidKeyEvent(Ot, !1), xt.delete(Ot)));
                      };
                      let Ke = 0, Je = 0;
                      const on = O.radius || 60, qe = (Ot) => {
                        document.pointerLockElement ? (Ke = Math.max(
                          -on,
                          Math.min(on, Ke + (Ot.movementX || 0))
                        ), Je = Math.max(
                          -on,
                          Math.min(on, Je + (Ot.movementY || 0))
                        )) : (Ke = Ot.clientX - ot, Je = Ot.clientY - ht);
                        const Te = 16;
                        Ze(Vr(Ht[0]), Je < -Te), Ze(Vr(Ht[1]), Ke < -Te), Ze(Vr(Ht[2]), Je > Te), Ze(Vr(Ht[3]), Ke > Te);
                      }, Fe = () => {
                        xt.forEach(
                          (Ot) => a.sendAndroidKeyEvent(Ot, !1)
                        ), xt.clear(), window.removeEventListener("pointermove", qe), window.removeEventListener("pointerup", Fe), window.removeEventListener("pointercancel", Fe);
                      };
                      window.addEventListener("pointermove", qe), window.addEventListener("pointerup", Fe), window.addEventListener("pointercancel", Fe);
                      return;
                    }
                    v(O.id), A(O.id), B.target.setPointerCapture(B.pointerId);
                    const Q = (ot) => {
                      const ht = a.clientToStreamNorm(
                        ot.clientX,
                        ot.clientY
                      );
                      F(), p((Ht) => ({
                        v: 1,
                        slots: Ht.slots.map(
                          (xt) => xt.id === O.id ? { ...xt, nx: ht.x, ny: ht.y } : xt
                        )
                      }));
                    }, st = (ot) => {
                      A(null), B.target.releasePointerCapture(
                        ot.pointerId
                      ), window.removeEventListener("pointermove", Q), window.removeEventListener("pointerup", st);
                    };
                    window.addEventListener("pointermove", Q), window.addEventListener("pointerup", st);
                  },
                  children: /* @__PURE__ */ S.jsx(
                    "div",
                    {
                      className: "absolute flex h-11 w-11 items-center justify-center rounded-full text-[10px] font-bold text-white/80",
                      style: {
                        background: "linear-gradient(180deg, rgba(59,130,246,0.35), rgba(59,130,246,0.12))",
                        border: "1px solid rgba(120,170,255,0.45)",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)"
                      },
                      children: O.label
                    }
                  )
                }
              ) : /* @__PURE__ */ S.jsx(
                "button",
                {
                  type: "button",
                  className: "flex h-12 w-12 touch-none items-center justify-center rounded-full text-xs font-semibold select-none",
                  style: {
                    background: C === O.id ? "rgba(59,130,246,0.55)" : "rgba(15,23,42,0.55)",
                    border: g === O.id ? "2px solid rgba(92,149,255,0.95)" : "1px solid rgba(255,255,255,0.28)",
                    color: "#fff",
                    boxShadow: C === O.id ? "0 0 22px rgba(59,130,246,0.55), inset 0 1px 0 rgba(255,255,255,0.18)" : "0 6px 18px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
                    backdropFilter: "blur(6px)",
                    transition: "background 0.1s, box-shadow 0.1s, border-color 0.1s",
                    cursor: l ? _ ? "grabbing" : "grab" : "pointer"
                  },
                  onContextMenu: (B) => B.preventDefault(),
                  onPointerDown: (B) => {
                    if (B.stopPropagation(), !l) {
                      if (!a.isInputConnected) return;
                      B.preventDefault(), B.currentTarget.setPointerCapture(
                        B.pointerId
                      ), M(O.id), vt(O, !0);
                      const ot = () => {
                        vt(O, !1), M((ht) => ht === O.id ? null : ht), window.removeEventListener("pointerup", ot), window.removeEventListener("pointercancel", ot);
                      };
                      window.addEventListener("pointerup", ot), window.addEventListener("pointercancel", ot);
                      return;
                    }
                    v(O.id), A(O.id), B.target.setPointerCapture(B.pointerId);
                    const Q = (ot) => {
                      const ht = a.clientToStreamNorm(
                        ot.clientX,
                        ot.clientY
                      );
                      F(), p((Ht) => ({
                        v: 1,
                        slots: Ht.slots.map(
                          (xt) => xt.id === O.id ? { ...xt, nx: ht.x, ny: ht.y } : xt
                        )
                      }));
                    }, st = (ot) => {
                      A(null), B.target.releasePointerCapture(
                        ot.pointerId
                      ), window.removeEventListener("pointermove", Q), window.removeEventListener("pointerup", st);
                    };
                    window.addEventListener("pointermove", Q), window.addEventListener("pointerup", st);
                  },
                  children: O.label
                }
              ),
              l && /* @__PURE__ */ S.jsx(
                "button",
                {
                  type: "button",
                  "aria-label": `Remove ${O.label}`,
                  className: "flex h-5 w-5 items-center justify-center rounded-full transition-transform hover:scale-110",
                  style: {
                    background: "rgba(220,50,50,0.9)",
                    border: "1px solid rgba(255,120,120,0.45)",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
                  },
                  onPointerDown: (B) => B.stopPropagation(),
                  onClick: (B) => {
                    B.stopPropagation(), et(O.id);
                  },
                  children: /* @__PURE__ */ S.jsx("svg", { width: "8", height: "8", viewBox: "0 0 8 8", fill: "none", children: /* @__PURE__ */ S.jsx(
                    "path",
                    {
                      d: "M1 1l6 6M7 1L1 7",
                      stroke: "currentColor",
                      strokeWidth: "1.5",
                      strokeLinecap: "round"
                    }
                  ) })
                }
              )
            ] })
          },
          O.id
        );
      }),
      /* @__PURE__ */ S.jsx(yi, { children: l && /* @__PURE__ */ S.jsx(
        nn.div,
        {
          className: "fixed inset-0 z-[9000] flex flex-col justify-end",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.18 },
          onClick: J,
          children: /* @__PURE__ */ S.jsxs(
            nn.div,
            {
              role: "dialog",
              "aria-modal": "true",
              "aria-labelledby": "touch-keys-title",
              initial: { y: "100%" },
              animate: { y: 0 },
              exit: { y: "100%" },
              transition: { type: "spring", damping: 30, stiffness: 320 },
              className: "relative w-full rounded-t-2xl flex flex-col items-center",
              style: {
                background: "linear-gradient(160deg, rgba(18,20,31,0.99) 0%, rgba(11,13,24,0.995) 100%)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 -32px 80px rgba(0,0,0,0.75), 0 0 60px rgba(59,130,246,0.10)",
                height: D,
                transition: z ? "none" : "height 0.2s cubic-bezier(0.16,1,0.3,1)"
              },
              onClick: (O) => O.stopPropagation(),
              onPointerDown: (O) => O.stopPropagation(),
              children: [
                /* @__PURE__ */ S.jsx(
                  "div",
                  {
                    className: "pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl",
                    style: {
                      background: "linear-gradient(to right, transparent, rgba(96,165,250,0.45), transparent)"
                    }
                  }
                ),
                /* @__PURE__ */ S.jsxs("div", { className: "flex-none w-full max-w-xl px-5 pt-2 pb-4 border-b border-white/[0.06]", children: [
                  /* @__PURE__ */ S.jsx(
                    "div",
                    {
                      className: "mx-auto mb-3 h-1 w-10 rounded-full bg-white/25 cursor-ns-resize touch-none select-none",
                      onPointerDown: $
                    }
                  ),
                  /* @__PURE__ */ S.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                    /* @__PURE__ */ S.jsxs("div", { className: "flex items-center gap-2.5", children: [
                      /* @__PURE__ */ S.jsx(
                        "span",
                        {
                          className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          style: {
                            background: "rgba(59,130,246,0.12)",
                            border: "1px solid rgba(59,130,246,0.28)"
                          },
                          children: /* @__PURE__ */ S.jsxs(
                            "svg",
                            {
                              width: "15",
                              height: "15",
                              viewBox: "0 0 24 24",
                              fill: "none",
                              "aria-hidden": !0,
                              children: [
                                /* @__PURE__ */ S.jsx(
                                  "rect",
                                  {
                                    x: "2.5",
                                    y: "6",
                                    width: "19",
                                    height: "12",
                                    rx: "2.4",
                                    stroke: "rgba(158,193,255,0.95)",
                                    strokeWidth: "1.6"
                                  }
                                ),
                                /* @__PURE__ */ S.jsx(
                                  "path",
                                  {
                                    d: "M7 10h.01M11 10h.01M15 10h.01M7.5 14h9",
                                    stroke: "rgba(158,193,255,0.95)",
                                    strokeWidth: "1.6",
                                    strokeLinecap: "round"
                                  }
                                )
                              ]
                            }
                          )
                        }
                      ),
                      /* @__PURE__ */ S.jsxs("div", { className: "flex flex-col", children: [
                        /* @__PURE__ */ S.jsx(
                          "h2",
                          {
                            id: "touch-keys-title",
                            className: "text-[15px] font-semibold leading-tight text-white",
                            style: {
                              fontFamily: "'Sora', 'DM Sans', sans-serif",
                              letterSpacing: "-0.01em"
                            },
                            children: "Controls"
                          }
                        ),
                        /* @__PURE__ */ S.jsx(
                          "p",
                          {
                            className: "text-[11px] leading-snug",
                            style: { color: "rgba(255,255,255,0.38)" },
                            children: "Drag buttons to reposition · tap a row to edit"
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ S.jsx(
                      "button",
                      {
                        type: "button",
                        "aria-label": "Close",
                        className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all hover:bg-white/10 hover:text-white",
                        style: {
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          color: "rgba(255,255,255,0.65)"
                        },
                        onClick: J,
                        children: /* @__PURE__ */ S.jsx("svg", { width: "12", height: "12", viewBox: "0 0 14 14", fill: "none", children: /* @__PURE__ */ S.jsx(
                          "path",
                          {
                            d: "M1 1l12 12M13 1L1 13",
                            stroke: "currentColor",
                            strokeWidth: "1.8",
                            strokeLinecap: "round"
                          }
                        ) })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ S.jsx(
                    "div",
                    {
                      className: "my-3.5",
                      style: {
                        height: "1px",
                        background: "linear-gradient(to right, rgba(255,255,255,0.08), transparent)"
                      }
                    }
                  ),
                  /* @__PURE__ */ S.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
                    /* @__PURE__ */ S.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                      /* @__PURE__ */ S.jsxs(
                        "button",
                        {
                          type: "button",
                          className: "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-white/70 transition-all hover:bg-white/[0.09] hover:text-white active:scale-95",
                          style: {
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.10)"
                          },
                          onClick: () => {
                            F(), p((O) => ({
                              v: 1,
                              slots: [
                                ...O.slots,
                                {
                                  id: crypto.randomUUID().slice(0, 12),
                                  nx: 0.5,
                                  ny: 0.72,
                                  label: "A",
                                  type: "button"
                                }
                              ]
                            }));
                          },
                          children: [
                            /* @__PURE__ */ S.jsx(
                              "svg",
                              {
                                width: "10",
                                height: "10",
                                viewBox: "0 0 10 10",
                                fill: "none",
                                children: /* @__PURE__ */ S.jsx(
                                  "path",
                                  {
                                    d: "M5 1v8M1 5h8",
                                    stroke: "currentColor",
                                    strokeWidth: "1.5",
                                    strokeLinecap: "round"
                                  }
                                )
                              }
                            ),
                            "Button"
                          ]
                        }
                      ),
                      /* @__PURE__ */ S.jsxs(
                        "button",
                        {
                          type: "button",
                          className: "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-white/70 transition-all hover:bg-white/[0.09] hover:text-white active:scale-95",
                          style: {
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.10)"
                          },
                          onClick: () => {
                            F(), p((O) => ({
                              v: 1,
                              slots: [
                                ...O.slots,
                                {
                                  id: crypto.randomUUID().slice(0, 12),
                                  nx: 0.5,
                                  ny: 0.5,
                                  label: "Move",
                                  type: "joystick",
                                  kbd: "KeyW,KeyA,KeyS,KeyD",
                                  radius: 60
                                }
                              ]
                            }));
                          },
                          children: [
                            /* @__PURE__ */ S.jsxs(
                              "svg",
                              {
                                width: "11",
                                height: "11",
                                viewBox: "0 0 12 12",
                                fill: "none",
                                children: [
                                  /* @__PURE__ */ S.jsx(
                                    "circle",
                                    {
                                      cx: "6",
                                      cy: "6",
                                      r: "4.6",
                                      stroke: "currentColor",
                                      strokeWidth: "1.3"
                                    }
                                  ),
                                  /* @__PURE__ */ S.jsx("circle", { cx: "6", cy: "6", r: "1.6", fill: "currentColor" })
                                ]
                              }
                            ),
                            "Joystick"
                          ]
                        }
                      ),
                      at && /* @__PURE__ */ S.jsxs(
                        "button",
                        {
                          type: "button",
                          className: "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-white/70 transition-all hover:bg-white/[0.09] hover:text-white active:scale-95",
                          style: {
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.10)"
                          },
                          onClick: rt,
                          children: [
                            /* @__PURE__ */ S.jsx(
                              "svg",
                              {
                                width: "11",
                                height: "11",
                                viewBox: "0 0 12 12",
                                fill: "none",
                                children: /* @__PURE__ */ S.jsx(
                                  "path",
                                  {
                                    d: "M10.5 6a4.5 4.5 0 1 1-1.32-3.18M10.5 1.5v2.7H7.8",
                                    stroke: "currentColor",
                                    strokeWidth: "1.3",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round"
                                  }
                                )
                              }
                            ),
                            "Preset"
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ S.jsxs(
                      "button",
                      {
                        type: "button",
                        className: "relative flex items-center gap-1.5 overflow-hidden rounded-full px-5 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-px active:scale-95",
                        style: {
                          background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 52%, #60a5fa 100%)",
                          boxShadow: "0 8px 24px rgba(2,132,199,0.4), inset 0 1px 0 rgba(255,255,255,0.18)"
                        },
                        onClick: () => {
                          pt();
                        },
                        children: [
                          /* @__PURE__ */ S.jsx(
                            "div",
                            {
                              className: "pointer-events-none absolute inset-x-0 top-0 h-px",
                              style: {
                                background: "linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)"
                              }
                            }
                          ),
                          "Save"
                        ]
                      }
                    )
                  ] }),
                  b && /* @__PURE__ */ S.jsx(
                    "p",
                    {
                      className: "mt-2.5 text-[11px]",
                      style: {
                        color: /saved/i.test(b) ? "rgba(158,193,255,0.75)" : "rgba(255,140,140,0.9)"
                      },
                      children: b
                    }
                  )
                ] }),
                /* @__PURE__ */ S.jsxs("div", { className: "tc-scroll flex-1 overflow-y-auto w-full max-w-xl px-5 py-3.5 min-h-0", children: [
                  h.slots.length > 0 && /* @__PURE__ */ S.jsx("div", { className: "flex flex-col gap-2", children: h.slots.map((O) => /* @__PURE__ */ S.jsxs(
                    "div",
                    {
                      className: "rounded-xl text-[12px] transition-colors cursor-pointer",
                      style: {
                        background: g === O.id ? "linear-gradient(135deg, rgba(29,78,216,0.14), rgba(59,130,246,0.04))" : "rgba(255,255,255,0.025)",
                        border: g === O.id ? "1px solid rgba(96,165,250,0.30)" : "1px solid rgba(255,255,255,0.06)"
                      },
                      onPointerDown: (T) => T.stopPropagation(),
                      onClick: () => v((T) => T === O.id ? null : O.id),
                      children: [
                        /* @__PURE__ */ S.jsxs("div", { className: "flex items-center gap-3 px-3.5 py-2.5", children: [
                          /* @__PURE__ */ S.jsx(
                            "span",
                            {
                              className: "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[11px] font-bold text-white",
                              style: {
                                background: "linear-gradient(180deg, rgba(59,130,246,0.30), rgba(59,130,246,0.10))",
                                border: "1px solid rgba(120,170,255,0.35)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)"
                              },
                              children: O.label
                            }
                          ),
                          /* @__PURE__ */ S.jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
                            /* @__PURE__ */ S.jsx("span", { className: "truncate text-[13px] font-medium text-white/90", children: O.type === "joystick" ? "Joystick" : "Button" }),
                            /* @__PURE__ */ S.jsx(
                              "span",
                              {
                                className: "truncate text-[11px]",
                                style: { color: "rgba(255,255,255,0.40)" },
                                children: T6(O)
                              }
                            )
                          ] }),
                          /* @__PURE__ */ S.jsx(
                            "button",
                            {
                              type: "button",
                              "aria-label": `Remove ${O.label}`,
                              className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[rgba(255,80,80,0.18)]",
                              style: {
                                background: "rgba(255,80,80,0.08)",
                                border: "1px solid rgba(255,80,80,0.18)",
                                color: "rgba(255,140,140,0.9)"
                              },
                              onClick: (T) => {
                                T.stopPropagation(), et(O.id);
                              },
                              children: /* @__PURE__ */ S.jsx(
                                "svg",
                                {
                                  width: "11",
                                  height: "11",
                                  viewBox: "0 0 12 12",
                                  fill: "none",
                                  children: /* @__PURE__ */ S.jsx(
                                    "path",
                                    {
                                      d: "M2.5 3.5h7M5 3.5V2.6c0-.33.27-.6.6-.6h.8c.33 0 .6.27.6.6v.9M3.4 3.5l.4 5.4c.03.39.35.7.75.7h2.9c.4 0 .72-.31.75-.7l.4-5.4",
                                      stroke: "currentColor",
                                      strokeWidth: "1.1",
                                      strokeLinecap: "round",
                                      strokeLinejoin: "round"
                                    }
                                  )
                                }
                              )
                            }
                          ),
                          /* @__PURE__ */ S.jsx(
                            "svg",
                            {
                              width: "12",
                              height: "12",
                              viewBox: "0 0 12 12",
                              fill: "none",
                              className: "shrink-0 transition-transform duration-200",
                              style: {
                                transform: g === O.id ? "rotate(180deg)" : "none",
                                color: "rgba(255,255,255,0.30)"
                              },
                              children: /* @__PURE__ */ S.jsx(
                                "path",
                                {
                                  d: "M2.5 4.5L6 8l3.5-3.5",
                                  stroke: "currentColor",
                                  strokeWidth: "1.5",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round"
                                }
                              )
                            }
                          )
                        ] }),
                        g === O.id && /* @__PURE__ */ S.jsxs(
                          "div",
                          {
                            className: "mx-3.5 mb-3.5 flex flex-col gap-3 border-t pt-3",
                            style: { borderColor: "rgba(255,255,255,0.07)" },
                            onClick: (T) => T.stopPropagation(),
                            children: [
                              /* @__PURE__ */ S.jsxs("label", { className: "block", children: [
                                /* @__PURE__ */ S.jsx(
                                  "span",
                                  {
                                    className: "text-[10px] font-medium uppercase tracking-[0.12em]",
                                    style: { color: "rgba(255,255,255,0.38)" },
                                    children: "Label"
                                  }
                                ),
                                /* @__PURE__ */ S.jsx(
                                  "input",
                                  {
                                    className: "tc-field mt-1.5 w-full rounded-lg px-3 py-2 text-sm text-white outline-none",
                                    style: {
                                      background: "rgba(255,255,255,0.04)",
                                      border: "1px solid rgba(255,255,255,0.09)"
                                    },
                                    value: Y?.label ?? "",
                                    onPointerDown: (T) => T.stopPropagation(),
                                    onFocus: (T) => T.stopPropagation(),
                                    onClick: (T) => T.stopPropagation(),
                                    onKeyDown: (T) => T.stopPropagation(),
                                    onChange: (T) => {
                                      F();
                                      const _ = T.target.value.slice(0, 12);
                                      p((B) => ({
                                        v: 1,
                                        slots: B.slots.map(
                                          (Q) => Q.id === O.id ? { ...Q, label: _ || "·" } : Q
                                        )
                                      }));
                                    }
                                  }
                                )
                              ] }),
                              /* @__PURE__ */ S.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                                /* @__PURE__ */ S.jsxs("label", { className: "block", children: [
                                  /* @__PURE__ */ S.jsx(
                                    "span",
                                    {
                                      className: "text-[10px] font-medium uppercase tracking-[0.12em]",
                                      style: { color: "rgba(255,255,255,0.38)" },
                                      children: "Type"
                                    }
                                  ),
                                  /* @__PURE__ */ S.jsxs(
                                    "select",
                                    {
                                      className: "tc-field mt-1.5 w-full rounded-lg px-2 py-2 text-sm text-white outline-none",
                                      style: {
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.09)"
                                      },
                                      value: O.type || "button",
                                      onChange: (T) => {
                                        F();
                                        const _ = T.target.value;
                                        p((B) => ({
                                          v: 1,
                                          slots: B.slots.map(
                                            (Q) => Q.id === O.id ? { ...Q, type: _ } : Q
                                          )
                                        }));
                                      },
                                      children: [
                                        /* @__PURE__ */ S.jsx("option", { value: "button", children: "Button" }),
                                        /* @__PURE__ */ S.jsx("option", { value: "joystick", children: "Joystick" })
                                      ]
                                    }
                                  )
                                ] }),
                                /* @__PURE__ */ S.jsxs("label", { className: "block", children: [
                                  /* @__PURE__ */ S.jsx(
                                    "span",
                                    {
                                      className: "text-[10px] font-medium uppercase tracking-[0.12em]",
                                      style: { color: "rgba(255,255,255,0.38)" },
                                      children: O.type === "joystick" ? "Radius (px)" : "Android keyCode"
                                    }
                                  ),
                                  /* @__PURE__ */ S.jsx(
                                    "input",
                                    {
                                      type: "text",
                                      inputMode: "numeric",
                                      className: "tc-field mt-1.5 w-full rounded-lg px-3 py-2 text-sm text-white outline-none",
                                      style: {
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.09)"
                                      },
                                      value: O.type === "joystick" ? String(O.radius || 60) : O.androidKeyCode != null ? String(O.androidKeyCode) : "",
                                      onChange: (T) => {
                                        F();
                                        const _ = T.target.value.replace(
                                          /\D/g,
                                          ""
                                        ), B = Number(_);
                                        p((Q) => ({
                                          v: 1,
                                          slots: Q.slots.map((st) => {
                                            if (st.id !== O.id) return st;
                                            if (st.type === "joystick")
                                              return {
                                                ...st,
                                                radius: Number.isFinite(B) ? Math.max(10, B) : 60
                                              };
                                            if (_ === "") {
                                              const {
                                                androidKeyCode: ot,
                                                ...ht
                                              } = st;
                                              return ht;
                                            }
                                            return {
                                              ...st,
                                              androidKeyCode: Number.isFinite(B) ? Math.floor(B) : void 0
                                            };
                                          })
                                        }));
                                      }
                                    }
                                  )
                                ] })
                              ] }),
                              /* @__PURE__ */ S.jsxs("label", { className: "block", children: [
                                /* @__PURE__ */ S.jsx(
                                  "span",
                                  {
                                    className: "text-[10px] font-medium uppercase tracking-[0.12em]",
                                    style: { color: "rgba(255,255,255,0.38)" },
                                    children: O.type === "joystick" ? "Keys (W,A,S,D order)" : "Keyboard key"
                                  }
                                ),
                                /* @__PURE__ */ S.jsx(
                                  "input",
                                  {
                                    className: "tc-field mt-1.5 w-full rounded-lg px-3 py-2 text-sm text-white outline-none font-mono",
                                    style: {
                                      background: "rgba(255,255,255,0.04)",
                                      border: "1px solid rgba(255,255,255,0.09)"
                                    },
                                    value: O.kbd || "",
                                    placeholder: O.type === "joystick" ? "KeyW,KeyA,KeyS,KeyD" : "Press a key to bind…",
                                    onKeyDown: (T) => {
                                      if (O.type !== "joystick") {
                                        T.preventDefault(), T.stopPropagation(), F();
                                        const _ = Vr(T.code), B = T.code.replace(/^Key/, "").replace(/^Digit/, "").replace(/^Arrow/, "").slice(0, 6);
                                        p((Q) => ({
                                          v: 1,
                                          slots: Q.slots.map(
                                            (st) => st.id === O.id ? {
                                              ...st,
                                              kbd: T.code,
                                              label: B || st.label,
                                              ..._ > 0 ? { androidKeyCode: _ } : {}
                                            } : st
                                          )
                                        }));
                                      }
                                    },
                                    onChange: (T) => {
                                      F();
                                      const _ = T.target.value;
                                      p((B) => ({
                                        v: 1,
                                        slots: B.slots.map(
                                          (Q) => Q.id === O.id ? { ...Q, kbd: _ } : Q
                                        )
                                      }));
                                    }
                                  }
                                )
                              ] })
                            ]
                          }
                        )
                      ]
                    },
                    O.id
                  )) }),
                  h.slots.length === 0 && /* @__PURE__ */ S.jsxs(
                    "div",
                    {
                      className: "flex flex-col items-center gap-3 rounded-xl px-6 py-8 text-center",
                      style: {
                        border: "1px dashed rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.015)"
                      },
                      children: [
                        /* @__PURE__ */ S.jsx(
                          "span",
                          {
                            className: "flex h-10 w-10 items-center justify-center rounded-xl",
                            style: {
                              background: "rgba(59,130,246,0.10)",
                              border: "1px solid rgba(59,130,246,0.22)"
                            },
                            children: /* @__PURE__ */ S.jsxs(
                              "svg",
                              {
                                width: "17",
                                height: "17",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                "aria-hidden": !0,
                                children: [
                                  /* @__PURE__ */ S.jsx(
                                    "rect",
                                    {
                                      x: "2.5",
                                      y: "6",
                                      width: "19",
                                      height: "12",
                                      rx: "2.4",
                                      stroke: "rgba(158,193,255,0.7)",
                                      strokeWidth: "1.6"
                                    }
                                  ),
                                  /* @__PURE__ */ S.jsx(
                                    "path",
                                    {
                                      d: "M7 10h.01M11 10h.01M15 10h.01M7.5 14h9",
                                      stroke: "rgba(158,193,255,0.7)",
                                      strokeWidth: "1.6",
                                      strokeLinecap: "round"
                                    }
                                  )
                                ]
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ S.jsx(
                          "p",
                          {
                            className: "max-w-xs text-[12.5px] leading-relaxed",
                            style: { color: "rgba(255,255,255,0.45)" },
                            children: at ? "Tap “Reset” to restore the recommended controls, or add a button to build your own layout." : "Add a button or joystick to create your first on-screen control."
                          }
                        )
                      ]
                    }
                  )
                ] })
              ]
            },
            "tc-keys-sheet"
          )
        },
        "tc-keys-backdrop"
      ) })
    ] }),
    v6()
  );
}
const D1 = { "Content-Type": "application/json" };
async function M6(a, n) {
  const r = await fetch("/api/auth/register", {
    method: "POST",
    headers: D1,
    credentials: "include",
    body: JSON.stringify({ username: a, password: n })
  }), o = await r.json();
  return r.ok ? o.user ? { user: o.user } : { error: "Registration failed", code: "UNKNOWN" } : { error: o.error || "Registration failed", code: o.code };
}
async function tv(a, n) {
  const r = await fetch("/api/auth/login", {
    method: "POST",
    headers: D1,
    credentials: "include",
    body: JSON.stringify({ username: a, password: n })
  }), o = await r.json();
  return r.ok ? o.user ? { user: o.user } : { error: "Login failed", code: "UNKNOWN" } : {
    error: o.error || "Login failed",
    code: o.code,
    retryAfterMs: o.retryAfterMs
  };
}
async function R6() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  });
}
async function ev() {
  const a = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
  return a.status === 401 || !a.ok ? null : (await a.json()).user ?? null;
}
const N1 = x.createContext(null);
function C6({ children: a }) {
  const [n, r] = x.useState(null), [o, l] = x.useState(!0), u = x.useCallback(async () => {
    const g = await ev();
    r(g);
  }, []);
  x.useEffect(() => {
    let g = !1;
    return (async () => {
      const v = await ev();
      g || (r(v), l(!1));
    })(), () => {
      g = !0;
    };
  }, []);
  const f = x.useCallback(async (g, v) => {
    const b = await tv(g, v);
    return "error" in b ? {
      ok: !1,
      message: b.error || "Login failed",
      code: b.code,
      retryAfterMs: b.retryAfterMs
    } : (r(b.user), { ok: !0 });
  }, []), h = x.useCallback(async (g, v) => {
    const b = await M6(g, v);
    if ("error" in b)
      return { ok: !1, message: b.error || "Registration failed", code: b.code };
    const k = await tv(g, v);
    return "error" in k ? (r(null), {
      ok: !1,
      message: "Account created but sign-in failed. Try logging in.",
      code: k.code
    }) : (r(k.user), { ok: !0 });
  }, []), p = x.useCallback(async () => {
    await R6(), r(null);
  }, []), m = x.useMemo(
    () => ({ user: n, loading: o, refresh: u, login: f, register: h, logout: p }),
    [n, o, u, f, h, p]
  );
  return /* @__PURE__ */ S.jsx(N1.Provider, { value: m, children: a });
}
function A6() {
  const a = x.useContext(N1);
  if (!a)
    throw new Error("useAuth must be used within AuthProvider");
  return a;
}
const O1 = "data:image/webp;base64,UklGRmwoAABXRUJQVlA4WAoAAAAQAAAA/wAA/wAAQUxQSJIPAAABBnrY/xeSpBRmbeNs23ps2771nm3btm3b9t3amrU5MzfTVcnveap7KpVvVVf9d/dLREC0bRuodThP7fsUnWLj+AEu/PC///K///Lfn+JUhqL+zbeuaBZcz/ecoj2yFc+7RRRqbGVJivXAdUSPY+7+dPhEO8mOH/PX1+/esm9b4XJxisedb1lEiuKCoomDWwqvOPWwWlJhYENZEawNLCsatmVRRsvnkwok6YIMqeGQYoyWh1JoOUkIVOmgIoyWDyDJlCyEvHQjUXgXc0TvGZRUmQP+ugBvKF6ngNkgnlB0kOWTKWQDsfx74WHdakmaiGLaWrjFlj5cgRmdni/8QtM9SLGZhPyWcIsMa/1P9LuZSBpVZJjPN0eYsYzzhFNc99rsX1LmMtYtLnHEFxWYKfxrcanH5wCUA35EeIWFrbskwgB/Thd+cRFuRKqoYS3hFhV2FElCpK8XlTqi43iEKKadiiu9kwJAavmZolJXbFNC5FE0d5XCuqr3HYWQ3/sV1ZUtX0gBRD8TTlFhGyzDYA0bF9dVPoFgAd9YVJTL8mkQlTSijXAK6rjPLBDl2LOo8rjiGRD2eHFdcW+SEKy2R2Fhrf+CYJKOLK70BhD2ZoER7lCxaXvLrGjhmsVFOb4ka65seWhxYUNMVVbqj65TVMerzCcIVtq+uH5/HpTnpuLCDgNRjpGtC4tydJsKEUV76VPHtdYvB8+yk+vpA6DZhse06mqL4Tu5rTsoZsTxjJ4azGXBbTY98MSB59mBpxx9wDZ9y1XI6//+BTTXdrrmsUbf2TZPTow1y4qvLu0hcvkyPp9FAYRxfaE59njtdxSxCm0QhdBajoD5/aKWKIfvtc4iMsNkJeVo2FS4Grek5SQDVrHmsZbp3S7Czd+rfABhnAFfFY9Zvjw6UglMVKIRq+Rt9LkfBWx+LumPFsLROOQGMlkhSzSss3Dy9bgXaK5N7hybWj6EZOJPtUQv5mviweba7hIeiqYpSbsIN091PxDhntQl9mNyxaNGn2rIH+SoOKL13xAJ+RgNdkCEGfGzcLP8jB5fDyLc7wg31lZtRpIsiGUZV2zTSBDCvWI94WrmJ4Oi8MhyxJegPJcKP9ZWmxjbStHcvLywz4NB2B81mjwfUsim0ri6cPMRW9PUv0w1oxy7avKcSZKMRW2Qj+LxixRACPeDwtPOT5qLXD8XxeMjSUII95TuGuwFChHt9ErCLQr/Mg75OA12EKKskiZEDVUepjeD8ryloRxtxyAk5FeEl4d5tgswlGPp2sKF++RJOjAHxRH2BxDluEBDObYukULoMD8Hzz2+DKKS/m4Z+wgdkK1seUdeDmIbN5CCf0GWzwfp58IpCv8yW/YxiLcVyCevaXPh5iA2AKKKlkf8KQWfvJtzMU+vGRDKEfAlWsIdAliqpLEdcjHPY6CFhh8j+hRrq9mGmFT5eQvLu4KW2eo30/z+PGiQ8lAuYi3/AhHu8zTYoaaDlGbH07rmInYt6IpfCieecI8E2eqIXKQc24MId0M85vEdkJbK8qsadW05sJM7EUUer9dgO0mMT97i+EFKXBG8nMHOBhHukW3jr1jzO4hyDBVevK6+z1577LrjpvmyEuuIleeDCPe+sY/Qh21G+Uo48Xph5SBNLr5AOHmSPgF6g56IVVestZgMsUQL8x4fTzK0zKwknSS8/NADSUKOp3QTTqy8SyEkzzWaIfpaiyoKq5gDmh5N3eUF1n48SI7U5DkZopL+0gzRxceVhc0ZNmb5DlAD8oZmuNV3LkmAW4qupbJ8arytFO2WD9EVOwQKNtemm2mGEO4XNLbqOT3eViH/7uUDVPMjKM/5uplmY020D9XjRyhIsHSXB9i5IOxnTyAJt2yWp7/GVrsoZu0URrR0W/3YGgsIgXGwrab7vBrkjv+p5gotEzgzhPy+cKpfXgVhtwovtqybNphSjsr/q9tQY6sryu+3Pp5a7VksH2eqqtmkeRvNK/QpiHJcrKEcmyeylax68uGITpNNG5BmDeiewtN4pIaYhXlfOObODAHfV92J5fsM86iKBtTywxpsjcWQlorCnTXYUAqTvqI7V3O0vCuZUQ4VcsXHMaOHcGLldVBLdb/w4vfuzktqq5B/8aoZ8yPKAcAsn6LzrkxjkOLx48krGPCV1ZtYvoRCNk8tf6Qhjx3GQSTkY/U+eSb+OFsJt1rvtVGdsWt5su7zFgpTWJjvOMHEViH/4Fbt+YeQW1i+VJNnuxImz+LVNba63ax1t3yh8KsT6wd6g37RdJ/8Paiw52gox/aBYetOy9auRsgRqywAdZ87aRqQQSD9WjjxNfzGtLCW365GccVzoO7zTg225lKMrUrbCBc7p2v5tOq7oOWDSQL+SdKE9qlQjps1tlpribmtJM3uI5yqI9zjSZqrknSEBjsKRDnGttPY6k3EuD4sT9BUW3qX4dOQCeeNuk4DycFJ5toQ8fDqgizvIBUj5o0WrKohjw9SAMGeF16srXoDnBniPvCqij9TCPExGKx5g/YiqRAPcFYvja2eibVVfmxL8PgiCuFLRo5oPQxEuE8Vvs5WhBFFjZtWz/+4Ym1Q99kY+Uql4JH6kW6u7XeYcMgfV8+pI95NZa5t6yaMreo20tjqmnIeXDyzWrJYPhHyNCSNie8+2fsGZKtrdXNtlbZCQVVDPhzRo5YkyrsyhYX5f1ppBilfxae5QT48fhzUfT6l6T5XmksKIvvH26py5zo2Hl0NkOUdQP5l81bWkMfnQdgjhgvzkD67b/YhR/i/YG6hXTI6AvSl1uo2o7ylxSCGey77kMdXp9J9dpkEohzHa2x1SqWiD/fJOuSKbUsp7Kl0xcMgW72qGaT0nkMyDfk7argzfv4FqAG5UEMe9yAJ24xi3LqDauxVv2u5pN99DeX4CdNSlZ8YwFaQGcu1hJvl476Yj0FqltksnwvS39z4Crb80+T3Kp6D8/h5EOV4XNN9rl8H8S9jqZufvCCxVvcGHcsHg46n9tBc5QNQS3W3xlbrxAzs0sgyMxq4Z9a/bHQq3edpoJZqahcN5XjHIEUx3qymt4O6z9d0hHsOiHAfo7FV/zSVFZfJR0YpB8i/bNFqwoXPzlt+UVPWNRYaYRj35jaZhBwXNXI+X0M59iZpeIVmg5SVks3Opwldk8XELy+zYWzeWrhOnH/ZcIgEPAS7GYUhm3s2Fm72sFXnEwKTcevlDke2utK0pVJJltkc0XmisaCc1bMnb4HSnzdcZ4v1uraqcSveoM1Bc231m2gI9/0UMKcfh2QNsnwCRBXVXd3vrqfvv2rwCYfafbqLFqhd2JcJL8mKRurQojWzBTmi1yySEPn13tf/mThl2qRRw4aPvqS8NgV5VYdphoouZpACMeYb2RKPHwWlK7784J+5S+sa6uuWr5BvHhMohsh+JptR0r3VURmA9H4/iDjl+z8W1DeVAma24ZQFhNCAXxJuPE2LCpsVmRIx2exgbUaBsIbaUTMaSqFkay0HlhSkrPN1ruUvpJVm3CPT8g2op1E/e+rSSCtCgPmVQz5deGYbeNKl37tmJbpiqxLqY2iYXFsfVGoYKMLo+xqs8zjU980g6M8WGYEcgVr+ULRsWG1DM2mClXTdVCiHVRQqDHRdqonOVwrW2f8zu9kfW49KL0xhYZ5VSI31JJlQ/ktZwFYDdgVN0+b+G1TApQCkP/maubZhmNZd0oubrHpnqCSkXt85nAV5GUmE6qYuKzUF5WwK03rY7TXY5RBMceMx5YHdXpgJ0IDPFX762BHYrmDWT7MjKbEC9YwPxGKu2LgB8n5LOk7UeK4vtlxGmLn81Om3IzpOxkr43sM/T1+8JAT1C9N7amYb3qMQxCZqRBRqYB6cb6YtHt+JJUKKZt/x8nfD/iXQ7ydr8pyEcmaI3KuavRDTE70QmduY5IodA1LodY8fvp/HCuUn48a37vNJoZwZsBRVlnmtmybW4rdyHmwElm/5hhp5gwII9mLMW+TzTZgvwvLraYrPl6QwDJBRIEbNNmhbd3Az6vP15WeCcuNMD9tgeYRlM0ga3lY4sQvzk0GNyLlxj9DnW2Aypi2afuu2uWdUVYWHTQoL89+6cU/Q4zcphHlkppVYHmyuWVkbsrwvCGuKaHTsEjDMK0fRv5H/YzrHfWaTzCw2o0881mYYRAK+PtZWPtIl0fIX0FOd50N2sSM06fmo+cnW8bbqPZcUdBbaT0P3Iakyi70Qq47oOhORKqbdhJfW7LyiJZEzBh5r8zcYA5PTyD0O7pcR8GO6QUojtEcM+V28eHxNZjEOuZ8mdYYbGzhm767O/Qlc1WOEh9btQsWZ1c+FE09uNlOkEIUdqMkzCP1SSJrYUThYzP2ewsxijVsIN97CxyBqKOkHPz7PSvPgbULA92ATy4OyTDlu0zwBH+JdrLhpa80g5RX8U1EsdxUuMu04NcOUY5SOBvtlJxMM5TB8UzHddhsg5PFR2cUk7a37ACwfbS6S/mwVj3WdkspLEfC15pBuh1hmsaej118n+xqLYt4pPk04SMEMWlfDQW55p29WsWnN5trifewiCoH0ybO8CylOyeR34BJH/GAuWXKKdMTXhpWUNK5jPNbyDwrTsvn4GuHA/ryRUbH8YZJX3+PTjeUQTXpFak2CIrkJ7NTn87IJK6qL5toSMfyxJI1s9ZLmXltVEO60kj1gp67YKEijdqhdZfB9bJIWrKaRjyjkdP/A4tNZTCSNTjoD5oi3ktdSWe3C/AkUptnmmzMPnbtsmD3KoXYXXuKdfBOolLCsTfSEfvuaTHe0jyTeh5AKM6YlukJb73jf/FoKQpUgR8Bv+Q7HyhtppqqEnX7z+ORS9CikYs7IURDSAybVdsUq35GSEaArKt/tCUe3GSW9elu6oJxC484Vm8WUDHUhQIdyOcvPs3Rp2R/XJHonjyFFKipmRdUiRNGIvYTnxHeHN1MjvNZWVtSCiS8vH4Nj54v/WCKzctflb25uanWXRcu9nhwfxhW1/vsTWmiULe+SWneo6O/yLcCh/JrYlTbbZb/Djjv5jH7cf8DAAcwDh5xz4eVXXXfjLfa6a6++/NLL+BJ76eWXXHbN9ddFwV593Q1840233nyj5Zss2xvtLTe/892bj95zyVErC8e42hWPuMXmhw655bX3nn3k9iEHryYSlXXzkwZddPVNt91+5z33P1QOD/Mj1j704EP8ID/ADz/+1DP87HPWPm9fsPziC88+89I7H/3+6xuP3tJ/u5oUtFxtzpLfsoVU05oX1clmvU0/B1sOviZUFgUUPHbc8pVw/b1ry2W1FSVO+vgS1S3meSQJzKJ5xQs//O+//O+//GehMFZQOCC0GAAA0F0AnQEqAAEAAT5hLpJHJCKhoSfWOYiADAlN3C21yAM1u3t3+b36fzs7E/a/wH+VPRv1n593Nv+k+4Dtg+YB+pv6+dfTzB/t7+rvvM+kL0AP2K///YY+gB5ZX7SfBV+3v7p+1R/6vYA/+nqAcNH/Pfwk/Xvyp/yv5Aeiv4d8x/b/7V+327WZpPuL++/uv7iexvfPwBfxn+d/7nz6X0/MH6z0C+7v/L/wfi4akfhP2AP5L/Q/Qf/Z+Df9v/2nsAf0H+8/9L/D+6b/Hf9z/O/5T9w/aP+Zf4P/n/578qvsD/kv9T/4H999rn2F/tx7C36k/8D89SpXfCohAKYWy8SKT7LvhUQgFMLZcl/rlVdIOXfrFPhbLxIgg8pT3V23Q+NwMexO1xWVoLsR1RT4Wy8SG9hbC5/Xv8ZSB0fIpA0fHFhq55gFMLZcN7lqEQYfh8qSewHx/Y/BfGpLcACTJLTZOlR0FR96YU+FsuSbFeQ4Un+oeTEyrVeOpNPUGwOU8oYx2aOYRPl2y8SHhRhqIxrTr8ECqPoiYSvJtBfpFcc85mLYKaLEbMCbILSttiONq0A7UYKiD7BntgGqXXl0whzSrjM42W3jSrUMHY43D4u118d6Vkyx2FtY5v62OYCLDwIAc9q2CCMnwhG7N7T2fCoLBfwgqO5aycSrMiCoaw1TLPskqdZ9zqG81LWiE96rgwM+ARX7XWNww3r7IZMR2xea3EPmdDrQVXMRu+vQ2NBFkYQte7V2m/pjU81VYB7C4lkdwauiFFqrimnVoXTOvSS8khY1u7o8MhTngGeGhUZTcwhPpcA4inqHNEPCo/4tUepDllPPgLsgQMxOqnbPICdXIYW8f9SyUFLhMAL48Q56Mgz01CIg6korfCKNDRGzKWQPfMkJn3xJ5x9J/JiuKEP1D61WOKuixjqvECKIY7YQWf8QUZD4jSIU710R4BiH0q4L0iPKupfu2fK29eibAx8mDCid8cXr9y8SKUHEWBktl4kUn2XfCoWAAP73waAAABv/U4Npqv+eyh8zD9oCAEwCmyW9c5OkQXjHy1c0eOduN6M4FXBwmXT0RvtqjwCeOdx68HQ5Xfe4hlYmm+mVcYuwaT6IMMqJBPz65MdX4DXAqbvKsyV866av9svclhCvUozY7hvgeP1NsJK8HZnsN3iewBVeZLAzFOCA/Gvdpb+lpen/jzIsk3U5McFZPKN8k2Lp9isbDs06tZXTsqC75hpYGiggf/Xq3ooiuOkYLYHAm6QPDDW0kn8vlo6siTbv6UDfL38FqXXCePH+AxpWtVsgTAUpiMtlF/ah6yWjLiTzAmfta+Oxl5MAUTtuDfelEKibqyo0WnY85YzvQ4H5oDtaM/Qg/ZomD//Tn+NIJj3s1K2Atq5HxPNVjRf0KDJq5J5drEJtvOcitJNLvyqastEQri1msq05qRzgTVB6qgtIGjhb/8BBfiazkryRRmvdB6LGTsdu7ZELY34ybwBR7HYssPGYe3ZmesFLWy6K1fWoFuqWZVbHlrQZiHNkNE6t5rbp0tGFqftc/n2oambWarA/Jpk359GACeW9/Z84ACFpQbOAKHih/ufnfWdKeh0BtrdfWitY80msosUZIJVt16qxVmykPz0rOGRTFF9eNUKO0NXUXfQyzpXWhKvd2mOEKUeHKuAMfm9YbFrQpqJEcTWqo11XaYC/BdWSGCp5qA5Dt1nSkLJNv1PJ6RybrQeHKOPoReEvux3I3eZucBfhi9ntMqWeNVLK7mZQHT8ThmqcV2hfx8gKR87KRXx+Q+/nGE82fawVccXT1lgPmlFT3NfQnTwZhH3lWeC7OtNNj/yPgbY+UPb0QCkzNMjxPn1eo5pbwA5/m2qk2JgU71SdSzLOnubaXtWQOgjFabcVUPhw9flvIXEMVLbg8V0n9MWsJ875wrl1hOzfBpuui2VbyoQO+AZ8Kxs/gapxDd+YmL8oKSy5wgibpxlJ1labWy8HOJHnzJ45jex/75GPOg44cBaxoF5AwjCM6oHxbEDD1jy5EvlZ9tpzMyIuMsqFiKigVmpPRJTeSsFoXp4WD+abl5N1ktY+8dnOYryykF4AdrnGj5df8Wlida4SgTgrKNqCF0WGllxmVdGEilG2EOI5pQDaiuts7JlEdfwp7wayiXrfP/49GIJZD2JWTFWlQ/s9svSvuiXZsCwsYsZagmIMZHqG/SEXW3yV+GrOeAZv9TaNHMjLnlNHde1D9UUwQyNjbz3F2eah8aABsHAY7Vxj/5mukbKTPBW4Ae/yD4/XjO8kUbhuWDGsZmfEqblXZOSiU99V96qX2UtmO40XqL+J63yXA3Ff0MxoSerM+7BVNDVc46jJprn0e/YHeGB0Lhm74CiC80rvqQxmkhnWGF1gKJiDbwoQsH7m25uDvX4JGPn9V3JBpW6KJvm9296OJ8zrd7f76A30eb6xFNLcb1+YsFd0QvkldavGG5pqGLLZmwRJn2W1n174AWKqsJNz3X5eES5Y95shH9WYGz+DcCvox2hkuYw8KVZZJrARkbhO2anfes0tvKXDBuy12/wk7OMA+FAJos0olFlJXi7Ez3LXfWtI544m492L1PWXNPjfZpDaH8D7VAEVdRiIUi5kf/3y41yVY0+76dK/P5i+mbYexmEGitrbouwn80n81tsCBvdOOcYUPO6CZyQO7P3RxOKWsAj5v5noOLSCOCZibWSuL3JTsqTpWIdsAi16BLzUjnaCKkqqKmZn+umi5vGIArof687G1SAenE/V3f4YfFGMEPl/8c8a3mtfdN8p/BamOWkkHFnGRmaIIZeXJEqKHydwatLG/DC94w/mpHsPrI93T1BXAA0vnGFEn3l4QUMIgkTn6zrUrVxG+iQiK0Dqyzfs0z+O0EuAcfx8CjRn/RSvViKHnKB3yNPQmHZF3q7HrBthn4z6p3P6B5kQoKwIad1AcbbSMD2F5n9RxHKXcj04ycI/bFw/45JTkr2wJyLo5JZSoi59dZSjamLRR7K5sCMFEg7cOANygy3b0QBHCVMGHH+iNhe0Udn58uuTYLOqVP2jad65RjCrlEyZl0kvwqi6kM2NNwTJ7IfmO1SRp+7rTG+fRtoH5KJGYsQR8UAkyI6qCid0iW2XW3USeBnkuDNB5df1ObikytQrZ2ogKn6YhTqHVlFRe6Bzm5fN/B1MuljARaOaq2gusf5X/2hy8CmnjPAIxcqzXaxoa9k//01s1mqtazWpwgGkTH3a2LeYmRuo9o+d1bjQyAcfXa2w20/EVwo962CZLbWye+lTNgYQVFVxdH12e3JtGLRzMZ/xnAc/199wgNT8MGQMhZul4n4muEccprj4hf0WeGU4UzqNEUT5fBn7n3oca7avTLv62a3lCe6q9otAsKTK10OXHtvS9XHKbDkNVcMzIsGIY5tSZ2EL6YHTqaNTgdS+ZrTruF1EJYGOorRbhGWYeRcHiCukM8O7CnKVH4iZE6S37mCBhBOWlXZRw5QDq5/2IAWlXoHDzS+BXT/W6PK4JvjqUNzCG8Tn7qlGvqj3o3P3SxrbpI2RBR4aWi7Nd+s+3pjUv9vGBPGMs1frKWm+mpLf9gJHsGolu0F4lsu8v1Rb/LNskoeQlk/A5b5q8SFKcjbqaYJMqB2n2wA4mPhZyGYwGUg3C2G+ut713vfOUCGCBPHYbDoTGbYvHQwlzp+V23Uq61IV2MVdGLtPp3rD0/vlaGIunsUf+8/3p8ErslTQFgXNnhjev8hfmqzypiRsxVdLTfX3WboyJniC2Jq5zUimBE/atQTPpg8dXsbd3Sybvq/18Rw1jWI9vUf8PT/RXY+xUDGqe3QpCyWp09nOpmnrSmxe4P/t8Vz6KAimc/jC93COKck3aSlyPyBoDrOZ/kYhwNQK8ldfRbQNgmyno4HdJT6OtPHkw0T88itVe4IDFMpk6F/E+yssBfxdVvI9KjRgyJKQB2KDBKRDlawEZ12kBtGbqb3IWNycGGwU6WEWLLCb/qyGAuhPzqboBbLSlyNH4Jlgd4t8fBeHwuL95/uEfMPIqOUIjXY6dxggRM1+ZydRC9w3BsnuWoRGK+uROEJUUzfEpJcEEEqOUgTpxHspJT7R26lsQh4uSl+YuulGn2qpLvE6YCTvnYaVlZ5n7SUFBbskPBonx1N1ayDqUlErC9+/J+7fGwZCZ2B6XkxY+xadfAYfMA3doBvpbyAQ14SQA7SCz/YCisXk80bZFYoj0Ok87V3lGmgQWYvGM5rkBG7hpAj7Hd4IBEMQAVnVCkd2oSjGrddgtrABV7GNKx6WCXP8NxbHL0gU7EH+d7aQpI6DfFJG4XD3aElWldXntXechE1PbRF1WiiEms67Lol9IHT1NwaGRjPmN0Fu/B6VhZXWhfxSNW+uDp5FU+eyT4QzY+okwiqGPGwvFQqdKc/7LYL141jyNRqMnkiD5EG+EAqZtcSjWMb2bGP7aJpHY+QuuMsPQJLVgbhPHBO9F/MfekzGgXZqlUSrjMc5HwBK/qbaf4Kesn6eKvZXfaiZjas++cPZH9s5U0KEqxRLyLcfm4woRfdTlL3XIWq9psJREQuSTrBDWYiL0/2iHe1BC8qhdrbyESyfB2jNe85vIj5vQwTTDuV2Ww0kjHWUzl0Bdj7ptU+Srgbt0U1rOLY/FfVeanI8Pqn9CiJm1YQ9bbxvznvpKusCxSLzVWItKlYTAge3JRXoLBS3Dehnvv4vsWpULy3N8NedMy18MjKT6xccXk/zZFQdvk/5A37Xpi9ei9+7IWLSaBa8SCQBPnwBKbTPqofJWyRuclznkNiO9FT82ljgmdmuWFGQblFWKXdWsWHY3U1+6WTEwUlvswhojRdBTadHtITShWCo6h4AeIl+yEMe/WiUtdF5TzFJIrvtGAg/VQ9P743ZfAxjM5YdaBzMQVE3DIx0SndSmE5NiRazv7dM48NPpJzH7bhDn9wNVnzguwUafpa2o6lkw/KGShzNj/yq+ZHVL/xAXw+Eym47SR2KnJIR08ROxX7UFRQJPsC9TMi2oVrowmDWLhdWHsP3zXCG8tyejV6XFUESY0TRDLSM37IMCyoBPY7deb5h1KsVpSHgkf+Gu2VUQIn7btponBOAad/gsbsrEmom2teSZn90gG8Kzf1JygfmRn8ef/ebSnp/xauM9Wh+b2p3Zh0yCaHmEFAmHoZyT5RsLJ+FT3ZRAD4cFHw5RSsiUDcL3OT0zZjvw0/AsHZVtcKiiB1+3fOClSsUt+mN2X5lisnCkti8DumePagHUeXRGA6rjEcZJ6zaCueE7/HvgyO0jlS8KPWC0MtVwrqkpxWZE4yzDGB6/7BYv5C8SiScKyfvJdxJzxqd6eNrU37mT26R3t/Gt2cBogSj+bGTnKU9SqmJygUq15fIhYBOrhR2Q/fh5jNL+0Yz/jASRdDChnHYU1UosedcfU3nqyCL8Hgxw4S+9yeOWLcQxlc5ovXrbKfL7F/W7Othpb7C639GtMBUqXYg2eG8+plm6fuZcWYwQMRjTroAs8wOBYGW2hwIuTy0gqLS3pYbMl/yphCXOpqgXhdpJNT1VET1sh8+hx4Z5VarMJmWV4ilACk5M5EGmel0lqv16G9/PaSPVpHYZvK24SvQxY+DH9cN/kN+k+NuzcvgSLrFBPpL/T9c82lqMP2Y2Ay0VqM5E1jVsF5jl5TmFO0BIIRdl3/BelW4AxzzFri+zfMeit+x1qW2BQ+hgX6Py//WmXO/6gU6VpseUdRcveb0uhDMESVp0InWkhAINPTqXBXC5A79dawVeSpNdT8S0ik7PJ/VE3OhRXFm2+6PNhVOHN/AIiYbVWKTwhxV9sVWMUewmXh3sYeZyUVvi9/HGCqJ/OT88DybZgFQAv8w23KNIbnX1Wj2UutlZ80NLVscO+PQg8LwWySoridHKPMGUHlXEJPo9qf8J99w9UtvwCoOM2C9uZ57pPBZFHD+2/uJwcimZAQXYXjRzV6QIXyNppVnbVeh/OYgy8Ox7EtJkPpMDQ349tTtmShIS30yjiLzQx4p19NM6zDnB+3d3LJOeA9s5PVQbH9PwT0G8y3l2NI3aVjJjVlPG/MQ9zu9eZBPkwjES3/vkcRY9OYUsxG239/Gw18rChp4X8qiqcfhChAUmMdrrODkvvZ4fkPumZSlBio6bZyHlV3TxQX80c1z5wFfYf/jTGssqznWP3L+1YH1q8mL3PKhlKvMDJgh0hCbpy3pqucaYQMQBtqWAqN+Aa4chHTFOkiZRW28IpMukYiyo5QkCmPtu7bmV81jA2hrRrd5Wv3k0y1i6nXCelUxb/lX4yuShmJifv/GEv/wTVrWo1L1118wSR79jPaSax4XAz+kcmsdVIFeGmDY3o+dkBYyIUzEM4K772ubc0t7FJ2BAglRQvKiHuKzpw7Z2+AUpN0WaTbF217k10B6Y3nekzGZZSTN4DvtdzRO7YtgSpLfRCtk+IaWlCWoLvmSCQeYo2kpgdhcLNIeAa3OVzUT5N7LXUT1LZTZXjr8jUX36ZlYAdSkh/0TZIrV9rLhY8YJtdK4uLr3BFKCnn+0K0PVOan453HD1AEyQheP8GjhY+pIbL2NuI+NwO3tIfOAIeckb4HzH/yYolMR5D8QeL5PZXCRjsDBf827U5j0W3/7sQ9x4HpXCh3auFD04WLCubFehiDKNgGJtSUHC+y+CRMR1qWVyW8vBX6CU1GROpXT9dasA+kdYqN8O8karIfv53N0kzjtXhkGqYGPBmC5cWWTArzUa9tCPD+nBX4azzhh1xRbkHbQEa35OjH1hd8bXN3jLN4YeTKeR9bxe4sJ2rTmA80g0b9dKL8P7o8j2M/aq1w//E0kV4geB5wrGfYrBBVmaMmV8+HEbzitroXqVOAHBUf+A8/e+EDoX9PAIrz1gVKMggjI6ra2KBKtN7PUt4Knhc1W/ctolv/wxXM9vKfyT+esskU2PJgS5UZP7U9HzBxXp1OyEfPME9yu+KUuY0OUNOL1rALLatD8Knhq3BMZU7gkMpTNa7ntE9l55QRJPziytz0AJAE/zjJN0dKZY2Xn1QO/yq4twwxedUcrVxAT2Z3O5dTNyjPXynIATrC6E/idGss5VYknlfiDkt6MytLgHRtL1BE7xetL2KS5UzbSmmdvQT4hz9Y1TQAE+WcjMzseWhgeNy3TXkmrGmb/vYoGOQ+l2J/5Uf1JMtim/Tjqkw5P1zeaEWBsCaeXDz53PVpEG5DSTWwVTUS7gnKLeRjCaQ6iIbLZvnqLF2q4bfCJnZIEdSVD6mmkjuXooFbhZVJd3Wdo/pyqGgECnGcTOwhhRIkQI+yp5xQHxX0KnGclULWVU4jOrm75TOr1nwBsemEwF1HZfbslZ3xZgR4HwgmCotkwM66IIFUjnYaBcnpinlI3dbAgi6qLvW1SRTKXhlr1ABwUuPukvJ0fHrA3GvprG4AfOP5C9Tg/tJs3g+6ZReEepoHeBbapO3n63mFIWvTvyg+gQDiutZeYcC4YM9h0Me3/zcfT5prGLyj4ss1FIVeitpWoSJ0JiTOV5JcfSEQStoFtre+UINIwB1Bh+eOXPzEsmUegmx/H/JgBY3ZfqegGDP85NKd8TFygeplQvcGcSMFh0/eOd+XQvA1BcQx0n5SJptCVCFTk7dFFvOTe2wB+lt3u3pFDafVsc+Tg1sizW5byAI0e/hWX/vfJ8fnHfe2xn1sfnKRPsVHYE1t1yP6cjgzjJqmMRzjr4cO6XDH4+1ShJvtubi3D5kqKpTyRHZb4w2TEKKF3r/h5sLBhd/tb/vcRON/OtkQ9F+/RLjYR8v/0TvVBg/s5m3GmduA40tRx1/+Vta39vBRxNBfk5YOcZXewFsD5KcfDyuqj9RzHsDb8MQff/crFy1wNLzBHbFiKPSglhUvlYnBaealYsUdJRBZlvJ25aZEzWEyys9wdhx11C9eDnfMEuqgHRoe2qUoVWAzkWCy10DQOkrDBpMTR13nzxqq/Xutig0Uc8BZvCEBf+wU4w6aOVp+RAv4kLzOdApr1hqxVVXaMMrYG0S6MoPrmFHYwDXIHiRyzdljEXwlAgo6o7ainpQicG2I5JU+3GiCTV6KdGQJ5Z/x3A7WxhSlftcEfN1aSe9eVy8rOBu6F8yhzQKH2uRSFZJtRsiWK7VbzmZegj8QT8gVsIcZRYcXgqQDNa7gFtP/9Chgnlwy3q7jiNeaYoscZHeWCYHkFT+oSQ97rVCvaSXHgA4VQHDrQVQg5YObl1kLLZ7RfwKbf6rl9Aq8LrMOxAnyQGmgGlg9X33YZeY8/ZfFI4acdwNBQnQcBrEJzF9aoYg96cTY7u3p2NeFw3zLANc/1LicFUFsmkQHbQIN97HVYNoYEiaPsPuFoS3PctaF6bkZuUpKjgURONhp7Pjo0+MLmedJTgY6TFtOJx8+4ZPMRY+h8dcweEUcn0E5cCmz//sOX+tAAAAAAAAAA", j6 = {
  "67377bd7b945d6a08c83d2b8": "/cg/nba2k23-launch.jpg",
  "68b5b46b32113aa5a01cc1d2": "/cg/tomb-raider-launch.jpg",
  "67f777735aa77c7f9145b445": "/cg/dustborn-launch.jpg",
  "69c11a50b945d6b3155d36dd": "/cg/steel-seed-launch.jpg",
  "5e9be530dda24007d884f7b0": "/cg/minion-rush-despicable-me-launch.jpg",
  "62c54f0bdda2403ee2b2f80f": "/cg/devil-s-hunt-launch.jpg",
  "657718b8dda2401bf3f091fa": "/cg/the-walking-dead-destinies-launch.jpg",
  "60461dd4dda2400c8a96b5e3": "/cg/ao-tennis-2-launch.jpg",
  "60a271f4dda240723f23f1fa": "/cg/rise-of-the-tomb-raider-launch.jpg",
  "5fca1378dda2403d7b08a0e5": "/cg/home-sweet-home-launch.jpg",
  "5e74dd06dda24063a03eba1d": "/cg/kona-launch.jpg",
  "67a605f6269e0887b834bc30": "/cg/just-cause-3-launch.jpg",
  "62bc15bddda2403982133368": "/cg/arise-a-simple-story-launch.jpg",
  "697c70e9269e087440d107ad": "/cg/cats-on-duty-launch.jpg",
  bs0046: "/cg/sg-bs0046-launch.jpg",
  roblox: "/cg/tg-roblox-launch.jpg",
  ng_roblox: "/cg/tg-roblox-launch.jpg",
  ng_stumble_guys: "/cg/ng-stumble-guys-launch.jpg",
  ng_among_us: "/cg/ng-among-us-launch.jpg",
  ng_call_of_duty: "/cg/ng-cod-launch.jpg",
  ng_aptoide: "/cg/ng-aptoide-launch.jpg",
  ng_fortnite: "/cg/ng-fortnite-launch.jpg",
  ng_android: "/cg/ng-android-launch.webp",
  ng_discord: "/cg/ng-discord-launch.jpg",
  ng_instagram: "/cg/ng-instagram-launch.jpg",
  ng_tiktok: "/cg/ng-tiktok-launch.jpg",
  ng_rocket_league: "/cg/ng-rocket-league-launch.jpg",
  ng_fc_mobile: "/cg/ng-fc-mobile-launch.jpg",
  ng_madden: "/cg/ng-madden-launch.jpg",
  ng_ufc: "/cg/ng-ufc-launch.jpg",
  clash_royale: "/cg/tg-clash-royale-launch.jpg",
  "69d8a250b945d64db232a511": "/cg/not-for-broadcast-launch.jpg",
  "63f8774bdda2407571507850": "/cg/night-call-launch.jpg",
  "67a24246ec46caced921c844": "/cg/until-then-launch.jpg",
  "67f916415aa77c7f9145d116": "/cg/night-book-launch.jpg",
  "69d7a249ec46ca4129d084e4": "/cg/the-final-station-launch.jpg",
  "5c9ccb10dda24034ea6bcbb3": "/cg/styx-master-of-shadows-launch.jpg",
  "6722426b743573242fe0b67d": "/cg/blazblue-entropy-effect-launch.jpg",
  "607e858cdda2405d3b364da2": "/cg/avicii-invector-launch.jpg",
  "68485f1a32113a6f258389e4": "/cg/achilles-survivor-launch.jpg",
  "60be2ce8dda2401bab0e40fb": "/cg/beholder-2-launch.jpg",
  "68011b0232113a0b10b5096b": "/cg/maid-of-sker-launch.jpg",
  "69e0d20ab945d60b62f12442": "/cg/deadlink-launch.jpg",
  "68b5b49cec46cabc2c3845b9": "/cg/shadow-of-the-tomb-raider-launch.jpg",
  "5db991b2dda2404603c1519e": "/cg/steel-rats-launch.jpg",
  "6136196edda24015e18b298b": "/cg/arboria-launch.jpg",
  "591ec03cb25b2321ec3c90ed": "/cg/modern-combat-5-blackout-launch.jpg",
  "69329d81ec46ca52fe56359d": "/cg/rollerdrome-launch.jpg",
  "67a083d2b945d6f4066eb29a": "/cg/morbid-the-lords-of-ire-launch.jpg",
  "69de349b269e08141039febf": "/cg/heading-out-launch.jpg",
  "697b10f9269e0890276e94fe": "/cg/awaken-astral-blade-launch.jpg",
  "640889f1dda24041ed1ef363": "/cg/layers-of-fear-2016-launch.jpg",
  "602bd13ddda2401779e0a39c": "/cg/surf-world-series-launch.jpg",
  "5fe074dadda24013a7d3c925": "/cg/handball-21-launch.jpg",
  "62b5694ddda240545a5f685f": "/cg/grand-mountain-adventure-wonderlands-launch.jpg",
  "66d9b8aab945d61df9272223": "/cg/legend-bowl-launch.jpg",
  "6019760ddda240066005eaad": "/cg/snow-the-ultimate-edition-launch.jpg",
  "69d4e5e4b945d63c5657245f": "/cg/rhythm-sprout-sick-beats-bad-sweets-launch.jpg",
  "5cd97b2adda24051e6b03d74": "/cg/legendary-eleven-launch.jpg",
  "6018223fdda240541a86f761": "/cg/golazo-soccer-league-launch.jpg",
  "5c73acfadda2402d204d8802": "/cg/kopanito-all-stars-soccer-launch.jpg",
  "6634ff9bdda24066b733c6ba": "/cg/we-are-football-2024-launch.jpg",
  jy0354: "/cg/sg-jy0354-launch.jpg",
  jy0108: "/cg/sg-jy0108-launch.jpg",
  dg0170: "/cg/sg-dg0170-launch.jpg",
  kj0531: "/cg/sg-kj0531-launch.jpg",
  bs0039: "/cg/sg-bs0039-launch.jpg",
  dg0419: "/cg/sg-dg0419-launch.webp",
  kj0495: "/cg/sg-kj0495-launch.jpg",
  kj0530: "/cg/sg-kj0530-launch.jpg",
  bs0034: "/cg/sg-bs0034-launch.jpg",
  bs0035: "/cg/sg-bs0035-launch.webp",
  bs0026: "/cg/sg-bs0026-launch.jpg",
  bs0023: "/cg/sg-bs0023-launch.webp",
  bs0021: "/cg/sg-bs0021-launch.webp",
  bs0025: "/cg/sg-bs0025-launch.jpg",
  bs0024: "/cg/sg-bs0024-launch.webp",
  bs0022: "/cg/sg-bs0022-launch.webp",
  dg0730: "/cg/sg-dg0730-launch.jpg",
  kj0209: "/cg/sg-kj0209-launch.webp",
  kj0461: "/cg/sg-kj0461-launch.webp",
  kj0529: "/cg/sg-kj0529-launch.jpg",
  dg0248: "/cg/sg-dg0248-launch.jpg",
  dg0364: "/cg/sg-dg0364-launch.webp",
  dg0533: "/cg/sg-dg0533-launch.webp",
  kj0138: "/cg/sg-kj0138-launch.webp",
  kj0137: "/cg/sg-kj0137-launch.jpg",
  kj0442: "/cg/sg-kj0442-launch.webp",
  dg0492: "/cg/sg-dg0492-launch.jpg",
  dg0491: "/cg/sg-dg0491-launch.jpg",
  kp0232: "/cg/sg-kp0232-launch.webp",
  kj0306: "/cg/sg-kj0306-launch.webp",
  bs0040: "/cg/sg-bs0040-launch.jpg",
  bs0017: "/cg/sg-bs0017-launch.jpg",
  kp0203: "/cg/sg-kp0203-launch.webp",
  dg0380: "/cg/sg-dg0380-launch.webp",
  kp0133: "/cg/sg-kp0133-launch.jpg",
  dg0154: "/cg/sg-dg0154-launch.jpg",
  kj0229: "/cg/sg-kj0229-launch.jpg",
  kj0287: "/cg/sg-kj0287-launch.jpg",
  dg0315: "/cg/sg-dg0315-launch.jpg",
  jy0011: "/cg/sg-jy0011-launch.jpg",
  dg0359: "/cg/sg-dg0359-launch.jpg",
  kj0181: "/cg/sg-kj0181-launch.jpg",
  kj0161: "/cg/sg-kj0161-launch.jpg",
  kj0166: "/cg/sg-kj0166-launch.jpg",
  kj0150: "/cg/sg-kj0150-launch.jpg",
  kj0141: "/cg/sg-kj0141-launch.jpg",
  dg0278: "/cg/sg-dg0278-launch.jpg",
  kj0107: "/cg/sg-kj0107-launch.jpg",
  kj0085: "/cg/sg-kj0085-launch.webp",
  kj0089: "/cg/sg-kj0089-launch.jpg",
  dg0183: "/cg/sg-dg0183-launch.jpg",
  kj0025: "/cg/sg-kj0025-launch.webp",
  KJ0019: "/cg/sg-KJ0019-launch.jpg",
  kj0332: "/cg/sg-kj0332-launch.webp",
  bs0115: "/cg/sg-bs0115-launch.webp",
  bs0093: "/cg/sg-bs0093-launch.webp",
  bs0095: "/cg/sg-bs0095-launch.webp",
  bs0138: "/cg/sg-bs0138-launch.webp",
  dg0159: "/cg/sg-dg0159-launch.jpg",
  dg0145: "/cg/sg-dg0145-launch.webp",
  dg0139: "/cg/sg-dg0139-launch.webp",
  dg0054: "/cg/sg-dg0054-launch.webp",
  dg0062: "/cg/sg-dg0062-launch.jpg",
  dg0063: "/cg/sg-dg0063-launch.webp",
  dg0064: "/cg/sg-dg0064-launch.jpg",
  dg0065: "/cg/sg-dg0065-launch.jpg",
  dg0024: "/cg/sg-dg0024-launch.jpg",
  dg0021: "/cg/sg-dg0021-launch.jpg",
  jy0487: "/cg/sg-jy0487-launch.webp",
  jy0541: "/cg/sg-jy0541-launch.webp",
  jy0473: "/cg/sg-jy0473-launch.webp",
  jy0417: "/cg/sg-jy0417-launch.webp",
  jy0371: "/cg/sg-jy0371-launch.webp",
  jy0310: "/cg/sg-jy0310-launch.webp",
  jy0440: "/cg/sg-jy0440-launch.webp",
  jy0402: "/cg/sg-jy0402-launch.webp",
  bs0043: "/cg/sg-bs0043-launch.jpg",
  bs0042: "/cg/sg-bs0042-launch.jpg",
  bs0036: "/cg/sg-bs0036-launch.webp",
  bs0020: "/cg/sg-bs0020-launch.jpg",
  bs0019: "/cg/sg-bs0019-launch.webp",
  kp0213: "/cg/sg-kp0213-launch.webp",
  kj0620: "/cg/sg-kj0620-launch.jpg",
  bs0018: "/cg/sg-bs0018-launch.webp",
  dg0598: "/cg/sg-dg0598-launch.webp",
  kj0615: "/cg/sg-kj0615-launch.jpg",
  kj0035: "/cg/sg-kj0035-launch.webp",
  kj0614: "/cg/sg-kj0614-launch.jpg",
  kj0179: "/cg/sg-kj0179-launch.webp",
  dg0589: "/cg/sg-dg0589-launch.jpg",
  kj0483: "/cg/sg-kj0483-launch.jpg",
  kp0015: "/cg/sg-kp0015-launch.jpg",
  dg0639: "/cg/sg-dg0639-launch.webp",
  kj0177: "/cg/sg-kj0177-launch.webp",
  jy0147: "/cg/sg-jy0147-launch.jpg",
  jy0488: "/cg/sg-jy0488-launch.webp",
  jy0146: "/cg/sg-jy0146-launch.webp",
  jy0183: "/cg/sg-jy0183-launch.webp",
  jy0208: "/cg/sg-jy0208-launch.jpg",
  kj0191: "/cg/sg-kj0191-launch.jpg",
  kj0238: "/cg/sg-kj0238-launch.jpg",
  jy0281: "/cg/sg-jy0281-launch.webp",
  jy0059: "/cg/sg-jy0059-launch.webp",
  jy0362: "/cg/sg-jy0362-launch.webp",
  jy0235: "/cg/sg-jy0235-launch.webp",
  jy0040: "/cg/sg-jy0040-launch.webp",
  jy0126: "/cg/sg-jy0126-launch.webp",
  jy0470: "/cg/sg-jy0470-launch.jpg",
  "68027249ec46ca9f2b5f3ca9": "/cg/five-dates-launch.jpg",
  "68011bd0ec46ca9f2b5efc94": "/cg/the-bunker-launch.jpg",
  "67f91366ec46cafe7b990928": "/cg/bloodshore-launch.jpg",
  "67f9086374357368da39f14b": "/cg/the-complex-launch.jpg",
  "67f90e7bb945d658e615a685": "/cg/who-pressed-mute-on-uncle-marcus-launch.jpg",
  "67fd07c932113a309389279a": "/cg/the-isle-tide-hotel-launch.jpg",
  "6807510132113a0b10b60bd6": "/cg/mia-and-the-dragon-princess-launch.jpg",
  "6807517332113a0b10b60bf5": "/cg/i-saw-black-clouds-launch.jpg",
  "5f55e120dda24015013cc9e7": "/cg/the-descendant-complete-season-episodes-1-5-launch.jpg",
  "60706200dda2403431ca76e7": "/cg/deliver-us-the-moon-launch.jpg",
  "67238893743573242fe0c849": "/cg/doctor-who-the-edge-of-reality-launch.jpg",
  "659bf3fddda2404642477c2b": "/cg/flashback-2-launch.jpg",
  "5ba21aa2dda2401af3d4d511": "/cg/her-majesty-s-spiffing-launch.jpg",
  "61388ab6dda2402cfc0e0211": "/cg/paradise-lost-launch.jpg",
  "5cd14cfbdda24018b4bb3d10": "/cg/alien-rage-launch.jpg",
  "6012c410dda240263be0041e": "/cg/the-uncertain-last-quiet-day-launch.jpg",
  "640739eddda24041ed1ef29e": "/cg/observer-system-redux-launch.jpg",
  "6489c64edda240460dc20ade": "/cg/flashback-launch.jpg",
  "619289eadda2402619fdf39d": "/cg/the-uncertain-light-at-the-end-launch.jpg",
  "66508025dda2401f67813b7c": "/cg/far-cry-3-blood-dragon-launch.jpg",
  "5e789e43dda24063a03ebaa6": "/cg/saints-row-iv-launch.jpg",
  "66d710ccec46ca74265a50e5": "/cg/whispers-of-a-machine-launch.jpg",
  "670fb47dec46cadc258453b6": "/cg/space-prison-launch.jpg",
  "580f7d6059a8c7745f9001c7": "/cg/event-0-launch.jpg",
  "69dfb2f2b945d60b62f12421": "/cg/the-gap-launch.jpg",
  bs0048: "/cg/sg-bs0048-grid.jpg",
  bs0047: "/cg/sg-bs0047-grid.jpg",
  dg0676: "/cg/sg-dg0676-grid.jpg",
  kj0222: "/cg/sg-kj0222-grid.jpg",
  kj0426: "/cg/sg-kj0426-grid.jpg",
  kj0202: "/cg/sg-kj0202-grid.jpg",
  kj0237: "/cg/sg-kj0237-grid.jpg",
  kp0208: "/cg/sg-kp0208-grid.webp",
  kj0499: "/cg/sg-kj0499-grid.jpg",
  kj0357: "/cg/sg-kj0357-grid.jpg",
  kj0322: "/cg/sg-kj0322-grid.jpg",
  kj0135: "/cg/sg-kj0135-grid.jpg",
  kj0171: "/cg/sg-kj0171-grid.jpg",
  dg0174: "/cg/sg-dg0174-grid.webp",
  dg0129: "/cg/sg-dg0129-grid.jpg",
  dg0128: "/cg/sg-dg0128-grid.jpg",
  dg0127: "/cg/sg-dg0127-grid.webp",
  jy0408: "/cg/sg-jy0408-grid.webp",
  dg0109: "/cg/sg-dg0109-grid.webp",
  kj0185: "/cg/sg-kj0185-grid.webp",
  kj0190: "/cg/sg-kj0190-grid.jpg",
  dg0022: "/cg/sg-dg0022-grid.webp",
  jy0559: "/cg/sg-jy0559-grid.webp",
  jy0238: "/cg/sg-jy0238-grid.jpg",
  dg0020: "/cg/sg-dg0020-grid.webp",
  dg0017: "/cg/sg-dg0017-grid.webp",
  jy0482: "/cg/sg-jy0482-grid.webp",
  jy0186: "/cg/sg-jy0186-grid.webp",
  jy0435: "/cg/sg-jy0435-grid.webp",
  jy0459: "/cg/sg-jy0459-grid.jpg",
  jy0361: "/cg/sg-jy0361-grid.webp",
  jy0416: "/cg/sg-jy0416-grid.webp",
  jy0172: "/cg/sg-jy0172-grid.webp",
  jy0324: "/cg/sg-jy0324-grid.webp",
  jy0325: "/cg/sg-jy0325-grid.jpg",
  jy0307: "/cg/sg-jy0307-grid.jpg",
  jy0244: "/cg/sg-jy0244-grid.webp",
  jy0112: "/cg/sg-jy0112-grid.webp",
  jy0154: "/cg/sg-jy0154-grid.webp",
  dg0090: "/cg/sg-dg0090-grid.webp",
  md0483: "/cg/sg-md0483-grid.webp",
  md0176: "/cg/sg-md0176-grid.webp",
  jy0273: "/cg/sg-jy0273-grid.jpg",
  jy0272: "/cg/sg-jy0272-grid.jpg",
  jy0252: "/cg/sg-jy0252-grid.jpg",
  jy0214: "/cg/sg-jy0214-grid.webp",
  jy0229: "/cg/sg-jy0229-grid.jpg",
  jy0038: "/cg/sg-jy0038-grid.jpg",
  jy0219: "/cg/sg-jy0219-grid.webp",
  jy0080: "/cg/sg-jy0080-grid.webp",
  jy0196: "/cg/sg-jy0196-grid.webp",
  jy0095: "/cg/sg-jy0095-grid.jpg",
  jy0185: "/cg/sg-jy0185-grid.webp",
  jy0157: "/cg/sg-jy0157-grid.jpg",
  jy0124: "/cg/sg-jy0124-grid.webp",
  jy0121: "/cg/sg-jy0121-grid.jpg",
  jy0120: "/cg/sg-jy0120-grid.jpg",
  jy0122: "/cg/sg-jy0122-grid.webp",
  jy0118: "/cg/sg-jy0118-grid.webp",
  jy0123: "/cg/sg-jy0123-grid.webp",
  jy0109: "/cg/sg-jy0109-grid.webp",
  jy0091: "/cg/sg-jy0091-grid.jpg",
  jy0105: "/cg/sg-jy0105-grid.webp",
  jy0103: "/cg/sg-jy0103-grid.jpg",
  jy0094: "/cg/sg-jy0094-grid.webp",
  jy0084: "/cg/sg-jy0084-grid.webp",
  jy0075: "/cg/sg-jy0075-grid.webp",
  jy0046: "/cg/sg-jy0046-grid.jpg",
  jy0039: "/cg/sg-jy0039-grid.jpg",
  dg0158: "/cg/sg-dg0158-grid.jpg",
  jy0015: "/cg/sg-jy0015-grid.webp",
  jy0012: "/cg/sg-jy0012-grid.jpg",
  kj0283: "/cg/sg-kj0283-grid.jpg",
  jy0008: "/cg/sg-jy0008-grid.webp",
  jy0013: "/cg/sg-jy0013-grid.jpg",
  jy0017: "/cg/sg-jy0017-grid.webp",
  jy0005: "/cg/sg-jy0005-grid.webp",
  jy0018: "/cg/sg-jy0018-grid.webp",
  "5fc75ac4dda24018fc6c0c04": "/cg/biped-launch.jpg",
  "637e1b81dda2403ed11edf4a": "/cg/stikbold-a-dodgeball-adventure-launch.jpg",
  "627cb93edda24057f2facf18": "/cg/moving-out-launch.jpg",
  "65ddaabadda2405a28110802": "/cg/golf-vs-zombies-launch.jpg",
  "6311fe4fdda240640b3801c5": "/cg/speed-limit-launch.jpg",
  "60d2fb5fdda24029882a2f30": "/cg/kill-it-with-fire-launch.jpg"
}, nv = 1800 * 1e3, L6 = /* @__PURE__ */ new Set(["clash_royale", "roblox"]), Of = "cg-stream-session", av = 15e4;
function D6(a) {
  try {
    const n = sessionStorage.getItem(Of);
    if (!n) return;
    const r = JSON.parse(n);
    r.apiSessionId = a, sessionStorage.setItem(Of, JSON.stringify(r));
  } catch {
  }
}
async function za() {
  try {
    const a = navigator.keyboard;
    a?.lock && await a.lock(["Escape"]);
  } catch {
  }
}
function ts() {
  try {
    navigator.keyboard?.unlock?.();
  } catch {
  }
}
const tc = ["region", "warp"];
function N6() {
  try {
    if (localStorage.getItem("ng-test-region-only") === "1") return ["region"];
  } catch {
  }
  return tc;
}
const $d = [
  "Connecting to relay…",
  "astra.…",
  "Starting playback… This can sometimes take up to 2 minutes.",
  "Final touches…",
  "Loading controls…"
];
function O6({
  embed: a
} = {}) {
  const n = Yf(), { user: r } = A6(), o = x.useRef(null), l = x.useRef(null), u = x.useRef(null), f = x.useRef(null), h = x.useRef(null), p = x.useRef(null), m = x.useRef(null), g = x.useRef(null), v = x.useRef(null), b = x.useRef(null), [k, E] = x.useState(null), [A, C] = x.useState(!1), M = x.useRef(null), D = x.useRef(""), R = x.useRef(null), [z, Z] = x.useState(!1), [W, X] = x.useState(
    null
  ), F = x.useRef(null), [at, rt] = x.useState(!0), [pt, yt] = x.useState("Initializing…"), [vt, Tt] = x.useState(0), [bt, Y] = x.useState(""), [J, et] = x.useState(!1), [$, O] = x.useState(null), [T, _] = x.useState(!0), [B, Q] = x.useState(!1), [st, ot] = x.useState(!1), [ht, Ht] = x.useState(!1), [xt, Ze] = x.useState(100), [Ke, Je] = x.useState(!1), [on, qe] = x.useState(!1), [Fe, Ot] = x.useState(null), [Te, Cn] = x.useState(nv / 1e3), [$e, An] = x.useState(null), [sn, Ge] = x.useState(null), [Xn, De] = x.useState([]), ya = x.useRef([]), nt = x.useRef([]), it = x.useRef("both"), Lt = x.useRef(!1), [Rt, ie] = x.useState(!1), [se, Bt] = x.useState(null), [le, Ee] = x.useState(!1);
  x.useEffect(() => {
    S1().then((H) => {
      ya.current = H.pools, it.current = H.method, Lt.current = H.fallbackDown, ie(H.fallbackDown), De(H.pools);
    });
  }, []);
  const [Ut, je] = x.useState(null), [Wn, Ne] = x.useState(null), [ln, ia] = x.useState(!1), [Si, ir] = x.useState(() => Date.now());
  x.useEffect(() => {
    if (!Wn) return;
    const H = setInterval(() => ir(Date.now()), 1e3);
    return () => clearInterval(H);
  }, [Wn]);
  const yn = x.useRef(null), [ki, Ti] = x.useState(0), [vn, rr] = x.useState(null), Va = x.useRef(null), Qn = x.useRef(!1), Ei = x.useRef(null), ws = x.useRef(null), to = x.useRef(!1), xs = 3e3, eo = 3e3, no = 100, jn = x.useRef(null), ao = $?.game.provider === "secondary", ye = r4(!at && !!$);
  x.useEffect(() => {
    if (at || !$) {
      je(null);
      return;
    }
    const H = o.current;
    if (!H) return;
    const lt = $.game.provider === "tertiary", mt = $.game.provider === "quaternary";
    let Et = 0;
    lt && !yn.current && (yn.current = {
      startAt: Date.now(),
      ticks: 0,
      fpsSum: 0,
      fpsMin: 1 / 0,
      fpsMax: 0,
      msSum: 0,
      msTicks: 0,
      msMin: 1 / 0,
      msMax: 0,
      w: 0,
      h: 0
    }, rr(null));
    const Mt = () => h.current ?? m.current?.getPeer() ?? g.current?.peerConnection ?? v.current?.peerConnection ?? null, Re = H, _t = typeof Re.requestVideoFrameCallback == "function";
    let Ie = 0, te = 0, _e = H.getVideoPlaybackQuality?.().totalVideoFrames ?? 0, cn = performance.now(), Nn = !1, ze = null;
    const qt = () => {
      Ie++, !Nn && _t && (te = Re.requestVideoFrameCallback(qt));
    };
    _t && (te = Re.requestVideoFrameCallback(qt));
    const Ct = setInterval(async () => {
      const Vt = performance.now(), It = (Vt - cn) / 1e3;
      let tn = 0;
      if (_t)
        tn = It > 0 ? Ie / It : 0, Ie = 0;
      else {
        const un = H.getVideoPlaybackQuality?.().totalVideoFrames ?? _e;
        tn = It > 0 ? (un - _e) / It : 0, _e = un;
      }
      cn = Vt;
      let bn = 0, Xe = 0, qa = !1, Fa = "", Ga = "";
      const On = Mt();
      if (On)
        try {
          const un = await On.getStats();
          let ra = null;
          un.forEach((ee) => {
            ee.type === "transport" && typeof ee.selectedCandidatePairId == "string" && (ra = ee.selectedCandidatePairId);
          }), un.forEach((ee) => {
            if (ee.type === "candidate-pair" && (ra ? ee.id === ra : ee.nominated === !0 && ee.state === "succeeded")) {
              Xe = (ee.bytesReceived || 0) + (ee.bytesSent || 0);
              const ji = un.get(ee.localCandidateId);
              qa = ji?.candidateType === "relay", Fa = String(ji?.relayProtocol ?? "");
            }
            if (ee.type === "inbound-rtp" && ee.kind === "video" && !Ga) {
              const ji = un.get(ee.codecId), Ia = String(ji?.mimeType ?? "");
              Ia && (Ga = Ia.replace(/^video\//i, ""));
            }
            ee.type === "candidate-pair" && (ee.nominated === !0 || ee.state === "succeeded") && typeof ee.currentRoundTripTime == "number" ? bn = ee.currentRoundTripTime * 1e3 : bn === 0 && ee.type === "remote-inbound-rtp" && typeof ee.roundTripTime == "number" && (bn = ee.roundTripTime * 1e3);
          });
        } catch {
        }
      const lo = ze !== null && Xe >= ze && It > 0 ? (Xe - ze) * 8 / 1e3 / It : 0;
      ze = Xe, je({
        w: H.videoWidth || 0,
        h: H.videoHeight || 0,
        fps: Math.round(tn),
        ms: Math.round(bn),
        kbps: Math.round(lo),
        mb: Xe / 1e6,
        relay: qa
      }), mt && qa && Xe > 0 && Vt - Et > 3e4 && (Et = Vt, fetch(oe("/api/cg/ng/relay-stat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sessionId: $.apiSessionId,
          relayed: !0,
          bytes: Xe,
          codec: Ga,
          proto: Fa
        })
      }).catch(() => {
      }));
      const ve = yn.current;
      lt && ve && (ve.ticks += 1, ve.fpsSum += tn, ve.fpsMin = Math.min(ve.fpsMin, tn), ve.fpsMax = Math.max(ve.fpsMax, tn), bn > 0 && (ve.msTicks += 1, ve.msSum += bn, ve.msMin = Math.min(ve.msMin, bn), ve.msMax = Math.max(ve.msMax, bn)), H.videoWidth && (ve.w = H.videoWidth, ve.h = H.videoHeight), Ti(Math.floor((Date.now() - ve.startAt) / 1e3)));
    }, 1e3);
    return () => {
      Nn = !0, clearInterval(Ct), _t && te && Re.cancelVideoFrameCallback && Re.cancelVideoFrameCallback(te);
    };
  }, [at, $]);
  const he = x.useCallback(() => {
    const H = yn.current;
    if (yn.current = null, !H || H.ticks === 0) return null;
    const lt = {
      durationSec: Math.round((Date.now() - H.startAt) / 1e3),
      avgFps: Math.round(H.fpsSum / H.ticks),
      avgMs: H.msTicks ? Math.round(H.msSum / H.msTicks) : 0,
      minMs: H.msMin === 1 / 0 ? 0 : Math.round(H.msMin),
      maxMs: Math.round(H.msMax),
      w: H.w,
      h: H.h
    };
    return rr(lt), lt;
  }, []);
  x.useEffect(() => {
    if (at || $?.game.provider !== "tertiary") return;
    const H = navigator;
    if (!H.wakeLock) return;
    let lt = null, mt = !1;
    const Et = async () => {
      try {
        lt = await H.wakeLock.request("screen");
      } catch {
      }
    }, Mt = () => {
      document.visibilityState === "visible" && !mt && Et();
    };
    return Et(), document.addEventListener("visibilitychange", Mt), () => {
      mt = !0, document.removeEventListener("visibilitychange", Mt), lt?.release().catch(() => {
      });
    };
  }, [at, $]), x.useEffect(() => {
    J && $?.game.provider === "tertiary" && he();
  }, [J, $, he]), x.useEffect(() => {
    if (J) {
      try {
        m.current?.dispose();
      } catch {
      }
      m.current = null;
    }
  }, [J]), x.useEffect(() => {
    if (!Fe) return;
    const H = () => {
      const mt = Math.max(0, Fe - Date.now());
      Cn(Math.ceil(mt / 1e3));
    };
    H();
    const lt = setInterval(H, 1e3);
    return () => clearInterval(lt);
  }, [Fe]);
  const Oe = () => {
    Va.current && clearTimeout(Va.current), _(!0);
  }, Ln = async () => {
    const H = o.current;
    if (H && !(Qn.current && !H.muted)) {
      H.muted = !1, H.volume = Math.max(0, Math.min(1, xt / 100));
      try {
        await H.play(), Qn.current = !0, Ht(!1);
      } catch {
        Qn.current = !1, Ht(!0);
      }
    }
  }, io = async (H) => {
    const lt = Math.max(0, Math.min(100, H));
    Ze(lt);
    const mt = o.current;
    if (mt && (mt.volume = lt / 100, mt.muted = lt === 0, lt > 0))
      try {
        await mt.play(), Qn.current = !0, Ht(!1);
      } catch {
        Qn.current = !1, Ht(!0);
      }
  };
  x.useEffect(() => (at || Oe(), () => {
    Va.current && clearTimeout(Va.current);
  }), [at]);
  const or = () => {
    try {
      document.pointerLockElement && document.exitPointerLock();
    } catch {
    }
  }, wc = () => {
    jn.current && (clearTimeout(jn.current), jn.current = null);
  }, Ss = (H) => {
    if (at) return;
    if (!B) {
      Oe();
      return;
    }
    H.clientY >= window.innerHeight - no ? !st && !jn.current && (jn.current = setTimeout(() => {
      jn.current = null, ot(!0), or();
    }, eo)) : (wc(), st && ot(!1));
  };
  x.useEffect(() => {
    const H = () => {
      Ei.current && (clearTimeout(Ei.current), Ei.current = null);
    }, lt = (Et) => {
      Et.key === "Escape" && document.fullscreenElement === F.current && (Et.preventDefault(), Et.stopPropagation(), Et.stopImmediatePropagation(), !Et.repeat && (H(), Ei.current = setTimeout(() => {
        Ei.current = null, or(), ts(), document.fullscreenElement && document.exitFullscreen().catch(() => {
        });
      }, xs)));
    }, mt = (Et) => {
      Et.key === "Escape" && document.fullscreenElement === F.current && (Et.preventDefault(), Et.stopPropagation(), Et.stopImmediatePropagation(), H());
    };
    return window.addEventListener("keydown", lt, !0), window.addEventListener("keyup", mt, !0), () => {
      H(), ts(), window.removeEventListener("keydown", lt, !0), window.removeEventListener("keyup", mt, !0);
    };
  }, []), x.useEffect(() => {
    const H = () => {
      const lt = !!(F.current && document.fullscreenElement === F.current);
      Q(lt), lt ? za() : (ts(), ot(!1), jn.current && (clearTimeout(jn.current), jn.current = null));
    };
    return document.addEventListener("fullscreenchange", H), () => document.removeEventListener("fullscreenchange", H);
  }, []);
  const Ha = $?.game.gameId, Mi = $?.game.provider === "tertiary" && !!Ha && g6.has(Ha);
  x.useEffect(() => {
    const H = W;
    if (!(!H || !Mi))
      return H.onCameraModeChange = qe, () => {
        H.onCameraModeChange = void 0, H.setCameraMode(!1), qe(!1);
      };
  }, [W, Mi]);
  const Pa = () => {
    const H = F.current;
    !H || document.fullscreenElement === H || H.requestFullscreen().then(() => za()).catch(() => {
    });
  }, Ya = () => {
    const H = F.current;
    H && (document.fullscreenElement !== H ? H.requestFullscreen().then(() => {
      za();
    }) : (or(), ts(), document.exitFullscreen()));
  }, va = x.useRef(null);
  x.useEffect(() => {
    const H = sessionStorage.getItem("cg-stream-session");
    if (!H) {
      n("/games");
      return;
    }
    va.current !== H && (va.current = H, O(JSON.parse(H)));
  }, [n]), x.useEffect(() => {
    if (!$e) return;
    let H = !1;
    return (async () => {
      try {
        const lt = await jf($e, {
          sgUserToken: ws.current ?? void 0
        });
        let mt = !1;
        for (let Et = 0; Et < 60; Et++) {
          if (H) return;
          await new Promise((Re) => setTimeout(Re, 3e3));
          const Mt = await Lf(lt.sessionId);
          if (Mt.ready) {
            mt = !0;
            break;
          }
          if (Mt.error) throw new Error(Mt.error);
          Mt.statusText && !H && yt(Mt.statusText);
        }
        if (!mt)
          throw new Error(
            "Reconnect timed out — server took too long. Go back and try again."
          );
        if (H) return;
        to.current = !1, O(
          (Et) => Et ? { ...Et, apiSessionId: lt.sessionId } : null
        ), An(null);
      } catch (lt) {
        H || (to.current = !1, Y(
          lt instanceof Error ? lt.message : "Session ended — reconnect failed. Go back and try again."
        ), rt(!1), An(null));
      }
    })(), () => {
      H = !0;
    };
  }, [$e]), x.useEffect(() => {
    if (!sn) return;
    let H = !1;
    const { gameId: lt, oldSessionId: mt, attempt: Et, warpRegion: Mt } = sn, Re = (() => {
      try {
        return localStorage.getItem("ng-test-region-only") === "1";
      } catch {
        return !1;
      }
    })(), _t = Re ? void 0 : Mt, Ie = Re ? "region" : _t ? "warp" : tc[Et - 1];
    try {
      v.current?.dispose();
    } catch {
    }
    return v.current = null, b.current = null, E(null), et(!1), Y(""), rt(!0), yt("Reconnecting…"), Gr(mt).catch(() => {
    }), (async () => {
      try {
        const _e = await (await fetch(oe("/api/cg/ng/server"), {
          method: "POST",
          credentials: "include"
        })).json().catch(() => null);
        if (!_e?.ok || !_e.id || !_e.servers?.length)
          throw new Error("relay unavailable");
        if (H) return;
        const cn = await A1(_e.servers);
        if (!cn) throw new Error("relay unreachable from this network");
        if (H) return;
        const Nn = await jf(lt, {
          webrtc: cn,
          ngRelay: { id: _e.id, lane: Ie === "warp" ? "pool" : "region" },
          ..._t ? { warpRegion: _t } : {}
        }), ze = Date.now() + 300 * 1e3;
        for (; ; ) {
          if (H) return;
          await new Promise((Ct) => setTimeout(Ct, 1e3));
          const qt = await Lf(Nn.sessionId);
          if (qt.ready) break;
          if (qt.error) throw new Error(qt.error);
          if (qt.statusText && !H && yt(qt.statusText), Date.now() > ze) throw new Error("relay launch timed out");
        }
        if (H) return;
        O((qt) => {
          if (!qt) return qt;
          const Ct = {
            ...qt,
            apiSessionId: Nn.sessionId,
            ngRelayAttempt: Et
          }, Vt = JSON.stringify(Ct);
          return va.current = Vt, sessionStorage.setItem(Of, Vt), Ct;
        }), Ge(null);
      } catch (te) {
        if (H) return;
        console.warn(
          "[ng] relay retry failed:",
          te instanceof Error ? te.message : te
        ), Ge(null), rt(!1), et(!0);
      }
    })(), () => {
      H = !0;
    };
  }, [sn]);
  const Ka = !!Ut?.relay, pe = !!(Wn && Si >= Wn), Ri = Ka && !ao, Ci = x.useRef(Date.now()), Dn = x.useRef(null), [ba, ro] = x.useState(null), [oo, so] = x.useState(!1);
  x.useEffect(() => {
    if (!Ri || J) {
      ro(null);
      return;
    }
    const H = 300 * 1e3, lt = 120 * 1e3, mt = 30 * 1e3;
    Ci.current = Date.now(), Dn.current = document.hidden ? Date.now() : null;
    const Et = () => {
      Ci.current = Date.now();
    }, Mt = () => {
      Dn.current = document.hidden ? Date.now() : null, document.hidden || (Ci.current = Date.now());
    }, Re = [
      "keydown",
      "pointerdown",
      "pointermove",
      "wheel",
      "touchstart"
    ];
    for (const Ie of Re)
      window.addEventListener(Ie, Et, { capture: !0, passive: !0 });
    document.addEventListener("visibilitychange", Mt);
    const _t = setInterval(() => {
      const Ie = Date.now(), te = H - (Ie - Ci.current), _e = Dn.current !== null ? lt - (Ie - Dn.current) : 1 / 0, cn = Math.min(te, _e);
      cn <= 0 && so(!0), ro(cn <= mt ? Math.max(0, cn) : null);
    }, 1e3);
    return () => {
      clearInterval(_t);
      for (const Ie of Re)
        window.removeEventListener(Ie, Et, { capture: !0 });
      document.removeEventListener("visibilitychange", Mt);
    };
  }, [Ri, J]), x.useEffect(() => {
    if (!(!(pe || oo) || !Ri || J)) {
      so(!1), ro(null);
      try {
        v.current?.dispose();
      } catch {
      }
      v.current = null, E(null), Ne(null), $?.apiSessionId && Gr($.apiSessionId).catch(() => {
      }), et(!0);
    }
  }, [pe, oo, Ri, J, $?.apiSessionId]);
  const sr = x.useMemo(() => {
    if (!$)
      return {
        kind: "video",
        src: oe("/api/cg/assets/video/nba23")
      };
    const { stream: H, game: lt } = $;
    if (H?.loadingVideoGameId === null) {
      const Et = j6[lt.gameId] ?? lt.logo;
      return { kind: "image", src: Et ? oe(Et) : void 0 };
    }
    const mt = typeof H?.loadingVideoGameId == "string" ? H.loadingVideoGameId : H?.gameId;
    return mt ? {
      kind: "video",
      src: oe(`/api/cg/assets/video/${encodeURIComponent(mt)}`)
    } : {
      kind: "video",
      src: oe("/api/cg/assets/video/nba23")
    };
  }, [$]), Me = (H) => {
    yt(H);
  };
  x.useEffect(() => {
    if (!at) {
      bt || Tt(100);
      return;
    }
    if (bt) return;
    Tt((lt) => lt < 4 || lt >= 100 ? 6 : lt);
    const H = setInterval(() => {
      Tt((lt) => lt >= 92 ? lt : lt + Math.max(0.5, (92 - lt) * 0.04));
    }, 180);
    return () => clearInterval(H);
  }, [at, bt]), x.useLayoutEffect(() => {
    if (!$) return;
    let H = !1;
    return (async () => {
      try {
        Me("Connecting to relay…");
        const mt = new X5();
        f.current = mt, await mt.connect();
        const Et = mt.waitLaunchResult(), Mt = o.current;
        if (!Mt)
          throw new Error("Video surface not ready — refresh and try again.");
        let Re;
        if ($.game.provider === "secondary") {
          Me("Checking connection…"), Re = await aS(eS());
          try {
            localStorage.getItem("sg-transport-asked") !== "1" && Ee(!0);
          } catch {
          }
        }
        if (H) return;
        mt.attach($.apiSessionId, Re);
        const _t = await Et;
        if (H) return;
        if (_t.transport === "unavailable") {
          Y("No server available right now — please try again shortly."), rt(!1);
          return;
        }
        if (_t.provider === "tertiary" && _t.sdk) {
          if (Me("Negotiating stream…"), H) return;
          Me("Starting playback…"), mt.close(), f.current = null;
          const qt = L6.has(_t.sdk.gameId) ? Mt : u.current ?? Mt;
          if (D.current = _t.sdk.relaySessionId, g.current = await E1(
            _t.sdk,
            Mt,
            qt,
            (Ct) => {
              H || Y(Ct.message);
            },
            {
              onQueue: ({ index: Ct, seconds: Vt }) => {
                if (H) return;
                const It = Math.ceil(Vt / 60), tn = Vt >= 90 ? `about ${It} minute${It === 1 ? "" : "s"}` : `about ${Math.max(10, Math.round(Vt / 10) * 10)} seconds`;
                Me(
                  Ct && Ct > 1 ? `Waiting for a free server — you're #${Ct} in line, ${tn}…` : `Waiting for a free server — ${tn}…`
                );
              }
            }
          ), X(g.current), H) return;
          R.current = O4({
            getCurrentSessionId: () => D.current,
            gameId: _t.sdk.gameId,
            getStandbyVideo: () => l.current,
            // Same surface the live session listens on. Safe to double-bind:
            // the pre-warm is in standby and drops every event it receives.
            getInputSurface: () => qt,
            onSwap: (Ct, Vt) => {
              g.current?.dispose(), Ct.adoptVideoElement(Mt), g.current = Ct, D.current = Vt, X(Ct), D6(Vt);
            },
            onRotatingChange: Z,
            onError: (Ct) => {
              console.warn("[tc-rotate]", Ct.message);
            }
          });
          try {
            await g.current.waitForFirstFrame(av);
          } catch {
            if (H) return;
            throw new Error(
              "The cloud server didn't start the stream in time — please try again."
            );
          }
          if (H || (_t.sdk.gameId === "roblox" || _t.sdk.gameId === "clash_royale") && (await new Promise((Ct) => setTimeout(Ct, 5e3)), H))
            return;
          Me("Loading controls…"), rt(!1), requestAnimationFrame(() => {
            const Ct = F.current;
            if (Ct) {
              if (document.fullscreenElement === Ct) {
                za();
                return;
              }
              Ct.requestFullscreen().then(() => za()).catch(() => {
              });
            }
          });
          return;
        }
        if (_t.provider === "quaternary" && _t.ng) {
          mt.close(), f.current = null, M.current && (clearTimeout(M.current), M.current = null);
          const qt = $.apiSessionId, Ct = () => b.current === qt;
          let Vt = Ct() ? v.current : null;
          Vt || (b.current = qt, Ne(_t.ng?.edgeEndsAt ?? null), Vt = await e6({
            sessionId: qt,
            launch: _t.ng,
            video: Mt,
            inputSurface: Mt,
            // Keyed off the session rather than this run's `cancelled`, so a
            // stream adopted by a later run still reports.
            onStatus: (It) => {
              Ct() && Me(It);
            },
            onError: (It) => {
              Ct() && Y(It.message);
            },
            onTypingChange: (It) => {
              Ct() && C(It);
            },
            onEnded: (It) => {
              if (!Ct()) return;
              const tn = $.ngRelayAttempt ?? (_t.ng?.relayVia === "edge" ? 1 : 0), bn = !!_t.ng?.edgeServers?.length;
              if (/NotInRegion/i.test(It) && Lt.current && ya.current.length > 0) {
                Bt({
                  gameId: $.game.gameId,
                  oldSessionId: qt
                });
                return;
              }
              if (/NotInRegion|MountAppFailed/i.test(It) && bn) {
                if (it.current !== "resi" && ya.current.length > 0) {
                  let Xe = null;
                  try {
                    Xe = localStorage.getItem("astra_ng_warp_region");
                  } catch {
                  }
                  const qa = Date.now();
                  if (nt.current = nt.current.filter(
                    (Fa) => qa - Fa < 5 * 6e4
                  ), Xe && ya.current.some((Fa) => Fa.name === Xe) && // Each relaunch is a full residential-billed launch.
                  nt.current.length < 2) {
                    nt.current.push(qa), Ge({
                      gameId: $.game.gameId,
                      oldSessionId: qt,
                      attempt: tc.length,
                      warpRegion: Xe
                    });
                    return;
                  }
                  Bt({
                    gameId: $.game.gameId,
                    oldSessionId: qt
                  });
                  return;
                }
                if (tn < N6().length) {
                  Ge({
                    gameId: $.game.gameId,
                    oldSessionId: qt,
                    attempt: tn + 1
                  });
                  return;
                }
              }
              et(!0);
            }
          }), v.current = Vt, E(Vt), C(Vt.isTyping()));
          try {
            await Vt.waitForFirstFrame(av);
          } catch {
            if (!Ct()) return;
            throw new Error(
              "The cloud server didn't start the stream in time — please try again."
            );
          }
          if (!Ct()) return;
          Vt.setScrollStep(100), Vt.setSoundEnabled(!0), await Ln(), Me("Loading controls…"), rt(!1), requestAnimationFrame(() => {
            const It = F.current;
            if (It) {
              if (document.fullscreenElement === It) {
                za();
                return;
              }
              It.requestFullscreen().then(() => za()).catch(() => {
              });
            }
          });
          return;
        }
        if (_t.provider === "secondary") {
          Me("Starting playback…"), Mt.muted = !0, Ot(Date.now() + nv);
          const qt = _t.iceServers ?? [], Ct = _t.iceTransportPolicy, Vt = g4({
            relay: mt,
            video: Mt,
            iceServers: qt,
            iceTransportPolicy: Ct,
            cursorRootEl: F.current ?? u.current ?? void 0,
            onLive: () => {
              Mt.muted = !1;
            },
            onEnded: () => {
              H || et(!0);
            }
          });
          if (m.current = Vt, await Vt.ready, H) return;
          await Mt.play().catch(() => {
          }), await Ln(), Me("Loading controls…"), rt(!1), requestAnimationFrame(() => {
            const It = F.current;
            if (It) {
              if (document.fullscreenElement === It) {
                za();
                return;
              }
              It.requestFullscreen().then(async () => {
                await za();
              }).catch(() => {
              });
            }
          });
          return;
        }
        Me("astra.…");
        const { pc: Ie, streamingSize: te } = await $5({
          relay: mt,
          videoEl: Mt
        });
        h.current = Ie, Me("Starting playback…"), Mt.muted = !0;
        const _e = q5(
          Mt,
          void 0,
          12e4
        );
        if (await Mt.play().catch(() => {
        }), await _e, await Ln(), H) return;
        Me("Final touches…"), mt.openServerInputRelay();
        try {
          await mt.waitInputRelayReady(12e4);
        } catch {
          throw new Error("Input relay unavailable");
        }
        if (H || (Me("Loading controls…"), await Promise.all([Ov(), _v()]), H)) return;
        const cn = _t.stream?.inputDevice === "relative" ? "relative" : "absolute", Nn = u.current ?? Mt, ze = new I5({
          videoEl: Mt,
          pointerLockEl: Nn,
          cursorRootEl: u.current ?? void 0,
          streamSize: te,
          mouseInputMode: cn,
          relay: {
            send: (qt) => mt.sendInputOut(qt),
            waitUntilOpen: Promise.resolve()
          }
        });
        await ze.connect(), ze.attachWindowHandlers(), p.current = ze, Nn.focus({ preventScroll: !0 }), window.focus(), rt(!1), requestAnimationFrame(() => Pa());
      } catch (mt) {
        Y(mt instanceof Error ? mt.message : "Stream connection failed"), rt(!1);
      }
    })(), () => {
      H = !0;
      try {
        p.current?.close();
      } catch {
      }
      p.current = null;
      try {
        h.current?.close();
      } catch {
      }
      try {
        m.current?.dispose();
      } catch {
      }
      m.current = null, R.current?.(), R.current = null, Z(!1);
      try {
        g.current?.dispose();
      } catch {
      }
      g.current = null, X(null), M.current && clearTimeout(M.current), M.current = setTimeout(() => {
        M.current = null;
        try {
          v.current?.dispose();
        } catch {
        }
        v.current = null, b.current = null, E(null), C(!1);
      }, 0), f.current?.close(), Ot(null);
    };
  }, [$]);
  const Ai = async () => {
    if (or(), ts(), document.fullscreenElement === F.current)
      try {
        await document.exitFullscreen();
      } catch {
      }
    R.current?.(), R.current = null;
    try {
      const H = D.current || $?.apiSessionId;
      H && await Gr(H);
    } catch {
    }
    try {
      p.current?.close();
    } catch {
    }
    p.current = null;
    try {
      h.current?.close();
    } catch {
    }
    try {
      m.current?.dispose();
    } catch {
    }
    m.current = null;
    try {
      g.current?.dispose();
    } catch {
    }
    g.current = null, X(null), M.current && (clearTimeout(M.current), M.current = null);
    try {
      v.current?.dispose();
    } catch {
    }
    v.current = null, b.current = null, E(null), C(!1), f.current?.close(), sessionStorage.removeItem("cg-stream-session"), !($?.game.provider === "tertiary" && he()) && n("/games");
  };
  return /* @__PURE__ */ S.jsxs(
    "div",
    {
      ref: F,
      className: "relative h-dvh w-screen overflow-hidden bg-black text-white",
      onPointerDown: () => {
        Ln();
      },
      onMouseMove: Ss,
      children: [
        /* @__PURE__ */ S.jsx("style", { children: `
        .play-surface { cursor: none; }
        .play-surface.bn-force-show-cursor { cursor: unset; }
        /* Never show the browser focus ring on the game surface/video — pressing
           Escape or a keybind focuses it and would otherwise flash a blue outline. */
        .play-surface:focus,
        .play-surface:focus-visible,
        #remoteVideo:focus,
        #remoteVideo:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }
        @keyframes gs-spin { to { transform: rotate(360deg); } }
        @keyframes gs-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes gs-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      ` }),
        /* @__PURE__ */ S.jsxs(
          "div",
          {
            ref: u,
            tabIndex: 0,
            role: "application",
            "aria-label": "Game stream",
            className: `play-surface absolute inset-0 z-10 flex items-center justify-center outline-none ${ao ? "" : "bn-force-show-cursor"}`,
            children: [
              /* @__PURE__ */ S.jsx(
                "video",
                {
                  id: "remoteVideo",
                  ref: o,
                  tabIndex: -1,
                  autoPlay: !0,
                  playsInline: !0,
                  className: B ? "pointer-events-auto h-full w-full object-contain" : "pointer-events-auto max-h-full max-w-full object-contain"
                }
              ),
              /* @__PURE__ */ S.jsx(
                "video",
                {
                  ref: l,
                  tabIndex: -1,
                  autoPlay: !0,
                  playsInline: !0,
                  muted: !0,
                  "aria-hidden": "true",
                  className: "pointer-events-none absolute inset-0 -z-10 h-full w-full object-contain opacity-0"
                }
              )
            ]
          }
        ),
        Mi && W && !at && !Ke ? /* @__PURE__ */ S.jsx("div", { className: "fixed bottom-24 left-1/2 z-[9998] -translate-x-1/2", children: /* @__PURE__ */ S.jsx(
          "button",
          {
            type: "button",
            onClick: () => W.setCameraMode(!on),
            className: `rounded-full border px-3.5 py-1.5 text-xs backdrop-blur-md transition ${on ? "border-[#3b82f6]/45 bg-[#3b82f6]/20 text-white" : "border-white/10 bg-black/55 text-white/75 hover:bg-black/70 hover:text-white"}`,
            children: on ? "Camera on — Esc to release" : "Enable camera"
          }
        ) }) : null,
        $?.game.provider === "tertiary" && W && !at ? /* @__PURE__ */ S.jsx(
          E6,
          {
            session: W,
            gameId: $.game.gameId,
            videoRef: o,
            userId: r?.id ?? null,
            panelOpen: Ke,
            onPanelChange: Je
          }
        ) : null,
        /* @__PURE__ */ S.jsx(yi, { children: !at && !a?.hideBottomBar && (bt || (B ? st : T)) && /* @__PURE__ */ S.jsxs(
          nn.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 12 },
            transition: { duration: 0.2, ease: "easeOut" },
            className: "astra-hud-bar absolute inset-x-0 bottom-0 z-30 flex items-center justify-between px-4 py-3",
            style: {
              background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)"
            },
            onMouseDown: (H) => H.stopPropagation(),
            onMouseUp: (H) => H.stopPropagation(),
            onClick: (H) => H.stopPropagation(),
            onMouseEnter: () => {
              B && ot(!0);
            },
            children: [
              /* @__PURE__ */ S.jsxs(
                "button",
                {
                  type: "button",
                  onClick: Ai,
                  className: "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white/65 transition-all hover:text-white active:scale-95",
                  style: {
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.11)",
                    backdropFilter: "blur(12px)"
                  },
                  children: [
                    /* @__PURE__ */ S.jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", children: /* @__PURE__ */ S.jsx(
                      "path",
                      {
                        d: "M8 1L3 6l5 5",
                        stroke: "currentColor",
                        strokeWidth: "1.6",
                        strokeLinecap: "round",
                        strokeLinejoin: "round"
                      }
                    ) }),
                    "Exit",
                    /* @__PURE__ */ S.jsx("span", { className: "ml-0.5 text-[10px] text-white/30" })
                  ]
                }
              ),
              /* @__PURE__ */ S.jsxs("div", { className: "flex items-center gap-2", children: [
                $?.game.logo && /* @__PURE__ */ S.jsx(
                  "img",
                  {
                    src: $.game.logo,
                    alt: "",
                    className: "h-5 w-5 rounded object-cover opacity-80"
                  }
                ),
                /* @__PURE__ */ S.jsx(
                  "span",
                  {
                    className: "text-[13px] font-medium text-white/60",
                    style: { fontFamily: "'Sora', sans-serif" },
                    children: $?.game.gameName
                  }
                )
              ] }),
              /* @__PURE__ */ S.jsxs("div", { className: "flex items-center gap-2", children: [
                $?.game.provider === "tertiary" && W ? /* @__PURE__ */ S.jsxs(
                  "div",
                  {
                    className: "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium tabular-nums text-white/70",
                    title: "Session time",
                    style: {
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.11)",
                      backdropFilter: "blur(12px)"
                    },
                    children: [
                      /* @__PURE__ */ S.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", children: [
                        /* @__PURE__ */ S.jsx(
                          "circle",
                          {
                            cx: "12",
                            cy: "13",
                            r: "8",
                            stroke: "currentColor",
                            strokeWidth: "1.8"
                          }
                        ),
                        /* @__PURE__ */ S.jsx(
                          "path",
                          {
                            d: "M12 9v4l2.5 2M9 2h6",
                            stroke: "currentColor",
                            strokeWidth: "1.8",
                            strokeLinecap: "round"
                          }
                        )
                      ] }),
                      `${Math.floor(ki / 60)}:${String(ki % 60).padStart(2, "0")}`
                    ]
                  }
                ) : null,
                Ut ? (() => {
                  const lt = Ut.kbps < 300 && Ut.fps < 25 ? "rgba(255,255,255,0.7)" : Ut.fps >= 50 ? "rgba(52,211,153,0.95)" : Ut.fps >= 25 ? "rgba(251,191,36,0.95)" : "rgba(255,120,120,0.95)";
                  return /* @__PURE__ */ S.jsxs(
                    "div",
                    {
                      className: "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg py-1.5 pl-3 pr-1.5 text-xs font-medium tabular-nums",
                      title: "Live stream performance — displayed FPS and network latency",
                      style: {
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.11)",
                        backdropFilter: "blur(12px)"
                      },
                      children: [
                        /* @__PURE__ */ S.jsxs(
                          "svg",
                          {
                            width: "12",
                            height: "12",
                            viewBox: "0 0 12 12",
                            fill: "none",
                            children: [
                              /* @__PURE__ */ S.jsx(
                                "rect",
                                {
                                  x: "0.5",
                                  y: "7",
                                  width: "2.4",
                                  height: "4",
                                  rx: "0.6",
                                  fill: lt
                                }
                              ),
                              /* @__PURE__ */ S.jsx(
                                "rect",
                                {
                                  x: "4.3",
                                  y: "4",
                                  width: "2.4",
                                  height: "7",
                                  rx: "0.6",
                                  fill: lt
                                }
                              ),
                              /* @__PURE__ */ S.jsx(
                                "rect",
                                {
                                  x: "8.1",
                                  y: "1",
                                  width: "2.4",
                                  height: "10",
                                  rx: "0.6",
                                  fill: lt
                                }
                              )
                            ]
                          }
                        ),
                        Ut.h > 0 ? /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
                          /* @__PURE__ */ S.jsxs(
                            "span",
                            {
                              style: { color: "rgba(255,255,255,0.7)" },
                              title: `${Ut.w}×${Ut.h}`,
                              children: [
                                Ut.h,
                                "p"
                              ]
                            }
                          ),
                          /* @__PURE__ */ S.jsx("span", { className: "text-white/20", children: "·" })
                        ] }) : null,
                        /* @__PURE__ */ S.jsxs("span", { style: { color: lt }, children: [
                          Ut.fps,
                          " FPS"
                        ] }),
                        ln && (Ut.kbps > 0 || Ut.mb > 0) ? /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
                          /* @__PURE__ */ S.jsx("span", { className: "text-white/20", children: "·" }),
                          /* @__PURE__ */ S.jsxs(
                            "span",
                            {
                              style: { color: "rgba(255,255,255,0.7)" },
                              title: (Ut.relay ? "Fallback connection. " : "Direct connection. ") + `Live ${(Ut.kbps / 1e3).toFixed(1)} Mbps · ${Ut.mb.toFixed(0)} MB this session · ≈${(Ut.kbps * 1800 / 8 / 1e6).toFixed(2)} GB per 30 min at this rate`,
                              children: [
                                (Ut.kbps / 1e3).toFixed(1),
                                " Mbps ·",
                                " ",
                                Ut.mb >= 1e3 ? `${(Ut.mb / 1e3).toFixed(2)} GB` : `${Ut.mb.toFixed(0)} MB`,
                                Ut.relay ? /* @__PURE__ */ S.jsx(
                                  "span",
                                  {
                                    "aria-label": "fallback connection",
                                    className: "ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-sky-400 align-middle"
                                  }
                                ) : null
                              ]
                            }
                          )
                        ] }) : null,
                        ba !== null ? /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
                          /* @__PURE__ */ S.jsx("span", { className: "text-white/20", children: "·" }),
                          /* @__PURE__ */ S.jsxs(
                            "span",
                            {
                              title: "No input — the session ends when this reaches 0. Move or press any key to stay.",
                              style: { color: "rgba(255,120,120,0.95)" },
                              children: [
                                "idle · ends in ",
                                Math.ceil(ba / 1e3),
                                "s"
                              ]
                            }
                          )
                        ] }) : null,
                        Ut.relay && Wn ? (() => {
                          const mt = Math.max(
                            0,
                            Math.ceil((Wn - Si) / 1e3)
                          ), Et = Math.floor(mt / 60), Mt = String(mt % 60).padStart(2, "0");
                          return /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
                            /* @__PURE__ */ S.jsx("span", { className: "text-white/20", children: "·" }),
                            /* @__PURE__ */ S.jsxs(
                              "span",
                              {
                                title: "Fallback session time left — the session ends at 0:00",
                                style: {
                                  color: mt <= 60 ? "rgba(255,120,120,0.95)" : mt <= 300 ? "rgba(251,191,36,0.95)" : "rgba(125,211,252,0.95)"
                                },
                                children: [
                                  Et,
                                  ":",
                                  Mt,
                                  " left"
                                ]
                              }
                            )
                          ] });
                        })() : null,
                        ln && ye ? /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
                          /* @__PURE__ */ S.jsx("span", { className: "text-white/20", children: "·" }),
                          /* @__PURE__ */ S.jsxs(
                            "span",
                            {
                              title: `Input path (you → server): ${ye.rtt} ms, jitter ${ye.jitter} ms, loss ${ye.loss}%`,
                              style: {
                                color: ye.loss > 0 || ye.jitter > 20 ? "rgba(255,120,120,0.95)" : ye.rtt <= 60 ? "rgba(52,211,153,0.95)" : ye.rtt <= 140 ? "rgba(251,191,36,0.95)" : "rgba(255,120,120,0.95)"
                              },
                              children: [
                                "in ",
                                ye.rtt,
                                " ms",
                                ye.loss > 0 ? ` · ${ye.loss}% loss` : ""
                              ]
                            }
                          )
                        ] }) : null,
                        /* @__PURE__ */ S.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => ia((mt) => !mt),
                            "aria-expanded": ln,
                            "aria-label": ln ? "Hide stream details" : "Show stream details",
                            title: ln ? "Hide details" : "More details",
                            className: "flex h-5 w-5 items-center justify-center rounded-md text-white/45 transition hover:bg-white/10 hover:text-white",
                            children: /* @__PURE__ */ S.jsxs(
                              "svg",
                              {
                                width: "12",
                                height: "12",
                                viewBox: "0 0 12 12",
                                "aria-hidden": !0,
                                children: [
                                  /* @__PURE__ */ S.jsx(
                                    "circle",
                                    {
                                      cx: "2.2",
                                      cy: "6",
                                      r: "1.1",
                                      fill: "currentColor"
                                    }
                                  ),
                                  /* @__PURE__ */ S.jsx("circle", { cx: "6", cy: "6", r: "1.1", fill: "currentColor" }),
                                  /* @__PURE__ */ S.jsx(
                                    "circle",
                                    {
                                      cx: "9.8",
                                      cy: "6",
                                      r: "1.1",
                                      fill: "currentColor"
                                    }
                                  )
                                ]
                              }
                            )
                          }
                        )
                      ]
                    }
                  );
                })() : null,
                $?.game.provider === "tertiary" && W ? /* @__PURE__ */ S.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => Je(!0),
                    className: "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/65 transition-all hover:text-white active:scale-95",
                    style: {
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.11)",
                      backdropFilter: "blur(12px)"
                    },
                    children: [
                      /* @__PURE__ */ S.jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", children: [
                        /* @__PURE__ */ S.jsx(
                          "rect",
                          {
                            x: "2.5",
                            y: "6",
                            width: "19",
                            height: "12",
                            rx: "2.4",
                            stroke: "currentColor",
                            strokeWidth: "1.6"
                          }
                        ),
                        /* @__PURE__ */ S.jsx(
                          "path",
                          {
                            d: "M7 10h.01M11 10h.01M15 10h.01M7.5 14h9",
                            stroke: "currentColor",
                            strokeWidth: "1.6",
                            strokeLinecap: "round"
                          }
                        )
                      ] }),
                      "Keys"
                    ]
                  }
                ) : null,
                Fe ? (() => {
                  const H = Te <= 60, lt = Math.floor(Te / 60), mt = Te % 60, Et = `${lt}:${String(mt).padStart(2, "0")}`;
                  return /* @__PURE__ */ S.jsxs(
                    "div",
                    {
                      className: "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium tabular-nums transition-colors",
                      title: "Time remaining in this session",
                      style: {
                        background: H ? "rgba(255,80,80,0.12)" : "rgba(255,255,255,0.08)",
                        border: H ? "1px solid rgba(255,90,90,0.28)" : "1px solid rgba(255,255,255,0.11)",
                        backdropFilter: "blur(12px)",
                        color: H ? "rgba(255,150,150,0.95)" : "rgba(255,255,255,0.65)"
                      },
                      children: [
                        /* @__PURE__ */ S.jsxs(
                          "svg",
                          {
                            width: "12",
                            height: "12",
                            viewBox: "0 0 12 12",
                            fill: "none",
                            children: [
                              /* @__PURE__ */ S.jsx(
                                "circle",
                                {
                                  cx: "6",
                                  cy: "6",
                                  r: "5",
                                  stroke: "currentColor",
                                  strokeWidth: "1.2"
                                }
                              ),
                              /* @__PURE__ */ S.jsx(
                                "path",
                                {
                                  d: "M6 3.2V6l2 1.3",
                                  stroke: "currentColor",
                                  strokeWidth: "1.2",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round"
                                }
                              )
                            ]
                          }
                        ),
                        Et
                      ]
                    }
                  );
                })() : null,
                $?.game.provider === "tertiary" && typeof $.launchesLeft == "number" ? (() => {
                  const H = $.launchesLeft, lt = H <= 1;
                  return /* @__PURE__ */ S.jsxs(
                    "div",
                    {
                      className: "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium tabular-nums transition-colors",
                      title: "Launches left on your cloud profile",
                      style: {
                        background: lt ? "rgba(255,80,80,0.12)" : "rgba(255,255,255,0.08)",
                        border: lt ? "1px solid rgba(255,90,90,0.28)" : "1px solid rgba(255,255,255,0.11)",
                        backdropFilter: "blur(12px)",
                        color: lt ? "rgba(255,150,150,0.95)" : "rgba(255,255,255,0.65)"
                      },
                      children: [
                        /* @__PURE__ */ S.jsxs(
                          "svg",
                          {
                            width: "12",
                            height: "12",
                            viewBox: "0 0 12 12",
                            fill: "none",
                            children: [
                              /* @__PURE__ */ S.jsx(
                                "path",
                                {
                                  d: "M6 1.2 2 3.4v3.2L6 8.8l4-2.2V3.4L6 1.2Z",
                                  stroke: "currentColor",
                                  strokeWidth: "1.1",
                                  strokeLinejoin: "round"
                                }
                              ),
                              /* @__PURE__ */ S.jsx(
                                "path",
                                {
                                  d: "M2 3.4 6 5.6l4-2.2M6 5.6v3.2",
                                  stroke: "currentColor",
                                  strokeWidth: "1.1",
                                  strokeLinejoin: "round"
                                }
                              )
                            ]
                          }
                        ),
                        H,
                        " launch",
                        H === 1 ? "" : "es",
                        " left"
                      ]
                    }
                  );
                })() : null,
                /* @__PURE__ */ S.jsxs(
                  "div",
                  {
                    className: "flex items-center gap-2 rounded-lg px-2.5 py-1.5",
                    style: {
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.11)",
                      backdropFilter: "blur(12px)"
                    },
                    children: [
                      /* @__PURE__ */ S.jsx(
                        "svg",
                        {
                          width: "12",
                          height: "12",
                          viewBox: "0 0 12 12",
                          fill: "none",
                          className: "text-white/70",
                          children: /* @__PURE__ */ S.jsx(
                            "path",
                            {
                              d: "M5 3.5 3.2 5H2v2h1.2L5 8.5V3.5ZM7 4.5a2.3 2.3 0 0 1 0 3M8.8 3.2a4.2 4.2 0 0 1 0 5.6",
                              stroke: "currentColor",
                              strokeWidth: "1.2",
                              strokeLinecap: "round",
                              strokeLinejoin: "round"
                            }
                          )
                        }
                      ),
                      /* @__PURE__ */ S.jsx(
                        "input",
                        {
                          type: "range",
                          min: 0,
                          max: 100,
                          value: xt,
                          onChange: (H) => {
                            io(Number(H.target.value));
                          },
                          className: "h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-white/20 accent-white",
                          "aria-label": "Volume"
                        }
                      )
                    ]
                  }
                ),
                ht ? /* @__PURE__ */ S.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      Ln();
                    },
                    className: "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white/75 transition-all hover:text-white active:scale-95",
                    style: {
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.11)",
                      backdropFilter: "blur(12px)"
                    },
                    children: [
                      /* @__PURE__ */ S.jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", children: /* @__PURE__ */ S.jsx(
                        "path",
                        {
                          d: "M5 3.5 3.2 5H2v2h1.2L5 8.5V3.5ZM7 4.5a2.3 2.3 0 0 1 0 3M8.8 3.2a4.2 4.2 0 0 1 0 5.6",
                          stroke: "currentColor",
                          strokeWidth: "1.2",
                          strokeLinecap: "round",
                          strokeLinejoin: "round"
                        }
                      ) }),
                      "Enable sound"
                    ]
                  }
                ) : null,
                k ? /* @__PURE__ */ S.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      const H = !A;
                      k.setTyping(H), C(H);
                    },
                    title: A ? "Keys are sent as real keyboard input — click to use the title's touch controls" : "Keys become on-screen touches from the title's control scheme — click to send real keys instead",
                    className: "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:text-white active:scale-95",
                    style: {
                      background: A ? "rgba(96,165,250,0.22)" : "rgba(255,255,255,0.08)",
                      border: `1px solid ${A ? "rgba(96,165,250,0.55)" : "rgba(255,255,255,0.11)"}`,
                      color: A ? "#fff" : "rgba(255,255,255,0.65)",
                      backdropFilter: "blur(12px)"
                    },
                    children: [
                      /* @__PURE__ */ S.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", children: [
                        /* @__PURE__ */ S.jsx(
                          "rect",
                          {
                            x: "0.7",
                            y: "2.7",
                            width: "10.6",
                            height: "6.6",
                            rx: "1.3",
                            stroke: "currentColor",
                            strokeWidth: "1.1"
                          }
                        ),
                        /* @__PURE__ */ S.jsx(
                          "path",
                          {
                            d: "M3 5h.01M5 5h.01M7 5h.01M9 5h.01M3.6 7.2h4.8",
                            stroke: "currentColor",
                            strokeWidth: "1.3",
                            strokeLinecap: "round"
                          }
                        )
                      ] }),
                      A ? "Keyboard" : "Touch"
                    ]
                  }
                ) : null,
                k ? /* @__PURE__ */ S.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      k.pasteFromClipboard();
                    },
                    title: "Paste your clipboard into the game",
                    className: "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white/65 transition-all hover:text-white active:scale-95",
                    style: {
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.11)",
                      backdropFilter: "blur(12px)"
                    },
                    children: [
                      /* @__PURE__ */ S.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", children: [
                        /* @__PURE__ */ S.jsx(
                          "rect",
                          {
                            x: "2.6",
                            y: "1.6",
                            width: "6.8",
                            height: "8.8",
                            rx: "1.2",
                            stroke: "currentColor",
                            strokeWidth: "1.1"
                          }
                        ),
                        /* @__PURE__ */ S.jsx(
                          "path",
                          {
                            d: "M4.6 1.6V1a.6.6 0 0 1 .6-.6h1.6a.6.6 0 0 1 .6.6v.6",
                            stroke: "currentColor",
                            strokeWidth: "1.1"
                          }
                        )
                      ] }),
                      "Paste"
                    ]
                  }
                ) : null,
                k ? /* @__PURE__ */ S.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => k.backToGame(),
                    title: "Bring the game back to the front",
                    className: "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white/65 transition-all hover:text-white active:scale-95",
                    style: {
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.11)",
                      backdropFilter: "blur(12px)"
                    },
                    children: [
                      /* @__PURE__ */ S.jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", children: /* @__PURE__ */ S.jsx(
                        "path",
                        {
                          d: "M1.5 6.5 6 2v2.4c3 0 4.5 1.6 4.8 4.6-1-1.4-2.3-2-4.8-2V9.5z",
                          stroke: "currentColor",
                          strokeWidth: "1.4",
                          strokeLinejoin: "round",
                          fill: "none"
                        }
                      ) }),
                      "Back to game"
                    ]
                  }
                ) : null,
                /* @__PURE__ */ S.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: Ya,
                    className: "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white/65 transition-all hover:text-white active:scale-95",
                    style: {
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.11)",
                      backdropFilter: "blur(12px)"
                    },
                    children: B ? /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
                      /* @__PURE__ */ S.jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", children: /* @__PURE__ */ S.jsx(
                        "path",
                        {
                          d: "M4.5 1v3H1.5M7.5 1v3h3M4.5 11v-3H1.5M7.5 11v-3h3",
                          stroke: "currentColor",
                          strokeWidth: "1.4",
                          strokeLinecap: "round"
                        }
                      ) }),
                      "Exit fullscreen"
                    ] }) : /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
                      /* @__PURE__ */ S.jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", children: /* @__PURE__ */ S.jsx(
                        "path",
                        {
                          d: "M1 4V1h3M8 1h3v3M1 8v3h3M11 8v3H8",
                          stroke: "currentColor",
                          strokeWidth: "1.4",
                          strokeLinecap: "round"
                        }
                      ) }),
                      "Fullscreen"
                    ] })
                  }
                )
              ] })
            ]
          },
          "bottom-bar"
        ) }),
        /* @__PURE__ */ S.jsx(yi, { children: z && !at && !bt && /* @__PURE__ */ S.jsx(
          nn.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.35, ease: "easeInOut" },
            className: "pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm",
            children: /* @__PURE__ */ S.jsxs("div", { className: "flex flex-col items-center gap-4 px-6 text-center", children: [
              /* @__PURE__ */ S.jsx("div", { className: "h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white/80" }),
              /* @__PURE__ */ S.jsx("div", { className: "text-lg font-medium text-white", children: "Saving your progress…" }),
              /* @__PURE__ */ S.jsx("div", { className: "max-w-sm text-sm text-white/60", children: "Reconnecting you to a fresh one — your game picks up where you left off." })
            ] })
          }
        ) }),
        /* @__PURE__ */ S.jsx(yi, { children: (at || !!bt || J) && /* @__PURE__ */ S.jsxs(
          nn.div,
          {
            initial: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.6, ease: "easeInOut" },
            className: "absolute inset-0 z-20 flex items-center justify-center overflow-hidden",
            children: [
              sr.kind === "video" ? /* @__PURE__ */ S.jsx(
                "video",
                {
                  className: "absolute inset-0 h-full w-full object-cover",
                  style: { opacity: 0.14, filter: "blur(1px) saturate(1.05)" },
                  autoPlay: !0,
                  muted: !0,
                  loop: !0,
                  playsInline: !0,
                  src: sr.src
                }
              ) : sr.src ? /* @__PURE__ */ S.jsx(
                "img",
                {
                  alt: "",
                  src: sr.src,
                  className: "absolute inset-0 h-full w-full object-cover",
                  style: { opacity: 0.22, filter: "blur(1px) saturate(1.05)" }
                }
              ) : null,
              /* @__PURE__ */ S.jsx(
                "div",
                {
                  className: "absolute inset-0",
                  style: {
                    background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(20,10,50,0.45) 0%, rgba(0,0,0,0.92) 100%)"
                  }
                }
              ),
              /* @__PURE__ */ S.jsx(
                "div",
                {
                  className: "absolute inset-0 opacity-[0.025]",
                  style: {
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                    backgroundSize: "60px 60px"
                  }
                }
              ),
              bt || J ? (
                /* ── Error / session-ended state ── */
                /* @__PURE__ */ S.jsxs(
                  nn.div,
                  {
                    initial: { opacity: 0, scale: 0.94, y: 16 },
                    animate: { opacity: 1, scale: 1, y: 0 },
                    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                    className: "relative flex flex-col items-center gap-5 rounded-2xl px-10 py-9 text-center",
                    style: {
                      background: "rgba(8,6,18,0.82)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backdropFilter: "blur(28px)",
                      boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
                      minWidth: 320
                    },
                    children: [
                      /* @__PURE__ */ S.jsx(
                        "div",
                        {
                          className: "flex h-14 w-14 items-center justify-center rounded-2xl",
                          style: {
                            background: J ? "rgba(120,160,255,0.09)" : "rgba(255,65,65,0.09)",
                            border: J ? "1px solid rgba(120,160,255,0.2)" : "1px solid rgba(255,65,65,0.2)"
                          },
                          children: J ? /* @__PURE__ */ S.jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", children: [
                            /* @__PURE__ */ S.jsx(
                              "circle",
                              {
                                cx: "12",
                                cy: "12",
                                r: "9.5",
                                stroke: "rgba(140,175,255,0.7)",
                                strokeWidth: "1.4"
                              }
                            ),
                            /* @__PURE__ */ S.jsx(
                              "path",
                              {
                                d: "M8.5 12.5l2.4 2.4 4.6-5.2",
                                stroke: "rgba(160,190,255,0.95)",
                                strokeWidth: "1.7",
                                strokeLinecap: "round",
                                strokeLinejoin: "round"
                              }
                            )
                          ] }) : /* @__PURE__ */ S.jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", children: [
                            /* @__PURE__ */ S.jsx(
                              "circle",
                              {
                                cx: "12",
                                cy: "12",
                                r: "9.5",
                                stroke: "rgba(255,100,100,0.7)",
                                strokeWidth: "1.4"
                              }
                            ),
                            /* @__PURE__ */ S.jsx(
                              "path",
                              {
                                d: "M12 8v5M12 15.5v.5",
                                stroke: "rgba(255,130,130,0.9)",
                                strokeWidth: "1.7",
                                strokeLinecap: "round"
                              }
                            )
                          ] })
                        }
                      ),
                      /* @__PURE__ */ S.jsxs("div", { children: [
                        /* @__PURE__ */ S.jsx(
                          "p",
                          {
                            className: "text-[17px] font-bold text-white/90",
                            style: { fontFamily: "'Sora', sans-serif" },
                            children: J ? "Your session has ended" : "Connection failed"
                          }
                        ),
                        /* @__PURE__ */ S.jsx(
                          "p",
                          {
                            className: "mt-1.5 text-[13px] leading-relaxed text-white/40",
                            style: { maxWidth: 260 },
                            children: J ? "Feel free to start a new session." : bt
                          }
                        )
                      ] }),
                      /* @__PURE__ */ S.jsx(
                        "button",
                        {
                          onClick: Ai,
                          className: "w-full rounded-xl py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90 active:scale-95",
                          style: {
                            background: "linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa)",
                            boxShadow: "0 8px 24px rgba(2,132,199,0.45)"
                          },
                          children: J ? "Start a new session" : "Go back"
                        }
                      )
                    ]
                  }
                )
              ) : (
                /* ── Loading state ── */
                /* @__PURE__ */ S.jsxs(
                  nn.div,
                  {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    className: "relative flex w-full max-w-md flex-col items-center gap-6 rounded-2xl px-8 py-7 text-center",
                    style: {
                      background: "rgba(10,10,10,0.72)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(18px)",
                      boxShadow: "0 28px 80px rgba(0,0,0,0.55)"
                    },
                    children: [
                      $?.game.logo && /* @__PURE__ */ S.jsx(
                        "img",
                        {
                          src: $.game.logo,
                          alt: $.game.gameName,
                          className: "rounded-xl object-cover",
                          style: {
                            width: 92,
                            height: 92,
                            boxShadow: "0 12px 36px rgba(0,0,0,0.45)"
                          }
                        }
                      ),
                      /* @__PURE__ */ S.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
                        a && /* @__PURE__ */ S.jsxs("div", { className: "mb-2 flex items-center gap-3", children: [
                          /* @__PURE__ */ S.jsx(
                            "img",
                            {
                              src: O1,
                              alt: "Astra",
                              className: "h-7 w-7 rounded-md object-contain",
                              style: {
                                filter: `drop-shadow(0 0 12px ${a.accent}88)`
                              }
                            }
                          ),
                          /* @__PURE__ */ S.jsx("span", { className: "text-[13px] text-white/35", children: "×" }),
                          /* @__PURE__ */ S.jsx(
                            "img",
                            {
                              src: a.logo,
                              alt: a.name,
                              className: a.logoIcon ? "h-7 w-7 rounded-full object-cover" : "h-5 w-auto opacity-95",
                              onError: (H) => {
                                H.currentTarget.style.display = "none";
                              }
                            }
                          )
                        ] }),
                        /* @__PURE__ */ S.jsx(
                          "h2",
                          {
                            className: "text-[22px] font-bold tracking-tight text-white",
                            style: { fontFamily: "'Sora', sans-serif" },
                            children: $?.game.gameName || "Loading…"
                          }
                        ),
                        /* @__PURE__ */ S.jsx(yi, { mode: "wait", children: /* @__PURE__ */ S.jsx(
                          nn.p,
                          {
                            initial: { opacity: 0, y: 4 },
                            animate: { opacity: 1, y: 0 },
                            exit: { opacity: 0, y: -4 },
                            transition: { duration: 0.2 },
                            className: "text-[13px] text-white/65",
                            children: pt
                          },
                          pt
                        ) })
                      ] }),
                      /* @__PURE__ */ S.jsxs("div", { className: "flex w-72 flex-col gap-2", children: [
                        /* @__PURE__ */ S.jsx(
                          "div",
                          {
                            className: "relative h-[4px] w-full overflow-hidden rounded-full",
                            style: { background: "rgba(255,255,255,0.2)" },
                            children: /* @__PURE__ */ S.jsx(
                              nn.div,
                              {
                                className: "absolute inset-y-0 left-0 rounded-full",
                                style: {
                                  background: "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.75), rgba(255,255,255,0.95))",
                                  backgroundSize: "200% 100%",
                                  animation: "gs-shimmer 1.8s linear infinite"
                                },
                                initial: { width: "0%" },
                                animate: { width: `${Math.round(vt)}%` },
                                transition: { duration: 0.4, ease: "easeOut" }
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ S.jsxs("div", { className: "flex justify-between text-[10px] text-white/45", children: [
                          /* @__PURE__ */ S.jsxs("span", { children: [
                            "Step",
                            " ",
                            Math.min(
                              $d.length,
                              Math.max(
                                1,
                                Math.round(vt / 100 * $d.length)
                              )
                            ),
                            " ",
                            "of ",
                            $d.length
                          ] }),
                          /* @__PURE__ */ S.jsxs("span", { children: [
                            Math.round(vt),
                            "%"
                          ] })
                        ] })
                      ] })
                    ]
                  }
                )
              )
            ]
          }
        ) }),
        /* @__PURE__ */ S.jsx(yi, { children: vn && /* @__PURE__ */ S.jsx(
          nn.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "absolute inset-0 z-50 flex items-center justify-center p-6",
            style: {
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(6px)"
            },
            children: /* @__PURE__ */ S.jsxs(
              nn.div,
              {
                initial: { opacity: 0, y: 18, scale: 0.97 },
                animate: { opacity: 1, y: 0, scale: 1 },
                transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                className: "w-full max-w-sm rounded-2xl px-7 py-6 text-center",
                style: {
                  background: "rgba(12,14,22,0.92)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 28px 80px rgba(0,0,0,0.6)"
                },
                children: [
                  /* @__PURE__ */ S.jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40", children: "Session Summary" }),
                  /* @__PURE__ */ S.jsx(
                    "p",
                    {
                      className: "mt-2 text-4xl font-semibold tabular-nums text-white",
                      style: { fontFamily: "'Sora', sans-serif" },
                      children: `${Math.floor(vn.durationSec / 60)}:${String(
                        vn.durationSec % 60
                      ).padStart(2, "0")}`
                    }
                  ),
                  /* @__PURE__ */ S.jsxs("p", { className: "mt-0.5 text-[12px] text-white/45", children: [
                    $?.game.gameName,
                    " · play time"
                  ] }),
                  /* @__PURE__ */ S.jsx("div", { className: "mt-5 grid grid-cols-3 gap-2.5", children: [
                    { label: "Avg FPS", value: `${vn.avgFps}` },
                    {
                      label: "Avg latency",
                      value: vn.avgMs ? `${vn.avgMs} ms` : "—"
                    },
                    {
                      label: "Resolution",
                      value: vn.h ? `${vn.h}p` : "—"
                    }
                  ].map((H) => /* @__PURE__ */ S.jsxs(
                    "div",
                    {
                      className: "rounded-xl px-2 py-2.5",
                      style: {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)"
                      },
                      children: [
                        /* @__PURE__ */ S.jsx("div", { className: "text-[15px] font-semibold tabular-nums text-white", children: H.value }),
                        /* @__PURE__ */ S.jsx("div", { className: "mt-0.5 text-[10px] uppercase tracking-wide text-white/40", children: H.label })
                      ]
                    },
                    H.label
                  )) }),
                  vn.avgMs ? /* @__PURE__ */ S.jsxs("p", { className: "mt-3 text-[11px] text-white/40 tabular-nums", children: [
                    "latency ",
                    vn.minMs,
                    "–",
                    vn.maxMs,
                    " ms"
                  ] }) : null,
                  /* @__PURE__ */ S.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        rr(null), a ? window.location.reload() : n("/games");
                      },
                      className: "mt-5 w-full rounded-xl py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90 active:scale-95",
                      style: {
                        background: "linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa)",
                        boxShadow: "0 8px 24px rgba(2,132,199,0.45)"
                      },
                      children: a ? "Play again" : "Back to games"
                    }
                  )
                ]
              }
            )
          },
          "session-summary"
        ) }),
        /* @__PURE__ */ S.jsx(
          k1,
          {
            open: !!se,
            gameName: $?.game.gameName ?? "",
            pools: Xn,
            storageKey: "astra_ng_warp_region",
            fallbackDown: Rt,
            onChoose: (H) => {
              const lt = se;
              Bt(null), lt && Ge({
                gameId: lt.gameId,
                oldSessionId: lt.oldSessionId,
                // Past the legacy ladder — the picked region forces the WARP lane.
                attempt: tc.length,
                warpRegion: H
              });
            },
            onCancel: () => {
              Bt(null), et(!0);
            }
          }
        ),
        /* @__PURE__ */ S.jsx(
          n4,
          {
            open: le,
            gameName: $?.game.gameName,
            onChoose: (H) => {
              nS(H);
              try {
                localStorage.setItem("sg-transport-asked", "1");
              } catch {
              }
              Ee(!1);
            },
            onCancel: () => {
              try {
                localStorage.setItem("sg-transport-asked", "1");
              } catch {
              }
              Ee(!1);
            }
          }
        )
      ]
    }
  );
}
const _6 = {
  velara: {
    name: "Velara",
    logo: "/proxy/velara.svg",
    accent: "#8b5cf6",
    ngMethod: "cfturn"
  },
  shadow: {
    name: "Shadow",
    logo: "/proxy/shadow.webp",
    logoIcon: !0,
    accent: "#a855f7",
    bg: "#06030b",
    glow: "#4c1d95",
    ngMethod: "cfturn"
  },
  truffled: {
    name: "Truffled",
    logo: "/proxy/truffled.png",
    logoIcon: !0,
    // Astra's own blue, on Astra's default background.
    accent: "#3b82f6",
    ngMethod: "cfturn",
    hideBottomBar: !0
  }
}, z6 = {
  slug: "sdk",
  name: "Astra",
  logo: "/logo.svg",
  ngMethod: "cfturn",
  accent: "#6366f1",
  // The SDK renders into the partner's own element: just the video, no Astra
  // control bar or branding over it.
  hideBottomBar: !0,
  hideBranding: !0
};
function U6(a) {
  if (!a) return null;
  const n = a.toLowerCase(), r = _6[n];
  return r ? { slug: n, ...r } : null;
}
function B6({ proxy: a }) {
  const [n, r] = x.useState(!1);
  return n ? /* @__PURE__ */ S.jsx("span", { className: "eb-wordmark", children: a.name }) : /* @__PURE__ */ S.jsx(
    "img",
    {
      src: a.logo,
      alt: a.name,
      className: a.logoIcon ? "eb-proxy-icon" : "eb-proxy-logo",
      onError: () => r(!0)
    }
  );
}
function iv({
  proxy: a,
  title: n,
  status: r,
  error: o
}) {
  const l = a?.accent ?? "#3b82f6";
  return /* @__PURE__ */ S.jsxs("div", { className: "eb-page", children: [
    /* @__PURE__ */ S.jsx(V6, { accent: l, bg: a?.bg, glow: a?.glow }),
    /* @__PURE__ */ S.jsxs("div", { className: "eb-center", children: [
      a && /* @__PURE__ */ S.jsxs("div", { className: "eb-brand", children: [
        /* @__PURE__ */ S.jsx("img", { src: O1, alt: "Astra", className: "eb-astra-logo" }),
        /* @__PURE__ */ S.jsx("span", { className: "eb-x", children: "×" }),
        /* @__PURE__ */ S.jsx(B6, { proxy: a })
      ] }),
      o ? /* @__PURE__ */ S.jsx("p", { className: "eb-error", children: o }) : /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
        /* @__PURE__ */ S.jsx("p", { className: "eb-title", children: n ?? "Loading" }),
        /* @__PURE__ */ S.jsx("div", { className: "eb-bar", children: /* @__PURE__ */ S.jsx("div", { className: "eb-bar-fill" }) }),
        /* @__PURE__ */ S.jsx("p", { className: "eb-status", children: r })
      ] })
    ] })
  ] });
}
function V6({
  accent: a,
  bg: n,
  glow: r
}) {
  const o = n ?? "var(--astra-bg, #05070d)", l = r ? `radial-gradient(ellipse 90% 60% at 50% 110%, ${r}55 0%, transparent 70%),` : "";
  return /* @__PURE__ */ S.jsx("style", { children: `
      /* Absolute against the shell's own relative full-height wrapper.
         Not fixed: a transformed ancestor becomes the containing block for
         fixed children too, so this would collapse to its content height.
         Not static either — the app shell sizes its container to content, so
         a percentage height would have nothing to resolve against. Embed
         routes also skip the page transition (see App.tsx) so no transform
         ever lands on an ancestor. */
      .eb-page {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        padding: 24px; overflow: hidden;
        background:
          radial-gradient(ellipse at 50% 0%, ${a}22 0%, rgba(5,7,13,0) 60%),
          ${l}
          ${o};
      }
      .eb-center {
        display: flex; flex-direction: column; align-items: center;
        width: 100%; max-width: 380px; text-align: center;
      }
      .eb-brand {
        display: flex; align-items: center; justify-content: center; gap: 14px;
        margin-bottom: 30px;
        animation: eb-rise 0.6s cubic-bezier(0.16,1,0.3,1) both;
      }
      .eb-astra-logo {
        width: 40px; height: 40px; object-fit: contain; border-radius: 9px;
        filter: drop-shadow(0 0 14px ${a}66);
        animation: eb-pulse 2.6s ease-in-out infinite;
      }
      /* Height-driven with auto width: partner logos vary in aspect (Velara's
         is ~3.75:1), and a fixed square box would letterbox a wide one down to
         nothing. */
      .eb-proxy-logo {
        height: 30px; width: auto; max-width: 150px; object-fit: contain;
        filter: drop-shadow(0 0 12px ${a}55);
      }
      .eb-proxy-icon {
        width: 40px; height: 40px; object-fit: cover; border-radius: 50%;
      }
      .eb-wordmark {
        font-family: 'DM Sans', sans-serif; font-size: 19px; font-weight: 600;
        letter-spacing: -0.02em; color: #fff;
      }
      .eb-x {
        font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 400;
        color: rgba(255,255,255,0.32);
      }
      .eb-title {
        margin: 0 0 18px; font-family: 'DM Sans', sans-serif;
        font-size: 20px; font-weight: 600; letter-spacing: -0.02em; color: #fafafa;
        animation: eb-rise 0.6s 0.06s cubic-bezier(0.16,1,0.3,1) both;
      }
      .eb-bar {
        width: 100%; height: 3px; border-radius: 2px; overflow: hidden;
        background: rgba(255,255,255,0.08);
      }
      .eb-bar-fill {
        width: 40%; height: 100%; border-radius: 2px;
        background: linear-gradient(90deg, transparent, ${a}, transparent);
        animation: eb-sweep 1.5s ease-in-out infinite;
      }
      .eb-status {
        margin: 14px 0 0; font-family: 'Inter', sans-serif;
        font-size: 13.5px; color: rgba(255,255,255,0.5);
      }
      .eb-error {
        margin: 0; font-family: 'Inter', sans-serif; font-size: 14px;
        line-height: 1.6; color: rgba(255,150,145,0.98);
      }
      @keyframes eb-rise {
        from { opacity: 0; transform: translateY(9px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes eb-pulse {
        0%, 100% { transform: scale(1); filter: drop-shadow(0 0 14px ${a}66); }
        50% { transform: scale(1.06); filter: drop-shadow(0 0 22px ${a}aa); }
      }
      @keyframes eb-sweep {
        0% { transform: translateX(-120%); }
        100% { transform: translateX(320%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .eb-astra-logo, .eb-bar-fill, .eb-brand, .eb-title { animation: none; }
        .eb-bar-fill { width: 100%; }
      }
    ` });
}
async function H6(a) {
  try {
    const r = await (await fetch(oe("/api/cg/ng/server"), {
      method: "POST",
      credentials: "include"
    })).json();
    if (!r.ok || !r.id || !r.servers?.length) return null;
    const o = await A1(r.servers);
    return o ? {
      webrtc: o,
      ngRelay: { id: r.id, lane: a === "warp" ? "pool" : "region" }
    } : null;
  } catch {
    return null;
  }
}
const P6 = 1500, Y6 = 18e4, _f = "astra_ng_warp_region";
function rv(a) {
  try {
    const n = localStorage.getItem(_f);
    if (n && a.some((r) => r.name === n)) return n;
  } catch {
  }
  return a[0].name;
}
function K6() {
  const { proxy: a, embedId: n } = H2(), [r] = L5(), o = r.get("st") || "", l = x.useMemo(
    () => U6(a) ?? (o ? z6 : null),
    [a, o]
  ), [u, f] = x.useState(null), [h, p] = x.useState("Starting up…"), [m, g] = x.useState(""), [v, b] = x.useState(!1), [k, E] = x.useState(null), A = x.useRef(!1), C = x.useRef(!0);
  if (x.useEffect(() => (C.current = !0, () => {
    C.current = !1;
  }), []), x.useEffect(() => {
    if (!o) return;
    const D = (R) => {
      const z = R.data;
      if (!z || z.type !== "astra:cmd") return;
      const Z = document.querySelector("video");
      if (Z)
        switch (z.cmd) {
          case "pause":
            Z.pause(), Z.muted = !0;
            break;
          case "resume":
            Z.muted = !1, Z.play().catch(() => {
            });
            break;
          case "mute":
            Z.muted = !0;
            break;
          case "unmute":
            Z.muted = !1;
            break;
          case "volume":
            Z.volume = Math.max(0, Math.min(1, Number(z.arg)));
            break;
          case "end":
            try {
              const W = JSON.parse(
                sessionStorage.getItem("cg-stream-session") || "null"
              );
              W?.apiSessionId && Gr(W.apiSessionId);
            } catch {
            }
            break;
        }
    };
    return window.addEventListener("message", D), () => window.removeEventListener("message", D);
  }, [o]), x.useEffect(() => {
    !l || !n || A.current || (A.current = !0, x1(), (async () => {
      try {
        try {
          const vt = JSON.parse(
            sessionStorage.getItem("cg-stream-session") || "null"
          );
          vt?.apiSessionId && (sessionStorage.removeItem("cg-stream-session"), await Gr(vt.apiSessionId));
        } catch {
        }
        if (!C.current) return;
        p("Finding your game…");
        const D = await p4();
        if (!C.current) return;
        const R = n.toLowerCase(), z = D.find((vt) => vt.embedId.toLowerCase() === R);
        if (!z) {
          g("That game isn't available.");
          return;
        }
        f(z);
        let Z = null, W, X = null;
        if (z.provider === "quaternary") {
          if (p("Checking your connection…"), l.ngMethod === "cfturn") {
            const vt = await S1();
            if (!C.current) return;
            if (vt.pools.length > 0 && vt.method !== "resi") {
              if (X = o ? rv(vt.pools) : await new Promise((bt) => {
                p("Choose a server…"), E({ pools: vt.pools, resolve: bt });
              }), !C.current) return;
              try {
                localStorage.setItem(_f, X);
              } catch {
              }
              p("Checking your connection…");
              const Tt = await H6("warp");
              if (!C.current) return;
              Tt && (Z = Tt.webrtc, W = Tt.ngRelay);
            }
          }
          if (Z || (Z = await f6()), !C.current) return;
        }
        p("Preparing your session…");
        const F = await jf(n, {
          webrtc: Z,
          byEmbedId: !0,
          ...W ? { ngRelay: W } : {},
          ...X ? { warpRegion: X } : {},
          ...o ? { streamToken: o } : {}
        });
        if (!C.current) return;
        const at = F.sessionId, rt = Date.now() + Y6;
        let pt = "";
        for (; ; ) {
          if (!C.current) return;
          if (Date.now() > rt) {
            g("This is taking longer than expected. Please try again.");
            return;
          }
          if (await new Promise((Tt) => setTimeout(Tt, P6)), !C.current) return;
          const vt = await Lf(at);
          if (!C.current) return;
          if (vt.error) {
            g(vt.error);
            return;
          }
          if (vt.statusText && p(vt.statusText), vt.ready) {
            pt = vt.stream?.gameId ?? "";
            break;
          }
        }
        const yt = {
          apiSessionId: at,
          stream: {
            gameId: pt,
            ...z.provider === "quaternary" ? { loadingVideoGameId: null } : {}
          },
          game: {
            gameId: pt,
            gameName: z.gameName,
            logo: z.logo,
            provider: z.provider
          },
          launchesLeft: null
        };
        if (sessionStorage.setItem("cg-stream-session", JSON.stringify(yt)), !C.current) return;
        b(!0);
        try {
          window.parent?.postMessage(
            { type: "astra:ready", game: z.embedId },
            "*"
          );
        } catch {
        }
      } catch (D) {
        if (!C.current) return;
        g(D instanceof Error ? D.message : "Couldn't start the game.");
        try {
          window.parent?.postMessage(
            {
              type: "astra:error",
              message: D instanceof Error ? D.message : "launch_failed"
            },
            "*"
          );
        } catch {
        }
      }
    })());
  }, [l, n]), !l) return /* @__PURE__ */ S.jsx(iv, { proxy: null, error: "Unknown embed partner." });
  if (v) return /* @__PURE__ */ S.jsx(O6, { embed: l });
  const M = (D) => {
    k?.resolve(D), E(null);
  };
  return /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
    /* @__PURE__ */ S.jsx(
      iv,
      {
        proxy: l,
        title: u?.gameName,
        status: h,
        error: m
      }
    ),
    /* @__PURE__ */ S.jsx(
      k1,
      {
        open: !!k,
        gameName: u?.gameName ?? "",
        pools: k?.pools ?? [],
        storageKey: _f,
        label: "Server region",
        description: "Pick the region nearest you for the best connection.",
        onChoose: M,
        onCancel: () => {
          k && M(rv(k.pools));
        }
      }
    )
  ] });
}
const q6 = "astra.host", ov = "astra.guest", F6 = 4500;
function G6() {
  try {
    const a = window.parent;
    if (a === window) return null;
    const n = a.document.documentElement.localName;
    return n === "svg" || n === "html" ? a : null;
  } catch {
    return null;
  }
}
G6();
function zf(a, n) {
  try {
    return n !== void 0 && localStorage.setItem(a, n), localStorage.getItem(a) || "";
  } catch {
    return n ?? "";
  }
}
function I6() {
  const a = zf(ov);
  if (/^[0-9a-f]{32}$/.test(a)) return a;
  const n = crypto.getRandomValues(new Uint8Array(16));
  return zf(
    ov,
    Array.from(n, (r) => r.toString(16).padStart(2, "0")).join("")
  );
}
function X6(a) {
  const n = String(a).trim().replace(/\/+$/, "");
  return /^https?:\/\//.test(n) ? n : "https://" + n;
}
const W6 = "X-Coursework-Uid", Q6 = {
  games: "units",
  launch: "start",
  status: "progress",
  stop: "end"
}, _1 = {
  gameId: "unitId",
  cardId: "moduleId",
  embedId: "lessonId",
  nickname: "learner",
  sessionId: "enrollmentId",
  nextSessionId: "nextEnrollmentId",
  quiz: "assessment",
  ready: "completed",
  status: "phase",
  statusText: "note",
  stopped: "ended",
  saves: "records",
  servers: "sections",
  stream: "lesson",
  answerSdp: "essay",
  turnId: "ticketId",
  pkgName: "topic",
  rawFrame: "sample",
  keymap: "glossary",
  layout: "template",
  rotation: "schedule"
}, z1 = _1, Z6 = Object.fromEntries(
  Object.entries(_1).map(([a, n]) => [n, a])
);
function fs(a, n) {
  if (Array.isArray(a)) return a.map((r) => fs(r, n));
  if (a && typeof a == "object") {
    const r = {};
    for (const [o, l] of Object.entries(a))
      r[n[o] ?? o] = fs(l, n);
    return r;
  }
  return a;
}
function U1(a, n) {
  try {
    return JSON.stringify(fs(JSON.parse(a), n));
  } catch {
    return null;
  }
}
function J6(a, n) {
  return !a || a === "?" ? a : "?" + a.slice(1).split("&").map((o) => {
    const l = o.indexOf("="), u = l === -1 ? o : o.slice(0, l), f = l === -1 ? "" : o.slice(l);
    let h = u;
    try {
      h = decodeURIComponent(u);
    } catch {
    }
    return encodeURIComponent(n[h] ?? h) + f;
  }).join("&");
}
function B1(a) {
  const n = a.indexOf("?"), r = n === -1 ? a : a.slice(0, n), o = n === -1 ? "" : J6(a.slice(n), z1);
  return r === "/api/ping" ? "/api/coursework/health" + o : r.startsWith("/api/cg/") ? "/api/coursework" + r.slice(7).replace(
    /^\/([^/]+)/,
    (l, u) => "/" + (Q6[u] ?? u)
  ) + o : a;
}
const V1 = {
  ping: "poll",
  pong: "ack",
  launch: "enroll",
  launchReady: "enrollReady",
  launchErr: "enrollErr",
  attach: "join",
  negoOut: "submitOut",
  negoIn: "submitIn",
  sig: "note",
  inputOut: "entryOut",
  inputIn: "entryIn",
  openInputRelay: "openEntry",
  inputRelayReady: "entryReady",
  inputRelayErr: "entryErr",
  stop: "finish",
  stopOk: "finishOk",
  stopErr: "finishErr",
  log: "notice"
}, H1 = {
  gameId: "unitId",
  nickname: "learner",
  sessionId: "enrollmentId",
  apiSessionId: "enrollmentRef",
  session: "record",
  raw: "body",
  error: "issue",
  ts: "at"
}, $6 = Object.fromEntries(
  Object.entries(V1).map(([a, n]) => [n, a])
), tM = Object.fromEntries(
  Object.entries(H1).map(([a, n]) => [n, a])
);
function eM(a) {
  try {
    const n = fs(JSON.parse(a), H1);
    return n && typeof n.t == "string" && (n.t = V1[n.t] ?? n.t), JSON.stringify(n);
  } catch {
    return null;
  }
}
function nM(a) {
  try {
    const n = JSON.parse(a);
    if (n && typeof n == "object") {
      const r = n;
      typeof r.t == "string" && (r.t = $6[r.t] ?? r.t);
    }
    return JSON.stringify(fs(n, tM));
  } catch {
    return null;
  }
}
function aM(a) {
  try {
    const n = new URL(a, Ji || location.href);
    if (!n.pathname.endsWith("/live-lesson")) return !1;
    for (const r of ["jy", "t", "mask", "ping", "sid"])
      if (n.searchParams.has(r)) return !1;
    return !0;
  } catch {
    return !1;
  }
}
function iM(a) {
  const n = a.send.bind(a);
  a.send = (u) => {
    n(typeof u == "string" ? eM(u) ?? u : u);
  };
  const r = (u) => (f) => {
    if (typeof f.data == "string") {
      const h = nM(f.data);
      if (h !== null && h !== f.data)
        return u.call(a, new MessageEvent("message", { data: h }));
    }
    return u.call(a, f);
  }, o = a.addEventListener.bind(a);
  a.addEventListener = ((u, f, h) => {
    u === "message" && typeof f == "function" ? o("message", r(f), h) : o(u, f, h);
  });
  let l = null;
  Object.defineProperty(a, "onmessage", {
    configurable: !0,
    get: () => l,
    set: (u) => {
      l = u, u && o("message", r(u));
    }
  });
}
let sv = !1;
function rM() {
  if (sv) return;
  sv = !0;
  const a = window.WebSocket, n = function(r, o) {
    const l = o === void 0 ? new a(r) : new a(r, o);
    return aM(String(r)) && iM(l), l;
  };
  n.prototype = a.prototype, Object.assign(n, {
    CONNECTING: a.CONNECTING,
    OPEN: a.OPEN,
    CLOSING: a.CLOSING,
    CLOSED: a.CLOSED
  }), window.WebSocket = n;
}
async function oM(a, n) {
  const r = new AbortController(), o = setTimeout(() => r.abort(), F6);
  try {
    const u = await (await fetch(`${a}${B1("/api/ping")}?n=${n}`, {
      cache: "no-store",
      mode: "cors",
      credentials: "omit",
      signal: r.signal
    })).json();
    return u.ok === !0 && u.n === n;
  } catch {
    return !1;
  } finally {
    clearTimeout(o);
  }
}
let Ji = "", Uf = "", lv = !1;
async function sM(a) {
  if (!(a.headers.get("content-type") || "").includes("application/json"))
    return a;
  const n = await a.text(), r = U1(n, Z6);
  return r === null ? new Response(n, {
    status: a.status,
    statusText: a.statusText,
    headers: a.headers
  }) : new Response(r, {
    status: a.status,
    statusText: a.statusText,
    headers: a.headers
  });
}
function lM() {
  if (lv) return;
  lv = !0;
  const a = window.fetch.bind(window);
  window.fetch = async (n, r) => {
    let o = typeof n == "string" ? n : n instanceof URL ? n.href : n.url;
    if (o.startsWith("/") && !o.startsWith("//") && (o = Ji + o), !Ji || !o.startsWith(Ji + "/")) return a(n, r);
    o = Ji + B1(o.slice(Ji.length));
    const l = new Headers(
      r?.headers ?? (n instanceof Request ? n.headers : void 0)
    );
    l.set(W6, Uf);
    let u = r?.body;
    typeof u == "string" && (u = U1(u, z1) ?? u);
    const f = { ...r, headers: l, credentials: "omit", body: u }, h = n instanceof Request ? await a(new Request(o, n), f) : await a(o, f);
    return sM(h);
  };
}
function cM(a) {
  zf(q6, a), Ji = a, Uf = I6(), Nv(a, Uf), lM(), rM();
}
async function uM(a) {
  const n = X6(a), r = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return await oM(n, r) ? (cM(n), n) : null;
}
const P1 = '@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-rotate-x:initial;--tw-rotate-y:initial;--tw-rotate-z:initial;--tw-skew-x:initial;--tw-skew-y:initial;--tw-space-y-reverse:0;--tw-divide-x-reverse:0;--tw-border-style:solid;--tw-gradient-position:initial;--tw-gradient-from:#0000;--tw-gradient-via:#0000;--tw-gradient-to:#0000;--tw-gradient-stops:initial;--tw-gradient-via-stops:initial;--tw-gradient-from-position:0%;--tw-gradient-via-position:50%;--tw-gradient-to-position:100%;--tw-leading:initial;--tw-font-weight:initial;--tw-tracking:initial;--tw-ordinal:initial;--tw-slashed-zero:initial;--tw-numeric-figure:initial;--tw-numeric-spacing:initial;--tw-numeric-fraction:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-outline-style:solid;--tw-blur:initial;--tw-brightness:initial;--tw-contrast:initial;--tw-grayscale:initial;--tw-hue-rotate:initial;--tw-invert:initial;--tw-opacity:initial;--tw-saturate:initial;--tw-sepia:initial;--tw-drop-shadow:initial;--tw-drop-shadow-color:initial;--tw-drop-shadow-alpha:100%;--tw-drop-shadow-size:initial;--tw-backdrop-blur:initial;--tw-backdrop-brightness:initial;--tw-backdrop-contrast:initial;--tw-backdrop-grayscale:initial;--tw-backdrop-hue-rotate:initial;--tw-backdrop-invert:initial;--tw-backdrop-opacity:initial;--tw-backdrop-saturate:initial;--tw-backdrop-sepia:initial;--tw-duration:initial;--tw-ease:initial;--tw-scale-x:1;--tw-scale-y:1;--tw-scale-z:1;--tw-animation-delay:0s;--tw-animation-direction:normal;--tw-animation-duration:initial;--tw-animation-fill-mode:none;--tw-animation-iteration-count:1;--tw-enter-blur:0;--tw-enter-opacity:1;--tw-enter-rotate:0;--tw-enter-scale:1;--tw-enter-translate-x:0;--tw-enter-translate-y:0;--tw-exit-blur:0;--tw-exit-opacity:1;--tw-exit-rotate:0;--tw-exit-scale:1;--tw-exit-translate-x:0;--tw-exit-translate-y:0}}}@layer theme{:root,:host{--font-sans:ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--font-mono:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;--color-red-200:oklch(88.5% .062 18.334);--color-red-300:oklch(80.8% .114 19.571);--color-red-400:oklch(70.4% .191 22.216);--color-red-500:oklch(63.7% .237 25.331);--color-amber-300:oklch(87.9% .169 91.605);--color-emerald-300:oklch(84.5% .143 164.978);--color-emerald-400:oklch(76.5% .177 163.223);--color-emerald-500:oklch(69.6% .17 162.48);--color-sky-400:oklch(74.6% .16 232.661);--color-blue-300:oklch(80.9% .105 251.813);--color-blue-500:oklch(62.3% .214 259.815);--color-indigo-400:oklch(67.3% .182 276.935);--color-violet-200:oklch(89.4% .057 293.283);--color-violet-400:oklch(70.2% .183 293.541);--color-violet-500:oklch(60.6% .25 292.717);--color-black:#000;--color-white:#fff;--spacing:.25rem;--container-xs:20rem;--container-sm:24rem;--container-md:28rem;--container-lg:32rem;--container-xl:36rem;--container-2xl:42rem;--container-3xl:48rem;--container-6xl:72rem;--text-xs:.75rem;--text-xs--line-height:calc(1 / .75);--text-sm:.875rem;--text-sm--line-height:calc(1.25 / .875);--text-base:1rem;--text-base--line-height: 1.5 ;--text-lg:1.125rem;--text-lg--line-height:calc(1.75 / 1.125);--text-2xl:1.5rem;--text-2xl--line-height:calc(2 / 1.5);--text-3xl:1.875rem;--text-3xl--line-height: 1.2 ;--text-4xl:2.25rem;--text-4xl--line-height:calc(2.5 / 2.25);--font-weight-medium:500;--font-weight-semibold:600;--font-weight-bold:700;--tracking-tight:-.025em;--tracking-wide:.025em;--tracking-wider:.05em;--tracking-widest:.1em;--leading-tight:1.25;--leading-snug:1.375;--leading-relaxed:1.625;--ease-in-out:cubic-bezier(.4, 0, .2, 1);--animate-spin:spin 1s linear infinite;--animate-ping:ping 1s cubic-bezier(0, 0, .2, 1) infinite;--animate-pulse:pulse 2s cubic-bezier(.4, 0, .6, 1) infinite;--blur-sm:8px;--blur-md:12px;--blur-xl:24px;--blur-2xl:40px;--blur-3xl:64px;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4, 0, .2, 1);--default-font-family:var(--font-sans);--default-mono-font-family:var(--font-mono);--color-foreground:var(--foreground);--color-border:var(--border)}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;tab-size:4;line-height:1.5;font-family:var(--default-font-family,ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--default-mono-font-family,ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring{outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::placeholder{opacity:1}@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){::placeholder{color:currentColor}@supports (color:color-mix(in lab,red,red)){::placeholder{color:color-mix(in oklab,currentcolor 50%,transparent)}}}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}::-webkit-calendar-picker-indicator{line-height:1}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){appearance:button}::file-selector-button{appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}*{border-color:var(--color-border)}html,body{background-color:var(--astra-bg);color:var(--color-foreground);font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;overflow-x:hidden}body{min-height:100vh}h1,h2,h3,h4{font-family:DM Sans,Inter,sans-serif}::selection{background:rgba(var(--astra-accent-rgb),.35);color:#fff}::-webkit-scrollbar{width:10px}::-webkit-scrollbar-track{background:0 0}::-webkit-scrollbar-thumb{border:3px solid var(--astra-bg);background:#ffffff1f;border-radius:99px}::-webkit-scrollbar-thumb:hover{background:#ffffff38}}@layer components{.astra-page{box-sizing:border-box;background:radial-gradient(ellipse at 50% -10%,rgba(var(--astra-halo-rgb),.28),#05070d00 55%);flex-direction:column;align-items:center;width:100%;min-height:100vh;padding:130px 48px 120px;display:flex;position:relative;overflow:hidden}.astra-title{letter-spacing:-.025em;color:#fff;text-align:center;margin:0;font-family:DM Sans,sans-serif;font-size:clamp(2.4rem,4.5vw,3.6rem);font-weight:500;line-height:1.08}.astra-title-dim{color:#ffffff4d;font-weight:300}.btn-primary{letter-spacing:-.01em;height:50px;color:var(--astra-accent-ink);background:rgba(var(--astra-accent-rgb),.95);border:1px solid rgba(var(--astra-accent-soft-rgb),.4);box-shadow:0 0 36px rgba(var(--astra-accent-rgb),.3),inset 0 1px #ffffff1f;cursor:pointer;border-radius:9999px;justify-content:center;align-items:center;gap:8px;padding:0 30px;font-family:Inter,sans-serif;font-size:15px;font-weight:600;text-decoration:none;transition:transform .15s,box-shadow .15s,background .15s;display:inline-flex}.btn-primary:hover{background:rgba(var(--astra-accent-strong-rgb),1);box-shadow:0 0 52px rgba(var(--astra-accent-rgb),.5),inset 0 1px #ffffff1f;transform:translateY(-1px)}.btn-primary:active{transform:scale(.98)}.btn-ghost{letter-spacing:-.01em;color:#ffffffa6;cursor:pointer;background:#ffffff0d;border:1px solid #ffffff1f;border-radius:9999px;justify-content:center;align-items:center;gap:8px;height:50px;padding:0 26px;font-family:Inter,sans-serif;font-size:15px;font-weight:500;text-decoration:none;transition:transform .15s,background .15s,color .15s;display:inline-flex}.btn-ghost:hover{color:#ffffffe6;background:#ffffff14;transform:translateY(-1px)}.astra-input{box-sizing:border-box;color:#fff;background:#ffffff08;border:1px solid #ffffff17;border-radius:12px;outline:none;width:100%;height:48px;padding:0 16px;font-family:Inter,sans-serif;font-size:14.5px;transition:border-color .2s,background .2s,box-shadow .2s}.astra-input::placeholder{color:#ffffff38}.astra-input:focus{border-color:rgba(var(--astra-accent-rgb),.55);background:rgba(var(--astra-accent-rgb),.05);box-shadow:0 0 0 3px rgba(var(--astra-accent-rgb),.14)}}@layer utilities{.pointer-events-auto{pointer-events:auto}.pointer-events-none{pointer-events:none}.collapse{visibility:collapse}.invisible{visibility:hidden}.visible{visibility:visible}.absolute{position:absolute}.fixed{position:fixed}.relative{position:relative}.static{position:static}.sticky{position:sticky}.inset-0{inset:0}.inset-x-0{inset-inline:0}.inset-x-5{inset-inline:calc(var(--spacing) * 5)}.inset-y-0{inset-block:0}.-top-4{top:calc(var(--spacing) * -4)}.top-0{top:0}.top-1\\/2{top:50%}.top-3{top:calc(var(--spacing) * 3)}.top-5{top:calc(var(--spacing) * 5)}.top-16{top:calc(var(--spacing) * 16)}.top-24{top:calc(var(--spacing) * 24)}.top-500{top:calc(var(--spacing) * 500)}.top-\\[-10rem\\]{top:-10rem}.top-\\[1\\.5px\\]{top:1.5px}.-right-12{right:calc(var(--spacing) * -12)}.right-0{right:0}.right-3{right:calc(var(--spacing) * 3)}.right-6{right:calc(var(--spacing) * 6)}.bottom-0{bottom:0}.bottom-3{bottom:calc(var(--spacing) * 3)}.bottom-6{bottom:calc(var(--spacing) * 6)}.bottom-24{bottom:calc(var(--spacing) * 24)}.bottom-\\[-11rem\\]{bottom:-11rem}.-left-24{left:calc(var(--spacing) * -24)}.left-0{left:0}.left-1\\/2{left:50%}.left-3{left:calc(var(--spacing) * 3)}.isolate{isolation:isolate}.-z-10{z-index:-10}.z-10{z-index:10}.z-20{z-index:20}.z-30{z-index:30}.z-50{z-index:50}.z-\\[60\\]{z-index:60}.z-\\[70\\]{z-index:70}.z-\\[100\\]{z-index:100}.z-\\[105\\]{z-index:105}.z-\\[110\\]{z-index:110}.z-\\[9000\\]{z-index:9000}.z-\\[9998\\]{z-index:9998}.z-\\[9999\\]{z-index:9999}.row-0{grid-row:0}.container{width:100%}@media(min-width:40rem){.container{max-width:40rem}}@media(min-width:48rem){.container{max-width:48rem}}@media(min-width:64rem){.container{max-width:64rem}}@media(min-width:80rem){.container{max-width:80rem}}@media(min-width:96rem){.container{max-width:96rem}}.-mx-1{margin-inline:calc(var(--spacing) * -1)}.mx-3\\.5{margin-inline:calc(var(--spacing) * 3.5)}.mx-auto{margin-inline:auto}.my-3\\.5{margin-block:calc(var(--spacing) * 3.5)}.my-5{margin-block:calc(var(--spacing) * 5)}.my-6{margin-block:calc(var(--spacing) * 6)}.mt-0\\.5{margin-top:calc(var(--spacing) * .5)}.mt-1{margin-top:var(--spacing)}.mt-1\\.5{margin-top:calc(var(--spacing) * 1.5)}.mt-2{margin-top:calc(var(--spacing) * 2)}.mt-2\\.5{margin-top:calc(var(--spacing) * 2.5)}.mt-3{margin-top:calc(var(--spacing) * 3)}.mt-4{margin-top:calc(var(--spacing) * 4)}.mt-5{margin-top:calc(var(--spacing) * 5)}.mt-6{margin-top:calc(var(--spacing) * 6)}.mt-7{margin-top:calc(var(--spacing) * 7)}.mt-8{margin-top:calc(var(--spacing) * 8)}.mt-10{margin-top:calc(var(--spacing) * 10)}.mt-px{margin-top:1px}.-mb-px{margin-bottom:-1px}.mb-1{margin-bottom:var(--spacing)}.mb-1\\.5{margin-bottom:calc(var(--spacing) * 1.5)}.mb-2{margin-bottom:calc(var(--spacing) * 2)}.mb-3{margin-bottom:calc(var(--spacing) * 3)}.mb-3\\.5{margin-bottom:calc(var(--spacing) * 3.5)}.mb-4{margin-bottom:calc(var(--spacing) * 4)}.mb-5{margin-bottom:calc(var(--spacing) * 5)}.mb-6{margin-bottom:calc(var(--spacing) * 6)}.mb-8{margin-bottom:calc(var(--spacing) * 8)}.mb-10{margin-bottom:calc(var(--spacing) * 10)}.mb-14{margin-bottom:calc(var(--spacing) * 14)}.ml-0\\.5{margin-left:calc(var(--spacing) * .5)}.ml-1\\.5{margin-left:calc(var(--spacing) * 1.5)}.ml-auto{margin-left:auto}.block{display:block}.contents{display:contents}.flex{display:flex}.grid{display:grid}.hidden{display:none}.inline{display:inline}.inline-block{display:inline-block}.inline-flex{display:inline-flex}.table{display:table}.aspect-square{aspect-ratio:1}.h-1{height:var(--spacing)}.h-1\\.5{height:calc(var(--spacing) * 1.5)}.h-2{height:calc(var(--spacing) * 2)}.h-2\\.5{height:calc(var(--spacing) * 2.5)}.h-3{height:calc(var(--spacing) * 3)}.h-3\\.5{height:calc(var(--spacing) * 3.5)}.h-4{height:calc(var(--spacing) * 4)}.h-5{height:calc(var(--spacing) * 5)}.h-6{height:calc(var(--spacing) * 6)}.h-7{height:calc(var(--spacing) * 7)}.h-8{height:calc(var(--spacing) * 8)}.h-9{height:calc(var(--spacing) * 9)}.h-10{height:calc(var(--spacing) * 10)}.h-11{height:calc(var(--spacing) * 11)}.h-12{height:calc(var(--spacing) * 12)}.h-14{height:calc(var(--spacing) * 14)}.h-16{height:calc(var(--spacing) * 16)}.h-40{height:calc(var(--spacing) * 40)}.h-44{height:calc(var(--spacing) * 44)}.h-56{height:calc(var(--spacing) * 56)}.h-\\[2px\\]{height:2px}.h-\\[4px\\]{height:4px}.h-\\[18px\\]{height:18px}.h-\\[20rem\\]{height:20rem}.h-\\[22px\\]{height:22px}.h-\\[22rem\\]{height:22rem}.h-\\[26rem\\]{height:26rem}.h-\\[28rem\\]{height:28rem}.h-\\[38px\\]{height:38px}.h-\\[72px\\]{height:72px}.h-\\[100dvh\\],.h-dvh{height:100dvh}.h-fit{height:fit-content}.h-full{height:100%}.h-lvh{height:100lvh}.h-px{height:1px}.max-h-4{max-height:calc(var(--spacing) * 4)}.max-h-44{max-height:calc(var(--spacing) * 44)}.max-h-52{max-height:calc(var(--spacing) * 52)}.max-h-60{max-height:calc(var(--spacing) * 60)}.max-h-64{max-height:calc(var(--spacing) * 64)}.max-h-72{max-height:calc(var(--spacing) * 72)}.max-h-80{max-height:calc(var(--spacing) * 80)}.max-h-\\[70vh\\]{max-height:70vh}.max-h-\\[320px\\]{max-height:320px}.max-h-full{max-height:100%}.max-h-screen{max-height:100vh}.min-h-0{min-height:0}.min-h-\\[70vh\\]{min-height:70vh}.min-h-screen{min-height:100vh}.min-h-svh{min-height:100svh}.w-1\\.5{width:calc(var(--spacing) * 1.5)}.w-2{width:calc(var(--spacing) * 2)}.w-2\\.5{width:calc(var(--spacing) * 2.5)}.w-3{width:calc(var(--spacing) * 3)}.w-3\\.5{width:calc(var(--spacing) * 3.5)}.w-4{width:calc(var(--spacing) * 4)}.w-5{width:calc(var(--spacing) * 5)}.w-6{width:calc(var(--spacing) * 6)}.w-7{width:calc(var(--spacing) * 7)}.w-8{width:calc(var(--spacing) * 8)}.w-9{width:calc(var(--spacing) * 9)}.w-10{width:calc(var(--spacing) * 10)}.w-11{width:calc(var(--spacing) * 11)}.w-12{width:calc(var(--spacing) * 12)}.w-14{width:calc(var(--spacing) * 14)}.w-20{width:calc(var(--spacing) * 20)}.w-44{width:calc(var(--spacing) * 44)}.w-56{width:calc(var(--spacing) * 56)}.w-72{width:calc(var(--spacing) * 72)}.w-\\[18px\\]{width:18px}.w-\\[22px\\]{width:22px}.w-\\[26rem\\]{width:26rem}.w-\\[28rem\\]{width:28rem}.w-\\[38px\\]{width:38px}.w-\\[72px\\]{width:72px}.w-auto{width:auto}.w-dvw{width:100dvw}.w-full{width:100%}.w-screen{width:100vw}.max-w-2xl{max-width:var(--container-2xl)}.max-w-3xl{max-width:var(--container-3xl)}.max-w-6xl{max-width:var(--container-6xl)}.max-w-\\[260px\\]{max-width:260px}.max-w-\\[480px\\]{max-width:480px}.max-w-\\[520px\\]{max-width:520px}.max-w-\\[1100px\\]{max-width:1100px}.max-w-\\[min\\(calc\\(100vw-2rem\\)\\,300px\\)\\]{max-width:min(100vw - 2rem,300px)}.max-w-\\[min\\(calc\\(100vw-2rem\\)\\,320px\\)\\]{max-width:min(100vw - 2rem,320px)}.max-w-full{max-width:100%}.max-w-lg{max-width:var(--container-lg)}.max-w-md{max-width:var(--container-md)}.max-w-screen{max-width:100vw}.max-w-sm{max-width:var(--container-sm)}.max-w-xl{max-width:var(--container-xl)}.max-w-xs{max-width:var(--container-xs)}.min-w-0{min-width:0}.min-w-\\[220px\\]{min-width:220px}.flex-1{flex:1}.flex-none{flex:none}.flex-shrink{flex-shrink:1}.flex-shrink-0{flex-shrink:0}.shrink{flex-shrink:1}.shrink-0{flex-shrink:0}.flex-grow,.grow{flex-grow:1}.border-collapse{border-collapse:collapse}.-translate-x-1\\/2{--tw-translate-x: -50% ;translate:var(--tw-translate-x) var(--tw-translate-y)}.-translate-y-1\\/2{--tw-translate-y: -50% ;translate:var(--tw-translate-x) var(--tw-translate-y)}.rotate-90{rotate:90deg}.transform{transform:var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,)}.animate-ping{animation:var(--animate-ping)}.animate-pulse{animation:var(--animate-pulse)}.animate-spin{animation:var(--animate-spin)}.cursor-auto{cursor:auto}.cursor-default{cursor:default}.cursor-not-allowed{cursor:not-allowed}.cursor-ns-resize{cursor:ns-resize}.cursor-pointer{cursor:pointer}.touch-none{touch-action:none}.resize{resize:both}.scroll-mt-24{scroll-margin-top:calc(var(--spacing) * 24)}.\\[scrollbar-width\\:thin\\]{scrollbar-width:thin}.\\[scrollbar-color\\:\\#333_transparent\\]{scrollbar-color:#333 transparent}.list-decimal{list-style-type:decimal}.appearance-none{appearance:none}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.grid-cols-\\[auto_1fr\\]{grid-template-columns:auto 1fr}.flex-col{flex-direction:column}.flex-row{flex-direction:row}.flex-wrap{flex-wrap:wrap}.items-baseline{align-items:baseline}.items-center{align-items:center}.items-end{align-items:flex-end}.items-start{align-items:flex-start}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.justify-end{justify-content:flex-end}.gap-0\\.5{gap:calc(var(--spacing) * .5)}.gap-1{gap:var(--spacing)}.gap-1\\.5{gap:calc(var(--spacing) * 1.5)}.gap-2{gap:calc(var(--spacing) * 2)}.gap-2\\.5{gap:calc(var(--spacing) * 2.5)}.gap-3{gap:calc(var(--spacing) * 3)}.gap-4{gap:calc(var(--spacing) * 4)}.gap-5{gap:calc(var(--spacing) * 5)}.gap-6{gap:calc(var(--spacing) * 6)}.gap-10{gap:calc(var(--spacing) * 10)}.gap-14{gap:calc(var(--spacing) * 14)}:where(.space-y-1>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(var(--spacing) * var(--tw-space-y-reverse));margin-block-end:calc(var(--spacing) * calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-1\\.5>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 1.5) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 1.5) * calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-2>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 2) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 2) * calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-3>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 3) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 3) * calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-3\\.5>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 3.5) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 3.5) * calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-4>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 4) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 4) * calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-6>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 6) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 6) * calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-14>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 14) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 14) * calc(1 - var(--tw-space-y-reverse)))}.gap-x-3{column-gap:calc(var(--spacing) * 3)}.gap-x-4{column-gap:calc(var(--spacing) * 4)}.gap-x-6{column-gap:calc(var(--spacing) * 6)}.gap-y-0\\.5{row-gap:calc(var(--spacing) * .5)}.gap-y-1{row-gap:var(--spacing)}.gap-y-1\\.5{row-gap:calc(var(--spacing) * 1.5)}.gap-y-2{row-gap:calc(var(--spacing) * 2)}.gap-y-2\\.5{row-gap:calc(var(--spacing) * 2.5)}.gap-y-5{row-gap:calc(var(--spacing) * 5)}:where(.divide-x>:not(:last-child)){--tw-divide-x-reverse:0;border-inline-style:var(--tw-border-style);border-inline-start-width:calc(1px * var(--tw-divide-x-reverse));border-inline-end-width:calc(1px * calc(1 - var(--tw-divide-x-reverse)))}:where(.divide-white\\/\\[0\\.06\\]>:not(:last-child)){border-color:#ffffff0f}@supports (color:color-mix(in lab,red,red)){:where(.divide-white\\/\\[0\\.06\\]>:not(:last-child)){border-color:color-mix(in oklab,var(--color-white) 6%,transparent)}}.self-stretch{align-self:stretch}.truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.overflow-auto{overflow:auto}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}.rounded{border-radius:.25rem}.rounded-2xl{border-radius:calc(var(--radius) + 8px)}.rounded-3xl{border-radius:calc(var(--radius) + 12px)}.rounded-\\[2rem\\]{border-radius:2rem}.rounded-\\[10px\\]{border-radius:10px}.rounded-full{border-radius:3.40282e38px}.rounded-lg{border-radius:var(--radius)}.rounded-md{border-radius:calc(var(--radius) - 2px)}.rounded-sm{border-radius:calc(var(--radius) - 4px)}.rounded-xl{border-radius:calc(var(--radius) + 4px)}.rounded-t-2xl{border-top-left-radius:calc(var(--radius) + 8px);border-top-right-radius:calc(var(--radius) + 8px)}.border{border-style:var(--tw-border-style);border-width:1px}.border-2{border-style:var(--tw-border-style);border-width:2px}.border-y{border-block-style:var(--tw-border-style);border-block-width:1px}.border-t{border-top-style:var(--tw-border-style);border-top-width:1px}.border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-\\[\\#1f1f1f\\]{border-color:#1f1f1f}.border-\\[\\#2e2e2e\\]{border-color:#2e2e2e}.border-\\[\\#3b82f6\\]\\/25{border-color:#3b82f640}.border-\\[\\#3b82f6\\]\\/30{border-color:#3b82f64d}.border-\\[\\#3b82f6\\]\\/35{border-color:#3b82f659}.border-\\[\\#3b82f6\\]\\/45{border-color:#3b82f673}.border-\\[\\#262626\\]{border-color:#262626}.border-\\[\\#ededed\\]{border-color:#ededed}.border-emerald-400\\/25{border-color:#00d29440}@supports (color:color-mix(in lab,red,red)){.border-emerald-400\\/25{border-color:color-mix(in oklab,var(--color-emerald-400) 25%,transparent)}}.border-red-400\\/20{border-color:#ff656833}@supports (color:color-mix(in lab,red,red)){.border-red-400\\/20{border-color:color-mix(in oklab,var(--color-red-400) 20%,transparent)}}.border-red-400\\/25{border-color:#ff656840}@supports (color:color-mix(in lab,red,red)){.border-red-400\\/25{border-color:color-mix(in oklab,var(--color-red-400) 25%,transparent)}}.border-red-400\\/30{border-color:#ff65684d}@supports (color:color-mix(in lab,red,red)){.border-red-400\\/30{border-color:color-mix(in oklab,var(--color-red-400) 30%,transparent)}}.border-transparent{border-color:#0000}.border-violet-400\\/30{border-color:#a685ff4d}@supports (color:color-mix(in lab,red,red)){.border-violet-400\\/30{border-color:color-mix(in oklab,var(--color-violet-400) 30%,transparent)}}.border-white\\/10{border-color:#ffffff1a}@supports (color:color-mix(in lab,red,red)){.border-white\\/10{border-color:color-mix(in oklab,var(--color-white) 10%,transparent)}}.border-white\\/15{border-color:#ffffff26}@supports (color:color-mix(in lab,red,red)){.border-white\\/15{border-color:color-mix(in oklab,var(--color-white) 15%,transparent)}}.border-white\\/20{border-color:#fff3}@supports (color:color-mix(in lab,red,red)){.border-white\\/20{border-color:color-mix(in oklab,var(--color-white) 20%,transparent)}}.border-white\\/\\[0\\.04\\]{border-color:#ffffff0a}@supports (color:color-mix(in lab,red,red)){.border-white\\/\\[0\\.04\\]{border-color:color-mix(in oklab,var(--color-white) 4%,transparent)}}.border-white\\/\\[0\\.05\\]{border-color:#ffffff0d}@supports (color:color-mix(in lab,red,red)){.border-white\\/\\[0\\.05\\]{border-color:color-mix(in oklab,var(--color-white) 5%,transparent)}}.border-white\\/\\[0\\.06\\]{border-color:#ffffff0f}@supports (color:color-mix(in lab,red,red)){.border-white\\/\\[0\\.06\\]{border-color:color-mix(in oklab,var(--color-white) 6%,transparent)}}.border-white\\/\\[0\\.07\\]{border-color:#ffffff12}@supports (color:color-mix(in lab,red,red)){.border-white\\/\\[0\\.07\\]{border-color:color-mix(in oklab,var(--color-white) 7%,transparent)}}.border-white\\/\\[0\\.08\\]{border-color:#ffffff14}@supports (color:color-mix(in lab,red,red)){.border-white\\/\\[0\\.08\\]{border-color:color-mix(in oklab,var(--color-white) 8%,transparent)}}.border-t-\\[\\#3b82f6\\]{border-top-color:#3b82f6}.border-t-\\[rgba\\(59\\,130\\,246\\,0\\.95\\)\\]{border-top-color:#3b82f6f2}.border-t-white\\/80{border-top-color:#fffc}@supports (color:color-mix(in lab,red,red)){.border-t-white\\/80{border-top-color:color-mix(in oklab,var(--color-white) 80%,transparent)}}.bg-\\[\\#0a0a0a\\]{background-color:#0a0a0a}.bg-\\[\\#0b0f1a\\]{background-color:#0b0f1a}.bg-\\[\\#0b0f1a\\]\\/80{background-color:#0b0f1acc}.bg-\\[\\#0e0f15\\]{background-color:#0e0f15}.bg-\\[\\#00c2ff\\]\\/20{background-color:#00c2ff33}.bg-\\[\\#3b82f6\\]{background-color:#3b82f6}.bg-\\[\\#3b82f6\\]\\/10{background-color:#3b82f61a}.bg-\\[\\#3b82f6\\]\\/15{background-color:#3b82f626}.bg-\\[\\#3b82f6\\]\\/20{background-color:#3b82f633}.bg-\\[\\#3b82f6\\]\\/\\[0\\.05\\]{background-color:#3b82f60d}.bg-\\[\\#7f5bff\\]\\/25{background-color:#7f5bff40}.bg-\\[\\#03050f\\]{background-color:#03050f}.bg-\\[\\#05070d\\]{background-color:#05070d}.bg-\\[\\#05070d\\]\\/70{background-color:#05070db3}.bg-\\[\\#5865F2\\]{background-color:#5865f2}.bg-\\[\\#161616\\]{background-color:#161616}.bg-\\[\\#ededed\\]{background-color:#ededed}.bg-amber-300{background-color:var(--color-amber-300)}.bg-black{background-color:var(--color-black)}.bg-black\\/20{background-color:#0003}@supports (color:color-mix(in lab,red,red)){.bg-black\\/20{background-color:color-mix(in oklab,var(--color-black) 20%,transparent)}}.bg-black\\/30{background-color:#0000004d}@supports (color:color-mix(in lab,red,red)){.bg-black\\/30{background-color:color-mix(in oklab,var(--color-black) 30%,transparent)}}.bg-black\\/40{background-color:#0006}@supports (color:color-mix(in lab,red,red)){.bg-black\\/40{background-color:color-mix(in oklab,var(--color-black) 40%,transparent)}}.bg-black\\/55{background-color:#0000008c}@supports (color:color-mix(in lab,red,red)){.bg-black\\/55{background-color:color-mix(in oklab,var(--color-black) 55%,transparent)}}.bg-black\\/60{background-color:#0009}@supports (color:color-mix(in lab,red,red)){.bg-black\\/60{background-color:color-mix(in oklab,var(--color-black) 60%,transparent)}}.bg-black\\/70{background-color:#000000b3}@supports (color:color-mix(in lab,red,red)){.bg-black\\/70{background-color:color-mix(in oklab,var(--color-black) 70%,transparent)}}.bg-current{background-color:currentColor}.bg-emerald-400{background-color:var(--color-emerald-400)}.bg-emerald-400\\/10{background-color:#00d2941a}@supports (color:color-mix(in lab,red,red)){.bg-emerald-400\\/10{background-color:color-mix(in oklab,var(--color-emerald-400) 10%,transparent)}}.bg-emerald-500\\/\\[0\\.07\\]{background-color:#00bb7f12}@supports (color:color-mix(in lab,red,red)){.bg-emerald-500\\/\\[0\\.07\\]{background-color:color-mix(in oklab,var(--color-emerald-500) 7%,transparent)}}.bg-red-400{background-color:var(--color-red-400)}.bg-red-500\\/10{background-color:#fb2c361a}@supports (color:color-mix(in lab,red,red)){.bg-red-500\\/10{background-color:color-mix(in oklab,var(--color-red-500) 10%,transparent)}}.bg-red-500\\/15{background-color:#fb2c3626}@supports (color:color-mix(in lab,red,red)){.bg-red-500\\/15{background-color:color-mix(in oklab,var(--color-red-500) 15%,transparent)}}.bg-sky-400{background-color:var(--color-sky-400)}.bg-transparent{background-color:#0000}.bg-violet-500\\/10{background-color:#8d54ff1a}@supports (color:color-mix(in lab,red,red)){.bg-violet-500\\/10{background-color:color-mix(in oklab,var(--color-violet-500) 10%,transparent)}}.bg-white{background-color:var(--color-white)}.bg-white\\/5{background-color:#ffffff0d}@supports (color:color-mix(in lab,red,red)){.bg-white\\/5{background-color:color-mix(in oklab,var(--color-white) 5%,transparent)}}.bg-white\\/10{background-color:#ffffff1a}@supports (color:color-mix(in lab,red,red)){.bg-white\\/10{background-color:color-mix(in oklab,var(--color-white) 10%,transparent)}}.bg-white\\/20{background-color:#fff3}@supports (color:color-mix(in lab,red,red)){.bg-white\\/20{background-color:color-mix(in oklab,var(--color-white) 20%,transparent)}}.bg-white\\/25{background-color:#ffffff40}@supports (color:color-mix(in lab,red,red)){.bg-white\\/25{background-color:color-mix(in oklab,var(--color-white) 25%,transparent)}}.bg-white\\/\\[0\\.1\\]{background-color:#ffffff1a}@supports (color:color-mix(in lab,red,red)){.bg-white\\/\\[0\\.1\\]{background-color:color-mix(in oklab,var(--color-white) 10%,transparent)}}.bg-white\\/\\[0\\.02\\]{background-color:#ffffff05}@supports (color:color-mix(in lab,red,red)){.bg-white\\/\\[0\\.02\\]{background-color:color-mix(in oklab,var(--color-white) 2%,transparent)}}.bg-white\\/\\[0\\.03\\]{background-color:#ffffff08}@supports (color:color-mix(in lab,red,red)){.bg-white\\/\\[0\\.03\\]{background-color:color-mix(in oklab,var(--color-white) 3%,transparent)}}.bg-white\\/\\[0\\.04\\]{background-color:#ffffff0a}@supports (color:color-mix(in lab,red,red)){.bg-white\\/\\[0\\.04\\]{background-color:color-mix(in oklab,var(--color-white) 4%,transparent)}}.bg-white\\/\\[0\\.06\\]{background-color:#ffffff0f}@supports (color:color-mix(in lab,red,red)){.bg-white\\/\\[0\\.06\\]{background-color:color-mix(in oklab,var(--color-white) 6%,transparent)}}.bg-white\\/\\[0\\.08\\]{background-color:#ffffff14}@supports (color:color-mix(in lab,red,red)){.bg-white\\/\\[0\\.08\\]{background-color:color-mix(in oklab,var(--color-white) 8%,transparent)}}.bg-white\\/\\[0\\.025\\]{background-color:#ffffff06}@supports (color:color-mix(in lab,red,red)){.bg-white\\/\\[0\\.025\\]{background-color:color-mix(in oklab,var(--color-white) 2.5%,transparent)}}.bg-white\\/\\[0\\.035\\]{background-color:#ffffff09}@supports (color:color-mix(in lab,red,red)){.bg-white\\/\\[0\\.035\\]{background-color:color-mix(in oklab,var(--color-white) 3.5%,transparent)}}.bg-gradient-to-b{--tw-gradient-position:to bottom in oklab;background-image:linear-gradient(var(--tw-gradient-stops))}.bg-gradient-to-br{--tw-gradient-position:to bottom right in oklab;background-image:linear-gradient(var(--tw-gradient-stops))}.bg-gradient-to-r{--tw-gradient-position:to right in oklab;background-image:linear-gradient(var(--tw-gradient-stops))}.bg-gradient-to-t{--tw-gradient-position:to top in oklab;background-image:linear-gradient(var(--tw-gradient-stops))}.bg-\\[radial-gradient\\(circle_at_center\\,rgba\\(255\\,255\\,255\\,0\\.08\\)\\,transparent_60\\%\\)\\]{background-image:radial-gradient(circle,#ffffff14,#0000 60%)}.from-\\[\\#0a0618\\]\\/95{--tw-gradient-from:oklab(14.1237% .014722 -.036426/.95);--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))}.from-\\[\\#3b82f6\\]\\/25{--tw-gradient-from:oklab(62.3083% -.0332476 -.185052/.25);--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))}.from-\\[\\#6f4bff\\]{--tw-gradient-from:#6f4bff;--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))}.from-black\\/80{--tw-gradient-from:#000c}@supports (color:color-mix(in lab,red,red)){.from-black\\/80{--tw-gradient-from:color-mix(in oklab, var(--color-black) 80%, transparent)}}.from-black\\/80{--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))}.from-blue-500{--tw-gradient-from:var(--color-blue-500);--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))}.from-transparent{--tw-gradient-from:transparent;--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))}.via-\\[\\#060410\\]\\/90{--tw-gradient-via:oklab(12.0306% .011004 -.0280887/.9);--tw-gradient-via-stops:var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-via) var(--tw-gradient-via-position), var(--tw-gradient-to) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-via-stops)}.via-black\\/20{--tw-gradient-via:#0003}@supports (color:color-mix(in lab,red,red)){.via-black\\/20{--tw-gradient-via:color-mix(in oklab, var(--color-black) 20%, transparent)}}.via-black\\/20{--tw-gradient-via-stops:var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-via) var(--tw-gradient-via-position), var(--tw-gradient-to) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-via-stops)}.via-white\\/20{--tw-gradient-via:#fff3}@supports (color:color-mix(in lab,red,red)){.via-white\\/20{--tw-gradient-via:color-mix(in oklab, var(--color-white) 20%, transparent)}}.via-white\\/20{--tw-gradient-via-stops:var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-via) var(--tw-gradient-via-position), var(--tw-gradient-to) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-via-stops)}.via-white\\/25{--tw-gradient-via:#ffffff40}@supports (color:color-mix(in lab,red,red)){.via-white\\/25{--tw-gradient-via:color-mix(in oklab, var(--color-white) 25%, transparent)}}.via-white\\/25{--tw-gradient-via-stops:var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-via) var(--tw-gradient-via-position), var(--tw-gradient-to) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-via-stops)}.to-\\[\\#3b82f6\\]\\/5{--tw-gradient-to:oklab(62.3083% -.0332476 -.185052/.05);--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))}.to-\\[\\#8f5bff\\]{--tw-gradient-to:#8f5bff;--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))}.to-\\[\\#03050f\\]\\/95{--tw-gradient-to:oklab(11.8556% -.000415087 -.0259291/.95);--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))}.to-indigo-400{--tw-gradient-to:var(--color-indigo-400);--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))}.to-transparent{--tw-gradient-to:transparent;--tw-gradient-stops:var(--tw-gradient-via-stops,var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))}.object-contain{object-fit:contain}.object-cover{object-fit:cover}.p-0\\.5{padding:calc(var(--spacing) * .5)}.p-1{padding:var(--spacing)}.p-2{padding:calc(var(--spacing) * 2)}.p-3{padding:calc(var(--spacing) * 3)}.p-3\\.5{padding:calc(var(--spacing) * 3.5)}.p-4{padding:calc(var(--spacing) * 4)}.p-5{padding:calc(var(--spacing) * 5)}.p-6{padding:calc(var(--spacing) * 6)}.px-1{padding-inline:var(--spacing)}.px-1\\.5{padding-inline:calc(var(--spacing) * 1.5)}.px-2{padding-inline:calc(var(--spacing) * 2)}.px-2\\.5{padding-inline:calc(var(--spacing) * 2.5)}.px-3{padding-inline:calc(var(--spacing) * 3)}.px-3\\.5{padding-inline:calc(var(--spacing) * 3.5)}.px-4{padding-inline:calc(var(--spacing) * 4)}.px-5{padding-inline:calc(var(--spacing) * 5)}.px-6{padding-inline:calc(var(--spacing) * 6)}.px-7{padding-inline:calc(var(--spacing) * 7)}.px-8{padding-inline:calc(var(--spacing) * 8)}.px-10{padding-inline:calc(var(--spacing) * 10)}.py-0\\.5{padding-block:calc(var(--spacing) * .5)}.py-1{padding-block:var(--spacing)}.py-1\\.5{padding-block:calc(var(--spacing) * 1.5)}.py-2{padding-block:calc(var(--spacing) * 2)}.py-2\\.5{padding-block:calc(var(--spacing) * 2.5)}.py-3{padding-block:calc(var(--spacing) * 3)}.py-3\\.5{padding-block:calc(var(--spacing) * 3.5)}.py-4{padding-block:calc(var(--spacing) * 4)}.py-5{padding-block:calc(var(--spacing) * 5)}.py-6{padding-block:calc(var(--spacing) * 6)}.py-7{padding-block:calc(var(--spacing) * 7)}.py-8{padding-block:calc(var(--spacing) * 8)}.py-9{padding-block:calc(var(--spacing) * 9)}.py-10{padding-block:calc(var(--spacing) * 10)}.py-1790957539338{padding-block:calc(var(--spacing) * 1790960000000)}.py-px{padding-block:1px}.pt-1{padding-top:var(--spacing)}.pt-2{padding-top:calc(var(--spacing) * 2)}.pt-3{padding-top:calc(var(--spacing) * 3)}.pt-4{padding-top:calc(var(--spacing) * 4)}.pt-5{padding-top:calc(var(--spacing) * 5)}.pt-6{padding-top:calc(var(--spacing) * 6)}.pt-10{padding-top:calc(var(--spacing) * 10)}.pt-12{padding-top:calc(var(--spacing) * 12)}.pt-28{padding-top:calc(var(--spacing) * 28)}.pt-32{padding-top:calc(var(--spacing) * 32)}.pr-1{padding-right:var(--spacing)}.pr-1\\.5{padding-right:calc(var(--spacing) * 1.5)}.pr-4{padding-right:calc(var(--spacing) * 4)}.pr-5{padding-right:calc(var(--spacing) * 5)}.pr-6{padding-right:calc(var(--spacing) * 6)}.pb-2{padding-bottom:calc(var(--spacing) * 2)}.pb-3{padding-bottom:calc(var(--spacing) * 3)}.pb-4{padding-bottom:calc(var(--spacing) * 4)}.pb-6{padding-bottom:calc(var(--spacing) * 6)}.pb-24{padding-bottom:calc(var(--spacing) * 24)}.pb-32{padding-bottom:calc(var(--spacing) * 32)}.pl-1{padding-left:var(--spacing)}.pl-3{padding-left:calc(var(--spacing) * 3)}.pl-5{padding-left:calc(var(--spacing) * 5)}.pl-8{padding-left:calc(var(--spacing) * 8)}.text-center{text-align:center}.text-left{text-align:left}.text-right{text-align:right}.align-middle{vertical-align:middle}.align-top{vertical-align:top}.font-mono{font-family:var(--font-mono)}.text-2xl{font-size:var(--text-2xl);line-height:var(--tw-leading,var(--text-2xl--line-height))}.text-3xl{font-size:var(--text-3xl);line-height:var(--tw-leading,var(--text-3xl--line-height))}.text-4xl{font-size:var(--text-4xl);line-height:var(--tw-leading,var(--text-4xl--line-height))}.text-base{font-size:var(--text-base);line-height:var(--tw-leading,var(--text-base--line-height))}.text-lg{font-size:var(--text-lg);line-height:var(--tw-leading,var(--text-lg--line-height))}.text-sm{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}.text-xs{font-size:var(--text-xs);line-height:var(--tw-leading,var(--text-xs--line-height))}.text-\\[0\\.85em\\]{font-size:.85em}.text-\\[10px\\]{font-size:10px}.text-\\[11\\.5px\\]{font-size:11.5px}.text-\\[11px\\]{font-size:11px}.text-\\[12\\.5px\\]{font-size:12.5px}.text-\\[12px\\]{font-size:12px}.text-\\[13\\.5px\\]{font-size:13.5px}.text-\\[13px\\]{font-size:13px}.text-\\[14px\\]{font-size:14px}.text-\\[15px\\]{font-size:15px}.text-\\[17px\\]{font-size:17px}.text-\\[20px\\]{font-size:20px}.text-\\[22px\\]{font-size:22px}.text-\\[40px\\]{font-size:40px}.leading-6{--tw-leading:calc(var(--spacing) * 6);line-height:calc(var(--spacing) * 6)}.leading-7{--tw-leading:calc(var(--spacing) * 7);line-height:calc(var(--spacing) * 7)}.leading-\\[1\\.1\\]{--tw-leading:1.1;line-height:1.1}.leading-relaxed{--tw-leading:var(--leading-relaxed);line-height:var(--leading-relaxed)}.leading-snug{--tw-leading:var(--leading-snug);line-height:var(--leading-snug)}.leading-tight{--tw-leading:var(--leading-tight);line-height:var(--leading-tight)}.font-bold{--tw-font-weight:var(--font-weight-bold);font-weight:var(--font-weight-bold)}.font-medium{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}.font-semibold{--tw-font-weight:var(--font-weight-semibold);font-weight:var(--font-weight-semibold)}.tracking-\\[-0\\.01em\\]{--tw-tracking:-.01em;letter-spacing:-.01em}.tracking-\\[-0\\.02em\\]{--tw-tracking:-.02em;letter-spacing:-.02em}.tracking-\\[0\\.12em\\]{--tw-tracking:.12em;letter-spacing:.12em}.tracking-\\[0\\.14em\\]{--tw-tracking:.14em;letter-spacing:.14em}.tracking-\\[0\\.16em\\]{--tw-tracking:.16em;letter-spacing:.16em}.tracking-\\[0\\.18em\\]{--tw-tracking:.18em;letter-spacing:.18em}.tracking-\\[0\\.24em\\]{--tw-tracking:.24em;letter-spacing:.24em}.tracking-tight{--tw-tracking:var(--tracking-tight);letter-spacing:var(--tracking-tight)}.tracking-wide{--tw-tracking:var(--tracking-wide);letter-spacing:var(--tracking-wide)}.tracking-wider{--tw-tracking:var(--tracking-wider);letter-spacing:var(--tracking-wider)}.tracking-widest{--tw-tracking:var(--tracking-widest);letter-spacing:var(--tracking-widest)}.break-all{word-break:break-all}.whitespace-nowrap{white-space:nowrap}.text-\\[\\#0a0a0a\\]{color:#0a0a0a}.text-\\[\\#5c5c5c\\]{color:#5c5c5c}.text-\\[\\#8f8f8f\\]{color:#8f8f8f}.text-\\[\\#9ec1ff\\]{color:#9ec1ff}.text-\\[\\#5865F2\\]{color:#5865f2}.text-\\[\\#a1a1a1\\]{color:#a1a1a1}.text-\\[\\#d4d4d4\\]{color:#d4d4d4}.text-\\[\\#ededed\\]{color:#ededed}.text-\\[\\#ff9691\\]{color:#ff9691}.text-blue-300\\/80{color:#90c5ffcc}@supports (color:color-mix(in lab,red,red)){.text-blue-300\\/80{color:color-mix(in oklab,var(--color-blue-300) 80%,transparent)}}.text-emerald-300{color:var(--color-emerald-300)}.text-red-200{color:var(--color-red-200)}.text-red-200\\/55{color:#ffcaca8c}@supports (color:color-mix(in lab,red,red)){.text-red-200\\/55{color:color-mix(in oklab,var(--color-red-200) 55%,transparent)}}.text-red-300{color:var(--color-red-300)}.text-red-300\\/70{color:#ffa3a3b3}@supports (color:color-mix(in lab,red,red)){.text-red-300\\/70{color:color-mix(in oklab,var(--color-red-300) 70%,transparent)}}.text-red-400{color:var(--color-red-400)}.text-violet-200{color:var(--color-violet-200)}.text-white{color:var(--color-white)}.text-white\\/20{color:#fff3}@supports (color:color-mix(in lab,red,red)){.text-white\\/20{color:color-mix(in oklab,var(--color-white) 20%,transparent)}}.text-white\\/25{color:#ffffff40}@supports (color:color-mix(in lab,red,red)){.text-white\\/25{color:color-mix(in oklab,var(--color-white) 25%,transparent)}}.text-white\\/30{color:#ffffff4d}@supports (color:color-mix(in lab,red,red)){.text-white\\/30{color:color-mix(in oklab,var(--color-white) 30%,transparent)}}.text-white\\/35{color:#ffffff59}@supports (color:color-mix(in lab,red,red)){.text-white\\/35{color:color-mix(in oklab,var(--color-white) 35%,transparent)}}.text-white\\/40{color:#fff6}@supports (color:color-mix(in lab,red,red)){.text-white\\/40{color:color-mix(in oklab,var(--color-white) 40%,transparent)}}.text-white\\/45{color:#ffffff73}@supports (color:color-mix(in lab,red,red)){.text-white\\/45{color:color-mix(in oklab,var(--color-white) 45%,transparent)}}.text-white\\/50{color:#ffffff80}@supports (color:color-mix(in lab,red,red)){.text-white\\/50{color:color-mix(in oklab,var(--color-white) 50%,transparent)}}.text-white\\/55{color:#ffffff8c}@supports (color:color-mix(in lab,red,red)){.text-white\\/55{color:color-mix(in oklab,var(--color-white) 55%,transparent)}}.text-white\\/60{color:#fff9}@supports (color:color-mix(in lab,red,red)){.text-white\\/60{color:color-mix(in oklab,var(--color-white) 60%,transparent)}}.text-white\\/65{color:#ffffffa6}@supports (color:color-mix(in lab,red,red)){.text-white\\/65{color:color-mix(in oklab,var(--color-white) 65%,transparent)}}.text-white\\/70{color:#ffffffb3}@supports (color:color-mix(in lab,red,red)){.text-white\\/70{color:color-mix(in oklab,var(--color-white) 70%,transparent)}}.text-white\\/75{color:#ffffffbf}@supports (color:color-mix(in lab,red,red)){.text-white\\/75{color:color-mix(in oklab,var(--color-white) 75%,transparent)}}.text-white\\/80{color:#fffc}@supports (color:color-mix(in lab,red,red)){.text-white\\/80{color:color-mix(in oklab,var(--color-white) 80%,transparent)}}.text-white\\/85{color:#ffffffd9}@supports (color:color-mix(in lab,red,red)){.text-white\\/85{color:color-mix(in oklab,var(--color-white) 85%,transparent)}}.text-white\\/90{color:#ffffffe6}@supports (color:color-mix(in lab,red,red)){.text-white\\/90{color:color-mix(in oklab,var(--color-white) 90%,transparent)}}.lowercase{text-transform:lowercase}.uppercase{text-transform:uppercase}.italic{font-style:italic}.tabular-nums{--tw-numeric-spacing:tabular-nums;font-variant-numeric:var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,)}.underline{text-decoration-line:underline}.decoration-\\[\\#3d3d3d\\]{text-decoration-color:#3d3d3d}.underline-offset-4{text-underline-offset:4px}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.accent-\\[\\#3b82f6\\]{accent-color:#3b82f6}.accent-white{accent-color:var(--color-white)}.opacity-0{opacity:0}.opacity-70{opacity:.7}.opacity-75{opacity:.75}.opacity-80{opacity:.8}.opacity-95{opacity:.95}.opacity-100{opacity:1}.opacity-\\[0\\.04\\]{opacity:.04}.opacity-\\[0\\.025\\]{opacity:.025}.shadow{--tw-shadow:0 1px 3px 0 var(--tw-shadow-color,#0000001a), 0 1px 2px -1px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-2xl{--tw-shadow:0 25px 50px -12px var(--tw-shadow-color,#00000040);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-\\[0_0_24px_rgba\\(59\\,130\\,246\\,0\\.25\\)\\]{--tw-shadow:0 0 24px var(--tw-shadow-color,#3b82f640);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-\\[0_14px_30px_rgba\\(93\\,68\\,255\\,0\\.45\\)\\]{--tw-shadow:0 14px 30px var(--tw-shadow-color,#5d44ff73);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-\\[0_20px_70px_rgba\\(0\\,0\\,0\\,0\\.55\\)\\]{--tw-shadow:0 20px 70px var(--tw-shadow-color,#0000008c);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-\\[inset_0_0_0_1px_rgba\\(59\\,130\\,246\\,0\\.35\\)\\]{--tw-shadow:inset 0 0 0 1px var(--tw-shadow-color,#3b82f659);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-sm{--tw-shadow:0 1px 3px 0 var(--tw-shadow-color,#0000001a), 0 1px 2px -1px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.ring,.ring-1{--tw-ring-shadow:var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color,currentcolor);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.ring-white\\/10{--tw-ring-color:#ffffff1a}@supports (color:color-mix(in lab,red,red)){.ring-white\\/10{--tw-ring-color:color-mix(in oklab, var(--color-white) 10%, transparent)}}.outline{outline-style:var(--tw-outline-style);outline-width:1px}.blur{--tw-blur:blur(8px);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.blur-3xl{--tw-blur:blur(var(--blur-3xl));filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.invert{--tw-invert:invert(100%);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.filter{filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.backdrop-blur-2xl{--tw-backdrop-blur:blur(var(--blur-2xl));-webkit-backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,)}.backdrop-blur-md{--tw-backdrop-blur:blur(var(--blur-md));-webkit-backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,)}.backdrop-blur-sm{--tw-backdrop-blur:blur(var(--blur-sm));-webkit-backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,)}.backdrop-blur-xl{--tw-backdrop-blur:blur(var(--blur-xl));-webkit-backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,)}.backdrop-filter{-webkit-backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,)}.transition{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to,opacity,box-shadow,transform,translate,scale,rotate,filter,-webkit-backdrop-filter,backdrop-filter,display,content-visibility,overlay,pointer-events;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[box-shadow\\,border-color\\]{transition-property:box-shadow,border-color;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-all{transition-property:all;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-colors{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-opacity{transition-property:opacity;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-shadow{transition-property:box-shadow;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-transform{transition-property:transform,translate,scale,rotate;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.duration-150{--tw-duration:.15s;transition-duration:.15s}.duration-200{--tw-duration:.2s;transition-duration:.2s}.duration-300{--tw-duration:.3s;transition-duration:.3s}.duration-500{--tw-duration:.5s;transition-duration:.5s}.ease-in-out{--tw-ease:var(--ease-in-out);transition-timing-function:var(--ease-in-out)}.outline-none{--tw-outline-style:none;outline-style:none}.select-none{-webkit-user-select:none;user-select:none}.\\!paused{animation-play-state:paused!important}.\\!running{animation-play-state:running!important}.paused{animation-play-state:paused}.running{animation-play-state:running}@media(hover:hover){.group-hover\\:-translate-x-0\\.5:is(:where(.group):hover *){--tw-translate-x:calc(var(--spacing) * -.5);translate:var(--tw-translate-x) var(--tw-translate-y)}.group-hover\\:translate-x-0\\.5:is(:where(.group):hover *){--tw-translate-x:calc(var(--spacing) * .5);translate:var(--tw-translate-x) var(--tw-translate-y)}}.marker\\:text-\\[\\#5c5c5c\\] ::marker{color:#5c5c5c}.marker\\:text-\\[\\#5c5c5c\\]::marker{color:#5c5c5c}.marker\\:text-\\[\\#5c5c5c\\] ::-webkit-details-marker{color:#5c5c5c}.marker\\:text-\\[\\#5c5c5c\\]::-webkit-details-marker{color:#5c5c5c}.selection\\:bg-primary\\/30 ::selection{background-color:var(--primary)}@supports (color:color-mix(in lab,red,red)){.selection\\:bg-primary\\/30 ::selection{background-color:color-mix(in oklab,var(--primary) 30%,transparent)}}.selection\\:bg-primary\\/30::selection{background-color:var(--primary)}@supports (color:color-mix(in lab,red,red)){.selection\\:bg-primary\\/30::selection{background-color:color-mix(in oklab,var(--primary) 30%,transparent)}}.selection\\:bg-white\\/10 ::selection{background-color:#ffffff1a}@supports (color:color-mix(in lab,red,red)){.selection\\:bg-white\\/10 ::selection{background-color:color-mix(in oklab,var(--color-white) 10%,transparent)}}.selection\\:bg-white\\/10::selection{background-color:#ffffff1a}@supports (color:color-mix(in lab,red,red)){.selection\\:bg-white\\/10::selection{background-color:color-mix(in oklab,var(--color-white) 10%,transparent)}}.selection\\:text-white ::selection{color:var(--color-white)}.selection\\:text-white::selection{color:var(--color-white)}.placeholder\\:text-\\[\\#5c5c5c\\]::placeholder{color:#5c5c5c}.placeholder\\:text-white\\/25::placeholder{color:#ffffff40}@supports (color:color-mix(in lab,red,red)){.placeholder\\:text-white\\/25::placeholder{color:color-mix(in oklab,var(--color-white) 25%,transparent)}}.first\\:pt-0:first-child{padding-top:0}.last\\:border-b-0:last-child{border-bottom-style:var(--tw-border-style);border-bottom-width:0}.focus-within\\:border-\\[\\#3b82f6\\]\\/70:focus-within{border-color:#3b82f6b3}.focus-within\\:bg-\\[\\#3b82f6\\]\\/5:focus-within{background-color:#3b82f60d}.focus-within\\:shadow-\\[0_0_0_3px_rgba\\(59\\,130\\,246\\,0\\.14\\)\\]:focus-within{--tw-shadow:0 0 0 3px var(--tw-shadow-color,#3b82f624);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}@media(hover:hover){.hover\\:-translate-y-px:hover{--tw-translate-y:-1px;translate:var(--tw-translate-x) var(--tw-translate-y)}.hover\\:scale-110:hover{--tw-scale-x:110%;--tw-scale-y:110%;--tw-scale-z:110%;scale:var(--tw-scale-x) var(--tw-scale-y)}.hover\\:border-\\[\\#3d3d3d\\]:hover{border-color:#3d3d3d}.hover\\:border-red-400\\/30:hover{border-color:#ff65684d}@supports (color:color-mix(in lab,red,red)){.hover\\:border-red-400\\/30:hover{border-color:color-mix(in oklab,var(--color-red-400) 30%,transparent)}}.hover\\:border-white\\/35:hover{border-color:#ffffff59}@supports (color:color-mix(in lab,red,red)){.hover\\:border-white\\/35:hover{border-color:color-mix(in oklab,var(--color-white) 35%,transparent)}}.hover\\:border-white\\/\\[0\\.12\\]:hover{border-color:#ffffff1f}@supports (color:color-mix(in lab,red,red)){.hover\\:border-white\\/\\[0\\.12\\]:hover{border-color:color-mix(in oklab,var(--color-white) 12%,transparent)}}.hover\\:border-white\\/\\[0\\.14\\]:hover{border-color:#ffffff24}@supports (color:color-mix(in lab,red,red)){.hover\\:border-white\\/\\[0\\.14\\]:hover{border-color:color-mix(in oklab,var(--color-white) 14%,transparent)}}.hover\\:bg-\\[\\#1f1f1f\\]:hover{background-color:#1f1f1f}.hover\\:bg-\\[\\#3b82f6\\]\\/20:hover{background-color:#3b82f633}.hover\\:bg-\\[\\#5c95ff\\]:hover{background-color:#5c95ff}.hover\\:bg-\\[\\#8247ff\\]:hover{background-color:#8247ff}.hover\\:bg-\\[\\#161616\\]:hover{background-color:#161616}.hover\\:bg-\\[rgba\\(255\\,80\\,80\\,0\\.18\\)\\]:hover{background-color:#ff50502e}.hover\\:bg-black\\/70:hover{background-color:#000000b3}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-black\\/70:hover{background-color:color-mix(in oklab,var(--color-black) 70%,transparent)}}.hover\\:bg-red-500\\/10:hover{background-color:#fb2c361a}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-red-500\\/10:hover{background-color:color-mix(in oklab,var(--color-red-500) 10%,transparent)}}.hover\\:bg-red-500\\/20:hover{background-color:#fb2c3633}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-red-500\\/20:hover{background-color:color-mix(in oklab,var(--color-red-500) 20%,transparent)}}.hover\\:bg-white:hover{background-color:var(--color-white)}.hover\\:bg-white\\/5:hover{background-color:#ffffff0d}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-white\\/5:hover{background-color:color-mix(in oklab,var(--color-white) 5%,transparent)}}.hover\\:bg-white\\/8:hover{background-color:#ffffff14}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-white\\/8:hover{background-color:color-mix(in oklab,var(--color-white) 8%,transparent)}}.hover\\:bg-white\\/10:hover{background-color:#ffffff1a}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-white\\/10:hover{background-color:color-mix(in oklab,var(--color-white) 10%,transparent)}}.hover\\:bg-white\\/\\[0\\.03\\]:hover{background-color:#ffffff08}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-white\\/\\[0\\.03\\]:hover{background-color:color-mix(in oklab,var(--color-white) 3%,transparent)}}.hover\\:bg-white\\/\\[0\\.04\\]:hover{background-color:#ffffff0a}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-white\\/\\[0\\.04\\]:hover{background-color:color-mix(in oklab,var(--color-white) 4%,transparent)}}.hover\\:bg-white\\/\\[0\\.06\\]:hover{background-color:#ffffff0f}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-white\\/\\[0\\.06\\]:hover{background-color:color-mix(in oklab,var(--color-white) 6%,transparent)}}.hover\\:bg-white\\/\\[0\\.08\\]:hover{background-color:#ffffff14}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-white\\/\\[0\\.08\\]:hover{background-color:color-mix(in oklab,var(--color-white) 8%,transparent)}}.hover\\:bg-white\\/\\[0\\.09\\]:hover{background-color:#ffffff17}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-white\\/\\[0\\.09\\]:hover{background-color:color-mix(in oklab,var(--color-white) 9%,transparent)}}.hover\\:text-\\[\\#5865F2\\]:hover{color:#5865f2}.hover\\:text-\\[\\#ededed\\]:hover{color:#ededed}.hover\\:text-red-200:hover{color:var(--color-red-200)}.hover\\:text-white:hover{color:var(--color-white)}.hover\\:text-white\\/55:hover{color:#ffffff8c}@supports (color:color-mix(in lab,red,red)){.hover\\:text-white\\/55:hover{color:color-mix(in oklab,var(--color-white) 55%,transparent)}}.hover\\:text-white\\/65:hover{color:#ffffffa6}@supports (color:color-mix(in lab,red,red)){.hover\\:text-white\\/65:hover{color:color-mix(in oklab,var(--color-white) 65%,transparent)}}.hover\\:text-white\\/70:hover{color:#ffffffb3}@supports (color:color-mix(in lab,red,red)){.hover\\:text-white\\/70:hover{color:color-mix(in oklab,var(--color-white) 70%,transparent)}}.hover\\:text-white\\/80:hover{color:#fffc}@supports (color:color-mix(in lab,red,red)){.hover\\:text-white\\/80:hover{color:color-mix(in oklab,var(--color-white) 80%,transparent)}}.hover\\:text-white\\/85:hover{color:#ffffffd9}@supports (color:color-mix(in lab,red,red)){.hover\\:text-white\\/85:hover{color:color-mix(in oklab,var(--color-white) 85%,transparent)}}.hover\\:underline:hover{text-decoration-line:underline}.hover\\:decoration-\\[\\#3d3d3d\\]:hover{text-decoration-color:#3d3d3d}.hover\\:decoration-\\[\\#ededed\\]:hover{text-decoration-color:#ededed}.hover\\:underline-offset-4:hover{text-underline-offset:4px}.hover\\:opacity-90:hover{opacity:.9}.hover\\:shadow-\\[0_18px_44px_rgba\\(125\\,94\\,255\\,0\\.62\\)\\]:hover{--tw-shadow:0 18px 44px var(--tw-shadow-color,#7d5eff9e);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.hover\\:shadow-\\[0_35px_90px_rgba\\(94\\,74\\,255\\,0\\.38\\)\\]:hover{--tw-shadow:0 35px 90px var(--tw-shadow-color,#5e4aff61);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.hover\\:brightness-110:hover{--tw-brightness:brightness(110%);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.hover\\:brightness-125:hover{--tw-brightness:brightness(125%);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}}.focus\\:border-\\[\\#3b82f6\\]\\/70:focus{border-color:#3b82f6b3}.focus\\:border-\\[\\#8f8f8f\\]:focus{border-color:#8f8f8f}.focus\\:bg-\\[\\#3b82f6\\]\\/5:focus{background-color:#3b82f60d}.focus\\:shadow-\\[0_0_0_3px_rgba\\(59\\,130\\,246\\,0\\.14\\)\\]:focus{--tw-shadow:0 0 0 3px var(--tw-shadow-color,#3b82f624);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.active\\:scale-95:active{--tw-scale-x:95%;--tw-scale-y:95%;--tw-scale-z:95%;scale:var(--tw-scale-x) var(--tw-scale-y)}.active\\:scale-\\[0\\.97\\]:active{scale:.97}.active\\:scale-\\[0\\.98\\]:active{scale:.98}.active\\:scale-\\[0\\.99\\]:active{scale:.99}.disabled\\:pointer-events-none:disabled{pointer-events:none}.disabled\\:cursor-not-allowed:disabled{cursor:not-allowed}.disabled\\:opacity-40:disabled{opacity:.4}.disabled\\:opacity-50:disabled{opacity:.5}.disabled\\:opacity-60:disabled{opacity:.6}@media(min-width:40rem){.sm\\:col-span-2{grid-column:span 2/span 2}.sm\\:block{display:block}.sm\\:inline{display:inline}.sm\\:w-24{width:calc(var(--spacing) * 24)}.sm\\:shrink-0{flex-shrink:0}.sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.sm\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.sm\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.sm\\:flex-row{flex-direction:row}.sm\\:items-center{align-items:center}.sm\\:items-start{align-items:flex-start}.sm\\:justify-between{justify-content:space-between}.sm\\:gap-1{gap:var(--spacing)}.sm\\:gap-2\\.5{gap:calc(var(--spacing) * 2.5)}.sm\\:gap-3{gap:calc(var(--spacing) * 3)}.sm\\:gap-8{gap:calc(var(--spacing) * 8)}.sm\\:self-center{align-self:center}.sm\\:p-6{padding:calc(var(--spacing) * 6)}.sm\\:px-4{padding-inline:calc(var(--spacing) * 4)}.sm\\:px-5{padding-inline:calc(var(--spacing) * 5)}.sm\\:px-6{padding-inline:calc(var(--spacing) * 6)}.sm\\:px-8{padding-inline:calc(var(--spacing) * 8)}.sm\\:text-4xl{font-size:var(--text-4xl);line-height:var(--tw-leading,var(--text-4xl--line-height))}.sm\\:text-\\[48px\\]{font-size:48px}}@media(min-width:48rem){.md\\:block{display:block}.md\\:hidden{display:none}.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-6{grid-template-columns:repeat(6,minmax(0,1fr))}.md\\:pt-32{padding-top:calc(var(--spacing) * 32)}}@media(min-width:64rem){.lg\\:block{display:block}.lg\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.lg\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.lg\\:grid-cols-\\[1fr_440px\\]{grid-template-columns:1fr 440px}.lg\\:grid-cols-\\[170px_1fr\\]{grid-template-columns:170px 1fr}.lg\\:items-end{align-items:flex-end}}@media(min-width:80rem){.xl\\:grid-cols-\\[1\\.25fr_1fr\\]{grid-template-columns:1.25fr 1fr}}@media(min-width:64rem){.lg\\:\\[\\&\\:nth-child\\(3\\)\\]\\:border-l:nth-child(3){border-left-style:var(--tw-border-style);border-left-width:1px}}@media(min-width:40rem){.sm\\:\\[\\&\\:nth-child\\(n\\+2\\)\\]\\:border-l:nth-child(n+2){border-left-style:var(--tw-border-style);border-left-width:1px}.sm\\:\\[\\&\\:nth-child\\(n\\+2\\)\\]\\:pl-5:nth-child(n+2){padding-left:calc(var(--spacing) * 5)}}}@property --tw-animation-delay{syntax:"*";inherits:false;initial-value:0s}@property --tw-animation-direction{syntax:"*";inherits:false;initial-value:normal}@property --tw-animation-duration{syntax:"*";inherits:false}@property --tw-animation-fill-mode{syntax:"*";inherits:false;initial-value:none}@property --tw-animation-iteration-count{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-translate-y{syntax:"*";inherits:false;initial-value:0}:root[data-theme=halloween]{--astra-accent:#ff7a18;--astra-accent-strong:#ff9440;--astra-accent-soft:#ffc081;--astra-accent-rgb:255, 122, 24;--astra-accent-strong-rgb:255, 148, 64;--astra-accent-soft-rgb:255, 192, 129;--astra-accent-ink:#2a1203;--astra-halo-rgb:109, 40, 217;--astra-bg:#0b0510;--background:oklch(11% .03 310);--foreground:oklch(97% .01 300);--card:oklch(16% .04 308);--card-foreground:oklch(97% .01 300);--popover:oklch(14% .04 308);--popover-foreground:oklch(97% .01 300);--primary:oklch(70% .19 48);--primary-foreground:oklch(20% .05 40);--secondary:oklch(22% .06 305);--secondary-foreground:oklch(97% .01 300);--muted:oklch(22% .05 305);--muted-foreground:oklch(73% .04 310);--accent:oklch(33% .12 300);--accent-foreground:oklch(98% .01 300);--destructive:oklch(50% .2 25);--destructive-foreground:oklch(98% .01 300);--border:oklch(28% .06 305);--input:oklch(22% .05 305);--ring:oklch(70% .19 48);--chart-1:oklch(70% .19 48);--chart-2:oklch(63% .17 36);--chart-3:oklch(52% .16 320);--chart-4:oklch(58% .18 300);--chart-5:oklch(42% .13 295);--sidebar:oklch(11% .03 310);--sidebar-foreground:oklch(97% .01 300);--sidebar-primary:oklch(70% .19 48);--sidebar-primary-foreground:oklch(20% .05 40);--sidebar-accent:oklch(22% .06 305);--sidebar-accent-foreground:oklch(97% .01 300);--sidebar-border:oklch(28% .06 305);--sidebar-ring:oklch(70% .19 48)}:root[data-theme=halloween].dark,:root[data-theme=halloween] .dark{--background:oklch(11% .03 310);--foreground:oklch(97% .01 300);--card:oklch(16% .04 308);--card-foreground:oklch(97% .01 300);--popover:oklch(14% .04 308);--popover-foreground:oklch(97% .01 300);--primary:oklch(70% .19 48);--primary-foreground:oklch(20% .05 40);--secondary:oklch(22% .06 305);--secondary-foreground:oklch(97% .01 300);--muted:oklch(22% .05 305);--muted-foreground:oklch(73% .04 310);--accent:oklch(33% .12 300);--accent-foreground:oklch(98% .01 300);--destructive:oklch(50% .2 25);--destructive-foreground:oklch(98% .01 300);--border:oklch(28% .06 305);--input:oklch(22% .05 305);--ring:oklch(70% .19 48)}:root[data-theme=halloween] ::-webkit-scrollbar-thumb{background:#ff7a1847}:root[data-theme=halloween] ::-webkit-scrollbar-thumb:hover{background:#ff7a1873}.hw-decor{--hw-ground: calc(100vh - 150px) ;pointer-events:none;contain:paint;position:absolute;inset:0;overflow:hidden}.hw-decor--back{z-index:0}.hw-decor--front{z-index:2}.hw-decor--over{z-index:55}.hw-web{color:#e2def033;transform-origin:50%;position:absolute}.hw-thread{color:#e2def038;transform-origin:50% 0;animation:7s ease-in-out infinite hw-sway;position:absolute;top:0}@keyframes hw-sway{0%,to{transform:rotate(-1.6deg)}50%{transform:rotate(1.6deg)}}.hw-patch{top:var(--hw-ground);align-items:flex-end;gap:10px;display:flex;position:absolute}.hw-patch--l{left:-18px}.hw-patch--r{right:-14px}@media(max-width:900px){.hw-patch,.hw-thread{display:none}.hw-web{width:108px;height:108px}}.hw-pumpkin{opacity:.55;flex:none;display:block}.hw-flicker{opacity:.85;animation:3.1s step-end infinite hw-flicker}@keyframes hw-flicker{0%{opacity:.85}11%{opacity:.86}22%{opacity:.85}31%{opacity:.93}43%{opacity:.78}52%{opacity:.85}66%{opacity:.9}74%{opacity:.85}85%{opacity:.83}to{opacity:.85}}.hw-bat{color:#120a18;opacity:.5;animation:linear infinite hw-bat-drift;position:absolute}.hw-bat svg{display:block}.hw-wing{transform-box:fill-box;animation:.42s ease-in-out infinite alternate hw-flap}.hw-wing--l{transform-origin:100% 55%}.hw-wing--r{transform-origin:0 55%}@keyframes hw-flap{0%{transform:rotate(-15deg)scaleY(.96)}to{transform:rotate(12deg)scaleY(1.04)}}@keyframes hw-bat-drift{0%{transform:translate(108vw)scale(1)}25%{transform:translate(78vw,-26px)scale(1)}50%{transform:translate(50vw,14px)scale(1)}75%{transform:translate(22vw,-18px)scale(1)}to{transform:translate(-16vw)scale(1)}}.hw-fog{filter:blur(26px);background:radial-gradient(at 50% 100%,#966ec833,#966ec800 72%);height:210px;position:absolute;left:-25%;right:-25%}.hw-fog--a{top:calc(var(--hw-ground) - 60px);animation:34s ease-in-out infinite hw-fog-a}.hw-fog--b{top:calc(var(--hw-ground) - 20px);opacity:.6;height:150px;animation:46s ease-in-out infinite hw-fog-b}@keyframes hw-fog-a{0%,to{transform:translate(-4%)}50%{transform:translate(5%)}}@keyframes hw-fog-b{0%,to{transform:translate(6%)}50%{transform:translate(-5%)}}.hw-ember{top:calc(var(--hw-ground) + 110px);background:#ffa44699;border-radius:50%;width:3px;height:3px;animation:linear infinite hw-rise;position:absolute;box-shadow:0 0 7px 2px #ff7a1880}@keyframes hw-rise{0%{opacity:0;transform:translateY(0)translate(0)}14%{opacity:1}78%{opacity:.75}to{opacity:0;transform:translateY(-190px)translate(22px)}}@media(prefers-reduced-motion:reduce){.hw-thread,.hw-flicker,.hw-bat,.hw-wing,.hw-fog--a,.hw-fog--b,.hw-ember{animation:none!important}.hw-bat{display:none}}:root{--radius:.75rem;--astra-accent:#3b82f6;--astra-accent-strong:#5c95ff;--astra-accent-soft:#9ec1ff;--astra-accent-rgb:59, 130, 246;--astra-accent-strong-rgb:92, 149, 255;--astra-accent-soft-rgb:120, 170, 255;--astra-halo-rgb:30, 64, 175;--astra-accent-ink:#fff;--astra-bg:#05070d;--background:oklch(10% .015 260);--foreground:oklch(98% .01 240);--card:oklch(15% .02 260);--card-foreground:oklch(98% .01 240);--popover:oklch(13% .02 260);--popover-foreground:oklch(98% .01 240);--primary:oklch(62% .19 259);--primary-foreground:oklch(99% .01 240);--secondary:oklch(20% .03 260);--secondary-foreground:oklch(98% .01 240);--muted:oklch(20% .03 260);--muted-foreground:oklch(72% .03 250);--accent:oklch(28% .07 260);--accent-foreground:oklch(99% .01 240);--destructive:oklch(42% .18 25);--destructive-foreground:oklch(98% .01 240);--border:oklch(26% .04 260);--input:oklch(20% .03 260);--ring:oklch(62% .19 259);--chart-1:oklch(62% .19 259);--chart-2:oklch(55% .18 260);--chart-3:oklch(45% .16 262);--chart-4:oklch(70% .15 250);--chart-5:oklch(40% .14 265);--sidebar:oklch(10% .015 260);--sidebar-foreground:oklch(98% .01 240);--sidebar-primary:oklch(62% .19 259);--sidebar-primary-foreground:oklch(99% .01 240);--sidebar-accent:oklch(20% .03 260);--sidebar-accent-foreground:oklch(98% .01 240);--sidebar-border:oklch(26% .04 260);--sidebar-ring:oklch(62% .19 259);--discord:oklch(58% .2 275);--discord-foreground:oklch(99% .01 240);--shadow-glow:0 0 40px -10px rgba(var(--astra-accent-rgb), .6)}.dark{--background:oklch(10% .015 260);--foreground:oklch(98% .01 240);--card:oklch(15% .02 260);--card-foreground:oklch(98% .01 240);--popover:oklch(13% .02 260);--popover-foreground:oklch(98% .01 240);--primary:oklch(62% .19 259);--primary-foreground:oklch(99% .01 240);--secondary:oklch(20% .03 260);--secondary-foreground:oklch(98% .01 240);--muted:oklch(20% .03 260);--muted-foreground:oklch(72% .03 250);--accent:oklch(28% .07 260);--accent-foreground:oklch(99% .01 240);--destructive:oklch(42% .18 25);--destructive-foreground:oklch(98% .01 240);--border:oklch(26% .04 260);--input:oklch(20% .03 260);--ring:oklch(62% .19 259);--discord:oklch(58% .2 275);--discord-foreground:oklch(99% .01 240)}@keyframes astra-fade-up{0%{opacity:0;filter:blur(4px);transform:translateY(20px)}to{opacity:1;filter:blur();transform:translateY(0)}}.astra-fade-up{opacity:0;animation:.8s cubic-bezier(.16,1,.3,1) forwards astra-fade-up}.footer-grid{grid-template-columns:2fr 3fr;gap:80px;display:grid}.cta-card-pad{padding:80px 64px}@media(max-width:860px){.footer-wrap{padding:40px 20px 0!important}.footer-grid{grid-template-columns:1fr;gap:40px}.cta-section{padding:0 20px 72px!important}.cta-card-pad{padding:48px 24px}}html,body{overflow-x:clip}.astra-hud-bar{-webkit-user-select:none;user-select:none;gap:.5rem}.astra-hud-bar button,.astra-hud-bar [title^="Live stream"],.astra-hud-bar .flex.items-center.gap-2.rounded-lg{white-space:nowrap;border-radius:.5rem;flex-shrink:0;height:2rem;padding-top:0;padding-bottom:0;line-height:1}.astra-hud-bar button>svg{flex-shrink:0}.astra-hud-bar [aria-expanded]{width:1.25rem;height:1.25rem;padding:0}@property --tw-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-translate-z{syntax:"*";inherits:false;initial-value:0}@property --tw-rotate-x{syntax:"*";inherits:false}@property --tw-rotate-y{syntax:"*";inherits:false}@property --tw-rotate-z{syntax:"*";inherits:false}@property --tw-skew-x{syntax:"*";inherits:false}@property --tw-skew-y{syntax:"*";inherits:false}@property --tw-space-y-reverse{syntax:"*";inherits:false;initial-value:0}@property --tw-divide-x-reverse{syntax:"*";inherits:false;initial-value:0}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-gradient-position{syntax:"*";inherits:false}@property --tw-gradient-from{syntax:"<color>";inherits:false;initial-value:#0000}@property --tw-gradient-via{syntax:"<color>";inherits:false;initial-value:#0000}@property --tw-gradient-to{syntax:"<color>";inherits:false;initial-value:#0000}@property --tw-gradient-stops{syntax:"*";inherits:false}@property --tw-gradient-via-stops{syntax:"*";inherits:false}@property --tw-gradient-from-position{syntax:"<length-percentage>";inherits:false;initial-value:0%}@property --tw-gradient-via-position{syntax:"<length-percentage>";inherits:false;initial-value:50%}@property --tw-gradient-to-position{syntax:"<length-percentage>";inherits:false;initial-value:100%}@property --tw-leading{syntax:"*";inherits:false}@property --tw-font-weight{syntax:"*";inherits:false}@property --tw-tracking{syntax:"*";inherits:false}@property --tw-ordinal{syntax:"*";inherits:false}@property --tw-slashed-zero{syntax:"*";inherits:false}@property --tw-numeric-figure{syntax:"*";inherits:false}@property --tw-numeric-spacing{syntax:"*";inherits:false}@property --tw-numeric-fraction{syntax:"*";inherits:false}@property --tw-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:"*";inherits:false}@property --tw-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:"*";inherits:false}@property --tw-inset-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:"*";inherits:false}@property --tw-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:"*";inherits:false}@property --tw-inset-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:"*";inherits:false}@property --tw-ring-offset-width{syntax:"<length>";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:"*";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-outline-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-blur{syntax:"*";inherits:false}@property --tw-brightness{syntax:"*";inherits:false}@property --tw-contrast{syntax:"*";inherits:false}@property --tw-grayscale{syntax:"*";inherits:false}@property --tw-hue-rotate{syntax:"*";inherits:false}@property --tw-invert{syntax:"*";inherits:false}@property --tw-opacity{syntax:"*";inherits:false}@property --tw-saturate{syntax:"*";inherits:false}@property --tw-sepia{syntax:"*";inherits:false}@property --tw-drop-shadow{syntax:"*";inherits:false}@property --tw-drop-shadow-color{syntax:"*";inherits:false}@property --tw-drop-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-drop-shadow-size{syntax:"*";inherits:false}@property --tw-backdrop-blur{syntax:"*";inherits:false}@property --tw-backdrop-brightness{syntax:"*";inherits:false}@property --tw-backdrop-contrast{syntax:"*";inherits:false}@property --tw-backdrop-grayscale{syntax:"*";inherits:false}@property --tw-backdrop-hue-rotate{syntax:"*";inherits:false}@property --tw-backdrop-invert{syntax:"*";inherits:false}@property --tw-backdrop-opacity{syntax:"*";inherits:false}@property --tw-backdrop-saturate{syntax:"*";inherits:false}@property --tw-backdrop-sepia{syntax:"*";inherits:false}@property --tw-duration{syntax:"*";inherits:false}@property --tw-ease{syntax:"*";inherits:false}@property --tw-scale-x{syntax:"*";inherits:false;initial-value:1}@property --tw-scale-y{syntax:"*";inherits:false;initial-value:1}@property --tw-scale-z{syntax:"*";inherits:false;initial-value:1}@keyframes spin{to{transform:rotate(360deg)}}@keyframes ping{75%,to{opacity:0;transform:scale(2)}}@keyframes pulse{50%{opacity:.5}}', wM = "202611030101";
function dM(a) {
  return a.enrollmentToken ?? a.streamToken ?? "";
}
function fM(a) {
  return a.lesson?.id ?? a.app?.id ?? "";
}
function hM(a) {
  return (a.session?.origin ?? a.stream?.origin ?? "").replace(/\/+$/, "");
}
function pM(a) {
  if (document.getElementById("astra-sdk-props")) return;
  const n = a.match(/@property\s+--[\w-]+\s*\{[^}]*\}/g);
  if (!n?.length) return;
  const r = document.createElement("style");
  r.id = "astra-sdk-props", r.textContent = n.join(`
`), document.head.appendChild(r);
}
const mM = P1.replace(/:root(?![\w-])/g, ":root, :host") + // The player is written for a full page (h-dvh / w-screen). In the SDK it
// fills the partner's element instead, so viewport sizes become 100%.
`
.h-dvh,.h-screen,.h-svh,.h-lvh{height:100%!important}
.min-h-dvh,.min-h-screen,.min-h-svh{min-height:100%!important}
.max-h-dvh,.max-h-screen{max-height:100%!important}
.w-screen,.w-dvw{width:100%!important}
.max-w-screen{max-width:100%!important}`;
function gM({ onExit: a }) {
  return x.useEffect(a, [a]), null;
}
function yM() {
  try {
    return JSON.parse(
      sessionStorage.getItem("cg-stream-session") || "null"
    )?.apiSessionId ?? "";
  } catch {
    return "";
  }
}
async function xM(a, n, r) {
  const o = hM(n);
  if (r("connecting", { lesson: n.lesson ?? n.app }), o === location.origin)
    Nv(o);
  else if (!await uM(o)) throw new Error(`Astra host unreachable: ${o}`);
  pM(P1);
  const l = a.shadowRoot ?? a.attachShadow({ mode: "open" });
  l.innerHTML = "";
  const u = document.createElement("style");
  u.textContent = mM;
  const f = document.createElement("div");
  f.className = "dark", f.style.cssText = // translateZ makes this the containing block for the player's
  // `position: fixed` overlays, so they stay inside the customer's element
  // instead of covering their whole page.
  "position:relative;width:100%;height:100%;overflow:hidden;background:#000;color:#fff;transform:translateZ(0);", l.append(u, f), Jy(f);
  const h = (b) => {
    if (b.source !== window) return;
    const k = b.data;
    if (!k || typeof k.type != "string" || !k.type.startsWith("astra:"))
      return;
    const E = k.type.slice(6);
    (E === "ready" || E === "ended" || E === "error") && r(E, k);
  };
  window.addEventListener("message", h);
  const p = t2.createRoot(f), m = `/embed/sdk/${encodeURIComponent(fM(n))}?st=${encodeURIComponent(dM(n))}`;
  p.render(
    /* @__PURE__ */ S.jsx(C6, { children: /* @__PURE__ */ S.jsx(t5, { initialEntries: [m], children: /* @__PURE__ */ S.jsxs(n5, { children: [
      /* @__PURE__ */ S.jsx(tf, { path: "/embed/sdk/:embedId", element: /* @__PURE__ */ S.jsx(K6, {}) }),
      /* @__PURE__ */ S.jsx(tf, { path: "*", element: /* @__PURE__ */ S.jsx(gM, { onExit: () => r("ended") }) })
    ] }) }) })
  );
  const g = () => l.querySelector("video");
  let v = !1;
  return {
    pause() {
      const b = g();
      b && (b.pause(), b.muted = !0);
    },
    resume() {
      const b = g();
      b && (b.muted = !1, b.play().catch(() => {
      }));
    },
    mute() {
      const b = g();
      b && (b.muted = !0);
    },
    unmute() {
      const b = g();
      b && (b.muted = !1);
    },
    setVolume(b) {
      const k = g();
      k && (k.volume = Math.max(0, Math.min(1, Number(b) || 0)));
    },
    fullscreen() {
      a.requestFullscreen?.().catch(() => {
      });
    },
    end() {
      const b = yM();
      b && Gr(b).catch(() => {
      }), r("ended", { reason: "end" });
    },
    destroy() {
      v || (v = !0, window.removeEventListener("message", h), p.unmount(), Jy(null), l.innerHTML = "");
    }
  };
}
export {
  xM as mount,
  wM as version
};
