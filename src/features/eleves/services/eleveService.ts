import { creerIdentifiant, ecrireCollectionLocale, lireCollectionLocale } from '@/infrastructure/storage/stockageLocal'
import { supabase, supabaseEstConfigure } from '@/infrastructure/supabase/client'
import { CLASSES_MOCK, ELEVES_MOCK, ABSENCES_MOCK, NOTES_MOCK, PAIEMENTS_MOCK } from '@/shared/lib/donnees-mock'
import { leverErreurService } from '@/shared/lib/erreurs'
import { colonnesEleve, mapperAbsence, mapperEleve, mapperNote, mapperPaiement } from '@/shared/lib/mappers'
import type { Eleve, EleveAvecDetails, FiltresEleve, FormulaireEleve } from '@/shared/types'

const CLE_ELEVES = 'akwaba.eleves'
type LigneSql = Record<string, unknown>

interface PaginationRequete {
  page: number
  parPage: number
}

function elevesLocaux() {
  return lireCollectionLocale(CLE_ELEVES, ELEVES_MOCK)
}

function sauvegarderElevesLocaux(eleves: Eleve[]) {
  ecrireCollectionLocale(CLE_ELEVES, eleves)
}

function appliquerFiltres(eleves: Eleve[], filtres: FiltresEleve) {
  return eleves.filter((eleve) => {
    const terme = filtres.recherche?.toLowerCase().trim()
    const rechercheOk =
      !terme ||
      eleve.nom.toLowerCase().includes(terme) ||
      eleve.prenom.toLowerCase().includes(terme) ||
      eleve.matricule.toLowerCase().includes(terme) ||
      eleve.telephone?.toLowerCase().includes(terme)

    return (
      rechercheOk &&
      (!filtres.classeId || eleve.classeId === filtres.classeId) &&
      (!filtres.statut || eleve.statut === filtres.statut) &&
      (!filtres.statutPaiement || eleve.statutPaiement === filtres.statutPaiement)
    )
  })
}

export const eleveService = {
  async lister(filtres: FiltresEleve = {}, pagination: PaginationRequete = { page: 1, parPage: 100 }) {
    if (!supabaseEstConfigure()) {
      const resultats = appliquerFiltres(elevesLocaux(), filtres)
      const debut = (pagination.page - 1) * pagination.parPage
      return { eleves: resultats.slice(debut, debut + pagination.parPage), total: resultats.length }
    }

    try {
      let requete = supabase
        .from('eleves')
        .select(
          '*, classe:classes(id, nom, niveau, salle, capacite_max, enseignant_principal_id, annee_scolaire_id, cree_le, mis_a_jour_le)',
          { count: 'exact' }
        )
        .is('supprime_le', null)
        .order('nom', { ascending: true })

      if (filtres.recherche) {
        requete = requete.or(
          `nom.ilike.%${filtres.recherche}%,prenom.ilike.%${filtres.recherche}%,matricule.ilike.%${filtres.recherche}%`
        )
      }
      if (filtres.classeId) requete = requete.eq('classe_id', filtres.classeId)
      if (filtres.statut) requete = requete.eq('statut', filtres.statut)
      if (filtres.statutPaiement) requete = requete.eq('statut_paiement', filtres.statutPaiement)

      const debut = (pagination.page - 1) * pagination.parPage
      const { data, error, count } = await requete.range(debut, debut + pagination.parPage - 1)
      if (error) throw error

      return { eleves: (data ?? []).map((ligne) => mapperEleve(ligne)), total: count ?? 0 }
    } catch (error) {
      leverErreurService(error, 'Impossible de charger les élèves')
    }
  },

  async obtenirParId(id: string): Promise<EleveAvecDetails | null> {
    if (!supabaseEstConfigure()) {
      const eleve = elevesLocaux().find((item) => item.id === id)
      if (!eleve) return null
      return {
        ...eleve,
        classe: CLASSES_MOCK.find((classe) => classe.id === eleve.classeId),
        paiements: lireCollectionLocale('akwaba.paiements', PAIEMENTS_MOCK).filter(
          (paiement) => paiement.eleveId === id
        ),
        notes: lireCollectionLocale('akwaba.notes', NOTES_MOCK).filter((note) => note.eleveId === id),
        absences: lireCollectionLocale('akwaba.absences', ABSENCES_MOCK).filter((absence) => absence.eleveId === id),
      }
    }

    try {
      const { data, error } = await supabase
        .from('eleves')
        .select(
          `
          *,
          classe:classes(id, nom, niveau, salle, capacite_max, enseignant_principal_id, annee_scolaire_id, cree_le, mis_a_jour_le),
          paiements(*),
          notes(*),
          absences(*)
        `
        )
        .is('supprime_le', null)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) return null

      return {
        ...mapperEleve(data),
        paiements: Array.isArray(data.paiements)
          ? (data.paiements as LigneSql[]).map((ligne) => mapperPaiement(ligne))
          : [],
        notes: Array.isArray(data.notes) ? (data.notes as LigneSql[]).map((ligne) => mapperNote(ligne)) : [],
        absences: Array.isArray(data.absences)
          ? (data.absences as LigneSql[]).map((ligne) => mapperAbsence(ligne))
          : [],
      }
    } catch (error) {
      leverErreurService(error, 'Impossible de charger la fiche élève')
    }
  },

  async creer(donnees: FormulaireEleve) {
    if (!supabaseEstConfigure()) {
      const maintenant = new Date().toISOString()
      const eleve: Eleve = {
        ...donnees,
        id: creerIdentifiant('elv'),
        matricule: `AKW-${new Date().getFullYear()}-${String(elevesLocaux().length + 1).padStart(3, '0')}`,
        creeLe: maintenant,
        misAJourLe: maintenant,
      }
      const eleves = [eleve, ...elevesLocaux()]
      sauvegarderElevesLocaux(eleves)
      return eleve
    }

    try {
      const { data, error } = await supabase.from('eleves').insert(colonnesEleve(donnees)).select().single()
      if (error) throw error
      return mapperEleve(data)
    } catch (error) {
      leverErreurService(error, "Impossible de créer l'élève")
    }
  },

  async modifier(id: string, donnees: Partial<Eleve>) {
    if (!supabaseEstConfigure()) {
      const eleves = elevesLocaux().map((eleve) =>
        eleve.id === id ? { ...eleve, ...donnees, misAJourLe: new Date().toISOString() } : eleve
      )
      sauvegarderElevesLocaux(eleves)
      const eleve = eleves.find((item) => item.id === id)
      if (!eleve) throw new Error('Élève introuvable.')
      return eleve
    }

    try {
      const { data, error } = await supabase
        .from('eleves')
        .update(colonnesEleve({ ...donnees, misAJourLe: new Date().toISOString() }))
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return mapperEleve(data)
    } catch (error) {
      leverErreurService(error, "Impossible de modifier l'élève")
    }
  },

  async supprimer(id: string) {
    if (!supabaseEstConfigure()) {
      sauvegarderElevesLocaux(elevesLocaux().filter((eleve) => eleve.id !== id))
      return
    }

    try {
      const { error } = await supabase
        .from('eleves')
        .update({ supprime_le: new Date().toISOString(), mis_a_jour_le: new Date().toISOString() })
        .eq('id', id)
        .is('supprime_le', null)
      if (error) throw error
    } catch (error) {
      leverErreurService(error, "Impossible de supprimer l'élève")
    }
  },
}
