import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import type { UserClaims } from "@/types/registry";
import { isTokenValid } from "@/lib/auth";

interface AuthState {
  token: string;
  user: UserClaims | null;
  setToken: (token: string) => void;
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

  if (savedToken && !validToken) {
    // stale/expired token found on load — clean it up
    localStorage.removeItem("token");
  }

  return {
    token: validToken,
    user: decodeToken(validToken),
    setToken: (token) => {
      localStorage.setItem("token", token);
      set({ token, user: decodeToken(token) });
    },
    logout: () => {
      localStorage.removeItem("token");
      set({ token: "", user: null });
    },
  };
});