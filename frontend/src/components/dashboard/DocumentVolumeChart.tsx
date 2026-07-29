import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { DocumentEntry } from "@/types/registry";

interface DocumentVolumeChartProps {
  entries: DocumentEntry[];
  period?: "6months" | "12months";
}

export function DocumentVolumeChart({ entries, period = "6months" }: DocumentVolumeChartProps) {
  // Aggregate entries by month and flow type
  const monthData: Record<string, { input: number; output: number; internal: number }> = {};

  entries.forEach((entry) => {
    const date = new Date(entry.created_at);
    const monthKey = date.toLocaleDateString("ro-RO", { month: "short", year: "2-digit" });

    if (!monthData[monthKey]) {
      monthData[monthKey] = { input: 0, output: 0, internal: 0 };
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
    .map(([month, data]) => ({ month, ...data }))
    .slice(-6);

  return (
    <div className="flex flex-col border border-border bg-background p-5 rounded-md">
      <h3 className="text-sm font-medium mb-6 text-foreground">Document Volume by Flow</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="month" fontSize={12} tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
            <YAxis fontSize={12} tick={{ fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: 'none' }}
              cursor={{ fill: "rgba(0,0,0,0.02)" }} 
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#6b7280", paddingTop: "10px" }} iconType="circle" />
            <Bar dataKey="input" stackId="a" fill="#334155" name="Input" radius={[0, 0, 0, 0]} />
            <Bar dataKey="output" stackId="a" fill="#94a3b8" name="Output" radius={[0, 0, 0, 0]} />
            <Bar dataKey="internal" stackId="a" fill="#e2e8f0" name="Internal" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}