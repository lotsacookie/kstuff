export function init(K) {
  if (window.kAiDoc || window.__kAiDocLoading) return;
  window.__kAiDocLoading = true;
  const REPO = (K && K.MAIN_REPO) || 'lotsacookie/kstuff';
  const PATH = 'Assets/pages/js/ai-doc.js';
  (async () => {
    let sha = '';
    try { sha = (await window.kShaP) || ''; } catch {}
    const urls = [];
    if (/^[0-9a-f]{40}$/i.test(sha)) urls.push(`https://cdn.jsdelivr.net/gh/${REPO}@${sha}/${PATH}`);
    urls.push(`https://cdn.jsdelivr.net/gh/${REPO}@main/${PATH}`, `https://raw.githubusercontent.com/${REPO}/main/${PATH}`);
    for (const url of urls) {
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const s = document.createElement('script');
        s.textContent = await r.text();
        document.head.appendChild(s);
        s.remove();
        return;
      } catch {}
    }
  })().catch(() => {}).finally(() => { window.__kAiDocLoading = false; });
}
