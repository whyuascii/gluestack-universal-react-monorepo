import type { FastifyBaseLogger, FastifyInstance, FastifyTypeProviderDefault, RawServerDefault } from "fastify";
import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it } from "vitest";

// Assuming build is a function to create your Fastify app
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

describe.concurrent("Integration: /swagger.json", () => {
	beforeEach<TestContext>(async (context) => {
		stubEnv();

		context.fastify = await build();
		await context.fastify.ready();

		context.PATH = "/swagger.json";
	});

	it<TestContext>("should return 200 with swagger document", async ({ fastify, PATH }) => {
		const response = await fastify.inject({
			method: "GET",
			url: PATH,
		});

		expect(response.statusCode).toBe(200);
		const swaggerJson = response.json();
		expect(swaggerJson).toHaveProperty("openapi");
		expect(swaggerJson).toHaveProperty("info");
		expect(swaggerJson).toHaveProperty("paths");
		expect(swaggerJson).toHaveProperty("components");
	});
});
