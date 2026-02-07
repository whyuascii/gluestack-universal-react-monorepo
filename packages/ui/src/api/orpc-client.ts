import { contract, type Contract } from "@app/core-contract";
import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createTraceId, TRACE_HEADERS } from "../analytics/tracing";

function getApiUrl(): string {
  // Next.js (web)
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Expo (mobile)
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Fallback
  return "http://localhost:3030";
}

// Analytics context for request tracing
// Set by AnalyticsProvider after initialization
let analyticsContext: {
  getDistinctId: () => string | undefined;
  getSessionId: () => string | undefined;
} | null = null;

/**
 * Set the analytics context for request tracing
 * Called by AnalyticsProvider after initialization
 */
export function setApiAnalyticsContext(context: {
  getDistinctId: () => string | undefined;
  getSessionId: () => string | undefined;
}): void {
  analyticsContext = context;
}

/**
 * Get trace headers for a request
 */
function getTraceHeaders(): Record<string, string> {
  const traceId = createTraceId();
  const distinctId = analyticsContext?.getDistinctId() || "anonymous";
  const sessionId = analyticsContext?.getSessionId();

  const headers: Record<string, string> = {
    [TRACE_HEADERS.TRACE_ID]: traceId,
    [TRACE_HEADERS.DISTINCT_ID]: distinctId,
  };

  if (sessionId) {
    headers[TRACE_HEADERS.SESSION_ID] = sessionId;
  }

  return headers;
}

const link = new OpenAPILink(contract, {
  url: `${getApiUrl()}/rpc`,
  fetch: (request, init) => {
    // Add trace headers to every request
    const traceHeaders = getTraceHeaders();
    const existingHeaders = request instanceof Request ? request.headers : new Headers();
    const headers = new Headers(existingHeaders);

    Object.entries(traceHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return globalThis.fetch(request, {
      ...init,
      headers,
      credentials: "include",
    } as RequestInit);
  },
});

/**
 * Type-safe oRPC client
 *
 * Usage:
 *   const result = await client.me.get()
 *   const tenant = await client.tenants.create({ name: 'My Group' })
 */
export const client: ContractRouterClient<Contract> = createORPCClient(link);

/**
 * TanStack Query utilities for oRPC
 *
 * Usage:
 *   const query = useQuery(orpc.me.get.queryOptions())
 *   const mutation = useMutation(orpc.tenants.create.mutationOptions())
 */
export const orpc = createTanstackQueryUtils(client);
