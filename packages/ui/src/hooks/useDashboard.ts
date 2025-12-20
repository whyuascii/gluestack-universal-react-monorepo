import type { TDashboardResponse } from "@app/service-contracts";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

export const useDashboard = () => {
  const session = useAuthStore((state) => state.session);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<TDashboardResponse> => {
      if (!session?.token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_URL}/v1/dashboard`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      return response.json() as Promise<TDashboardResponse>;
    },
    enabled: isAuthenticated,
  });
};
