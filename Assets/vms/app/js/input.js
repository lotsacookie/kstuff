/**
 * Captures touch/mouse/keyboard input on the game canvas and converts to
 * normalized messages for the server.
 *
 * Supports three keymap modes (configured per-game):
 *   1. joystick — WASD simulates a virtual touch joystick at a fixed screen position
 *   2. buttons  — keys mapped to tap a specific screen position
 *   3. swipe    — keys mapped to swipe gestures (up/down/left/right)
 *
 * All other keys are forwarded as Android keycodes.
 */

// ============================================
// Browser key code → Android AKEYCODE mapping
// ============================================
const KEY_MAP = {
  KeyA: 29, KeyB: 30, KeyC: 31, KeyD: 32, KeyE: 33, KeyF: 34,
  KeyG: 35, KeyH: 36, KeyI: 37, KeyJ: 38, KeyK: 39, KeyL: 40,
  KeyM: 41, KeyN: 42, KeyO: 43, KeyP: 44, KeyQ: 45, KeyR: 46,
  KeyS: 47, KeyT: 48, KeyU: 49, KeyV: 50, KeyW: 51, KeyX: 52,
  KeyY: 53, KeyZ: 54,
  Digit0: 7, Digit1: 8, Digit2: 9, Digit3: 10, Digit4: 11,
  Digit5: 12, Digit6: 13, Digit7: 14, Digit8: 15, Digit9: 16,
  F1: 131, F2: 132, F3: 133, F4: 134, F5: 135, F6: 136,
  F7: 137, F8: 138, F9: 139, F10: 140, F11: 141, F12: 142,
  ArrowUp: 19, ArrowDown: 20, ArrowLeft: 21, ArrowRight: 22,
  Enter: 66, Space: 62, Backspace: 67, Tab: 61, Escape: 111,
  Delete: 112, Home: 122, End: 123, PageUp: 92, PageDown: 93,
  Insert: 124,
  ShiftLeft: 59, ShiftRight: 60,
  ControlLeft: 113, ControlRight: 114,
  AltLeft: 57, AltRight: 58,
  Comma: 55, Period: 56, Slash: 76, Backslash: 73,
  Semicolon: 74, Quote: 75, BracketLeft: 71, BracketRight: 72,
  Minus: 69, Equal: 70, Backquote: 68,
  Numpad0: 144, Numpad1: 145, Numpad2: 146, Numpad3: 147,
  Numpad4: 148, Numpad5: 149, Numpad6: 150, Numpad7: 151,
  Numpad8: 152, Numpad9: 153,
  NumpadAdd: 157, NumpadSubtract: 156,
  NumpadMultiply: 155, NumpadDivide: 154,
  NumpadDecimal: 158, NumpadEnter: 160,
  CapsLock: 115, NumLock: 143, ScrollLock: 116,
};

const META_SHIFT = 1;
const META_CTRL = 0x1000;
const META_ALT = 0x02;

// Joystick WASD + Arrow keys
const JOYSTICK_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"]);

export class InputCapture {
  /**
   * @param {HTMLCanvasElement|HTMLVideoElement} canvas
   * @param {object|null} keymap - Per-game keymap config from server (phone mode only)
   * @param {object} options
   * @param {boolean} options.pcMode - PC mode: direct mouse/keyboard, no joystick/calibration
   */
  constructor(canvas, keymap = null, options = {}) {
    this.canvas = canvas;
    /** @type {((msg: object) => void)|null} */
    this.onInput = null;
    this.pointerDown = false;
    this.keymap = keymap;
    this.pcMode = options.pcMode || false;

    // Joystick state: which WASD/Arrow keys are currently held
    this._joystickKeys = {
      KeyW: false, KeyA: false, KeyS: false, KeyD: false,
      ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
    };
    this._joystickActive = false;
    this._joystickInterval = null;

    // Button hold state
    this._heldButtons = new Set();

    // Pointer IDs for multi-touch: 0=mouse, 1=joystick, 2+=buttons
    this._buttonPointerIds = {};  // code → pointerId
    this._nextButtonPointerId = 2;

    // Swipe state
    this._swipeActive = false;

    // Zoom (scroll wheel → pinch gesture) state
    this._zoomActive = false;
    this._zoomDistance = 0.06;  // current distance between virtual fingers
    this._zoomTimer = null;
    this._zoomPointerA = 10;   // pointer IDs reserved for zoom
    this._zoomPointerB = 11;

    // Right mouse button tracking (PC mode)
    this._rightDown = false;
    // Throttle mousemove (PC mode) — limit to ~60 updates/sec
    this._lastMoveTime = 0;

    // Type mode: when true, keymap is bypassed and all keys go as Android keycodes
    // Default to TYPE — login/typing screens come first, server will switch to PLAY when keyboard hides
    this._typeMode = true;
    /** @type {((typing: boolean) => void)|null} */
    this.onTypeModeChange = null;

    // Store bound handlers so destroy() can remove them
    this._handlers = {};

    if (!this.pcMode) this._loadCalibration();
    this.setupListeners();
  }

  setupListeners() {
    const canvas = this.canvas;

    // Make canvas focusable for keyboard events
    canvas.setAttribute("tabindex", "0");
    canvas.style.outline = "none";

    // Store all handlers so they can be removed in destroy()
    const h = this._handlers;

    h.touchstart = (e) => e.preventDefault();
    h.touchmove = (e) => e.preventDefault();
    h.touchend = (e) => e.preventDefault();

    h.pointerdown = (e) => {
      canvas.focus();

      if (this.pcMode) {
        // PC mode: send actual mouse button events
        const { xPercent, yPercent } = this.getPercentCoords(e);
        if (e.button === 0) {
          // Left click
          this.pointerDown = true;
          canvas.setPointerCapture(e.pointerId);
          console.log(`[Input] Left DOWN at (${xPercent.toFixed(3)}, ${yPercent.toFixed(3)})`);
          this.onInput?.({ type: "drag", action: "start", xPercent, yPercent });
        } else if (e.button === 2) {
          // Right click
          this._rightDown = true;
          canvas.setPointerCapture(e.pointerId);
          console.log(`[Input] Right DOWN at (${xPercent.toFixed(3)}, ${yPercent.toFixed(3)})`);
          this.onInput?.({ type: "rightclick", action: "down", xPercent, yPercent });
        }
        return;
      }

      // Phone mode: right-click calibrates jump button position
      if (e.button === 2) {
        const { xPercent, yPercent } = this.getPercentCoords(e);
        this._calibrateButton("Space", xPercent, yPercent);
        return;
      }

      this.pointerDown = true;
      canvas.setPointerCapture(e.pointerId);
      const { xPercent, yPercent } = this.getPercentCoords(e);
      console.log(`[Input] Mouse DOWN at (${xPercent.toFixed(3)}, ${yPercent.toFixed(3)})`);
      this.onInput?.({ type: "drag", action: "start", xPercent, yPercent });
    };

    h.pointermove = (e) => {
      if (this.pcMode) {
        // Throttle to ~60fps to avoid flooding WebSocket
        const now = performance.now();
        if (now - this._lastMoveTime < 16) return;
        this._lastMoveTime = now;

        const { xPercent, yPercent } = this.getPercentCoords(e);
        if (this.pointerDown) {
          this.onInput?.({ type: "drag", action: "move", xPercent, yPercent });
        } else if (this._rightDown) {
          this.onInput?.({ type: "rightclick", action: "move", xPercent, yPercent });
        } else {
          this.onInput?.({ type: "mousemove", xPercent, yPercent });
        }
        return;
      }
      if (!this.pointerDown) return;
      const { xPercent, yPercent } = this.getPercentCoords(e);
      this.onInput?.({ type: "drag", action: "move", xPercent, yPercent });
    };

    h.pointerup = (e) => {
      const { xPercent, yPercent } = this.getPercentCoords(e);
      if (this.pcMode && e.button === 2) {
        this._rightDown = false;
        console.log(`[Input] Right UP at (${xPercent.toFixed(3)}, ${yPercent.toFixed(3)})`);
        this.onInput?.({ type: "rightclick", action: "up", xPercent, yPercent });
        return;
      }
      if (!this.pointerDown) return;
      this.pointerDown = false;
      console.log(`[Input] Left UP at (${xPercent.toFixed(3)}, ${yPercent.toFixed(3)})`);
      this.onInput?.({ type: "drag", action: "end", xPercent, yPercent });
    };

    h.pointercancel = (e) => {
      if (this.pcMode && this._rightDown) {
        this._rightDown = false;
        const { xPercent, yPercent } = this.getPercentCoords(e);
        this.onInput?.({ type: "rightclick", action: "up", xPercent, yPercent });
      }
      if (!this.pointerDown) return;
      this.pointerDown = false;
      const { xPercent, yPercent } = this.getPercentCoords(e);
      this.onInput?.({ type: "drag", action: "cancel", xPercent, yPercent });
    };

    h.contextmenu = (e) => e.preventDefault();

    h.wheel = (e) => {
      e.preventDefault();
      if (this.pcMode) {
        // PC mode: send actual scroll event
        const { xPercent, yPercent } = this.getPercentCoords(e);
        this.onInput?.({ type: "scroll", deltaY: e.deltaY, xPercent, yPercent });
        return;
      }
      this.handleZoom(e);
    };

    h.keydown = (e) => this.handleKeyDown(e);
    h.keyup = (e) => this.handleKeyUp(e);

    // Prevent default touch behaviors
    canvas.addEventListener("touchstart", h.touchstart, { passive: false });
    canvas.addEventListener("touchmove", h.touchmove, { passive: false });
    canvas.addEventListener("touchend", h.touchend, { passive: false });

    // Pointer events (mouse/touch → drag)
    canvas.addEventListener("pointerdown", h.pointerdown);
    canvas.addEventListener("pointermove", h.pointermove);
    canvas.addEventListener("pointerup", h.pointerup);
    canvas.addEventListener("pointercancel", h.pointercancel);
    canvas.addEventListener("contextmenu", h.contextmenu);

    // Scroll wheel → pinch zoom
    canvas.addEventListener("wheel", h.wheel, { passive: false });

    // Keyboard
    canvas.addEventListener("keydown", h.keydown);
    canvas.addEventListener("keyup", h.keyup);
  }

  // ============================================
  // Key event routing
  // ============================================

  handleKeyDown(e) {
    const code = e.code;

    // PC mode: prevent ALL defaults and send raw key codes to Windows
    if (this.pcMode) {
      e.preventDefault();
      if (e.repeat) return; // Ignore browser key repeat — Windows holds the key from initial keydown
      this.onInput?.({ type: "key", action: "down", code, key: e.key, shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey });
      return;
    }

    // Toggle type mode with Backquote (` key)
    // Type mode = all keys sent as Android keycodes (for typing in text fields)
    // Play mode = WASD/Space intercepted by keymap (for gameplay)
    if (code === "Backquote" && this.keymap) {
      e.preventDefault();
      this._typeMode = !this._typeMode;
      // Release joystick if switching to type mode
      if (this._typeMode && this._joystickActive) {
        this._joystickKeys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };
        this.updateJoystick();
      }
      console.log(`[Input] ${this._typeMode ? "⌨ TYPE mode (keyboard)" : "🎮 PLAY mode (joystick)"}`);
      this.onTypeModeChange?.(this._typeMode);
      return;
    }

    // In type mode or no keymap: skip keymap, send all as Android keycodes
    if (this._typeMode || !this.keymap) {
      const keyCode = KEY_MAP[code];
      if (keyCode === undefined) return;
      e.preventDefault();
      this.onInput?.({
        type: "key",
        action: "down",
        keyCode,
        metaState: this.getMetaState(e),
      });
      return;
    }

    // --- Play mode (keymap active) ---

    // 1. Joystick (WASD/Arrows → virtual touch joystick)
    if (this.keymap.joystick && JOYSTICK_KEYS.has(code)) {
      e.preventDefault();
      if (!this._joystickKeys[code]) console.log(`[Input] Joystick: ${code}`);
      this._joystickKeys[code] = true;
      this.updateJoystick();
      return;
    }

    // 2. Button tap (key → touch at fixed position, each button gets its own pointer ID)
    if (this.keymap.buttons?.[code]) {
      e.preventDefault();
      if (!this._heldButtons.has(code)) {
        this._heldButtons.add(code);
        // Assign a unique pointer ID for this button
        if (!(code in this._buttonPointerIds)) {
          this._buttonPointerIds[code] = this._nextButtonPointerId++;
        }
        const btn = this.keymap.buttons[code];
        const pid = this._buttonPointerIds[code];
        console.log(`[Input] Button DOWN: ${code} → tap (${btn.x}, ${btn.y}) pid=${pid}`);
        this.onInput?.({ type: "drag", action: "start", xPercent: btn.x, yPercent: btn.y, pointerId: pid });
      }
      return;
    }

    // 3. Swipe (key → swipe gesture)
    if (this.keymap.swipe?.[code]) {
      e.preventDefault();
      if (!this._swipeActive) {
        this._swipeActive = true;
        this.doSwipe(this.keymap.swipe[code]);
      }
      return;
    }

    // 4. Regular Android keycode (unmapped keys always pass through)
    const keyCode = KEY_MAP[code];
    if (keyCode === undefined) return;
    e.preventDefault();
    this.onInput?.({
      type: "key",
      action: "down",
      keyCode,
      metaState: this.getMetaState(e),
    });
  }

  handleKeyUp(e) {
    const code = e.code;

    // Always prevent browser defaults for these keys
    if (code === "Space" || code === "Tab" || code.startsWith("Arrow") || code.startsWith("F") && !e.ctrlKey) {
      e.preventDefault();
    }

    // PC mode: send raw browser key codes directly
    if (this.pcMode) {
      e.preventDefault();
      this.onInput?.({ type: "key", action: "up", code, key: e.key, shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey });
      return;
    }

    // Ignore toggle key release
    if (code === "Backquote") {
      e.preventDefault();
      return;
    }

    // In type mode or no keymap: send as Android keycode
    if (this._typeMode || !this.keymap) {
      const keyCode = KEY_MAP[code];
      if (keyCode === undefined) return;
      e.preventDefault();
      this.onInput?.({
        type: "key",
        action: "up",
        keyCode,
        metaState: this.getMetaState(e),
      });
      return;
    }

    // --- Play mode ---

    // 1. Joystick release
    if (this.keymap.joystick && JOYSTICK_KEYS.has(code)) {
      e.preventDefault();
      this._joystickKeys[code] = false;
      this.updateJoystick();
      return;
    }

    // 2. Button release
    if (this.keymap.buttons?.[code]) {
      e.preventDefault();
      if (this._heldButtons.has(code)) {
        this._heldButtons.delete(code);
        const btn = this.keymap.buttons[code];
        const pid = this._buttonPointerIds[code] ?? 0;
        console.log(`[Input] Button UP: ${code} → release (${btn.x}, ${btn.y}) pid=${pid}`);
        this.onInput?.({ type: "drag", action: "end", xPercent: btn.x, yPercent: btn.y, pointerId: pid });
      }
      return;
    }

    // 3. Swipe release
    if (this.keymap.swipe?.[code]) {
      e.preventDefault();
      this._swipeActive = false;
      return;
    }

    // 4. Regular Android keycode
    const keyCode = KEY_MAP[code];
    if (keyCode === undefined) return;
    e.preventDefault();
    this.onInput?.({
      type: "key",
      action: "up",
      keyCode,
      metaState: this.getMetaState(e),
    });
  }

  // ============================================
  // Virtual Joystick (WASD → touch drag)
  // ============================================

  updateJoystick() {
    const js = this.keymap.joystick;
    const k = this._joystickKeys;
    const anyHeld = k.KeyW || k.KeyA || k.KeyS || k.KeyD ||
                    k.ArrowUp || k.ArrowLeft || k.ArrowDown || k.ArrowRight;

    if (anyHeld) {
      // Calculate direction from held keys (WASD and arrows combine)
      let dx = 0, dy = 0;
      if (k.KeyW || k.ArrowUp) dy -= 1;
      if (k.KeyS || k.ArrowDown) dy += 1;
      if (k.KeyA || k.ArrowLeft) dx -= 1;
      if (k.KeyD || k.ArrowRight) dx += 1;

      // Normalize diagonal so it doesn't move faster
      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
      }

      // Target = joystick center + direction * radius
      const xPercent = js.x + dx * js.radius;
      const yPercent = js.y + dy * js.radius;

      if (!this._joystickActive) {
        // Touch down at center, then move to direction
        this._joystickActive = true;
        this.onInput?.({ type: "drag", action: "start", xPercent: js.x, yPercent: js.y, pointerId: 1 });
        setTimeout(() => {
          if (this._joystickActive) {
            this.onInput?.({ type: "drag", action: "move", xPercent, yPercent, pointerId: 1 });
          }
        }, 16);
      } else {
        // Direction change
        this.onInput?.({ type: "drag", action: "move", xPercent, yPercent, pointerId: 1 });
      }

      // Keep sending move events (some games need continuous input)
      this.stopJoystickInterval();
      this._joystickInterval = setInterval(() => {
        if (!this._joystickActive) return;
        const kk = this._joystickKeys;
        let ddx = 0, ddy = 0;
        if (kk.KeyW || kk.ArrowUp) ddy -= 1;
        if (kk.KeyS || kk.ArrowDown) ddy += 1;
        if (kk.KeyA || kk.ArrowLeft) ddx -= 1;
        if (kk.KeyD || kk.ArrowRight) ddx += 1;
        if (ddx !== 0 && ddy !== 0) {
          const l = Math.sqrt(ddx * ddx + ddy * ddy);
          ddx /= l;
          ddy /= l;
        }
        this.onInput?.({
          type: "drag",
          action: "move",
          xPercent: js.x + ddx * js.radius,
          yPercent: js.y + ddy * js.radius,
          pointerId: 1,
        });
      }, 50); // 20 updates/sec
    } else {
      // All released: lift touch
      if (this._joystickActive) {
        this._joystickActive = false;
        this.stopJoystickInterval();
        this.onInput?.({ type: "drag", action: "end", xPercent: js.x, yPercent: js.y, pointerId: 1 });
      }
    }
  }

  stopJoystickInterval() {
    if (this._joystickInterval) {
      clearInterval(this._joystickInterval);
      this._joystickInterval = null;
    }
  }

  // ============================================
  // Swipe (key → fast touch drag gesture)
  // ============================================

  doSwipe(direction) {
    const cx = 0.5, cy = 0.5;
    const dist = 0.2; // 20% of screen
    let ex = cx, ey = cy;

    switch (direction) {
      case "up":    ey = cy - dist; break;
      case "down":  ey = cy + dist; break;
      case "left":  ex = cx - dist; break;
      case "right": ex = cx + dist; break;
    }

    this.onInput?.({ type: "drag", action: "start", xPercent: cx, yPercent: cy });
    setTimeout(() => {
      this.onInput?.({ type: "drag", action: "move", xPercent: ex, yPercent: ey });
      setTimeout(() => {
        this.onInput?.({ type: "drag", action: "end", xPercent: ex, yPercent: ey });
        this._swipeActive = false;
      }, 50);
    }, 30);
  }

  // ============================================
  // Zoom (scroll wheel → pinch gesture)
  // ============================================

  handleZoom(e) {
    const step = 0.012;       // distance change per scroll tick
    const minDist = 0.02;
    const maxDist = 0.20;
    const cx = 0.5, cy = 0.5; // pinch center (screen center)

    const pidA = this._zoomPointerA;
    const pidB = this._zoomPointerB;

    if (!this._zoomActive) {
      // Start pinch — touch down two fingers
      this._zoomActive = true;
      this._zoomDistance = 0.06;
      this.onInput?.({ type: "drag", action: "start", xPercent: cx - this._zoomDistance, yPercent: cy, pointerId: pidA });
      this.onInput?.({ type: "drag", action: "start", xPercent: cx + this._zoomDistance, yPercent: cy, pointerId: pidB });
    }

    // Adjust distance: scroll up (deltaY < 0) = zoom in = spread fingers
    if (e.deltaY < 0) {
      this._zoomDistance = Math.min(maxDist, this._zoomDistance + step);
    } else {
      this._zoomDistance = Math.max(minDist, this._zoomDistance - step);
    }

    // Move both fingers
    this.onInput?.({ type: "drag", action: "move", xPercent: cx - this._zoomDistance, yPercent: cy, pointerId: pidA });
    this.onInput?.({ type: "drag", action: "move", xPercent: cx + this._zoomDistance, yPercent: cy, pointerId: pidB });

    // End pinch after 200ms of no scrolling
    clearTimeout(this._zoomTimer);
    this._zoomTimer = setTimeout(() => {
      this.onInput?.({ type: "drag", action: "end", xPercent: cx - this._zoomDistance, yPercent: cy, pointerId: pidA });
      this.onInput?.({ type: "drag", action: "end", xPercent: cx + this._zoomDistance, yPercent: cy, pointerId: pidB });
      this._zoomActive = false;
    }, 200);
  }

  // ============================================
  // Button calibration (right-click to set position)
  // ============================================

  _loadCalibration() {
    if (!this.keymap?.buttons) return;
    try {
      const saved = localStorage.getItem("btn-calibration");
      if (saved) {
        const map = JSON.parse(saved);
        for (const [code, pos] of Object.entries(map)) {
          if (this.keymap.buttons[code]) {
            this.keymap.buttons[code].x = pos.x;
            this.keymap.buttons[code].y = pos.y;
            console.log(`[Input] Loaded calibration: ${code} → (${pos.x.toFixed(3)}, ${pos.y.toFixed(3)})`);
          }
        }
      }
    } catch {}
  }

  _calibrateButton(code, x, y) {
    if (!this.keymap?.buttons?.[code]) return;
    this.keymap.buttons[code].x = x;
    this.keymap.buttons[code].y = y;
    try {
      const saved = JSON.parse(localStorage.getItem("btn-calibration") || "{}");
      saved[code] = { x, y };
      localStorage.setItem("btn-calibration", JSON.stringify(saved));
    } catch {}
    console.log(`[Input] ✓ Calibrated ${code} → (${x.toFixed(3)}, ${y.toFixed(3)})`);
  }

  // ============================================
  // Helpers
  // ============================================

  getPercentCoords(e) {
    const rect = this.canvas.getBoundingClientRect();

    // Account for object-fit: contain letterboxing.
    // The canvas bitmap may not fill the entire CSS box — calculate
    // where the actual rendered content sits within the box.
    // Support both <canvas> (bitmap dimensions) and <video> (intrinsic video dimensions)
    const cw = this.canvas.videoWidth || this.canvas.width || 0;
    const ch = this.canvas.videoHeight || this.canvas.height || 0;

    // If video dimensions aren't available yet (before first frame),
    // fall back to the CSS box — no letterbox correction, just map 1:1.
    // This prevents a wrong aspect ratio (1:1 default) from creating
    // huge phantom offsets that push all clicks to near-zero.
    if (cw === 0 || ch === 0) {
      if (!this._coordsLogged) {
        this._coordsLogged = true;
        console.log(`[Input] getPercentCoords: video dims not ready, using box ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}`);
      }
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      return {
        xPercent: Math.max(0, Math.min(1, x / rect.width)),
        yPercent: Math.max(0, Math.min(1, y / rect.height)),
      };
    }

    const contentAR = cw / ch;
    const boxAR = rect.width / rect.height;

    // Log when dimensions change (helps debug coordinate issues)
    const dimKey = `${cw}x${ch}`;
    if (this._lastDimKey !== dimKey) {
      this._lastDimKey = dimKey;
      console.log(`[Input] getPercentCoords: video=${cw}x${ch} AR=${contentAR.toFixed(3)}, box=${rect.width.toFixed(0)}x${rect.height.toFixed(0)} AR=${boxAR.toFixed(3)}`);
    }

    let contentW, contentH, offsetX, offsetY;
    if (contentAR > boxAR) {
      // Content wider than box → black bars top/bottom
      contentW = rect.width;
      contentH = rect.width / contentAR;
      offsetX = 0;
      offsetY = (rect.height - contentH) / 2;
    } else {
      // Content taller than box → black bars left/right
      contentH = rect.height;
      contentW = rect.height * contentAR;
      offsetX = (rect.width - contentW) / 2;
      offsetY = 0;
    }

    const x = e.clientX - rect.left - offsetX;
    const y = e.clientY - rect.top - offsetY;
    return {
      xPercent: Math.max(0, Math.min(1, x / contentW)),
      yPercent: Math.max(0, Math.min(1, y / contentH)),
    };
  }

  getMetaState(e) {
    let meta = 0;
    if (e.shiftKey) meta |= META_SHIFT;
    if (e.ctrlKey) meta |= META_CTRL;
    if (e.altKey) meta |= META_ALT;
    return meta;
  }

  /**
   * Set type mode externally (e.g., from Android keyboard visibility detection).
   * When the Android soft keyboard appears, switch to type mode automatically.
   * When it disappears, switch back to play mode.
   */
  setTypeMode(typing) {
    if (!this.keymap) return; // no keymap = always type mode anyway
    if (this._typeMode === typing) return; // no change

    this._typeMode = typing;

    // Release joystick if switching to type mode
    if (typing && this._joystickActive) {
      this._joystickKeys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };
      this.updateJoystick();
    }

    console.log(`[Input] Auto: ${typing ? "⌨ TYPE mode (keyboard detected)" : "🎮 PLAY mode (keyboard hidden)"}`);
    this.onTypeModeChange?.(typing);
  }

  destroy() {
    this.stopJoystickInterval();
    clearTimeout(this._zoomTimer);

    // Remove all event listeners to prevent stacking on re-create
    const canvas = this.canvas;
    const h = this._handlers;
    if (canvas && h) {
      canvas.removeEventListener("touchstart", h.touchstart);
      canvas.removeEventListener("touchmove", h.touchmove);
      canvas.removeEventListener("touchend", h.touchend);
      canvas.removeEventListener("pointerdown", h.pointerdown);
      canvas.removeEventListener("pointermove", h.pointermove);
      canvas.removeEventListener("pointerup", h.pointerup);
      canvas.removeEventListener("pointercancel", h.pointercancel);
      canvas.removeEventListener("contextmenu", h.contextmenu);
      canvas.removeEventListener("wheel", h.wheel);
      canvas.removeEventListener("keydown", h.keydown);
      canvas.removeEventListener("keyup", h.keyup);
    }
    this._handlers = {};
    this.onInput = null;
  }
}
