import { useEffect } from "react";
import { Menu, BarChart3, Building2, FileStack, Home, KeyRound, Settings, ShieldCheck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { getMyProfile } from "@/api/client";

interface AppSidebarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

const navigationItems = [
  { to: "/", label: "Pagina Principală", icon: Home, end: true },
  { to: "/registry", label: "Statistici", icon: FileStack, end: true },
  { to: "/records", label: "Registru", icon: Building2, end: true },
  { to: "/secure-documents", label: "Documente Criptate", icon: KeyRound, end: true },
  { to: "/reports", label: "Arhivă", icon: BarChart3, end: true },
  { to: "/users", label: "Utilizatori", icon: Users, end: true },
  { to: "/admin", label: "Pagină Administrator", icon: ShieldCheck, end: true },
  { to: "/settings", label: "Setări", icon: Settings, end: true },
];

export function AppSidebar({ collapsed, onToggleSidebar }: AppSidebarProps) {
  const navigate = useNavigate();
  const { user, token, profile, setProfile, logout } = useAuthStore();
  const hasAdminAccess = user?.is_owner || user?.permission_level === "full_access";
  const visibleNavigationItems = hasAdminAccess
    ? navigationItems
    : navigationItems.filter((item) => !["/admin", "/users", "/registry"].includes(item.to));

  useEffect(() => {
    if (!token || profile) return;

    async function loadProfile() {
      try {
        const data = await getMyProfile(token);
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile for sidebar", error);
      }
    }

    void loadProfile();
  }, [profile, setProfile, token]);

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r border-border bg-background transition-all duration-300 md:flex z-10",
        collapsed ? "w-16 items-center px-2 py-4" : "w-64 px-4 py-4"
      )}
    >
      <div className={cn("flex w-full items-center", collapsed ? "justify-center" : "justify-end") }>
        <Button variant="ghost" size="icon" className="shrink-0" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

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

      {user && (
        <div className="mt-auto w-full pt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2 text-left transition hover:bg-muted",
                  collapsed && "justify-center px-0"
                )}
              >
                <Avatar
                  src={profile?.avatar_url ?? null}
                  name={profile?.username ?? user?.sub ?? "Utilizator"}
                  size={32}
                  className="border border-border"
                />
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">{profile?.username ?? user.sub ?? "Utilizator"}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{profile?.company_name ?? user.company_name ?? "Companie"}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56">
              <DropdownMenuLabel>
                <p>{user.sub ?? "Utilizator"}</p>
                <p className="font-normal text-xs text-muted-foreground mt-1">{user.company_name ?? "Companie"}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings") }>
                <UserCircle2 className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/registry")}>Registru</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin")}>Administrare</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
              >
                Deconectare
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </aside>
  );
}