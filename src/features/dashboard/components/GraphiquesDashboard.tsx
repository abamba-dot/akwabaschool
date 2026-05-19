'use client'

import { TrendingUp } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formaterMontant } from '@/shared/lib/utils'
import type { StatsDashboard } from '@/shared/types'

interface PayloadGraphique {
  value: number
}

interface PropsTooltip {
  active?: boolean
  payload?: PayloadGraphique[]
  label?: string
}

interface GraphiquesDashboardProps {
  stats: StatsDashboard
  chargement: boolean
}

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

export function GraphiquesDashboard({ stats, chargement }: GraphiquesDashboardProps) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
                tickFormatter={(valeur) => `${(valeur / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<TooltipCustom />} />
              <Area type="monotone" dataKey="montant" stroke="#4F7FFF" strokeWidth={2} fill="url(#gradientPaiement)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

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
  )
}
