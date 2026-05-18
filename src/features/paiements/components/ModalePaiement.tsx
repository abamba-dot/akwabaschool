'use client'

// ============================================================
// MODALE PAIEMENT — Enregistrement d'un paiement (Radix)
// ============================================================

import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, CreditCard } from 'lucide-react'
import { useState } from 'react'

import { ELEVES_MOCK } from '@/shared/lib/donnees-mock'
import { schemaPaiement } from '@/shared/validation/common'
import type { Eleve, FormulairePaiement, MethodePaiement, TypePaiement } from '@/shared/types'

interface Props {
  ouvert: boolean
  onFermer: () => void
  onAjouter: (paiement: FormulairePaiement) => Promise<void> | void
  eleves?: Eleve[]
}

export function ModalePaiement({ ouvert, onFermer, onAjouter, eleves = ELEVES_MOCK }: Props) {
  const [chargement, setChargement] = useState(false)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    eleveId: '',
    montant: '',
    methode: 'especes' as MethodePaiement,
    type: 'scolarite' as TypePaiement,
    description: '',
    datePaiement: new Date().toISOString().split('T')[0],
  })

  function maj(c: string, v: string) {
    setForm((p) => ({ ...p, [c]: v }))
    if (erreurs[c]) {
      setErreurs((prev) => {
        const suivant = { ...prev }
        delete suivant[c]
        return suivant
      })
    }
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    const validation = schemaPaiement.safeParse({
      ...form,
      montant: parseInt(form.montant),
    })
    if (!validation.success) {
      const nouvellesErreurs: Record<string, string> = {}
      validation.error.issues.forEach((err) => {
        const cle = err.path[0] as string
        if (cle && !nouvellesErreurs[cle]) nouvellesErreurs[cle] = err.message
      })
      setErreurs(nouvellesErreurs)
      return
    }

    setChargement(true)
    const paiement: FormulairePaiement = {
      eleveId: form.eleveId,
      montant: parseInt(form.montant),
      datePaiement: form.datePaiement,
      methode: form.methode,
      type: form.type,
      statut: 'paye',
      description: form.description,
      anneeScolaireId: 'as-2024-2025',
    }

    try {
      await onAjouter(paiement)
    } finally {
      setChargement(false)
    }
  }

  return (
    <Dialog.Root open={ouvert} onOpenChange={(open) => !open && onFermer()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content
          aria-label="Nouveau paiement"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-akwaba-bordure bg-akwaba-carte shadow-2xl focus:outline-none data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between border-b border-akwaba-bordure px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-akwaba-vert/10">
                <CreditCard className="h-4 w-4 text-akwaba-vert" />
              </div>
              <Dialog.Title className="text-sm font-semibold text-akwaba-texte">Nouveau paiement</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="text-akwaba-muted transition-colors hover:text-akwaba-texte" aria-label="Fermer">
                <span className="sr-only">Fermer</span>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={soumettre} className="space-y-4 p-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-akwaba-texte">
                Élève <span className="text-akwaba-rouge">*</span>
              </label>
              <select
                value={form.eleveId}
                onChange={(e) => maj('eleveId', e.target.value)}
                required
                className={`champ-saisie text-sm ${erreurs.eleveId ? 'border-akwaba-rouge focus:border-akwaba-rouge focus:ring-akwaba-rouge/20' : ''}`}
                aria-invalid={erreurs.eleveId ? 'true' : 'false'}
              >
                <option value="">Sélectionner un élève</option>
                {eleves
                  .filter((e) => e.statut === 'actif')
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.prenom} {e.nom} — {e.matricule}
                    </option>
                  ))}
              </select>
              {erreurs.eleveId && <p className="text-xs text-akwaba-rouge">{erreurs.eleveId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-akwaba-texte">
                  Montant (FCFA) <span className="text-akwaba-rouge">*</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  value={form.montant}
                  onChange={(e) => maj('montant', e.target.value)}
                  required
                  placeholder="150 000"
                  className={`champ-saisie text-sm ${erreurs.montant ? 'border-akwaba-rouge focus:border-akwaba-rouge focus:ring-akwaba-rouge/20' : ''}`}
                  aria-invalid={erreurs.montant ? 'true' : 'false'}
                />
                {erreurs.montant && <p className="text-xs text-akwaba-rouge">{erreurs.montant}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-akwaba-texte">Date</label>
                <input
                  type="date"
                  value={form.datePaiement}
                  onChange={(e) => maj('datePaiement', e.target.value)}
                  className="champ-saisie text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-akwaba-texte">Méthode</label>
                <select
                  value={form.methode}
                  onChange={(e) => maj('methode', e.target.value)}
                  className="champ-saisie text-sm"
                >
                  <option value="especes">Espèces</option>
                  <option value="virement">Virement</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cheque">Chèque</option>
                  <option value="carte">Carte bancaire</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-akwaba-texte">Type</label>
                <select value={form.type} onChange={(e) => maj('type', e.target.value)} className="champ-saisie text-sm">
                  <option value="scolarite">Scolarité</option>
                  <option value="inscription">Inscription</option>
                  <option value="cantine">Cantine</option>
                  <option value="transport">Transport</option>
                  <option value="activite">Activité</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-akwaba-texte">Description (optionnel)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => maj('description', e.target.value)}
                placeholder="Ex. Frais scolarité Trimestre 1…"
                className="champ-saisie text-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onFermer}
                className="flex-1 rounded-lg border border-akwaba-bordure py-2.5 text-sm text-akwaba-muted transition-all hover:border-akwaba-muted hover:text-akwaba-texte"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={chargement}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-akwaba-vert py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-500 disabled:opacity-70"
              >
                {chargement ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
