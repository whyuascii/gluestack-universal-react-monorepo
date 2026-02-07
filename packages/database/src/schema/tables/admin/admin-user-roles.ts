import { pgTable, text, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { adminUsers } from "./admin-users";
import { adminRoles, type AdminRoleKey } from "./admin-roles";

/**
 * Admin User Roles Junction Table
 *
 * Maps admin users to their roles (many-to-many).
 */
export const adminUserRoles = pgTable(
  "admin_user_roles",
  {
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    roleKey: text("role_key")
      .$type<AdminRoleKey>()
      .notNull()
      .references(() => adminRoles.key, { onDelete: "cascade" }),
    grantedBy: text("granted_by").references(() => adminUsers.id),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.adminUserId, table.roleKey] }),
    index("admin_user_roles_user_idx").on(table.adminUserId),
  ]
);

/**
 * Relations for admin user roles
 */
export const adminUserRolesRelations = relations(adminUserRoles, ({ one }) => ({
  adminUser: one(adminUsers, {
    fields: [adminUserRoles.adminUserId],
    references: [adminUsers.id],
  }),
  role: one(adminRoles, {
    fields: [adminUserRoles.roleKey],
    references: [adminRoles.key],
  }),
  grantedByUser: one(adminUsers, {
    fields: [adminUserRoles.grantedBy],
    references: [adminUsers.id],
  }),
}));

export type AdminUserRole = typeof adminUserRoles.$inferSelect;
export type NewAdminUserRole = typeof adminUserRoles.$inferInsert;
