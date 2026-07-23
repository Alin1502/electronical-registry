import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createDepartment,
  createRole,
  deleteDepartment,
  deleteRole,
  getAdminStats,
  getDepartments,
  getRoles,
  updateDepartment,
  updateRole,
} from "@/api/client";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import type { AdminStats, NamedEntity } from "@/types/registry";
import { formatBytes, formatDateTime } from "@/lib/utils";
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
  const { token } = useAuthStore();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [departments, setDepartments] = useState<NamedEntity[]>([]);
  const [roles, setRoles] = useState<NamedEntity[]>([]);

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
      const [statsData, deptData, roleData] = await Promise.all([
        getAdminStats(token),
        getDepartments(token),
        getRoles(token),
      ]);
      setStats(statsData);
      setDepartments(deptData);
      setRoles(roleData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load admin data");
    }
  }

  const activity = useMemo(() => stats?.recent_activity ?? [], [stats]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Documents</p>
            <p className="mt-1 text-3xl font-semibold"><AnimatedCounter value={stats?.total_documents ?? 0} /></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Storage Usage</p>
            <p className="mt-1 text-3xl font-semibold">{formatBytes(stats?.total_storage_bytes ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Recent Events</p>
            <p className="mt-1 text-3xl font-semibold"><AnimatedCounter value={activity.length} /></p>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Latest Registry Events</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity captured yet.</p>
              ) : (
                <div className="space-y-2">
                  {activity.map((item, index) => (
                    <div key={`${item.nr_inregistrare}-${index}`} className="rounded-md border border-border p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{item.register_type}</Badge>
                        <span className="text-sm font-medium">{item.nr_inregistrare}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.rezumat || "No summary"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.timestamp)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <InviteUserForm roles={roles} />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <ChartUpload onImported={loadAll} />
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

            <EntityManager
              title="Roles"
              items={roles}
              onCreate={async (name) => {
                if (!token) return;
                await createRole(token, name);
                toast.success("Role added");
                await loadAll();
              }}
              onUpdate={async (id, name) => {
                if (!token || !name) return;
                await updateRole(token, id, name);
                toast.success("Role updated");
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
