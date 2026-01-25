'use client'

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function TopNav() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear authentication
    document.cookie = 'authenticated=; path=/; max-age=0'
    localStorage.removeItem('authenticated')
    localStorage.removeItem('username')

    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">UM</span>
          </div>
          <span className="font-semibold text-foreground">UMAP Monitor</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  )
}
