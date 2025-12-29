import type { MarketingNotification } from "../types";

/**
 * Marketing notification service
 * Handles promotional notifications, announcements, and campaigns
 *
 * Note: Marketing notifications should be sent from your backend/admin panel
 * This service provides client-side helpers for managing marketing preferences
 */
export class MarketingNotificationService {
  /**
   * Send a marketing campaign notification
   * This should be called from your backend/admin panel, not directly from client
   */
  async sendCampaign(notification: MarketingNotification): Promise<void> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL;

      if (!apiUrl) {
        console.error(
          "[MarketingNotificationService] API URL not configured. Cannot send campaign."
        );
        return;
      }

      const response = await fetch(`${apiUrl}/notifications/marketing/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error(`Failed to send marketing campaign: ${response.statusText}`);
      }

      console.log("[MarketingNotificationService] Campaign sent successfully");
    } catch (error) {
      console.error("[MarketingNotificationService] Failed to send campaign:", error);
      throw error;
    }
  }

  /**
   * Opt user into marketing notifications
   */
  async optIn(userId: string): Promise<void> {
    try {
      await this.updatePreference(userId, true);
      console.log("[MarketingNotificationService] User opted in:", userId);
    } catch (error) {
      console.error("[MarketingNotificationService] Failed to opt in:", error);
      throw error;
    }
  }

  /**
   * Opt user out of marketing notifications
   */
  async optOut(userId: string): Promise<void> {
    try {
      await this.updatePreference(userId, false);
      console.log("[MarketingNotificationService] User opted out:", userId);
    } catch (error) {
      console.error("[MarketingNotificationService] Failed to opt out:", error);
      throw error;
    }
  }

  /**
   * Get user's marketing preference
   */
  async getPreference(userId: string): Promise<boolean> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL;

      if (!apiUrl) {
        console.error(
          "[MarketingNotificationService] API URL not configured. Cannot get preference."
        );
        return false;
      }

      const response = await fetch(`${apiUrl}/notifications/marketing/preferences/${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to get marketing preference: ${response.statusText}`);
      }

      const data = (await response.json()) as { optedIn: boolean };
      return data.optedIn;
    } catch (error) {
      console.error("[MarketingNotificationService] Failed to get preference:", error);
      return false;
    }
  }

  /**
   * Update user's marketing notification preference
   */
  private async updatePreference(userId: string, optedIn: boolean): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL;

    if (!apiUrl) {
      console.error(
        "[MarketingNotificationService] API URL not configured. Cannot update preference."
      );
      return;
    }

    const response = await fetch(`${apiUrl}/notifications/marketing/preferences/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ optedIn }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update marketing preference: ${response.statusText}`);
    }
  }
}

// Export singleton instance
export const marketingNotificationService = new MarketingNotificationService();
