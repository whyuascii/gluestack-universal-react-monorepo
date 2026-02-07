import type { IncomingMessage, ServerResponse } from "node:http";
import dotenv from "dotenv";
import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyTypeProviderDefault,
  RawServerDefault,
} from "fastify";
import { initializePushProvider } from "@app/notifications/server";
import { build } from "./app";
import { initApiLogging, shutdownApiLogging } from "./utils/logging-handling";

// Load env from local .env file in development
if (process.env.NODE_ENV === "local") {
  dotenv.config();
}

const start = async () => {
  let fastify: FastifyInstance<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger,
    FastifyTypeProviderDefault
  >;

  // Initialize OTEL logging
  const logger = initApiLogging();
  logger.info("OTEL logging initialized");

  // Initialize push notification provider
  try {
    await initializePushProvider();
    logger.info("Push provider initialized");
  } catch (err) {
    logger.warn("Failed to initialize push provider, notifications will be disabled", {
      error: err as Error,
    });
  }

  try {
    fastify = await build();
  } catch (err) {
    logger.error("Error starting server", { error: err as Error });
    return;
  }

  await fastify.listen({
    host: fastify.config.HOST,
    port: fastify.config.PORT,
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    await fastify.close();
    await shutdownApiLogging();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start();
