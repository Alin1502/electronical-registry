import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LockKeyhole, UserRound } from "lucide-react";
import { toast } from "sonner";
import { loginUser, registerUser } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";

interface ValidationErrors {
  username?: string;
  password?: string;
  company_name?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", company_name: "" });
  const [errors, setErrors] = useState<ValidationErrors>({});

  function validate() {
    const next: ValidationErrors = {};
    if (!form.username.trim()) next.username = "Username is required";
    if (!form.password.trim() || form.password.length < 6) next.password = "Use at least 6 characters";
    if (isRegister && !form.company_name.trim()) next.company_name = "Company name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isRegister) {
        const result = await registerUser(form.username, form.company_name, form.password);
        if (result.message) {
          toast.success("Account created. Please sign in.");
          setIsRegister(false);
          setForm({ username: "", password: "", company_name: "" });
          setErrors({});
          return;
        }
      } else {
        const result = await loginUser(form.username, form.password);
        if (result.access_token) {
          setToken(result.access_token);
          toast.success("Welcome back");
          navigate("/registry");
          return;
        }
      }
      toast.error("Authentication failed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-10 md:py-20">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-cyan-50 to-blue-50">
          <CardTitle className="text-2xl">{isRegister ? "Create Secure Account" : "Secure Sign In"}</CardTitle>
          <CardDescription>Access the electronic registry with your company credentials.</CardDescription>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                  placeholder="john.doe"
                />
              </div>
              {errors.username && <p className="text-xs text-danger">{errors.username}</p>}
            </div>

            {isRegister && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={form.company_name}
                  onChange={(event) => setForm((prev) => ({ ...prev, company_name: event.target.value }))}
                  placeholder="Nordic Health Office"
                />
                {errors.company_name && <p className="text-xs text-danger">{errors.company_name}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-danger">{errors.password}</p>}
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <Button variant="ghost" className="mt-4 w-full" onClick={() => setIsRegister((prev) => !prev)}>
            {isRegister ? "Already have an account? Sign in" : "Need access? Create an account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
