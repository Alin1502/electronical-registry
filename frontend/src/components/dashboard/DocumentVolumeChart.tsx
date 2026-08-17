import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { DocumentEntry } from "@/types/registry";

interface DocumentVolumeChartProps {
  entries: DocumentEntry[];
  period?: "6months" | "12months";
}

const FLOW_COLORS = {
  input: "#334155",
  output: "#0f766e",
  internal: "#94a3b8",
};

export function DocumentVolumeChart({ entries, period = "6months" }: DocumentVolumeChartProps) {
  // Aggregate entries by month and flow type
  const monthData: Record<string, { label: string; input: number; output: number; internal: number }> = {};

  entries.forEach((entry) => {
    if (entry.status === "rejected") return;

    const date = new Date(entry.created_at);
    const monthKey = date.toISOString().slice(0, 7);
    const monthLabel = date.toLocaleDateString("ro-RO", { month: "short", year: "2-digit" });

    if (!monthData[monthKey]) {
      monthData[monthKey] = { label: monthLabel, input: 0, output: 0, internal: 0 };
    }

    const flowType = entry.iesire_intrare?.toLowerCase() || "internal";
    if (flowType.includes("intrare") || flowType.includes("input")) {
      monthData[monthKey].input++;
    } else if (flowType.includes("iesire") || flowType.includes("output")) {
      monthData[monthKey].output++;
    } else {
      monthData[monthKey].internal++;
    }
  });

  const chartData = Object.entries(monthData)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([, data]) => ({ month: data.label, input: data.input, output: data.output, internal: data.internal }))
    .slice(-6);

  return (
    <div className="flex flex-col border border-border bg-background p-5 rounded-md">
      <h3 className="text-sm font-medium mb-6 text-foreground">Distribuția Documentelor</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="month" fontSize={12} tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
            <YAxis fontSize={12} tick={{ fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "0.5rem",
                color: "hsl(var(--foreground))",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              }}
              itemStyle={{
                fontWeight: 500,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#6b7280", paddingTop: "10px" }} iconType="circle" />
            <Bar dataKey="input" stackId="a" fill={FLOW_COLORS.input} name="Input" radius={[4, 4, 0, 0]} />
            <Bar dataKey="output" stackId="a" fill={FLOW_COLORS.output} name="Output" radius={[4, 4, 0, 0]} />
            <Bar dataKey="internal" stackId="a" fill={FLOW_COLORS.internal} name="Internal" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}