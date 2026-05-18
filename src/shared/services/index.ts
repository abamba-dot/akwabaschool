import { creerIdentifiant, ecrireCollectionLocale, lireCollectionLocale } from '@/infrastructure/storage/stockageLocal'
import { supabase, supabaseEstConfigure } from '@/infrastructure/supabase/client'
import {
  ABSENCES_MOCK,
  CLASSES_MOCK,
  ENSEIGNANTS_MOCK,
  NOTES_MOCK,
  PAIEMENTS_MOCK,
  ELEVES_MOCK,
} from '@/shared/lib/donnees-mock'
import { leverErreurService } from '@/shared/lib/erreurs'
import { creerServiceCRUD } from '@/shared/lib/factory'
import {
  colonnesAbsence,
  colonnesClasse,
  colonnesEnseignant,
  colonnesNote,
  mapperAbsence,
  mapperClasse,
  mapperEnseignant,
  mapperNote,
} from '@/shared/lib/mappers'
import type {
  Absence,
  Classe,
  Enseignant,
  FormulaireAbsence,
  FormulaireClasse,
  FormulaireEnseignant,
  FormulaireNote,
  Note,
  StatsDashboard,
} from '@/shared/types'

const CLE_CLASSES = 'akwaba.classes'
const CLE_ENSEIGNANTS = 'akwaba.enseignants'
const CLE_NOTES = 'akwaba.notes'
const CLE_ABSENCES = 'akwaba.absences'

function collectionLocale<T>(cle: string, initiales: T[]) {
  return lireCollectionLocale(cle, initiales)
}

function sauvegarderLocale<T>(cle: string, donnees: T[]) {
  ecrireCollectionLocale(cle, donnees)
}

// ─── Services générés via factory CRUD ───────────────────────

const enseignantCRUD = creerServiceCRUD<Enseignant, FormulaireEnseignant>({
  cleLocal: CLE_ENSEIGNANTS,
  initiales: ENSEIGNANTS_MOCK,
  tableSupabase: 'enseignants',
  mapper: mapperEnseignant,
  colonnes: colonnesEnseignant,
  prefixeId: 'ens',
  messages: {
    lister: 'Impossible de charger les enseignants',
    creer: "Impossible de créer l'enseignant",
    modifier: "Impossible de modifier l'enseignant",
    supprimer: "Impossible de supprimer l'enseignant",
    introuvable: 'Enseignant introuvable.',
  },
  ordreParDefaut: { colonne: 'nom', asc: true },
})

export const enseignantService = enseignantCRUD

const classeCRUD = creerServiceCRUD<Classe, FormulaireClasse>({
  cleLocal: CLE_CLASSES,
  initiales: CLASSES_MOCK,
  tableSupabase: 'classes',
  mapper: mapperClasse,
  colonnes: colonnesClasse,
  prefixeId: 'cl',
  messages: {
    lister: 'Impossible de charger les classes',
    creer: 'Impossible de créer la classe',
    modifier: 'Impossible de modifier la classe',
    supprimer: 'Impossible de supprimer la classe',
    introuvable: 'Classe introuvable.',
  },
  ordreParDefaut: { colonne: 'niveau', asc: true },
})

export const classeService = {
  async lister() {
    if (!supabaseEstConfigure()) {
      const eleves = collectionLocale('akwaba.eleves', ELEVES_MOCK)
      return collectionLocale(CLE_CLASSES, CLASSES_MOCK).map((classe) => ({
        ...classe,
        effectif: eleves.filter((eleve) => eleve.classeId === classe.id && eleve.statut === 'actif').length,
      }))
    }

    try {
      const { data, error } = await supabase
        .from('classes')
        .select(
          '*, enseignant_principal:enseignants(id, nom, prenom, email, telephone, specialite, statut, date_embauche, cree_le, mis_a_jour_le), eleves(count)'
        )
        .is('supprime_le', null)
        .order('niveau')
      if (error) throw error
      return (data ?? []).map((ligne) => mapperClasse(ligne))
    } catch (error) {
      leverErreurService(error, 'Impossible de charger les classes')
    }
  },

  creer: classeCRUD.creer,
  modifier: classeCRUD.modifier,
  supprimer: classeCRUD.supprimer,
}

const noteCRUD = creerServiceCRUD<Note, FormulaireNote>({
  cleLocal: CLE_NOTES,
  initiales: NOTES_MOCK,
  tableSupabase: 'notes',
  mapper: mapperNote,
  colonnes: colonnesNote,
  prefixeId: 'note',
  messages: {
    lister: 'Impossible de charger les notes',
    creer: 'Impossible de créer la note',
    modifier: 'Impossible de modifier la note',
    supprimer: 'Impossible de supprimer la note',
    introuvable: 'Note introuvable.',
  },
  ordreParDefaut: { colonne: 'date_evaluation', asc: false },
})

export const noteService = {
  async lister(filtres: { eleveId?: string; matiere?: string; trimestre?: number } = {}) {
    if (!supabaseEstConfigure()) {
      return collectionLocale(CLE_NOTES, NOTES_MOCK).filter(
        (note) =>
          (!filtres.eleveId || note.eleveId === filtres.eleveId) &&
          (!filtres.matiere || note.matiere === filtres.matiere) &&
          (!filtres.trimestre || note.trimestre === filtres.trimestre)
      )
    }

    try {
      let requete = supabase.from('notes').select('*').is('supprime_le', null).order('date_evaluation', { ascending: false })
      if (filtres.eleveId) requete = requete.eq('eleve_id', filtres.eleveId)
      if (filtres.matiere) requete = requete.eq('matiere', filtres.matiere)
      if (filtres.trimestre) requete = requete.eq('trimestre', filtres.trimestre)
      requete = requete.limit(100)
      const { data, error } = await requete
      if (error) throw error
      return (data ?? []).map((ligne) => mapperNote(ligne))
    } catch (error) {
      leverErreurService(error, 'Impossible de charger les notes')
    }
  },

  listerParEleve: (eleveId: string) => noteService.lister({ eleveId }),

  creer: noteCRUD.creer,
  modifier: noteCRUD.modifier,
  supprimer: noteCRUD.supprimer,
}

const absenceCRUD = creerServiceCRUD<Absence, FormulaireAbsence>({
  cleLocal: CLE_ABSENCES,
  initiales: ABSENCES_MOCK,
  tableSupabase: 'absences',
  mapper: mapperAbsence,
  colonnes: colonnesAbsence,
  prefixeId: 'abs',
  messages: {
    lister: 'Impossible de charger les absences',
    creer: "Impossible de créer l'absence",
    modifier: "Impossible de modifier l'absence",
    supprimer: "Impossible de supprimer l'absence",
    introuvable: 'Absence introuvable.',
  },
  ordreParDefaut: { colonne: 'date', asc: false },
})

export const absenceService = {
  async lister(filtres: { eleveId?: string; date?: string; statut?: string } = {}) {
    if (!supabaseEstConfigure()) {
      return collectionLocale(CLE_ABSENCES, ABSENCES_MOCK).filter(
        (absence) =>
          (!filtres.eleveId || absence.eleveId === filtres.eleveId) &&
          (!filtres.date || absence.date === filtres.date) &&
          (!filtres.statut || absence.statut === filtres.statut)
      )
    }

    try {
      let requete = supabase.from('absences').select('*').is('supprime_le', null).order('date', { ascending: false })
      if (filtres.eleveId) requete = requete.eq('eleve_id', filtres.eleveId)
      if (filtres.date) requete = requete.eq('date', filtres.date)
      if (filtres.statut) requete = requete.eq('statut', filtres.statut)
      requete = requete.limit(100)
      const { data, error } = await requete
      if (error) throw error
      return (data ?? []).map((ligne) => mapperAbsence(ligne))
    } catch (error) {
      leverErreurService(error, 'Impossible de charger les absences')
    }
  },

  justifier: (id: string, justification: string) => absenceService.modifier(id, { justification, statut: 'justifiee' }),

  creer: absenceCRUD.creer,
  modifier: absenceCRUD.modifier,
  supprimer: absenceCRUD.supprimer,
}

export const dashboardService = {
  async obtenirStats(): Promise<StatsDashboard> {
    if (!supabaseEstConfigure()) {
      const eleves = collectionLocale('akwaba.eleves', ELEVES_MOCK)
      const enseignants = collectionLocale(CLE_ENSEIGNANTS, ENSEIGNANTS_MOCK)
      const classes = collectionLocale(CLE_CLASSES, CLASSES_MOCK)
      const paiements = collectionLocale('akwaba.paiements', PAIEMENTS_MOCK)
      const absences = collectionLocale(CLE_ABSENCES, ABSENCES_MOCK)
      const totalPaye = paiements
        .filter((paiement) => paiement.statut === 'paye')
        .reduce((total, paiement) => total + paiement.montant, 0)

      return {
        totalEleves: eleves.length,
        totalEnseignants: enseignants.length,
        totalClasses: classes.length,
        paiementsMois: totalPaye,
        absencesJour: absences.length,
        tauxPaiement: eleves.length
          ? Math.round((eleves.filter((eleve) => eleve.statutPaiement === 'paye').length / eleves.length) * 1000) / 10
          : 0,
        evolutionPaiements: [{ mois: 'Actuel', montant: totalPaye }],
        repartitionClasses: classes.map((classe) => ({
          classe: classe.nom,
          effectif: eleves.filter((eleve) => eleve.classeId === classe.id).length,
        })),
      }
    }

    try {
      const [elevesRes, enseignantsRes, classesRes, paiementsRes, absencesRes] = await Promise.all([
        supabase.from('eleves').select('*, classe:classes(id)'),
        supabase.from('enseignants').select('*'),
        supabase.from('classes').select('*'),
        supabase.from('paiements').select('*'),
        supabase.from('absences').select('*'),
      ])

      if (elevesRes.error) throw elevesRes.error
      if (enseignantsRes.error) throw enseignantsRes.error
      if (classesRes.error) throw classesRes.error
      if (paiementsRes.error) throw paiementsRes.error
      if (absencesRes.error) throw absencesRes.error

      const eleves = elevesRes.data ?? []
      const enseignants = enseignantsRes.data ?? []
      const classes = classesRes.data ?? []
      const paiements = paiementsRes.data ?? []
      const absences = absencesRes.data ?? []

      const totalPaye = paiements.filter((p) => p.statut === 'paye').reduce((total, p) => total + (p.montant ?? 0), 0)

      return {
        totalEleves: eleves.length,
        totalEnseignants: enseignants.length,
        totalClasses: classes.length,
        paiementsMois: totalPaye,
        absencesJour: absences.length,
        tauxPaiement: eleves.length
          ? Math.round((eleves.filter((e) => e.statut_paiement === 'paye').length / eleves.length) * 1000) / 10
          : 0,
        evolutionPaiements: [{ mois: 'Actuel', montant: totalPaye }],
        repartitionClasses: classes.map((classe) => ({
          classe: classe.nom,
          effectif: eleves.filter((e) => e.classe_id === classe.id).length,
        })),
      }
    } catch (error) {
      leverErreurService(error, 'Impossible de charger les statistiques')
    }
  },
}
