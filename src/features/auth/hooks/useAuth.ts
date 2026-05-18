'use client'

import { useState, useEffect } from 'react'

import { supabase, supabaseEstConfigure } from '@/infrastructure/supabase/client'
import type { Utilisateur } from '@/shared/types'

// ─── Hook d'authentification ─────────────────────────────────────────────────
// ⚠️ Le mode démo est réservé au développement local (NEXT_PUBLIC_ENABLE_DEMO_MODE=true)

const DEMO_ACTIVE = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true'

function creerCookieDemo(valeur: string, maxAge = 86400) {
  document.cookie = `akwaba-demo-session=${valeur}; path=/; max-age=${maxAge}; SameSite=Strict`
}

function supprimerCookieDemo() {
  document.cookie = 'akwaba-demo-session=; path=/; max-age=0; SameSite=Strict'
}

function lireSessionDemo(): boolean {
  return document.cookie.includes('akwaba-demo-session=connecte')
}

async function chargerProfilUtilisateur(userId: string): Promise<Partial<Utilisateur>> {
  const { data: profil } = await supabase
    .from('utilisateurs')
    .select('nom, prenom, role, telephone, photo_url, actif')
    .eq('id', userId)
    .single()

  return {
    nom: profil?.nom ?? '',
    prenom: profil?.prenom ?? '',
    role: profil?.role ?? 'secretaire',
    telephone: profil?.telephone ?? undefined,
    photoUrl: profil?.photo_url ?? undefined,
    actif: profil?.actif ?? true,
  }
}

export function useAuth() {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    if (!supabaseEstConfigure()) {
      // Mode démo local (désactivé par défaut en production)
      if (DEMO_ACTIVE && lireSessionDemo()) {
        setUtilisateur({
          id: 'demo-admin',
          email: 'admin@akwaba.edu',
          nom: 'Directeur',
          prenom: 'Admin',
          role: 'admin',
          actif: true,
          creeLe: new Date().toISOString(),
          misAJourLe: new Date().toISOString(),
        })
      }
      setChargement(false)
      return
    }

    // Récupérer l'utilisateur authentifié côté serveur (getUser valide le JWT)
    supabase.auth
      .getUser()
      .then(async ({ data: { user } }) => {
        if (user) {
          const profil = await chargerProfilUtilisateur(user.id)
          setUtilisateur({
            id: user.id,
            email: user.email ?? '',
            nom: profil.nom ?? user.user_metadata?.nom ?? 'Utilisateur',
            prenom: profil.prenom ?? user.user_metadata?.prenom ?? '',
            role: profil.role ?? 'secretaire',
            actif: profil.actif ?? true,
            telephone: profil.telephone,
            photoUrl: profil.photoUrl,
            creeLe: user.created_at,
            misAJourLe: user.updated_at ?? user.created_at,
          })
        }
      })
      .catch(() => {
        /* silencieux */
      })
      .finally(() => setChargement(false))

    // Écouter les changements d'auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profil = await chargerProfilUtilisateur(session.user.id)
        setUtilisateur({
          id: session.user.id,
          email: session.user.email ?? '',
          nom: profil.nom ?? session.user.user_metadata?.nom ?? 'Utilisateur',
          prenom: profil.prenom ?? session.user.user_metadata?.prenom ?? '',
          role: profil.role ?? 'secretaire',
          actif: profil.actif ?? true,
          telephone: profil.telephone,
          photoUrl: profil.photoUrl,
          creeLe: session.user.created_at,
          misAJourLe: session.user.updated_at ?? session.user.created_at,
        })
      } else {
        setUtilisateur(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const seConnecter = async (email: string, motDePasse: string) => {
    if (!supabaseEstConfigure()) {
      if (DEMO_ACTIVE && email === 'admin@akwaba.edu' && motDePasse === 'admin123') {
        creerCookieDemo('connecte')
        setUtilisateur({
          id: 'demo-admin',
          email,
          nom: 'Directeur',
          prenom: 'Admin',
          role: 'admin',
          actif: true,
          creeLe: new Date().toISOString(),
          misAJourLe: new Date().toISOString(),
        })
        return
      }
      throw new Error('Email ou mot de passe incorrect.')
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse })
    if (error) throw error
  }

  const seDeconnecter = async () => {
    if (!supabaseEstConfigure()) {
      supprimerCookieDemo()
      window.localStorage.clear()
      setUtilisateur(null)
      return
    }
    await supabase.auth.signOut()
    setUtilisateur(null)
  }

  return { utilisateur, chargement, seConnecter, seDeconnecter }
}
