import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: number
  icon?: React.ComponentType<{ className?: string }>
  color?: "default" | "destructive" | "success"
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "default",
}: StatCardProps) {
  const colorClasses = {
    default: "text-muted-foreground",
    destructive: "text-destructive",
    success: "text-green-600",
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground truncate">{label}</span>
        {Icon && <Icon className={cn("h-4 w-4 shrink-0", colorClasses[color])} />}
      </div>
      <p className={cn("text-2xl font-semibold mt-1", colorClasses[color])}>
        {value}
      </p>
    </div>
  )
}
