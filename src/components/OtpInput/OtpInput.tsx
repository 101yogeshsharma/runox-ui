"use client";
import { Box } from "../../atoms/Box";
import { Input } from "../Input/Input";
// Uses: Input
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import "./OtpInput.css";

import { cva, type VariantProps } from "class-variance-authority";

export const otpInputVariants = cva("rnx-otp-input", {
  variants: {
    size: {
      sm: "rnx-otp-input--size-sm",
      md: "rnx-otp-input--size-md",
      lg: "rnx-otp-input--size-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface OtpInputProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof otpInputVariants> {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  isPassword?: boolean;
  inputClassName?: string;
}

export const OtpInput = forwardRef<HTMLDivElement, OtpInputProps>(
  (
    {
      length = 6,
      value,
      onChange,
      error,
      disabled = false,
      isPassword = false,
      size,
      inputClassName,
      className,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string[]>(
      Array(length)
        .fill("")
        .map((_, i) => (value && value[i] ? value[i] : ""))
    );

    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(
          Array(length)
            .fill("")
            .map((_, i) => (value && value[i] ? value[i] : ""))
        );
      }
    }, [value, length]);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => {
      const val = e.target.value;
      if (!/^[0-9]*$/.test(val)) return; // Only allow numbers

      const currentArr =
        value !== undefined
          ? Array(length)
              .fill("")
              .map((_, i) => value[i] ?? "")
          : [...internalValue];

      const newArr = [...currentArr];
      // take the last character if they pasted or typed quickly
      newArr[index] = val.substring(val.length - 1);

      if (value === undefined) setInternalValue(newArr);

      onChange?.(newArr.join(""));

      // Move focus to next input
      if (val && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
      index: number
    ) => {
      const currentArr =
        value !== undefined
          ? Array(length)
              .fill("")
              .map((_, i) => value[i] ?? "")
          : [...internalValue];

      if (e.key === "Backspace" && !currentArr[index] && index > 0) {
        // Move focus to previous input on backspace if current is empty and clear its value
        const newArr = [...currentArr];
        newArr[index - 1] = "";
        if (value === undefined) setInternalValue(newArr);
        onChange?.(newArr.join(""));
        inputsRef.current[index - 1]?.focus();
      }
    };

    const handlePaste = (
      e: React.ClipboardEvent<HTMLInputElement>,
      startIndex: number
    ) => {
      e.preventDefault();
      const remaining = length - startIndex;
      const pastedData = e.clipboardData
        .getData("text/plain")
        .replace(/\D/g, "")
        .slice(0, remaining);
      if (!pastedData) return;

      const currentArr =
        value !== undefined
          ? Array(length)
              .fill("")
              .map((_, i) => value[i] ?? "")
          : [...internalValue];

      const newArr = [...currentArr];
      for (let i = 0; i < pastedData.length; i++) {
        newArr[startIndex + i] = pastedData[i];
      }

      if (value === undefined) setInternalValue(newArr);
      onChange?.(newArr.join(""));

      // Focus next available or last
      const nextIndex = Math.min(startIndex + pastedData.length, length - 1);
      inputsRef.current[nextIndex]?.focus();
    };

    // For controlled usage, derive the display array directly from the prop at render
    // time so there is no async useEffect delay that can drop keystrokes.
    const displayArr =
      value !== undefined
        ? Array(length)
            .fill("")
            .map((_, i) => value[i] ?? "")
        : internalValue;

    return (
      <Box
        ref={containerRef}
        {...mergeProps(
          {
            className: cn("rnx-otp-input-container", className),
          },
          props
        )}
      >
        <Box className="rnx-otp-input-group">
          {displayArr.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el as HTMLInputElement | null;
              }}
              type={isPassword ? "password" : "text"}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              disabled={disabled}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={(e) => handlePaste(e, index)}
              className={cn(
                otpInputVariants({ size }),
                error && "rnx-otp-input--error",
                inputClassName
              )}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
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

OtpInput.displayName = "OtpInput";
