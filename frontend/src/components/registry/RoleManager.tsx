import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Roles</CardTitle>
        <Badge>{items.length}</Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-2 md:flex-row">
          <Input placeholder="Role name..." value={name} onChange={(e) => setName(e.target.value)} />
          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
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
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
              <div>
                <span className="text-sm font-medium">{item.name}</span>
                <p className="text-xs text-muted-foreground">{PERMISSION_LABELS[item.permission_level] ?? item.permission_level}</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="danger"><Trash2 className="h-4 w-4" /></Button>
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
      </CardContent>
    </Card>
  );
}