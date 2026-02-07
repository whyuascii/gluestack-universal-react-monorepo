import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tenantMembers } from "../../schema/tables";

// Member roles
export const MemberRoles = ["owner", "admin", "member"] as const;
export type MemberRole = (typeof MemberRoles)[number];

// Base schemas from table
export const TenantMemberSchema = createSelectSchema(tenantMembers);
export const InsertTenantMemberSchema = createInsertSchema(tenantMembers, {
  tenantId: z.string().uuid(),
  userId: z.string(),
  role: z.enum(MemberRoles),
});

export const UpdateTenantMemberSchema = InsertTenantMemberSchema.partial().omit({
  id: true,
  tenantId: true,
  userId: true,
  joinedAt: true,
  updatedAt: true,
});

// Types
export type TenantMember = z.infer<typeof TenantMemberSchema>;
export type InsertTenantMember = z.infer<typeof InsertTenantMemberSchema>;
export type UpdateTenantMember = z.infer<typeof UpdateTenantMemberSchema>;
