/**
 * DataTable Component
 *
 * Renders TanStack Table using @app/components primitives.
 * Works on both web and mobile.
 *
 * @example
 * ```typescript
 * const { table } = useDataTable({ data, columns });
 * return <DataTable table={table} />;
 * ```
 */

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableData,
  Box,
  Text,
  Spinner,
  Pressable,
  EmptyState,
} from "@app/components";
import { Inbox } from "lucide-react-native";
import { flexRender, type Table as TableType } from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react-native";
import React from "react";

interface DataTableProps<TData> {
  /** TanStack Table instance */
  table: TableType<TData>;
  /** Show loading state */
  isLoading?: boolean;
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Action text for empty state */
  emptyActionText?: string;
  /** Action callback for empty state */
  onEmptyAction?: () => void;
}

export function DataTable<TData>({
  table,
  isLoading = false,
  emptyTitle = "No data available",
  emptyMessage,
  emptyActionText,
  onEmptyAction,
}: DataTableProps<TData>) {
  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center py-12">
        <Spinner size="large" />
        <Text className="mt-4 text-content-muted">Loading...</Text>
      </Box>
    );
  }

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={emptyTitle}
        message={emptyMessage}
        actionText={emptyActionText}
        onAction={onEmptyAction}
        compact
      />
    );
  }

  return (
    <Box className="rounded-xl border border-outline-200 overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();

                return (
                  <TableHead key={header.id} useRNView className="bg-surface-sunken px-4 py-3">
                    {header.isPlaceholder ? null : canSort ? (
                      <Pressable
                        onPress={header.column.getToggleSortingHandler()}
                        className="flex-row items-center"
                      >
                        <Text className="font-semibold text-content-emphasis">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </Text>
                        <Box className="ml-1">
                          {sortDirection === "asc" ? (
                            <ChevronUp size={14} className="text-primary-500" />
                          ) : sortDirection === "desc" ? (
                            <ChevronDown size={14} className="text-primary-500" />
                          ) : (
                            <ChevronsUpDown size={14} className="text-content-muted" />
                          )}
                        </Box>
                      </Pressable>
                    ) : (
                      <Text className="font-semibold text-content-emphasis">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Text>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="border-b border-outline-100">
              {row.getVisibleCells().map((cell) => (
                <TableData key={cell.id} useRNView className="px-4 py-3">
                  <Text className="text-content">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Text>
                </TableData>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
