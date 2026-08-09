"use client";
import { Box } from "../../atoms/Box";

import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import { Label } from "../Label/Label";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { useTheme } from "../ThemeProvider/ThemeProvider";
// Uses: Button, Input

import { cva, type VariantProps } from "class-variance-authority";

export const numberInputVariants = cva(
  "flex w-full rounded-md border border-input bg-transparent text-center ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] spin-button-hide",
  {
    variants: {
      size: {
        sm: "h-8 px-8 py-1 text-xs",
        md: "h-10 px-10 py-2 text-sm",
        lg: "h-12 px-12 py-3 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface NumberInputProps
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "type" | "value" | "onChange" | "size"
    >,
    VariantProps<typeof numberInputVariants> {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  error?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      value,
      onChange,
      min = -Infinity,
      max = Infinity,
      step = 1,
      label,
      error,
      size,
      disabled,
      ...props
    },
    ref
  ) => {
    const { config } = useTheme();
    const [internalValue, setInternalValue] = useState<string>(
      String(value ?? 0)
    );
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pointerUpRef = useRef<(() => void) | null>(null);
    // Always holds the latest action so the interval doesn't close over a stale value
    const actionRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      if (value !== undefined) {
        const parsedInternal = parseFloat(internalValue);
        if (Number.isNaN(parsedInternal) || parsedInternal !== value) {
          setInternalValue(String(value));
        }
      }
    }, [value, internalValue]);

    const updateValue = useCallback(
      (newValue: number) => {
        let clamped = Math.max(min, Math.min(max, newValue));
        if (Number.isNaN(clamped)) clamped = min !== -Infinity ? min : 0;
        if (value === undefined) setInternalValue(String(clamped));
        onChange?.(clamped);
      },
      [max, min, onChange, value]
    );

    const currentValue =
      value !== undefined ? value : parseFloat(internalValue) || 0;

    const handleIncrement = useCallback(() => {
      updateValue(currentValue + step);
    }, [currentValue, step, updateValue]);

    const handleDecrement = useCallback(() => {
      updateValue(currentValue - step);
    }, [currentValue, step, updateValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "-" || raw === "") {
        setInternalValue(raw);
        if (raw === "") onChange?.(0);
        return;
      }
      const parsed = parseFloat(raw);
      if (!Number.isNaN(parsed)) {
        setInternalValue(raw);
        updateValue(parsed);
      }
    };

    // Clear intervals on unmount to prevent zombie timers
    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (pointerUpRef.current) {
          window.removeEventListener("pointerup", pointerUpRef.current);
          pointerUpRef.current = null;
        }
      };
    }, []);

    const startContinuous = (action: () => void) => {
      if (disabled) return;
      stopContinuous();
      // Update ref so the interval always uses the freshest action
      actionRef.current = action;
      action();
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => actionRef.current?.(), 50);
      }, 500);

      // Stop if pointer is released anywhere outside the button
      const stopOnPointerUp = () => {
        stopContinuous();
        window.removeEventListener("pointerup", stopOnPointerUp);
        pointerUpRef.current = null;
      };
      pointerUpRef.current = stopOnPointerUp;
      window.addEventListener("pointerup", stopOnPointerUp);
    };

    const stopContinuous = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (pointerUpRef.current) {
        window.removeEventListener("pointerup", pointerUpRef.current);
        pointerUpRef.current = null;
      }
    };

    const buttonSizeClasses = {
      sm: "h-6 w-6",
      md: "h-8 w-8",
      lg: "h-10 w-10",
    };

    const iconSizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    };

    const currentButtonSize = buttonSizeClasses[size || "md"];
    const currentIconSize = iconSizeClasses[size || "md"];

    return (
      <Box
        className={cn(
          "grid w-full gap-1.5",
          `rounded-${config.radius}`,
          className
        )}
      >
        {label && <Label>{label}</Label>}
        <Box className="relative flex items-center">
          <Input
            ref={ref}
            {...mergeProps(
              {
                type: "number",
                value: value !== undefined ? internalValue : internalValue,
                onChange: handleInputChange,
                disabled,
                min,
                max,
                step,
                size: size ?? "md",
                className: cn(
                  numberInputVariants({ size }),
                  error && "border-destructive focus-visible:ring-destructive"
                ),
              },
              props
            )}
          />
          <Box className="absolute inset-y-1 start-1 flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("rounded-sm", currentButtonSize)}
              disabled={disabled || currentValue <= min}
              onMouseDown={() => startContinuous(handleDecrement)}
              onMouseUp={stopContinuous}
              onMouseLeave={stopContinuous}
              onTouchStart={() => startContinuous(handleDecrement)}
              onTouchEnd={stopContinuous}
              aria-label="Decrement"
            >
              <Minus className={currentIconSize} />
            </Button>
          </Box>
          <Box className="absolute inset-y-1 end-1 flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("rounded-sm", currentButtonSize)}
              disabled={disabled || currentValue >= max}
              onMouseDown={() => startContinuous(handleIncrement)}
              onMouseUp={stopContinuous}
              onMouseLeave={stopContinuous}
              onTouchStart={() => startContinuous(handleIncrement)}
              onTouchEnd={stopContinuous}
              aria-label="Increment"
            >
              <Plus className={currentIconSize} />
            </Button>
          </Box>
        </Box>
        {error && (
          <Box as="span" className="text-destructive text-xs font-medium">
            {error}
          </Box>
        )}
      </Box>
    );
  }
);
NumberInput.displayName = "NumberInput";
