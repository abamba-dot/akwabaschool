'use client'

import { CheckCircle, Lock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { supabase, supabaseEstConfigure } from '@/infrastructure/supabase/client'

export default function PageNouveauMotDePasse() {
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')

    if (motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.')
      return
    }

    if (!supabaseEstConfigure()) {
      setSucces(true)
      return
    }

    setChargement(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: motDePasse })
      if (error) throw error
      setSucces(true)
    } catch {
      setErreur('Impossible de modifier le mot de passe. Ouvrez le lien reçu par email puis réessayez.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-akwaba-noir p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-akwaba-bleu to-akwaba-violet shadow-lg shadow-akwaba-bleu/20">
            <span className="text-xl font-bold text-white">A</span>
          </div>
          <h1 className="text-2xl font-bold text-akwaba-texte">Akwaba IT</h1>
        </div>

        <div className="carte-principale p-8">
          {succes ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-akwaba-vert/10">
                <CheckCircle className="h-8 w-8 text-akwaba-vert" />
              </div>
              <h2 className="text-xl font-bold text-akwaba-texte">Mot de passe mis à jour</h2>
              <Link href="/auth/connexion" className="btn-principal block w-full text-center">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={soumettre} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-akwaba-texte">Nouveau mot de passe</h2>
                <p className="mt-1 text-sm text-akwaba-muted">Choisissez un mot de passe sécurisé pour votre compte.</p>
              </div>

              <ChampMotDePasse label="Mot de passe" valeur={motDePasse} onChange={setMotDePasse} />
              <ChampMotDePasse label="Confirmation" valeur={confirmation} onChange={setConfirmation} />

              {erreur && <p className="rounded-lg bg-akwaba-rouge/10 px-3 py-2 text-sm text-akwaba-rouge">{erreur}</p>}

              <button
                type="submit"
                disabled={chargement}
                className="btn-principal flex w-full items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                {chargement ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function ChampMotDePasse({
  label,
  valeur,
  onChange,
}: {
  label: string
  valeur: string
  onChange: (valeur: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-akwaba-texte">{label}</span>
      <input
        type="password"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        className="champ-saisie"
        autoComplete="new-password"
      />
    </label>
  )
}
