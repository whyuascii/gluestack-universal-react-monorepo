/**
 * Query Key Factory
 *
 * Centralized query keys for TanStack Query cache management.
 * Following the factory pattern for type-safe, hierarchical keys.
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 *
 * Usage:
 *   queryKey: queryKeys.dashboard.all
 *   queryKey: queryKeys.tenants.detail(tenantId)
 *   queryKey: queryKeys.invites.list({ status: 'pending' })
 */

export const queryKeys = {
  // Auth / User
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },

  // Dashboard
  dashboard: {
    all: ["dashboard"] as const,
    detail: () => [...queryKeys.dashboard.all, "detail"] as const,
  },

  // Tenants (Groups)
  tenants: {
    all: ["tenants"] as const,
    lists: () => [...queryKeys.tenants.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.tenants.lists(), filters] as const,
    details: () => [...queryKeys.tenants.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tenants.details(), id] as const,
    members: (tenantId: string) => [...queryKeys.tenants.detail(tenantId), "members"] as const,
  },

  // Invites
  invites: {
    all: ["invites"] as const,
    lists: () => [...queryKeys.invites.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.invites.lists(), filters] as const,
    details: () => [...queryKeys.invites.all, "detail"] as const,
    detail: (token: string) => [...queryKeys.invites.details(), token] as const,
    pending: () => [...queryKeys.invites.all, "pending"] as const,
  },

  // Waitlist
  waitlist: {
    all: ["waitlist"] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    inbox: (cursor?: string) => [...queryKeys.notifications.all, "inbox", cursor] as const,
    unreadCount: () => [...queryKeys.notifications.all, "unreadCount"] as const,
    subscriberHash: () => [...queryKeys.notifications.all, "subscriberHash"] as const,
  },

  // Settings
  settings: {
    all: ["settings"] as const,
    notificationPreferences: () => [...queryKeys.settings.all, "notifications"] as const,
    members: () => [...queryKeys.settings.all, "members"] as const,
  },

  // Billing
  billing: {
    all: ["billing"] as const,
    status: () => [...queryKeys.billing.all, "status"] as const,
  },
} as const;

/**
 * Type helper to extract query key types
 */
export type QueryKeys = typeof queryKeys;
