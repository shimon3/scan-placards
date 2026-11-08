import { token } from "./_middleware.js";

export async function onRequestPost({ request, env }) {
  if (!env.APP_PASSWORD) return json({ error: "config", message: "La variable APP_PASSWORD n'est pas définie dans Cloudflare." }, 500);
  let body = {};
  try { body = await request.json(); } catch {}
  if (typeof body.password !== "string" || body.password !== env.APP_PASSWORD) {
    await new Promise(r => setTimeout(r, 600)); // freine les essais en rafale
    return json({ error: "bad_password" }, 401);
  }
  const t = await token(env.APP_PASSWORD);
  return json({ ok: true }, 200, {
    "Set-Cookie": `inv_auth=${t}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`,
  });
}
function json(o, status = 200, extra = {}) {
  return new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", ...extra } });
}
