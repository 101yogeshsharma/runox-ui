"use client";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Box } from "../../atoms/Box";
import { rnx } from "../../utils/rnx";
import "./Skeleton.css";

import { RnxColor } from "../../types";

/**
 * A visual placeholder indicating content is loading.
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  animation?: "shimmer" | "pulse" | "none";
  color?: RnxColor | "card";
  width?: string | number;
  height?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "text", animation = "shimmer", color, width, height, style, "aria-hidden": ariaHidden = true, ...props }, ref) => {
    const variantStyles = {
      text: "rnx-skeleton-text",
      circular: "rnx-skeleton-circular",
      rectangular: "rnx-skeleton-rectangular",
      rounded: "rnx-skeleton-rounded",
    };

    return (
      <Box
        {...rnx({ component: 'Skeleton' })}
        ref={ref}
        aria-hidden={ariaHidden}
        className={cn(
          "rnx-skeleton",
          `rnx-skeleton--${animation}`,
          variantStyles[variant],
          color && `rnx-skeleton--color-${color}`,
          className
        )}
        style={{
          width,
          height,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";
