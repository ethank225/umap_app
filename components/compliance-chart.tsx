import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface ComplianceChartProps {
  violatingCount: number
  compliantCount: number
}

export function ComplianceChart({ violatingCount, compliantCount }: ComplianceChartProps) {

  const data = [
    {
      name: 'Violating',
      value: violatingCount,
    },
    {
      name: 'Compliant',
      value: compliantCount,
    },
  ].filter(item => item.value > 0)

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
      <h2 className="text-lg font-semibold text-foreground mb-4 shrink-0">Sellers Status</h2>
      {violatingCount > 0 || compliantCount >= 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={120}
                paddingAngle={0}
                dataKey="value"
                labelLine={false}
                label={false}
              >
                <Cell fill="#ef4444" /> {/* Red for violating */}
                <Cell fill="#22c55e" /> {/* Green for compliant */}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4 text-sm shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Violating: {violatingCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Compliant: {compliantCount}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  )
}
