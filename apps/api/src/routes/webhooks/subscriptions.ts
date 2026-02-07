/**
 * Subscription Webhooks
 *
 * Thin routes that delegate to @app/subscriptions/server for processing.
 * Each provider has its own endpoint due to different signature headers.
 */

import type { FastifyInstance } from "fastify";
import { processSubscriptionWebhook } from "@app/subscriptions/server";

/**
 * Register subscription webhook routes for all providers.
 */
export async function registerSubscriptionWebhooks(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/webhooks/polar
   *
   * Receives Polar subscription events (web payments).
   * Signature header: webhook-signature
   */
  fastify.post(
    "/api/webhooks/polar",
    {
      config: {
        rawBody: true,
      },
    },
    async (request, reply) => {
      const signature = request.headers["webhook-signature"] as string;
      const payload = (request as unknown as { rawBody: string }).rawBody;

      if (!signature || !payload) {
        fastify.log.warn("[Polar] Missing signature or body");
        return reply.status(401).send({ error: "Invalid request" });
      }

      const result = await processSubscriptionWebhook("polar", payload, signature);

      if (result.error === "Invalid signature") {
        fastify.log.warn("[Polar] Invalid webhook signature");
        return reply.status(401).send({ error: "Invalid signature" });
      }

      return reply.status(200).send({
        received: true,
        processed: result.processed,
      });
    }
  );

  /**
   * POST /api/webhooks/revenuecat
   *
   * Receives RevenueCat subscription events (mobile payments).
   * Signature header: x-revenuecat-signature
   */
  fastify.post("/api/webhooks/revenuecat", async (request, reply) => {
    const signature = request.headers["x-revenuecat-signature"] as string;
    const payload = JSON.stringify(request.body);

    const result = await processSubscriptionWebhook("revenuecat", payload, signature || "");

    if (result.error === "Invalid signature") {
      fastify.log.warn("[RevenueCat] Invalid webhook signature");
      return reply.status(401).send({ error: "Invalid signature" });
    }

    // Return reason for debugging if not processed
    if (!result.processed && result.reason) {
      return reply.status(200).send({
        received: true,
        processed: false,
        reason: result.reason,
      });
    }

    return reply.status(200).send({
      received: true,
      processed: result.processed,
    });
  });

  // Future: Add more provider webhooks here
  // fastify.post("/api/webhooks/stripe", ...)
}
