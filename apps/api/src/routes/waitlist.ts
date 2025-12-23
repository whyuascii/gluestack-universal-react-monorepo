import { waitlist } from "@app/database";
import {
  WaitlistSignupRequest,
  WaitlistSignupResponse,
  WaitlistErrorResponse,
} from "@app/service-contracts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

const attachHandlers = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/waitlist",
    schema: {
      description: "Sign up for waitlist",
      tags: ["Waitlist"],
      body: WaitlistSignupRequest,
      response: {
        200: WaitlistSignupResponse,
        409: WaitlistErrorResponse,
        500: WaitlistErrorResponse,
      },
    },
    handler: async (req, res) => {
      const { email } = req.body;

      try {
        // Insert into database
        await app.db.insert(waitlist).values({ email });

        app.log.info({ email }, "Waitlist signup successful");

        return res.send({
          success: true,
          message: "Successfully joined the waitlist!",
          email,
        });
      } catch (error) {
        // Check for Postgres unique constraint violation (error code 23505)
        if (error && typeof error === "object" && "code" in error && error.code === "23505") {
          app.log.info({ email }, "Duplicate waitlist signup attempt");
          return res.status(409).send({
            success: false,
            error: {
              code: "DUPLICATE_EMAIL",
              message: "This email is already on the waitlist!",
            },
          });
        }

        // Log unexpected errors
        app.log.error({ error, email }, "Failed to save waitlist signup");

        // Return generic error response
        return res.status(500).send({
          success: false,
          error: {
            code: "SERVER_ERROR",
            message: "Unable to process your request. Please try again later.",
          },
        });
      }
    },
    config: {
      rateLimit: {
        max: 1,
        timeWindow: "1 minute",
      },
      otel: true,
    },
  });
};

export default attachHandlers;
