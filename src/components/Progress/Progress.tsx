"use client";
import React, { forwardRef } from "react";
import { Box } from "../../atoms/Box";
import { Text } from "../../atoms/Text";
import { cn } from "../../utils/cn";
import "./Progress.css";
import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";

/**
 * An animated bar showing the completion status of a task or process.
 */
export interface ProgressProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "color"
> {
  value?: number;
  max?: number;
  variant?: "solid" | "striped" | "indeterminate" | "glass";
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "danger";
  formatLabel?: (value: number, max: number) => React.ReactNode;
  indicatorClassName?: string;
}

const ProgressBase = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      variant = "solid",
      showValue = false,
      size = "md",
      color = "primary",
      formatLabel,
      indicatorClassName,
      ...props
    },
    ref,
  ) => {
    const safeMax = max > 0 ? max : 100;
    const percentage = Math.min(100, Math.max(0, (value / safeMax) * 100));

    return (
      <Box
        {...rnx({
          component: "Progress",
          state: value !== undefined && value >= 100 ? "active" : "inactive",
        })}
        className={cn(
          "rnx-progress-container",
          `rnx-progress--size-${size}`,
          className,
        )}
      >
        <Box
          ref={ref}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={
            variant === "indeterminate" ? undefined : Math.round(value)
          }
          className={cn(
            "rnx-progress",
            `rnx-progress--${color}`,
            variant &&
              variant !== "solid" &&
              `rnx-progress--variant-${variant}`,
          )}
          {...props}
        >
          <Box
            className={cn("rnx-progress-indicator", indicatorClassName)}
            style={
              variant === "indeterminate"
                ? undefined
                : { transform: `translateX(-${100 - percentage}%)` }
            }
          />
        </Box>
        {showValue && variant !== "indeterminate" && (
          <Text as="span" variant="caption" className="rnx-progress-value-text">
            {formatLabel
              ? formatLabel(value, safeMax)
              : `${Math.round(percentage)}%`}
          </Text>
        )}
      </Box>
    );
  },
);

ProgressBase.displayName = "Progress";
export const Progress = withLoading(ProgressBase);
