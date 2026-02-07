/**
 * Admin Contracts
 *
 * Admin-only endpoints for platform management.
 * Requires auth + admin role middleware.
 */

// Metrics
import {
  metricsContract,
  MetricsOverviewSchema,
  FeatureUsageSchema,
  EngagementMetricsSchema,
  RevenueMetricsSchema,
  RetentionWeekSchema,
  CohortDataSchema,
  type MetricsOverview,
  type FeatureUsage,
  type EngagementMetrics,
  type RevenueMetrics,
  type RetentionWeek,
  type CohortData,
  type MetricsContract,
} from "./metrics";

// Identity
import {
  identityContract,
  AdminUserSchema,
  AdminRoleSchema,
  AdminMeSchema,
  type AdminUserResponse,
  type AdminRoleResponse,
  type AdminMeResponse,
  type IdentityContract,
} from "./identity";

// Tenants
import {
  tenantsContract,
  AdminTenantSchema,
  AdminTenantMemberSchema,
  AdminTenantNoteSchema,
  AdminTenantActivitySchema,
  AdminTenantDetailSchema,
  type AdminTenantResponse,
  type AdminTenantDetail,
  type TenantsContract,
} from "./tenants";

// Users
import {
  usersContract,
  AdminCustomerUserSchema,
  AdminUserNoteSchema,
  AdminUserActivitySummarySchema,
  AdminUserActivityEventSchema,
  AdminUserDetailSchema,
  type AdminCustomerUser,
  type AdminUserDetail,
  type UsersContract,
} from "./users";

// Flags
import {
  flagsContract,
  AdminFlagSchema,
  type AdminFlagResponse,
  type FlagsContract,
} from "./flags";

// Impersonation
import {
  impersonationContract,
  ImpersonationSessionSchema,
  type ImpersonationSession,
  type ImpersonationContract,
} from "./impersonation";

// Debug
import {
  debugContract,
  WebhookEventSchema,
  WebhookEventDetailSchema,
  ServiceStatusSchema,
  QueueStatusSchema,
  SystemStatusSchema,
  type WebhookEvent,
  type WebhookEventDetail,
  type SystemStatus,
  type DebugContract,
} from "./debug";

// Audit
import {
  auditContract,
  AuditLogEntrySchema,
  type AuditLogEntry,
  type AuditContract,
} from "./audit";

// =============================================================================
// Re-exports
// =============================================================================

// Metrics
export {
  metricsContract,
  MetricsOverviewSchema,
  FeatureUsageSchema,
  EngagementMetricsSchema,
  RevenueMetricsSchema,
  RetentionWeekSchema,
  CohortDataSchema,
  type MetricsOverview,
  type FeatureUsage,
  type EngagementMetrics,
  type RevenueMetrics,
  type RetentionWeek,
  type CohortData,
  type MetricsContract,
};

// Identity
export {
  identityContract,
  AdminUserSchema,
  AdminRoleSchema,
  AdminMeSchema,
  type AdminUserResponse,
  type AdminRoleResponse,
  type AdminMeResponse,
  type IdentityContract,
};

// Tenants
export {
  tenantsContract,
  AdminTenantSchema,
  AdminTenantMemberSchema,
  AdminTenantNoteSchema,
  AdminTenantActivitySchema,
  AdminTenantDetailSchema,
  type AdminTenantResponse,
  type AdminTenantDetail,
  type TenantsContract,
};

// Users
export {
  usersContract,
  AdminCustomerUserSchema,
  AdminUserNoteSchema,
  AdminUserActivitySummarySchema,
  AdminUserActivityEventSchema,
  AdminUserDetailSchema,
  type AdminCustomerUser,
  type AdminUserDetail,
  type UsersContract,
};

// Flags
export { flagsContract, AdminFlagSchema, type AdminFlagResponse, type FlagsContract };

// Impersonation
export {
  impersonationContract,
  ImpersonationSessionSchema,
  type ImpersonationSession,
  type ImpersonationContract,
};

// Debug
export {
  debugContract,
  WebhookEventSchema,
  WebhookEventDetailSchema,
  ServiceStatusSchema,
  QueueStatusSchema,
  SystemStatusSchema,
  type WebhookEvent,
  type WebhookEventDetail,
  type SystemStatus,
  type DebugContract,
};

// Audit
export { auditContract, AuditLogEntrySchema, type AuditLogEntry, type AuditContract };

// =============================================================================
// Combined Admin Contract
// =============================================================================

export const adminContract = {
  // No auth contract - using Better Auth
  metrics: metricsContract,
  identity: identityContract,
  tenants: tenantsContract,
  users: usersContract,
  flags: flagsContract,
  impersonation: impersonationContract,
  debug: debugContract,
  audit: auditContract,
};

export type AdminContract = typeof adminContract;
