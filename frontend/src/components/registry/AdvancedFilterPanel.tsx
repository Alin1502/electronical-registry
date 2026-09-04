import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  // Only show the reset button if at least one filter is active
  const hasFilters = filters.search !== "" || filters.department !== "" || filters.status !== "";

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          Filtre
        </h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            onClick={() => onChange({ search: "", department: "", status: "" })}
          >
            <X className="mr-2 h-4 w-4" />
            Șterge filtrele
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          placeholder="Filtrează după nr sau rezumat"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          className="bg-background focus-visible:ring-1"
        />
        <Input
          placeholder="Departament"
          value={filters.department}
          onChange={(event) => onChange({ ...filters, department: event.target.value })}
          className="bg-background focus-visible:ring-1"
        />
        <Input
          placeholder="Status (intrare/iesire)"
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value })}
          className="bg-background focus-visible:ring-1"
        />
      </div>
    </div>
  );
}