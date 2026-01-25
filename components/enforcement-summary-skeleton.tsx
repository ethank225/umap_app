export function EnforcementSummaryLoadingSkeleton() {
  return (
    <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 flex flex-col max-h-[600px]">
      <div className="h-6 bg-muted rounded w-32 mb-4 animate-pulse shrink-0" />

      <div className="overflow-y-auto flex-1 space-y-2">
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
    </div>
  )
}
