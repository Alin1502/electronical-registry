import { 
  Bell, 
  ChevronDown, 
  Moon, 
  Search, 
  Sun, 
  FileText, 
  Archive, 
  Shield, 
  FileSearch, 
  Briefcase, 
  Wrench 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getPendingNotifications, getNotifications, markAllNotificationsRead } from "@/api/client";
import { NotificationBell, type PendingNotification, type RoleNotification } from "./NotificationBell";

// Define a type for the navigation links to handle optional dropdowns
type NavLink = {
  label: string;
  to: string;
  dropdown?: { label: string; to: string; description: string; icon: any }[];
};

const publicLinks: NavLink[] = [
  { label: "ACASĂ", to: "/" },
  { 
    label: "SERVICII", 
    to: "/#services",
    dropdown: [
      { 
        label: "Management Documente", 
        to: "/servicii/management", 
        description: "Organizare și flux de lucru digital pentru toate documentele.", 
        icon: FileText 
      },
      { 
        label: "Arhivare Digitală", 
        to: "/servicii/arhivare", 
        description: "Stocare sigură pe termen lung a registrelor tale.", 
        icon: Archive 
      },
      { 
        label: "Securitate & Criptare", 
        to: "/servicii/securitate", 
        description: "Protejează datele sensibile cu acces dedicat pe roluri.", 
        icon: Shield 
      },
      { 
        label: "Audit & Raportare", 
        to: "/servicii/audit", 
        description: "Exportă și urmărește istoricul complet de modificări.", 
        icon: FileSearch 
      },
      { 
        label: "Consultanță Implementare", 
        to: "/servicii/consultanta", 
        description: "Asistență pentru integrarea Regix în instituția ta.", 
        icon: Briefcase 
      },
      { 
        label: "Suport & Mentenanță", 
        to: "/servicii/suport", 
        description: "Asistență tehnică rapidă și actualizări continue.", 
        icon: Wrench 
      },
    ]
  },
  { label: "DESPRE NOI", to: "/despre-noi" },
  { label: "CONTACT", to: "/contact" },
  { label: "FAQ", to: "/#faq" },
];

interface TopNavigationProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isHomePage: boolean;
  sidebarCollapsed: boolean;
}

export function TopNavigation({
  darkMode,
  onToggleDarkMode,
  isHomePage,
  sidebarCollapsed,
}: TopNavigationProps) {
  const { user, token, logout } = useAuthStore();

  const [validationNotifications, setValidationNotifications] = useState<PendingNotification[]>([]);
  const [roleNotifications, setRoleNotifications] = useState<RoleNotification[]>([]);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = user?.permission_level === "full_access" || user?.is_owner;

  useEffect(() => {
    const scrollContainer = document.getElementById("app-scroll-container");

    function handleScroll() {
      const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
      const availableScroll = scrollContainer
        ? scrollContainer.scrollHeight - scrollContainer.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(scrollTop > 24 && availableScroll > 60);
    }

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

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

    fetchAll();
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

  const isFloatingHeader = isHomePage || !token;
  const shouldOffsetForSidebar = isHomePage && token;
  const headerHeight = isFloatingHeader && scrolled ? "72px" : "108px";
  const visibleHeaderHeight = scrolled ? "72px" : "108px";
  const headerClasses = isFloatingHeader
    ? shouldOffsetForSidebar
      ? sidebarCollapsed
        ? "fixed top-0 left-0 right-0 z-50 md:left-16"
        : "fixed top-0 left-0 right-0 z-50 md:left-64"
      : "fixed inset-x-0 top-0 z-50"
    : "relative z-30";

  return (
    <header
      className={`${headerClasses} transition-[height,box-shadow,backdrop-filter,background-color] duration-300`}
      style={{
        height: isFloatingHeader ? headerHeight : "108px",
      }}
    >
      <div
        className="flex w-full items-center justify-between px-6 sm:px-8 lg:px-12 xl:px-16 transition-[height,box-shadow,backdrop-filter,background-color] duration-300"
        style={{
          height: isFloatingHeader ? "100%" : visibleHeaderHeight,
          backgroundColor: scrolled ? "hsl(var(--background) / 0.12)" : "hsl(var(--background) / 0.18)",
          backdropFilter: scrolled ? "blur(24px) saturate(1.4)" : "blur(20px) saturate(1.22)",
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.4)" : "blur(20px) saturate(1.22)",
          borderBottom: scrolled ? "1px solid hsl(var(--border) / 0.18)" : "1px solid hsl(var(--border) / 0.12)",
          boxShadow: scrolled ? "0 12px 34px -26px hsl(var(--foreground) / 0.22)" : "0 10px 28px -26px hsl(var(--foreground) / 0.14)",
        }}
      >
        
        {/* Left: Logo */}
        <div className="flex items-center gap-5 shrink-0 lg:w-[250px]">
          <Link to="/" className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center shrink-0 md:h-11 md:w-11">
              <img src="/REGIX_LOGO.png" alt="Regix Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-base font-semibold leading-tight md:text-lg">Regix</p>
              <p className="text-sm text-muted-foreground md:text-[0.95rem]">Registratură Electronică</p>
            </div>
          </Link>
        </div>

        {/* Center: Navigation */}
        {!token && (
          <nav className="hidden flex-1 items-center justify-center gap-8 lg:gap-12 xl:gap-16 md:flex h-full">
            {publicLinks.map((item) =>
              item.dropdown ? (
                <div key={item.label} className="relative group flex items-center h-full">
                  <Link
                    to={item.to}
                    className="flex items-center gap-1 text-[13px] font-black uppercase tracking-widest text-foreground/80 transition-colors group-hover:text-primary"
                  >
                    {item.label}
                    <ChevronDown className="h-4 w-4 opacity-70 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                  
                  {/* Mega Menu Dropdown */}
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-0 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                    {/* Big Square Grid Container */}
                    <div className="w-[850px] bg-background shadow-2xl border border-border grid grid-cols-3">
                      {item.dropdown.map((subItem) => {
                        const Icon = subItem.icon;
                        return (
                          <Link
                            key={subItem.label}
                            to={subItem.to}
                            className="group/sub flex flex-col items-start p-8 border-r border-b border-border hover:bg-primary transition-colors duration-200"
                          >
                            <div className="mb-5 flex h-12 w-12 items-center justify-center bg-primary/10 transition-colors duration-200 group-hover/sub:bg-primary-foreground/20">
                              <Icon className="h-6 w-6 text-primary group-hover/sub:text-primary-foreground transition-colors duration-200" />
                            </div>
                            <h3 className="font-bold text-[13px] uppercase tracking-wide text-foreground group-hover/sub:text-primary-foreground transition-colors duration-200 mb-2">
                              {subItem.label}
                            </h3>
                            <p className="text-sm text-muted-foreground group-hover/sub:text-primary-foreground/90 transition-colors duration-200 leading-relaxed">
                              {subItem.description}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-[13px] font-black uppercase tracking-widest text-foreground/80 transition-colors hover:text-primary flex items-center h-full"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        )}

        {token && (
          <div className="relative hidden min-w-[240px] lg:min-w-[280px] md:flex mx-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="rounded-md bg-muted/50 pl-10 border-transparent focus:border-border focus:bg-background transition-colors" placeholder="Caută" />
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-3 shrink-0 lg:w-[250px]">
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

          {!token ? (
            <Button asChild className="rounded-md text-[13px] font-bold uppercase tracking-wide px-6">
              <Link to="/login">Autentificare</Link>
            </Button>
          ) : null}
        </div>

      </div>
    </header>
  );
}