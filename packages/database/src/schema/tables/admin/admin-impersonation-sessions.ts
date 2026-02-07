import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { adminUsers } from "./admin-users";
import { user } from "../auth/user";
import { tenants } from "../tenant/tenants";

/**
 * Impersonation Scope
 */
export const impersonationScopes = ["read_only", "read_write"] as const;
export type ImpersonationScope = (typeof impersonationScopes)[number];

/**
 * Impersonation End Reason
 */
export const impersonationEndReasons = ["manual", "expired", "revoked", "logout"] as const;
export type ImpersonationEndReason = (typeof impersonationEndReasons)[number];

/**
 * Admin Impersonation Sessions Table
 *
 * Tracks active and historical impersonation sessions.
 * Used for audit, authorization, and automatic expiry.
 */
export const adminImpersonationSessions = pgTable(
  "admin_impersonation_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => adminUsers.id),
    targetUserId: text("target_user_id")
      .notNull()
      .references(() => user.id),
    targetTenantId: text("target_tenant_id").references(() => tenants.id),
    scope: text("scope").$type<ImpersonationScope>().notNull().default("read_only"),
    reason: text("reason").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    endReason: text("end_reason").$type<ImpersonationEndReason>(),
    metadata: jsonb("metadata").$type<{
      ticketId?: string;
      approvedBy?: string;
      actionsPerformed?: number;
    }>(),
  },
  (table) => [
    index("admin_impersonation_sessions_admin_idx").on(table.adminUserId),
    index("admin_impersonation_sessions_target_idx").on(table.targetUserId),
    index("admin_impersonation_sessions_active_idx").on(table.adminUserId, table.endedAt),
  ]
);

/**
 * Relations for impersonation sessions
 */
export const adminImpersonationSessionsRelations = relations(
  adminImpersonationSessions,
  ({ one }) => ({
    adminUser: one(adminUsers, {
      fields: [adminImpersonationSessions.adminUserId],
      references: [adminUsers.id],
    }),
    targetUser: one(user, {
      fields: [adminImpersonationSessions.targetUserId],
      references: [user.id],
    }),
    targetTenant: one(tenants, {
      fields: [adminImpersonationSessions.targetTenantId],
      references: [tenants.id],
    }),
  })
);

export type AdminImpersonationSession = typeof adminImpersonationSessions.$inferSelect;
export type NewAdminImpersonationSession = typeof adminImpersonationSessions.$inferInsert;
