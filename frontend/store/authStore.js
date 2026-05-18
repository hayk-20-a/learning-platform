import { create } from "zustand";
import { persist } from "zustand/middleware";

// zustand/middleware persist automatically saves state to localStorage
// so the user stays logged in after a page refresh
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updatedUser) =>
        set((state) => ({ user: { ...state.user, ...updatedUser } })),
    }),
    {
      name: "auth-storage", // localStorage key
    },
  ),
);
