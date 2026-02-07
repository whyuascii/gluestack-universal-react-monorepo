/**
 * Admin Metrics Contract
 *
 * Admin-only endpoints for platform metrics and analytics.
 * Requires auth + admin role middleware.
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Schemas
// =============================================================================

export const MetricsOverviewSchema = z.object({
  totalUsers: z.number(),
  activeUsers30d: z.number(),
  newUsers7d: z.number(),
  churnRate: z.number(), // Percentage
});

export type MetricsOverview = z.infer<typeof MetricsOverviewSchema>;

export const FeatureUsageSchema = z.object({
  feature: z.string(),
  count: z.number(),
  uniqueUsers: z.number(),
});

export type FeatureUsage = z.infer<typeof FeatureUsageSchema>;

export const EngagementMetricsSchema = z.object({
  dau: z.number(), // Daily active users
  wau: z.number(), // Weekly active users
  mau: z.number(), // Monthly active users
  avgSessionDuration: z.number(), // Seconds
  featureUsage: z.array(FeatureUsageSchema),
});

export type EngagementMetrics = z.infer<typeof EngagementMetricsSchema>;

export const RevenueMetricsSchema = z.object({
  mrr: z.number(),
  arr: z.number(),
  activeSubscriptions: z.number(),
  trialConversions: z.number(),
  churnRateRevenue: z.number(), // Percentage
});

export type RevenueMetrics = z.infer<typeof RevenueMetricsSchema>;

export const RetentionWeekSchema = z.object({
  week: z.number(),
  retained: z.number(),
  percentage: z.number(),
});

export type RetentionWeek = z.infer<typeof RetentionWeekSchema>;

export const CohortDataSchema = z.object({
  cohortDate: z.string(), // YYYY-MM format
  totalUsers: z.number(),
  retention: z.array(RetentionWeekSchema),
});

export type CohortData = z.infer<typeof CohortDataSchema>;

// =============================================================================
// Metrics Contract
// =============================================================================

export const metricsContract = {
  overview: oc
    .route({ method: "GET", path: "/admin/metrics/overview" })
    .output(MetricsOverviewSchema)
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
    }),

  engagement: oc
    .route({ method: "GET", path: "/admin/metrics/engagement" })
    .input(
      z.object({
        period: z.enum(["7d", "30d", "90d"]).optional().default("30d"),
      })
    )
    .output(EngagementMetricsSchema)
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
    }),

  revenue: oc
    .route({ method: "GET", path: "/admin/metrics/revenue" })
    .output(RevenueMetricsSchema)
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
    }),

  cohorts: oc
    .route({ method: "GET", path: "/admin/metrics/cohorts" })
    .input(
      z.object({
        months: z.number().min(1).max(12).optional().default(6),
      })
    )
    .output(z.array(CohortDataSchema))
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
    }),
};

export type MetricsContract = typeof metricsContract;
