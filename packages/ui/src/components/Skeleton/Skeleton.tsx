"use client";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Box } from "../../atoms/Box";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "text", width, height, style, ...props }, ref) => {
    const variantStyles = {
      text: "rnx-skeleton-text",
      circular: "rnx-skeleton-circular",
      rectangular: "rnx-skeleton-rectangular",
      rounded: "rnx-skeleton-rounded",
    };

    return (
      <Box
        ref={ref}
        className={cn("rnx-skeleton", variantStyles[variant], className)}
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
