'use client'

// ============================================================
// PAGE ENSEIGNANTS — Gestion du corps enseignant
// ============================================================

import { Mail, MoreHorizontal, Pencil, Phone, Plus, Search, Trash2, UserCog, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { Topbar } from '@/shared/components/layout/Topbar'
import { ModaleSuppression } from '@/shared/components/ui/ModaleSuppression'
import { useEnseignants } from '@/shared/hooks/useCollections'
import { cn, couleurAvatar, obtenirInitiales, rechercherDans } from '@/shared/lib/utils'
import type { Enseignant } from '@/shared/types'

const ModaleAjoutEnseignant = dynamic(
  () => import('@/features/enseignants/components/ModaleAjoutEnseignant').then((m) => m.ModaleAjoutEnseignant),
  { ssr: false },
)

const STATUT_STYLE: Record<string, string> = {
  actif: 'badge-succes',
  inactif: 'badge-erreur',
  conge: 'badge-avertissement',
}
const STATUT_LABEL: Record<string, string> = {
  actif: 'Actif',
  inactif: 'Inactif',
  conge: 'En congé',
}

export default function PageEnseignants() {
  const { enseignants, creer, modifier, supprimer } = useEnseignants()
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [menuOuvert, setMenuOuvert] = useState<string | null>(null)
  const [enseignantASupprimer, setEnseignantASupprimer] = useState<Enseignant | null>(null)
  const [enseignantAEditer, setEnseignantAEditer] = useState<Enseignant | null>(null)
  const [modaleAjout, setModaleAjout] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [vue, setVue] = useState<'grille' | 'tableau'>('grille')

  const enseignantsFiltres = useMemo(() => {
    let res = rechercherDans(enseignants, recherche, ['nom', 'prenom', 'email', 'specialite'])
    if (filtreStatut) res = res.filter((e) => e.statut === filtreStatut)
    return res
  }, [enseignants, recherche, filtreStatut])

  async function confirmerSuppression() {
    if (!enseignantASupprimer) return
    setChargement(true)
    try {
      await supprimer(enseignantASupprimer.id)
      toast.success(`${enseignantASupprimer.prenom} ${enseignantASupprimer.nom} retiré.`)
      setEnseignantASupprimer(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Suppression impossible.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Topbar
        titre="Enseignants"
        sousTitre={`${enseignantsFiltres.length} enseignant${enseignantsFiltres.length > 1 ? 's' : ''}`}
        actions={
          <button onClick={() => setModaleAjout(true)} className="btn-principal text-xs">
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </button>
        }
      />

      <div className="space-y-4 p-6">
        {/* Filtres */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-akwaba-muted" />
            <input
              type="text"
              placeholder="Rechercher un enseignant…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="champ-saisie pl-9"
              aria-label="Rechercher un enseignant"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="champ-saisie w-auto text-xs"
              aria-label="Filtrer par statut"
            >
              <option value="">Tous statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="conge">En congé</option>
            </select>

            {filtreStatut && (
              <button
                onClick={() => setFiltreStatut('')}
                className="flex items-center gap-1.5 rounded-lg border border-akwaba-bordure px-3 py-2 text-xs text-akwaba-muted transition-all hover:border-akwaba-muted hover:text-akwaba-texte"
                aria-label="Effacer filtre"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Bascule vue */}
            <div className="flex overflow-hidden rounded-lg border border-akwaba-bordure">
              {(['grille', 'tableau'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVue(v)}
                  className={cn(
                    'px-3 py-2 text-xs transition-all',
                    vue === v ? 'bg-akwaba-surface text-akwaba-texte' : 'text-akwaba-muted hover:text-akwaba-texte'
                  )}
                >
                  {v === 'grille' ? '⊞' : '☰'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vue grille */}
        {vue === 'grille' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {enseignantsFiltres.length === 0 ? (
              <div className="col-span-full py-16 text-center text-akwaba-muted">
                <UserCog className="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm font-medium">Aucun enseignant trouvé</p>
              </div>
            ) : (
              enseignantsFiltres.map((ens) => (
                <div
                  key={ens.id}
                  className="carte-principale group relative transition-all duration-200 hover:border-akwaba-bordure/60"
                >
                  {/* Menu actions */}
                  <div className="absolute right-4 top-4">
                    <button
                      onClick={() => setMenuOuvert(menuOuvert === ens.id ? null : ens.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-akwaba-muted opacity-0 transition-all hover:bg-akwaba-surface hover:text-akwaba-texte group-hover:opacity-100"
                      aria-label="Actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menuOuvert === ens.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOuvert(null)} />
                        <div className="absolute right-0 top-8 z-20 w-36 animate-fade-in overflow-hidden rounded-xl border border-akwaba-bordure bg-akwaba-carte shadow-2xl">
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-akwaba-muted transition-colors hover:bg-akwaba-surface hover:text-akwaba-texte"
                            onClick={() => {
                              setMenuOuvert(null)
                              setEnseignantAEditer(ens)
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" /> Modifier
                          </button>
                          <div className="border-t border-akwaba-bordure" />
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-akwaba-rouge transition-colors hover:bg-akwaba-rouge/10"
                            onClick={() => {
                              setMenuOuvert(null)
                              setEnseignantASupprimer(ens)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Supprimer
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Avatar + infos */}
                  <div className="mb-4 flex flex-col items-center gap-3 text-center">
                    <div
                      className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold',
                        couleurAvatar(ens.id)
                      )}
                    >
                      {obtenirInitiales(ens.nom, ens.prenom)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-akwaba-texte">
                        {ens.prenom} {ens.nom}
                      </p>
                      <p className="mt-0.5 text-xs text-akwaba-muted">{ens.specialite}</p>
                      <span className={cn('mt-1 inline-block', STATUT_STYLE[ens.statut])}>
                        {STATUT_LABEL[ens.statut]}
                      </span>
                    </div>
                  </div>

                  {/* Matières */}
                  {ens.matieres && ens.matieres.length > 0 && (
                    <div className="mb-4 flex flex-wrap justify-center gap-1">
                      {ens.matieres.map((m) => (
                        <span key={m} className="rounded-md bg-akwaba-surface px-2 py-0.5 text-xs text-akwaba-muted">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contacts */}
                  <div className="space-y-1.5 border-t border-akwaba-bordure pt-3">
                    <a
                      href={`tel:${ens.telephone}`}
                      className="flex items-center gap-2 text-xs text-akwaba-muted transition-colors hover:text-akwaba-texte"
                    >
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{ens.telephone || '—'}</span>
                    </a>
                    <a
                      href={`mailto:${ens.email}`}
                      className="flex items-center gap-2 text-xs text-akwaba-muted transition-colors hover:text-akwaba-texte"
                    >
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{ens.email}</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Vue tableau
          <div className="carte-principale overflow-hidden p-0">
            <table className="w-full text-sm" aria-label="Liste des enseignants">
              <thead>
                <tr className="border-b border-akwaba-bordure">
                  {['Enseignant', 'Spécialité', 'Téléphone', 'Email', 'Statut', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-akwaba-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-akwaba-bordure">
                {enseignantsFiltres.map((ens) => (
                  <tr key={ens.id} className="ligne-tableau">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                            couleurAvatar(ens.id)
                          )}
                        >
                          {obtenirInitiales(ens.nom, ens.prenom)}
                        </div>
                        <span className="text-sm font-medium text-akwaba-texte">
                          {ens.prenom} {ens.nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-akwaba-muted">{ens.specialite}</td>
                    <td className="px-4 py-3 text-xs text-akwaba-muted">{ens.telephone || '—'}</td>
                    <td className="px-4 py-3 text-xs text-akwaba-muted">{ens.email}</td>
                    <td className="px-4 py-3">
                      <span className={STATUT_STYLE[ens.statut]}>{STATUT_LABEL[ens.statut]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEnseignantAEditer(ens)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-akwaba-muted transition-all hover:bg-akwaba-surface hover:text-akwaba-texte"
                        aria-label="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale ajout */}
      {modaleAjout && (
        <ModaleAjoutEnseignant
          ouvert={modaleAjout}
          onFermer={() => setModaleAjout(false)}
          onSoumettre={async (donnees) => {
            try {
              await creer(donnees)
              setModaleAjout(false)
              toast.success('Enseignant ajouté avec succès !')
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Création impossible.')
            }
          }}
        />
      )}

      {/* Modale édition */}
      {enseignantAEditer && (
        <ModaleAjoutEnseignant
          ouvert={Boolean(enseignantAEditer)}
          onFermer={() => setEnseignantAEditer(null)}
          enseignantInitial={enseignantAEditer}
          onSoumettre={async (donnees) => {
            try {
              await modifier(enseignantAEditer.id, donnees)
              setEnseignantAEditer(null)
              toast.success('Enseignant modifié.')
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Modification impossible.')
            }
          }}
        />
      )}

      {/* Modale suppression */}
      {enseignantASupprimer && (
        <ModaleSuppression
          ouvert={Boolean(enseignantASupprimer)}
          message={`Supprimer ${enseignantASupprimer.prenom} ${enseignantASupprimer.nom} ?`}
          detail="L'enseignant sera retiré de toutes les classes associées."
          chargement={chargement}
          onConfirmer={confirmerSuppression}
          onAnnuler={() => setEnseignantASupprimer(null)}
        />
      )}
    </div>
  )
}
