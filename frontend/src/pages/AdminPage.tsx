import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createDepartment,
  createRole,
  deleteDepartment,
  deleteRole,
  getDepartments,
  getInvites,
  getRoles,
  updateDepartment,
  updateRole,
} from "@/api/client";
import { formatDate } from "@/lib/utils";
import type { InviteEntity, RoleEntity } from "@/types/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleManager } from "@/components/registry/RoleManager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import type { NamedEntity } from "@/types/registry";
import { ChartUpload } from "@/components/registry/ChartUpload";
import { InviteUserForm } from "@/components/registry/InviteUserForm";

function EntityManager({
  title,
  items,
  onCreate,
  onUpdate,
  onDelete,
}: {
  title: string;
  items: NamedEntity[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  
  return (
    <div className="flex flex-col border border-border bg-background rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <Badge variant="secondary" className="font-normal">{items.length}</Badge>
      </div>
      <div className="p-5">
        <div className="mb-5 flex gap-2">
          <Input placeholder={`Adaugă`} value={value} onChange={(event) => setValue(event.target.value)} />
          <Button
            onClick={async () => {
              if (!value.trim()) return;
              await onCreate(value.trim());
              setValue("");
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-transparent hover:border-border hover:bg-muted/30 p-2 transition-colors">
              {editingId === item.id ? (
                <Input
                  defaultValue={item.name}
                  onBlur={async (event) => {
                    const newValue = event.target.value.trim();
                    if (newValue && newValue !== item.name) {
                      await onUpdate(item.id, newValue);
                    }
                    setEditingId(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setEditingId(null);
                    }
                    if (event.key === "Enter") {
                      event.currentTarget.blur();
                    }
                  }}
                  autoFocus
                />
              ) : (
                <span className="text-sm font-medium pl-1">{item.name}</span>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditingId(item.id)}>Editează</Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Șterge {title.slice(0, -1)}?</DialogTitle>
                      <DialogDescription>Acțiunea este ireversibilă</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Anulare</Button>
                      <Button variant="danger" onClick={() => onDelete(item.id)}>Confirmă</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function PendingInvitesList({ items }: { items: InviteEntity[] }) {
  return (
    <div className="flex flex-col border border-border bg-background rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
        <h3 className="text-sm font-medium text-foreground">Invitații în așteptare</h3>
        <Badge variant="secondary" className="font-normal">{items.length}</Badge>
      </div>
      <div className="p-5">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nu există invitații în așteptare.</p>
        ) : (
          <div className="space-y-2">
            {items.map((invite) => {
              const isExpired = new Date(invite.expires_at) < new Date();
              return (
                <div key={invite.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/20 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {invite.role_name ?? "Fără rol"} · invitat de {invite.invited_by} · {formatDate(invite.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={isExpired ? "outline" : "secondary"}
                    className={isExpired ? "font-normal text-muted-foreground" : "font-normal"}
                  >
                    {isExpired ? "Expirat" : "În așteptare"}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default function AdminPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const isAdmin = Boolean(user?.is_owner || user?.permission_level === "full_access");

  const [departments, setDepartments] = useState<NamedEntity[]>([]);
  const [roles, setRoles] = useState<RoleEntity[]>([]);
  const [invites, setInvites] = useState<InviteEntity[]>([]);
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    void loadAll();
  }, [token, navigate]);

  async function loadAll() {
    if (!token) return;
    try {
      const [deptData, roleData, inviteData] = await Promise.all([
        getDepartments(token),
        getRoles(token),
        getInvites(token),
      ]);
      setDepartments(deptData);
      setRoles(roleData);
      setInvites(inviteData);
    } catch (error) {
      if (error instanceof Error && error.message !== "Admin access required") {
        toast.error(error instanceof Error ? error.message : "Unable to load admin data");
      }
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-1 border-b border-border pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Panou de control</h1>
        <p className="text-sm text-muted-foreground">Gestionează organizația, departamentele, rolurile și utilizatorii.</p>
      </section>

      {!isAdmin ? (
        <div className="rounded-md border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          Nu poți vedea tot conținutul deoarece nu ai permisiuni de administrator.
        </div>
      ) : null}

      <div className="space-y-6">
        {isAdmin ? <InviteUserForm roles={roles} /> : null}
        {isAdmin ? <PendingInvitesList items={invites} /> : null}
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <div className="space-y-6">
            <EntityManager
              title="Departamente"
              items={departments}
              onCreate={async (name) => {
                if (!token) return;
                await createDepartment(token, name);
                toast.success("Departament adăugat");
                await loadAll();
              }}
              onUpdate={async (id, name) => {
                if (!token || !name) return;
                await updateDepartment(token, id, name);
                toast.success("Departament modificat");
                await loadAll();
              }}
              onDelete={async (id) => {
                if (!token) return;
                await deleteDepartment(token, id);
                toast.success("Departament șters");
                await loadAll();
              }}
            />
            {isAdmin ? <ChartUpload onImported={loadAll} /> : null}
          </div>
          
          <div className="space-y-6">
            <RoleManager
              items={roles}
              onCreate={async (name, permissionLevel) => {
                if (!token) return;
                await createRole(token, name, permissionLevel);
                toast.success("Role added");
                await loadAll();
              }}
              onDelete={async (id) => {
                if (!token) return;
                await deleteRole(token, id);
                toast.success("Role deleted");
                await loadAll();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}