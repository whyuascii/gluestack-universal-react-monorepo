/**
 * useDataTable Hook
 *
 * TanStack Table wrapper with common features pre-configured.
 *
 * @example
 * ```typescript
 * import type { Todo } from "@app/database";
 * import { useDataTable, createColumnHelper } from "@app/ui/tables";
 *
 * const columnHelper = createColumnHelper<Todo>();
 * const columns = [
 *   columnHelper.accessor("title", { header: "Title" }),
 *   columnHelper.accessor("completed", {
 *     header: "Status",
 *     cell: (info) => info.getValue() ? "Done" : "Pending",
 *   }),
 * ];
 *
 * function TodoTable({ todos }: { todos: Todo[] }) {
 *   const table = useDataTable({
 *     data: todos,
 *     columns,
 *     enableSorting: true,
 *     enablePagination: true,
 *   });
 *
 *   return <DataTable table={table} />;
 * }
 * ```
 */

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useState } from "react";
import type { UseDataTableOptions } from "./types";

export function useDataTable<TData>({
  data,
  columns,
  enableSorting = false,
  enableFiltering = false,
  enablePagination = false,
  enableRowSelection = false,
  pageSize = 10,
}: UseDataTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnFilters: enableFiltering ? columnFilters : undefined,
      globalFilter: enableFiltering ? globalFilter : undefined,
      rowSelection: enableRowSelection ? rowSelection : undefined,
    },
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnFiltersChange: enableFiltering ? setColumnFilters : undefined,
    onGlobalFilterChange: enableFiltering ? setGlobalFilter : undefined,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return {
    table,
    globalFilter,
    setGlobalFilter,
  };
}
