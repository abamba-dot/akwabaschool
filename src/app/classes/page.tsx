'use client'

// ============================================================
// PAGE CLASSES — Gestion des classes et affectations
// ============================================================

import { BookOpen, Plus, Users, UserCog, MapPin, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Topbar } from '@/shared/components/layout/Topbar'
import { useClasses, useEnseignants } from '@/shared/hooks/useCollections'
import { useEleves } from '@/features/eleves/hooks/useEleves'
import { cn } from '@/shared/lib/utils'

const COULEURS_NIVEAU: Record<string, string> = {
  '6ème': 'bg-akwaba-bleu/10 text-akwaba-bleu border-akwaba-bleu/20',
  '5ème': 'bg-akwaba-violet/10 text-akwaba-violet border-akwaba-violet/20',
  '4ème': 'bg-akwaba-vert/10 text-akwaba-vert border-akwaba-vert/20',
  '3ème': 'bg-akwaba-orange/10 text-akwaba-orange border-akwaba-orange/20',
  '2nde': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  '1ère': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Terminale: 'bg-akwaba-rouge/10 text-akwaba-rouge border-akwaba-rouge/20',
}

export default function PageClasses() {
  const { classes, creer, modifier, supprimer } = useClasses()
  const { enseignants } = useEnseignants()
  const { eleves } = useEleves()

  function nomEnseignant(id?: string) {
    if (!id) return 'Non affecté'
    const ens = enseignants.find((e) => e.id === id)
    return ens ? `${ens.prenom} ${ens.nom}` : '—'
  }

  function effectifClasse(classeId: string) {
    return eleves.filter((e) => e.classeId === classeId && e.statut === 'actif').length
  }

  async function creerClasse() {
    const nom = window.prompt('Nom de la classe')
    if (!nom) return
    const niveau = window.prompt('Niveau', nom.split(' ')[0] || '6ème') || '6ème'
    const salle = window.prompt('Salle', '101') || '101'
    try {
      await creer({ nom, niveau, salle, capaciteMax: 40, anneeScolaireId: 'as-2024-2025' })
      toast.success('Classe créée.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Création impossible.')
    }
  }

  function tauxOccupation(classeId: string, capacite: number) {
    const effectif = effectifClasse(classeId)
    return Math.round((effectif / capacite) * 100)
  }

  // Regrouper par niveau
  const niveaux = [...new Set(classes.map((c) => c.niveau))]

  return (
    <div className="flex flex-col">
      <Topbar
        titre="Classes"
        sousTitre={`${classes.length} classes · ${classes.reduce((a, c) => a + (c.effectif || 0), 0)} élèves`}
        actions={
          <button onClick={creerClasse} className="btn-principal text-xs">
            <Plus className="h-3.5 w-3.5" />
            Nouvelle classe
          </button>
        }
      />

      <div className="space-y-6 p-6">
        {/* Résumé */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total classes', valeur: classes.length, couleur: 'text-akwaba-bleu' },
            {
              label: 'Total élèves',
              valeur: eleves.filter((e) => e.statut === 'actif').length,
              couleur: 'text-akwaba-vert',
            },
            {
              label: 'Taux moyen remplissage',
              valeur: `${Math.round(classes.reduce((acc, c) => acc + tauxOccupation(c.id, c.capaciteMax), 0) / classes.length)}%`,
              couleur: 'text-akwaba-orange',
            },
            { label: 'Niveaux', valeur: niveaux.length, couleur: 'text-akwaba-violet' },
          ].map((s) => (
            <div key={s.label} className="carte-principale text-center">
              <p className={`text-2xl font-bold ${s.couleur}`}>{s.valeur}</p>
              <p className="mt-1 text-xs text-akwaba-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Classes groupées par niveau */}
        {niveaux.map((niveau) => {
          const classesNiveau = classes.filter((c) => c.niveau === niveau)
          return (
            <div key={niveau}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-akwaba-texte">
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-xs',
                    COULEURS_NIVEAU[niveau] || 'border-akwaba-bordure bg-akwaba-surface text-akwaba-muted'
                  )}
                >
                  {niveau}
                </span>
                <span className="font-normal text-akwaba-muted">
                  {classesNiveau.length} classe{classesNiveau.length > 1 ? 's' : ''}
                </span>
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {classesNiveau.map((classe) => {
                  const effectif = effectifClasse(classe.id)
                  const taux = tauxOccupation(classe.id, classe.capaciteMax)

                  return (
                    <div
                      key={classe.id}
                      className="carte-principale group transition-all duration-200 hover:border-akwaba-bordure/60"
                    >
                      {/* En-tête */}
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-akwaba-texte">{classe.nom}</h3>
                          <p className="mt-0.5 text-xs text-akwaba-muted">{classe.niveau}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={async () => {
                              const nom = window.prompt('Nouveau nom', classe.nom)
                              if (!nom) return
                              await modifier(classe.id, { nom })
                              toast.success('Classe modifiée.')
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-akwaba-muted transition-all hover:bg-akwaba-surface hover:text-akwaba-texte"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Supprimer ${classe.nom} ?`)) return
                              await supprimer(classe.id)
                              toast.success('Classe supprimée.')
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-akwaba-muted transition-all hover:bg-akwaba-rouge/10 hover:text-akwaba-rouge"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Infos */}
                      <div className="mb-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs text-akwaba-muted">
                          <Users className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {effectif} / {classe.capaciteMax} élèves
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-akwaba-muted">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>Salle {classe.salle}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-akwaba-muted">
                          <UserCog className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{nomEnseignant(classe.enseignantPrincipalId)}</span>
                        </div>
                      </div>

                      {/* Barre de remplissage */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-xs text-akwaba-muted">Taux de remplissage</span>
                          <span
                            className={cn(
                              'text-xs font-medium',
                              taux >= 90 ? 'text-akwaba-rouge' : taux >= 70 ? 'text-akwaba-orange' : 'text-akwaba-vert'
                            )}
                          >
                            {taux}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-akwaba-surface">
                          <div
                            className={cn(
                              'h-1.5 rounded-full transition-all duration-500',
                              taux >= 90 ? 'bg-akwaba-rouge' : taux >= 70 ? 'bg-akwaba-orange' : 'bg-akwaba-vert'
                            )}
                            style={{ width: `${taux}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
