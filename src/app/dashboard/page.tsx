'use client'

// ============================================================
// DASHBOARD — Vue d'ensemble de l'établissement
// ============================================================

import { Users, UserCog, BookOpen, CreditCard, CalendarX, TrendingUp, Clock, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import { CarteStat } from '@/features/dashboard/components/CarteStat'
import { useEleves } from '@/features/eleves/hooks/useEleves'
import { Topbar } from '@/shared/components/layout/Topbar'
import { useDashboard, usePaiements } from '@/shared/hooks/useCollections'
import { ACTIVITES_RECENTES, STATS_DASHBOARD } from '@/shared/lib/donnees-mock'
import { formaterMontant, formaterDate } from '@/shared/lib/utils'

interface PayloadGraphique {
  value: number
}

interface PropsTooltip {
  active?: boolean
  payload?: PayloadGraphique[]
  label?: string
}

// Tooltip personnalisé pour les graphiques
function TooltipCustom({ active, payload, label }: PropsTooltip) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-akwaba-bordure bg-akwaba-carte px-3 py-2 shadow-xl">
        <p className="mb-1 text-xs text-akwaba-muted">{label}</p>
        <p className="text-sm font-semibold text-akwaba-texte">{formaterMontant(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

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

        {/* Graphiques */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Évolution paiements */}
          <div className="carte-principale lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-akwaba-texte">Évolution des paiements</h2>
                <p className="mt-0.5 text-xs text-akwaba-muted">Revenus des 7 derniers mois</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-akwaba-vert/20 bg-akwaba-vert/10 px-2.5 py-1 text-xs text-akwaba-vert">
                <TrendingUp className="h-3 w-3" />
                <span>+12.5% ce mois</span>
              </div>
            </div>

            {chargement ? (
              <div className="skeleton h-48 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats.evolutionPaiements} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <defs>
                    <linearGradient id="gradientPaiement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F7FFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F7FFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fill: '#8888A0', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#8888A0', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip content={<TooltipCustom />} />
                  <Area
                    type="monotone"
                    dataKey="montant"
                    stroke="#4F7FFF"
                    strokeWidth={2}
                    fill="url(#gradientPaiement)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Répartition des classes */}
          <div className="carte-principale">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-akwaba-texte">Effectifs par classe</h2>
              <p className="mt-0.5 text-xs text-akwaba-muted">Nombre d'élèves</p>
            </div>

            {chargement ? (
              <div className="skeleton h-48 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.repartitionClasses} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" horizontal={true} vertical={false} />
                  <XAxis
                    dataKey="classe"
                    tick={{ fill: '#8888A0', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#8888A0', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1C1C27',
                      border: '1px solid #2A2A3A',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#E8E8F0',
                    }}
                  />
                  <Bar dataKey="effectif" fill="#4F7FFF" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

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
