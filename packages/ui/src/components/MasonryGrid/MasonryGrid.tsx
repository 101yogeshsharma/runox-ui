import { Box } from "../../atoms/Box";
import * as React from "react";
import { cn } from "../../utils/cn";

export interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The gap between items. Defaults to "md".
   */
  gap?: "sm" | "md" | "lg" | "xl";
}

const gapClassMap = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const gapMarginMap = {
  sm: "mb-2",
  md: "mb-4",
  lg: "mb-6",
  xl: "mb-8",
};

const MasonryGrid = React.forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ className, gap = "md", children, ...props }, ref) => {
    // If user doesn't provide column classes in className, use a default responsive column layout
    const hasColumnsClass = className?.includes("columns-");
    const defaultColumns = hasColumnsClass
      ? ""
      : "columns-1 sm:columns-2 md:columns-3 lg:columns-4";

    return (
      <Box
        ref={ref}
        className={cn(defaultColumns, gapClassMap[gap], className)}
        {...props}
      >
        {React.Children.toArray(children).map((child, idx) => (
          <Box
            key={(child as React.ReactElement).key ?? idx}
            className={cn("break-inside-avoid", gapMarginMap[gap])}
          >
            {child}
          </Box>
        ))}
      </Box>
    );
  }
);

MasonryGrid.displayName = "MasonryGrid";

export { MasonryGrid };
