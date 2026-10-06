import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import path from 'node:path';

const esbuild = await import('esbuild').catch(() => null);
const hmt = await import('html-minifier-terser').catch(() => null);
if (!esbuild) console.warn('! esbuild not installed: JS/CSS will not be minified');

const cfg = JSON.parse(await readFile('tools/singularity/config.json', 'utf8'));
const TEXT = new Set(['html', 'css', 'js', 'mjs', 'json', 'svg', 'txt', 'xml']);
const globRe = g => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\0').replace(/\*/g, '[^/]*').replace(/\0/g, '.*') + '$');
const inc = cfg.include.map(globRe), exc = cfg.exclude.map(globRe);

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (['.git', '.github', 'node_modules', 'tools'].includes(e.name)) continue;
    const p = path.posix.join(dir, e.name);
    e.isDirectory() ? await walk(p, out) : out.push(p);
  }
  return out;
}

async function shrink(p, text) {
  const ext = p.split('.').pop().toLowerCase();
  try {
    if ((ext === 'js' || ext === 'mjs') && esbuild)
      return (await esbuild.transform(text, { minify: true, loader: 'js', legalComments: 'none' })).code;
    if (ext === 'css' && esbuild)
      return (await esbuild.transform(text, { minify: true, loader: 'css', legalComments: 'none' })).code;
    if (ext === 'json') return JSON.stringify(JSON.parse(text));
    if (ext === 'svg') return text.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim();
    if (ext === 'html' && hmt && cfg.minifyHtml)
      return await hmt.minify(text, { collapseWhitespace: true, conservativeCollapse: true, removeComments: true, minifyCSS: true, minifyJS: true });
  } catch (e) {
    console.warn(`! could not minify ${p}: ${e.message?.split('\n')[0]}`);
  }
  return text;
}

const files = {}, skipped = [];
let rawBytes = 0;
for (const p of (await walk('.')).map(f => f.replace(/^\.\//, '')).sort()) {
  if (!inc.some(r => r.test(p)) || exc.some(r => r.test(p))) continue;
  const ext = p.split('.').pop().toLowerCase();
  const buf = await readFile(p);
  if (!TEXT.has(ext)) { skipped.push(`${p} (not text)`); continue; }
  if (buf.length > cfg.maxFileKB * 1024) { skipped.push(`${p} (${Math.round(buf.length / 1024)}KB)`); continue; }
  const text = buf.toString('utf8');
  const out = await shrink(p, text);
  rawBytes += buf.length;
  files[p] = out.length < text.length ? out : text;
}

const hash = createHash('sha256')
  .update(Object.entries(files).map(([k, v]) => k + '\0' + v).join('\0'))
  .digest('hex').slice(0, 12);

const runtime = await readFile('tools/singularity/runtime.js', 'utf8');
let code = `(function(SG_HASH,SG_FILES,SG_CFG){${runtime}\n})(${JSON.stringify(hash)},${JSON.stringify(files)},${JSON.stringify({ repo: cfg.repo, live: cfg.live })});`;
if (esbuild) code = (await esbuild.transform(code, { minify: true, legalComments: 'none' })).code;
code = `/*!sg:${hash}*/` + code;

await writeFile('Assets/singularity.js', code);
const wire = { gzip: gzipSync(code, { level: 9 }).length, brotli: brotliCompressSync(code).length };
await writeFile('Assets/singularity.json', JSON.stringify({ hash, files: Object.keys(files).length, bytes: Buffer.byteLength(code), ...wire }) + '\n');

const kb = n => (n / 1024).toFixed(1) + ' KB';
console.log(`singularity ${hash}: ${Object.keys(files).length} files, source ${kb(rawBytes)} -> bundle ${kb(Buffer.byteLength(code))} (gzip ${kb(wire.gzip)}, brotli ${kb(wire.brotli)})`);
if (skipped.length) console.log('left on the network:\n  ' + skipped.join('\n  '));
