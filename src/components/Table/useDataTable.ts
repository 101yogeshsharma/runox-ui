import React, { useState, useMemo, useEffect } from "react";

export type ColumnSortState = "asc" | "desc" | false;

export interface Column<_TData> {
  id: string;
  accessorKey?: string;
  getCanSort: () => boolean;
  toggleSorting: (desc?: boolean) => void;
  getIsSorted: () => ColumnSortState;
}

export interface ColumnDef<TData> {
  accessorKey?: string;
  id?: string;
  header: string | ((props: { column: Column<TData> }) => React.ReactNode);
  cell?: (props: { row: TData; getValue: () => unknown }) => React.ReactNode;
  enableSorting?: boolean;
}

export interface TableState {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: { id: string; desc: boolean }[];
  rowSelection: Record<string, boolean>;
  globalFilter: string;
}

export interface DataTableInstance<TData> {
  getState: () => TableState;

  // Pagination
  setPageSize: (size: number) => void;
  setPageIndex: (index: number) => void;
  getPageCount: () => number;
  getCanPreviousPage: () => boolean;
  getCanNextPage: () => boolean;
  previousPage: () => void;
  nextPage: () => void;

  // Rows
  getRowModel: () => {
    rows: { id: string; original: TData; getIsSelected: () => boolean }[];
  };
  getFilteredSelectedRowModel: () => { rows: TData[] };
  getFilteredRowModel: () => { rows: TData[] };

  // Selection
  setRowSelection: (selection: Record<string, boolean>) => void;
  toggleRowSelection: (id: string) => void;

  // Filtering
  setGlobalFilter: (filter: string) => void;

  // Headers
  getHeaderGroups: () => {
    id: string;
    headers: {
      id: string;
      isPlaceholder: boolean;
      column: Column<TData>;
      getContext: () => { column: Column<TData> };
    }[];
  }[];
}

interface UseDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  getRowId?: (row: TData, index: number) => string;
  enableSorting?: boolean;
  enablePagination?: boolean;
  enableFiltering?: boolean;
}

export function useDataTable<TData>({
  data,
  columns,
  getRowId: getRowIdProp,
  enableSorting = true,
  enablePagination = true,
  enableFiltering = true,
}: UseDataTableProps<TData>): DataTableInstance<TData> {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const filteredData = useMemo(() => {
    if (!enableFiltering || !globalFilter) return data;

    const lowerFilter = globalFilter.toLowerCase();
    return data.filter((row: TData) => {
      // Check if any visible column matches the filter
      return columns.some((col) => {
        const val = col.accessorKey
          ? (row as Record<string, unknown>)[col.accessorKey]
          : undefined;
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(lowerFilter);
      });
    });
  }, [data, columns, globalFilter, enableFiltering]);

  const sortedData = useMemo(() => {
    if (!enableSorting || sorting.length === 0) return filteredData;

    return [...filteredData].sort((a: TData, b: TData) => {
      for (const sort of sorting) {
        const valA = (a as Record<string, unknown>)[sort.id];
        const valB = (b as Record<string, unknown>)[sort.id];

        if (valA === valB) continue;

        const isDesc = sort.desc;
        if (typeof valA === "number" && typeof valB === "number") {
          return isDesc ? valB - valA : valA - valB;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return isDesc ? 1 : -1;
        if (strA > strB) return isDesc ? -1 : 1;
      }
      return 0;
    });
  }, [filteredData, sorting, enableSorting]);

  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;
    const start = pageIndex * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pageIndex, pageSize, enablePagination]);

  const pageCount = enablePagination
    ? Math.max(1, Math.ceil(filteredData.length / pageSize))
    : 1;

  useEffect(() => {
    setPageIndex((currentPage) => Math.min(currentPage, pageCount - 1));
  }, [pageCount]);

  const getRowId = (original: TData, index: number) => {
    const rawId = (original as { id?: string | number }).id;
    return (
      getRowIdProp?.(original, index) ??
      (rawId !== undefined ? String(rawId) : String(data.indexOf(original)))
    );
  };

  const tableColumns = columns.map((col, index): Column<TData> => {
    const id = col.id || col.accessorKey || String(index);
    return {
      id,
      accessorKey: col.accessorKey,
      getCanSort: () => col.enableSorting !== false && !!col.accessorKey,
      toggleSorting: (desc) => {
        setSorting((prev) => {
          const isSorted = prev.find((s) => s.id === id);
          if (desc !== undefined) {
            return [{ id, desc }];
          }
          if (!isSorted) return [{ id, desc: false }];
          if (!isSorted.desc) return [{ id, desc: true }];
          return [];
        });
      },
      getIsSorted: () => {
        const isSorted = sorting.find((s) => s.id === id);
        if (!isSorted) return false;
        return isSorted.desc ? "desc" : "asc";
      },
    };
  });

  return {
    getState: () => ({
      pagination: { pageIndex, pageSize },
      sorting,
      rowSelection,
      globalFilter,
    }),
    setPageSize: (size) => {
      setPageSize(size);
      setPageIndex(0);
    },
    setPageIndex,
    getPageCount: () => pageCount,
    getCanPreviousPage: () => pageIndex > 0,
    getCanNextPage: () => pageIndex < pageCount - 1,
    previousPage: () => setPageIndex((p) => Math.max(0, p - 1)),
    nextPage: () => setPageIndex((p) => Math.min(pageCount - 1, p + 1)),

    setGlobalFilter: (filter) => {
      setGlobalFilter(filter);
      setPageIndex(0); // Reset page on filter change
    },

    setRowSelection,
    toggleRowSelection: (id) => {
      setRowSelection((prev) => {
        const next = { ...prev };
        if (next[id]) delete next[id];
        else next[id] = true;
        return next;
      });
    },
    getRowModel: () => ({
      rows: paginatedData.map((original, index) => {
        const id = getRowId(original, index);
        return {
          id,
          original,
          getIsSelected: () => !!rowSelection[id],
        };
      }),
    }),

    getFilteredSelectedRowModel: () => ({
      rows: sortedData.filter((original, index) => {
        const id = getRowId(original, index);
        return !!rowSelection[id];
      }),
    }),

    getFilteredRowModel: () => ({
      rows: sortedData,
    }),

    getHeaderGroups: () => [
      {
        id: "header-group-1",
        headers: tableColumns.map((col) => ({
          id: col.id,
          isPlaceholder: false,
          column: col,
          getContext: () => ({ column: col }),
        })),
      },
    ],
  };
}
