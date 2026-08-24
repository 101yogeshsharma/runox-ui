"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";
import { Label } from "../Label/Label";
import { useControllableState } from "../../hooks/useControllableState";
import { mergeProps } from "../../utils/mergeProps";
import "./Slider.css";
import { rnx } from "../../utils/rnx";
import { withLoading } from "../../utils/withLoading";

import { RnxColor } from "../../types";

/**
 * An interactive bar allowing users to select single or range values by sliding a thumb control.
 */
export interface SliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "color" | "min" | "max" | "step"
> {
  variant?: "solid" | "glass";
  label?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  color?: RnxColor;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  formatLabel?: (value: number) => React.ReactNode;
}

const SliderBase = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      variant = "solid",
      label,
      error,
      size = "md",
      color = "primary",
      id: customId,
      value,
      defaultValue,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      showValue,
      formatLabel,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    const [currentValue = min, setCurrentValue] = useControllableState({
      prop: value,
      defaultProp: defaultValue ?? min,
      onChange: onValueChange,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setCurrentValue(val);
    };

    const ratio =
      max === min
        ? 0
        : Math.max(0, Math.min(1, (currentValue - min) / (max - min)));
    const displayValue = showValue ?? !!label;

    return (
      <Box
        className={cn("rnx-slider-container", className)}
        {...rnx({
          component: "Slider",
          state: props.disabled ? "disabled" : error ? "error" : "default",
        })}
      >
        {(label || displayValue) && (
          <Box className="rnx-slider-header">
            {label ? (
              <Label htmlFor={id} className="rnx-slider-label">
                {label}
              </Label>
            ) : (
              <Box />
            )}
            {displayValue && (
              <Box as="span" className="rnx-slider-value">
                {formatLabel ? formatLabel(currentValue) : currentValue}
              </Box>
            )}
          </Box>
        )}
        <Box
          className={cn(
            "rnx-slider-wrapper",
            `rnx-slider--${size}`,
            `rnx-slider--color-${color}`,
            variant && variant !== "solid" && `rnx-slider--variant-${variant}`,
            error && "rnx-slider--error",
          )}
          style={{ "--slider-ratio": ratio } as React.CSSProperties}
        >
          {/* Invisible Interactive Input */}
          <input
            {...mergeProps(
              {
                type: "range",
                ref,
                id,
                min,
                max,
                step,
                value: currentValue,
                onChange: handleChange,
                className: "rnx-slider-input",
                "aria-invalid": !!error,
                "aria-label":
                  typeof label === "string"
                    ? label
                    : props["aria-label"] || "Slider",
                "aria-valuenow": currentValue,
                "aria-valuemin": min,
                "aria-valuemax": max,
              },
              props,
            )}
          />

          {/* Visual Track */}
          <Box className="rnx-slider-track">
            {/* Visual Range */}
            <Box className="rnx-slider-range" />
          </Box>

          {/* Visual Thumb Dot */}
          <Box className="rnx-slider-thumb" />
        </Box>
        {error && (
          <Box as="span" className="rnx-slider-error-text">
            {error}
          </Box>
        )}
      </Box>
    );
  },
);

SliderBase.displayName = "Slider";
export const Slider = withLoading(SliderBase);
