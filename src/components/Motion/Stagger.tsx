"use client";
import React from "react";
import { cn } from "../../utils/cn";

export interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  staggerDelay?: number;
  delayChildren?: number;
  as?: React.ElementType;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  delayChildren = 0,
  className,
  as: Tag = "div",
  style,
  ...props
}) => {
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
    <Tag className={cn(className)} style={style} {...props}>
      {staggeredChildren}
    </Tag>
  );
};

export interface StaggerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  as?: React.ElementType;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  direction = "up",
  distance = 20,
  duration = 0.4,
  className,
  as: Tag = "div",
  style,
  ...props
}) => {
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
          "--rnx-slide-distance": `${distance}px`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </Tag>
  );
};
