/**
 * Auth Store
 *
 * Manages authentication state using Zustand.
 * Syncs with Better Auth's session.
 */

import type { Session, BetterAuthUser, BetterAuthSession } from "@app/auth";
import { create } from "zustand";

export interface AuthState {
  /** The full session wrapper (contains both user and session) */
  sessionData: Session | null;
  /** The Better Auth session object */
  session: BetterAuthSession | null;
  /** The authenticated user */
  user: BetterAuthUser | null;
  /** Whether session is being loaded */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

export interface AuthActions {
  /** Update auth state from Better Auth session */
  setSession: (sessionData: Session | null, isLoading: boolean) => void;
  /** Clear auth state on logout */
  clearSession: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  sessionData: null,
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  // Actions
  setSession: (sessionData, isLoading) =>
    set({
      sessionData,
      session: sessionData?.session ?? null,
      user: sessionData?.user ?? null,
      isLoading,
      isAuthenticated: !!sessionData?.session && !!sessionData?.user,
    }),

  clearSession: () =>
    set({
      sessionData: null,
      session: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,
    }),
}));

/**
 * Selector hooks for common auth state
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

export const useUser = () => useAuthStore((state) => state.user);

export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
