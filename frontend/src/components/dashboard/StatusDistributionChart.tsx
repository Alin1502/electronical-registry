import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { DocumentEntry } from "@/types/registry";

interface StatusDistributionChartProps {
  entries: DocumentEntry[];
}

const COLORS = {
  validated: "#059669", // Muted Emerald
  pending: "#d97706",   // Muted Ochre
  rejected: "#e11d48",  // Muted Rose
  archived: "#64748b",  // Slate
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
      <div className="flex flex-col border border-border bg-background p-5 rounded-md">
        <h3 className="text-sm font-medium mb-6 text-foreground">Status Distribution</h3>
        <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
          No status data available
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-border bg-background p-5 rounded-md">
      <h3 className="text-sm font-medium mb-6 text-foreground">Status Distribution</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip 
              contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: 'none' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#6b7280" }} iconType="circle" />
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} stroke="none" label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}