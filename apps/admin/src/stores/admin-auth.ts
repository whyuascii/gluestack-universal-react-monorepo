import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authClient } from "@app/auth";
import { API_URL } from "@/lib/api";

type AdminRole = "read_only" | "support_rw" | "super_admin";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  adminRole: AdminRole;
}

interface AdminAuthState {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;

  // Actions
  setAdminUser: (user: AdminUser) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  read_only: 1,
  support_rw: 2,
  super_admin: 3,
};

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      adminUser: null,
      isAuthenticated: false,

      setAdminUser: (user) => {
        set({
          adminUser: user,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        try {
          await authClient.signOut();
        } catch {
          // Ignore logout errors
        }

        set({
          adminUser: null,
          isAuthenticated: false,
        });

        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },

      checkAuth: async () => {
        try {
          // Check Better Auth session
          const session = await authClient.getSession();
          if (!session?.data?.user) {
            get().logout();
            return false;
          }

          // Check admin role via API
          const response = await fetch(`${API_URL}/rpc/admin/identity/me`, {
            credentials: "include",
          });

          if (!response.ok) {
            get().logout();
            return false;
          }

          const user = await response.json();
          set({
            adminUser: user,
            isAuthenticated: true,
          });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        adminUser: state.adminUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper to check role access
export function hasMinimumRole(userRole: AdminRole | null, minimumRole: AdminRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}
