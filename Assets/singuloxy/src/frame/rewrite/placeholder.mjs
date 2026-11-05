const URL_FN = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s'"]*))\s*\)/gi;
const KEEP = /^(?:data:|blob:|about:|#)/i;

export function strip_urls(css) {
  return String(css).replace(URL_FN, (match, a, b, c) => {
    let value = (a ?? b ?? c ?? "").trim();
    return KEEP.test(value) ? match : 'url("data:,")';
  });
}
