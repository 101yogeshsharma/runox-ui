"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import { Label } from "../Label/Label";
import { useTheme } from "../ThemeProvider/ThemeProvider";
import "./Input.css";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  size?: "sm" | "md" | "lg";
  label?: string;
  error?: string;
}

const InputComponent = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      size = "md",
      className = "",
      disabled,
      id: customId,
      ...props
    },
    ref
  ) => {
    const { config } = useTheme();
    const generatedId = useId();
    const id = customId || generatedId;

    const inputNode = (
      <input
        ref={ref}
        {...mergeProps(
          {
            id,
            disabled,
            className: cn(
              "rnx-input",
              `rnx-input--size-${size}`,
              `rounded-${config.radius}`,
              error && "rnx-input--error",
              className
            ),
            "aria-invalid": !!error,
            "aria-describedby": error ? `${id}-error` : undefined,
          },
          props
        )}
      />
    );

    if (!label && !error) {
      return inputNode;
    }

    return (
      <Box className={"rnx-input-container"}>
        {label && (
          <Label htmlFor={id} className={"rnx-input-label"}>
            {label}
          </Label>
        )}
        {inputNode}
        {error && (
          <Box as="span" id={`${id}-error`} className={"rnx-input-error-msg"}>
            {error}
          </Box>
        )}
      </Box>
    );
  }
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
