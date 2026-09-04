import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAdminStats, getEntries, getCompanyUsers, getRegisterTypes } from "@/api/client";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { StatCard } from "@/components/dashboard/StatCard";
import { DocumentVolumeChart } from "@/components/dashboard/DocumentVolumeChart";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { EntriesPerRegistryChart } from "@/components/dashboard/EntriesPerRegistryChart";
import { ProcessingThroughputChart } from "@/components/dashboard/ProcessingThroughputChart";
import { OperatorActivity } from "@/components/dashboard/OperatorActivity";
import { useAuthStore } from "@/store/authStore";
import type { AdminStats, RegisterTypeConfig } from "@/types/registry";
import type { DocumentEntry } from "@/types/registry";

const LEGACY_REGISTRY_TYPES = [
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
  const [usersList, setUsersList] = useState<any[]>([]);
  const [registerTypes, setRegisterTypes] = useState<RegisterTypeConfig[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const analyticsEntries = allEntries.filter((entry) => entry.status !== "rejected");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    let isActive = true;

    async function loadAllData() {
      setLoadingEntries(true);
      try {
        const [adminStats, configuredRegisterTypes, fetchedUsers] = await Promise.all([
          getAdminStats(token),
          getRegisterTypes(token),
          getCompanyUsers(token),
        ]);

        if (!isActive) return;

        const registerKeys = [
          ...new Set([
            ...LEGACY_REGISTRY_TYPES,
            ...configuredRegisterTypes.map((register) => register.key),
          ]),
        ];
        const registryEntries = await Promise.all(registerKeys.map((register) => getEntries(token, register)));

        if (!isActive) return;

        const allRegisterEntries = registryEntries.flat();
        setStats(adminStats);
        setRegisterTypes(configuredRegisterTypes);
        setAllEntries(allRegisterEntries);
        setUsersList(fetchedUsers);
      } catch (error) {
        if (isActive) {
          toast.error(error instanceof Error ? error.message : "Failed to load registry data");
        }
      } finally {
        if (isActive) {
          setLoadingEntries(false);
        }
      }
    }

    void loadAllData();
    return () => {
      isActive = false;
    };
  }, [token, navigate]);

  useEffect(() => {
    // If they aren't an admin/owner, kick them to /records immediately
    if (user && !user.is_owner && user.permission_level !== "full_access") {
      navigate("/records", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-1 border-b border-border pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Prezentare generală</h1>
        <p className="text-sm text-muted-foreground">
          Statistici pentru <span className="font-medium text-foreground">{user?.company_name ?? "your company"}</span>
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x border border-border bg-background rounded-md overflow-hidden">
        <StatCard
          title="Documente adăugate"
          value={<AnimatedCounter value={stats?.total_entries ?? allEntries.length} />}
          detail={`+${stats?.recent_entries_last_7_days ?? 0} în ultimele ${RECENT_WINDOW_DAYS} zile`}
        />
        <StatCard title="Status" value={<AnimatedCounter value={stats?.pending_validation ?? 0} />} detail="în așteptare" />
        <StatCard title="Registre" value={stats?.registry_count ?? registerTypes.length} detail="registre active" />
        <StatCard
          title="Operatori"
          value={stats?.operator_count ?? 0}
          detail={`${stats?.department_count ?? 0} departamente`}
        />
        <StatCard
          title="Spațiu de stocare"
          value={formatStorage(stats?.total_storage_bytes ?? 0)}
          detail="utilizați"
        />
      </section>

      <div className="space-y-6">
        <h2 className="text-lg font-medium text-foreground">Statisticile pentru documentele adăuugate</h2>
        {loadingEntries ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Se încarcă...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <DocumentVolumeChart entries={analyticsEntries} />
            <StatusDistributionChart entries={analyticsEntries} />
            <EntriesPerRegistryChart entries={analyticsEntries} />
            <ProcessingThroughputChart entries={analyticsEntries} />
          </div>
        )}
      </div>

      <OperatorActivity entries={analyticsEntries} users={usersList} />
    </div>
  );
}