// Envoie la photo de l'étiquette à Claude (API Anthropic) et renvoie les champs reconnus.
const CATS = ["Écran", "Télévision", "Imprimante", "Ordinateur / portable", "Clavier / souris", "Câble / adaptateur",
  "Réseau (switch, routeur)", "Téléphone / casque", "Consommable (encre, papier)", "Autre"];

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) return json({ error: "no_key", message: "Clé ANTHROPIC_API_KEY absente dans Cloudflare : la reconnaissance est désactivée." }, 501);
  let body; try { body = await request.json(); } catch { return json({ error: "JSON invalide" }, 400); }
  const image = String(body.image || "");
  if (!/^[A-Za-z0-9+/=]+$/.test(image) || image.length > 6_000_000) return json({ error: "Image invalide ou trop lourde" }, 400);
  const codes = String(body.codes || "").slice(0, 300);

  const prompt = `Tu aides à faire l'inventaire d'équipements informatiques rangés dans des placards. La photo montre un objet entier ou son étiquette signalétique (souvent au dos).
Lis attentivement TOUT le texte de l'étiquette : marque, modèle (Model, Type Number, Model Code, P/N), numéro de série (Serial Number, S/N), taille d'écran.
Pour un écran ou une télé, déduis la taille en pouces du modèle si elle n'est pas écrite (ex. Samsung S27C310 = 27 pouces, Dell P2422H = 24 pouces) et distingue écran PC et télévision.
${codes ? `Code-barres scanné : ${codes}\n` : ""}N'invente rien : laisse une chaîne vide pour ce que tu ne peux ni lire ni déduire avec certitude.
Réponds UNIQUEMENT avec un objet JSON, sans texte autour :
{"nom":"nom court en français, ex. 'Écran Samsung S27C310EAM 27\\"'","categorie":"une valeur exacte parmi ${JSON.stringify(CATS)}","marque":"","modele":"","taille":"ex. '27 pouces' ou chaîne vide","numero_serie":"","quantite":1,"note":"autres infos utiles lues (code modèle complet, alimentation, date) ou chaîne vide"}`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: env.CLAUDE_MODEL || "claude-sonnet-5-5",
      max_tokens: 800,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
        { type: "text", text: prompt },
      ] }],
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    return json({ error: "api", status: r.status, message: t.slice(0, 300) }, 502);
  }
  const data = await r.json();
  const text = (data.content || []).filter(c => c.type === "text").map(c => c.text).join("");
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return json({ error: "parse", message: "Réponse illisible" }, 502);
  let out; try { out = JSON.parse(m[0]); } catch { return json({ error: "parse", message: "JSON illisible" }, 502); }
  if (!CATS.includes(out.categorie)) out.categorie = "";
  return json(out);
}
function json(o, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}
