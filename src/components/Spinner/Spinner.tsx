"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { rnx } from "../../utils/rnx";

import "./Spinner.css";

const spinnerVariants = cva("rnx-spinner", {
  variants: {
    size: {
      sm: "rnx-spinner--size-sm",
      md: "rnx-spinner--size-md",
      lg: "rnx-spinner--size-lg",
      xl: "rnx-spinner--size-xl",
    },
    color: {
      current: "rnx-spinner--color-current",
      primary: "rnx-spinner--color-primary",
      secondary: "rnx-spinner--color-secondary",
      muted: "rnx-spinner--color-muted",
      destructive: "rnx-spinner--color-destructive",
      danger: "rnx-spinner--color-danger",
      inverse: "rnx-spinner--color-inverse",
      success: "rnx-spinner--color-success",
      warning: "rnx-spinner--color-warning",
      info: "rnx-spinner--color-info",
    },
  },
  defaultVariants: {
    size: "md",
    color: "current",
  },
});

/**
 * Props for the Spinner component.
 */
export interface SpinnerProps
  extends
    Omit<React.SVGProps<SVGSVGElement>, "color">,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, color, role = "status", "aria-label": ariaLabel = "Loading", ...props }, ref) => {
    return (
      <svg
        {...rnx({ component: 'Spinner' })}
        ref={ref}
        role={role}
        aria-label={ariaLabel}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(spinnerVariants({ size, color }), className)}
        {...props}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    );
  }
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
