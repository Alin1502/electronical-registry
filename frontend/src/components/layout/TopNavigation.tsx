import { Bell, Moon, Search, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getPendingNotifications, getNotifications, markAllNotificationsRead } from "@/api/client";
import { NotificationBell, type PendingNotification, type RoleNotification } from "./NotificationBell";

const publicLinks = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/#services" },
  { label: "Contact", to: "/contact" },
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
      setScrolled(scrollTop > 24);
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
        height: scrolled ? "72px" : "108px",
        backgroundColor: scrolled ? "hsl(var(--background) / 0.12)" : "hsl(var(--background) / 0.18)",
        backdropFilter: scrolled ? "blur(24px) saturate(1.4)" : "blur(20px) saturate(1.22)",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.4)" : "blur(20px) saturate(1.22)",
        borderBottom: scrolled ? "1px solid hsl(var(--border) / 0.18)" : "1px solid hsl(var(--border) / 0.12)",
        boxShadow: scrolled ? "0 12px 34px -26px hsl(var(--foreground) / 0.22)" : "0 10px 28px -26px hsl(var(--foreground) / 0.14)",
      }}
    >
      <div className="flex h-full w-full items-center px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center gap-5 shrink-0">
          <Link to="/" className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center shrink-0 md:h-11 md:w-11">
              <img src="/REGIX_LOGO.png" alt="Regix Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-base font-semibold leading-tight md:text-lg">Regix</p>
              <p className="text-sm text-muted-foreground md:text-[0.95rem]">Electronic Registry</p>
            </div>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-6 lg:gap-8 xl:gap-10">
          {!token && (
            <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
              {publicLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {token && (
            <div className="relative hidden min-w-[240px] lg:min-w-[280px] md:flex">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="rounded-md bg-muted/50 pl-10 border-transparent focus:border-border focus:bg-background transition-colors" placeholder="Search records, files, users..." />
            </div>
          )}

          <div className="flex items-center gap-2">
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
              <Button asChild variant="ghost" className="rounded-md text-sm font-medium">
                <Link to="/login">Sign in</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}