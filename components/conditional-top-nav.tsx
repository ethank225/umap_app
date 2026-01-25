'use client'

import { usePathname } from "next/navigation"
import { TopNav } from "./top-nav"

export function ConditionalTopNav() {
  const pathname = usePathname()

  // Don't show nav on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null
  }

  return <TopNav />
}
