import React, { ElementType, forwardRef } from "react";
import { cn } from "../../utils/cn";
import type {
  PolymorphicComponentPropsWithRef,
} from "../../utils/types";

export interface BoxBaseProps {
  children?: React.ReactNode;
  surface?: "default" | "card" | "muted" | "popover" | "transparent";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  isInteractive?: boolean;
  interactive?: boolean;
}

export type BoxProps<C extends ElementType> = PolymorphicComponentPropsWithRef<
  C,
  BoxBaseProps
>;

type BoxComponent = <C extends ElementType = "div">(
  props: BoxProps<C>
) => React.ReactElement | null;

const BoxBase = forwardRef(
  (
    {
      as,
      className,
      surface,
      radius,
      shadow,
      isInteractive = false,
      interactive = false,
      ...props
    }: BoxProps<React.ElementType>,
    ref: React.Ref<unknown>
  ) => {
    const Component = as || "div";
    const isActuallyInteractive = interactive || isInteractive;
    return (
      <Component
        ref={ref}
        className={cn(
          "rnx-box",
          surface && `rnx-box--surface-${surface}`,
          radius && `rnx-box--radius-${radius}`,
          shadow && `rnx-box--shadow-${shadow}`,
          isActuallyInteractive && "rnx-box--interactive",
          className
        )}
        {...props}
      />
    );
  }
);

export const Box = React.memo(BoxBase) as BoxComponent;

Object.assign(Box, { displayName: "Box" });
