export function init(K) {
  const byId = id => document.getElementById(id);

  // Only one modal at a time: when one opens, the others fade out via their normal close transition.
  new MutationObserver(muts => {
    for (const m of muts) {
      const el = m.target;
      if (!el.classList || !el.classList.contains('modal-overlay') || !el.classList.contains('active')) continue;
      if ((m.oldValue || '').split(/\s+/).includes('active')) continue;
      document.querySelectorAll('.modal-overlay.active').forEach(o => {
        if (o === el) return;
        if (o.id === 'homeworkhelper-modal') { try { K.saveSettings && K.saveSettings(); } catch {} }
        o.classList.remove('active');
      });
    }
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
  const clockEl = byId('clock-text');
  const pingEl = byId('ping-text');
  const weatherText = byId('weather-text');
  const weatherIcon = byId('weather-icon');

  const PING_MS = 30000;
  const PING_FAIL_MS = 30000;
  const PING_TIMEOUT = 4000;
  const WEATHER_MS = 600000;
  const WEATHER_TIMEOUT = 6000;

  const timeFmt = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  let clockTimer = 0, lastClock = '';
  function tickClock() {
    clearTimeout(clockTimer);
    if (document.hidden) return;
    if (clockEl) {
      const s = timeFmt.format(new Date());
      if (s !== lastClock) {
        lastClock = s;
        clockEl.textContent = s;
      }
    }
    clockTimer = setTimeout(tickClock, 1000 - (Date.now() % 1000) + 10);
  }

  const PING_TARGETS = [
    { id: 'gstatic',        url: 'https://www.gstatic.com/generate_204' },
    { id: 'cloudflare-204', url: 'https://cp.cloudflare.com/generate_204' },
    { id: 'google-204',     url: 'https://www.google.com/generate_204' },
    { id: 'cloudflare-cdn', url: 'https://www.cloudflare.com/cdn-cgi/trace' }
  ];

  let pingBusy = false, lastPing = 0, pingIdx = 0, pingFails = 0, pingTimer = 0;
  async function checkPing() {
    if (!pingEl || pingBusy || document.hidden) return;
    if (navigator.onLine === false) { pingEl.textContent = 'Offline'; pingFails++; return; }
    pingBusy = true;
    lastPing = Date.now();
    try {
      for (let i = 0; i < PING_TARGETS.length; i++) {
        const idx = (pingIdx + i) % PING_TARGETS.length;
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), PING_TIMEOUT);
        const start = performance.now();
        try {
          await fetch(PING_TARGETS[idx].url, { mode: 'no-cors', cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: ctrl.signal });
          pingEl.textContent = `${Math.round(performance.now() - start)} ms`;
          pingIdx = idx;
          pingFails = 0;
          return;
        } catch {
        } finally {
          clearTimeout(timer);
        }
      }
      pingFails++;
      if (pingFails >= 2) pingEl.textContent = 'Offline';
    } finally {
      pingBusy = false;
    }
  }
  function schedulePing() {
    clearTimeout(pingTimer);
    pingTimer = setTimeout(async () => { await checkPing(); schedulePing(); }, pingFails ? PING_FAIL_MS : PING_MS);
  }

  const jget = async (url, ms = WEATHER_TIMEOUT) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } finally { clearTimeout(timer); }
  };

  const WMO = {
    0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog',
    51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle', 56: 'Drizzle', 57: 'Drizzle',
    61: 'Rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Rain', 67: 'Rain',
    71: 'Snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow',
    80: 'Rain showers', 81: 'Rain showers', 82: 'Rain showers', 85: 'Snow showers', 86: 'Snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
  };
  const sevenTimerText = w => {
    w = String(w).replace(/(day|night)$/, '');
    if (w === 'clear') return 'Clear';
    if (w === 'pcloudy') return 'Partly cloudy';
    if (w === 'mcloudy') return 'Mostly cloudy';
    if (w === 'cloudy') return 'Cloudy';
    if (w.startsWith('ts')) return 'Thunderstorm';
    if (w.includes('snow') && !w.includes('rain')) return 'Snow';
    if (w.includes('rain') || w.includes('shower')) return 'Rain';
    if (w === 'humid') return 'Humid';
    return 'Clear';
  };

  const WEATHER_PROVIDERS = [
    { id: 'wttr.in', geo: false, run: async () => {
      const c = (await jget('https://wttr.in/?format=j1')).current_condition[0];
      return { tempF: +c.temp_F, text: c.weatherDesc[0].value };
    } },
    { id: 'open-meteo', geo: true, run: async ({ lat, lon }) => {
      const d = await jget(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`);
      return { tempF: d.current.temperature_2m, text: WMO[d.current.weather_code] || 'Clear' };
    } },
    { id: 'weather.gov', geo: true, run: async ({ lat, lon }) => {
      const p = await jget(`https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`);
      const n = (await jget(p.properties.forecastHourly)).properties.periods[0];
      return { tempF: n.temperatureUnit === 'C' ? n.temperature * 9 / 5 + 32 : n.temperature, text: n.shortForecast };
    } },
    { id: '7timer', geo: true, run: async ({ lat, lon }) => {
      const s = (await jget(`https://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`)).dataseries[0];
      return { tempF: s.temp2m * 9 / 5 + 32, text: sevenTimerText(s.weather) };
    } }
  ];

  const GEO_PROVIDERS = [
    { id: 'geojs', url: 'https://get.geojs.io/v1/ip/geo.json', parse: d => ({ lat: +d.latitude, lon: +d.longitude }) },
    { id: 'ipwho.is', url: 'https://ipwho.is/', parse: d => { if (d.success === false) throw new Error('lookup failed'); return { lat: +d.latitude, lon: +d.longitude }; } },
    { id: 'ipapi.co', url: 'https://ipapi.co/json/', parse: d => ({ lat: +d.latitude, lon: +d.longitude }) }
  ];

  const GEO_KEY = 'kstuff_geo_v1', GEO_TTL = 6 * 3600 * 1000, WX_KEY = 'kstuff_weather_v1';
  const readJson = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const writeJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  async function getCoords() {
    const c = readJson(GEO_KEY);
    if (c && Number.isFinite(c.lat) && Number.isFinite(c.lon) && Date.now() - c.at < GEO_TTL) return c;
    for (const g of GEO_PROVIDERS) {
      try {
        const p = g.parse(await jget(g.url));
        if (Number.isFinite(p.lat) && Number.isFinite(p.lon)) { const out = { ...p, at: Date.now() }; writeJson(GEO_KEY, out); return out; }
      } catch {}
    }
    return c && Number.isFinite(c.lat) ? c : null; // stale beats nothing
  }

  const weatherIconFor = condition => {
    const c = condition.toLowerCase();
    if (c.includes('thunder') || c.includes('storm')) return 'ph ph-cloud-lightning';
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'ph ph-cloud-rain';
    if (c.includes('snow') || c.includes('sleet')) return 'ph ph-snowflake';
    if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return 'ph ph-cloud-fog';
    if (c.includes('cloud') || c.includes('overcast')) return 'ph ph-cloud';
    return 'ph ph-sun';
  };

  function showWeather(w) {
    weatherText.textContent = `${Math.round(w.tempF)}°F ${w.text}`;
    if (weatherIcon) {
      const cls = weatherIconFor(w.text);
      if (weatherIcon.className !== cls) weatherIcon.className = cls;
    }
  }

  let weatherBusy = false, lastWeather = 0, wxStart = 0, wxShown = false;
  async function fetchWeather() {
    if (!weatherText || weatherBusy || document.hidden) return;
    weatherBusy = true;
    lastWeather = Date.now();
    try {
      let coords = null, coordsTried = false;
      const n = WEATHER_PROVIDERS.length;
      for (let i = 0; i < n; i++) {
        const idx = (wxStart + i) % n, p = WEATHER_PROVIDERS[idx];
        try {
          if (p.geo) {
            if (!coordsTried) { coordsTried = true; coords = await getCoords(); }
            if (!coords) continue;
          }
          const w = await p.run(coords);
          if (!Number.isFinite(+w.tempF) || !w.text) throw new Error('bad payload');
          w.tempF = +w.tempF;
          wxStart = idx;
          wxShown = true;
          showWeather(w);
          writeJson(WX_KEY, { ...w, at: Date.now() });
          return;
        } catch (err) {
          console.debug('weather provider failed:', p.id, err);
        }
      }
      if (!wxShown) weatherText.textContent = 'Weather N/A'; // otherwise keep last good value
    } finally {
      weatherBusy = false;
    }
  }

  tickClock();
  checkPing().finally(schedulePing);
  const cachedWx = weatherText && readJson(WX_KEY);
  if (cachedWx && Number.isFinite(+cachedWx.tempF) && cachedWx.text) { showWeather(cachedWx); wxShown = true; }
  fetchWeather();
  setInterval(fetchWeather, WEATHER_MS);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    tickClock();
    if (Date.now() - lastPing >= PING_MS) checkPing();
    if (Date.now() - lastWeather >= WEATHER_MS) fetchWeather();
  });

  const settingsNav = byId('settings-nav');
  const settingsIndicator = settingsNav?.querySelector('.settings-nav-indicator');
  const settingsTabs = Array.from(document.querySelectorAll('.settings-tab'));
  const settingsPanels = Array.from(document.querySelectorAll('.settings-panel'));
  const settingsModal = byId('homeworkhelper-modal');

  let indicatorRaf = 0;
  function moveSettingsIndicator() {
    if (indicatorRaf) return;
    indicatorRaf = requestAnimationFrame(() => {
      indicatorRaf = 0;
      const activeTab = settingsNav?.querySelector('.settings-tab.active');
      if (!activeTab || !settingsIndicator) return;
      settingsIndicator.style.height = activeTab.offsetHeight + 'px';
      settingsIndicator.style.transform = `translateY(${activeTab.offsetTop}px)`;
    });
  }

  settingsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      settingsTabs.forEach(other => {
        const isActive = other === tab;
        other.classList.toggle('active', isActive);
        other.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      settingsPanels.forEach(panel => panel.classList.toggle('active', panel.id === tab.dataset.panel));
      document.querySelectorAll('.custom-select-options.open').forEach(menu => menu.classList.remove('open'));
      moveSettingsIndicator();
    });
  });

  if (settingsNav) {
    if (window.ResizeObserver) new ResizeObserver(moveSettingsIndicator).observe(settingsNav);
    window.addEventListener('resize', moveSettingsIndicator, { passive: true });
    if (settingsModal) new MutationObserver(moveSettingsIndicator).observe(settingsModal, { attributes: true, attributeFilter: ['class'] });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveSettingsIndicator);
    moveSettingsIndicator();
  }
  const updateBtn = byId('update-site-btn');
  if (updateBtn && !updateBtn.__sgUpdate) {
    updateBtn.__sgUpdate = true;
    const UPDATE_REPO = 'lotsacookie/kstuff';
    const UPDATE_FETCH_MS = 8000;
    const updateLabel = updateBtn.querySelector('span');
    const setUpdateLabel = text => { if (updateLabel) updateLabel.textContent = text; };

    const fetchWithTimeout = async (url, type) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), UPDATE_FETCH_MS);
      try {
        const r = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return await r[type]();
      } finally {
        clearTimeout(timer);
      }
    };

    const looksValid = html => typeof html === 'string' && html.length > 5000 && /<html/i.test(html) && /singularity/i.test(html);

    const fetchLatestHtml = async () => {
      const bust = '?t=' + Date.now();
      const urls = [];
      try {
        const data = await fetchWithTimeout('https://api.github.com/repos/' + UPDATE_REPO + '/commits/main', 'json');
        if (data && /^[0-9a-f]{40}$/i.test(data.sha)) urls.push('https://cdn.jsdelivr.net/gh/' + UPDATE_REPO + '@' + data.sha + '/index.html');
      } catch {}
      urls.push(
        'https://raw.githubusercontent.com/' + UPDATE_REPO + '/main/index.html' + bust,
        'https://cdn.jsdelivr.net/gh/' + UPDATE_REPO + '@main/index.html' + bust,
        'https://cdn.statically.io/gh/' + UPDATE_REPO + '/main/index.html' + bust
      );
      try {
        const here = location.href.split('#')[0];
        if (/^https?:/i.test(here)) urls.push(here + (here.includes('?') ? '&' : '?') + 't=' + Date.now());
      } catch {}
      for (const url of urls) {
        try {
          const html = await fetchWithTimeout(url, 'text');
          if (looksValid(html)) return html;
        } catch {}
      }
      return null;
    };

    const clearBundleCache = async () => {
      try {
        const db = await new Promise((ok, no) => {
          const q = indexedDB.open('singularity', 1);
          q.onupgradeneeded = () => q.result.createObjectStore('s');
          q.onsuccess = () => ok(q.result);
          q.onerror = () => no(q.error);
        });
        await new Promise(done => {
          const tx = db.transaction('s', 'readwrite');
          tx.objectStore('s').delete('bundle');
          tx.oncomplete = tx.onerror = tx.onabort = () => done();
        });
        db.close();
      } catch {}
      try {
        if (window.caches) for (const name of await caches.keys()) await caches.delete(name);
      } catch {}
    };

    const teardown = () => {
      try {
        const top = setTimeout(() => {}, 0);
        for (let i = 0; i <= top; i++) { clearTimeout(i); clearInterval(i); }
      } catch {}
      try {
        const lastRaf = requestAnimationFrame(() => {});
        for (let i = 0; i <= lastRaf; i++) cancelAnimationFrame(i);
      } catch {}
      try { if (window.__sgLogSubs) window.__sgLogSubs.clear(); } catch {}
      ['singularity', 'kShaP', 'kWispP', 'kModulesStarted', 'kReady', 'kReadyResolve', 'kAssetsP', 'kAssetsPR', 'kHolidayLoaded'].forEach(key => {
        try { delete window[key]; } catch { try { window[key] = undefined; } catch {} }
      });
    };

    let updating = false;
    updateBtn.addEventListener('click', async () => {
      if (updating) return;
      updating = true;
      updateBtn.disabled = true;
      setUpdateLabel('Updating...');
      try { K.toggleLoader?.(true, 'updating'); } catch {}

      const html = await fetchLatestHtml();
      if (!html) {
        try { K.toggleLoader?.(false); } catch {}
        setUpdateLabel('Update failed - try again');
        setTimeout(() => { setUpdateLabel('Update Singularity'); updateBtn.disabled = false; }, 2500);
        updating = false;
        return;
      }

      await clearBundleCache();
      window.__sgReloading = true;
      teardown();
      try {
        document.open();
        document.write(html);
        document.close();
      } catch (err) {
        console.error('update failed', err);
        location.reload();
        return;
      }
      setTimeout(() => { window.__sgReloading = false; }, 3000);
    });
  }
  // ---- Change log modal: opened from the navbar button, and once on page load when the log changed ----
  (() => {
    const modal = byId('changelog-modal');
    const body = byId('changelog-modal-body');
    if (!modal || !body) return;

    const BUNDLE_PATH = 'Assets/json/change-log.json';
    const SEEN_KEY = 'kstuff_changelog_seen';
    const CACHE_KEY = 'kstuff_changelog_cache_v2';
    const sources = [
      'https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/json/change-log.json',
      'https://raw.githubusercontent.com/lotsacookie/kstuff/main/Assets/json/change-log.json'
    ];

    const toText = i => i == null ? '' : typeof i === 'string' ? i : typeof i === 'number' ? String(i) : (i.text || i.message || i.description || i.title || i.name || '');
    const toList = v => v == null ? [] : Array.isArray(v) ? v.map(toText).filter(Boolean) : [toText(v)].filter(Boolean);
    const entryOf = e => {
      if (typeof e === 'string') return { version: '', title: '', date: '', changes: [e] };
      let version = e.version || e.v || e.tag || '';
      let title = e.title || e.name || '';
      if (!version && title) { version = title; title = ''; }
      return {
        version: String(version), title: String(title),
        date: String(e.date || e.timestamp || e.time || e.released || ''),
        changes: toList(e.changes || e.items || e.notes || e.changelog || e.log || e.list || e.description || e.text)
      };
    };
    const normalize = data => {
      let list = null;
      if (Array.isArray(data)) list = data;
      else if (data && typeof data === 'object') {
        if (Array.isArray(data.changes) && !data.changes.some(x => x && typeof x === 'object')) list = [data];
        else {
          for (const k of ['changelog', 'changeLog', 'changes', 'entries', 'log', 'versions', 'updates', 'releases']) {
            if (Array.isArray(data[k])) { list = data[k]; break; }
          }
        }
        if (!list) list = (data.version || data.date || data.timestamp) ? [data] : Object.keys(data).map(k => ({ version: k, changes: data[k] }));
      }
      const entries = (list || []).map(entryOf).filter(e => e.version || e.title || e.changes.length);
      if (entries.length > 1 && entries.every(e => e.date && !isNaN(Date.parse(e.date)))) entries.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
      return entries.slice(0, 10);
    };

    const signature = entries => {
      const str = JSON.stringify(entries);
      let h = 5381;
      for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
      return String(h >>> 0);
    };

    const fetchJson = async (url, ms) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), ms);
      try {
        const res = await fetch(url, { cache: 'no-cache', signal: ctrl.signal });
        if (!res.ok) throw new Error('bad status');
        return await res.json();
      } finally { clearTimeout(timer); }
    };

    const load = async () => {
      try {
        const sg = window.singularity;
        if (sg && sg.has && sg.has(BUNDLE_PATH)) {
          const entries = normalize(sg.json(BUNDLE_PATH));
          if (entries.length) return entries;
        }
      } catch {}
      for (const url of sources) {
        try {
          const entries = normalize(await fetchJson(url, 5000));
          if (entries.length) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(entries)); } catch {} return entries; }
        } catch (err) { console.warn('Change log source failed:', url, err); }
      }
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (Array.isArray(cached) && cached.length) return cached;
      } catch {}
      return null;
    };

    const status = text => {
      body.textContent = '';
      body.appendChild(K.el('div', { className: 'changelog-status', textContent: text }));
    };

    const render = entries => {
      body.textContent = '';
      entries.forEach(e => {
        const wrap = K.el('div', {});
        const head = K.el('div', { className: 'changelog-entry-head' });
        if (e.version) head.appendChild(K.el('span', { className: 'changelog-version', textContent: e.version }));
        if (e.title) head.appendChild(K.el('span', { className: 'changelog-title', textContent: e.title }));
        if (e.date) head.appendChild(K.el('span', { className: 'changelog-date', textContent: e.date }));
        if (head.childNodes.length) wrap.appendChild(head);
        if (e.changes.length) {
          const ul = K.el('ul', { className: 'changelog-list' });
          e.changes.forEach(c => ul.appendChild(K.el('li', { textContent: c })));
          wrap.appendChild(ul);
        }
        body.appendChild(wrap);
      });
    };

    let ready = null;
    let loaded = null;
    const ensure = () => ready || (ready = load().then(entries => {
      if (entries) { loaded = entries; render(entries); } else { status('Change log unavailable'); ready = null; }
      return entries;
    }));

    K.openChangelog = () => {
      if (loaded) render(loaded); else status('Loading...');
      modal.classList.add('active');
      ensure();
    };

    // Initial page load only: pop the modal up if the log differs from the last one this browser was shown.
    const tourPending = () => {
      try { return /[?&]welcome\b/.test(location.search) || !localStorage.getItem('kstuff_welcome_seen'); } catch { return false; }
    };
    ensure().then(entries => {
      if (!entries) return;
      let seen = null;
      try { seen = localStorage.getItem(SEEN_KEY); } catch {}
      const sig = signature(entries);
      if (seen === sig) return;
      // The welcome tour owns the first visit; the change log is shown on a later load instead.
      if (tourPending()) return;
      setTimeout(() => {
        if (document.querySelector('.modal-overlay.active')) return;
        modal.classList.add('active');
        try { localStorage.setItem(SEEN_KEY, sig); } catch {}
      }, 600);
    });
  })();
}
