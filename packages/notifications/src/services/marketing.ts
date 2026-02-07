/**
 * Marketing Notification Service
 *
 * Handles marketing campaigns and announcements.
 * Uses the provider system (Novu) for delivery.
 */

import type { MarketingNotification } from "../types";

/**
 * Marketing Notification Service Interface
 */
export interface MarketingNotificationService {
  sendCampaign(
    notification: Omit<MarketingNotification, "id" | "createdAt" | "read">
  ): Promise<void>;
  sendToSegment(
    segment: string[],
    notification: Omit<MarketingNotification, "id" | "createdAt" | "read" | "segment">
  ): Promise<void>;
}

/**
 * Marketing Service Implementation
 * Stub implementation - use getPushProvider() from @app/notifications/server
 */
class MarketingService implements MarketingNotificationService {
  async sendCampaign(
    _notification: Omit<MarketingNotification, "id" | "createdAt" | "read">
  ): Promise<void> {
    // Note: For server-side marketing, use getPushProvider() from @app/notifications/server
  }

  async sendToSegment(
    _segment: string[],
    _notification: Omit<MarketingNotification, "id" | "createdAt" | "read" | "segment">
  ): Promise<void> {
    // Note: For server-side marketing, use getPushProvider() from @app/notifications/server
  }
}

/**
 * Export singleton instance
 */
export const marketingNotificationService: MarketingNotificationService = new MarketingService();

/**
 * Helper to send announcement
 */
export async function sendAnnouncement(
  title: string,
  message: string,
  campaign?: string
): Promise<void> {
  await marketingNotificationService.sendCampaign({
    type: "marketing",
    title,
    message,
    category: "marketing",
    priority: "normal",
    campaign,
    data: { type: "announcement" },
  });
}
