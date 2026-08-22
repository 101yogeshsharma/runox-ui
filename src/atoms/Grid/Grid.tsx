import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { ResponsiveProp, gapMap, generateResponsiveVars } from "../utils";
import { withLoading } from "../../utils/withLoading";


/**
 * Props for the Grid component.
 */
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  cols?: ResponsiveProp<number>;
  rows?: ResponsiveProp<number>;
  gap?: ResponsiveProp<"none" | "xs" | "sm" | "md" | "lg" | "xl">;
  p?: ResponsiveProp<"none" | "xs" | "sm" | "md" | "lg" | "xl">;
  flow?: "row" | "col" | "row-dense" | "col-dense";
  autoFit?: boolean;
  minColWidth?: string;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  as?: React.ElementType;
}

const justifyMap: Record<string, string> = {
  start: "start",
  center: "center",
  end: "end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

const flowMap: Record<string, string> = {
  row: "row",
  col: "column",
  "row-dense": "row dense",
  "col-dense": "column dense",
};

const GridBase = forwardRef<HTMLElement, GridProps>(
  (
    {
      children,
      cols = 1,
      rows,
      gap = "md",
      p,
      flow,
      autoFit = false,
      minColWidth = "250px",
      align,
      justify,
      style,
      className,
      as: Component = "div",
      ...props
    },
    ref
  ) => {
    const formatCols = (val: number) =>
      typeof val === "number" ? `repeat(${val}, minmax(0, 1fr))` : String(val);

    const colVars = generateResponsiveVars("rnx-grid-cols", cols, formatCols);
    const rowVars = generateResponsiveVars("rnx-grid-rows", rows, formatCols);
    const gapVars = generateResponsiveVars(
      "rnx-grid-gap",
      gap,
      (val) => gapMap[val] || val
    );
    const pVars = generateResponsiveVars(
      "rnx-grid-p",
      p,
      (val) => gapMap[val] || val
    );

    const baseGridTemplateColumns = autoFit
      ? `repeat(auto-fit, minmax(${minColWidth}, 1fr))`
      : `var(--rnx-grid-cols-base, repeat(1, minmax(0, 1fr)))`;

    const dynamicStyles = React.useMemo(() => ({
      "--rnx-grid-cols": baseGridTemplateColumns,
      "--rnx-grid-auto-flow": flow ? flowMap[flow] : undefined,
      "--rnx-grid-align": align,
      "--rnx-grid-justify": justify ? justifyMap[justify] : undefined,
      ...colVars,
      ...rowVars,
      ...gapVars,
      ...pVars,
      ...style,
    } as any as React.CSSProperties), [baseGridTemplateColumns, flow, align, justify, colVars, rowVars, gapVars, pVars, style]);

    return (
      <Component
        ref={ref}
        className={cn("rnx-grid", className)}
        style={dynamicStyles}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

GridBase.displayName = "Grid";
export const Grid = withLoading(GridBase);
