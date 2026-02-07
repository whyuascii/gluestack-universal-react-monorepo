/**
 * Notification API Client
 *
 * oRPC client for notification-specific API calls.
 */

import { contract } from "@app/core-contract";
import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

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

const link = new OpenAPILink(contract, {
  url: `${getApiUrl()}/rpc`,
  fetch: (request, init) => {
    return globalThis.fetch(request, {
      ...init,
      credentials: "include",
    } as RequestInit);
  },
});

/**
 * Type-safe oRPC client for notifications
 */
export const notificationClient: ContractRouterClient<typeof contract> = createORPCClient(link);

/**
 * TanStack Query utilities for notification API
 */
export const notificationOrpc = createTanstackQueryUtils(notificationClient);
