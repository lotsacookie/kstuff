export class Loader {
  constructor(doc = document) {
    this.doc = doc;
    this.el = doc.getElementById("loading-screen");
    this.fill = doc.getElementById("ld-fill");
    this.status = doc.getElementById("ld-status");
    this.count = doc.getElementById("ld-count");
    this.cancelBtn = doc.getElementById("ld-cancel");
    this.onCancel = null;
    this.gameActive = false; // true from show() until hide(): a game launch owns the loading screen
    this.cancelBtn?.addEventListener("click", () => this.onCancel?.());
  }

  show(text = "Loading", { cancel = null } = {}) {
    clearTimeout(this._t);
    this.gameActive = true;
    this.doc.body.classList.add("loading");
    this.el.classList.remove("hidden", "failed");
    this.el.classList.add("active");
    this.fill.style.transform = "scaleX(0)";
    this.status.textContent = text;
    if (this.count) this.count.textContent = "";
    this.setCancel(cancel);
  }

  setCancel(fn) {
    this.onCancel = fn || null;
    if (this.cancelBtn) this.cancelBtn.hidden = !fn;
  }

  step(i, total, text) {
    this.fill.style.transform = `scaleX(${Math.min(i / total, 1)})`;
    if (text) this.status.textContent = text;
    if (this.count) this.count.textContent = `${i} / ${total}`;
  }

  text(t) { this.status.textContent = t; }

  hide() {
    this.gameActive = false;
    this.doc.body.classList.remove("loading");
    this.setCancel(null);
    this.el.classList.add("hidden");
    this._t = setTimeout(() => this.el.classList.remove("active"), 600);
  }
}
