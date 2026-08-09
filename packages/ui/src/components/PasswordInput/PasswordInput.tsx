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
import { useTheme } from "../ThemeProvider/ThemeProvider";
// Uses: Button, Input, Tooltip

import { cva, type VariantProps } from "class-variance-authority";

export const passwordInputVariants = cva(
  "flex w-full rounded-md border border-input bg-transparent ring-offset-background file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      size: {
        sm: "h-8 px-3 py-1 text-xs pe-16 file:text-xs",
        md: "h-10 px-3 py-2 text-sm pe-20 file:text-sm",
        lg: "h-12 px-4 py-3 text-base pe-24 file:text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface PasswordInputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof passwordInputVariants> {
  label?: string;
  error?: string;
  patternMessage?: string;
  minLengthMessage?: string;
  maxLengthMessage?: string;
  requiredMessage?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      label,
      error,
      size,
      disabled,
      patternMessage,
      minLengthMessage,
      maxLengthMessage,
      requiredMessage,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const { config } = useTheme();
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
    const displayError = error || internalError;

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
                  displayError &&
                    "border-destructive focus-visible:ring-destructive"
                ),
              },
              props
            )}
          />
          <Box className="absolute inset-y-1 end-1 flex items-center gap-1">
            {capsLockActive && (
              <Tooltip content="Caps Lock is ON">
                <Box
                  className={cn(
                    "text-warning flex items-center justify-center",
                    currentButtonSize
                  )}
                >
                  <Keyboard className={currentIconSize} />
                </Box>
              </Tooltip>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:text-foreground",
                currentButtonSize
              )}
              disabled={disabled}
              onClick={togglePassword}
            >
              {showPassword ? (
                <EyeOff className={currentIconSize} />
              ) : (
                <Eye className={currentIconSize} />
              )}
            </Button>
          </Box>
        </Box>
        {displayError && (
          <Box as="span" className="text-destructive text-xs font-medium">
            {displayError}
          </Box>
        )}
      </Box>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
