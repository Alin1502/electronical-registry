import { BarChart3, Building2, FileStack, Home, Settings, ShieldCheck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  collapsed: boolean;
}

const navigationItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/dashboard", label: "Registry", icon: FileStack, end: true },
  { to: "/dashboard/records", label: "Records", icon: Building2, end: true },
  { to: "/dashboard/reports", label: "Reports", icon: BarChart3, end: true },
  { to: "/admin/users", label: "Users", icon: Users, end: true },
  { to: "/admin", label: "Admin", icon: ShieldCheck, end: true },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: true },
];

export function AppSidebar({ collapsed }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "sticky top-24 hidden h-[calc(100vh-7rem)] rounded-md border border-border/80 bg-card/85 p-4 shadow-soft backdrop-blur md:block",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={`${item.to}-${item.label}`}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition",
                isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted hover:text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
