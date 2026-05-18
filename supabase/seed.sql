-- Données de test pour valider rapidement la V1.
-- À exécuter après supabase/schema.sql dans le SQL Editor Supabase.

INSERT INTO enseignants (id, nom, prenom, email, telephone, specialite, statut, date_embauche)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Kouamé', 'Jean-Baptiste', 'jb.kouame@akwaba.edu', '+225 07 12 34 56', 'Mathématiques', 'actif', '2019-09-01'),
  ('22222222-2222-2222-2222-222222222222', 'Diallo', 'Aminata', 'a.diallo@akwaba.edu', '+225 07 23 45 67', 'Français', 'actif', '2020-09-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO classes (id, nom, niveau, salle, capacite_max, enseignant_principal_id, annee_scolaire_id)
SELECT
  '33333333-3333-3333-3333-333333333333',
  '6ème A',
  '6ème',
  '101',
  35,
  '11111111-1111-1111-1111-111111111111',
  id
FROM annees_scolaires
WHERE active = true
ON CONFLICT (id) DO NOTHING;

INSERT INTO eleves (
  id,
  matricule,
  nom,
  prenom,
  date_naissance,
  lieu_naissance,
  sexe,
  telephone,
  adresse,
  classe_id,
  annee_scolaire_id,
  statut,
  statut_paiement,
  tuteur_nom,
  tuteur_telephone,
  tuteur_relation
)
SELECT
  '44444444-4444-4444-4444-444444444444',
  'AKW-2024-001',
  'Assi',
  'Konan Yves',
  '2009-03-15',
  'Abidjan',
  'M',
  '+225 07 11 22 33',
  'Cocody, Abidjan',
  '33333333-3333-3333-3333-333333333333',
  id,
  'actif',
  'en_attente',
  'Assi Jean-Pierre',
  '+225 05 11 22 33',
  'Père'
FROM annees_scolaires
WHERE active = true
ON CONFLICT (id) DO NOTHING;

INSERT INTO paiements (eleve_id, montant, date_paiement, methode, type, statut, reference, description, annee_scolaire_id)
SELECT
  '44444444-4444-4444-4444-444444444444',
  150000,
  CURRENT_DATE,
  'especes',
  'scolarite',
  'paye',
  'REF-TEST-001',
  'Paiement de test',
  id
FROM annees_scolaires
WHERE active = true
ON CONFLICT (reference) DO NOTHING;

INSERT INTO notes (eleve_id, enseignant_id, classe_id, matiere, type, trimestre, valeur, bareme, coefficient, date_evaluation, annee_scolaire_id)
SELECT
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  'Mathématiques',
  'devoir',
  1,
  16,
  20,
  2,
  CURRENT_DATE,
  id
FROM annees_scolaires
WHERE active = true;

INSERT INTO absences (eleve_id, type, date, matiere, statut, justification, enseignant_id)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'retard',
  CURRENT_DATE,
  'Français',
  'justifiee',
  'Test de justification',
  '22222222-2222-2222-2222-222222222222'
);
