import { useMemo } from "react"
import type { Violation } from "@/types/violation"

interface ComplianceMetrics {
  sellersBreakinngUMAP: number
  sellersInCompliance: number
  listingsBreakingUMAP: number
  listingsInCompliance: number
  totalListings: number
}

export function useComplianceMetrics(violations: Violation[]): ComplianceMetrics {
  return useMemo(() => {
    let sellersWithViolations = new Set<string>()
    let sellersWithOnlyCompliantListings = new Set<string>()
    let allSellers = new Set<string>()

    let violatingListings = 0
    let compliantListings = 0

    for (const v of violations) {
      allSellers.add(v.site)

      if (v.violation) {
        violatingListings += 1
        sellersWithViolations.add(v.site)
      } else {
        compliantListings += 1
      }
    }

    for (const seller of allSellers) {
      if (!sellersWithViolations.has(seller)) {
        sellersWithOnlyCompliantListings.add(seller)
      }
    }

    return {
      sellersBreakinngUMAP: sellersWithViolations.size,
      sellersInCompliance: sellersWithOnlyCompliantListings.size,
      listingsBreakingUMAP: violatingListings,
      listingsInCompliance: compliantListings,
      totalListings: violatingListings + compliantListings,
    }
  }, [violations])
}
