const td = new TextDecoder('utf-8');

export class Reader {
  constructor(buf, pos = 0, little = true) {
    this.buf = buf;
    this.dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    this.pos = pos;
    this.little = little;
  }
  get left() {
    return this.buf.length - this.pos;
  }
  u8() {
    return this.dv.getUint8(this.pos++);
  }
  i16() {
    const v = this.dv.getInt16(this.pos, this.little);
    this.pos += 2;
    return v;
  }
  u16() {
    const v = this.dv.getUint16(this.pos, this.little);
    this.pos += 2;
    return v;
  }
  i32() {
    const v = this.dv.getInt32(this.pos, this.little);
    this.pos += 4;
    return v;
  }
  u32() {
    const v = this.dv.getUint32(this.pos, this.little);
    this.pos += 4;
    return v;
  }
  f32() {
    const v = this.dv.getFloat32(this.pos, this.little);
    this.pos += 4;
    return v;
  }
  i64() {
    const v = this.dv.getBigInt64(this.pos, this.little);
    this.pos += 8;
    return Number(v);
  }
  cstr() {
    let end = this.pos;
    while (end < this.buf.length && this.buf[end] !== 0) end++;
    const s = td.decode(this.buf.subarray(this.pos, end));
    this.pos = end + 1;
    return s;
  }
  astr() {
    const n = this.i32();
    if (n < 0 || n > this.left) throw new Error('bad string length');
    const s = td.decode(this.buf.subarray(this.pos, this.pos + n));
    this.pos += n;
    this.align(4);
    return s;
  }
  bytes(n) {
    if (n < 0 || n > this.left) throw new Error('bad byte count');
    const b = this.buf.subarray(this.pos, this.pos + n);
    this.pos += n;
    return b;
  }
  align(n = 4) {
    this.pos += (n - (this.pos % n)) % n;
  }
}

export function lz4(src, outSize) {
  const out = new Uint8Array(outSize);
  let s = 0;
  let d = 0;
  while (s < src.length) {
    const token = src[s++];
    let lit = token >> 4;
    if (lit === 15) {
      let b;
      do {
        b = src[s++];
        lit += b;
      } while (b === 255);
    }
    out.set(src.subarray(s, s + lit), d);
    s += lit;
    d += lit;
    if (s >= src.length) break;
    const off = src[s] | (src[s + 1] << 8);
    s += 2;
    let len = token & 15;
    if (len === 15) {
      let b;
      do {
        b = src[s++];
        len += b;
      } while (b === 255);
    }
    len += 4;
    let p = d - off;
    for (let i = 0; i < len; i++) out[d++] = out[p++];
  }
  return out;
}

function inflateBlock(src, size, mode) {
  if (mode === 0) return src;
  if (mode === 2 || mode === 3) return lz4(src, size);
  throw new Error('LZMA compressed bundles are not supported yet');
}

export function parseBundle(u8) {
  const r = new Reader(u8, 0, false);
  const sig = r.cstr();
  if (sig !== 'UnityFS') throw new Error('unsupported bundle type ' + sig);
  const version = r.u32();
  r.cstr();
  r.cstr();
  r.i64();
  const cSize = r.u32();
  const uSize = r.u32();
  const flags = r.u32();
  if (version >= 7) r.align(16);
  let infoRaw;
  if (flags & 0x80) {
    infoRaw = u8.subarray(u8.length - cSize);
  } else {
    infoRaw = u8.subarray(r.pos, r.pos + cSize);
    r.pos += cSize;
  }
  const info = inflateBlock(infoRaw, uSize, flags & 0x3f);
  const b = new Reader(info, 16, false);
  const blockCount = b.i32();
  const blocks = [];
  let total = 0;
  for (let i = 0; i < blockCount; i++) {
    const u = b.u32();
    const c = b.u32();
    const f = b.u16();
    blocks.push({ u, c, f });
    total += u;
  }
  const nodeCount = b.i32();
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    const offset = b.i64();
    const size = b.i64();
    b.u32();
    const path = b.cstr();
    nodes.push({ offset, size, path });
  }
  const data = new Uint8Array(total);
  let sp = r.pos;
  let dp = 0;
  for (const blk of blocks) {
    const chunk = inflateBlock(u8.subarray(sp, sp + blk.c), blk.u, blk.f & 0x3f);
    data.set(chunk, dp);
    dp += blk.u;
    sp += blk.c;
  }
  return nodes.map((n) => ({ path: n.path, data: data.subarray(n.offset, n.offset + n.size) }));
}

let fileSeq = 0;

export class SerializedFile {
  constructor(buf, name) {
    this.buf = buf;
    this.name = name;
    this.id = ++fileSeq;
    const r = new Reader(buf, 0, false);
    r.u32();
    r.u32();
    const version = r.u32();
    let dataOffset = r.u32();
    if (version < 9 || version > 40) throw new Error('not a serialized file');
    const big = r.u8() !== 0;
    r.pos += 3;
    if (version >= 22) {
      r.u32();
      r.i64();
      dataOffset = r.i64();
      r.pos += 8;
    }
    if (dataOffset > buf.length) throw new Error('not a serialized file');
    this.version = version;
    this.little = !big;
    r.little = this.little;
    this.unityVersion = version >= 7 ? r.cstr() : '';
    const m = this.unityVersion.match(/^(\d+)\.(\d+)\.(\d+)/);
    this.ver = m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
    this.platform = version >= 8 ? r.i32() : 0;
    const hasTree = version >= 13 ? r.u8() !== 0 : false;
    const typeCount = r.i32();
    if (typeCount < 0 || typeCount > 20000) throw new Error('not a serialized file');
    const types = [];
    for (let i = 0; i < typeCount; i++) {
      const classID = r.i32();
      if (version >= 16) r.u8();
      if (version >= 17) r.i16();
      if (version >= 13) {
        if ((version < 16 && classID < 0) || (version >= 16 && classID === 114)) r.pos += 16;
        r.pos += 16;
      }
      if (hasTree) {
        if (version < 12 && version !== 10) throw new Error('legacy type tree layout');
        const n = r.i32();
        const sb = r.i32();
        r.pos += n * (version >= 19 ? 32 : 24) + sb;
        if (version >= 21) {
          const c = r.i32();
          r.pos += c * 4;
        }
      }
      types.push(classID);
    }
    let bigId = false;
    if (version >= 7 && version < 14) bigId = r.i32() !== 0;
    const objectCount = r.i32();
    if (objectCount < 0 || objectCount > 5000000) throw new Error('not a serialized file');
    this.objects = new Map();
    for (let i = 0; i < objectCount; i++) {
      let pathID;
      if (bigId) pathID = r.i64();
      else if (version < 14) pathID = r.i32();
      else {
        r.align(4);
        pathID = r.i64();
      }
      const start = (version >= 22 ? r.i64() : r.u32()) + dataOffset;
      const size = r.u32();
      const typeID = r.i32();
      let classID;
      if (version < 16) classID = r.u16();
      else classID = types[typeID];
      if (version < 11) r.u16();
      if (version >= 11 && version < 17) r.i16();
      if (version === 15 || version === 16) r.u8();
      this.objects.set(pathID, { pathID, classID, start, size });
    }
    this.externals = [];
    try {
      if (version >= 11) {
        const sc = r.i32();
        for (let i = 0; i < sc; i++) {
          r.i32();
          if (version < 14) r.i32();
          else {
            r.align(4);
            r.i64();
          }
        }
      }
      const ec = r.i32();
      const ext = [];
      for (let i = 0; i < ec; i++) {
        if (version >= 6) r.cstr();
        if (version >= 5) r.pos += 20;
        ext.push({ pathName: r.cstr() });
      }
      this.externals = ext;
    } catch {
      this.externals = [];
    }
  }
  atLeast(major, minor = 0) {
    return this.ver[0] > major || (this.ver[0] === major && this.ver[1] >= minor);
  }
  reader(o) {
    return new Reader(this.buf, o.start, this.little);
  }
  ptr(r) {
    const fileID = r.i32();
    const pathID = this.version >= 14 ? r.i64() : r.i32();
    return { fileID, pathID };
  }
  count(classID) {
    let n = 0;
    for (const o of this.objects.values()) if (o.classID === classID) n++;
    return n;
  }
}

export class Project {
  constructor() {
    this.raw = new Map();
    this.parsed = new Map();
    this.assets = new Map();
    this.messages = [];
  }
  addRaw(name, data) {
    this.raw.set(name.toLowerCase(), data);
  }
  serialized(name) {
    const key = name.split('/').pop().toLowerCase();
    if (this.parsed.has(key)) return this.parsed.get(key);
    let file = null;
    const data = this.raw.get(key);
    if (data) {
      try {
        file = new SerializedFile(data, key);
      } catch {
        file = null;
      }
    }
    this.parsed.set(key, file);
    return file;
  }
  resolve(file, ptr) {
    if (!ptr || ptr.pathID === 0) return null;
    let target = file;
    if (ptr.fileID > 0) {
      const ext = file.externals[ptr.fileID - 1];
      if (!ext) return null;
      target = this.serialized(ext.pathName);
      if (!target) return null;
    } else if (ptr.fileID < 0) {
      return null;
    }
    const obj = target.objects.get(ptr.pathID);
    return obj ? { file: target, obj } : null;
  }
  stream(path, offset, size) {
    const d = this.raw.get(path.split('/').pop().toLowerCase());
    return d ? d.subarray(offset, offset + size) : null;
  }
}
