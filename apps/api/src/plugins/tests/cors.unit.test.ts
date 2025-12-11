import type { IncomingMessage, ServerResponse } from "node:http";
import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyTypeProviderDefault,
  RawServerDefault,
} from "fastify";
import Fastify from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import configPlugin from "../config";
import corsPlugin from "../cors";

type TestContext = {
  fastify: FastifyInstance<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger,
    FastifyTypeProviderDefault
  >;
};

describe.concurrent("Unit: Public API CORS Plugin", () => {
  beforeEach<TestContext>(async (context) => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("CLOUDFRONT_DISTRIBUTION_ID", "mockDistributionId");
    vi.stubEnv("DB_CORE_SECRET_ID", "mockDbCoreSecretId");
    vi.stubEnv("DB_REPORTING_SECRET_ID", "mockReportingDbSecretId");
    vi.stubEnv("AWS_REGION", "us-east-1");
    vi.stubEnv("ENVIRONMENT_STAGE", "staging");

    context.fastify = Fastify();

    await context.fastify.register(configPlugin);
    await context.fastify.register(corsPlugin);

    context.fastify.get("/test-cors", {}, async (request, reply) => {
      reply.send("CORS Enabled");
    });

    await context.fastify.ready();
  });

  it<TestContext>("should register the CORS plugin with the correct options", async ({
    fastify,
  }) => {
    const routeResponse = await fastify.inject({
      method: "GET",
      url: "/test-cors",
    });

    expect(routeResponse.headers["access-control-allow-origin"]).toBe("*");
    expect(routeResponse.headers["access-control-allow-credentials"]).toBe("true");
  });
});
