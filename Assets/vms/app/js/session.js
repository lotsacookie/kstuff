/**
 * Session bootstrap (formerly inline in the root index.html).
 * Anonymous Supabase session -> link guest IP -> set duck identity -> fresh JWT.
 * Calls onStep(stepIndex, label) so the boot screen can show real progress.
 * These keys are public/anon keys by design.
 */
const MAIN_SUPABASE_URL = "https://bmiqlqxrjabvzktauuec.supabase.co";
const MAIN_SUPABASE_ANON_KEY = "sb_publishable_WcXrPV11qbpYp5t_Un0Ppg_Wa1TJQJ1";
const LEADERBOARD_URL = "https://hqlgppguxhqeaonjzinv.supabase.co";
const LEADERBOARD_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxbGdwcGd1eGhxZWFvbmp6aW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MjYwNDQsImV4cCI6MjA0ODIwMjA0NH0.4LuWk4qxp0NRZ5_erEIJq5BHq5qZiSE4zTUFS1ioZw8";
const STORAGE_KEY = "sb_app_refresh_token";

export const STEPS = [
  "Checking your connection",
  "Starting a session",
  "Linking your profile",
  "Securing the stream",
];

async function getUserIP() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch("https://api.ipify.org?format=json", { signal: ctrl.signal });
    clearTimeout(t);
    return (await r.json()).ip || "";
  } catch (err) {
    console.warn("Could not detect public IP:", err);
    return "";
  }
}

async function rpc(baseUrl, apiKey, name, payload, accessToken) {
  const r = await fetch(`${baseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: apiKey, Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    console.error(`RPC ${name} failed:`, await r.json().catch(() => ({})));
    return null;
  }
  return r.json().catch(() => ({}));
}

async function refresh(refreshToken) {
  const r = await fetch(`${MAIN_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: MAIN_SUPABASE_ANON_KEY },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const data = await r.json();
  return r.ok && data.access_token ? data : null;
}

async function getInitialSession() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const d = await refresh(saved);
      if (d) return { accessToken: d.access_token, refreshToken: d.refresh_token, userId: d.user?.id };
    } catch { console.warn("Refresh failed, creating new anonymous session..."); }
  }
  const r = await fetch(`${MAIN_SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: MAIN_SUPABASE_ANON_KEY },
    body: "{}",
  });
  const data = await r.json();
  if (!r.ok || !data.user) throw new Error("Failed to create session");
  return { accessToken: data.access_token, refreshToken: data.refresh_token, userId: data.user.id };
}

async function getIdentity(userId, accessToken) {
  const data = await rpc(LEADERBOARD_URL, LEADERBOARD_ANON_KEY, "get_leaderboard_data", { target_user_id: userId }, accessToken);
  const p = Array.isArray(data) ? data[0] : data;
  return { userId: p?.user_id || userId, username: p?.username || "Guest" };
}

/** @returns {Promise<string>} access token for the game backend */
export async function startSession(onStep = () => {}) {
  onStep(0);
  const ip = await getUserIP();
  onStep(1);
  const { accessToken, refreshToken, userId } = await getInitialSession();
  onStep(2);
  const identity = await getIdentity(userId, accessToken);
  if (ip) await rpc(MAIN_SUPABASE_URL, MAIN_SUPABASE_ANON_KEY, "link_guest_ip", { p_ip: ip }, accessToken);
  await rpc(MAIN_SUPABASE_URL, MAIN_SUPABASE_ANON_KEY, "set_duck_identity",
    { p_duck_user_id: identity.userId, p_duck_username: identity.username }, accessToken);
  onStep(3);
  const d = await refresh(refreshToken);
  if (!d) throw new Error("Failed to refresh session after linking identity");
  if (d.refresh_token) localStorage.setItem(STORAGE_KEY, d.refresh_token);
  onStep(4);
  return d.access_token;
}
