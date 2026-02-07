import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { verification } from "../../schema/tables";

// Base schemas from table
export const VerificationSchema = createSelectSchema(verification);
export const InsertVerificationSchema = createInsertSchema(verification, {
  identifier: z.string().min(1, "Identifier is required"),
  value: z.string().min(1, "Value is required"),
  expiresAt: z.coerce.date(),
});

export const UpdateVerificationSchema = InsertVerificationSchema.partial().omit({
  id: true,
});

// Types
export type Verification = z.infer<typeof VerificationSchema>;
export type InsertVerification = z.infer<typeof InsertVerificationSchema>;
export type UpdateVerification = z.infer<typeof UpdateVerificationSchema>;
