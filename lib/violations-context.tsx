"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ViolationsContextType {
  selectedIds: Set<string>
  setSelectedIds: (ids: Set<string>) => void
  currentSite: string | null
  setCurrentSite: (site: string | null) => void
}

const ViolationsContext = createContext<ViolationsContextType | undefined>(undefined)

export function ViolationsProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [currentSite, setCurrentSite] = useState<string | null>(null)

  return (
    <ViolationsContext.Provider
      value={{
        selectedIds,
        setSelectedIds,
        currentSite,
        setCurrentSite,
      }}
    >
      {children}
    </ViolationsContext.Provider>
  )
}

export function useViolations() {
  const context = useContext(ViolationsContext)
  if (context === undefined) {
    throw new Error("useViolations must be used within a ViolationsProvider")
  }
  return context
}
