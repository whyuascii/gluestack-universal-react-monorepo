/**
 * Contracts Index
 *
 * All oRPC contracts organized by access level:
 * - public: No auth required
 * - private: Auth required
 * - admin: Auth + admin role required
 */

// =============================================================================
// Public Contracts (no auth)
// =============================================================================
export {
  publicContract,
  healthContract,
  waitlistContract,
  adminInviteContract,
  // Renamed to avoid collision with private analytics
  analyticsContract as publicAnalyticsContract,
  // Schemas
  TrackEventSchema,
  TrackEventResponseSchema,
  AdminInviteVerifySchema,
  // Types
  type TrackEventInput,
  type TrackEventResponse,
  type AdminInviteVerifyResponse,
  type PublicContract,
} from "./public";

// =============================================================================
// Private Contracts (auth required)
// =============================================================================
export {
  privateContract,
  // User domain
  userContract,
  meContract,
  settingsContract,
  analyticsContract,
  // Workspace domain
  workspaceContract,
  tenantsContract,
  invitesContract,
  // Features domain
  featuresContract,
  todosContract,
  dashboardContract,
  // Notifications
  notificationsContract,
  // Billing
  billingContract,
  // All schemas from private
  SupportedLanguageSchema,
  UserSchema,
  SessionSchema,
  TenantMembershipSchema,
  TenantContextSchema,
  PendingInviteSchema,
  UpdateLanguagePreferenceSchema,
  NotificationPreferencesSchema,
  UpdateNotificationPreferencesSchema,
  MemberSchema,
  GetMembersResponseSchema,
  UpdateMemberRoleSchema,
  RemoveMemberSchema,
  UpdateTenantSchema,
  UpdateTenantResponseSchema,
  analyticsConsentSchema,
  UpdateConsentSchema,
  GetConsentResponseSchema,
  AliasSchema,
  TenantSchema,
  InviteSkipReasonSchema,
  InviteDetailsSchema,
  TodoSchema,
  DashboardStatsSchema,
  IntegrationStatusSchema,
  TestResultSchema,
  NotificationSchema,
  SubscriptionTierSchema,
  SubscriptionStatusSchema,
  SubscriptionProviderSchema,
  SubscriptionFeaturesSchema,
  ActiveSubscriptionSchema,
  TenantEntitlementsSchema,
  // Types from private
  type SupportedLanguage,
  type NotificationPreferencesResponse,
  type UpdateNotificationPreferencesInput,
  type UpdateLanguagePreferenceInput,
  type MemberResponse,
  type GetMembersResponse,
  type UpdateMemberRoleInput,
  type RemoveMemberInput,
  type UpdateTenantInput,
  type UpdateTenantResponse,
  type AnalyticsConsent,
  type UpdateConsentInput,
  type GetConsentResponse,
  type AliasInput,
  type UserContract,
  type WorkspaceContract,
  type TodoResponse,
  type FeaturesContract,
  type NotificationResponse,
  type NotificationsContract,
  type SubscriptionTier,
  type SubscriptionStatusType,
  type SubscriptionProviderType,
  type SubscriptionFeatures,
  type TenantEntitlements,
  type BillingContract,
  type PrivateContract,
} from "./private";

// =============================================================================
// Admin Contracts (auth + admin role)
// =============================================================================
export {
  adminContract,
  // Metrics
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
  // Identity
  identityContract,
  AdminUserSchema,
  AdminRoleSchema,
  AdminMeSchema,
  type AdminUserResponse,
  type AdminRoleResponse,
  type AdminMeResponse,
  type IdentityContract,
  // Tenants
  tenantsContract as adminTenantsContract,
  AdminTenantSchema,
  AdminTenantMemberSchema,
  AdminTenantNoteSchema,
  AdminTenantActivitySchema,
  AdminTenantDetailSchema,
  type AdminTenantResponse,
  type AdminTenantDetail,
  type TenantsContract as AdminTenantsContract,
  // Users
  usersContract as adminUsersContract,
  AdminCustomerUserSchema,
  AdminUserNoteSchema,
  AdminUserActivitySummarySchema,
  AdminUserActivityEventSchema,
  AdminUserDetailSchema,
  type AdminCustomerUser,
  type AdminUserDetail,
  type UsersContract as AdminUsersContract,
  // Flags
  flagsContract,
  AdminFlagSchema,
  type AdminFlagResponse,
  type FlagsContract,
  // Impersonation
  impersonationContract,
  ImpersonationSessionSchema,
  type ImpersonationSession,
  type ImpersonationContract,
  // Debug
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
  // Audit
  auditContract,
  AuditLogEntrySchema,
  type AuditLogEntry,
  type AuditContract,
  // Admin contract type
  type AdminContract,
} from "./admin";
