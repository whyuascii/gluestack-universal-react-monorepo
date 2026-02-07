/**
 * Table Types
 *
 * Type definitions for TanStack Table integration.
 */

import type { ColumnDef, Table } from "@tanstack/react-table";

/**
 * Options for useDataTable hook
 */
export interface UseDataTableOptions<TData> {
  /** Data array to display */
  data: TData[];
  /** Column definitions */
  columns: ColumnDef<TData, unknown>[];
  /** Enable column sorting */
  enableSorting?: boolean;
  /** Enable global filtering */
  enableFiltering?: boolean;
  /** Enable pagination */
  enablePagination?: boolean;
  /** Initial page size (default: 10) */
  pageSize?: number;
  /** Enable row selection */
  enableRowSelection?: boolean;
}

/**
 * Props for DataTable component
 */
export interface DataTableProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>;
  /** Show loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional class name for table container */
  className?: string;
}

/**
 * Props for TablePagination component
 */
export interface TablePaginationProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>;
  /** Available page size options */
  pageSizeOptions?: number[];
}

/**
 * Props for sortable header
 */
export interface TableSortHeaderProps {
  /** Column can be sorted */
  canSort: boolean;
  /** Current sort direction */
  isSorted: false | "asc" | "desc";
  /** Toggle sort handler */
  onToggleSort: () => void;
  /** Header content */
  children: React.ReactNode;
}
