import { useMemo } from "react"

interface Violation {
  id: number
  site: string
  name: string
  umap_cleaned_name: string
  product_link: string
  violation: boolean
  per_diff: number
}

interface ComplianceMetrics {
  sellersBreakinngUMAP: number
  sellersInCompliance: number
  listingsBreakingUMAP: number
  listingsInCompliance: number
  totalListings: number
}

export function useComplianceMetrics(violations: Violation[]): ComplianceMetrics {
  return useMemo(() => {
    const sellersWithViolations = new Set<string>()
    const sellersWithOnlyCompliantListings = new Set<string>()
    const allSellers = new Set<string>()

    const violatingListingIds = new Set<string>()
    const compliantListingIds = new Set<string>()

    for (const v of violations) {
      allSellers.add(v.site)
      const productName = v.name || v.umap_cleaned_name
      const listingId = `${v.site}||${productName}||${v.product_link}`

      if (v.violation) {
        violatingListingIds.add(listingId)
        sellersWithViolations.add(v.site)
      } else {
        compliantListingIds.add(listingId)
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
      listingsBreakingUMAP: violatingListingIds.size,
      listingsInCompliance: compliantListingIds.size,
      totalListings: violatingListingIds.size + compliantListingIds.size,
    }
  }, [violations])
}
