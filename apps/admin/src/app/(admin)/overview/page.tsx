"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  UserPlus,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { adminFetch } from "@/lib/api";

interface MetricsOverview {
  totalUsers: number;
  activeUsers30d: number;
  newUsers7d: number;
  churnRate: number;
}

interface RevenueMetrics {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  trialConversions: number;
  churnRateRevenue: number;
}

interface StatCard {
  name: string;
  value: string;
  change?: string;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsOverview | null>(null);
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch both metrics and revenue in parallel
      const [metricsRes, revenueRes] = await Promise.all([
        adminFetch("/admin/metrics/overview"),
        adminFetch("/admin/metrics/revenue"),
      ]);

      if (!metricsRes.ok) {
        throw new Error("Failed to fetch metrics");
      }
      if (!revenueRes.ok) {
        throw new Error("Failed to fetch revenue");
      }

      const metricsData = await metricsRes.json();
      const revenueData = await revenueRes.json();

      setMetrics(metricsData);
      setRevenue(revenueData);
    } catch (err) {
      console.error("[Dashboard] Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build stats from API data
  const stats: StatCard[] =
    metrics && revenue
      ? [
          {
            name: "Total Users",
            value: metrics.totalUsers.toLocaleString(),
            trend: "up",
            icon: Users,
          },
          {
            name: "Active Users (30d)",
            value: metrics.activeUsers30d.toLocaleString(),
            trend: "up",
            icon: Activity,
          },
          {
            name: "New Users (7d)",
            value: metrics.newUsers7d.toLocaleString(),
            trend: metrics.newUsers7d > 0 ? "up" : "neutral",
            icon: UserPlus,
          },
          {
            name: "Churn Rate",
            value: `${metrics.churnRate.toFixed(1)}%`,
            trend: metrics.churnRate > 5 ? "down" : "up",
            icon: TrendingDown,
          },
          {
            name: "Active Subscriptions",
            value: revenue.activeSubscriptions.toLocaleString(),
            trend: "up",
            icon: Building2,
          },
          {
            name: "MRR",
            value: `$${revenue.mrr.toLocaleString()}`,
            trend: "up",
            icon: DollarSign,
          },
        ]
      : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <h2 className="font-semibold">Error loading dashboard</h2>
        <p className="mt-1">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your platform metrics and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="admin-card">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary-50 rounded-lg">
                <stat.icon className="w-5 h-5 text-primary-600" />
              </div>
              <span
                className={`flex items-center text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/users"
            className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5 text-primary-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Search Users</p>
            <p className="text-xs text-gray-500">Find and manage users</p>
          </Link>
          <Link
            href="/tenants"
            className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Building2 className="w-5 h-5 text-primary-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Browse Tenants</p>
            <p className="text-xs text-gray-500">View tenant details</p>
          </Link>
          <Link
            href="/admin-users"
            className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Activity className="w-5 h-5 text-primary-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Admin Users</p>
            <p className="text-xs text-gray-500">Manage admins</p>
          </Link>
          <div className="p-4 text-left bg-gray-50 rounded-lg transition-colors opacity-50 cursor-not-allowed">
            <AlertTriangle className="w-5 h-5 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-900">Manage Flags</p>
            <p className="text-xs text-gray-500">Coming soon</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Summary */}
        {revenue && (
          <div className="admin-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Monthly Recurring Revenue</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${revenue.mrr.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Annual Recurring Revenue</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${revenue.arr.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Active Subscriptions</span>
                <span className="text-sm font-semibold text-gray-900">
                  {revenue.activeSubscriptions}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Revenue Churn Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {revenue.churnRateRevenue.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User Summary */}
        {metrics && (
          <div className="admin-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.totalUsers.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Active (30 days)</span>
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.activeUsers30d.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">New Users (7 days)</span>
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.newUsers7d.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Churn Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.churnRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
