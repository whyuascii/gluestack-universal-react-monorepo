import type { IncomingMessage, ServerResponse } from "node:http";
import type { FastifyBaseLogger, FastifyInstance, FastifyTypeProviderDefault, RawServerDefault } from "fastify";
import { beforeEach, describe, expect, it } from "vitest";
import { build } from "../../app";
import stubEnv from "../../tests/stubEnvSetup";

type TestContext = {
	fastify: FastifyInstance<
		RawServerDefault,
		IncomingMessage,
		ServerResponse<IncomingMessage>,
		FastifyBaseLogger,
		FastifyTypeProviderDefault
	>;
	PATH: string;
};

describe.concurrent("Integration: /health", () => {
	beforeEach<TestContext>(async (context) => {
		// Mock environment variables
		stubEnv();

		context.fastify = await build();
		await context.fastify.ready();

		context.PATH = "/health";
	});

	it<TestContext>("should return 200 with health status and environment details", async ({ fastify, PATH }) => {
		const response = await fastify.inject({
			method: "GET",
			url: PATH,
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			healthy: true,
			gitHash: "testhash123",
			gitHashShort: "testhas",
			gitBranch: "test-branch",
			environment: "test",
		});
	});
});
