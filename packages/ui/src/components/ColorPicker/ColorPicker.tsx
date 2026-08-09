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

export const colorPickerVariants = cva(
  "flex w-full items-center justify-between rounded-md border border-input bg-transparent ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 px-3 py-1 text-xs",
        md: "h-10 px-3 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

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

export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      className,
      value,
      onChange,
      label,
      error,
      size,
      disabled,
      swatches = DEFAULT_SWATCHES,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>(
      value || "#000000"
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
        ref={ref}
        className={cn("grid w-full gap-1.5", className)}
        {...props}
      >
        {label && <Label>{label}</Label>}

        <Popover
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          align="start"
          className="w-64 p-3"
          trigger={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                colorPickerVariants({ size }),
                error && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <Box className="flex items-center gap-2">
                <Box
                  className={cn(
                    "ring-border rounded-full border shadow-sm ring-1",
                    size === "lg" ? "h-5 w-5" : "h-4 w-4"
                  )}
                  style={{ backgroundColor: displayValue }}
                />
                <Box as="span" className="uppercase">
                  {displayValue}
                </Box>
              </Box>
              <Paintbrush
                className={cn(
                  "text-muted-foreground",
                  size === "lg" ? "h-5 w-5" : "h-4 w-4"
                )}
              />
            </Button>
          }
        >
          <Box className="flex flex-col gap-3">
            <Box className="grid grid-cols-7 gap-2">
              {swatches.map((color) => (
                <Button
                  key={color}
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "border-border/50 flex h-6 w-6 items-center justify-center rounded-md border p-0 shadow-sm transition-transform hover:scale-110",
                    displayValue === color &&
                      "ring-ring scale-110 ring-2 ring-offset-1"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    handleChange(color);
                  }}
                  title={color}
                >
                  {displayValue.toLowerCase() === color.toLowerCase() && (
                    <Check
                      className={cn(
                        "h-3 w-3",
                        // White text on dark colors, dark text on light colors
                        color.toLowerCase() === "#ffffff"
                          ? "text-black"
                          : "text-white"
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
          <Box as="span" className="text-destructive text-xs font-medium">
            {error}
          </Box>
        )}
      </Box>
    );
  }
);
ColorPicker.displayName = "ColorPicker";
