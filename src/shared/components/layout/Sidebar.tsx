'use client'

import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  UserCog,
  CreditCard,
  ClipboardList,
  CalendarX,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSidebar } from '@/shared/lib/sidebar-context'
import { cn } from '@/shared/lib/utils'

const NAVIGATION = [
  { icone: LayoutDashboard, libelle: 'Dashboard', href: '/dashboard' },
  { icone: Users, libelle: 'Élèves', href: '/eleves' },
  { icone: BookOpen, libelle: 'Classes', href: '/classes' },
  { icone: UserCog, libelle: 'Enseignants', href: '/enseignants' },
  { icone: CreditCard, libelle: 'Paiements', href: '/paiements' },
  { icone: ClipboardList, libelle: 'Notes', href: '/notes' },
  { icone: CalendarX, libelle: 'Absences', href: '/absences' },
]

const NAVIGATION_BAS = [{ icone: Settings, libelle: 'Paramètres', href: '/parametres' }]

export function Sidebar() {
  const { reduite, setReduite } = useSidebar()
  const [mobileOuverte, setMobileOuverte] = useState(false)
  const chemin = usePathname()
  const { seDeconnecter } = useAuth()

  function estActif(href: string) {
    if (href === '/dashboard') return chemin === '/dashboard'
    return chemin.startsWith(href)
  }

  useEffect(() => {
    if (!mobileOuverte) return
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOuverte(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileOuverte])

  return (
    <>
      {/* Overlay mobile */}
      {mobileOuverte && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOuverte(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col',
          'border-r border-akwaba-bordure bg-akwaba-sombre',
          'transition-all duration-300 ease-in-out',
          reduite ? 'w-[72px]' : 'w-[240px]',
          mobileOuverte ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Navigation principale"
      >
        {/* En-tête sidebar */}
        <div
          className={cn(
            'flex h-14 flex-shrink-0 items-center border-b border-akwaba-bordure px-4',
            reduite ? 'justify-center' : 'justify-between'
          )}
        >
          {!reduite && (
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-akwaba-bleu/20 bg-akwaba-bleu/10">
                <GraduationCap className="h-4 w-4 text-akwaba-bleu" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-akwaba-texte">Akwaba IT</span>
            </Link>
          )}

          {reduite && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-akwaba-bleu/20 bg-akwaba-bleu/10">
              <GraduationCap className="h-4 w-4 text-akwaba-bleu" aria-hidden="true" />
            </div>
          )}

          <button
            onClick={() => setReduite(!reduite)}
            className={cn(
              'hidden h-6 w-6 items-center justify-center rounded-md lg:flex',
              'text-akwaba-muted hover:bg-akwaba-surface hover:text-akwaba-texte',
              'transition-all duration-200',
              reduite && 'mx-auto mt-1'
            )}
            aria-label={reduite ? 'Développer la sidebar' : 'Réduire la sidebar'}
          >
            {reduite ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAVIGATION.map((item) => {
            const Icone = item.icone
            const actif = estActif(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('nav-item', actif && 'actif', reduite && 'justify-center px-2')}
                aria-current={actif ? 'page' : undefined}
                title={reduite ? item.libelle : undefined}
              >
                <Icone className={cn('h-4 w-4 flex-shrink-0', actif ? 'text-akwaba-bleu' : '')} aria-hidden="true" />
                {!reduite && <span>{item.libelle}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Navigation bas */}
        <div className="space-y-1 border-t border-akwaba-bordure px-3 py-4">
          {NAVIGATION_BAS.map((item) => {
            const Icone = item.icone
            const actif = estActif(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('nav-item', actif && 'actif', reduite && 'justify-center px-2')}
                aria-current={actif ? 'page' : undefined}
                title={reduite ? item.libelle : undefined}
              >
                <Icone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {!reduite && <span>{item.libelle}</span>}
              </Link>
            )
          })}

          {/* Profil utilisateur */}
          <div
            className={cn(
              'mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5',
              'transition-colors hover:bg-akwaba-surface',
              reduite && 'justify-center px-2'
            )}
          >
            <div
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-akwaba-bleu/20"
              aria-hidden="true"
            >
              <span className="text-xs font-bold text-akwaba-bleu">AD</span>
            </div>
            {!reduite && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-akwaba-texte">Admin Directeur</p>
                  <p className="truncate text-xs text-akwaba-muted">admin@akwaba.edu</p>
                </div>
                <button
                  className="text-akwaba-muted transition-colors hover:text-akwaba-rouge"
                  aria-label="Se déconnecter"
                  onClick={async () => {
                    await seDeconnecter()
                    window.location.href = '/auth/connexion'
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Bouton menu mobile */}
      <button
        onClick={() => setMobileOuverte(true)}
        className="fixed bottom-6 left-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-akwaba-bleu shadow-lg transition-colors hover:bg-akwaba-bleu-clair lg:hidden"
        aria-label="Ouvrir le menu de navigation"
      >
        <Menu className="h-5 w-5 text-white" aria-hidden="true" />
      </button>
    </>
  )
}
