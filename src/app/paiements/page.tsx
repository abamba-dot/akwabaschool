'use client'

// ============================================================
// PAGE PAIEMENTS — Gestion des paiements scolaires
// ============================================================

import { Plus, Search, CreditCard, Download, X, MoreHorizontal } from 'lucide-react'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'

import { Topbar } from '@/shared/components/layout/Topbar'
import { ModalePaiement } from '@/features/paiements/components/ModalePaiement'
import { usePaiements } from '@/shared/hooks/useCollections'
import { useEleves } from '@/features/eleves/hooks/useEleves'
import { formaterMontant, formaterDate, cn } from '@/shared/lib/utils'
import type { Paiement, StatutPaiement } from '@/shared/types'

const STATUT_LABELS: Record<string, string> = {
  paye: 'Payé',
  en_attente: 'En attente',
  rembourse: 'Remboursé',
  annule: 'Annulé',
}

const METHODE_LABELS: Record<string, string> = {
  especes: 'Espèces',
  virement: 'Virement',
  cheque: 'Chèque',
  mobile_money: 'Mobile Money',
  carte: 'Carte bancaire',
}

const TYPE_LABELS: Record<string, string> = {
  scolarite: 'Scolarité',
  inscription: 'Inscription',
  cantine: 'Cantine',
  transport: 'Transport',
  activite: 'Activité',
  autre: 'Autre',
}

export default function PagePaiements() {
  const { paiements, chargement, erreur, creer } = usePaiements()
  const { eleves } = useEleves()
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState<StatutPaiement | ''>('')
  const [filtreType, setFiltreType] = useState('')
  const [modaleOuverte, setModaleOuverte] = useState(false)

  // Élèves indexés pour accès rapide
  const elevesIndex = useMemo(() => Object.fromEntries(eleves.map((e) => [e.id, e])), [eleves])

  // Paiements filtrés
  const paiementsFiltres = useMemo(() => {
    let res = paiements

    if (recherche) {
      const terme = recherche.toLowerCase()
      res = res.filter((p) => {
        const eleve = elevesIndex[p.eleveId]
        return (
          p.reference.toLowerCase().includes(terme) ||
          (eleve && `${eleve.prenom} ${eleve.nom}`.toLowerCase().includes(terme)) ||
          (eleve && eleve.matricule.toLowerCase().includes(terme))
        )
      })
    }

    if (filtreStatut) res = res.filter((p) => p.statut === filtreStatut)
    if (filtreType) res = res.filter((p) => p.type === filtreType)

    return res
  }, [paiements, recherche, filtreStatut, filtreType, elevesIndex])

  // Totaux
  const totalPaye = paiementsFiltres.filter((p) => p.statut === 'paye').reduce((acc, p) => acc + p.montant, 0)

  const totalEnAttente = paiementsFiltres
    .filter((p) => p.statut === 'en_attente')
    .reduce((acc, p) => acc + p.montant, 0)

  const aDesFiltres = recherche || filtreStatut || filtreType

  return (
    <div className="flex flex-col">
      <Topbar
        titre="Paiements"
        sousTitre="Suivi des règlements scolaires"
        actions={
          <button onClick={() => setModaleOuverte(true)} className="btn-principal text-xs">
            <Plus className="h-3.5 w-3.5" />
            Nouveau paiement
          </button>
        }
      />

      <div className="space-y-5 p-6">
        {/* Cartes résumé */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: 'Total encaissé',
              valeur: formaterMontant(paiements.filter((p) => p.statut === 'paye').reduce((a, p) => a + p.montant, 0)),
              couleur: 'vert',
              icone: '💰',
            },
            { label: 'En attente', valeur: formaterMontant(totalEnAttente), couleur: 'orange', icone: '⏳' },
            {
              label: 'Paiements ce mois',
              valeur: paiements.filter((p) => p.statut === 'paye').length,
              couleur: 'bleu',
              icone: '📊',
            },
            {
              label: 'Taux de collecte',
              valeur: `${paiements.length ? Math.round((paiements.filter((p) => p.statut === 'paye').length / paiements.length) * 100) : 0}%`,
              couleur: 'violet',
              icone: '📈',
            },
          ].map((stat) => (
            <div key={stat.label} className="carte-principale">
              <p className="mb-1 text-lg">{stat.icone}</p>
              <p className="mb-1 text-xs text-akwaba-muted">{stat.label}</p>
              <p
                className={cn(
                  'text-xl font-bold',
                  stat.couleur === 'vert' && 'text-akwaba-vert',
                  stat.couleur === 'orange' && 'text-akwaba-orange',
                  stat.couleur === 'bleu' && 'text-akwaba-bleu',
                  stat.couleur === 'violet' && 'text-akwaba-violet'
                )}
              >
                {stat.valeur}
              </p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-akwaba-muted" />
            <input
              type="text"
              placeholder="Référence, nom d'élève…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="champ-saisie pl-9 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value as StatutPaiement | '')}
              className="champ-saisie w-auto text-xs"
            >
              <option value="">Tous les statuts</option>
              <option value="paye">Payé</option>
              <option value="en_attente">En attente</option>
              <option value="annule">Annulé</option>
              <option value="rembourse">Remboursé</option>
            </select>
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="champ-saisie w-auto text-xs"
            >
              <option value="">Tous types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            {aDesFiltres && (
              <button
                onClick={() => {
                  setRecherche('')
                  setFiltreStatut('')
                  setFiltreType('')
                }}
                className="flex items-center gap-1 rounded-lg border border-akwaba-bordure px-3 py-2 text-xs text-akwaba-muted transition-all hover:border-akwaba-muted hover:text-akwaba-texte"
              >
                <X className="h-3.5 w-3.5" /> Effacer
              </button>
            )}
            <button
              onClick={() => toast('Export PDF — fonctionnalité bientôt disponible')}
              className="flex items-center gap-1.5 rounded-lg border border-akwaba-bordure px-3 py-2 text-xs text-akwaba-muted transition-all hover:border-akwaba-muted hover:text-akwaba-texte"
            >
              <Download className="h-3.5 w-3.5" /> Exporter
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="carte-principale overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Liste des paiements">
              <thead>
                <tr className="border-b border-akwaba-bordure">
                  {['Élève', 'Référence', 'Type', 'Méthode', 'Date', 'Montant', 'Statut', ''].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-akwaba-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-akwaba-bordure">
                {chargement ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-akwaba-muted">
                      Chargement des paiements…
                    </td>
                  </tr>
                ) : erreur ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-akwaba-rouge">
                      {erreur}
                    </td>
                  </tr>
                ) : paiementsFiltres.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-akwaba-muted">
                        <CreditCard className="h-10 w-10 opacity-30" />
                        <p className="text-sm font-medium">Aucun paiement trouvé</p>
                        <p className="text-xs">Modifiez vos filtres ou enregistrez un paiement</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paiementsFiltres.map((paiement) => {
                    const eleve = elevesIndex[paiement.eleveId]
                    return (
                      <tr key={paiement.id} className="ligne-tableau">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-xs font-medium text-akwaba-texte">
                              {eleve ? `${eleve.prenom} ${eleve.nom}` : '—'}
                            </p>
                            <p className="text-xs text-akwaba-muted">{eleve?.matricule}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="rounded bg-akwaba-surface px-2 py-0.5 font-mono text-xs text-akwaba-muted">
                            {paiement.reference}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-xs text-akwaba-muted">
                          {TYPE_LABELS[paiement.type] || paiement.type}
                        </td>
                        <td className="px-4 py-3 text-xs text-akwaba-muted">
                          {METHODE_LABELS[paiement.methode] || paiement.methode}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-akwaba-muted">
                          {formaterDate(paiement.datePaiement)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="whitespace-nowrap text-sm font-semibold text-akwaba-texte">
                            {formaterMontant(paiement.montant)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'rounded-full border px-2 py-0.5 text-xs font-medium',
                              paiement.statut === 'paye' && 'border-akwaba-vert/20 bg-akwaba-vert/10 text-akwaba-vert',
                              paiement.statut === 'en_attente' &&
                                'border-akwaba-orange/20 bg-akwaba-orange/10 text-akwaba-orange',
                              paiement.statut === 'annule' &&
                                'border-akwaba-rouge/20 bg-akwaba-rouge/10 text-akwaba-rouge',
                              paiement.statut === 'rembourse' &&
                                'border-akwaba-violet/20 bg-akwaba-violet/10 text-akwaba-violet'
                            )}
                          >
                            {STATUT_LABELS[paiement.statut]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toast(`Reçu paiement ${paiement.reference} — Export PDF bientôt disponible`)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-akwaba-muted transition-all hover:bg-akwaba-surface hover:text-akwaba-texte"
                            aria-label="Options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Résumé bas de tableau */}
          {paiementsFiltres.length > 0 && (
            <div className="flex items-center justify-between border-t border-akwaba-bordure px-4 py-3">
              <p className="text-xs text-akwaba-muted">
                {paiementsFiltres.length} paiement{paiementsFiltres.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs font-medium text-akwaba-texte">
                Total encaissé : <span className="font-bold text-akwaba-vert">{formaterMontant(totalPaye)}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modale nouveau paiement */}
      {modaleOuverte && (
        <ModalePaiement
          ouvert={modaleOuverte}
          onFermer={() => setModaleOuverte(false)}
          eleves={eleves}
          onAjouter={async (p) => {
            try {
              await creer(p)
              setModaleOuverte(false)
              toast.success('Paiement enregistré !')
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Paiement impossible.')
            }
          }}
        />
      )}
    </div>
  )
}
