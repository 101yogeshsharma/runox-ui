"use client";
import { Box } from "../../atoms/Box";
import React, { useState, forwardRef, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

import { cva, type VariantProps } from "class-variance-authority";
import { Label } from "../Label/Label";
import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";
import { RnxColor } from "../../types";

import "./TagInput.css";

export const tagInputVariants = cva("rnx-tag-input-wrapper", {
  variants: {
    variant: {
      outline: "rnx-tag-input-wrapper--variant-outline",
      filled: "rnx-tag-input-wrapper--variant-filled",
      glass: "rnx-tag-input-wrapper--variant-glass",
    },
    size: {
      sm: "rnx-tag-input-wrapper--sm",
      md: "rnx-tag-input-wrapper--md",
      lg: "rnx-tag-input-wrapper--lg",
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

/**
 * Props for the TagInput component.
 */
export interface TagInputProps
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "value" | "onChange" | "size" | "color"
    >,
    VariantProps<typeof tagInputVariants> {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  tagVariant?: "subtle" | "solid" | "outline" | "glass";
  color?: RnxColor;
  label?: string;
  error?: string;
  placeholder?: string;
  inputContainerClassName?: string;
}

const TagInputBase = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      value,
      defaultValue = [],
      onChange,
      variant = "outline",
      tagVariant = "subtle",
      color = "primary",
      label,
      error,
      size,
      placeholder = "Add tag...",
      inputContainerClassName,
      className,
      id: customId,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [internalTags, setInternalTags] = useState<string[]>(defaultValue);
    const [inputValue, setInputValue] = useState("");

    // Stable identity per tag value. Keys must not be array indices because
    // removing a middle tag would shift keys and mis-associate DOM state.
    // Duplicate tag values are disallowed on add, so value === identity.
    const keySeq = useRef(0);
    const tagKeys = useRef(new Map<string, string>());
    const keyFor = (tag: string) => {
      let k = tagKeys.current.get(tag);
      if (!k) {
        k = `tag-${keySeq.current++}`;
        tagKeys.current.set(tag, k);
      }
      return k;
    };
    const dropKey = (tag: string) => tagKeys.current.delete(tag);

    const tags = value !== undefined ? value : internalTags;

    // Resync key registry when the controlled value changes externally so
    // removed tags don't leave stale entries behind.
    React.useEffect(() => {
      if (value !== undefined) {
        for (const known of [...tagKeys.current.keys()]) {
          if (!value.includes(known)) tagKeys.current.delete(known);
        }
      }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const trimmed = inputValue.trim();
        if (trimmed && !tags.includes(trimmed)) {
          const next = [...tags, trimmed];
          setInternalTags(next);
          onChange?.(next);
          setInputValue("");
        }
      } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        const next = tags.slice(0, -1);
        setInternalTags(next);
        onChange?.(next);
      }
    };

    const removeTag = (indexToRemove: number) => {
      if (disabled) return;
      const next = tags.filter((_, i) => i !== indexToRemove);
      setInternalTags(next);
      onChange?.(next);
    };

    const generatedId = useId();
    const id = customId || generatedId;

    let tagInputState = "default";
    if (disabled) {
      tagInputState = "disabled";
    } else if (error) {
      tagInputState = "error";
    }

    return (
      <Box
        {...rnx({
          component: "TagInput",
          state: tagInputState,
        })}
        className={cn("rnx-tag-input-container", className)}
      >
        {label && (
          <Label htmlFor={id} className="rnx-tag-input-label">
            {label}
          </Label>
        )}
        <Box
          className={cn(
            tagInputVariants({ variant, size }),
            error && "rnx-tag-input-wrapper--error",
            inputContainerClassName,
          )}
        >
          {tags.map((tag) => (
            <Box
              as="span"
              key={keyFor(tag)}
              className={cn(
                "rnx-tag-item",
                `rnx-tag-item--size-${size || "md"}`,
                `rnx-tag-item--tag-${tagVariant}`,
                color && `rnx-tag-item--color-${color}`,
              )}
            >
              {tag}
              <button
                type="button"
                onClick={() => {
                  removeTag(tags.indexOf(tag));
                  dropKey(tag);
                }}
                disabled={disabled}
                className="rnx-tag-item-remove"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Box>
          ))}
          <input
            ref={ref}
            id={id}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ""}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className="rnx-tag-input-field"
            {...props}
          />
        </Box>
        {error && (
          <Box as="span" id={`${id}-error`} className="rnx-tag-input-error-msg">
            {error}
          </Box>
        )}
      </Box>
    );
  },
);

TagInputBase.displayName = "TagInput";
export const TagInput = withLoading(TagInputBase);
