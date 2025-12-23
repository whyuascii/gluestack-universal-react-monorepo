/**
 * Auth Package
 *
 * Centralized authentication using Better Auth with:
 * - Email/password authentication
 * - OAuth providers (Google, GitHub)
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
 */

// Export auth utilities and helpers (client-safe)
export { auth, authClient, isAuthenticated, getUser } from "./utils";
export type { Session, BetterAuthUser, BetterAuthSession, ExtendedAuthClient } from "./utils";

// Export hooks
export { useSession } from "./hooks";

// Re-export Better Auth types
export type { Account, User } from "better-auth/types";

// Note: Auth schemas are in the database package at "database/schema/auth"
