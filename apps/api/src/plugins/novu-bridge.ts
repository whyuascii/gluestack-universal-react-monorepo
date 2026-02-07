/**
 * Novu Bridge Plugin
 *
 * Registers the Novu Framework bridge endpoint for workflow synchronization.
 * This enables code-first workflow definitions to be synced to Novu.
 *
 * The bridge endpoint handles:
 * - Workflow discovery (GET /api/novu)
 * - Workflow execution (POST /api/novu)
 * - Health checks
 *
 * Usage:
 *   1. Start the API server with this plugin
 *   2. Run: npx novu@latest dev --port 3030 --route /api/novu
 *   3. Novu Studio will discover and sync workflows
 *
 * Environment Variables:
 *   - NOVU_SECRET_KEY: Required for bridge authentication
 */

import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { createNovuBridgePlugin, getWorkflowStats } from "@app/notifications/server";

export default fastifyPlugin(async (fastify: FastifyInstance) => {
  const stats = getWorkflowStats();

  fastify.log.info(`[Novu Bridge] Registering ${stats.total} workflows at /api/novu`);

  // Register the Novu bridge plugin
  await fastify.register(createNovuBridgePlugin({ prefix: "/api/novu" }));

  // Add a health check endpoint for the bridge
  fastify.get("/api/novu/health", async () => {
    return {
      status: "ok",
      workflows: stats.total,
      workflowIds: stats.workflows.map((w) => w.id),
    };
  });
});
