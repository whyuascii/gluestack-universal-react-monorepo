"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Mail, Calendar, Clock, AlertCircle, Check } from "lucide-react";
import { RoleBadge, StatusBadge } from "@/components";
import { useAdminAuthStore, hasMinimumRole } from "@/stores/admin-auth";
import { API_URL } from "@/lib/api";

type AdminRole = "read_only" | "support_rw" | "super_admin";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  company: string;
  status: "active" | "suspended" | "pending";
  roles: AdminRole[];
  createdAt: string;
  lastLoginAt: string | null;
  avatarUrl: string | null;
}

const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: "read_only", label: "Read Only" },
  { value: "support_rw", label: "Support" },
  { value: "super_admin", label: "Super Admin" },
];

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.userId as string;
  const { adminUser: currentAdmin } = useAdminAuthStore();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const isSuperAdmin = hasMinimumRole(currentAdmin?.adminRole || null, "super_admin");
  const isSelf = currentAdmin?.id === userId;

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/rpc/admin/identity/users/${userId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin user");
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUser();
    }
  }, [fetchUser, isSuperAdmin]);

  const handleRoleChange = async (newRole: AdminRole) => {
    const reason = prompt("Enter reason for role change (min 10 characters):");
    if (!reason || reason.length < 10) {
      alert("Reason must be at least 10 characters");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/rpc/admin/identity/users/${userId}/roles`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUserId: userId,
          roles: [newRole],
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!user) return;

    const newStatus = user.status === "suspended" ? "active" : "suspended";
    const reason = prompt(
      `Enter reason for ${newStatus === "suspended" ? "suspending" : "activating"} this user (min 10 characters):`
    );
    if (!reason || reason.length < 10) {
      alert("Reason must be at least 10 characters");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/rpc/admin/identity/users/${userId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUserId: userId,
          status: newStatus,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendInvite = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/rpc/admin/identity/users/${userId}/resend-invite`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to resend invite");
      }

      alert("Invitation email resent successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to resend invite");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Shield className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
        <p className="text-gray-500 mt-2">Only Super Admins can view admin user details</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-16 h-16 text-red-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Error</h2>
        <p className="text-gray-500 mt-2">{error || "User not found"}</p>
        <Link href="/admin-users" className="mt-4 text-primary-600 hover:underline">
          Back to Admin Users
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Link */}
      <Link
        href="/admin-users"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Users
      </Link>

      {/* User Header */}
      <div className="admin-card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-primary-600">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.name || user.email.split("@")[0]}
              </h1>
              <StatusBadge status={user.status} />
            </div>
            <p className="text-gray-500 mt-1">{user.email}</p>
            <div className="flex gap-2 mt-3">
              {user.roles.map((role) => (
                <RoleBadge key={role} role={role} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="admin-card">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Mail className="w-4 h-4" />
            Email
          </div>
          <div className="font-medium text-gray-900">{user.email}</div>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Created
          </div>
          <div className="font-medium text-gray-900">
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Clock className="w-4 h-4" />
            Last Login
          </div>
          <div className="font-medium text-gray-900">
            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Shield className="w-4 h-4" />
            Company
          </div>
          <div className="font-medium text-gray-900">{user.company}</div>
        </div>
      </div>

      {/* Actions */}
      {!isSelf && (
        <div className="space-y-6">
          {/* Role Change */}
          <div className="admin-card">
            <h3 className="font-semibold text-gray-900 mb-4">Change Role</h3>
            <div className="flex gap-2 flex-wrap">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleRoleChange(option.value)}
                  disabled={isUpdating || user.roles.includes(option.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    user.roles.includes(option.value)
                      ? "bg-primary-100 text-primary-700 cursor-default"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } disabled:opacity-50`}
                >
                  {user.roles.includes(option.value) && <Check className="w-4 h-4 inline mr-1" />}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Actions */}
          <div className="admin-card">
            <h3 className="font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="flex gap-3 flex-wrap">
              {user.status === "pending" && (
                <button
                  onClick={handleResendInvite}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Resend Invitation
                </button>
              )}
              <button
                onClick={handleStatusToggle}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  user.status === "suspended"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {user.status === "suspended" ? "Activate Account" : "Suspend Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSelf && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-700">
            You cannot modify your own account from this page. Contact another Super Admin for
            changes.
          </p>
        </div>
      )}
    </div>
  );
}
