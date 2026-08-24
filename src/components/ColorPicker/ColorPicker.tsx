"use client";
import { Box } from "../../atoms/Box";

import React, { forwardRef, useState, useEffect } from "react";
import { Popover } from "../Popover/Popover";
import { Label } from "../Label/Label";
import { Input } from "../Input";
import { Button } from "../Button";
import { Paintbrush, Check } from "lucide-react";
import { cn } from "../../utils/cn";
// Uses: Button, Input, Popover

import { cva, type VariantProps } from "class-variance-authority";
import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";

import "./ColorPicker.css";

export const colorPickerVariants = cva("rnx-color-picker-trigger", {
  variants: {
    variant: {
      outline: "rnx-color-picker-trigger--variant-outline",
      filled: "rnx-color-picker-trigger--variant-filled",
      glass: "rnx-color-picker-trigger--variant-glass",
      subtle: "rnx-color-picker-trigger--variant-subtle",
    },
    size: {
      sm: "rnx-color-picker-trigger--size-sm",
      md: "rnx-color-picker-trigger--size-md",
      lg: "rnx-color-picker-trigger--size-lg",
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

/**
 * Props for the ColorPicker component.
 */
export interface ColorPickerProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof colorPickerVariants> {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  swatches?: string[];
}

const DEFAULT_SWATCHES = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#06b6d4", // cyan-500
  "#0ea5e9", // sky-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a855f7", // purple-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
  "#64748b", // slate-500
  "#71717a", // zinc-500
  "#000000", // black
  "#ffffff", // white
];

const ColorPickerBase = forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      className,
      value,
      onChange,
      label,
      error,
      size,
      variant,
      disabled,
      swatches = DEFAULT_SWATCHES,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState<string>(
      value || "#000000",
    );
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const handleChange = (newColor: string) => {
      setInternalValue(newColor);
      onChange?.(newColor);
    };

    const displayValue = value !== undefined ? value : internalValue;

    return (
      <Box
        {...rnx({
          component: "ColorPicker",
          state: disabled ? "disabled" : "active",
        })}
        ref={ref}
        className={cn("rnx-color-picker-container", className)}
        {...props}
      >
        {label && <Label>{label}</Label>}

        <Popover
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          align="start"
          className="w-64 p-3"
          trigger={
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "rnx-color-picker-trigger",
                colorPickerVariants({ variant, size }),
                error &&
                  "rnx-color-picker-trigger--error border-destructive focus-visible:ring-destructive",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <Box className="flex items-center gap-2">
                <Box
                  className={cn(
                    "rnx-color-picker-preview",
                    `rnx-color-picker-preview--${size || "md"}`,
                  )}
                  style={{ backgroundColor: displayValue }}
                />
                <Box
                  as="span"
                  className="uppercase font-medium text-xs font-mono"
                >
                  {displayValue}
                </Box>
              </Box>
              <Paintbrush
                className={cn(
                  "text-muted-foreground",
                  size === "lg" ? "h-5 w-5" : "h-4 w-4",
                )}
              />
            </button>
          }
        >
          <Box className="flex flex-col gap-3">
            <Box
              className="grid grid-cols-7 gap-2"
              role="group"
              aria-label="Color swatches"
            >
              {swatches.map((color) => (
                <Button
                  key={color}
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rnx-color-picker-swatch",
                    displayValue.toLowerCase() === color.toLowerCase() &&
                      "rnx-color-picker-swatch--active",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    handleChange(color);
                  }}
                  title={color}
                  aria-label={`Select color ${color}`}
                >
                  {displayValue.toLowerCase() === color.toLowerCase() && (
                    <Check
                      className={cn(
                        "h-3 w-3",
                        // White text on dark colors, dark text on light colors
                        color.toLowerCase() === "#ffffff"
                          ? "text-black"
                          : "text-white",
                      )}
                    />
                  )}
                </Button>
              ))}
            </Box>

            <Box className="border-border flex items-center gap-2 border-t pt-2">
              <Box
                className="h-8 w-8 shrink-0 rounded-md border shadow-sm"
                style={{ backgroundColor: displayValue }}
              />
              <Input
                value={displayValue}
                onChange={(e) => handleChange(e.target.value)}
                className="h-8 flex-1 font-mono text-xs uppercase"
                placeholder="#000000"
              />
            </Box>
          </Box>
        </Popover>

        {error && (
          <Box as="span" className="rnx-color-picker-error-msg">
            {error}
          </Box>
        )}
      </Box>
    );
  },
);
ColorPickerBase.displayName = "ColorPicker";
export const ColorPicker = withLoading(ColorPickerBase);
