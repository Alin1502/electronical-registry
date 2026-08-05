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

  function RegistryTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: { fullName?: string; count?: number } }> }) {
    if (!active || !payload?.length) return null;

    const item = payload[0]?.payload;
    if (!item) return null;

    return (
      <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-sm">
        <p className="font-medium">{item.fullName ?? "Unknown registry"}</p>
        <p className="mt-1 text-xs text-muted-foreground">{item.count ?? 0} entries</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-border bg-background p-5 rounded-md">
      <h3 className="text-sm font-medium mb-6 text-foreground">Entries per Registry</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" fontSize={12} tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
            <YAxis dataKey="registry" type="category" fontSize={12} width={110} tick={{ fill: "hsl(var(--foreground))" }} axisLine={{ stroke: "#e5e7eb" }} />
            <Tooltip 
              content={<RegistryTooltip />}
              cursor={{ fill: "rgba(0,0,0,0.02)" }} 
            />
            <Bar dataKey="count" fill="#475569" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}