"use client";
import { Box } from "../../atoms/Box";
import React, { useState, forwardRef } from "react";
import { Star } from "lucide-react";
import { cn } from "../../utils/cn";

export interface RatingProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  max?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "danger" | "custom";
  icon?: React.ElementType;
  iconClassName?: string;
}

export const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      max = 5,
      value,
      defaultValue = 0,
      onChange,
      readOnly = false,
      size = "md",
      color = "warning",
      icon: Icon = Star,
      iconClassName,
      className,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const currentValue = value !== undefined ? value : internalValue;
    const displayValue = hoverValue !== null ? hoverValue : currentValue;

    const handleMouseEnter = (index: number) => {
      if (!readOnly) {
        setHoverValue(index);
      }
    };

    const handleMouseLeave = () => {
      if (!readOnly) {
        setHoverValue(null);
      }
    };

    const handleClick = (index: number) => {
      if (!readOnly) {
        if (value === undefined) setInternalValue(index);
        onChange?.(index);
      }
    };

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLButtonElement>,
      index: number
    ) => {
      if (readOnly) return;
      let nextIndex = index;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextIndex = Math.min(max, index + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        nextIndex = Math.max(1, index - 1);
      }

      if (nextIndex !== index) {
        if (value === undefined) setInternalValue(nextIndex);
        onChange?.(nextIndex);
        // Focus the new element
        const buttons =
          e.currentTarget.parentElement?.querySelectorAll('[role="radio"]');
        if (buttons && buttons[nextIndex - 1]) {
          (buttons[nextIndex - 1] as HTMLButtonElement).focus();
        }
      }
    };

    const iconSizes = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    };

    const textColors = {
      primary: "text-primary",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
      custom: "text-current",
    };

    return (
      <Box
        ref={ref}
        role="radiogroup"
        aria-label="Rating"
        className={cn("inline-flex items-center gap-1", className)}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {Array.from({ length: max }).map((_, i) => {
          const starValue = i + 1;
          const isActive = starValue <= displayValue;

          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={readOnly}
              className={cn(
                "m-0 flex items-center justify-center border-none bg-transparent p-0.5 transition-all duration-150 ease-out outline-none",
                readOnly
                  ? "cursor-default"
                  : "focus-visible:ring-ring cursor-pointer rounded-full hover:scale-125 focus-visible:ring-2 focus-visible:ring-offset-2",
                isActive ? textColors[color] : "text-muted"
              )}
              tabIndex={
                readOnly
                  ? -1
                  : (displayValue === 0 && i === 0) ||
                      displayValue === starValue
                    ? 0
                    : -1
              }
              onMouseEnter={() => handleMouseEnter(starValue)}
              onClick={() => handleClick(starValue)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              aria-label={`Rate ${starValue} out of ${max}`}
            >
              <Icon
                className={cn(
                  iconSizes[size],
                  "transition-all duration-150 ease-out",
                  isActive && "fill-current",
                  iconClassName
                )}
                strokeWidth={isActive ? 2 : 1.5}
              />
            </button>
          );
        })}
      </Box>
    );
  }
);

Rating.displayName = "Rating";
