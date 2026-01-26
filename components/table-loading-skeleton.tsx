export function TableLoadingSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden p-6 flex flex-col">
      {/* Title skeleton */}
      <div className="h-6 bg-muted rounded w-32 mb-4 animate-pulse shrink-0" />

      {/* Chart skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-40 h-40 rounded-full bg-muted animate-pulse mb-4" />

        {/* Legend skeleton */}
        <div className="flex justify-center gap-4">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
