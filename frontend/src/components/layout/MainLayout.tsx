import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { useAuthStore } from "@/store/authStore";
import { isTokenValid } from "@/lib/auth"; // see below

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = isTokenValid(token);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen">
      <TopNavigation
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      <div
        className={
          isAuthenticated
            ? "container grid grid-cols-1 gap-6 py-6 md:grid-cols-[auto_1fr]"
            : "container py-6"
        }
      >
        {isAuthenticated && <AppSidebar collapsed={sidebarCollapsed} />}

        <main className="min-w-0">
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
        </main>
      </div>
    </div>
  );
}