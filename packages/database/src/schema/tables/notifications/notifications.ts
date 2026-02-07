import { pgTable, text, timestamp, index, json } from "drizzle-orm/pg-core";
import { user } from "../auth/user";
import { tenants } from "../tenant/tenants";

/**
 * Notification Types
 * All possible notification types in the application
 */
export const notificationTypes = [
  // Communication
  "direct_message",
  "milestone",
  "kudos_sent",
  // Tasks
  "todo_assigned",
  "todo_nudge",
  "todo_completed",
  // Events
  "event_created",
  "event_reminder",
  "event_changed",
  // Alerts & Limits
  "achievement",
  "limit_alert",
  "survey_created",
  // System & Membership
  "member_joined",
  "member_invited",
  "settings_changed",
] as const;

export type NotificationType = (typeof notificationTypes)[number];

/**
 * Notifications table
 * The inbox - source of truth for all notifications
 */
export const notifications = pgTable(
  "notifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    recipientUserId: text("recipient_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    deepLink: text("deep_link"),
    data: json("data"),
    batchKey: text("batch_key"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    readAt: timestamp("read_at"),
    archivedAt: timestamp("archived_at"),
  },
  (table) => [
    index("notifications_inbox_idx").on(table.tenantId, table.recipientUserId, table.createdAt),
    index("notifications_unread_idx").on(table.recipientUserId, table.readAt),
    index("notifications_batch_key_idx").on(table.batchKey),
  ]
);
