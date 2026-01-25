import { useMemo } from "react"

interface Violation {
  id: number
  name: string
  umap_cleaned_name: string
  site: string
  gender: string
  violation: boolean
  per_diff: number
  product_link: string
}

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
    const counts: Record<string, Set<string>> = {}
    for (const v of violations) {
      if (!counts[v.site]) {
        counts[v.site] = new Set()
      }
      const productName = v.name || v.umap_cleaned_name
      const listingId = `${v.site}||${productName}||${v.product_link}`
      counts[v.site].add(listingId)
    }
    return Object.entries(counts).reduce((acc, [site, set]) => {
      acc[site] = set.size
      return acc
    }, {} as Record<string, number>)
  }, [violations])

  const enforcementTableData = useMemo(() => {
    const siteStats: Record<string, {
      violations: number
      avgPercentDiff: number
      maxPercentDiff: number
      uniqueProducts: Set<string>
      uniqueListingIds: Set<string>
    }> = {}

    for (const v of violations) {
      if (v.violation) {
        if (!siteStats[v.site]) {
          siteStats[v.site] = {
            violations: 0,
            avgPercentDiff: 0,
            maxPercentDiff: v.per_diff || 0,
            uniqueProducts: new Set(),
            uniqueListingIds: new Set(),
          }
        }
        const productName = v.name || v.umap_cleaned_name
        const listingId = `${v.site}||${productName}||${v.product_link}`
        siteStats[v.site].uniqueListingIds.add(listingId)
        siteStats[v.site].uniqueProducts.add(productName)
        siteStats[v.site].avgPercentDiff += (v.per_diff || 0)
        siteStats[v.site].maxPercentDiff = Math.max(
          siteStats[v.site].maxPercentDiff,
          v.per_diff || 0
        )
      }
    }

    return Object.entries(siteStats)
      .map(([site, stats]) => ({
        site,
        violations: stats.uniqueListingIds.size,
        avgPercentDiff: stats.uniqueListingIds.size > 0 ? stats.avgPercentDiff / stats.uniqueListingIds.size : 0,
        maxPercentDiff: stats.maxPercentDiff,
        products: stats.uniqueProducts.size,
      }))
      .sort((a, b) => {
        if (b.violations !== a.violations) return b.violations - a.violations
        return a.avgPercentDiff - b.avgPercentDiff
      })
      .slice(0, 10)
  }, [violations])

  return {
    filteredViolations,
    siteBreakdown,
    enforcementTableData,
  }
}
