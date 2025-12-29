/**
 * Dashboard API Service
 *
 * Handles dashboard-related API calls
 */

import type { TDashboardResponse } from "@app/service-contracts";
import { apiClient } from "../client";

/**
 * Fetch dashboard data
 */
export async function getDashboard(): Promise<TDashboardResponse> {
  return apiClient.authenticated.get<TDashboardResponse>("/v1/dashboard");
}
