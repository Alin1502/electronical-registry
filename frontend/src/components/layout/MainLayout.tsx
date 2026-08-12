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
  const theme = useAuthStore((s) => s.theme);
  const setTheme = useAuthStore((s) => s.setTheme);
  const darkMode = theme === "dark";
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = isTokenValid(token);
  const isHomePage = location.pathname === "/";
  
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-background overflow-hidden">
      {isAuthenticated && (
        <AppSidebar collapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNavigation
          darkMode={darkMode}
          onToggleDarkMode={() => setTheme(darkMode ? "light" : "dark")}
          isHomePage={isHomePage}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main id="app-scroll-container" className="flex-1 overflow-y-auto px-6 pb-6 pt-0 md:px-8 md:pb-8">
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