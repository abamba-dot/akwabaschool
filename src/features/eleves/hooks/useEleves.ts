'use client'

import { useCallback, useEffect, useState } from 'react'

import { eleveService } from '@/features/eleves/services/eleveService'
import { messageErreur } from '@/shared/lib/erreurs'
import type { Eleve, FiltresEleve, FormulaireEleve } from '@/shared/types'

export function useEleves(filtresInitiaux: FiltresEleve = {}) {
  const [eleves, setEleves] = useState<Eleve[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [filtres, setFiltres] = useState<FiltresEleve>(filtresInitiaux)

  const charger = useCallback(async () => {
    setChargement(true)
    setErreur(null)
    try {
      const resultat = await eleveService.lister(filtres, { page: 1, parPage: 100 })
      setEleves(resultat.eleves)
      setTotal(resultat.total)
    } catch (error) {
      setErreur(messageErreur(error, 'Erreur lors du chargement des élèves.'))
    } finally {
      setChargement(false)
    }
  }, [filtres])

  useEffect(() => {
    charger()
  }, [charger])

  const ajouterEleve = useCallback(
    async (donnees: FormulaireEleve) => {
      const eleve = await eleveService.creer(donnees)
      await charger()
      return eleve
    },
    [charger]
  )

  const modifierEleve = useCallback(
    async (id: string, donnees: Partial<Eleve>) => {
      const eleve = await eleveService.modifier(id, donnees)
      await charger()
      return eleve
    },
    [charger]
  )

  const supprimerEleve = useCallback(
    async (id: string) => {
      await eleveService.supprimer(id)
      await charger()
    },
    [charger]
  )

  return {
    eleves,
    chargement,
    erreur,
    total,
    filtres,
    setFiltres,
    rafraichir: charger,
    ajouterEleve,
    modifierEleve,
    supprimerEleve,
  }
}
