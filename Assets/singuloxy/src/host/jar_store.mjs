// Persists the libcurl cookie jar (Netscape format text) across page loads.
const KEY = "sandstone:cookie_jar";

export function load_jar(storage) {
  try {
    let stored = storage.getItem(KEY);
    return stored && stored.includes("\t") ? stored : null;
  }
  catch {
    return null;
  }
}

export function create_jar_saver(storage, get_jar) {
  let last = null;
  return () => {
    try {
      let jar = get_jar();
      if (!jar || jar === last) return false;
      storage.setItem(KEY, jar);
      last = jar;
      return true;
    }
    catch {
      return false;
    }
  };
}
