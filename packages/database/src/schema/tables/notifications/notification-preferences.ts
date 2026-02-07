import { pgTable, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "../auth/user";
import { tenants } from "../tenant/tenants";

/**
 * Notification Preferences table
 * Stores user notification preferences (can be global or tenant-specific)
 */
export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    inAppEnabled: boolean("in_app_enabled").notNull().default(true),
    pushEnabled: boolean("push_enabled").notNull().default(false),
    emailEnabled: boolean("email_enabled").notNull().default(true),
    marketingEmailEnabled: boolean("marketing_email_enabled").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("notification_preferences_user_id_idx").on(table.userId),
    index("notification_preferences_tenant_id_idx").on(table.tenantId),
  ]
);
