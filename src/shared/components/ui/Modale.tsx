'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { type ReactNode } from 'react'

interface ModaleProps {
  ouvert: boolean
  onFermer: () => void
  titre?: string
  description?: string
  children: ReactNode
  ariaLabel?: string
}

export function Modale({ ouvert, onFermer, titre, description, children, ariaLabel }: ModaleProps) {
  return (
    <Dialog.Root open={ouvert} onOpenChange={(open) => !open && onFermer()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content
          aria-label={ariaLabel}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-akwaba-bordure bg-akwaba-carte shadow-2xl focus:outline-none data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {titre && (
            <div className="flex items-start justify-between border-b border-akwaba-bordure p-5">
              <div>
                <Dialog.Title className="text-sm font-semibold text-akwaba-texte">{titre}</Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-1 text-xs text-akwaba-muted">{description}</Dialog.Description>
                )}
              </div>
              <Dialog.Close asChild>
                <button
                  className="text-akwaba-muted transition-colors hover:text-akwaba-texte"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>
          )}
          <div className="p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
