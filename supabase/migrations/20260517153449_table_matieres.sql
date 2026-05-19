-- ============================================================
-- MIGRATION : Table matieres normalisées
-- ============================================================

CREATE TABLE IF NOT EXISTS matieres (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom           VARCHAR(100) NOT NULL UNIQUE,
  code          VARCHAR(20) UNIQUE,           -- ex: MATH, FR, PHY
  description   TEXT,
  cree_le       TIMESTAMPTZ DEFAULT NOW(),
  mis_a_jour_le TIMESTAMPTZ DEFAULT NOW(),
  supprime_le   TIMESTAMPTZ
);

-- Index partiel pour exclure les matières supprimées
CREATE INDEX IF NOT EXISTS idx_matieres_supprime ON matieres(supprime_le) WHERE supprime_le IS NULL;

-- Données initiales
INSERT INTO matieres (nom, code) VALUES
  ('Mathématiques', 'MATH'),
  ('Français', 'FR'),
  ('Histoire-Géographie', 'HG'),
  ('Sciences Physiques', 'PHY'),
  ('Sciences de la Vie et de la Terre', 'SVT'),
  ('Anglais', 'ANG'),
  ('Allemand', 'ALL'),
  ('Espagnol', 'ESP'),
  ('Philosophie', 'PHILO'),
  ('Éducation Civique', 'EC'),
  ('Arts Plastiques', 'ART'),
  ('Musique', 'MUS'),
  ('Sport', 'EPS'),
  ('Informatique', 'INFO')
ON CONFLICT (nom) DO NOTHING;
