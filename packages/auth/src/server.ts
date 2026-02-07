/**
 * Server-only Auth exports
 *
 * These exports include database and Node.js dependencies
 * and should ONLY be used in server-side code (API routes, server components)
 *
 * Security features enabled:
 * - Session management with refresh token rotation behavior
 * - JWT tokens for stateless API authentication
 * - Bearer tokens for mobile/CLI authentication
 * - Rate limiting on auth endpoints
 * - Secure cookie configuration
 */

export { createAuthConfig, SESSION_CONFIG, JWT_CONFIG, RATE_LIMIT_CONFIG } from "./config";
export type { AuthConfig } from "./config";
