'use client'

// ============================================================
// PAGE ABSENCES — Suivi des présences et absences
// ============================================================

import { CalendarX, Plus, Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'

import { Topbar } from '@/shared/components/layout/Topbar'
import { useAbsences } from '@/shared/hooks/useCollections'
import { useEleves } from '@/features/eleves/hooks/useEleves'
import { formaterDate, cn } from '@/shared/lib/utils'
import type { FormulaireAbsence, StatutAbsence, TypeAbsence } from '@/shared/types'

const STATUT_CONFIG: Record<StatutAbsence, { label: string; couleur: string; icone: React.ElementType }> = {
  justifiee: { label: 'Justifiée', couleur: 'badge-succes', icone: CheckCircle },
  non_justifiee: { label: 'Non justifiée', couleur: 'badge-erreur', icone: XCircle },
  en_attente: { label: 'En attente', couleur: 'badge-avertissement', icone: Clock },
}

const TYPE_LABELS: Record<string, string> = {
  absence: 'Absence',
  retard: 'Retard',
  exclusion: 'Exclusion',
}

export default function PageAbsences() {
  const { absences, chargement, erreur, creer, modifier } = useAbsences()
  const { eleves } = useEleves()
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState<StatutAbsence | ''>('')

  const elevesIndex = useMemo(() => Object.fromEntries(eleves.map((e) => [e.id, e])), [eleves])

  const absencesFiltrees = useMemo(() => {
    return absences.filter((a) => {
      const eleve = elevesIndex[a.eleveId]
      const ok = !recherche || (eleve && `${eleve.prenom} ${eleve.nom}`.toLowerCase().includes(recherche.toLowerCase()))
      const statutOk = !filtreStatut || a.statut === filtreStatut
      return ok && statutOk
    })
  }, [absences, recherche, filtreStatut, elevesIndex])

  // Stats
  const stats = useMemo(
    () => ({
      total: absences.length,
      justifiees: absences.filter((a) => a.statut === 'justifiee').length,
      nonJustifiees: absences.filter((a) => a.statut === 'non_justifiee').length,
      enAttente: absences.filter((a) => a.statut === 'en_attente').length,
      retards: absences.filter((a) => a.type === 'retard').length,
    }),
    [absences]
  )

  async function marquerStatut(absenceId: string, statut: StatutAbsence) {
    try {
      await modifier(absenceId, {
        statut,
        justification: statut === 'justifiee' ? "Justifiée par l'administration" : undefined,
      })
      toast.success('Statut mis à jour !')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Mise à jour impossible.')
    }
  }

  async function marquerAbsence() {
    if (eleves.length === 0) {
      toast.error("Ajoutez d'abord un élève.")
      return
    }

    const eleveId = window.prompt("ID de l'élève", eleves[0].id)
    if (!eleveId) return
    const typeTexte = window.prompt('Type : absence, retard ou exclusion', 'absence') as TypeAbsence | null
    if (!typeTexte || !['absence', 'retard', 'exclusion'].includes(typeTexte)) {
      toast.error("Type d'absence invalide.")
      return
    }

    const absence: FormulaireAbsence = {
      eleveId,
      type: typeTexte,
      date: new Date().toISOString().split('T')[0],
      statut: 'en_attente',
      matiere: window.prompt('Matière concernée (optionnel)', '') || undefined,
      enseignantId: 'ens-1',
    }

    try {
      await creer(absence)
      toast.success('Absence enregistrée.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Enregistrement impossible.')
    }
  }

  return (
    <div className="flex flex-col">
      <Topbar
        titre="Absences"
        sousTitre="Suivi des présences"
        actions={
          <button onClick={marquerAbsence} className="btn-principal text-xs">
            <Plus className="h-3.5 w-3.5" />
            Marquer absence
          </button>
        }
      />

      <div className="space-y-5 p-6">
        {/* Résumé stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'Total', valeur: stats.total, classe: 'text-akwaba-texte' },
            { label: 'Justifiées', valeur: stats.justifiees, classe: 'text-akwaba-vert' },
            { label: 'Non justifiées', valeur: stats.nonJustifiees, classe: 'text-akwaba-rouge' },
            { label: 'En attente', valeur: stats.enAttente, classe: 'text-akwaba-orange' },
            { label: 'Retards', valeur: stats.retards, classe: 'text-akwaba-bleu' },
          ].map((s) => (
            <div key={s.label} className="carte-principale py-4 text-center">
              <p className={`text-2xl font-bold ${s.classe}`}>{s.valeur}</p>
              <p className="mt-1 text-xs text-akwaba-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-akwaba-muted" />
            <input
              type="text"
              placeholder="Rechercher un élève…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="champ-saisie pl-9"
            />
          </div>
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value as StatutAbsence | '')}
            className="champ-saisie w-auto text-xs"
          >
            <option value="">Tous les statuts</option>
            <option value="justifiee">Justifiée</option>
            <option value="non_justifiee">Non justifiée</option>
            <option value="en_attente">En attente</option>
          </select>
        </div>

        {/* Tableau absences */}
        <div className="carte-principale overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Tableau des absences">
              <thead>
                <tr className="border-b border-akwaba-bordure bg-akwaba-surface/50">
                  {['Élève', 'Type', 'Date', 'Matière', 'Statut', 'Justification', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-akwaba-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-akwaba-bordure">
                {chargement ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-akwaba-muted">
                      Chargement des absences...
                    </td>
                  </tr>
                ) : absencesFiltrees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <CalendarX className="mx-auto mb-3 h-10 w-10 text-akwaba-muted opacity-30" />
                      <p className="text-sm text-akwaba-muted">{erreur ?? 'Aucune absence trouvée'}</p>
                    </td>
                  </tr>
                ) : (
                  absencesFiltrees.map((absence) => {
                    const eleve = elevesIndex[absence.eleveId]
                    const cfg = STATUT_CONFIG[absence.statut]
                    const Icone = cfg.icone

                    return (
                      <tr key={absence.id} className="ligne-tableau">
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-akwaba-texte">
                            {eleve ? `${eleve.prenom} ${eleve.nom}` : '—'}
                          </p>
                          <p className="text-xs text-akwaba-muted">{eleve?.matricule}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'rounded-full border px-2 py-0.5 text-xs font-medium',
                              absence.type === 'absence' &&
                                'border-akwaba-rouge/20 bg-akwaba-rouge/10 text-akwaba-rouge',
                              absence.type === 'retard' &&
                                'border-akwaba-orange/20 bg-akwaba-orange/10 text-akwaba-orange',
                              absence.type === 'exclusion' &&
                                'border-akwaba-violet/20 bg-akwaba-violet/10 text-akwaba-violet'
                            )}
                          >
                            {TYPE_LABELS[absence.type]}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-akwaba-muted">
                          {formaterDate(absence.date)}
                        </td>
                        <td className="px-4 py-3 text-xs text-akwaba-muted">{absence.matiere || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={cn('flex w-fit items-center gap-1.5', cfg.couleur)}>
                            <Icone className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="max-w-[180px] px-4 py-3 text-xs text-akwaba-muted">
                          <p className="truncate">{absence.justification || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          {absence.statut === 'en_attente' && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => marquerStatut(absence.id, 'justifiee')}
                                className="flex items-center gap-1 rounded-lg border border-akwaba-vert/20 bg-akwaba-vert/10 px-2 py-1 text-xs text-akwaba-vert transition-all hover:bg-akwaba-vert/20"
                              >
                                <CheckCircle className="h-3 w-3" /> Justifier
                              </button>
                              <button
                                onClick={() => marquerStatut(absence.id, 'non_justifiee')}
                                className="flex items-center gap-1 rounded-lg border border-akwaba-rouge/20 bg-akwaba-rouge/10 px-2 py-1 text-xs text-akwaba-rouge transition-all hover:bg-akwaba-rouge/20"
                              >
                                <XCircle className="h-3 w-3" /> Refuser
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
