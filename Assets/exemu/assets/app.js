import * as THREE from 'three';
import { unzipSync } from 'fflate';
import { Project, parseBundle } from './unity.js';
import { readGameObject, readTransform, findMaterials, findPtr, getGeometry, getMaterial, readStaticBatch } from './decode.js';

const $ = (id) => document.getElementById(id);
const tick = () => new Promise((r) => setTimeout(r, 0));

const logEl = $('log');
function log(msg, cls) {
  const line = document.createElement('div');
  if (cls) line.className = cls;
  line.textContent = msg;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

function busy(text) {
  const b = $('busy');
  b.hidden = !text;
  b.textContent = text || '';
}

const view = $('view');
const renderer = new THREE.WebGLRenderer({ canvas: view, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b2230);
const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 20000);
camera.rotation.order = 'YXZ';
scene.add(new THREE.HemisphereLight(0xffffff, 0x666677, 1.7));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(0.5, 1, 0.3);
scene.add(sun);
let root = new THREE.Group();
root.scale.x = -1;
scene.add(root);

function resize() {
  const s = $('stage');
  renderer.setSize(s.clientWidth, s.clientHeight, false);
  camera.aspect = s.clientWidth / Math.max(1, s.clientHeight);
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const keys = new Set();
let yaw = 0;
let pitch = 0;
let speed = 8;
camera.position.set(0, 4, 10);

window.addEventListener('keydown', (e) => {
  const t = document.activeElement && document.activeElement.tagName;
  if (t === 'SELECT' || t === 'INPUT') return;
  keys.add(e.code);
  if (e.code === 'Space') e.preventDefault();
});
window.addEventListener('keyup', (e) => keys.delete(e.code));
window.addEventListener('blur', () => keys.clear());
view.addEventListener('click', () => {
  if (view.requestPointerLock) view.requestPointerLock();
});
function look(dx, dy) {
  yaw -= dx * 0.0022;
  pitch = Math.max(-1.55, Math.min(1.55, pitch - dy * 0.0022));
}
document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement === view) look(e.movementX, e.movementY);
  else if (e.buttons & 1 && e.target === view) look(e.movementX, e.movementY);
});
view.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    speed = Math.max(0.2, Math.min(2000, speed * (e.deltaY < 0 ? 1.2 : 1 / 1.2)));
  },
  { passive: false }
);

const clock = new THREE.Clock();
const dir = new THREE.Vector3();
const right = new THREE.Vector3();
let frames = 0;
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.1);
  const fast = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 4 : 1;
  const s = speed * fast * dt;
  dir.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
  right.set(Math.cos(yaw), 0, -Math.sin(yaw));
  if (keys.has('KeyW') || keys.has('ArrowUp')) camera.position.addScaledVector(dir, s);
  if (keys.has('KeyS') || keys.has('ArrowDown')) camera.position.addScaledVector(dir, -s);
  if (keys.has('KeyD') || keys.has('ArrowRight')) camera.position.addScaledVector(right, s);
  if (keys.has('KeyA') || keys.has('ArrowLeft')) camera.position.addScaledVector(right, -s);
  if (keys.has('KeyE') || keys.has('Space')) camera.position.y += s;
  if (keys.has('KeyQ') || keys.has('KeyC')) camera.position.y -= s;
  camera.rotation.set(pitch, yaw, 0);
  renderer.render(scene, camera);
  if (++frames % 30 === 0) updateStats();
}
loop();

let sceneInfo = { meshes: 0, skipped: 0, noMesh: 0, noNode: 0 };
function updateStats() {
  if (!$('statsBox').hidden) {
    const i = renderer.info;
    $('stats').textContent =
      sceneInfo.meshes + ' meshes (' + sceneInfo.skipped + ' skipped) · ' +
      i.render.triangles.toLocaleString() + ' triangles · ' +
      i.memory.textures + ' textures · speed ' + speed.toFixed(1);
  }
}

let project = null;
const cache = { fallback: new THREE.MeshLambertMaterial({ color: 0xb4b4b4 }) };

function disposeRoot() {
  scene.remove(root);
  if (project) {
    for (const v of project.assets.values()) {
      if (v && v.dispose) v.dispose();
    }
    project.assets.clear();
  }
  root = new THREE.Group();
  root.scale.x = -1;
  scene.add(root);
}

async function buildScene(file) {
  disposeRoot();
  sceneInfo = { meshes: 0, skipped: 0, noMesh: 0, noNode: 0 };
  project.messages.length = 0;
  project.meshWhy = null;
  busy('Building ' + file.name + '…');
  await tick();
  const gos = new Map();
  const trs = new Map();
  const renderers = new Map();
  const filters = [];
  const cameras = [];
  for (const o of file.objects.values()) {
    try {
      if (o.classID === 1) gos.set(o.pathID, readGameObject(file, o));
      else if (o.classID === 4) trs.set(o.pathID, readTransform(file, o));
      else if (o.classID === 23 || o.classID === 137) renderers.set(file.ptr(file.reader(o)).pathID, o);
      else if (o.classID === 33) {
        const r = file.reader(o);
        filters.push({ go: file.ptr(r), mesh: file.ptr(r) });
      } else if (o.classID === 20) cameras.push(file.ptr(file.reader(o)).pathID);
    } catch {
      sceneInfo.skipped++;
    }
  }
  const nodes = new Map();
  const goNode = new Map();
  for (const [id, t] of trs) {
    const n = new THREE.Object3D();
    n.position.set(t.pos[0], t.pos[1], t.pos[2]);
    n.quaternion.set(t.rot[0], t.rot[1], t.rot[2], t.rot[3]);
    n.scale.set(t.scl[0], t.scl[1], t.scl[2]);
    const g = gos.get(t.go.pathID);
    if (g) {
      n.name = g.name;
      n.visible = g.active;
    }
    goNode.set(t.go.pathID, n);
    nodes.set(id, n);
  }
  for (const [id, t] of trs) {
    const parent = nodes.get(t.father.pathID);
    (parent || root).add(nodes.get(id));
  }

  const jobs = [];
  for (const f of filters) {
    const rend = renderers.get(f.go.pathID);
    if (rend && rend.classID === 23) jobs.push({ go: f.go.pathID, mesh: project.resolve(file, f.mesh), rend });
  }
  for (const [goID, rend] of renderers) {
    if (rend.classID !== 137) continue;
    const info = findMaterials(project, file, rend);
    jobs.push({ go: goID, mesh: findPtr(project, file, rend, info.end, 43), rend });
  }
  let done = 0;
  for (const j of jobs) {
    const node = goNode.get(j.go);
    if (!node || !j.mesh) {
      if (node) {
        sceneInfo.noMesh++;
        project.messages.push('no mesh reference: ' + (node.name || 'unnamed') + ' (class ' + j.rend.classID + ')');
      } else sceneInfo.noNode++;
      sceneInfo.skipped++;
      continue;
    }
    const info = findMaterials(project, file, j.rend);
    if (!info.enabled) continue;
    const geo = getGeometry(project, j.mesh);
    if (!geo) {
      sceneInfo.skipped++;
      continue;
    }
    const mats = info.mats.map((m) => getMaterial(project, m, cache.fallback));
    if (!mats.length) mats.push(cache.fallback);
    const batch = j.rend.classID === 23 ? readStaticBatch(file, j.rend, info.end, geo.groups.length) : null;
    let useGeo = geo;
    if (batch) {
      const bkey = 'sb' + geo.uuid + ':' + batch.join(',');
      useGeo = project.assets.get(bkey);
      if (!useGeo) {
        useGeo = new THREE.BufferGeometry();
        useGeo.attributes = geo.attributes;
        useGeo.index = geo.index;
        useGeo.boundingSphere = geo.boundingSphere;
        batch.forEach((si, k) => {
          const gr = geo.groups[si];
          if (gr) useGeo.addGroup(gr.start, gr.count, k);
        });
        project.assets.set(bkey, useGeo);
      }
    }
    const groupCount = useGeo.groups.length;
    const list = [];
    for (let i = 0; i < groupCount; i++) list.push(mats[Math.min(i, mats.length - 1)]);
    const mesh = new THREE.Mesh(useGeo, list);
    if (batch) {
      let vis = true;
      for (let n = node; n && n !== root; n = n.parent) vis = vis && n.visible;
      mesh.visible = vis;
      root.add(mesh);
    } else {
      node.add(mesh);
    }
    sceneInfo.meshes++;
    if (++done % 25 === 0) {
      busy('Building ' + file.name + ' · ' + done + '/' + jobs.length);
      await tick();
    }
  }
  root.updateMatrixWorld(true);
  let placed = false;
  for (const cid of cameras) {
    const n = goNode.get(cid);
    if (!n || !n.visible) continue;
    const pos = new THREE.Vector3().setFromMatrixPosition(n.matrixWorld);
    const fwd = new THREE.Vector3(0, 0, 1).transformDirection(n.matrixWorld);
    camera.position.copy(pos);
    yaw = Math.atan2(-fwd.x, -fwd.z);
    pitch = Math.asin(Math.max(-1, Math.min(1, fwd.y)));
    placed = true;
    break;
  }
  const box = new THREE.Box3().setFromObject(root);
  let size = 20;
  if (!box.isEmpty()) {
    const sz = box.getSize(new THREE.Vector3());
    size = Math.max(1, sz.length());
    if (!placed) {
      const c = box.getCenter(new THREE.Vector3());
      camera.position.set(c.x, c.y + sz.y * 0.4, c.z + size * 0.6);
      yaw = 0;
      pitch = -0.2;
    }
  }
  speed = Math.max(1, size / 25);
  camera.far = Math.max(2000, size * 4);
  camera.updateProjectionMatrix();
  for (const m of project.messages.slice(0, 40)) log(m, 'warn');
  if (project.messages.length > 40) log('…and ' + (project.messages.length - 40) + ' more warnings', 'warn');
  log('Scene ' + file.name + ': ' + sceneInfo.meshes + ' meshes, ' + sceneInfo.skipped + ' skipped');
  if (sceneInfo.noMesh || sceneInfo.noNode) log('Skipped without a mesh reference: ' + sceneInfo.noMesh + ' · without a node: ' + sceneInfo.noNode, 'warn');
  if (project.meshWhy) for (const [k, n] of project.meshWhy) log('Meshes not read: ' + k + ' ×' + n, 'warn');
  $('statsBox').hidden = false;
  busy('');
}

function peArch(u8) {
  if (u8[0] !== 0x4d || u8[1] !== 0x5a) return null;
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const pe = dv.getUint32(0x3c, true);
  if (dv.getUint32(pe, true) !== 0x4550) return null;
  const m = dv.getUint16(pe + 4, true);
  return m === 0x8664 ? 'x64' : m === 0x14c ? 'x86' : m === 0xaa64 ? 'arm64' : '0x' + m.toString(16);
}

function wantEntry(f) {
  const n = f.name.toLowerCase();
  if (n.endsWith('/')) return false;
  if (/_data\/(globalgamemanagers(\.assets)?|level\d+|sharedassets\d+\.assets|resources\.assets|data\.unity3d|boot\.config|app\.info)(\.split\d+)?$/.test(n)) return true;
  if (/_data\/[^/]*\.(ress|resource)(\.split\d+)?$/.test(n)) return true;
  if (/_data\/streamingassets\/.*\.(bundle|unity3d)$/.test(n)) return true;
  if (n.endsWith('.exe') && !n.includes('crashhandler') && f.originalSize < 150e6) return true;
  return false;
}

function setMeta(rows) {
  const dl = $('meta');
  dl.textContent = '';
  for (const [k, v] of rows) {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    dl.append(dt, dd);
  }
  $('infoBox').hidden = false;
}

async function openZip(zipFile) {
  logEl.textContent = '';
  $('sceneBox').hidden = true;
  $('infoBox').hidden = true;
  $('statsBox').hidden = true;
  busy('Reading ' + zipFile.name + '…');
  await tick();
  let files;
  const names = [];
  try {
    const u8 = new Uint8Array(await zipFile.arrayBuffer());
    files = unzipSync(u8, {
      filter: (f) => {
        names.push(f.name);
        return wantEntry(f);
      },
    });
  } catch (e) {
    busy('');
    log('Could not read the zip: ' + e.message, 'err');
    return;
  }
  const dataEntry = names.find((n) => /_data\/(globalgamemanagers|data\.unity3d)$/i.test(n));
  if (!dataEntry) {
    busy('');
    log('No Unity _Data folder with globalgamemanagers or data.unity3d was found in this zip.', 'err');
    return;
  }
  const gameName = dataEntry.split('/').slice(-2)[0].replace(/_Data$/i, '');
  project = new Project();
  let exe = null;
  const splits = new Map();
  for (const [path, data] of Object.entries(files)) {
    const n = path.split('/').pop().toLowerCase();
    const sp = n.match(/^(.*)\.split(\d+)$/);
    if (sp) {
      if (!splits.has(sp[1])) splits.set(sp[1], []);
      splits.get(sp[1]).push([+sp[2], data]);
    } else if (n.endsWith('.exe')) {
      if (n === gameName.toLowerCase() + '.exe' || !exe) exe = data;
    } else if (!project.raw.has(n) || /_data\/[^/]+$/i.test(path)) {
      project.addRaw(n, data);
    }
  }
  for (const [n, parts] of splits) {
    parts.sort((a, b) => a[0] - b[0]);
    const total = parts.reduce((s, p) => s + p[1].length, 0);
    const out = new Uint8Array(total);
    let at = 0;
    for (const p of parts) {
      out.set(p[1], at);
      at += p[1].length;
    }
    project.addRaw(n, out);
  }
  const bundleKeys = new Set();
  if (project.raw.has('data.unity3d')) {
    try {
      for (const node of parseBundle(project.raw.get('data.unity3d'))) {
        const k = node.path.split('/').pop().toLowerCase();
        project.addRaw(k, node.data);
        bundleKeys.add(k);
      }
    } catch (e) {
      log('data.unity3d: ' + e.message, 'err');
    }
  }
  const ggm = project.serialized('globalgamemanagers');
  const backend = names.some((n) => /gameassembly\.dll$/i.test(n))
    ? 'IL2CPP'
    : names.some((n) => /managed\/assembly-csharp\.dll$/i.test(n))
      ? 'Mono'
      : 'unknown';
  const rows = [['Game', gameName]];
  if (ggm && ggm.unityVersion) rows.push(['Unity', ggm.unityVersion]);
  if (exe) rows.push(['Executable', (peArch(exe) || 'unknown') + ' Windows']);
  rows.push(['Scripting', backend]);
  setMeta(rows);

  const levels = [];
  for (const key of project.raw.keys()) {
    const isLevel = /^level\d+$/.test(key);
    const isBundleScene = bundleKeys.has(key) && !key.includes('.');
    if (!isLevel && !isBundleScene) continue;
    const f = project.serialized(key);
    if (!f) continue;
    const tr = f.count(4);
    const mf = f.count(33) + f.count(137);
    if (tr > 0 && mf > 0) levels.push({ key, file: f, meshes: mf });
  }
  levels.sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
  busy('');
  if (!levels.length) {
    log('No renderable scenes were found. Compressed (LZMA) bundles and some newer formats are not supported yet.', 'err');
    return;
  }
  const sel = $('scene');
  sel.textContent = '';
  levels.forEach((l, i) => {
    const op = document.createElement('option');
    op.value = String(i);
    op.textContent = l.key + ' · ' + l.meshes + ' meshes';
    sel.appendChild(op);
  });
  $('sceneBox').hidden = false;
  sel.onchange = () => buildScene(levels[+sel.value].file);
  log('Found ' + levels.length + ' scene(s) in ' + gameName);
  await buildScene(levels[0].file);
}

const drop = $('drop');
$('file').addEventListener('change', (e) => {
  if (e.target.files[0]) openZip(e.target.files[0]);
});
['dragenter', 'dragover'].forEach((ev) =>
  drop.addEventListener(ev, (e) => {
    e.preventDefault();
    drop.classList.add('over');
  })
);
['dragleave', 'drop'].forEach((ev) =>
  drop.addEventListener(ev, (e) => {
    e.preventDefault();
    drop.classList.remove('over');
  })
);
drop.addEventListener('drop', (e) => {
  const f = e.dataTransfer.files[0];
  if (f) openZip(f);
});
