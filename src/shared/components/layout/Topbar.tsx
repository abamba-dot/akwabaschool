'use client'

// ============================================================
// TOPBAR — En-tête avec recherche et actions rapides
// ============================================================

import { Bell, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { ACTIVITES_RECENTES } from '@/shared/lib/donnees-mock'

interface TopbarProps {
  titre: string
  sousTitre?: string
  actions?: React.ReactNode
}

export function Topbar({ titre, sousTitre, actions }: TopbarProps) {
  const [notifOuverte, setNotifOuverte] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 flex-shrink-0 items-center justify-between border-b border-akwaba-bordure bg-akwaba-noir/80 px-6 backdrop-blur-sm">
      {/* Titre de la page */}
      <div>
        <h1 className="text-sm font-semibold text-akwaba-texte">{titre}</h1>
        {sousTitre && <p className="text-xs text-akwaba-muted">{sousTitre}</p>}
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-2">
        {actions}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOuverte(!notifOuverte)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-akwaba-muted transition-all duration-200 hover:bg-akwaba-surface hover:text-akwaba-texte"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-akwaba-bleu" />
          </button>

          {/* Panneau notifications */}
          {notifOuverte && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOuverte(false)} />
              <div className="absolute right-0 top-10 z-20 w-80 animate-fade-in overflow-hidden rounded-xl border border-akwaba-bordure bg-akwaba-carte shadow-2xl">
                <div className="flex items-center justify-between border-b border-akwaba-bordure px-4 py-3">
                  <span className="text-sm font-semibold">Notifications</span>
                  <button onClick={() => setNotifOuverte(false)} className="text-akwaba-muted hover:text-akwaba-texte">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-72 divide-y divide-akwaba-bordure overflow-y-auto">
                  {ACTIVITES_RECENTES.slice(0, 4).map((activite) => (
                    <div
                      key={activite.id}
                      className="cursor-pointer px-4 py-3 transition-colors hover:bg-akwaba-surface"
                    >
                      <p className="text-xs font-medium text-akwaba-texte">{activite.message}</p>
                      <p className="mt-0.5 text-xs text-akwaba-muted">{activite.temps}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-akwaba-bordure px-4 py-3">
                  <button className="w-full text-center text-xs text-akwaba-bleu transition-colors hover:text-akwaba-bleu-clair">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profil mini */}
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-akwaba-surface">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-akwaba-bleu/20">
            <span className="text-xs font-bold text-akwaba-bleu">AD</span>
          </div>
          <ChevronDown className="h-3 w-3 text-akwaba-muted" />
        </button>
      </div>
    </header>
  )
}
