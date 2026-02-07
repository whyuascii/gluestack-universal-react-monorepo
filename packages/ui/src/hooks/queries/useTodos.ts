/**
 * Todo Query Hooks
 */

import type { Session } from "@app/auth";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "../../api";
import { CACHE_TIMES } from "../../constants/cache";

/**
 * Hook to fetch all todos for the current user
 */
export function useTodos(session: Session | null) {
  return useQuery({
    ...orpc.private.features.todos.list.queryOptions(),
    enabled: !!session,
    staleTime: CACHE_TIMES.todos.staleTime,
    gcTime: CACHE_TIMES.todos.gcTime,
  });
}

/**
 * Hook to fetch a single todo by ID
 */
export function useTodo(id: string, session: Session | null) {
  return useQuery({
    ...orpc.private.features.todos.get.queryOptions({ input: { id } }),
    enabled: !!session && !!id,
    staleTime: CACHE_TIMES.todos.staleTime,
    gcTime: CACHE_TIMES.todos.gcTime,
  });
}

/**
 * Query key for todos - useful for invalidation
 */
export const todosQueryKey = () => orpc.private.features.todos.list.key();
