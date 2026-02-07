import { pgTable, uuid, date, integer, text, uniqueIndex, timestamp } from "drizzle-orm/pg-core";
import { user } from "../auth/user";

/**
 * Daily aggregated activity per user
 * Used for engagement metrics and churn prediction
 */
export const userActivityDaily = pgTable(
  "user_activity_daily",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    eventCount: integer("event_count").default(0).notNull(),
    sessionCount: integer("session_count").default(0).notNull(),
    activeMinutes: integer("active_minutes").default(0).notNull(),
    featuresUsed: text("features_used").array().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("user_activity_user_date_idx").on(table.userId, table.date)]
);

export type UserActivityDaily = typeof userActivityDaily.$inferSelect;
export type NewUserActivityDaily = typeof userActivityDaily.$inferInsert;
