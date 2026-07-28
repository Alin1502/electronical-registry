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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge>{items.length}</Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
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
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
              {editingId === item.id ? (
                <Input defaultValue={item.name} onBlur={(event) => onUpdate(item.id, event.target.value.trim())} />
              ) : (
                <span className="text-sm font-medium">{item.name}</span>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingId(item.id)}>Edit</Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="danger">
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
      </CardContent>
    </Card>
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
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Administration</p>
            <h1 className="mt-2 text-2xl font-semibold">Admin Panel</h1>
            <p className="mt-3 text-sm text-muted-foreground">Manage organization, departments, roles and users.</p>
          </CardContent>
        </Card>
      </section>

      {!isAdmin ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              You have read-only access, so some admin management actions are hidden.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-6">
        {isAdmin ? <InviteUserForm roles={roles} /> : null}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {isAdmin ? <ChartUpload onImported={loadAll} /> : null}
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
