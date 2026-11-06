const SHA_RE = /^[0-9a-f]{40}$/i;
const TTL = 300000;
const FAIL_TTL = 600000;
const mem = {};
const pending = {};

const read = (k) => { try { return JSON.parse(localStorage.getItem("vms.pin." + k)); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem("vms.pin." + k, JSON.stringify(v)); } catch {} };

export async function pinSha(repo, ref = "main", force = false) {
  if (SHA_RE.test(ref)) return ref;
  const key = repo + "@" + ref;
  const c = mem[key] || (mem[key] = read(key) || { sha: "", at: 0, failAt: 0, until: 0 });
  const now = Date.now();
  if (c.until > now) return c.sha;
  if (!force && c.sha && now - c.at < TTL) return c.sha;
  if (!force && c.failAt && now - c.failAt < FAIL_TTL) return c.sha;
  if (pending[key]) return pending[key];
  pending[key] = (async () => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    try {
      const r = await fetch(`https://api.github.com/repos/${repo}/commits/${encodeURIComponent(ref)}`, { cache: "no-store", signal: ctrl.signal });
      if (r.ok) {
        const sha = (await r.json())?.sha;
        if (typeof sha === "string" && SHA_RE.test(sha)) {
          Object.assign(c, { sha, at: Date.now(), failAt: 0, until: 0 });
          write(key, c);
          return sha;
        }
      } else if (r.status === 403 || r.status === 429) {
        const reset = Number(r.headers.get("x-ratelimit-reset")) * 1000;
        c.until = reset > Date.now() ? reset : Date.now() + 600000;
      }
    } catch {} finally { clearTimeout(t); }
    c.failAt = Date.now();
    write(key, c);
    return c.sha;
  })();
  try { return await pending[key]; } finally { delete pending[key]; }
}

export const jsdBases = async (repo, ref = "main") => {
  const sha = await pinSha(repo, ref);
  const hosts = ["cdn", "fastly", "gcore"];
  const out = [];
  if (sha) for (const h of hosts) out.push(`https://${h}.jsdelivr.net/gh/${repo}@${sha}/`);
  for (const h of hosts) out.push(`https://${h}.jsdelivr.net/gh/${repo}@${ref}/`);
  return out;
};
