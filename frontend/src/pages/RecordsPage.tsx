import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Download, FilePlus2, FileText, Link2, Trash2, UploadCloud, FileQuestion } from "lucide-react";
import { toast } from "sonner";
import {
  createEntry,
  downloadAllPdfs,
  downloadExcel,
  getDepartments,
  getDownloadUrl,
  getEntries,
  getFiles,
  getNextNr,
  removeFile,
  uploadFile,
  updateEntryStatus,
} from "@/api/client";
import { AdvancedFilterPanel, type RegistryFilters } from "@/components/registry/AdvancedFilterPanel";
import { RegistryRoomsTable } from "@/components/registry/RegistryRoomsTable";
import { RegistryTable } from "@/components/registry/RegistryTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import type { DocumentEntry, EntryPayload, NamedEntity, UploadedFile } from "@/types/registry";
import { formatDate } from "@/lib/utils";

const REGISTERS = [
  "contracte",
  "intrari/iesiri",
  "decizii/hotarari",
  "facturi",
  "jurnal",
  "inventar",
  "casa",
  "unic de control",
  "evidenta a salariatilor",
] as const;

const REGISTER_LABELS: Record<string, string> = {
  contracte: "Contracte",
  "intrari/iesiri": "Intrări / Ieșiri",
  "decizii/hotarari": "Decizii / Hotărâri",
  facturi: "Facturi",
  jurnal: "Jurnal",
  inventar: "Inventar",
  casa: "Casa",
  "unic de control": "Unic de Control",
  "evidenta a salariatilor": "Evidența Salariaților",
};

const initialForm: EntryPayload = {
  register_type: REGISTERS[0],
  nr_inregistrare: "",
  cod: "",
  iesire_intrare: "",
  nr_data_emitent: "",
  nr_data_destinator: "",
  rezumat: "",
  repartizare_dpt: "",
  mod_rezolvare: "",
  nr_pag_anexe: "",
  file_id: null,
};

export default function RecordsPage() {
  const navigate = useNavigate();
  const { register } = useParams();
  const { token, user } = useAuthStore();
  const isAdmin = user?.is_owner;
  const isReadOnlyUser = user?.permission_level === "read";

  const [entries, setEntries] = useState<DocumentEntry[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [departments, setDepartments] = useState<NamedEntity[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filters, setFilters] = useState<RegistryFilters>({ search: "", department: "", status: "" });
  const [excelDialogOpen, setExcelDialogOpen] = useState(false);
  const [excelUseEntirePeriod, setExcelUseEntirePeriod] = useState(true);
  const [excelStartDate, setExcelStartDate] = useState("");
  const [excelEndDate, setExcelEndDate] = useState("");
  const [exportingExcel, setExportingExcel] = useState(false);

  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entryForm, setEntryForm] = useState<EntryPayload>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [linkedFileName, setLinkedFileName] = useState<string>("");

  const location = useLocation();
  const activeRegister = register as (typeof REGISTERS)[number];
  const isValidRegister = REGISTERS.includes(register as (typeof REGISTERS)[number]);


  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (register && !activeRegister) {
      navigate("/records", { replace: true });
    }
  }, [activeRegister, navigate, register, token]);

  useEffect(() => {
    if (location.state && location.state.targetSearch) {
      setFilters(prev => ({ ...prev, search: location.state.targetSearch }));
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);


  useEffect(() => {
    if (!token || !activeRegister) return;
    void loadDepartments();
    void refreshData(activeRegister);
    setEntryForm((prev) => ({ ...prev, register_type: activeRegister }));
  }, [activeRegister, token]);

  const registerFiles = useMemo(
    () => files.filter((file) => file.register_type === activeRegister),
    [files, activeRegister],
  );

  const activeRegisterLabel = activeRegister ? REGISTER_LABELS[activeRegister] ?? activeRegister : "";

  const registryRooms = REGISTERS.map((room) => ({
    code: room,
    label: REGISTER_LABELS[room] ?? room,
  }));

  async function loadDepartments() {
    if (!token) return;
    try {
      const data = await getDepartments(token);
      setDepartments(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-au putut încărca departamentele");
    }
  }

  async function refreshData(registerType: string) {
    if (!token) return;
    setLoadingEntries(true);
    setLoadingFiles(true);

    try {
      const [entryData, fileData, nextNr] = await Promise.all([
        getEntries(token, registerType),
        getFiles(token),
        getNextNr(token, registerType),
      ]);
      setEntries(entryData);
      setFiles(fileData);
      setEntryForm((prev) => ({
        ...prev,
        register_type: registerType,
        nr_inregistrare: nextNr.nr_inregistrare,
        cod: nextNr.cod,
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoadingEntries(false);
      setLoadingFiles(false);
    }
  }

  function validateEntry(form: EntryPayload) {
    const next: Record<string, string> = {};
    if (!form.rezumat.trim()) next.rezumat = "Rezumatul trebuie completat";
    if (!form.iesire_intrare.trim()) next.iesire_intrare = "Direcția trebuie completată";
    if (!form.repartizare_dpt.trim()) next.repartizare_dpt = "Departamentul trebuie completat";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleCreateEntry() {
    if (!token) return;
    if (isReadOnlyUser) {
      toast.error("Nu ai atributele necesare pentru a adăuga documente. Contactează un administrator");
      return;
    }
    if (!validateEntry(entryForm)) return;

    try {
      await createEntry(token, entryForm);
      toast.success("Entry created successfully");
      setEntryModalOpen(false);
      setLinkedFileName("");
      await refreshData(activeRegister);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create entry");
    }
  }

  function handleEntryModalChange(open: boolean) {
    setEntryModalOpen(open);
    if (!open) {
      setLinkedFileName("");
      setEntryForm((prev) => ({ ...prev, file_id: null }));
    }
  }

  async function handleUploadFile() {
    if (!token || !selectedFile) return;
    if (isReadOnlyUser) {
      toast.error("Read-only users cannot upload PDFs.");
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadFile(token, selectedFile, activeRegister);
      const nextNr = await getNextNr(token, activeRegister);

      setEntryForm((prev) => ({
        ...prev,
        register_type: activeRegister,
        nr_inregistrare: nextNr.nr_inregistrare,
        cod: nextNr.cod,
        file_id: uploaded.file_id,
      }));

      setLinkedFileName(selectedFile.name);
      setEntryModalOpen(true);
      toast.success("PDF uploaded. Continue with entry details.");
      setSelectedFile(null);
      await refreshData(activeRegister);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteFile(fileId: number) {
    if (!token) return;
    try {
      await removeFile(token, fileId);
      toast.success("File deleted");
      await refreshData(activeRegister);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  function resetExcelDialog() {
    setExcelUseEntirePeriod(true);
    setExcelStartDate("");
    setExcelEndDate("");
  }

  async function handleDownloadExcel() {
    if (!token) return;

    if (!excelUseEntirePeriod) {
      if (!excelStartDate || !excelEndDate) {
        toast.error("Select both start and end dates, or select entire period");
        return;
      }

      if (excelStartDate > excelEndDate) {
        toast.error("Start date cannot be after end date");
        return;
      }
    }

    setExportingExcel(true);
    try {
      await downloadExcel(token, activeRegister, excelUseEntirePeriod ? undefined : {
        startDate: excelStartDate,
        endDate: excelEndDate,
      });
      toast.success("Excel downloaded");
      setExcelDialogOpen(false);
      resetExcelDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Excel export failed");
    } finally {
      setExportingExcel(false);
    }
  }

  async function handleDownloadFile(fileId: number) {
    if (!token) return;
    try {
      const result = await getDownloadUrl(token, fileId);
      window.open(result.download_url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed");
    }
  }


  if (!register) {
    return (
      <div className="space-y-8">
        <section className="flex flex-col gap-1 border-b border-border pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Registry Selection</h1>
          <p className="text-sm text-muted-foreground">Select a register type below to view and manage its entries.</p>
        </section>
        <RegistryRoomsTable rooms={registryRooms} onSelectRoom={(roomCode) => navigate(`/records/${encodeURIComponent(roomCode)}`)} />
      </div>
    );
  }


  
  if (!isValidRegister) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4 text-center">
        <FileQuestion className="h-16 w-16 text-muted-foreground opacity-50" />
        <h2 className="text-2xl font-semibold text-foreground">Register Not Found</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          The registry you are looking for "{register}" does not exist, or you might have a typo in the URL.
        </p>
        <Button onClick={() => navigate("/registry")} variant="outline" className="mt-4">
          Return to Registry
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Flattened Header */}
      <section className="flex flex-col gap-1 border-b border-border pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{activeRegisterLabel}</h1>
        <p className="text-sm text-muted-foreground">Manage entries, upload documents, and export data for this register.</p>
      </section>

      {/*Action Row (Upload & Export side-by-side) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col border border-border bg-background rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/20">
            <h3 className="text-sm font-medium text-foreground">Document Upload</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex flex-col gap-3 rounded-md border border-dashed border-border bg-muted/10 p-4 md:flex-row md:items-center">
              <Input
                type="file"
                accept="application/pdf"
                disabled={isReadOnlyUser}
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="bg-background"
              />
              <Button disabled={!selectedFile || uploading || isReadOnlyUser} onClick={handleUploadFile}>
                <UploadCloud className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload PDF"}
              </Button>
            </div>
            {isReadOnlyUser && <p className="text-xs text-muted-foreground">Read-only users cannot upload or create entries.</p>}

            {/* Uploaded Files Sub-section */}
            {loadingFiles ? (
              <p className="text-sm text-muted-foreground pt-2">Loading files...</p>
            ) : registerFiles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border space-y-2 max-h-48 overflow-y-auto pr-2">
                {registerFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/20 p-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{file.filename}</p>
                      <p className="text-xs text-muted-foreground">Uploaded {formatDate(file.uploaded_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => handleDownloadFile(file.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete file?</DialogTitle>
                            <DialogDescription>This action also removes linked registry entries.</DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button variant="danger" onClick={() => handleDeleteFile(file.id)}>Confirm Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col border border-border bg-background rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/20">
            <h3 className="text-sm font-medium text-foreground">Exports</h3>
          </div>
          <div className="p-5 space-y-3">
            <Dialog open={excelDialogOpen} onOpenChange={(open) => {
              setExcelDialogOpen(open);
              if (!open) resetExcelDialog();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  Download Excel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Excel export</DialogTitle>
                  <DialogDescription>Export all entries in the current register, or limit the export to a date range.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={excelUseEntirePeriod}
                      onChange={(event) => setExcelUseEntirePeriod(event.target.checked)}
                      className="h-4 w-4 rounded border-border"
                    />
                    Entire period
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="excel-start-date">
                        Start date
                      </label>
                      <Input
                        id="excel-start-date"
                        type="date"
                        value={excelStartDate}
                        onChange={(event) => setExcelStartDate(event.target.value)}
                        disabled={excelUseEntirePeriod}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="excel-end-date">
                        End date
                      </label>
                      <Input
                        id="excel-end-date"
                        type="date"
                        value={excelEndDate}
                        onChange={(event) => setExcelEndDate(event.target.value)}
                        disabled={excelUseEntirePeriod}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setExcelDialogOpen(false); resetExcelDialog(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleDownloadExcel} disabled={exportingExcel}>
                    {exportingExcel ? "Generating..." : "Confirm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  Download All PDFs
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create ZIP archive</DialogTitle>
                  <DialogDescription>Bundle all PDFs in selected register into one archive.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={async () => {
                      if (!token) return;
                      await downloadAllPdfs(token, activeRegister);
                      toast.success("ZIP downloaded");
                    }}>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/*The Unified Data Section (Filters + Table) */}
      <div className="flex flex-col border border-border bg-background rounded-md overflow-hidden">
        <div className="border-b border-border bg-muted/5">
          <AdvancedFilterPanel filters={filters} onChange={setFilters} />
        </div>
        
        {/* The Table */}
        <div className="p-0">
          <RegistryTable 
            entries={entries} 
            filters={filters} 
            loading={loadingEntries} 
            onDownloadFile={handleDownloadFile} 
            onUpdateStatus={async (id, status) => {
              if (!token) return;
              try {
                await updateEntryStatus(token, id, status);
                toast.success(`Document marked as ${status}`);
                await refreshData(activeRegister); // Refreshes the table
              } catch (error) {
                toast.error("Failed to update status");
              }
            }}
          />
        </div>
      </div>

      {/* Hidden Modal for Entry Details */}
      <Dialog open={entryModalOpen} onOpenChange={handleEntryModalChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Entry Details</DialogTitle>
            <DialogDescription>Step 2 of 2 after upload: fill nr, cod and details for this uploaded PDF.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {entryForm.file_id && linkedFileName ? (
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                <div className="mb-1 inline-flex items-center gap-2 font-medium text-foreground">
                  <Link2 className="h-4 w-4" />
                  Linked PDF
                </div>
                <div>{linkedFileName}</div>
              </div>
            ) : null}

            <div className="grid gap-2">
              <label className="text-sm font-medium">Nr inregistrare</label>
              <Input value={entryForm.nr_inregistrare} readOnly className="bg-muted/50" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Cod</label>
              <Input value={entryForm.cod} readOnly className="bg-muted/50" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Iesire/Intrare</label>
              <Input
                value={entryForm.iesire_intrare}
                onChange={(event) => setEntryForm((prev) => ({ ...prev, iesire_intrare: event.target.value }))}
                placeholder="intrare"
              />
              {errors.iesire_intrare && <p className="text-xs text-red-500">{errors.iesire_intrare}</p>}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nr/Data Emitent</label>
              <Input
                value={entryForm.nr_data_emitent}
                onChange={(event) => setEntryForm((prev) => ({ ...prev, nr_data_emitent: event.target.value }))}
                placeholder="12/03/2024"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nr/Data Destinatar</label>
              <Input
                value={entryForm.nr_data_destinator}
                onChange={(event) => setEntryForm((prev) => ({ ...prev, nr_data_destinator: event.target.value }))}
                placeholder="12/03/2024"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Rezumat</label>
              <Input
                value={entryForm.rezumat}
                onChange={(event) => setEntryForm((prev) => ({ ...prev, rezumat: event.target.value }))}
                placeholder="Brief summary"
              />
              {errors.rezumat && <p className="text-xs text-red-500">{errors.rezumat}</p>}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Repartizare departament</label>
              <Input
                list="departments-list"
                value={entryForm.repartizare_dpt}
                onChange={(event) => setEntryForm((prev) => ({ ...prev, repartizare_dpt: event.target.value }))}
                placeholder="Select or type a department"
              />
              <datalist id="departments-list">
                {departments.map((department) => (
                  <option key={department.id} value={department.name} />
                ))}
              </datalist>
              {errors.repartizare_dpt && <p className="text-xs text-red-500">{errors.repartizare_dpt}</p>}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Mod rezolvare</label>
              <Input
                value={entryForm.mod_rezolvare}
                onChange={(event) => setEntryForm((prev) => ({ ...prev, mod_rezolvare: event.target.value }))}
                placeholder="In progress"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nr pag & nr anexe</label>
              <Input
                value={entryForm.nr_pag_anexe}
                onChange={(event) => setEntryForm((prev) => ({ ...prev, nr_pag_anexe: event.target.value }))}
                placeholder="3 pagini / 2 anexe"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateEntry} disabled={isReadOnlyUser}>
              <FilePlus2 className="mr-2 h-4 w-4" />
              {isAdmin ? "Save Entry" : "Submit for Validation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}