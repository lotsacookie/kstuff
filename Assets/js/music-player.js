export function init(K) {
  const MINI_ICONS = {
    prev: '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
  };

  document.head.appendChild(K.el('style', {
    textContent: `
      .mini-player{display:flex;align-items:center;gap:6px;flex-shrink:0;max-width:340px;margin-left:8px;}
      .mini-player[hidden]{display:none;}
      .mini-player-cover{width:30px;height:30px;border-radius:6px;object-fit:cover;flex-shrink:0;background:rgba(128,128,128,.25);}
      .mini-player-cover.no-art{display:none;}
      .mini-player-text{display:flex;flex-direction:column;min-width:0;max-width:170px;line-height:1.15;}
      .mini-player-title,.mini-player-artist{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .mini-player-title{font-size:.78rem;font-weight:700;}
      .mini-player-artist{font-size:.68rem;opacity:.7;}
      .mini-player .study-nav-btn:disabled{opacity:.35;cursor:not-allowed;}
      @media (max-width:760px){.mini-player-text{display:none;}}
    `
  }));

  const miniPlayer = K.el('div', {
    className: 'mini-player',
    hidden: false,
    innerHTML: `
      <img class="mini-player-cover no-art" alt="">
      <div class="mini-player-text">
        <div class="mini-player-title">Nothing playing</div>
        <div class="mini-player-artist"></div>
      </div>
      <button type="button" class="study-nav-btn" data-act="prev" title="Previous song">${MINI_ICONS.prev}</button>
      <button type="button" class="study-nav-btn" data-act="toggle" title="Play / Pause">${MINI_ICONS.play}</button>
      <button type="button" class="study-nav-btn" data-act="next" title="Next song">${MINI_ICONS.next}</button>
    `
  });
  document.querySelector('.learning-header')?.appendChild(miniPlayer);

  const miniCover = miniPlayer.querySelector('.mini-player-cover');
  const miniTitle = miniPlayer.querySelector('.mini-player-title');
  const miniArtist = miniPlayer.querySelector('.mini-player-artist');
  const miniPrev = miniPlayer.querySelector('[data-act="prev"]');
  const miniToggle = miniPlayer.querySelector('[data-act="toggle"]');
  const miniNext = miniPlayer.querySelector('[data-act="next"]');

  K.musicState = null;

  function renderMiniPlayer(state) {
    K.musicState = state && state.hasTrack ? state : null;
    if (!K.musicState) {
      miniPlayer.hidden = false;
      return;
    }

    miniPlayer.hidden = false;
    miniTitle.textContent = state.title || '';
    miniTitle.title = state.title || '';
    miniArtist.textContent =
      state.status === 'loading' ? 'Loading...' :
      state.status === 'error' ? "Couldn't load audio" :
      (state.artist || '');

    if (state.cover) {
      if (miniCover.src !== state.cover) miniCover.src = state.cover;
      miniCover.classList.remove('no-art');
    } else {
      miniCover.removeAttribute('src');
      miniCover.classList.add('no-art');
    }

    miniToggle.innerHTML = state.status === 'playing' ? MINI_ICONS.pause : MINI_ICONS.play;
    miniToggle.disabled = state.status === 'loading' || state.status === 'error';
    miniPrev.disabled = !state.hasPrev;
    miniNext.disabled = !state.hasNext;
  }
  K.renderMiniPlayer = renderMiniPlayer;

  function sendMusicCmd(action) {
    try {
      K.$(K.MUSIC_IFRAME_ID)?.contentWindow?.postMessage({ type: 'kstuff-music-cmd', action }, '*');
    } catch {}
  }
  K.sendMusicCmd = sendMusicCmd;

  miniPlayer.addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]');
    if (btn && !btn.disabled) sendMusicCmd(btn.dataset.act);
  });

  window.addEventListener('message', e => {
    const data = e.data;
    if (!data || data.type !== 'kstuff-music-state') return;
    if (e.source !== K.$(K.MUSIC_IFRAME_ID)?.contentWindow) return;
    renderMiniPlayer(data.state);
  });
}
