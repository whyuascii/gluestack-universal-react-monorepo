import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Auto-generated Zod schemas with custom validations
export const insertTenantSchema = createInsertSchema(tenants, {
  name: z.string().min(1, "Name is required").max(255),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

export const selectTenantSchema = createSelectSchema(tenants);

// Update schema (omits timestamps which are auto-managed)
export const updateTenantSchema = insertTenantSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types derived from Zod schemas
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = z.infer<typeof selectTenantSchema>;
export type UpdateTenant = z.infer<typeof updateTenantSchema>;
