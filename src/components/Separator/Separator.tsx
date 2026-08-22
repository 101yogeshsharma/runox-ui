"use client";

import * as React from "react";
import { cn } from "../../utils/cn";
import { Box } from "../../atoms/Box";
import "./Separator.css";
import { rnx } from "../../utils/rnx";

import { RnxColor } from "../../types";

/**
 * Props for the Separator component.
 */
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed" | "dotted";
  color?: RnxColor;
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", variant = "solid", color, decorative = true, ...props },
    ref
  ) => (
    <Box
      {...rnx({ component: 'Separator' })}
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      data-orientation={orientation}
      className={cn(
        "rnx-separator",
        `rnx-separator--${orientation}`,
        variant && variant !== "solid" && `rnx-separator--variant-${variant}`,
        color && `rnx-separator--color-${color}`,
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
