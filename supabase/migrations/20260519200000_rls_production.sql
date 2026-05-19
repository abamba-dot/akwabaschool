-- ============================================================
-- MIGRATION : RLS Production Hardening
-- Durcissement des policies pour la mise en production
-- Dépend de : 20260519100000_fix_rls_role_helper (schéma prive)
-- ============================================================

-- 1. Remplacer lecture_authentifie sur enseignants
--    Avant : tous les authentifiés voient tous les enseignants + salaires
--    Après : admin/directeur/secretaire voient tout
--            enseignant voit uniquement sa propre ligne (par email)
DROP POLICY IF EXISTS "lecture_authentifie" ON public.enseignants;

CREATE POLICY "lecture_enseignants_staff" ON public.enseignants
  FOR SELECT TO authenticated
  USING (
    (SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire')
    OR email = (
      SELECT u.email FROM public.utilisateurs u
      WHERE u.id = (SELECT auth.uid())
      LIMIT 1
    )
  );

-- 2. Ajouter filtre supprime_le IS NULL aux SELECT policies
--    Les enregistrements soft-deleted ne doivent jamais remonter côté DB,
--    même en cas de contournement de la couche service.

DROP POLICY IF EXISTS "lecture_authentifie" ON public.eleves;
CREATE POLICY "lecture_eleves_actifs" ON public.eleves
  FOR SELECT TO authenticated
  USING (supprime_le IS NULL);

DROP POLICY IF EXISTS "lecture_authentifie" ON public.classes;
CREATE POLICY "lecture_classes_actives" ON public.classes
  FOR SELECT TO authenticated
  USING (supprime_le IS NULL);

DROP POLICY IF EXISTS "lecture_authentifie" ON public.notes;
CREATE POLICY "lecture_notes_actives" ON public.notes
  FOR SELECT TO authenticated
  USING (supprime_le IS NULL);

DROP POLICY IF EXISTS "lecture_authentifie" ON public.absences;
CREATE POLICY "lecture_absences_actives" ON public.absences
  FOR SELECT TO authenticated
  USING (supprime_le IS NULL);

-- annees_scolaires / enseignant_classes : pas de colonne supprime_le, conserver USING (true)

-- 3. Scinder FOR ALL sur notes en opérations distinctes
--    Avant : enseignant peut supprimer n'importe quelle note (FOR ALL)
--    Après : INSERT/UPDATE ouvert à l'équipe pédagogique, DELETE réservé admin/directeur

DROP POLICY IF EXISTS "ecriture_notes_staff" ON public.notes;

CREATE POLICY "insert_notes_staff" ON public.notes
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire', 'enseignant')
  );

CREATE POLICY "update_notes_staff" ON public.notes
  FOR UPDATE TO authenticated
  USING (
    (SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire', 'enseignant')
  )
  WITH CHECK (
    (SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire', 'enseignant')
  );

CREATE POLICY "delete_notes_admin" ON public.notes
  FOR DELETE TO authenticated
  USING (
    (SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur')
  );
