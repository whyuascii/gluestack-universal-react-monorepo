/**
 * Admin Debug Contract
 *
 * Endpoints for debugging and system monitoring.
 * Requires support_rw+ role for replay.
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Schemas
// =============================================================================

export const WebhookEventSchema = z.object({
  id: z.string(),
  source: z.string(),
  eventType: z.string(),
  status: z.enum(["success", "failed", "pending"]),
  receivedAt: z.coerce.date(),
  processedAt: z.coerce.date().nullable(),
  error: z.string().nullable(),
});

export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

export const WebhookEventDetailSchema = WebhookEventSchema.extend({
  payload: z.record(z.string(), z.unknown()),
  headers: z.record(z.string(), z.string()),
  attempts: z.number(),
});

export type WebhookEventDetail = z.infer<typeof WebhookEventDetailSchema>;

export const ServiceStatusSchema = z.object({
  name: z.string(),
  status: z.enum(["healthy", "degraded", "down"]),
  lastCheck: z.coerce.date(),
  latencyMs: z.number().optional(),
  message: z.string().optional(),
});

export const QueueStatusSchema = z.object({
  name: z.string(),
  pending: z.number(),
  failed: z.number(),
  processed24h: z.number(),
});

export const SystemStatusSchema = z.object({
  database: z.object({
    status: z.enum(["healthy", "degraded", "down"]),
    latencyMs: z.number(),
  }),
  cache: z
    .object({
      status: z.enum(["healthy", "degraded", "down"]),
      hitRate: z.number(),
    })
    .optional(),
  queues: z.array(QueueStatusSchema),
  services: z.array(ServiceStatusSchema),
  uptime: z.number(),
  version: z.string(),
});

export type SystemStatus = z.infer<typeof SystemStatusSchema>;

const PaginationInput = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const DateRangeInput = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// =============================================================================
// Debug Contract
// =============================================================================

export const debugContract = {
  // List webhook events (read_only+)
  listWebhookEvents: oc
    .route({ method: "GET", path: "/admin/debug/webhooks" })
    .input(
      PaginationInput.merge(DateRangeInput).extend({
        source: z.string().optional(),
        status: z.enum(["success", "failed", "pending"]).optional(),
      })
    )
    .output(
      z.object({
        events: z.array(WebhookEventSchema),
        total: z.number(),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),

  // Get webhook event detail (read_only+)
  getWebhookEvent: oc
    .route({ method: "GET", path: "/admin/debug/webhooks/{eventId}" })
    .input(z.object({ eventId: z.string() }))
    .output(WebhookEventDetailSchema)
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Replay webhook event (support_rw+)
  replayWebhookEvent: oc
    .route({ method: "POST", path: "/admin/debug/webhooks/{eventId}/replay" })
    .input(
      z.object({
        eventId: z.string(),
        reason: z.string().min(10),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        newEventId: z.string().optional(),
        error: z.string().optional(),
      })
    )
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {}, NOT_FOUND: {} }),

  // Get system status (read_only+)
  systemStatus: oc
    .route({ method: "GET", path: "/admin/debug/system" })
    .output(SystemStatusSchema)
    .errors({ UNAUTHORIZED: {}, FORBIDDEN: {} }),

  // Health check (public)
  healthCheck: oc
    .route({ method: "GET", path: "/admin/debug/health" })
    .output(
      z.object({
        status: z.enum(["ok", "degraded", "error"]),
        timestamp: z.string(),
      })
    )
    .errors({}),
};

export type DebugContract = typeof debugContract;
