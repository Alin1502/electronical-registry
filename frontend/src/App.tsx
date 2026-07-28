import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegistryPage from "@/pages/RegistryPage";
import RecordsPage from "@/pages/RecordsPage";
import ReportsPage from "@/pages/ReportsPage";
import UsersPage from "@/pages/UsersPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminPage from "@/pages/AdminPage";
import { useAuthStore } from "@/store/authStore";
import { isTokenValid } from "@/lib/auth";
import AcceptInvitePage from "@/pages/AcceptInvitePage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuthStore();
  if (!isTokenValid(token)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { token, user } = useAuthStore();
  if (!isTokenValid(token)) return <Navigate to="/login" replace />;
  
  if (!user?.is_owner && user?.permission_level !== "full_access") {
    //Secure unauthorized users from accessing admin routes
    return <Navigate to="/records" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
        
        {/*Legacy dashboard now redirects to /records to be safe for all users */}
        <Route path="/dashboard" element={<Navigate to="/records" replace />} />
        
        <Route
          path="/registry"
          element={
            //Secure the registry page with AdminRoute
            <AdminRoute>
              <RegistryPage />
            </AdminRoute>
          }
        />
        
        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <RecordsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/records/:register"
          element={
            <ProtectedRoute>
              <RecordsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/users"
          element={
            //Secure the users page with AdminRoute
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}