import { Bell, Menu, Moon, Search, Sun, UserCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore.ts";
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

interface TopNavigationProps {
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function TopNavigation({ onToggleSidebar, darkMode, onToggleDarkMode }: TopNavigationProps) {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();

  const initials = useMemo(() => {
    const text = user?.company_name ?? user?.sub ?? "RG";
    return text
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-20 items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>

        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-sm font-semibold text-white shadow-soft">
            RG
          </div>
          <div>
            <p className="text-sm font-semibold">Premium Registratura</p>
            <p className="text-xs text-muted-foreground">Electronic Registry Workspace</p>
          </div>
        </Link>

        <div className="relative ml-auto hidden min-w-[260px] flex-1 md:flex md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search records, files, users..." />
        </div>

        <Button variant="ghost" size="icon" className="rounded-xl" onClick={onToggleDarkMode}>
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="rounded-xl">
          <Bell className="h-5 w-5" />
        </Button>

        {token ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2 text-left transition hover:shadow-soft">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-accent-foreground">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-none">{user?.sub ?? "Utilizator"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{user?.company_name ?? "Companie"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>
                <UserCircle2 className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>Dashboard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin")}>Administrare</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => navigate("/login")}>Sign in</Button>
        )}
      </div>
    </header>
  );
}
