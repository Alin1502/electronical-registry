import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
    <div className="flex flex-col border border-border bg-background p-5 rounded-md">
      <h3 className="text-sm font-medium mb-6 text-foreground">Processing Throughput (last 14 days)</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: -20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="day" fontSize={12} tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
            <YAxis fontSize={12} tick={{ fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: 'none' }}
              cursor={{ stroke: "#e5e7eb", strokeWidth: 1, strokeDasharray: "3 3" }} 
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#6b7280", paddingTop: "10px" }} iconType="circle" />
            <Line type="monotone" dataKey="created" stroke="#334155" name="Created" strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: "#334155" }} activeDot={{ r: 5 }} />
            <Line
              type="monotone"
              dataKey="processed"
              stroke="#94a3b8"
              name="Processed"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: "#94a3b8" }}
              activeDot={{ r: 5 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}