import * as THREE from 'three';

const BPP = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 4, 7: 2, 13: 2, 14: 4 };
const BLOCK = { 10: 8, 12: 16 };
const FMT_SIZE = [4, 2, 1, 1, 2, 2, 1, 1, 2, 2, 4, 4];
const OLD_FMT = [0, 1, 2, 6, 10];

export function readGameObject(file, o) {
  const r = file.reader(o);
  const n = r.i32();
  if (n < 0 || n > 100000) throw new Error('bad component count');
  const comps = [];
  for (let i = 0; i < n; i++) {
    if (!file.atLeast(5, 5)) r.i32();
    comps.push(file.ptr(r));
  }
  r.u32();
  const name = r.astr();
  r.u16();
  const active = r.u8() !== 0;
  return { name, active, comps };
}

export function readTransform(file, o) {
  const r = file.reader(o);
  const go = file.ptr(r);
  const rot = [r.f32(), r.f32(), r.f32(), r.f32()];
  const pos = [r.f32(), r.f32(), r.f32()];
  const scl = [r.f32(), r.f32(), r.f32()];
  const n = r.i32();
  if (n < 0 || n > 1000000) throw new Error('bad child count');
  r.pos += n * (file.version >= 14 ? 12 : 8);
  const father = file.ptr(r);
  return { go, rot, pos, scl, father };
}

function half(h) {
  const s = h & 0x8000 ? -1 : 1;
  const e = (h >> 10) & 31;
  const f = h & 1023;
  if (e === 0) return s * f * 5.960464477539063e-8;
  if (e === 31) return f ? NaN : s * Infinity;
  return s * Math.pow(2, e - 15) * (1 + f / 1024);
}

export function readTexture(project, file, o) {
  const r = file.reader(o);
  const name = r.astr();
  if (file.atLeast(2017, 3)) {
    r.i32();
    r.u8();
    if (file.atLeast(2020, 2)) r.u8();
    r.align(4);
  }
  const w = r.i32();
  const h = r.i32();
  r.i32();
  if (file.atLeast(2020, 1)) r.i32();
  const format = r.i32();
  let mips = 1;
  if (file.atLeast(5, 2)) mips = r.i32();
  else r.u8();
  if (file.atLeast(2, 6)) r.u8();
  if (file.atLeast(2020, 1)) r.u8();
  if (file.atLeast(2019, 3)) r.u8();
  if (file.atLeast(3, 0) && !file.atLeast(5, 5)) r.u8();
  if (file.atLeast(2018, 2)) r.u8();
  r.align(4);
  if (file.atLeast(2018, 2)) r.i32();
  r.i32();
  r.i32();
  r.i32();
  r.i32();
  r.f32();
  let wrapU;
  let wrapV;
  if (file.atLeast(2017, 1)) {
    wrapU = r.i32();
    wrapV = r.i32();
    r.i32();
  } else {
    wrapU = r.i32();
    wrapV = wrapU;
  }
  if (file.atLeast(3, 0)) r.i32();
  if (file.atLeast(3, 5)) r.i32();
  if (file.atLeast(2020, 2)) {
    const n = r.i32();
    r.pos += n;
    r.align(4);
  }
  const size = r.i32();
  if (w < 1 || h < 1 || w > 16384 || h > 16384 || mips < 1 || mips > 20) throw new Error('bad texture header');
  let data;
  if (size > 0) {
    data = r.bytes(size);
  } else {
    const off = file.atLeast(2020, 1) ? r.i64() : r.u32();
    const sz = r.u32();
    const path = r.astr();
    data = project.stream(path, off, sz);
  }
  if (!data) throw new Error('texture data not found');
  return { name, w, h, format, mips, data, wrapU, wrapV };
}

function levelSize(fmt, w, h) {
  if (BLOCK[fmt]) return Math.max(1, (w + 3) >> 2) * Math.max(1, (h + 3) >> 2) * BLOCK[fmt];
  return w * h * BPP[fmt];
}

function rgb565(c) {
  const r = (c >> 11) & 31;
  const g = (c >> 5) & 63;
  const b = c & 31;
  return [(r << 3) | (r >> 2), (g << 2) | (g >> 4), (b << 3) | (b >> 2)];
}

function decodeDXT(src, w, h, five, out) {
  const bw = (w + 3) >> 2;
  const bh = (h + 3) >> 2;
  const al = new Uint8Array(8);
  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      let p = (by * bw + bx) * (five ? 16 : 8);
      let lo = 0;
      let hi = 0;
      if (five) {
        const a0 = src[p];
        const a1 = src[p + 1];
        al[0] = a0;
        al[1] = a1;
        if (a0 > a1) {
          for (let i = 1; i < 7; i++) al[i + 1] = (((7 - i) * a0 + i * a1) / 7) | 0;
        } else {
          for (let i = 1; i < 5; i++) al[i + 1] = (((5 - i) * a0 + i * a1) / 5) | 0;
          al[6] = 0;
          al[7] = 255;
        }
        lo = src[p + 2] | (src[p + 3] << 8) | (src[p + 4] << 16);
        hi = src[p + 5] | (src[p + 6] << 8) | (src[p + 7] << 16);
        p += 8;
      }
      const c0 = src[p] | (src[p + 1] << 8);
      const c1 = src[p + 2] | (src[p + 3] << 8);
      const k0 = rgb565(c0);
      const k1 = rgb565(c1);
      const col = [k0, k1, null, null];
      const four = five || c0 > c1;
      if (four) {
        col[2] = [0, 1, 2].map((i) => ((2 * k0[i] + k1[i]) / 3) | 0);
        col[3] = [0, 1, 2].map((i) => ((k0[i] + 2 * k1[i]) / 3) | 0);
      } else {
        col[2] = [0, 1, 2].map((i) => ((k0[i] + k1[i]) / 2) | 0);
        col[3] = [0, 0, 0];
      }
      const idx = (src[p + 4] | (src[p + 5] << 8) | (src[p + 6] << 16) | (src[p + 7] << 24)) >>> 0;
      for (let py = 0; py < 4; py++) {
        const y = by * 4 + py;
        if (y >= h) break;
        for (let px = 0; px < 4; px++) {
          const x = bx * 4 + px;
          if (x >= w) continue;
          const n = py * 4 + px;
          const ci = (idx >>> (2 * n)) & 3;
          const o = (y * w + x) * 4;
          const c = col[ci];
          out[o] = c[0];
          out[o + 1] = c[1];
          out[o + 2] = c[2];
          if (five) {
            const ai = n < 8 ? (lo >> (3 * n)) & 7 : (hi >> (3 * (n - 8))) & 7;
            out[o + 3] = al[ai];
          } else {
            out[o + 3] = !four && ci === 3 ? 0 : 255;
          }
        }
      }
    }
  }
}

export function decodeTexture(t, maxDim = 2048) {
  const fmt = t.format;
  if (!BPP[fmt] && !BLOCK[fmt]) return null;
  let w = t.w;
  let h = t.h;
  let off = 0;
  let level = 0;
  while (Math.max(w, h) > maxDim && level < t.mips - 1) {
    off += levelSize(fmt, w, h);
    w = Math.max(1, w >> 1);
    h = Math.max(1, h >> 1);
    level++;
  }
  const need = levelSize(fmt, w, h);
  if (off + need > t.data.length) return null;
  const src = t.data.subarray(off, off + need);
  const out = new Uint8Array(w * h * 4);
  const n = w * h;
  if (fmt === 10) decodeDXT(src, w, h, false, out);
  else if (fmt === 12) decodeDXT(src, w, h, true, out);
  else if (fmt === 1) {
    for (let i = 0; i < n; i++) {
      out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = 255;
      out[i * 4 + 3] = src[i];
    }
  } else if (fmt === 3) {
    for (let i = 0; i < n; i++) {
      out[i * 4] = src[i * 3];
      out[i * 4 + 1] = src[i * 3 + 1];
      out[i * 4 + 2] = src[i * 3 + 2];
      out[i * 4 + 3] = 255;
    }
  } else if (fmt === 4) out.set(src);
  else if (fmt === 5) {
    for (let i = 0; i < n; i++) {
      out[i * 4] = src[i * 4 + 1];
      out[i * 4 + 1] = src[i * 4 + 2];
      out[i * 4 + 2] = src[i * 4 + 3];
      out[i * 4 + 3] = src[i * 4];
    }
  } else if (fmt === 14) {
    for (let i = 0; i < n; i++) {
      out[i * 4] = src[i * 4 + 2];
      out[i * 4 + 1] = src[i * 4 + 1];
      out[i * 4 + 2] = src[i * 4];
      out[i * 4 + 3] = src[i * 4 + 3];
    }
  } else if (fmt === 7) {
    for (let i = 0; i < n; i++) {
      const c = rgb565(src[i * 2] | (src[i * 2 + 1] << 8));
      out[i * 4] = c[0];
      out[i * 4 + 1] = c[1];
      out[i * 4 + 2] = c[2];
      out[i * 4 + 3] = 255;
    }
  } else if (fmt === 2 || fmt === 13) {
    for (let i = 0; i < n; i++) {
      const v = src[i * 2] | (src[i * 2 + 1] << 8);
      const a = ((v >> 12) & 15) * 17;
      const b0 = ((v >> 8) & 15) * 17;
      const b1 = ((v >> 4) & 15) * 17;
      const b2 = (v & 15) * 17;
      if (fmt === 2) {
        out[i * 4] = b0;
        out[i * 4 + 1] = b1;
        out[i * 4 + 2] = b2;
        out[i * 4 + 3] = a;
      } else {
        out[i * 4] = a;
        out[i * 4 + 1] = b0;
        out[i * 4 + 2] = b1;
        out[i * 4 + 3] = b2;
      }
    }
  } else return null;
  return { w, h, rgba: out };
}

const WRAP = [THREE.RepeatWrapping, THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping, THREE.ClampToEdgeWrapping];

export function getTexture(project, res) {
  if (!res) return null;
  const key = 't' + res.file.id + ':' + res.obj.pathID;
  if (project.assets.has(key)) return project.assets.get(key);
  let tex = null;
  try {
    const t = readTexture(project, res.file, res.obj);
    const d = decodeTexture(t);
    if (d) {
      tex = new THREE.DataTexture(d.rgba, d.w, d.h, THREE.RGBAFormat, THREE.UnsignedByteType);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 4;
      tex.wrapS = WRAP[t.wrapU] ?? THREE.RepeatWrapping;
      tex.wrapT = WRAP[t.wrapV] ?? THREE.RepeatWrapping;
      tex.needsUpdate = true;
      tex.name = t.name;
    } else {
      project.messages.push('texture format ' + t.format + ' not supported (' + t.name + ')');
    }
  } catch (e) {
    project.messages.push('texture failed: ' + e.message);
  }
  project.assets.set(key, tex);
  return tex;
}

function findProp(bytes, dv, name, le) {
  const n = name.length;
  const padded = (n + 3) & ~3;
  for (let i = 0; i + 4 + padded <= bytes.length; i += 4) {
    if (dv.getInt32(i, le) !== n) continue;
    let ok = true;
    for (let k = 0; k < n; k++) {
      if (bytes[i + 4 + k] !== name.charCodeAt(k)) {
        ok = false;
        break;
      }
    }
    if (ok) return i + 4 + padded;
  }
  return -1;
}

const TEX_PROPS = ['_MainTex', '_BaseMap', '_BaseColorMap', '_AlbedoMap', '_Diffuse'];
const COLOR_PROPS = ['_Color', '_BaseColor'];

export function getMaterial(project, res, fallback) {
  if (!res) return fallback;
  const key = 'm' + res.file.id + ':' + res.obj.pathID;
  if (project.assets.has(key)) return project.assets.get(key);
  const file = res.file;
  const o = res.obj;
  const bytes = file.buf.subarray(o.start, o.start + o.size);
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const le = file.little;
  const params = { color: 0xffffff };
  try {
    for (const p of TEX_PROPS) {
      const at = findProp(bytes, dv, p, le);
      if (at < 0) continue;
      const ptr = {
        fileID: dv.getInt32(at, le),
        pathID: file.version >= 14 ? Number(dv.getBigInt64(at + 4, le)) : dv.getInt32(at + 4, le),
      };
      const tex = getTexture(project, project.resolve(file, ptr));
      if (tex) {
        const t = tex.clone();
        t.needsUpdate = true;
        const so = at + (file.version >= 14 ? 12 : 8);
        const sx = dv.getFloat32(so, le);
        const sy = dv.getFloat32(so + 4, le);
        const ox = dv.getFloat32(so + 8, le);
        const oy = dv.getFloat32(so + 12, le);
        if (Number.isFinite(sx) && Number.isFinite(sy) && sx !== 0 && sy !== 0) t.repeat.set(sx, sy);
        if (Number.isFinite(ox) && Number.isFinite(oy)) t.offset.set(ox, oy);
        params.map = t;
        break;
      }
    }
    for (const p of COLOR_PROPS) {
      const at = findProp(bytes, dv, p, le);
      if (at < 0) continue;
      const c = [0, 1, 2].map((i) => dv.getFloat32(at + i * 4, le));
      if (c.every((v) => Number.isFinite(v) && v >= 0 && v <= 4)) {
        params.color = new THREE.Color().setRGB(Math.min(c[0], 1), Math.min(c[1], 1), Math.min(c[2], 1), THREE.SRGBColorSpace);
        break;
      }
    }
  } catch (e) {
    project.messages.push('material failed: ' + e.message);
  }
  const mat = new THREE.MeshLambertMaterial(params);
  project.assets.set(key, mat);
  return mat;
}

export function findMaterials(project, file, o) {
  const psz = file.version >= 14 ? 12 : 8;
  const dv = new DataView(file.buf.buffer, file.buf.byteOffset + o.start, o.size);
  const le = file.little;
  const rd = (p) => ({
    fileID: dv.getInt32(p, le),
    pathID: file.version >= 14 ? Number(dv.getBigInt64(p + 4, le)) : dv.getInt32(p + 4, le),
  });
  const enabled = o.size > psz ? dv.getUint8(psz) !== 0 : true;
  const lim = Math.min(o.size - 4, 320);
  for (let p = psz; p < lim; p += 4) {
    const n = dv.getInt32(p, le);
    if (n < 1 || n > 32 || p + 4 + n * psz > o.size) continue;
    const mats = [];
    let ok = true;
    for (let i = 0; i < n; i++) {
      const res = project.resolve(file, rd(p + 4 + i * psz));
      if (!res || res.obj.classID !== 21) {
        ok = false;
        break;
      }
      mats.push(res);
    }
    if (ok) return { enabled, mats, end: p + 4 + n * psz };
  }
  return { enabled, mats: [], end: psz };
}

export function findPtr(project, file, o, start, classID) {
  const psz = file.version >= 14 ? 12 : 8;
  const dv = new DataView(file.buf.buffer, file.buf.byteOffset + o.start, o.size);
  const le = file.little;
  for (let p = start; p + psz <= o.size; p += 4) {
    const fileID = dv.getInt32(p, le);
    if (fileID < 0 || fileID > file.externals.length) continue;
    const pathID = file.version >= 14 ? Number(dv.getBigInt64(p + 4, le)) : dv.getInt32(p + 4, le);
    if (pathID === 0) continue;
    const res = project.resolve(file, { fileID, pathID });
    if (res && res.obj.classID === classID) return res;
  }
  return null;
}

function parseMeshLayout(file, o, opt) {
  try {
    const r = file.reader(o);
    const name = r.astr();
    const sn = r.i32();
    if (sn < 1 || sn > 4096) return null;
    const subs = [];
    for (let i = 0; i < sn; i++) {
      const firstByte = r.u32();
      const indexCount = r.u32();
      const topology = r.i32();
      const baseVertex = opt.bv ? r.u32() : 0;
      const firstVertex = r.u32();
      const vertexCount = r.u32();
      r.pos += 24;
      if (topology < 0 || topology > 5) return null;
      subs.push({ firstByte, indexCount, topology, baseVertex, firstVertex, vertexCount });
    }
    const skipArray = (stride) => {
      const n = r.i32();
      if (n < 0 || n * stride > r.left) throw new Error('bad array');
      r.pos += n * stride;
    };
    if (opt.sh === 4) {
      skipArray(40);
      const sc = r.i32();
      if (sc < 0 || sc * 12 > r.left) return null;
      r.pos += sc * 12;
      const cc = r.i32();
      if (cc < 0 || cc > r.left) return null;
      for (let i = 0; i < cc; i++) {
        r.astr();
        r.pos += 12;
      }
      skipArray(4);
    } else if (r.i32() !== 0 || r.i32() !== 0) {
      return null;
    }
    skipArray(64);
    skipArray(4);
    r.u32();
    if (opt.bones >= 1) skipArray(24);
    if (opt.bones === 2) skipArray(4);
    const compression = r.u8();
    r.pos += 3;
    r.align(4);
    if (compression !== 0) return null;
    r.i32();
    const ilen = r.i32();
    if (ilen < 0 || ilen > r.left) return null;
    const ibuf = r.bytes(ilen);
    r.align(4);
    if (opt.cc) r.u32();
    const vc = r.u32();
    if (vc < 1 || vc > 8000000) return null;
    const chN = r.i32();
    if (chN < 1 || chN > 32) return null;
    const ch = [];
    for (let i = 0; i < chN; i++) {
      ch.push({ stream: r.u8(), offset: r.u8(), format: r.u8(), dim: r.u8() & 15 });
    }
    const dlen = r.i32();
    if (dlen < 0 || dlen > r.left) return null;
    const vbuf = r.bytes(dlen);
    let end2 = 0;
    let end4 = 0;
    for (const s of subs) {
      end2 = Math.max(end2, s.firstByte + s.indexCount * 2);
      end4 = Math.max(end4, s.firstByte + s.indexCount * 4);
      if (s.firstVertex + s.vertexCount > vc) return null;
    }
    let isz;
    if (ilen >= end2 && ilen - end2 <= 3) isz = 2;
    else if (ilen >= end4 && ilen - end4 <= 3) isz = 4;
    else return null;
    const newFmt = file.atLeast(2019, 1);
    const stride = [0, 0, 0, 0];
    for (const c of ch) {
      if (c.dim === 0) continue;
      if (c.stream > 3 || c.dim > 4) return null;
      const f = newFmt ? c.format : OLD_FMT[c.format];
      if (f === undefined || f >= FMT_SIZE.length) return null;
      stride[c.stream] = Math.max(stride[c.stream], c.offset + c.dim * FMT_SIZE[f]);
    }
    if (ch[0].dim < 3) return null;
    const start = [0, 0, 0, 0];
    let run = 0;
    for (let s = 0; s < 4; s++) {
      start[s] = run;
      run += vc * stride[s];
      if (stride[s] > 0 && run > dlen) return null;
      run = (run + 15) & ~15;
    }
    return { name, subs, isz, ibuf, vc, ch, vbuf, stride, start, newFmt };
  } catch {
    return null;
  }
}

export function readMesh(file, o) {
  const bvOrder = file.atLeast(2017, 3) ? [true, false] : [false, true];
  const shOrder = file.atLeast(2017, 1) ? [4, 2] : [2, 4];
  const ccOrder = file.atLeast(2018, 1) ? [false, true] : [true, false];
  for (const bv of bvOrder) {
    for (const sh of shOrder) {
      for (const bones of [2, 1, 0]) {
        for (const cc of ccOrder) {
          const m = parseMeshLayout(file, o, { bv, sh, bones, cc });
          if (m) return m;
        }
      }
    }
  }
  return null;
}

function readChannel(m, c, itemSize) {
  if (!c || c.dim === 0) return null;
  const dv = new DataView(m.vbuf.buffer, m.vbuf.byteOffset, m.vbuf.byteLength);
  const f = m.newFmt ? c.format : OLD_FMT[c.format];
  const size = FMT_SIZE[f];
  const out = new Float32Array(m.vc * itemSize);
  const st = m.stride[c.stream];
  const base0 = m.start[c.stream] + c.offset;
  const n = Math.min(c.dim, itemSize);
  for (let i = 0; i < m.vc; i++) {
    const base = base0 + i * st;
    for (let k = 0; k < n; k++) {
      const p = base + k * size;
      let v;
      switch (f) {
        case 0: v = dv.getFloat32(p, true); break;
        case 1: v = half(dv.getUint16(p, true)); break;
        case 2: v = dv.getUint8(p) / 255; break;
        case 3: v = Math.max(dv.getInt8(p) / 127, -1); break;
        case 4: v = dv.getUint16(p, true) / 65535; break;
        case 5: v = Math.max(dv.getInt16(p, true) / 32767, -1); break;
        case 6: v = dv.getUint8(p); break;
        case 7: v = dv.getInt8(p); break;
        case 8: v = dv.getUint16(p, true); break;
        case 9: v = dv.getInt16(p, true); break;
        case 10: v = dv.getUint32(p, true); break;
        default: v = dv.getInt32(p, true);
      }
      out[i * itemSize + k] = v;
    }
  }
  return out;
}

export function buildGeometry(file, m) {
  const newOrder = file.atLeast(2018, 0);
  const positions = readChannel(m, m.ch[0], 3);
  const normals = readChannel(m, m.ch[1], 3);
  const uvs = readChannel(m, m.ch[newOrder ? 4 : 3], 2);
  const dv = new DataView(m.ibuf.buffer, m.ibuf.byteOffset, m.ibuf.byteLength);
  const get = (i) => (m.isz === 2 ? dv.getUint16(i * 2, true) : dv.getUint32(i * 4, true));
  const index = [];
  const groups = [];
  for (let si = 0; si < m.subs.length; si++) {
    const s = m.subs[si];
    const first = s.firstByte / m.isz;
    const startAt = index.length;
    const b = s.baseVertex;
    if (s.topology === 0) {
      for (let k = 0; k + 2 < s.indexCount; k += 3) {
        index.push(get(first + k) + b, get(first + k + 1) + b, get(first + k + 2) + b);
      }
    } else if (s.topology === 1) {
      for (let k = 0; k + 2 < s.indexCount; k++) {
        const a = get(first + k) + b;
        const c = get(first + k + 1) + b;
        const d = get(first + k + 2) + b;
        if (a === c || c === d || a === d) continue;
        if (k & 1) index.push(a, d, c);
        else index.push(a, c, d);
      }
    } else if (s.topology === 2) {
      for (let k = 0; k + 3 < s.indexCount; k += 4) {
        const a = get(first + k) + b;
        const c = get(first + k + 1) + b;
        const d = get(first + k + 2) + b;
        const e = get(first + k + 3) + b;
        index.push(a, c, d, a, d, e);
      }
    }
    groups.push({ start: startAt, count: index.length - startAt, materialIndex: si });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  if (normals) g.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  if (uvs) g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  g.setIndex(new THREE.BufferAttribute(new Uint32Array(index), 1));
  for (const gr of groups) g.addGroup(gr.start, gr.count, gr.materialIndex);
  if (!normals) g.computeVertexNormals();
  g.computeBoundingSphere();
  g.name = m.name;
  return g;
}

export function getGeometry(project, res) {
  const key = 'g' + res.file.id + ':' + res.obj.pathID;
  if (project.assets.has(key)) return project.assets.get(key);
  let geo = null;
  try {
    const m = readMesh(res.file, res.obj);
    if (m) geo = buildGeometry(res.file, m);
    else project.messages.push('mesh layout not recognised or compressed (object ' + res.obj.pathID + ')');
  } catch (e) {
    project.messages.push('mesh failed: ' + e.message);
  }
  project.assets.set(key, geo);
  return geo;
}

export function readStaticBatch(file, o, end, subCount) {
  if (end + 4 > o.size || subCount < 1) return null;
  const dv = new DataView(file.buf.buffer, file.buf.byteOffset + o.start, o.size);
  const le = file.little;
  if (file.atLeast(5, 5)) {
    const first = dv.getUint16(end, le);
    const count = dv.getUint16(end + 2, le);
    if (count < 1 || first + count > subCount) return null;
    const list = [];
    for (let i = 0; i < count; i++) list.push(first + i);
    return list;
  }
  const n = dv.getInt32(end, le);
  if (n < 1 || n > subCount || end + 4 + n * 4 > o.size) return null;
  const list = [];
  for (let i = 0; i < n; i++) {
    const v = dv.getUint32(end + 4 + i * 4, le);
    if (v >= subCount) return null;
    list.push(v);
  }
  return list;
}
