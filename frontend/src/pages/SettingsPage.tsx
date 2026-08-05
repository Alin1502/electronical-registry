import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Building2, Layers } from "lucide-react";

function ComingSoon({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-2 py-12">
        <p className="text-muted-foreground">{label} settings coming soon...</p>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { token, user, theme, setTheme } = useAuthStore();
  const isAdmin = Boolean(user?.is_owner || user?.permission_level === "full_access");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-1 border-b border-border pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences and system configuration.</p>
      </section>

      <Tabs defaultValue="profile">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2">Appearance</h3>
            <div className="flex items-center gap-3">
              <Button
                variant={theme === "light" ? "default" : "ghost"}
                onClick={() => setTheme("light")}
              >
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "ghost"}
                onClick={() => setTheme("dark")}
              >
                Dark
              </Button>
            </div>
          </CardContent>
        </Card>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="records">
              <Layers className="mr-1.5 h-3.5 w-3.5" />
              Record Types
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="company">
              <Building2 className="mr-1.5 h-3.5 w-3.5" />
              Company
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="records">
            <ComingSoon label="Record type" />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="company">
            <ComingSoon label="Company" />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}