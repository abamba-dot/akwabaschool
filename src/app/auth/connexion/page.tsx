'use client'

import { Eye, EyeOff, GraduationCap, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { useAuth } from '@/features/auth/hooks/useAuth'

export default function PageConnexion() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [montrerMDP, setMontrerMDP] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const { seConnecter } = useAuth()

  async function gererConnexion(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setChargement(true)

    try {
      await seConnecter(email, motDePasse)
      toast.success('Connexion réussie ! Bienvenue.')
      router.push('/dashboard')
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Email ou mot de passe incorrect. Vérifiez vos informations.')
      toast.error('Identifiants incorrects.')
    } finally {
      setChargement(false)
    }
  }

  const demoActive = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true'

  function remplirDemo() {
    setEmail('admin@akwaba.edu')
    setMotDePasse('admin123')
    setErreur('')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-akwaba-noir p-4">
      {/* Fond décoratif */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-akwaba-bleu/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-akwaba-violet/5 blur-3xl" />
        <div className="bg-akwaba-bleu/3 absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #4F7FFF 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px] animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-akwaba-bleu/20 bg-akwaba-bleu/10">
            <GraduationCap className="h-7 w-7 text-akwaba-bleu" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-akwaba-texte">Akwaba IT</h1>
          <p className="mt-1 text-sm text-akwaba-muted">Gestion Scolaire Premium</p>
        </div>

        {/* Carte connexion */}
        <div className="rounded-2xl border border-akwaba-bordure bg-akwaba-carte p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-akwaba-texte">Connexion</h2>
            <p className="mt-1 text-sm text-akwaba-muted">Entrez vos identifiants pour accéder à votre espace</p>
          </div>

          <form onSubmit={gererConnexion} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-akwaba-texte" htmlFor="email">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                className="champ-saisie"
                placeholder="vous@akwaba.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-describedby={erreur ? 'erreur-connexion' : undefined}
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-akwaba-texte" htmlFor="mot-de-passe">
                  Mot de passe
                </label>
                <Link
                  href="/auth/mot-de-passe-oublie"
                  className="text-xs text-akwaba-bleu transition-colors hover:text-akwaba-bleu-clair"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="mot-de-passe"
                  type={montrerMDP ? 'text' : 'password'}
                  className="champ-saisie pr-10"
                  placeholder="••••••••"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  required
                  autoComplete="current-password"
                  aria-describedby={erreur ? 'erreur-connexion' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setMontrerMDP(!montrerMDP)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-akwaba-muted transition-colors hover:text-akwaba-texte"
                  aria-label={montrerMDP ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {montrerMDP ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            <div id="erreur-connexion" role="alert" aria-live="polite" aria-atomic="true">
              {erreur && (
                <div className="animate-fade-in rounded-lg border border-akwaba-rouge/20 bg-akwaba-rouge/10 p-3 text-sm text-akwaba-rouge">
                  {erreur}
                </div>
              )}
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={chargement}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-akwaba-bleu px-4 py-2.5 font-medium text-white transition-all duration-200 hover:bg-akwaba-bleu-clair disabled:cursor-not-allowed disabled:opacity-60"
            >
              {chargement ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Connexion en cours…</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Accès démo — uniquement en développement */}
          {demoActive && (
            <div className="mt-6 border-t border-akwaba-bordure pt-5">
              <p className="mb-3 text-center text-xs text-akwaba-muted">Mode démonstration local</p>
              <button
                type="button"
                onClick={remplirDemo}
                className="w-full rounded-lg border border-akwaba-bleu/20 px-3 py-2 text-xs text-akwaba-bleu transition-all duration-200 hover:bg-akwaba-bleu/5"
              >
                Utiliser les identifiants démo
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-akwaba-muted">© 2025 Akwaba IT · Tous droits réservés</p>
      </div>
    </div>
  )
}
