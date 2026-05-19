'use client'

// ============================================================
// PAGE ÉLÈVES — Gestion complète des élèves
// ============================================================

import {
  Plus,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  X,
  UserPlus,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'

import { useEleves } from '@/features/eleves/hooks/useEleves'
import { Topbar } from '@/shared/components/layout/Topbar'
import { useClasses } from '@/shared/hooks/useCollections'
import { calculerAge, obtenirInitiales, couleurAvatar, rechercherDans, paginer, cn } from '@/shared/lib/utils'
import type { Eleve, StatutEleveType, StatutPaiementType } from '@/shared/types'

const ModaleAjoutEleve = dynamic(
  () => import('@/features/eleves/components/ModaleAjoutEleve').then((module) => module.ModaleAjoutEleve),
  { ssr: false },
)

const ModaleSuppression = dynamic(
  () => import('@/shared/components/ui/ModaleSuppression').then((module) => module.ModaleSuppression),
  { ssr: false },
)

// Nombre d'élèves par page
const parPage = 10

// Labels de statut
const STATUT_LABELS: Record<StatutEleveType, string> = {
  actif: 'Actif',
  inactif: 'Inactif',
  suspendu: 'Suspendu',
  diplome: 'Diplômé',
}

const statutPaiement_LABELS: Record<StatutPaiementType, string> = {
  paye: 'Payé',
  en_attente: 'En attente',
  retard: 'En retard',
}

export default function PageEleves() {
  const { eleves, chargement, erreur, ajouterEleve, supprimerEleve } = useEleves()
  const { classes } = useClasses()
  const [recherche, setRecherche] = useState('')
  const [filtreClasse, setFiltreClasse] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [filtrePaiement, setFiltrePaiement] = useState('')
  const [page, setPage] = useState(1)
  const [menuOuvert, setMenuOuvert] = useState<string | null>(null)
  const [eleveASupprimer, setEleveASupprimer] = useState<Eleve | null>(null)
  const [modaleAjout, setModaleAjout] = useState(false)
  const [chargementSuppression, setChargementSuppression] = useState(false)

  // Filtrage et recherche
  const elevesFiltres = useMemo(() => {
    let resultat = rechercherDans(eleves, recherche, ['nom', 'prenom', 'matricule', 'email', 'telephone'])

    if (filtreClasse) {
      resultat = resultat.filter((e) => e.classeId === filtreClasse)
    }
    if (filtreStatut) {
      resultat = resultat.filter((e) => e.statut === filtreStatut)
    }
    if (filtrePaiement) {
      resultat = resultat.filter((e) => e.statutPaiement === filtrePaiement)
    }

    return resultat
  }, [eleves, recherche, filtreClasse, filtreStatut, filtrePaiement])

  // Pagination
  const totalPages = Math.ceil(elevesFiltres.length / parPage)
  const elevesPage = paginer(elevesFiltres, page, parPage)

  // Réinitialiser les filtres
  function reinitialiserFiltres() {
    setRecherche('')
    setFiltreClasse('')
    setFiltreStatut('')
    setFiltrePaiement('')
    setPage(1)
  }

  // Supprimer un élève
  async function confirmerSuppression() {
    if (!eleveASupprimer) return
    setChargementSuppression(true)
    try {
      await supprimerEleve(eleveASupprimer.id)
      toast.success(`Élève ${eleveASupprimer.prenom} ${eleveASupprimer.nom} supprimé.`)
      setEleveASupprimer(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Suppression impossible.')
    } finally {
      setChargementSuppression(false)
    }
  }

  // Obtenir le nom de la classe
  function nomClasse(classeId: string) {
    return classes.find((c) => c.id === classeId)?.nom || '—'
  }

  const aDesFiltres = recherche || filtreClasse || filtreStatut || filtrePaiement

  return (
    <div className="flex flex-col">
      <Topbar
        titre="Élèves"
        sousTitre={`${elevesFiltres.length} élève${elevesFiltres.length > 1 ? 's' : ''} ${aDesFiltres ? 'trouvé·e·s' : 'inscrits'}`}
        actions={
          <button onClick={() => setModaleAjout(true)} className="btn-principal text-xs">
            <UserPlus className="h-3.5 w-3.5" />
            Ajouter
          </button>
        }
      />

      <div className="space-y-4 p-6">
        {/* Barre de recherche et filtres */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Recherche */}
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-akwaba-muted" />
            <input
              type="text"
              placeholder="Rechercher un élève…"
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value)
                setPage(1)
              }}
              className="champ-saisie pl-9"
              aria-label="Rechercher un élève"
            />
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filtreClasse}
              onChange={(e) => {
                setFiltreClasse(e.target.value)
                setPage(1)
              }}
              className="champ-saisie w-auto text-xs"
              aria-label="Filtrer par classe"
            >
              <option value="">Toutes les classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>

            <select
              value={filtreStatut}
              onChange={(e) => {
                setFiltreStatut(e.target.value)
                setPage(1)
              }}
              className="champ-saisie w-auto text-xs"
              aria-label="Filtrer par statut"
            >
              <option value="">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="suspendu">Suspendu</option>
            </select>

            <select
              value={filtrePaiement}
              onChange={(e) => {
                setFiltrePaiement(e.target.value)
                setPage(1)
              }}
              className="champ-saisie w-auto text-xs"
              aria-label="Filtrer par paiement"
            >
              <option value="">Tous paiements</option>
              <option value="paye">Payé</option>
              <option value="en_attente">En attente</option>
              <option value="retard">En retard</option>
            </select>

            {aDesFiltres && (
              <button
                onClick={reinitialiserFiltres}
                className="flex items-center gap-1.5 rounded-lg border border-akwaba-bordure px-3 py-2 text-xs text-akwaba-muted transition-all hover:border-akwaba-muted hover:text-akwaba-texte"
              >
                <X className="h-3.5 w-3.5" />
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Tableau */}
        <div className="carte-principale overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Liste des élèves">
              <thead>
                <tr className="border-b border-akwaba-bordure">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-akwaba-muted">
                    Élève
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-akwaba-muted md:table-cell">
                    Matricule
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-akwaba-muted lg:table-cell">
                    Classe
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-akwaba-muted lg:table-cell">
                    Âge
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-akwaba-muted">
                    Statut
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-akwaba-muted sm:table-cell">
                    Paiement
                  </th>
                  <th className="px-4 py-3" aria-label="Actions" />
                </tr>
              </thead>

              <tbody className="divide-y divide-akwaba-bordure">
                {chargement ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-akwaba-muted">
                      Chargement des élèves…
                    </td>
                  </tr>
                ) : erreur ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-akwaba-rouge">
                      {erreur}
                    </td>
                  </tr>
                ) : elevesPage.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-akwaba-muted">
                        <Users className="h-10 w-10 opacity-30" />
                        <div>
                          <p className="text-sm font-medium">Aucun élève trouvé</p>
                          <p className="mt-1 text-xs">Modifiez vos filtres ou ajoutez un nouvel élève</p>
                        </div>
                        <button onClick={() => setModaleAjout(true)} className="btn-principal mt-2 text-xs">
                          <Plus className="h-3.5 w-3.5" />
                          Ajouter un élève
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  elevesPage.map((eleve) => (
                    <tr key={eleve.id} className="ligne-tableau">
                      {/* Élève */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                              couleurAvatar(eleve.id)
                            )}
                          >
                            {obtenirInitiales(eleve.nom, eleve.prenom)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-akwaba-texte">
                              {eleve.prenom} {eleve.nom}
                            </p>
                            <p className="hidden truncate text-xs text-akwaba-muted sm:block">
                              {eleve.email || eleve.telephone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Matricule */}
                      <td className="hidden px-4 py-3 md:table-cell">
                        <code className="rounded bg-akwaba-surface px-2 py-0.5 font-mono text-xs text-akwaba-muted">
                          {eleve.matricule}
                        </code>
                      </td>

                      {/* Classe */}
                      <td className="hidden px-4 py-3 text-xs text-akwaba-muted lg:table-cell">
                        {nomClasse(eleve.classeId)}
                      </td>

                      {/* Âge */}
                      <td className="hidden px-4 py-3 text-xs text-akwaba-muted lg:table-cell">
                        {calculerAge(eleve.dateNaissance)} ans
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'rounded-full border px-2 py-0.5 text-xs font-medium',
                            eleve.statut === 'actif' && 'border-akwaba-vert/20 bg-akwaba-vert/10 text-akwaba-vert',
                            eleve.statut === 'inactif' && 'border-akwaba-muted/20 bg-akwaba-muted/10 text-akwaba-muted',
                            eleve.statut === 'suspendu' &&
                              'border-akwaba-rouge/20 bg-akwaba-rouge/10 text-akwaba-rouge',
                            eleve.statut === 'diplome' &&
                              'border-akwaba-violet/20 bg-akwaba-violet/10 text-akwaba-violet'
                          )}
                        >
                          {STATUT_LABELS[eleve.statut]}
                        </span>
                      </td>

                      {/* Paiement */}
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span
                          className={cn(
                            'rounded-full border px-2 py-0.5 text-xs font-medium',
                            eleve.statutPaiement === 'paye' &&
                              'border-akwaba-vert/20 bg-akwaba-vert/10 text-akwaba-vert',
                            eleve.statutPaiement === 'en_attente' &&
                              'border-akwaba-orange/20 bg-akwaba-orange/10 text-akwaba-orange',
                            eleve.statutPaiement === 'retard' &&
                              'border-akwaba-rouge/20 bg-akwaba-rouge/10 text-akwaba-rouge'
                          )}
                        >
                          {statutPaiement_LABELS[eleve.statutPaiement]}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={() => setMenuOuvert(menuOuvert === eleve.id ? null : eleve.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-akwaba-muted transition-all hover:bg-akwaba-surface hover:text-akwaba-texte"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {menuOuvert === eleve.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuOuvert(null)} />
                              <div className="absolute right-0 top-8 z-20 w-40 animate-fade-in overflow-hidden rounded-xl border border-akwaba-bordure bg-akwaba-carte shadow-2xl">
                                <Link
                                  href={`/eleves/${eleve.id}`}
                                  className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-akwaba-muted transition-colors hover:bg-akwaba-surface hover:text-akwaba-texte"
                                  onClick={() => setMenuOuvert(null)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Voir la fiche
                                </Link>
                                <button
                                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs text-akwaba-muted transition-colors hover:bg-akwaba-surface hover:text-akwaba-texte"
                                  onClick={() => {
                                    setMenuOuvert(null)
                                    toast('Modification à venir…')
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Modifier
                                </button>
                                <div className="border-t border-akwaba-bordure" />
                                <button
                                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs text-akwaba-rouge transition-colors hover:bg-akwaba-rouge/10"
                                  onClick={() => {
                                    setMenuOuvert(null)
                                    setEleveASupprimer(eleve)
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Supprimer
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {elevesFiltres.length > parPage && (
            <div className="flex items-center justify-between border-t border-akwaba-bordure px-4 py-3">
              <p className="text-xs text-akwaba-muted">
                {(page - 1) * parPage + 1}–{Math.min(page * parPage, elevesFiltres.length)} sur {elevesFiltres.length}
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-akwaba-bordure text-akwaba-muted transition-all hover:border-akwaba-muted hover:text-akwaba-texte disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-all',
                      p === page
                        ? 'bg-akwaba-bleu text-white'
                        : 'border border-akwaba-bordure text-akwaba-muted hover:border-akwaba-muted hover:text-akwaba-texte'
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-akwaba-bordure text-akwaba-muted transition-all hover:border-akwaba-muted hover:text-akwaba-texte disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modale suppression */}
      {eleveASupprimer && (
        <ModaleSuppression
          ouvert={Boolean(eleveASupprimer)}
          message={`Supprimer ${eleveASupprimer.prenom} ${eleveASupprimer.nom} ?`}
          detail="Cette action est irréversible. Toutes les données liées (notes, absences, paiements) seront perdues."
          chargement={chargementSuppression}
          onConfirmer={confirmerSuppression}
          onAnnuler={() => setEleveASupprimer(null)}
        />
      )}

      {/* Modale ajout */}
      {modaleAjout && (
        <ModaleAjoutEleve
          ouvert={modaleAjout}
          onFermer={() => setModaleAjout(false)}
          classes={classes}
          onAjouter={async (nouvelEleve) => {
            try {
              await ajouterEleve(nouvelEleve)
              setModaleAjout(false)
              toast.success('Élève ajouté avec succès !')
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Création impossible.')
            }
          }}
        />
      )}
    </div>
  )
}
