import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Admin Role Keys
 */
export const adminRoleKeys = ["read_only", "support_rw", "super_admin"] as const;
export type AdminRoleKey = (typeof adminRoleKeys)[number];

/**
 * Admin Roles Table
 *
 * Defines available admin roles with their capabilities.
 */
export const adminRoles = pgTable("admin_roles", {
  key: text("key").$type<AdminRoleKey>().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  permissions: text("permissions").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminRole = typeof adminRoles.$inferSelect;
export type NewAdminRole = typeof adminRoles.$inferInsert;

/**
 * Default admin roles to seed
 */
export const DEFAULT_ADMIN_ROLES: NewAdminRole[] = [
  {
    key: "read_only",
    name: "Read Only",
    description: "View metrics, users, tenants, subscriptions, and logs",
    permissions: [
      "metrics:read",
      "tenants:read",
      "users:read",
      "subscriptions:read",
      "audit_logs:read",
      "webhooks:read",
    ],
  },
  {
    key: "support_rw",
    name: "Support (Read/Write)",
    description: "Read access plus notes, flags, email resend, and debug tools",
    permissions: [
      "metrics:read",
      "tenants:read",
      "tenants:notes:write",
      "users:read",
      "users:notes:write",
      "users:flags:write",
      "users:email:resend",
      "subscriptions:read",
      "audit_logs:read",
      "webhooks:read",
      "webhooks:replay",
      "impersonation:use",
    ],
  },
  {
    key: "super_admin",
    name: "Super Admin",
    description: "Full access including role management and impersonation control",
    permissions: [
      "metrics:read",
      "tenants:read",
      "tenants:notes:write",
      "users:read",
      "users:notes:write",
      "users:flags:write",
      "users:email:resend",
      "subscriptions:read",
      "subscriptions:modify",
      "audit_logs:read",
      "webhooks:read",
      "webhooks:replay",
      "impersonation:use",
      "impersonation:manage",
      "admin_users:read",
      "admin_users:write",
      "admin_roles:write",
      "system:manage",
    ],
  },
];
