/**
 * Tables Module
 *
 * TanStack Table integration with @app/components.
 * Provides headless table functionality for both web and mobile.
 *
 * @example
 * ```typescript
 * import { createColumnHelper, useDataTable, DataTable, TablePagination } from "@app/ui/tables";
 * import type { User } from "@app/database";
 *
 * const columnHelper = createColumnHelper<User>();
 * const columns = [
 *   columnHelper.accessor("name", { header: "Name" }),
 *   columnHelper.accessor("email", { header: "Email" }),
 *   columnHelper.accessor("createdAt", {
 *     header: "Joined",
 *     cell: (info) => new Date(info.getValue()).toLocaleDateString(),
 *   }),
 * ];
 *
 * function UsersTable({ users }: { users: User[] }) {
 *   const { table } = useDataTable({
 *     data: users,
 *     columns,
 *     enableSorting: true,
 *     enablePagination: true,
 *   });
 *
 *   return (
 *     <>
 *       <DataTable table={table} />
 *       <TablePagination table={table} />
 *     </>
 *   );
 * }
 * ```
 */

// Components
export { DataTable } from "./DataTable";
export { TablePagination } from "./TablePagination";

// Hooks
export { useDataTable } from "./useDataTable";

// Column helpers
export { createColumnHelper } from "./columns";
export type { ColumnDef, CellContext, HeaderContext } from "./columns";

// Types
export type {
  UseDataTableOptions,
  DataTableProps,
  TablePaginationProps,
  TableSortHeaderProps,
} from "./types";
