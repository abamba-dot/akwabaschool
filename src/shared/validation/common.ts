// ============================================================
// VALIDATION ZOD — Schémas des formulaires
// ============================================================

import { z } from 'zod'

export const schemaEleve = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères.'),
  dateNaissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ'),
  lieuNaissance: z.string().optional(),
  sexe: z.enum(['M', 'F']),
  email: z.string().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  telephone: z.string().optional(),
  adresse: z.string().min(3, "L'adresse est trop courte."),
  photoUrl: z.string().url().optional().or(z.literal('')),
  classeId: z.string().uuid("L'identifiant de classe est invalide."),
  anneeScolaireId: z.string().uuid("L'identifiant d'année est invalide."),
  statut: z.enum(['actif', 'inactif', 'suspendu', 'diplome']).default('actif'),
  statutPaiement: z.enum(['paye', 'en_attente', 'retard']).default('en_attente'),
  tuteurNom: z.string().min(2, 'Le nom du tuteur est trop court.'),
  tuteurTelephone: z.string().optional(),
  tuteurEmail: z.string().email().optional().or(z.literal('')),
  tuteurRelation: z.string().optional(),
})

export const schemaEnseignant = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères.'),
  email: z.string().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  specialite: z.string().min(2, 'La spécialité est requise.'),
  dateEmbauche: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ').optional(),
  statut: z.enum(['actif', 'inactif', 'conge']).default('actif'),
})

export const schemaClasse = z.object({
  nom: z.string().min(2, 'Le nom de la classe est requis.'),
  niveau: z.string().min(1, 'Le niveau est requis.'),
  salle: z.string().optional(),
  capaciteMax: z.number().int().min(1).max(200).default(40),
  enseignantPrincipalId: z.string().uuid().optional().or(z.literal('')),
  anneeScolaireId: z.string().uuid(),
})

export const schemaPaiement = z.object({
  eleveId: z.string().uuid("L'identifiant de l'élève est invalide."),
  montant: z.number().positive('Le montant doit être positif.'),
  datePaiement: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ'),
  methode: z.enum(['especes', 'virement', 'cheque', 'mobile_money', 'carte']),
  type: z.enum(['scolarite', 'inscription', 'cantine', 'transport', 'activite', 'autre']),
  statut: z.enum(['paye', 'en_attente', 'rembourse', 'annule']).default('en_attente'),
  description: z.string().optional(),
  anneeScolaireId: z.string().uuid().optional().or(z.literal('')),
})

export const schemaNote = z.object({
  eleveId: z.string().uuid("L'identifiant de l'élève est invalide."),
  enseignantId: z.string().uuid().optional().or(z.literal('')),
  matiere: z.string().min(1, 'La matière est requise.'),
  type: z.enum(['devoir', 'examen', 'controle', 'tp', 'projet']),
  valeur: z.number().min(0).max(20, 'La note doit être comprise entre 0 et 20.'),
  bareme: z.number().positive().default(20),
  coefficient: z.number().positive().default(1),
  commentaire: z.string().optional(),
  dateEvaluation: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ'),
  trimestre: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  anneeScolaireId: z.string().uuid().optional().or(z.literal('')),
})

export const schemaAbsence = z.object({
  eleveId: z.string().uuid("L'identifiant de l'élève est invalide."),
  type: z.enum(['absence', 'retard', 'exclusion']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ'),
  heureDebut: z.string().optional(),
  heureFin: z.string().optional(),
  matiere: z.string().optional(),
  justification: z.string().optional(),
  statut: z.enum(['non_justifiee', 'justifiee', 'en_attente']).default('non_justifiee'),
  enseignantId: z.string().uuid().optional().or(z.literal('')),
})
