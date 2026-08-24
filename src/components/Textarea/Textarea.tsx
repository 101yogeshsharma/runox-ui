"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";

import { cva, type VariantProps } from "class-variance-authority";
import { Label } from "../Label/Label";
import { rnx } from "../../utils/rnx";
import { withLoading } from "../../utils/withLoading";

import "./Textarea.css";

export const textareaVariants = cva("rnx-textarea", {
  variants: {
    variant: {
      outline: "rnx-textarea--variant-outline",
      filled: "rnx-textarea--variant-filled",
      glass: "rnx-textarea--variant-glass",
      flushed: "rnx-textarea--variant-flushed",
    },
    size: {
      sm: "rnx-textarea--size-sm",
      md: "rnx-textarea--size-md",
      lg: "rnx-textarea--size-lg",
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

/**
 * A multi-line text input field. Use in forms for long description fields, comments, or document body inputs.
 */
export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  containerClassName?: string;
  resize?: "none" | "both" | "horizontal" | "vertical";
}

const TextareaBase = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      variant = "outline",
      size = "md",
      resize = "both",
      className,
      containerClassName,
      disabled,
      id: customId,
      style,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    let textareaState = "default";
    if (disabled) {
      textareaState = "disabled";
    } else if (error) {
      textareaState = "error";
    }

    return (
      <Box
        className={cn("rnx-textarea-container", containerClassName)}
        {...rnx({
          component: "Textarea",
          state: textareaState,
        })}
      >
        {label && (
          <Label htmlFor={id} className="rnx-textarea-label">
            {label}
          </Label>
        )}

        <textarea
          ref={ref}
          {...mergeProps(
            {
              id,
              disabled,
              style: { resize, ...style },
              className: cn(
                textareaVariants({ variant, size }),
                error && "rnx-textarea--error",
                className,
              ),
              "aria-invalid": !!error,
              "aria-describedby": error ? `${id}-error` : undefined,
            },
            props,
          )}
        />

        {error && (
          <Box as="span" id={`${id}-error`} className="rnx-textarea-error-msg">
            {error}
          </Box>
        )}
      </Box>
    );
  },
);

TextareaBase.displayName = "Textarea";
export const Textarea = withLoading(TextareaBase);
