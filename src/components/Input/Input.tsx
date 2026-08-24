"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import { Label } from "../Label/Label";
import { rnx } from "../../utils/rnx";
import { warnInvalidProps } from "../../utils/warn";
import "./Input.css";

import { X } from "lucide-react";

/**
 * A basic text input field. Use in forms for short textual data.
 */
export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "prefix"
> {
  variant?: "outline" | "filled" | "glass" | "flushed";
  size?: "sm" | "md" | "lg";
  label?: string;
  error?: string;
  clearable?: boolean;
  onClear?: () => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const InputComponent = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      variant = "outline",
      size = "md",
      clearable = false,
      onClear,
      prefix,
      suffix,
      className = "",
      disabled,
      id: customId,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    if (process.env.NODE_ENV !== "production") {
      if (!label && !props["aria-label"] && !props["aria-labelledby"]) {
        warnInvalidProps(
          "Input",
          "An Input component was rendered without a `label`, `aria-label`, or `aria-labelledby` prop. This severely impacts accessibility.",
        );
      }
    }

    const ariaLabel =
      !label && !props["aria-label"] && !props["aria-labelledby"]
        ? "Input field"
        : props["aria-label"];

    const showClear =
      clearable && !disabled && value !== undefined && String(value).length > 0;

    const inputNode = (
      <input
        ref={ref}
        value={value}
        onChange={onChange}
        {...rnx({
          component: "Input",
          state: error ? "error" : disabled ? "disabled" : undefined,
        })}
        {...mergeProps(
          {
            id,
            disabled,
            className: cn(
              "rnx-input",
              `rnx-input--variant-${variant}`,
              `rnx-input--size-${size}`,
              error ? "rnx-input--error" : undefined,
              prefix ? "ps-9" : undefined,
              suffix || showClear ? "pe-9" : undefined,
              className,
            ),
            "aria-invalid": !!error,
            "aria-describedby": error ? `${id}-error` : undefined,
            "aria-label": ariaLabel,
          },
          props,
        )}
      />
    );

    let endAdornment: React.ReactNode = null;
    if (showClear) {
      endAdornment = (
        <button
          type="button"
          aria-label="Clear input"
          onClick={(e) => {
            e.preventDefault();
            onClear?.();
          }}
          className="rnx-input-clear-btn"
        >
          <X className="h-4 w-4" />
        </button>
      );
    } else if (suffix) {
      endAdornment = <Box className="rnx-input-suffix">{suffix}</Box>;
    }

    const hasAdornments = prefix || suffix || showClear;
    const wrappedInput = hasAdornments ? (
      <Box className="rnx-input-wrapper">
        {prefix && <Box className="rnx-input-prefix">{prefix}</Box>}
        {inputNode}
        {endAdornment}
      </Box>
    ) : (
      inputNode
    );

    if (!label && !error) {
      return wrappedInput;
    }

    return (
      <Box className={"rnx-input-container"}>
        {label && (
          <Label htmlFor={id} className={"rnx-input-label"}>
            {label}
          </Label>
        )}
        {wrappedInput}
        {error && (
          <Box as="span" id={`${id}-error`} className={"rnx-input-error-msg"}>
            {error}
          </Box>
        )}
      </Box>
    );
  },
);

InputComponent.displayName = "Input";

import { InputGroup } from "./InputGroup";
import { InputAddon } from "./InputAddon";
import { InputIcon } from "./InputIcon";

export const Input = Object.assign(InputComponent, {
  Group: InputGroup,
  Addon: InputAddon,
  Icon: InputIcon,
});
