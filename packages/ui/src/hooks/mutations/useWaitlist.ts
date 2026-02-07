/**
 * Waitlist Mutation Hook
 */

import { useMutation } from "@tanstack/react-query";
import { orpc } from "../../api";

/**
 * Hook to join the waitlist
 */
export function useJoinWaitlist() {
  return useMutation(orpc.public.waitlist.signup.mutationOptions());
}
