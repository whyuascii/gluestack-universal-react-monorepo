/**
 * Navigation Components
 *
 * Shared navigation components for web and mobile.
 *
 * Organized by access level:
 * - auth/: Minimal navigation for auth pages (login, signup, etc.)
 * - public/: Navigation for marketing/public pages
 * - private/: Navigation for authenticated pages
 *
 * Usage:
 *   import { PublicNavbar, PrivateSidebar, PrivateBottomTabs } from "@app/ui/navigation";
 */

// Auth navigation (login, signup, etc.)
export * from "./auth";

// Public navigation (landing, marketing pages)
export * from "./public";

// Private navigation (authenticated pages)
export * from "./private";

// Context
export * from "./context";

// Hooks
export * from "./hooks";

// Types
export * from "./types";
