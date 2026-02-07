import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { waitlist } from "../../schema/tables";

// Base schemas from table
export const WaitlistSchema = createSelectSchema(waitlist);
export const InsertWaitlistSchema = createInsertSchema(waitlist, {
  email: z.string().email("Invalid email address").max(255),
});

export const UpdateWaitlistSchema = InsertWaitlistSchema.partial().omit({
  id: true,
  createdAt: true,
});

// Types
export type Waitlist = z.infer<typeof WaitlistSchema>;
export type InsertWaitlist = z.infer<typeof InsertWaitlistSchema>;
export type UpdateWaitlist = z.infer<typeof UpdateWaitlistSchema>;
