"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import { Label } from "../Label/Label";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  onValueChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      error,
      size = "md",
      id: customId,
      onValueChange,
      onChange,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    return (
      <Box className={cn("rnx-checkbox-wrapper", className)}>
        <Box className="rnx-checkbox-container">
          <input
            ref={ref}
            {...mergeProps(
              {
                type: "checkbox",
                id,
                className: "rnx-checkbox-input",
                "aria-invalid": !!error,
                "aria-describedby": error ? `${id}-error` : undefined,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  onChange?.(e);
                  onValueChange?.(e.target.checked);
                },
              },
              props
            )}
          />
          <Box
            className={cn(
              "rnx-checkbox-box",
              `rnx-checkbox-box--${size}`,
              error && "rnx-checkbox-box--error"
            )}
          >
            <svg
              className="rnx-checkbox-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </Box>
        </Box>
        {(label || children || error) && (
          <Box className="rnx-checkbox-content">
            {(label || children) && (
              <Label htmlFor={id} className="rnx-checkbox-label">
                {label || children}
              </Label>
            )}
            {error && (
              <Box
                as="span"
                id={`${id}-error`}
                className="rnx-checkbox-error-text"
              >
                {error}
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }
);

Checkbox.displayName = "Checkbox";
