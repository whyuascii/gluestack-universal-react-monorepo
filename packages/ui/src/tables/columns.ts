/**
 * Column Helpers
 *
 * Re-exports TanStack Table column utilities for convenience.
 *
 * @example
 * ```typescript
 * import { createColumnHelper } from "@app/ui/tables";
 * import type { User } from "@app/database";
 *
 * const columnHelper = createColumnHelper<User>();
 *
 * const columns = [
 *   columnHelper.accessor("name", {
 *     header: "Name",
 *     cell: (info) => info.getValue(),
 *   }),
 *   columnHelper.accessor("email", {
 *     header: "Email",
 *   }),
 *   columnHelper.display({
 *     id: "actions",
 *     header: "Actions",
 *     cell: (info) => <ActionButtons row={info.row} />,
 *   }),
 * ];
 * ```
 */

export { createColumnHelper } from "@tanstack/react-table";
export type { ColumnDef, CellContext, HeaderContext } from "@tanstack/react-table";
