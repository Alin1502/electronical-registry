import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import type { DocumentEntry } from "@/types/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import type { RegistryFilters } from "@/components/registry/AdvancedFilterPanel";

type SortField = "nr_inregistrare" | "cod" | "repartizare_dpt" | "mod_rezolvare";
type SortOrder = "asc" | "desc";

interface RegistryTableProps {
  entries: DocumentEntry[];
  filters: RegistryFilters;
  loading?: boolean;
}

const PAGE_SIZE = 7;

function containsText(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export function RegistryTable({ entries, filters, loading = false }: RegistryTableProps) {
  const [sortField, setSortField] = useState<SortField>("nr_inregistrare");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);

  const processed = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const bySearch =
        !filters.search ||
        containsText(entry.rezumat, filters.search) ||
        containsText(entry.cod, filters.search) ||
        containsText(entry.nr_inregistrare, filters.search);

      const byDepartment = !filters.department || containsText(entry.repartizare_dpt, filters.department);
      const byStatus = !filters.status || containsText(entry.iesire_intrare, filters.status);

      return bySearch && byDepartment && byStatus;
    });

    const sorted = filtered.sort((a, b) => {
      const left = a[sortField]?.toLowerCase?.() ?? "";
      const right = b[sortField]?.toLowerCase?.() ?? "";

      if (left < right) return sortOrder === "asc" ? -1 : 1;
      if (left > right) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [entries, filters, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const current = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    setPage(1);
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortOrder("asc");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Registry Entries</CardTitle>
        <Badge variant="default">{processed.length} items</Badge>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : current.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
            <FileText className="mb-3 h-8 w-8 text-muted-foreground" />
            <h4 className="text-base font-semibold">No records yet</h4>
            <p className="mt-1 text-sm text-muted-foreground">Upload a PDF and create the first registry entry for this tab.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    {[
                      { field: "nr_inregistrare", label: "Nr" },
                      { field: "cod", label: "Cod" },
                      { field: "rezumat", label: "Rezumat" },
                      { field: "repartizare_dpt", label: "Departament" },
                      { field: "mod_rezolvare", label: "Rezolvare" },
                    ].map((col) => (
                      <th key={col.field} className="px-4 py-3 text-left font-medium">
                        {col.field === "rezumat" ? (
                          col.label
                        ) : (
                          <button className="inline-flex items-center gap-1" onClick={() => toggleSort(col.field as SortField)}>
                            {col.label}
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {current.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{entry.nr_inregistrare}</td>
                      <td className="px-4 py-3">{entry.cod}</td>
                      <td className="max-w-[360px] px-4 py-3 text-muted-foreground">{entry.rezumat}</td>
                      <td className="px-4 py-3">
                        <Badge variant="default">{entry.repartizare_dpt || "N/A"}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-muted-foreground">{entry.mod_rezolvare || "-"}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{formatDateTime(new Date())}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
