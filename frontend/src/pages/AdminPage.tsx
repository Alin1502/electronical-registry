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
import type { InviteEntity, RoleEntity, NamedEntity } from "@/types/registry";

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
    <section>
      {/* Section heading */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {title}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {items.length === 0
              ? `Nu există ${title.toLowerCase()}.`
              : items.length === 1
                ? "1 element"
                : `${items.length} elemente`}
          </p>
        </div>

        <span className="text-sm tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </div>

      {/* Add */}
      <div className="mb-4 flex gap-2">
        <Input
          placeholder={`Adaugă ${title.toLowerCase().slice(0, -1)}...`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={async (event) => {
            if (event.key === "Enter" && value.trim()) {
              await onCreate(value.trim());
              setValue("");
            }
          }}
        />

        <Button
          onClick={async () => {
            if (!value.trim()) return;

            await onCreate(value.trim());
            setValue("");
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Adaugă
        </Button>
      </div>

      {/* List */}
      <div className="divide-y divide-border border-y border-border">
        {items.length === 0 ? (
          <div className="py-6 text-sm text-muted-foreground">
            Adaugă primul element folosind câmpul de mai sus.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="group flex min-h-12 items-center justify-between gap-4 py-2"
            >
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
                <span className="text-sm font-medium text-foreground">
                  {item.name}
                </span>
              )}

              {/* Actions only become visible on hover */}
              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(item.id)}
                >
                  Editează
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Ștergi {title.slice(0, -1).toLowerCase()}?
                      </DialogTitle>

                      <DialogDescription>
                        Acțiunea este ireversibilă.
                      </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                      <Button variant="outline">
                        Anulare
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => onDelete(item.id)}
                      >
                        Șterge
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}


function PendingInvitesList({
  items,
}: {
  items: InviteEntity[];
}) {
  return (
    <section>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Invitații în așteptare
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Persoane care nu au acceptat încă invitația.
          </p>
        </div>

        <span className="text-sm tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="border-y border-border py-5 text-sm text-muted-foreground">
          Nu există invitații în așteptare.
        </div>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {items.map((invite) => {
            const isExpired =
              new Date(invite.expires_at) < new Date();

            return (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {invite.email}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {invite.role_name ?? "Fără rol"} · invitat de{" "}
                    {invite.invited_by} · {formatDate(invite.created_at)}
                  </p>
                </div>

                <Badge
                  variant={isExpired ? "outline" : "secondary"}
                  className="shrink-0 font-normal"
                >
                  {isExpired ? "Expirat" : "În așteptare"}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}


export default function AdminPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const isAdmin = Boolean(
    user?.is_owner || user?.permission_level === "full_access"
  );

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
      const [deptData, roleData, inviteData] =
        await Promise.all([
          getDepartments(token),
          getRoles(token),
          getInvites(token),
        ]);

      setDepartments(deptData);
      setRoles(roleData);
      setInvites(inviteData);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message !== "Admin access required"
      ) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load admin data"
        );
      }
    }
  }


  return (
    <div className="space-y-12">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <section className="pb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Panou de control
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Gestionează organizația, utilizatorii și permisiunile.
        </p>
      </section>


      {/* =====================================================
          ACCESS WARNING
      ====================================================== */}
      {!isAdmin ? (
        <div className="border-y border-border py-4 text-sm text-muted-foreground">
          Nu poți vedea tot conținutul deoarece nu ai permisiuni
          de administrator.
        </div>
      ) : null}


      {/* =====================================================
          INVITE USER
      ====================================================== */}
      {isAdmin ? (
        <section>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              Invită un coleg
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Trimite o invitație pentru a adăuga un utilizator
              în organizație.
            </p>
          </div>

          <InviteUserForm roles={roles} />
        </section>
      ) : null}


      {/* =====================================================
          PENDING INVITES
      ====================================================== */}
      {isAdmin ? (
        <PendingInvitesList items={invites} />
      ) : null}


      {/* =====================================================
          ORGANIZATION
      ====================================================== */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Organizație
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configurează departamentele și rolurile disponibile
            în organizație.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">

          {/* Departments */}
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


          {/* Roles */}
          <RoleManager
            items={roles}

            onCreate={async (name, permissionLevel) => {
              if (!token) return;

              await createRole(
                token,
                name,
                permissionLevel
              );

              toast.success("Rol adăugat");

              await loadAll();
            }}

            onDelete={async (id) => {
              if (!token) return;

              await deleteRole(token, id);

              toast.success("Rol șters");

              await loadAll();
            }}
          />

        </div>
      </section>


      {isAdmin ? (
        <section>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              Importă structura organizației
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Încarcă o organigramă pentru a identifica automat
              departamentele.
            </p>
          </div>

          <ChartUpload onImported={loadAll} />
        </section>
      ) : null}

    </div>
  );
}