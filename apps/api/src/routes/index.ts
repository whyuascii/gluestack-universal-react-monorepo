import type { FastifyInstance } from "fastify";
import { notificationStream } from "../lib/notification-stream";
import { registerSubscriptionWebhooks } from "./webhooks/subscriptions";

/**
 * Attach Fastify routes (non-oRPC routes only)
 *
 * Note: Most API routes are handled by oRPC at /rpc/*
 * Auth routes are handled by Better Auth plugin at /api/auth/*
 *
 * This file is for any additional Fastify routes that don't fit
 * the oRPC pattern (webhooks, health checks with custom logic, etc.)
 */
const attachAllHandlers = (fastify: FastifyInstance) => {
  // Register subscription webhook routes (Polar, RevenueCat, etc.)
  registerSubscriptionWebhooks(fastify);
  /**
   * SSE endpoint for real-time notifications
   *
   * GET /api/notifications/stream
   *
   * Clients connect and receive notifications in real-time.
   * Connection stays open until client disconnects.
   */
  fastify.get("/api/notifications/stream", async (request, reply) => {
    // Verify authentication
    const session = await fastify.betterAuth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const userId = session.user.id;

    fastify.log.info({ userId }, "SSE connection opened");

    // Set SSE headers
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

    // Send initial connection message
    reply.raw.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    // Keep-alive ping every 30 seconds
    const keepAliveInterval = setInterval(() => {
      reply.raw.write(`: ping\n\n`);
    }, 30000);

    // Subscribe to notifications for this user
    const unsubscribe = notificationStream.subscribe(userId, (event) => {
      // Send the event directly - it already has type and data
      const data = JSON.stringify(event);
      reply.raw.write(`data: ${data}\n\n`);
    });

    // Cleanup on disconnect
    request.raw.on("close", () => {
      clearInterval(keepAliveInterval);
      unsubscribe();
      fastify.log.info({ userId }, "SSE connection closed");
    });

    // Don't end the response - keep it open for SSE
    // Fastify will handle cleanup when the connection closes
  });
};

export default attachAllHandlers;
