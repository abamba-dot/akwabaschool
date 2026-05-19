'use client'

// ============================================================
// PAGE NOTES — Gestion des évaluations et bulletins
// ============================================================

import { ClipboardList, Plus, Search, Star, TrendingUp } from 'lucide-react'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'

import { useEleves } from '@/features/eleves/hooks/useEleves'
import { Topbar } from '@/shared/components/layout/Topbar'
import { useNotes } from '@/shared/hooks/useCollections'
import { ANNEE_SCOLAIRE_ACTIVE } from '@/shared/lib/donnees-mock'
import { calculerMoyenne, obtenirMention, formaterDate, cn } from '@/shared/lib/utils'
import type { FormulaireNote, Note, TypeNote } from '@/shared/types'

const TYPE_LABELS: Record<string, string> = {
  devoir: 'Devoir',
  examen: 'Examen',
  controle: 'Contrôle',
  tp: 'TP',
  projet: 'Projet',
}

export default function PageNotes() {
  const { notes, chargement, erreur, creer, supprimer } = useNotes()
  const { eleves } = useEleves()
  const [recherche, setRecherche] = useState('')
  const [filtreMatiere, setFiltreMatiere] = useState('')
  const [filtreTrimestre, setFiltreTrimestre] = useState<'' | '1' | '2' | '3'>('')

  // Toutes les matières disponibles
  const matieres = useMemo(() => [...new Set(notes.map((n) => n.matiere))].sort(), [notes])

  // Index élèves
  const elevesIndex = useMemo(() => Object.fromEntries(eleves.map((e) => [e.id, e])), [eleves])

  async function saisirNote() {
    if (eleves.length === 0) {
      toast.error("Ajoutez d'abord un élève.")
      return
    }

    const eleveId = window.prompt("ID de l'élève", eleves[0].id)
    if (!eleveId) return
    const matiere = window.prompt('Matière', 'Mathématiques')
    if (!matiere) return
    const valeurTexte = window.prompt('Note obtenue', '14')
    if (!valeurTexte) return
    const valeur = Number(valeurTexte.replace(',', '.'))
    if (!Number.isFinite(valeur)) {
      toast.error('La note doit être un nombre.')
      return
    }
    const trimestreTexte = window.prompt('Trimestre (1, 2 ou 3)', '1')
    const trimestre = Number(trimestreTexte) as 1 | 2 | 3
    if (![1, 2, 3].includes(trimestre)) {
      toast.error('Le trimestre doit être 1, 2 ou 3.')
      return
    }

    const note: FormulaireNote = {
      eleveId,
      matiere,
      type: 'devoir' as TypeNote,
      valeur,
      bareme: 20,
      coefficient: 1,
      dateEvaluation: new Date().toISOString().split('T')[0],
      trimestre,
      anneeScolaireId: ANNEE_SCOLAIRE_ACTIVE.id,
      enseignantId: 'ens-1',
    }

    try {
      await creer(note)
      toast.success('Note enregistrée.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Enregistrement impossible.')
    }
  }

  // Notes filtrées
  const notesFiltrees = useMemo(() => {
    return notes.filter((n) => {
      const eleve = elevesIndex[n.eleveId]
      const nomEleve = eleve ? `${eleve.prenom} ${eleve.nom}`.toLowerCase() : ''
      const rechercheOk =
        !recherche ||
        nomEleve.includes(recherche.toLowerCase()) ||
        n.matiere.toLowerCase().includes(recherche.toLowerCase())
      const matiereOk = !filtreMatiere || n.matiere === filtreMatiere
      const trimestreOk = !filtreTrimestre || n.trimestre === parseInt(filtreTrimestre)
      return rechercheOk && matiereOk && trimestreOk
    })
  }, [notes, recherche, filtreMatiere, filtreTrimestre, elevesIndex])

  // Moyennes par élève
  const moyennesParEleve = useMemo(() => {
    const groupes: Record<string, Note[]> = {}
    notesFiltrees.forEach((n) => {
      if (!groupes[n.eleveId]) groupes[n.eleveId] = []
      groupes[n.eleveId].push(n)
    })

    return Object.entries(groupes)
      .map(([eleveId, elevNotes]) => {
        const eleve = elevesIndex[eleveId]
        const moyenne = calculerMoyenne(elevNotes)
        const mention = obtenirMention(moyenne)
        return { eleve, moyenne, mention, nbNotes: elevNotes.length }
      })
      .sort((a, b) => b.moyenne - a.moyenne)
  }, [notesFiltrees, elevesIndex])

  return (
    <div className="flex flex-col">
      <Topbar
        titre="Notes"
        sousTitre="Évaluations et moyennes"
        actions={
          <button onClick={saisirNote} className="btn-principal text-xs">
            <Plus className="h-3.5 w-3.5" />
            Saisir des notes
          </button>
        }
      />

      <div className="space-y-5 p-6">
        {/* Filtres */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-akwaba-muted" />
            <input
              type="text"
              placeholder="Élève ou matière…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="champ-saisie pl-9"
            />
          </div>
          <select
            value={filtreMatiere}
            onChange={(e) => setFiltreMatiere(e.target.value)}
            className="champ-saisie w-auto text-xs"
          >
            <option value="">Toutes les matières</option>
            {matieres.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={filtreTrimestre}
            onChange={(e) => setFiltreTrimestre(e.target.value as '' | '1' | '2' | '3')}
            className="champ-saisie w-auto text-xs"
          >
            <option value="">Tous trimestres</option>
            <option value="1">Trimestre 1</option>
            <option value="2">Trimestre 2</option>
            <option value="3">Trimestre 3</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Tableau des notes */}
          <div className="lg:col-span-2">
            <div className="carte-principale overflow-hidden p-0">
              <div className="border-b border-akwaba-bordure px-4 py-3">
                <h2 className="text-sm font-semibold text-akwaba-texte">
                  Dernières évaluations ({notesFiltrees.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Tableau des notes">
                  <thead>
                    <tr className="border-b border-akwaba-bordure bg-akwaba-surface/50">
                      {['Élève', 'Matière', 'Type', 'Note', 'Trim.', 'Date'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-akwaba-muted">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-akwaba-bordure">
                    {chargement ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-akwaba-muted">
                          Chargement des notes...
                        </td>
                      </tr>
                    ) : notesFiltrees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-akwaba-muted">
                          <ClipboardList className="mx-auto mb-2 h-8 w-8 opacity-30" />
                          <p className="text-sm">Aucune note trouvée</p>
                        </td>
                      </tr>
                    ) : (
                      notesFiltrees.map((note) => {
                        const eleve = elevesIndex[note.eleveId]
                        const noteSur20 = (note.valeur / note.bareme) * 20
                        return (
                          <tr
                            key={note.id}
                            className="ligne-tableau"
                            onDoubleClick={async () => {
                              try {
                                await supprimer(note.id)
                                toast.success('Note supprimée.')
                              } catch (error) {
                                toast.error(error instanceof Error ? error.message : 'Suppression impossible.')
                              }
                            }}
                          >
                            <td className="px-4 py-2.5 text-xs font-medium text-akwaba-texte">
                              {eleve ? `${eleve.prenom} ${eleve.nom}` : '—'}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-akwaba-muted">{note.matiere}</td>
                            <td className="px-4 py-2.5">
                              <span className="rounded bg-akwaba-surface px-2 py-0.5 text-xs text-akwaba-muted">
                                {TYPE_LABELS[note.type] || note.type}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'text-sm font-bold',
                                    noteSur20 >= 14
                                      ? 'text-akwaba-vert'
                                      : noteSur20 >= 10
                                        ? 'text-akwaba-orange'
                                        : 'text-akwaba-rouge'
                                  )}
                                >
                                  {note.valeur}
                                </span>
                                <span className="text-xs text-akwaba-muted">/ {note.bareme}</span>
                                <span className="hidden text-xs text-akwaba-muted sm:inline">
                                  (coef. {note.coefficient})
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-xs text-akwaba-muted">T{note.trimestre}</td>
                            <td className="whitespace-nowrap px-4 py-2.5 text-xs text-akwaba-muted">
                              {formaterDate(note.dateEvaluation)}
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

          {/* Classement par moyenne */}
          <div className="carte-principale">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-akwaba-bleu" />
              <h2 className="text-sm font-semibold text-akwaba-texte">Classement</h2>
            </div>

            {moyennesParEleve.length === 0 ? (
              <p className="py-8 text-center text-xs text-akwaba-muted">{erreur ?? 'Aucun résultat'}</p>
            ) : (
              <div className="space-y-3">
                {moyennesParEleve.map((item, index) => {
                  const mention = obtenirMention(item.moyenne)
                  return (
                    <div key={item.eleve?.id || index} className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          index === 0
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : index === 1
                              ? 'bg-gray-400/20 text-gray-400'
                              : index === 2
                                ? 'bg-orange-600/20 text-orange-500'
                                : 'bg-akwaba-surface text-akwaba-muted'
                        )}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-akwaba-texte">
                          {item.eleve ? `${item.eleve.prenom} ${item.eleve.nom}` : '—'}
                        </p>
                        <p className="text-xs text-akwaba-muted">
                          {item.nbNotes} note{item.nbNotes > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p
                          className={cn(
                            'text-sm font-bold',
                            mention.couleur === 'vert'
                              ? 'text-akwaba-vert'
                              : mention.couleur === 'orange'
                                ? 'text-akwaba-orange'
                                : 'text-akwaba-rouge'
                          )}
                        >
                          {item.moyenne}/20
                        </p>
                        <p className="text-xs text-akwaba-muted">{mention.libelle}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
