'use client'

import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface SidebarContextType {
  reduite: boolean
  setReduite: (v: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  reduite: false,
  setReduite: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [reduite, setReduite] = useState(false)
  return <SidebarContext.Provider value={{ reduite, setReduite }}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => useContext(SidebarContext)
