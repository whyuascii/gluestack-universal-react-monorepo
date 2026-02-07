/**
 * Application Routes - Single Source of Truth
 *
 * Define routes once with both web and mobile paths.
 * Import ROUTES and use .web or .mobile based on platform.
 *
 * Usage:
 *   import { ROUTES } from "@app/ui";
 *   // Web: router.push(ROUTES.LOGIN.web)
 *   // Mobile: router.push(ROUTES.LOGIN.mobile)
 */

interface Route {
  web: string;
  mobile: string;
}

function route(web: string, mobile: string): Route {
  return { web, mobile };
}

export const ROUTES = {
  // Public (web-only marketing)
  HOME: route("/", "/"),

  // Legal pages (web-only, mobile links to web URLs)
  PRIVACY: route("/privacy", "/privacy"),
  TERMS: route("/terms", "/terms"),
  COOKIES: route("/cookies", "/cookies"),

  // Auth (shared)
  LOGIN: route("/login", "/(auth)/login"),
  SIGNUP: route("/signup", "/(auth)/signup"),
  VERIFY_EMAIL: route("/verify-email", "/(auth)/verify-email"),
  RESET_PASSWORD: route("/reset-password", "/(auth)/reset-password"),

  // Private - Onboarding
  POST_LOGIN: route("/post-login", "/(private)/onboarding"),
  CREATE_GROUP: route("/group/create", "/(private)/onboarding/create-group"),
  INVITE_MEMBERS: route("/group/invite-members", "/(private)/onboarding/invite-members"),

  // Private - Main app
  DASHBOARD: route("/dashboard", "/(private)/(tabs)/dashboard"),
  TODOS: route("/todos", "/(private)/(tabs)/todos"),
  SETTINGS: route("/settings", "/(private)/(tabs)/settings"),
  GROUP: route("/group", "/(private)/(tabs)/group"),

  // Private - Stack screens
  PROFILE: route("/profile", "/(private)/profile"),
  NOTIFICATIONS: route("/notifications", "/(private)/notifications"),
  BILLING: route("/settings?tab=billing", "/(private)/(tabs)/settings"),

  // Private - Group actions
  GROUP_INVITE_MEMBERS: route("/group/invite", "/(private)/onboarding/invite-members"),
  INVITE_ACCEPT: route("/invite/accept", "/(private)/invite/accept"),
} as const;

export type RouteName = keyof typeof ROUTES;

// =============================================================================
// Route Helpers
// =============================================================================

/**
 * Build a route with query parameters
 */
export function buildRoute(baseRoute: string, params?: Record<string, string | undefined>): string {
  if (!params) return baseRoute;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, value);
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${baseRoute}?${queryString}` : baseRoute;
}

/**
 * Get platform-specific route
 */
export function getRoute(routeName: RouteName, platform: "web" | "mobile"): string {
  return ROUTES[routeName][platform];
}
