import { Box } from "../../atoms/Box";
import React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Button } from "../Button";
import { cn } from "../../utils/cn";
import { Column } from "./useDataTable";

interface DataTableColumnHeaderProps<
  TData,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData>;
  title: string;
}

export function DataTableColumnHeader<TData>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData>) {
  if (!column.getCanSort()) {
    return (
      <Box
        className={cn(
          "text-foreground/50 text-xs font-semibold tracking-wider uppercase",
          className
        )}
      >
        {title}
      </Box>
    );
  }

  return (
    <Box
      className={cn(
        "text-foreground/50 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase",
        className
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-foreground/[0.04] text-foreground/70 hover:text-foreground -ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <Box as="span">{title}</Box>
        {column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-2 h-3.5 w-3.5" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-2 h-3.5 w-3.5" />
        ) : (
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
        )}
      </Button>
    </Box>
  );
}

DataTableColumnHeader.displayName = "Table.DataTableColumnHeader";
