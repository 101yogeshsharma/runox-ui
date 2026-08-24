import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDataTable } from "./useDataTable";

const columns = [{ accessorKey: "name", header: "Name" }] as const;

describe("useDataTable", () => {
  it("clamps the current page when data shrinks", async () => {
    const initialData = Array.from({ length: 25 }, (_, index) => ({
      name: `Row ${index}`,
    }));
    const { result, rerender } = renderHook(
      ({ data }) => useDataTable({ data, columns: [...columns] }),
      { initialProps: { data: initialData } },
    );

    act(() => result.current.setPageIndex(2));
    expect(result.current.getState().pagination.pageIndex).toBe(2);

    rerender({ data: initialData.slice(0, 5) });
    await waitFor(() => {
      expect(result.current.getState().pagination.pageIndex).toBe(0);
    });
  });

  it("uses caller-provided stable row IDs", () => {
    const data = [{ key: "first", name: "First" }];
    const { result } = renderHook(() =>
      useDataTable({
        data,
        columns: [...columns],
        getRowId: (row) => row.key,
      }),
    );

    expect(result.current.getRowModel().rows[0].id).toBe("first");
  });

  it("filters, sorts, and tracks selected rows", () => {
    const data = [
      { key: "a", name: "Beta" },
      { key: "b", name: "Alpha" },
    ];
    const { result } = renderHook(() =>
      useDataTable({
        data,
        columns: [...columns],
        getRowId: (row) => row.key,
      }),
    );

    act(() => {
      result.current.getHeaderGroups()[0].headers[0].column.toggleSorting();
      result.current.setGlobalFilter("alpha");
    });

    expect(result.current.getFilteredRowModel().rows).toEqual([data[1]]);
    act(() => result.current.toggleRowSelection("b"));
    expect(result.current.getFilteredSelectedRowModel().rows).toEqual([
      data[1],
    ]);
  });

  it("supports pagination navigation and descending sorting", () => {
    const data = Array.from({ length: 21 }, (_, index) => ({
      key: String(index),
      name: `Row ${index}`,
    }));
    const { result } = renderHook(() =>
      useDataTable({
        data,
        columns: [...columns],
        getRowId: (row) => row.key,
      }),
    );

    act(() => result.current.nextPage());
    expect(result.current.getState().pagination.pageIndex).toBe(1);
    act(() => result.current.previousPage());
    expect(result.current.getState().pagination.pageIndex).toBe(0);

    const column = result.current.getHeaderGroups()[0].headers[0].column;
    act(() => {
      column.toggleSorting();
      column.toggleSorting();
    });
    expect(result.current.getState().sorting[0].desc).toBe(true);
  });

  it("can disable filtering and pagination", () => {
    const data = [{ name: "Alpha" }, { name: "Beta" }];
    const { result } = renderHook(() =>
      useDataTable({
        data,
        columns: [...columns],
        enableFiltering: false,
        enablePagination: false,
      }),
    );

    act(() => result.current.setGlobalFilter("missing"));
    expect(result.current.getFilteredRowModel().rows).toEqual(data);
    expect(result.current.getPageCount()).toBe(1);
    expect(result.current.getCanNextPage()).toBe(false);
  });

  it("sorts numeric columns numerically and skips null values when filtering", () => {
    const data = [
      { key: "a", name: "Beta", score: 30 },
      { key: "b", name: "Alpha", score: 100 },
      { key: "c", name: "Gamma", score: 5 },
    ];
    const numericColumns = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "score", header: "Score" },
    ];
    const { result } = renderHook(() =>
      useDataTable({
        data,
        columns: numericColumns,
        getRowId: (row) => row.key,
      }),
    );

    const scoreColumn = result.current
      .getHeaderGroups()[0]
      .headers.find((header) => header.id === "score")!.column;
    act(() => scoreColumn.toggleSorting(true));

    expect(
      result.current.getFilteredRowModel().rows.map((row) => row.score),
    ).toEqual([100, 30, 5]);

    act(() => result.current.setGlobalFilter("al"));
    expect(
      result.current.getFilteredRowModel().rows.map((row) => row.key),
    ).toEqual(["b"]);

    act(() => result.current.setGlobalFilter("100"));
    expect(
      result.current.getFilteredRowModel().rows.map((row) => row.key),
    ).toEqual(["b"]);
  });

  it("falls back to index-based identity and clears sorting", () => {
    const data = [{ name: "Alpha" }, { name: "Beta" }];
    const { result } = renderHook(() =>
      useDataTable({ data, columns: [...columns] }),
    );

    const rows = result.current.getRowModel().rows;
    expect(rows.map((row) => row.id)).toEqual(["0", "1"]);

    const column = result.current.getHeaderGroups()[0].headers[0].column;
    act(() => {
      column.toggleSorting();
      column.toggleSorting();
      column.toggleSorting();
    });
    expect(result.current.getState().sorting).toEqual([]);
  });
});
