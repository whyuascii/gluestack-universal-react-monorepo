// Authentication
export {
  authMiddleware,
  optionalAuthMiddleware,
  type AuthContext,
  type OptionalAuthContext,
  type BaseContext,
} from "./auth";

// Tenant isolation
export { tenantMiddleware, validateTenantAccess, type TenantContext } from "./tenant";

// Role-based access control
export {
  createRBACMiddleware,
  requireRole,
  requireOwner,
  requireAdmin,
  type RBACContext,
} from "./rbac";

// Feature flags and subscription gating
export {
  requireFeature,
  requireTier,
  subscriptionMiddleware,
  type FeatureFlagContext,
} from "./feature-flag";

// Activity tracking
export { activityMiddleware, clearActivityCache } from "./activity";

// Admin authentication and RBAC
export {
  adminAuthMiddleware,
  requireAdminRole,
  requireReadOnly,
  requireSupportRW,
  requireSuperAdmin,
  isAdminRoleAtLeast,
  type AdminRole,
  type AdminAuthContext,
} from "./admin-auth";
