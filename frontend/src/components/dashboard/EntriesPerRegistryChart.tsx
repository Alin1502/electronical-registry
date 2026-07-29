import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DocumentEntry } from "@/types/registry";

interface EntriesPerRegistryChartProps {
  entries: DocumentEntry[];
}

export function EntriesPerRegistryChart({ entries }: EntriesPerRegistryChartProps) {
  // Count entries by register type
  const registryCount: Record<string, number> = {};

  entries.forEach((entry) => {
    const key = entry.register_type || "unknown";
    registryCount[key] = (registryCount[key] || 0) + 1;
  });

  const chartData = Object.entries(registryCount)
    .map(([registry, count]) => ({
      registry: registry.substring(0, 15),
      count,
      fullName: registry,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col border border-border bg-background p-5 rounded-md">
      <h3 className="text-sm font-medium mb-6 text-foreground">Entries per Registry</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" fontSize={12} tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
            <YAxis dataKey="registry" type="category" fontSize={12} width={110} tick={{ fill: "#374151" }} axisLine={{ stroke: "#e5e7eb" }} />
            <Tooltip 
              contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: 'none' }}
              cursor={{ fill: "rgba(0,0,0,0.02)" }} 
            />
            <Bar dataKey="count" fill="#475569" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}