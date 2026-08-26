"use client";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";

/**
 * Props for the SlideIn component.
 */
export interface SlideInProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
}

export const SlideIn = forwardRef<HTMLElement, SlideInProps>(
  (
    {
      children,
      direction = "up",
      distance = 20,
      duration = 0.4,
      delay = 0,
      className,
      as: Tag = "div",
      style,
      ...props
    },
    _ref,
  ) => {
    const directionClass = {
      up: "rnx-motion-slide-up",
      down: "rnx-motion-slide-down",
      left: "rnx-motion-slide-left",
      right: "rnx-motion-slide-right",
    }[direction];

    return (
      <Tag
        className={cn(directionClass, className)}
        style={
          {
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            "--rnx-slide-distance": `${distance}px`,
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
SlideIn.displayName = "Motion.SlideIn";
