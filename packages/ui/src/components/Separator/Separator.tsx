"use client";

import * as React from "react";
import { cn } from "../../utils/cn";
import { Box } from "../../atoms/Box";
import "./Separator.css";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <Box
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      data-orientation={orientation}
      className={cn(
        "rnx-separator",
        `rnx-separator--${orientation}`,
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
