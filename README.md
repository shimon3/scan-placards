# Inventaire des placards

Site web pour faire l'inventaire du matériel rangé dans les placards :
on vise l'étiquette avec le téléphone, **bip**, et Claude lit la marque, le modèle,
la taille et le n° de série. La liste est la même sur le téléphone et sur le PC.

## Ce qu'il y a dedans

| Dossier | Rôle |
|---|---|
| `public/` | Le site (une seule page `index.html`, installable sur l'écran d'accueil) |
| `functions/api/` | Le serveur (Cloudflare Pages Functions) : connexion, fiches, reconnaissance par Claude |
| `db/schema.sql` | La structure de la base D1 |
| `db/seed.sql` | Les 4 objets déjà scannés (Etage 17), à importer une fois |

## Mise en ligne sur Cloudflare (une seule fois)

### 1. Créer la base de données
Cloudflare → **Storage & Databases → D1** → **Create database** → nom : `inventaire`.
Dans la base, onglet **Console**, colle le contenu de `db/schema.sql` → **Execute**.
Puis colle le contenu de `db/seed.sql` → **Execute** (pour récupérer les objets déjà scannés).

### 2. Créer le site relié à GitHub
**Workers & Pages → Create → Pages → Connect to Git** → choisir `shimon3/scan-placards`.
- Framework preset : **None**
- Build command : *(vide)*
- Build output directory : **`public`**

### 3. Brancher la base et les secrets
Dans le projet Pages → **Settings** :
- **Bindings → Add → D1 database** : nom de variable **`DB`**, base **`inventaire`**.
- **Variables and Secrets → Add** (type *Secret*) :
  - `APP_PASSWORD` : le mot de passe pour entrer sur le site.
  - `ANTHROPIC_API_KEY` : ta clé API Claude (console.anthropic.com → API Keys). Sans elle, tout marche sauf la reconnaissance automatique.
  - *(optionnel)* `CLAUDE_MODEL` : par défaut `claude-sonnet-5-5`. `claude-haiku-5-5` coûte moins cher.

Puis **Deployments → Retry deployment** pour que les réglages soient pris en compte.

## Utilisation
1. Ouvre l'adresse `https://<ton-projet>.pages.dev` dans Chrome sur le téléphone, entre le mot de passe.
2. ⋮ → **Ajouter à l'écran d'accueil**.
3. **Scanner** → vise le code-barres → bip → Claude remplit la fiche → indique le placard → **Enregistrer**.
4. Pas de code-barres ? Dans le scanner, **Pas de code-barres : prendre la photo**.
5. **Exporter CSV** télécharge la liste pour Excel.

## Coût
Cloudflare Pages + D1 : gratuit à cette échelle. Claude : payé à l'usage sur ta clé API, une image par objet scanné.
