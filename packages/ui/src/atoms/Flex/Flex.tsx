import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { ResponsiveProp, gapMap, generateResponsiveVars } from "../utils";

export interface FlexProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  direction?: ResponsiveProp<"row" | "col" | "row-reverse" | "col-reverse">;
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  gap?: ResponsiveProp<"none" | "xs" | "sm" | "md" | "lg" | "xl">;
  wrap?: boolean | "reverse";
  fullWidth?: boolean;
  as?: React.ElementType;
}

const justifyMap: Record<string, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

const alignMap: Record<string, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
};

export const Flex = forwardRef<HTMLElement, FlexProps>(
  (
    {
      children,
      direction = "row",
      justify,
      align,
      gap,
      wrap = false,
      fullWidth = false,
      as: Component = "div",
      style,
      className,
      ...props
    },
    ref
  ) => {
    const dirVars = generateResponsiveVars("rnx-flex-dir", direction, (val) =>
      val === "col"
        ? "column"
        : val === "col-reverse"
          ? "column-reverse"
          : val === "row-reverse"
            ? "row-reverse"
            : "row"
    );
    const gapVars = generateResponsiveVars(
      "rnx-flex-gap",
      gap,
      (val) => gapMap[val] || val
    );

    const dynamicStyles = {
      "--rnx-flex-justify": justify ? justifyMap[justify] : undefined,
      "--rnx-flex-align": align ? alignMap[align] : undefined,
      "--rnx-flex-wrap":
        wrap === true ? "wrap" : wrap === "reverse" ? "wrap-reverse" : "nowrap",
      ...dirVars,
      ...gapVars,
      ...(fullWidth ? { width: "100%" } : {}),
      ...style,
    } as any as React.CSSProperties;

    return (
      <Component
        ref={ref}
        className={cn("rnx-flex", className)}
        style={dynamicStyles}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Flex.displayName = "Flex";
