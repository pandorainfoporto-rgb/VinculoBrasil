import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// AUTH STORE - Gerenciamento de Autenticação
// ============================================================

export type UserRole =
  | "superuser"
  | "agency"
  | "landlord"
  | "tenant"
  | "investor"
  | "guarantor"
  | "insurer"
  | "public";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  agencyId?: string;
  walletAddress?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setToken: (token) => set({ token }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // TODO: Implementar chamada real à API
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Mock user para desenvolvimento
          const mockUser: User = {
            id: "1",
            name: "Admin",
            email,
            role: "superuser",
            createdAt: new Date().toISOString(),
          };

          set({
            user: mockUser,
            token: "mock-token",
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // TODO: Verificar token com API
          await new Promise((resolve) => setTimeout(resolve, 100));
          set({ isLoading: false });
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },
    }),
    {
      name: "vinculo-auth",
    }
  )
);

// Helper para verificar permissões
export function useHasRole(allowedRoles: UserRole[]): boolean {
  const { user } = useAuthStore();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
