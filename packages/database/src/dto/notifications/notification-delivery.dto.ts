import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  notificationDeliveries,
  deliveryChannels,
  deliveryStatuses,
  type DeliveryChannel,
  type DeliveryStatus,
} from "../../schema/tables";

// Re-export types
export { deliveryChannels, deliveryStatuses, type DeliveryChannel, type DeliveryStatus };

// Base schemas from table
export const NotificationDeliverySchema = createSelectSchema(notificationDeliveries);
export const InsertNotificationDeliverySchema = createInsertSchema(notificationDeliveries, {
  notificationId: z.string().uuid(),
  channel: z.enum(deliveryChannels),
  status: z.enum(deliveryStatuses),
  providerMessageId: z.string().optional(),
  error: z.string().optional(),
});

// Types
export type NotificationDelivery = z.infer<typeof NotificationDeliverySchema>;
export type InsertNotificationDelivery = z.infer<typeof InsertNotificationDeliverySchema>;
