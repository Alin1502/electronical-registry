import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LockKeyhole, UserRound, Building2, Hexagon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser, registerUser } from "@/api/client";
import { Button } from "@/components/ui/button";
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
          toast.success("Contul a fost creat cu succes. Vă puteți autentifica");
          setIsRegister(false);
          setForm({ username: "", password: "", company_name: "" });
          setErrors({});
          return;
        }
      } else {
        const result = await loginUser(form.username, form.password);
        if (result.access_token) {
          setToken(result.access_token);
          toast.success("Bine ați revenit");
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
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[400px] flex flex-col items-center"
      >
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Hexagon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isRegister ? "Crează un cont nou" : "Bine ai revenit"}
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            {isRegister 
              ? "Introdu detaliile organizației pentru a începe" 
              : "Introdu datele de autentificare pentru a accesa registrul electronic."}
          </p>
        </div>

        <div className="w-full rounded-md border border-border bg-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nume de utilizator</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10 bg-background focus-visible:ring-1"
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
              {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
            </div>

            <AnimatePresence mode="popLayout">
              {isRegister && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-sm font-medium text-foreground">Numele Companiei</label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-10 bg-background focus-visible:ring-1"
                      value={form.company_name}
                      onChange={(event) => setForm((prev) => ({ ...prev, company_name: event.target.value }))}
                      placeholder="Organization Ltd."
                    />
                  </div>
                  {errors.company_name && <p className="text-xs text-red-500">{errors.company_name}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Parolă</label>
                {!isRegister && (
                  <a href="#" className="text-xs font-medium text-primary hover:underline">
                    Recuperare parolă
                  </a>
                )}
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10 bg-background focus-visible:ring-1"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="••••••••"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <Button className="w-full mt-2 h-10" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegister ? "Create workspace" : "Sign In"}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? "Ai deja un cont? " : "Crează un cont nou "}
          <button 
            type="button" 
            onClick={() => {
              setIsRegister((prev) => !prev);
              setErrors({});
            }}
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            {isRegister ? "Autentificare" : "Înregistrare"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}