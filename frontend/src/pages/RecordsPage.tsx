import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Download, FilePlus2, FileQuestion, Link2, Trash2, UploadCloud } from "lucide-react";
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
  getRegisterTypes,
  removeFile,
  updateEntryStatus,
  uploadFile,
} from "@/api/client";
import { AdvancedFilterPanel, type RegistryFilters } from "@/components/registry/AdvancedFilterPanel";
import { RegistryRoomsTable } from "@/components/registry/RegistryRoomsTable";
import { RegistryTable } from "@/components/registry/RegistryTable";
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
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { DocumentEntry, EntryPayload, FieldConfigItem, NamedEntity, RegisterTypeConfig, UploadedFile } from "@/types/registry";

const LEGACY_FIELD_CONFIG: FieldConfigItem[] = [
  { key: "nr_inregistrare", label: "Nr Inregistrare", source: "column", system: true },
  { key: "cod", label: "Cod", source: "column", system: true },
  { key: "iesire_intrare", label: "Iesire/Intrare", source: "column", system: false },
  { key: "nr_data_emitent", label: "Nr/Data Emitent", source: "column", system: false },
  { key: "nr_data_destinator", label: "Nr/Data Destinator", source: "column", system: false },
  { key: "rezumat", label: "Rezumat", source: "column", system: false },
  { key: "repartizare_dpt", label: "Repartizare Dpt", source: "column", system: false },
  { key: "mod_rezolvare", label: "Mod Rezolvare", source: "column", system: false },
  { key: "nr_pag_anexe", label: "Nr Pag & Nr Anexe", source: "column", system: false },
];

const BASE_ENTRY_FORM: EntryPayload = {
  register_type: "",
  nr_inregistrare: "",
  cod: "",
  iesire_intrare: "",
  nr_data_emitent: "",
  nr_data_destinator: "",
  rezumat: "",
  repartizare_dpt: "",
  mod_rezolvare: "",
  nr_pag_anexe: "",
  custom_fields: {},
  file_id: null,
};

const REQUIRED_DYNAMIC_KEYS = ["rezumat", "iesire_intrare", "repartizare_dpt"] as const;

const COLUMN_KEYS = new Set([
  "nr_inregistrare",
  "cod",
  "iesire_intrare",
  "nr_data_emitent",
  "nr_data_destinator",
  "rezumat",
  "repartizare_dpt",
  "mod_rezolvare",
  "nr_pag_anexe",
]);

function isColumnKey(key: string): key is keyof EntryPayload {
  return COLUMN_KEYS.has(key);
}

export default function RecordsPage() {
  const navigate = useNavigate();
  const { register } = useParams();
  const location = useLocation();
  const { token, user } = useAuthStore();
  const isAdmin = user?.is_owner;
  const isReadOnlyUser = user?.permission_level === "read";

  const [registerTypes, setRegisterTypes] = useState<RegisterTypeConfig[]>([]);
  const [loadingRegisterTypes, setLoadingRegisterTypes] = useState(true);

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
  const [entryForm, setEntryForm] = useState<EntryPayload>(BASE_ENTRY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [linkedFileName, setLinkedFileName] = useState<string>("");

  const activeRegister = register ?? "";
  const activeRegisterType = registerTypes.find((item) => item.key === activeRegister);
  const isValidRegister = !register || Boolean(activeRegisterType);
  const activeFieldConfig = activeRegisterType?.field_config ?? LEGACY_FIELD_CONFIG;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    void loadRegisterTypes();
    void loadDepartments();
  }, [token, navigate]);

  useEffect(() => {
    if (location.state && location.state.targetSearch) {
      setFilters((prev) => ({ ...prev, search: location.state.targetSearch }));
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!token || loadingRegisterTypes) return;

    if (register && !isValidRegister) {
      navigate("/records", { replace: true });
      return;
    }

    if (!register) return;

    void refreshData(register, activeFieldConfig);
  }, [token, register, isValidRegister, loadingRegisterTypes]);

  const registerFiles = useMemo(
    () => files.filter((file) => file.register_type === activeRegister),
    [files, activeRegister],
  );

  const activeRegisterLabel = activeRegisterType?.display_name ?? activeRegister;

  const registryRooms = useMemo(
    () => registerTypes.filter((item) => item.is_active).map((item) => ({ code: item.key, label: item.display_name })),
    [registerTypes],
  );

  const visibleColumnFields = useMemo(
    () => activeFieldConfig.filter((field) => field.source === "column" && isColumnKey(field.key)),
    [activeFieldConfig],
  );

  const visibleCustomFields = useMemo(
    () => activeFieldConfig.filter((field) => field.source === "custom"),
    [activeFieldConfig],
  );

  async function loadRegisterTypes() {
    if (!token) return;
    setLoadingRegisterTypes(true);
    try {
      const data = await getRegisterTypes(token);
      setRegisterTypes(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-au putut incarca tipurile de registru");
    } finally {
      setLoadingRegisterTypes(false);
    }
  }

  async function loadDepartments() {
    if (!token) return;
    try {
      const data = await getDepartments(token);
      setDepartments(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-au putut incarca departamentele");
    }
  }

  function buildCustomFields(fieldConfig: FieldConfigItem[], source?: Record<string, string>) {
    const next: Record<string, string> = {};
    for (const field of fieldConfig) {
      if (field.source === "custom") {
        next[field.key] = source?.[field.key] ?? "";
      }
    }
    return next;
  }

  async function refreshData(registerType: string, fieldConfig: FieldConfigItem[]) {
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
        ...BASE_ENTRY_FORM,
        ...prev,
        register_type: registerType,
        nr_inregistrare: nextNr.nr_inregistrare,
        cod: nextNr.cod,
        custom_fields: buildCustomFields(fieldConfig, prev.custom_fields),
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoadingEntries(false);
      setLoadingFiles(false);
    }
  }

  function setColumnFieldValue(key: keyof EntryPayload, value: string) {
    setEntryForm((prev) => ({ ...prev, [key]: value }));
  }

  function setCustomFieldValue(key: string, value: string) {
    setEntryForm((prev) => ({
      ...prev,
      custom_fields: { ...prev.custom_fields, [key]: value },
    }));
  }

  function validateEntry(form: EntryPayload) {
    const next: Record<string, string> = {};

    for (const key of REQUIRED_DYNAMIC_KEYS) {
      const shouldValidate = visibleColumnFields.some((field) => field.key === key);
      if (shouldValidate && !(form[key] ?? "").trim()) {
        if (key === "rezumat") next[key] = "Rezumatul trebuie completat";
        if (key === "iesire_intrare") next[key] = "Directia trebuie completata";
        if (key === "repartizare_dpt") next[key] = "Departamentul trebuie completat";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleCreateEntry() {
    if (!token) return;
    if (isReadOnlyUser) {
      toast.error("Nu ai atributele necesare pentru a adauga documente. Contacteaza un administrator");
      return;
    }
    if (!validateEntry(entryForm)) return;

    try {
      await createEntry(token, entryForm);
      toast.success("Entry created successfully");
      setEntryModalOpen(false);
      setLinkedFileName("");
      await refreshData(activeRegister, activeFieldConfig);
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
      toast.error("Nu ai atributele necesare pentru a incarca PDF-uri");
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
      toast.success("PDF-ul a fost adaugat. Adauga detaliile ramase");
      setSelectedFile(null);
      await refreshData(activeRegister, activeFieldConfig);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Documentul nu a putut fi incarcat");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteFile(fileId: number) {
    if (!token) return;
    try {
      await removeFile(token, fileId);
      toast.success("File deleted");
      await refreshData(activeRegister, activeFieldConfig);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Documentul nu a putut fi sters");
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
        toast.error("Selecteaza intervalul de timp pentru a genera excel-ul");
        return;
      }

      if (excelStartDate > excelEndDate) {
        toast.error("Data de inceput nu poate fi dupa data finala");
        return;
      }
    }

    setExportingExcel(true);
    try {
      await downloadExcel(token, activeRegister, excelUseEntirePeriod ? undefined : {
        startDate: excelStartDate,
        endDate: excelEndDate,
      });
      toast.success("Excel-ul a fost descarcat");
      setExcelDialogOpen(false);
      resetExcelDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Excel-ul nu a putut fi generat");
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
      toast.error(error instanceof Error ? error.message : "Descarcarea nu a putut fi efectuata");
    }
  }

  if (loadingRegisterTypes) {
    return <div className="py-10 text-sm text-muted-foreground">Se incarca registrele...</div>;
  }

  if (!register) {
    return (
      <div className="space-y-8">
        <section className="flex flex-col gap-1 border-b border-border pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Selectarea registrelor</h1>
          <p className="text-sm text-muted-foreground">Selecteaza un registru pentru a il vedea sau modifica</p>
        </section>

        {registryRooms.length === 0 ? (
          <div className="rounded-md border border-border bg-muted/10 p-5 text-sm text-muted-foreground">
            Nu exista registre active.
          </div>
        ) : (
          <RegistryRoomsTable rooms={registryRooms} onSelectRoom={(roomCode) => navigate(`/records/${encodeURIComponent(roomCode)}`)} />
        )}
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
        <Button onClick={() => navigate("/records")} variant="outline" className="mt-4">
          Return to Registry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-1 border-b border-border pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{activeRegisterLabel}</h1>
        <p className="text-sm text-muted-foreground">Manage entries, upload documents, and export data for this register.</p>
      </section>

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

            {loadingFiles ? (
              <p className="text-sm text-muted-foreground pt-2">Loading files...</p>
            ) : registerFiles.length > 0 ? (
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
            ) : null}
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

      <div className="flex flex-col border border-border bg-background rounded-md overflow-hidden">
        <div className="border-b border-border bg-muted/5">
          <AdvancedFilterPanel filters={filters} onChange={setFilters} />
        </div>

        <div className="p-0">
          <RegistryTable
            entries={entries}
            filters={filters}
            loading={loadingEntries}
            fieldConfig={activeFieldConfig}
            onDownloadFile={handleDownloadFile}
            onUpdateStatus={async (id, status) => {
              if (!token) return;
              try {
                await updateEntryStatus(token, id, status);
                toast.success(`Document marked as ${status}`);
                await refreshData(activeRegister, activeFieldConfig);
              } catch {
                toast.error("Failed to update status");
              }
            }}
          />
        </div>
      </div>

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

            {visibleColumnFields.map((field) => {
              const value = isColumnKey(field.key) ? String(entryForm[field.key] ?? "") : "";
              const error = errors[field.key];

              if (field.key === "repartizare_dpt") {
                return (
                  <div key={field.key} className="grid gap-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    <Input
                      list="departments-list"
                      value={value}
                      onChange={(event) => setColumnFieldValue("repartizare_dpt", event.target.value)}
                      placeholder="Select or type a department"
                    />
                    <datalist id="departments-list">
                      {departments.map((department) => (
                        <option key={department.id} value={department.name} />
                      ))}
                    </datalist>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                  </div>
                );
              }

              return (
                <div key={field.key} className="grid gap-2">
                  <label className="text-sm font-medium">{field.label}</label>
                  <Input
                    value={value}
                    readOnly={field.key === "nr_inregistrare" || field.key === "cod"}
                    className={field.key === "nr_inregistrare" || field.key === "cod" ? "bg-muted/50" : undefined}
                    onChange={(event) => {
                      if (isColumnKey(field.key)) {
                        setColumnFieldValue(field.key, event.target.value);
                      }
                    }}
                    placeholder={field.key === "rezumat" ? "Brief summary" : undefined}
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
              );
            })}

            {visibleCustomFields.map((field) => (
              <div key={field.key} className="grid gap-2">
                <label className="text-sm font-medium">{field.label}</label>
                <Input
                  value={entryForm.custom_fields[field.key] ?? ""}
                  onChange={(event) => setCustomFieldValue(field.key, event.target.value)}
                />
              </div>
            ))}
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
