import {
  db,
  tenantMembers,
  eq,
  user as userTable,
  notifications,
  type Notification,
} from "@app/database";
import { sendTemplateEmail } from "@app/mailer";
import { trackServerEvent } from "@app/analytics/server";
import type { AuthContext } from "../middleware";
import { notificationStream } from "../lib/notification-stream";

type TestResult = { success: boolean; message?: string; id?: string };

export class DashboardActions {
  static async getStats(context: AuthContext) {
    const currentUser = context.user;

    // Count memberships
    const memberships = await db.query.tenantMembers.findMany({
      where: eq(tenantMembers.userId, currentUser.id),
    });

    // For demo purposes, return mock stats
    // In production, these would be real queries
    return {
      memberCount: 3,
      groupCount: memberships.length,
      eventCount: 127,
    };
  }

  static async getIntegrationStatus() {
    return {
      email: {
        configured: !!process.env.RESEND_API_KEY,
        provider: "Resend",
      },
      analytics: {
        configured: !!process.env.POSTHOG_KEY,
        provider: "PostHog",
      },
      notifications: {
        configured: !!process.env.NOVU_SECRET_KEY,
        provider: "Novu",
      },
      subscriptions: {
        configured: !!(
          process.env.NEXT_PUBLIC_REVENUECAT_API_KEY ||
          process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
        ),
        provider: "RevenueCat",
      },
    };
  }

  static async sendTestEmail(context: AuthContext): Promise<TestResult> {
    const currentUser = context.user;

    // Get user's email from database
    const userData = await db.query.user.findFirst({
      where: eq(userTable.id, currentUser.id),
    });

    if (!userData?.email) {
      return { success: false, message: "No email address found" };
    }

    if (!process.env.RESEND_API_KEY) {
      return { success: false, message: "Email service not configured" };
    }

    try {
      const result = await sendTemplateEmail("authWelcome", {
        to: userData.email,
        data: {
          name: userData.name || "User",
          dashboardLink: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        },
      });

      return { success: true, message: `Email sent to ${userData.email}`, id: result.id };
    } catch (error) {
      console.error("Failed to send test email:", error);
      return { success: false, message: "Failed to send email" };
    }
  }

  static async sendTestNotification(context: AuthContext): Promise<TestResult> {
    const currentUser = context.user;

    if (!process.env.NOVU_SECRET_KEY) {
      return { success: false, message: "Notification service not configured" };
    }

    try {
      // Create a test notification in the database
      const [notification] = await db
        .insert(notifications)
        .values({
          recipientUserId: currentUser.id,
          actorUserId: currentUser.id,
          type: "test",
          title: "Test Notification",
          body: "This is a test notification from the dashboard integration test.",
          deepLink: "/dashboard",
        })
        .returning();

      // Push to SSE stream for real-time delivery
      notificationStream.publish(currentUser.id, notification as Notification);

      return {
        success: true,
        message: "In-app notification sent",
        id: notification.id,
      };
    } catch (error) {
      console.error("Failed to send test notification:", error);
      return { success: false, message: "Failed to send notification" };
    }
  }

  static async trackTestEvent(context: AuthContext): Promise<TestResult> {
    const currentUser = context.user;

    if (!process.env.POSTHOG_KEY) {
      return { success: false, message: "Analytics service not configured" };
    }

    try {
      trackServerEvent("dashboard_test_event", currentUser.id, {
        source: "integration_test",
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
      });

      return {
        success: true,
        message: "Analytics event tracked",
      };
    } catch (error) {
      console.error("Failed to track test event:", error);
      return { success: false, message: "Failed to track event" };
    }
  }

  static async testSubscription(context: AuthContext): Promise<TestResult> {
    const hasRevenueCat = !!(
      process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
    );

    if (!hasRevenueCat) {
      return { success: false, message: "Subscription service not configured" };
    }

    // RevenueCat is client-side only, so we just verify the configuration
    return {
      success: true,
      message: "RevenueCat is configured. Test purchases from the app.",
    };
  }
}
