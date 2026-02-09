"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useState } from "react"

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

export function EnforcementSummary({ data, onSiteClick, isLoading }: EnforcementSummaryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Pagination calculations
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = data.slice(startIndex, endIndex)

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
                  <TableHead className="text-xs">Site</TableHead>
                  <TableHead className="text-xs text-center w-[80px]">Confidence</TableHead>
                  <TableHead className="text-xs text-right w-[70px]">Violations</TableHead>
                  <TableHead className="text-xs text-right w-[80px]">Avg % Diff</TableHead>
                  <TableHead className="text-xs text-right w-[80px]">Max % Diff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow
                    key={item.site}
                    className={onSiteClick ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => onSiteClick?.(item.site)}
                  >
                    <TableCell className="font-medium text-xs py-2">{item.site}</TableCell>
                    <TableCell className="py-2 text-center">
                      <Badge className={`text-[10px] px-1.5 py-0 ${
                        item.avgConfidenceScore >= 70
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : item.avgConfidenceScore >= 30
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }`}>
                        {Math.round(item.avgConfidenceScore)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-destructive font-semibold py-2">
                      {item.violations}
                    </TableCell>
                    <TableCell className="text-right text-xs py-2">{item.avgPercentDiff.toFixed(2)}%</TableCell>
                    <TableCell className="text-right text-xs py-2">{item.maxPercentDiff.toFixed(2)}%</TableCell>
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
