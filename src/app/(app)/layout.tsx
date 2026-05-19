import { ContenuPrincipal } from '@/shared/components/layout/ContenuPrincipal'
import { Sidebar } from '@/shared/components/layout/Sidebar'
import { SidebarProvider } from '@/shared/lib/sidebar-context'

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-akwaba-noir">
        <Sidebar />
        <ContenuPrincipal>{children}</ContenuPrincipal>
      </div>
    </SidebarProvider>
  )
}
