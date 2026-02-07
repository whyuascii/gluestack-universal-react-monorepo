import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "../auth/user";

/**
 * Notification Targets table
 * Maps users to push notification provider identities
 *
 * Stack:
 * - Novu: novuSubscriberId (in-app notifications + push orchestration)
 * - Expo Push: expoPushToken (mobile push via Firebase/APNs)
 */
export const notificationTargets = pgTable(
  "notification_targets",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Novu subscriber ID
    novuSubscriberId: text("novu_subscriber_id"),

    // Expo push token for mobile apps (delivered via Firebase/APNs)
    expoPushToken: text("expo_push_token"),

    // Activity tracking for smart notification routing
    lastActiveAt: timestamp("last_active_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("notification_targets_user_id_idx").on(table.userId),
    index("notification_targets_novu_subscriber_id_idx").on(table.novuSubscriberId),
  ]
);
