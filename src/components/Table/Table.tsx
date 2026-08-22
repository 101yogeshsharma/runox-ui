import { Box } from "../../atoms/Box";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";
import "./Table.css";

/**
 * Responsive tabular layout primitives. Use to structure read-only data grids in standard rows and columns.
 */
export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
  variant?: "default" | "striped" | "glass" | "ghost";
  size?: "sm" | "md" | "lg";
}

const TABLE_CONTAINER_CLASS =
  "rnx-table-container relative w-full overflow-hidden";
const TABLE_CLASS = "w-full caption-bottom text-sm rnx-table";
const TABLE_HEADER_CLASS = "rnx-table__header";
const TABLE_BODY_CLASS = "rnx-table__body";
const TABLE_FOOTER_CLASS = "rnx-table__footer";
const TABLE_ROW_CLASS = "rnx-table__row";
const TABLE_HEAD_CLASS =
  "px-4 text-left align-middle rnx-table__head has-[[role=checkbox]]:pe-0";
const TABLE_CELL_CLASS =
  "px-4 py-3 align-middle rnx-table__cell has-[[role=checkbox]]:pe-0";
const TABLE_CAPTION_CLASS = "mt-4 text-sm rnx-table__caption";

const TableComponentBase = forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, variant = "default", size = "md", ...props }, ref) => {
    return (
      <Box
        {...rnx({ component: 'Table' })}
        className={cn(
          TABLE_CONTAINER_CLASS,
          variant && variant !== "default" && `rnx-table--variant-${variant}`,
          size && `rnx-table--size-${size}`,
          containerClassName
        )}
      >
        <Box className="w-full overflow-auto">
          <table ref={ref} className={cn(TABLE_CLASS, className)} {...props} />
        </Box>
      </Box>
    );
  }
);
TableComponentBase.displayName = "Table";
const TableComponent = withLoading(TableComponentBase);

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn(TABLE_HEADER_CLASS, className)} {...props} />
));
TableHeader.displayName = "Table.Header";

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(TABLE_BODY_CLASS, className)} {...props} />
));
TableBody.displayName = "Table.Body";

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn(TABLE_FOOTER_CLASS, className)} {...props} />
));
TableFooter.displayName = "Table.Footer";

export const TableRow = forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn(TABLE_ROW_CLASS, className)} {...props} />
));
TableRow.displayName = "Table.Row";

export const TableHead = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th ref={ref} className={cn(TABLE_HEAD_CLASS, className)} {...props} />
));
TableHead.displayName = "Table.Head";

export const TableCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn(TABLE_CELL_CLASS, className)} {...props} />
));
TableCell.displayName = "Table.Cell";

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(TABLE_CAPTION_CLASS, className)}
    {...props}
  />
));
TableCaption.displayName = "Table.Caption";

export const Table = Object.assign(TableComponent, {
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Head: TableHead,
  Row: TableRow,
  Cell: TableCell,
  Caption: TableCaption,
});
