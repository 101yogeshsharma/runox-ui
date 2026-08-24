"use client";
import { Box } from "../../atoms/Box";
import React, { useState, forwardRef } from "react";
import { Star } from "lucide-react";
import { cn } from "../../utils/cn";
import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";


import { RnxColor } from "../../types";

/**
 * Props for the Rating component.
 */
export interface RatingProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "color"
> {
  max?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  color?: RnxColor | "custom";
  icon?: React.ElementType;
  iconClassName?: string;
}

import "./Rating.css";

const RatingBase = forwardRef<HTMLDivElement, RatingProps>(
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

    return (
      <Box
        {...rnx({ component: 'Rating', state: readOnly ? 'disabled' : 'active' })}
        ref={ref}
        role="radiogroup"
        aria-label="Rating"
        className={cn(
          "rnx-rating",
          `rnx-rating--size-${size}`,
          `rnx-rating--${color}`,
          className
        )}
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
                "rnx-rating__item",
                !isActive && "rnx-rating__item--inactive"
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
                  "rnx-rating__icon",
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

RatingBase.displayName = "Rating";
export const Rating = withLoading(RatingBase);
