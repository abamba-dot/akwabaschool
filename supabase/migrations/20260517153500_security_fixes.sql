-- ============================================================
-- MIGRATION P0 — Security Fixes
-- Appliquer après le schema initial
-- ============================================================

-- 1. Supprimer le trigger sync_statut_paiement_eleve défectueux
--    Problème : unidirectionnel (ne gère pas annulation/remboursement),
--    N+1 caché en batch, provoque des incohérences de données.
DROP TRIGGER IF EXISTS tg_paiements_sync_eleve ON paiements;
DROP FUNCTION IF EXISTS sync_statut_paiement_eleve();

-- 2. Corriger les policies SELECT trop permissives
--    Avant : tout utilisateur authentifié pouvait lire absolument tout
--    (salaires, paiements, données utilisateurs).

-- 2a. Restreindre la lecture des utilisateurs aux admin/directeur
DROP POLICY IF EXISTS "lecture_authentifie" ON utilisateurs;
CREATE POLICY "lecture_utilisateurs_staff" ON utilisateurs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur')));

-- 2b. Restreindre la lecture des paiements (données financières)
DROP POLICY IF EXISTS "lecture_authentifie" ON paiements;
CREATE POLICY "lecture_paiements_staff" ON paiements FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur', 'secretaire')));

-- 2c. Laisser eleves/classes/notes/absences/enseignants/enseignant_classes en lecture
--     pour tous les authentifiés en V1 (éviter de casser l'app).
--     NOTE V2 : affiner enseignants pour masquer le salaire aux enseignants eux-mêmes.

-- 3. Ajouter policy d'écriture sur enseignant_classes (manquante en V1)
CREATE POLICY "ecriture_enseignant_classes" ON enseignant_classes FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur', 'secretaire'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur', 'secretaire'))
  );

-- 4. Simplifier les sous-requêtes inutiles dans les policies existantes
--    Remplacer (SELECT auth.uid()) par auth.uid() directement

DROP POLICY IF EXISTS "ecriture_annees_admin" ON annees_scolaires;
CREATE POLICY "ecriture_annees_admin" ON annees_scolaires FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur')))
  WITH CHECK (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur')));

DROP POLICY IF EXISTS "ecriture_admin" ON eleves;
CREATE POLICY "ecriture_eleves_staff" ON eleves FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'secretaire')))
  WITH CHECK (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'secretaire')));

DROP POLICY IF EXISTS "ecriture_admin" ON paiements;
CREATE POLICY "ecriture_paiements_staff" ON paiements FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'secretaire')))
  WITH CHECK (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'secretaire')));

DROP POLICY IF EXISTS "ecriture_admin" ON classes;
CREATE POLICY "ecriture_classes_staff" ON classes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur', 'secretaire')))
  WITH CHECK (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur', 'secretaire')));

DROP POLICY IF EXISTS "ecriture_admin" ON enseignants;
CREATE POLICY "ecriture_enseignants_staff" ON enseignants FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur', 'secretaire')))
  WITH CHECK (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur', 'secretaire')));

DROP POLICY IF EXISTS "ecriture_admin" ON absences;
CREATE POLICY "ecriture_absences_staff" ON absences FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur', 'secretaire', 'enseignant')))
  WITH CHECK (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur', 'secretaire', 'enseignant')));

DROP POLICY IF EXISTS "notes_enseignant" ON notes;
CREATE POLICY "ecriture_notes_staff" ON notes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur', 'secretaire', 'enseignant')))
  WITH CHECK (EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role IN ('admin', 'directeur', 'secretaire', 'enseignant')));

-- 5. Contraintes de dates manquantes
ALTER TABLE annees_scolaires DROP CONSTRAINT IF EXISTS chk_dates_annee;
ALTER TABLE annees_scolaires ADD CONSTRAINT chk_dates_annee CHECK (date_debut < date_fin);

ALTER TABLE absences DROP CONSTRAINT IF EXISTS chk_heures_absence;
ALTER TABLE absences ADD CONSTRAINT chk_heures_absence CHECK (heure_debut IS NULL OR heure_fin IS NULL OR heure_debut < heure_fin);

-- 6. Index critiques manquants
CREATE INDEX IF NOT EXISTS idx_eleves_annee ON eleves(annee_scolaire_id);
CREATE INDEX IF NOT EXISTS idx_classes_annee_composite ON classes(annee_scolaire_id, niveau);
CREATE INDEX IF NOT EXISTS idx_paiements_annee ON paiements(annee_scolaire_id, date_paiement DESC);
CREATE INDEX IF NOT EXISTS idx_notes_annee ON notes(annee_scolaire_id, trimestre, matiere);
CREATE INDEX IF NOT EXISTS idx_paiements_eleve_date ON paiements(eleve_id, date_paiement DESC);
CREATE INDEX IF NOT EXISTS idx_notes_eleve_trimestre ON notes(eleve_id, trimestre, date_evaluation DESC);
CREATE INDEX IF NOT EXISTS idx_absences_eleve_date ON absences(eleve_id, date DESC);

-- 7. Extension pg_trgm pour recherche texte (si pas déjà présente)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_eleves_recherche ON eleves USING gin (nom gin_trgm_ops, prenom gin_trgm_ops);
