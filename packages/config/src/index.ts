/**
 * Config Package
 *
 * RBAC (Role-Based Access Control) and Subscription configuration.
 *
 * For API contracts (oRPC routes), see @app/core-contract.
 * For auth types and error handling, see @app/auth.
 *
 * Contents:
 * - rbac/: Roles, permissions, subscription tiers
 * - subscription/: Entitlement guards and tier constants
 *
 * RBAC provides:
 * - Tenant roles (owner/admin/member) - management level
 * - Member roles (editor/viewer/contributor/moderator) - functional level
 * - Permission checking functions (canAccess, hasPermission, etc.)
 * - Subscription tier features
 *
 * Subscription provides:
 * - Entitlement guard functions (requireEntitlement, requireFeature)
 * - Tier constants (FREE_TIER_ENTITLEMENTS, PRO_TIER_ENTITLEMENTS)
 * - Helper functions (isProOrHigher, getDaysUntilExpiry, etc.)
 */

// RBAC (Role-Based Access Control)
export * from "./rbac";

// Subscription guards and constants
export * from "./subscription";
