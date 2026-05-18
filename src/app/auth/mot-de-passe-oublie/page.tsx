'use client'

import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { supabase } from '@/infrastructure/supabase/client'

// ─── Page de réinitialisation du mot de passe ─────────────────────────────────

export default function PageMotDePasseOublie() {
  const [email, setEmail] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setErreur('Veuillez saisir votre email')
      return
    }
    setEnvoi(true)
    setErreur('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/nouveau-mot-de-passe`,
      })
      if (error) throw error
      setSucces(true)
    } catch {
      setErreur("Une erreur est survenue. Vérifiez l'adresse email.")
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-akwaba-noir p-4">
      {/* Décor fond */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-akwaba-bleu/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-akwaba-violet/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-akwaba-bleu to-akwaba-violet shadow-lg shadow-akwaba-bleu/20">
            <span className="text-xl font-bold text-white">A</span>
          </div>
          <h1 className="text-2xl font-bold text-akwaba-texte">Akwaba IT</h1>
        </div>

        <div className="carte-principale p-8">
          {succes ? (
            /* Message de succès */
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-akwaba-vert/10">
                <CheckCircle className="h-8 w-8 text-akwaba-vert" />
              </div>
              <h2 className="text-xl font-bold text-akwaba-texte">Email envoyé !</h2>
              <p className="text-sm text-akwaba-muted">
                Un lien de réinitialisation a été envoyé à <strong className="text-akwaba-texte">{email}</strong>.
                Vérifiez votre boîte de réception.
              </p>
              <Link href="/auth/connexion" className="btn-principal mt-6 block w-full text-center">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-akwaba-texte">Mot de passe oublié ?</h2>
                <p className="mt-1 text-sm text-akwaba-muted">
                  Saisissez votre email pour recevoir un lien de réinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-akwaba-texte">Adresse email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-akwaba-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@ecole.edu"
                      className="champ-saisie pl-10"
                      disabled={envoi}
                    />
                  </div>
                </div>

                {erreur && (
                  <p className="rounded-lg bg-akwaba-rouge/10 px-3 py-2 text-sm text-akwaba-rouge">{erreur}</p>
                )}

                <button
                  type="submit"
                  disabled={envoi}
                  className="btn-principal flex w-full items-center justify-center gap-2 disabled:opacity-50"
                >
                  {envoi ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  {envoi ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>

              <Link
                href="/auth/connexion"
                className="mt-4 flex items-center justify-center gap-2 text-sm text-akwaba-muted transition-colors hover:text-akwaba-texte"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
