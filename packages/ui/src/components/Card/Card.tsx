"use client";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Box } from "../../atoms/Box";
import { useTheme } from "../ThemeProvider/ThemeProvider";
import "./Card.css";

export interface CardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "size"
> {
  variant?: "glass" | "outline";
  size?: "sm" | "md" | "lg";
  shape?: "square" | "circle" | "rounded";
  isInteractive?: boolean;
}

const CardComponent = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = "glass",
      size = "md",
      shape = "rounded",
      isInteractive = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const { config } = useTheme();
    return (
      <Box
        ref={ref}
        className={cn(
          "rnx-card",
          `rnx-card--variant-${variant}`,
          `rnx-card--size-${size}`,
          `rnx-card--shape-${shape}`,
          isInteractive && "rnx-card--interactive",
          `rounded-${config.radius}`,
          className
        )}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

CardComponent.displayName = "Card";

export interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", children, ...props }, ref) => (
    <Box ref={ref} className={cn("rnx-card-header", className)} {...props}>
      {children}
    </Box>
  )
);
CardHeader.displayName = "CardHeader";

export const CardBody = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", children, ...props }, ref) => (
    <Box ref={ref} className={cn("rnx-card-body", className)} {...props}>
      {children}
    </Box>
  )
);
CardBody.displayName = "CardBody";

export const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", children, ...props }, ref) => (
    <Box ref={ref} className={cn("rnx-card-footer", className)} {...props}>
      {children}
    </Box>
  )
);
CardFooter.displayName = "CardFooter";

export const CardTitle = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", children, ...props }, ref) => (
    <Box
      ref={ref}
      className={cn(
        "text-lg leading-none font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </Box>
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", children, ...props }, ref) => (
    <Box
      ref={ref}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    >
      {children}
    </Box>
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className = "", children, ...props }, ref) => (
    <Box ref={ref} className={cn("rnx-card-body pt-0", className)} {...props}>
      {children}
    </Box>
  )
);
CardContent.displayName = "CardContent";

export const Card = Object.assign(CardComponent, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
});
