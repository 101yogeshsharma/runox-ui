import React, { ElementType, forwardRef } from "react";
import { cn } from "../../utils/cn";
import type {
  PolymorphicComponentPropsWithRef,
  PolymorphicRef,
} from "../../utils/types";

export type BoxProps<C extends ElementType> = PolymorphicComponentPropsWithRef<
  C,
  {
    children?: React.ReactNode;
  }
>;

type BoxComponent = <C extends ElementType = "div">(
  props: BoxProps<C>
) => React.ReactElement | null;

export const Box = forwardRef(
  (
    { as, className, ...props }: BoxProps<React.ElementType>,
    ref: React.Ref<unknown>
  ) => {
    const Component = as || "div";
    return (
      <Component ref={ref} className={cn("rnx-box", className)} {...props} />
    );
  }
) as unknown as BoxComponent;

Object.assign(Box, { displayName: "Box" });
