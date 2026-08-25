"use client";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Box } from "../../atoms/Box";
import "./Card.css";

import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";

/**
 * A container component for grouping related content, graphics, and actions.
 */
export interface CardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "size"
> {
  variant?:
    | "elevated"
    | "filled"
    | "subtle"
    | "bordered"
    | "ghost"
    | "glass"
    | "outline";
  size?: "sm" | "md" | "lg";
  shape?: "square" | "circle" | "rounded";
  isInteractive?: boolean;
  /** @deprecated Use `isInteractive` instead. */
  interactive?: boolean;
}

const CardComponentBase = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = "elevated",
      size = "md",
      shape = "rounded",
      isInteractive = false,
      interactive = false,
      className = "",
      ...props
    },
    ref,
  ) => {
    const isActuallyInteractive = interactive || isInteractive;
    return (
      <Box
        ref={ref}
        {...rnx({
          component: "Card",
          variant,
          state: isActuallyInteractive ? "active" : undefined,
        })}
        className={cn(
          "rnx-card",
          `rnx-card--variant-${variant}`,
          `rnx-card--size-${size}`,
          `rnx-card--shape-${shape}`,
          isActuallyInteractive && "rnx-card--interactive",
          className,
        )}
        {...props}
      >
        {children}
      </Box>
    );
  },
);

CardComponentBase.displayName = "Card";
const CardComponent = withLoading(CardComponentBase);

export interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", children, ...props }, ref) => (
    <Box ref={ref} className={cn("rnx-card-header", className)} {...props}>
      {children}
    </Box>
  ),
);
CardHeader.displayName = "Card.Header";

const CardBody = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", children, ...props }, ref) => (
    <Box ref={ref} className={cn("rnx-card-body", className)} {...props}>
      {children}
    </Box>
  ),
);
CardBody.displayName = "Card.Body";

const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", children, ...props }, ref) => (
    <Box ref={ref} className={cn("rnx-card-footer", className)} {...props}>
      {children}
    </Box>
  ),
);
CardFooter.displayName = "Card.Footer";

const CardTitle = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", children, ...props }, ref) => (
    <Box ref={ref} className={cn("rnx-card-title", className)} {...props}>
      {children}
    </Box>
  ),
);
CardTitle.displayName = "Card.Title";

const CardDescription = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", children, ...props }, ref) => (
    <Box ref={ref} className={cn("rnx-card-description", className)} {...props}>
      {children}
    </Box>
  ),
);
CardDescription.displayName = "Card.Description";

const CardContent = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", children, ...props }, ref) => (
    <Box ref={ref} className={cn("rnx-card-content", className)} {...props}>
      {children}
    </Box>
  ),
);
CardContent.displayName = "Card.Content";

export const Card = Object.assign(CardComponent, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
});
