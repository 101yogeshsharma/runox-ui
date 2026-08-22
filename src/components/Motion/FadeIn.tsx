"use client";
import React from "react";
import { cn } from "../../utils/cn";

/**
 * Props for the FadeIn component.
 */
export interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  delay?: number;
  as?: React.ElementType;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 0.3,
  delay = 0,
  className,
  as: Tag = "div",
  style,
  ...props
}) => {
  return (
    <Tag
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
};
