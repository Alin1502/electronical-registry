import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  getEntries, 
  getCompanyUsers, 
  getRoles, 
  removeUser, 
  updateUserRole 
} from "@/api/client";
import { OperatorActivity } from "@/components/dashboard/OperatorActivity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import type { DocumentEntry, NamedEntity } from "@/types/registry";
import { Users, Mail, Shield, Trash2, Edit } from "lucide-react";

interface CompanyUser {
  id: number;
  username: string;
  email: string | null;
  is_owner: boolean;
  role_id: number | null;
  role: string | null;
  permission_level: string;
}

export default function UsersPage() {
  const navigate = useNavigate();
  const { token, user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.is_owner || currentUser?.permission_level === "full_access";
  // Only the owner (admin) can actually perform removals or role changes.
  // full_access roles may view this page but cannot act on it.
  const canManageUsers = currentUser?.is_owner === true;

  const [entries, setEntries] = useState<DocumentEntry[]>([]);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [roles, setRoles] = useState<NamedEntity[]>([]);
  const [loading, setLoading] = useState(false);

  // State for modals
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [activeDialog, setActiveDialog] = useState<{ type: "edit" | "delete" | null; userId: number | null }>({
    type: null,
    userId: null,
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      navigate("/registry");
      return;
    }
    void loadData();
  }, [token, isAdmin, navigate]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const [usersData, entriesData, rolesData] = await Promise.all([
        getCompanyUsers(token),
        getEntries(token, "contracte"),
        getRoles(token),
      ]);
      setUsers(usersData);
      setEntries(entriesData);
      setRoles(rolesData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-a putut încărca lista de utilizatori");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(userId: number) {
    if (!token) return;
    try {
      await removeUser(token, userId);
      toast.success("Utilizatorul a fost șters");
      setActiveDialog({ type: null, userId: null });
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-a putut șterge utilizatorul");
    }
  }

  async function handleUpdateRole(userId: number) {
    if (!token) return;
    try {
      const roleId = selectedRole ? Number(selectedRole) : null;
      await updateUserRole(token, userId, roleId);
      toast.success("Rolul utilizatorului a fost modificat");
      setActiveDialog({ type: null, userId: null });
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-a putut modifica rolul utilizatorului");
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-1 border-b border-border pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Utilizatori și activitate</h1>
        <p className="text-sm text-muted-foreground">Membrii echipei și permisiunile lor</p>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Se încarcă...</div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col border border-border bg-background rounded-md overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2 text-sm font-medium text-foreground bg-muted/20">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Membrii echipei({users.length})
            </div>
            
            <div className="p-0">
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="mb-3 h-8 w-8 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Nu există niciun utilizator adăugat</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/10">
                        <th className="text-left py-3 px-5 font-medium text-muted-foreground">Nume</th>
                        <th className="text-left py-3 px-5 font-medium text-muted-foreground">Email</th>
                        <th className="text-left py-3 px-5 font-medium text-muted-foreground">Rol</th>
                        <th className="text-left py-3 px-5 font-medium text-muted-foreground">Permisiuni</th>
                        <th className="text-right py-3 px-5 font-medium text-muted-foreground">Actiuni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((u) => {
                        // Protection logic: Cannot edit the owner, cannot edit yourself
                        const isSelf = currentUser?.id === u.id;
                        const isProtected = u.is_owner || isSelf;
                        const actionsDisabled = isProtected || !canManageUsers;

                        return (
                          <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-3 px-5 font-medium text-foreground">
                              {u.username}
                              {isSelf && <span className="ml-2 text-xs text-muted-foreground font-normal">(You)</span>}
                            </td>
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                {u.email || "—"}
                              </div>
                            </td>
                            <td className="py-3 px-5">
                              {u.is_owner ? <Badge variant="default">Owner</Badge> : <Badge variant="outline" className="font-normal">{u.role || "—"}</Badge>}
                            </td>
                            <td className="py-3 px-5">
                              <Badge variant={u.permission_level === "full_access" ? "default" : "secondary"} className="font-normal">
                                {u.permission_level}
                              </Badge>
                            </td>
                            <td className="py-3 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Dialog 
                                  open={activeDialog.type === "edit" && activeDialog.userId === u.id} 
                                  onOpenChange={(isOpen) => {
                                    if (isOpen) {
                                      setActiveDialog({ type: "edit", userId: u.id });
                                      setSelectedRole(u.role_id ? String(u.role_id) : "");
                                    } else {
                                      setActiveDialog({ type: null, userId: null });
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button size="icon" variant="ghost" disabled={actionsDisabled}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Schimbă rolul utilizatorului</DialogTitle>
                                      <DialogDescription>Adaugă un rol lui {u.username}.</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <select
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                      >
                                        <option value="">Niciun rol (Basic Access)</option>
                                        {roles.map((r) => (
                                          <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setActiveDialog({ type: null, userId: null })}>Anulează</Button>
                                      <Button onClick={() => handleUpdateRole(u.id)}>Salvează</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <Dialog 
                                  open={activeDialog.type === "delete" && activeDialog.userId === u.id} 
                                  onOpenChange={(isOpen) => isOpen ? setActiveDialog({ type: "delete", userId: u.id }) : setActiveDialog({ type: null, userId: null })}
                                >
                                  <DialogTrigger asChild>
                                    <Button size="icon" variant="ghost" disabled={actionsDisabled} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Eliminare acces</DialogTitle>
                                      <DialogDescription>
                                        Ești pe cale să ștergi utilizatorul <strong>{u.username}</strong> din companie 
                                        Acesta își va pierde orice acces la orice fișier, dar documentele înregistrate vor rămâne în aplicație
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setActiveDialog({ type: null, userId: null })}>Cancel</Button>
                                      <Button variant="danger" onClick={() => handleDeleteUser(u.id)}>Revoke Access</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <OperatorActivity entries={entries} users={users as any} />
        </div>
      )}
    </div>
  );
}