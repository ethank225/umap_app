export function TableLoadingSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden p-4 space-y-3">
      {/* Header row */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded animate-pulse" />
        ))}
      </div>
      
      {/* Data rows */}
      {[...Array(5)].map((_, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, colIdx) => (
            <div 
              key={colIdx} 
              className="h-8 bg-muted rounded animate-pulse" 
              style={{
                animationDelay: `${(rowIdx * 7 + colIdx) * 50}ms`
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
