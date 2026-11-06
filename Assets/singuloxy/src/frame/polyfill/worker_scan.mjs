export function scan_import_scripts(text, base) {
  let urls = [];
  let call = /importScripts\s*\(([^)]*)\)/g;
  let call_match;
  while ((call_match = call.exec(text)) !== null) {
    let literal = /(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g;
    let item;
    while ((item = literal.exec(call_match[1])) !== null) {
      if (item[1] === "`" && item[2].includes("${")) continue;
      try {
        urls.push(new URL(item[2], base).href);
      }
      catch {}
    }
  }
  return urls;
}
