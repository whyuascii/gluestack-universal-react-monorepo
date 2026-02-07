/**
 * Todo Actions
 *
 * Business logic for todo CRUD operations.
 * Uses TodoQueries for database operations.
 *
 * This is a sample CRUD implementation for developers to reference.
 */

import { TodoQueries, type Todo } from "@app/database";
import { throwError } from "../lib/errors";
import type { AuthContext } from "../middleware";

interface CreateTodoInput {
  title: string;
  description?: string;
  dueDate?: Date;
}

interface UpdateTodoInput {
  id: string;
  title?: string;
  description?: string | null;
  completed?: boolean;
  dueDate?: Date | null;
}

interface GetTodoInput {
  id: string;
}

interface DeleteTodoInput {
  id: string;
}

interface ToggleTodoInput {
  id: string;
}

export class TodoActions {
  /**
   * List all todos for the authenticated user
   */
  static async list(context: AuthContext): Promise<{ todos: Todo[] }> {
    const todos = await TodoQueries.findByUserId(context.user.id, context.user.activeTenantId);
    return { todos };
  }

  /**
   * Get a single todo by ID
   */
  static async get(input: GetTodoInput, context: AuthContext): Promise<Todo> {
    const todo = await TodoQueries.findByIdAndUser(input.id, context.user.id);

    if (!todo) {
      throwError("NOT_FOUND", "The requested todo does not exist or you don't have access to it.");
    }

    return todo;
  }

  /**
   * Create a new todo
   */
  static async create(input: CreateTodoInput, context: AuthContext): Promise<Todo> {
    return TodoQueries.create({
      userId: context.user.id,
      tenantId: context.user.activeTenantId ?? undefined,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
    });
  }

  /**
   * Update an existing todo
   */
  static async update(input: UpdateTodoInput, context: AuthContext): Promise<Todo> {
    const { id, description, ...restData } = input;

    // Convert null to undefined for description since queries expect undefined
    const updateData = {
      ...restData,
      description: description === null ? undefined : description,
    };

    const todo = await TodoQueries.update(id, context.user.id, updateData);

    if (!todo) {
      throwError("NOT_FOUND", "The requested todo does not exist or you don't have access to it.");
    }

    return todo;
  }

  /**
   * Delete a todo
   */
  static async delete(input: DeleteTodoInput, context: AuthContext): Promise<{ success: boolean }> {
    const deleted = await TodoQueries.delete(input.id, context.user.id);

    if (!deleted) {
      throwError("NOT_FOUND", "The requested todo does not exist or you don't have access to it.");
    }

    return { success: true };
  }

  /**
   * Toggle todo completion status
   */
  static async toggle(input: ToggleTodoInput, context: AuthContext): Promise<Todo> {
    const todo = await TodoQueries.toggleComplete(input.id, context.user.id);

    if (!todo) {
      throwError("NOT_FOUND", "The requested todo does not exist or you don't have access to it.");
    }

    return todo;
  }
}
