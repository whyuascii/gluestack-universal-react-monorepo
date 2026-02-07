/**
 * oRPC Router Index
 *
 * Combines all routes organized by access level:
 * - public: No auth required
 * - private: Auth required
 * - admin: Auth + admin role required
 */
import { os } from "./_implementer";
import { publicRoutes } from "./public";
import { privateRoutes } from "./private";
import { adminRoutes } from "./admin";

// Build the router from access-level modules
export const router = os.router({
  public: publicRoutes,
  private: privateRoutes,
  admin: adminRoutes,
});

export type Router = typeof router;
