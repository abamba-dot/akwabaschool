// ============================================================
// FACTORY CRUD — Génère les opérations CRUD + fallback localStorage
// ============================================================

import { creerIdentifiant, ecrireCollectionLocale, lireCollectionLocale } from '@/infrastructure/storage/stockageLocal'
import { supabase, supabaseEstConfigure } from '@/infrastructure/supabase/client'
import { leverErreurService } from '@/shared/lib/erreurs'
import type { ObjetSql } from '@/shared/lib/mappers'

interface ConfigServiceCRUD<T, F> {
  /** Clé localStorage */
  cleLocal: string
  /** Données initiales (mocks) */
  initiales: T[]
  /** Nom de la table Supabase */
  tableSupabase: string
  /** Mapper snake_case → camelCase */
  mapper: (row: ObjetSql) => T
  /** Mapper camelCase → snake_case (pour insert/update) */
  colonnes: (donnees: Partial<T>) => ObjetSql
  /** Préfixe pour la génération d'ID local */
  prefixeId: string
  /** Messages d'erreur par opération */
  messages: {
    lister: string
    creer: string
    modifier: string
    supprimer: string
    introuvable?: string
  }
  /** Colonne de tri par défaut (optionnel) */
  ordreParDefaut?: { colonne: string; asc: boolean }
}

export function creerServiceCRUD<T extends { id: string; creeLe: string; misAJourLe: string }, F>(
  config: ConfigServiceCRUD<T, F>
) {
  const { cleLocal, initiales, tableSupabase, mapper, colonnes, prefixeId, messages, ordreParDefaut } = config

  function collectionLocale() {
    return lireCollectionLocale<T>(cleLocal, initiales)
  }

  function sauvegarderLocale(donnees: T[]) {
    ecrireCollectionLocale(cleLocal, donnees)
  }

  return {
    /** Liste simple (select * + order) */
    async lister() {
      if (!supabaseEstConfigure()) return collectionLocale()

      try {
        let requete = supabase.from(tableSupabase).select('*').is('supprime_le', null)
        if (ordreParDefaut) {
          requete = requete.order(ordreParDefaut.colonne, { ascending: ordreParDefaut.asc })
        }
        requete = requete.limit(100)
        const { data, error } = await requete
        if (error) throw error
        return (data ?? []).map((ligne) => mapper(ligne as ObjetSql))
      } catch (error) {
        leverErreurService(error, messages.lister)
      }
    },

    /** Création avec timestamps auto */
    async creer(donnees: F) {
      const maintenant = new Date().toISOString()
      if (!supabaseEstConfigure()) {
        const item = { ...donnees, id: creerIdentifiant(prefixeId), creeLe: maintenant, misAJourLe: maintenant } as unknown as T
        sauvegarderLocale([item, ...collectionLocale()])
        return item
      }

      try {
        const { data, error } = await supabase
          .from(tableSupabase)
          .insert(colonnes({ ...(donnees as unknown as Partial<T>), creeLe: maintenant, misAJourLe: maintenant }))
          .select()
          .single()
        if (error) throw error
        return mapper(data as ObjetSql)
      } catch (error) {
        leverErreurService(error, messages.creer)
      }
    },

    /** Modification partielle avec timestamp misAJourLe */
    async modifier(id: string, donnees: Partial<T>) {
      if (!supabaseEstConfigure()) {
        const items = collectionLocale().map((item) =>
          item.id === id ? { ...item, ...donnees, misAJourLe: new Date().toISOString() } : item
        )
        sauvegarderLocale(items)
        const item = items.find((i) => i.id === id)
        if (!item) throw new Error(messages.introuvable || messages.modifier)
        return item
      }

      try {
        const { data, error } = await supabase
          .from(tableSupabase)
          .update(colonnes({ ...donnees, misAJourLe: new Date().toISOString() }))
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return mapper(data as ObjetSql)
      } catch (error) {
        leverErreurService(error, messages.modifier)
      }
    },

    /** Suppression par ID */
    async supprimer(id: string) {
      if (!supabaseEstConfigure()) {
        const maintenant = new Date().toISOString()
        sauvegarderLocale(
          collectionLocale().map((item) => (item.id === id ? { ...item, supprimeLe: maintenant, misAJourLe: maintenant } : item))
        )
        return
      }

      try {
        const { error } = await supabase
          .from(tableSupabase)
          .update({ supprime_le: new Date().toISOString(), mis_a_jour_le: new Date().toISOString() })
          .eq('id', id)
          .is('supprime_le', null)
        if (error) throw error
      } catch (error) {
        leverErreurService(error, messages.supprimer)
      }
    },
  }
}
