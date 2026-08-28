import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createInvite } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import type { NamedEntity } from "@/types/registry";

export function InviteUserForm({ roles }: { roles: NamedEntity[] }) {
  const { token } = useAuthStore();
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [sending, setSending] = useState(false);

  async function handleInvite() {
    if (!token || !email.trim()) return;
    setSending(true);
    try {
      await createInvite(token, email.trim(), roleId ? Number(roleId) : undefined);
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setRoleId("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invite");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col border border-border bg-background rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/20">
        <h3 className="text-sm font-medium text-foreground">Invită un coleg să se alăture</h3>
      </div>
      <div className="p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            type="email"
            placeholder="exemplu@domeniu.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="md:flex-1"
          />
          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            <option value="">Fără rol</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <Button onClick={handleInvite} disabled={!email.trim() || sending}>
            <Mail className="mr-2 h-4 w-4" />
            {sending ? "Se trimite..." : "Trimite"}
          </Button>
        </div>
      </div>
    </div>
  );
}