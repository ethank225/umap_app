"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"

interface EnforcementItem {
  site: string
  violations: number
  avgPercentDiff: number
  maxPercentDiff: number
  products: number
  avgConfidenceScore: number
}

interface EnforcementSummaryProps {
  data: EnforcementItem[]
  onSiteClick?: (site: string) => void
  isLoading?: boolean
}

type SortField = "site" | "avgConfidenceScore" | "violations" | "avgPercentDiff" | "maxPercentDiff" | null
type SortDirection = "asc" | "desc"

export function EnforcementSummary({ data, onSiteClick, isLoading }: EnforcementSummaryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const itemsPerPage = 10

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const SortIcon = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={(e) => { e.stopPropagation(); handleSort(field) }}
      className={`w-full text-inherit hover:text-foreground transition-colors ${sortField === field ? "text-foreground" : ""}`}
    >
      {label}{sortField === field && (sortDirection === "asc" ? " ▲" : " ▼")}
    </button>
  )

  const sortedData = useMemo(() => {
    if (!sortField) return data
    return [...data].sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]
      if (typeof aVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal
    })
  }, [data, sortField, sortDirection])

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  return (
    <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full min-h-[420px]">
      <div className="p-6 pb-0">
        <h2 className="text-lg font-semibold text-foreground mb-4">Enforcement Summary</h2>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading enforcement data...</span>
        </div>
      ) : data.length > 0 ? (
        <>
          <div className="px-6 h-[420px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center text-xs"><SortIcon field="site" label="Site" /></TableHead>
                  <TableHead className="text-center text-xs w-[80px]"><SortIcon field="avgConfidenceScore" label="Confidence" /></TableHead>
                  <TableHead className="text-center text-xs w-[70px]"><SortIcon field="violations" label="Violations" /></TableHead>
                  <TableHead className="text-center text-xs w-[80px]"><SortIcon field="avgPercentDiff" label="Avg % Diff" /></TableHead>
                  <TableHead className="text-center text-xs w-[80px]"><SortIcon field="maxPercentDiff" label="Max % Diff" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow
                    key={item.site}
                    className={onSiteClick ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => onSiteClick?.(item.site)}
                  >
                    <TableCell className="font-medium text-xs text-center py-2">{item.site}</TableCell>
                    <TableCell className="py-2 text-center">
                      <Badge className={`flex mx-auto text-[10px] px-1.5 py-0 ${
                        item.avgConfidenceScore >= 70
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : item.avgConfidenceScore >= 30
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }`}>
                        {Math.round(item.avgConfidenceScore)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs text-destructive font-semibold py-2">
                      {item.violations}
                    </TableCell>
                    <TableCell className="text-center text-xs py-2">{item.avgPercentDiff.toFixed(2)}%</TableCell>
                    <TableCell className="text-center text-xs py-2">{item.maxPercentDiff.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-background">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center text-muted-foreground py-12 flex-1">
          No violations found
        </div>
      )}
    </div>
  )
}
