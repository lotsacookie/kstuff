export function init(K) {
  const btn = document.getElementById('study-pip-btn');
  if (!btn || btn.__sgPip) return;
  btn.__sgPip = true;

  const OVERLAY_URL = 'https://clever.com';

  const style = document.createElement('style');
  style.textContent = '.sg-pip-overlay{position:fixed;inset:0;width:100vw;height:100vh;border:0;margin:0;padding:0;z-index:2147483000;pointer-events:none;background:transparent}';
  document.head.appendChild(style);

  let overlay = null, video = null, stream = null, active = false, busy = false;

  const reflect = on => {
    active = on;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('active', on);
  };

  const showOverlay = () => {
    if (overlay) return;
    overlay = document.createElement('iframe');
    overlay.className = 'sg-pip-overlay';
    overlay.src = OVERLAY_URL;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.tabIndex = -1;
    overlay.style.pointerEvents = 'none';
    // Mounted on <html>, outside <body>, so the capture of <body> never includes it.
    document.documentElement.appendChild(overlay);
  };

  const hideOverlay = () => { overlay?.remove(); overlay = null; };

  async function stop() {
    try { if (document.pictureInPictureElement === video) await document.exitPictureInPicture(); } catch {}
    stream?.getTracks().forEach(t => t.stop());
    stream = null;
    if (video) { video.srcObject = null; video.remove(); video = null; }
    hideOverlay();
    reflect(false);
  }

  async function start() {
    if (!navigator.mediaDevices?.getDisplayMedia || !document.pictureInPictureEnabled) {
      alert('PiP mirroring needs a Chromium browser with screen capture and Picture-in-Picture support.');
      return;
    }
    // Restrict the capture to <body> so the overlay iframe (on <html>) is excluded.
    let target = null;
    try {
      if (window.RestrictionTarget?.fromElement) target = await RestrictionTarget.fromElement(document.body);
    } catch {}

    stream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: 'browser', frameRate: 30 },
      audio: false,
      preferCurrentTab: true,
      selfBrowserSurface: 'include',
      surfaceSwitching: 'exclude',
      monitorTypeSurfaces: 'exclude'
    });

    const track = stream.getVideoTracks()[0];
    if (target && track.restrictTo) {
      try { await track.restrictTo(target); } catch (e) { console.warn('restrictTo failed', e); }
    }
    track.addEventListener('ended', stop);

    video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.srcObject = stream;
    video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:0;top:0';
    document.body.appendChild(video);
    await video.play();
    video.addEventListener('leavepictureinpiction', stop);
    video.addEventListener('leavepictureinpicture', stop);
    await video.requestPictureInPicture();

    showOverlay();
    reflect(true);
  }

  btn.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    try {
      if (active) await stop(); else await start();
    } catch (err) {
      console.warn('pip mode failed', err);
      await stop();
    } finally {
      busy = false;
    }
  });
}
