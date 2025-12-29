import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Auto-generated Zod schemas with custom validations
export const insertWaitlistSchema = createInsertSchema(waitlist, {
  email: z.string().email("Invalid email address").max(255),
});

export const selectWaitlistSchema = createSelectSchema(waitlist);

export const updateWaitlistSchema = insertWaitlistSchema.partial().omit({
  id: true,
  createdAt: true,
});

// TypeScript types derived from Zod schemas
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type Waitlist = z.infer<typeof selectWaitlistSchema>;
export type UpdateWaitlist = z.infer<typeof updateWaitlistSchema>;
