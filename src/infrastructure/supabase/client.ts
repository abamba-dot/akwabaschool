// ============================================================
// SUPABASE — Configuration et client
// ============================================================

import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '@/infrastructure/supabase/types'

// Export du type Database pour usage manuel dans les services
export type { Database }

const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL
const clePubliqueSupabase =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function supabaseEstConfigure() {
  return Boolean(urlSupabase && clePubliqueSupabase)
}

export function verifierConfigurationSupabase() {
  if (!supabaseEstConfigure()) {
    throw new Error(
      "Supabase n'est pas configuré. Renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY dans .env.local."
    )
  }
}

// Client pour le navigateur (composants client)
// NOTE: le generic Database n'est pas passé ici car @supabase/ssr v0.1.0
// ne le résout pas correctement avec un type manuel. Utiliser Database
// manuellement dans les services (ex: supabase.from('eleves').select<'*', ElevesRow>('*'))
export function creerClientSupabase() {
  return createBrowserClient(urlSupabase || 'https://demo.supabase.co', clePubliqueSupabase || 'demo-anon-key')
}

// Instance singleton pour éviter les reconn. multiples
let clientSupabase: ReturnType<typeof creerClientSupabase> | null = null

export function obtenirClientSupabase() {
  if (!clientSupabase) {
    clientSupabase = creerClientSupabase()
  }
  return clientSupabase
}

export const supabase = obtenirClientSupabase()
