import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tenants } from "./tenants";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Auto-generated Zod schemas with custom validations
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email address").max(255),
  name: z.string().min(1).max(255).optional(),
  tenantId: z.string().uuid("Invalid tenant ID"),
});

export const selectUserSchema = createSelectSchema(users);

// Update schema (omits timestamps and tenant ID which shouldn't change)
export const updateUserSchema = insertUserSchema.partial().omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types derived from Zod schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
