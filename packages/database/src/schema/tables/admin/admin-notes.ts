import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { adminUsers } from "./admin-users";
import { user } from "../auth/user";
import { tenants } from "../tenant/tenants";

/**
 * Admin User Notes Table
 *
 * Support notes on users.
 */
export const adminUserNotes = pgTable(
  "admin_user_notes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => adminUsers.id),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_user_notes_user_idx").on(table.userId),
    index("admin_user_notes_admin_idx").on(table.adminUserId),
  ]
);

/**
 * Relations for user notes
 */
export const adminUserNotesRelations = relations(adminUserNotes, ({ one }) => ({
  user: one(user, {
    fields: [adminUserNotes.userId],
    references: [user.id],
  }),
  adminUser: one(adminUsers, {
    fields: [adminUserNotes.adminUserId],
    references: [adminUsers.id],
  }),
}));

/**
 * Admin Tenant Notes Table
 *
 * Support notes on tenants.
 */
export const adminTenantNotes = pgTable(
  "admin_tenant_notes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => adminUsers.id),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("admin_tenant_notes_tenant_idx").on(table.tenantId),
    index("admin_tenant_notes_admin_idx").on(table.adminUserId),
  ]
);

/**
 * Relations for tenant notes
 */
export const adminTenantNotesRelations = relations(adminTenantNotes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [adminTenantNotes.tenantId],
    references: [tenants.id],
  }),
  adminUser: one(adminUsers, {
    fields: [adminTenantNotes.adminUserId],
    references: [adminUsers.id],
  }),
}));

export type AdminUserNote = typeof adminUserNotes.$inferSelect;
export type NewAdminUserNote = typeof adminUserNotes.$inferInsert;
export type AdminTenantNote = typeof adminTenantNotes.$inferSelect;
export type NewAdminTenantNote = typeof adminTenantNotes.$inferInsert;
