import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { NamedEntity } from "@/types/registry";

interface RoleEntity extends NamedEntity {
  permission_level: "full_access" | "read_write" | "read";
}

const PERMISSION_LABELS: Record<string, string> = {
  full_access: "Full Access (Admin)",
  read_write: "Read & Write",
  read: "Read Only",
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

  return (
    <div className="flex flex-col border border-border bg-background rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
        <h3 className="text-sm font-medium text-foreground">Roles</h3>
        <Badge variant="secondary" className="font-normal">{items.length}</Badge>
      </div>
      <div className="p-5">
        <div className="mb-5 flex flex-col gap-2 xl:flex-row">
          <Input className="flex-1" placeholder="Role name..." value={name} onChange={(e) => setName(e.target.value)} />
          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={permissionLevel}
            onChange={(e) => setPermissionLevel(e.target.value)}
          >
            <option value="read">Read Only</option>
            <option value="read_write">Read & Write</option>
            <option value="full_access">Full Access (Admin)</option>
          </select>
          <Button
            onClick={async () => {
              if (!name.trim()) return;
              await onCreate(name.trim(), permissionLevel);
              setName("");
              setPermissionLevel("read");
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-transparent hover:border-border hover:bg-muted/30 p-2 transition-colors">
              <div className="pl-1">
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <p className="text-xs text-muted-foreground">{PERMISSION_LABELS[item.permission_level] ?? item.permission_level}</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete role?</DialogTitle>
                    <DialogDescription>Users assigned this role will need a new one.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="danger" onClick={() => onDelete(item.id)}>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}