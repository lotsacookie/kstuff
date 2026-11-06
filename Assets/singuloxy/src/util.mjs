export function is_valid_url(url) {
  try {
    new URL(url);
    return true;
  }
  catch {
    return false;
  }
}

export async function run_parallel(promises) {
  let results = Array(promises.length);
  for (let [i, promise] of promises.entries()) {
    try {
      results[i] = await promise;
    }
    catch (e) {
      console.error(e);
    }
  }
  return results;
}

export function format_error(error) {
  let error_msg = error.stack;
  if (!error.stack)
    error_msg = new Error(error).stack;
  if (!error_msg.includes(error))
    error_msg = error + "\n\n" + error_msg;
  return error_msg;
}

export function data_to_array(data) {
  if (data instanceof Uint8Array) {
    return data;  
  }

  else if (typeof data === "string") {
    return new TextEncoder().encode(data);
  }

  else if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }

  else if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }

  throw new TypeError("invalid data type to be sent");
}

export function url_is_http(url) {
  let url_obj = new URL(url, "http://example.com/");
  return url_obj.protocol === "http:" || url_obj.protocol === "https:";
}

export function round_float(num, digits) {
  let multiplier = Math.pow(10, digits);
  return Math.round(num * multiplier) / multiplier;
}


const IGNORED_ERRORS = /error code 60\b|SSL peer certificate|remote key was not OK|certificate check failed|blocked by a DNS filter/i;

export function is_ignorable_error(...values) {
  for (let value of values) {
    let text;
    try {
      text = typeof value === "string" ? value : String(value?.message ?? value);
    }
    catch {
      continue;
    }
    if (IGNORED_ERRORS.test(text)) return true;
  }
  return false;
}

export function quiet_error(...args) {
  if (is_ignorable_error(...args)) return;
  console.error(...args);
}

export function quiet_warn(...args) {
  if (is_ignorable_error(...args)) return;
  console.warn(...args);
}

function has_gzip_magic(bytes) {
  return bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b && bytes[2] === 0x08;
}

export async function gunzip_bytes(bytes) {
  if (typeof DecompressionStream !== "function") return null;
  try {
    let stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  catch {
    return null;
  }
}

export async function response_text(response) {
  let bytes = new Uint8Array(await response.arrayBuffer());
  let decompressed = false;
  if (has_gzip_magic(bytes)) {
    let unzipped = await gunzip_bytes(bytes);
    if (unzipped) {
      bytes = unzipped;
      decompressed = true;
    }
  }
  return {text: new TextDecoder("utf-8").decode(bytes), decompressed: decompressed};
}

export function strip_gz_suffix(url) {
  try {
    let url_obj = new URL(url);
    if (!/\.gz$/i.test(url_obj.pathname)) return null;
    url_obj.pathname = url_obj.pathname.replace(/\.gz$/i, "");
    return url_obj.href;
  }
  catch {
    return null;
  }
}

export function yield_to_main() {
  if (globalThis.scheduler && typeof globalThis.scheduler.yield === "function") return globalThis.scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
