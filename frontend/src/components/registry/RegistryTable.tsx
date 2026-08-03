import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, FileText, CheckCircle2, XCircle, Clock, Check } from "lucide-react";
import type { DocumentEntry } from "@/types/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import type { RegistryFilters } from "@/components/registry/AdvancedFilterPanel";
import { useAuthStore } from "@/store/authStore";

type SortField = "nr_inregistrare" | "cod" | "repartizare_dpt" | "mod_rezolvare" | "status";
type SortOrder = "asc" | "desc";

interface RegistryTableProps {
  entries: DocumentEntry[];
  filters: RegistryFilters;
  loading?: boolean;
  onDownloadFile: (fileId: number) => void;
  onUpdateStatus: (entryId: number, status: "validated" | "rejected") => Promise<void>;
}

const PAGE_SIZE = 7;

function containsText(value: string | undefined | null, query: string) {
  if (!value) return false;
  return value.toLowerCase().includes(query.toLowerCase());
}

export function RegistryTable({ entries, filters, loading = false, onDownloadFile, onUpdateStatus }: RegistryTableProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.permission_level === "full_access" || user?.is_owner;

  const [sortField, setSortField] = useState<SortField>("nr_inregistrare");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const processed = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const bySearch =
        !filters.search ||
        containsText(entry.rezumat, filters.search) ||
        containsText(entry.cod, filters.search) ||
        containsText(entry.nr_inregistrare, filters.search);

      const byDepartment = !filters.department || containsText(entry.repartizare_dpt, filters.department);
      
      // Allow filtering by status text (pending, validated, rejected) or the iesire_intrare field
      const byStatus = !filters.status || 
        containsText(entry.iesire_intrare, filters.status) ||
        containsText(entry.status, filters.status);

      return bySearch && byDepartment && byStatus;
    });

    const sorted = filtered.sort((a, b) => {
      const left = (a[sortField as keyof DocumentEntry] as string)?.toLowerCase?.() ?? "";
      const right = (b[sortField as keyof DocumentEntry] as string)?.toLowerCase?.() ?? "";

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

  async function handleStatusChange(id: number, status: "validated" | "rejected") {
    setProcessingId(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setProcessingId(null);
    }
  }

  function renderStatusBadge(status?: string) {
    switch (status) {
      case "validated":
        return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20 font-normal"><Check className="mr-1 h-3 w-3" /> Validated</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-500/20 font-normal"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-red-500/20 font-normal"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="font-normal">{status || "legacy"}</Badge>;
    }
  }

  return (
    <div className="flex flex-col w-full">
      {/* Table Summary Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/5">
        <span className="text-sm font-medium text-foreground">
          {processed.length} {processed.length === 1 ? 'entry' : 'entries'} found
        </span>
      </div>

      <div className="p-0">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : current.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-3 h-8 w-8 text-muted-foreground opacity-50" />
            <h4 className="text-sm font-medium text-foreground">No records match your criteria</h4>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or upload a new PDF.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/10 text-muted-foreground">
                  <tr>
                    {[
                      { field: "nr_inregistrare", label: "Nr" },
                      { field: "cod", label: "Cod" },
                      { field: "rezumat", label: "Rezumat" },
                      { field: "repartizare_dpt", label: "Departament" },
                      { field: "status", label: "Status" },
                      { field: "file_id", label: "Actions"},
                    ].map((col) => (
                      <th key={col.field} className="px-5 py-3 text-left font-medium">
                        {col.field === "rezumat" || col.field === "file_id" ? (
                          col.label
                        ) : (
                          <button 
                            className="inline-flex items-center gap-1 hover:text-foreground transition-colors" 
                            onClick={() => toggleSort(col.field as SortField)}
                          >
                            {col.label}
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
                  {current.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{entry.nr_inregistrare}</td>
                      <td className="px-5 py-3 text-muted-foreground">{entry.cod}</td>
                      <td className="max-w-[300px] px-5 py-3 text-muted-foreground truncate" title={entry.rezumat}>
                        {entry.rezumat}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="secondary" className="font-normal">{entry.repartizare_dpt || "N/A"}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        {renderStatusBadge(entry.status)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Admin Validation Controls */}
                          {isAdmin && entry.status === "pending" && (
                            <div className="flex items-center gap-1 mr-2 border-r border-border pr-2">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                disabled={processingId === entry.id}
                                onClick={() => handleStatusChange(entry.id, "validated")}
                                title="Approve"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={processingId === entry.id}
                                onClick={() => handleStatusChange(entry.id, "rejected")}
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          
                          {/* PDF Download */}
                          {entry.file_id ? (
                            <Button size="sm" variant="outline" className="h-8 bg-background" onClick={() => onDownloadFile(entry.file_id!)}>
                              <FileText className="mr-2 h-3.5 w-3.5" />
                              View PDF
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground px-2">No file</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/5">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Prev
                </Button>
                <Button variant="outline" size="sm" className="h-8" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}