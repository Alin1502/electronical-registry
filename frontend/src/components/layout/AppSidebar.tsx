import { useEffect } from "react";
import {
  Menu,
  BarChart3,
  Building2,
  FileStack,
  FileText,
  Home,
  KeyRound,
  Settings,
  ShieldCheck,
  Users,
  UserCircle2,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar } from "@/components/ui/Avatar";
import { getMyProfile } from "@/api/client";


interface AppSidebarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}


const mainNavigationItems = [
  {
    to: "/",
    label: "Pagina principală",
    icon: Home,
    end: true,
  },
  {
    to: "/records",
    label: "Registru",
    icon: Building2,
    end: true,
  },
  {
    to: "/secure-documents",
    label: "Documente criptate",
    icon: KeyRound,
    end: true,
  },
  {
    to: "/reports",
    label: "Arhivă",
    icon: BarChart3,
    end: true,
  },
];


const organizationNavigationItems = [
  {
    to: "/users",
    label: "Utilizatori",
    icon: Users,
    end: true,
  },
  {
    to: "/admin",
    label: "Administrare",
    icon: ShieldCheck,
    end: true,
  },
];


const bottomNavigationItems = [
  {
    to: "/settings",
    label: "Setări",
    icon: Settings,
    end: true,
  },
];


export function AppSidebar({
  collapsed,
  onToggleSidebar,
}: AppSidebarProps) {
  const navigate = useNavigate();

  const {
    user,
    token,
    profile,
    setProfile,
    logout,
  } = useAuthStore();

  const hasAdminAccess =
    user?.is_owner ||
    user?.permission_level === "full_access";


  const visibleOrganizationItems = hasAdminAccess
    ? organizationNavigationItems
    : organizationNavigationItems.filter(
        (item) => !["/admin", "/users"].includes(item.to)
      );


  useEffect(() => {
    if (!token || profile) return;

    async function loadProfile() {
      try {
        const data = await getMyProfile(token);
        setProfile(data);
      } catch (error) {
        console.error(
          "Failed to load profile for sidebar",
          error
        );
      }
    }

    void loadProfile();
  }, [profile, setProfile, token]);


  function renderNavigationItem(
    item: {
      to: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      end?: boolean;
    }
  ) {
    const Icon = item.icon;

    return (
      <NavLink
        key={`${item.to}-${item.label}`}
        to={item.to}
        end={item.end}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            collapsed && "justify-center px-0"
          )
        }
      >
        {({ isActive }) => (
          <>
            {/* Active indicator */}
            {isActive && !collapsed && (
              <span className="absolute left-0 h-5 w-0.5 rounded-full bg-primary" />
            )}

            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />

            {!collapsed && (
              <span className="truncate">
                {item.label}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  }


  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 flex-col border-r border-border bg-background md:flex",
        "transition-[width] duration-200",
        collapsed
          ? "w-[68px] px-2.5 py-4"
          : "w-[240px] px-3 py-4"
      )}
    >

      <div
        className={cn(
          "flex h-11 items-center",
          collapsed
            ? "justify-center"
            : "justify-between px-2"
        )}
      >
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-none text-foreground">
                Regix
              </p>

              <p className="mt-1 text-[11px] leading-none text-muted-foreground">
                Registratură electronică
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground",
            collapsed && "mt-3"
          )}
          onClick={onToggleSidebar}
          aria-label={
            collapsed
              ? "Extinde meniul"
              : "Restrânge meniul"
          }
        >
          <Menu className="h-[18px] w-[18px]" />
        </Button>
      </div>

      <nav className="mt-7 flex min-h-0 flex-1 flex-col">

        {/* Main */}
        <div>
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
              Principal
            </p>
          )}

          <div className="space-y-0.5">
            {mainNavigationItems.map(renderNavigationItem)}
          </div>
        </div>


        {/* Organization */}
        {visibleOrganizationItems.length > 0 && (
          <div className="mt-7">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
                Organizație
              </p>
            )}

            <div className="space-y-0.5">
              {visibleOrganizationItems.map(
                renderNavigationItem
              )}
            </div>
          </div>
        )}


        {/* Bottom navigation */}
        <div className="mt-auto">
          <div className="mb-3 border-t border-border" />

          <div className="space-y-0.5">
            {bottomNavigationItems.map(
              renderNavigationItem
            )}
          </div>
        </div>
      </nav>


      {user && (
        <div className="mt-3 pt-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                  "hover:bg-muted/60",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  collapsed && "justify-center px-0"
                )}
              >
                <Avatar
                  src={profile?.avatar_url ?? null}
                  name={
                    profile?.username ??
                    user?.sub ??
                    "Utilizator"
                  }
                  size={32}
                  className="shrink-0"
                />

                {!collapsed && (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-none text-foreground">
                      {profile?.username ??
                        user.sub ??
                        "Utilizator"}
                    </p>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {profile?.company_name ??
                        user.company_name ??
                        "Companie"}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>


            <DropdownMenuContent
              side="right"
              align="end"
              sideOffset={8}
              className="w-56"
            >
              <DropdownMenuLabel>
                <p className="text-sm font-medium">
                  {profile?.username ??
                    user.sub ??
                    "Utilizator"}
                </p>

                <p className="mt-1 text-xs font-normal text-muted-foreground">
                  {profile?.company_name ??
                    user.company_name ??
                    "Companie"}
                </p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />


              <DropdownMenuItem
                onClick={() =>
                  navigate("/settings")
                }
              >
                <UserCircle2 className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>


              <DropdownMenuItem
                onClick={() =>
                  navigate("/registry")
                }
              >
                <FileStack className="mr-2 h-4 w-4" />
                Statistici
              </DropdownMenuItem>


              {hasAdminAccess && (
                <DropdownMenuItem
                  onClick={() =>
                    navigate("/admin")
                  }
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Administrare
                </DropdownMenuItem>
              )}


              {hasAdminAccess && (
                <DropdownMenuItem
                  onClick={() =>
                    navigate("/admin/departments")
                  }
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Detalii departamente
                </DropdownMenuItem>
              )}


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