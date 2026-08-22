import React, { forwardRef } from "react";
import { Box } from "../../atoms/Box";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import "./Input.css";

/**
 * Props for the InputGroup component.
 */
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

import { withLoading } from "../../utils/withLoading";

const InputGroupBase = forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={cn("rnx-input-group", className)}
        {...mergeProps({}, props)}
      >
        {children}
      </Box>
    );
  }
);

InputGroupBase.displayName = "InputGroup";
export const InputGroup = withLoading(InputGroupBase);
