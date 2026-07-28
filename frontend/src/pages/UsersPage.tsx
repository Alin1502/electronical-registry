import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getEntries, getCompanyUsers } from "@/api/client";
import { OperatorActivity } from "@/components/dashboard/OperatorActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import type { DocumentEntry } from "@/types/registry";
import { Users, Mail, Shield } from "lucide-react";

interface CompanyUser {
  id: number;
  username: string;
  email: string | null;
  is_owner: boolean;
  role: string | null;
  permission_level: string;
}

export default function UsersPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const isAdmin = user?.is_owner || user?.permission_level === "full_access";
  
  const [entries, setEntries] = useState<DocumentEntry[]>([]);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      navigate("/registry");
      return;
    }
    void loadData();
  }, [token, isAdmin, navigate]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const [usersData, entriesData] = await Promise.all([
        getCompanyUsers(token),
        getEntries(token, "contracte"),
      ]);
      setUsers(usersData);
      setEntries(entriesData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Team Members</p>
            <h1 className="mt-2 text-2xl font-semibold">Users & Activity</h1>
            <p className="mt-3 text-sm text-muted-foreground">Manage team members and their permissions.</p>
          </CardContent>
        </Card>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">Loading users...</div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Company Members ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No users in this company yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Username</th>
                        <th className="text-left py-3 px-4 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 font-semibold">Role</th>
                        <th className="text-left py-3 px-4 font-semibold">Permission Level</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-muted/30">
                          <td className="py-3 px-4 font-medium">{u.username}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {u.email || "—"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {u.is_owner ? <Badge variant="default">Owner</Badge> : <Badge variant="outline">{u.role || "—"}</Badge>}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={u.permission_level === "full_access" ? "default" : "secondary"}>
                              {u.permission_level}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="success">Active</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <OperatorActivity entries={entries} />
        </div>
      )}
    </div>
  );
}
