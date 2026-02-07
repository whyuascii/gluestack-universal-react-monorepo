/**
 * User Contracts
 *
 * Authenticated endpoints for user's own data and preferences.
 * - me: Current user info and tenant context
 * - settings: User preferences
 * - analytics: Consent and identity management
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Me - User Info & Tenant Context
// =============================================================================

export const SupportedLanguageSchema = z.enum(["en", "es"]);
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  preferredLanguage: SupportedLanguageSchema.optional(),
});

export const SessionSchema = z.object({
  id: z.string(),
  expiresAt: z.coerce.date(),
});

export const TenantMembershipSchema = z.object({
  tenantId: z.string(),
  tenantName: z.string(),
  role: z.enum(["owner", "admin", "member"]),
  joinedAt: z.coerce.date(),
});

export const TenantContextSchema = z.object({
  activeTenantId: z.string().nullable(),
  memberships: z.array(TenantMembershipSchema),
});

export const PendingInviteSchema = z.object({
  token: z.string(),
  tenantName: z.string(),
  inviterName: z.string(),
});

export const meContract = {
  get: oc
    .route({ method: "GET", path: "/private/user/me" })
    .input(
      z
        .object({
          invite: z.string().optional(),
        })
        .optional()
    )
    .output(
      z.object({
        user: UserSchema,
        session: SessionSchema,
        tenantContext: TenantContextSchema,
        pendingInvite: PendingInviteSchema.optional(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
    }),

  switchTenant: oc
    .route({ method: "POST", path: "/private/user/me/switch-tenant" })
    .input(
      z.object({
        tenantId: z.string(),
      })
    )
    .output(
      z.object({
        activeTenantId: z.string(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
    }),
};

// =============================================================================
// Settings - User Preferences
// =============================================================================

export const NotificationPreferencesSchema = z.object({
  id: z.string(),
  inAppEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  marketingEmailEnabled: z.boolean(),
});

export type NotificationPreferencesResponse = z.infer<typeof NotificationPreferencesSchema>;

export const UpdateNotificationPreferencesSchema = z.object({
  inAppEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  marketingEmailEnabled: z.boolean().optional(),
});

export type UpdateNotificationPreferencesInput = z.infer<
  typeof UpdateNotificationPreferencesSchema
>;

export const MemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(["owner", "admin", "member"]),
  joinedAt: z.coerce.date(),
  image: z.string().nullable(),
});

export type MemberResponse = z.infer<typeof MemberSchema>;

export const GetMembersResponseSchema = z.object({
  members: z.array(MemberSchema),
  currentUserRole: z.enum(["owner", "admin", "member"]),
});

export type GetMembersResponse = z.infer<typeof GetMembersResponseSchema>;

export const UpdateMemberRoleSchema = z.object({
  memberId: z.string(),
  role: z.enum(["admin", "member"]),
});

export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;

export const RemoveMemberSchema = z.object({
  memberId: z.string(),
});

export type RemoveMemberInput = z.infer<typeof RemoveMemberSchema>;

export const UpdateTenantSchema = z.object({
  name: z.string().min(1, "validation:name.required").max(100, "validation:name.maxLength"),
});

export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;

export const UpdateTenantResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type UpdateTenantResponse = z.infer<typeof UpdateTenantResponseSchema>;

// Language Preference
export const UpdateLanguagePreferenceSchema = z.object({
  language: SupportedLanguageSchema,
});

export type UpdateLanguagePreferenceInput = z.infer<typeof UpdateLanguagePreferenceSchema>;

export const settingsContract = {
  // Language Preference (user-scoped)
  updateLanguagePreference: oc
    .route({ method: "PUT", path: "/private/user/settings/language" })
    .input(UpdateLanguagePreferenceSchema)
    .output(z.object({ language: SupportedLanguageSchema }))
    .errors({
      UNAUTHORIZED: {},
    }),

  // Notification Preferences (user-scoped)
  getNotificationPreferences: oc
    .route({ method: "GET", path: "/private/user/settings/notifications" })
    .output(NotificationPreferencesSchema.nullable())
    .errors({
      UNAUTHORIZED: {},
    }),

  updateNotificationPreferences: oc
    .route({ method: "PUT", path: "/private/user/settings/notifications" })
    .input(UpdateNotificationPreferencesSchema)
    .output(NotificationPreferencesSchema)
    .errors({
      UNAUTHORIZED: {},
    }),

  // Member Management (tenant-scoped)
  getMembers: oc
    .route({ method: "GET", path: "/private/user/settings/members" })
    .output(GetMembersResponseSchema)
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
    }),

  updateMemberRole: oc
    .route({ method: "PUT", path: "/private/user/settings/members/{memberId}/role" })
    .input(UpdateMemberRoleSchema)
    .output(z.object({ success: z.boolean() }))
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
      NOT_FOUND: {},
      BAD_REQUEST: {},
    }),

  removeMember: oc
    .route({ method: "DELETE", path: "/private/user/settings/members/{memberId}" })
    .input(RemoveMemberSchema)
    .output(z.object({ success: z.boolean() }))
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
      NOT_FOUND: {},
      BAD_REQUEST: {},
    }),

  // Tenant Settings (tenant-scoped)
  updateTenant: oc
    .route({ method: "PUT", path: "/private/user/settings/tenant" })
    .input(UpdateTenantSchema)
    .output(UpdateTenantResponseSchema)
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
    }),

  leaveGroup: oc
    .route({ method: "POST", path: "/private/user/settings/leave-group" })
    .output(z.object({ success: z.boolean() }))
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
      BAD_REQUEST: {},
    }),
};

// =============================================================================
// Analytics - Consent & Identity
// =============================================================================

export const analyticsConsentSchema = z.enum(["disabled", "anonymous", "enabled"]);
export type AnalyticsConsent = z.infer<typeof analyticsConsentSchema>;

export const UpdateConsentSchema = z.object({
  consent: analyticsConsentSchema,
});

export type UpdateConsentInput = z.infer<typeof UpdateConsentSchema>;

export const GetConsentResponseSchema = z.object({
  consent: analyticsConsentSchema,
});

export type GetConsentResponse = z.infer<typeof GetConsentResponseSchema>;

export const AliasSchema = z.object({
  anonymousId: z.string().uuid(),
});

export type AliasInput = z.infer<typeof AliasSchema>;

export const analyticsContract = {
  updateConsent: oc
    .route({ method: "POST", path: "/private/user/analytics/consent" })
    .input(UpdateConsentSchema)
    .output(z.object({ updated: z.boolean() }))
    .errors({
      UNAUTHORIZED: {},
    }),

  getConsent: oc
    .route({ method: "GET", path: "/private/user/analytics/consent" })
    .output(GetConsentResponseSchema)
    .errors({
      UNAUTHORIZED: {},
    }),

  alias: oc
    .route({ method: "POST", path: "/private/user/analytics/alias" })
    .input(AliasSchema)
    .output(z.object({ aliased: z.boolean() }))
    .errors({
      UNAUTHORIZED: {},
    }),
};

// =============================================================================
// Combined User Contract
// =============================================================================

export const userContract = {
  me: meContract,
  settings: settingsContract,
  analytics: analyticsContract,
};

export type UserContract = typeof userContract;
