"use client";
import { Box } from "../../atoms/Box";
import React, { useMemo } from "react";
import { Table } from "./Table";
import { DataTablePagination } from "./DataTablePagination";
import { cn } from "../../utils/cn";
import { useDataTable, ColumnDef } from "./useDataTable";
import { Input } from "../Input";
import "./Table.css";

// Custom flexRender to replace TanStack's flexRender
export function flexRender(
  Comp:
    | React.ComponentType<any>
    | React.ReactNode
    | string
    | number
    | undefined
    | null,
  props: Record<string, unknown>,
) {
  if (typeof Comp === "function") {
    return <Comp {...props} />;
  }
  return Comp;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  getRowId?: (row: TData, index: number) => string;
  enableSorting?: boolean;
  enablePagination?: boolean;
  enableFiltering?: boolean;
  density?: "compact" | "normal" | "comfortable";
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  enableSorting = true,
  enablePagination = true,
  enableFiltering = false,
  density = "normal",
  className,
}: DataTableProps<TData>) {
  const table = useDataTable({
    data,
    columns,
    getRowId,
    enableSorting,
    enablePagination,
    enableFiltering,
  });

  const densityClasses = useMemo(
    () => ({
      compact: "py-1.5",
      normal: "py-3",
      comfortable: "py-5",
    }),
    [],
  );

  const columnsById = useMemo(
    () =>
      new Map(
        columns.map((column, index) => [
          column.id || column.accessorKey || String(index),
          column,
        ]),
      ),
    [columns],
  );

  const getCellContent = (row: TData, col: ColumnDef<TData>) => {
    if (col.cell) {
      return col.cell({
        row,
        getValue: () =>
          col.accessorKey
            ? (row as Record<string, unknown>)[col.accessorKey]
            : undefined,
      });
    }
    if (col.accessorKey) {
      return (row as Record<string, unknown>)[
        col.accessorKey
      ] as React.ReactNode;
    }
    return null;
  };

  return (
    <Box className={cn("space-y-4", className)}>
      {enableFiltering && (
        <Box className="flex items-center justify-between">
          <Input
            className="max-w-sm"
            placeholder="Search all columns..."
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
          />
        </Box>
      )}
      <Table>
        <Table.Header className="rnx-data-table__header">
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row
              key={headerGroup.id}
              className="rnx-data-table__header-row"
            >
              {headerGroup.headers.map((header) => {
                const columnDef = columnsById.get(header.id);
                if (!columnDef) return null;
                return (
                  <Table.Head
                    key={header.id}
                    className={densityClasses[density]}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(columnDef.header, header.getContext())}
                  </Table.Head>
                );
              })}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Table.Row
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="rnx-data-table__row"
              >
                {table.getHeaderGroups()[0]?.headers.map((header) => {
                  const columnDef = columnsById.get(header.id);
                  // Skip cells for columns that can't be resolved (e.g. display-only columns)
                  if (!columnDef) return null;
                  return (
                    <Table.Cell
                      key={header.id}
                      className={densityClasses[density]}
                    >
                      {getCellContent(row.original, columnDef)}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell
                colSpan={columns.length}
                className="rnx-data-table__empty-cell h-24 text-center"
              >
                No results.
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      {enablePagination && <DataTablePagination table={table} />}
    </Box>
  );
}

DataTable.displayName = "Table.DataTable";
