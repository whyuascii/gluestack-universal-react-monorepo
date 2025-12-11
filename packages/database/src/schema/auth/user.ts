import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * User table for Better Auth
 * Stores core user information for authentication
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Auto-generated Zod schemas with custom validations
export const insertAuthUserSchema = createInsertSchema(user, {
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  image: z.string().url("Invalid image URL").optional(),
});

export const selectAuthUserSchema = createSelectSchema(user);

export const updateAuthUserSchema = insertAuthUserSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types derived from Zod schemas (prefixed with Auth to avoid conflicts)
export type InsertAuthUser = z.infer<typeof insertAuthUserSchema>;
export type AuthUser = z.infer<typeof selectAuthUserSchema>;
export type UpdateAuthUser = z.infer<typeof updateAuthUserSchema>;
