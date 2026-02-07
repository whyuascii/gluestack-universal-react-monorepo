import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

/**
 * Analytics consent levels
 */
export type AnalyticsConsent = "disabled" | "anonymous" | "enabled";

/**
 * User lifecycle stages for engagement tracking
 */
export type LifecycleStage = "new" | "activated" | "engaged" | "at_risk" | "churned";

/**
 * Admin role levels (hierarchical)
 * - read_only: Can view admin portal data
 * - support_rw: Can view and modify data, handle support
 * - super_admin: Full access including user management
 */
export type AdminRole = "read_only" | "support_rw" | "super_admin";

/**
 * User table for Better Auth
 * Stores core user information for authentication
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  activeTenantId: text("active_tenant_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  // Analytics & Privacy
  analyticsConsent: text("analytics_consent")
    .$type<AnalyticsConsent>()
    .notNull()
    .default("anonymous"),

  // Activity Tracking
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true }),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),

  // Lifecycle & Engagement
  lifecycleStage: text("lifecycle_stage").$type<LifecycleStage>().notNull().default("new"),
  churnRiskScore: integer("churn_risk_score").default(0),
  isPowerUser: boolean("is_power_user").default(false),

  // Admin role (null = not admin, otherwise role level)
  adminRole: text("admin_role").$type<AdminRole>(),

  // Language preference (synced across devices)
  preferredLanguage: text("preferred_language").default("en"),
});
