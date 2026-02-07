import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { notifications } from "./notifications";

/**
 * Delivery Channels
 */
export const deliveryChannels = ["in_app", "push", "email"] as const;
export type DeliveryChannel = (typeof deliveryChannels)[number];

/**
 * Delivery Status
 */
export const deliveryStatuses = ["sent", "failed", "skipped"] as const;
export type DeliveryStatus = (typeof deliveryStatuses)[number];

/**
 * Notification Deliveries table
 * Audit log for how notifications were delivered
 */
export const notificationDeliveries = pgTable(
  "notification_deliveries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    notificationId: text("notification_id")
      .notNull()
      .references(() => notifications.id, { onDelete: "cascade" }),
    channel: text("channel").notNull(),
    status: text("status").notNull(),
    providerMessageId: text("provider_message_id"),
    error: text("error"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("notification_deliveries_notification_id_idx").on(table.notificationId)]
);
