"use client";
import { Box } from "../../atoms/Box";
import React, { useState, forwardRef, useId } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";

import { cva, type VariantProps } from "class-variance-authority";
import { Label } from "../Label/Label";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { useTheme } from "../ThemeProvider/ThemeProvider";
// Uses: Button, Input

export const tagInputVariants = cva(
  "flex w-full flex-wrap items-center gap-2 rounded-md border border-input bg-background ring-offset-background transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "min-h-8 px-2 py-1 text-xs",
        md: "min-h-10 px-3 py-2 text-sm",
        lg: "min-h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface TagInputProps
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "value" | "onChange" | "size"
    >,
    VariantProps<typeof tagInputVariants> {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  inputContainerClassName?: string;
}

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      value,
      defaultValue = [],
      onChange,
      label,
      error,
      size,
      placeholder = "Add tag...",
      inputContainerClassName,
      className,
      id: customId,
      ...props
    },
    ref
  ) => {
    const { config } = useTheme();
    const [internalTags, setInternalTags] = useState<string[]>(defaultValue);
    const [inputValue, setInputValue] = useState("");

    const tags = value !== undefined ? value : internalTags;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const newTag = inputValue.trim().replace(/,$/, "");
        if (newTag) {
          if (!tags.includes(newTag)) {
            const newTags = [...tags, newTag];
            if (value === undefined) setInternalTags(newTags);
            onChange?.(newTags);
          }
          setInputValue("");
        }
      } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        e.preventDefault();
        const newTags = tags.slice(0, -1);
        if (value === undefined) setInternalTags(newTags);
        onChange?.(newTags);
      }
    };

    const removeTag = (indexToRemove: number) => {
      const newTags = tags.filter((_, index) => index !== indexToRemove);
      if (value === undefined) setInternalTags(newTags);
      onChange?.(newTags);
    };

    const generatedId = useId();
    const id = customId || generatedId;

    const tagSizes = {
      sm: "px-2 py-0 text-xs",
      md: "px-2.5 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    };
    const tagSize = tagSizes[size || "md"];

    return (
      <Box
        className={cn(
          "grid w-full gap-1.5",
          `rounded-${config.radius}`,
          className
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
        <Box
          className={cn(
            tagInputVariants({ size }),
            error && "border-destructive focus-within:ring-destructive",
            inputContainerClassName
          )}
        >
          {tags.map((tag, index) => (
            <Box
              as="span"
              key={index}
              className={cn(
                "bg-primary/10 text-primary focus:ring-ring inline-flex items-center gap-1 rounded-full font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none",
                tagSize
              )}
            >
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-primary/70 hover:text-primary h-4 w-4 rounded-full p-0"
                onClick={() => removeTag(index)}
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Box>
          ))}
          <Input
            ref={ref}
            {...mergeProps(
              {
                id,
                type: "text",
                className:
                  "placeholder:text-muted-foreground h-auto min-w-32 flex-1 border-0 bg-transparent p-0 ring-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                value: inputValue,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setInputValue(e.target.value),
                onKeyDown: handleKeyDown,
                placeholder: tags.length === 0 ? placeholder : "",
              },
              props
            )}
          />
        </Box>
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

TagInput.displayName = "TagInput";
