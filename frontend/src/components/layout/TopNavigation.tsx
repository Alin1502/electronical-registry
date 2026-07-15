import { Bell, Menu, Moon, Search, Sun, UserCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
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
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-blue-500 text-sm font-semibold text-white shadow-soft">
            <img src="/REGIX_LOGO.png" alt="Regix Logo" />
          </div>
          <div>
            <p className="text-sm font-semibold">Regix</p>
            <p className="text-xs text-muted-foreground">Electronic Registry Workspace</p>
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
            <Input className="rounded-md pl-10" placeholder="Search records, files, users..." />
          </div>
        ) : (
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Button asChild variant="ghost" className="rounded-md text-sm font-medium">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        )}

        <Button variant="ghost" size="icon" className="rounded-md" onClick={onToggleDarkMode}>
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* notification */}
        {token ? (
          <Button variant="ghost" size="icon" className="rounded-md"> 
            <Bell className="h-5 w-5" />
          </Button>
        ) : null}

        {token ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-left transition hover:shadow-soft">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground">
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
        ) : null}
      </div>
    </header>
  );
}
