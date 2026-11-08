// Protège toutes les routes /api/* par le mot de passe APP_PASSWORD (sauf /api/login).
export async function onRequest(ctx) {
  const { request, env } = ctx;
  const url = new URL(request.url);
  if (url.pathname === "/api/login" || url.pathname === "/api/logout") return ctx.next();
  if (!env.APP_PASSWORD) return json({ error: "config", message: "La variable APP_PASSWORD n'est pas définie dans Cloudflare." }, 500);
  if (!env.DB) return json({ error: "config", message: "La base D1 n'est pas liée (binding DB manquant)." }, 500);
  const expected = await token(env.APP_PASSWORD);
  const cookie = request.headers.get("Cookie") || "";
  const m = cookie.match(/(?:^|;\s*)inv_auth=([a-f0-9]{64})/);
  if (!m || m[1] !== expected) return json({ error: "auth" }, 401);
  return ctx.next();
}
export async function token(pw) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("inventaire-placards:" + pw));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function json(o, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}
