/**
 * Novu Workflow Server Integration
 *
 * Provides the bridge endpoint for Novu to sync workflows.
 * This enables the Novu Framework's code-first approach.
 *
 * @example
 * // In apps/api/src/plugins/novu-bridge.ts
 * import { createNovuBridgePlugin } from "@app/notifications/workflows/serve";
 *
 * export default createNovuBridgePlugin();
 */

import { serve } from "@novu/framework/express";
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { allWorkflows } from "./index";
import { getNovuSecretKey } from "../config/novu";

/**
 * Novu Bridge Handler Options
 */
export interface NovuBridgeOptions {
  /** Path prefix for the bridge endpoint (default: /api/novu) */
  prefix?: string;
}

/**
 * Create Novu bridge handler for Express/Connect-style middleware
 *
 * This is used by the serve function from @novu/framework
 */
export function createNovuHandler() {
  const secretKey = getNovuSecretKey();

  if (!secretKey) {
    console.warn("[Novu Bridge] NOVU_SECRET_KEY not set. Bridge endpoint disabled.");
    return null;
  }

  return serve({
    workflows: allWorkflows,
  });
}

/**
 * Create Fastify plugin for Novu bridge
 *
 * Registers routes at /api/novu that handle Novu's workflow sync protocol.
 *
 * @example
 * import { createNovuBridgePlugin } from "@app/notifications/workflows/serve";
 *
 * fastify.register(createNovuBridgePlugin(), { prefix: '/api/novu' });
 */
export function createNovuBridgePlugin(options: NovuBridgeOptions = {}): FastifyPluginAsync {
  const { prefix = "/api/novu" } = options;

  return async (fastify) => {
    const secretKey = getNovuSecretKey();

    if (!secretKey) {
      fastify.log.warn("[Novu Bridge] NOVU_SECRET_KEY not set. Bridge endpoint disabled.");

      // Register a stub endpoint that returns 503
      fastify.all(`${prefix}/*`, async (_request, reply) => {
        return reply.status(503).send({
          error: "Novu bridge not configured",
          message: "Set NOVU_SECRET_KEY to enable the Novu bridge endpoint",
        });
      });

      return;
    }

    // Create the Express-style handler
    const handler = serve({
      workflows: allWorkflows,
    });

    fastify.log.info(`[Novu Bridge] Registering bridge endpoint at ${prefix}`);

    // Bridge all HTTP methods to the Novu handler
    fastify.all(`${prefix}/*`, async (request: FastifyRequest, reply: FastifyReply) => {
      return new Promise((resolve, reject) => {
        // Create mock req/res for Express-style handler
        const mockReq = createMockRequest(request, prefix);
        const mockRes = createMockResponse(reply, resolve);

        try {
          handler(mockReq as never, mockRes as never, (err?: Error) => {
            if (err) {
              reject(err);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  };
}

/**
 * Create a mock Express-style request from Fastify request
 */
function createMockRequest(request: FastifyRequest, prefix: string) {
  const url = request.url.replace(prefix, "") || "/";

  return {
    method: request.method,
    url,
    path: url.split("?")[0],
    query: request.query,
    params: request.params,
    headers: request.headers,
    body: request.body,
    // Express-specific properties
    get: (header: string) => request.headers[header.toLowerCase()],
    header: (header: string) => request.headers[header.toLowerCase()],
  };
}

/**
 * Create a mock Express-style response from Fastify reply
 */
function createMockResponse(reply: FastifyReply, resolve: (value: unknown) => void) {
  let statusCode = 200;
  const headers: Record<string, string> = {};

  const mockRes = {
    statusCode,
    status: (code: number) => {
      statusCode = code;
      return mockRes;
    },
    setHeader: (name: string, value: string) => {
      headers[name.toLowerCase()] = value;
      return mockRes;
    },
    set: (name: string, value: string) => {
      headers[name.toLowerCase()] = value;
      return mockRes;
    },
    header: (name: string, value: string) => {
      headers[name.toLowerCase()] = value;
      return mockRes;
    },
    getHeader: (name: string) => headers[name.toLowerCase()],
    removeHeader: (name: string) => {
      delete headers[name.toLowerCase()];
      return mockRes;
    },
    send: (body: unknown) => {
      // Set all headers
      Object.entries(headers).forEach(([key, value]) => {
        reply.header(key, value);
      });

      reply.status(statusCode).send(body);
      resolve(undefined);
      return mockRes;
    },
    json: (body: unknown) => {
      headers["content-type"] = "application/json";
      return mockRes.send(body);
    },
    end: (body?: unknown) => {
      if (body) {
        return mockRes.send(body);
      }
      reply.status(statusCode).send();
      resolve(undefined);
      return mockRes;
    },
    // Streaming support
    write: (chunk: unknown) => {
      // For streaming, we'd need different handling
      console.log("[Novu Bridge] write called:", chunk);
      return true;
    },
    on: () => mockRes,
    once: () => mockRes,
    emit: () => false,
    // Additional properties Novu might need
    headersSent: false,
    finished: false,
  };

  return mockRes;
}

/**
 * Sync workflows to Novu (for CI/CD or manual sync)
 *
 * This function triggers a sync of all workflows to Novu.
 * Typically called during deployment or via a CLI command.
 *
 * @example
 * // In a deployment script
 * import { syncWorkflows } from "@app/notifications/workflows/serve";
 * await syncWorkflows();
 */
export async function syncWorkflows(): Promise<void> {
  const secretKey = getNovuSecretKey();

  if (!secretKey) {
    throw new Error("NOVU_SECRET_KEY is required to sync workflows");
  }

  console.log(`[Novu] Syncing ${allWorkflows.length} workflows...`);

  // The actual sync happens when Novu calls the bridge endpoint
  // This function is a placeholder for any additional sync logic
  console.log("[Novu] Workflows ready for sync. Start your dev server and run:");
  console.log("  npx novu@latest dev --port 3030 --route /api/novu");

  return Promise.resolve();
}

/**
 * Get workflow statistics
 */
export function getWorkflowStats() {
  return {
    total: allWorkflows.length,
    workflows: allWorkflows.map((w) => {
      // Access the workflow ID safely - Novu Framework's Workflow type
      // has different structures in different versions
      const workflow = w as { definition?: { workflowId: string }; id?: string };
      const id = workflow.definition?.workflowId || workflow.id || "unknown";
      return { id };
    }),
  };
}
