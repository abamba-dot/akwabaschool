import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL
const cleSupabase = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  if (!urlSupabase || !cleSupabase) {
    throw new Error("Supabase n'est pas configuré côté serveur.")
  }

  return createServerClient(urlSupabase, cleSupabase, {
    cookies: {
      get(nom: string) {
        return cookieStore.get(nom)?.value
      },
      set(nom: string, valeur: string, options: CookieOptions) {
        try {
          cookieStore.set(nom, valeur, options)
        } catch {
          // Un Server Component ne peut pas toujours écrire les cookies.
          // Le middleware garde la session à jour.
        }
      },
      remove(nom: string, options: CookieOptions) {
        try {
          cookieStore.set(nom, '', options)
        } catch {
          // Un Server Component ne peut pas toujours écrire les cookies.
        }
      },
    },
  })
}
