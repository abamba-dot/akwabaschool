'use client'

import { useSidebar } from '@/shared/lib/sidebar-context'
import { cn } from '@/shared/lib/utils'

export function ContenuPrincipal({ children }: { children: React.ReactNode }) {
  const { reduite } = useSidebar()
  return (
    <main
      id="main-content"
      className={cn(
        'flex flex-1 flex-col overflow-hidden transition-all duration-300',
        reduite ? 'lg:ml-[72px]' : 'lg:ml-[240px]'
      )}
    >
      <div className="flex-1 overflow-y-auto">{children}</div>
    </main>
  )
}
