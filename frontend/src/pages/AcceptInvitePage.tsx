import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { acceptInvite } from "@/api/client";
import { useAuthStore } from "@/store/authStore";

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!username.trim() || !password) return;
    setSubmitting(true);
    try {
      const result = await acceptInvite({ token, username: username.trim(), password });
      setToken(result.access_token);
      toast.success("Account created");
      navigate("/registry");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-a putut accepta invitația");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-muted-foreground">Link-ul pentru invitație este invalid sau nu există</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <Card>
        <CardHeader>
          <CardTitle>Acceptă invitația în echipă</CardTitle>
          <CardDescription>Crează contul în cadrul organizației</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" placeholder="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating account..." : "Create Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}