/**
 * TablePagination Component
 *
 * Pagination controls for TanStack Table.
 * Works on both web and mobile using @app/components.
 *
 * @example
 * ```typescript
 * const { table } = useDataTable({ data, columns, enablePagination: true });
 * return (
 *   <>
 *     <DataTable table={table} />
 *     <TablePagination table={table} />
 *   </>
 * );
 * ```
 */

import { Box, Text, Pressable } from "@app/components";
import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react-native";
import React from "react";

interface TablePaginationProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>;
  /** Available page size options */
  pageSizeOptions?: number[];
}

export function TablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50, 100],
}: TablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();

  return (
    <Box className="flex-row items-center justify-between px-4 py-3 border-t border-outline-200">
      {/* Row count info */}
      <Text className="text-sm text-content-muted">
        {table.getFilteredRowModel().rows.length} row(s)
      </Text>

      {/* Page navigation */}
      <Box className="flex-row items-center gap-1">
        {/* First page */}
        <Pressable
          onPress={() => table.setPageIndex(0)}
          disabled={!canPreviousPage}
          className={`p-2 rounded-lg ${
            canPreviousPage ? "bg-surface-sunken active:bg-surface-pressed" : "opacity-50"
          }`}
        >
          <ChevronsLeft
            size={16}
            className={canPreviousPage ? "text-content" : "text-content-muted"}
          />
        </Pressable>

        {/* Previous page */}
        <Pressable
          onPress={() => table.previousPage()}
          disabled={!canPreviousPage}
          className={`p-2 rounded-lg ${
            canPreviousPage ? "bg-surface-sunken active:bg-surface-pressed" : "opacity-50"
          }`}
        >
          <ChevronLeft
            size={16}
            className={canPreviousPage ? "text-content" : "text-content-muted"}
          />
        </Pressable>

        {/* Page indicator */}
        <Box className="px-3">
          <Text className="text-sm text-content">
            Page {pageIndex + 1} of {pageCount || 1}
          </Text>
        </Box>

        {/* Next page */}
        <Pressable
          onPress={() => table.nextPage()}
          disabled={!canNextPage}
          className={`p-2 rounded-lg ${
            canNextPage ? "bg-surface-sunken active:bg-surface-pressed" : "opacity-50"
          }`}
        >
          <ChevronRight size={16} className={canNextPage ? "text-content" : "text-content-muted"} />
        </Pressable>

        {/* Last page */}
        <Pressable
          onPress={() => table.setPageIndex(pageCount - 1)}
          disabled={!canNextPage}
          className={`p-2 rounded-lg ${
            canNextPage ? "bg-surface-sunken active:bg-surface-pressed" : "opacity-50"
          }`}
        >
          <ChevronsRight
            size={16}
            className={canNextPage ? "text-content" : "text-content-muted"}
          />
        </Pressable>
      </Box>

      {/* Page size selector */}
      <Box className="flex-row items-center gap-2">
        <Text className="text-sm text-content-muted">Rows:</Text>
        <Box className="flex-row gap-1">
          {pageSizeOptions.map((size) => (
            <Pressable
              key={size}
              onPress={() => table.setPageSize(size)}
              className={`px-2 py-1 rounded ${
                pageSize === size ? "bg-primary-500" : "bg-surface-sunken active:bg-surface-pressed"
              }`}
            >
              <Text
                className={`text-sm ${
                  pageSize === size ? "text-white font-medium" : "text-content"
                }`}
              >
                {size}
              </Text>
            </Pressable>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
