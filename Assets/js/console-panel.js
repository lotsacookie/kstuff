export function init(K) {
  const btn = document.getElementById('study-console-btn');
  if (!btn || !window.__sgLog || btn.__sgConsole) return;
  btn.__sgConsole = true;

  const style = document.createElement('style');
  style.textContent = `
.sg-console{position:fixed;right:14px;bottom:14px;width:min(620px,calc(100vw - 28px));height:min(62vh,560px);z-index:2000;display:none;flex-direction:column;background:var(--card-bg,#111);color:var(--text-color,#fff);border:1px solid var(--hairline,rgba(255,255,255,.15));border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,.4);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);overflow:hidden;font-family:var(--font,inherit)}
.sg-console.open{display:flex}
.sg-console-head{display:flex;align-items:center;gap:8px;padding:9px 10px;border-bottom:1px solid var(--hairline,rgba(255,255,255,.15));flex-shrink:0}
.sg-console-title{font-weight:800;letter-spacing:.04em;font-size:.85rem;margin-right:auto}
.sg-console-count{opacity:.55;font-size:.75rem;font-variant-numeric:tabular-nums}
.sg-console-btn,.sg-console-filter{background:var(--card-bg,#111);color:var(--text-color,#fff);border:1px solid var(--hairline,rgba(255,255,255,.15));border-radius:10px;padding:5px 10px;font:inherit;font-size:.75rem;font-weight:700;cursor:pointer;transition:all .25s var(--ease,ease)}
.sg-console-btn:hover,.sg-console-filter:hover{background-color:var(--tint-strong,rgba(255,255,255,.1));border-color:var(--ring,rgba(255,255,255,.35))}
.sg-console-body{flex:1;overflow:auto;padding:8px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.5;user-select:text;-webkit-user-select:text;cursor:text}
.sg-console-row{display:flex;gap:8px;padding:2px 0;border-bottom:1px solid color-mix(in srgb,var(--text-color,#fff) 7%,transparent);user-select:text;-webkit-user-select:text}
.sg-console-meta{flex:0 0 auto;opacity:.5;white-space:nowrap}
.sg-console-text{flex:1;min-width:0;white-space:pre-wrap;word-break:break-word;user-select:text;-webkit-user-select:text}
.sg-console-row.warn .sg-console-text{color:#f5c451}
.sg-console-row.error .sg-console-text{color:#ff6b6b}
.sg-console-row.debug .sg-console-text{opacity:.7}
.sg-console-empty{opacity:.5;padding:10px 2px}
`;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.className = 'sg-console';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Console');
  panel.innerHTML = '<div class="sg-console-head"><span class="sg-console-title">Console</span><span class="sg-console-count"></span><select class="sg-console-filter" aria-label="Filter"><option value="all">All</option><option value="error">Errors</option><option value="warn">Warnings</option><option value="info">Info</option></select><button class="sg-console-btn" data-act="copy" type="button">Copy all</button><button class="sg-console-btn" data-act="clear" type="button">Clear</button><button class="sg-console-btn" data-act="close" type="button">Close</button></div><div class="sg-console-body"></div>';
  document.body.appendChild(panel);

  const body = panel.querySelector('.sg-console-body');
  const count = panel.querySelector('.sg-console-count');
  const filter = panel.querySelector('.sg-console-filter');
  const MAX_ROWS = 1000;
  const pad = n => String(n).padStart(2, '0');
  const stamp = t => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
  const pass = e => {
    const f = filter.value;
    if (f === 'all') return true;
    if (f === 'info') return e.level === 'info' || e.level === 'log' || e.level === 'debug';
    return e.level === f;
  };
  const lineOf = e => '[' + stamp(e.t) + '] [' + e.src + '] ' + e.level.toUpperCase() + ' ' + e.text;

  const rowFor = e => {
    const row = document.createElement('div');
    row.className = 'sg-console-row ' + e.level;
    const meta = document.createElement('span');
    meta.className = 'sg-console-meta';
    meta.textContent = stamp(e.t) + ' ' + e.src;
    const text = document.createElement('span');
    text.className = 'sg-console-text';
    text.textContent = e.text;
    row.appendChild(meta);
    row.appendChild(text);
    return row;
  };

  const updateCount = () => { count.textContent = window.__sgLog.length + ' entries'; };

  const renderAll = () => {
    body.textContent = '';
    const list = window.__sgLog.filter(pass).slice(-MAX_ROWS);
    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'sg-console-empty';
      empty.textContent = 'Nothing logged yet.';
      body.appendChild(empty);
    } else {
      const frag = document.createDocumentFragment();
      list.forEach(e => frag.appendChild(rowFor(e)));
      body.appendChild(frag);
    }
    updateCount();
    body.scrollTop = body.scrollHeight;
  };

  const onEntry = e => {
    if (!panel.classList.contains('open')) return;
    updateCount();
    if (!pass(e)) return;
    const empty = body.querySelector('.sg-console-empty');
    if (empty) empty.remove();
    const stick = body.scrollHeight - body.scrollTop - body.clientHeight < 40;
    body.appendChild(rowFor(e));
    while (body.childElementCount > MAX_ROWS) body.firstElementChild.remove();
    if (stick) body.scrollTop = body.scrollHeight;
  };
  window.__sgLogSubs.add(onEntry);

  const copyText = async text => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch {
        return false;
      }
    }
  };

  const setOpen = open => {
    panel.classList.toggle('open', open);
    btn.classList.toggle('is-on', open);
    btn.setAttribute('aria-pressed', open ? 'true' : 'false');
    if (open) renderAll();
  };

  btn.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  filter.addEventListener('change', renderAll);
  panel.addEventListener('click', async e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    if (act === 'close') setOpen(false);
    if (act === 'clear') { window.__sgLog.length = 0; renderAll(); }
    if (act === 'copy') {
      const sel = String(window.getSelection ? window.getSelection() : '').trim();
      const text = sel || window.__sgLog.filter(pass).map(lineOf).join('\n');
      const ok = await copyText(text);
      const b = e.target.closest('[data-act]');
      const old = b.textContent;
      b.textContent = ok ? (sel ? 'Copied selection' : 'Copied') : 'Copy failed';
      setTimeout(() => { b.textContent = old; }, 1200);
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) setOpen(false);
  });
}
