import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentEntry } from "@/types/registry";

interface StatusDistributionChartProps {
  entries: DocumentEntry[];
}

const COLORS = {
  validated: "#10b981",
  pending: "#f59e0b",
  rejected: "#ef4444",
  archived: "#6366f1",
};

export function StatusDistributionChart({ entries }: StatusDistributionChartProps) {
  // Count entries by status (simulated based on fields)
  const statusCount = {
    validated: entries.filter((e) => e.mod_rezolvare?.toLowerCase().includes("validat")).length,
    pending: entries.filter((e) => !e.mod_rezolvare || e.mod_rezolvare === "").length,
    rejected: entries.filter((e) => e.mod_rezolvare?.toLowerCase().includes("respins")).length,
    archived: entries.filter((e) => e.mod_rezolvare?.toLowerCase().includes("arhiva")).length,
  };

  const chartData = [
    { name: "Validated", value: statusCount.validated, color: COLORS.validated },
    { name: "Pending", value: statusCount.pending, color: COLORS.pending },
    { name: "Rejected", value: statusCount.rejected, color: COLORS.rejected },
    { name: "Archived", value: statusCount.archived, color: COLORS.archived },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No status data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
