"use client";
import React from "react";
import { cn } from "../../utils/cn";

/**
 * Props for the BounceIn component.
 */
export interface BounceInProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  as?: React.ElementType;
}

export const BounceIn: React.FC<BounceInProps> = ({
  children,
  duration = 0.5,
  delay = 0,
  direction = "up",
  distance = 30,
  className,
  as: Tag = "div",
  style,
  ...props
}) => {
  const directionClass = {
    up: "rnx-motion-bounce-up",
    down: "rnx-motion-bounce-down",
    left: "rnx-motion-bounce-left",
    right: "rnx-motion-bounce-right",
  }[direction];

  return (
    <Tag
      className={cn(directionClass, className)}
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        "--rnx-slide-distance": `${distance}px`,
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </Tag>
  );
};
