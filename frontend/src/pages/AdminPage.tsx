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
  getRoles,
  updateDepartment,
  updateRole,
} from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleManager } from "@/components/registry/RoleManager";
import type { RoleEntity } from "@/types/registry"; 
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
          <Input placeholder={`Add ${title.toLowerCase()}...`} value={value} onChange={(event) => setValue(event.target.value)} />
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
                <Input defaultValue={item.name} onBlur={(event) => onUpdate(item.id, event.target.value.trim())} autoFocus />
              ) : (
                <span className="text-sm font-medium pl-1">{item.name}</span>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditingId(item.id)}>Edit</Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete {title.slice(0, -1)}?</DialogTitle>
                      <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button variant="danger" onClick={() => onDelete(item.id)}>Confirm</Button>
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

export default function AdminPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const isAdmin = Boolean(user?.is_owner || user?.permission_level === "full_access");

  const [departments, setDepartments] = useState<NamedEntity[]>([]);
  const [roles, setRoles] = useState<RoleEntity[]>([]);

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
      const [deptData, roleData] = await Promise.all([
        getDepartments(token),
        getRoles(token),
      ]);
      setDepartments(deptData);
      setRoles(roleData);
    } catch (error) {
      if (error instanceof Error && error.message !== "Admin access required") {
        toast.error(error instanceof Error ? error.message : "Unable to load admin data");
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Flattened Header */}
      <section className="flex flex-col gap-1 border-b border-border pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Manage organization, departments, roles and users.</p>
      </section>

      {!isAdmin ? (
        <div className="rounded-md border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          You have read-only access, so some admin management actions are hidden.
        </div>
      ) : null}

      <div className="space-y-6">
        {isAdmin ? <InviteUserForm roles={roles} /> : null}
        
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <div className="space-y-6">
            <EntityManager
              title="Departments"
              items={departments}
              onCreate={async (name) => {
                if (!token) return;
                await createDepartment(token, name);
                toast.success("Department added");
                await loadAll();
              }}
              onUpdate={async (id, name) => {
                if (!token || !name) return;
                await updateDepartment(token, id, name);
                toast.success("Department updated");
                await loadAll();
              }}
              onDelete={async (id) => {
                if (!token) return;
                await deleteDepartment(token, id);
                toast.success("Department deleted");
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