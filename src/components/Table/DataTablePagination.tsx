import "./DataTablePagination.css";
import { Flex } from "../../atoms/Flex";
import { Box } from "../../atoms/Box";
import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "../Dropdown/Dropdown";
import { DataTableInstance } from "./useDataTable";
import { Text } from "../../atoms/Text";
import { Pagination } from "../Pagination";

interface DataTablePaginationProps<TData> {
  table: DataTableInstance<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <Flex
      direction="col"
      align="center"
      justify="between"
      gap="md"
      className="px-2 sm:flex-row"
    >
      <Box className="text-foreground/50 flex-1 text-sm">
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </>
        ) : null}
      </Box>
      <Flex
        direction="col"
        align="center"
        gap="md"
        className="sm:flex-row lg:gap-8"
      >
        <Flex align="center" gap="sm">
          <Text
            as="p"
            variant="body"
            className="text-foreground text-sm font-medium"
          >
            Rows per page
          </Text>
          <Dropdown
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <DropdownTrigger className="rnx-pagination__select-trigger h-8" />
            <DropdownContent
              matchTriggerWidth={false}
              className="rnx-pagination__select-content"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <DropdownItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        </Flex>

        <Pagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          size="sm"
          className="mx-0 w-auto"
        />
      </Flex>
    </Flex>
  );
}

DataTablePagination.displayName = "Table.DataTablePagination";
