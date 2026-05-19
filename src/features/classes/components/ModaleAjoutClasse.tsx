'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { BookOpen, Loader2 } from 'lucide-react'
import { useState } from 'react'

import type { Classe, Enseignant, FormulaireClasse } from '@/shared/types'
import { schemaClasse } from '@/shared/validation/common'

const NIVEAUX = [
  'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2',
  '6ème', '5ème', '4ème', '3ème',
  '2nde', '1ère', 'Terminale',
  'BTS1', 'BTS2',
]

interface Props {
  ouvert: boolean
  onFermer: () => void
  onSoumettre: (classe: FormulaireClasse) => Promise<void> | void
  enseignants?: Enseignant[]
  classeInitiale?: Partial<Classe>
}

export function ModaleAjoutClasse({ ouvert, onFermer, onSoumettre, enseignants = [], classeInitiale }: Props) {
  const estEdition = Boolean(classeInitiale)
  const [chargement, setChargement] = useState(false)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    nom: classeInitiale?.nom ?? '',
    niveau: classeInitiale?.niveau ?? '',
    salle: classeInitiale?.salle ?? '',
    capaciteMax: classeInitiale?.capaciteMax ?? 40,
    enseignantPrincipalId: classeInitiale?.enseignantPrincipalId ?? '',
  })

  function mettreAJour(champ: string, valeur: string | number) {
    setForm((prev) => ({ ...prev, [champ]: valeur }))
    if (erreurs[champ]) {
      setErreurs((prev) => {
        const suivant = { ...prev }
        delete suivant[champ]
        return suivant
      })
    }
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()

    const validation = schemaClasse.omit({ anneeScolaireId: true }).safeParse(form)
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
    try {
      await onSoumettre({
        ...form,
        enseignantPrincipalId: form.enseignantPrincipalId || undefined,
        anneeScolaireId: 'as-2024-2025',
      })
    } finally {
      setChargement(false)
    }
  }

  const ChampTexte = ({
    label,
    id,
    type = 'text',
    valeur,
    onChange,
    requis = true,
    placeholder = '',
  }: {
    label: string
    id: string
    type?: string
    valeur: string
    onChange: (v: string) => void
    requis?: boolean
    placeholder?: string
  }) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-akwaba-texte">
        {label} {requis && <span className="text-akwaba-rouge">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        required={requis}
        placeholder={placeholder}
        className={`champ-saisie text-sm ${erreurs[id] ? 'border-akwaba-rouge focus:border-akwaba-rouge focus:ring-akwaba-rouge/20' : ''}`}
        aria-invalid={erreurs[id] ? 'true' : 'false'}
      />
      {erreurs[id] && <p className="text-xs text-akwaba-rouge">{erreurs[id]}</p>}
    </div>
  )

  return (
    <Dialog.Root open={ouvert} onOpenChange={(open) => !open && onFermer()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content
          aria-label={estEdition ? 'Modifier la classe' : 'Nouvelle classe'}
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-akwaba-bordure bg-akwaba-carte shadow-2xl focus:outline-none data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* En-tête */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-akwaba-bordure px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-akwaba-violet/10">
                <BookOpen className="h-4 w-4 text-akwaba-violet" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold text-akwaba-texte">
                  {estEdition ? 'Modifier la classe' : 'Nouvelle classe'}
                </Dialog.Title>
                <p className="text-xs text-akwaba-muted">
                  {estEdition ? 'Mettez à jour les informations' : 'Renseignez les informations de la classe'}
                </p>
              </div>
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

          {/* Formulaire */}
          <form onSubmit={soumettre} className="flex-1 overflow-y-auto">
            <div className="space-y-4 px-6 py-4">
              {/* Nom */}
              <ChampTexte
                label="Nom de la classe"
                id="nom"
                valeur={form.nom}
                onChange={(v) => mettreAJour('nom', v)}
                placeholder="6ème A"
              />

              {/* Niveau */}
              <div className="space-y-1.5">
                <label htmlFor="niveau" className="text-xs font-medium text-akwaba-texte">
                  Niveau <span className="text-akwaba-rouge">*</span>
                </label>
                <select
                  id="niveau"
                  value={form.niveau}
                  onChange={(e) => mettreAJour('niveau', e.target.value)}
                  required
                  className={`champ-saisie text-sm ${erreurs.niveau ? 'border-akwaba-rouge' : ''}`}
                  aria-invalid={erreurs.niveau ? 'true' : 'false'}
                >
                  <option value="">Sélectionner un niveau</option>
                  {NIVEAUX.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                {erreurs.niveau && <p className="text-xs text-akwaba-rouge">{erreurs.niveau}</p>}
              </div>

              {/* Salle + Capacité */}
              <div className="grid grid-cols-2 gap-3">
                <ChampTexte
                  label="Salle"
                  id="salle"
                  valeur={form.salle}
                  onChange={(v) => mettreAJour('salle', v)}
                  placeholder="101"
                  requis={false}
                />
                <div className="space-y-1.5">
                  <label htmlFor="capaciteMax" className="text-xs font-medium text-akwaba-texte">
                    Capacité max <span className="text-akwaba-rouge">*</span>
                  </label>
                  <input
                    id="capaciteMax"
                    type="number"
                    min={1}
                    max={200}
                    value={form.capaciteMax}
                    onChange={(e) => mettreAJour('capaciteMax', Number(e.target.value))}
                    className={`champ-saisie text-sm ${erreurs.capaciteMax ? 'border-akwaba-rouge' : ''}`}
                    aria-invalid={erreurs.capaciteMax ? 'true' : 'false'}
                  />
                  {erreurs.capaciteMax && <p className="text-xs text-akwaba-rouge">{erreurs.capaciteMax}</p>}
                </div>
              </div>

              {/* Enseignant principal */}
              <div className="space-y-1.5">
                <label htmlFor="enseignantPrincipalId" className="text-xs font-medium text-akwaba-texte">
                  Enseignant principal
                </label>
                <select
                  id="enseignantPrincipalId"
                  value={form.enseignantPrincipalId}
                  onChange={(e) => mettreAJour('enseignantPrincipalId', e.target.value)}
                  className="champ-saisie text-sm"
                >
                  <option value="">Non affecté</option>
                  {enseignants.map((ens) => (
                    <option key={ens.id} value={ens.id}>
                      {ens.prenom} {ens.nom} — {ens.specialite}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-shrink-0 gap-3 border-t border-akwaba-bordure px-6 py-4">
              <button
                type="button"
                onClick={onFermer}
                className="flex-1 rounded-lg border border-akwaba-bordure py-2.5 text-sm text-akwaba-muted transition-all hover:border-akwaba-muted hover:text-akwaba-texte"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={chargement || !form.nom || !form.niveau}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-akwaba-violet py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {chargement ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement…
                  </>
                ) : estEdition ? (
                  'Enregistrer les modifications'
                ) : (
                  'Créer la classe'
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
