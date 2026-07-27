import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, FileDown, FilePlus2, FileText, Link2, Trash2, UploadCloud } from "lucide-react";
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
} from "@/api/client";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { StatCard } from "@/components/dashboard/StatCard";
import { AdvancedFilterPanel, type RegistryFilters } from "@/components/registry/AdvancedFilterPanel";
import { RegistryTable } from "@/components/registry/RegistryTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const isReadOnlyUser = user?.permission_level === "read";

  const [activeRegister, setActiveRegister] = useState<string>(REGISTERS[0]);
  const [entries, setEntries] = useState<DocumentEntry[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [departments, setDepartments] = useState<NamedEntity[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filters, setFilters] = useState<RegistryFilters>({ search: "", department: "", status: "" });

  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entryForm, setEntryForm] = useState<EntryPayload>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [linkedFileName, setLinkedFileName] = useState<string>("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    void loadDepartments();
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    void refreshData(activeRegister);
    setEntryForm((prev) => ({ ...prev, register_type: activeRegister }));
  }, [activeRegister, token]);

  const registerFiles = useMemo(
    () => files.filter((file) => file.register_type === activeRegister),
    [files, activeRegister],
  );

  const activeRegisterLabel = REGISTER_LABELS[activeRegister] ?? activeRegister;

  async function loadDepartments() {
    if (!token) return;
    try {
      const data = await getDepartments(token);
      setDepartments(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-au putut incarca departamentele");
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
      toast.error(error instanceof Error ? error.message : "Nu s-au putut incarca datele");
    } finally {
      setLoadingEntries(false);
      setLoadingFiles(false);
    }
  }

  function validateEntry(form: EntryPayload) {
    const next: Record<string, string> = {};
    if (!form.rezumat.trim()) next.rezumat = "Summary is required";
    if (!form.iesire_intrare.trim()) next.iesire_intrare = "Direction is required";
    if (!form.repartizare_dpt.trim()) next.repartizare_dpt = "Department is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleCreateEntry() {
    if (!token) return;
    if (isReadOnlyUser) {
      toast.error("Read-only users cannot create entries.");
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

  async function handleDownloadFile(fileId: number) {
    if (!token) return;
    try {
      const result = await getDownloadUrl(token, fileId);
      window.open(result.download_url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed");
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="xl:col-span-1 bg-gradient-to-br from-cyan-50 to-blue-50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Workspace</p>
            <h1 className="mt-2 text-2xl font-semibold">{user?.company_name ?? "Company Registry"}</h1>
            <p className="mt-3 text-sm text-muted-foreground">Manage entries, files, and exports with one flow.</p>
          </CardContent>
        </Card>

        <StatCard title="Total Entries" value={<AnimatedCounter value={entries.length} />} detail="updated in real-time" />
        <StatCard title="Files in Register" value={<AnimatedCounter value={registerFiles.length} />} detail="PDF archive linked" />
        <StatCard
          title="Active Register"
          value={activeRegisterLabel}
          valueClassName="max-w-[14rem] break-words text-2xl leading-tight md:text-3xl"
          detail="switch from tabs below"
        />
      </section>

      <Card>
        <CardContent className="p-4">
          <Tabs value={activeRegister} onValueChange={setActiveRegister}>
            <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
              {REGISTERS.map((register) => (
                <TabsTrigger key={register} value={register} className="rounded-md border border-border bg-card text-xs">
                  {REGISTER_LABELS[register] ?? register}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <AdvancedFilterPanel filters={filters} onChange={setFilters} />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Uploading a PDF will immediately ask for entry details (nr, cod, rezumat, etc.) in the next step.
              </p>
              <div className="mb-4 flex flex-col gap-3 rounded-md border border-dashed border-border bg-muted/20 p-4 md:flex-row md:items-center">
                <Input
                  type="file"
                  accept="application/pdf"
                  disabled={isReadOnlyUser}
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
                <Button disabled={!selectedFile || uploading || isReadOnlyUser} onClick={handleUploadFile}>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload PDF"}
                </Button>
              </div>
              {isReadOnlyUser ? <p className="mb-4 text-sm text-muted-foreground">Read-only users cannot upload or create entries.</p> : null}

              {loadingFiles ? (
                <p className="text-sm text-muted-foreground">Loading files...</p>
              ) : registerFiles.length === 0 ? (
                <div className="rounded-md border border-dashed border-border bg-muted/30 p-8 text-center">
                  <FileText className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No files uploaded for this register.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {registerFiles.map((file) => (
                    <div key={file.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4">
                      <div>
                        <p className="font-medium">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">Uploaded {formatDate(file.uploaded_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success">Secure PDF</Badge>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadFile(file.id)}>
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="danger">
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
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
            </CardContent>
          </Card>

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
                  <Input value={entryForm.nr_inregistrare} readOnly />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Cod</label>
                  <Input value={entryForm.cod} readOnly />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Iesire/Intrare</label>
                  <Input
                    value={entryForm.iesire_intrare}
                    onChange={(event) => setEntryForm((prev) => ({ ...prev, iesire_intrare: event.target.value }))}
                    placeholder="intrare"
                  />
                  {errors.iesire_intrare && <p className="text-xs text-danger">{errors.iesire_intrare}</p>}
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
                  {errors.rezumat && <p className="text-xs text-danger">{errors.rezumat}</p>}
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
                  {errors.repartizare_dpt && <p className="text-xs text-danger">{errors.repartizare_dpt}</p>}
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
                  Save Entry
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <RegistryTable entries={entries} filters={filters} loading={loadingEntries} onDownloadFile={handleDownloadFile} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Exports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="secondary">
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Excel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Excel export</DialogTitle>
                    <DialogDescription>Export all entries in current register to .xlsx format.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button
                      onClick={async () => {
                        if (!token) return;
                        await downloadExcel(token, activeRegister);
                        toast.success("Excel downloaded");
                      }}
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
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
                    <Button
                      onClick={async () => {
                        if (!token) return;
                        await downloadAllPdfs(token, activeRegister);
                        toast.success("ZIP downloaded");
                      }}
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
