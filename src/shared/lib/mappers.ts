// ============================================================
// MAPPERS — Frontend camelCase ↔ Supabase snake_case
// ============================================================

import type {
  Absence,
  AnneeScolaire,
  Classe,
  Eleve,
  Enseignant,
  Note,
  Paiement,
  RoleUtilisateur,
  StatutAbsence,
  StatutEleveType,
  StatutEnseignantType,
  StatutPaiement,
  StatutPaiementType,
  TypeAbsence,
  TypeNote,
  TypePaiement,
  MethodePaiement,
  Utilisateur,
} from '@/shared/types'

export type ObjetSql = Record<string, unknown>

function texte(valeur: unknown, fallback = '') {
  return typeof valeur === 'string' ? valeur : fallback
}

function nombre(valeur: unknown, fallback = 0) {
  return typeof valeur === 'number' ? valeur : Number(valeur ?? fallback)
}

function booleen(valeur: unknown, fallback = false) {
  return typeof valeur === 'boolean' ? valeur : fallback
}

export function nettoyerColonnes(colonnes: ObjetSql) {
  return Object.fromEntries(Object.entries(colonnes).filter(([, valeur]) => valeur !== undefined))
}

export function mapperUtilisateur(row: ObjetSql): Utilisateur {
  return {
    id: texte(row.id),
    email: texte(row.email),
    nom: texte(row.nom, 'Utilisateur'),
    prenom: texte(row.prenom),
    role: texte(row.role, 'secretaire') as RoleUtilisateur,
    photoUrl: texte(row.photo_url) || undefined,
    telephone: texte(row.telephone) || undefined,
    actif: booleen(row.actif, true),
    creeLe: texte(row.cree_le),
    misAJourLe: texte(row.mis_a_jour_le),
  }
}

export function mapperAnneeScolaire(row: ObjetSql): AnneeScolaire {
  return {
    id: texte(row.id),
    libelle: texte(row.libelle),
    dateDebut: texte(row.date_debut),
    dateFin: texte(row.date_fin),
    active: booleen(row.active),
    creeLe: texte(row.cree_le),
  }
}

export function mapperClasse(row: ObjetSql): Classe {
  const enseignant = row.enseignant_principal as ObjetSql | undefined

  return {
    id: texte(row.id),
    nom: texte(row.nom),
    niveau: texte(row.niveau),
    salle: texte(row.salle),
    capaciteMax: nombre(row.capacite_max, 40),
    enseignantPrincipalId: texte(row.enseignant_principal_id) || undefined,
    enseignantPrincipal: enseignant ? mapperEnseignant(enseignant) : undefined,
    anneeScolaireId: texte(row.annee_scolaire_id),
    effectif: Array.isArray(row.eleves) ? nombre((row.eleves[0] as ObjetSql | undefined)?.count) : undefined,
    creeLe: texte(row.cree_le),
    misAJourLe: texte(row.mis_a_jour_le),
    supprimeLe: texte(row.supprime_le) || undefined,
  }
}

export function colonnesClasse(donnees: Partial<Classe>) {
  return nettoyerColonnes({
    nom: donnees.nom,
    niveau: donnees.niveau,
    salle: donnees.salle,
    capacite_max: donnees.capaciteMax,
    enseignant_principal_id: donnees.enseignantPrincipalId,
    annee_scolaire_id: donnees.anneeScolaireId,
    cree_le: donnees.creeLe,
    mis_a_jour_le: donnees.misAJourLe,
  })
}

export function mapperEnseignant(row: ObjetSql): Enseignant {
  return {
    id: texte(row.id),
    nom: texte(row.nom),
    prenom: texte(row.prenom),
    email: texte(row.email),
    telephone: texte(row.telephone),
    adresse: texte(row.adresse) || undefined,
    photoUrl: texte(row.photo_url) || undefined,
    specialite: texte(row.specialite),
    dateEmbauche: texte(row.date_embauche),
    statut: texte(row.statut, 'actif') as StatutEnseignantType,
    matieres: Array.isArray(row.matieres) ? (row.matieres as string[]) : undefined,
    creeLe: texte(row.cree_le),
    misAJourLe: texte(row.mis_a_jour_le),
    supprimeLe: texte(row.supprime_le) || undefined,
  }
}

export function colonnesEnseignant(donnees: Partial<Enseignant>) {
  return nettoyerColonnes({
    nom: donnees.nom,
    prenom: donnees.prenom,
    email: donnees.email,
    telephone: donnees.telephone,
    adresse: donnees.adresse,
    photo_url: donnees.photoUrl,
    specialite: donnees.specialite,
    date_embauche: donnees.dateEmbauche,
    statut: donnees.statut,
    cree_le: donnees.creeLe,
    mis_a_jour_le: donnees.misAJourLe,
  })
}

export function mapperEleve(row: ObjetSql): Eleve {
  const classe = row.classe as ObjetSql | undefined

  return {
    id: texte(row.id),
    matricule: texte(row.matricule),
    nom: texte(row.nom),
    prenom: texte(row.prenom),
    dateNaissance: texte(row.date_naissance),
    lieuNaissance: texte(row.lieu_naissance),
    sexe: texte(row.sexe, 'M') as 'M' | 'F',
    email: texte(row.email) || undefined,
    telephone: texte(row.telephone) || undefined,
    adresse: texte(row.adresse),
    photoUrl: texte(row.photo_url) || undefined,
    tuteurNom: texte(row.tuteur_nom),
    tuteurTelephone: texte(row.tuteur_telephone),
    tuteurEmail: texte(row.tuteur_email) || undefined,
    tuteurRelation: texte(row.tuteur_relation),
    classeId: texte(row.classe_id),
    classe: classe ? mapperClasse(classe) : undefined,
    anneeScolaireId: texte(row.annee_scolaire_id),
    statut: texte(row.statut, 'actif') as StatutEleveType,
    statutPaiement: texte(row.statut_paiement, 'en_attente') as StatutPaiementType,
    creeLe: texte(row.cree_le),
    misAJourLe: texte(row.mis_a_jour_le),
    supprimeLe: texte(row.supprime_le) || undefined,
  }
}

export function colonnesEleve(donnees: Partial<Eleve>) {
  return nettoyerColonnes({
    matricule: donnees.matricule,
    nom: donnees.nom,
    prenom: donnees.prenom,
    date_naissance: donnees.dateNaissance,
    lieu_naissance: donnees.lieuNaissance,
    sexe: donnees.sexe,
    email: donnees.email,
    telephone: donnees.telephone,
    adresse: donnees.adresse,
    photo_url: donnees.photoUrl,
    classe_id: donnees.classeId,
    annee_scolaire_id: donnees.anneeScolaireId,
    statut: donnees.statut,
    statut_paiement: donnees.statutPaiement,
    tuteur_nom: donnees.tuteurNom,
    tuteur_telephone: donnees.tuteurTelephone,
    tuteur_email: donnees.tuteurEmail,
    tuteur_relation: donnees.tuteurRelation,
    cree_le: donnees.creeLe,
    mis_a_jour_le: donnees.misAJourLe,
  })
}

export function mapperPaiement(row: ObjetSql): Paiement {
  const eleve = row.eleve as ObjetSql | undefined

  return {
    id: texte(row.id),
    eleveId: texte(row.eleve_id),
    eleve: eleve
      ? {
          id: texte(eleve.id),
          nom: texte(eleve.nom),
          prenom: texte(eleve.prenom),
          matricule: texte(eleve.matricule),
          classeId: texte(eleve.classe_id),
        }
      : undefined,
    montant: nombre(row.montant),
    datePaiement: texte(row.date_paiement || row.date),
    methode: texte(row.methode, 'especes') as MethodePaiement,
    type: texte(row.type, 'scolarite') as TypePaiement,
    statut: texte(row.statut, 'en_attente') as StatutPaiement,
    reference: texte(row.reference),
    description: texte(row.description || row.notes) || undefined,
    recuUrl: texte(row.recu_url) || undefined,
    anneeScolaireId: texte(row.annee_scolaire_id),
    creeLe: texte(row.cree_le),
    misAJourLe: texte(row.mis_a_jour_le || row.cree_le),
    supprimeLe: texte(row.supprime_le) || undefined,
  }
}

export function colonnesPaiement(donnees: Partial<Paiement>) {
  return nettoyerColonnes({
    eleve_id: donnees.eleveId,
    montant: donnees.montant,
    date_paiement: donnees.datePaiement,
    methode: donnees.methode,
    type: donnees.type,
    statut: donnees.statut,
    reference: donnees.reference,
    description: donnees.description,
    recu_url: donnees.recuUrl,
    annee_scolaire_id: donnees.anneeScolaireId,
    cree_le: donnees.creeLe,
    mis_a_jour_le: donnees.misAJourLe,
  })
}

export function mapperNote(row: ObjetSql): Note {
  const trimestreTexte = texte(row.trimestre, '1').replace('T', '')

  return {
    id: texte(row.id),
    eleveId: texte(row.eleve_id),
    eleve: undefined,
    matiere: texte(row.matiere),
    type: texte(row.type, 'devoir') as TypeNote,
    valeur: nombre(row.valeur),
    bareme: nombre(row.bareme, 20),
    coefficient: nombre(row.coefficient, 1),
    commentaire: texte(row.commentaire) || undefined,
    dateEvaluation: texte(row.date_evaluation || row.date),
    trimestre: Number(trimestreTexte || 1) as 1 | 2 | 3,
    anneeScolaireId: texte(row.annee_scolaire_id),
    enseignantId: texte(row.enseignant_id),
    creeLe: texte(row.cree_le),
    misAJourLe: texte(row.mis_a_jour_le),
    supprimeLe: texte(row.supprime_le) || undefined,
  }
}

export function colonnesNote(donnees: Partial<Note>) {
  return nettoyerColonnes({
    eleve_id: donnees.eleveId,
    enseignant_id: donnees.enseignantId,
    matiere: donnees.matiere,
    type: donnees.type,
    valeur: donnees.valeur,
    bareme: donnees.bareme,
    coefficient: donnees.coefficient,
    commentaire: donnees.commentaire,
    date_evaluation: donnees.dateEvaluation,
    trimestre: donnees.trimestre,
    annee_scolaire_id: donnees.anneeScolaireId,
    cree_le: donnees.creeLe,
    mis_a_jour_le: donnees.misAJourLe,
  })
}

export function mapperAbsence(row: ObjetSql): Absence {
  return {
    id: texte(row.id),
    eleveId: texte(row.eleve_id),
    type: texte(row.type, 'absence') as TypeAbsence,
    date: texte(row.date),
    heureDebut: texte(row.heure_debut) || undefined,
    heureFin: texte(row.heure_fin) || undefined,
    matiere: texte(row.matiere) || undefined,
    justification: texte(row.justification || row.motif) || undefined,
    statut: texte(row.statut, 'non_justifiee') as StatutAbsence,
    enseignantId: texte(row.enseignant_id) || undefined,
    creeLe: texte(row.cree_le),
    misAJourLe: texte(row.mis_a_jour_le),
    supprimeLe: texte(row.supprime_le) || undefined,
  }
}

export function colonnesAbsence(donnees: Partial<Absence>) {
  return nettoyerColonnes({
    eleve_id: donnees.eleveId,
    type: donnees.type,
    date: donnees.date,
    heure_debut: donnees.heureDebut,
    heure_fin: donnees.heureFin,
    matiere: donnees.matiere,
    justification: donnees.justification,
    statut: donnees.statut,
    enseignant_id: donnees.enseignantId,
    cree_le: donnees.creeLe,
    mis_a_jour_le: donnees.misAJourLe,
  })
}
