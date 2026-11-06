const STORAGE_SOURCES = [
  'https://cdn.jsdelivr.net/gh/TongSherbet/storage@main/loader.js',
  'https://raw.githubusercontent.com/TongSherbet/storage/main/loader.js'
];
const SYNC_KEY = 'WSYNC';
const SYNC_TTL = 3600000;
const SYNC_TIMEOUT = 3500;
const SYNC_MAX = 32;

const HOST_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
const WSS_RE = /^wss:\/\/[a-z0-9.-]+(:\d{1,5})?(\/[\w\-./]*)?$/i;

const KORONA_BLOBS = [
  'aw1.J-dMWdO8_D0S.FgEQTkZMQAkGBB1DCk8eAlQ-VAkkORA8FjA2V3xNWBICTCUnW2stBkAQficyQFxTG0xUHSdRKVNpNgkGCkcUFDsVRmlaHxpJWwIGDgEEVCsDECUyEydRKyFUPExUEhELGwYPXkIGARMCGggAGxUbY1wLFgt8XAwOY2ANWDATUyQZVksHXwFNeF0XBg1iKwJuOiQXdRdwKVEnUhwVFxAARAgDXlFDQUUMDB4KVC5fDTsySjxQMDQfJFNCEV0yOlElbANaFydnPlJEAmsrHTQ9YgIkDi19ZWNMRAcqAltjFF4fU1xbQAwVG0ZOL14QYDxKLlM-KlUgT1IKAU0XDwcCGwAABAI8L0steyUeAB4dN3wPNhVRY2pBVBQIQhtaeFwfBhJ1DE55HEk5F0tiOgU7UHIwVSBOHApcABgGFkkBBhwaAw4HF0RNI14UYgYqd34eKwM3aXsyQVQdOAIdPBlGEkZbE0o-CjxYAhU2S0VPLDcKfBVcAAYLWR0GXhhEGFpJCA0HCkg_QwFjNAIrFygtQyMVYC9KJTUGUEk_IyBHGgQwEltqOhgCJmEWdm1vMkU1YlBOeBQHGlkCQwQSAEVAFRYYTmdGSik-ACtBcSlfPhVGCAETWzgtFSooHEdJPisgWA0jfAV9BxR6XjRyQmpvARcHBSwITCcbGgBOAkIMEh9SZ1kBPiNJJBY7PVwyVFgSXAwaBQpDCUYEHV4dTiIlAgxsC34zNwVrbHNZAlsBMQJWEgJVX1U8QwJYCzkSRDA9Xhd3eEsiWSssHSdfQhVfCFoNGkENBx4XRB4AABgUKUsAYiANPEhwFX5rfHAOQQcnIzAeWwAiFR09EUYNUXxfXRhnEjpeByUfWU1CEkhMWwQCWQREBxFeGUwYRVw4QgMoIxAqFjwiVHxNWBICTCUnW2stBkAQficyQFxTG0xUHSdRKVNpNgkGCkcUFDsVRmlaHxpJWwIAAAcDFz5IFzl6D2FeLStXOl9UUFwAEg1MWgUaA1t8I1k1KlV5STcHBFd4UQ4lAANKBAcZVQZQNh0aHBUsTEJrBBhJcAJLIDYQJxUrIUMnF1pPFBEbDgpIHxsQFUkITxANXmVaDT4nSx52ZwJxPAlVMjgwR14KfA1ZIwQYCwpFGQMfHRI4MTwuF1UzQyAAHk4fAgABTlkJGgdZRkMHBghROUIIInkXJ1cva0c6SUFOIy1MLyJCXw0gPn5eVho6W3p9FHgxD3lKZhEAJU9XORNMfh4QXlZGXBlMGQleH185WUkmeQMqVjY-SX1ZVwVdFB0aEwI9J0sybAJSFzhwGR5TJAYFf2gvcVY4DENYJ1MCHAV1DUZ5A14eW1xEVytZDGAjATxMci8eNFQcDBMXHEcBSB8dXANEHhFcOnRyayUiZAAccgx3BzprUFEiE0EPCBseUCZEWxgHKwoVQFoXPm1LYFU-MFh-TlQSBk4fRwRDQQQSAEVDAhBETSNeFGIGKnd-HisDN2l7MkFUHTgCHTwZRhJGWxNKPgo8WAIVNktFTyw3CnwVXAAGC1kdBl4YRBhaSgNMHgpOIgMHKzNLOFEsNB8CdAknMwxHDTBnP1pEHXwMUSMbDyxGUj9uMX9OKiJoMhU7FgEQTkZMQA0dG1lZCBIHRlFkSgpgOgU7UHEzXyFRQk4FCgcZTHwiUTU1Ql4FICFpeRoNHDZUH0hqIltlSAg0QhUBDztMQ2MEB15XTlwGWz5FSTkyFzsVNGpXPF1EAAAHHQgNXhkKGAcDDgcXRE0jXhRiBip3fh4rAzdpezJBVB04Ah08GUYSRlsTSj4KPFgCFTZLRU8sNwp8FVwABgtZHQZeGEQYWkoCBgYKSC5EBSMkESxTLGpDO1VBTgUKBxlMfCJRNTVCXgUgIWl5Gg0cNlQfSGoiW2VICDRCFQEPO0xDYwQHXldOXAZbPkVJOTIXOxU0alc8VV8IHAQSBhEDAAAVEQIaCAAbFRtjXAsWC3xcDA5jYA1YMBNTJBlWSwdfAU14XRcGDWIrAm46JBd1F3ApUSdSHBUXEABECAMEAB8BQAQPEgcUKUsAYiANPEhwFX5rfHAOQQcnIzAeWwAiFR09EUYNUXxfXRhnEjpeByUfWU1CEkhMWwQCWQREBxFeGUwYRVI6XhcuPwsgVCxqXyFdHhYbEARGMmNULzIbHgkyOTgJfUQ1LGc0Pw05LwYhA2RRBBYSMQICZh4ABxdCTh4KTiIAECgkEGJTcShZNFJFEgIGEQ0KXg0aAFpeBQ4DRE0jXhRiBip3fh4rAzdpezJBVB04Ah08GUYSRlsTSj4KPFgCFTZLRU8sNwp8FVwABgtZHQZeGEQYWkEEBhsfSTpIASk-FyhZJmpTNV4eFhsQBEYyY1QvMhseCTI5OAl9RDUsZzQ_DTkvBiEDZFEEFhIxAgJmHgAHF0JOHgpOIgAQKCQQYlNxKVUhSEgCGhEdGhdADRpdF0sJTgQCSToCNQNvIg5XbCBjGWkCVhsyFVkzXVkPGEJfVDRDHU8sdQViXRM8S2VrHz5bRQlfFxEaFwAHRwERTgwVXQhcLgITJCQUYGkRfHYSVQIFISknWlREPQhDJF1YBxhdSHN4VDsiAhdZcE5HIEkLTl0OFR0LABgMAAAABk8BDlkrWUohPgIqFygtQyMVYC9KJTUGUEk_IyBHGgQwEltqOhgCJmEWdm1vMkU1YlBOeBQHGlkCQwQSAEVAFRYYTmdGSj8yBy5McTdYPEoeFhsQBEYyY1QvMhseCTI5OAl9RDUsZzQ_DTkvBiEDZFEEFhIxAgJmHgAHF0JOHgpOIgAQKCQQYlNxN1UyVlgEAQIGCgJJCUcQEklCFhoYSmV8KnURJSALOxd6AAkGCCMCRDkTGAoCRQYUOFEFHlwSTEtHIBc8AnBrXTJOWUwGBgcdTkZCHRsRWgUIBw5eJVsBPjQMIFczNx48SFZOBQoHGUx8IlE1NUJeBSAhaXkaDRw2VB9IaiJbZUgINEIVAQ87TENjBAdeV05cBls-RUk5Mhc7FTRqRDpZXg8EBgYdBl9CBRwYAhoIABsVG2NcCxYLfFwMDmNgDVgwE1MkGVZLB18BTXhdFwYNYisCbjokF3UXcClRJ1IcFRcQAEQIAxkaFhVDBg5dE0MwAhMkJBRgaRF8dhJVAgUhKSdaVEQ9CEMkXVgHGF1Ic3hUOyICF1lwTkcgSQtOXQ4VHQsAGAwAAAAGTwYYXytaFGM0AisXKC1DIxVgL0olNQZQST8jIEcaBDASW2o6GAImYRZ2bW8yRTViUE54FAcaWQJDBBIARUAVFhhOZ0ZKO2VKPk06N0R8TVgSAkwlJ1trLQZAEH4nMkBcUxtMVB0nUSlTaTYJBgpHFBQ7FUZpWh8aSVsCDBMQH1MpAwgsI0sQSXAVfmt8cA5BBycjMB5bACIVHT0RRg1RfF9dGGcSOl4HJR9ZTUISSExbAgJBWl5FQwMACB0fQydECjkkSiBKOGtvIhVgL0olNQZQST8jIEcaBDASW2o6GAImYRZ2bW8yRTViUE4',
  'aw1.F8iGkUqBml5M.FgEQTkZMQAkGBB1DCk8eAlQyQQQuBSECbAIeUmJNWBICTA8CHgJmHgAHF0JOGARIKVYIaR89FDUFBUEoXl4XFxAXAQxCABpdG18KTgQCSTYXEiwWens1Hh8PYhVcAAYLWR0GXhhEGFofVVFGA1srVQgpDycYNAhCRiVVQU4FCgcZTFYHFFx-Wh4SSUQVK1kdL0YhFDEZQV5jW1oAHAYHHABGH0cQEklCFhoYSmlDAjpEXwYxHlYaYldQFRpOAAwQWUECXRdBAhQXBlUpVkckDTFeNQQfRWJBWhxdaQMaEBdDRh4VWQVMBw5JMhUCaQ8wHTYMHkAjXx8CFAdbHgpeHEYIH1BCawQYSXwXRioKIRlvGQlGORdaTxYKEA0aAwEGHltaBBIDREEtRUZNHCYCeEJDWCxOWUwGBgcdTkZCDQoYTAMIAEVVKFQAKQ56BiseHBo2UUxOeBQHGlkCQwQSAEVAFRYYTmtTRyMSORAsAA9cPltCElwAEg1MWgUaA1tWBhxcYU01S1NoRDgQNgVBQShJRUwZTRIbDEoJHQcRAw4HF0RNL0sZaBA-DG1nG0Y-AB5OHwIAAU5ZCRoHWUZDBwEEXS9dDHZFNhcmQhtcPkoeGhkeW2MUXh9TXFtADBUbRk4jSx1qAHsXMAILXChJQwITBxFHAEsIRgQdXh1OCABHaTIeNBhvXm0ADUElF0UEARdZAk1LGQoYB0IBDl0YUilIRjACJgFtFgdIYjBGEgFZW0YOTBgBXgBIHhVeABQhXQcuESxfIQsIGjpTQhFdGB8UTCcbGgBOAkIMEh9Sa0wMNB94GmwKAhggW0UJXAERGhcCGwAABAIWCg5EMDFLGn1EehwjGQQYOV9CFV8IWg4NAAEIBxwDDgJcHFM1SEY8ACheSBofRncVHgwTFxxEF0gfHV4fAwoPXgZbMlBHJA0xXjUEH0ViQVocXWkDGhAXQ0YeFVkFTAcOSTIVAmkMO1wvDBhdY01eExkQWx4KXhxGCB9QQmsEGEl8F0YqCiEZbxkJRjkXWk8VDBMcAl8IABIaXhgCGBgUJV4NaBw8AjJCF14wFTsWARBORkxADR0bWVkIEgdGUWhfBiAeNAMmBA1bPk9SCgFNBwEMXUMeGgddQhoYFhVMTxo0UXpeLwwYXWBOVBIGTh9HBEIDBxoaSgsOAUVWL14MaBw8AjJCF14wFTsWARBORkxADR0bWVkIEgdGUWhQACseOBgsDAAbLlxVTgUKBxlMVgcUXH5aHhJJRBUrWR0vRiEUMRlBXmNSQRIBABwGDEEfRxwGSkIWGhhKaUMCOkRfBjEeVhpiV1AVGk4ADBBZQQJdGEQKCQcYSiNdDS4YNAIxQx9dIkoeFhsQBEYYRhFGeQNeHltcRFcnTAFqHzACNkAHGyFTVgkGEAQMBkkFGhQVVEMCFQ8VMVEaN0QuGj9CZkI-SQtOXQ4VHQsAGAwAAAAGTx4OSDRBCi8ZPAI2AA1GY1lXBV0UHRoTAhcCDlsnGhIAURVpVQgzA3gFJx4YGCYUQwQRAgBHAEsIRgQdXh1OCABHaTIeNBhvXm0ADUElF0UEARdZAk1fCQoSAAMBCBUOFTFRGjdELho_QmZCPkkLTl0OFR0LABgMAAAABk8BDlknTEc0AzoBbRoFRj0VSgoPTH4eEF5WRlwZTBkJXh9fNUxELEUmFCMBBVA-W0MCEwcRRwBLCEYEHV4dTggAR2kyHjQYb15tAA1BJRdFBAEXWQJNWQQMBBxEGQQXBEwjSwovBDodMUMDRyoVRggBE1sSCFBDYwQHXldOXAZbMlBEMw4mBW8GQkEkWV4PBAYGHQZfQgUcGAIaCAAbFT1TFGhhIgIxV0MaIFtFCV8XERoXAAdHBgdIDA8YBBQ-QRNoHDwCMkIXXjAVOxYBEE5GTEANHRtZWQgSB0ZRaE0aIgoiAWwOClFiTVgSAkwPAh4CZh4ABxdCTh4KTi4VHSIYIVwpQxoHY0tEBAEXWx4KXhxGCB9QQmsEGEl8F0YmGTYFKw5CWSxOHj4DTA8CHgJmHgAHF0JOGApWcA9fcEU4GCwZFVgkVEUSXAwGDkxyHUYIH1BC'
];
const KORONA_MAX = 256;

export function normalizeWss(value) {
  try {
    const u = new URL(String(value).trim());
    if (u.protocol !== 'wss:' || u.username || u.password || u.search || u.hash) return null;
    if (!u.pathname.endsWith('/')) u.pathname += '/';
    return u.toString();
  } catch { return null; }
}

function unmaskWispBlob(raw) {
  const parts = String(raw).trim().split('.');
  if (parts.length !== 3 || parts[0] !== 'aw1' || !parts[1] || !/^[A-Za-z0-9_-]+$/.test(parts[2])) return null;
  try {
    const b64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - b64.length % 4) % 4));
    const key = new TextEncoder().encode('arctic-list-mask:' + parts[1] + ':1');
    const bytes = Uint8Array.from(bin, (c, i) => c.charCodeAt(0) ^ key[i % key.length]);
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch { return null; }
}

export function parseKoronaWisps(blobs) {
  const out = [];
  for (const blob of blobs) {
    let text = String(blob).trim();
    for (let depth = 0; depth < 4; depth++) {
      const inner = unmaskWispBlob(text);
      if (inner === null) break;
      text = inner.trim();
    }
    for (const line of text.split(/\r?\n/)) {
      const value = line.trim();
      if (!value || value.startsWith('#')) continue;
      const url = normalizeWss(value);
      if (url && !out.includes(url)) out.push(url);
      if (out.length >= KORONA_MAX) return out;
    }
  }
  return out;
}

export const KORONA_WISPS = parseKoronaWisps(KORONA_BLOBS);

function decodeLoaderList(src, depth = 0) {
  if (depth > 3 || typeof src !== 'string') return [];
  let code = null;
  try {
    const stub = new Proxy({}, { get: (_, k) => (a) => { if (code === null && typeof a === 'string') code = a; } });
    new Function('globalThis', src)(stub);
  } catch {}
  if (!code) return [];
  const arrays = code.match(/\[(?:\s*"[^"\\]{3,120}"\s*,?)+\s*\]/g) || [];
  for (const arr of arrays) {
    let vals;
    try { vals = JSON.parse(arr.replace(/,\s*\]$/, ']')); } catch { continue; }
    const out = [];
    for (const v of vals) {
      const value = String(v).trim();
      if ((HOST_RE.test(value) || WSS_RE.test(value)) && !out.includes(value)) out.push(value);
      if (out.length >= SYNC_MAX) break;
    }
    if (out.length >= 3 && out.length >= vals.length * 0.6) return out;
  }
  return decodeLoaderList(code, depth + 1);
}

export function parseServerList(src) {
  if (typeof src !== 'string') return [];
  const text = src.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  const block = text.match(/serverList\s*=\s*\[([\s\S]*?)\]\s*[;,]/);
  if (!block) return decodeLoaderList(src);
  const item = /(["'])((?:\\.|(?!\1)[^\\])*)\1(\s*\.split\(\s*(?:""|'')\s*\)\s*\.reverse\(\)\s*\.join\(\s*(?:""|'')\s*\))?/g;
  const out = [];
  let m;
  while ((m = item.exec(block[1]))) {
    const value = (m[3] ? [...m[2]].reverse().join('') : m[2]).trim();
    if ((HOST_RE.test(value) || WSS_RE.test(value)) && !out.includes(value)) out.push(value);
    if (out.length >= SYNC_MAX) break;
  }
  return out;
}

export function init(K) {
  const WISP_LIST_PATH = 'Assets/json/wss.json';
  const TEST_TIMEOUT = 3000;
  const PROBE_WAVE = 6;
  const SPEED_TARGETS = [
    { host: 'speedtest.tele2.net', path: '/10MB.zip' },
    { host: 'ipv4.download.thinkbroadband.com', path: '/10MB.zip' }
  ];
  const SPEED_CHUNK = 262144;
  const SPEED_CHUNKS = 4;
  const SPEED_LIMIT = 6000;
  const SPEED_GOOD = 1500000;
  const SPEED_CANDIDATES = 4;
  const EXTRA_LIMIT = 16;
  const BACKUP_TRY_LIMIT = 12;
  const BACKUP_KEY = 'WBK';
  const BACKUP_TTL = 21600000;
  const HISTORY_KEY = 'WBH';
  const LAST_KEY = 'WLAST';
  const BAD_KEY = 'WBAD';
  const PRIMARY_KEY = 'WIDE';
  const LAST_TTL = 21600000;
  const BAD_SOFT = 600000;

  K.WISP_SERVERS = [
    'cdn.northstreetumc.org',
    'cdn.vipersfutbol.com',
    'cdn.pcesc.org',
    'cdn.kcchallengevbc.com',
    'cdn.slcbmooc.org',
    'cdn.topstargym.net',
    'cdn.goaplytexas.org',
    'cdn.clearfieldswimming.com',
    'cdn.richardacademy.cfd',
    'wss://athollcottage.com/connection/',
    'wss://kidsprepnest.org/vi/',
    'wss://api.personalloanonline.net/ws/',
    'wss://kristenblackburnvolleyballcamps.com/socket/',
    'wss://southpadreislandkiteboarding.com/socket/'
  ];
  K.WISP_FALLBACK = 'wss://api.personalloanonline.net/ws/';
  K.WISP_VERSION = 10;
  K.WISP_BASE = K.WISP_SERVERS.slice();
  console.log('[wisp] module loaded, build', K.WISP_VERSION);
  K.wispUrls = [];
  const shuffled = list => {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  K.KORONA_WISPS = shuffled(KORONA_WISPS);
  window.koronaWisps = K.KORONA_WISPS;
  window.serverList = K.WISP_SERVERS;

  const wlspUrl = entry => (entry.includes('://') ? entry : `wss://${entry}/`);
  const isBackupServer = entry => entry.includes('://');

  const readStore = key => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const writeStore = (key, value) => {
    try { localStorage.setItem(key, String(value)); } catch {}
  };

  const isMainEntry = entry => K.WISP_SERVERS.some(e => !isBackupServer(e) && normKey(e) === normKey(entry));

  function testWlspDomain(entry, timeoutMs = TEST_TIMEOUT) {
    const plain = !isMainEntry(entry);
    const openedAt = performance.now();
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
            if (plain) { finish(Math.round(performance.now() - openedAt)); return; }
            connected = true;
            const host = new TextEncoder().encode('127.0.0.1');
            const buf = new ArrayBuffer(8 + host.length);
            const dv = new DataView(buf);
            dv.setUint8(0, 1);
            dv.setUint32(1, streamId, true);
            dv.setUint8(5, 1);
            dv.setUint16(6, 69, true);
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

  const readJson = key => {
    try { return JSON.parse(readStore(key)) || null; } catch { return null; }
  };

  const normKey = entry => {
    const t = String(entry || '').trim();
    if (!t) return '';
    const u = t.includes('://') ? t : `wss://${t}/`;
    return u.endsWith('/') ? u : u + '/';
  };

  const liveBad = () => {
    const raw = readJson(BAD_KEY);
    const out = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    const now = Date.now();
    for (const [key, until] of Object.entries(raw)) if (typeof until === 'number' && until > now) out[key] = until;
    return out;
  };

  const isBad = entry => Object.prototype.hasOwnProperty.call(liveBad(), normKey(entry));

  const markBad = (entry, ttl) => {
    const key = normKey(entry);
    if (!key) return;
    const bad = liveBad();
    bad[key] = Math.max(bad[key] || 0, Date.now() + (ttl || BAD_SOFT));
    writeStore(BAD_KEY, JSON.stringify(bad));
  };

  const clearBad = entry => {
    const key = normKey(entry);
    const bad = liveBad();
    if (!(key in bad)) return;
    delete bad[key];
    writeStore(BAD_KEY, JSON.stringify(bad));
  };

  const writeLast = entry => writeStore(LAST_KEY, JSON.stringify({ url: normKey(entry), ts: Date.now() }));

  const recordOutcome = (entry, ok) => {
    const history = readJson(HISTORY_KEY) || {};
    const row = history[entry] || { ok: 0, fail: 0 };
    if (ok) row.ok = Math.min(row.ok + 1, 20); else row.fail = Math.min(row.fail + 1, 20);
    history[entry] = row;
    writeStore(HISTORY_KEY, JSON.stringify(history));
  };

  const reliability = entry => {
    const row = (readJson(HISTORY_KEY) || {})[entry];
    return row ? (row.ok + 1) / (row.ok + row.fail + 1) : 1;
  };

  const findHeaderEnd = bytes => {
    for (let i = 0; i + 3 < bytes.length; i++) {
      if (bytes[i] === 13 && bytes[i + 1] === 10 && bytes[i + 2] === 13 && bytes[i + 3] === 10) return i;
    }
    return -1;
  };

  function speedTestWisp(entry, limitMs = SPEED_LIMIT) {
    return new Promise(resolve => {
      let ws;
      try {
        ws = new WebSocket(wlspUrl(entry));
      } catch {
        resolve(null);
        return;
      }
      ws.binaryType = 'arraybuffer';
      const enc = new TextEncoder();
      let ready = false;
      let done = false;
      let streamId = 0;
      let target = 0;
      let chunk = 0;
      let completed = 0;
      let headerBuf = new Uint8Array(0);
      let headerDone = false;
      let body = 0;
      let totalBody = 0;
      let startedAt = 0;
      let lastData = 0;
      let maxGap = 0;
      let timer = 0;

      const summary = () => {
        if (!ready) return null;
        const elapsed = Math.max(1, performance.now() - startedAt);
        return { bps: Math.round(totalBody / elapsed * 1000), completed, maxGap: Math.round(maxGap), bytes: totalBody };
      };

      const finish = result => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        ws.onmessage = ws.onerror = ws.onclose = null;
        try { ws.close(); } catch {}
        resolve(result);
      };

      const openChunk = () => {
        streamId = (Math.floor(Math.random() * 0xFFFFFFFE) + 1) >>> 0;
        headerBuf = new Uint8Array(0);
        headerDone = false;
        body = 0;
        const t = SPEED_TARGETS[target];
        const host = enc.encode(t.host);
        const connect = new ArrayBuffer(8 + host.length);
        const cv = new DataView(connect);
        cv.setUint8(0, 1);
        cv.setUint32(1, streamId, true);
        cv.setUint8(5, 1);
        cv.setUint16(6, 80, true);
        new Uint8Array(connect).set(host, 8);
        const from = chunk * SPEED_CHUNK;
        const request = enc.encode(`GET ${t.path} HTTP/1.1\r\nHost: ${t.host}\r\nRange: bytes=${from}-${from + SPEED_CHUNK - 1}\r\nAccept-Encoding: identity\r\nConnection: close\r\n\r\n`);
        const data = new Uint8Array(5 + request.length);
        data[0] = 2;
        new DataView(data.buffer).setUint32(1, streamId, true);
        data.set(request, 5);
        try {
          ws.send(connect);
          ws.send(data);
        } catch {
          finish(summary());
        }
      };

      const endChunk = ok => {
        const closing = new Uint8Array(6);
        closing[0] = 4;
        new DataView(closing.buffer).setUint32(1, streamId, true);
        closing[5] = 2;
        try { ws.send(closing); } catch {}
        streamId = 0;
        if (!ok && chunk === 0 && body === 0 && target + 1 < SPEED_TARGETS.length) {
          target++;
          openChunk();
          return;
        }
        if (ok) completed++;
        chunk++;
        if (!ok || chunk >= SPEED_CHUNKS) {
          finish(summary());
          return;
        }
        openChunk();
      };

      timer = setTimeout(() => finish(summary()), limitMs);

      ws.onmessage = e => {
        if (!(e.data instanceof ArrayBuffer) || e.data.byteLength < 5) return;
        const view = new DataView(e.data);
        const type = view.getUint8(0);
        const stream = view.getUint32(1, true);
        if (!ready) {
          if (type === 5 && stream === 0) {
            ws.send(new Uint8Array([5, 0, 0, 0, 0, 2, 1]));
          } else if (type === 3 && stream === 0) {
            ready = true;
            startedAt = performance.now();
            openChunk();
          }
          return;
        }
        if (!streamId || stream !== streamId) return;
        if (type === 2) {
          const now = performance.now();
          if (lastData) maxGap = Math.max(maxGap, now - lastData);
          lastData = now;
          let payload = new Uint8Array(e.data, 5);
          if (!headerDone) {
            const merged = new Uint8Array(headerBuf.length + payload.length);
            merged.set(headerBuf);
            merged.set(payload, headerBuf.length);
            const end = findHeaderEnd(merged);
            if (end === -1) {
              if (merged.length > 16384) endChunk(false);
              else headerBuf = merged;
              return;
            }
            headerDone = true;
            payload = merged.subarray(end + 4);
          }
          body += payload.length;
          totalBody += payload.length;
          if (body >= SPEED_CHUNK) endChunk(true);
        } else if (type === 4) {
          endChunk(body >= SPEED_CHUNK);
        }
      };
      ws.onerror = ws.onclose = () => finish(summary());
    });
  }

  const speedScore = (entry, result) => {
    if (!result || !result.bps) return 0;
    const fullness = result.completed / SPEED_CHUNKS;
    return result.bps * fullness * fullness * reliability(entry) / (1 + result.maxGap / 2000);
  };

  function acceptBackup(entry, ping, bps) {
    window.WlspPing = ping;
    window.WlspIsBackup = true;
    window.WlspSpeed = bps;
    writeStore(BACKUP_KEY, JSON.stringify({ entry, ts: Date.now(), bps: bps || 0 }));
    clearBad(entry);
    writeLast(entry);
    return wlspUrl(entry);
  }

  async function pickBackup(candidates) {
    const unique = [...new Set(candidates)];
    const ordered = [...unique.filter(entry => !isBad(entry)), ...unique.filter(entry => isBad(entry))];
    const stored = readJson(BACKUP_KEY);
    if (stored && stored.entry && Date.now() - stored.ts < BACKUP_TTL && !isBad(stored.entry)) {
      const ping = await testWlspDomain(stored.entry);
      if (ping !== null) return acceptBackup(stored.entry, ping, stored.bps);
      recordOutcome(stored.entry, false);
      markBad(stored.entry);
    }
    let tried = 0;
    for (let i = 0; i < ordered.length && tried < BACKUP_TRY_LIMIT; i += PROBE_WAVE) {
      const wave = ordered.slice(i, i + PROBE_WAVE);
      const pings = await Promise.all(wave.map(entry => testWlspDomain(entry)));
      const alive = [];
      wave.forEach((entry, j) => {
        if (pings[j] === null) {
          recordOutcome(entry, false);
          markBad(entry);
        } else alive.push({ entry, ping: pings[j] });
      });
      alive.sort((a, b) => a.ping - b.ping);
      let best = null;
      for (const row of alive.slice(0, SPEED_CANDIDATES)) {
        tried++;
        const result = await speedTestWisp(row.entry);
        const score = speedScore(row.entry, result);
        recordOutcome(row.entry, score > 0);
        if (score <= 0) {
          markBad(row.entry);
          continue;
        }
        if (!best || score > best.score) best = { ...row, score, bps: result.bps };
        if (result.bps >= SPEED_GOOD && result.completed === SPEED_CHUNKS) break;
      }
      if (best) return acceptBackup(best.entry, best.ping, best.bps);
    }
    return null;
  }

  function acceptPrimary(entry, ping) {
    writeStore(PRIMARY_KEY, entry);
    clearBad(entry);
    writeLast(entry);
    window.WlspPing = ping;
    window.WlspIsBackup = isBackupServer(entry);
    return wlspUrl(entry);
  }

  function acceptLast(url, ping) {
    const key = normKey(url);
    const primary = K.WISP_SERVERS.some(entry => !isBackupServer(entry) && normKey(entry) === key);
    const stored = readJson(BACKUP_KEY);
    window.WlspPing = ping;
    window.WlspIsBackup = !primary;
    if (!primary && stored && normKey(stored.entry) === key) window.WlspSpeed = stored.bps;
    clearBad(url);
    writeLast(url);
    return url;
  }


  const mergeServers = synced => {
    const merged = [...new Set([...synced, ...K.WISP_BASE])];
    K.WISP_SERVERS = merged;
    window.serverList = merged;
    return merged;
  };

  const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });

  let syncPromise = null;

  K.syncWispServers = () => {
    if (syncPromise) return syncPromise;
    syncPromise = (async () => {
      const cached = readJson(SYNC_KEY);
      const cachedList = cached && Array.isArray(cached.list) ? cached.list.filter(u => HOST_RE.test(u) || WSS_RE.test(u)) : [];
      if (cachedList.length) mergeServers(cachedList);
      if (cachedList.length && Date.now() - (cached.ts || 0) < SYNC_TTL) return K.WISP_SERVERS;
      const failed = readJson(SYNC_KEY + 'F');
      if (failed && Date.now() - (failed.ts || 0) < 600000) return K.WISP_SERVERS;
      for (const url of STORAGE_SOURCES) {
        try {
          const res = await withTimeout(fetch(url, { cache: 'no-store' }), SYNC_TIMEOUT);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const list = parseServerList(await withTimeout(res.text(), SYNC_TIMEOUT));
          if (!list.length) throw new Error('no servers in loader.js');
          writeStore(SYNC_KEY, JSON.stringify({ ts: Date.now(), list }));
          console.log('[wisp] synced', list.length, 'servers from TongSherbet/storage');
          return mergeServers(list);
        } catch (err) {
          console.warn('[wisp] storage sync failed:', url, err && err.message ? err.message : err);
        }
      }
      writeStore(SYNC_KEY + 'F', JSON.stringify({ ts: Date.now() }));
      return K.WISP_SERVERS;
    })();
    return syncPromise;
  };

  async function getWlsp() {
    try { await Promise.race([K.syncWispServers(), new Promise(r => setTimeout(r, 1500))]); } catch {}
    const list = K.WISP_SERVERS;
    const last = readJson(LAST_KEY);
    if (last && typeof last.url === 'string' && Date.now() - (last.ts || 0) < LAST_TTL && !isBad(last.url)) {
      const ping = await testWlspDomain(last.url);
      if (ping !== null) return acceptLast(last.url, ping);
      markBad(last.url);
    }
    const primaries = list.filter(entry => !isBackupServer(entry));
    const storedPrimary = readStore(PRIMARY_KEY);
    const ordered = [...primaries.filter(entry => !isBad(entry)), ...primaries.filter(entry => isBad(entry))];
    if (storedPrimary && primaries.includes(storedPrimary) && !isBad(storedPrimary)) ordered.unshift(storedPrimary);
    const queue = [...new Set(ordered)];
    for (let i = 0; i < queue.length; i += PROBE_WAVE) {
      const wave = queue.slice(i, i + PROBE_WAVE);
      const pings = await Promise.all(wave.map(entry => testWlspDomain(entry)));
      const hit = pings.findIndex(ping => ping !== null);
      wave.forEach((entry, j) => { if (j !== hit && pings[j] === null) markBad(entry); });
      if (hit !== -1) return acceptPrimary(wave[hit], pings[hit]);
    }
    let extra = [];
    try { extra = (await K.fetchWisps()) || []; } catch {}
    extra = extra.filter(u => !list.includes(u));
    for (let i = extra.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [extra[i], extra[j]] = [extra[j], extra[i]];
    }
    const candidates = [...K.KORONA_WISPS.filter(u => !list.includes(u)), ...list.filter(isBackupServer), K.WISP_FALLBACK, ...extra.slice(0, EXTRA_LIMIT)];
    const picked = await pickBackup(candidates);
    if (picked) return picked;
    window.WlspPing = undefined;
    window.WlspSpeed = undefined;
    window.WlspIsBackup = isBackupServer(K.WISP_FALLBACK);
    return wlspUrl(K.WISP_FALLBACK);
  }

  K.resolveWlsp = () => {
    window.kWispP = getWlsp()
      .catch(() => wlspUrl(K.WISP_FALLBACK))
      .then(url => {
        window.wlspServer = url;
        console.log('[wisp] wlspServer:', url, 'ping:', window.WlspPing, 'backup:', window.WlspIsBackup);
        return url;
      });
    return window.kWispP;
  };

  K.revalidateWisp = () => {
    window.wlspServer = undefined;
    syncPromise = null;
    return K.resolveWlsp();
  };

  const originOf = entry => {
    try {
      return `https://${new URL(wlspUrl(entry)).host}`;
    } catch {
      return null;
    }
  };

  K.movieHosts = async () => {
    try { await Promise.race([K.syncWispServers(), new Promise(r => setTimeout(r, 2000))]); } catch {}
    if (window.kWispP) {
      try { await Promise.race([window.kWispP.catch(() => {}), new Promise(r => setTimeout(r, 4000))]); } catch {}
    }
    const out = [];
    const add = entry => {
      if (!entry || typeof entry !== 'string') return;
      const origin = originOf(entry);
      if (origin && !out.includes(origin)) out.push(origin);
    };
    add(window.wlspServer);
    K.WISP_SERVERS.filter(entry => !isBackupServer(entry)).forEach(add);
    K.WISP_SERVERS.filter(isBackupServer).forEach(add);
    return out;
  };
  window.movieHosts = K.movieHosts;

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
    speed: speedTestWisp,
    get: getWlsp,
    url: wlspUrl,
    isBackup: isBackupServer,
    isBad,
    markBad
  };

  K.resolveWlsp();
  K.fetchWisps();
}
