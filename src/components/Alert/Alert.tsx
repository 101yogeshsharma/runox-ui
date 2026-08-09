"use client";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

const defaultIcons: Record<
  "info" | "success" | "warning" | "danger",
  React.ReactNode
> = {
  info: <Info className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  danger: <XCircle className="h-5 w-5" />,
};

import { cva, type VariantProps } from "class-variance-authority";
import { Text } from "../../atoms/Text";
import { Box } from "../../atoms/Box";
import { Button } from "../Button";

export const alertVariants = cva("relative w-full rounded-lg border", {
  variants: {
    variant: {
      info: "bg-info/10 text-info border-info/20 dark:text-info-foreground",
      success:
        "bg-success/10 text-success border-success/20 dark:text-success-foreground",
      warning:
        "bg-warning/10 text-warning border-warning/20 dark:text-warning-foreground",
      danger:
        "bg-destructive/10 text-destructive border-destructive/20 dark:text-destructive-foreground",
    },
    size: {
      sm: "p-3",
      md: "p-4",
      lg: "p-5",
    },
  },
  defaultVariants: {
    variant: "info",
    size: "md",
  },
});

export const alertIconVariants = cva("absolute text-foreground", {
  variants: {
    variant: {
      info: "text-info dark:text-info-foreground",
      success: "text-success dark:text-success-foreground",
      warning: "text-warning dark:text-warning-foreground",
      danger: "text-destructive dark:text-destructive-foreground",
    },
    size: {
      sm: "start-3 top-3",
      md: "start-4 top-4",
      lg: "start-5 top-5",
    },
  },
  defaultVariants: {
    variant: "info",
    size: "md",
  },
});

export interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    { title, children, variant, size, icon, onClose, className, ...props },
    ref
  ) => {
    return (
      <Box
        ref={ref}
        role="alert"
        aria-live={
          variant === "danger" || variant === "warning" ? "assertive" : "polite"
        }
        className={cn(alertVariants({ variant, size }), className)}
        {...props}
      >
        <Box className={cn(alertIconVariants({ variant, size }))}>
          {icon || defaultIcons[variant || "info"]}
        </Box>
        <Box className="ps-8">
          {title && (
            <Text
              as="h5"
              variant="body"
              weight="medium"
              className="mb-1 leading-none font-medium tracking-tight"
            >
              {title}
            </Text>
          )}
          <Box className="text-sm leading-relaxed opacity-90">{children}</Box>
        </Box>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ring-offset-background focus:ring-ring absolute end-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </Box>
    );
  }
);

Alert.displayName = "Alert";
