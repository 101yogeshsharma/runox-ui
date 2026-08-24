"use client";

import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import "./Label.css";
import { withLoading } from "../../utils/withLoading";


/**
 * Props for the Label component.
 */
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  requiredIndicator?: boolean;
  optionalText?: string;
  subLabel?: string;
}

const LabelBase = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      className,
      size = "md",
      disabled = false,
      requiredIndicator = false,
      optionalText,
      subLabel,
      children,
      ...props
    },
    ref
  ) => (
    <label
      ref={ref}
      className={cn(
        "rnx-label",
        `rnx-label--size-${size}`,
        disabled && "rnx-label--disabled",
        className
      )}
      {...props}
    >
      <span>
        {children}
        {requiredIndicator && <span className="rnx-label-required" aria-hidden="true">*</span>}
        {optionalText && <span className="rnx-label-optional">({optionalText})</span>}
        {subLabel && <span className="rnx-label-subtext">{subLabel}</span>}
      </span>
    </label>
  )
);
LabelBase.displayName = "Label";
export const Label = withLoading(LabelBase);
