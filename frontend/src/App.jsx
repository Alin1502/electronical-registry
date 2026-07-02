import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import Footer from "./components/Footer";
import { useAuthStore } from "./store/authStore";

import './App.css';
export default function App() {
  const { token } = useAuthStore();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={token ? <AdminPage /> : <Navigate to="/login" />} />
        <Route />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}