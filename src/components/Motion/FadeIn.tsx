"use client";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";

/**
 * Props for the FadeIn component.
 */
export interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  delay?: number;
  as?: React.ElementType;
}

export const FadeIn = forwardRef<HTMLElement, FadeInProps>(
  (
    {
      children,
      duration = 0.3,
      delay = 0,
      className,
      as: Tag = "div",
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <Tag
        ref={ref}
        className={cn("rnx-motion-fade-in", className)}
        style={{
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          ...style,
        }}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);
FadeIn.displayName = "Motion.FadeIn";
