import { Bell, Menu, Moon, Search, Sun, UserCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";

import { getPendingNotifications, getNotifications, markAllNotificationsRead } from "@/api/client";
import { NotificationBell, type PendingNotification, type RoleNotification } from "./NotificationBell";

const publicLinks = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/#services" },
  { label: "Process", to: "/#process" },
  { label: "FAQ", to: "/#faq" },
];

interface TopNavigationProps {
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function TopNavigation({ onToggleSidebar, darkMode, onToggleDarkMode }: TopNavigationProps) {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();

  const [validationNotifications, setValidationNotifications] = useState<PendingNotification[]>([]);
  const [roleNotifications, setRoleNotifications] = useState<RoleNotification[]>([]);

  // Check if the logged-in user is an admin
  const isAdmin = user?.permission_level === "full_access" || user?.is_owner;

  useEffect(() => {
    if (!token) return;

    async function fetchAll() {
      try {
        const [validation, roles] = await Promise.all([
          isAdmin ? getPendingNotifications(token) : Promise.resolve([]),
          getNotifications(token),
        ]);
        setValidationNotifications(validation);
        setRoleNotifications(roles);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    }

    // Fetch immediately on load
    fetchAll();

    // Poll every 30 seconds for new notifications
    const intervalId = setInterval(fetchAll, 30000);
    return () => clearInterval(intervalId);
  }, [token, isAdmin]);

  async function handleBellOpen() {
    const hasUnread = roleNotifications.some((n) => !n.is_read);
    if (!hasUnread || !token) return;
    try {
      await markAllNotificationsRead(token);
      setRoleNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  }

  const initials = useMemo(() => {
    const text = user?.company_name ?? user?.sub ?? "RG";
    return text
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex h-16 w-full items-center gap-4 px-6">
        
        {token && (
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center">
            <img src="/REGIX_LOGO.png" alt="Regix Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Regix</p>
            <p className="text-xs text-muted-foreground">Electronic Registry</p>
          </div>
        </Link>

        {!token ? (
          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {publicLinks.map((item) => (
              <Button key={item.label} asChild variant="ghost" className="rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                <Link to={item.to}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        ) : null}

        {token ? (
          <div className="relative ml-auto hidden min-w-[260px] flex-1 md:flex md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="rounded-md bg-muted/50 pl-10 border-transparent focus:border-border focus:bg-background transition-colors" placeholder="Search records, files, users..." />
          </div>
        ) : (
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Button asChild variant="ghost" className="rounded-md text-sm font-medium">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <Button variant="ghost" size="icon" onClick={onToggleDarkMode}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {token ? (
            <NotificationBell
              validationNotifications={validationNotifications}
              roleNotifications={roleNotifications}
              onOpen={handleBellOpen}
            />
          ) : null}

          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left transition hover:bg-muted">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-secondary-foreground">
                    {initials}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium leading-none">{user?.sub ?? "Utilizator"}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p>{user?.sub ?? "Utilizator"}</p>
                  <p className="font-normal text-xs text-muted-foreground mt-1">{user?.company_name ?? "Companie"}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/registry")}>Registry</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin")}>Administrare</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  );
}