import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

/**
 * Waitlist table
 * Stores email addresses of users waiting for access
 */
export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
