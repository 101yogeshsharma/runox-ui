"use client";
import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";

/**
 * Props for the Shake component.
 */
export interface ShakeProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  delay?: number;
  intensity?: "sm" | "md" | "lg";
  as?: React.ElementType;
}

/**
 * Shake is an attention-seeking animation. It triggers whenever the component mounts.
 * To re-trigger the shake effect (e.g. on form submission error), change the `key` prop.
 * Example: `<Shake key={errorCount} intensity="md">Invalid Input</Shake>`
 */
export const Shake = forwardRef<HTMLElement, ShakeProps>(
  (
    {
      children,
      duration = 0.5,
      delay = 0,
      intensity = "md",
      className,
      as: Tag = "div",
      style,
      ...props
    },
    ref,
  ) => {
    const intensityValue = {
      sm: "4px",
      md: "8px",
      lg: "16px",
    }[intensity];

    return (
      <Tag
        ref={ref}
        className={cn("rnx-motion-shake", className)}
        style={
          {
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            "--rnx-shake-intensity": intensityValue,
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
Shake.displayName = "Motion.Shake";
