import { BarChart3, Building2, FileStack, Home, KeyRound, Settings, ShieldCheck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface AppSidebarProps {
  collapsed: boolean;
}

const navigationItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/registry", label: "Registry", icon: FileStack, end: true },
  { to: "/records", label: "Records", icon: Building2, end: true },
  { to: "/secure-documents", label: "Secure Docs", icon: KeyRound, end: true },
  { to: "/reports", label: "Reports", icon: BarChart3, end: true },
  { to: "/users", label: "Users", icon: Users, end: true },
  { to: "/admin", label: "Admin", icon: ShieldCheck, end: true },
  { to: "/settings", label: "Settings", icon: Settings, end: true },
];

export function AppSidebar({ collapsed }: AppSidebarProps) {
  const { user } = useAuthStore();
  const hasAdminAccess = user?.is_owner || user?.permission_level === "full_access";
  const visibleNavigationItems = hasAdminAccess
    ? navigationItems
    : navigationItems.filter((item) => !["/admin", "/users", "/registry"].includes(item.to));

  return (
    <aside
      className={cn(
        // Removed: rounded-md, shadow-soft, sticky, p-4, backdrop-blur
        // Added: flex-col, h-screen, border-r, z-10
        "hidden h-screen flex-col border-r border-border bg-background transition-all duration-300 md:flex z-10",
        collapsed ? "w-16 items-center px-2 py-4" : "w-64 px-4 py-4"
      )}
    >
      <nav className="flex w-full flex-col gap-1 mt-4">
        {visibleNavigationItems.map((item) => (
          <NavLink
            key={`${item.to}-${item.label}`}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-secondary text-secondary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0" // Center icon when collapsed
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}