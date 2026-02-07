import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

/**
 * Subscription Events table
 * Idempotency log for webhook events from subscription providers
 */
export const subscriptionEvents = pgTable(
  "subscription_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id").notNull().unique(),
    provider: text("provider").notNull(), // "polar" | "revenuecat"
    eventType: text("event_type").notNull(),
    payload: jsonb("payload"),
    processedAt: timestamp("processed_at").notNull().defaultNow(),
  },
  (table) => [index("subscription_events_event_id_idx").on(table.eventId)]
);
