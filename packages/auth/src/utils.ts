/**
 * Auth utilities and helpers
 * All auth-related logic centralized in the auth package
 */

import type { ExtendedAuthClient, BetterAuthUser, BetterAuthSession } from "./types";
import { authClient as betterAuthClient } from "./client";

/**
 * Type-safe auth client with all Better Auth methods
 * Use this instead of importing authClient directly
 */
export const authClient = betterAuthClient as unknown as ExtendedAuthClient;

/**
 * Better Auth session type
 * Represents the full session object returned by Better Auth
 */
export interface Session {
  user: BetterAuthUser;
  session: BetterAuthSession;
}

/**
 * Auth utilities for common operations
 */
export const auth = {
  /**
   * Get the current auth client
   */
  getClient: () => authClient,

  /**
   * Sign in with email and password
   */
  signInWithEmail: async (email: string, password: string) => {
    return authClient.signIn.email({ email, password });
  },

  /**
   * Sign up with email, password, and name
   */
  signUpWithEmail: async (email: string, password: string, name: string) => {
    return authClient.signUp.email({ email, password, name });
  },

  /**
   * Sign out
   */
  signOut: async () => {
    return authClient.signOut();
  },

  /**
   * Send password reset email
   */
  forgetPassword: async (email: string, redirectTo?: string) => {
    return authClient.forgetPassword({ email, redirectTo });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string) => {
    return authClient.resetPassword({ token, newPassword });
  },

  /**
   * Send verification email
   */
  sendVerificationEmail: async (email: string) => {
    return authClient.sendVerificationEmail({ email });
  },
};

/**
 * Type guard to check if session exists and has user
 */
export function isAuthenticated(session: Session | null | undefined): session is Session {
  return !!session && !!session.user;
}

/**
 * Extract user from session safely
 */
export function getUser(session: Session | null | undefined): BetterAuthUser | null {
  return session?.user ?? null;
}

// Re-export types for convenience
export type { BetterAuthUser, BetterAuthSession, ExtendedAuthClient };
