/**
 * Cache Time Constants
 *
 * Centralized staleTime and gcTime values for React Query.
 * Conservative strategy: short stale times for user data, longer for static data.
 *
 * staleTime: How long data is considered fresh (won't refetch)
 * gcTime: How long inactive data stays in cache before garbage collection
 */

// Time helpers (in milliseconds)
const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;

/**
 * Cache times by data domain
 */
export const CACHE_TIMES = {
  /** User profile - changes infrequently */
  user: {
    staleTime: 2 * MINUTES,
    gcTime: 10 * MINUTES,
  },

  /** Dashboard stats - moderate update frequency */
  dashboard: {
    staleTime: 1 * MINUTES,
    gcTime: 5 * MINUTES,
  },

  /** Todos - changes often, needs freshness */
  todos: {
    staleTime: 30 * SECONDS,
    gcTime: 5 * MINUTES,
  },

  /** Notifications - real-time via SSE, minimal caching */
  notifications: {
    staleTime: 0, // Always refetch
    gcTime: 5 * MINUTES,
  },

  /** Subscriber hash - rarely changes (only if secret key changes) */
  subscriberHash: {
    staleTime: 1 * HOURS,
    gcTime: 24 * HOURS,
  },

  /** Invites - relatively static once created */
  invites: {
    staleTime: 5 * MINUTES,
    gcTime: 30 * MINUTES,
  },

  /** Settings - changes rarely */
  settings: {
    staleTime: 10 * MINUTES,
    gcTime: 30 * MINUTES,
  },

  /** Group members - membership changes infrequently */
  groupMembers: {
    staleTime: 2 * MINUTES,
    gcTime: 10 * MINUTES,
  },

  /** Integration status - changes rarely */
  integrations: {
    staleTime: 5 * MINUTES,
    gcTime: 30 * MINUTES,
  },
} as const;

/**
 * Default cache times for QueryClient
 */
export const DEFAULT_CACHE_TIMES = {
  staleTime: 1 * MINUTES,
  gcTime: 5 * MINUTES,
} as const;
