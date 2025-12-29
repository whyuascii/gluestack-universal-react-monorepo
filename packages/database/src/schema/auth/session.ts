import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./user";

/**
 * Session table for Better Auth
 * Stores active user sessions
 */
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

// Auto-generated Zod schemas with custom validations
export const insertSessionSchema = createInsertSchema(session, {
  expiresAt: z.coerce.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const selectSessionSchema = createSelectSchema(session);

export const updateSessionSchema = insertSessionSchema.partial().omit({
  id: true,
  userId: true,
});

// TypeScript types derived from Zod schemas
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = z.infer<typeof selectSessionSchema>;
export type UpdateSession = z.infer<typeof updateSessionSchema>;
