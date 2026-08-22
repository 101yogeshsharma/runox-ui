import { Box } from "../../atoms/Box";
import * as React from "react";
import { cn } from "../../utils/cn";
import { rnx } from "../../utils/rnx";

import "./MasonryGrid.css";

type ResponsiveColumns = number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number };

/**
 * Props for the MasonryGrid component.
 */
export interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The gap between items. Defaults to "md".
   */
  gap?: "sm" | "md" | "lg" | "xl";
  /**
   * Number of columns, or responsive object. Defaults to { base: 1, sm: 2, md: 3, lg: 4 }.
   */
  columns?: ResponsiveColumns;
}

const MasonryGrid = React.forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ className, gap = "md", columns, style, children, ...props }, ref) => {
    const dynamicStyle = React.useMemo(() => {
      if (!columns) return style;
      if (typeof columns === "number") {
        return {
          "--rnx-masonry-cols-base": columns,
          "--rnx-masonry-cols-sm": columns,
          "--rnx-masonry-cols-md": columns,
          "--rnx-masonry-cols-lg": columns,
          ...style,
        } as React.CSSProperties;
      }
      return {
        ...(columns.base ? { "--rnx-masonry-cols-base": columns.base } : {}),
        ...(columns.sm ? { "--rnx-masonry-cols-sm": columns.sm } : {}),
        ...(columns.md ? { "--rnx-masonry-cols-md": columns.md } : {}),
        ...(columns.lg ? { "--rnx-masonry-cols-lg": columns.lg } : {}),
        ...style,
      } as React.CSSProperties;
    }, [columns, style]);

    return (
      <Box
        {...rnx({ component: 'MasonryGrid' })}
        ref={ref}
        style={dynamicStyle}
        className={cn(
          "rnx-masonry-grid",
          `rnx-masonry-grid--gap-${gap}`,
          className
        )}
        {...props}
      >
        {React.Children.toArray(children).map((child, idx) => (
          <Box
            key={(child as React.ReactElement).key ?? idx}
            className="rnx-masonry-item"
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
