"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import { Label } from "../Label/Label";
import { useTheme } from "../ThemeProvider/ThemeProvider";

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  size?: "sm" | "md" | "lg";
  onValueChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      label,
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
    const { config } = useTheme();

    return (
      <Box
        className={cn(
          "rnx-switch-wrapper",
          `rounded-${config.radius}`,
          className
        )}
      >
        <Box
          className={cn(
            "rnx-switch-container",
            `rnx-switch-container--${size}`
          )}
        >
          <input
            ref={ref}
            {...mergeProps(
              {
                type: "checkbox",
                role: "switch",
                id,
                className: "rnx-switch-input",
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  onChange?.(e);
                  onValueChange?.(e.target.checked);
                },
              },
              props
            )}
          />
          <Box
            as="span"
            className={cn("rnx-switch-thumb", `rnx-switch-thumb--${size}`)}
          />
        </Box>
        {(label || children) && (
          <Label htmlFor={id} className="rnx-switch-label">
            {label || children}
          </Label>
        )}
      </Box>
    );
  }
);

Switch.displayName = "Switch";
