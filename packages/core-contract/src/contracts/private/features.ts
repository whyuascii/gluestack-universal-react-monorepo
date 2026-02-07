/**
 * Features Contracts
 *
 * Authenticated endpoints for app-specific features.
 * - todos: Task management (CRUD sample)
 * - dashboard: Stats and integration testing
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Todos - Task Management
// =============================================================================

export const TodoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tenantId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  dueDate: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TodoResponse = z.infer<typeof TodoSchema>;

export const todosContract = {
  list: oc
    .route({ method: "GET", path: "/private/features/todos" })
    .output(
      z.object({
        todos: z.array(TodoSchema),
      })
    )
    .errors({
      UNAUTHORIZED: {},
    }),

  get: oc
    .route({ method: "GET", path: "/private/features/todos/{id}" })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(TodoSchema)
    .errors({
      UNAUTHORIZED: {},
      NOT_FOUND: {},
    }),

  create: oc
    .route({ method: "POST", path: "/private/features/todos" })
    .input(
      z.object({
        title: z.string().min(1, "Title is required").max(255),
        description: z.string().max(1000).optional(),
        dueDate: z.coerce.date().optional(),
      })
    )
    .output(TodoSchema)
    .errors({
      UNAUTHORIZED: {},
      BAD_REQUEST: {},
    }),

  update: oc
    .route({ method: "PATCH", path: "/private/features/todos/{id}" })
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(1000).nullable().optional(),
        completed: z.boolean().optional(),
        dueDate: z.coerce.date().nullable().optional(),
      })
    )
    .output(TodoSchema)
    .errors({
      UNAUTHORIZED: {},
      NOT_FOUND: {},
      BAD_REQUEST: {},
    }),

  delete: oc
    .route({ method: "DELETE", path: "/private/features/todos/{id}" })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      NOT_FOUND: {},
    }),

  toggle: oc
    .route({ method: "POST", path: "/private/features/todos/{id}/toggle" })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(TodoSchema)
    .errors({
      UNAUTHORIZED: {},
      NOT_FOUND: {},
    }),
};

// =============================================================================
// Dashboard - Stats & Testing
// =============================================================================

export const DashboardStatsSchema = z.object({
  memberCount: z.number(),
  groupCount: z.number(),
  eventCount: z.number(),
});

export const IntegrationStatusSchema = z.object({
  email: z.object({
    configured: z.boolean(),
    provider: z.string().optional(),
  }),
  analytics: z.object({
    configured: z.boolean(),
    provider: z.string().optional(),
  }),
  notifications: z.object({
    configured: z.boolean(),
    provider: z.string().optional(),
  }),
  subscriptions: z.object({
    configured: z.boolean(),
    provider: z.string().optional(),
  }),
});

export const TestResultSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  id: z.string().optional(),
});

export const dashboardContract = {
  getStats: oc
    .route({ method: "GET", path: "/private/features/dashboard/stats" })
    .output(DashboardStatsSchema)
    .errors({
      UNAUTHORIZED: {},
    }),

  getIntegrationStatus: oc
    .route({ method: "GET", path: "/private/features/dashboard/integrations" })
    .output(IntegrationStatusSchema)
    .errors({
      UNAUTHORIZED: {},
    }),

  sendTestEmail: oc
    .route({ method: "POST", path: "/private/features/dashboard/test-email" })
    .output(TestResultSchema)
    .errors({
      UNAUTHORIZED: {},
      INTERNAL_ERROR: {},
    }),

  sendTestNotification: oc
    .route({ method: "POST", path: "/private/features/dashboard/test-notification" })
    .output(TestResultSchema)
    .errors({
      UNAUTHORIZED: {},
      INTERNAL_ERROR: {},
    }),

  trackTestEvent: oc
    .route({ method: "POST", path: "/private/features/dashboard/test-analytics" })
    .output(TestResultSchema)
    .errors({
      UNAUTHORIZED: {},
      INTERNAL_ERROR: {},
    }),

  testSubscription: oc
    .route({ method: "POST", path: "/private/features/dashboard/test-subscription" })
    .output(TestResultSchema)
    .errors({
      UNAUTHORIZED: {},
      INTERNAL_ERROR: {},
    }),
};

// =============================================================================
// Combined Features Contract
// =============================================================================

export const featuresContract = {
  todos: todosContract,
  dashboard: dashboardContract,
};

export type FeaturesContract = typeof featuresContract;
