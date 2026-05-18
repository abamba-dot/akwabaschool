// ============================================================
// TYPES AKWABA IT — Définitions TypeScript de l'application
// ============================================================

// --- Utilisateur & Auth ---

export type RoleUtilisateur = 'admin' | 'directeur' | 'enseignant' | 'secretaire'

export interface Utilisateur {
  id: string
  email: string
  nom: string
  prenom: string
  role: RoleUtilisateur
  photoUrl?: string
  telephone?: string
  actif: boolean
  creeLe: string
  misAJourLe: string
}

// --- Élève ---

export type StatutEleveType = 'actif' | 'inactif' | 'suspendu' | 'diplome'
export type StatutPaiementType = 'paye' | 'en_attente' | 'retard'

export interface Eleve {
  id: string
  matricule: string
  nom: string
  prenom: string
  dateNaissance: string
  lieuNaissance: string
  sexe: 'M' | 'F'
  email?: string
  telephone?: string
  adresse: string
  photoUrl?: string
  // Tuteur / parent
  tuteurNom: string
  tuteurTelephone: string
  tuteurEmail?: string
  tuteurRelation: string
  // Scolarité
  classeId: string
  classe?: Classe
  anneeScolaireId: string
  statut: StatutEleveType
  statutPaiement: StatutPaiementType
  creeLe: string
  misAJourLe: string
  supprimeLe?: string
}

export interface EleveAvecDetails extends Eleve {
  paiements?: Paiement[]
  notes?: Note[]
  absences?: Absence[]
}

// --- Classe ---

export interface Classe {
  id: string
  nom: string
  niveau: string
  salle: string
  capaciteMax: number
  enseignantPrincipalId?: string
  enseignantPrincipal?: Enseignant
  anneeScolaireId: string
  effectif?: number
  creeLe: string
  misAJourLe: string
  supprimeLe?: string
}

// --- Enseignant ---

export type StatutEnseignantType = 'actif' | 'inactif' | 'conge'

export interface Enseignant {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  adresse?: string
  photoUrl?: string
  specialite: string
  dateEmbauche: string
  statut: StatutEnseignantType
  classes?: Classe[]
  matieres?: string[]
  creeLe: string
  misAJourLe: string
  supprimeLe?: string
}

// --- Paiement ---

export type StatutPaiement = 'paye' | 'en_attente' | 'rembourse' | 'annule'
export type MethodePaiement = 'especes' | 'virement' | 'cheque' | 'mobile_money' | 'carte'
export type TypePaiement = 'scolarite' | 'inscription' | 'cantine' | 'transport' | 'activite' | 'autre'

export interface Paiement {
  id: string
  eleveId: string
  eleve?: Pick<Eleve, 'id' | 'nom' | 'prenom' | 'matricule' | 'classeId'>
  montant: number
  datePaiement: string
  methode: MethodePaiement
  type: TypePaiement
  statut: StatutPaiement
  reference: string
  description?: string
  recuUrl?: string
  anneeScolaireId: string
  creeLe: string
  misAJourLe: string
  supprimeLe?: string
}

// --- Note ---

export type TypeNote = 'devoir' | 'examen' | 'controle' | 'tp' | 'projet'

export interface Note {
  id: string
  eleveId: string
  eleve?: Pick<Eleve, 'id' | 'nom' | 'prenom' | 'matricule'>
  matiere: string
  type: TypeNote
  valeur: number
  bareme: number
  coefficient: number
  commentaire?: string
  dateEvaluation: string
  trimestre: 1 | 2 | 3
  anneeScolaireId: string
  enseignantId: string
  creeLe: string
  misAJourLe: string
  supprimeLe?: string
}

// --- Absence ---

export type TypeAbsence = 'absence' | 'retard' | 'exclusion'
export type StatutAbsence = 'non_justifiee' | 'justifiee' | 'en_attente'

export interface Absence {
  id: string
  eleveId: string
  eleve?: Pick<Eleve, 'id' | 'nom' | 'prenom' | 'matricule'>
  type: TypeAbsence
  date: string
  heureDebut?: string
  heureFin?: string
  matiere?: string
  justification?: string
  statut: StatutAbsence
  enseignantId?: string
  creeLe: string
  misAJourLe: string
  supprimeLe?: string
}

// --- Année scolaire ---

export interface AnneeScolaire {
  id: string
  libelle: string
  dateDebut: string
  dateFin: string
  active: boolean
  creeLe: string
}

// --- Statistiques Dashboard ---

export interface StatsDashboard {
  totalEleves: number
  totalEnseignants: number
  totalClasses: number
  paiementsMois: number
  absencesJour: number
  tauxPaiement: number
  evolutionPaiements: { mois: string; montant: number }[]
  repartitionClasses: { classe: string; effectif: number }[]
}

// --- Pagination ---

export interface Pagination {
  page: number
  parPage: number
  total: number
  totalPages: number
}

export interface ReponsePaginee<T> {
  donnees: T[]
  pagination: Pagination
}

// --- Filtres ---

export interface FiltresEleve {
  recherche?: string
  classeId?: string
  statut?: StatutEleveType
  statutPaiement?: StatutPaiementType
}

export interface FiltresPaiement {
  recherche?: string
  statut?: StatutPaiement
  methode?: MethodePaiement
  type?: TypePaiement
  dateDebut?: string
  dateFin?: string
}

// --- Formulaires ---

export type FormulaireEleve = Omit<Eleve, 'id' | 'matricule' | 'creeLe' | 'misAJourLe' | 'classe'>
export type FormulaireEnseignant = Omit<Enseignant, 'id' | 'creeLe' | 'misAJourLe' | 'classes'>
export type FormulaireClasse = Omit<Classe, 'id' | 'creeLe' | 'misAJourLe' | 'enseignantPrincipal' | 'effectif'>
export type FormulairePaiement = Omit<Paiement, 'id' | 'creeLe' | 'misAJourLe' | 'eleve' | 'reference' | 'recuUrl'>
export type FormulaireNote = Omit<Note, 'id' | 'creeLe' | 'misAJourLe' | 'eleve'>
export type FormulaireAbsence = Omit<Absence, 'id' | 'creeLe' | 'misAJourLe' | 'eleve'>
