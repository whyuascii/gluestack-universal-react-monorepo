import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { notificationPreferences } from "../../schema/tables";

// Base schemas from table
export const NotificationPreferencesSchema = createSelectSchema(notificationPreferences);
export const InsertNotificationPreferencesSchema = createInsertSchema(notificationPreferences, {
  userId: z.string(),
  tenantId: z.string().uuid().optional(),
  inAppEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  marketingEmailEnabled: z.boolean(),
});

export const UpdateNotificationPreferencesSchema =
  InsertNotificationPreferencesSchema.partial().omit({
    id: true,
    userId: true,
    tenantId: true,
    createdAt: true,
    updatedAt: true,
  });

// Types
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
export type InsertNotificationPreferences = z.infer<typeof InsertNotificationPreferencesSchema>;
export type UpdateNotificationPreferences = z.infer<typeof UpdateNotificationPreferencesSchema>;
