'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'

import { Modale } from '@/shared/components/ui/Modale'

interface ModaleSuppressionProps {
  ouvert: boolean
  message: string
  detail?: string
  chargement?: boolean
  onConfirmer: () => void
  onAnnuler: () => void
}

export function ModaleSuppression({
  ouvert,
  message,
  detail,
  chargement = false,
  onConfirmer,
  onAnnuler,
}: ModaleSuppressionProps) {
  return (
    <Modale ouvert={ouvert} onFermer={onAnnuler} ariaLabel="Confirmer la suppression">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-akwaba-rouge/10">
          <AlertTriangle className="h-5 w-5 text-akwaba-rouge" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-akwaba-texte">Confirmer la suppression</h2>
          <p className="mt-1 text-sm font-medium text-akwaba-texte">{message}</p>
          {detail && <p className="mt-2 text-xs leading-relaxed text-akwaba-muted">{detail}</p>}
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={onAnnuler}
          disabled={chargement}
          className="flex-1 rounded-lg border border-akwaba-bordure px-4 py-2.5 text-sm font-medium text-akwaba-muted transition-all hover:border-akwaba-muted hover:text-akwaba-texte disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirmer}
          disabled={chargement}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-akwaba-rouge px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:opacity-70"
        >
          {chargement ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Suppression…</span>
            </>
          ) : (
            'Supprimer'
          )}
        </button>
      </div>
    </Modale>
  )
}
