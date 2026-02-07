"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Calendar,
  CreditCard,
  Flag,
  MessageSquare,
  Activity,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { StatusBadge, FlagBadge, RoleBadge, Badge } from "@/components";
import { useAdminAuthStore, hasMinimumRole } from "@/stores/admin-auth";
import { adminFetch } from "@/lib/api";

interface TenantDetail {
  id: string;
  name: string;
  createdAt: string;
  memberCount: number;
  subscriptionPlan: string | null;
  subscriptionStatus: "active" | "trialing" | "past_due" | "canceled" | "expired" | "none";
  dau7: number;
  dau30: number;
  flags: string[];
  notesCount: number;
  members: {
    userId: string;
    email: string;
    name: string | null;
    role: string;
    joinedAt: string;
  }[];
  recentActivity: { date: string; activeUsers: number; actions: number }[];
  notes: {
    id: string;
    note: string;
    adminEmail: string;
    createdAt: string;
  }[];
}

function formatDate(dateString: string | Date | null) {
  if (!dateString) return "Never";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { adminUser } = useAdminAuthStore();
  const tenantId = params.tenantId as string;

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canEdit = hasMinimumRole(adminUser?.adminRole || null, "support_rw");

  const fetchTenant = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminFetch(`/admin/tenants/${tenantId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Tenant not found");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch tenant");
      }

      const data = await response.json();
      setTenant(data);
    } catch (err) {
      console.error("[TenantDetail] Error fetching:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch tenant");
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <h2 className="font-semibold">{error || "Tenant not found"}</h2>
          <button
            onClick={fetchTenant}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-gray-500">Tenant ID: {tenantId}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Add Flag
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="admin-card text-center">
              <Users className="w-5 h-5 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{tenant.memberCount}</p>
              <p className="text-xs text-gray-500">Members</p>
            </div>
            <div className="admin-card text-center">
              <Activity className="w-5 h-5 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{tenant.dau7}</p>
              <p className="text-xs text-gray-500">Active (7d)</p>
            </div>
            <div className="admin-card text-center">
              <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{tenant.dau30}</p>
              <p className="text-xs text-gray-500">Active (30d)</p>
            </div>
            <div className="admin-card text-center">
              <Calendar className="w-5 h-5 text-purple-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">{formatDate(tenant.createdAt)}</p>
              <p className="text-xs text-gray-500">Created</p>
            </div>
          </div>

          {/* Members */}
          <div className="admin-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Users className="w-5 h-5 inline mr-2" />
              Members ({tenant.members.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tenant.members.map((member) => (
                    <tr key={member.userId}>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </td>
                      <td>
                        <RoleBadge role={member.role as "owner" | "admin" | "member"} />
                      </td>
                      <td className="text-sm text-gray-500">{formatDate(member.joinedAt)}</td>
                      <td>
                        <Link
                          href={`/users/${member.userId}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                <MessageSquare className="w-5 h-5 inline mr-2" />
                Support Notes ({tenant.notes.length})
              </h2>
              {canEdit && (
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Add Note
                </button>
              )}
            </div>
            <div className="space-y-4">
              {tenant.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-200"
                >
                  <p className="text-sm text-gray-900">{note.note}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{note.adminEmail}</span>
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status */}
          <div className="admin-card">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subscription</span>
                <StatusBadge status={tenant.subscriptionStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Plan</span>
                <Badge>{tenant.subscriptionPlan || "Free"}</Badge>
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">
                <Flag className="w-4 h-4 inline mr-1" />
                Flags
              </h3>
            </div>
            {tenant.flags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tenant.flags.map((flag) => (
                  <FlagBadge key={flag} flag={flag} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No flags</p>
            )}
          </div>

          {/* Subscription Details */}
          <div className="admin-card">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Subscription Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan</span>
                <span className="text-gray-900 font-medium">
                  {tenant.subscriptionPlan || "Free"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <StatusBadge status={tenant.subscriptionStatus} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Provider</span>
                <span className="text-gray-900">RevenueCat</span>
              </div>
            </div>
            <button className="mt-4 w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
              View Subscription History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
