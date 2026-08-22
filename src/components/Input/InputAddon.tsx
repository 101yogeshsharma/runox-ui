import React, { forwardRef } from "react";
import { Box } from "../../atoms/Box";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import "./Input.css";
import { withLoading } from "../../utils/withLoading";


/**
 * Props for the InputAddon component.
 */
export interface InputAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  position: "before" | "after";
  children?: React.ReactNode;
}

const InputAddonBase = forwardRef<HTMLDivElement, InputAddonProps>(
  ({ position, className, children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={cn(
          "rnx-input-addon",
          `rnx-input-addon--${position}`,
          className
        )}
        {...mergeProps({}, props)}
      >
        {children}
      </Box>
    );
  }
);

InputAddonBase.displayName = "InputAddon";
export const InputAddon = withLoading(InputAddonBase);
