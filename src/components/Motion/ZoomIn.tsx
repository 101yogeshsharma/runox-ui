"use client";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";

/**
 * Props for the ZoomIn component.
 */
export interface ZoomInProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  delay?: number;
  from?: number;
  as?: React.ElementType;
}

export const ZoomIn = forwardRef<HTMLElement, ZoomInProps>(
  (
    {
      children,
      duration = 0.3,
      delay = 0,
      from = 0.5,
      className,
      as: Tag = "div",
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <Tag
        className={cn("rnx-motion-zoom-in", className)}
        style={
          {
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            "--rnx-zoom-from": from,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </Tag>
    );
  },
);
ZoomIn.displayName = "Motion.ZoomIn";
