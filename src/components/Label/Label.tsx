"use client";

import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import "./Label.css";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "rnx-label",
        // When used with peer inputs, we still rely on CSS peer-disabled from parent or handle disabled state via prop if needed
        // For standard HTML labels, peer-disabled is typically handled by standard CSS.
        // We will keep a helper class if someone wants to pass disabled state explicitly.
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";
