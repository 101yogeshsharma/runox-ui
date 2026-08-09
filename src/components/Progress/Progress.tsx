"use client";
import React, { forwardRef } from "react";
import { Box } from "../../atoms/Box";
import { Text } from "../../atoms/Text";
import { cn } from "../../utils/cn";
import { useTheme } from "../ThemeProvider/ThemeProvider";
import "./Progress.css";

export interface ProgressProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "color"
> {
  value?: number;
  max?: number;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "danger";
  formatLabel?: (value: number, max: number) => React.ReactNode;
  indicatorClassName?: string;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      showValue = false,
      size = "md",
      color = "primary",
      formatLabel,
      indicatorClassName,
      ...props
    },
    ref
  ) => {
    const { config } = useTheme();
    const safeMax = max > 0 ? max : 100;
    const percentage = Math.min(100, Math.max(0, (value / safeMax) * 100));

    return (
      <Box
        className={cn(
          "rnx-progress-container",
          `rnx-progress--${size}`,
          className
        )}
      >
        <Box
          ref={ref}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          className={cn(
            "rnx-progress",
            `rounded-${config.radius}`,
            `rnx-progress--${color}`
          )}
          {...props}
        >
          <Box
            className={cn("rnx-progress-indicator", indicatorClassName)}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </Box>
        {showValue && (
          <Text as="span" variant="caption" className="rnx-progress-value-text">
            {formatLabel
              ? formatLabel(value, max)
              : `${Math.round(percentage)}%`}
          </Text>
        )}
      </Box>
    );
  }
);

Progress.displayName = "Progress";
