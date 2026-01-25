import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface EnforcementItem {
  site: string
  violations: number
  avgPercentDiff: number
  maxPercentDiff: number
  products: number
}

interface EnforcementSummaryProps {
  data: EnforcementItem[]
}

export function EnforcementSummary({ data }: EnforcementSummaryProps) {
  return (
    <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Enforcement Summary</h2>
      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead className="text-right">Violations</TableHead>
                <TableHead className="text-right">Avg % Diff</TableHead>
                <TableHead className="text-right">Max % Diff</TableHead>
                <TableHead className="text-right">Products</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.site}>
                  <TableCell className="font-medium">{item.site}</TableCell>
                  <TableCell className="text-right text-destructive font-semibold">
                    {item.violations}
                  </TableCell>
                  <TableCell className="text-right">{item.avgPercentDiff.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{item.maxPercentDiff.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{item.products}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No violations found
        </div>
      )}
    </div>
  )
}
