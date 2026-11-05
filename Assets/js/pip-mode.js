export function init(K) {
  const btn = document.getElementById('study-pip-btn');
  if (!btn || btn.__sgPip) return;
  btn.__sgPip = true;

  const PIP_URL = 'https://clever.com';

  const style = document.createElement('style');
  style.textContent = `
.sg-pip{position:fixed;inset:0;width:100vw;height:100vh;border:0;margin:0;padding:0;z-index:2147483000;pointer-events:none;background:transparent;display:none}
.sg-pip.open{display:block}
`;
  document.head.appendChild(style);

  let frame = null;
  const set = on => {
    if (on && !frame) {
      frame = document.createElement('iframe');
      frame.className = 'sg-pip';
      frame.src = PIP_URL;
      frame.setAttribute('aria-hidden', 'true');
      frame.setAttribute('tabindex', '-1');
      frame.setAttribute('allowtransparency', 'true');
      frame.style.pointerEvents = 'none';
      document.body.appendChild(frame);
    }
    if (frame) frame.classList.toggle('open', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('active', on);
  };

  btn.addEventListener('click', () => set(!(frame && frame.classList.contains('open'))));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && frame && frame.classList.contains('open')) set(false);
  });
}
