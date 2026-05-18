'use client'

import { useCallback, useEffect, useState } from 'react'

import { absenceService, classeService, dashboardService, enseignantService, noteService } from '@/shared/services'
import { messageErreur } from '@/shared/lib/erreurs'
import { paiementService } from '@/features/paiements/services/paiementService'
import type {
  Absence,
  Classe,
  Enseignant,
  FormulaireAbsence,
  FormulaireClasse,
  FormulaireEnseignant,
  FormulaireNote,
  FormulairePaiement,
  Note,
  Paiement,
  StatsDashboard,
} from '@/shared/types'

function useChargement<T>(chargeur: () => Promise<T[]>) {
  const [donnees, setDonnees] = useState<T[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  const rafraichir = useCallback(async () => {
    setChargement(true)
    setErreur(null)
    try {
      setDonnees(await chargeur())
    } catch (error) {
      setErreur(messageErreur(error))
    } finally {
      setChargement(false)
    }
  }, [chargeur])

  useEffect(() => {
    rafraichir()
  }, [rafraichir])

  return { donnees, chargement, erreur, rafraichir, setErreur }
}

export function useClasses() {
  const chargeur = useCallback(() => classeService.lister(), [])
  const etat = useChargement<Classe>(chargeur)

  return {
    classes: etat.donnees,
    chargement: etat.chargement,
    erreur: etat.erreur,
    rafraichir: etat.rafraichir,
    creer: async (donnees: FormulaireClasse) => {
      try {
        const classe = await classeService.creer(donnees)
        await etat.rafraichir()
        return classe
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
    modifier: async (id: string, donnees: Partial<Classe>) => {
      try {
        const classe = await classeService.modifier(id, donnees)
        await etat.rafraichir()
        return classe
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
    supprimer: async (id: string) => {
      try {
        await classeService.supprimer(id)
        await etat.rafraichir()
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
  }
}

export function useEnseignants() {
  const chargeur = useCallback(() => enseignantService.lister(), [])
  const etat = useChargement<Enseignant>(chargeur)

  return {
    enseignants: etat.donnees,
    chargement: etat.chargement,
    erreur: etat.erreur,
    rafraichir: etat.rafraichir,
    creer: async (donnees: FormulaireEnseignant) => {
      try {
        const enseignant = await enseignantService.creer(donnees)
        await etat.rafraichir()
        return enseignant
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
    modifier: async (id: string, donnees: Partial<Enseignant>) => {
      try {
        const enseignant = await enseignantService.modifier(id, donnees)
        await etat.rafraichir()
        return enseignant
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
    supprimer: async (id: string) => {
      try {
        await enseignantService.supprimer(id)
        await etat.rafraichir()
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
  }
}

export function usePaiements() {
  const chargeur = useCallback(() => paiementService.lister(), [])
  const etat = useChargement<Paiement>(chargeur)

  return {
    paiements: etat.donnees,
    chargement: etat.chargement,
    erreur: etat.erreur,
    rafraichir: etat.rafraichir,
    creer: async (donnees: FormulairePaiement) => {
      try {
        const paiement = await paiementService.creer(donnees)
        await etat.rafraichir()
        return paiement
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
    modifier: async (id: string, donnees: Partial<Paiement>) => {
      try {
        const paiement = await paiementService.modifier(id, donnees)
        await etat.rafraichir()
        return paiement
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
    supprimer: async (id: string) => {
      try {
        await paiementService.supprimer(id)
        await etat.rafraichir()
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
  }
}

export function useNotes() {
  const chargeur = useCallback(() => noteService.lister(), [])
  const etat = useChargement<Note>(chargeur)

  return {
    notes: etat.donnees,
    chargement: etat.chargement,
    erreur: etat.erreur,
    rafraichir: etat.rafraichir,
    creer: async (donnees: FormulaireNote) => {
      try {
        const note = await noteService.creer(donnees)
        await etat.rafraichir()
        return note
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
    modifier: async (id: string, donnees: Partial<Note>) => {
      try {
        const note = await noteService.modifier(id, donnees)
        await etat.rafraichir()
        return note
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
    supprimer: async (id: string) => {
      try {
        await noteService.supprimer(id)
        await etat.rafraichir()
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
  }
}

export function useAbsences() {
  const chargeur = useCallback(() => absenceService.lister(), [])
  const etat = useChargement<Absence>(chargeur)

  return {
    absences: etat.donnees,
    chargement: etat.chargement,
    erreur: etat.erreur,
    rafraichir: etat.rafraichir,
    creer: async (donnees: FormulaireAbsence) => {
      try {
        const absence = await absenceService.creer(donnees)
        await etat.rafraichir()
        return absence
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
    modifier: async (id: string, donnees: Partial<Absence>) => {
      try {
        const absence = await absenceService.modifier(id, donnees)
        await etat.rafraichir()
        return absence
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
    supprimer: async (id: string) => {
      try {
        await absenceService.supprimer(id)
        await etat.rafraichir()
      } catch (error) {
        etat.setErreur(messageErreur(error))
        throw error
      }
    },
  }
}

export function useDashboard() {
  const [stats, setStats] = useState<StatsDashboard | null>(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  const rafraichir = useCallback(async () => {
    setChargement(true)
    setErreur(null)
    try {
      setStats(await dashboardService.obtenirStats())
    } catch (error) {
      setErreur(messageErreur(error))
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => {
    rafraichir()
  }, [rafraichir])

  return { stats, chargement, erreur, rafraichir }
}
