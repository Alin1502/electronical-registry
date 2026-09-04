import { useState } from "react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { createInvite } from "@/api/client";
import { useAuthStore } from "@/store/authStore";

import type { NamedEntity } from "@/types/registry";

export function InviteUserForm({
  roles,
}: {
  roles: NamedEntity[];
}) {
  const { token } = useAuthStore();

  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [sending, setSending] = useState(false);

  async function handleInvite() {
    if (!token || !email.trim()) return;

    setSending(true);

    try {
      await createInvite(
        token,
        email.trim(),
        roleId ? Number(roleId) : undefined
      );

      toast.success(`Invitație trimisă către ${email}`);

      setEmail("");
      setRoleId("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Invitația nu a putut fi trimisă"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          placeholder="exemplu@domeniu.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleInvite();
            }
          }}
          className="sm:flex-1"
        />

        <select
          className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
        >
          <option value="">Fără rol</option>

          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>

        <Button
          onClick={() => void handleInvite()}
          disabled={!email.trim() || sending}
        >
          <Mail className="mr-2 h-4 w-4" />

          {sending ? "Se trimite..." : "Trimite"}
        </Button>
      </div>
    </section>
  );
}