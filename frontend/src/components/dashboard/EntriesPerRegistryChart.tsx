import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentEntry } from "@/types/registry";

interface EntriesPerRegistryChartProps {
  entries: DocumentEntry[];
}

const REGISTER_COLORS: Record<string, string> = {
  contracte: "#3b82f6",
  "intrari/iesiri": "#8b5cf6",
  "decizii/hotarari": "#06b6d4",
  facturi: "#f59e0b",
  jurnal: "#10b981",
  inventar: "#ef4444",
  casa: "#ec4899",
  "unic de control": "#14b8a6",
  "evidenta a salariatilor": "#f97316",
};

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
      fill: REGISTER_COLORS[registry] || "#9ca3af",
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Entries per Registry</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" fontSize={12} />
            <YAxis dataKey="registry" type="category" fontSize={12} width={110} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
