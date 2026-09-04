import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Mail,
  Building2,
  Trash2,
  Edit,
  Users,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import {
  getEntries,
  getCompanyUsers,
  getDepartments,
  getRoles,
  removeUser,
  updateUserDepartments,
  updateUserRole,
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
import type {
  DocumentEntry,
  NamedEntity,
} from "@/types/registry";


interface CompanyUser {
  id: number;
  username: string;
  email: string | null;
  is_owner: boolean;
  role_id: number | null;
  role: string | null;
  permission_level: string;
  avatar_url: string | null;
  departments: NamedEntity[];
}


const PERMISSION_LABELS: Record<string, string> = {
  full_access: "Acces integral",
  read_write: "Citire și scriere",
  read: "Citire",
};


export default function UsersPage() {
  const navigate = useNavigate();

  const {
    token,
    user: currentUser,
  } = useAuthStore();

  const isAdmin =
    currentUser?.is_owner ||
    currentUser?.permission_level === "full_access";

  // Only the owner can actually modify users.
  const canManageUsers =
    currentUser?.is_owner === true;


  const [entries, setEntries] = useState<DocumentEntry[]>([]);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [roles, setRoles] = useState<NamedEntity[]>([]);
  const [departments, setDepartments] = useState<NamedEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedRole, setSelectedRole] =
    useState<string>("");

  const [selectedDepartmentIds, setSelectedDepartmentIds] =
    useState<number[]>([]);

  const [savingDepartments, setSavingDepartments] = useState(false);

  const [activeDialog, setActiveDialog] = useState<{
    type: "edit" | "delete" | "departments" | null;
    userId: number | null;
  }>({
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
      const [
        usersData,
        entriesData,
        rolesData,
        departmentsData,
      ] = await Promise.all([
        getCompanyUsers(token),
        getEntries(token, "contracte"),
        getRoles(token),
        getDepartments(token),
      ]);

      setUsers(usersData);
      setEntries(entriesData);
      setRoles(rolesData);
      setDepartments(departmentsData);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nu s-a putut încărca lista de utilizatori"
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleDeleteUser(userId: number) {
    if (!token) return;

    try {
      await removeUser(token, userId);

      toast.success(
        "Utilizatorul a fost eliminat"
      );

      setActiveDialog({
        type: null,
        userId: null,
      });

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nu s-a putut elimina utilizatorul"
      );
    }
  }


  async function handleUpdateRole(userId: number) {
    if (!token) return;

    try {
      const roleId = selectedRole
        ? Number(selectedRole)
        : null;

      await updateUserRole(
        token,
        userId,
        roleId
      );

      toast.success(
        "Rolul utilizatorului a fost modificat"
      );

      setActiveDialog({
        type: null,
        userId: null,
      });

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nu s-a putut modifica rolul utilizatorului"
      );
    }
  }


  function toggleSelectedDepartment(departmentId: number) {
    setSelectedDepartmentIds((prev) =>
      prev.includes(departmentId)
        ? prev.filter((id) => id !== departmentId)
        : [...prev, departmentId]
    );
  }


  async function handleUpdateDepartments(userId: number) {
    if (!token) return;

    setSavingDepartments(true);

    try {
      await updateUserDepartments(
        token,
        userId,
        selectedDepartmentIds
      );

      toast.success(
        "Departamentele utilizatorului au fost actualizate"
      );

      setActiveDialog({
        type: null,
        userId: null,
      });

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nu s-au putut actualiza departamentele"
      );
    } finally {
      setSavingDepartments(false);
    }
  }


  return (
    <div className="space-y-10">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Utilizatori
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Gestionează membrii organizației și permisiunile lor.
        </p>
      </section>


      {loading ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
          Se încarcă...
        </div>
      ) : (
        <div className="space-y-10">

          {/* =================================================
              TEAM
          ================================================== */}
          <section>

            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Membrii echipei
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {users.length === 0
                      ? "Nu există utilizatori."
                      : users.length === 1
                        ? "1 utilizator în organizație"
                        : `${users.length} utilizatori în organizație`}
                  </p>
                </div>
              </div>

              <span className="text-sm tabular-nums text-muted-foreground">
                {users.length}
              </span>
            </div>


            {users.length === 0 ? (
              <div className="border-y border-border py-10 text-center">
                <Users className="mx-auto mb-3 h-7 w-7 text-muted-foreground/50" />

                <p className="text-sm text-muted-foreground">
                  Nu există niciun utilizator adăugat.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border-y border-border">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Utilizator
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Email
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Rol
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Permisiuni
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Departamente
                      </th>

                      {canManageUsers && (
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Acțiuni
                        </th>
                      )}
                    </tr>
                  </thead>


                  <tbody className="divide-y divide-border">

                    {users.map((u) => {
                      const isSelf =
                        currentUser?.id === u.id;

                      const isProtected =
                        u.is_owner || isSelf;

                      const actionsDisabled =
                        isProtected ||
                        !canManageUsers;


                      return (
                        <tr
                          key={u.id}
                          className="group transition-colors hover:bg-muted/30"
                        >

                          {/* USER */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">

                              <Avatar src={u.avatar_url} name={u.username} size={32} />

                              <div className="min-w-0">
                                <p className="font-medium text-foreground">
                                  {u.username}
                                </p>

                                {isSelf && (
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    Contul tău
                                  </p>
                                )}
                              </div>

                            </div>
                          </td>

                          {/* EMAIL */}
                          <td className="px-4 py-4">
                            {u.email ? (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 shrink-0" />

                                <span className="truncate">
                                  {u.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>


                          {/* ROLE */}
                          <td className="px-4 py-4">
                            {u.is_owner ? (
                              <Badge
                                variant="default"
                                className="font-normal"
                              >
                                Proprietar
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="font-normal"
                              >
                                {u.role || "Fără rol"}
                              </Badge>
                            )}
                          </td>


                          {/* PERMISSIONS */}
                          <td className="px-4 py-4">
                            <Badge
                              variant={
                                u.permission_level ===
                                "full_access"
                                  ? "default"
                                  : "secondary"
                              }
                              className="font-normal"
                            >
                              {PERMISSION_LABELS[
                                u.permission_level
                              ] ??
                                u.permission_level}
                            </Badge>
                          </td>


                          {/* DEPARTMENTS */}
                          <td className="px-4 py-4">
                            {u.is_owner ? (
                              <span className="text-muted-foreground">
                                Toate
                              </span>
                            ) : u.departments.length === 0 ? (
                              <span className="text-muted-foreground">
                                Fără departament
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {u.departments.map((d) => (
                                  <Badge
                                    key={d.id}
                                    variant="secondary"
                                    className="font-normal"
                                  >
                                    {d.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </td>


                          {/* ACTIONS */}
                          {canManageUsers && (
                            <td className="px-4 py-4">
                              <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">

                                {/* DEPARTMENTS */}
                                <Dialog
                                  open={
                                    activeDialog.type ===
                                      "departments" &&
                                    activeDialog.userId ===
                                      u.id
                                  }
                                  onOpenChange={(isOpen) => {
                                    if (isOpen) {
                                      setActiveDialog({
                                        type: "departments",
                                        userId: u.id,
                                      });

                                      setSelectedDepartmentIds(
                                        u.departments.map((d) => d.id)
                                      );
                                    } else {
                                      setActiveDialog({
                                        type: null,
                                        userId: null,
                                      });
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      disabled={
                                        u.is_owner ||
                                        !canManageUsers
                                      }
                                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    >
                                      <Building2 className="h-4 w-4" />

                                      <span className="sr-only">
                                        Asignează departamente
                                      </span>
                                    </Button>
                                  </DialogTrigger>


                                  <DialogContent>

                                    <DialogHeader>
                                      <DialogTitle>
                                        Asignează departamente
                                      </DialogTitle>

                                      <DialogDescription>
                                        Selectează departamentele pentru{" "}
                                        <strong>
                                          {u.username}
                                        </strong>
                                        .
                                      </DialogDescription>
                                    </DialogHeader>


                                    <div className="py-4">
                                      {departments.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                          Nu există departamente create.
                                        </p>
                                      ) : (
                                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                          {departments.map((d) => (
                                            <label
                                              key={d.id}
                                              className="flex items-center gap-2 rounded-md border border-transparent p-2 text-sm hover:border-border hover:bg-muted/30"
                                            >
                                              <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-border"
                                                checked={selectedDepartmentIds.includes(d.id)}
                                                onChange={() => toggleSelectedDepartment(d.id)}
                                              />
                                              {d.name}
                                            </label>
                                          ))}
                                        </div>
                                      )}
                                    </div>


                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          setActiveDialog({
                                            type: null,
                                            userId: null,
                                          })
                                        }
                                      >
                                        Anulează
                                      </Button>

                                      <Button
                                        disabled={savingDepartments}
                                        onClick={() =>
                                          void handleUpdateDepartments(
                                            u.id
                                          )
                                        }
                                      >
                                        {savingDepartments ? "Se salvează..." : "Salvează"}
                                      </Button>
                                    </DialogFooter>

                                  </DialogContent>
                                </Dialog>


                                {/* EDIT */}
                                <Dialog
                                  open={
                                    activeDialog.type ===
                                      "edit" &&
                                    activeDialog.userId ===
                                      u.id
                                  }
                                  onOpenChange={(isOpen) => {
                                    if (isOpen) {
                                      setActiveDialog({
                                        type: "edit",
                                        userId: u.id,
                                      });

                                      setSelectedRole(
                                        u.role_id
                                          ? String(u.role_id)
                                          : ""
                                      );
                                    } else {
                                      setActiveDialog({
                                        type: null,
                                        userId: null,
                                      });
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      disabled={
                                        actionsDisabled
                                      }
                                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    >
                                      <Edit className="h-4 w-4" />

                                      <span className="sr-only">
                                        Modifică rolul
                                      </span>
                                    </Button>
                                  </DialogTrigger>


                                  <DialogContent>

                                    <DialogHeader>
                                      <DialogTitle>
                                        Modifică rolul
                                      </DialogTitle>

                                      <DialogDescription>
                                        Selectează rolul pentru{" "}
                                        <strong>
                                          {u.username}
                                        </strong>
                                        .
                                      </DialogDescription>
                                    </DialogHeader>


                                    <div className="py-4">
                                      <select
                                        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        value={selectedRole}
                                        onChange={(e) =>
                                          setSelectedRole(
                                            e.target.value
                                          )
                                        }
                                      >
                                        <option value="">
                                          Fără rol
                                        </option>

                                        {roles.map((r) => (
                                          <option
                                            key={r.id}
                                            value={r.id}
                                          >
                                            {r.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>


                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          setActiveDialog({
                                            type: null,
                                            userId: null,
                                          })
                                        }
                                      >
                                        Anulează
                                      </Button>

                                      <Button
                                        onClick={() =>
                                          void handleUpdateRole(
                                            u.id
                                          )
                                        }
                                      >
                                        Salvează
                                      </Button>
                                    </DialogFooter>

                                  </DialogContent>
                                </Dialog>


                                {/* DELETE */}
                                <Dialog
                                  open={
                                    activeDialog.type ===
                                      "delete" &&
                                    activeDialog.userId ===
                                      u.id
                                  }
                                  onOpenChange={(isOpen) => {
                                    if (isOpen) {
                                      setActiveDialog({
                                        type: "delete",
                                        userId: u.id,
                                      });
                                    } else {
                                      setActiveDialog({
                                        type: null,
                                        userId: null,
                                      });
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      disabled={
                                        actionsDisabled
                                      }
                                      className="h-8 w-8 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />

                                      <span className="sr-only">
                                        Elimină utilizatorul
                                      </span>
                                    </Button>
                                  </DialogTrigger>


                                  <DialogContent>

                                    <DialogHeader>
                                      <DialogTitle>
                                        Eliminare acces
                                      </DialogTitle>

                                      <DialogDescription>
                                        Ești pe cale să elimini
                                        utilizatorul{" "}
                                        <strong>
                                          {u.username}
                                        </strong>{" "}
                                        din companie.

                                        <br />
                                        <br />

                                        Acesta își va pierde
                                        accesul la fișiere, însă
                                        documentele deja
                                        înregistrate vor rămâne
                                        în aplicație.
                                      </DialogDescription>
                                    </DialogHeader>


                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          setActiveDialog({
                                            type: null,
                                            userId: null,
                                          })
                                        }
                                      >
                                        Anulează
                                      </Button>

                                      <Button
                                        variant="danger"
                                        onClick={() =>
                                          void handleDeleteUser(
                                            u.id
                                          )
                                        }
                                      >
                                        Elimină accesul
                                      </Button>
                                    </DialogFooter>

                                  </DialogContent>
                                </Dialog>

                              </div>
                            </td>
                          )}

                        </tr>
                      );
                    })}

                  </tbody>
                </table>

              </div>
            )}

          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Activitate
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Activitatea recentă a membrilor echipei.
              </p>
            </div>

            <OperatorActivity
              entries={entries}
              users={users as any}
            />
          </section>

        </div>
      )}

    </div>
  );
}