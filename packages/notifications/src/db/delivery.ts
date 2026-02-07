/**
 * Delivery Audit Log
 * Track how notifications were delivered
 */

import { db } from "@app/database";
import {
  notificationDeliveries,
  type DeliveryChannel,
  type DeliveryStatus,
  type NotificationDelivery,
} from "@app/database";
import { eq } from "drizzle-orm";

/**
 * Log a notification delivery attempt
 */
export async function logDelivery(
  notificationId: string,
  channel: DeliveryChannel,
  status: DeliveryStatus,
  providerMessageId?: string,
  error?: string
): Promise<NotificationDelivery> {
  const [delivery] = await db
    .insert(notificationDeliveries)
    .values({
      notificationId,
      channel,
      status,
      providerMessageId,
      error,
    })
    .returning();

  if (!delivery) {
    throw new Error("Failed to log delivery");
  }

  return delivery;
}

/**
 * Get all deliveries for a notification
 */
export async function getDeliveries(notificationId: string): Promise<NotificationDelivery[]> {
  return db.query.notificationDeliveries.findMany({
    where: eq(notificationDeliveries.notificationId, notificationId),
  });
}
