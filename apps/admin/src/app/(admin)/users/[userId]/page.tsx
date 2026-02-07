"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  Building2,
  CreditCard,
  Flag,
  MessageSquare,
  Shield,
  AlertTriangle,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { StatusBadge, FlagBadge, RoleBadge, Badge } from "@/components";
import { useAdminAuthStore, hasMinimumRole } from "@/stores/admin-auth";
import { adminFetch } from "@/lib/api";

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  emailVerified: boolean;
  lifecycleStage: string;
  subscriptionStatus: "active" | "trialing" | "past_due" | "canceled" | "expired" | "none";
  flags: string[];
  notesCount: number;
  tenantMemberships: {
    tenantId: string;
    tenantName: string;
    role: string;
  }[];
  activitySummary: {
    sessionsLast7Days: number;
    sessionsLast30Days: number;
    coreActionsLast7Days: number;
    lastAction: string | null;
    lastActionAt: string | null;
  };
  notes: {
    id: string;
    note: string;
    adminEmail: string;
    createdAt: string;
  }[];
}

function formatDate(dateString: string | null) {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { adminUser } = useAdminAuthStore();
  const userId = params.userId as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canEdit = hasMinimumRole(adminUser?.adminRole || null, "support_rw");

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminFetch(`/admin/users/${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch user");
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error("[UserDetail] Error fetching:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch user");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <h2 className="font-semibold">{error || "User not found"}</h2>
          <button
            onClick={fetchUser}
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
          <h1 className="text-2xl font-bold text-gray-900">{user.name || user.email}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Add Flag
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
                Impersonate
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="admin-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {user.emailVerified ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verification</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.emailVerified ? "Verified" : "Not Verified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Active</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(user.lastActiveAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Memberships */}
          <div className="admin-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Building2 className="w-5 h-5 inline mr-2" />
              Tenant Memberships
            </h2>
            <div className="space-y-3">
              {user.tenantMemberships.map((membership) => (
                <Link
                  key={membership.tenantId}
                  href={`/tenants/${membership.tenantId}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{membership.tenantName}</p>
                    <p className="text-sm text-gray-500">ID: {membership.tenantId}</p>
                  </div>
                  <RoleBadge role={membership.role as "owner" | "admin" | "member"} />
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="admin-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {user.activitySummary.sessionsLast7Days}
                </p>
                <p className="text-sm text-gray-500">Sessions (7d)</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {user.activitySummary.sessionsLast30Days}
                </p>
                <p className="text-sm text-gray-500">Sessions (30d)</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {user.activitySummary.coreActionsLast7Days}
                </p>
                <p className="text-sm text-gray-500">Actions (7d)</p>
              </div>
            </div>
            {user.activitySummary.lastAction && (
              <div className="mt-4 text-sm text-gray-500">
                Last action: <span className="font-medium">{user.activitySummary.lastAction}</span>{" "}
                at {formatDate(user.activitySummary.lastActionAt)}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                <MessageSquare className="w-5 h-5 inline mr-2" />
                Support Notes ({user.notes.length})
              </h2>
              {canEdit && (
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Add Note
                </button>
              )}
            </div>
            <div className="space-y-4">
              {user.notes.map((note) => (
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

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="admin-card">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subscription</span>
                <StatusBadge status={user.subscriptionStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lifecycle</span>
                <Badge>{user.lifecycleStage}</Badge>
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
            {user.flags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.flags.map((flag) => (
                  <FlagBadge key={flag} flag={flag} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No flags</p>
            )}
          </div>

          {/* Subscription */}
          <div className="admin-card">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Subscription Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan</span>
                <span className="text-gray-900 font-medium">Pro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <StatusBadge status={user.subscriptionStatus} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Provider</span>
                <span className="text-gray-900">RevenueCat</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="admin-card">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {!user.emailVerified && canEdit && (
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Resend Verification
                </button>
              )}
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                <Shield className="w-4 h-4" />
                View Audit Log
              </button>
              {canEdit && (
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Suspend User
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
