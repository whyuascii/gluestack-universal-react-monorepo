import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tenants } from "../../schema/tables";

// Tenant types
export const TenantTypes = ["team", "organization", "group", "family"] as const;
export type TenantType = (typeof TenantTypes)[number];

// Base schemas from table
export const TenantSchema = createSelectSchema(tenants);
export const InsertTenantSchema = createInsertSchema(tenants, {
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(TenantTypes),
});

export const UpdateTenantSchema = InsertTenantSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// API-specific DTOs
export const CreateTenantDTO = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(TenantTypes).optional().default("group"),
});

export const TenantResponseDTO = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types
export type Tenant = z.infer<typeof TenantSchema>;
export type InsertTenant = z.infer<typeof InsertTenantSchema>;
export type UpdateTenant = z.infer<typeof UpdateTenantSchema>;
export type CreateTenant = z.infer<typeof CreateTenantDTO>;
export type TenantResponse = z.infer<typeof TenantResponseDTO>;
