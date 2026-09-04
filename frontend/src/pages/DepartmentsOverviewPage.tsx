import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Users } from "lucide-react";
import { toast } from "sonner";
import { getCompanyUsers, getDepartments } from "@/api/client";
import Avatar from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import type { NamedEntity } from "@/types/registry";

interface CompanyUser {
  id: number;
  username: string;
  email: string | null;
  is_owner: boolean;
  role: string | null;
  permission_level: string;
  avatar_url: string | null;
  departments: NamedEntity[];
}

export default function DepartmentsOverviewPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [departments, setDepartments] = useState<NamedEntity[]>([]);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    void loadData();
  }, [token, navigate]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const [departmentsData, usersData] = await Promise.all([
        getDepartments(token),
        getCompanyUsers(token),
      ]);
      setDepartments(departmentsData);
      setUsers(usersData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nu s-au putut încărca departamentele");
    } finally {
      setLoading(false);
    }
  }

  const usersByDepartment = useMemo(() => {
    const map: Record<number, CompanyUser[]> = {};
    for (const department of departments) {
      map[department.id] = users.filter((u) =>
        u.departments.some((d) => d.id === department.id),
      );
    }
    return map;
  }, [departments, users]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate("/admin")}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Panou de control
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Departamente</h1>
          <p className="text-sm text-muted-foreground">Vizualizează departamentele și utilizatorii asignați fiecăruia.</p>
        </div>
      </section>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
          Se încarcă...
        </div>
      ) : departments.length === 0 ? (
        <div className="rounded-md border border-border bg-muted/10 p-8 text-center text-sm text-muted-foreground">
          <Building2 className="mx-auto mb-3 h-7 w-7 text-muted-foreground/50" />
          Nu există departamente create.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {departments.map((department) => {
            const departmentUsers = usersByDepartment[department.id] ?? [];
            return (
              <div key={department.id} className="flex flex-col border border-border bg-background rounded-md overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">{department.name}</h3>
                  </div>
                  <Badge variant="secondary" className="font-normal">{departmentUsers.length}</Badge>
                </div>
                <div className="p-5">
                  {departmentUsers.length === 0 ? (
                    <div className="py-6 text-center">
                      <Users className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">Niciun utilizator asignat.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {departmentUsers.map((u) => (
                        <div key={u.id} className="flex items-center gap-3 rounded-md border border-transparent p-2 hover:border-border hover:bg-muted/30 transition-colors">
                          <Avatar src={u.avatar_url} name={u.username} size={32} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{u.username}</p>
                            {u.email && <p className="text-xs text-muted-foreground truncate">{u.email}</p>}
                          </div>
                          <Badge variant="outline" className="font-normal shrink-0">{u.role ?? "Fără rol"}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}