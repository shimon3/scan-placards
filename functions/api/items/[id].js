import { cleanItem, COLS, json } from "../_item.js";

// Modifier une fiche entière
export async function onRequestPut({ request, env, params }) {
  let body; try { body = await request.json(); } catch { return json({ error: "JSON invalide" }, 400); }
  const { item, error } = cleanItem(body);
  if (error) return json({ error }, 400);
  const r = await env.DB.prepare(`UPDATE items SET ${COLS.map(c => c + "=?").join(",")}, ts=? WHERE id=?`)
    .bind(...COLS.map(c => item[c]), Date.now(), params.id).run();
  if (!r.meta.changes) return json({ error: "Fiche introuvable" }, 404);
  return json({ item: { id: params.id, ...item } });
}

// Changer seulement la quantité (+1 / -1)
export async function onRequestPatch({ request, env, params }) {
  let body; try { body = await request.json(); } catch { return json({ error: "JSON invalide" }, 400); }
  let r;
  if (Number.isInteger(body.delta)) {
    r = await env.DB.prepare("UPDATE items SET qte = MAX(0, qte + ?), ts=? WHERE id=?").bind(body.delta, Date.now(), params.id).run();
  } else if (Number.isInteger(body.qte)) {
    r = await env.DB.prepare("UPDATE items SET qte = ?, ts=? WHERE id=?").bind(Math.max(0, body.qte), Date.now(), params.id).run();
  } else return json({ error: "delta ou qte attendu" }, 400);
  if (!r.meta.changes) return json({ error: "Fiche introuvable" }, 404);
  const row = await env.DB.prepare("SELECT qte FROM items WHERE id=?").bind(params.id).first();
  return json({ qte: row?.qte ?? 0 });
}

export async function onRequestDelete({ env, params }) {
  await env.DB.prepare("DELETE FROM items WHERE id=?").bind(params.id).run();
  return json({ ok: true });
}
