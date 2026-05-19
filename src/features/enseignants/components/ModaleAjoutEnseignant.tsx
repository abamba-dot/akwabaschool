'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, UserCog } from 'lucide-react'
import { useState } from 'react'

import type { Enseignant, FormulaireEnseignant } from '@/shared/types'
import { schemaEnseignant } from '@/shared/validation/common'

interface Props {
  ouvert: boolean
  onFermer: () => void
  onSoumettre: (enseignant: FormulaireEnseignant) => Promise<void> | void
  enseignantInitial?: Partial<Enseignant>
}

export function ModaleAjoutEnseignant({ ouvert, onFermer, onSoumettre, enseignantInitial }: Props) {
  const estEdition = Boolean(enseignantInitial)
  const [chargement, setChargement] = useState(false)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    nom: enseignantInitial?.nom ?? '',
    prenom: enseignantInitial?.prenom ?? '',
    email: enseignantInitial?.email ?? '',
    telephone: enseignantInitial?.telephone ?? '',
    specialite: enseignantInitial?.specialite ?? '',
    adresse: enseignantInitial?.adresse ?? '',
    dateEmbauche: enseignantInitial?.dateEmbauche ?? new Date().toISOString().split('T')[0],
    statut: (enseignantInitial?.statut ?? 'actif') as 'actif' | 'inactif' | 'conge',
  })

  function mettreAJour(champ: string, valeur: string) {
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

    const validation = schemaEnseignant.safeParse(form)
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
        email: form.email || `${form.prenom.toLowerCase()}.${form.nom.toLowerCase().replace(/\s+/g, '')}@akwaba.edu`,
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
          aria-label={estEdition ? "Modifier l'enseignant" : 'Nouvel enseignant'}
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-akwaba-bordure bg-akwaba-carte shadow-2xl focus:outline-none data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* En-tête */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-akwaba-bordure px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-akwaba-vert/10">
                <UserCog className="h-4 w-4 text-akwaba-vert" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold text-akwaba-texte">
                  {estEdition ? "Modifier l'enseignant" : 'Nouvel enseignant'}
                </Dialog.Title>
                <p className="text-xs text-akwaba-muted">
                  {estEdition ? 'Mettez à jour les informations' : 'Renseignez les informations du membre'}
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
              {/* Nom / Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <ChampTexte
                  label="Prénom(s)"
                  id="prenom"
                  valeur={form.prenom}
                  onChange={(v) => mettreAJour('prenom', v)}
                  placeholder="Marie"
                />
                <ChampTexte
                  label="Nom"
                  id="nom"
                  valeur={form.nom}
                  onChange={(v) => mettreAJour('nom', v)}
                  placeholder="DUPONT"
                />
              </div>

              {/* Spécialité */}
              <ChampTexte
                label="Spécialité / Matière"
                id="specialite"
                valeur={form.specialite}
                onChange={(v) => mettreAJour('specialite', v)}
                placeholder="Mathématiques"
              />

              {/* Email */}
              <ChampTexte
                label="Email professionnel"
                id="email"
                type="email"
                valeur={form.email}
                onChange={(v) => mettreAJour('email', v)}
                placeholder="nom@akwaba.edu"
                requis={false}
              />

              {/* Téléphone */}
              <ChampTexte
                label="Téléphone"
                id="telephone"
                type="tel"
                valeur={form.telephone}
                onChange={(v) => mettreAJour('telephone', v)}
                placeholder="+225 07 XX XX XX"
                requis={false}
              />

              {/* Date embauche + Statut */}
              <div className="grid grid-cols-2 gap-3">
                <ChampTexte
                  label="Date d'embauche"
                  id="dateEmbauche"
                  type="date"
                  valeur={form.dateEmbauche}
                  onChange={(v) => mettreAJour('dateEmbauche', v)}
                  requis={false}
                />
                <div className="space-y-1.5">
                  <label htmlFor="statut" className="text-xs font-medium text-akwaba-texte">
                    Statut <span className="text-akwaba-rouge">*</span>
                  </label>
                  <select
                    id="statut"
                    value={form.statut}
                    onChange={(e) => mettreAJour('statut', e.target.value)}
                    className="champ-saisie text-sm"
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="conge">En congé</option>
                  </select>
                </div>
              </div>

              {/* Adresse */}
              <ChampTexte
                label="Adresse"
                id="adresse"
                valeur={form.adresse}
                onChange={(v) => mettreAJour('adresse', v)}
                placeholder="Quartier, Ville"
                requis={false}
              />
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
                disabled={chargement || !form.nom || !form.prenom || !form.specialite}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-akwaba-vert py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {chargement ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement…
                  </>
                ) : estEdition ? (
                  "Enregistrer les modifications"
                ) : (
                  "Ajouter l'enseignant"
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
