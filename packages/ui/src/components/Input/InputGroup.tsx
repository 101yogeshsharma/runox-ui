import React, { forwardRef } from "react";
import { Box } from "../../atoms/Box";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import "./Input.css";

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

import { useTheme } from "../ThemeProvider/ThemeProvider";

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, ...props }, ref) => {
    const { config } = useTheme();
    return (
      <Box
        ref={ref}
        className={cn("rnx-input-group", `rounded-${config.radius}`, className)}
        {...mergeProps({}, props)}
      >
        {children}
      </Box>
    );
  }
);

InputGroup.displayName = "InputGroup";
