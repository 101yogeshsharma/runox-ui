"use client";
import React from "react";
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

export const ZoomIn: React.FC<ZoomInProps> = ({
  children,
  duration = 0.3,
  delay = 0,
  from = 0.5,
  className,
  as: Tag = "div",
  style,
  ...props
}) => {
  return (
    <Tag
      className={cn("rnx-motion-zoom-in", className)}
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        "--rnx-zoom-from": from,
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </Tag>
  );
};
