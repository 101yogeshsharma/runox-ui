"use client";
import { Box } from "../../atoms/Box";

import React, { forwardRef, useState, useEffect } from "react";
import { Eye, EyeOff, Keyboard } from "lucide-react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import { Label } from "../Label/Label";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { Tooltip } from "../Tooltip";
// Uses: Button, Input, Tooltip
import { rnx } from "../../utils/rnx";

import { cva, type VariantProps } from "class-variance-authority";
import { withLoading } from "../../utils/withLoading";

import "./PasswordInput.css";

export const passwordInputVariants = cva("rnx-password-input", {
  variants: {
    size: {
      sm: "rnx-password-input--sm",
      md: "rnx-password-input--md",
      lg: "rnx-password-input--lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

/**
 * Props for the PasswordInput component.
 */
export interface PasswordInputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof passwordInputVariants> {
  variant?: "outline" | "filled" | "glass" | "flushed";
  label?: string;
  error?: string;
  patternMessage?: string;
  minLengthMessage?: string;
  maxLengthMessage?: string;
  requiredMessage?: string;
}

const PasswordInputBase = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      label,
      error,
      variant = "outline",
      size = "md",
      disabled,
      patternMessage,
      minLengthMessage,
      maxLengthMessage,
      requiredMessage,
      onBlur,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [capsLockActive, setCapsLockActive] = useState(false);
    const [internalError, setInternalError] = useState("");
    const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

    // Clear debounce timer on unmount to prevent state updates after unmount
    useEffect(() => {
      return () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
      };
    }, []);

    // Caps Lock detection is scoped to the input via onKeyDown/onKeyUp/onFocus
    // handlers below — no global window listener needed.

    const togglePassword = () => {
      if (disabled) return;
      setShowPassword(!showPassword);
    };

    const validate = (input: HTMLInputElement) => {
      if (input.validity.valueMissing)
        return requiredMessage || input.validationMessage;
      if (input.validity.tooShort)
        return minLengthMessage || input.validationMessage;
      if (input.validity.tooLong)
        return maxLengthMessage || input.validationMessage;
      if (input.validity.patternMismatch)
        return patternMessage || input.validationMessage;
      return "";
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setInternalError(validate(e.target));
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      const input = e.target;
      debounceTimer.current = setTimeout(() => {
        setInternalError(validate(input));
      }, 1500);

      onChange?.(e);
    };

    const displayError = error || internalError;

    return (
      <Box
        className={cn("rnx-password-input-container", className)}
        {...rnx({
          component: "PasswordInput",
          state: disabled ? "disabled" : "active",
        })}
      >
        {label && <Label>{label}</Label>}
        <Box className="rnx-password-input-wrapper">
          <Input
            ref={ref}
            variant={variant}
            {...mergeProps(
              {
                type: showPassword ? "text" : "password",
                disabled,
                onBlur: handleBlur,
                onChange: handleChange,
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
                  setCapsLockActive(e.getModifierState("CapsLock")),
                onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) =>
                  setCapsLockActive(e.getModifierState("CapsLock")),
                size: size ?? "md",
                className: cn(
                  passwordInputVariants({ size }),
                  displayError && "rnx-password-input--error",
                ),
              },
              props,
            )}
          />
          <Box className="rnx-password-input-actions">
            {capsLockActive && (
              <Tooltip content="Caps Lock is ON">
                <Box
                  className={cn(
                    "rnx-password-capslock-indicator",
                    `rnx-password-capslock-indicator--size-${size || "md"}`,
                  )}
                >
                  <Keyboard
                    className={`rnx-password-input-icon--size-${size || "md"}`}
                  />
                </Box>
              </Tooltip>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className={cn(
                "rnx-password-input-btn",
                `rnx-password-input-btn--size-${size || "md"}`,
              )}
              disabled={disabled}
              onClick={togglePassword}
            >
              {showPassword ? (
                <EyeOff
                  className={`rnx-password-input-icon--size-${size || "md"}`}
                />
              ) : (
                <Eye
                  className={`rnx-password-input-icon--size-${size || "md"}`}
                />
              )}
            </Button>
          </Box>
        </Box>
        {displayError && (
          <Box as="span" className="rnx-password-input-error-msg">
            {displayError}
          </Box>
        )}
      </Box>
    );
  },
);
PasswordInputBase.displayName = "PasswordInput";
export const PasswordInput = withLoading(PasswordInputBase);
