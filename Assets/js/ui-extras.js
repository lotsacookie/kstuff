export function init(K) {
  const byId = id => document.getElementById(id);
  const clockEl = byId('clock-text');
  const pingEl = byId('ping-text');
  const weatherText = byId('weather-text');
  const weatherIcon = byId('weather-icon');

  const PING_MS = 10000;
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
}
