import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { tenants } from "../tenant/tenants";
import { user } from "../auth/user";

/**
 * Subscription Status
 */
export const subscriptionStatuses = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "expired",
  "paused",
] as const;
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

/**
 * Subscription Provider
 */
export const subscriptionProviders = ["polar", "revenuecat"] as const;
export type SubscriptionProvider = (typeof subscriptionProviders)[number];

/**
 * Subscriptions table
 * Tenant-level subscriptions supporting multiple providers (Polar for web, RevenueCat for mobile)
 */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    purchasedByUserId: text("purchased_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("active"),
    planId: text("plan_id").notNull(),
    planName: text("plan_name"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
    trialStart: timestamp("trial_start"),
    trialEnd: timestamp("trial_end"),
    provider: text("provider").notNull(),
    // Polar-specific
    polarSubscriptionId: text("polar_subscription_id"),
    polarCustomerId: text("polar_customer_id"),
    // RevenueCat-specific
    revenuecatAppUserId: text("revenuecat_app_user_id"),
    revenuecatOriginalTransactionId: text("revenuecat_original_transaction_id"),
    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("subscriptions_tenant_idx").on(table.tenantId),
    index("subscriptions_polar_sub_idx").on(table.polarSubscriptionId),
    index("subscriptions_rc_user_idx").on(table.revenuecatAppUserId),
    index("subscriptions_status_idx").on(table.tenantId, table.status),
  ]
);
