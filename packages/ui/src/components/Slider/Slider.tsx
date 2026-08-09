"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";
import { Label } from "../Label/Label";
import { useControllableState } from "../../hooks/useControllableState";
import { mergeProps } from "../../utils/mergeProps";
import { useTheme } from "../ThemeProvider/ThemeProvider";
import "./Slider.css";

export interface SliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "color" | "min" | "max" | "step"
> {
  label?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "danger";
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  formatLabel?: (value: number) => React.ReactNode;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
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
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const { config } = useTheme();

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
        className={cn(
          "rnx-slider-container",
          `rounded-${config.radius}`,
          className
        )}
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
            `rnx-slider--${color}`,
            error && "rnx-slider--error"
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
              },
              props
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
  }
);

Slider.displayName = "Slider";
