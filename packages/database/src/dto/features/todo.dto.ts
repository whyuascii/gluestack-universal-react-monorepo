import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { todos } from "../../schema/tables";

// Base schemas from table
export const TodoSchema = createSelectSchema(todos);
export const InsertTodoSchema = createInsertSchema(todos, {
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000).optional(),
});

export const UpdateTodoSchema = InsertTodoSchema.partial().omit({
  id: true,
  userId: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

// API-specific DTOs
export const CreateTodoDTO = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000).optional(),
  dueDate: z.coerce.date().optional(),
});

export const UpdateTodoDTO = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  completed: z.boolean().optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

export const TodoResponseDTO = z.object({
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

// Types
export type Todo = z.infer<typeof TodoSchema>;
export type InsertTodo = z.infer<typeof InsertTodoSchema>;
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;
export type CreateTodo = z.infer<typeof CreateTodoDTO>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoDTO>;
export type TodoResponse = z.infer<typeof TodoResponseDTO>;
