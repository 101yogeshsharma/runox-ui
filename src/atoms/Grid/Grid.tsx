import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { ResponsiveProp, gapMap, generateResponsiveVars } from "../utils";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  cols?: ResponsiveProp<number>;
  gap?: ResponsiveProp<"none" | "xs" | "sm" | "md" | "lg" | "xl">;
  autoFit?: boolean;
  minColWidth?: string;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  as?: React.ElementType;
}

export const Grid = forwardRef<HTMLElement, GridProps>(
  (
    {
      children,
      cols = 1,
      gap = "md",
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
    const colVars = generateResponsiveVars("rnx-grid-cols", cols);
    const gapVars = generateResponsiveVars(
      "rnx-grid-gap",
      gap,
      (val) => gapMap[val] || val
    );

    const baseGridTemplateColumns = autoFit
      ? `repeat(auto-fit, minmax(${minColWidth}, 1fr))`
      : `repeat(var(--rnx-grid-cols-base, 1), minmax(0, 1fr))`;

    const justifyMap: Record<string, string> = {
      start: "start",
      center: "center",
      end: "end",
      between: "space-between",
      around: "space-around",
      evenly: "space-evenly",
    };

    const dynamicStyles = {
      "--rnx-grid-cols": baseGridTemplateColumns,
      "--rnx-grid-align": align,
      "--rnx-grid-justify": justify ? justifyMap[justify] : undefined,
      ...colVars,
      ...gapVars,
      ...style,
    } as any as React.CSSProperties;

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

Grid.displayName = "Grid";
