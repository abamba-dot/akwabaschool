-- Vérifications rapides après installation du schéma Akwaba IT.

SELECT
  'tables' AS controle,
  COUNT(*) AS total
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'annees_scolaires',
    'utilisateurs',
    'enseignants',
    'classes',
    'eleves',
    'enseignant_classes',
    'paiements',
    'notes',
    'absences'
  );

SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'annees_scolaires',
    'utilisateurs',
    'enseignants',
    'classes',
    'eleves',
    'enseignant_classes',
    'paiements',
    'notes',
    'absences'
  )
ORDER BY tablename;

SELECT
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee = 'authenticated'
  AND table_name IN ('eleves', 'classes', 'enseignants', 'paiements', 'notes', 'absences')
ORDER BY table_name, privilege_type;

SELECT
  'annee_active' AS controle,
  libelle
FROM annees_scolaires
WHERE active = true;

SELECT
  'seed' AS controle,
  (SELECT COUNT(*) FROM enseignants) AS enseignants,
  (SELECT COUNT(*) FROM classes) AS classes,
  (SELECT COUNT(*) FROM eleves) AS eleves,
  (SELECT COUNT(*) FROM paiements) AS paiements,
  (SELECT COUNT(*) FROM notes) AS notes,
  (SELECT COUNT(*) FROM absences) AS absences;
