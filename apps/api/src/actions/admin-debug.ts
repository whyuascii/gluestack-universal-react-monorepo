/**
 * Admin Debug Actions
 *
 * Business logic for debugging and system monitoring.
 */
import { db, sql } from "@app/database";
import type { WebhookEvent, WebhookEventDetail, SystemStatus } from "@app/core-contract";
import { ORPCError } from "@orpc/server";
import { createAdminAuditLog } from "./admin-audit";

// =============================================================================
// TYPES
// =============================================================================

type WebhookStatus = "success" | "failed" | "pending";

// =============================================================================
// WEBHOOK EVENTS
// =============================================================================

// Note: These are placeholder implementations. In a real system, you'd have
// a webhook_events table to store incoming webhooks from Stripe, RevenueCat, etc.

interface ListWebhookEventsInput {
  page: number;
  limit: number;
  source?: string;
  status?: WebhookStatus;
  from?: Date;
  to?: Date;
}

export async function listWebhookEvents(
  input: ListWebhookEventsInput
): Promise<{ events: WebhookEvent[]; total: number }> {
  // Placeholder - would query webhook_events table
  // For now, return empty results
  return { events: [], total: 0 };
}

export async function getWebhookEvent(eventId: string): Promise<WebhookEventDetail> {
  // Placeholder - would query webhook_events table
  throw new ORPCError("NOT_FOUND", {
    message: "Webhook event not found",
  });
}

export async function replayWebhookEvent(
  eventId: string,
  reason: string,
  adminUserId: string
): Promise<{ success: boolean; newEventId?: string; error?: string }> {
  // Placeholder - would fetch and replay the webhook

  // Audit log
  await createAdminAuditLog({
    adminUserId,
    action: "webhook.replayed",
    targetType: "webhook_event",
    targetId: eventId,
    reason,
  });

  return {
    success: false,
    error: "Webhook replay not yet implemented",
  };
}

// =============================================================================
// SYSTEM STATUS
// =============================================================================

export async function getSystemStatus(): Promise<SystemStatus> {
  const startTime = Date.now();

  // Check database health
  let dbStatus: "healthy" | "degraded" | "down" = "healthy";
  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    dbLatency = Date.now() - dbStart;
    if (dbLatency > 1000) {
      dbStatus = "degraded";
    }
  } catch (error) {
    dbStatus = "down";
    dbLatency = -1;
  }

  // Get uptime (time since process started)
  const uptime = process.uptime();

  // Get version from package.json or env
  const version = process.env.npm_package_version || "1.0.0";

  return {
    database: {
      status: dbStatus,
      latencyMs: dbLatency,
    },
    // Cache status (optional - would connect to Redis if used)
    cache: undefined,
    // Queue status (placeholder - would check job queues)
    queues: [],
    // External services status (placeholder)
    services: [
      {
        name: "posthog",
        status: "healthy",
        lastCheck: new Date(),
        message: "Analytics service",
      },
      {
        name: "resend",
        status: "healthy",
        lastCheck: new Date(),
        message: "Email service",
      },
    ],
    uptime: Math.floor(uptime),
    version,
  };
}

// =============================================================================
// HEALTH CHECK (PUBLIC)
// =============================================================================

export async function healthCheck(): Promise<{
  status: "ok" | "degraded" | "error";
  timestamp: string;
}> {
  try {
    // Quick database ping
    await db.execute(sql`SELECT 1`);

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      timestamp: new Date().toISOString(),
    };
  }
}
