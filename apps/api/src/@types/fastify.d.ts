import type { AuthConfig } from "@app/auth";
import type { db } from "@app/database";
import type { Session, User } from "better-auth/types";
import "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    startTime?: [number, number];
    span?: Span;
    session?: Session;
    user?: User;
  }

  export interface FastifyInstance {
    verifyAuth(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    betterAuth: AuthConfig;
    db: typeof db;
    config: {
      ENVIRONMENT_STAGE: string;
      GIT_BRANCH: string;
      GIT_HASH: string;
      NODE_ENV: string;
      PORT: number;
      HOST: string;
      AWS_REGION: string;
      DATABASE_URL: string;
      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;
    };
    rateLimit: RateLimit;
  }
}
