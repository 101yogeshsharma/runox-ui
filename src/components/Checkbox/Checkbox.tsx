"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import { Label } from "../Label/Label";
import { rnx } from "../../utils/rnx";
import { withLoading } from "../../utils/withLoading";
import "./Checkbox.css";

import { useMergeRefs } from "../../hooks/useMergeRefs";

import { RnxColor } from "../../types";

/**
 * A control that allows the user to toggle between checked and unchecked states.
 */
export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "color"
> {
  variant?: "default" | "card" | "pill" | "subtle" | "ghost";
  color?: RnxColor;
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
  labelPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
  onValueChange?: (checked: boolean) => void;
}

function getCheckboxState(
  disabled?: boolean,
  error?: boolean,
  indeterminate?: boolean,
  checked?: boolean,
): string {
  if (disabled) return "disabled";
  if (error) return "error";
  if (indeterminate) return "indeterminate";
  if (checked) return "checked";
  return "default";
}

function getAriaDescribedBy(
  id: string,
  error?: boolean,
  description?: React.ReactNode,
): string | undefined {
  if (error) return `${id}-error`;
  if (description) return `${id}-desc`;
  return undefined;
}

const CheckboxBase = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant = "default",
      color = "primary",
      label,
      description,
      error,
      indeterminate = false,
      labelPosition = "right",
      size = "md",
      id: customId,
      onValueChange,
      onChange,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const internalRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = useMergeRefs(ref, internalRef);

    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const state = getCheckboxState(
      props.disabled,
      !!error,
      indeterminate,
      props.checked,
    );
    const ariaDescribedBy = getAriaDescribedBy(id, !!error, description);

    return (
      <Box
        className={cn(
          "rnx-checkbox-wrapper",
          `rnx-checkbox-wrapper--variant-${variant}`,
          color && `rnx-checkbox-wrapper--color-${color}`,
          labelPosition === "left" && "rnx-checkbox-wrapper--label-left",
          className,
        )}
        {...rnx({
          component: "Checkbox",
          state,
        })}
      >
        <Box className="rnx-checkbox-container">
          <input
            ref={mergedRef}
            {...mergeProps(
              {
                type: "checkbox",
                id,
                className: "rnx-checkbox-input",
                "aria-invalid": !!error,
                "aria-describedby": ariaDescribedBy,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  onChange?.(e);
                  onValueChange?.(e.target.checked);
                },
              },
              props,
            )}
          />
          <Box
            className={cn(
              "rnx-checkbox-box",
              `rnx-checkbox-box--${size}`,
              error && "rnx-checkbox-box--error",
            )}
          >
            {indeterminate ? (
              <svg
                className="rnx-checkbox-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            ) : (
              <svg
                className="rnx-checkbox-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </Box>
        </Box>
        {(label || children || description || error) && (
          <Box className="rnx-checkbox-content">
            {(label || children) && (
              <Label htmlFor={id} className="rnx-checkbox-label">
                {label || children}
              </Label>
            )}
            {description && (
              <Box
                as="span"
                id={`${id}-desc`}
                className="rnx-checkbox-description"
              >
                {description}
              </Box>
            )}
            {error && (
              <Box
                as="span"
                id={`${id}-error`}
                className="rnx-checkbox-error-text"
              >
                {error}
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  },
);

CheckboxBase.displayName = "Checkbox";
export const Checkbox = withLoading(CheckboxBase);
