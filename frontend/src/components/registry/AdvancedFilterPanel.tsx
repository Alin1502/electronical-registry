import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RegistryFilters {
  search: string;
  department: string;
  status: string;
}

interface AdvancedFilterPanelProps {
  filters: RegistryFilters;
  onChange: (next: RegistryFilters) => void;
}

export function AdvancedFilterPanel({ filters, onChange }: AdvancedFilterPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4" />
          Advanced Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            placeholder="Search by summary, code, nr..."
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
          />
          <Input
            placeholder="Department"
            value={filters.department}
            onChange={(event) => onChange({ ...filters, department: event.target.value })}
          />
          <Input
            placeholder="Status (intrare/iesire)"
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value })}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ search: "", department: "", status: "" })}
          >
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
