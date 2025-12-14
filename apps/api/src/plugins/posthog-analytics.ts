import { type FastifyPluginAsync, type FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { trackEvent, identifyUser } from "../lib/posthog-server";

/**
 * Fastify plugin to add PostHog analytics helpers to request object
 */
interface AnalyticsHelper {
  track(event: string, properties?: Record<string, string | number | boolean>): void;
  identify(properties?: Record<string, string | number | boolean>): void;
}

const posthogAnalyticsPlugin: FastifyPluginAsync = async (fastify) => {
  // Add PostHog methods to request object
  fastify.decorateRequest("analytics", {
    getter() {
      return this.analytics;
    },
  });

  fastify.addHook("onRequest", (request: FastifyRequest, _reply, done) => {
    const distinctId = getUserDistinctId(request) || "anonymous";
    const userId = getUserId(request);

    // Add analytics helpers to request
    (request as FastifyRequest & { analytics: AnalyticsHelper }).analytics = {
      /**
       * Track an event for the current user
       */
      track(event: string, properties?: Record<string, string | number | boolean>) {
        trackEvent(event, userId || distinctId, {
          ...properties,
          method: request.method,
          url: request.url,
          userAgent: request.headers["user-agent"],
        });
      },

      /**
       * Identify the current user
       */
      identify(properties?: Record<string, string | number | boolean>) {
        if (userId) {
          identifyUser(userId, properties);
        }
      },
    };

    done();
  });
};

function getUserDistinctId(request: FastifyRequest): string | null {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) return null;

  const postHogCookieMatch = cookieHeader.match(/ph_phc_.*?_posthog=([^;]+)/);

  if (postHogCookieMatch && postHogCookieMatch[1]) {
    try {
      const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
      const postHogData = JSON.parse(decodedCookie) as { distinct_id?: string };
      return postHogData.distinct_id || null;
    } catch (_e) {
      return null;
    }
  }

  return null;
}

function getUserId(request: FastifyRequest): string | null {
  const requestWithUser = request as FastifyRequest & {
    user?: { id?: string };
    session?: { userId?: string };
  };

  if (
    requestWithUser.user &&
    typeof requestWithUser.user === "object" &&
    "id" in requestWithUser.user
  ) {
    return requestWithUser.user.id || null;
  }

  if (
    requestWithUser.session &&
    typeof requestWithUser.session === "object" &&
    "userId" in requestWithUser.session
  ) {
    return requestWithUser.session.userId || null;
  }

  return null;
}

// TypeScript declaration merging for request.analytics
declare module "fastify" {
  interface FastifyRequest {
    analytics: {
      track(event: string, properties?: Record<string, string | number | boolean>): void;
      identify(properties?: Record<string, string | number | boolean>): void;
    };
  }
}

export default fp(posthogAnalyticsPlugin, {
  name: "posthog-analytics",
});
