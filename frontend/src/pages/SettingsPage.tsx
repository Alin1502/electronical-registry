import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { useAuthStore } from "@/store/authStore";

type SettingsTab = "profile" | "records" | "company";

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="py-16 text-center text-sm text-muted-foreground">
      {label} în lucru.
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const isAdmin = Boolean(user?.is_owner || user?.permission_level === "full_access");

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) return null;

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "profile", label: "Profil" },
    ...(isAdmin
      ? [
          { id: "records" as const, label: "Setări registre" },
          { id: "company" as const, label: "Setări companie" },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Setări</h1>
      </section>

      <div className="flex gap-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "records" && isAdmin && <ComingSoon label="Setări registre" />}
        {activeTab === "company" && isAdmin && <ComingSoon label="Setări companie" />}
      </div>
    </div>
  );
}