/**
 * Auth Hooks
 *
 * Re-exports from @app/auth plus UI-specific auth hooks.
 */

// Re-export core auth hooks from @app/auth
export { useSession, useLogout, useInactivityLogout } from "@app/auth";
export type { UseLogoutOptions, UseInactivityLogoutOptions } from "@app/auth";

// UI-specific auth hooks (depend on UI query hooks)
export { usePostLoginRouter, type PostLoginRoute } from "./usePostLoginRouter";
