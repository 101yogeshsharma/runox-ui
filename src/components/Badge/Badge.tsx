"use client";
import React, { forwardRef } from "react";
import { Box } from "../../atoms/Box";
import { cn } from "../../utils/cn";
import "./Badge.css";
import { useTheme } from "../ThemeProvider/ThemeProvider";

export interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "color"
> {
  variant?: "solid" | "subtle" | "outline";
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
  icon?: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      color = "primary",
      variant = "subtle",
      size = "md",
      shape = "circle",
      icon,
      className,
      ...props
    },
    ref
  ) => {
    const { config } = useTheme();
    return (
      <Box
        as="span"
        ref={ref}
        className={cn(
          "rnx-badge",
          `rnx-badge--${variant}-${color}`,
          `rnx-badge--size-${size}`,
          `rnx-badge--shape-${shape}`,
          `rounded-${config.radius}`,
          className
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
  }
);

Badge.displayName = "Badge";
