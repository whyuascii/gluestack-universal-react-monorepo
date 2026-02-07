import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { session } from "../../schema/tables";

// Base schemas from table
export const SessionSchema = createSelectSchema(session);
export const InsertSessionSchema = createInsertSchema(session, {
  expiresAt: z.coerce.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const UpdateSessionSchema = InsertSessionSchema.partial().omit({
  id: true,
  userId: true,
});

// Types
export type Session = z.infer<typeof SessionSchema>;
export type InsertSession = z.infer<typeof InsertSessionSchema>;
export type UpdateSession = z.infer<typeof UpdateSessionSchema>;
