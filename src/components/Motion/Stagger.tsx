"use client";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  staggerDelay?: number;
  delayChildren?: number;
  as?: React.ElementType;
}

export const StaggerContainer = forwardRef<HTMLElement, StaggerContainerProps>(
  (
    {
      children,
      staggerDelay = 0.1,
      delayChildren = 0,
      className,
      as: Tag = "div",
      style,
      ...props
    },
    ref,
  ) => {
    // Clone children and inject staggered animation-delay
    const staggeredChildren = React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      const delay = delayChildren + index * staggerDelay;
      return React.cloneElement(child as React.ReactElement<any>, {
        style: {
          ...(child.props as any).style,
          animationDelay: `${delay}s`,
        },
      });
    });

    return (
      <Tag ref={ref} className={cn(className)} style={style} {...props}>
        {staggeredChildren}
      </Tag>
    );
  },
);
StaggerContainer.displayName = "Motion.Stagger";

export interface StaggerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  as?: React.ElementType;
}

export const StaggerItem = forwardRef<HTMLElement, StaggerItemProps>(
  (
    {
      children,
      direction = "up",
      distance = 20,
      duration = 0.4,
      className,
      as: Tag = "div",
      style,
      ...props
    },
    ref,
  ) => {
    const directionClass = {
      up: "rnx-motion-slide-up",
      down: "rnx-motion-slide-down",
      left: "rnx-motion-slide-left",
      right: "rnx-motion-slide-right",
    }[direction];

    return (
      <Tag
        ref={ref}
        className={cn(directionClass, className)}
        style={
          {
            animationDuration: `${duration}s`,
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
StaggerItem.displayName = "Motion.StaggerItem";
