import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import type { UserClaims } from "@/types/registry";
import { isTokenValid } from "@/lib/auth";

interface AuthState {
  token: string;
  user: UserClaims | null;
  profile: import("@/types/registry").UserProfile | null;
  setToken: (token: string) => void;
  setProfile: (profile: import("@/types/registry").UserProfile | null) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  logout: () => void;
}

function decodeToken(token: string | null): UserClaims | null {
  if (!token) return null;
  try {
    return jwtDecode<UserClaims>(token);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem("token") ?? "";
  const validToken = isTokenValid(savedToken) ? savedToken : "";
  const savedTheme = (localStorage.getItem("theme") as "light" | "dark" | null) ?? null;

  if (savedToken && !validToken) {
    // stale/expired token found on load — clean it up
    localStorage.removeItem("token");
  }

  return {
    token: validToken,
    user: decodeToken(validToken),
    profile: null,
    theme: savedTheme ?? "light",
    setToken: (token) => {
      localStorage.setItem("token", token);
      set({ token, user: decodeToken(token) });
    },
    setProfile: (profile) => set({ profile }),
    setTheme: (theme) => {
      localStorage.setItem("theme", theme);
      set({ theme });
    },
    logout: () => {
      localStorage.removeItem("token");
      set({ token: "", user: null, profile: null });
    },
  };
});