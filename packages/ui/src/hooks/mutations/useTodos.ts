/**
 * Todo Mutation Hooks
 *
 * These hooks use optimistic updates for instant UI feedback.
 * The UI updates immediately, then syncs with the server in the background.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../../api";
import { todosQueryKey } from "../queries/useTodos";

interface Todo {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tenantId?: string | null;
}

interface TodosData {
  todos: Todo[];
}

/**
 * Hook to create a new todo with optimistic update
 */
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    ...orpc.private.features.todos.create.mutationOptions(),
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: todosQueryKey() });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<TodosData>(todosQueryKey());

      // Optimistically add the new todo
      if (previousTodos) {
        const optimisticTodo: Todo = {
          id: `temp-${Date.now()}`,
          title: newTodo.title,
          description: newTodo.description,
          completed: false,
          dueDate: newTodo.dueDate as Date | null | undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "",
          tenantId: null,
        };

        queryClient.setQueryData<TodosData>(todosQueryKey(), {
          todos: [optimisticTodo, ...previousTodos.todos],
        });
      }

      return { previousTodos };
    },
    onError: (_err, _newTodo, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(todosQueryKey(), context.previousTodos);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: todosQueryKey() });
    },
  });
}

/**
 * Hook to update a todo with optimistic update
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    ...orpc.private.features.todos.update.mutationOptions(),
    onMutate: async (updatedTodo) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKey() });

      const previousTodos = queryClient.getQueryData<TodosData>(todosQueryKey());

      if (previousTodos) {
        queryClient.setQueryData<TodosData>(todosQueryKey(), {
          todos: previousTodos.todos.map((todo) =>
            todo.id === updatedTodo.id
              ? {
                  ...todo,
                  ...updatedTodo,
                  dueDate: updatedTodo.dueDate as Date | null | undefined,
                  updatedAt: new Date(),
                }
              : todo
          ),
        });
      }

      return { previousTodos };
    },
    onError: (_err, _updatedTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(todosQueryKey(), context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKey() });
    },
  });
}

/**
 * Hook to delete a todo with optimistic update
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    ...orpc.private.features.todos.delete.mutationOptions(),
    onMutate: async (deletedTodo) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKey() });

      const previousTodos = queryClient.getQueryData<TodosData>(todosQueryKey());

      if (previousTodos) {
        queryClient.setQueryData<TodosData>(todosQueryKey(), {
          todos: previousTodos.todos.filter((todo) => todo.id !== deletedTodo.id),
        });
      }

      return { previousTodos };
    },
    onError: (_err, _deletedTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(todosQueryKey(), context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKey() });
    },
  });
}

/**
 * Hook to toggle todo completion status with optimistic update
 */
export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    ...orpc.private.features.todos.toggle.mutationOptions(),
    onMutate: async (toggledTodo) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKey() });

      const previousTodos = queryClient.getQueryData<TodosData>(todosQueryKey());

      if (previousTodos) {
        queryClient.setQueryData<TodosData>(todosQueryKey(), {
          todos: previousTodos.todos.map((todo) =>
            todo.id === toggledTodo.id
              ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
              : todo
          ),
        });
      }

      return { previousTodos };
    },
    onError: (_err, _toggledTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(todosQueryKey(), context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKey() });
    },
  });
}
