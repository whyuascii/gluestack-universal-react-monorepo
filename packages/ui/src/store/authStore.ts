import type { TAuthenticationResponse } from "@app/service-contracts";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AuthStatus = "anonymous" | "authenticated" | "loading";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
}

export interface Session {
  token: string;
  expiresAt: Date;
}

interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;

  // Actions
  setAuth: (response: TAuthenticationResponse) => void;
  setLoading: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// Storage adapter that works on both web and React Native
const getStorage = () => {
  // Check if we're in a browser environment
  if (typeof globalThis !== "undefined" && (globalThis as any).window?.localStorage) {
    return createJSONStorage(() => localStorage);
  }

  // For React Native, we'd use AsyncStorage (handled by the app)
  // This is a fallback that doesn't persist
  return createJSONStorage(() => ({
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: "anonymous",
      user: null,
      session: null,

      setAuth: (response: TAuthenticationResponse) => {
        set({
          status: "authenticated",
          user: {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            emailVerified: response.user.emailVerified,
            image: response.user.image,
          },
          session: {
            token: response.session.token,
            expiresAt: new Date(response.session.expiresAt),
          },
        });
      },

      setLoading: () => {
        set({ status: "loading" });
      },

      logout: () => {
        set({
          status: "anonymous",
          user: null,
          session: null,
        });
      },

      isAuthenticated: () => {
        const state = get();
        return state.status === "authenticated" && state.user !== null;
      },
    }),
    {
      name: "auth-storage",
      storage: getStorage(),
      // Only persist user and session, not status (always start as loading/anonymous)
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
      // Rehydrate and set status based on whether we have user data
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (state.user && state.session) {
          state.status = "authenticated";
        } else {
          state.status = "anonymous";
        }
      },
    }
  )
);
