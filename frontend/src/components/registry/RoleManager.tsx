import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { NamedEntity } from "@/types/registry";

interface RoleEntity extends NamedEntity {
  permission_level: "full_access" | "read_write" | "read";
}

const PERMISSION_LABELS: Record<string, string> = {
  full_access: "Acces integral",
  read_write: "Citire și scriere",
  read: "Citire",
};

export function RoleManager({
  items,
  onCreate,
  onDelete,
}: {
  items: RoleEntity[];
  onCreate: (name: string, permissionLevel: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [permissionLevel, setPermissionLevel] = useState("read");

  async function handleCreate() {
    if (!name.trim()) return;

    await onCreate(name.trim(), permissionLevel);

    setName("");
    setPermissionLevel("read");
  }

  return (
    <section>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Roluri
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {items.length === 0
              ? "Nu există roluri."
              : items.length === 1
                ? "1 rol configurat"
                : `${items.length} roluri configurate`}
          </p>
        </div>

        <span className="text-sm tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </div>

      {/* Create role */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input
          className="flex-1"
          placeholder="Numele rolului..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleCreate();
            }
          }}
        />

        <select
          className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={permissionLevel}
          onChange={(e) => setPermissionLevel(e.target.value)}
        >
          <option value="read">Citire</option>
          <option value="read_write">Citire și scriere</option>
          <option value="full_access">Acces integral</option>
        </select>

        <Button
          onClick={() => void handleCreate()}
          disabled={!name.trim()}
        >
          <Plus className="mr-1 h-4 w-4" />
          Adaugă
        </Button>
      </div>

      {/* Roles */}
      <div className="divide-y divide-border border-y border-border">
        {items.length === 0 ? (
          <div className="py-6 text-sm text-muted-foreground">
            Adaugă primul rol folosind câmpul de mai sus.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="group flex min-h-14 items-center justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {item.name}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {PERMISSION_LABELS[item.permission_level] ??
                    item.permission_level}
                </p>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">
                      Șterge rolul
                    </span>
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Ștergi rolul?
                    </DialogTitle>

                    <DialogDescription>
                      Utilizatorii cu acest rol vor avea nevoie de
                      unul nou.
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
          ))
        )}
      </div>
    </section>
  );
}