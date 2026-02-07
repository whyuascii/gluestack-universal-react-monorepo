/**
 * Admin Metrics Actions
 *
 * Business logic for admin metrics queries.
 */
import {
  db,
  user,
  subscriptions,
  userActivityDaily,
  sql,
  gte,
  lt,
  eq,
  and,
  count,
  isNull,
} from "@app/database";
import type {
  MetricsOverview,
  EngagementMetrics,
  RevenueMetrics,
  CohortData,
} from "@app/core-contract";

/**
 * Get date N days ago
 */
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Get date N months ago
 */
function monthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Format date as YYYY-MM
 */
function formatMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

/**
 * Get first day of month
 */
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export class AdminMetricsActions {
  /**
   * Get overview metrics
   */
  async getOverview(): Promise<MetricsOverview> {
    const now = new Date();
    const thirtyDaysAgo = daysAgo(30);
    const sevenDaysAgo = daysAgo(7);

    // Filter to exclude admin users from all metrics
    const isCustomerUser = isNull(user.adminRole);

    // Total users (excluding admins)
    const [totalResult] = await db.select({ count: count() }).from(user).where(isCustomerUser);
    const totalUsers = totalResult?.count ?? 0;

    // Active users in last 30 days (excluding admins)
    const [activeResult] = await db
      .select({ count: count() })
      .from(user)
      .where(and(isCustomerUser, gte(user.lastActiveAt, thirtyDaysAgo)));
    const activeUsers30d = activeResult?.count ?? 0;

    // New users in last 7 days (excluding admins)
    const [newResult] = await db
      .select({ count: count() })
      .from(user)
      .where(and(isCustomerUser, gte(user.createdAt, sevenDaysAgo)));
    const newUsers7d = newResult?.count ?? 0;

    // Churn rate (users who were active 60-30 days ago but not in last 30, excluding admins)
    const sixtyDaysAgo = daysAgo(60);
    const [previouslyActive] = await db
      .select({ count: count() })
      .from(user)
      .where(
        and(
          isCustomerUser,
          gte(user.lastActiveAt, sixtyDaysAgo),
          lt(user.lastActiveAt, thirtyDaysAgo)
        )
      );
    const churnedCount = previouslyActive?.count ?? 0;
    const churnRate =
      activeUsers30d > 0 ? (churnedCount / (activeUsers30d + churnedCount)) * 100 : 0;

    return {
      totalUsers,
      activeUsers30d,
      newUsers7d,
      churnRate: Math.round(churnRate * 100) / 100,
    };
  }

  /**
   * Get engagement metrics
   */
  async getEngagement(period: "7d" | "30d" | "90d"): Promise<EngagementMetrics> {
    const now = new Date();
    const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = daysAgo(periodDays);
    const today = formatDate(now);
    const weekAgo = formatDate(daysAgo(7));
    const monthAgo = formatDate(daysAgo(30));

    // DAU - users with activity today
    const [dauResult] = await db
      .select({
        count: sql<number>`count(distinct ${userActivityDaily.userId})`,
      })
      .from(userActivityDaily)
      .where(eq(userActivityDaily.date, today));
    const dau = dauResult?.count ?? 0;

    // WAU - users with activity in last 7 days
    const [wauResult] = await db
      .select({
        count: sql<number>`count(distinct ${userActivityDaily.userId})`,
      })
      .from(userActivityDaily)
      .where(gte(userActivityDaily.date, weekAgo));
    const wau = wauResult?.count ?? 0;

    // MAU - users with activity in last 30 days
    const [mauResult] = await db
      .select({
        count: sql<number>`count(distinct ${userActivityDaily.userId})`,
      })
      .from(userActivityDaily)
      .where(gte(userActivityDaily.date, monthAgo));
    const mau = mauResult?.count ?? 0;

    // Average session duration
    const [sessionResult] = await db
      .select({ avg: sql<number>`avg(${userActivityDaily.activeMinutes})` })
      .from(userActivityDaily)
      .where(gte(userActivityDaily.date, formatDate(startDate)));
    const avgSessionDuration = (sessionResult?.avg ?? 0) * 60; // Convert to seconds

    // Feature usage (placeholder - would aggregate from activity data)
    const featureUsage: EngagementMetrics["featureUsage"] = [];

    return {
      dau,
      wau,
      mau,
      avgSessionDuration: Math.round(avgSessionDuration),
      featureUsage,
    };
  }

  /**
   * Get revenue metrics
   */
  async getRevenue(): Promise<RevenueMetrics> {
    // Active subscriptions
    const [activeResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));
    const activeSubscriptions = activeResult?.count ?? 0;

    // MRR calculation (simplified - assumes $10/mo per sub)
    // In production, you'd sum actual subscription amounts
    const mrr = activeSubscriptions * 10;
    const arr = mrr * 12;

    // Trial conversions (placeholder - would query subscription history)
    const trialConversions = 0;

    // Revenue churn (placeholder - would calculate from churned revenue)
    const churnRateRevenue = 0;

    return {
      mrr,
      arr,
      activeSubscriptions,
      trialConversions,
      churnRateRevenue,
    };
  }

  /**
   * Get cohort retention data
   */
  async getCohorts(months: number): Promise<CohortData[]> {
    const cohorts: CohortData[] = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const cohortMonth = monthsAgo(i);
      const cohortStart = startOfMonth(cohortMonth);
      const cohortDate = formatMonth(cohortStart);

      // Users who signed up in this cohort (excluding admins)
      const [cohortUsers] = await db
        .select({ count: count() })
        .from(user)
        .where(
          and(isNull(user.adminRole), sql`to_char(${user.createdAt}, 'YYYY-MM') = ${cohortDate}`)
        );
      const totalUsers = cohortUsers?.count ?? 0;

      // Simplified retention (placeholder - would calculate actual retention)
      // In production, you'd compare against activity data
      const retention = Array.from({ length: Math.min(i + 1, 12) }, (_, week) => ({
        week,
        retained: Math.round(totalUsers * Math.pow(0.8, week)),
        percentage: Math.round(Math.pow(0.8, week) * 100),
      }));

      cohorts.push({
        cohortDate,
        totalUsers,
        retention,
      });
    }

    return cohorts;
  }
}
