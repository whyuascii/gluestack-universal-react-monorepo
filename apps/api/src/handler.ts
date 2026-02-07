import { onError } from "@orpc/server";
import { OpenAPIHandler } from "@orpc/openapi/fastify";
import type { ServerAnalyticsContext } from "@app/analytics/server";
import { handleError } from "./lib/errors";
import { router } from "./orpc-routes";

/**
 * oRPC OpenAPI Handler with Fastify native integration
 *
 * Features:
 * - Automatic OpenAPI spec generation from contracts
 * - RESTful HTTP routing based on .route() definitions
 * - Event Iterator streaming with keep-alive
 *
 * Error handling flow:
 * 1. Procedure throws error
 * 2. onError interceptor calls handleError() for logging + monitoring
 * 3. oRPC formats and returns error response to client
 */
export const rpcHandler = new OpenAPIHandler(router, {
  // Event Iterator streaming reliability
  eventIteratorInitialCommentEnabled: true,
  eventIteratorInitialComment: "stream-start",
  eventIteratorKeepAliveEnabled: true,
  eventIteratorKeepAliveInterval: 5000,
  eventIteratorKeepAliveComment: "keep-alive",

  interceptors: [
    onError((error: unknown, opts) => {
      // Extract user and analytics context if available
      const context = opts.context as
        | {
            user?: { id: string; activeTenantId?: string | null };
            analyticsContext?: ServerAnalyticsContext;
          }
        | undefined;

      // Use unified error handler for logging + monitoring
      // Note: oRPC handles the response formatting, we just capture/log here
      handleError(error, {
        source: "rpc",
        userId: context?.user?.id,
        tenantId: context?.user?.activeTenantId ?? undefined,
        analyticsContext: context?.analyticsContext,
      });
    }),
  ],
});
