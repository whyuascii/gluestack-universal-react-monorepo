/**
 * Auth Package
 *
 * Shared authentication using Better Auth with:
 * - Email/password authentication
 * - OAuth providers (Google, GitHub)
 * - Cross-platform client support (Next.js + Expo)
 *
 * ## Usage
 *
 * ### In API app (apps/api):
 * ```ts
 * import { createAuthConfig } from "auth";
 * const auth = createAuthConfig();
 * // Mount auth routes in Fastify
 * ```
 *
 * ### In Web app (apps/web):
 * ```tsx
 * import { useSession, signIn, signOut } from "auth/client/react";
 * ```
 *
 * ### In Mobile app (apps/mobile):
 * ```tsx
 * import { useSession, signIn, signOut } from "auth/client/native";
 * ```
 *
 * ### In UI package (packages/ui):
 * Import client hooks to create shared auth screens/components
 */

// Export auth configuration (for API app)
export { createAuthConfig } from "./config";
export type { AuthConfig } from "./config";

// Export types
export type { User, Session, Account } from "better-auth/types";

// Note: Client hooks should be imported from "auth/client/react" or "auth/client/native"
// They are not exported from the main index to avoid bundling issues
//
// Note: Auth schemas are in the database package at "database/schema/auth"
