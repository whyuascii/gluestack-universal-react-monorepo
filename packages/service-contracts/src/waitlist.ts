/**
 * Waitlist API Contracts
 */

import { z } from "zod";

/**
 * POST /waitlist
 * Submit email to waitlist
 */
export const WaitlistSignupRequest = z.object({
  email: z.string().email("Invalid email address"),
});

export const WaitlistSignupResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  email: z.string().email(),
});

/**
 * Error responses for waitlist operations
 */
export const WaitlistErrorResponse = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum(["DUPLICATE_EMAIL", "VALIDATION_ERROR", "SERVER_ERROR"]),
    message: z.string(),
  }),
});

export type TWaitlistSignupRequest = z.infer<typeof WaitlistSignupRequest>;
export type TWaitlistSignupResponse = z.infer<typeof WaitlistSignupResponse>;
export type TWaitlistErrorResponse = z.infer<typeof WaitlistErrorResponse>;
