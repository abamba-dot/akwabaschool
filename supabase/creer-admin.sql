-- Remplacer USER_UID_ICI par l'identifiant du compte créé dans Authentication > Users.

INSERT INTO utilisateurs (id, email, nom, prenom, role, actif)
VALUES (
  'USER_UID_ICI',
  'admin@akwaba.edu',
  'Admin',
  'Akwaba',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  nom = EXCLUDED.nom,
  prenom = EXCLUDED.prenom,
  role = EXCLUDED.role,
  actif = EXCLUDED.actif,
  mis_a_jour_le = NOW();
