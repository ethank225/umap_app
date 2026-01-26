import { useMemo } from "react"
import type { Violation } from "@/types/violation"

interface FiltersState {
  search: string
  site: string
  gender: string
  violationsOnly: boolean
}

interface UseFilteredViolationsReturn {
  filteredViolations: Violation[]
  siteBreakdown: Record<string, number>
  enforcementTableData: Array<{
    site: string
    violations: number
    avgPercentDiff: number
    maxPercentDiff: number
    products: number
  }>
}

export function useFilteredViolations(
  violations: Violation[],
  filters: FiltersState
): UseFilteredViolationsReturn {
  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      const productName = v.name || v.umap_cleaned_name || ''
      if (filters.search && !productName.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.site !== "all" && v.site !== filters.site) {
        return false
      }
      if (filters.gender !== "all" && v.gender !== filters.gender) {
        return false
      }
      if (filters.violationsOnly && !v.violation) {
        return false
      }
      return true
    })
  }, [filters, violations])

  const siteBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const v of violations) {
      counts[v.site] = (counts[v.site] || 0) + 1
    }
    return counts
  }, [violations])

  const enforcementTableData = useMemo(() => {
    const siteStats: Record<string, {
      rows: number
      sumPercentDiff: number
      maxPercentDiff: number
      uniqueProducts: Set<string>
    }> = {}

    for (const v of violations) {
      if (!v.violation) continue

      if (!siteStats[v.site]) {
        siteStats[v.site] = {
          rows: 0,
          sumPercentDiff: 0,
          maxPercentDiff: v.per_diff || 0,
          uniqueProducts: new Set<string>(),
        }
      }

      siteStats[v.site].rows += 1
      siteStats[v.site].sumPercentDiff += v.per_diff || 0
      siteStats[v.site].maxPercentDiff = Math.max(siteStats[v.site].maxPercentDiff, v.per_diff || 0)
      siteStats[v.site].uniqueProducts.add(v.name || v.umap_cleaned_name)
    }

    return Object.entries(siteStats)
      .map(([site, stats]) => ({
        site,
        violations: stats.rows,
        avgPercentDiff: stats.rows > 0 ? stats.sumPercentDiff / stats.rows : 0,
        maxPercentDiff: stats.maxPercentDiff,
        products: stats.uniqueProducts.size,
      }))
      .sort((a, b) => {
        if (b.violations !== a.violations) return b.violations - a.violations
        return a.avgPercentDiff - b.avgPercentDiff
      })
  }, [violations])

  return {
    filteredViolations,
    siteBreakdown,
    enforcementTableData,
  }
}
