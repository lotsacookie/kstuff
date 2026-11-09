// Unity PackedFloatVector / PackedIntVector helpers (used by compressed meshes).
// No imports so it can be unit tested in plain node.

export function readPackedFloat(r) {
  const n = r.u32();
  const range = r.f32();
  const start = r.f32();
  const len = r.i32();
  const data = r.bytes(len);
  r.align(4);
  const bits = r.u8();
  r.align(4);
  if (bits > 32) throw new Error('bad packed bit size');
  return { n, range, start, data, bits };
}

export function readPackedInt(r) {
  const n = r.u32();
  const len = r.i32();
  const data = r.bytes(len);
  r.align(4);
  const bits = r.u8();
  r.align(4);
  if (bits > 32) throw new Error('bad packed bit size');
  return { n, data, bits };
}

function bitReader(data, bits) {
  let pos = 0;
  return () => {
    let x = 0;
    let got = 0;
    while (got < bits) {
      const off = pos & 7;
      const take = Math.min(bits - got, 8 - off);
      const byte = data[pos >> 3] || 0;
      x += ((byte >> off) & ((1 << take) - 1)) * 2 ** got;
      got += take;
      pos += take;
    }
    return x;
  };
}

export function unpackFloats(p) {
  const out = new Float32Array(p.n);
  if (!p.n) return out;
  if (!p.bits) {
    out.fill(p.start);
    return out;
  }
  const mask = 2 ** p.bits - 1;
  const k = p.range / mask;
  const next = bitReader(p.data, p.bits);
  for (let i = 0; i < p.n; i++) out[i] = next() * k + p.start;
  return out;
}

export function unpackInts(p) {
  const out = new Uint32Array(p.n);
  if (!p.n || !p.bits) return out;
  const next = bitReader(p.data, p.bits);
  for (let i = 0; i < p.n; i++) out[i] = next();
  return out;
}

// Reads a CompressedMesh (Unity 5+) and decodes what the viewer needs.
export function readCompressedMesh(r, vertexCount) {
  const verts = readPackedFloat(r);
  const uv = readPackedFloat(r);
  const normals = readPackedFloat(r);
  readPackedFloat(r); // tangents
  readPackedInt(r); // weights
  const nsigns = readPackedInt(r);
  readPackedInt(r); // tangent signs
  readPackedFloat(r); // float colors
  readPackedInt(r); // bone indices
  const tris = readPackedInt(r);
  const uvInfo = r.u32();
  return { verts, uv, normals, nsigns, tris, uvInfo, vertexCount };
}

export function decodeCompressedMesh(c) {
  if (!c.verts.n || c.verts.n % 3 !== 0) return null;
  const vc = c.verts.n / 3;
  const positions = unpackFloats(c.verts);
  let normals = null;
  if (c.normals.n >= vc * 2) {
    const nd = unpackFloats(c.normals);
    const signs = unpackInts(c.nsigns);
    normals = new Float32Array(vc * 3);
    for (let i = 0; i < vc; i++) {
      let x = nd[i * 2];
      let y = nd[i * 2 + 1];
      let z = 1 - x * x - y * y;
      if (z >= 0) z = Math.sqrt(z);
      else {
        const l = Math.hypot(x, y) || 1;
        x /= l;
        y /= l;
        z = 0;
      }
      if (signs[i] === 0) z = -z;
      normals[i * 3] = x;
      normals[i * 3 + 1] = y;
      normals[i * 3 + 2] = z;
    }
  }
  let uvs = null;
  if (c.uv.n > 0) {
    const all = unpackFloats(c.uv);
    if (c.uvInfo) {
      let off = 0;
      for (let ch = 0; ch < 8; ch++) {
        const bits = (c.uvInfo >> (ch * 4)) & 15;
        if (!(bits & 4)) continue;
        const dim = 1 + (bits & 3);
        if (!uvs && dim === 2 && off + vc * 2 <= all.length) uvs = all.slice(off, off + vc * 2);
        off += vc * dim;
      }
    } else if (all.length >= vc * 2) {
      uvs = all.slice(0, vc * 2);
    }
  }
  const indices = unpackInts(c.tris);
  if (!indices.length) return null;
  for (let i = 0; i < indices.length; i++) if (indices[i] >= vc) return null;
  return { positions, normals, uvs, indices, vc };
}
