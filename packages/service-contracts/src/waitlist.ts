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

export type TWaitlistSignupRequest = z.infer<typeof WaitlistSignupRequest>;
export type TWaitlistSignupResponse = z.infer<typeof WaitlistSignupResponse>;
