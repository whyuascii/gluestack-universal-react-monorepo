"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Mail, MoreVertical, Loader2 } from "lucide-react";
import { DataTable, SearchInput, StatusBadge, FlagBadge } from "@/components";
import { adminFetch } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  emailVerified: boolean;
  subscriptionStatus: "active" | "trialing" | "past_due" | "canceled" | "expired" | "none";
  flags: string[];
  notesCount: number;
}

const columnHelper = createColumnHelper<User>();

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
  columnHelper.accessor("emailVerified", {
    header: "Verified",
    cell: (info) => (
      <span
        className={`w-2 h-2 rounded-full inline-block ${
          info.getValue() ? "bg-green-500" : "bg-red-500"
        }`}
        title={info.getValue() ? "Verified" : "Not verified"}
      />
    ),
  }),
  columnHelper.accessor("subscriptionStatus", {
    header: "Subscription",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("flags", {
    header: "Flags",
    cell: (info) => (
      <div className="flex gap-1 flex-wrap">
        {info.getValue().map((flag) => (
          <FlagBadge key={flag} flag={flag} />
        ))}
      </div>
    ),
  }),
  columnHelper.accessor("lastActiveAt", {
    header: "Last Active",
    cell: (info) => <span className="text-sm text-gray-500">{info.getValue() || "Never"}</span>,
  }),
  columnHelper.accessor("notesCount", {
    header: "Notes",
    cell: (info) => <span className="text-sm text-gray-500">{info.getValue()}</span>,
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/users/${info.row.original.id}`}
          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </Link>
        <button
          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
          title="Send email"
        >
          <Mail className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          title="More actions"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    ),
  }),
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"email" | "name" | "id">("email");
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchUsers = useCallback(async (query: string, type: string, pageNum: number) => {
    if (!query.trim()) {
      setUsers([]);
      setTotal(0);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        query: query.trim(),
        type,
        page: String(pageNum),
        limit: "20",
      });

      const response = await adminFetch(`/admin/users/search?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to search users");
      }

      const data = await response.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("[Users] Error searching:", err);
      setError(err instanceof Error ? err.message : "Failed to search users");
      setUsers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    fetchUsers(query, searchType, 1);
  };

  const handleTypeChange = (type: string) => {
    setSearchType(type as "email" | "name" | "id");
    if (searchQuery.trim()) {
      setPage(1);
      fetchUsers(searchQuery, type, 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">Search and manage customer users across all tenants</p>
      </div>

      {/* Search */}
      <div className="admin-card">
        <SearchInput
          placeholder="Search users..."
          onSearch={handleSearch}
          searchTypes={[
            { value: "email", label: "Email" },
            { value: "name", label: "Name" },
            { value: "id", label: "User ID" },
          ]}
          selectedType={searchType}
          onTypeChange={handleTypeChange}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {/* Results info */}
      {hasSearched && !isLoading && (
        <div className="text-sm text-gray-500">
          {total > 0 ? (
            <span>
              Found {total} user{total !== 1 ? "s" : ""} matching &quot;{searchQuery}&quot;
            </span>
          ) : (
            <span>No users found matching &quot;{searchQuery}&quot;</span>
          )}
        </div>
      )}

      {/* Results */}
      {!hasSearched ? (
        <div className="admin-card text-center py-12">
          <p className="text-gray-500">Enter a search query above to find users</p>
        </div>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          pageSize={20}
          emptyMessage="No users found"
        />
      )}
    </div>
  );
}
