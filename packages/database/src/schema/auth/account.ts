import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./user";

/**
 * Account table for Better Auth
 * Stores OAuth provider accounts linked to users
 */
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at"),
  password: text("password"),
});

// Auto-generated Zod schemas with custom validations
export const insertAccountSchema = createInsertSchema(account, {
  accountId: z.string().min(1, "Account ID is required"),
  providerId: z.string().min(1, "Provider ID is required"),
  expiresAt: z.coerce.date().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export const selectAccountSchema = createSelectSchema(account);

export const updateAccountSchema = insertAccountSchema.partial().omit({
  id: true,
  accountId: true,
  providerId: true,
  userId: true,
});

// TypeScript types derived from Zod schemas
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = z.infer<typeof selectAccountSchema>;
export type UpdateAccount = z.infer<typeof updateAccountSchema>;
