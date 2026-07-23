import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Invite a Team Member</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            <option value="">No role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <Button onClick={handleInvite} disabled={!email.trim() || sending}>
            <Mail className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : "Send Invite"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}