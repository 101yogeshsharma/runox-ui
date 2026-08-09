"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";

import { cva, type VariantProps } from "class-variance-authority";
import { Label } from "../Label/Label";
import { useTheme } from "../ThemeProvider/ThemeProvider";

export const textareaVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "min-h-16 px-3 py-2 text-xs",
        md: "min-h-20 px-3 py-2 text-sm",
        lg: "min-h-32 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  containerClassName?: string;
  resize?: "none" | "both" | "horizontal" | "vertical";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      size,
      resize = "both",
      className,
      containerClassName,
      disabled,
      id: customId,
      style,
      ...props
    },
    ref
  ) => {
    const { config } = useTheme();
    const generatedId = useId();
    const id = customId || generatedId;

    return (
      <Box
        className={cn(
          "grid w-full gap-1.5",
          `rounded-${config.radius}`,
          containerClassName
        )}
      >
        {label && (
          <Label
            htmlFor={id}
            className="text-foreground text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
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
                textareaVariants({ size }),
                error && "border-destructive focus-visible:ring-destructive",
                className
              ),
              "aria-invalid": !!error,
              "aria-describedby": error ? `${id}-error` : undefined,
            },
            props
          )}
        />

        {error && (
          <Box
            as="span"
            id={`${id}-error`}
            className="text-destructive text-xs font-medium"
          >
            {error}
          </Box>
        )}
      </Box>
    );
  }
);

Textarea.displayName = "Textarea";
