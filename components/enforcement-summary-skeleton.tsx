export function EnforcementSummaryLoadingSkeleton() {
  return (
    <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full min-h-[420px]">
      <div className="p-6 pb-0">
        <div className="h-6 bg-muted rounded w-32 mb-4 animate-pulse" />
      </div>

      <div className="px-6 h-[420px] space-y-2">
        {/* Header skeleton */}
        <div className="grid grid-cols-5 gap-2 mb-3 sticky top-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse" />
          ))}
        </div>

        {/* Row skeletons */}
        {[...Array(6)].map((_, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-5 gap-2 py-2">
            {[...Array(5)].map((_, colIdx) => (
              <div
                key={colIdx}
                className="h-6 bg-muted rounded animate-pulse"
                style={{
                  animationDelay: `${(rowIdx * 5 + colIdx) * 50}ms`
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-background">
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
