"use client";
import React, { forwardRef } from "react";
import { Box } from "../../atoms/Box";
import { cn } from "../../utils/cn";
import "./Badge.css";

import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";

/**
 * A small visual indicator for tags, statuses, count values, or categories.
 */
export interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "color"
> {
  variant?: "solid" | "subtle" | "outline" | "glass" | "gradient";
  color?:
    | "primary"
    | "ai"
    | "web"
    | "backend"
    | "custom"
    | "info"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square" | "rounded";
  pulse?: boolean;
  icon?: React.ReactNode;
}

const BadgeBase = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      color = "primary",
      variant = "subtle",
      size = "md",
      shape = "circle",
      pulse = false,
      icon,
      className,
      ...props
    },
    ref,
  ) => {
    let variantClass = `rnx-badge--${variant}-${color}`;
    if (variant === "glass") {
      variantClass = "rnx-badge--glass";
    } else if (variant === "gradient") {
      variantClass = "rnx-badge--gradient";
    }

    return (
      <Box
        {...rnx({ component: "Badge", variant: variant || "subtle" })}
        as="span"
        ref={ref}
        className={cn(
          "rnx-badge",
          variantClass,
          `rnx-badge--size-${size}`,
          `rnx-badge--shape-${shape}`,
          pulse && "rnx-badge--pulse",
          className,
        )}
        {...props}
      >
        {icon && (
          <Box as="span" className="rnx-badge__icon">
            {icon}
          </Box>
        )}
        {children}
      </Box>
    );
  },
);

BadgeBase.displayName = "Badge";
export const Badge = withLoading(BadgeBase);
