import React, { forwardRef } from "react";
import { Box } from "../../atoms/Box";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import "./Input.css";

export interface InputIconProps extends React.HTMLAttributes<HTMLDivElement> {
  position: "left" | "right";
  children?: React.ReactNode;
}

export const InputIcon = forwardRef<HTMLDivElement, InputIconProps>(
  ({ position, className, children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={cn(
          "rnx-input-icon",
          `rnx-input-icon--${position}`,
          className
        )}
        {...mergeProps({}, props)}
      >
        {children}
      </Box>
    );
  }
);

InputIcon.displayName = "InputIcon";
