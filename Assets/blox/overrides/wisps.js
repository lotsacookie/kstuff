(() => {
  const explicit = new URLSearchParams(location.search).get('wisp');
  const configured = window.proxyTransport;
  const fallback = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/wisp/`;
  const value = explicit || (configured ? configured.getWisp() : fallback);
  const url = new URL(value);
  if (!/^wss?:$/.test(url.protocol)) throw new Error('The WebBlox proxy must use ws:// or wss://.');
  url.hash = '';
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  window.COBALT_WISP_URLS = [url.href];
})();
