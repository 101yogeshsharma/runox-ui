import React, { forwardRef } from "react";
import { Box } from "../../atoms/Box";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import "./Input.css";

export interface InputAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  position: "before" | "after";
  children?: React.ReactNode;
}

export const InputAddon = forwardRef<HTMLDivElement, InputAddonProps>(
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

InputAddon.displayName = "InputAddon";
