import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user, type AnalyticsConsent, type LifecycleStage } from "../../schema/tables";
import type { AdminRole } from "../../schema/tables/auth/user";

// Analytics consent schema
export const analyticsConsentSchema = z.enum(["disabled", "anonymous", "enabled"]);

// Lifecycle stage schema
export const lifecycleStageSchema = z.enum(["new", "activated", "engaged", "at_risk", "churned"]);

// Admin role schema
export const adminRoleSchema = z.enum(["read_only", "support_rw", "super_admin"]);

// Base schemas from table
export const UserSchema = createSelectSchema(user, {
  analyticsConsent: analyticsConsentSchema,
  lifecycleStage: lifecycleStageSchema,
  adminRole: adminRoleSchema.nullable(),
});

export const InsertUserSchema = createInsertSchema(user, {
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  image: z.string().url("Invalid image URL").optional(),
  analyticsConsent: analyticsConsentSchema.optional(),
  lifecycleStage: lifecycleStageSchema.optional(),
  adminRole: adminRoleSchema.nullable().optional(),
});

export const UpdateUserSchema = InsertUserSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = z.infer<typeof UserSchema>;
export type InsertUser = z.infer<typeof InsertUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// Re-export types from schema for convenience
export type { AnalyticsConsent, LifecycleStage, AdminRole };
