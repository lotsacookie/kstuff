export function init(K) {
  const byId = id => document.getElementById(id);
  const clockEl = byId('clock-text');
  const pingEl = byId('ping-text');
  const weatherText = byId('weather-text');
  const weatherIcon = byId('weather-icon');

  const PING_MS = 5000;
  const WEATHER_MS = 600000;
  const PING_TIMEOUT = 8000;

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

  let pingBusy = false, lastPing = 0;
  async function checkPing() {
    if (!pingEl || pingBusy || document.hidden) return;
    pingBusy = true;
    lastPing = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), PING_TIMEOUT);
    const start = performance.now();
    try {
      await fetch('https://httpbin.org/get', { method: 'HEAD', cache: 'no-store', signal: ctrl.signal });
      pingEl.textContent = `${Math.round(performance.now() - start)} ms`;
    } catch {
      pingEl.textContent = 'Offline';
    } finally {
      clearTimeout(timer);
      pingBusy = false;
    }
  }

  const weatherIconFor = condition => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return 'ph ph-cloud-rain';
    if (c.includes('cloud') || c.includes('overcast')) return 'ph ph-cloud';
    if (c.includes('snow')) return 'ph ph-snowflake';
    return 'ph ph-sun';
  };

  let weatherBusy = false, lastWeather = 0;
  async function fetchWeather() {
    if (!weatherText || weatherBusy || document.hidden) return;
    weatherBusy = true;
    lastWeather = Date.now();
    try {
      const res = await fetch('https://wttr.in/?format=j1');
      if (res.ok) {
        const data = await res.json();
        const cur = data.current_condition[0];
        const condition = cur.weatherDesc[0].value;
        weatherText.textContent = `${cur.temp_F}°F ${condition}`;
        if (weatherIcon) {
          const cls = weatherIconFor(condition);
          if (weatherIcon.className !== cls) weatherIcon.className = cls;
        }
      }
    } catch {
      weatherText.textContent = 'Weather N/A';
    } finally {
      weatherBusy = false;
    }
  }

  tickClock();
  checkPing();
  fetchWeather();
  setInterval(checkPing, PING_MS);
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
