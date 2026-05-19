-- Démo propre Akwaba IT.
-- Ce seed conserve les comptes utilisateurs et remplace uniquement les données métier.

TRUNCATE TABLE
  absences,
  notes,
  paiements,
  enseignant_classes,
  eleves,
  classes,
  enseignants
RESTART IDENTITY CASCADE;

UPDATE annees_scolaires
SET active = false
WHERE id <> 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

INSERT INTO annees_scolaires (id, libelle, date_debut, date_fin, active)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-2026', '2025-09-01', '2026-06-30', true)
ON CONFLICT (id) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  date_debut = EXCLUDED.date_debut,
  date_fin = EXCLUDED.date_fin,
  active = EXCLUDED.active,
  mis_a_jour_le = NOW();

INSERT INTO enseignants (id, nom, prenom, email, telephone, adresse, specialite, statut, date_embauche)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Kouamé', 'Ariane', 'ariane.kouame@akwaba.edu', '+225 07 12 45 78', 'Cocody, Abidjan', 'Mathématiques', 'actif', '2021-09-01'),
  ('22222222-2222-4222-8222-222222222222', 'Diallo', 'Moussa', 'moussa.diallo@akwaba.edu', '+225 05 34 67 90', 'Marcory, Abidjan', 'Français', 'actif', '2020-09-01')
ON CONFLICT (id) DO UPDATE SET
  nom = EXCLUDED.nom,
  prenom = EXCLUDED.prenom,
  email = EXCLUDED.email,
  telephone = EXCLUDED.telephone,
  adresse = EXCLUDED.adresse,
  specialite = EXCLUDED.specialite,
  statut = EXCLUDED.statut,
  date_embauche = EXCLUDED.date_embauche;

INSERT INTO classes (id, nom, niveau, salle, capacite_max, enseignant_principal_id, annee_scolaire_id)
VALUES
  ('33333333-3333-4333-8333-333333333331', '6ème A', '6ème', 'Salle 101', 32, '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('33333333-3333-4333-8333-333333333332', '5ème A', '5ème', 'Salle 201', 30, '22222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (id) DO UPDATE SET
  nom = EXCLUDED.nom,
  niveau = EXCLUDED.niveau,
  salle = EXCLUDED.salle,
  capacite_max = EXCLUDED.capacite_max,
  enseignant_principal_id = EXCLUDED.enseignant_principal_id,
  annee_scolaire_id = EXCLUDED.annee_scolaire_id;

INSERT INTO enseignant_classes (enseignant_id, classe_id, matiere)
VALUES
  ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333331', 'Mathématiques'),
  ('22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333331', 'Français'),
  ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333332', 'Mathématiques'),
  ('22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333332', 'Français')
ON CONFLICT DO NOTHING;

INSERT INTO eleves (
  id,
  matricule,
  nom,
  prenom,
  date_naissance,
  lieu_naissance,
  sexe,
  email,
  telephone,
  adresse,
  classe_id,
  annee_scolaire_id,
  statut,
  statut_paiement,
  tuteur_nom,
  tuteur_telephone,
  tuteur_email,
  tuteur_relation
)
VALUES
  (
    '44444444-4444-4444-8444-444444444441',
    'AKW-6A-KYA',
    'Yao',
    'Koffi Ange',
    '2013-03-15',
    'Abidjan',
    'M',
    'koffi.yao@example.com',
    '+225 07 10 20 30',
    'Cocody, Abidjan',
    '33333333-3333-4333-8333-333333333331',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'actif',
    'paye',
    'Yao Mireille',
    '+225 05 10 20 30',
    'mireille.yao@example.com',
    'Mère'
  ),
  (
    '44444444-4444-4444-8444-444444444442',
    'AKW-6A-ANA',
    'Nguessan',
    'Aminata',
    '2013-08-09',
    'Bouaké',
    'F',
    'aminata.nguessan@example.com',
    '+225 07 21 31 41',
    'Riviera, Abidjan',
    '33333333-3333-4333-8333-333333333331',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'actif',
    'en_attente',
    'Nguessan Paul',
    '+225 05 21 31 41',
    'paul.nguessan@example.com',
    'Père'
  ),
  (
    '44444444-4444-4444-8444-444444444443',
    'AKW-5A-MKO',
    'Koné',
    'Mariam',
    '2012-12-04',
    'Korhogo',
    'F',
    'mariam.kone@example.com',
    '+225 07 32 42 52',
    'Marcory, Abidjan',
    '33333333-3333-4333-8333-333333333332',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'actif',
    'retard',
    'Koné Dramane',
    '+225 05 32 42 52',
    'dramane.kone@example.com',
    'Père'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'AKW-5A-DTO',
    'Traoré',
    'Daouda',
    '2012-06-21',
    'Daloa',
    'M',
    'daouda.traore@example.com',
    '+225 07 43 53 63',
    'Plateau, Abidjan',
    '33333333-3333-4333-8333-333333333332',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'actif',
    'paye',
    'Traoré Aïcha',
    '+225 05 43 53 63',
    'aicha.traore@example.com',
    'Mère'
  )
ON CONFLICT (id) DO UPDATE SET
  matricule = EXCLUDED.matricule,
  nom = EXCLUDED.nom,
  prenom = EXCLUDED.prenom,
  date_naissance = EXCLUDED.date_naissance,
  lieu_naissance = EXCLUDED.lieu_naissance,
  sexe = EXCLUDED.sexe,
  email = EXCLUDED.email,
  telephone = EXCLUDED.telephone,
  adresse = EXCLUDED.adresse,
  classe_id = EXCLUDED.classe_id,
  annee_scolaire_id = EXCLUDED.annee_scolaire_id,
  statut = EXCLUDED.statut,
  statut_paiement = EXCLUDED.statut_paiement,
  tuteur_nom = EXCLUDED.tuteur_nom,
  tuteur_telephone = EXCLUDED.tuteur_telephone,
  tuteur_email = EXCLUDED.tuteur_email,
  tuteur_relation = EXCLUDED.tuteur_relation;

INSERT INTO paiements (id, eleve_id, montant, date_paiement, methode, type, statut, reference, description, annee_scolaire_id)
VALUES
  ('55555555-5555-4555-8555-555555555551', '44444444-4444-4444-8444-444444444441', 150000, '2026-01-10', 'mobile_money', 'scolarite', 'paye', 'RECU-KYA-T1', 'Scolarité trimestre 1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('55555555-5555-4555-8555-555555555552', '44444444-4444-4444-8444-444444444444', 150000, '2026-01-12', 'especes', 'scolarite', 'paye', 'RECU-DTO-T1', 'Scolarité trimestre 1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('55555555-5555-4555-8555-555555555553', '44444444-4444-4444-8444-444444444442', 50000, '2026-01-15', 'virement', 'inscription', 'en_attente', 'RECU-ANA-INS', 'Inscription en attente de validation', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (reference) DO UPDATE SET
  eleve_id = EXCLUDED.eleve_id,
  montant = EXCLUDED.montant,
  date_paiement = EXCLUDED.date_paiement,
  methode = EXCLUDED.methode,
  type = EXCLUDED.type,
  statut = EXCLUDED.statut,
  description = EXCLUDED.description,
  annee_scolaire_id = EXCLUDED.annee_scolaire_id;

INSERT INTO notes (id, eleve_id, enseignant_id, classe_id, matiere, type, trimestre, valeur, bareme, coefficient, date_evaluation, commentaire, annee_scolaire_id)
VALUES
  ('66666666-6666-4666-8666-666666666661', '44444444-4444-4444-8444-444444444441', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333331', 'Mathématiques', 'devoir', 1, 16, 20, 2, '2026-01-18', 'Très bon raisonnement.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('66666666-6666-4666-8666-666666666662', '44444444-4444-4444-8444-444444444442', '22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333331', 'Français', 'controle', 1, 13.5, 20, 1.5, '2026-01-19', 'Participation encourageante.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('66666666-6666-4666-8666-666666666663', '44444444-4444-4444-8444-444444444443', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333332', 'Mathématiques', 'examen', 1, 9.5, 20, 3, '2026-01-20', 'À accompagner sur les bases.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (id) DO UPDATE SET
  valeur = EXCLUDED.valeur,
  commentaire = EXCLUDED.commentaire,
  mis_a_jour_le = NOW();

INSERT INTO absences (id, eleve_id, type, date, heure_debut, heure_fin, matiere, statut, justification, enseignant_id)
VALUES
  ('77777777-7777-4777-8777-777777777771', '44444444-4444-4444-8444-444444444442', 'retard', '2026-01-22', '08:00', '08:20', 'Français', 'justifiee', 'Transport familial', '22222222-2222-4222-8222-222222222222'),
  ('77777777-7777-4777-8777-777777777772', '44444444-4444-4444-8444-444444444443', 'absence', '2026-01-23', NULL, NULL, NULL, 'en_attente', NULL, '11111111-1111-4111-8111-111111111111')
ON CONFLICT (id) DO UPDATE SET
  statut = EXCLUDED.statut,
  justification = EXCLUDED.justification,
  mis_a_jour_le = NOW();
