'use client'

// ============================================================
// MODALE AJOUT ÉLÈVE — Formulaire d'inscription complet (Radix)
// ============================================================

import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'

import { CLASSES_MOCK } from '@/shared/lib/donnees-mock'
import type { Classe, FormulaireEleve } from '@/shared/types'
import { schemaEleve } from '@/shared/validation/common'

interface Props {
  ouvert: boolean
  onFermer: () => void
  onAjouter: (eleve: FormulaireEleve) => Promise<void> | void
  classes?: Classe[]
}

export function ModaleAjoutEleve({ ouvert, onFermer, onAjouter, classes = CLASSES_MOCK }: Props) {
  const [etape, setEtape] = useState(1)
  const [chargement, setChargement] = useState(false)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    sexe: 'M' as 'M' | 'F',
    email: '',
    telephone: '',
    adresse: '',
    classeId: '',
    tuteurNom: '',
    tuteurTelephone: '',
    tuteurEmail: '',
    tuteurRelation: 'Père',
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
    const validation = schemaEleve.safeParse(form)
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
    const nouvelEleve: FormulaireEleve = {
      ...form,
      statut: 'actif',
      statutPaiement: 'en_attente',
      anneeScolaireId: 'as-2024-2025',
    }

    try {
      await onAjouter(nouvelEleve)
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
          aria-label="Nouvel élève"
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-akwaba-bordure bg-akwaba-carte shadow-2xl focus:outline-none data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* En-tête */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-akwaba-bordure px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-akwaba-bleu/10">
                <UserPlus className="h-4 w-4 text-akwaba-bleu" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold text-akwaba-texte">Nouvel élève</Dialog.Title>
                <p className="text-xs text-akwaba-muted">
                  Étape {etape} sur 2 — {etape === 1 ? 'Informations personnelles' : 'Tuteur & Scolarité'}
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="text-akwaba-muted transition-colors hover:text-akwaba-texte"
                aria-label="Fermer"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          {/* Indicateur d'étapes */}
          <div className="flex-shrink-0 px-6 pt-4">
            <div className="flex gap-2">
              {[1, 2].map((e) => (
                <div
                  key={e}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    e <= etape ? 'bg-akwaba-bleu' : 'bg-akwaba-bordure'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={soumettre} className="flex-1 overflow-y-auto">
            <div className="space-y-4 px-6 py-4">
              {etape === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ChampTexte label="Nom" id="nom" valeur={form.nom} onChange={(v) => mettreAJour('nom', v)} placeholder="KOUAMÉ" />
                    <ChampTexte
                      label="Prénom(s)"
                      id="prenom"
                      valeur={form.prenom}
                      onChange={(v) => mettreAJour('prenom', v)}
                      placeholder="Jean-Baptiste"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ChampTexte
                      label="Date de naissance"
                      id="naissance"
                      type="date"
                      valeur={form.dateNaissance}
                      onChange={(v) => mettreAJour('dateNaissance', v)}
                    />
                    <ChampTexte
                      label="Lieu de naissance"
                      id="lieu"
                      valeur={form.lieuNaissance}
                      onChange={(v) => mettreAJour('lieuNaissance', v)}
                      placeholder="Abidjan"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-akwaba-texte">
                      Sexe <span className="text-akwaba-rouge">*</span>
                    </label>
                    <div className="flex gap-3">
                      {['M', 'F'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => mettreAJour('sexe', s)}
                          className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-all ${
                            form.sexe === s
                              ? 'border-akwaba-bleu bg-akwaba-bleu/10 text-akwaba-bleu'
                              : 'border-akwaba-bordure text-akwaba-muted hover:border-akwaba-muted'
                          }`}
                        >
                          {s === 'M' ? 'Masculin' : 'Féminin'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <ChampTexte
                    label="Téléphone"
                    id="tel"
                    type="tel"
                    valeur={form.telephone}
                    onChange={(v) => mettreAJour('telephone', v)}
                    placeholder="+225 07 XX XX XX"
                    requis={false}
                  />
                  <ChampTexte
                    label="Email"
                    id="email"
                    type="email"
                    valeur={form.email}
                    onChange={(v) => mettreAJour('email', v)}
                    placeholder="nom@email.com"
                    requis={false}
                  />
                  <ChampTexte
                    label="Adresse"
                    id="adresse"
                    valeur={form.adresse}
                    onChange={(v) => mettreAJour('adresse', v)}
                    placeholder="Quartier, Ville"
                  />
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-akwaba-texte">
                      Classe <span className="text-akwaba-rouge">*</span>
                    </label>
                    <select
                      value={form.classeId}
                      onChange={(e) => mettreAJour('classeId', e.target.value)}
                      required
                      className="champ-saisie text-sm"
                    >
                      <option value="">Sélectionner une classe</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom} — {c.niveau}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-akwaba-bordure pt-4">
                    <h3 className="mb-3 text-xs font-semibold text-akwaba-texte">Tuteur / Parent</h3>
                    <div className="space-y-3">
                      <ChampTexte
                        label="Nom complet du tuteur"
                        id="tuteur-nom"
                        valeur={form.tuteurNom}
                        onChange={(v) => mettreAJour('tuteurNom', v)}
                        placeholder="KOUAMÉ Jean"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <ChampTexte
                          label="Téléphone"
                          id="tuteur-tel"
                          type="tel"
                          valeur={form.tuteurTelephone}
                          onChange={(v) => mettreAJour('tuteurTelephone', v)}
                          placeholder="+225 05 XX XX XX"
                        />
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-akwaba-texte">Relation</label>
                          <select
                            value={form.tuteurRelation}
                            onChange={(e) => mettreAJour('tuteurRelation', e.target.value)}
                            className="champ-saisie text-sm"
                          >
                            {['Père', 'Mère', 'Oncle', 'Tante', 'Grand-parent', 'Tuteur légal', 'Autre'].map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <ChampTexte
                        label="Email du tuteur"
                        id="tuteur-email"
                        type="email"
                        valeur={form.tuteurEmail}
                        onChange={(v) => mettreAJour('tuteurEmail', v)}
                        placeholder="tuteur@email.com"
                        requis={false}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-shrink-0 gap-3 border-t border-akwaba-bordure px-6 py-4">
              {etape === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={onFermer}
                    className="flex-1 rounded-lg border border-akwaba-bordure py-2.5 text-sm text-akwaba-muted transition-all hover:border-akwaba-muted hover:text-akwaba-texte"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const etape1 = schemaEleve.pick({ nom: true, prenom: true, dateNaissance: true, sexe: true }).safeParse(form)
                      if (!etape1.success) {
                        const nouvellesErreurs: Record<string, string> = {}
                        etape1.error.issues.forEach((err) => {
                          const cle = err.path[0] as string
                          if (cle && !nouvellesErreurs[cle]) nouvellesErreurs[cle] = err.message
                        })
                        setErreurs(nouvellesErreurs)
                        return
                      }
                      setErreurs({})
                      setEtape(2)
                    }}
                    className="flex-1 rounded-lg bg-akwaba-bleu py-2.5 text-sm font-medium text-white transition-all hover:bg-akwaba-bleu-clair disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continuer →
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setEtape(1)}
                    className="flex-1 rounded-lg border border-akwaba-bordure py-2.5 text-sm text-akwaba-muted transition-all hover:border-akwaba-muted hover:text-akwaba-texte"
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    disabled={chargement || !form.classeId || !form.tuteurNom || !form.tuteurTelephone}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-akwaba-bleu py-2.5 text-sm font-medium text-white transition-all hover:bg-akwaba-bleu-clair disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {chargement ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enregistrement…
                      </>
                    ) : (
                      "Enregistrer l'élève"
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
