export function readPacked(r, isFloat) {
  const numItems = r.u32();
  let range = 0;
  let start = 0;
  if (isFloat) {
    range = r.f32();
    start = r.f32();
  }
  const n = r.i32();
  if (n < 0 || n > r.left) throw new Error('bad packed data');
  const data = r.bytes(n);
  r.align(4);
  const bitSize = r.u8();
  r.align(4);
  return { numItems, range, start, data, bitSize };
}

export function unpackInts(pv) {
  const out = new Uint32Array(pv.numItems);
  const bs = pv.bitSize;
  if (bs === 0 || pv.numItems === 0) return out;
  if (bs > 32 || Math.ceil((pv.numItems * bs) / 8) > pv.data.length) throw new Error('bad packed size');
  let bit = 0;
  let idx = 0;
  for (let i = 0; i < pv.numItems; i++) {
    let v = 0;
    let got = 0;
    while (got < bs) {
      const take = Math.min(8 - bit, bs - got);
      v |= ((pv.data[idx] >> bit) & ((1 << take) - 1)) << got;
      got += take;
      bit += take;
      if (bit === 8) {
        bit = 0;
        idx++;
      }
    }
    out[i] = v >>> 0;
  }
  return out;
}

export function unpackFloats(pv) {
  const ints = unpackInts(pv);
  const out = new Float32Array(ints.length);
  const div = Math.pow(2, pv.bitSize) - 1;
  for (let i = 0; i < ints.length; i++) out[i] = pv.bitSize === 0 ? pv.start : (ints[i] / div) * pv.range + pv.start;
  return out;
}

export function decodeNormals(nf, signs, vc) {
  const out = new Float32Array(vc * 3);
  for (let i = 0; i < vc; i++) {
    const x = nf[i * 2];
    const y = nf[i * 2 + 1];
    let z = Math.sqrt(Math.max(0, 1 - x * x - y * y));
    if (!signs[i]) z = -z;
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}
