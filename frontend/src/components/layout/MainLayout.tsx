import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { useAuthStore } from "@/store/authStore";
import { isTokenValid } from "@/lib/auth"; 

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = isTokenValid(token);
  const isRegistryPage = location.pathname === "/registry" || location.pathname.startsWith("/registry/");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    // Replaced "container grid" with a full-screen flex layout. Added a muted background.
    <div className="flex h-screen w-full bg-slate-50 dark:bg-background overflow-hidden">
      
      {/* Sidebar is now a direct flex child anchored to the left */}
      {isAuthenticated && <AppSidebar collapsed={sidebarCollapsed} />}

      {/* Main content wrapper */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {!isRegistryPage && (
          <TopNavigation
            onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          />
        )}

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Breadcrumbs />
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.26, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}