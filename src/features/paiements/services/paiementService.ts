import { creerIdentifiant, ecrireCollectionLocale, lireCollectionLocale } from '@/infrastructure/storage/stockageLocal'
import { supabase, supabaseEstConfigure } from '@/infrastructure/supabase/client'
import { PAIEMENTS_MOCK } from '@/shared/lib/donnees-mock'
import { leverErreurService } from '@/shared/lib/erreurs'
import { colonnesPaiement, mapperPaiement } from '@/shared/lib/mappers'
import type { FormulairePaiement, Paiement, StatutPaiement } from '@/shared/types'

const CLE_PAIEMENTS = 'akwaba.paiements'

function paiementsLocaux() {
  return lireCollectionLocale(CLE_PAIEMENTS, PAIEMENTS_MOCK)
}

function sauvegarderPaiementsLocaux(paiements: Paiement[]) {
  ecrireCollectionLocale(CLE_PAIEMENTS, paiements)
}

export const paiementService = {
  async lister(filtres: { eleveId?: string; statut?: StatutPaiement; type?: string; recherche?: string } = {}) {
    if (!supabaseEstConfigure()) {
      const terme = filtres.recherche?.toLowerCase().trim()
      return paiementsLocaux().filter((paiement) => {
        return (
          (!filtres.eleveId || paiement.eleveId === filtres.eleveId) &&
          (!filtres.statut || paiement.statut === filtres.statut) &&
          (!filtres.type || paiement.type === filtres.type) &&
          (!terme || paiement.reference.toLowerCase().includes(terme))
        )
      })
    }

    try {
      let requete = supabase
        .from('paiements')
        .select('*, eleve:eleves(id, nom, prenom, matricule, classe_id)')
        .is('supprime_le', null)
        .order('date_paiement', { ascending: false })

      if (filtres.eleveId) requete = requete.eq('eleve_id', filtres.eleveId)
      if (filtres.statut) requete = requete.eq('statut', filtres.statut)
      if (filtres.type) requete = requete.eq('type', filtres.type)

      requete = requete.limit(100)
      const { data, error } = await requete
      if (error) throw error
      return (data ?? []).map((ligne) => mapperPaiement(ligne))
    } catch (error) {
      leverErreurService(error, 'Impossible de charger les paiements')
    }
  },

  async creer(donnees: FormulairePaiement) {
    const maintenant = new Date().toISOString()

    if (!supabaseEstConfigure()) {
      const paiement: Paiement = {
        ...donnees,
        id: creerIdentifiant('pay'),
        reference: `REF-${new Date().getFullYear()}-${String(paiementsLocaux().length + 1).padStart(4, '0')}`,
        creeLe: maintenant,
        misAJourLe: maintenant,
      }
      sauvegarderPaiementsLocaux([paiement, ...paiementsLocaux()])
      return paiement
    }

    try {
      const { data, error } = await supabase
        .from('paiements')
        .insert(
          colonnesPaiement({
            ...donnees,
            reference: `REF-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
            creeLe: maintenant,
            misAJourLe: maintenant,
          })
        )
        .select()
        .single()

      if (error) throw error
      return mapperPaiement(data)
    } catch (error) {
      leverErreurService(error, "Impossible d'enregistrer le paiement")
    }
  },

  async modifier(id: string, donnees: Partial<Paiement>) {
    if (!supabaseEstConfigure()) {
      const paiements = paiementsLocaux().map((paiement) =>
        paiement.id === id ? { ...paiement, ...donnees, misAJourLe: new Date().toISOString() } : paiement
      )
      sauvegarderPaiementsLocaux(paiements)
      const paiement = paiements.find((item) => item.id === id)
      if (!paiement) throw new Error('Paiement introuvable.')
      return paiement
    }

    try {
      const { data, error } = await supabase
        .from('paiements')
        .update(colonnesPaiement({ ...donnees, misAJourLe: new Date().toISOString() }))
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return mapperPaiement(data)
    } catch (error) {
      leverErreurService(error, 'Impossible de modifier le paiement')
    }
  },

  async supprimer(id: string) {
    if (!supabaseEstConfigure()) {
      sauvegarderPaiementsLocaux(paiementsLocaux().filter((paiement) => paiement.id !== id))
      return
    }

    try {
      const { error } = await supabase
        .from('paiements')
        .update({ supprime_le: new Date().toISOString(), mis_a_jour_le: new Date().toISOString() })
        .eq('id', id)
        .is('supprime_le', null)
      if (error) throw error
    } catch (error) {
      leverErreurService(error, 'Impossible de supprimer le paiement')
    }
  },

  async obtenirStats() {
    const paiements = await this.lister()
    const totalEncaisse = paiements.filter((p) => p.statut === 'paye').reduce((sum, p) => sum + p.montant, 0)
    return { totalEncaisse, nombrePaiements: paiements.length }
  },
}
