"use client";
import React from "react";
import { cn } from "../../utils/cn";

/**
 * Props for the FlipIn component.
 */
export interface FlipInProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  delay?: number;
  axis?: "x" | "y";
  as?: React.ElementType;
}

export const FlipIn: React.FC<FlipInProps> = ({
  children,
  duration = 0.5,
  delay = 0,
  axis = "x",
  className,
  as: Tag = "div",
  style,
  ...props
}) => {
  const flipClass = axis === "x" ? "rnx-motion-flip-x" : "rnx-motion-flip-y";

  return (
    <Tag
      className={cn(flipClass, className)}
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
