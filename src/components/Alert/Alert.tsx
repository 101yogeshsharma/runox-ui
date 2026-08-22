"use client";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

import { RnxColor } from "../../types";

const defaultIcons: Record<
  string,
  React.ReactNode
> = {
  info: <Info className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  danger: <XCircle className="h-5 w-5" />,
  destructive: <XCircle className="h-5 w-5" />,
  primary: <Info className="h-5 w-5" />,
  secondary: <Info className="h-5 w-5" />,
  default: <Info className="h-5 w-5" />,
};

import { cva, type VariantProps } from "class-variance-authority";
import { Text } from "../../atoms/Text";
import { Box } from "../../atoms/Box";
import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";
import "./Alert.css";

export const alertVariants = cva("rnx-alert", {
  variants: {
    color: {
      default: "rnx-alert--color-default",
      primary: "rnx-alert--color-primary",
      secondary: "rnx-alert--color-secondary",
      info: "rnx-alert--color-info",
      success: "rnx-alert--color-success",
      warning: "rnx-alert--color-warning",
      danger: "rnx-alert--color-danger",
      destructive: "rnx-alert--color-destructive",
      muted: "rnx-alert--color-default",
    },
    variant: {
      subtle: "",
      solid: "rnx-alert--variant-solid",
      glass: "rnx-alert--variant-glass",
      "left-accent": "rnx-alert--variant-left-accent",
      "top-accent": "rnx-alert--variant-top-accent",
    },
    size: {
      sm: "rnx-alert--size-sm",
      md: "rnx-alert--size-md",
      lg: "rnx-alert--size-lg",
    },
  },
  defaultVariants: {
    color: "info",
    variant: "subtle",
    size: "md",
  },
});

/**
 * Displays a short, important message that requires the user's attention.
 */
export interface AlertProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    Omit<VariantProps<typeof alertVariants>, "color"> {
  color?: RnxColor;
  /** @deprecated Use `color` instead */
  status?: "info" | "success" | "warning" | "danger";
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const AlertBase = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      title,
      children,
      color,
      status,
      variant = "subtle",
      size = "md",
      icon,
      onClose,
      className,
      ...props
    },
    ref
  ) => {
    // If user passed legacy variant as "danger" | "success" | "warning" | "info", map it
    const legacyVariantMatch = ["info", "success", "warning", "danger"].includes(variant as string);
    const effectiveColor: RnxColor = color || (legacyVariantMatch ? (variant as any) : (status || "info"));
    const effectiveVariant = legacyVariantMatch ? "subtle" : variant;

    return (
      <Box
        {...rnx({ component: 'Alert', variant: effectiveColor })}
        ref={ref}
        role="alert"
        aria-live={
          effectiveColor === "danger" || effectiveColor === "destructive" || effectiveColor === "warning" ? "assertive" : "polite"
        }
        className={cn(alertVariants({ color: effectiveColor as any, variant: effectiveVariant, size }), className)}
        {...props}
      >
        <Box className={cn("rnx-alert-icon", `rnx-alert-icon--${size || "md"}`)}>
          {icon || defaultIcons[effectiveColor] || defaultIcons.info}
        </Box>
        <Box className="rnx-alert-content">
          {title && (
            <Text
              as="h5"
              className="rnx-alert-title"
            >
              {title}
            </Text>
          )}
          <Box className="rnx-alert-description">{children}</Box>
        </Box>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rnx-alert-close"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </Box>
    );
  }
);

AlertBase.displayName = "Alert";
export const Alert = withLoading(AlertBase);
