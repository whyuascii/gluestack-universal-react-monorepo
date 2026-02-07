import { pgTable, text, date, integer, uniqueIndex, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

/**
 * Daily aggregated activity per tenant
 * Used for tenant health metrics
 */
export const tenantActivityDaily = pgTable(
  "tenant_activity_daily",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    activeUsers: integer("active_users").default(0).notNull(),
    eventCount: integer("event_count").default(0).notNull(),
    newMembers: integer("new_members").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("tenant_activity_tenant_date_idx").on(table.tenantId, table.date)]
);

export type TenantActivityDaily = typeof tenantActivityDaily.$inferSelect;
export type NewTenantActivityDaily = typeof tenantActivityDaily.$inferInsert;
