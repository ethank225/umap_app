"use client"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Violation } from "@/types/violation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SortField = "name" | "site" | "umap_price" | "list_price" | "per_diff" | "date" | null
type SortDirection = "asc" | "desc"

interface ViolationsTableProps {
  violations: Violation[]
  selectedIds: Set<string>
  onSelectionChange: (selectedIds: Set<string>) => void
  lockedSite: string | null
}

export function ViolationsTable({
  violations,
  selectedIds,
  onSelectionChange,
  lockedSite,
}: ViolationsTableProps) {
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Filter violations to only those from the locked site (or all if no site locked)
  const selectableViolations = lockedSite
    ? violations.filter((v) => v.site === lockedSite)
    : violations

  // Sort violations
  const sortedViolations = [...selectableViolations].sort((a, b) => {
    if (!sortField) return 0

    // Special handling for dates so we fallback to created_at when date is missing
    if (sortField === "date") {
      const aDate = new Date(a.date || a.created_at).getTime()
      const bDate = new Date(b.date || b.created_at).getTime()
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate
    }

    let aVal: any = a[sortField]
    let bVal: any = b[sortField]

    // Handle numeric comparisons
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal
    }

    // Handle string comparisons
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return 0
  })

  const allSelected =
    sortedViolations.length > 0 && sortedViolations.every((v) => selectedIds.has(String(v.id)))
  const someSelected = sortedViolations.some((v) => selectedIds.has(String(v.id))) && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(sortedViolations.map((v) => String(v.id))))
    }
  }

  const toggleOne = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    onSelectionChange(newSet)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  // Pagination calculations
  const totalPages = Math.ceil(sortedViolations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedViolations = sortedViolations.slice(startIndex, endIndex)

  const SortIcon = ({
    field,
    label,
  }: {
    field: SortField
    label: string
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      {sortField === field ? (
        sortDirection === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )
      ) : (
        <div className="h-4 w-4" />
      )}
    </button>
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (violations.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No violations match your filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-8 px-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all violations"
                  className={cn(someSelected && "data-[state=checked]:bg-primary/50")}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected
                    }
                  }}
                />
              </TableHead>
              <TableHead className="text-muted-foreground text-xs min-w-[120px] max-w-[200px]">
                <SortIcon field="name" label="Product" />
              </TableHead>
              <TableHead className="text-muted-foreground text-xs w-[100px]">
                <SortIcon field="site" label="Site" />
              </TableHead>
              <TableHead className="text-right text-muted-foreground text-xs w-[80px]">
                <SortIcon field="umap_price" label="UMAP" />
              </TableHead>
              <TableHead className="text-right text-muted-foreground text-xs w-[80px]">
                <SortIcon field="list_price" label="Observed" />
              </TableHead>
              <TableHead className="text-right text-muted-foreground text-xs w-[70px]">
                <SortIcon field="per_diff" label="Diff %" />
              </TableHead>
              <TableHead className="text-right text-muted-foreground text-xs w-[90px]">
                <SortIcon field="date" label="Date" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {paginatedViolations.map((violation) => {
            const isFromDifferentSite = lockedSite && violation.site !== lockedSite
            const isDisabled = Boolean(isFromDifferentSite && !selectedIds.has(String(violation.id)))

            const handleRowClick = (e: React.MouseEvent) => {
              // Check if clicking on checkbox or its cell
              const target = e.target as HTMLElement
              if (target.closest('[data-checkbox-cell]')) {
                return
              }

              // Open product link in new tab
              if (violation.product_link) {
                window.open(violation.product_link, '_blank', 'noopener,noreferrer')
              }
            }

            return (
              <TableRow
                key={violation.id}
                className={cn(
                  "border-border",
                  selectedIds.has(String(violation.id)) && "bg-primary/5",
                  isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50"
                )}
                onClick={handleRowClick}
              >
                <TableCell onClick={(e) => e.stopPropagation()} data-checkbox-cell className="px-2 w-8 h-10">
                  <Checkbox
                    checked={selectedIds.has(String(violation.id))}
                    onCheckedChange={() => !isDisabled && toggleOne(String(violation.id))}
                    aria-label={`Select ${violation.name || violation.umap_cleaned_name}`}
                    disabled={isDisabled}
                    className="w-4 h-4"
                  />
                </TableCell>
                <TableCell className="font-medium text-xs truncate max-w-[200px]" title={violation.name || violation.umap_cleaned_name}>
                  {violation.name || violation.umap_cleaned_name}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs truncate">{violation.site}</TableCell>
                <TableCell className="text-left tabular-nums text-xs px-2">
                  ${violation.umap_price.toFixed(2)}
                </TableCell>
                <TableCell className={cn(
                  "text-left tabular-nums font-medium text-xs px-2",
                  (violation.per_diff >= 0)
                    ? "text-green-600"
                    : violation.per_diff < 0
                    ? "text-destructive"
                    : "text-destructive"
                )}>
                  ${violation.list_price.toFixed(2)}
                </TableCell>
                <TableCell className={cn(
                  "text-left tabular-nums font-medium text-xs px-2",
                  (violation.per_diff >= 0)
                    ? "text-green-600"
                    : violation.per_diff < 0
                    ? "text-destructive"
                    : "text-destructive"
                )}>
                  {violation.per_diff?.toFixed(2) || '0.0'}%
                </TableCell>
                <TableCell className="text-left text-muted-foreground text-xs px-2">
                  {(() => {
                    const rawDate = violation.date || violation.created_at
                    if (!rawDate) return "--"
                    const d = new Date(rawDate)
                    return isNaN(d.getTime())
                      ? "--"
                      : d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", timeZone: "UTC" })
                  })()}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, sortedViolations.length)} of {sortedViolations.length} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
