import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getRegisterTypes,
  createRegisterType,
  lockRegisterType,
  updateRegisterTypeFields,
  updateRegisterTypeLabels,
  deleteRegisterType,
} from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import type { RegisterTypeConfig, FieldConfigItem } from "@/types/registry";
import { Plus, Lock, Archive, Pencil, X } from "lucide-react";

// The 9 fields every register historically had. Admin can pick a subset of
// these plus add their own custom fields when configuring a new register.
const BASE_COLUMN_FIELDS: FieldConfigItem[] = [
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

function slugify(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// ---------- Field editor: used both for creating a new draft and editing an unlocked one ----------

function FieldEditor({
  fields,
  onChange,
}: {
  fields: FieldConfigItem[];
  onChange: (fields: FieldConfigItem[]) => void;
}) {
  const [newFieldLabel, setNewFieldLabel] = useState("");

  const systemFields = fields.filter((f) => f.system);
  const optionalColumnFields = fields.filter((f) => f.source === "column" && !f.system);
  const customFields = fields.filter((f) => f.source === "custom");

  const optionalKeys = new Set(optionalColumnFields.map((f) => f.key));

  function toggleColumnField(base: FieldConfigItem, checked: boolean) {
    if (checked) {
      onChange([...fields, base]);
    } else {
      onChange(fields.filter((f) => f.key !== base.key));
    }
  }

  function relabel(key: string, label: string) {
    onChange(fields.map((f) => (f.key === key ? { ...f, label } : f)));
  }

  function addCustomField() {
    const trimmed = newFieldLabel.trim();
    if (!trimmed) return;

    let key = slugify(trimmed) || "camp";
    const existingKeys = new Set(fields.map((f) => f.key));
    let suffix = 2;
    while (existingKeys.has(key)) {
      key = `${slugify(trimmed)}_${suffix}`;
      suffix += 1;
    }

    onChange([...fields, { key, label: trimmed, source: "custom", system: false }]);
    setNewFieldLabel("");
  }

  function removeCustomField(key: string) {
    onChange(fields.filter((f) => f.key !== key));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          Câmpuri obligatorii
        </p>
        <div className="space-y-2">
          {systemFields.map((field) => (
            <div key={field.key} className="flex items-center gap-3">
              <Input
                value={field.label}
                onChange={(e) => relabel(field.key, e.target.value)}
                className="max-w-xs"
              />
              <span className="text-sm text-muted-foreground">mereu prezent</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          Câmpuri standard
        </p>
        <div className="space-y-2">
          {BASE_COLUMN_FIELDS.filter((f) => !f.system).map((base) => {
            const checked = optionalKeys.has(base.key);
            const current = fields.find((f) => f.key === base.key);
            return (
              <div key={base.key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => toggleColumnField(base, e.target.checked)}
                  className="h-4 w-4 rounded-sm border-border text-primary focus:ring-primary"
                />
                {checked ? (
                  <Input
                    value={current?.label ?? base.label}
                    onChange={(e) => relabel(base.key, e.target.value)}
                    className="max-w-xs"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">{base.label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          Câmpuri personalizate
        </p>
        <div className="space-y-2">
          {customFields.map((field) => (
            <div key={field.key} className="flex items-center gap-2">
              <Input
                value={field.label}
                onChange={(e) => relabel(field.key, e.target.value)}
                className="max-w-xs"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => removeCustomField(field.key)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Input
            placeholder="Nume câmp nou (ex. Furnizor)"
            value={newFieldLabel}
            onChange={(e) => setNewFieldLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomField();
              }
            }}
            className="max-w-xs"
          />
          <Button variant="outline" onClick={addCustomField} disabled={!newFieldLabel.trim()}>
            <Plus className="mr-1.5 h-4 w-4" />
            Adaugă
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Main settings panel ----------

export function RegisterTypeSettings() {
  const { token } = useAuthStore();

  const [registerTypes, setRegisterTypes] = useState<RegisterTypeConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / edit-draft dialog
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // null = creating new
  const [draftKey, setDraftKey] = useState("");
  const [draftDisplayName, setDraftDisplayName] = useState("");
  const [draftFields, setDraftFields] = useState<FieldConfigItem[]>(
    BASE_COLUMN_FIELDS.filter((f) => f.system),
  );
  const [saving, setSaving] = useState(false);

  // Lock confirmation
  const [lockTarget, setLockTarget] = useState<RegisterTypeConfig | null>(null);
  const [locking, setLocking] = useState(false);

  // Rename dialog (locked types — labels only)
  const [renameTarget, setRenameTarget] = useState<RegisterTypeConfig | null>(null);
  const [renameDisplayName, setRenameDisplayName] = useState("");
  const [renameLabels, setRenameLabels] = useState<Record<string, string>>({});
  const [renaming, setRenaming] = useState(false);

  // Archive confirmation
  const [archiveTarget, setArchiveTarget] = useState<RegisterTypeConfig | null>(null);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    if (!token) return;
    void loadData();
  }, [token]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getRegisterTypes(token, true);
      setRegisterTypes(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-au putut încărca registrele");
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setDraftKey("");
    setDraftDisplayName("");
    setDraftFields(BASE_COLUMN_FIELDS.filter((f) => f.system));
    setEditorOpen(true);
  }

  function openEditDraftDialog(type: RegisterTypeConfig) {
    setEditingId(type.id);
    setDraftKey(type.key);
    setDraftDisplayName(type.display_name);
    setDraftFields(type.field_config);
    setEditorOpen(true);
  }

  async function handleSaveDraft() {
    if (!token) return;
    if (!draftDisplayName.trim()) {
      toast.error("Numele registrului este obligatoriu");
      return;
    }

    const key = editingId ? draftKey : draftKey.trim() || slugify(draftDisplayName);
    if (!key) {
      toast.error("Nu s-a putut genera o cheie pentru acest registru");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateRegisterTypeLabels(token, editingId, {
          display_name: draftDisplayName,
        });
        await updateRegisterTypeFields(token, editingId, draftFields);
        toast.success("Registru actualizat");
      } else {
        await createRegisterType(token, {
          key,
          display_name: draftDisplayName,
          field_config: draftFields,
        });
        toast.success("Registru creat ca ciornă. Poți continua să îl modifici înainte de a-l bloca.");
      }
      setEditorOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-a putut salva registrul");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmLock() {
    if (!token || !lockTarget) return;
    setLocking(true);
    try {
      await lockRegisterType(token, lockTarget.id);
      toast.success(`"${lockTarget.display_name}" a fost blocat. Câmpurile nu mai pot fi modificate.`);
      setLockTarget(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-a putut bloca registrul");
    } finally {
      setLocking(false);
    }
  }

  function openRenameDialog(type: RegisterTypeConfig) {
    setRenameTarget(type);
    setRenameDisplayName(type.display_name);
    setRenameLabels(Object.fromEntries(type.field_config.map((f) => [f.key, f.label])));
  }

  async function handleSaveRename() {
    if (!token || !renameTarget) return;
    setRenaming(true);
    try {
      await updateRegisterTypeLabels(token, renameTarget.id, {
        display_name: renameDisplayName,
        field_labels: renameLabels,
      });
      toast.success("Denumiri actualizate");
      setRenameTarget(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-au putut actualiza denumirile");
    } finally {
      setRenaming(false);
    }
  }

  async function handleConfirmArchive() {
    if (!token || !archiveTarget) return;
    setArchiving(true);
    try {
      await deleteRegisterType(token, archiveTarget.id);
      toast.success(`"${archiveTarget.display_name}" a fost arhivat`);
      setArchiveTarget(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-a putut arhiva registrul");
    } finally {
      setArchiving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Se încarcă registrele...
      </div>
    );
  }

  const active = registerTypes.filter((r) => r.is_active);
  const archived = registerTypes.filter((r) => !r.is_active);

  return (
    <div className="space-y-8">
      {/* Header and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-lg font-medium text-foreground">Setări registre active</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configurează structura registrelor. Odată blocat, un registru nu mai poate primi sau pierde câmpuri.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" />
          Registru nou
        </Button>
      </div>

      {/* Flat List of Active Registers */}
      {active.length > 0 ? (
        <div className="flex flex-col divide-y divide-border">
          {active.map((type) => (
            <div key={type.id} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{type.display_name}</span>
                  <Badge variant={type.is_locked ? "secondary" : "outline"} className="font-normal">
                    {type.is_locked ? "Blocat" : "Ciornă"}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {type.field_config.length} câmpuri • {type.key}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {type.is_locked ? (
                  <Button variant="outline" onClick={() => openRenameDialog(type)}>
                    <Pencil className="mr-1.5 h-4 w-4" />
                    Redenumește
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => openEditDraftDialog(type)}>
                      <Pencil className="mr-1.5 h-4 w-4" />
                      Editează
                    </Button>
                    <Button variant="outline" onClick={() => setLockTarget(type)}>
                      <Lock className="mr-1.5 h-4 w-4" />
                      Blochează
                    </Button>
                  </>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setArchiveTarget(type)}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-sm text-muted-foreground">
          Nu există registre active încă.
        </div>
      )}

      {/* Flat List of Archived Registers */}
      {archived.length > 0 && (
        <div className="pt-8">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-medium text-foreground">Registre Arhivate</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ascunse din lista activă. Datele existente rămân intacte.
            </p>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {archived.map((type) => (
              <div key={type.id} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{type.display_name}</span>
                    <Badge variant="outline" className="font-normal">
                      Arhivat
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{type.key}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / edit draft Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editează registrul" : "Registru nou"}</DialogTitle>
            <DialogDescription>
              Alege ce câmpuri va avea acest registru. Structura poate fi modificată până la blocare.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Denumire registru</label>
              <Input
                value={draftDisplayName}
                onChange={(e) => setDraftDisplayName(e.target.value)}
                placeholder="ex. Contracte"
              />
            </div>
            <div className="h-px bg-border" />
            <FieldEditor fields={draftFields} onChange={setDraftFields} />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleSaveDraft} disabled={saving}>
              {saving ? "Se salvează..." : "Salvează ciorna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock confirmation Dialog */}
      <Dialog open={!!lockTarget} onOpenChange={(open) => !open && setLockTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blochezi "{lockTarget?.display_name}"?</DialogTitle>
            <DialogDescription>
              Această acțiune nu poate fi anulată. Structura câmpurilor devine imuabilă. Doar etichetele vor mai putea fi redenumite.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setLockTarget(null)}>
              Anulează
            </Button>
            <Button variant="danger" onClick={handleConfirmLock} disabled={locking}>
              {locking ? "Se blochează..." : "Blochează definitiv"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename (locked types) Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Redenumește "{renameTarget?.display_name}"</DialogTitle>
            <DialogDescription>
              Etichetele de afișare pot fi modificate. Cheile din baza de date rămân neschimbate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Denumire registru</label>
              <Input value={renameDisplayName} onChange={(e) => setRenameDisplayName(e.target.value)} />
            </div>
            <div className="space-y-4">
              {renameTarget?.field_config.map((field) => (
                <div key={field.key} className="flex items-center gap-4">
                  <label className="w-1/3 truncate text-sm text-muted-foreground" title={field.key}>
                    {field.key}
                  </label>
                  <Input
                    value={renameLabels[field.key] ?? field.label}
                    onChange={(e) => setRenameLabels((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>
              Anulează
            </Button>
            <Button onClick={handleSaveRename} disabled={renaming}>
              {renaming ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive confirmation Dialog */}
      <Dialog open={!!archiveTarget} onOpenChange={(open) => !open && setArchiveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arhivezi "{archiveTarget?.display_name}"?</DialogTitle>
            <DialogDescription>
              Registrul va fi ascuns din interfața utilizatorilor și nu va mai permite intrări noi. Datele existente rămân intacte.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setArchiveTarget(null)}>
              Anulează
            </Button>
            <Button variant="danger" onClick={handleConfirmArchive} disabled={archiving}>
              {archiving ? "Se arhivează..." : "Arhivează"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}