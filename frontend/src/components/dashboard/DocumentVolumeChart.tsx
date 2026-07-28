import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Document Volume by Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="input" stackId="a" fill="#3b82f6" name="Input" />
            <Bar dataKey="output" stackId="a" fill="#8b5cf6" name="Output" />
            <Bar dataKey="internal" stackId="a" fill="#06b6d4" name="Internal" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
