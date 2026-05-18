// ============================================================
// CARTE STAT — Composant statistique du dashboard
// ============================================================

import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface CarteStatProps {
  titre: string
  valeur: string | number
  icone: LucideIcon
  couleurIcone?: 'bleu' | 'vert' | 'orange' | 'rouge' | 'violet'
  evolution?: number // pourcentage d'évolution
  description?: string
  chargement?: boolean
}

const couleursIcone = {
  bleu: 'bg-akwaba-bleu/10 text-akwaba-bleu',
  vert: 'bg-akwaba-vert/10 text-akwaba-vert',
  orange: 'bg-akwaba-orange/10 text-akwaba-orange',
  rouge: 'bg-akwaba-rouge/10 text-akwaba-rouge',
  violet: 'bg-akwaba-violet/10 text-akwaba-violet',
}

export function CarteStat({
  titre,
  valeur,
  icone: Icone,
  couleurIcone = 'bleu',
  evolution,
  description,
  chargement = false,
}: CarteStatProps) {
  if (chargement) {
    return (
      <div className="carte-principale">
        <div className="skeleton mb-4 h-8 w-8 rounded-lg" />
        <div className="skeleton mb-2 h-4 w-20 rounded" />
        <div className="skeleton h-7 w-28 rounded" />
      </div>
    )
  }

  const evolutionPositive = evolution !== undefined && evolution > 0
  const evolutionNegative = evolution !== undefined && evolution < 0

  return (
    <div className="carte-principale group cursor-default transition-all duration-300 hover:border-akwaba-bleu/30">
      <div className="mb-4 flex items-start justify-between">
        <div
          className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
            couleursIcone[couleurIcone]
          )}
        >
          <Icone className="h-4.5 w-4.5" />
        </div>

        {/* Badge évolution */}
        {evolution !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              evolutionPositive && 'bg-akwaba-vert/10 text-akwaba-vert',
              evolutionNegative && 'bg-akwaba-rouge/10 text-akwaba-rouge',
              !evolutionPositive && !evolutionNegative && 'bg-akwaba-muted/10 text-akwaba-muted'
            )}
          >
            {evolutionPositive && <TrendingUp className="h-3 w-3" />}
            {evolutionNegative && <TrendingDown className="h-3 w-3" />}
            {!evolutionPositive && !evolutionNegative && <Minus className="h-3 w-3" />}
            <span>{Math.abs(evolution)}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-akwaba-muted">{titre}</p>
        <p className="text-2xl font-bold tracking-tight text-akwaba-texte">{valeur}</p>
        {description && <p className="mt-1 text-xs text-akwaba-muted">{description}</p>}
      </div>
    </div>
  )
}
