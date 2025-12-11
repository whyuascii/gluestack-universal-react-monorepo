import type { FastifyInstance } from "fastify";
import auth from "./auth";
import health from "./health";
import me from "./me";
import swagger from "./swagger";
import users from "./users";
import { VERSIONS } from "./versions";

export { VERSIONS } from "./versions";

const attachAllHandlers = (fastify: FastifyInstance) => {
  // System routes (no versioning)
  health(fastify);
  me(fastify);
  swagger(fastify);

  // Route Naming Principles:
  // - Use plural nouns to represent collections (e.g., /users, /reviews).
  // - Avoid deeply nested routes; flat and shallow structures are easier to maintain (e.g., DON'T DO: /company/review/templates).
  // - At this level routes should correlate directly to a product domain.
  // - Maintain alphabetical order (A-Z) for consistency and readability.
  // - In this file all routes should be correlate to the domain attachHandler file. (e.g., /reviews should correlate to the reviews attachHandler file)
  // - Use constants for versioning to ensure consistency across the application

  // Versioned API routes (alphabetical order)
  auth(fastify, { rootPath: "auth", versionPrefix: VERSIONS.V1 });
  users(fastify, { rootPath: "users", versionPrefix: VERSIONS.V1 });
};

export default attachAllHandlers;
