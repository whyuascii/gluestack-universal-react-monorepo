/**
 * @app/ui - Business Logic Layer
 *
 * This package contains:
 * - Screens: Cross-platform UI screens (use in apps/web and apps/mobile)
 * - Hooks: Query hooks (TanStack Query), mutation hooks, utility hooks
 * - Stores: Zustand stores for all global state
 * - API: API client and service functions
 * - Forms: TanStack Form integration with Zod validation
 * - Tables: TanStack Table integration for data grids
 * - Types: Shared types for the UI layer
 *
 * Architecture:
 * - Server state: TanStack Query (hooks/queries, hooks/mutations)
 * - Global state: Zustand (stores/) - auth, tenant, preferences, UI
 * - Forms: TanStack Form with Zod schemas from @app/core-contract
 * - Tables: TanStack Table with @app/components primitives
 *
 * Setup:
 *   Wrap your app with QueryClientProvider and add <AuthSync /> component:
 *
 *   <QueryClientProvider client={queryClient}>
 *     <AuthSync />
 *     <App />
 *   </QueryClientProvider>
 */

// API Client & Services
export * from "./api";

// Zustand Stores (auth, tenant, preferences, UI)
export * from "./stores";

// Hooks (auth, queries, mutations)
export * from "./hooks";

// Screens
export * from "./screens";

// UI Components (business-specific)
export * from "./components";

// Navigation Components
export * from "./navigation";

// Constants
export * from "./constants";

// Types
export * from "./types";

// Analytics (shared types and tracing utilities)
// For platform-specific providers/hooks, use:
//   import { AnalyticsProvider, useAnalytics } from "@app/ui/analytics-web"
//   import { AnalyticsProvider, useAnalytics } from "@app/ui/analytics-native"
export * from "./analytics";

// Forms (TanStack Form with Zod validation)
// Use schemas from @app/core-contract for validation
export * from "./forms";

// Tables (TanStack Table with @app/components)
// Headless table with sorting, filtering, pagination
export * from "./tables";
