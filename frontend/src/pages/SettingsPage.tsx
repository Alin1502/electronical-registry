import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
  }, [token, navigate]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Configuration</p>
            <h1 className="mt-2 text-2xl font-semibold">Settings</h1>
            <p className="mt-3 text-sm text-muted-foreground">Manage your preferences and system configuration.</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Settings className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Settings coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
