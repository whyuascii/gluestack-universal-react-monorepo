import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { notifications, notificationTypes, type NotificationType } from "../../schema/tables";

// Re-export notification types
export { notificationTypes, type NotificationType };

// Base schemas from table
export const NotificationSchema = createSelectSchema(notifications);
export const InsertNotificationSchema = createInsertSchema(notifications, {
  tenantId: z.string().uuid().optional(),
  recipientUserId: z.string(),
  actorUserId: z.string().optional(),
  type: z.enum(notificationTypes),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  deepLink: z.string().max(500).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  batchKey: z.string().max(255).optional(),
});

export const UpdateNotificationSchema = InsertNotificationSchema.partial().omit({
  id: true,
  tenantId: true,
  recipientUserId: true,
  actorUserId: true,
  type: true,
  createdAt: true,
});

// API Response DTO (with typed data field)
export const NotificationResponseDTO = z.object({
  id: z.string(),
  tenantId: z.string().nullable(),
  recipientUserId: z.string(),
  actorUserId: z.string().nullable(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  deepLink: z.string().nullable(),
  data: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.date(),
  readAt: z.date().nullable(),
  archivedAt: z.date().nullable(),
});

// Types
export type Notification = z.infer<typeof NotificationSchema>;
export type InsertNotification = z.infer<typeof InsertNotificationSchema>;
export type UpdateNotification = z.infer<typeof UpdateNotificationSchema>;
export type NotificationResponse = z.infer<typeof NotificationResponseDTO>;
