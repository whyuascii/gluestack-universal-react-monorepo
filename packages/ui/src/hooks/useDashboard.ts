import type { Session } from "@app/auth";
import type { TDashboardResponse } from "@app/service-contracts";
import { useQuery } from "@tanstack/react-query";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

/**
 * Hook to fetch dashboard data
 * Note: This hook should be used in a component wrapped with auth session context
 * Pass the session as a parameter since useSession can't be called in shared UI
 */
export const useDashboard = (session: Session | null) => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<TDashboardResponse> => {
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_URL}/v1/dashboard`, {
        credentials: "include", // Include cookies for Better Auth session
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      return response.json() as Promise<TDashboardResponse>;
    },
    enabled: !!session,
  });
};
