import React from "react";

import { cn } from "../../utils/cn";

import { ResponsiveProp, generateResponsiveVars } from "../utils";

/**
 * Props for the Container component.
 */
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  maxWidth?: ResponsiveProp<"sm" | "md" | "lg" | "xl" | "2xl" | "full">;
  padding?: "none" | "sm" | "md" | "lg";
  padded?: boolean;
  fluid?: boolean;
  surface?: "default" | "card" | "muted" | "transparent";
  center?: boolean;
  as?: React.ElementType;
}

const maxWidthMap: Record<string, string> = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1400px",
  full: "100%",
};

const paddingMap = {
  none: "0px",
  sm: "calc(1rem * var(--rnx-space-scale, 1))",
  md: "calc(1.5rem * var(--rnx-space-scale, 1))",
  lg: "calc(2rem * var(--rnx-space-scale, 1))",
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      maxWidth = "2xl",
      padding = "md",
      padded = true,
      fluid = false,
      surface,
      center = true,
      style,
      className,
      as: Component = "div",
      ...props
    },
    ref,
  ) => {
    const maxWidthVars = generateResponsiveVars(
      "rnx-container-max",
      fluid ? "full" : maxWidth,
      (val) => maxWidthMap[val] || val,
    );

    const dynamicStyles = {
      "--rnx-container-px": padded ? paddingMap[padding] : "0px",
      ...(center
        ? { marginLeft: "auto", marginRight: "auto" }
        : { marginLeft: 0, marginRight: 0 }),
      ...maxWidthVars,
      ...style,
    } as any as React.CSSProperties;

    return (
      <Component
        ref={ref}
        className={cn(
          "rnx-container",
          surface && `rnx-container--surface-${surface}`,
          className,
        )}
        style={dynamicStyles}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Container.displayName = "Container";
