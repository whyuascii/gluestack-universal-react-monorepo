/**
 * Private Contracts
 *
 * All authenticated endpoints organized by domain.
 * Requires auth middleware.
 */
import {
  userContract,
  meContract,
  settingsContract,
  analyticsContract,
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
} from "./user";

import {
  workspaceContract,
  tenantsContract,
  invitesContract,
  TenantSchema,
  InviteSkipReasonSchema,
  InviteDetailsSchema,
  type WorkspaceContract,
} from "./workspace";

import {
  featuresContract,
  todosContract,
  dashboardContract,
  TodoSchema,
  DashboardStatsSchema,
  IntegrationStatusSchema,
  TestResultSchema,
  type TodoResponse,
  type FeaturesContract,
} from "./features";

import {
  notificationsContract,
  NotificationSchema,
  type NotificationResponse,
  type NotificationsContract,
} from "./notifications";

import {
  billingContract,
  SubscriptionTierSchema,
  SubscriptionStatusSchema,
  SubscriptionProviderSchema,
  SubscriptionFeaturesSchema,
  ActiveSubscriptionSchema,
  TenantEntitlementsSchema,
  type SubscriptionTier,
  type SubscriptionStatusType,
  type SubscriptionProviderType,
  type SubscriptionFeatures,
  type TenantEntitlements,
  type BillingContract,
} from "./billing";

// Re-export all
export {
  // User domain
  userContract,
  meContract,
  settingsContract,
  analyticsContract,
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
  // Workspace domain
  workspaceContract,
  tenantsContract,
  invitesContract,
  TenantSchema,
  InviteSkipReasonSchema,
  InviteDetailsSchema,
  type WorkspaceContract,
  // Features domain
  featuresContract,
  todosContract,
  dashboardContract,
  TodoSchema,
  DashboardStatsSchema,
  IntegrationStatusSchema,
  TestResultSchema,
  type TodoResponse,
  type FeaturesContract,
  // Notifications
  notificationsContract,
  NotificationSchema,
  type NotificationResponse,
  type NotificationsContract,
  // Billing
  billingContract,
  SubscriptionTierSchema,
  SubscriptionStatusSchema,
  SubscriptionProviderSchema,
  SubscriptionFeaturesSchema,
  ActiveSubscriptionSchema,
  TenantEntitlementsSchema,
  type SubscriptionTier,
  type SubscriptionStatusType,
  type SubscriptionProviderType,
  type SubscriptionFeatures,
  type TenantEntitlements,
  type BillingContract,
};

// =============================================================================
// Combined Private Contract
// =============================================================================

export const privateContract = {
  user: userContract,
  workspace: workspaceContract,
  features: featuresContract,
  notifications: notificationsContract,
  billing: billingContract,
};

export type PrivateContract = typeof privateContract;
