import type { IncomingMessage, ServerResponse } from "node:http";
import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyTypeProviderDefault,
  RawServerDefault,
} from "fastify";
import Fastify from "fastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import configPlugin from "../config";

type TestContext = {
  fastify: FastifyInstance<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger,
    FastifyTypeProviderDefault
  >;
};

describe.concurrent("Unit: Public API Config Plugin", () => {
  beforeEach<TestContext>(async (context) => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("AWS_REGION", "us-east-1");
    vi.stubEnv("ENVIRONMENT_STAGE", "staging");
    vi.stubEnv("PORT", "3030");
    vi.stubEnv("HOST", "0.0.0.0");

    context.fastify = Fastify();
    await context.fastify.register(configPlugin);
  });

  afterEach<TestContext>(async ({ fastify }) => {
    await fastify.close();
    vi.resetAllMocks();
  });

  it<TestContext>("should load environment variables into Fastify config", async ({ fastify }) => {
    expect(fastify.config.AWS_REGION).toBe("us-east-1");
    expect(fastify.config.ENVIRONMENT_STAGE).toBe("staging");
    expect(fastify.config.PORT).toBe(3030);
    expect(fastify.config.HOST).toBe("0.0.0.0");
  });

  it<TestContext>("should load default values for environment variables that are not set", async ({
    fastify,
  }) => {
    expect(fastify.config.GIT_BRANCH).toBe("N/A");
    expect(fastify.config.GIT_HASH).toBe("N/A");
    expect(fastify.config.HOST).toBe("0.0.0.0");
    expect(fastify.config.NODE_ENV).toBe("test");
    expect(fastify.config.ENVIRONMENT_STAGE).toBe("staging");
  });

  it<TestContext>("should remove additional properties from the config", async ({ fastify }) => {
    vi.stubEnv("BOGUS", "bogusValue");
    expect((fastify.config as Record<string, unknown>).BOGUS).toBeUndefined();
  });
});
