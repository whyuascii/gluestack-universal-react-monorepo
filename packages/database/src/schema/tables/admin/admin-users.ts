import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Admin User Status
 */
export const adminUserStatuses = ["active", "suspended", "pending"] as const;
export type AdminUserStatus = (typeof adminUserStatuses)[number];

/**
 * Admin Users Table
 *
 * Stores internal admin portal users (Dogfoo employees).
 * Separate from regular users table - admin users authenticate
 * against this table, not the main users table.
 */
export const adminUsers = pgTable(
  "admin_users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull().unique(),
    name: text("name"),
    passwordHash: text("password_hash"), // For email/password auth
    company: text("company").notNull().default("Dogfoo"),
    status: text("status").$type<AdminUserStatus>().notNull().default("pending"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    invitedBy: text("invited_by"),
  },
  (table) => [
    index("admin_users_email_idx").on(table.email),
    index("admin_users_status_idx").on(table.status),
  ]
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
