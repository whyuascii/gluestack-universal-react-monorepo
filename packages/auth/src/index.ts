/**
 * Auth Package
 *
 * Centralized authentication using Better Auth with:
 * - Email/password authentication
 * - Email verification and password reset
 * - Cross-platform client support (Next.js + Expo)
 * - Type-safe utilities and hooks
 *
 * ## Usage
 *
 * ### In API app (apps/api) - SERVER ONLY:
 * ```ts
 * import { createAuthConfig } from '@app/auth/server';
 * const auth = createAuthConfig();
 * // Mount auth routes in Fastify
 * ```
 *
 * ### In client components (web/mobile):
 * ```tsx
 * import { authClient, useSession } from '@app/auth';
 * // or platform-specific:
 * // import { authClient } from '@app/auth/client/react';
 * // import { authClient } from '@app/auth/client/native';
 *
 * const { data: session } = useSession();
 * await authClient.signOut();
 * ```
 *
 * ## Adding OAuth Providers
 * To add social login (Google, GitHub, etc.), update config.ts with socialProviders.
 */

// Export auth utilities and helpers (client-safe)
export { auth, authClient, isAuthenticated, getUser } from "./utils";
export type { Session } from "./utils";

// Export hooks
export { useSession, useLogout, useInactivityLogout } from "./hooks";
export type { UseLogoutOptions, UseInactivityLogoutOptions } from "./hooks";

// Export auth error classes (for API error handling)
export {
  AuthError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from "./errors";
export type { AuthErrorResponse } from "./errors";

// Export Better Auth types (moved from service-contracts)
export type {
  BetterAuthUser,
  BetterAuthSession,
  BetterAuthRequest,
  SendResetPasswordParams,
  SendVerificationEmailParams,
  ExtendedAuthClient,
  SignInCredentials,
  SignUpCredentials,
} from "./types";

// Re-export Better Auth types from library
export type { Account, User } from "better-auth/types";

// Note: Auth schemas are in the database package at "database/schema/auth"
