// Sandbox / CrossOrigin isolate
//
// When enabled, the whole visible page is cleared (scripts, wisp, net hub and the
// Singuloxy transport keep running in the background) and a single full-screen
// iframe loads the cross-origin-isolated copy of the site. That page talks to this
// one over postMessage: the kstuff-net:* bridge in net-hub.js (fetch / rotate /
// abort, which is what Singuloxy inside the frame uses) plus the kstuff-coi:*
// messages handled here.
export function init(K) {
  const KEY = 'kstuff_coi';
  const COI_URL = 'https://lotsacookie.github.io/Assets/coi.html';
  const COI_ORIGIN = new URL(COI_URL).origin;
  const byId = id => document.getElementById(id);

  const isOn = () => { try { return localStorage.getItem(KEY) === 'on'; } catch { return false; } };
  const setOn = on => { try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch {} };

  // Escape hatch: ?coi=off turns it off, ?coi=on turns it on.
  try {
    const q = new URLSearchParams(location.search).get('coi');
    if (q === 'off' || q === 'on') setOn(q === 'on');
  } catch {}

  K.coi = { isOn, setOn, enter, url: COI_URL };

  // ---- Settings UI (Proxy tab) ----
  function bindUi() {
    const panel = byId('settings-panel-proxy');
    const sel = byId('coi-isolate-select');
    if (!panel || !sel || sel.__coi) return;
    sel.__coi = true;
    sel.value = isOn() ? 'on' : 'off';
    const status = byId('coi-isolate-status');
    sel.addEventListener('change', () => {
      const on = sel.value === 'on';
      setOn(on);
      if (on) {
        if (status) status.textContent = 'Isolating...';
        enter();
      } else if (status) {
        status.textContent = 'Off. Takes effect on the next load.';
      }
    });
  }
  bindUi();
  document.addEventListener('click', e => {
    if (e.target && e.target.closest && e.target.closest('.settings-tab')) bindUi();
  });

  // ---- Isolation ----
  let frame = null;
  let observer = null;

  const keep = n => n === frame || (n.nodeType === 1 && n.tagName === 'SCRIPT');

  function sweep() {
    const body = document.body;
    if (!body) return;
    for (const n of Array.from(body.childNodes)) {
      if (keep(n)) continue;
      try { n.remove(); } catch {}
    }
    // Anything left in <head> that paints (inline hide-nothing, just make sure bg is black).
    if (frame && frame.parentNode !== body) body.appendChild(frame);
  }

  function enter() {
    if (frame) return;
    const root = document.documentElement;
    const style = document.createElement('style');
    style.id = 'coi-isolate-style';
    style.textContent =
      'html,body{background:#000!important;margin:0!important;padding:0!important;overflow:hidden!important;height:100%!important}' +
      '#coi-frame{position:fixed;inset:0;width:100vw;height:100vh;border:0;margin:0;padding:0;background:#000;z-index:2147483647;display:block}';
    document.head.appendChild(style);
    root.style.setProperty('background', '#000', 'important');
    document.body.style.setProperty('background', '#000', 'important');
    document.body.className = '';

    frame = document.createElement('iframe');
    frame.id = 'coi-frame';
    frame.dataset.coi = '1';
    frame.setAttribute('allow', 'fullscreen; autoplay; clipboard-read; clipboard-write; gamepad; cross-origin-isolated; microphone; camera');
    frame.setAttribute('allowfullscreen', '');
    frame.src = COI_URL;

    sweep();
    document.body.appendChild(frame);

    // Keep the host DOM empty: anything modules add later is removed again.
    observer = new MutationObserver(muts => {
      for (const m of muts) for (const n of m.addedNodes) {
        if (n.parentNode === document.body && !keep(n)) { try { n.remove(); } catch {} }
      }
    });
    observer.observe(document.body, { childList: true });
  }

  // ---- Messages from the isolated page ----
  const SYNC_PREFIX = 'kstuff_';
  window.addEventListener('message', e => {
    const d = e.data;
    if (!frame || !d || typeof d !== 'object' || typeof d.type !== 'string' || d.type.indexOf('kstuff-coi:') !== 0) return;
    if (e.source !== frame.contentWindow || e.origin !== COI_ORIGIN) return;
    const reply = m => { try { e.source.postMessage(m, COI_ORIGIN); } catch {} };

    if (d.type === 'kstuff-coi:hello') {
      const store = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.indexOf(SYNC_PREFIX) === 0 && k !== KEY) store[k] = localStorage.getItem(k);
        }
      } catch {}
      reply({ type: 'kstuff-coi:hello-ack', store, wisp: window.kNetDirect && window.kNetDirect.wisp ? window.kNetDirect.wisp() : null, transport: window.kTransportMode || null });
    } else if (d.type === 'kstuff-coi:storage-set' && typeof d.key === 'string' && d.key.indexOf(SYNC_PREFIX) === 0 && d.key !== KEY) {
      try { if (d.value == null) localStorage.removeItem(d.key); else localStorage.setItem(d.key, String(d.value)); } catch {}
    } else if (d.type === 'kstuff-coi:disable') {
      setOn(false);
      window.__sgReloading = true;
      location.reload();
    }
  });

  if (isOn()) {
    const go = () => { try { enter(); } catch (err) { console.error('coi isolate failed', err); } };
    // Let the other modules finish initialising first so wisp / net hub are running.
    (K.kReadyP || window.kReady || Promise.resolve()).then(() => setTimeout(go, 0), go);
  }
}
