/**
 * Billing Contract
 *
 * Authenticated endpoints for subscription and payment management.
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Schemas
// =============================================================================

export const SubscriptionTierSchema = z.enum(["free", "pro", "enterprise"]);
export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;

export const SubscriptionStatusSchema = z.enum([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "expired",
  "paused",
]);
export type SubscriptionStatusType = z.infer<typeof SubscriptionStatusSchema>;

export const SubscriptionProviderSchema = z.enum(["polar", "revenuecat"]);
export type SubscriptionProviderType = z.infer<typeof SubscriptionProviderSchema>;

export const SubscriptionFeaturesSchema = z.object({
  adsEnabled: z.boolean(),
  exportLimit: z.number(), // -1 = unlimited
  bulkExport: z.boolean(),
  prioritySupport: z.boolean(),
  maxMembers: z.number(), // -1 = unlimited
});
export type SubscriptionFeatures = z.infer<typeof SubscriptionFeaturesSchema>;

export const ActiveSubscriptionSchema = z.object({
  status: SubscriptionStatusSchema,
  periodEnd: z.date().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  provider: SubscriptionProviderSchema,
});

export const TenantEntitlementsSchema = z.object({
  tenantId: z.string(),
  tier: SubscriptionTierSchema,
  hasAccess: z.boolean(),
  features: SubscriptionFeaturesSchema,
  subscription: ActiveSubscriptionSchema.optional(),
});
export type TenantEntitlements = z.infer<typeof TenantEntitlementsSchema>;

// =============================================================================
// Billing Contract
// =============================================================================

export const billingContract = {
  status: oc
    .route({ method: "GET", path: "/private/billing/status" })
    .output(TenantEntitlementsSchema)
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
    }),

  checkout: oc
    .route({ method: "POST", path: "/private/billing/checkout" })
    .input(
      z.object({
        planId: z.string(),
      })
    )
    .output(
      z.object({
        checkoutUrl: z.string().url(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
      BAD_REQUEST: {},
    }),

  portal: oc
    .route({ method: "POST", path: "/private/billing/portal" })
    .output(
      z.object({
        portalUrl: z.string().url(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
      NOT_FOUND: {},
    }),

  linkRevenuecat: oc
    .route({ method: "POST", path: "/private/billing/revenuecat/link" })
    .input(
      z.object({
        appUserId: z.string(),
      })
    )
    .output(
      z.object({
        linked: z.boolean(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
      BAD_REQUEST: {},
    }),
};

export type BillingContract = typeof billingContract;
