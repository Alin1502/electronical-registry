import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAdminStats, getEntries } from "@/api/client";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { StatCard } from "@/components/dashboard/StatCard";
import { DocumentVolumeChart } from "@/components/dashboard/DocumentVolumeChart";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { EntriesPerRegistryChart } from "@/components/dashboard/EntriesPerRegistryChart";
import { ProcessingThroughputChart } from "@/components/dashboard/ProcessingThroughputChart";
import { OperatorActivity } from "@/components/dashboard/OperatorActivity";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import type { AdminStats } from "@/types/registry";
import type { DocumentEntry } from "@/types/registry";

const REGISTRY_TYPES = [
  "contracte",
  "intrari/iesiri",
  "decizii/hotarari",
  "facturi",
  "jurnal",
  "inventar",
  "casa",
  "unic de control",
  "evidenta a salariatilor",
] as const;

const RECENT_WINDOW_DAYS = 7;

function formatStorage(bytes: number) {
  if (!bytes || bytes <= 0) return "0 GB";
  const gigabytes = bytes / (1024 ** 3);
  if (gigabytes >= 10) return `${gigabytes.toFixed(0)} GB`;
  if (gigabytes >= 1) return `${gigabytes.toFixed(1)} GB`;
  return `${gigabytes.toFixed(2)} GB`;
}

export default function RegistryPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [allEntries, setAllEntries] = useState<DocumentEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    void loadAllData();
  }, [token, navigate]);
  useEffect(() => {
    // If they aren't an admin/owner, kick them to /records immediately
    if (user && !user.is_owner && user.permission_level !== "full_access") {
      navigate("/records", { replace: true });
    }
  }, [user, navigate]);
  async function loadAllData() {
    if (!token) return;
    setLoadingEntries(true);
    try {
      const [adminStats, registryEntries] = await Promise.all([
        getAdminStats(token),
        Promise.all(REGISTRY_TYPES.map((register) => getEntries(token, register))),
      ]);

      const allRegisterEntries = registryEntries.flat();
      setStats(adminStats);
      setAllEntries(allRegisterEntries);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load registry data");
    } finally {
      setLoadingEntries(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">Registry Overview</p>
        <h1 className="text-2xl font-semibold">{user?.company_name ?? "Registry"}</h1>
        <p className="text-sm text-muted-foreground">Operational snapshot across your registries.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Entries"
          value={<AnimatedCounter value={stats?.total_entries ?? allEntries.length} />}
          detail={`+${stats?.recent_entries_last_7_days ?? 0} in last ${RECENT_WINDOW_DAYS} days`}
        />
        <StatCard title="Pending Validation" value={<AnimatedCounter value={stats?.pending_validation ?? 0} />} detail="awaiting review" />
        <StatCard title="Registries" value={stats?.registry_count ?? REGISTRY_TYPES.length} detail="active registry types" />
        <StatCard
          title="Operators"
          value={stats?.operator_count ?? 0}
          detail={`${stats?.department_count ?? 0} departments`}
        />
        <StatCard
          title="Storage"
          value={formatStorage(stats?.total_storage_bytes ?? 0)}
          detail="document storage used"
        />
      </section>

      {/* Analytics Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Analytics Overview</h2>
        {loadingEntries ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">Loading analytics...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <DocumentVolumeChart entries={allEntries} />
            <StatusDistributionChart entries={allEntries} />
            <EntriesPerRegistryChart entries={allEntries} />
            <ProcessingThroughputChart entries={allEntries} />
          </div>
        )}
      </div>

      <OperatorActivity entries={allEntries} />
    </div>
  );
}
