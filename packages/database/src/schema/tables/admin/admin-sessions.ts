import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { adminUsers } from "./admin-users";

/**
 * Admin Sessions Table
 *
 * BetterAuth-compatible sessions for admin users (separate from customer sessions).
 */
export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    // Step-up auth tracking for sensitive operations
    stepUpVerifiedAt: timestamp("step_up_verified_at", { withTimezone: true }),
    stepUpExpiresAt: timestamp("step_up_expires_at", { withTimezone: true }),
  },
  (table) => [
    index("admin_sessions_user_idx").on(table.adminUserId),
    index("admin_sessions_token_idx").on(table.token),
    index("admin_sessions_expires_idx").on(table.expiresAt),
  ]
);

/**
 * Relations for admin sessions
 */
export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  adminUser: one(adminUsers, {
    fields: [adminSessions.adminUserId],
    references: [adminUsers.id],
  }),
}));

export type AdminSession = typeof adminSessions.$inferSelect;
export type NewAdminSession = typeof adminSessions.$inferInsert;
