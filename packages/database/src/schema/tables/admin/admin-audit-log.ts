import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { adminUsers } from "./admin-users";

/**
 * Audit Action Types
 */
export const auditActions = [
  // Auth actions
  "ADMIN_LOGIN",
  "ADMIN_LOGOUT",
  "ADMIN_LOGIN_FAILED",

  // Impersonation
  "IMPERSONATION_START",
  "IMPERSONATION_STOP",
  "IMPERSONATION_ACTION",
  "IMPERSONATION_EXPIRED",

  // User management
  "ADMIN_USER_CREATE",
  "ADMIN_USER_UPDATE",
  "ADMIN_USER_SUSPEND",
  "ADMIN_USER_ACTIVATE",
  "ADMIN_ROLE_GRANT",
  "ADMIN_ROLE_REVOKE",

  // Support actions
  "USER_NOTE_ADD",
  "USER_NOTE_DELETE",
  "USER_FLAG_SET",
  "USER_FLAG_REMOVE",
  "TENANT_NOTE_ADD",
  "TENANT_NOTE_DELETE",
  "EMAIL_RESEND",
  "VERIFICATION_RESET",

  // Debug actions
  "WEBHOOK_VIEW",
  "WEBHOOK_REPLAY",

  // Data access (sensitive reads)
  "USER_DATA_VIEW",
  "TENANT_DATA_VIEW",
  "SUBSCRIPTION_DATA_VIEW",
  "PII_DATA_ACCESS",
] as const;
export type AuditAction = (typeof auditActions)[number];

/**
 * Audit Target Types
 */
export const auditTargetTypes = [
  "user",
  "tenant",
  "subscription",
  "admin_user",
  "webhook_event",
  "system",
] as const;
export type AuditTargetType = (typeof auditTargetTypes)[number];

/**
 * Admin Audit Log Table
 *
 * Records all admin actions for security and compliance.
 * APPEND-ONLY - never update or delete rows.
 */
export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => adminUsers.id),
    action: text("action").$type<AuditAction>().notNull(),
    targetType: text("target_type").$type<AuditTargetType>().notNull(),
    targetId: text("target_id"),
    reason: text("reason"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    impersonationSessionId: text("impersonation_session_id"),
  },
  (table) => [
    index("admin_audit_log_admin_user_idx").on(table.adminUserId),
    index("admin_audit_log_action_idx").on(table.action),
    index("admin_audit_log_target_idx").on(table.targetType, table.targetId),
    index("admin_audit_log_created_idx").on(table.createdAt),
  ]
);

export type AdminAuditLog = typeof adminAuditLog.$inferSelect;
export type NewAdminAuditLog = typeof adminAuditLog.$inferInsert;
