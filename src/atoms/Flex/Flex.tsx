import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { ResponsiveProp, gapMap, generateResponsiveVars } from "../utils";
import { withLoading } from "../../utils/withLoading";

export type FlexSpacing = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type FlexDirection = "row" | "col" | "row-reverse" | "col-reverse";
export type FlexJustify =
  "start" | "center" | "end" | "between" | "around" | "evenly";
export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";

/**
 * Props for the Flex component.
 */
export interface FlexProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  direction?: ResponsiveProp<FlexDirection>;
  justify?: FlexJustify;
  align?: FlexAlign;
  gap?: ResponsiveProp<FlexSpacing>;
  p?: ResponsiveProp<FlexSpacing>;
  px?: ResponsiveProp<FlexSpacing>;
  py?: ResponsiveProp<FlexSpacing>;
  wrap?: boolean | "reverse";
  fullWidth?: boolean;
  inline?: boolean;
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

const FlexBase = forwardRef<HTMLElement, FlexProps>(
  (
    {
      children,
      direction = "row",
      justify,
      align,
      gap,
      p,
      px,
      py,
      wrap = false,
      fullWidth = false,
      inline = false,
      as: Component = "div",
      style,
      className,
      ...props
    },
    ref,
  ) => {
    const dirVars = generateResponsiveVars("rnx-flex-dir", direction, (val) =>
      val === "col"
        ? "column"
        : val === "col-reverse"
          ? "column-reverse"
          : val === "row-reverse"
            ? "row-reverse"
            : "row",
    );
    const gapVars = generateResponsiveVars(
      "rnx-flex-gap",
      gap,
      (val) => gapMap[val] || val,
    );
    const pVars = generateResponsiveVars(
      "rnx-flex-p",
      p,
      (val) => gapMap[val] || val,
    );
    const pxVars = generateResponsiveVars(
      "rnx-flex-px",
      px,
      (val) => gapMap[val] || val,
    );
    const pyVars = generateResponsiveVars(
      "rnx-flex-py",
      py,
      (val) => gapMap[val] || val,
    );

    const dynamicStyles = React.useMemo(
      () =>
        ({
          "--rnx-flex-display": inline ? "inline-flex" : "flex",
          "--rnx-flex-justify": justify ? justifyMap[justify] : undefined,
          "--rnx-flex-align": align ? alignMap[align] : undefined,
          "--rnx-flex-wrap":
            wrap === true
              ? "wrap"
              : wrap === "reverse"
                ? "wrap-reverse"
                : "nowrap",
          ...dirVars,
          ...gapVars,
          ...pVars,
          ...pxVars,
          ...pyVars,
          ...(fullWidth ? { width: "100%" } : {}),
          ...style,
        }) as any as React.CSSProperties,
      [
        inline,
        justify,
        align,
        wrap,
        dirVars,
        gapVars,
        pVars,
        pxVars,
        pyVars,
        fullWidth,
        style,
      ],
    );

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
  },
);

FlexBase.displayName = "Flex";
export const Flex = withLoading(FlexBase);
