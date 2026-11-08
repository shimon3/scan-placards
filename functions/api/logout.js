export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json", "Set-Cookie": "inv_auth=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax" },
  });
}
