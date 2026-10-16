export function init(K) {
  const WISP_LIST_PATH = 'Assets/json/wss.json';
  const TEST_TIMEOUT = 3000;
  const WAVE = 4;

  K.WISP_SERVERS = [
    'cdn.northstreetumc.org',
    'cdn.vipersfutbol.com',
    'cdn.pcesc.org',
    'cdn.kcchallengevbc.com',
    'cdn.slcbmooc.org',
    'cdn.topstargym.net',
    'cdn.goaplytexas.org',
    'wss://athollcottage.com/connection/',
    'wss://api.personalloanonline.net/ws/',
    'wss://kristenblackburnvolleyballcamps.com/socket/',
    'wss://southpadreislandkiteboarding.com/socket/'
  ];
  K.WISP_FALLBACK = 'wss://api.personalloanonline.net/ws/';
  K.wispUrls = [];
  window.serverList = K.WISP_SERVERS;

  const wlspUrl = entry => (entry.includes('://') ? entry : `wss://${entry}/`);
  const isBackupServer = entry => entry.includes('://');

  const readStore = key => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const writeStore = (key, value) => {
    try { localStorage.setItem(key, String(value)); } catch {}
  };

  function testWlspDomain(entry, timeoutMs = TEST_TIMEOUT) {
    return new Promise(resolve => {
      let ws;
      try {
        ws = new WebSocket(wlspUrl(entry));
      } catch {
        resolve(null);
        return;
      }
      ws.binaryType = 'arraybuffer';
      let connected = false;
      let sentAt = 0;
      let timer = 0;
      const streamId = (Math.floor(Math.random() * 0xFFFFFFFE) + 1) >>> 0;
      const finish = ping => {
        clearTimeout(timer);
        ws.onmessage = ws.onerror = ws.onclose = null;
        try { ws.close(); } catch {}
        resolve(ping);
      };
      timer = setTimeout(() => finish(null), timeoutMs);
      ws.onmessage = e => {
        if (!(e.data instanceof ArrayBuffer) || e.data.byteLength < 5) return;
        const view = new DataView(e.data);
        const type = view.getUint8(0);
        const stream = view.getUint32(1, true);
        if (!connected) {
          if (type === 5 && stream === 0) {
            ws.send(new Uint8Array([5, 0, 0, 0, 0, 2, 1]));
          } else if (type === 3 && stream === 0) {
            connected = true;
            const host = new TextEncoder().encode('127.0.0.1');
            const buf = new ArrayBuffer(8 + host.length);
            const dv = new DataView(buf);
            dv.setUint8(0, 1);
            dv.setUint32(1, streamId, true);
            dv.setUint8(5, 1);
            dv.setUint16(6, 1, true);
            new Uint8Array(buf).set(host, 8);
            sentAt = performance.now();
            ws.send(buf);
          }
          return;
        }
        if (stream !== streamId) return;
        finish(Math.round(performance.now() - sentAt));
      };
      ws.onerror = ws.onclose = () => finish(null);
    });
  }

  function accept(index, ping) {
    const entry = K.WISP_SERVERS[index];
    if (!isBackupServer(entry)) writeStore('WID', index);
    window.WlspPing = ping;
    window.WlspIsBackup = isBackupServer(entry);
    return wlspUrl(entry);
  }

  async function getWlsp() {
    const list = K.WISP_SERVERS;
    const stored = readStore('WID');
    const index = Number(stored);
    if (stored !== null && stored !== '' && Number.isInteger(index) && index >= 0 && index < list.length && !isBackupServer(list[index])) {
      const ping = await testWlspDomain(list[index]);
      if (ping !== null) return accept(index, ping);
    }
    for (let i = 0; i < list.length; i += WAVE) {
      const wave = list.slice(i, i + WAVE);
      const pings = await Promise.all(wave.map(entry => testWlspDomain(entry)));
      let best = -1;
      pings.forEach((p, j) => {
        if (p !== null && (best === -1 || p < pings[best])) best = j;
      });
      if (best !== -1) return accept(i + best, pings[best]);
    }
    window.WlspPing = undefined;
    window.WlspIsBackup = isBackupServer(K.WISP_FALLBACK);
    return wlspUrl(K.WISP_FALLBACK);
  }

  K.resolveWlsp = () => {
    window.kWispP = getWlsp()
      .catch(() => wlspUrl(K.WISP_FALLBACK))
      .then(url => {
        window.wlspServer = url;
        return url;
      });
    return window.kWispP;
  };

  K.revalidateWisp = () => {
    window.wlspServer = undefined;
    return K.resolveWlsp();
  };

  const base64ToText = b64 => new TextDecoder('utf-8').decode(Uint8Array.from(atob(b64.trim()), c => c.charCodeAt(0)));

  const extractWss = value => {
    if (Array.isArray(value)) {
      const direct = value.filter(u => typeof u === 'string' && /^wss:\/\//i.test(u.trim())).map(u => u.trim());
      if (direct.length) return direct;
      for (const item of value) {
        const found = extractWss(item);
        if (found.length) return found;
      }
      return [];
    }
    if (value && typeof value === 'object') {
      for (const item of Object.values(value)) {
        const found = extractWss(item);
        if (found.length) return found;
      }
    }
    return [];
  };

  let wispListPromise = null;

  K.fetchWisps = () => {
    if (!wispListPromise) {
      wispListPromise = (async () => {
        try {
          const outer = await K.fetchWithProxy(WISP_LIST_PATH);
          let b64 = null;
          if (Array.isArray(outer)) b64 = outer.find(v => typeof v === 'string' && v.trim());
          else if (typeof outer === 'string') b64 = outer;
          if (!b64) throw new Error('no wisp list payload');
          const urls = [...new Set(extractWss(JSON.parse(base64ToText(b64))))];
          if (!urls.length) throw new Error('wisp list empty');
          K.wispUrls = urls;
          window.wispUrls = urls;
          return urls;
        } catch (err) {
          wispListPromise = null;
          console.warn('wisp list unavailable:', err && err.message ? err.message : err);
          return K.wispUrls;
        }
      })();
    }
    return wispListPromise;
  };

  K.wisp = {
    test: testWlspDomain,
    get: getWlsp,
    url: wlspUrl,
    isBackup: isBackupServer
  };

  K.resolveWlsp();
  K.fetchWisps();
}
