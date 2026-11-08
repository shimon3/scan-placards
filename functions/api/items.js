import { cleanItem, COLS, json } from "./_item.js";

// Liste complète
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM items ORDER BY placard, cat, nom").all();
  return json({ items: results });
}

// Nouvelle fiche
export async function onRequestPost({ request, env }) {
  let body; try { body = await request.json(); } catch { return json({ error: "JSON invalide" }, 400); }
  const { item, error } = cleanItem(body);
  if (error) return json({ error }, 400);
  const id = crypto.randomUUID();
  const ts = Date.now();
  await env.DB.prepare(`INSERT INTO items (id, ${COLS.join(",")}, ts) VALUES (?, ${COLS.map(() => "?").join(",")}, ?)`)
    .bind(id, ...COLS.map(c => item[c]), ts).run();
  return json({ item: { id, ...item, ts } }, 201);
}
