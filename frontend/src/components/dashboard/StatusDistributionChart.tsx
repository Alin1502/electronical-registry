import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { DocumentEntry } from "@/types/registry";

interface StatusDistributionChartProps {
  entries: DocumentEntry[];
}

const COLORS = {
  validated: "hsl(var(--success))",
  pending: "hsl(var(--warning))",
  rejected: "hsl(var(--danger))",
  archived: "hsl(var(--muted-foreground))",
};

function normalizeStatus(entry: DocumentEntry) {
  const status = entry.status?.trim().toLowerCase();
  if (status === "validated" || status === "pending" || status === "rejected" || status === "archived") {
    return status;
  }

  const resolution = entry.mod_rezolvare?.trim().toLowerCase() ?? "";
  if (resolution.includes("validat")) return "validated";
  if (resolution.includes("respins")) return "rejected";
  if (resolution.includes("arhiva")) return "archived";

  return "pending";
}

export function StatusDistributionChart({ entries }: StatusDistributionChartProps) {
  const statusCount = {
    validated: entries.filter((entry) => normalizeStatus(entry) === "validated").length,
    pending: entries.filter((entry) => normalizeStatus(entry) === "pending").length,
    rejected: entries.filter((entry) => normalizeStatus(entry) === "rejected").length,
    archived: entries.filter((entry) => normalizeStatus(entry) === "archived").length,
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
      <div className="h-[250px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "0.5rem",
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} iconType="circle" />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={78}
              paddingAngle={chartData.length > 1 ? 3 : 0}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            >
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