export function TopNav() {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-14 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">UM</span>
          </div>
          <span className="font-semibold text-foreground">UMAP Monitor</span>
        </div>
      </div>
    </header>
  )
}
