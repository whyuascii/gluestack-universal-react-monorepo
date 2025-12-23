/**
 * Auth client exports
 *
 * Platform-specific imports:
 * - Web: import from '@app/auth/client/react'
 * - Mobile: import from '@app/auth/client/native'
 *
 * This default export provides web (React) client for backwards compatibility
 */

// Shared types
export type { User, Session } from "better-auth/types";

// Default to React client (web)
// For mobile, import from '@app/auth/client/native' instead
export { authClient, useSession, signIn, signOut, signUp } from "./react";
