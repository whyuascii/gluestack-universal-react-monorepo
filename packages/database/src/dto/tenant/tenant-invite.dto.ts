import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tenantInvites } from "../../schema/tables";

// Invite statuses
export const InviteStatuses = ["pending", "accepted", "expired"] as const;
export type InviteStatus = (typeof InviteStatuses)[number];

// Base schemas from table
export const TenantInviteSchema = createSelectSchema(tenantInvites);
export const InsertTenantInviteSchema = createInsertSchema(tenantInvites, {
  email: z.string().email().toLowerCase(),
  token: z.string().uuid(),
  status: z.enum(InviteStatuses),
  expiresAt: z.date(),
});

export const UpdateTenantInviteSchema = InsertTenantInviteSchema.partial().omit({
  id: true,
  tenantId: true,
  invitedBy: true,
  email: true,
  token: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type TenantInvite = z.infer<typeof TenantInviteSchema>;
export type InsertTenantInvite = z.infer<typeof InsertTenantInviteSchema>;
export type UpdateTenantInvite = z.infer<typeof UpdateTenantInviteSchema>;
