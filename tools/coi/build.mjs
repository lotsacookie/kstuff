// Generates Assets/coi.html from index.html (the page the Sandbox / CrossOrigin isolate frame loads).
// coi.html is index.html plus two guards, so it never drifts from the real page:
//  1. it only runs when the parent proxied it in (window.__COI, set by Assets/pages/js/coi-shim.js);
//     opened directly it sends you to the normal site.
//  2. the bootstrap takes the cached singularity bundle from the parent instead of IndexedDB,
//     which an opaque-origin sandboxed frame cannot use.
import { readFile, writeFile } from 'node:fs/promises';

let html = await readFile('index.html', 'utf8');

function swap(from, to, label) {
  if (!from.test ? !html.includes(from) : !from.test(html)) throw new Error('coi build: could not find ' + label + ' in index.html');
  html = html.replace(from, () => to);
}

// 1. guard first thing in <head> (not <header>)
const headRe = /<head(\s[^>]*)?>/i;
if (!headRe.test(html)) throw new Error('coi build: could not find <head> in index.html');
html = html.replace(headRe, m => m +
  '\n    <script id="coi-guard">if(!window.__COI){try{location.replace(new URL("../",location.href).href)}catch(e){location.replace("/")}}</script>');

// 2. bundle cache comes from the parent
const idbRe = /const idb=\(\)=>[\s\S]*?const dbSet=async v=>\{[^\n]*\};\n/;
swap(idbRe,
  "const dbGet=async()=>{try{const r=await window.__coiCall('bundle-get');return r&&r.code?r:null}catch{return null}};\nconst dbSet=async()=>{};\n",
  'bundle cache helpers');

await writeFile('Assets/coi.html', html);
console.log('wrote Assets/coi.html (' + html.length + ' bytes)');
