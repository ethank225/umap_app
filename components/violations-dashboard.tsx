"use client"

import React from "react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ViolationsFilters } from "./violations-filters"
import { ViolationsTable } from "./violations-table"
import { EmailDraftModal } from "./email-draft-modal"
import { StatCard } from "./stat-card"
import { EnforcementSummary } from "./enforcement-summary"
import { ComplianceChart } from "./compliance-chart"
import { useViolations } from "@/lib/violations-context"
import { useViolationsData } from "./hooks/use-violations-data"
import { useFilteredViolations } from "./hooks/use-filtered-violations"
import { useComplianceMetrics } from "./hooks/use-compliance-metrics"
import { Mail, AlertTriangle, XCircle, Loader2, RefreshCw } from "lucide-react"
import { TableLoadingSkeleton } from "./table-loading-skeleton"
import { EnforcementSummaryLoadingSkeleton } from "./enforcement-summary-skeleton"

interface FiltersState {
  search: string
  site: string
  gender: string
  violationsOnly: boolean
}

export function ViolationsDashboard() {
  const {
    selectedIds,
    setSelectedIds,
    currentSite,
    setCurrentSite,
  } = useViolations()

  const { violations, isLoading, error } = useViolationsData()

  // Deduplicate violations by name to match table behavior
  const deduplicatedViolations = useMemo(() => {
    return violations.reduce((acc, violation) => {
      const violationName = violation.name || violation.umap_cleaned_name
      if (!acc.find((v) => (v.name || v.umap_cleaned_name) === violationName)) {
        acc.push(violation)
      }
      return acc
    }, [] as Violation[])
  }, [violations])

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [siteError, setSiteError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    site: "all",
    gender: "all",
    violationsOnly: true,
  })

  const { filteredViolations, enforcementTableData } = useFilteredViolations(deduplicatedViolations, filters)
  const complianceMetrics = useComplianceMetrics(deduplicatedViolations)

  const selectedViolationsList = useMemo(() => {
    return deduplicatedViolations.filter((v) => selectedIds.has(String(v.id)))
  }, [selectedIds, deduplicatedViolations])

  const handleSelectionChange = useCallback(
    (newIds: Set<string>) => {
      // If clearing all selections, reset the site lock
      if (newIds.size === 0) {
        setSelectedIds(newIds)
        setCurrentSite(null)
        setSiteError(null)
        return
      }

      // Get the violations being selected
      const newViolations = deduplicatedViolations.filter((v) => newIds.has(String(v.id)))
      const sites = new Set(newViolations.map((v) => v.site))

      // Check if trying to select from multiple sites
      if (sites.size > 1) {
        setSiteError("You can only select violations from one site at a time!")
        return
      }

      const selectedSite = newViolations[0]?.site || null

      // If there's already a locked site and the new selection is from a different site
      if (currentSite && selectedSite && currentSite !== selectedSite) {
        setSiteError(`You can only select violations from "${currentSite}". Clear your selection to choose a different site.`)
        return
      }

      setSiteError(null)
      setSelectedIds(newIds)
      setCurrentSite(selectedSite)
    },
    [currentSite, setSelectedIds, setCurrentSite, deduplicatedViolations]
  )

  const handleClearSelection = () => {
    setSelectedIds(new Set())
    setCurrentSite(null)
    setSiteError(null)
  }

  // Auto-dismiss site error after 4 seconds
  useEffect(() => {
    if (siteError) {
      const timer = setTimeout(() => {
        setSiteError(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [siteError])

  const handleDraftEmail = () => {
    setIsEmailModalOpen(true)
  }

  const handleSiteClick = (site: string) => {
    handleClearSelection()
    setFilters(prev => ({ ...prev, site }))
  }

  // Count violations by site (unique listings per site)
  const siteBreakdown = useMemo(() => {
    const counts: Record<string, Set<string>> = {}
    for (const v of deduplicatedViolations) {
      if (!counts[v.site]) {
        counts[v.site] = new Set()
      }
      // Create unique listing identifier
      const listingId = `${v.site}||${v.name || v.umap_cleaned_name}||${v.product_link}`
      counts[v.site].add(listingId)
    }

    // Convert sets to counts
    return Object.entries(counts).reduce((acc, [site, set]) => {
      acc[site] = set.size
      return acc
    }, {} as Record<string, number>)
  }, [deduplicatedViolations])

  // Calculate compliance metrics


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Violations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review pricing violations and select items for vendor outreach
          </p>
        </div>
        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
          )}
          <Button
            onClick={handleDraftEmail}
            disabled={selectedIds.size === 0}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Draft Email
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Sellers Breaking UMAP"
          value={complianceMetrics.sellersBreakinngUMAP}
          icon={AlertTriangle}
          color="destructive"
        />
        <StatCard
          label="Sellers In Compliance"
          value={complianceMetrics.sellersInCompliance}
          icon={AlertTriangle}
          color="success"
        />
        <StatCard
          label="Listings Breaking UMAP"
          value={complianceMetrics.listingsBreakingUMAP}
          icon={AlertTriangle}
          color="destructive"
        />
        <StatCard
          label="Listings In Compliance"
          value={complianceMetrics.listingsInCompliance}
          icon={AlertTriangle}
          color="success"
        />
      </div>

      {/* Enforcement Summary & Seller Donut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {isLoading ? (
          <EnforcementSummaryLoadingSkeleton />
        ) : (
          <EnforcementSummary data={enforcementTableData} onSiteClick={handleSiteClick} />
        )}
        <ComplianceChart
          violatingCount={complianceMetrics.sellersBreakinngUMAP}
          compliantCount={complianceMetrics.sellersInCompliance}
        />
      </div>

      {/* Filters */}
      <ViolationsFilters
        filters={filters}
        onFiltersChange={setFilters}
        violations={violations}
      />

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive flex-1">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading violations...</span>
        </div>
      )}

      {/* Site Error Alert */}
      {siteError && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <XCircle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive flex-1">{siteError}</p>
        </div>
      )}

      {/* Results count and current site indicator */}
      <div className="flex items-center justify-between min-h-[28px]">
        <div>
          {currentSite && selectedIds.size > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Selecting from:</span>
              <span className="font-medium text-primary">{currentSite}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Data update status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
          <RefreshCw className="h-3 w-3" />
          <span>Updated daily</span>
        </div>
      </div>

      {/* Table */}
      {isLoading && (
        <TableLoadingSkeleton />
      )}

      {!isLoading && violations.length === 0 && !error && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <p>No violations found. Check back later for new data.</p>
        </div>
      )}

      {!isLoading && violations.length > 0 && (
        <ViolationsTable
          violations={filteredViolations}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          lockedSite={currentSite}
        />
      )}

      {/* Email Draft Modal */}
      <EmailDraftModal
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        violations={selectedViolationsList}
      />
    </div>
  )
}
