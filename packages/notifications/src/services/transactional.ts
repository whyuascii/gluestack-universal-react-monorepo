import type { TransactionalNotification } from "../types";

/**
 * Transactional notification service
 * Handles critical notifications like password resets, email verifications, etc.
 *
 * Note: This service is intended to be called from your backend API
 * The client-side methods are wrappers that make API calls to your backend
 */
export class TransactionalNotificationService {
  /**
   * Send a password reset notification
   */
  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    const notification: TransactionalNotification = {
      to: email,
      template: "password-reset",
      data: {
        resetToken,
        resetUrl: `${this.getBaseUrl()}/reset-password?token=${resetToken}`,
      },
    };

    await this.sendTransactional(notification);
  }

  /**
   * Send an email verification notification
   */
  async sendEmailVerification(email: string, verificationToken: string): Promise<void> {
    const notification: TransactionalNotification = {
      to: email,
      template: "email-verification",
      data: {
        verificationToken,
        verificationUrl: `${this.getBaseUrl()}/verify-email?token=${verificationToken}`,
      },
    };

    await this.sendTransactional(notification);
  }

  /**
   * Send an account created notification
   */
  async sendAccountCreated(email: string, userName: string): Promise<void> {
    const notification: TransactionalNotification = {
      to: email,
      template: "account-created",
      data: {
        userName,
        loginUrl: `${this.getBaseUrl()}/login`,
      },
    };

    await this.sendTransactional(notification);
  }

  /**
   * Send a login alert notification
   */
  async sendLoginAlert(
    email: string,
    device: string,
    location: string,
    timestamp: string
  ): Promise<void> {
    const notification: TransactionalNotification = {
      to: email,
      template: "login-alert",
      data: {
        device,
        location,
        timestamp,
      },
    };

    await this.sendTransactional(notification);
  }

  /**
   * Send a transactional notification via backend API
   */
  private async sendTransactional(notification: TransactionalNotification): Promise<void> {
    try {
      // This should call your backend API endpoint that handles transactional notifications
      // Example: POST /api/notifications/transactional
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL;

      if (!apiUrl) {
        console.error(
          "[TransactionalNotificationService] API URL not configured. Cannot send notification."
        );
        return;
      }

      const response = await fetch(`${apiUrl}/notifications/transactional`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error(`Failed to send transactional notification: ${response.statusText}`);
      }

      console.log(
        "[TransactionalNotificationService] Notification sent successfully:",
        notification.template
      );
    } catch (error) {
      console.error("[TransactionalNotificationService] Failed to send notification:", error);
      throw error;
    }
  }

  /**
   * Get the base URL for the application
   */
  private getBaseUrl(): string {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
}

// Export singleton instance
export const transactionalNotificationService = new TransactionalNotificationService();
