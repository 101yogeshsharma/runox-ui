"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../ThemeProvider/ThemeProvider";
import "./Table.css";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

const TABLE_CONTAINER_CLASS =
  "relative w-full border border-border bg-card overflow-hidden";
const TABLE_CLASS = "w-full caption-bottom text-sm rnx-table";
const TABLE_HEADER_CLASS = "rnx-table__header";
const TABLE_BODY_CLASS = "rnx-table__body";
const TABLE_FOOTER_CLASS = "rnx-table__footer";
const TABLE_ROW_CLASS = "rnx-table__row";
const TABLE_HEAD_CLASS =
  "h-12 px-4 text-left align-middle rnx-table__head has-[[role=checkbox]]:pe-0";
const TABLE_CELL_CLASS =
  "p-4 align-middle rnx-table__cell has-[[role=checkbox]]:pe-0";
const TABLE_CAPTION_CLASS = "mt-4 text-sm rnx-table__caption";

const TableComponent = forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, ...props }, ref) => {
    const { config } = useTheme();
    return (
      <Box
        className={cn(
          TABLE_CONTAINER_CLASS,
          `rounded-${config.radius}`,
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
TableComponent.displayName = "Table";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn(TABLE_HEADER_CLASS, className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(TABLE_BODY_CLASS, className)} {...props} />
));
TableBody.displayName = "TableBody";

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn(TABLE_FOOTER_CLASS, className)} {...props} />
));
TableFooter.displayName = "TableFooter";

export const TableRow = forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn(TABLE_ROW_CLASS, className)} {...props} />
));
TableRow.displayName = "TableRow";

export const TableHead = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th ref={ref} className={cn(TABLE_HEAD_CLASS, className)} {...props} />
));
TableHead.displayName = "TableHead";

export const TableCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn(TABLE_CELL_CLASS, className)} {...props} />
));
TableCell.displayName = "TableCell";

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
TableCaption.displayName = "TableCaption";

export const Table = Object.assign(TableComponent, {
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Head: TableHead,
  Row: TableRow,
  Cell: TableCell,
  Caption: TableCaption,
});
