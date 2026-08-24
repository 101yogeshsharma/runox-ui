"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef, useId, useState } from "react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import { Label } from "../Label/Label";
import { rnx } from "../../utils/rnx";
import { withLoading } from "../../utils/withLoading";

import "./Switch.css";

/**
 * A toggle switch that allows users to choose between binary states.
 */
import { RnxColor } from "../../types";

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "color"
> {
  variant?: "solid" | "glow" | "glass";
  color?: RnxColor;
  thumbIconOn?: React.ReactNode;
  thumbIconOff?: React.ReactNode;
  label?: string;
  size?: "sm" | "md" | "lg";
  onValueChange?: (checked: boolean) => void;
}

const SwitchBase = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      variant = "solid",
      color = "primary",
      thumbIconOn,
      thumbIconOff,
      label,
      size = "md",
      id: customId,
      onValueChange,
      onChange,
      children,
      checked: controlledChecked,
      defaultChecked,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    const [uncontrolledChecked, setUncontrolledChecked] =
      useState(!!defaultChecked);
    const isChecked =
      controlledChecked !== undefined ? controlledChecked : uncontrolledChecked;

    let switchState = "default";
    if (props.disabled) {
      switchState = "disabled";
    } else if (isChecked) {
      switchState = "checked";
    }

    return (
      <Box
        className={cn("rnx-switch-wrapper", className)}
        {...rnx({
          component: "Switch",
          state: switchState,
        })}
      >
        <Box
          className={cn(
            "rnx-switch-container",
            `rnx-switch-container--${size}`,
            `rnx-switch-container--variant-${variant}`,
            color !== "primary" && `rnx-switch-container--color-${color}`,
          )}
        >
          <input
            ref={ref}
            {...mergeProps(
              {
                type: "checkbox",
                role: "switch",
                id,
                checked: controlledChecked,
                defaultChecked,
                className: "rnx-switch-input",
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  if (controlledChecked === undefined) {
                    setUncontrolledChecked(e.target.checked);
                  }
                  onChange?.(e);
                  onValueChange?.(e.target.checked);
                },
              },
              props,
            )}
          />
          <Box
            as="span"
            className={cn("rnx-switch-thumb", `rnx-switch-thumb--${size}`)}
          >
            {isChecked ? thumbIconOn : thumbIconOff}
          </Box>
        </Box>
        {(label || children) && (
          <Label htmlFor={id} className="rnx-switch-label">
            {label || children}
          </Label>
        )}
      </Box>
    );
  },
);

SwitchBase.displayName = "Switch";
export const Switch = withLoading(SwitchBase);
