"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Users, MoreVertical, Loader2 } from "lucide-react";
import { DataTable, SearchInput, StatusBadge, FlagBadge } from "@/components";
import { adminFetch } from "@/lib/api";

interface Tenant {
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
}

const columnHelper = createColumnHelper<Tenant>();

const columns = [
  columnHelper.accessor("name", {
    header: "Tenant",
    cell: (info) => (
      <div>
        <div className="font-medium text-gray-900">{info.getValue()}</div>
        <div className="text-xs text-gray-500">ID: {info.row.original.id}</div>
      </div>
    ),
  }),
  columnHelper.accessor("memberCount", {
    header: "Members",
    cell: (info) => (
      <div className="flex items-center gap-1">
        <Users className="w-4 h-4 text-gray-400" />
        <span>{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("subscriptionPlan", {
    header: "Plan",
    cell: (info) => (
      <span className="text-sm">
        {info.getValue() || <span className="text-gray-400">Free</span>}
      </span>
    ),
  }),
  columnHelper.accessor("subscriptionStatus", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("dau7", {
    header: "DAU (7d)",
    cell: (info) => <span className="text-sm text-gray-600">{info.getValue()}</span>,
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
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/tenants/${info.row.original.id}`}
          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </Link>
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

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async (search: string, pageNum: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: "20",
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await adminFetch(`/admin/tenants?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch tenants");
      }

      const data = await response.json();
      setTenants(data.tenants || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("[Tenants] Error fetching:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch tenants");
      setTenants([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants("", 1);
  }, [fetchTenants]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    fetchTenants(query, 1);
  };

  // Calculate stats from actual data
  const activeCount = tenants.filter((t) => t.subscriptionStatus === "active").length;
  const trialingCount = tenants.filter((t) => t.subscriptionStatus === "trialing").length;
  const atRiskCount = tenants.filter((t) => t.flags.includes("at_risk")).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
        <p className="text-gray-500 mt-1">
          Browse and manage customer tenants (teams, organizations)
        </p>
      </div>

      {/* Search & Filters */}
      <div className="admin-card">
        <SearchInput placeholder="Search by tenant name..." onSearch={handleSearch} />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <button
            onClick={() => fetchTenants(searchQuery, page)}
            className="ml-4 text-sm font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="admin-card text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-500">Total Tenants</p>
        </div>
        <div className="admin-card text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
        <div className="admin-card text-center">
          <p className="text-2xl font-bold text-blue-600">{trialingCount}</p>
          <p className="text-sm text-gray-500">Trialing</p>
        </div>
        <div className="admin-card text-center">
          <p className="text-2xl font-bold text-red-600">{atRiskCount}</p>
          <p className="text-sm text-gray-500">At Risk</p>
        </div>
      </div>

      {/* Results */}
      <DataTable
        data={tenants}
        columns={columns}
        isLoading={isLoading}
        pageSize={20}
        emptyMessage="No tenants found"
      />
    </div>
  );
}
