import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { notificationTargets } from "../../schema/tables";

// Base schemas from table
export const NotificationTargetSchema = createSelectSchema(notificationTargets);
export const InsertNotificationTargetSchema = createInsertSchema(notificationTargets, {
  userId: z.string(),
  // Novu subscriber ID
  novuSubscriberId: z.string().optional(),
  // Expo push token (for mobile push via Firebase/APNs)
  expoPushToken: z.string().optional(),
  lastActiveAt: z.coerce.date().optional(),
});

export const UpdateNotificationTargetSchema = InsertNotificationTargetSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type NotificationTarget = z.infer<typeof NotificationTargetSchema>;
export type InsertNotificationTarget = z.infer<typeof InsertNotificationTargetSchema>;
export type UpdateNotificationTarget = z.infer<typeof UpdateNotificationTargetSchema>;
