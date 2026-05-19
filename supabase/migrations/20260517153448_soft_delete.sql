-- ============================================================
-- MIGRATION : Soft delete sur les tables principales
-- ============================================================

-- Ajout de la colonne supprime_le
ALTER TABLE eleves ADD COLUMN IF NOT EXISTS supprime_le TIMESTAMPTZ;
ALTER TABLE enseignants ADD COLUMN IF NOT EXISTS supprime_le TIMESTAMPTZ;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS supprime_le TIMESTAMPTZ;
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS supprime_le TIMESTAMPTZ;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS supprime_le TIMESTAMPTZ;
ALTER TABLE absences ADD COLUMN IF NOT EXISTS supprime_le TIMESTAMPTZ;
ALTER TABLE annees_scolaires ADD COLUMN IF NOT EXISTS supprime_le TIMESTAMPTZ;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS supprime_le TIMESTAMPTZ;

-- Index pour filtrer rapidement les lignes actives
CREATE INDEX IF NOT EXISTS idx_eleves_supprime ON eleves(supprime_le) WHERE supprime_le IS NULL;
CREATE INDEX IF NOT EXISTS idx_enseignants_supprime ON enseignants(supprime_le) WHERE supprime_le IS NULL;
CREATE INDEX IF NOT EXISTS idx_classes_supprime ON classes(supprime_le) WHERE supprime_le IS NULL;
CREATE INDEX IF NOT EXISTS idx_paiements_supprime ON paiements(supprime_le) WHERE supprime_le IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_supprime ON notes(supprime_le) WHERE supprime_le IS NULL;
CREATE INDEX IF NOT EXISTS idx_absences_supprime ON absences(supprime_le) WHERE supprime_le IS NULL;
