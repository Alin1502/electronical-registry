import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentEntry } from "@/types/registry";

interface ProcessingThroughputChartProps {
  entries: DocumentEntry[];
}

export function ProcessingThroughputChart({ entries }: ProcessingThroughputChartProps) {
  // Aggregate by day
  const dayData: Record<string, { created: number; processed: number }> = {};

  entries.forEach((entry) => {
    const date = new Date(entry.created_at);
    const dayKey = date.toLocaleDateString("ro-RO", { month: "short", day: "numeric" });

    if (!dayData[dayKey]) {
      dayData[dayKey] = { created: 0, processed: 0 };
    }

    dayData[dayKey].created++;

    // Simulate processed entries based on mod_rezolvare
    if (entry.mod_rezolvare) {
      dayData[dayKey].processed++;
    }
  });

  const chartData = Object.entries(dayData)
    .map(([day, data]) => ({ day, ...data }))
    .slice(-14);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Processing Throughput (last 14 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Created" strokeWidth={2} dot={{ r: 3 }} />
            <Line
              type="monotone"
              dataKey="processed"
              stroke="#10b981"
              name="Processed"
              strokeWidth={2}
              dot={{ r: 3 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
