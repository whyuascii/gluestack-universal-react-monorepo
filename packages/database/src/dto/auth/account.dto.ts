import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { account } from "../../schema/tables";

// Base schemas from table
export const AccountSchema = createSelectSchema(account);
export const InsertAccountSchema = createInsertSchema(account, {
  accountId: z.string().min(1, "Account ID is required"),
  providerId: z.string().min(1, "Provider ID is required"),
  accessTokenExpiresAt: z.coerce.date().optional(),
  refreshTokenExpiresAt: z.coerce.date().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export const UpdateAccountSchema = InsertAccountSchema.partial().omit({
  id: true,
  accountId: true,
  providerId: true,
  userId: true,
});

// Types
export type Account = z.infer<typeof AccountSchema>;
export type InsertAccount = z.infer<typeof InsertAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
