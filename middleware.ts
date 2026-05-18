import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/infrastructure/supabase/middleware'

const routesProtegees = [
  '/dashboard',
  '/eleves',
  '/classes',
  '/enseignants',
  '/paiements',
  '/notes',
  '/absences',
  '/parametres',
]

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const cleSupabase = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const demoActive = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true'
  const chemin = request.nextUrl.pathname
  const estProtegee = routesProtegees.some((route) => chemin.startsWith(route))

  // Routes publiques (auth, API publique, assets)
  if (!estProtegee) {
    return NextResponse.next()
  }

  // Si aucun système d'auth n'est configuré et démo désactivée → bloquer
  if (!supabaseUrl && !cleSupabase && !demoActive) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/connexion'
    url.searchParams.set('redirect', chemin)
    return NextResponse.redirect(url)
  }

  // Mode démo local : vérifier le cookie de session
  if (!supabaseUrl || !cleSupabase) {
    const demoSession = request.cookies.get('akwaba-demo-session')?.value
    if (demoActive && demoSession === 'connecte') {
      return NextResponse.next()
    }
    const url = request.nextUrl.clone()
    url.pathname = '/auth/connexion'
    url.searchParams.set('redirect', chemin)
    return NextResponse.redirect(url)
  }

  // Mode Supabase standard — vérification serveur du JWT
  const { supabase, reponseSupabase } = createClient(request)
  if (!supabase) return reponseSupabase

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/connexion'
    url.searchParams.set('redirect', chemin)
    return NextResponse.redirect(url)
  }

  return reponseSupabase
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/eleves/:path*',
    '/classes/:path*',
    '/enseignants/:path*',
    '/paiements/:path*',
    '/notes/:path*',
    '/absences/:path*',
    '/parametres/:path*',
  ],
}
