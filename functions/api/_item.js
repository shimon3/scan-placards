// Nettoie et valide une fiche reçue du navigateur.
const STR = { nom: 200, cat: 60, placard: 120, etat: 30, marque: 80, modele: 120, taille: 40, serie: 120, code: 200, note: 1000 };
export function cleanItem(b) {
  const o = {};
  for (const [k, max] of Object.entries(STR)) o[k] = String(b?.[k] ?? "").trim().slice(0, max);
  o.qte = Math.max(0, Math.min(100000, parseInt(b?.qte, 10) || 0));
  const p = String(b?.photo ?? "");
  o.photo = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p) && p.length <= 80000 ? p : "";
  if (!o.nom) return { error: "Le nom est obligatoire." };
  return { item: o };
}
export const COLS = ["nom", "cat", "placard", "qte", "etat", "marque", "modele", "taille", "serie", "code", "note", "photo"];
export function json(o, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
