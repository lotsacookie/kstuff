export const JAR_KEY = "proxy_libcurl_jar";
const MAX_JAR_BYTES = 1500000;

export function load_jar(storage) {
  try {
    let value = storage.getItem(JAR_KEY);
    return typeof value === "string" && value.length ? value : "";
  }
  catch {
    return "";
  }
}

export function create_jar_saver(storage, export_jar) {
  let last = load_jar(storage);
  return function save(force = false) {
    try {
      let jar = export_jar();
      if (typeof jar !== "string" || jar === last) return false;
      if (jar.length > MAX_JAR_BYTES) return false;
      storage.setItem(JAR_KEY, jar);
      last = jar;
      return true;
    }
    catch {
      return false;
    }
  };
}
