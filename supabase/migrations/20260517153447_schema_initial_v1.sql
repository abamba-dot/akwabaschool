-- ============================================================
-- AKWABA IT — Schéma PostgreSQL complet
-- Compatible Supabase avec Row Level Security
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Types énumérés ──────────────────────────────────────────

CREATE TYPE role_utilisateur AS ENUM ('admin', 'directeur', 'secretaire', 'enseignant');
CREATE TYPE statut_eleve AS ENUM ('actif', 'inactif', 'suspendu', 'diplome');
CREATE TYPE statut_paiement AS ENUM ('paye', 'en_attente', 'retard');
CREATE TYPE statut_paiement_record AS ENUM ('paye', 'en_attente', 'annule', 'rembourse');
CREATE TYPE methode_paiement AS ENUM ('especes', 'virement', 'mobile_money', 'cheque', 'carte');
CREATE TYPE type_paiement AS ENUM ('scolarite', 'inscription', 'cantine', 'transport', 'activite', 'autre');
CREATE TYPE type_note AS ENUM ('devoir', 'examen', 'controle', 'tp', 'projet');
CREATE TYPE statut_absence AS ENUM ('non_justifiee', 'en_attente', 'justifiee');
CREATE TYPE statut_enseignant AS ENUM ('actif', 'conge', 'inactif');
CREATE TYPE niveau_classe AS ENUM ('CP1','CP2','CE1','CE2','CM1','CM2','6ème','5ème','4ème','3ème','2nde','1ère','Terminale','BTS1','BTS2');

-- ─── Table : annees_scolaires ─────────────────────────────────

CREATE TABLE annees_scolaires (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  libelle     VARCHAR(20) NOT NULL,           -- ex: "2024-2025"
  date_debut  DATE NOT NULL,
  date_fin    DATE NOT NULL,
  active      BOOLEAN DEFAULT false,
  cree_le     TIMESTAMPTZ DEFAULT NOW(),
  mis_a_jour_le TIMESTAMPTZ DEFAULT NOW()
);

-- Une seule année active à la fois
CREATE UNIQUE INDEX idx_annee_active ON annees_scolaires (active) WHERE active = true;

-- ─── Table : utilisateurs (profils) ──────────────────────────

CREATE TABLE utilisateurs (
  id          UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email       VARCHAR(255) NOT NULL UNIQUE,
  nom         VARCHAR(100) NOT NULL,
  prenom      VARCHAR(100) NOT NULL,
  role        role_utilisateur NOT NULL DEFAULT 'secretaire',
  photo_url   TEXT,
  telephone   VARCHAR(20),
  actif       BOOLEAN DEFAULT true,
  cree_le     TIMESTAMPTZ DEFAULT NOW(),
  mis_a_jour_le TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Table : enseignants ──────────────────────────────────────

CREATE TABLE enseignants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom           VARCHAR(100) NOT NULL,
  prenom        VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE,
  telephone     VARCHAR(20),
  adresse       TEXT,
  specialite    VARCHAR(100),                 -- matière principale
  photo_url     TEXT,
  statut        statut_enseignant DEFAULT 'actif',
  date_embauche DATE,
  salaire       DECIMAL(10, 0),
  cree_le       TIMESTAMPTZ DEFAULT NOW(),
  mis_a_jour_le TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Table : classes ─────────────────────────────────────────

CREATE TABLE classes (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom                   VARCHAR(50) NOT NULL,       -- ex: "6ème A"
  niveau                niveau_classe NOT NULL,
  salle                 VARCHAR(20),
  capacite_max          SMALLINT DEFAULT 40,
  enseignant_principal_id UUID REFERENCES enseignants(id) ON DELETE SET NULL,
  annee_scolaire_id     UUID REFERENCES annees_scolaires(id) ON DELETE CASCADE,
  cree_le               TIMESTAMPTZ DEFAULT NOW(),
  mis_a_jour_le         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_annee ON classes(annee_scolaire_id);

-- ─── Table : eleves ──────────────────────────────────────────

CREATE TABLE eleves (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matricule       VARCHAR(20) NOT NULL UNIQUE,
  nom             VARCHAR(100) NOT NULL,
  prenom          VARCHAR(100) NOT NULL,
  date_naissance  DATE NOT NULL,
  lieu_naissance  VARCHAR(100),
  sexe            CHAR(1) CHECK (sexe IN ('M', 'F')),
  email           VARCHAR(255),
  telephone       VARCHAR(20),
  adresse         TEXT,
  photo_url       TEXT,
  classe_id       UUID REFERENCES classes(id) ON DELETE SET NULL,
  annee_scolaire_id UUID REFERENCES annees_scolaires(id) ON DELETE SET NULL,
  statut          statut_eleve DEFAULT 'actif',
  statut_paiement statut_paiement DEFAULT 'en_attente',
  -- Tuteur
  tuteur_nom      VARCHAR(200),
  tuteur_telephone VARCHAR(20),
  tuteur_email    VARCHAR(255),
  tuteur_relation VARCHAR(50),               -- père, mère, tuteur...
  -- Méta
  cree_le         TIMESTAMPTZ DEFAULT NOW(),
  mis_a_jour_le   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eleves_classe ON eleves(classe_id);
CREATE INDEX idx_eleves_statut ON eleves(statut);
CREATE INDEX idx_eleves_matricule ON eleves(matricule);

-- ─── Table : enseignant_classes (liaison N-N) ─────────────────

CREATE TABLE enseignant_classes (
  enseignant_id UUID REFERENCES enseignants(id) ON DELETE CASCADE,
  classe_id     UUID REFERENCES classes(id) ON DELETE CASCADE,
  matiere       VARCHAR(100) NOT NULL,
  PRIMARY KEY (enseignant_id, classe_id, matiere)
);

-- ─── Table : paiements ────────────────────────────────────────

CREATE TABLE paiements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  eleve_id    UUID NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
  montant     DECIMAL(10, 0) NOT NULL CHECK (montant > 0),
  date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
  methode     methode_paiement NOT NULL,
  type        type_paiement NOT NULL,
  statut      statut_paiement_record DEFAULT 'en_attente',
  reference   VARCHAR(50) UNIQUE NOT NULL,   -- numéro de reçu
  description TEXT,
  recu_url    TEXT,
  annee_scolaire_id UUID REFERENCES annees_scolaires(id) ON DELETE SET NULL,
  enregistre_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  cree_le     TIMESTAMPTZ DEFAULT NOW(),
  mis_a_jour_le TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_paiements_eleve ON paiements(eleve_id);
CREATE INDEX idx_paiements_date ON paiements(date_paiement DESC);
CREATE INDEX idx_paiements_statut ON paiements(statut);

-- ─── Table : notes ────────────────────────────────────────────

CREATE TABLE notes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  eleve_id      UUID NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
  enseignant_id UUID REFERENCES enseignants(id) ON DELETE SET NULL,
  classe_id     UUID REFERENCES classes(id) ON DELETE SET NULL,
  matiere       VARCHAR(100) NOT NULL,
  type          type_note NOT NULL,
  trimestre     SMALLINT NOT NULL CHECK (trimestre BETWEEN 1 AND 3),
  valeur        DECIMAL(4, 2) NOT NULL CHECK (valeur >= 0 AND valeur <= 20),
  bareme        DECIMAL(4, 2) DEFAULT 20 CHECK (bareme > 0),
  coefficient   DECIMAL(3, 1) DEFAULT 1.0 CHECK (coefficient > 0),
  date_evaluation DATE DEFAULT CURRENT_DATE,
  commentaire   TEXT,
  annee_scolaire_id UUID REFERENCES annees_scolaires(id) ON DELETE SET NULL,
  cree_le       TIMESTAMPTZ DEFAULT NOW(),
  mis_a_jour_le TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_eleve ON notes(eleve_id);
CREATE INDEX idx_notes_matiere ON notes(matiere);
CREATE INDEX idx_notes_trimestre ON notes(trimestre);

-- ─── Table : absences ─────────────────────────────────────────

CREATE TABLE absences (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  eleve_id      UUID NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
  type          VARCHAR(20) DEFAULT 'absence' CHECK (type IN ('absence','retard','exclusion')),
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  heure_debut   TIME,
  heure_fin     TIME,
  matiere       VARCHAR(100),               -- null = journée entière
  statut        statut_absence DEFAULT 'non_justifiee',
  justifiee     BOOLEAN DEFAULT false,
  justification TEXT,
  document_url  TEXT,                       -- justificatif scanné
  enseignant_id UUID REFERENCES enseignants(id) ON DELETE SET NULL,
  enregistre_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  cree_le       TIMESTAMPTZ DEFAULT NOW(),
  mis_a_jour_le TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_absences_eleve ON absences(eleve_id);
CREATE INDEX idx_absences_date ON absences(date DESC);
CREATE INDEX idx_absences_statut ON absences(statut);

-- ─── Trigger : mis_a_jour_le ──────────────────────────────────

CREATE OR REPLACE FUNCTION mettre_a_jour_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.mis_a_jour_le = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer sur toutes les tables concernées
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['annees_scolaires','utilisateurs','enseignants','classes','eleves','paiements','notes','absences'] LOOP
    EXECUTE format('
      CREATE TRIGGER tg_%s_timestamp
      BEFORE UPDATE ON %s
      FOR EACH ROW EXECUTE FUNCTION mettre_a_jour_timestamp()',
      t, t);
  END LOOP;
END;
$$;

-- ─── Trigger : génération matricule auto ──────────────────────

CREATE OR REPLACE FUNCTION generer_matricule()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.matricule IS NULL OR NEW.matricule = '' THEN
    NEW.matricule := 'AK-' || TO_CHAR(NOW(), 'YY') || '-' || LPAD(nextval('seq_matricule')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE seq_matricule START 1;

CREATE TRIGGER tg_eleves_matricule
BEFORE INSERT ON eleves
FOR EACH ROW EXECUTE FUNCTION generer_matricule();

-- ─── Trigger : mise à jour statut paiement élève ─────────────

CREATE OR REPLACE FUNCTION sync_statut_paiement_eleve()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'paye' THEN
    UPDATE eleves SET statut_paiement = 'paye' WHERE id = NEW.eleve_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_paiements_sync_eleve
AFTER INSERT OR UPDATE ON paiements
FOR EACH ROW EXECUTE FUNCTION sync_statut_paiement_eleve();

-- ─── Row Level Security ───────────────────────────────────────

ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE annees_scolaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE enseignants ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enseignant_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs authentifiés peuvent tout lire
CREATE POLICY "lecture_authentifie" ON utilisateurs FOR SELECT TO authenticated USING (true);
CREATE POLICY "lecture_authentifie" ON annees_scolaires FOR SELECT TO authenticated USING (true);
CREATE POLICY "lecture_authentifie" ON eleves FOR SELECT TO authenticated USING (true);
CREATE POLICY "lecture_authentifie" ON enseignants FOR SELECT TO authenticated USING (true);
CREATE POLICY "lecture_authentifie" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "lecture_authentifie" ON enseignant_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "lecture_authentifie" ON paiements FOR SELECT TO authenticated USING (true);
CREATE POLICY "lecture_authentifie" ON notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "lecture_authentifie" ON absences FOR SELECT TO authenticated USING (true);

-- Politique : seuls admin/secrétaire peuvent écrire
CREATE POLICY "ecriture_annees_admin" ON annees_scolaires FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'directeur'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'directeur'))
  );

CREATE POLICY "ecriture_admin" ON eleves FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'secretaire'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'secretaire'))
  );

CREATE POLICY "ecriture_admin" ON paiements FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'secretaire'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'secretaire'))
  );

CREATE POLICY "ecriture_admin" ON classes FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'directeur', 'secretaire'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'directeur', 'secretaire'))
  );

CREATE POLICY "ecriture_admin" ON enseignants FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'directeur', 'secretaire'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'directeur', 'secretaire'))
  );

CREATE POLICY "ecriture_admin" ON absences FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'directeur', 'secretaire', 'enseignant'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'directeur', 'secretaire', 'enseignant'))
  );

-- Politique V1 : l'équipe pédagogique peut gérer les notes.
CREATE POLICY "notes_enseignant" ON notes FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'directeur', 'secretaire', 'enseignant'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin', 'directeur', 'secretaire', 'enseignant'))
  );

-- ─── Vues utiles ─────────────────────────────────────────────

-- Vue : élèves avec nom de classe
CREATE OR REPLACE VIEW vue_eleves WITH (security_invoker = true) AS
SELECT
  e.*,
  c.nom AS classe_nom,
  c.niveau AS classe_niveau
FROM eleves e
LEFT JOIN classes c ON e.classe_id = c.id;

-- Vue : stats par classe
CREATE OR REPLACE VIEW vue_stats_classes WITH (security_invoker = true) AS
SELECT
  c.id,
  c.nom,
  c.niveau,
  COUNT(e.id) AS nb_eleves,
  ROUND(AVG(CASE WHEN e.statut_paiement = 'paye' THEN 1 ELSE 0 END) * 100) AS taux_paiement
FROM classes c
LEFT JOIN eleves e ON e.classe_id = c.id
GROUP BY c.id, c.nom, c.niveau;

-- Droits nécessaires pour les projets où l'exposition Data API n'est pas automatique.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  annees_scolaires,
  utilisateurs,
  enseignants,
  classes,
  eleves,
  enseignant_classes,
  paiements,
  notes,
  absences
TO authenticated;
GRANT SELECT ON vue_eleves, vue_stats_classes TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- ─── Données initiales ───────────────────────────────────────

-- Insérer l'année scolaire par défaut
INSERT INTO annees_scolaires (libelle, date_debut, date_fin, active)
VALUES ('2024-2025', '2024-09-01', '2025-06-30', true);

COMMENT ON TABLE eleves IS 'Données des élèves inscrits';
COMMENT ON TABLE paiements IS 'Historique des paiements de scolarité';
COMMENT ON TABLE notes IS 'Notes et évaluations par matière';
COMMENT ON TABLE absences IS 'Registre des absences';
COMMENT ON TABLE classes IS 'Classes et niveaux de l école';
COMMENT ON TABLE enseignants IS 'Corps enseignant';
