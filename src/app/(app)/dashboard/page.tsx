'use client'

// ============================================================
// DASHBOARD — Vue d'ensemble de l'établissement
// ============================================================

import { Users, UserCog, BookOpen, CreditCard, CalendarX, Clock, Plus, ArrowRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

import { CarteStat } from '@/features/dashboard/components/CarteStat'
import { useEleves } from '@/features/eleves/hooks/useEleves'
import { Topbar } from '@/shared/components/layout/Topbar'
import { useDashboard, usePaiements } from '@/shared/hooks/useCollections'
import { ACTIVITES_RECENTES, STATS_DASHBOARD } from '@/shared/lib/donnees-mock'
import { formaterMontant, formaterDate } from '@/shared/lib/utils'

const GraphiquesDashboard = dynamic(
  () => import('@/features/dashboard/components/GraphiquesDashboard').then((module) => module.GraphiquesDashboard),
  {
    ssr: false,
    loading: () => (
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="carte-principale lg:col-span-2">
          <div className="skeleton h-56 rounded-lg" />
        </div>
        <div className="carte-principale">
          <div className="skeleton h-56 rounded-lg" />
        </div>
      </section>
    ),
  },
)

export default function PageDashboard() {
  const { stats: statsChargees, chargement } = useDashboard()
  const { paiements } = usePaiements()
  const { eleves } = useEleves()
  const stats = statsChargees ?? STATS_DASHBOARD

  // Derniers paiements
  const derniersPaiements = paiements.slice(0, 5)

  return (
    <div className="flex flex-col">
      <Topbar
        titre="Dashboard"
        sousTitre="Vue d'ensemble de l'établissement"
        actions={
          <Link href="/eleves" className="btn-principal hidden text-xs sm:flex">
            <Plus className="h-3.5 w-3.5" />
            Nouvel élève
          </Link>
        }
      />

      <div className="space-y-6 p-6">
        {/* Cartes statistiques */}
        <section>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
            <CarteStat
              titre="Élèves"
              valeur={chargement ? '—' : stats.totalEleves}
              icone={Users}
              couleurIcone="bleu"
              evolution={3.2}
              description="inscrits cette année"
              chargement={chargement}
            />
            <CarteStat
              titre="Enseignants"
              valeur={chargement ? '—' : stats.totalEnseignants}
              icone={UserCog}
              couleurIcone="vert"
              evolution={0}
              description="en poste"
              chargement={chargement}
            />
            <CarteStat
              titre="Classes"
              valeur={chargement ? '—' : stats.totalClasses}
              icone={BookOpen}
              couleurIcone="violet"
              description="actives"
              chargement={chargement}
            />
            <CarteStat
              titre="Paiements"
              valeur={chargement ? '—' : formaterMontant(stats.paiementsMois)}
              icone={CreditCard}
              couleurIcone="orange"
              evolution={12.5}
              description="ce mois-ci"
              chargement={chargement}
            />
            <CarteStat
              titre="Absences"
              valeur={chargement ? '—' : stats.absencesJour}
              icone={CalendarX}
              couleurIcone="rouge"
              description="aujourd'hui"
              chargement={chargement}
            />
          </div>
        </section>

        <GraphiquesDashboard stats={stats} chargement={chargement} />

        {/* Section basse : activités & paiements récents */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Activités récentes */}
          <div className="carte-principale">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-akwaba-texte">Activités récentes</h2>
              <span className="flex items-center gap-1 text-xs text-akwaba-muted">
                <Clock className="h-3 w-3" />
                En temps réel
              </span>
            </div>

            <div className="space-y-4">
              {ACTIVITES_RECENTES.map((activite) => {
                const couleursPoint: Record<string, string> = {
                  vert: 'bg-akwaba-vert',
                  bleu: 'bg-akwaba-bleu',
                  orange: 'bg-akwaba-orange',
                  violet: 'bg-akwaba-violet',
                  rouge: 'bg-akwaba-rouge',
                }
                return (
                  <div key={activite.id} className="group flex items-start gap-3">
                    <div
                      className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${couleursPoint[activite.couleur] || 'bg-akwaba-muted'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-akwaba-texte">{activite.message}</p>
                      <p className="text-xs text-akwaba-muted">{activite.detail}</p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-akwaba-muted">{activite.temps}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Paiements récents */}
          <div className="carte-principale">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-akwaba-texte">Paiements récents</h2>
              <Link
                href="/paiements"
                className="flex items-center gap-1 text-xs text-akwaba-bleu transition-colors hover:text-akwaba-bleu-clair"
              >
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {derniersPaiements.map((paiement) => {
                const eleve = eleves.find((e) => e.id === paiement.eleveId)
                const statutStyles: Record<string, string> = {
                  paye: 'badge-succes',
                  en_attente: 'badge-avertissement',
                  annule: 'badge-erreur',
                  rembourse: 'badge-info',
                }
                const statutLabels: Record<string, string> = {
                  paye: 'Payé',
                  en_attente: 'En attente',
                  annule: 'Annulé',
                  rembourse: 'Remboursé',
                }

                return (
                  <div
                    key={paiement.id}
                    className="flex items-center justify-between border-b border-akwaba-bordure py-2 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-akwaba-bleu/10">
                        <CreditCard className="h-3.5 w-3.5 text-akwaba-bleu" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-akwaba-texte">
                          {eleve ? `${eleve.prenom} ${eleve.nom}` : '—'}
                        </p>
                        <p className="text-xs text-akwaba-muted">{formaterDate(paiement.datePaiement)}</p>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <span className="text-xs font-semibold text-akwaba-texte">
                        {formaterMontant(paiement.montant)}
                      </span>
                      <span className={statutStyles[paiement.statut] || 'badge-info'}>
                        {statutLabels[paiement.statut] || paiement.statut}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Taux de paiement */}
        <section>
          <div className="carte-principale">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-akwaba-texte">Taux de paiement global</h2>
              <span className="text-xl font-bold text-akwaba-texte">{stats.tauxPaiement}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-akwaba-surface">
              <div
                className="h-2 rounded-full bg-akwaba-bleu transition-all duration-1000"
                style={{ width: `${stats.tauxPaiement}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-akwaba-muted">0%</span>
              <span className="text-xs text-akwaba-muted">
                {Math.round((stats.tauxPaiement / 100) * stats.totalEleves)} élèves ont payé sur {stats.totalEleves}
              </span>
              <span className="text-xs text-akwaba-muted">100%</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
