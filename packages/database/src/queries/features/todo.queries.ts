import { eq, and, desc, isNull } from "drizzle-orm";
import { db } from "../../db";
import { todos } from "../../schema/tables";
import type { Todo, InsertTodo, UpdateTodo } from "../../dto";

export const TodoQueries = {
  /**
   * Find todo by ID
   */
  findById: async (id: string): Promise<Todo | null> => {
    const result = await db.query.todos.findFirst({
      where: eq(todos.id, id),
    });
    return result ?? null;
  },

  /**
   * Find todo by ID and user (for authorization)
   */
  findByIdAndUser: async (id: string, userId: string): Promise<Todo | null> => {
    const result = await db.query.todos.findFirst({
      where: and(eq(todos.id, id), eq(todos.userId, userId)),
    });
    return result ?? null;
  },

  /**
   * Get all todos for a user
   */
  findByUserId: async (userId: string, tenantId?: string | null): Promise<Todo[]> => {
    const conditions = [eq(todos.userId, userId)];

    if (tenantId) {
      conditions.push(eq(todos.tenantId, tenantId));
    } else {
      conditions.push(isNull(todos.tenantId));
    }

    return db.query.todos.findMany({
      where: and(...conditions),
      orderBy: [desc(todos.createdAt)],
    });
  },

  /**
   * Create a new todo
   */
  create: async (data: InsertTodo): Promise<Todo> => {
    const [result] = await db.insert(todos).values(data).returning();
    return result;
  },

  /**
   * Update todo by ID
   */
  update: async (id: string, userId: string, data: UpdateTodo): Promise<Todo | null> => {
    const [result] = await db
      .update(todos)
      .set(data)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();
    return result ?? null;
  },

  /**
   * Delete todo by ID
   */
  delete: async (id: string, userId: string): Promise<boolean> => {
    const result = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning({ id: todos.id });
    return result.length > 0;
  },

  /**
   * Toggle todo completion status
   */
  toggleComplete: async (id: string, userId: string): Promise<Todo | null> => {
    const todo = await TodoQueries.findByIdAndUser(id, userId);
    if (!todo) return null;

    const [result] = await db
      .update(todos)
      .set({ completed: !todo.completed })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();
    return result ?? null;
  },
};
