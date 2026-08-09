import React from "react";

import { cn } from "../../utils/cn";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  center?: boolean;
  as?: React.ElementType;
}

const maxWidthMap = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1400px",
  full: "100%",
};

const paddingMap = {
  none: "0px",
  sm: "var(--spacing-4, 16px)",
  md: "var(--spacing-6, 24px)",
  lg: "var(--spacing-8, 32px)",
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      maxWidth = "2xl",
      padding = "md",
      center = true,
      style,
      className,
      as: Component = "div",
      ...props
    },
    ref
  ) => {
    const dynamicStyles = {
      "--rnx-container-max": maxWidthMap[maxWidth],
      "--rnx-container-px": paddingMap[padding],
      ...(center
        ? { marginLeft: "auto", marginRight: "auto" }
        : { marginLeft: 0, marginRight: 0 }),
      ...style,
    } as any as React.CSSProperties;

    return (
      <Component
        ref={ref}
        className={cn("rnx-container", className)}
        style={dynamicStyles}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = "Container";
