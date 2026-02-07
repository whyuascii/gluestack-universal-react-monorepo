import fastifyCors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(
  async (fastify: FastifyInstance) => {
    await fastify.register(fastifyCors, {
      // When credentials: true, origin cannot be "*"
      // Use a function to allow all origins while supporting credentials
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) {
          callback(null, true);
          return;
        }

        // In production, check against allowed origins
        if (fastify.config.NODE_ENV === "production") {
          const allowedOrigins = fastify.config.ALLOWED_ORIGINS?.split(",") || [];
          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"), false);
          }
        } else {
          // In development, allow all origins
          callback(null, true);
        }
      },
      credentials: true,
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "x-trace-id",
        "x-posthog-distinct-id",
        "x-posthog-session-id",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    });
  },
  { name: "cors", dependencies: ["config"] }
);
