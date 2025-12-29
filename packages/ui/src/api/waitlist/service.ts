/**
 * Waitlist API Service
 *
 * Handles waitlist signup operations
 */

import type { TWaitlistSignupResponse } from "@app/service-contracts";
import { apiClient } from "../client";

/**
 * Submit email to waitlist
 */
export async function signupForWaitlist(email: string): Promise<TWaitlistSignupResponse> {
  return apiClient.post<TWaitlistSignupResponse>("/waitlist", { email });
}
