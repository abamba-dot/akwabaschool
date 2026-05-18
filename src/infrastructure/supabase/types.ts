// ============================================================
// TYPES SUPABASE — Typage du schéma PostgreSQL
//
// POUR REGÉNÉRER AUTOMATIQUEMENT (nécessite un projet Supabase actif) :
//   npx supabase gen types typescript --project-id <REF_PROJET> --schema public > types/supabase.ts
//
// OU en local :
//   npx supabase start
//   npx supabase gen types typescript --local --schema public > types/supabase.ts
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ─── Types intermédiaires explicites (évite la récursivité dans Database) ───

export type ElevesRow = {
  id: string
  matricule: string
  nom: string
  prenom: string
  date_naissance: string
  lieu_naissance: string | null
  sexe: string
  email: string | null
  telephone: string | null
  adresse: string | null
  photo_url: string | null
  classe_id: string | null
  annee_scolaire_id: string | null
  statut: string
  statut_paiement: string
  tuteur_nom: string | null
  tuteur_telephone: string | null
  tuteur_email: string | null
  tuteur_relation: string | null
  cree_le: string
  mis_a_jour_le: string
}
export type ElevesInsert = Omit<ElevesRow, 'id' | 'matricule' | 'cree_le' | 'mis_a_jour_le'>
export type ElevesUpdate = Partial<ElevesRow>

export type EnseignantsRow = {
  id: string
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  adresse: string | null
  specialite: string | null
  photo_url: string | null
  statut: string
  date_embauche: string | null
  salaire: number | null
  cree_le: string
  mis_a_jour_le: string
}
export type EnseignantsInsert = Omit<EnseignantsRow, 'id' | 'cree_le' | 'mis_a_jour_le'>
export type EnseignantsUpdate = Partial<EnseignantsRow>

export type ClassesRow = {
  id: string
  nom: string
  niveau: string
  salle: string | null
  capacite_max: number | null
  enseignant_principal_id: string | null
  annee_scolaire_id: string | null
  cree_le: string
  mis_a_jour_le: string
}
export type ClassesInsert = Omit<ClassesRow, 'id' | 'cree_le' | 'mis_a_jour_le'>
export type ClassesUpdate = Partial<ClassesRow>

export type PaiementsRow = {
  id: string
  eleve_id: string
  montant: number
  date_paiement: string
  methode: string
  type: string
  statut: string
  reference: string
  description: string | null
  recu_url: string | null
  annee_scolaire_id: string | null
  enregistre_par: string | null
  cree_le: string
  mis_a_jour_le: string
}
export type PaiementsInsert = Omit<PaiementsRow, 'id' | 'cree_le' | 'mis_a_jour_le'>
export type PaiementsUpdate = Partial<PaiementsRow>

export type NotesRow = {
  id: string
  eleve_id: string
  enseignant_id: string | null
  classe_id: string | null
  matiere: string
  type: string
  trimestre: number
  valeur: number
  bareme: number | null
  coefficient: number | null
  date_evaluation: string | null
  commentaire: string | null
  annee_scolaire_id: string | null
  cree_le: string
  mis_a_jour_le: string
}
export type NotesInsert = Omit<NotesRow, 'id' | 'cree_le' | 'mis_a_jour_le'>
export type NotesUpdate = Partial<NotesRow>

export type AbsencesRow = {
  id: string
  eleve_id: string
  type: string
  date: string
  heure_debut: string | null
  heure_fin: string | null
  matiere: string | null
  statut: string
  justifiee: boolean | null
  justification: string | null
  document_url: string | null
  enseignant_id: string | null
  enregistre_par: string | null
  cree_le: string
  mis_a_jour_le: string
}
export type AbsencesInsert = Omit<AbsencesRow, 'id' | 'cree_le' | 'mis_a_jour_le'>
export type AbsencesUpdate = Partial<AbsencesRow>

export type UtilisateursRow = {
  id: string
  email: string
  nom: string
  prenom: string
  role: string
  photo_url: string | null
  telephone: string | null
  actif: boolean | null
  cree_le: string
  mis_a_jour_le: string
}
export type UtilisateursInsert = Omit<UtilisateursRow, 'cree_le' | 'mis_a_jour_le'>
export type UtilisateursUpdate = Partial<UtilisateursRow>

export type AnneesScolairesRow = {
  id: string
  libelle: string
  date_debut: string
  date_fin: string
  active: boolean | null
  cree_le: string
  mis_a_jour_le: string
}
export type AnneesScolairesInsert = Omit<AnneesScolairesRow, 'id' | 'cree_le' | 'mis_a_jour_le'>
export type AnneesScolairesUpdate = Partial<AnneesScolairesRow>

export type EnseignantClassesRow = {
  enseignant_id: string
  classe_id: string
  matiere: string
}
export type EnseignantClassesInsert = EnseignantClassesRow
export type EnseignantClassesUpdate = Partial<EnseignantClassesRow>

// ─── Interface Database (format attendu par @supabase/supabase-js) ──────────

export interface Database {
  public: {
    Tables: {
      eleves: {
        Row: ElevesRow
        Insert: ElevesInsert
        Update: ElevesUpdate
        Relationships: []
      }
      enseignants: {
        Row: EnseignantsRow
        Insert: EnseignantsInsert
        Update: EnseignantsUpdate
        Relationships: []
      }
      classes: {
        Row: ClassesRow
        Insert: ClassesInsert
        Update: ClassesUpdate
        Relationships: []
      }
      paiements: {
        Row: PaiementsRow
        Insert: PaiementsInsert
        Update: PaiementsUpdate
        Relationships: []
      }
      notes: {
        Row: NotesRow
        Insert: NotesInsert
        Update: NotesUpdate
        Relationships: []
      }
      absences: {
        Row: AbsencesRow
        Insert: AbsencesInsert
        Update: AbsencesUpdate
        Relationships: []
      }
      utilisateurs: {
        Row: UtilisateursRow
        Insert: UtilisateursInsert
        Update: UtilisateursUpdate
        Relationships: []
      }
      annees_scolaires: {
        Row: AnneesScolairesRow
        Insert: AnneesScolairesInsert
        Update: AnneesScolairesUpdate
        Relationships: []
      }
      enseignant_classes: {
        Row: EnseignantClassesRow
        Insert: EnseignantClassesInsert
        Update: EnseignantClassesUpdate
        Relationships: []
      }
    }
    Views: {
      vue_eleves: {
        Row: Record<string, unknown>
        Relationships: []
      }
      vue_stats_classes: {
        Row: Record<string, unknown>
        Relationships: []
      }
    }
    Functions: {
      [_ in string]: unknown
    }
    Enums: {
      [_ in string]: unknown
    }
    CompositeTypes: {
      [_ in string]: unknown
    }
  }
}
