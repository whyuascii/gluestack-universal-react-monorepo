import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Tenants table
 * Represents groups or organizations using the platform together
 */
export const tenants = pgTable("tenants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  type: text("type").notNull().default("group"), // "team", "organization", "group"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
