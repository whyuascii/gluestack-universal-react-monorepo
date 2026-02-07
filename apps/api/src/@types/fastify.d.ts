import type { AuthConfig } from "@app/auth";
import type { Session, User } from "better-auth/types";
import type { db } from "@app/database";
import type { MailerService } from "../plugins/mailer";
import type { EventsService } from "../plugins/events";
import "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    startTime?: [number, number];
    session?: Session;
    user?: User;
  }

  export interface FastifyInstance {
    verifyAuth(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    betterAuth: AuthConfig;
    db: typeof db;
    mailer: MailerService;
    events: EventsService;
    config: {
      // Core
      PORT: number;
      HOST: string;
      NODE_ENV: string;
      ENVIRONMENT_STAGE: string;

      // Database
      DATABASE_URL: string;

      // Auth
      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;

      // App URLs
      NEXT_PUBLIC_APP_URL: string;

      // CORS
      ALLOWED_ORIGINS: string;

      // Branding
      APP_NAME: string;
      EMAIL_FROM_ADDRESS: string;

      // Analytics
      POSTHOG_KEY: string;
      POSTHOG_HOST: string;
      NEXT_PUBLIC_POSTHOG_KEY: string;
      NEXT_PUBLIC_POSTHOG_HOST: string;

      // Build info
      GIT_BRANCH: string;
      GIT_HASH: string;

      // Legacy/Infrastructure
      AWS_REGION: string;
    };
    rateLimit: RateLimit;
  }
}
