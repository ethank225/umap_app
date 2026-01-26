"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface EnforcementItem {
  site: string
  violations: number
  avgPercentDiff: number
  maxPercentDiff: number
  products: number
}

interface EnforcementSummaryProps {
  data: EnforcementItem[]
  onSiteClick?: (site: string) => void
}

export function EnforcementSummary({ data, onSiteClick }: EnforcementSummaryProps) {
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
      {data.length > 0 ? (
        <>
          <div className="px-6 h-[420px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead className="text-right">Violations</TableHead>
                  <TableHead className="text-right">Avg % Diff</TableHead>
                  <TableHead className="text-right">Max % Diff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow
                    key={item.site}
                    className={onSiteClick ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => onSiteClick?.(item.site)}
                  >
                    <TableCell className="font-medium">{item.site}</TableCell>
                    <TableCell className="text-right text-destructive font-semibold">
                      {item.violations}
                    </TableCell>
                    <TableCell className="text-right">{item.avgPercentDiff.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{item.maxPercentDiff.toFixed(2)}%</TableCell>
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
