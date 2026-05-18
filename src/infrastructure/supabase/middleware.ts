import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL
const cleSupabase = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient(request: NextRequest) {
  let reponseSupabase = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  if (!urlSupabase || !cleSupabase) {
    return { supabase: null, reponseSupabase }
  }

  const supabase = createServerClient(urlSupabase, cleSupabase, {
    cookies: {
      get(nom: string) {
        return request.cookies.get(nom)?.value
      },
      set(nom: string, valeur: string, options: CookieOptions) {
        request.cookies.set({ name: nom, value: valeur, ...options })
        reponseSupabase = NextResponse.next({
          request,
        })
        reponseSupabase.cookies.set({ name: nom, value: valeur, ...options })
      },
      remove(nom: string, options: CookieOptions) {
        request.cookies.set({ name: nom, value: '', ...options })
        reponseSupabase = NextResponse.next({
          request,
        })
        reponseSupabase.cookies.set({ name: nom, value: '', ...options })
      },
    },
  })

  return { supabase, reponseSupabase }
}
