"use client";
import React from "react";
import { cn } from "../../utils/cn";

/**
 * Props for the RotateIn component.
 */
export interface RotateInProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  delay?: number;
  from?: number;
  as?: React.ElementType;
}

export const RotateIn: React.FC<RotateInProps> = ({
  children,
  duration = 0.5,
  delay = 0,
  from = -90,
  className,
  as: Tag = "div",
  style,
  ...props
}) => {
  return (
    <Tag
      className={cn("rnx-motion-rotate-in", className)}
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        "--rnx-rotate-from": `${from}deg`,
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </Tag>
  );
};
