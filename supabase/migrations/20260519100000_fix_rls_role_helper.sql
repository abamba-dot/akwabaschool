CREATE SCHEMA IF NOT EXISTS prive;

CREATE OR REPLACE FUNCTION prive.role_utilisateur_courant()
RETURNS public.role_utilisateur
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role
  FROM public.utilisateurs
  WHERE id = (SELECT auth.uid())
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION prive.role_utilisateur_courant() FROM public;
GRANT USAGE ON SCHEMA prive TO authenticated;
GRANT EXECUTE ON FUNCTION prive.role_utilisateur_courant() TO authenticated;

DROP POLICY IF EXISTS "lecture_utilisateurs_staff" ON public.utilisateurs;
DROP POLICY IF EXISTS "lecture_paiements_staff" ON public.paiements;
DROP POLICY IF EXISTS "ecriture_annees_admin" ON public.annees_scolaires;
DROP POLICY IF EXISTS "ecriture_eleves_staff" ON public.eleves;
DROP POLICY IF EXISTS "ecriture_paiements_staff" ON public.paiements;
DROP POLICY IF EXISTS "ecriture_classes_staff" ON public.classes;
DROP POLICY IF EXISTS "ecriture_enseignants_staff" ON public.enseignants;
DROP POLICY IF EXISTS "ecriture_absences_staff" ON public.absences;
DROP POLICY IF EXISTS "ecriture_notes_staff" ON public.notes;
DROP POLICY IF EXISTS "ecriture_enseignant_classes_staff" ON public.enseignant_classes;

CREATE POLICY "lecture_utilisateurs_staff" ON public.utilisateurs FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR (SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur'));

CREATE POLICY "lecture_paiements_staff" ON public.paiements FOR SELECT TO authenticated
  USING ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire'));

CREATE POLICY "ecriture_annees_admin" ON public.annees_scolaires FOR ALL TO authenticated
  USING ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur'))
  WITH CHECK ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur'));

CREATE POLICY "ecriture_eleves_staff" ON public.eleves FOR ALL TO authenticated
  USING ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'secretaire'))
  WITH CHECK ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'secretaire'));

CREATE POLICY "ecriture_paiements_staff" ON public.paiements FOR ALL TO authenticated
  USING ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'secretaire'))
  WITH CHECK ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'secretaire'));

CREATE POLICY "ecriture_classes_staff" ON public.classes FOR ALL TO authenticated
  USING ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire'))
  WITH CHECK ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire'));

CREATE POLICY "ecriture_enseignants_staff" ON public.enseignants FOR ALL TO authenticated
  USING ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire'))
  WITH CHECK ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire'));

CREATE POLICY "ecriture_absences_staff" ON public.absences FOR ALL TO authenticated
  USING ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire', 'enseignant'))
  WITH CHECK ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire', 'enseignant'));

CREATE POLICY "ecriture_notes_staff" ON public.notes FOR ALL TO authenticated
  USING ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire', 'enseignant'))
  WITH CHECK ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire', 'enseignant'));

CREATE POLICY "ecriture_enseignant_classes_staff" ON public.enseignant_classes FOR ALL TO authenticated
  USING ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire'))
  WITH CHECK ((SELECT prive.role_utilisateur_courant()) IN ('admin', 'directeur', 'secretaire'));
