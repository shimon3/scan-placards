-- Base D1 de l'inventaire des placards
CREATE TABLE IF NOT EXISTS items (
  id      TEXT PRIMARY KEY,
  nom     TEXT NOT NULL,
  cat     TEXT,
  placard TEXT,
  qte     INTEGER NOT NULL DEFAULT 1,
  etat    TEXT,
  marque  TEXT,
  modele  TEXT,
  taille  TEXT,
  serie   TEXT,
  code    TEXT,
  note    TEXT,
  photo   TEXT,
  ts      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_items_placard ON items(placard);
