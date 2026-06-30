import { create } from "zustand";
import { jwtDecode } from "jwt-decode"

const decodeToken = (token) => {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || "",
  user: decodeToken(localStorage.getItem("token")),
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: "" });
  }
}));