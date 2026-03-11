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
import { Mail, AlertTriangle, XCircle, Loader2, RefreshCw, Clock } from "lucide-react"
import { TableLoadingSkeleton } from "./table-loading-skeleton"
import type { Violation } from "@/types/violation"

// Mon & Thurs at 1am PST = 9am UTC
function getLastRefreshTime(): Date | null {
  const now = new Date()
  const refreshDays = [1, 2, 3, 4, 5] // Mon–Fri
  for (let daysBack = 0; daysBack <= 14; daysBack++) {
    const candidate = new Date(now)
    candidate.setUTCDate(candidate.getUTCDate() - daysBack)
    candidate.setUTCHours(9, 0, 0, 0)
    if (refreshDays.includes(candidate.getUTCDay()) && candidate <= now) {
      return candidate
    }
  }
  return null
}

function formatLastRefresh(date: Date | null): string {
  if (!date) return "Unknown"
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  })
  if (diffDays === 0) return `Today at ${timeStr}`
  if (diffDays === 1) return `Yesterday at ${timeStr}`
  const dayName = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" })
  return `${dayName} at ${timeStr}`
}

interface FiltersState {
  search: string
  site: string
  gender: string
  violationsOnly: boolean
  confidence: string
}

export function ViolationsDashboard() {
  const {
    selectedIds,
    setSelectedIds,
    currentSite,
    setCurrentSite,
  } = useViolations()

  const { violations, isLoading, error, lastFetchedAt, refetch } = useViolationsData()

  // Deduplicate violations per-site by unique listing (site + name)
  const deduplicatedViolations = useMemo(() => {
    const seen = new Set<string>()
    return violations.filter((violation) => {
      const violationName = violation.name || violation.umap_cleaned_name
      const key = `${violation.site}||${violationName}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }, [violations])

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [siteError, setSiteError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    site: "all",
    gender: "all",
    violationsOnly: true,
    confidence: "all",
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


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Violations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review pricing violations and select items for vendor outreach
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs rounded-lg border bg-muted/40 px-3 py-2 shrink-0">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <RefreshCw className="h-3 w-3 text-muted-foreground" />
            <span>Data loaded: {isLoading ? "Loading…" : formatLastRefresh(lastFetchedAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Runs Every Weekday @ 1am PST</span>
          </div>
        </div>
      </div>

      {/* Stale data banner */}
      {!isLoading && lastFetchedAt && getLastRefreshTime() && lastFetchedAt < getLastRefreshTime()! && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40 rounded-lg px-4 py-3 text-sm">
          <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-amber-800 dark:text-amber-300 flex-1">
            New data is available since 1am PST
          </span>
          <button
            onClick={refetch}
            className="font-medium text-amber-700 dark:text-amber-400 hover:underline"
          >
            Refresh now
          </button>
        </div>
      )}

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
        <EnforcementSummary data={enforcementTableData} onSiteClick={handleSiteClick} isLoading={isLoading} />
        <ComplianceChart
          violatingCount={complianceMetrics.sellersBreakinngUMAP}
          compliantCount={complianceMetrics.sellersInCompliance}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading violations...</span>
        </div>
      )}

      {/* Content - Hidden while loading */}
      {!isLoading && (
        <>
          {/* Filters */}
          <ViolationsFilters
            filters={filters}
            onFiltersChange={setFilters}
            violations={violations}
          />

      {/* Alerts Section */}
      {(error || siteError) && (
        <div className="space-y-3">
          {error && (
            <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive flex-1">{error}</p>
            </div>
          )}
          {siteError && (
            <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive flex-1">{siteError}</p>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading violations...</span>
        </div>
      )}

      {/* Table Controls - Selection Info & Actions */}
      {!isLoading && violations.length > 0 && (
        <div className="flex items-start justify-between gap-4 border-t pt-6">
          <div className="flex flex-col gap-3">
            {/* Draft Email Button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleDraftEmail}
                disabled={selectedIds.size === 0}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Draft Email
              </Button>
              {selectedIds.size > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} selected
                </span>
              )}
            </div>

            {/* Current site indicator */}
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

        </div>
      )}

          {/* Table */}
          {violations.length === 0 && !error && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>No violations found. Check back later for new data.</p>
            </div>
          )}

          {violations.length > 0 && (
            <ViolationsTable
              violations={filteredViolations}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              lockedSite={currentSite}
            />
          )}
        </>
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
