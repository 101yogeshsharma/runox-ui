"use client";
import React from "react";
import { cn } from "../../utils/cn";

/**
 * Props for the Reveal component.
 */
export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  as?: React.ElementType;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  duration = 0.5,
  delay = 0,
  direction = "left",
  className,
  as: Tag = "div",
  style,
  ...props
}) => {
  const directionClass = {
    up: "rnx-motion-reveal-up",
    down: "rnx-motion-reveal-down",
    left: "rnx-motion-reveal-left",
    right: "rnx-motion-reveal-right",
  }[direction];

  return (
    <Tag
      className={cn(directionClass, className)}
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
};
