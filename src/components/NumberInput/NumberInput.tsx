"use client";
import { Box } from "../../atoms/Box";

import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  useId,
} from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import { Label } from "../Label/Label";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
// Uses: Button, Input
import { rnx } from "../../utils/rnx";

import { cva, type VariantProps } from "class-variance-authority";
import { withLoading } from "../../utils/withLoading";

import "./NumberInput.css";

export const numberInputVariants = cva("rnx-number-input", {
  variants: {
    size: {
      sm: "rnx-number-input--sm",
      md: "rnx-number-input--md",
      lg: "rnx-number-input--lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

/**
 * Props for the NumberInput component.
 */
export interface NumberInputProps
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "type" | "value" | "onChange" | "size"
    >,
    VariantProps<typeof numberInputVariants> {
  variant?: "outline" | "filled" | "glass" | "flushed";
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  error?: string;
}

const NumberInputBase = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      value,
      defaultValue,
      onChange,
      min = -Infinity,
      max = Infinity,
      step = 1,
      label,
      error,
      variant = "outline",
      size = "md",
      disabled,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState<string>(
      String(value ?? defaultValue ?? 0),
    );
    const generatedId = useId();
    const id = props.id || generatedId;
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
      [max, min, onChange, value],
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

    return (
      <Box
        className={cn("rnx-number-input-container", className)}
        {...rnx({
          component: "NumberInput",
          state: disabled ? "disabled" : "active",
        })}
      >
        {label && <Label htmlFor={id}>{label}</Label>}
        <Box className="rnx-number-input-wrapper">
          <Input
            ref={ref}
            variant={variant}
            {...mergeProps(
              {
                type: "number",
                value: internalValue,
                onChange: handleInputChange,
                disabled,
                min,
                max,
                step,
                size: size ?? "md",
                className: cn(
                  numberInputVariants({ size }),
                  error && "rnx-number-input--error",
                ),
              },
              props,
            )}
          />
          <Box className="rnx-number-input-btn-wrapper rnx-number-input-btn-wrapper--start">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "rnx-number-input-btn",
                `rnx-number-input-btn--size-${size || "md"}`,
              )}
              disabled={disabled || currentValue <= min}
              onMouseDown={() => startContinuous(handleDecrement)}
              onMouseUp={stopContinuous}
              onMouseLeave={stopContinuous}
              onTouchStart={() => startContinuous(handleDecrement)}
              onTouchEnd={stopContinuous}
              aria-label="Decrement"
            >
              <Minus
                className={`rnx-number-input-icon--size-${size || "md"}`}
              />
            </Button>
          </Box>
          <Box className="rnx-number-input-btn-wrapper rnx-number-input-btn-wrapper--end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "rnx-number-input-btn",
                `rnx-number-input-btn--size-${size || "md"}`,
              )}
              disabled={disabled || currentValue >= max}
              onMouseDown={() => startContinuous(handleIncrement)}
              onMouseUp={stopContinuous}
              onMouseLeave={stopContinuous}
              onTouchStart={() => startContinuous(handleIncrement)}
              onTouchEnd={stopContinuous}
              aria-label="Increment"
            >
              <Plus className={`rnx-number-input-icon--size-${size || "md"}`} />
            </Button>
          </Box>
        </Box>
        {error && (
          <Box as="span" className="rnx-number-input-error-msg">
            {error}
          </Box>
        )}
      </Box>
    );
  },
);
NumberInputBase.displayName = "NumberInput";
export const NumberInput = withLoading(NumberInputBase);
