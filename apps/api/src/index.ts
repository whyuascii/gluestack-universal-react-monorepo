import dotenv from "dotenv";
import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyTypeProviderDefault,
  RawServerDefault,
} from "fastify";
import type { IncomingMessage, ServerResponse } from "node:http";
import { build } from "./app";

const start = async () => {
  let fastify: FastifyInstance<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger,
    FastifyTypeProviderDefault
  >;

  // load env vars
  if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
    const localEnv = dotenv.config({ path: "./.env" });

    console.info("populated local environment: ", localEnv.parsed);
  }

  try {
    fastify = await build();
  } catch (err) {
    console.error("error", "Error starting server", { error: err });
    return;
  }

  await fastify.listen({
    host: fastify.config.HOST,
    port: fastify.config.PORT,
  });
};

start();
