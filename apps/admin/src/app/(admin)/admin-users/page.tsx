"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Plus, MoreVertical, Mail, UserX, Shield } from "lucide-react";
import { DataTable, RoleBadge, StatusBadge } from "@/components";
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

const columnHelper = createColumnHelper<AdminUser>();

export default function AdminUsersPage() {
  const { adminUser } = useAdminAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = hasMinimumRole(adminUser?.adminRole || null, "super_admin");

  const fetchUsers = useCallback(async () => {
    if (!isSuperAdmin) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/rpc/admin/identity/users?page=${page}&limit=20`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin users");
      }

      const data = await response.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [page, isSuperAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleResendInvite = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/rpc/admin/identity/users/${userId}/resend-invite`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to resend invite");
      }

      alert("Invite resent successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to resend invite");
    }
  };

  const handleSuspend = async (userId: string, currentStatus: string) => {
    const reason = prompt(
      `Enter reason for ${currentStatus === "suspended" ? "activating" : "suspending"} this user (min 10 characters):`
    );
    if (!reason || reason.length < 10) {
      alert("Reason must be at least 10 characters");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/rpc/admin/identity/users/${userId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUserId: userId,
          status: currentStatus === "suspended" ? "active" : "suspended",
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const columns = [
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => (
        <div>
          <div className="font-medium text-gray-900">{info.getValue()}</div>
          {info.row.original.name && (
            <div className="text-sm text-gray-500">{info.row.original.name}</div>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("roles", {
      header: "Role",
      cell: (info) => (
        <div className="flex gap-1 flex-wrap">
          {info.getValue().map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </div>
      ),
    }),
    columnHelper.accessor("lastLoginAt", {
      header: "Last Login",
      cell: (info) => (
        <span className="text-sm text-gray-500">
          {info.getValue() ? new Date(info.getValue() as string).toLocaleDateString() : "Never"}
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => (
        <span className="text-sm text-gray-500">
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const user = info.row.original;
        const isPending = user.status === "pending";
        const isSuspended = user.status === "suspended";
        const isSelf = user.id === adminUser?.id;

        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/admin-users/${user.id}`}
              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {isPending && (
              <button
                onClick={() => handleResendInvite(user.id)}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                title="Resend invite"
              >
                <Mail className="w-4 h-4" />
              </button>
            )}
            {!isSelf && (
              <button
                onClick={() => handleSuspend(user.id, user.status)}
                className={`p-1.5 rounded ${
                  isSuspended
                    ? "text-green-400 hover:text-green-600 hover:bg-green-50"
                    : "text-red-400 hover:text-red-600 hover:bg-red-50"
                }`}
                title={isSuspended ? "Activate user" : "Suspend user"}
              >
                {isSuspended ? <Shield className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
              </button>
            )}
          </div>
        );
      },
    }),
  ];

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Shield className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
        <p className="text-gray-500 mt-2">Only Super Admins can manage admin users</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-gray-500 mt-1">Manage admin portal users and their roles</p>
        </div>
        <Link
          href="/admin-users/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Admin User
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card">
          <div className="text-sm text-gray-500">Total Admins</div>
          <div className="text-2xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="admin-card">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.status === "active").length}
          </div>
        </div>
        <div className="admin-card">
          <div className="text-sm text-gray-500">Pending Invite</div>
          <div className="text-2xl font-bold text-yellow-600">
            {users.filter((u) => u.status === "pending").length}
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        pageSize={20}
        emptyMessage="No admin users found"
      />
    </div>
  );
}
